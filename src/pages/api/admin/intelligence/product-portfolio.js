// src/pages/api/admin/intelligence/product-portfolio.js
// Customer Product Portfolio — per-client product depth, Core 4, SPF, repurchases, overlaps.
// GET ?bucket=3&search=smith&sort=products_desc&page=1&limit=50
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 30 }

async function fetchAllRows(buildQuery, chunkSize = 1000, maxRows = 200000) {
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

  const { bucket, search, sort = 'products_desc', page = '1', limit = '50' } = req.query
  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, Math.max(10, parseInt(limit, 10) || 50))

  try {
    // Parallel fetch
    const [salesRows, core4Rows, skuMappings] = await Promise.all([
      fetchAllRows(() =>
        db.from('blvd_product_sales')
          .select('client_id, sku, product_name, net_sales')
          .not('client_id', 'is', null)
      ),
      fetchAllRows(() =>
        db.from('client_core4_score')
          .select('client_id, name, email, phone, core4_score, has_cleanser, has_vitamin_c, has_retinol, has_moisturizer, has_spf')
      ),
      fetchAllRows(() =>
        db.from('rie_sku_core4_map')
          .select('sku_key, core4_category')
      ),
    ])

    // Build SKU -> category map
    const skuCategoryMap = new Map()
    for (const m of skuMappings) {
      skuCategoryMap.set(m.sku_key, m.core4_category)
    }

    // Build core4 lookup
    const core4Map = new Map()
    for (const row of core4Rows) {
      core4Map.set(row.client_id, row)
    }

    // Per-client aggregation
    const clientAgg = new Map()
    for (const sale of salesRows) {
      const skuKey = sale.sku || sale.product_name || 'unknown'

      if (!clientAgg.has(sale.client_id)) {
        clientAgg.set(sale.client_id, {
          client_id: sale.client_id,
          skus: new Map(),
          totalSpend: 0,
        })
      }

      const agg = clientAgg.get(sale.client_id)
      agg.totalSpend += Number(sale.net_sales || 0)

      if (!agg.skus.has(skuKey)) {
        agg.skus.set(skuKey, {
          count: 0,
          category: skuCategoryMap.get(skuKey) || 'secondary',
        })
      }

      agg.skus.get(skuKey).count += 1
    }

    // Build per-client portfolio rows
    const portfolioRows = []
    for (const [clientId, agg] of clientAgg) {
      const core4 = core4Map.get(clientId)
      const uniqueProducts = agg.skus.size
      const repurchases = Array.from(agg.skus.values()).filter((s) => s.count >= 2).length

      // SPF analysis
      const spfProducts = Array.from(agg.skus.entries()).filter(([, v]) => v.category === 'spf')

      // Overlapping categories: categories with 2+ different products
      const categoryProductCounts = new Map()
      for (const [, skuData] of agg.skus) {
        const cat = skuData.category
        if (cat && cat !== 'secondary' && cat !== 'excluded') {
          categoryProductCounts.set(cat, (categoryProductCounts.get(cat) || 0) + 1)
        }
      }
      const overlappingCategories = Array.from(categoryProductCounts.entries())
        .filter(([, count]) => count >= 2)
        .map(([cat]) => cat)

      // Bucket
      let productBucket
      if (uniqueProducts === 0) productBucket = '0'
      else if (uniqueProducts <= 4) productBucket = String(uniqueProducts)
      else if (uniqueProducts <= 10) productBucket = '5-10'
      else productBucket = '10+'

      portfolioRows.push({
        client_id: clientId,
        name: core4?.name || 'Unknown',
        email: core4?.email || null,
        phone: core4?.phone || null,
        unique_products: uniqueProducts,
        product_bucket: productBucket,
        core4_score: core4?.core4_score || 0,
        has_spf: spfProducts.length > 0,
        spf_count: spfProducts.length,
        repurchases,
        overlapping_categories: overlappingCategories,
        overlap_count: overlappingCategories.length,
        total_spend: Math.round(agg.totalSpend),
        has_cleanser: core4?.has_cleanser || false,
        has_vitamin_c: core4?.has_vitamin_c || false,
        has_retinol: core4?.has_retinol || false,
        has_moisturizer: core4?.has_moisturizer || false,
      })
    }

    // Distribution summary
    const bucketOrder = ['0', '1', '2', '3', '4', '5-10', '10+']
    const distribution = bucketOrder.map((b) => ({
      bucket: b,
      count: portfolioRows.filter((r) => r.product_bucket === b).length,
      pct: portfolioRows.length > 0
        ? Math.round((portfolioRows.filter((r) => r.product_bucket === b).length / portfolioRows.length) * 1000) / 10
        : 0,
    }))

    // Filter
    let filtered = portfolioRows
    if (bucket && bucket !== 'all') {
      filtered = filtered.filter((r) => r.product_bucket === bucket)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').includes(q)
      )
    }

    // Sort
    const sortFns = {
      products_desc: (a, b) => b.unique_products - a.unique_products,
      products_asc: (a, b) => a.unique_products - b.unique_products,
      spend_desc: (a, b) => b.total_spend - a.total_spend,
      core4_desc: (a, b) => b.core4_score - a.core4_score,
      repurchases_desc: (a, b) => b.repurchases - a.repurchases,
      name_asc: (a, b) => (a.name || '').localeCompare(b.name || ''),
    }
    filtered.sort(sortFns[sort] || sortFns.products_desc)

    // Paginate
    const totalFiltered = filtered.length
    const totalPages = Math.ceil(totalFiltered / pageSize)
    const startIdx = (pageNum - 1) * pageSize
    const pageRows = filtered.slice(startIdx, startIdx + pageSize)

    // Summary stats
    const total = portfolioRows.length
    const avgProducts = total > 0
      ? Math.round((portfolioRows.reduce((s, r) => s + r.unique_products, 0) / total) * 10) / 10
      : 0
    const withRepurchases = portfolioRows.filter((r) => r.repurchases > 0).length
    const withSpf = portfolioRows.filter((r) => r.has_spf).length

    return res.json({
      summary: {
        total,
        avg_products: avgProducts,
        with_repurchases: withRepurchases,
        repurchase_pct: total > 0 ? Math.round((withRepurchases / total) * 1000) / 10 : 0,
        with_spf: withSpf,
        spf_pct: total > 0 ? Math.round((withSpf / total) * 1000) / 10 : 0,
      },
      distribution,
      pagination: { page: pageNum, limit: pageSize, total: totalFiltered, totalPages },
      rows: pageRows,
    })
  } catch (err) {
    console.error('[intelligence/product-portfolio]', err)
    return res.status(500).json({ error: err.message })
  }
}
