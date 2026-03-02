// src/pages/api/cron/deliver-gift-cards.js
// Cron: deliver scheduled gift card emails + retry failed deliveries + retry BLVD sync
import { getServiceClient } from '@/lib/supabase'
import { sendGiftCardEmail } from '@/lib/giftCards'
import { syncOneGiftCard } from '@/lib/blvdGiftCards'

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getServiceClient()
  const now = new Date().toISOString()
  const results = { sent: 0, failed: 0, retried: 0, blvdSynced: 0 }

  try {
    // ── 1. Retry BLVD sync for orders that failed to sync ──
    const { data: unsyncedOrders } = await db
      .from('gift_card_orders')
      .select('*')
      .eq('payment_status', 'paid')
      .eq('blvd_synced', false)
      .limit(25)

    for (const order of unsyncedOrders || []) {
      const { data: cards } = await db
        .from('gift_cards')
        .select('*')
        .eq('order_id', order.id)
        .eq('is_bonus', false)

      for (const card of cards || []) {
        const syncResult = await syncOneGiftCard({
          code: card.code,
          amountCents: card.original_amount_cents,
          senderName: order.sender_name,
          senderEmail: order.sender_email,
          recipientName: order.recipient_name,
          recipientEmail: order.recipient_email,
          message: order.personal_message,
          deliverAt: order.deliver_at,
        })

        if (syncResult.ok) {
          await db.from('gift_card_orders').update({
            blvd_gift_card_id: syncResult.giftCardId,
            blvd_synced: true,
            updated_at: now,
          }).eq('id', order.id)
          results.blvdSynced++
        }
      }

      // Also sync bonus cards
      const { data: bonusCards } = await db
        .from('gift_cards')
        .select('*')
        .eq('order_id', order.id)
        .eq('is_bonus', true)

      for (const bc of bonusCards || []) {
        const bonusChoice = order.bonus_recipient_choice || 'recipient'
        const recipientName = bonusChoice === 'sender' ? order.sender_name : order.recipient_name
        const recipientEmail = bonusChoice === 'sender' ? order.sender_email : order.recipient_email

        await syncOneGiftCard({
          code: bc.code,
          amountCents: bc.original_amount_cents,
          senderName: order.sender_name,
          senderEmail: order.sender_email,
          recipientName,
          recipientEmail,
          deliverAt: order.deliver_at,
          isBonus: true,
        })
      }
    }

    // ── 2. Scheduled deliveries that are due (fallback email for non-BLVD orders) ──
    const { data: scheduledOrders } = await db
      .from('gift_card_orders')
      .select('*')
      .eq('payment_status', 'paid')
      .eq('delivery_status', 'scheduled')
      .lte('deliver_at', now)
      .limit(50)

    for (const order of scheduledOrders || []) {
      // If BLVD-synced, Boulevard handles delivery — just update status
      if (order.blvd_synced) {
        await db.from('gift_card_orders').update({
          delivery_status: 'sent',
          delivered_at: now,
          updated_at: now,
        }).eq('id', order.id)
        results.sent++
        continue
      }

      // Fallback: send via our own email system
      const { data: cards } = await db
        .from('gift_cards')
        .select('*')
        .eq('order_id', order.id)

      let allSent = true
      for (const card of cards || []) {
        try {
          await sendGiftCardEmail({ order, card, isBonus: card.is_bonus })
        } catch (err) {
          console.error(`[gift-cards] Email failed for order ${order.id}, card ${card.code}:`, err.message)
          allSent = false
        }
      }

      await db.from('gift_card_orders').update({
        delivery_status: allSent ? 'sent' : 'failed',
        delivered_at: allSent ? now : null,
        updated_at: now,
      }).eq('id', order.id)

      if (allSent) results.sent++
      else results.failed++
    }

    // ── 3. Retry failed email deliveries (non-BLVD, > 15 min since last attempt) ──
    const retryThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { data: failedOrders } = await db
      .from('gift_card_orders')
      .select('*')
      .eq('payment_status', 'paid')
      .eq('delivery_status', 'failed')
      .eq('blvd_synced', false)
      .lte('updated_at', retryThreshold)
      .limit(10)

    for (const order of failedOrders || []) {
      const { data: cards } = await db
        .from('gift_cards')
        .select('*')
        .eq('order_id', order.id)

      let allSent = true
      for (const card of cards || []) {
        try {
          await sendGiftCardEmail({ order, card, isBonus: card.is_bonus })
        } catch (err) {
          console.error(`[gift-cards] Retry email failed for order ${order.id}:`, err.message)
          allSent = false
        }
      }

      if (allSent) {
        await db.from('gift_card_orders').update({
          delivery_status: 'sent',
          delivered_at: now,
          updated_at: now,
        }).eq('id', order.id)
        results.retried++
      } else {
        await db.from('gift_card_orders').update({ updated_at: now }).eq('id', order.id)
      }
    }

    console.log(`[gift-cards] Delivery cron: sent=${results.sent}, failed=${results.failed}, retried=${results.retried}, blvdSynced=${results.blvdSynced}`)
    return res.json({ ok: true, ...results })
  } catch (err) {
    console.error('[gift-cards] Delivery cron error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
