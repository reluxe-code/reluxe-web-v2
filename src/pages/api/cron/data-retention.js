// src/pages/api/cron/data-retention.js
// Weekly cron — enforces data retention TTLs across all tables.
// Calls the enforce_data_retention() Postgres function.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  // Cron auth — fail-closed
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getServiceClient()

  try {
    const { data, error } = await db.rpc('enforce_data_retention')

    if (error) {
      console.error('[cron/data-retention] RPC error:', error.message)
      return res.status(500).json({ error: 'Retention enforcement failed' })
    }

    const summary = (data || []).reduce((acc, row) => {
      acc[row.table_name] = row.rows_deleted
      return acc
    }, {})

    console.log('[cron/data-retention] Complete:', JSON.stringify(summary))
    return res.json({ ok: true, deleted: summary })
  } catch (err) {
    console.error('[cron/data-retention] Error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
}
