// src/pages/api/admin/intelligence/content-engagement.js
// Dashboard API for inspiration article & widget engagement analytics.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { days = '30', start_date, end_date } = req.query

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
    // Fetch all widget events in range
    let query = db
      .from('widget_events')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
    if (until) query = query.lte('created_at', until)

    const { data: events, error } = await query
    if (error) throw error

    const all = events || []

    // Summary metrics
    const totalEvents = all.length
    const uniqueDevices = new Set(all.map(e => e.device_id).filter(Boolean)).size

    // By widget type
    const byWidget = {}
    for (const e of all) {
      if (!byWidget[e.widget_type]) byWidget[e.widget_type] = { total: 0, events: {} }
      byWidget[e.widget_type].total++
      byWidget[e.widget_type].events[e.event_name] = (byWidget[e.widget_type].events[e.event_name] || 0) + 1
    }

    const widgetBreakdown = Object.entries(byWidget)
      .map(([widget, data]) => ({ widget, total: data.total, events: data.events }))
      .sort((a, b) => b.total - a.total)

    // By article
    const byArticle = {}
    for (const e of all) {
      const slug = e.article_slug || 'unknown'
      if (!byArticle[slug]) byArticle[slug] = { total: 0, widgets: new Set(), devices: new Set() }
      byArticle[slug].total++
      byArticle[slug].widgets.add(e.widget_type)
      if (e.device_id) byArticle[slug].devices.add(e.device_id)
    }

    const articleBreakdown = Object.entries(byArticle)
      .map(([slug, data]) => ({
        article_slug: slug,
        total_events: data.total,
        unique_widgets: data.widgets.size,
        unique_visitors: data.devices.size,
      }))
      .sort((a, b) => b.total_events - a.total_events)

    // By event name (top events)
    const byEvent = {}
    for (const e of all) {
      byEvent[e.event_name] = (byEvent[e.event_name] || 0) + 1
    }
    const topEvents = Object.entries(byEvent)
      .map(([name, count]) => ({ event: name, count }))
      .sort((a, b) => b.count - a.count)

    // Daily trends
    const byDay = {}
    for (const e of all) {
      const day = e.created_at.slice(0, 10)
      if (!byDay[day]) byDay[day] = { events: 0, devices: new Set() }
      byDay[day].events++
      if (e.device_id) byDay[day].devices.add(e.device_id)
    }
    const trends = Object.entries(byDay)
      .map(([date, d]) => ({ date, events: d.events, visitors: d.devices.size }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Recent events (last 50)
    const recent = all.slice(0, 50).map(e => ({
      event_name: e.event_name,
      widget_type: e.widget_type,
      article_slug: e.article_slug,
      metadata: e.metadata,
      page_path: e.page_path,
      created_at: e.created_at,
    }))

    // Quiz completions detail
    const quizResults = all
      .filter(e => e.event_name === 'quiz_complete')
      .map(e => ({
        article_slug: e.article_slug,
        result_title: e.metadata?.result_title,
        total_score: e.metadata?.total_score,
        quiz_title: e.metadata?.title,
        created_at: e.created_at,
      }))

    return res.json({
      generated_at: new Date().toISOString(),
      filters: { since, until },
      summary: {
        total_events: totalEvents,
        unique_visitors: uniqueDevices,
        articles_with_engagement: articleBreakdown.length,
        widgets_used: widgetBreakdown.length,
      },
      widget_breakdown: widgetBreakdown,
      article_breakdown: articleBreakdown,
      top_events: topEvents,
      trends,
      recent,
      quiz_results: quizResults,
    })
  } catch (err) {
    console.error('[content-engagement]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
