// src/pages/api/admin/intelligence/core4.js
// Core 4 Regimen Gap Taxonomy — score distribution, category adoption, gap opportunities.
// GET ?provider=<uuid> (optional)
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

export const config = { maxDuration: 30 }

async function fetchAllRows(buildQuery, chunkSize = 1000, maxRows = 50000) {
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

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { provider } = req.query
  const db = getServiceClient()

  try {
    // Get all Core 4 scores
    const scoreRows = await fetchAllRows(() =>
      db.from('client_core4_score').select('client_id, core4_score, has_cleanser, has_vitamin_c, has_retinol, has_moisturizer, has_spf')
    )

    // If provider filter, get that provider's clients and filter
    let filteredRows = scoreRows
    if (provider && provider !== 'all') {
      const { data: providerClients } = await db
        .from('blvd_product_sales')
        .select('client_id')
        .eq('provider_staff_id', provider)

      const clientSet = new Set((providerClients || []).map((r) => r.client_id).filter(Boolean))
      filteredRows = scoreRows.filter((r) => clientSet.has(r.client_id))
    }

    const total = filteredRows.length
    if (total === 0) {
      return res.json({
        summary: { total: 0, avg_score: 0, clients_at_4: 0, biggest_gap: 'N/A' },
        distribution: [0, 1, 2, 3, 4].map((s) => ({ score: s, count: 0, pct: 0 })),
        adoption: { cleanser: 0, vitamin_c: 0, retinol: 0, moisturizer: 0 },
        gaps: [],
        providers: [],
      })
    }

    // Score distribution
    const distCounts = [0, 0, 0, 0, 0]
    let totalScore = 0
    let cleanserCount = 0
    let vitcCount = 0
    let retinolCount = 0
    let moisturizerCount = 0
    let spfCount = 0

    for (const row of filteredRows) {
      const s = row.core4_score || 0
      distCounts[Math.min(s, 4)] += 1
      totalScore += s
      if (row.has_cleanser) cleanserCount++
      if (row.has_vitamin_c) vitcCount++
      if (row.has_retinol) retinolCount++
      if (row.has_moisturizer) moisturizerCount++
      if (row.has_spf) spfCount++
    }

    const distribution = distCounts.map((count, score) => ({
      score,
      count,
      pct: Math.round((count / total) * 1000) / 10,
    }))

    const adoption = {
      cleanser: { count: cleanserCount, pct: Math.round((cleanserCount / total) * 1000) / 10 },
      vitamin_c: { count: vitcCount, pct: Math.round((vitcCount / total) * 1000) / 10 },
      retinol: { count: retinolCount, pct: Math.round((retinolCount / total) * 1000) / 10 },
      moisturizer: { count: moisturizerCount, pct: Math.round((moisturizerCount / total) * 1000) / 10 },
      spf: { count: spfCount, pct: Math.round((spfCount / total) * 1000) / 10 },
    }

    // Gap opportunities — which missing category affects most clients
    const gaps = [
      { category: 'cleanser', label: 'Cleanser', missing: total - cleanserCount, pct: Math.round(((total - cleanserCount) / total) * 1000) / 10 },
      { category: 'vitamin_c', label: 'Vitamin C', missing: total - vitcCount, pct: Math.round(((total - vitcCount) / total) * 1000) / 10 },
      { category: 'retinol', label: 'Retinol', missing: total - retinolCount, pct: Math.round(((total - retinolCount) / total) * 1000) / 10 },
      { category: 'moisturizer', label: 'Moisturizer', missing: total - moisturizerCount, pct: Math.round(((total - moisturizerCount) / total) * 1000) / 10 },
    ].sort((a, b) => b.missing - a.missing)

    const avgScore = Math.round((totalScore / total) * 10) / 10
    const clientsAt4 = distCounts[4]
    const biggestGap = gaps[0]?.label || 'N/A'

    // Get providers for filter dropdown
    const { data: providers } = await db
      .from('staff')
      .select('id, name, title')
      .not('boulevard_provider_id', 'is', null)
      .order('name')

    return res.json({
      summary: { total, avg_score: avgScore, clients_at_4: clientsAt4, biggest_gap: biggestGap },
      distribution,
      adoption,
      gaps,
      providers: providers || [],
    })
  } catch (err) {
    console.error('[intelligence/core4]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
