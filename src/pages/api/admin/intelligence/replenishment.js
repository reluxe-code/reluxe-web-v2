// src/pages/api/admin/intelligence/replenishment.js
// Replenishment Radar — per-client product depletion tracking.
// GET ?status=overdue&category=retinol&page=1&limit=50
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 30 }

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

  const { status, category, page = '1', limit = '25' } = req.query
  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, Math.max(10, parseInt(limit, 10) || 25))

  try {
    const allRows = await fetchAllRows(() =>
      db.from('rie_replenishment_radar')
        .select('client_id, client_name, client_email, client_phone, sku_key, product_name, brand, core4_category, depletion_days, last_purchase_at, predicted_exhaustion_date, days_past_exhaustion, replenishment_status')
    )

    // Filter
    let filtered = allRows
    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.replenishment_status === status)
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((r) => r.core4_category === category)
    }

    // Summary counts
    const activeCount = allRows.filter((r) => r.replenishment_status === 'active').length
    const overdueCount = allRows.filter((r) => r.replenishment_status === 'overdue').length
    const churnedCount = allRows.filter((r) => r.replenishment_status === 'churned').length

    // Sort: overdue items sorted by days_past_exhaustion ascending (most recently overdue first)
    filtered.sort((a, b) => {
      // Status order: overdue first, then active, then churned
      const statusOrder = { overdue: 0, active: 1, churned: 2 }
      const statusDiff = (statusOrder[a.replenishment_status] || 2) - (statusOrder[b.replenishment_status] || 2)
      if (statusDiff !== 0) return statusDiff
      // Within same status, sort by days_past_exhaustion descending
      return (b.days_past_exhaustion || 0) - (a.days_past_exhaustion || 0)
    })

    // Paginate
    const totalItems = filtered.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIdx = (pageNum - 1) * pageSize
    const pageRows = filtered.slice(startIdx, startIdx + pageSize)

    return res.json({
      summary: {
        active: activeCount,
        overdue: overdueCount,
        churned: churnedCount,
        total: allRows.length,
      },
      filters: { status: status || 'all', category: category || 'all' },
      pagination: { page: pageNum, limit: pageSize, total: totalItems, totalPages },
      rows: pageRows,
    })
  } catch (err) {
    console.error('[intelligence/replenishment]', err)
    return res.status(500).json({ error: err.message })
  }
}
