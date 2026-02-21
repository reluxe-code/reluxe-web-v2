// src/pages/api/analytics/booking-events.js
// Batch insert booking analytics events.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { events } = req.body
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'events array required' })
  }

  // Limit batch size
  const batch = events.slice(0, 50).map(e => ({
    session_id: e.session_id,
    event_name: e.event_name,
    step: e.step,
    metadata: e.metadata || {},
    time_on_step: e.time_on_step || null,
    step_index: e.step_index ?? null,
    created_at: e.timestamp || new Date().toISOString(),
  }))

  const db = getServiceClient()
  const { error } = await db.from('booking_events').insert(batch)

  if (error) {
    console.error('[analytics/booking-events]', error.message)
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json({ ok: true, inserted: batch.length })
}
