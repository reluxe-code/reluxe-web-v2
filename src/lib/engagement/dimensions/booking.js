// src/lib/engagement/dimensions/booking.js
// Booking engagement score (0-100). Weight: 0.30
// Heaviest dimension — actual service usage is the strongest engagement signal.

/**
 * Compute booking scores for a batch of client IDs.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @returns {Promise<Record<string, { score: number, detail: object }>>}
 */
export async function computeBookingScores(db, clientIds) {
  if (!clientIds.length) return {}

  // 1. Client visit summary data
  const { data: visits } = await db
    .from('client_visit_summary')
    .select('client_id, total_visits, total_spend, days_since_last_visit, avg_days_between_visits')
    .in('client_id', clientIds)

  // 2. No-shows and cancellations
  const { data: reliability } = await db
    .from('blvd_appointments')
    .select('client_id, status')
    .in('client_id', clientIds)
    .in('status', ['no_show', 'cancelled'])

  const reliabilityMap = {}
  for (const row of reliability || []) {
    if (!reliabilityMap[row.client_id]) reliabilityMap[row.client_id] = { no_shows: 0, cancellations: 0 }
    if (row.status === 'no_show') reliabilityMap[row.client_id].no_shows++
    if (row.status === 'cancelled') reliabilityMap[row.client_id].cancellations++
  }

  // 3. Future appointments (rebook bonus)
  const { data: futureAppts } = await db
    .from('blvd_appointments')
    .select('client_id')
    .in('client_id', clientIds)
    .in('status', ['booked', 'confirmed'])
    .gte('start_at', new Date().toISOString())

  const hasRebook = new Set((futureAppts || []).map(r => r.client_id))

  // 4. Compute scores
  const results = {}
  for (const row of visits || []) {
    const v = row.total_visits || 0
    const spend = parseFloat(row.total_spend) || 0
    const daysSince = row.days_since_last_visit
    const avgDays = row.avg_days_between_visits
    const rel = reliabilityMap[row.client_id] || { no_shows: 0, cancellations: 0 }

    const frequencyScore = v >= 20 ? 30 : v >= 12 ? 25 : v >= 6 ? 20 : v >= 3 ? 12 : v >= 1 ? 5 : 0
    const spendScore = spend >= 10000 ? 25 : spend >= 5000 ? 22 : spend >= 2000 ? 18 : spend >= 500 ? 10 : spend >= 100 ? 5 : 0
    const regularityScore = avgDays == null ? 0 : avgDays <= 30 ? 20 : avgDays <= 60 ? 15 : avgDays <= 90 ? 10 : avgDays <= 180 ? 5 : 2
    const recencyScore = daysSince == null ? 0 : daysSince <= 14 ? 15 : daysSince <= 30 ? 13 : daysSince <= 60 ? 10 : daysSince <= 90 ? 7 : daysSince <= 180 ? 4 : 1
    const reliabilityPenalty = Math.min((rel.no_shows * 5) + (rel.cancellations * 2), 15)
    const rebookBonus = hasRebook.has(row.client_id) ? 10 : 0

    const score = Math.max(0, Math.min(
      frequencyScore + spendScore + regularityScore + recencyScore + rebookBonus - reliabilityPenalty,
      100
    ))

    results[row.client_id] = {
      score,
      detail: {
        frequency: frequencyScore,
        spend: spendScore,
        regularity: regularityScore,
        recency: recencyScore,
        rebook: rebookBonus,
        reliability_penalty: reliabilityPenalty,
        visits: v,
        total_spend: spend,
        days_since_last: daysSince,
      },
    }
  }

  // Fill missing clients with 0
  for (const id of clientIds) {
    if (!results[id]) results[id] = { score: 0, detail: { visits: 0 } }
  }

  return results
}
