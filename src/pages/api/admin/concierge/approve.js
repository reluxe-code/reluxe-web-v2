// src/pages/api/admin/concierge/approve.js
// POST: approve or skip queue entries.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { ids, action, admin_email } = req.body

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array is required' })
  }
  if (!['approve', 'skip'].includes(action)) {
    return res.status(400).json({ error: 'action must be "approve" or "skip"' })
  }

  const db = getServiceClient()

  try {
    const updateData = action === 'approve'
      ? {
          status: 'approved',
          approved_by: admin_email || null,
          approved_at: new Date().toISOString(),
        }
      : { status: 'skipped' }

    // Update in chunks of 50
    let totalUpdated = 0
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50)
      const { count, error } = await db
        .from('concierge_queue')
        .update(updateData)
        .in('id', chunk)
        .in('status', ['ready']) // Only update ready entries
        .select('id', { count: 'exact', head: true })

      if (error) throw error
      totalUpdated += count || 0
    }

    return res.json({ ok: true, updated: totalUpdated })
  } catch (err) {
    console.error('[concierge/approve]', err)
    return res.status(500).json({ error: err.message })
  }
}
