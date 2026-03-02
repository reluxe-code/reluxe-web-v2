// src/pages/api/admin/intelligence/provider-scorecard.js
// Combined provider scorecard — service + retail + Core 4 metrics.
// GET ?provider_id=<uuid>
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

function monthKey(date) {
  return new Date(date).toISOString().slice(0, 7)
}

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { provider_id } = req.query
  if (!provider_id) return res.status(400).json({ error: 'provider_id required' })

  const db = getServiceClient()

  try {
    // Parallel queries
    const [
      staffRes,
      serviceMetricsRes,
      retailMetricsRes,
      productSalesRows,
      appointmentSvcRows,
    ] = await Promise.all([
      db.from('staff').select('id, name, title').eq('id', provider_id).single(),
      db.from('provider_performance').select('*').eq('provider_staff_id', provider_id).single(),
      db.from('rie_provider_sales_dna').select('*').eq('provider_staff_id', provider_id).single(),
      // Monthly product sales for trend
      fetchAllRows(() =>
        db.from('blvd_product_sales')
          .select('sold_at, net_sales')
          .eq('provider_staff_id', provider_id)
          .gte('sold_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
          .order('sold_at', { ascending: true })
      ),
      // Monthly service revenue for trend
      fetchAllRows(() =>
        db.from('blvd_appointment_services')
          .select('price, blvd_appointments!inner(start_at, status)')
          .eq('provider_staff_id', provider_id)
          .in('blvd_appointments.status', ['completed', 'final'])
          .gte('blvd_appointments.start_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      ),
    ])

    if (staffRes.error) throw staffRes.error
    const staff = staffRes.data
    const serviceMetrics = serviceMetricsRes.data || {}
    const retailMetrics = retailMetricsRes.data || {}

    // Core 4 distribution for this provider's clients
    const { data: providerClients } = await db
      .from('blvd_product_sales')
      .select('client_id')
      .eq('provider_staff_id', provider_id)

    const clientIds = [...new Set((providerClients || []).map((r) => r.client_id).filter(Boolean))]

    let core4Distribution = [0, 0, 0, 0, 0]
    let core4Total = 0
    if (clientIds.length > 0) {
      const batchSize = 500
      for (let i = 0; i < clientIds.length; i += batchSize) {
        const batch = clientIds.slice(i, i + batchSize)
        const { data: scores } = await db
          .from('client_core4_score')
          .select('core4_score')
          .in('client_id', batch)

        for (const row of scores || []) {
          const s = Math.min(row.core4_score || 0, 4)
          core4Distribution[s] += 1
          core4Total += 1
        }
      }
    }

    // Monthly trend (last 12 months)
    const now = new Date()
    const monthKeys = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      monthKeys.push(d.toISOString().slice(0, 7))
    }

    const monthlyService = Object.fromEntries(monthKeys.map((m) => [m, 0]))
    const monthlyRetail = Object.fromEntries(monthKeys.map((m) => [m, 0]))

    for (const row of appointmentSvcRows || []) {
      const mk = monthKey(row.blvd_appointments?.start_at)
      if (monthlyService[mk] !== undefined) {
        monthlyService[mk] += Number(row.price || 0)
      }
    }

    for (const row of productSalesRows || []) {
      const mk = monthKey(row.sold_at)
      if (monthlyRetail[mk] !== undefined) {
        monthlyRetail[mk] += Number(row.net_sales || 0)
      }
    }

    const monthly = monthKeys.map((m) => ({
      month: m,
      service_revenue: Math.round(monthlyService[m] || 0),
      retail_revenue: Math.round(monthlyRetail[m] || 0),
    }))

    return res.json({
      provider: {
        id: staff.id,
        name: staff.name,
        title: staff.title,
      },
      service_metrics: {
        total_revenue: Math.round(Number(serviceMetrics.total_revenue || 0)),
        revenue_per_hour: Math.round(Number(serviceMetrics.revenue_per_hour || 0)),
        rebooking_rate_pct: Number(serviceMetrics.rebooking_rate_pct || 0),
        cancellation_rate_pct: Number(serviceMetrics.cancellation_rate_pct || 0),
        total_appointments: serviceMetrics.total_appointments || 0,
        unique_clients: serviceMetrics.unique_clients || 0,
        top_services: serviceMetrics.top_services || [],
      },
      retail_metrics: {
        attachment_rate_pct: Number(retailMetrics.attachment_rate_pct || 0),
        total_retail_revenue: Math.round(Number(retailMetrics.total_retail_revenue || 0)),
        unique_skus_sold: retailMetrics.unique_skus_sold || 0,
        portfolio_variety_pct: Number(retailMetrics.portfolio_variety_pct || 0),
        retail_clients: retailMetrics.retail_clients || 0,
      },
      core4: {
        protocol_adherence_pct: Number(retailMetrics.protocol_adherence_pct || 0),
        total_clients: core4Total,
        distribution: core4Distribution.map((count, score) => ({
          score,
          count,
          pct: core4Total > 0 ? Math.round((count / core4Total) * 1000) / 10 : 0,
        })),
        clients_at_4: core4Distribution[4],
      },
      monthly,
    })
  } catch (err) {
    console.error('[intelligence/provider-scorecard]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
