// src/pages/api/admin/intelligence/actions.js
// Actionable segments — all computed patient segments with export support.
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

const SEGMENT_META = {
  tox_on_schedule: { label: 'Tox: On Schedule', color: 'emerald', description: 'Tox patients within their 90-day cycle.' },
  tox_due: { label: 'Tox: Due', color: 'amber', description: 'Tox patients 91-120 days since last visit — time to reach out.' },
  tox_overdue: { label: 'Tox: Overdue', color: 'orange', description: 'Tox patients 121-180 days — at risk of churning.' },
  tox_probably_lost: { label: 'Tox: Probably Lost', color: 'rose', description: 'Tox patients 181-365 days — likely need a win-back offer.' },
  tox_lost: { label: 'Tox: Lost', color: 'red', description: 'Tox patients 365+ days — requires aggressive re-engagement.' },
  tox_due_2_weeks: { label: 'Tox: Due in 2 Weeks', color: 'blue', description: 'Tox patients approaching their next cycle (76-90 days) — perfect timing for a reminder.' },
  at_risk_high_value: { label: 'At-Risk High Value', color: 'red', description: 'Clients who spent $1,000+ but haven\'t visited in 90+ days.' },
  drop_off: { label: 'Drop-Off', color: 'orange', description: 'Clients with 3+ visits who stopped coming (90+ days ago).' },
  no_rebook: { label: 'No Rebook', color: 'amber', description: 'Completed recently but no future appointment scheduled.' },
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { segment: segmentFilter, search, page = '1', limit = '50' } = req.query
  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, parseInt(limit, 10) || 50)
  const offset = (pageNum - 1) * pageSize

  try {
    // 1. Segment overview — counts per segment
    const allSegments = await fetchAllRows(() =>
      db
        .from('client_segments')
        .select('segment_name, client_id')
    )

    const segmentCounts = {}
    for (const row of allSegments || []) {
      segmentCounts[row.segment_name] = (segmentCounts[row.segment_name] || 0) + 1
    }

    const segments = Object.entries(SEGMENT_META).map(([key, meta]) => ({
      key,
      ...meta,
      count: segmentCounts[key] || 0,
    }))

    // If no specific segment requested, just return overview
    if (!segmentFilter) {
      return res.json({ segments, patients: null })
    }

    // 2. Drilldown — patient list for a specific segment
    const segRows = await fetchAllRows(() =>
      db
        .from('client_segments')
        .select('client_id, segment_detail, days_value')
        .eq('segment_name', segmentFilter)
        .order('days_value', { ascending: false })
    )

    const clientIds = [...new Set((segRows || []).map((r) => r.client_id))]
    const detailMap = Object.fromEntries((segRows || []).map((r) => [r.client_id, { detail: r.segment_detail, days: r.days_value }]))

    if (clientIds.length === 0) {
      return res.json({
        segments,
        patients: { data: [], total: 0, page: pageNum, page_size: pageSize },
      })
    }

    let query = db
      .from('blvd_clients')
      .select('id, name, first_name, last_name, email, phone, total_spend, visit_count, last_visit_at', { count: 'exact' })
      .in('id', clientIds)

    if (search) {
      const q = `%${search}%`
      query = query.or(`name.ilike.${q},email.ilike.${q},phone.ilike.${q},first_name.ilike.${q},last_name.ilike.${q}`)
    }

    query = query.order('total_spend', { ascending: false })

    const { data: clients, count, error: cErr } = await query
      .range(offset, offset + pageSize - 1)

    if (cErr) throw cErr

    const patient_list = (clients || []).map((c) => ({
      client_id: c.id,
      name: c.name || [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown',
      email: c.email,
      phone: c.phone,
      total_spend: Math.round(Number(c.total_spend || 0)),
      visit_count: c.visit_count || 0,
      last_visit: c.last_visit_at,
      segment_detail: detailMap[c.id]?.detail || null,
      days_value: detailMap[c.id]?.days || null,
    }))

    return res.json({
      segments,
      patients: {
        data: patient_list,
        total: count || 0,
        page: pageNum,
        page_size: pageSize,
      },
    })
  } catch (err) {
    console.error('[intelligence/actions]', err)
    return res.status(500).json({ error: err.message })
  }
}
