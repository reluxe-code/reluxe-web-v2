// src/pages/api/admin/memberships.js
// Admin API: list memberships with client data, account credits, and summary stats.
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 15 }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()
  const { status, search, page = '1' } = req.query
  const limit = 50
  const offset = (parseInt(page) - 1) * limit

  // ── Summary stats ──
  const [
    { count: totalActive },
    { count: totalCancelled },
    { count: totalPastDue },
    { count: totalPaused },
    creditStats,
  ] = await Promise.all([
    db.from('blvd_memberships').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    db.from('blvd_memberships').select('*', { count: 'exact', head: true }).eq('status', 'CANCELLED'),
    db.from('blvd_memberships').select('*', { count: 'exact', head: true }).eq('status', 'PAST_DUE'),
    db.from('blvd_memberships').select('*', { count: 'exact', head: true }).eq('status', 'PAUSED'),
    db.from('blvd_clients').select('account_credit').gt('account_credit', 0).then(r => {
      const rows = r.data || []
      return {
        count: rows.length,
        total: rows.reduce((sum, r) => sum + (r.account_credit || 0), 0),
      }
    }),
  ])

  // ── Active MRR ──
  const { data: activeForMrr } = await db
    .from('blvd_memberships')
    .select('unit_price')
    .eq('status', 'ACTIVE')
  const mrr = (activeForMrr || []).reduce((sum, m) => sum + (m.unit_price || 0), 0)

  const summary = {
    active: totalActive || 0,
    cancelled: totalCancelled || 0,
    pastDue: totalPastDue || 0,
    paused: totalPaused || 0,
    mrr,
    mrrFormatted: `$${(mrr / 100).toLocaleString()}`,
    creditsOutstanding: creditStats.total,
    creditsOutstandingFormatted: `$${(creditStats.total / 100).toFixed(2)}`,
    clientsWithCredit: creditStats.count,
  }

  // ── Memberships list ──
  // If searching, first find matching client IDs, then filter memberships
  let clientIdFilter = null
  if (search) {
    const { data: matchingClients } = await db
      .from('blvd_clients')
      .select('id')
      .or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    clientIdFilter = (matchingClients || []).map(c => c.id)
  }

  let query = db
    .from('blvd_memberships')
    .select(`
      id, boulevard_id, name, status, start_on, end_on, next_charge_date,
      cancel_on, unpause_on, interval, unit_price, term_number, location_key,
      vouchers, synced_at,
      blvd_clients(id, first_name, last_name, name, email, phone, account_credit)
    `, { count: 'exact' })
    .order('start_on', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status.toUpperCase())
  }

  if (search) {
    // Match on membership plan name OR client name/email/phone
    if (clientIdFilter && clientIdFilter.length > 0) {
      query = query.or(`name.ilike.%${search}%,client_id.in.(${clientIdFilter.join(',')})`)
    } else {
      query = query.ilike('name', `%${search}%`)
    }
  }

  const { data: memberships, count } = await query
    .range(offset, offset + limit - 1)

  // ── Clients with credit (for credits tab) ──
  let creditQuery = db
    .from('blvd_clients')
    .select('id, boulevard_id, first_name, last_name, name, email, phone, account_credit, account_credit_updated_at, visit_count, total_spend')
    .gt('account_credit', 0)
    .order('account_credit', { ascending: false })

  if (search) {
    creditQuery = creditQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data: clientsWithCredit } = await creditQuery.limit(100)

  return res.json({
    summary,
    memberships: (memberships || []).map(m => ({
      ...m,
      client: m.blvd_clients,
      blvd_clients: undefined,
      vouchers: m.status === 'CANCELLED' ? [] : (typeof m.vouchers === 'string' ? JSON.parse(m.vouchers) : m.vouchers),
    })),
    totalMemberships: count || 0,
    page: parseInt(page),
    clientsWithCredit: (clientsWithCredit || []).map(c => ({
      ...c,
      creditFormatted: `$${((c.account_credit || 0) / 100).toFixed(2)}`,
    })),
  })
}
