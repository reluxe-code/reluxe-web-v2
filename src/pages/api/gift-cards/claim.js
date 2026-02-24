// POST /api/gift-cards/claim
// Authenticated member claims a gift card by code or claim token
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const db = getServiceClient()

  // Verify member
  const { data: { user } } = await db.auth.getUser(token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  const { data: member } = await db
    .from('members')
    .select('id, first_name, last_name, email, blvd_client_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return res.status(404).json({ error: 'Member not found' })

  const { code, claimToken } = req.body || {}

  if (!code && !claimToken) {
    return res.status(400).json({ error: 'Gift card code or claim token required' })
  }

  // Find the gift card
  let query = db.from('gift_cards').select('*, gift_card_orders(*)')
  if (claimToken) {
    query = query.eq('claim_token', claimToken)
  } else {
    query = query.eq('code', code.trim().toUpperCase().replace(/\s/g, ''))
  }

  const { data: card } = await query.maybeSingle()

  if (!card) return res.status(404).json({ error: 'Gift card not found' })
  if (card.status !== 'active') return res.status(400).json({ error: `Gift card is ${card.status}` })
  if (card.remaining_amount_cents <= 0) return res.status(400).json({ error: 'Gift card has no remaining balance' })

  // Check if already claimed by someone else
  if (card.owner_member_id && card.owner_member_id !== member.id) {
    return res.status(400).json({ error: 'This gift card has already been claimed by another account' })
  }

  // Claim: link to member
  await db.from('gift_cards').update({
    owner_member_id: member.id,
    claimed_at: card.claimed_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', card.id)

  // Also link recipient on the order
  if (card.gift_card_orders && !card.gift_card_orders.recipient_member_id) {
    await db.from('gift_card_orders').update({
      recipient_member_id: member.id,
      updated_at: new Date().toISOString(),
    }).eq('id', card.order_id)
  }

  return res.json({
    ok: true,
    giftCard: {
      id: card.id,
      code: card.code,
      originalAmount: card.original_amount_cents,
      remainingAmount: card.remaining_amount_cents,
      expiresAt: card.expires_at,
      isBonus: card.is_bonus,
    },
  })
}
