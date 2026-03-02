// src/pages/api/admin/conversations/sync.js
// POST: pull recent conversations + messages from Bird's Conversations API
// and backfill local bird_conversations / bird_messages tables.
import { getServiceClient } from '@/lib/supabase'
import { hashPhone } from '@/lib/piiHash'
import { withAdminAuth } from '@/lib/adminAuth'

const WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID
const CHANNEL_ID = process.env.BIRD_CHANNEL_ID
const CONVERSATIONS_KEY = process.env.BIRD_CONVERSATIONS_KEY
const BIRD_BASE = 'https://api.bird.com'

const headers = () => ({
  Authorization: `AccessKey ${CONVERSATIONS_KEY}`,
  'Content-Type': 'application/json',
})

/**
 * Fetch paginated results from Bird API.
 */
async function birdGet(path, params = {}) {
  const url = new URL(`${BIRD_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString(), { headers: headers() })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Bird API ${res.status}: ${text}`)
  }
  return res.json()
}

/**
 * Extract phone number from conversation participants.
 */
function extractPhone(conversation) {
  const participants = conversation.featuredParticipants || []
  for (const p of participants) {
    if (p.identifierValue && /^\+?\d{10,15}$/.test(p.identifierValue.replace(/\D/g, ''))) {
      return p.identifierValue
    }
    if (p.identifier && /^\+?\d{10,15}$/.test(p.identifier.replace(/\D/g, ''))) {
      return p.identifier
    }
  }
  // Try resource field (sometimes contains phone)
  if (conversation.resource && /^\+?\d{10,15}$/.test(conversation.resource.replace(/\D/g, ''))) {
    return conversation.resource
  }
  return null
}

/**
 * Normalize phone to E.164.
 */
function normalizePhone(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (phone.startsWith('+')) return phone
  return `+${digits}`
}

/**
 * Extract message body text from Bird message object.
 */
function extractBody(msg) {
  if (!msg.body) return null
  if (msg.body.text?.text) return msg.body.text.text
  if (typeof msg.body.text === 'string') return msg.body.text
  if (msg.body.html?.html) return msg.body.html.html
  return null
}

/**
 * Determine direction from Bird message.
 */
