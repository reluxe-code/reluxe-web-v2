// src/pages/api/admin/concierge/detail.js
// GET ?id=<queue-entry-uuid>: full detail for the slide-over drawer.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'
import { hashPhone } from '@/lib/piiHash'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id is required' })

  const db = getServiceClient()

  try {
    // 1. Queue entry
    const { data: entry, error: entryErr } = await db
      .from('concierge_queue')
      .select('*')
      .eq('id', id)
      .single()

    if (entryErr || !entry) {
      return res.status(404).json({ error: 'Queue entry not found' })
    }

    // 2. Client details
    let client = null
    if (entry.client_id) {
      const { data } = await db
        .from('blvd_clients')
        .select('id, boulevard_id, visit_count, total_spend, last_visit_at, tags')
        .eq('id', entry.client_id)
        .single()
      client = data
    }

    // 3. Touch history (last 10 marketing touches for this client)
    let touchHistory = []
    if (entry.phone_hash_v1) {
      const { data } = await db
        .from('marketing_touches')
        .select('id, campaign_slug, cohort, variant, sms_body, status, revenue, sent_at, clicked_at, booked_at')
        .eq('phone_hash_v1', entry.phone_hash_v1)
        .order('sent_at', { ascending: false })
        .limit(10)
      touchHistory = data || []
    } else if (entry.phone) {
      const ph = hashPhone(entry.phone)
      if (ph) {
        const { data } = await db
          .from('marketing_touches')
          .select('id, campaign_slug, cohort, variant, sms_body, status, revenue, sent_at, clicked_at, booked_at')
          .eq('phone_hash_v1', ph)
          .order('sent_at', { ascending: false })
          .limit(10)
        touchHistory = data || []
      }
    }

    // 4. Upcoming appointments
    let upcomingAppointments = []
    if (entry.client_id) {
      const { data } = await db
        .from('blvd_appointments')
        .select(`
          id, start_at, end_at, status, location_key,
          blvd_appointment_services (service_name, provider_staff_id)
        `)
        .eq('client_id', entry.client_id)
        .in('status', ['booked', 'confirmed', 'arrived'])
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(5)

      upcomingAppointments = (data || []).map((appt) => {
        const svc = Array.isArray(appt.blvd_appointment_services)
          ? appt.blvd_appointment_services[0]
          : appt.blvd_appointment_services
        return {
          id: appt.id,
          start_at: appt.start_at,
          status: appt.status,
          location_key: appt.location_key,
          service_name: svc?.service_name || 'Unknown',
        }
      })
    }

    return res.json({
      entry,
      client,
      touch_history: touchHistory,
      upcoming_appointments: upcomingAppointments,
    })
  } catch (err) {
    console.error('[concierge/detail]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
