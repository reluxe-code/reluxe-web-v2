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
    // 1. Summary stats — LTV bucket counts
    const allClients = await fetchAllRows(() => {
      let query = db
        .from('client_visit_summary')
        .select('client_id, ltv_bucket, total_spend, total_visits, days_since_last_visit, last_visit')
        .gt('total_visits', 0)
      if (sinceIso) query = query.gte('last_visit', sinceIso)
      return query
    })

    const clients = allClients || []
    const total = clients.length
    const buckets = { vip: 0, high: 0, medium: 0, low: 0 }
    let totalSpend = 0
    let newLast30 = 0
    let atRisk = 0

    for (const c of clients) {
      if (buckets[c.ltv_bucket] !== undefined) buckets[c.ltv_bucket]++
      totalSpend += Number(c.total_spend || 0)
      if (c.total_visits === 1 && c.days_since_last_visit <= 30) newLast30++
      if (Number(c.total_spend || 0) >= 1000 && c.days_since_last_visit > 90) atRisk++
    }

    const summary = {
      total_clients: total,
      vip: buckets.vip,
      high: buckets.high,
      medium: buckets.medium,
      low: buckets.low,
      total_revenue: Math.round(totalSpend),
      new_last_30d: newLast30,
      at_risk: atRisk,
      avg_spend: total > 0 ? Math.round(totalSpend / total) : 0,
    }

    // 2. Patient list (paginated, filterable)
    let query = db
      .from('client_visit_summary')
      .select('*', { count: 'exact' })
      .gt('total_visits', 0)

    if (sinceIso) {
      query = query.gte('last_visit', sinceIso)
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

    const patient_list = (patients || []).map((p) => ({
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
    }))

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
