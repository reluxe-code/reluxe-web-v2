// src/pages/api/admin/intelligence/sku-mapping.js
// SKU → Core 4 mapping CRUD.
// GET: list all mappings with sale counts
// GET ?auto_map=true: run auto-map function first, then return list
// POST: update a single mapping { sku_key, core4_category, depletion_days }
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

export const config = { maxDuration: 30 }

async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'POST') {
    const { sku_key, core4_category, core4_secondary, depletion_days } = req.body
    if (!sku_key || !core4_category) {
      return res.status(400).json({ error: 'sku_key and core4_category required' })
    }

    const { error } = await db.from('rie_sku_core4_map').update({
      core4_category,
      core4_secondary: core4_secondary || null,
      depletion_days: depletion_days || 90,
      auto_mapped: false,
      confidence: 'manual',
      updated_at: new Date().toISOString(),
    }).eq('sku_key', sku_key)

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'GET or POST only' })

  try {
    // Run auto-map if requested
    if (req.query.auto_map === 'true') {
      const { data: mapResult, error: mapError } = await db.rpc('rie_auto_map_skus')
      if (mapError) throw mapError
    }

    // Get all mappings
    const { data: mappings, error: mappingsError } = await db
      .from('rie_sku_core4_map')
      .select('*')
      .order('product_name', { ascending: true })

    if (mappingsError) throw mappingsError

    // Get sale counts per SKU key
    const { data: saleCounts, error: salesError } = await db
      .from('blvd_product_sales')
      .select('sku, product_name')

    if (salesError) throw salesError

    const countByKey = {}
    for (const row of saleCounts || []) {
      const key = row.sku || row.product_name || 'unknown'
      countByKey[key] = (countByKey[key] || 0) + 1
    }

    const rows = (mappings || []).map((m) => ({
      ...m,
      sale_count: countByKey[m.sku_key] || 0,
    }))

    // Summary stats
    const total = rows.length
    const mapped = rows.filter((r) => ['cleanser', 'vitamin_c', 'retinol', 'moisturizer', 'spf'].includes(r.core4_category)).length
    const unmapped = rows.filter((r) => r.confidence === 'low').length
    const autoMapped = rows.filter((r) => r.auto_mapped).length
    const manualMapped = rows.filter((r) => r.confidence === 'manual').length

    const categoryBreakdown = {}
    for (const row of rows) {
      categoryBreakdown[row.core4_category] = (categoryBreakdown[row.core4_category] || 0) + 1
    }

    return res.json({
      summary: { total, mapped, unmapped, autoMapped, manualMapped, categoryBreakdown },
      rows,
    })
  } catch (err) {
    console.error('[intelligence/sku-mapping]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
