// src/pages/api/reveal/track-booking.js
// Fire server-side Bird event after a successful Reveal Board booking.
import { trackBirdEvent } from '@/lib/birdTracking'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { phone, appointmentId, serviceSlug, locationKey, bsid, sessionId } = req.body

  if (!phone) return res.status(400).json({ error: 'phone is required' })

  try {
    await trackBirdEvent(
      'reveal_board_booking',
      { key: 'phonenumber', value: phone },
      {
        appointment_id: appointmentId || null,
        service: serviceSlug || null,
        location: locationKey || null,
        bird_subscriber_id: bsid || null,
        session_id: sessionId || null,
        source: 'reveal_board',
      }
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('[reveal/track-booking]', err.message)
    res.status(500).json({ error: 'Failed to track' })
  }
}
