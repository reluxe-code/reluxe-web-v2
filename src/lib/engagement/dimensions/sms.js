// src/lib/engagement/dimensions/sms.js
// SMS engagement score (0-100). Weight: 0.20
// Click/conversion behavior from marketing_touches + bird_engagement_events.

/**
 * Compute SMS engagement scores for a batch of client IDs.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @param {Map<string, string>} clientPhoneMap - client_id → phone
 * @param {Set<string>} unsubscribedPhones - phones that have opted out
 * @returns {Promise<Record<string, { score: number, detail: object }>>}
 */
export async function computeSmsScores(db, clientIds, clientPhoneMap, unsubscribedPhones) {
  if (!clientIds.length) return {}

  const phones = [...new Set(
    clientIds.map(id => clientPhoneMap.get(id)).filter(Boolean)
  )]

  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()

  // 1. Marketing touch stats (last 180 days)
  const { data: touches } = await db
    .from('marketing_touches')
    .select('phone, status, clicked_at')
    .in('phone', phones)
    .gte('sent_at', sixMonthsAgo)

  // 2. Inbound reply count from Bird events
  const { data: replies } = await db
    .from('bird_engagement_events')
    .select('phone')
    .in('phone', phones)
    .eq('event_type', 'inbound_reply')
    .eq('channel', 'sms')
    .gte('created_at', sixMonthsAgo)

  // Aggregate by phone
  const phoneStats = {}
  for (const t of touches || []) {
    if (!phoneStats[t.phone]) phoneStats[t.phone] = { sent: 0, delivered: 0, clicked: 0, booked: 0, last_click: null }
    phoneStats[t.phone].sent++
    if (['delivered', 'clicked', 'booked'].includes(t.status)) phoneStats[t.phone].delivered++
    if (['clicked', 'booked'].includes(t.status)) {
      phoneStats[t.phone].clicked++
      if (t.clicked_at && (!phoneStats[t.phone].last_click || t.clicked_at > phoneStats[t.phone].last_click)) {
        phoneStats[t.phone].last_click = t.clicked_at
      }
    }
    if (t.status === 'booked') phoneStats[t.phone].booked++
  }

  const replyCount = {}
  for (const r of replies || []) {
    replyCount[r.phone] = (replyCount[r.phone] || 0) + 1
  }

  // Compute per client
  const results = {}
  for (const clientId of clientIds) {
    const phone = clientPhoneMap.get(clientId)

    // If opted out, score = 0
    if (phone && unsubscribedPhones.has(phone)) {
      results[clientId] = { score: 0, detail: { opted_out: true } }
      continue
    }

    const stats = phone ? phoneStats[phone] : null
    if (!stats || stats.sent === 0) {
      // No SMS history — neutral score
      results[clientId] = { score: 0, detail: { no_data: true } }
      continue
    }

    const deliveryRate = stats.delivered / stats.sent
    const clickRate = stats.delivered > 0 ? stats.clicked / stats.delivered : 0
    const conversionRate = stats.clicked > 0 ? stats.booked / stats.clicked : 0
    const replyBonus = Math.min((replyCount[phone] || 0) * 5, 15)

    const engagementRaw = (deliveryRate * 15) + (clickRate * 35) + (conversionRate * 35) + replyBonus

    // Recency multiplier based on last click
    let recencyMultiplier = 0.2
    if (stats.last_click) {
      const daysSinceClick = Math.floor((Date.now() - new Date(stats.last_click).getTime()) / (1000 * 60 * 60 * 24))
      recencyMultiplier = daysSinceClick <= 7 ? 1.0
        : daysSinceClick <= 30 ? 0.85
        : daysSinceClick <= 90 ? 0.65
        : daysSinceClick <= 180 ? 0.4
        : 0.2
    } else {
      recencyMultiplier = 0.3 // Received SMS but never clicked
    }

    const score = Math.round(Math.min(engagementRaw * recencyMultiplier, 100))

    results[clientId] = {
      score,
      detail: {
        sent: stats.sent,
        delivered: stats.delivered,
        clicked: stats.clicked,
        booked: stats.booked,
        replies: replyCount[phone] || 0,
        delivery_rate: Math.round(deliveryRate * 100),
        click_rate: Math.round(clickRate * 100),
        conversion_rate: Math.round(conversionRate * 100),
        recency_multiplier: recencyMultiplier,
      },
    }
  }

  // Fill missing
  for (const id of clientIds) {
    if (!results[id]) results[id] = { score: 0, detail: { no_data: true } }
  }

  return results
}
