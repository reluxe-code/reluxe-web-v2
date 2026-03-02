// src/pages/api/webhooks/bird.js
// POST: receive Bird webhook events (SMS/email delivery, clicks, opt-outs, conversations).
// Public endpoint — authenticated via Bird webhook signing key.
import { getServiceClient } from '@/lib/supabase'
import crypto from 'crypto'
import { safeError } from '@/lib/logSanitizer'

export const config = { maxDuration: 30 }

const WEBHOOK_SECRET = process.env.BIRD_WEBHOOK_SECRET

/**
 * Map Bird event types to our normalized event_type enum.
 */
function normalizeEventType(birdEvent) {
  // Channels API status events
  const statusMap = {
    accepted: 'accepted',
    delivered: 'delivered',
    delivery_failed: 'delivery_failed',
    sending_failed: 'delivery_failed',
  }

  // Channels API interaction events
  const interactionMap = {
    opened: 'opened',
    clicked: 'clicked',
    'reported-as-spam': 'spam_complaint',
    'unsubscribe-request': 'unsubscribe_request',
    'subscribe-consent': 'subscribe_consent',
  }

  // SparkPost / Email API events
  const emailMap = {
    delivery: 'delivered',
    bounce: 'bounced',
    out_of_band: 'bounced',
    open: 'opened',
    initial_open: 'opened',
    click: 'clicked',
    initial_click: 'clicked',
    spam_complaint: 'spam_complaint',
  }

  // Check interaction type first (e.g. { interactionType: 'clicked' })
  if (birdEvent.interactionType) {
    return interactionMap[birdEvent.interactionType] || null
  }

  // Check message status (e.g. { status: 'delivered' })
  if (birdEvent.status) {
    return statusMap[birdEvent.status] || null
  }

  // Check email event type (SparkPost format)
  if (birdEvent.type) {
    return emailMap[birdEvent.type] || null
  }

  // Inbound message = reply
  if (birdEvent.direction === 'inbound') {
    return 'inbound_reply'
  }

  return null
}

/**
 * Detect channel from Bird event payload.
 */
function detectChannel(event) {
  if (event.channelType === 'email' || event.platformId === 'email') return 'email'
  if (event.channelType === 'sms' || event.platformId === 'sms') return 'sms'
  // Default to SMS for our use case
  return 'sms'
}

/**
 * Extract phone/email/contactId from Bird event.
 */
function extractIdentifiers(event) {
  // For inbound messages, the sender is in `sender` or `from`
  const phone = event.sender?.identifierValue
    || event.receiver?.identifierValue
    || event.to?.identifierValue
    || event.from?.identifierValue
    || event.receiver?.contacts?.[0]?.identifierValue
    || event.identifierValue
    || null

  const email = event.sender?.email
    || event.receiver?.email
    || event.to?.email
    || event.from?.email
    || null

  const contactId = event.sender?.contactId
    || event.receiver?.contactId
    || event.contactId
    || null

  return { phone, email, contactId }
}

/**
 * Extract message body from Bird event.
 */
function extractMessageBody(event) {
  return event.body?.text?.text
    || event.body?.text
    || event.body?.html?.html
    || event.content?.text
    || event.message?.body?.text?.text
    || event.message?.text
    || (typeof event.body === 'string' ? event.body : null)
    || null
}

/**
 * Verify Bird webhook signature (HMAC-SHA256).
 */
