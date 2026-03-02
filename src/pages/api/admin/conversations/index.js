// src/pages/api/admin/conversations/index.js
// GET: list conversations with latest message preview, unread count, client info.
// PATCH: mark conversation as read / close / archive.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    const { status = 'open', limit = 50, offset = 0 } = req.query

    try {
      let query = db
        .from('bird_conversations')
        .select('*')
        .order('last_message_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1)

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: conversations, error } = await query
      if (error) throw error

      // Enrich with boulevard_id from blvd_clients for linked conversations
      const clientIds = [...new Set((conversations || []).map(c => c.client_id).filter(Boolean))]
      if (clientIds.length > 0) {
        const { data: clients } = await db
          .from('blvd_clients')
          .select('id, boulevard_id')
          .in('id', clientIds)
        const blvdMap = Object.fromEntries((clients || []).map(c => [c.id, c.boulevard_id]))
        for (const convo of conversations || []) {
          convo.boulevard_id = blvdMap[convo.client_id] || null
        }
      }

      // Get total counts by status
      const { count: openCount } = await db
        .from('bird_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

      const { count: totalUnread } = await db
        .from('bird_conversations')
        .select('*', { count: 'exact', head: true })
        .gt('unread_count', 0)

      return res.json({
        ok: true,
        conversations: conversations || [],
        open_count: openCount || 0,
        total_unread: totalUnread || 0,
      })
    } catch (err) {
      console.error('[conversations/index GET]', err)
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'PATCH') {
    const { id, action } = req.body || {}
    if (!id || !action) return res.status(400).json({ error: 'id and action required' })

    try {
      const updates = { updated_at: new Date().toISOString() }

      if (action === 'mark_read') {
        updates.unread_count = 0
      } else if (action === 'close') {
        updates.status = 'closed'
        updates.unread_count = 0
      } else if (action === 'archive') {
        updates.status = 'archived'
        updates.unread_count = 0
      } else if (action === 'reopen') {
        updates.status = 'open'
      } else {
        return res.status(400).json({ error: 'Invalid action' })
      }

      await db.from('bird_conversations').update(updates).eq('id', id)
      return res.json({ ok: true })
    } catch (err) {
      console.error('[conversations/index PATCH]', err)
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'GET or PATCH only' })
}

export default withAdminAuth(handler)
