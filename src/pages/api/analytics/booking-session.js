// src/pages/api/analytics/booking-session.js
// Create and update booking analytics sessions.
// POST = create new session, PATCH = update (abandon, complete, heartbeat).
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      session_id, flow_type, location_key, member_id, device_id,
      page_path, user_agent, utm_source, utm_medium, utm_campaign,
    } = req.body

    if (!session_id || !flow_type) {
      return res.status(400).json({ error: 'session_id and flow_type required' })
    }

    const db = getServiceClient()
    const { error } = await db.from('booking_sessions').insert({
      session_id,
      flow_type,
      location_key: location_key || null,
      member_id: member_id || null,
      device_id: device_id || null,
      page_path: page_path || null,
      user_agent: (user_agent || '').slice(0, 500),
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
    })

    if (error) {
      // Duplicate session_id is OK (retry/race condition)
      if (error.code === '23505') return res.status(200).json({ ok: true, duplicate: true })
      console.error('[analytics/booking-session] insert', error.message)
      return res.status(500).json({ error: error.message })
    }
    return res.status(201).json({ ok: true })
  }

  if (req.method === 'PATCH') {
    const { session_id, ...fields } = req.body
    if (!session_id) return res.status(400).json({ error: 'session_id required' })

    // Only allow safe fields
    const allowed = [
      'outcome', 'abandon_step', 'max_step', 'steps_visited', 'step_count',
      'provider_name', 'provider_id', 'service_name', 'service_id',
      'category_name', 'bundle_title', 'contact_phone', 'contact_email',
      'duration_ms', 'completed_at', 'last_activity', 'location_key',
    ]
    const updates = {}
    for (const key of allowed) {
      if (fields[key] !== undefined) updates[key] = fields[key]
    }
    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ ok: true, noop: true })
    }

    const db = getServiceClient()
    const { error } = await db.from('booking_sessions')
      .update(updates)
      .eq('session_id', session_id)

    if (error) {
      console.error('[analytics/booking-session] update', error.message)
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
