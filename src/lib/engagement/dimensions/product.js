// src/lib/engagement/dimensions/product.js
// Product engagement score (0-100). Weight: 0.10
// From client_core4_score, blvd_product_sales, rie_replenishment_radar.

/**
 * Compute product engagement scores for a batch of client IDs.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @returns {Promise<Record<string, { score: number, detail: object }>>}
 */
export async function computeProductScores(db, clientIds) {
  if (!clientIds.length) return {}

  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()

  // 1. Core 4 scores
  const { data: core4 } = await db
    .from('client_core4_score')
    .select('client_id, core4_score')
    .in('client_id', clientIds)

  const core4Map = {}
  for (const row of core4 || []) {
    core4Map[row.client_id] = row.core4_score || 0
  }

  // 2. Product purchases (last 180 days)
  const { data: sales } = await db
    .from('blvd_product_sales')
    .select('client_id, sku, product_name')
    .in('client_id', clientIds)
    .gte('sold_at', sixMonthsAgo)

  const purchaseStats = {}
  for (const s of sales || []) {
    if (!purchaseStats[s.client_id]) purchaseStats[s.client_id] = { count: 0, skus: new Set(), skuCounts: {} }
    purchaseStats[s.client_id].count++
    purchaseStats[s.client_id].skus.add(s.sku || s.product_name)
    const key = s.sku || s.product_name
    purchaseStats[s.client_id].skuCounts[key] = (purchaseStats[s.client_id].skuCounts[key] || 0) + 1
  }

  // 3. Replenishment status
  const { data: replenishment } = await db
    .from('rie_replenishment_radar')
    .select('client_id, replenishment_status')
    .in('client_id', clientIds)

  // Best replenishment status per client (active > overdue > churned)
  const replenishMap = {}
  const statusRank = { active: 3, overdue: 2, churned: 1 }
  for (const r of replenishment || []) {
    const current = replenishMap[r.client_id]
    const newRank = statusRank[r.replenishment_status] || 0
    if (!current || newRank > (statusRank[current] || 0)) {
      replenishMap[r.client_id] = r.replenishment_status
    }
  }

  const results = {}

  for (const clientId of clientIds) {
    const c4 = core4Map[clientId] || 0
    const ps = purchaseStats[clientId]
    const repStatus = replenishMap[clientId]

    // Core 4 adherence (0-60)
    const core4Component = c4 * 15

    // Purchase frequency (0-15)
    const purchaseCount = ps ? ps.count : 0
    const purchaseFreq = purchaseCount >= 6 ? 15 : purchaseCount >= 3 ? 10 : purchaseCount >= 1 ? 5 : 0

    // Replenishment status (0-15)
    const replenishComponent = repStatus === 'active' ? 15 : repStatus === 'overdue' ? 5 : 0

    // Repeat buyer bonus (0-10)
    let isRepeatBuyer = false
    if (ps?.skuCounts) {
      isRepeatBuyer = Object.values(ps.skuCounts).some(count => count >= 2)
    }
    const repeatBonus = isRepeatBuyer ? 10 : 0

    const score = Math.min(core4Component + purchaseFreq + replenishComponent + repeatBonus, 100)

    results[clientId] = {
      score,
      detail: {
        core4_score: c4,
        core4_component: core4Component,
        purchase_count_180d: purchaseCount,
        unique_skus: ps ? ps.skus.size : 0,
        replenishment_status: repStatus || 'none',
        is_repeat_buyer: isRepeatBuyer,
      },
    }
  }

  for (const id of clientIds) {
    if (!results[id]) results[id] = { score: 0, detail: { no_products: true } }
  }

  return results
}
