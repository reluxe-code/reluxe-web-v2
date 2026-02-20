// src/pages/api/admin/intelligence/products.js
// Product intelligence API: sales, monthly trend, provider filter, SKU forecasts,
// rebuy/cross-sell behavior, and journey cohorts.
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

function monthKey(date) {
  return new Date(date).toISOString().slice(0, 7)
}

function buildRecentMonthKeys(totalMonths) {
  const list = []
  const now = new Date()
  for (let i = totalMonths - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    list.push(d.toISOString().slice(0, 7))
  }
  return list
}

function round(value, digits = 2) {
  const factor = 10 ** digits
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor
}

function safePct(num, den) {
  if (!den) return 0
  return round((num / den) * 100, 1)
}

function linearSlope(values) {
  // Least-squares slope for y over x=[0..n-1]
  const n = values.length
  if (n < 2) return 0
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumXX += i * i
  }
  const denom = n * sumXX - sumX * sumX
  if (!denom) return 0
  return (n * sumXY - sumX * sumY) / denom
}

function bucketDays(days) {
  if (days <= 30) return '0-30'
  if (days <= 60) return '31-60'
  if (days <= 90) return '61-90'
  if (days <= 120) return '91-120'
  return '120+'
}

function summarizeJourney(latestByClient, clientsById, targetSku) {
  const dayWindows = [
    { key: 'day2', label: 'Day 2 Check-In', min: 1, max: 3, message: 'Quick check on skin response; normalize mild dryness and invite reply.' },
    { key: 'day7', label: 'Day 7 Dryness Tip', min: 6, max: 8, message: 'Usage coaching: every other night + moisturizer if dry.' },
    { key: 'day21', label: 'Day 21 Progress', min: 20, max: 22, message: 'Prompt for progress review as texture improvements begin.' },
    { key: 'day30', label: 'Day 30 Selfie Ask', min: 29, max: 31, message: 'Collect selfie and deliver personalized guidance.' },
    { key: 'day50', label: 'Day 50 Low Inventory', min: 49, max: 51, message: 'Pre-refill nudge when most clients are halfway through bottle.' },
    { key: 'day60', label: 'Day 60 Refill Offer', min: 59, max: 61, message: 'Refill conversion moment: ship or pickup CTA.' },
  ]

  const now = Date.now()
  const clients = Array.from(latestByClient.values())
    .filter((row) => row.sku_key === targetSku)
    .map((row) => ({
      ...row,
      days_since: Math.floor((now - new Date(row.sold_at).getTime()) / (1000 * 60 * 60 * 24)),
      name: clientsById.get(row.client_id)?.name || 'Unknown',
      email: clientsById.get(row.client_id)?.email || null,
    }))

  return dayWindows.map((window) => {
    const eligible = clients.filter((c) => c.days_since >= window.min && c.days_since <= window.max)
    return {
      ...window,
      eligible_count: eligible.length,
      sample_clients: eligible.slice(0, 5).map((c) => ({
        client_id: c.client_id,
        name: c.name,
        email: c.email,
        days_since: c.days_since,
      })),
    }
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { provider = 'all', months = '12', sku } = req.query
  const db = getServiceClient()
  const totalMonths = Math.min(24, Math.max(6, parseInt(months, 10) || 12))

  try {
    const since = new Date()
    since.setUTCMonth(since.getUTCMonth() - Math.max(totalMonths, 12))

    const baseSalesQuery = () => {
      let query = db
        .from('blvd_product_sales')
        .select('id, order_id, sold_at, provider_staff_id, client_id, sku, product_name, brand, category, quantity, unit_price, discount_amount, net_sales')
        .gte('sold_at', since.toISOString())
        .order('sold_at', { ascending: true })
      if (provider !== 'all') query = query.eq('provider_staff_id', provider)
      return query
    }

    const [{ data: providers, error: providersErr }, salesRows] = await Promise.all([
      db.from('staff').select('id, name, title').not('boulevard_provider_id', 'is', null).order('name'),
      fetchAllRows(baseSalesQuery),
    ])

    if (providersErr) throw providersErr

    const rows = salesRows || []
    const rowsWithOrderId = rows.filter((r) => r.order_id).length
    const rowsWithClientId = rows.filter((r) => r.client_id).length
    const rowsWithProviderId = rows.filter((r) => r.provider_staff_id).length
    const rowsWithSku = rows.filter((r) => r.sku).length

    const capabilities = {
      has_order_ids: rowsWithOrderId > 0,
      has_client_ids: rowsWithClientId > 0,
      has_provider_ids: rowsWithProviderId > 0,
      has_sku: rowsWithSku > 0,
    }

    const limitations = []
    if (!capabilities.has_order_ids) limitations.push('Missing order IDs: avg order size and order-based conversion are approximate.')
    if (!capabilities.has_client_ids) limitations.push('Missing client IDs: rebuy, cross-sell, and product/service correspondence are limited.')
    if (!capabilities.has_provider_ids) limitations.push('Missing provider IDs: provider filtering may be incomplete.')
    if (!capabilities.has_sku) limitations.push('Missing SKUs: SKU-level forecasting uses product name fallback.')

    const monthKeys = buildRecentMonthKeys(totalMonths)
    const monthlyMap = Object.fromEntries(monthKeys.map((m) => [m, { month: m, sales: 0, units: 0, orders: new Set() }]))

    const orderIds = new Set()
    const orderTotals = new Map()
    let totalSales = 0
    let totalUnits = 0

    const skuMap = new Map()
    const clientSkuMap = new Map() // client -> set of sku
    const clientSkuOrderCounts = new Map() // client|sku -> count
    const latestSkuPurchaseByClient = new Map() // client -> latest row for journey

    for (const row of rows) {
      const soldMonth = monthKey(row.sold_at)
      const amount = Number(row.net_sales || 0)
      const qty = Number(row.quantity || 0)
      const skuKey = row.sku || row.product_name || 'unknown'

      totalSales += amount
      totalUnits += qty

      if (row.order_id) orderIds.add(row.order_id)
      if (row.order_id) {
        orderTotals.set(row.order_id, (orderTotals.get(row.order_id) || 0) + amount)
      }

      if (monthlyMap[soldMonth]) {
        monthlyMap[soldMonth].sales += amount
        monthlyMap[soldMonth].units += qty
        if (row.order_id) monthlyMap[soldMonth].orders.add(row.order_id)
      }

      if (!skuMap.has(skuKey)) {
        skuMap.set(skuKey, {
          sku_key: skuKey,
          sku: row.sku,
          product_name: row.product_name,
          brand: row.brand,
          category: row.category,
          units: 0,
          sales: 0,
          buyers: new Set(),
          monthly_units: Object.fromEntries(monthKeys.map((m) => [m, 0])),
          last_sold_at: row.sold_at,
        })
      }

      const skuAgg = skuMap.get(skuKey)
      skuAgg.units += qty
      skuAgg.sales += amount
      skuAgg.monthly_units[soldMonth] = (skuAgg.monthly_units[soldMonth] || 0) + qty
      if (row.client_id) skuAgg.buyers.add(row.client_id)
      if (new Date(row.sold_at) > new Date(skuAgg.last_sold_at)) skuAgg.last_sold_at = row.sold_at

      if (row.client_id) {
        if (!clientSkuMap.has(row.client_id)) clientSkuMap.set(row.client_id, new Set())
        clientSkuMap.get(row.client_id).add(skuKey)

        const countKey = `${row.client_id}|${skuKey}`
        clientSkuOrderCounts.set(countKey, (clientSkuOrderCounts.get(countKey) || 0) + 1)

        const latest = latestSkuPurchaseByClient.get(row.client_id)
        if (!latest || new Date(row.sold_at) > new Date(latest.sold_at)) {
          latestSkuPurchaseByClient.set(row.client_id, { client_id: row.client_id, sku_key: skuKey, sold_at: row.sold_at })
        }
      }
    }

    const monthly = monthKeys.map((m) => ({
      month: m,
      sales: round(monthlyMap[m].sales),
      units: round(monthlyMap[m].units, 1),
      orders: monthlyMap[m].orders.size,
    }))

    const lastMonth = monthly[monthly.length - 1] || { sales: 0, units: 0 }
    const prevMonth = monthly[monthly.length - 2] || { sales: 0, units: 0 }

    const avgOrderSize = orderTotals.size > 0
      ? Array.from(orderTotals.values()).reduce((sum, value) => sum + value, 0) / orderTotals.size
      : (rows.length > 0 ? totalSales / rows.length : 0)

    const repeatBuyers = new Set()
    for (const [key, count] of clientSkuOrderCounts.entries()) {
      if (count >= 2) repeatBuyers.add(key.split('|')[0])
    }

    const allBuyerIds = Array.from(clientSkuMap.keys())
    const crossSellBuyerCount = allBuyerIds.filter((id) => (clientSkuMap.get(id)?.size || 0) > 1).length

    const skuForecasts = Array.from(skuMap.values())
      .map((skuAgg) => {
        const monthSeries = monthKeys.map((m) => skuAgg.monthly_units[m] || 0)
        const slope = linearSlope(monthSeries)
        const avgMonthly = monthSeries.reduce((sum, value) => sum + value, 0) / monthSeries.length

        const units30 = monthSeries.slice(-1)[0] || 0
        const units90 = monthSeries.slice(-3).reduce((sum, value) => sum + value, 0)
        const base30 = Math.max(units30, units90 / 3)
        const trendAdjust = avgMonthly > 0 ? slope / avgMonthly : 0

        const forecast30 = Math.max(0, Math.ceil(base30 * (1 + trendAdjust * 0.35)))
        const forecast90 = Math.max(0, Math.ceil(Math.max(forecast30 * 3, units90 * (1 + trendAdjust * 0.2))))

        const repeatBuyerCount = Array.from(skuAgg.buyers).filter((buyerId) => {
          const key = `${buyerId}|${skuAgg.sku_key}`
          return (clientSkuOrderCounts.get(key) || 0) >= 2
        }).length

        const confidence = Math.min(0.95, Math.max(0.35, monthSeries.filter((v) => v > 0).length / monthSeries.length))

        return {
          sku_key: skuAgg.sku_key,
          sku: skuAgg.sku,
          product_name: skuAgg.product_name,
          brand: skuAgg.brand,
          category: skuAgg.category,
          units_sold: round(skuAgg.units, 1),
          sales: round(skuAgg.sales),
          unique_buyers: skuAgg.buyers.size,
          repeat_rate_pct: safePct(repeatBuyerCount, skuAgg.buyers.size),
          last_sold_at: skuAgg.last_sold_at,
          units_30d: round(units30, 1),
          units_90d: round(units90, 1),
          forecast_30d: forecast30,
          forecast_90d: forecast90,
          suggested_order_30d: Math.ceil(forecast30 * 1.15),
          suggested_order_90d: Math.ceil(forecast90 * 1.15),
          trend_slope: round(slope, 3),
          confidence: round(confidence, 2),
          demand_bucket: bucketDays(units90 > 0 ? Math.ceil((90 / units90) * 30) : 999),
        }
      })
      .sort((a, b) => b.sales - a.sales)

    // Service correspondence + conversion
    let topServices = []
    let productBuyerServiceAttachRate = 0
    let serviceToProductConversionRate = 0

    if (allBuyerIds.length > 0) {
      const dedupBuyerIds = allBuyerIds.slice(0, 5000)

      const [{ data: clientRows }, buyerServiceRows, serviceClientRows] = await Promise.all([
        db
          .from('blvd_clients')
          .select('id, name, email')
          .in('id', dedupBuyerIds),
        fetchAllRows(() =>
          db
            .from('blvd_appointment_services')
            .select('service_slug, price, blvd_appointments!inner(client_id, status, start_at)')
            .in('blvd_appointments.client_id', dedupBuyerIds)
            .in('blvd_appointments.status', ['completed', 'final'])
            .gte('blvd_appointments.start_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        ),
        fetchAllRows(() =>
          db
            .from('blvd_appointments')
            .select('client_id')
            .in('status', ['completed', 'final'])
            .gte('start_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
            .not('client_id', 'is', null)
        ),
      ])

      const serviceMap = new Map()
      const buyersWithServices = new Set()
      for (const row of buyerServiceRows || []) {
        const slug = row.service_slug || 'unknown'
        const clientId = row.blvd_appointments?.client_id
        if (clientId) buyersWithServices.add(clientId)

        if (!serviceMap.has(slug)) serviceMap.set(slug, { service_slug: slug, lines: 0, revenue: 0 })
        const agg = serviceMap.get(slug)
        agg.lines += 1
        agg.revenue += Number(row.price || 0)
      }

      topServices = Array.from(serviceMap.values())
        .map((row) => ({
          service_slug: row.service_slug,
          lines: row.lines,
          revenue: round(row.revenue),
        }))
        .sort((a, b) => b.lines - a.lines)
        .slice(0, 10)

      productBuyerServiceAttachRate = safePct(buyersWithServices.size, dedupBuyerIds.length)

      const serviceClientSet = new Set((serviceClientRows || []).map((r) => r.client_id).filter(Boolean))
      serviceToProductConversionRate = safePct(dedupBuyerIds.length, serviceClientSet.size)

      const clientsById = new Map((clientRows || []).map((c) => [c.id, c]))
      const chosenSku = sku || skuForecasts[0]?.sku_key || null

      return res.json({
        filters: {
          provider,
          months: totalMonths,
          sku: chosenSku,
          providers: providers || [],
        },
        capabilities,
        limitations,
        summary: {
          total_sales: round(totalSales),
          total_units: round(totalUnits, 1),
          total_orders: orderIds.size,
          avg_order_size: round(avgOrderSize),
          mom_sales_trend_pct: safePct(lastMonth.sales - prevMonth.sales, prevMonth.sales),
          mom_units_trend_pct: safePct(lastMonth.units - prevMonth.units, prevMonth.units),
          unique_product_buyers: dedupBuyerIds.length,
          rebuy_rate_pct: safePct(repeatBuyers.size, dedupBuyerIds.length),
          cross_sell_rate_pct: safePct(crossSellBuyerCount, dedupBuyerIds.length),
          product_buyer_service_attach_rate_pct: productBuyerServiceAttachRate,
          service_to_product_conversion_pct: serviceToProductConversionRate,
        },
        monthly,
        sku_forecasts: skuForecasts.slice(0, 40),
        product_trends: {
          top_services_among_buyers: topServices,
          order_size_bands: {
            small_1_2_products_pct: safePct(rows.filter((r) => Number(r.quantity || 0) <= 2).length, rows.length),
            medium_3_5_products_pct: safePct(rows.filter((r) => Number(r.quantity || 0) > 2 && Number(r.quantity || 0) <= 5).length, rows.length),
            large_6_plus_products_pct: safePct(rows.filter((r) => Number(r.quantity || 0) > 5).length, rows.length),
          },
        },
        journey: chosenSku
          ? {
              sku_key: chosenSku,
              stages: summarizeJourney(latestSkuPurchaseByClient, clientsById, chosenSku),
            }
          : null,
      })
    }

    return res.json({
      filters: {
        provider,
        months: totalMonths,
        sku: null,
        providers: providers || [],
      },
      capabilities,
      limitations,
      summary: {
        total_sales: round(totalSales),
        total_units: round(totalUnits, 1),
        total_orders: orderIds.size,
        avg_order_size: round(avgOrderSize),
        mom_sales_trend_pct: safePct(lastMonth.sales - prevMonth.sales, prevMonth.sales),
        mom_units_trend_pct: safePct(lastMonth.units - prevMonth.units, prevMonth.units),
        unique_product_buyers: 0,
        rebuy_rate_pct: 0,
        cross_sell_rate_pct: 0,
        product_buyer_service_attach_rate_pct: 0,
        service_to_product_conversion_pct: 0,
      },
      monthly,
      sku_forecasts: skuForecasts.slice(0, 40),
      product_trends: {
        top_services_among_buyers: [],
        order_size_bands: {
          small_1_2_products_pct: 0,
          medium_3_5_products_pct: 0,
          large_6_plus_products_pct: 0,
        },
      },
      journey: null,
    })
  } catch (err) {
    console.error('[intelligence/products]', err)
    return res.status(500).json({ error: err.message })
  }
}
