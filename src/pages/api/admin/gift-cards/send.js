// POST /api/admin/gift-cards/send
// Admin: create a gift card for an in-office purchase (no Square payment).
// Creates in our DB + syncs to Boulevard + triggers email fulfillment.
import { getServiceClient } from '@/lib/supabase'
import {
  generateGiftCardCode,
  generateClaimToken,
  resolveRecipientByEmail,
} from '@/lib/giftCards'
import { syncOneGiftCard } from '@/lib/blvdGiftCards'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const {
    amountCents,
    recipientName,
    recipientEmail,
    senderName,
    message,
    deliverAt,
    paymentNote,
  } = req.body || {}

  const isSandbox = (process.env.SQUARE_APPLICATION_ID || '').startsWith('sandbox-')
  const minAmount = isSandbox ? 25 : 2500
  if (!amountCents || amountCents < minAmount || amountCents > 200000) {
    return res.status(400).json({ error: isSandbox ? 'Amount must be between $0.25 and $2,000' : 'Amount must be between $25 and $2,000' })
  }
  if (!recipientName || !recipientEmail) {
    return res.status(400).json({ error: 'Recipient name and email required' })
  }

  const db = getServiceClient()
  const effectiveSender = (senderName || 'RELUXE Med Spa').trim()
  const senderEmail = 'hello@reluxemedspa.com'

  // Resolve recipient member
  const recipientMember = await resolveRecipientByEmail(db, recipientEmail)

  // Create order (payment = in_office)
  const { data: order, error: orderErr } = await db.from('gift_card_orders').insert({
    amount_cents: amountCents,
    discount_cents: 0,
    payment_status: 'paid',
    sender_name: effectiveSender,
    sender_email: senderEmail,
    recipient_name: recipientName.trim(),
    recipient_email: recipientEmail.trim().toLowerCase(),
    personal_message: message?.trim()?.slice(0, 200) || null,
    deliver_at: deliverAt || null,
    delivery_status: deliverAt ? 'scheduled' : 'pending',
    bonus_amount_cents: 0,
  }).select('id').single()

  if (orderErr) {
    console.error('[gift-cards] Admin send: order creation failed:', orderErr.message)
    return res.status(500).json({ error: 'Failed to create order' })
  }

  // Create the gift card
  const code = generateGiftCardCode()
  const claimToken = generateClaimToken()

  const { data: card, error: cardErr } = await db.from('gift_cards').insert({
    order_id: order.id,
    code,
    original_amount_cents: amountCents,
    remaining_amount_cents: amountCents,
    owner_member_id: recipientMember?.id || null,
    claim_token: claimToken,
    is_bonus: false,
  }).select('*').single()

  if (cardErr) {
    console.error('[gift-cards] Admin send: card creation failed:', cardErr.message)
    return res.status(500).json({ error: 'Failed to create gift card' })
  }

  // Transaction record
  await db.from('gift_card_transactions').insert({
    gift_card_id: card.id,
    event_type: 'purchase',
    amount_cents: amountCents,
    balance_after_cents: amountCents,
    admin_note: paymentNote ? `In-office: ${paymentNote}` : 'In-office purchase',
  })

  // Boulevard sync (creates card + email fulfillment)
  let blvdSynced = false
  try {
    const syncResult = await syncOneGiftCard({
      code,
      amountCents,
      senderName: effectiveSender,
      senderEmail,
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim().toLowerCase(),
      message: message?.trim() || null,
      deliverAt: deliverAt || null,
    })

    if (syncResult.ok) {
      blvdSynced = true
      await db.from('gift_card_orders').update({
        blvd_gift_card_id: syncResult.giftCardId,
        blvd_synced: true,
        delivery_status: deliverAt ? 'scheduled' : 'sent',
        delivered_at: deliverAt ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', order.id)
    }
  } catch (err) {
    console.error('[gift-cards] Admin send: BLVD sync failed:', err.message)
  }

  return res.json({
    ok: true,
    orderId: order.id,
    code: card.code,
    amountCents: card.original_amount_cents,
    blvdSynced,
  })
}

export default withAdminAuth(handler)
