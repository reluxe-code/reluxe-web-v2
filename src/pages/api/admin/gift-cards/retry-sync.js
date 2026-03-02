// POST /api/admin/gift-cards/retry-sync
// Admin: manually retry Boulevard sync for a gift card order
import { getServiceClient } from '@/lib/supabase'
import { syncOneGiftCard } from '@/lib/blvdGiftCards'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { orderId } = req.body || {}
  if (!orderId) return res.status(400).json({ error: 'orderId required' })

  const db = getServiceClient()

  const { data: order } = await db
    .from('gift_card_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (order.payment_status !== 'paid') return res.status(400).json({ error: 'Order not paid' })

  const { data: cards } = await db
    .from('gift_cards')
    .select('*')
    .eq('order_id', orderId)

  if (!cards?.length) return res.status(404).json({ error: 'No gift cards found for this order' })

  let synced = 0
  let lastGiftCardId = null

  for (const card of cards) {
    const isBonus = card.is_bonus
    const bonusChoice = order.bonus_recipient_choice || 'recipient'

    const recipientName = isBonus && bonusChoice === 'sender' ? order.sender_name : order.recipient_name
    const recipientEmail = isBonus && bonusChoice === 'sender' ? order.sender_email : order.recipient_email

    const result = await syncOneGiftCard({
      code: card.code,
      amountCents: card.original_amount_cents,
      senderName: order.sender_name,
      senderEmail: order.sender_email,
      recipientName,
      recipientEmail,
      message: !isBonus ? order.personal_message : null,
      deliverAt: order.deliver_at,
      isBonus,
    })

    if (result.ok) {
      synced++
      if (!isBonus) lastGiftCardId = result.giftCardId
    }
  }

  if (synced > 0) {
    await db.from('gift_card_orders').update({
      blvd_synced: true,
      blvd_gift_card_id: lastGiftCardId,
      updated_at: new Date().toISOString(),
    }).eq('id', orderId)
  }

  return res.json({
    ok: synced > 0,
    synced,
    total: cards.length,
    error: synced === 0 ? 'All cards failed to sync' : null,
  })
}

export default withAdminAuth(handler)
