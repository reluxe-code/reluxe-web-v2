// src/pages/api/admin/intelligence/patients.js
// Patient intelligence — LTV buckets, visit patterns, at-risk detection.
import { getServiceClient } from '@/lib/supabase'

async function fetchAllRows(buildQuery, chunkSize = 1000, maxRows = 100000) {
  const rows = []
  for (let offset = 0; offset < maxRows; offset += chunkSize) {
    const { data, error } = await buildQuery().range(offset, offset + chunkSize - 1)
    if (error) throw error
    const page = data || []
    rows.push(...page)
    if (page.length < chunkSize) break
  }
  return rows
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { ltv, search, sort, page = '1', limit = '50', window_days = '365' } = req.query
  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, parseInt(limit, 10) || 50)
  const offset = (pageNum - 1) * pageSize
  const windowDays = window_days === 'all' ? null : Math.max(1, parseInt(window_days, 10) || 365)
  const sinceIso = windowDays ? new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString() : null

  try {
    // 1. Summary stats — LTV bucket counts (all clients, not just those with visits)
    const allClients = await fetchAllRows(() => {
      let query = db
        .from('client_visit_summary')
        .select('client_id, ltv_bucket, total_spend, total_visits, days_since_last_visit, last_visit')
      if (sinceIso) query = query.or(`last_visit.gte.${sinceIso},last_visit.is.null`)
      return query
    })

    const clients = allClients || []
    const total = clients.length
    const buckets = { vip: 0, high: 0, medium: 0, low: 0 }
    let totalSpend = 0
    let newLast30 = 0
    let atRisk = 0
    let noVisits = 0
    let withVisits = 0

    for (const c of clients) {
      if (c.total_visits === 0) { noVisits++; continue }
      withVisits++
      if (buckets[c.ltv_bucket] !== undefined) buckets[c.ltv_bucket]++
      totalSpend += Number(c.total_spend || 0)
      if (c.total_visits === 1 && c.days_since_last_visit <= 30) newLast30++
      if (Number(c.total_spend || 0) >= 1000 && c.days_since_last_visit > 90) atRisk++
    }

    const summary = {
      total_clients: total,
      with_visits: withVisits,
      no_visits: noVisits,
      vip: buckets.vip,
      high: buckets.high,
      medium: buckets.medium,
      low: buckets.low,
      total_revenue: Math.round(totalSpend),
      new_last_30d: newLast30,
      at_risk: atRisk,
      avg_spend: withVisits > 0 ? Math.round(totalSpend / withVisits) : 0,
    }

    // 2. Patient list (paginated, filterable — includes all clients)
    let query = db
      .from('client_visit_summary')
      .select('*', { count: 'exact' })

    if (sinceIso) {
      query = query.or(`last_visit.gte.${sinceIso},last_visit.is.null`)
    }

    if (ltv) {
      query = query.eq('ltv_bucket', ltv)
    }
    if (search) {
      const q = `%${search}%`
      query = query.or(`name.ilike.${q},email.ilike.${q},phone.ilike.${q},first_name.ilike.${q},last_name.ilike.${q}`)
    }

    // Sort
    const sortMap = {
      spend_desc: ['total_spend', { ascending: false }],
      spend_asc: ['total_spend', { ascending: true }],
      visits_desc: ['total_visits', { ascending: false }],
      recent: ['last_visit', { ascending: false }],
      oldest: ['days_since_last_visit', { ascending: false }],
      name_asc: ['name', { ascending: true }],
    }
    const [sortCol, sortOpts] = sortMap[sort] || sortMap.spend_desc
    query = query.order(sortCol, sortOpts)

    const { data: patients, count: patientCount, error: patientErr } = await query
      .range(offset, offset + pageSize - 1)

    if (patientErr) throw patientErr

    // Enrich with membership + credit data for the patient list
    const patientClientIds = (patients || []).map(p => p.client_id).filter(Boolean)
    let creditMap = new Map()
    let membershipMap = new Map()
    let memberMap = new Map()

    if (patientClientIds.length > 0) {
      const [creditRes, membershipRes, memberRes] = await Promise.all([
        db.from('blvd_clients')
          .select('id, account_credit')
          .in('id', patientClientIds)
          .gt('account_credit', 0),
        db.from('blvd_memberships')
          .select('client_id, name, status, unit_price, vouchers')
          .in('client_id', patientClientIds)
          .eq('status', 'ACTIVE'),
        db.from('members')
          .select('blvd_client_id, id')
          .in('blvd_client_id', patientClientIds),
      ])
      for (const c of (creditRes.data || [])) creditMap.set(c.id, c.account_credit)
      for (const m of (membershipRes.data || [])) {
        if (!membershipMap.has(m.client_id)) membershipMap.set(m.client_id, m)
      }
      for (const m of (memberRes.data || [])) memberMap.set(m.blvd_client_id, m.id)
    }

    const patient_list = (patients || []).map((p) => {
      const membership = membershipMap.get(p.client_id)
      const vouchers = membership?.vouchers
        ? (typeof membership.vouchers === 'string' ? JSON.parse(membership.vouchers) : membership.vouchers)
        : []
      const voucherCount = vouchers.flatMap(v => v.services || []).length
      return {
        client_id: p.client_id,
        name: p.name || [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown',
        email: p.email,
        phone: p.phone,
        total_visits: p.total_visits,
        total_spend: Math.round(Number(p.total_spend || 0)),
        first_visit: p.first_visit,
        last_visit: p.last_visit,
        days_since_last_visit: p.days_since_last_visit,
        avg_days_between: p.avg_days_between_visits,
        locations_visited: p.locations_visited,
        ltv_bucket: p.ltv_bucket,
        account_credit: creditMap.get(p.client_id) || 0,
        membership_name: membership?.name || null,
        membership_price: membership?.unit_price || null,
        voucher_count: voucherCount,
        is_member: memberMap.has(p.client_id),
      }
    })

    return res.json({
      filters: {
        window_days: windowDays || 'all',
      },
      summary,
      patients: {
        data: patient_list,
        total: patientCount || 0,
        page: pageNum,
        page_size: pageSize,
      },
    })
  } catch (err) {
    console.error('[intelligence/patients]', err)
    return res.status(500).json({ error: err.message })
  }
}
