// GET /api/admin/gift-cards/dashboard
// Stats + recent orders for admin dashboard
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const db = getServiceClient()
  const days = parseInt(req.query.days) || 30
  const since = new Date(Date.now() - days * 86400000).toISOString()

  // Stats
  const [
    { count: totalSold },
    { data: revenueData },
    { data: outstandingData },
    { count: activePromos },
    { count: pendingDeliveries },
  ] = await Promise.all([
    db.from('gift_card_orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid').gte('created_at', since),
    db.from('gift_card_orders').select('amount_cents, discount_cents').eq('payment_status', 'paid').gte('created_at', since),
    db.from('gift_cards').select('remaining_amount_cents').eq('status', 'active'),
    db.from('gift_card_promotions').select('*', { count: 'exact', head: true }).eq('is_active', true),
    db.from('gift_card_orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid').eq('delivery_status', 'scheduled'),
  ])

  const totalRevenue = (revenueData || []).reduce((sum, o) => sum + (o.amount_cents - o.discount_cents), 0)
  const outstandingBalance = (outstandingData || []).reduce((sum, c) => sum + c.remaining_amount_cents, 0)

  // Recent orders
  const { data: recentOrders } = await db
    .from('gift_card_orders')
    .select('id, amount_cents, discount_cents, bonus_amount_cents, payment_status, delivery_status, sender_name, sender_email, recipient_name, recipient_email, occasion, promo_code_used, deliver_at, delivered_at, blvd_synced, blvd_gift_card_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  // Promotions
  const { data: promotions } = await db
    .from('gift_card_promotions')
    .select('*')
    .order('sort_order', { ascending: true })

  return res.json({
    stats: {
      totalRevenue,
      totalSold: totalSold || 0,
      outstandingBalance,
      activePromos: activePromos || 0,
      pendingDeliveries: pendingDeliveries || 0,
    },
    recentOrders: recentOrders || [],
    promotions: promotions || [],
    days,
  })
}

export default withAdminAuth(handler)
