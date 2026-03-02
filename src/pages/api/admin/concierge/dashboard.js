// src/pages/api/admin/concierge/dashboard.js
// GET: executive dashboard — ready counts per cohort + RPM stats.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()

  try {
    // 1. Current queue counts by cohort and status
    const { data: queueRows } = await db
      .from('concierge_queue')
      .select('campaign_slug, cohort, status')
      .in('status', ['ready', 'flagged', 'approved'])

    const readyCounts = {}
    const flaggedCounts = {}
    const approvedCounts = {}

    for (const row of queueRows || []) {
      if (row.status === 'ready') {
        readyCounts[row.campaign_slug] = (readyCounts[row.campaign_slug] || 0) + 1
      } else if (row.status === 'flagged') {
        flaggedCounts[row.campaign_slug] = (flaggedCounts[row.campaign_slug] || 0) + 1
      } else if (row.status === 'approved') {
        approvedCounts[row.campaign_slug] = (approvedCounts[row.campaign_slug] || 0) + 1
      }
    }

    // 2. RPM data from the view (last 30 days)
    const { data: rpmRows } = await db
      .from('concierge_rpm')
      .select('*')

    const rpm = {}
    let totalRevenue30d = 0
    let totalSent30d = 0

    for (const row of rpmRows || []) {
      if (!rpm[row.campaign_slug]) {
        rpm[row.campaign_slug] = {
          messages_sent: 0,
          clicks: 0,
          conversions: 0,
          total_revenue: 0,
          rpm: 0,
          conversion_rate: 0,
          variants: {},
        }
      }
      const camp = rpm[row.campaign_slug]
      camp.messages_sent += row.messages_sent
      camp.clicks += row.clicks
      camp.conversions += row.conversions
      camp.total_revenue += Number(row.total_revenue)
      camp.variants[row.variant || 'A'] = {
        sent: row.messages_sent,
        conversions: row.conversions,
        revenue: Number(row.total_revenue),
        rpm: Number(row.rpm),
        conversion_rate: Number(row.conversion_rate),
      }

      totalRevenue30d += Number(row.total_revenue)
      totalSent30d += row.messages_sent
    }

    // Recalculate aggregate RPM per campaign
    for (const camp of Object.values(rpm)) {
      camp.rpm = camp.messages_sent > 0
        ? Math.round((camp.total_revenue / camp.messages_sent) * 100) / 100
        : 0
      camp.conversion_rate = camp.messages_sent > 0
        ? Math.round((camp.conversions / camp.messages_sent) * 1000) / 10
        : 0
    }

    // 3. Last batch info
    const { data: lastBatch } = await db
      .from('concierge_queue')
      .select('batch_id, created_at')
      .order('created_at', { ascending: false })
      .limit(1)

    let lastBatchInfo = null
    if (lastBatch?.length) {
      const { count } = await db
        .from('concierge_queue')
        .select('id', { count: 'exact', head: true })
        .eq('batch_id', lastBatch[0].batch_id)

      lastBatchInfo = {
        batch_id: lastBatch[0].batch_id,
        created_at: lastBatch[0].created_at,
        total: count || 0,
      }
    }

    return res.json({
      ready_counts: readyCounts,
      flagged_counts: flaggedCounts,
      approved_counts: approvedCounts,
      rpm,
      total_revenue_30d: Math.round(totalRevenue30d * 100) / 100,
      total_sent_30d: totalSent30d,
      overall_rpm: totalSent30d > 0
        ? Math.round((totalRevenue30d / totalSent30d) * 100) / 100
        : 0,
      last_batch: lastBatchInfo,
    })
  } catch (err) {
    console.error('[concierge/dashboard]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
