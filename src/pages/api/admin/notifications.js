// src/pages/api/admin/notifications.js
// GET: lightweight endpoint for admin notification counts.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()

  try {
    // Unread conversation count
    const { count: unreadConversations } = await db
      .from('bird_conversations')
      .select('*', { count: 'exact', head: true })
      .gt('unread_count', 0)

    // Total unread messages (sum of unread_count across conversations)
    const { data: unreadData } = await db
      .from('bird_conversations')
      .select('unread_count')
      .gt('unread_count', 0)

    const totalUnreadMessages = (unreadData || []).reduce((sum, c) => sum + c.unread_count, 0)

    return res.json({
      ok: true,
      conversations: {
        unread_threads: unreadConversations || 0,
        unread_messages: totalUnreadMessages,
      },
      total_badge: totalUnreadMessages,
    })
  } catch (err) {
    // If tables don't exist yet, return zeros gracefully
    return res.json({
      ok: true,
      conversations: { unread_threads: 0, unread_messages: 0 },
      total_badge: 0,
    })
  }
}

export default withAdminAuth(handler)
