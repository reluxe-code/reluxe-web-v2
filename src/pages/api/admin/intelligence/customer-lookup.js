// src/pages/api/admin/intelligence/customer-lookup.js
// Search customers by name/phone/email — merges client_visit_summary + members + referral_codes.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'
import { hashPhone, hashEmail } from '@/lib/piiHash'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { search, page = '1', limit = '50' } = req.query
  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, parseInt(limit, 10) || 50)
  const offset = (pageNum - 1) * pageSize

  try {
    // Search: views no longer have PII columns — search blvd_clients first
    let searchClientIds = null
    if (search) {
      const q = `%${search}%`
      const conditions = [`name.ilike.${q}`]
      const phoneHash = hashPhone(search)
      const emailHash = hashEmail(search)
      if (phoneHash) conditions.push(`phone_hash_v1.eq.${phoneHash}`)
      if (emailHash) conditions.push(`email_hash_v1.eq.${emailHash}`)
      const { data: matchingClients } = await db
        .from('blvd_clients')
        .select('id')
        .or(conditions.join(','))
      searchClientIds = (matchingClients || []).map(c => c.id)
    }

    let query = db
      .from('client_visit_summary')
      .select('*', { count: 'exact' })

    if (search) {
      if (searchClientIds && searchClientIds.length > 0) {
        query = query.in('client_id', searchClientIds)
      } else {
        query = query.eq('client_id', '00000000-0000-0000-0000-000000000000')
      }
    }

    query = query.order('total_spend', { ascending: false })

    const { data: clients, count, error } = await query.range(offset, offset + pageSize - 1)
    if (error) throw error

    const rows = clients || []

    // Enrich with boulevard_id from blvd_clients
    const clientIds = rows.map(r => r.client_id).filter(Boolean)
    let clientInfoMap = {}
    if (clientIds.length > 0) {
      const { data: clientInfo } = await db
        .from('blvd_clients')
        .select('id, boulevard_id')
        .in('id', clientIds)
      for (const c of (clientInfo || [])) clientInfoMap[c.id] = c
    }

    // Batch-join to members by blvd_client_id
    let memberMap = {} // client_id → member
    if (clientIds.length > 0) {
      const { data: members } = await db
        .from('members')
        .select('id, blvd_client_id')
        .in('blvd_client_id', clientIds)
        .limit(500)

      for (const m of (members || [])) {
        if (m.blvd_client_id) memberMap[m.blvd_client_id] = m
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
      const ci = clientInfoMap[client.client_id]
      const member = memberMap[client.client_id] || null
      const codes = member ? (codeMap[member.id] || []) : []
      const primaryCode = codes.find(c => c.is_primary) || codes[0]
      const totalCompleted = codes.reduce((sum, c) => sum + (c.total_completed || 0), 0)
      const totalEarned = codes.reduce((sum, c) => sum + Number(c.total_earned || 0), 0)

      return {
        client_id: client.client_id,
        boulevard_id: ci?.boulevard_id || client.boulevard_id || null,
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

export default withAdminAuth(handler)
