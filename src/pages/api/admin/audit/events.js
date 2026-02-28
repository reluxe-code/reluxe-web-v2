// src/pages/api/admin/audit/events.js
// Admin API: query site audit events with filters, pagination, and stats.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return await handleGet(req, res)
    if (req.method === 'PUT') return await handleToggle(req, res)
    return res.status(405).json({ error: 'GET or PUT only' })
  } catch (err) {
    console.error('[admin/audit/events] unhandled:', err.message)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}

async function handleGet(req, res) {
  const {
    type,
    since = '24h',
    search,
    page = '1',
    per_page = '50',
  } = req.query

  const db = getServiceClient()
  const pageNum = Math.max(parseInt(page) || 1, 1)
  const perPage = Math.min(Math.max(parseInt(per_page) || 50, 1), 100)
  const offset = (pageNum - 1) * perPage

  // Resolve date range
  let sinceDate
  if (since === '24h') sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
  else if (since === '7d') sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  else if (since === '30d') sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  else sinceDate = new Date(since)

  // Build query
  let query = db
    .from('site_audit_events')
    .select('*', { count: 'exact' })
    .gte('created_at', sinceDate.toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  if (type && type !== 'all') {
    query = query.eq('event_type', type)
  }
  if (search) {
    query = query.ilike('message', `%${search}%`)
  }

  const { data: events, count, error } = await query

  if (error) {
    console.error('[admin/audit/events]', error.message)
    return res.status(500).json({ error: error.message })
  }

  // Stats: count by type for the same date range
  let stats = {}
  const { data: allTypes, error: statsError } = await db
    .from('site_audit_events')
    .select('event_type')
    .gte('created_at', sinceDate.toISOString())

  if (!statsError && allTypes) {
    for (const row of allTypes) {
      stats[row.event_type] = (stats[row.event_type] || 0) + 1
    }
  }

  // Get feature flag status
  const { data: config } = await db
    .from('site_config')
    .select('value')
    .eq('key', 'audit_tracking_enabled')
    .single()

  const enabled = config?.value !== false && config?.value !== 'false'

  return res.status(200).json({
    events: events || [],
    total: count || 0,
    page: pageNum,
    perPage,
    stats,
    enabled,
  })
}

async function handleToggle(req, res) {
  const { enabled } = req.body
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled (boolean) required' })
  }

  const db = getServiceClient()
  const { error } = await db
    .from('site_config')
    .upsert({ key: 'audit_tracking_enabled', value: enabled, updated_at: new Date().toISOString() })

  if (error) {
    console.error('[admin/audit/toggle]', error.message)
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ ok: true, enabled })
}
