// src/pages/api/admin/membership-detail.js
// Full client profile for the memberships admin drawer.
// GET ?client_id=<uuid>  (blvd_clients.id)
import { getServiceClient } from '@/lib/supabase'
import { adminQuery } from '@/server/blvdAdmin'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { client_id } = req.query
  if (!client_id) return res.status(400).json({ error: 'client_id required' })

  const db = getServiceClient()

  try {
    // All queries in parallel
    const [clientRow, memberships, recentVisits, member] = await Promise.all([
      // 1. Client info + cached credit
      db.from('blvd_clients')
        .select('id, boulevard_id, first_name, last_name, name, email, phone, visit_count, total_spend, first_visit_at, last_visit_at, account_credit, account_credit_updated_at')
        .eq('id', client_id)
        .single()
        .then(r => r.data),

      // 2. All memberships for this client
      db.from('blvd_memberships')
        .select('id, name, status, start_on, end_on, next_charge_date, cancel_on, unpause_on, interval, unit_price, term_number, location_key, vouchers, synced_at')
        .eq('client_id', client_id)
        .order('start_on', { ascending: false })
        .then(r => r.data || []),

      // 3. Last 10 visits
      db.from('blvd_appointments')
        .select('id, start_at, location_key, status, blvd_appointment_services(service_name, service_slug, price)')
        .eq('client_id', client_id)
        .in('status', ['completed', 'final'])
        .order('start_at', { ascending: false })
        .limit(10)
        .then(r => r.data || []),

      // 4. Linked RELUXE member (if any)
      db.from('members')
        .select('id, first_name, last_name, phone, email, blvd_client_id, created_at')
        .eq('blvd_client_id', client_id)
        .maybeSingle()
        .then(r => r.data),
    ])

    if (!clientRow) return res.status(404).json({ error: 'Client not found' })

    // 5. Real-time credit check from Boulevard if cached is stale
    let liveCredit = clientRow.account_credit || 0
    const staleMs = clientRow.account_credit_updated_at
      ? Date.now() - new Date(clientRow.account_credit_updated_at).getTime()
      : Infinity
    if (staleMs > 3600000 && clientRow.boulevard_id) {
      try {
        const live = await adminQuery(`query { node(id: "${clientRow.boulevard_id}") { ... on Client { currentAccountBalance } } }`)
        if (live.node?.currentAccountBalance != null) {
          liveCredit = live.node.currentAccountBalance
          // Update cache
          db.from('blvd_clients').update({
            account_credit: liveCredit,
            account_credit_updated_at: new Date().toISOString(),
          }).eq('id', client_id).then(() => {})
        }
      } catch { /* use cached */ }
    }

    // 6. Referral info (if member exists)
    let referralStats = null
    if (member) {
      const { data: codes } = await db
        .from('referral_codes')
        .select('code, custom_code, tier, total_completed, total_earned')
        .eq('member_id', member.id)
        .order('created_at', { ascending: true })

      if (codes?.length) {
        referralStats = {
          tier: codes[0].tier,
          codes: codes.map(c => c.custom_code || c.code),
          totalCompleted: codes.reduce((s, c) => s + (c.total_completed || 0), 0),
          totalEarned: codes.reduce((s, c) => s + Number(c.total_earned || 0), 0),
        }
      }
    }

    return res.json({
      client: {
        ...clientRow,
        account_credit: liveCredit,
        total_spend: Math.round(Number(clientRow.total_spend || 0)),
        creditFormatted: `$${(liveCredit / 100).toFixed(2)}`,
      },
      memberships: memberships.map(m => ({
        ...m,
        vouchers: m.status === 'CANCELLED' ? [] : (typeof m.vouchers === 'string' ? JSON.parse(m.vouchers) : m.vouchers),
      })),
      recentVisits: recentVisits.map(v => ({
        date: v.start_at,
        location: v.location_key,
        services: (v.blvd_appointment_services || []).map(s => ({
          name: s.service_name,
          slug: s.service_slug,
          price: s.price ? parseFloat(s.price) : null,
        })),
      })),
      member: member ? {
        id: member.id,
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
        phone: member.phone,
        email: member.email,
        createdAt: member.created_at,
      } : null,
      referralStats,
    })
  } catch (err) {
    console.error('[admin/membership-detail]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
