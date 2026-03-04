// pages/api/analytics/search-events.js
// Public batch event ingestion for search analytics.

import { getServiceClient } from '@/lib/supabase'
import { createRateLimiter, getClientIp, applyRateLimit } from '@/lib/rateLimit'

const limiter = createRateLimiter('search-events', 30, 60_000)

const VALID_EVENT_TYPES = new Set(['query', 'click', 'suggestion_click'])
const VALID_SOURCES = new Set(['overlay', 'page', 'keyboard_shortcut'])

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const ip = getClientIp(req)
  if (applyRateLimit(req, res, limiter, ip)) return

  const { events } = req.body || {}
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'events array required' })
  }
  if (events.length > 50) {
    return res.status(400).json({ error: 'Max 50 events per batch' })
  }

  const rows = []
  for (const e of events) {
    if (!e.query || !VALID_EVENT_TYPES.has(e.event_type)) continue
    rows.push({
      event_type: e.event_type,
      query: String(e.query).slice(0, 500),
      query_normalized: String(e.query_normalized || e.query).toLowerCase().trim().replace(/\s+/g, ' ').slice(0, 500),
      result_count: typeof e.result_count === 'number' ? e.result_count : 0,
      clicked_url: e.clicked_url ? String(e.clicked_url).slice(0, 1000) : null,
      clicked_title: e.clicked_title ? String(e.clicked_title).slice(0, 500) : null,
      clicked_type: e.clicked_type ? String(e.clicked_type).slice(0, 50) : null,
      click_position: typeof e.click_position === 'number' ? e.click_position : null,
      active_filter: e.active_filter ? String(e.active_filter).slice(0, 50) : null,
      device_id: e.device_id ? String(e.device_id).slice(0, 100) : null,
      session_id: e.session_id ? String(e.session_id).slice(0, 100) : null,
      source: VALID_SOURCES.has(e.source) ? e.source : 'overlay',
      page_path: e.page_path ? String(e.page_path).slice(0, 500) : null,
    })
  }

  if (rows.length === 0) {
    return res.status(200).json({ ok: true, inserted: 0 })
  }

  try {
    const db = getServiceClient()
    const { error } = await db.from('search_events').insert(rows)
    if (error) throw error
    return res.status(200).json({ ok: true, inserted: rows.length })
  } catch (err) {
    console.error('[search-events] Insert error:', err.message)
    return res.status(500).json({ error: 'Failed to record events' })
  }
}
