// src/pages/api/admin/intelligence/sales-dna.js
// Provider Sales DNA — attachment rate, protocol adherence, portfolio variety leaderboard.
// GET ?sort=attachment|adherence|variety|revenue
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()

  try {
    const { data: providers, error } = await db
      .from('rie_provider_sales_dna')
      .select('*')

    if (error) throw error

    const rows = providers || []
    const activeProviders = rows.filter((r) => r.total_appointments > 0 || r.sale_lines > 0)

    // Team averages
    const count = activeProviders.length || 1
    const avgAttachment = Math.round(activeProviders.reduce((s, r) => s + Number(r.attachment_rate_pct || 0), 0) / count * 10) / 10
    const avgAdherence = Math.round(activeProviders.reduce((s, r) => s + Number(r.protocol_adherence_pct || 0), 0) / count * 10) / 10
    const avgVariety = Math.round(activeProviders.reduce((s, r) => s + Number(r.portfolio_variety_pct || 0), 0) / count * 10) / 10
    const totalRetailRevenue = Math.round(activeProviders.reduce((s, r) => s + Number(r.total_retail_revenue || 0), 0))

    return res.json({
      summary: {
        total_providers: activeProviders.length,
        avg_attachment_rate: avgAttachment,
        avg_protocol_adherence: avgAdherence,
        avg_portfolio_variety: avgVariety,
        total_retail_revenue: totalRetailRevenue,
      },
      providers: activeProviders.map((r) => ({
        provider_staff_id: r.provider_staff_id,
        name: r.provider_name,
        title: r.provider_title,
        total_appointments: r.total_appointments,
        sale_lines: r.sale_lines,
        unique_skus_sold: r.unique_skus_sold,
        total_retail_revenue: Math.round(Number(r.total_retail_revenue || 0)),
        retail_clients: r.retail_clients,
        attachment_rate_pct: Number(r.attachment_rate_pct || 0),
        protocol_adherence_pct: Number(r.protocol_adherence_pct || 0),
        portfolio_variety_pct: Number(r.portfolio_variety_pct || 0),
      })),
    })
  } catch (err) {
    console.error('[intelligence/sales-dna]', err)
    return res.status(500).json({ error: err.message })
  }
}
