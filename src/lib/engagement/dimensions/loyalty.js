// src/lib/engagement/dimensions/loyalty.js
// Loyalty (Velocity) engagement score (0-100). Weight: 0.05
// From velocity_balances and velocity_ledger.

/**
 * Compute loyalty scores for a batch of client IDs.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @param {Map<string, string>} clientMemberMap - client_id → member_id
 * @returns {Promise<Record<string, { score: number, detail: object }>>}
 */
export async function computeLoyaltyScores(db, clientIds, clientMemberMap) {
  if (!clientIds.length) return {}

  const memberIds = [...new Set(
    clientIds.map(id => clientMemberMap.get(id)).filter(Boolean)
  )]

  const results = {}

  if (!memberIds.length) {
    for (const id of clientIds) results[id] = { score: 0, detail: { no_member: true } }
    return results
  }

  // 1. Velocity balances
  const { data: balances } = await db
    .from('velocity_balances')
    .select('member_id, total_earned_cents, active_balance_cents, has_active_booking, last_earn_at')
    .in('member_id', memberIds)

  const balanceMap = {}
  for (const b of balances || []) {
    balanceMap[b.member_id] = b
  }

  // 2. Earn events in last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentEarns } = await db
    .from('velocity_ledger')
    .select('member_id')
    .in('member_id', memberIds)
    .like('event_type', 'earn%')
    .gte('created_at', ninetyDaysAgo)

  const earnCounts = {}
  for (const e of recentEarns || []) {
    earnCounts[e.member_id] = (earnCounts[e.member_id] || 0) + 1
  }

  // Build reverse map
  const memberToClient = new Map()
  for (const [clientId, memberId] of clientMemberMap) {
    if (memberId) memberToClient.set(memberId, clientId)
  }

  for (const clientId of clientIds) {
    const memberId = clientMemberMap.get(clientId)
    const balance = memberId ? balanceMap[memberId] : null

    if (!balance) {
      results[clientId] = { score: 0, detail: { no_loyalty_data: true } }
      continue
    }

    const activeCents = balance.active_balance_cents || 0
    const totalEarned = balance.total_earned_cents || 0
    const earns90d = memberId ? (earnCounts[memberId] || 0) : 0

    // Balance score (0-25)
    const balanceScore = activeCents >= 10000 ? 25
      : activeCents >= 5000 ? 20
      : activeCents >= 1000 ? 15
      : activeCents > 0 ? 10
      : 0

    // Earning score (0-25)
    const earningScore = totalEarned >= 50000 ? 25
      : totalEarned >= 20000 ? 20
      : totalEarned >= 5000 ? 15
      : totalEarned >= 1000 ? 10
      : 0

    // Activity score (0-30)
    const activityScore = Math.min(earns90d * 10, 30)

    // Booking bonus (0-20)
    const bookingBonus = balance.has_active_booking ? 20 : 0

    const score = Math.min(balanceScore + earningScore + activityScore + bookingBonus, 100)

    results[clientId] = {
      score,
      detail: {
        active_balance_cents: activeCents,
        total_earned_cents: totalEarned,
        earn_events_90d: earns90d,
        has_active_booking: balance.has_active_booking || false,
        balance_score: balanceScore,
        earning_score: earningScore,
        activity_score: activityScore,
      },
    }
  }

  for (const id of clientIds) {
    if (!results[id]) results[id] = { score: 0, detail: { no_loyalty_data: true } }
  }

  return results
}
