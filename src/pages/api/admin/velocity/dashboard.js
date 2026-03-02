// Admin API: Velocity dashboard stats + ledger + top earners
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const db = getServiceClient()
  const { days = '30', page = '1', limit = '50' } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)
  const cutoff = new Date(Date.now() - parseInt(days) * 86400000).toISOString()

  try {
    const [
      { data: balances },
      { data: earnedPeriod },
      { data: expiredPeriod },
      { count: enrolledCount },
      { data: upcomingExpiry },
      { data: recentLedger, count: ledgerTotal },
      { data: topEarners },
      { data: configs },
      { data: promos },
    ] = await Promise.all([
      // Active balances total
      db.from('velocity_balances').select('active_balance_cents'),
      // Earned in period
      db.from('velocity_ledger').select('amount_cents').in('event_type', ['earn', 'earn_package', 'import', 'promo']).gt('amount_cents', 0).gte('created_at', cutoff),
      // Expired in period
      db.from('velocity_ledger').select('amount_cents').eq('event_type', 'expire').gte('created_at', cutoff),
      // Members enrolled
      db.from('velocity_balances').select('member_id', { count: 'exact', head: true }),
      // Upcoming expirations (7 days)
      db.from('velocity_ledger')
        .select('member_id, amount_cents, expires_at')
        .in('event_type', ['earn', 'earn_package', 'import', 'promo'])
        .eq('is_frozen', false)
        .is('expired_at', null)
        .gt('amount_cents', 0)
        .lte('expires_at', new Date(Date.now() + 7 * 86400000).toISOString())
        .gt('expires_at', new Date().toISOString()),
      // Recent ledger
      db.from('velocity_ledger')
        .select('id, member_id, event_type, amount_cents, balance_after_cents, service_name, location_key, admin_note, promotion_id, created_at, blvd_pushed, members!inner(id, blvd_client_id)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1),
      // Top earners
      db.from('velocity_balances')
        .select('member_id, active_balance_cents, total_earned_cents, total_expired_cents, next_expiry_at, has_active_booking, last_earn_at, members!inner(id, blvd_client_id)')
        .gt('active_balance_cents', 0)
        .order('active_balance_cents', { ascending: false })
        .limit(20),
      // Config
      db.from('velocity_config').select('*'),
      // Promotions summary
      db.from('velocity_promotions').select('id, name, amount_cents, trigger_type, total_claimed, is_active, created_at').order('created_at', { ascending: false }),
    ])

    const totalActiveBalance = (balances || []).reduce((sum, b) => sum + b.active_balance_cents, 0)
    const totalEarnedPeriod = (earnedPeriod || []).reduce((sum, e) => sum + e.amount_cents, 0)
    const totalExpiredPeriod = (expiredPeriod || []).reduce((sum, e) => sum + Math.abs(e.amount_cents), 0)

    // Aggregate upcoming expirations by member
    const expiryByMember = {}
    for (const e of upcomingExpiry || []) {
      if (!expiryByMember[e.member_id]) expiryByMember[e.member_id] = 0
      expiryByMember[e.member_id] += e.amount_cents
    }
    const upcomingExpiryTotal = Object.values(expiryByMember).reduce((sum, v) => sum + v, 0)

    return res.json({
      stats: {
        totalActiveBalance,
        totalEarnedPeriod,
        totalExpiredPeriod,
        enrolledCount: enrolledCount || 0,
        upcomingExpiryTotal,
        upcomingExpiryMembers: Object.keys(expiryByMember).length,
      },
      recentLedger: recentLedger || [],
      ledgerTotal: ledgerTotal || 0,
      topEarners: topEarners || [],
      config: configs || [],
      promotions: promos || [],
    })
  } catch (err) {
    console.error('[velocity/dashboard]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
