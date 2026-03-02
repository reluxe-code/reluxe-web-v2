// src/lib/engagement/dimensions/web.js
// Web activity score (0-100). Weight: 0.10
// From booking_sessions, widget_events, experiment_sessions.

/**
 * Compute web activity scores for a batch of client IDs.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @param {Map<string, string>} clientMemberMap - client_id → member_id (for web session lookup)
 * @returns {Promise<Record<string, { score: number, detail: object }>>}
 */
export async function computeWebScores(db, clientIds, clientMemberMap) {
  if (!clientIds.length) return {}

  const memberIds = [...new Set(
    clientIds.map(id => clientMemberMap.get(id)).filter(Boolean)
  )]

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const results = {}

  if (!memberIds.length) {
    for (const id of clientIds) results[id] = { score: 0, detail: { no_member: true } }
    return results
  }

  // 1. Booking sessions (last 90 days)
  const { data: sessions } = await db
    .from('booking_sessions')
    .select('member_id, outcome, max_step, started_at')
    .in('member_id', memberIds)
    .gte('started_at', ninetyDaysAgo)

  // 2. Widget events (last 90 days)
  const { data: widgets } = await db
    .from('widget_events')
    .select('member_id')
    .in('member_id', memberIds)
    .gte('created_at', ninetyDaysAgo)

  // 3. Experiment sessions (last 90 days)
  const { data: experiments } = await db
    .from('experiment_sessions')
    .select('device_id, outcome')
    .not('outcome', 'is', null)
    .gte('started_at', ninetyDaysAgo)

  // Aggregate by member_id
  const memberStats = {}
  for (const s of sessions || []) {
    if (!memberStats[s.member_id]) memberStats[s.member_id] = { sessions: 0, completed: 0, maxStep: 0, lastActivity: null }
    memberStats[s.member_id].sessions++
    if (s.outcome === 'completed') memberStats[s.member_id].completed++
    // Estimate step depth from max_step string
    const stepDepth = estimateStepDepth(s.max_step)
    if (stepDepth > memberStats[s.member_id].maxStep) memberStats[s.member_id].maxStep = stepDepth
    if (!memberStats[s.member_id].lastActivity || s.started_at > memberStats[s.member_id].lastActivity) {
      memberStats[s.member_id].lastActivity = s.started_at
    }
  }

  const widgetCounts = {}
  for (const w of widgets || []) {
    if (w.member_id) widgetCounts[w.member_id] = (widgetCounts[w.member_id] || 0) + 1
  }

  // Build member_id → client_id reverse map
  const memberToClient = new Map()
  for (const [clientId, memberId] of clientMemberMap) {
    if (memberId) memberToClient.set(memberId, clientId)
  }

  // Compute scores
  for (const clientId of clientIds) {
    const memberId = clientMemberMap.get(clientId)
    const stats = memberId ? memberStats[memberId] : null
    const widgetCount = memberId ? (widgetCounts[memberId] || 0) : 0

    if (!stats && widgetCount === 0) {
      results[clientId] = { score: 0, detail: { no_web_activity: true } }
      continue
    }

    const s = stats || { sessions: 0, completed: 0, maxStep: 0, lastActivity: null }

    const sessionScore = Math.min(s.sessions * 8, 30)
    const completionRate = s.sessions > 0 ? s.completed / s.sessions : 0
    const completionBonus = Math.round(completionRate * 30)
    const widgetScore = Math.min(widgetCount * 5, 15)
    const experimentScore = 0 // Would need device_id correlation, omit for now
    const depthScore = s.maxStep >= 5 ? 15 : s.maxStep >= 3 ? 10 : s.maxStep >= 1 ? 5 : 0

    const engagementRaw = sessionScore + completionBonus + widgetScore + experimentScore + depthScore

    let recencyMultiplier = 0.2
    if (s.lastActivity) {
      const daysSince = Math.floor((Date.now() - new Date(s.lastActivity).getTime()) / (1000 * 60 * 60 * 24))
      recencyMultiplier = daysSince <= 7 ? 1.0
        : daysSince <= 30 ? 0.85
        : daysSince <= 60 ? 0.65
        : daysSince <= 90 ? 0.4
        : 0.2
    }

    const score = Math.round(Math.min(engagementRaw * recencyMultiplier, 100))

    results[clientId] = {
      score,
      detail: {
        sessions: s.sessions,
        completed: s.completed,
        widget_interactions: widgetCount,
        max_step_depth: s.maxStep,
        recency_multiplier: recencyMultiplier,
      },
    }
  }

  for (const id of clientIds) {
    if (!results[id]) results[id] = { score: 0, detail: { no_web_activity: true } }
  }

  return results
}

/**
 * Estimate numeric step depth from step name.
 */
function estimateStepDepth(stepName) {
  if (!stepName) return 0
  const stepOrder = {
    service: 1, category: 1,
    provider: 2,
    datetime: 3, date: 3, time: 3,
    contact: 4, details: 4,
    confirm: 5, payment: 5, review: 5, complete: 6,
  }
  const lower = stepName.toLowerCase()
  for (const [key, depth] of Object.entries(stepOrder)) {
    if (lower.includes(key)) return depth
  }
  return 1
}
