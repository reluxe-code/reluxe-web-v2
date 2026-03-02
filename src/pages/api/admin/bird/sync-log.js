// src/pages/api/admin/bird/sync-log.js
// GET — Returns recent Bird sync activity for auditing.
// Query params: ?days=1 (default), ?status=failed, ?limit=100
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()
  const days = parseInt(req.query.days) || 1
  const statusFilter = req.query.status || null // 'success' | 'failed' | null (all)
  const limit = Math.min(parseInt(req.query.limit) || 100, 500)

  const since = new Date(Date.now() - days * 86400_000).toISOString()

  // Get summary counts
  const { count: successCount } = await db
    .from('bird_sync_log')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'success')
    .gte('created_at', since)

  const { count: failedCount } = await db
    .from('bird_sync_log')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', since)

  // Get recent entries
  let query = db
    .from('bird_sync_log')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: entries, error, count } = await query

  if (error) {
    console.error('[bird/sync-log] Query error:', error.message)
    return res.status(500).json({ error: error.message })
  }

  res.json({
    period: `${days} day(s)`,
    since,
    summary: {
      total: (successCount || 0) + (failedCount || 0),
      success: successCount || 0,
      failed: failedCount || 0,
    },
    entries: entries || [],
  })
}

export default withAdminAuth(handler)