function verifySignature(body, signature) {
  if (!WEBHOOK_SECRET) return false // Fail closed: reject all if secret not configured
  if (!signature) return false

  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

/**
 * Upsert a conversation thread for a phone number.
 */
async function upsertConversation(db, { phone, direction, messageBody, birdConversationId }) {
  if (!phone) return null

  // Check if conversation exists
  const { data: existing } = await db
    .from('bird_conversations')
    .select('id, unread_count, client_id')
    .eq('phone', phone)
    .single()

  const preview = messageBody
    ? messageBody.substring(0, 120) + (messageBody.length > 120 ? '...' : '')
    : null

  if (existing) {
    const updates = {
      last_message_at: new Date().toISOString(),
      last_message_preview: preview,
      last_direction: direction,
      updated_at: new Date().toISOString(),
    }

    if (birdConversationId) updates.bird_conversation_id = birdConversationId

    // Increment unread count for inbound messages
    if (direction === 'inbound') {
      updates.unread_count = (existing.unread_count || 0) + 1
      updates.status = 'open'
    }

    await db.from('bird_conversations').update(updates).eq('id', existing.id)
    return existing.id
  }

  // Create new conversation — look up client by phone
  const { data: client } = await db
    .from('blvd_clients')
    .select('id, name')
    .eq('phone', phone)
    .limit(1)
    .single()

  const { data: newConvo } = await db
    .from('bird_conversations')
    .insert({
      bird_conversation_id: birdConversationId || null,
      client_id: client?.id || null,
      phone,
      client_name: client?.name || null,
      status: 'open',
      unread_count: direction === 'inbound' ? 1 : 0,
      last_message_at: new Date().toISOString(),
      last_message_preview: preview,
      last_direction: direction,
    })
    .select('id')
    .single()

  return newConvo?.id || null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()
  const rawBody = JSON.stringify(req.body)

  // 1. Verify webhook signature (fail closed — rejects all if secret unset)
  const signature = req.headers['x-bird-signature'] || req.headers['x-messagesystems-batch-signature']
  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  try {
    // 2. Handle batch payloads (Bird may send arrays)
    const events = Array.isArray(req.body) ? req.body : [req.body]

    for (const event of events) {
      // 3. Log raw payload
      const eventType = event.interactionType || event.status || event.type || event.event || 'unknown'
      await db.from('bird_webhook_log').insert({
        event_type: eventType,
        payload: event,
      })

      // 4. Handle conversation events (conversation.created, conversation.updated, etc.)
      if (eventType.startsWith('conversation.')) {
        // Conversation events — just log, no further processing needed
        // Actual message storage happens via sms.inbound/sms.outbound
        continue
      }

      // 5. Normalize and insert structured engagement event
      const normalizedType = normalizeEventType(event)
      if (!normalizedType) continue

      const channel = detectChannel(event)
      const { phone, email, contactId } = extractIdentifiers(event)
      const birdMessageId = event.messageId || event.id || null
      const messageBody = extractMessageBody(event)

      // Correlate to marketing_touches via bird_message_id
      let marketingTouchId = null
      let campaignSlug = null
      if (birdMessageId) {
        const { data: touch } = await db
          .from('marketing_touches')
          .select('id, campaign_slug')
          .eq('bird_message_id', birdMessageId)
          .limit(1)
          .single()
        marketingTouchId = touch?.id || null
        campaignSlug = touch?.campaign_slug || null
      }

      // Fallback: correlate by phone + recent time window (5 min)
      if (!marketingTouchId && phone) {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
        const { data: touch } = await db
          .from('marketing_touches')
          .select('id, campaign_slug')
          .eq('phone', phone)
          .gte('sent_at', fiveMinAgo)
          .order('sent_at', { ascending: false })
          .limit(1)
          .single()
        marketingTouchId = touch?.id || null
        campaignSlug = touch?.campaign_slug || null
      }

      // For inbound replies, find the most recent outbound message to link
      if (normalizedType === 'inbound_reply' && !marketingTouchId && phone) {
        const { data: recentTouch } = await db
          .from('marketing_touches')
          .select('id, campaign_slug')
          .eq('phone', phone)
          .order('sent_at', { ascending: false })
          .limit(1)
          .single()
        marketingTouchId = recentTouch?.id || null
        campaignSlug = recentTouch?.campaign_slug || null
      }

      // Insert structured engagement event
      await db.from('bird_engagement_events').insert({
        bird_message_id: birdMessageId,
        bird_contact_id: contactId,
        channel,
        event_type: normalizedType,
        phone,
        email,
        metadata: {
          raw_type: eventType,
          ...(event.failureCode ? { failure_code: event.failureCode } : {}),
          ...(event.url ? { url: event.url } : {}),
          ...(messageBody ? { body: messageBody } : {}),
        },
        marketing_touch_id: marketingTouchId,
      })

      // 6. Conversation & message storage (SMS only)
      if (channel === 'sms' && phone) {
        const direction = normalizedType === 'inbound_reply' ? 'inbound' : 'outbound'

        // Only store messages for inbound replies and outbound sends (not status updates)
        if (normalizedType === 'inbound_reply' || (normalizedType === 'accepted' && messageBody)) {
          const conversationId = await upsertConversation(db, {
            phone,
            direction,
            messageBody,
            birdConversationId: event.conversationId || null,
          })

          if (conversationId && messageBody) {
            await db.from('bird_messages').insert({
              conversation_id: conversationId,
              bird_message_id: birdMessageId,
              direction,
              body: messageBody,
              marketing_touch_id: marketingTouchId,
              campaign_slug: campaignSlug,
              status: 'delivered',
              sender_type: direction === 'inbound' ? 'client' : 'system',
              sent_at: new Date().toISOString(),
            })
          }
        }

        // Update message delivery status
        if (normalizedType === 'delivered' && birdMessageId) {
          await db
            .from('bird_messages')
            .update({ status: 'delivered', delivered_at: new Date().toISOString() })
            .eq('bird_message_id', birdMessageId)
        }
      }

      // 7. Side effects — update marketing_touches
      if (marketingTouchId) {
        if (normalizedType === 'delivered') {
          await db
            .from('marketing_touches')
            .update({ status: 'delivered', delivered_at: new Date().toISOString() })
            .eq('id', marketingTouchId)
            .in('status', ['sent'])
        }

        if (normalizedType === 'clicked') {
          await db
            .from('marketing_touches')
            .update({ status: 'clicked', clicked_at: new Date().toISOString() })
            .eq('id', marketingTouchId)
            .in('status', ['sent', 'delivered'])
        }
      }

      // 8. Opt-out handling
      if (normalizedType === 'unsubscribe_request' || normalizedType === 'spam_complaint') {
        if (phone) {
          const { data: client } = await db
            .from('blvd_clients')
            .select('id')
            .eq('phone', phone)
            .limit(1)
            .single()

          await db.from('client_channel_status').upsert({
            client_id: client?.id || null,
            phone,
            channel,
            status: 'unsubscribed',
            status_changed_at: new Date().toISOString(),
            source: 'bird_webhook',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'phone,channel', ignoreDuplicates: false })
        }
      }

      // Opt-in handling
      if (normalizedType === 'subscribe_consent') {
        if (phone) {
          const { data: client } = await db
            .from('blvd_clients')
            .select('id')
            .eq('phone', phone)
            .limit(1)
            .single()

          await db.from('client_channel_status').upsert({
            client_id: client?.id || null,
            phone,
            channel,
            status: 'subscribed',
            status_changed_at: new Date().toISOString(),
            source: 'bird_webhook',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'phone,channel', ignoreDuplicates: false })
        }
      }
    }

    return res.json({ ok: true, processed: events.length })
  } catch (err) {
    safeError('[webhooks/bird]', err.message)
    // Always return 200 to prevent Bird retries for processing errors
    return res.status(200).json({ ok: false, error: err.message })
  }
}
