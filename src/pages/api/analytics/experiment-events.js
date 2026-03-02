// Batch insert experiment events.
import { getServiceClient } from '@/lib/supabase'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (applyRateLimit(req, res, rateLimiters.loose, getClientIp(req))) return

  const { events } = req.body
  if (!Array.isArray(events) || !events.length) {
    return res.status(400).json({ error: 'events array required' })
  }

  const batch = events.slice(0, 50).map(e => ({
    session_id: e.session_id,
    event_name: e.event_name,
    metadata: e.metadata || {},
    created_at: e.timestamp || new Date().toISOString(),
  }))

  const db = getServiceClient()
  const { error } = await db.from('experiment_events').insert(batch)

  if (error) {
    console.error('[analytics/experiment-events]', error.message)
    return res.status(500).json({ error: 'Failed to insert events' })
  }

  return res.status(201).json({ ok: true, inserted: batch.length })
}
