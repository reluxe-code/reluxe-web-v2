// src/pages/api/admin/concierge/sends.js
// GET: send performance data for a campaign — summary, daily breakdown, individual sends.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const {
    campaign,
    days = '30',
    status: statusFilter = 'all',
    page: pageStr = '1',
    limit: limitStr = '50',
  } = req.query

  if (!campaign) return res.status(400).json({ error: 'campaign is required' })

  const daysNum = Math.min(parseInt(days, 10) || 30, 365)
  const pageNum = Math.max(1, parseInt(pageStr, 10) || 1)
  const limitNum = Math.min(Math.max(1, parseInt(limitStr, 10) || 50), 200)
  const cutoff = new Date(Date.now() - daysNum * 86400000).toISOString()

  const db = getServiceClient()

  try {
    // 1. All sends for this campaign in the time window (for summary + daily aggregation)
    let allQuery = db
      .from('marketing_touches')
      .select('id, variant, status, revenue, sent_at, clicked_at, booked_at')
      .eq('campaign_slug', campaign)
      .gte('sent_at', cutoff)
      .order('sent_at', { ascending: false })

    const { data: allSends, error: allErr } = await allQuery
    if (allErr) throw allErr

    const rows = allSends || []

    // 2. Summary stats
    const summary = {
      total_sent: rows.length,
      delivered: rows.filter(r => r.status !== 'failed').length,
      clicked: rows.filter(r => r.status === 'clicked' || r.status === 'booked').length,
      booked: rows.filter(r => r.status === 'booked').length,
      failed: rows.filter(r => r.status === 'failed').length,
      revenue: rows.reduce((sum, r) => sum + (parseFloat(r.revenue) || 0), 0),
    }
    summary.click_rate = summary.total_sent > 0
      ? Math.round((summary.clicked / summary.total_sent) * 1000) / 10
      : 0
    summary.conversion_rate = summary.total_sent > 0
      ? Math.round((summary.booked / summary.total_sent) * 1000) / 10
      : 0
    summary.rpm = summary.total_sent > 0
      ? Math.round((summary.revenue / summary.total_sent) * 100) / 100
      : 0

    // 3. Daily breakdown by variant
    const dailyMap = {}
    for (const row of rows) {
      const date = row.sent_at.slice(0, 10) // YYYY-MM-DD
      const variant = row.variant || 'A'
      const key = `${date}:${variant}`
      if (!dailyMap[key]) {
        dailyMap[key] = { date, variant, sent: 0, clicked: 0, booked: 0, failed: 0, revenue: 0 }
      }
      dailyMap[key].sent++
      if (row.status === 'clicked' || row.status === 'booked') dailyMap[key].clicked++
      if (row.status === 'booked') dailyMap[key].booked++
      if (row.status === 'failed') dailyMap[key].failed++
      dailyMap[key].revenue += parseFloat(row.revenue) || 0
    }
    const daily = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date))

    // 4. Paginated individual sends (with optional status filter)
    let sendsQuery = db
      .from('marketing_touches')
      .select('id, variant, status, sms_body, revenue, sent_at, clicked_at, booked_at, client_id')
      .eq('campaign_slug', campaign)
      .gte('sent_at', cutoff)
      .order('sent_at', { ascending: false })

    if (statusFilter !== 'all') {
      if (statusFilter === 'clicked') {
        // Clicked includes booked (they clicked first)
        sendsQuery = sendsQuery.in('status', ['clicked', 'booked'])
      } else {
        sendsQuery = sendsQuery.eq('status', statusFilter)
      }
    }

    // Count for pagination
    const filtered = statusFilter === 'all'
      ? rows
      : statusFilter === 'clicked'
        ? rows.filter(r => r.status === 'clicked' || r.status === 'booked')
        : rows.filter(r => r.status === statusFilter)
    const total = filtered.length
    const pages = Math.ceil(total / limitNum)

    sendsQuery = sendsQuery.range((pageNum - 1) * limitNum, pageNum * limitNum - 1)

    const { data: sends, error: sendsErr } = await sendsQuery
    if (sendsErr) throw sendsErr

    return res.json({
      summary,
      daily,
      sends: (sends || []).map(s => ({
        id: s.id,
        variant: s.variant || 'A',
        status: s.status,
        sms_body: s.sms_body,
        sent_at: s.sent_at,
        clicked_at: s.clicked_at,
        booked_at: s.booked_at,
        revenue: parseFloat(s.revenue) || 0,
        client_id: s.client_id,
      })),
      total,
      page: pageNum,
      pages,
    })
  } catch (err) {
    console.error('[concierge/sends]', err.message)
    return res.status(500).json({ error: 'Failed to load send data' })
  }
}

export default withAdminAuth(handler)
