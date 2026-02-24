// Member API: Velocity rewards status
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'
import { formatCents } from '@/lib/velocity'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })

  const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' })

  const db = getServiceClient()

  const { data: member } = await db
    .from('members')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return res.json({ velocity: null })

  const [{ data: balance }, { data: ledger }] = await Promise.all([
    db.from('velocity_balances')
      .select('*')
      .eq('member_id', member.id)
      .maybeSingle(),
    db.from('velocity_ledger')
      .select('id, event_type, amount_cents, balance_after_cents, service_name, promotion_id, expires_at, is_frozen, created_at')
      .eq('member_id', member.id)
      .in('event_type', ['earn', 'earn_package', 'import', 'promo', 'expire', 'reactivate', 'bonus_rebook'])
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (!balance) return res.json({ velocity: null })

  // Get promo names for promo events
  const promoIds = (ledger || []).filter((l) => l.promotion_id).map((l) => l.promotion_id)
  let promoMap = {}
  if (promoIds.length) {
    const { data: promos } = await db.from('velocity_promotions').select('id, name, description').in('id', promoIds)
    for (const p of promos || []) promoMap[p.id] = p
  }

  return res.json({
    velocity: {
      active_balance_cents: balance.active_balance_cents,
      formatted: formatCents(balance.active_balance_cents),
      total_earned_cents: balance.total_earned_cents,
      total_expired_cents: balance.total_expired_cents,
      next_expiry_at: balance.next_expiry_at,
      next_expiry_amount_cents: balance.next_expiry_amount_cents,
      is_frozen: balance.has_active_booking,
      last_earn_at: balance.last_earn_at,
      recent_activity: (ledger || []).map((l) => ({
        id: l.id,
        type: l.event_type,
        amount_cents: l.amount_cents,
        balance_after_cents: l.balance_after_cents,
        service_name: l.service_name,
        promo_name: l.promotion_id ? promoMap[l.promotion_id]?.name : null,
        promo_description: l.promotion_id ? promoMap[l.promotion_id]?.description : null,
        expires_at: l.expires_at,
        is_frozen: l.is_frozen,
        date: l.created_at,
      })),
    },
  })
}
