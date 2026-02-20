// src/pages/api/admin/intelligence/providers.js
// Provider performance report — revenue, rebooking, cancellations, service mix.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()

  try {
    const { data: rows, error } = await db
      .from('provider_performance')
      .select('*')
      .gt('total_appointments', 0)
      .order('total_revenue', { ascending: false })

    if (error) throw error

    const providers = (rows || []).map((p) => ({
      staff_id: p.provider_staff_id,
      name: p.provider_name,
      title: p.provider_title || '',
      total_appointments: p.total_appointments,
      unique_clients: p.unique_clients,
      total_revenue: Math.round(Number(p.total_revenue || 0)),
      revenue_per_hour: Number(p.revenue_per_hour || 0),
      revenue_last_30d: Math.round(Number(p.revenue_last_30d || 0)),
      rebooking_rate_pct: Number(p.rebooking_rate_pct || 0),
      cancellation_rate_pct: Number(p.cancellation_rate_pct || 0),
      top_services: p.top_services || [],
    }))

    const totalRev = providers.reduce((s, p) => s + p.total_revenue, 0)
    const avgRebook = providers.length > 0
      ? Math.round(providers.reduce((s, p) => s + p.rebooking_rate_pct, 0) / providers.length * 10) / 10
      : 0

    return res.json({
      summary: {
        total_providers: providers.length,
        total_revenue: totalRev,
        avg_rebooking_rate: avgRebook,
        revenue_last_30d: providers.reduce((s, p) => s + p.revenue_last_30d, 0),
      },
      providers,
    })
  } catch (err) {
    console.error('[intelligence/providers]', err)
    return res.status(500).json({ error: err.message })
  }
}
