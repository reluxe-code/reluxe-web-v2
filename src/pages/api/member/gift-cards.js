// GET /api/member/gift-cards
// Returns authenticated member's gift cards (sent and received)
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const db = getServiceClient()

  const { data: { user } } = await db.auth.getUser(token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  const { data: member } = await db
    .from('members')
    .select('id, email')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return res.status(404).json({ error: 'Member not found' })

  // Gift cards owned by this member
  const { data: owned } = await db
    .from('gift_cards')
    .select('id, code, original_amount_cents, remaining_amount_cents, status, expires_at, is_bonus, claimed_at, created_at, gift_card_orders(sender_name, occasion, personal_message)')
    .eq('owner_member_id', member.id)
    .order('created_at', { ascending: false })

  // Gift cards sent by this member
  const { data: sentOrders } = await db
    .from('gift_card_orders')
    .select('id, amount_cents, recipient_name, recipient_email, occasion, delivery_status, created_at, gift_cards(code, original_amount_cents, remaining_amount_cents, status, is_bonus)')
    .eq('sender_member_id', member.id)
    .order('created_at', { ascending: false })

  return res.json({
    received: owned || [],
    sent: sentOrders || [],
  })
}