function getDirection(msg) {
  // Bird uses sender.type to indicate direction
  // 'contact' = inbound from client, 'accessKey'/'agent' = outbound
  const senderType = msg.sender?.type || ''
  if (senderType === 'contact') return 'inbound'
  return 'outbound'
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  if (!WORKSPACE_ID || !CHANNEL_ID || !CONVERSATIONS_KEY) {
    return res.status(500).json({ error: 'Bird API not configured (missing BIRD_CONVERSATIONS_KEY)' })
  }

  const db = getServiceClient()
  const stats = { conversations: 0, messages: 0, skipped: 0, errors: [] }

  try {
    // 1. Fetch recent conversations from Bird (up to 100)
    let pageToken = null
    let allConversations = []
    const maxPages = 3 // Safety limit: 300 conversations max

    for (let page = 0; page < maxPages; page++) {
      const data = await birdGet(
        `/workspaces/${WORKSPACE_ID}/conversations`,
        { limit: 100, pageToken, channelId: CHANNEL_ID }
      )

      const results = data.results || []
      allConversations.push(...results)

      if (!data.nextPageToken || results.length < 100) break
      pageToken = data.nextPageToken
    }

    // 2. Process each conversation
    for (const convo of allConversations) {
      try {
        const rawPhone = extractPhone(convo)
        if (!rawPhone) {
          stats.skipped++
          continue
        }

        const phone = normalizePhone(rawPhone)
        if (!phone) {
          stats.skipped++
          continue
        }

        // Check if conversation exists locally
        const { data: existing } = await db
          .from('bird_conversations')
          .select('id, bird_conversation_id')
          .eq('phone', phone)
          .single()

        let localConvoId

        if (existing) {
          // Update bird_conversation_id if we didn't have it
          if (!existing.bird_conversation_id && convo.id) {
            await db
              .from('bird_conversations')
              .update({ bird_conversation_id: convo.id, updated_at: new Date().toISOString() })
              .eq('id', existing.id)
          }
          localConvoId = existing.id
        } else {
          // Create new conversation
          const phoneHash = hashPhone(phone)
          const { data: client } = phoneHash ? await db
            .from('blvd_clients')
            .select('id, boulevard_id')
            .eq('phone_hash_v1', phoneHash)
            .limit(1)
            .single() : { data: null }

          const { data: newConvo } = await db
            .from('bird_conversations')
            .insert({
              bird_conversation_id: convo.id,
              client_id: client?.id || null,
              phone,
              client_name: null,
              status: 'open',
              unread_count: 0,
              last_message_at: convo.lastMessageIncomingAt || convo.lastMessageOutgoingAt || convo.updatedAt || new Date().toISOString(),
              last_message_preview: convo.lastMessage?.body?.text?.text?.substring(0, 120) || null,
              last_direction: convo.lastMessageIncomingAt > (convo.lastMessageOutgoingAt || '') ? 'inbound' : 'outbound',
            })
            .select('id')
            .single()

          localConvoId = newConvo?.id
          stats.conversations++
        }

        if (!localConvoId) continue

        // 3. Fetch messages for this conversation
        let msgPageToken = null
        let allMessages = []
        const maxMsgPages = 5 // Up to 500 messages per conversation

        for (let p = 0; p < maxMsgPages; p++) {
          const msgData = await birdGet(
            `/workspaces/${WORKSPACE_ID}/conversations/${convo.id}/messages`,
            { limit: 100, pageToken: msgPageToken }
          )

          const msgs = msgData.results || []
          allMessages.push(...msgs)

          if (!msgData.nextPageToken || msgs.length < 100) break
          msgPageToken = msgData.nextPageToken
        }

        // 4. Upsert messages (skip duplicates by bird_message_id)
        for (const msg of allMessages) {
          const birdMsgId = msg.id
          if (!birdMsgId) continue

          // Check if we already have this message
          const { data: existingMsg } = await db
            .from('bird_messages')
            .select('id')
            .eq('bird_message_id', birdMsgId)
            .limit(1)
            .single()

          if (existingMsg) continue // Already stored

          const body = extractBody(msg)
          if (!body) continue // Skip empty/media-only messages

          const direction = getDirection(msg)

          await db.from('bird_messages').insert({
            conversation_id: localConvoId,
            bird_message_id: birdMsgId,
            direction,
            body,
            status: msg.status === 'delivered' ? 'delivered' : msg.status === 'delivery_failed' ? 'failed' : 'sent',
            sender_type: direction === 'inbound' ? 'client' : 'system',
            sender_name: direction === 'inbound' ? null : (msg.sender?.displayName || null),
            sent_at: msg.createdAt || new Date().toISOString(),
            delivered_at: msg.status === 'delivered' ? (msg.updatedAt || msg.createdAt) : null,
          })

          stats.messages++
        }

        // 5. Update conversation metadata from latest messages
        if (allMessages.length > 0) {
          // Sort by createdAt descending to find latest
          const sorted = [...allMessages].sort((a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          )
          const latest = sorted[0]
          const latestBody = extractBody(latest)
          const latestDir = getDirection(latest)
          const preview = latestBody
            ? latestBody.substring(0, 120) + (latestBody.length > 120 ? '...' : '')
            : null

          // Count unread inbound messages (those we didn't have before)
          // Only set unread if this is a new conversation we just created
          const updates = {
            last_message_at: latest.createdAt || new Date().toISOString(),
            last_message_preview: preview,
            last_direction: latestDir,
            updated_at: new Date().toISOString(),
          }

          await db.from('bird_conversations').update(updates).eq('id', localConvoId)
        }
      } catch (convoErr) {
        stats.errors.push(`Conversation ${convo.id}: ${convoErr.message}`)
      }
    }

    return res.json({
      ok: true,
      synced: stats,
      total_bird_conversations: allConversations.length,
    })
  } catch (err) {
    console.error('[conversations/sync]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
