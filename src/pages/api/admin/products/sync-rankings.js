// src/pages/api/admin/products/sync-rankings.js
// Sync product sales rankings from Boulevard POS velocity data
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()

  try {
    // Get product SKU velocity (90-day units sold)
    const { data: velocity, error: velErr } = await db
      .from('product_sku_velocity')
      .select('product_id, sku, product_name, brand, units_90d')
      .order('units_90d', { ascending: false })

    if (velErr) throw velErr

    // Get all products with blvd_catalog_id
    const { data: products, error: prodErr } = await db
      .from('products')
      .select('id, blvd_catalog_id, name, sales_rank, is_bestseller')
      .not('blvd_catalog_id', 'is', null)

    if (prodErr) throw prodErr

    if (!products?.length) {
      return res.json({ message: 'No products linked to Boulevard catalog', updated: 0 })
    }

    // Build velocity lookup by blvd catalog id
    const velByProduct = {}
    for (const v of (velocity || [])) {
      if (v.product_id && !velByProduct[v.product_id]) {
        velByProduct[v.product_id] = v.units_90d || 0
      }
    }

    // Sort products by velocity, assign ranks
    const ranked = products
      .map(p => ({
        ...p,
        velocity: velByProduct[p.blvd_catalog_id] || 0,
      }))
      .sort((a, b) => b.velocity - a.velocity)

    let updated = 0
    const changes = []

    for (let i = 0; i < ranked.length; i++) {
      const p = ranked[i]
      const newRank = i + 1
      const newBestseller = newRank <= 6

      if (p.sales_rank !== newRank || p.is_bestseller !== newBestseller) {
        const { error } = await db
          .from('products')
          .update({ sales_rank: newRank, is_bestseller: newBestseller })
          .eq('id', p.id)

        if (!error) {
          updated++
          changes.push({
            name: p.name,
            old_rank: p.sales_rank,
            new_rank: newRank,
            is_bestseller: newBestseller,
            velocity_90d: p.velocity,
          })
        }
      }
    }

    return res.json({
      message: `Updated ${updated} product ranking(s)`,
      updated,
      total_linked: ranked.length,
      changes,
    })
  } catch (err) {
    console.error('[sync-rankings]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
