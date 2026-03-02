// src/lib/engagement/channel.js
// Preferred channel detection: scores interactions across SMS, email, web.

/**
 * Detect preferred channel for a batch of clients.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @param {Map<string, string>} clientPhoneMap
 * @param {Map<string, string>} clientEmailMap
 * @param {Map<string, string>} clientMemberMap
 * @returns {Promise<Record<string, { channel: string, confidence: number, detail: object }>>}
 */
export async function detectChannelPreferences(db, clientIds, clientPhoneMap, clientEmailMap, clientMemberMap) {
  if (!clientIds.length) return {}

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const phones = [...new Set(clientIds.map(id => clientPhoneMap.get(id)).filter(Boolean))]
  const emails = [...new Set(clientIds.map(id => clientEmailMap.get(id)).filter(Boolean))]
  const memberIds = [...new Set(clientIds.map(id => clientMemberMap.get(id)).filter(Boolean))]

  // 1. SMS signals: clicks, replies, bookings from marketing_touches
  const { data: smsData } = await db
    .from('marketing_touches')
    .select('phone, status')
    .in('phone', phones)
    .gte('sent_at', ninetyDaysAgo)

  const smsStats = {}
  for (const row of smsData || []) {
    if (!smsStats[row.phone]) smsStats[row.phone] = { clicks: 0, bookings: 0 }
    if (['clicked', 'booked'].includes(row.status)) smsStats[row.phone].clicks++
    if (row.status === 'booked') smsStats[row.phone].bookings++
  }

  // SMS replies
  const { data: smsReplies } = await db
    .from('bird_engagement_events')
    .select('phone')
    .in('phone', phones)
    .eq('event_type', 'inbound_reply')
    .gte('created_at', ninetyDaysAgo)

  const replyMap = {}
  for (const r of smsReplies || []) {
    replyMap[r.phone] = (replyMap[r.phone] || 0) + 1
  }

  // 2. Email signals: opens, clicks
  const { data: emailData } = await db
    .from('bird_engagement_events')
    .select('email, event_type')
    .in('email', emails)
    .eq('channel', 'email')
    .in('event_type', ['opened', 'clicked'])
    .gte('created_at', ninetyDaysAgo)

  const emailStats = {}
  for (const row of emailData || []) {
    if (!emailStats[row.email]) emailStats[row.email] = { opens: 0, clicks: 0 }
    if (row.event_type === 'opened') emailStats[row.email].opens++
    if (row.event_type === 'clicked') emailStats[row.email].clicks++
  }

  // 3. Web signals: booking sessions, widget events
  const { data: webSessions } = await db
    .from('booking_sessions')
    .select('member_id, outcome')
    .in('member_id', memberIds)
    .gte('started_at', ninetyDaysAgo)

  const webStats = {}
  for (const s of webSessions || []) {
    if (!webStats[s.member_id]) webStats[s.member_id] = { sessions: 0, completions: 0 }
    webStats[s.member_id].sessions++
    if (s.outcome === 'completed') webStats[s.member_id].completions++
  }

  const { data: widgetData } = await db
    .from('widget_events')
    .select('member_id')
    .in('member_id', memberIds)
    .gte('created_at', ninetyDaysAgo)

  const widgetCounts = {}
  for (const w of widgetData || []) {
    if (w.member_id) widgetCounts[w.member_id] = (widgetCounts[w.member_id] || 0) + 1
  }

  // 4. Compute per client
  const results = {}

  for (const clientId of clientIds) {
    const phone = clientPhoneMap.get(clientId)
    const email = clientEmailMap.get(clientId)
    const memberId = clientMemberMap.get(clientId)

    const sms = phone ? smsStats[phone] : null
    const replies = phone ? (replyMap[phone] || 0) : 0
    const em = email ? emailStats[email] : null
    const web = memberId ? webStats[memberId] : null
    const widgets = memberId ? (widgetCounts[memberId] || 0) : 0

    const smsScore = (sms ? sms.clicks * 3 : 0) + (replies * 5) + (sms ? sms.bookings * 10 : 0)
    const emailScore = (em ? em.opens * 1 : 0) + (em ? em.clicks * 5 : 0)
    const webScore = (web ? web.sessions * 2 : 0) + (web ? web.completions * 10 : 0) + (widgets * 3)

    const total = smsScore + emailScore + webScore

    let channel = 'sms' // Default
    let maxScore = smsScore

    if (emailScore > maxScore) { channel = 'email'; maxScore = emailScore }
    if (webScore > maxScore) { channel = 'web'; maxScore = webScore }

    const confidence = total > 0 ? Math.round((maxScore / total) * 100) / 100 : 0

    results[clientId] = {
      channel,
      confidence,
      detail: {
        sms_score: smsScore,
        email_score: emailScore,
        web_score: webScore,
      },
    }
  }

  return results
}
