// src/lib/engagement/dimensions/membership.js
// Membership engagement score (0-100). Weight: 0.15

/**
 * Compute membership scores for a batch of client IDs.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @returns {Promise<Record<string, { score: number, detail: object }>>}
 */
export async function computeMembershipScores(db, clientIds) {
  if (!clientIds.length) return {}

  // All memberships for these clients
  const { data: memberships } = await db
    .from('blvd_memberships')
    .select('client_id, status, start_on, cancel_on, unit_price, interval')
    .in('client_id', clientIds)
    .order('start_on', { ascending: false })

  // Group by client, pick best membership
  const clientMemberships = {}
  for (const m of memberships || []) {
    if (!clientMemberships[m.client_id]) clientMemberships[m.client_id] = []
    clientMemberships[m.client_id].push(m)
  }

  const results = {}
  const now = new Date()

  for (const clientId of clientIds) {
    const mList = clientMemberships[clientId]
    if (!mList || mList.length === 0) {
      results[clientId] = { score: 0, detail: { never_member: true } }
      continue
    }

    // Find active membership (prefer ACTIVE, then PAUSED, then most recent cancelled)
    const active = mList.find(m => m.status === 'ACTIVE')
    const paused = mList.find(m => m.status === 'PAUSED')
    const cancelled = mList.find(m => m.status === 'CANCELLED')

    if (active) {
      const startDate = new Date(active.start_on)
      const tenureMonths = Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 30.44))
      const price = active.unit_price || 0 // cents

      const base = 60
      const tenureBonus = tenureMonths >= 24 ? 20 : tenureMonths >= 12 ? 15 : tenureMonths >= 6 ? 10 : tenureMonths >= 3 ? 5 : 0
      const tierBonus = price >= 30000 ? 15 : price >= 20000 ? 12 : price >= 10000 ? 8 : 5

      const score = Math.min(base + tenureBonus + tierBonus, 100)
      results[clientId] = {
        score,
        detail: {
          status: 'active',
          tenure_months: tenureMonths,
          price_cents: price,
          tenure_bonus: tenureBonus,
          tier_bonus: tierBonus,
        },
      }
    } else if (paused) {
      const startDate = new Date(paused.start_on)
      const tenureMonths = Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 30.44))
      const price = paused.unit_price || 0

      const base = 60
      const tenureBonus = tenureMonths >= 24 ? 20 : tenureMonths >= 12 ? 15 : tenureMonths >= 6 ? 10 : tenureMonths >= 3 ? 5 : 0
      const tierBonus = price >= 30000 ? 15 : price >= 20000 ? 12 : price >= 10000 ? 8 : 5
      const pausedPenalty = 10

      const score = Math.max(0, Math.min(base + tenureBonus + tierBonus - pausedPenalty, 100))
      results[clientId] = {
        score,
        detail: {
          status: 'paused',
          tenure_months: tenureMonths,
          price_cents: price,
          paused_penalty: pausedPenalty,
        },
      }
    } else if (cancelled) {
      const cancelDate = cancelled.cancel_on ? new Date(cancelled.cancel_on) : new Date(cancelled.start_on)
      const monthsSinceCancel = Math.floor((now - cancelDate) / (1000 * 60 * 60 * 24 * 30.44))

      const score = monthsSinceCancel <= 3 ? 25 : monthsSinceCancel <= 12 ? 15 : 5
      results[clientId] = {
        score,
        detail: {
          status: 'cancelled',
          months_since_cancel: monthsSinceCancel,
        },
      }
    } else {
      // Other status (PAST_DUE, etc.)
      results[clientId] = { score: 15, detail: { status: mList[0].status } }
    }
  }

  for (const id of clientIds) {
    if (!results[id]) results[id] = { score: 0, detail: { never_member: true } }
  }

  return results
}
