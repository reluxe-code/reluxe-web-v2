// POST = create experiment session, PATCH = update
import { getServiceClient } from '@/lib/supabase'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'
import { hashPhone, hashEmail } from '@/lib/piiHash'

export default async function handler(req, res) {
  if (applyRateLimit(req, res, rateLimiters.loose, getClientIp(req))) return

  if (req.method === 'POST') {
    const {
      session_id, experiment_id, device_id,
      referrer, utm_source, utm_medium, utm_campaign, utm_content,
      fbclid, gclid, tracking_token,
    } = req.body

    if (!session_id) return res.status(400).json({ error: 'session_id required' })

    const db = getServiceClient()
    const { error } = await db.from('experiment_sessions').insert({
      session_id,
      experiment_id: experiment_id || 'thisorthat_v1',
      device_id: device_id || null,
      referrer: (referrer || '').slice(0, 500) || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
      fbclid: fbclid || null,
      gclid: gclid || null,
      tracking_token: tracking_token || null,
    })

    if (error) {
      if (error.code === '23505') return res.status(200).json({ ok: true, duplicate: true })
      console.error('[analytics/experiment-session] insert', error.message)
      return res.status(500).json({ error: 'Server error' })
    }
    return res.status(201).json({ ok: true })
  }

  if (req.method === 'PATCH') {
    const { session_id, ...fields } = req.body
    if (!session_id) return res.status(400).json({ error: 'session_id required' })

    const allowed = [
      'outcome', 'abandon_phase', 'rounds_completed',
      'persona_name', 'persona_services', 'is_heavy_responder', 'choices', 'scores',
      'booking_started', 'booking_service', 'booking_location', 'booking_provider',
      'booking_completed', 'appointment_id',
      'membership_shown', 'membership_clicked',
      'blvd_client_id',
      'completed_at', 'duration_ms', 'last_activity',
      // Reveal Board fields (stored in existing JSONB columns)
      'filter_locations', 'filter_services', 'filter_when', 'filter_time_of_day',
      'filter_provider', 'board_tile_count', 'bird_subscriber_id', 'tracking_token',
    ]
    const updates = {}
    for (const key of allowed) {
      if (fields[key] !== undefined) updates[key] = fields[key]
    }

    // Hash PII — only store hashes/initials, not raw values
    if (fields.contact_phone) {
      updates.contact_phone_hash_v1 = hashPhone(fields.contact_phone)
    }
    if (fields.client_email) {
      updates.client_email_hash_v1 = hashEmail(fields.client_email)
    }
    if (fields.client_name) {
      updates.client_name_initial = (fields.client_name || '')[0]
        ? fields.client_name[0] + '.'
        : null
    }
    if (!Object.keys(updates).length) return res.status(200).json({ ok: true, noop: true })

    const db = getServiceClient()
    const { error } = await db.from('experiment_sessions').update(updates).eq('session_id', session_id)

    if (error) {
      console.error('[analytics/experiment-session] update', error.message)
      return res.status(500).json({ error: 'Server error' })
    }
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
