// src/pages/api/admin/intelligence/customer-lookup.js
// Search customers by name/phone/email — merges client_visit_summary + members + referral_codes.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { search, page = '1', limit = '50' } = req.query
  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, parseInt(limit, 10) || 50)
  const offset = (pageNum - 1) * pageSize

  try {
    let query = db
      .from('client_visit_summary')
      .select('*', { count: 'exact' })

    if (search) {
      const q = `%${search}%`
      query = query.or(`name.ilike.${q},email.ilike.${q},phone.ilike.${q},first_name.ilike.${q},last_name.ilike.${q}`)
    }

    query = query.order('total_spend', { ascending: false })

    const { data: clients, count, error } = await query.range(offset, offset + pageSize - 1)
    if (error) throw error

    const rows = clients || []

    // Batch-join to members by phone/email
    const phones = rows.map(r => r.phone).filter(Boolean)
    const emails = rows.map(r => r.email).filter(Boolean)

    let memberMap = {}
    if (phones.length || emails.length) {
      const conditions = []
      if (phones.length) conditions.push(phones.map(p => `phone.ilike.%${p.replace(/\D/g, '').slice(-10)}`).join(','))
      if (emails.length) conditions.push(emails.map(e => `email.ilike.${e}`).join(','))

      const { data: members } = await db
        .from('members')
        .select('id, first_name, last_name, phone, email')
        .or(conditions.join(','))
        .limit(500)

      for (const m of (members || [])) {
        const mPhone = (m.phone || '').replace(/\D/g, '').slice(-10)
        if (mPhone) memberMap[mPhone] = m
        if (m.email) memberMap[m.email.toLowerCase()] = m
      }
    }

    // For matched members, batch-fetch referral_codes
    const memberIds = [...new Set(Object.values(memberMap).map(m => m.id))]
    let codeMap = {}
    if (memberIds.length) {
      const { data: codes } = await db
        .from('referral_codes')
        .select('member_id, code, custom_code, tier, is_primary, total_completed, total_earned')
        .in('member_id', memberIds)

      for (const c of (codes || [])) {
        if (!codeMap[c.member_id]) codeMap[c.member_id] = []
        codeMap[c.member_id].push(c)
      }
    }

    // Merge
    const results = rows.map(client => {
      const clientPhone = (client.phone || '').replace(/\D/g, '').slice(-10)
      const clientEmail = (client.email || '').toLowerCase()
      const member = (clientPhone && memberMap[clientPhone]) || (clientEmail && memberMap[clientEmail]) || null
      const codes = member ? (codeMap[member.id] || []) : []
      const primaryCode = codes.find(c => c.is_primary) || codes[0]
      const totalCompleted = codes.reduce((sum, c) => sum + (c.total_completed || 0), 0)
      const totalEarned = codes.reduce((sum, c) => sum + Number(c.total_earned || 0), 0)

      return {
        client_id: client.client_id,
        name: client.name || [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Unknown',
        email: client.email,
        phone: client.phone,
        total_visits: client.total_visits,
        total_spend: Math.round(Number(client.total_spend || 0)),
        ltv_bucket: client.ltv_bucket,
        last_visit: client.last_visit,
        days_since_last_visit: client.days_since_last_visit,
        member_id: member?.id || null,
        has_referral_code: codes.length > 0,
        referral_tier: primaryCode?.tier || null,
        total_referrals_completed: totalCompleted,
        total_earned: totalEarned,
      }
    })

    return res.json({
      customers: results,
      total: count || 0,
      page: pageNum,
      pageSize,
    })
  } catch (err) {
    console.error('[admin/intelligence/customer-lookup]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
