// /api/admin/gift-cards/orders
// GET: list orders, GET with ?id=: order detail, POST: admin actions (resend, refund)
import { getServiceClient } from '@/lib/supabase'
import { sendGiftCardEmail } from '@/lib/giftCards'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    const { id } = req.query

    if (id) {
      // Single order detail with gift cards + transactions
      const { data: order } = await db
        .from('gift_card_orders')
        .select('*')
        .eq('id', id)
        .single()

      if (!order) return res.status(404).json({ error: 'Order not found' })

      const { data: cards } = await db
        .from('gift_cards')
        .select('*, gift_card_transactions(*)')
        .eq('order_id', id)
        .order('created_at', { ascending: true })

      return res.json({ order, cards: cards || [] })
    }

    // List orders
    const page = parseInt(req.query.page) || 0
    const limit = 50
    const { data, count } = await db
      .from('gift_card_orders')
      .select('id, amount_cents, discount_cents, bonus_amount_cents, payment_status, delivery_status, sender_name, recipient_name, recipient_email, promo_code_used, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    return res.json({ orders: data || [], total: count || 0, page, limit })
  }

  if (req.method === 'POST') {
    const { action, orderId, cardId, note } = req.body

    if (action === 'resend_email') {
      const { data: order } = await db.from('gift_card_orders').select('*').eq('id', orderId).single()
      if (!order) return res.status(404).json({ error: 'Order not found' })

      const { data: cards } = await db.from('gift_cards').select('*').eq('order_id', orderId)
      if (!cards?.length) return res.status(400).json({ error: 'No gift cards on this order' })

      for (const card of cards) {
        await sendGiftCardEmail({ order, card, isBonus: card.is_bonus })
      }

      await db.from('gift_card_orders').update({
        delivery_status: 'sent',
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', orderId)

      return res.json({ ok: true, message: `Resent ${cards.length} email(s)` })
    }

    if (action === 'cancel_card') {
      if (!cardId) return res.status(400).json({ error: 'Card ID required' })

      const { data: card } = await db.from('gift_cards').select('*').eq('id', cardId).single()
      if (!card) return res.status(404).json({ error: 'Card not found' })

      await db.from('gift_cards').update({
        status: 'cancelled',
        remaining_amount_cents: 0,
        updated_at: new Date().toISOString(),
      }).eq('id', cardId)

      await db.from('gift_card_transactions').insert({
        gift_card_id: cardId,
        event_type: 'refund',
        amount_cents: -card.remaining_amount_cents,
        balance_after_cents: 0,
        admin_note: note || 'Cancelled by admin',
      })

      return res.json({ ok: true })
    }

    if (action === 'manual_adjust') {
      if (!cardId) return res.status(400).json({ error: 'Card ID required' })
      const adjustCents = parseInt(req.body.amount_cents)
      if (!adjustCents) return res.status(400).json({ error: 'Amount required' })

      const { data: card } = await db.from('gift_cards').select('*').eq('id', cardId).single()
      if (!card) return res.status(404).json({ error: 'Card not found' })

      const newBalance = Math.max(0, card.remaining_amount_cents + adjustCents)

      await db.from('gift_cards').update({
        remaining_amount_cents: newBalance,
        status: newBalance > 0 ? 'active' : 'redeemed',
        updated_at: new Date().toISOString(),
      }).eq('id', cardId)

      await db.from('gift_card_transactions').insert({
        gift_card_id: cardId,
        event_type: 'manual_adjust',
        amount_cents: adjustCents,
        balance_after_cents: newBalance,
        admin_note: note || 'Manual adjustment by admin',
      })

      return res.json({ ok: true, newBalance })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
