// src/pages/api/analytics/widget-events.js
// Batch insert widget interaction events.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { events } = req.body
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'events array required' })
  }

  const batch = events.slice(0, 50).map(e => ({
    event_name: e.event_name,
    widget_type: e.widget_type,
    article_slug: e.article_slug || null,
    metadata: e.metadata || {},
    device_id: e.device_id || null,
    page_path: e.page_path || null,
    created_at: e.timestamp || new Date().toISOString(),
  }))

  const db = getServiceClient()
  const { error } = await db.from('widget_events').insert(batch)

  if (error) {
    console.error('[analytics/widget-events]', error.message)
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json({ ok: true, inserted: batch.length })
}
