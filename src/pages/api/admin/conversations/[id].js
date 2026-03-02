// src/pages/api/admin/conversations/[id].js
// GET: fetch full message thread for a conversation.
import { getServiceClient } from '@/lib/supabase'
import { hashPhone } from '@/lib/piiHash'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()
  const { id } = req.query

  try {
    // 1. Get conversation details
    const { data: conversation, error: convoErr } = await db
      .from('bird_conversations')
      .select('*')
      .eq('id', id)
      .single()

    if (convoErr || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    // 2. Get all messages in this thread
    const { data: messages, error: msgErr } = await db
      .from('bird_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('sent_at', { ascending: true })

    if (msgErr) throw msgErr

    // 3. Get client details if linked
    let client = null
    if (conversation.client_id) {
      const { data: clientData } = await db
        .from('blvd_clients')
        .select('id, boulevard_id, visit_count, total_spend, last_visit_at, account_credit')
        .eq('id', conversation.client_id)
        .single()
      client = clientData
    }

    // 4. Get recent marketing touches for this phone hash (for context)
    const phoneHash = conversation.phone ? hashPhone(conversation.phone) : null
    const { data: recentTouches } = phoneHash ? await db
      .from('marketing_touches')
      .select('id, campaign_slug, cohort, variant, sms_body, status, sent_at, clicked_at, booked_at')
      .eq('phone_hash_v1', phoneHash)
      .order('sent_at', { ascending: false })
      .limit(10) : { data: [] }

    // 5. Mark as read
    if (conversation.unread_count > 0) {
      await db
        .from('bird_conversations')
        .update({ unread_count: 0, updated_at: new Date().toISOString() })
        .eq('id', id)
    }

    return res.json({
      ok: true,
      conversation,
      messages: messages || [],
      client,
      recent_touches: recentTouches || [],
    })
  } catch (err) {
    console.error('[conversations/[id] GET]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
