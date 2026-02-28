// src/pages/api/audit/events.js
// Batch insert audit events. Checks feature flag before writing.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { events } = req.body
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'events array required' })
  }

  const db = getServiceClient()

  // Check feature flag
  const { data: config } = await db
    .from('site_config')
    .select('value')
    .eq('key', 'audit_tracking_enabled')
    .single()

  if (config?.value === false || config?.value === 'false') {
    return res.status(200).json({ ok: true, skipped: true })
  }

  const batch = events.slice(0, 50).map(e => ({
    event_type: e.event_type,
    message: e.message || null,
    metadata: e.metadata || {},
    url: e.url || null,
    user_agent: e.user_agent || null,
    device_id: e.device_id || null,
    member_id: e.member_id || null,
    created_at: e.timestamp || new Date().toISOString(),
  }))

  const { error } = await db.from('site_audit_events').insert(batch)

  if (error) {
    console.error('[audit/events]', error.message)
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json({ ok: true, inserted: batch.length })
}
