// src/lib/engagement/dimensions/email.js
// Email engagement score (0-100). Weight: 0.05
// Initially low weight — grows when email campaigns launch.
// Uses bird_engagement_events (channel='email').

/**
 * Compute email engagement scores for a batch of client IDs.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @param {Map<string, string>} clientEmailMap - client_id → email
 * @param {Set<string>} unsubscribedEmails - emails that have opted out
 * @returns {Promise<Record<string, { score: number, detail: object }>>}
 */
export async function computeEmailScores(db, clientIds, clientEmailMap, unsubscribedEmails) {
  if (!clientIds.length) return {}

  const emails = [...new Set(
    clientIds.map(id => clientEmailMap.get(id)).filter(Boolean)
  )]

  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()

  // Email engagement events from Bird
  const { data: events } = await db
    .from('bird_engagement_events')
    .select('email, event_type, created_at')
    .in('email', emails)
    .eq('channel', 'email')
    .gte('created_at', sixMonthsAgo)

  // Aggregate by email
  const emailStats = {}
  for (const e of events || []) {
    if (!emailStats[e.email]) emailStats[e.email] = { sent: 0, opened: 0, clicked: 0, bounced: false, last_open: null }
    if (e.event_type === 'delivered') emailStats[e.email].sent++
    if (e.event_type === 'opened') {
      emailStats[e.email].opened++
      if (!emailStats[e.email].last_open || e.created_at > emailStats[e.email].last_open) {
        emailStats[e.email].last_open = e.created_at
      }
    }
    if (e.event_type === 'clicked') emailStats[e.email].clicked++
    if (e.event_type === 'bounced') emailStats[e.email].bounced = true
  }

  const results = {}
  for (const clientId of clientIds) {
    const email = clientEmailMap.get(clientId)

    if (email && (unsubscribedEmails.has(email))) {
      results[clientId] = { score: 0, detail: { opted_out: true } }
      continue
    }

    const stats = email ? emailStats[email] : null
    if (!stats) {
      // No email engagement data — neutral score
      results[clientId] = { score: 50, detail: { no_data: true } }
      continue
    }

    if (stats.bounced) {
      results[clientId] = { score: 0, detail: { bounced: true } }
      continue
    }

    const openRate = stats.sent > 0 ? stats.opened / stats.sent : 0
    const clickRate = stats.opened > 0 ? stats.clicked / stats.opened : 0

    const engagementRaw = (openRate * 40) + (clickRate * 60)

    let recencyMultiplier = 0.2
    if (stats.last_open) {
      const daysSinceOpen = Math.floor((Date.now() - new Date(stats.last_open).getTime()) / (1000 * 60 * 60 * 24))
      recencyMultiplier = daysSinceOpen <= 7 ? 1.0
        : daysSinceOpen <= 30 ? 0.85
        : daysSinceOpen <= 90 ? 0.65
        : daysSinceOpen <= 180 ? 0.4
        : 0.2
    }

    const score = Math.round(Math.min(engagementRaw * recencyMultiplier, 100))

    results[clientId] = {
      score,
      detail: {
        sent: stats.sent,
        opened: stats.opened,
        clicked: stats.clicked,
        open_rate: Math.round(openRate * 100),
        click_rate: Math.round(clickRate * 100),
        recency_multiplier: recencyMultiplier,
      },
    }
  }

  for (const id of clientIds) {
    if (!results[id]) results[id] = { score: 50, detail: { no_data: true } }
  }

  return results
}
