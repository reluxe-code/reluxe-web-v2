// src/pages/api/admin/concierge/reconcile.js
// POST: match completed bookings back to concierge link tokens for revenue attribution.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()

  try {
    // 1. Find booking sessions with concierge tracking tokens
    const { data: sessions } = await db
      .from('booking_sessions')
      .select('id, tracking_token, completed_at')
      .like('tracking_token', 'cg_%')
      .eq('outcome', 'completed')
      .not('completed_at', 'is', null)

    if (!sessions?.length) {
      return res.json({ ok: true, reconciled: 0, message: 'No concierge-attributed bookings found' })
    }

    let reconciled = 0

    for (const session of sessions) {
      const token = session.tracking_token

      // Check if already reconciled
      const { data: existing } = await db
        .from('marketing_touches')
        .select('id, status')
        .eq('link_token', token)
        .eq('status', 'booked')
        .limit(1)

      if (existing?.length) continue // Already attributed

      // Look up the concierge link for revenue data
      const { data: link } = await db
        .from('concierge_links')
        .select('client_id, utm_campaign')
        .eq('token', token)
        .single()

      if (!link) continue

      // Try to find the appointment and its revenue
      let revenue = 0
      if (link.client_id) {
        const { data: appt } = await db
          .from('blvd_appointments')
          .select('id, blvd_appointment_services(price)')
          .eq('client_id', link.client_id)
          .in('status', ['completed', 'final'])
          .gte('start_at', session.completed_at)
          .order('start_at', { ascending: true })
          .limit(1)

        if (appt?.length) {
          const services = Array.isArray(appt[0].blvd_appointment_services)
            ? appt[0].blvd_appointment_services
            : [appt[0].blvd_appointment_services].filter(Boolean)
          revenue = services.reduce((sum, s) => sum + Number(s.price || 0), 0)
        }
      }

      // Update marketing_touches
      const { error: updateErr } = await db
        .from('marketing_touches')
        .update({
          status: 'booked',
          booked_at: session.completed_at,
          revenue,
        })
        .eq('link_token', token)

      if (!updateErr) reconciled++
    }

    return res.json({ ok: true, reconciled, total_sessions: sessions.length })
  } catch (err) {
    console.error('[concierge/reconcile]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
