// src/pages/api/admin/intelligence/booking-funnel.js
// Dashboard API for booking funnel analytics.
import { getServiceClient } from '@/lib/supabase'

const MODAL_STEPS = ['HOME', 'CATEGORIES', 'CATEGORY_ITEMS', 'BUNDLE_ITEMS', 'PROVIDER_SERVICES', 'OPTIONS', 'DATE_TIME', 'CHECKOUT', 'BOOKED']
const PICKER_STEPS = ['SPECIALTY', 'BUNDLE_ITEMS', 'MENU_ITEM', 'OPTIONS', 'ADD_SERVICE', 'ADDON_OPTIONS', 'DATE_TIME', 'CHECKOUT']

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const {
    days = '30',
    start_date,
    end_date,
    flow_type,
    location,
    page = '1',
    per_page = '20',
  } = req.query

  const pageNum = Math.max(parseInt(page) || 1, 1)
  const perPage = Math.min(Math.max(parseInt(per_page) || 20, 1), 100)

  // Date range: explicit start/end takes precedence over days
  let since, until
  if (start_date) {
    since = new Date(start_date + 'T00:00:00').toISOString()
    until = end_date ? new Date(end_date + 'T23:59:59.999').toISOString() : null
  } else {
    const daysNum = Math.min(Math.max(parseInt(days) || 30, 1), 365)
    since = new Date(Date.now() - daysNum * 86400000).toISOString()
    until = null
  }

  const db = getServiceClient()

  try {
    // Fetch all sessions in range
    let query = db
      .from('booking_sessions')
      .select('*')
      .gte('started_at', since)
    if (until) query = query.lte('started_at', until)
    query = query.order('started_at', { ascending: false })

    if (flow_type && ['modal', 'provider_picker'].includes(flow_type)) {
      query = query.eq('flow_type', flow_type)
    }
    if (location) {
      query = query.eq('location_key', location)
    }

    const { data: sessions, error } = await query
    if (error) throw error

    const allSessions = sessions || []

    // ── Summary ──
    const total = allSessions.length
    const completed = allSessions.filter((s) => s.outcome === 'completed').length
    const abandoned = allSessions.filter((s) => s.outcome === 'abandoned').length
    const inProgress = allSessions.filter((s) => s.outcome === 'in_progress').length
    const completionRate = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0
    const completedSessions = allSessions.filter((s) => s.outcome === 'completed' && s.duration_ms)
    const avgDuration = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + s.duration_ms, 0) / completedSessions.length)
      : null

    // ── Funnel ──
    // Count how many sessions visited each step (using steps_visited array)
    const stepCounts = new Map()
    for (const session of allSessions) {
      const visited = session.steps_visited || []
      for (const step of visited) {
        stepCounts.set(step, (stepCounts.get(step) || 0) + 1)
      }
    }

    // Determine which step sequence to use based on flow_type filter
    const stepOrder = flow_type === 'modal' ? MODAL_STEPS
      : flow_type === 'provider_picker' ? PICKER_STEPS
      : [...new Set([...MODAL_STEPS, ...PICKER_STEPS])]

    const funnel = stepOrder
      .filter((step) => stepCounts.has(step))
      .map((step) => {
        const count = stepCounts.get(step) || 0
        return {
          step,
          count,
          pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
        }
      })
      .sort((a, b) => b.count - a.count)

    // Add drop-off percentages
    for (let i = 0; i < funnel.length; i++) {
      if (i === 0) {
        funnel[i].drop_off_pct = 0
      } else {
        const prev = funnel[i - 1].count
        funnel[i].drop_off_pct = prev > 0
          ? Math.round(((prev - funnel[i].count) / prev) * 1000) / 10
          : 0
      }
    }

    // ── Abandon breakdown ──
    const abandonedSessions = allSessions.filter((s) => s.outcome === 'abandoned' && s.abandon_step)
    const abandonByStep = new Map()
    for (const session of abandonedSessions) {
      const step = session.abandon_step
      if (!abandonByStep.has(step)) {
        abandonByStep.set(step, { step, count: 0, services: new Map(), totalTime: 0, timeCount: 0 })
      }
      const entry = abandonByStep.get(step)
      entry.count++
      if (session.service_name) {
        entry.services.set(session.service_name, (entry.services.get(session.service_name) || 0) + 1)
      }
      if (session.duration_ms) {
        entry.totalTime += session.duration_ms
        entry.timeCount++
      }
    }

    const abandons = [...abandonByStep.values()]
      .sort((a, b) => b.count - a.count)
      .map((entry) => {
        // Find top service for this step
        let topService = null
        let topCount = 0
        for (const [name, count] of entry.services) {
          if (count > topCount) { topService = name; topCount = count }
        }
        return {
          step: entry.step,
          count: entry.count,
          pct: abandonedSessions.length > 0 ? Math.round((entry.count / abandonedSessions.length) * 1000) / 10 : 0,
          top_service: topService,
          avg_time_ms: entry.timeCount > 0 ? Math.round(entry.totalTime / entry.timeCount) : null,
        }
      })

    // ── Trends (daily) ──
    const trendMap = new Map()
    for (const session of allSessions) {
      const day = session.started_at?.slice(0, 10)
      if (!day) continue
      if (!trendMap.has(day)) trendMap.set(day, { date: day, sessions: 0, completed: 0, abandoned: 0 })
      const d = trendMap.get(day)
      d.sessions++
      if (session.outcome === 'completed') d.completed++
      if (session.outcome === 'abandoned') d.abandoned++
    }
    const trends = [...trendMap.values()].sort((a, b) => a.date.localeCompare(b.date))

    // ── Paginated session list (abandoned, most recent) ──
    const abandonedForList = allSessions
      .filter((s) => s.outcome === 'abandoned')
      .sort((a, b) => (b.started_at || '').localeCompare(a.started_at || ''))

    const totalAbandoned = abandonedForList.length
    const offset = (pageNum - 1) * perPage
    const pageData = abandonedForList.slice(offset, offset + perPage).map((s) => ({
      session_id: s.session_id,
      flow_type: s.flow_type,
      abandon_step: s.abandon_step,
      service_name: s.service_name,
      provider_name: s.provider_name,
      location_key: s.location_key,
      duration_ms: s.duration_ms,
      contact_phone: s.contact_phone,
      contact_email: s.contact_email,
      started_at: s.started_at,
      device_id: s.device_id,
      utm_source: s.utm_source,
      utm_medium: s.utm_medium,
      utm_campaign: s.utm_campaign,
    }))

    // ── Flow type breakdown ──
    const byFlowType = {}
    for (const session of allSessions) {
      const ft = session.flow_type || 'unknown'
      if (!byFlowType[ft]) byFlowType[ft] = { total: 0, completed: 0, abandoned: 0 }
      byFlowType[ft].total++
      if (session.outcome === 'completed') byFlowType[ft].completed++
      if (session.outcome === 'abandoned') byFlowType[ft].abandoned++
    }

    return res.json({
      generated_at: new Date().toISOString(),
      filters: { start_date: start_date || null, end_date: end_date || null, days: start_date ? null : parseInt(days) || 30, flow_type: flow_type || 'all', location: location || 'all' },
      summary: {
        total,
        completed,
        abandoned,
        in_progress: inProgress,
        completion_rate: completionRate,
        avg_duration_ms: avgDuration,
      },
      by_flow_type: byFlowType,
      funnel,
      abandons,
      trends,
      sessions: {
        data: pageData,
        total: totalAbandoned,
        page: pageNum,
        per_page: perPage,
        pages: Math.ceil(totalAbandoned / perPage),
      },
    })
  } catch (err) {
    console.error('[intelligence/booking-funnel]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
