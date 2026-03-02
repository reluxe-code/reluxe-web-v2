// src/pages/api/admin/conversations/reply.js
// POST: send an admin reply in a conversation via Bird SMS.
import { getServiceClient } from '@/lib/supabase'
import { sendSMS } from '@/lib/bird'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()
  const { conversation_id, body } = req.body || {}

  if (!conversation_id || !body?.trim()) {
    return res.status(400).json({ error: 'conversation_id and body required' })
  }

  try {
    // 1. Get conversation
    const { data: conversation, error: convoErr } = await db
      .from('bird_conversations')
      .select('id, phone, client_id')
      .eq('id', conversation_id)
      .single()

    if (convoErr || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    // 2. Send SMS via Bird
    const smsResult = await sendSMS(conversation.phone, body.trim())

    if (!smsResult.ok) {
      return res.status(500).json({ error: `SMS send failed: ${smsResult.error}` })
    }

    // 3. Store message in thread
    const { data: message } = await db
      .from('bird_messages')
      .insert({
        conversation_id: conversation.id,
        bird_message_id: smsResult.messageId || null,
        direction: 'outbound',
        body: body.trim(),
        status: 'sent',
        sender_type: 'admin',
        sender_name: 'RELUXE Admin',
        sent_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    // 4. Update conversation
    const preview = body.trim().substring(0, 120) + (body.trim().length > 120 ? '...' : '')
    await db
      .from('bird_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: preview,
        last_direction: 'outbound',
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)

    return res.json({ ok: true, message })
  } catch (err) {
    console.error('[conversations/reply POST]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
