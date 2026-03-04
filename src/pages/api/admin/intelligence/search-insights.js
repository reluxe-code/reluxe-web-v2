// src/pages/api/admin/intelligence/search-insights.js
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
    // Fetch all search events in range
    let query = db
      .from('search_events')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
    if (until) query = query.lte('created_at', until)

    const { data: events, error } = await query
    if (error) throw error

    const all = events || []
    const queries = all.filter(e => e.event_type === 'query')
    const clicks = all.filter(e => e.event_type === 'click')

    // ── Summary stats ──
    const totalSearches = queries.length
    const uniqueDevices = new Set(queries.map(e => e.device_id).filter(Boolean)).size
    const zeroResultQueries = queries.filter(e => e.result_count === 0).length
    const zeroResultRate = totalSearches > 0 ? Math.round((zeroResultQueries / totalSearches) * 100) : 0
    const totalClicks = clicks.length
    const clickRate = totalSearches > 0 ? Math.round((totalClicks / totalSearches) * 100) : 0
    const avgResults = totalSearches > 0
      ? Math.round(queries.reduce((s, e) => s + e.result_count, 0) / totalSearches)
      : 0

    // ── Daily volume ──
    const dailyMap = {}
    for (const e of queries) {
      const day = e.created_at.slice(0, 10)
      dailyMap[day] = (dailyMap[day] || 0) + 1
    }
    const dailyVolume = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    // ── Top queries ──
    const queryMap = {}
    for (const e of queries) {
      const key = e.query_normalized
      if (!queryMap[key]) queryMap[key] = { query: e.query, count: 0, totalResults: 0, clickCount: 0, topClicked: null }
      queryMap[key].count++
      queryMap[key].totalResults += e.result_count
    }
    // Count clicks per query
    for (const e of clicks) {
      const key = e.query_normalized
      if (queryMap[key]) {
        queryMap[key].clickCount++
        if (!queryMap[key].topClicked && e.clicked_title) {
          queryMap[key].topClicked = { title: e.clicked_title, url: e.clicked_url }
        }
      }
    }
    const topQueries = Object.values(queryMap)
      .map(q => ({
        query: q.query,
        count: q.count,
        avgResults: Math.round(q.totalResults / q.count),
        clickRate: q.count > 0 ? Math.round((q.clickCount / q.count) * 100) : 0,
        topClicked: q.topClicked,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50)

    // ── Zero-result queries ──
    const zeroMap = {}
    for (const e of queries) {
      if (e.result_count === 0) {
        const key = e.query_normalized
        if (!zeroMap[key]) zeroMap[key] = { query: e.query, count: 0, lastSearched: e.created_at }
        zeroMap[key].count++
        if (e.created_at > zeroMap[key].lastSearched) zeroMap[key].lastSearched = e.created_at
      }
    }
    const zeroResultList = Object.values(zeroMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 30)

    // ── Top clicked results ──
    const clickedMap = {}
    for (const e of clicks) {
      const key = e.clicked_url
      if (!key) continue
      if (!clickedMap[key]) clickedMap[key] = { url: key, title: e.clicked_title, type: e.clicked_type, clickCount: 0, totalPosition: 0 }
      clickedMap[key].clickCount++
      if (typeof e.click_position === 'number') clickedMap[key].totalPosition += e.click_position
    }
    const topClicked = Object.values(clickedMap)
      .map(c => ({
        url: c.url,
        title: c.title,
        type: c.type,
        clickCount: c.clickCount,
        avgPosition: c.clickCount > 0 ? Math.round(c.totalPosition / c.clickCount) : null,
      }))
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 30)

    // ── Recent searches ──
    const recent = queries.slice(0, 50).map(e => ({
      query: e.query,
      resultCount: e.result_count,
      source: e.source,
      pagePath: e.page_path,
      createdAt: e.created_at,
      hadClick: clicks.some(c => c.session_id === e.session_id && c.query_normalized === e.query_normalized),
    }))

    // ── Source breakdown ──
    const sourceMap = {}
    for (const e of queries) {
      const src = e.source || 'overlay'
      sourceMap[src] = (sourceMap[src] || 0) + 1
    }

    return res.status(200).json({
      ok: true,
      summary: {
        totalSearches,
        uniqueDevices,
        zeroResultRate,
        clickRate,
        avgResults,
        totalClicks,
        zeroResultQueries,
      },
      dailyVolume,
      topQueries,
      zeroResultList,
      topClicked,
      recent,
      sourceBreakdown: sourceMap,
    })
  } catch (err) {
    console.error('[search-insights] Error:', err.message)
    return res.status(500).json({ error: 'Failed to load search insights' })
  }
}

export default withAdminAuth(handler)
