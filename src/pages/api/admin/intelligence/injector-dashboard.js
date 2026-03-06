// src/pages/api/admin/intelligence/injector-dashboard.js
// Injector Performance Dashboard — provider-centric scorecard, book health, patient retention.
// GET ?location=all|westfield|carmel
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

export const config = { maxDuration: 30 }

async function fetchAllRows(buildQuery, chunkSize = 1000, maxRows = 100000) {
  const rows = []
  for (let offset = 0; offset < maxRows; offset += chunkSize) {
    const { data, error } = await buildQuery().range(offset, offset + chunkSize - 1)
    if (error) throw error
    const page = data || []
    rows.push(...page)
    if (page.length < chunkSize) break
  }
  return rows
}

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { location } = req.query
  const db = getServiceClient()

  try {
    const twelveMonthsAgo = new Date(Date.now() - 365 * 86400000).toISOString()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
    const now = new Date().toISOString()
    const future90 = new Date(Date.now() + 90 * 86400000).toISOString()

    // ─── 6 parallel queries ──────────────────────────────────
    const [toxClients, provPerf, salesDna, toxAppts, futureAppts, fillerAppts] = await Promise.all([
      // 1. Patient segments + interval health
      fetchAllRows(() =>
        db.from('client_tox_summary')
          .select('client_id, tox_segment, days_since_last_tox, total_tox_spend, tox_visits, avg_tox_interval_days, last_provider_staff_id, last_location_key, first_tox_visit, last_tox_visit')
      ),
      // 2. Provider performance (revenue/hr, rebooking)
      db.from('provider_performance')
        .select('provider_staff_id, provider_name, provider_title, revenue_per_hour, rebooking_rate_pct, total_appointments, unique_clients, total_revenue, revenue_last_30d')
        .gt('total_appointments', 0),
      // 3. Retail attachment rate
      db.from('rie_provider_sales_dna')
        .select('provider_staff_id, provider_name, attachment_rate_pct, total_retail_revenue'),
      // 4. Tox appointments (trailing 12mo) — visits, rebook, monthly trends, LTV
      fetchAllRows(() =>
        db.from('blvd_appointment_services')
          .select(`
            provider_staff_id, appointment_id, price, service_name,
            blvd_appointments!inner (client_id, start_at, status, location_key, duration_minutes)
          `)
          .eq('service_slug', 'tox')
          .in('blvd_appointments.status', ['completed', 'final'])
          .gte('blvd_appointments.start_at', twelveMonthsAgo)
          .lte('blvd_appointments.start_at', now)
      ),
      // 5. Future appointments (next 90d) — forward book, fill rate
      fetchAllRows(() =>
        db.from('blvd_appointment_services')
          .select(`
            provider_staff_id, appointment_id, price,
            blvd_appointments!inner (client_id, start_at, status, location_key, duration_minutes)
          `)
          .in('blvd_appointments.status', ['booked', 'confirmed', 'arrived'])
          .gte('blvd_appointments.start_at', now)
          .lte('blvd_appointments.start_at', future90)
      ),
      // 6. Filler appointments (trailing 12mo) — filler attachment rate
      fetchAllRows(() =>
        db.from('blvd_appointment_services')
          .select(`
            provider_staff_id, appointment_id,
            blvd_appointments!inner (client_id, start_at, status, location_key)
          `)
          .eq('service_slug', 'filler')
          .in('blvd_appointments.status', ['completed', 'final'])
          .gte('blvd_appointments.start_at', twelveMonthsAgo)
          .lte('blvd_appointments.start_at', now)
      ),
    ])

    const perfRows = provPerf.data || []
    const dnaRows = salesDna.data || []

    // Build lookup maps
    const perfMap = Object.fromEntries(perfRows.map(p => [p.provider_staff_id, p]))
    const dnaMap = Object.fromEntries(dnaRows.map(d => [d.provider_staff_id, d]))

    // ─── Filter by location ──────────────────────────────────
    let filteredClients = toxClients || []
    if (location && location !== 'all') {
      filteredClients = filteredClients.filter(r => r.last_location_key === location)
    }

    // ─── Deduplicate tox appointments ────────────────────────
    const toxApptMap = {}
    for (const row of toxAppts || []) {
      const appt = row.blvd_appointments
      if (location && location !== 'all' && appt?.location_key !== location) continue
      const aid = row.appointment_id
      if (!toxApptMap[aid]) {
        toxApptMap[aid] = {
          appointment_id: aid,
          provider_staff_id: row.provider_staff_id,
          price: 0,
          blvd_appointments: appt,
        }
      }
      toxApptMap[aid].price += Number(row.price || 0)
    }
    const dedupedTox = Object.values(toxApptMap)

    // ─── Rebook rate per provider (trailing 12mo) ────────────
    const clientVisitDates = {} // 'clientId:providerId' → timestamps[]
    const providerToxCounts = {} // providerId → { total, clients, revenue, visits30d }
    for (const row of dedupedTox) {
      const pid = row.provider_staff_id
      const appt = row.blvd_appointments
      if (!pid || !appt?.client_id) continue

      if (!providerToxCounts[pid]) providerToxCounts[pid] = { total: 0, clients: new Set(), revenue: 0, visits30d: 0 }
      providerToxCounts[pid].total++
      providerToxCounts[pid].clients.add(appt.client_id)
      providerToxCounts[pid].revenue += row.price
      if (appt.start_at >= thirtyDaysAgo) providerToxCounts[pid].visits30d++

      const key = `${appt.client_id}:${pid}`
      if (!clientVisitDates[key]) clientVisitDates[key] = []
      clientVisitDates[key].push({ ts: new Date(appt.start_at).getTime(), month: appt.start_at.slice(0, 7) })
    }

    // Compute rebook per provider
    const rebookMap = {}
    for (const [key, visits] of Object.entries(clientVisitDates)) {
      const pid = key.split(':')[1]
      if (!rebookMap[pid]) rebookMap[pid] = { total: 0, rebooked: 0 }
      visits.sort((a, b) => a.ts - b.ts)
      rebookMap[pid].total += visits.length
      if (visits.length > 1) rebookMap[pid].rebooked += visits.length - 1
    }

    // ─── Monthly trends per provider ─────────────────────────
    const monthlyData = {} // 'pid:YYYY-MM' → { appts, clients, revenue }
    const monthlyIntervals = {} // 'pid:YYYY-MM' → gaps[]
    const monthlyRebook = {} // 'pid:YYYY-MM' → { total, rebooked }

    for (const [cvKey, visits] of Object.entries(clientVisitDates)) {
      const pid = cvKey.split(':')[1]
      visits.sort((a, b) => a.ts - b.ts)

      for (let i = 0; i < visits.length; i++) {
        const v = visits[i]
        const mkey = `${pid}:${v.month}`
        if (!monthlyData[mkey]) monthlyData[mkey] = { pid, month: v.month, appts: 0, clients: new Set(), revenue: 0 }

        // Interval
        if (i > 0) {
          const gap = Math.round((v.ts - visits[i - 1].ts) / 86400000)
          if (gap > 0 && gap < 365) {
            if (!monthlyIntervals[mkey]) monthlyIntervals[mkey] = []
            monthlyIntervals[mkey].push(gap)
          }
        }

        // Rebook
        if (!monthlyRebook[mkey]) monthlyRebook[mkey] = { total: 0, rebooked: 0 }
        monthlyRebook[mkey].total++
        if (i < visits.length - 1) monthlyRebook[mkey].rebooked++
      }
    }

    // Count monthly appts from deduped appointments (not from client visit dates which double-counts)
    for (const row of dedupedTox) {
      const pid = row.provider_staff_id
      const appt = row.blvd_appointments
      if (!pid || !appt?.start_at) continue
      const month = appt.start_at.slice(0, 7)
      const mkey = `${pid}:${month}`
      if (!monthlyData[mkey]) monthlyData[mkey] = { pid, month, appts: 0, clients: new Set(), revenue: 0 }
      monthlyData[mkey].appts++
      if (appt.client_id) monthlyData[mkey].clients.add(appt.client_id)
      monthlyData[mkey].revenue += row.price
    }

    // Assemble monthly trends per provider
    const providerTrends = {}
    for (const [mkey, md] of Object.entries(monthlyData)) {
      const { pid, month } = md
      if (!providerTrends[pid]) providerTrends[pid] = []
      const intervals = monthlyIntervals[mkey] || []
      const avgInterval = intervals.length > 0
        ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
        : null
      const rb = monthlyRebook[mkey]
      const rebookPct = rb && rb.total > 0 ? Math.round((rb.rebooked / rb.total) * 100) : null

      providerTrends[pid].push({
        month,
        appts: md.appts,
        patients: md.clients.size,
        avg_interval: avgInterval,
        rebook_pct: rebookPct,
        revenue: Math.round(md.revenue || 0),
      })
    }
    for (const pid of Object.keys(providerTrends)) {
      providerTrends[pid].sort((a, b) => a.month.localeCompare(b.month))
    }

    // ─── Filler attachment per provider ──────────────────────
    const fillerClients = {} // pid → Set of client_ids with filler
    for (const row of fillerAppts || []) {
      const appt = row.blvd_appointments
      if (location && location !== 'all' && appt?.location_key !== location) continue
      const pid = row.provider_staff_id
      if (!pid || !appt?.client_id) continue
      if (!fillerClients[pid]) fillerClients[pid] = new Set()
      fillerClients[pid].add(appt.client_id)
    }

    // ─── Forward book per provider ───────────────────────────
    const forwardBook = {} // pid → { hours, revenue, appts }
    for (const row of futureAppts || []) {
      const appt = row.blvd_appointments
      if (location && location !== 'all' && appt?.location_key !== location) continue
      const pid = row.provider_staff_id
      if (!pid) continue
      if (!forwardBook[pid]) forwardBook[pid] = { hours: 0, revenue: 0, appts: new Set() }
      if (!forwardBook[pid].appts.has(row.appointment_id)) {
        forwardBook[pid].hours += (appt.duration_minutes || 60) / 60
        forwardBook[pid].appts.add(row.appointment_id)
      }
      forwardBook[pid].revenue += Number(row.price || 0)
    }

    // ─── First-year retention per provider ───────────────────
    const firstYearRetention = {}
    const nowMs = Date.now()
    for (const row of filteredClients) {
      const pid = row.last_provider_staff_id
      if (!pid || !row.first_tox_visit) continue
      if (!firstYearRetention[pid]) firstYearRetention[pid] = { new_4mo: 0, returned_4mo: 0, new_12mo: 0, returned_12mo: 0 }
      const daysSinceFirst = (nowMs - new Date(row.first_tox_visit).getTime()) / 86400000
      if (daysSinceFirst >= 120 && daysSinceFirst <= 365) {
        firstYearRetention[pid].new_4mo++
        if (row.tox_visits >= 2) firstYearRetention[pid].returned_4mo++
      }
      if (daysSinceFirst >= 365 && daysSinceFirst <= 730) {
        firstYearRetention[pid].new_12mo++
        if (row.tox_visits >= 2) firstYearRetention[pid].returned_12mo++
      }
    }

    // ─── Patient health per provider ─────────────────────────
    const providerPatientHealth = {}
    for (const row of filteredClients) {
      const pid = row.last_provider_staff_id
      if (!pid) continue
      if (!providerPatientHealth[pid]) providerPatientHealth[pid] = {
        total: 0, on_schedule: 0, due: 0, overdue: 0, lost: 0,
        intervals: [], activeIntervals: [],
      }
      const h = providerPatientHealth[pid]
      h.total++
      if (row.tox_segment === 'on_schedule') h.on_schedule++
      else if (row.tox_segment === 'due') h.due++
      else if (row.tox_segment === 'overdue') h.overdue++
      else if (row.tox_segment === 'probably_lost' || row.tox_segment === 'lost') h.lost++
      if (row.avg_tox_interval_days) {
        h.intervals.push(row.avg_tox_interval_days)
        if (row.tox_segment === 'on_schedule' || row.tox_segment === 'due') {
          h.activeIntervals.push(row.avg_tox_interval_days)
        }
      }
    }

    // ─── Interval compression velocity ──────────────────────
    function intervalVelocity(months) {
      if (!months || months.length < 4) return null
      const withInterval = months.filter(m => m.avg_interval != null)
      if (withInterval.length < 4) return null
      const recent = withInterval.slice(-3)
      const prior = withInterval.slice(-6, -3)
      if (prior.length < 2) return null
      const recentAvg = recent.reduce((a, b) => a + b.avg_interval, 0) / recent.length
      const priorAvg = prior.reduce((a, b) => a + b.avg_interval, 0) / prior.length
      return Math.round((priorAvg - recentAvg) * 10) / 10 // positive = improving (days compressed)
    }

    // ─── Fetch staff names ───────────────────────────────────
    const allProviderIds = new Set([
      ...Object.keys(providerPatientHealth),
      ...Object.keys(providerToxCounts),
      ...perfRows.map(p => p.provider_staff_id),
    ])
    let staffLookup = {}
    if (allProviderIds.size > 0) {
      const { data: staffRows } = await db
        .from('staff')
        .select('id, name, title')
        .in('id', [...allProviderIds])
      staffLookup = Object.fromEntries((staffRows || []).map(s => [s.id, s]))
    }

    // ─── Executive Summary ───────────────────────────────────
    const totalPatients = filteredClients.length
    const onSchedule = filteredClients.filter(r => r.tox_segment === 'on_schedule').length
    const overdueCount = filteredClients.filter(r => r.tox_segment === 'overdue' || r.tox_segment === 'probably_lost').length
    const allIntervals = filteredClients.filter(r => r.avg_tox_interval_days).map(r => r.avg_tox_interval_days)
    const avgInterval = allIntervals.length > 0
      ? Math.round(allIntervals.reduce((a, b) => a + b, 0) / allIntervals.length)
      : null

    // Monthly tox visits (last 30d)
    const totalToxVisits30d = Object.values(providerToxCounts).reduce((s, p) => s + p.visits30d, 0)

    // Overall rebook rate
    const totalRebookTotal = Object.values(rebookMap).reduce((s, r) => s + r.total, 0)
    const totalRebooked = Object.values(rebookMap).reduce((s, r) => s + r.rebooked, 0)
    const overallRebookRate = totalRebookTotal > 0
      ? Math.round((totalRebooked / totalRebookTotal) * 100)
      : null

    const onSchedulePct = totalPatients > 0
      ? Math.round((onSchedule / totalPatients) * 100)
      : null

    const executive = {
      tox_visits_30d: totalToxVisits30d,
      avg_interval: avgInterval,
      rebook_rate: overallRebookRate,
      on_schedule_pct: onSchedulePct,
      active_patients: totalPatients,
      overdue_count: overdueCount,
    }

    // ─── Per-Provider Scorecard ──────────────────────────────
    const AVAILABLE_HOURS_90D = 520 // 8h/day x 5d x 13wk

    const providers = [...allProviderIds].map(pid => {
      const health = providerPatientHealth[pid] || { total: 0, on_schedule: 0, due: 0, overdue: 0, lost: 0, intervals: [], activeIntervals: [] }
      const perf = perfMap[pid]
      const dna = dnaMap[pid]
      const toxCounts = providerToxCounts[pid] || { total: 0, clients: new Set(), revenue: 0, visits30d: 0 }
      const rb = rebookMap[pid]
      const filler = fillerClients[pid]
      const fb = forwardBook[pid]
      const fyr = firstYearRetention[pid] || { new_4mo: 0, returned_4mo: 0, new_12mo: 0, returned_12mo: 0 }
      const months = providerTrends[pid] || []

      const staff = staffLookup[pid]
      const name = staff?.name || perf?.provider_name || dna?.provider_name || 'Unknown'
      if (name === 'Unknown' && health.total === 0 && toxCounts.total === 0) return null

      // Avg interval (active patients only)
      const activeAvg = health.activeIntervals.length > 0
        ? Math.round(health.activeIntervals.reduce((a, b) => a + b, 0) / health.activeIntervals.length)
        : null

      // Rebook rate
      const rebookRate = rb && rb.total > 0 ? Math.round((rb.rebooked / rb.total) * 100) : null

      // Rev/hr
      const revPerHour = perf ? Number(perf.revenue_per_hour || 0) : null

      // Avg revenue per visit
      const avgRevPerVisit = toxCounts.total > 0
        ? Math.round(toxCounts.revenue / toxCounts.total)
        : null

      // Filler attachment rate
      const toxClientSet = toxCounts.clients
      const fillerSet = filler || new Set()
      const fillerAttachPct = toxClientSet.size > 0
        ? Math.round((fillerSet.size / toxClientSet.size) * 100)
        : null

      // Retail attachment rate
      const retailAttachPct = dna ? Number(dna.attachment_rate_pct || 0) : null

      // Visits per patient per year
      const clients12mo = toxClientSet.size || 0
      const visitsPerPatientYear = clients12mo > 0
        ? Math.round((toxCounts.total / clients12mo) * 10) / 10
        : null

      // First-year retention
      const retention4mo = fyr.new_4mo > 0 ? Math.round((fyr.returned_4mo / fyr.new_4mo) * 100) : null

      // Forward book
      const forwardHours = fb ? Math.round(fb.hours) : 0
      const forwardRevenue = fb ? Math.round(fb.revenue) : 0
      const fillRate = fb ? Math.round((fb.hours / AVAILABLE_HOURS_90D) * 100) : 0

      // Tox LTV (visits/yr x avg rev/visit)
      const toxLtv = visitsPerPatientYear && avgRevPerVisit
        ? Math.round(visitsPerPatientYear * avgRevPerVisit)
        : null

      // Interval velocity
      const velocity = intervalVelocity(months)

      return {
        staff_id: pid,
        name,
        title: staff?.title || perf?.provider_title || '',
        // Scorecard metrics
        tox_visits_30d: toxCounts.visits30d,
        avg_interval: activeAvg,
        rebook_rate: rebookRate,
        rev_per_hour: revPerHour ? Math.round(revPerHour) : null,
        avg_rev_per_visit: avgRevPerVisit,
        filler_attach_pct: fillerAttachPct,
        retail_attach_pct: retailAttachPct != null ? Math.round(retailAttachPct) : null,
        visits_per_patient_year: visitsPerPatientYear,
        // Patient health
        patients: health.total,
        on_schedule: health.on_schedule,
        on_schedule_pct: health.total > 0 ? Math.round((health.on_schedule / health.total) * 100) : 0,
        overdue: health.overdue + health.lost,
        // Book health
        forward_hours: forwardHours,
        forward_revenue: forwardRevenue,
        fill_rate: fillRate,
        // Advanced
        tox_ltv: toxLtv,
        retention_4mo: retention4mo,
        retention_4mo_cohort: fyr.new_4mo,
        velocity,
        // Monthly trends
        monthly: months,
      }
    }).filter(Boolean)

    // Sort by tox visits 30d descending
    providers.sort((a, b) => (b.tox_visits_30d || 0) - (a.tox_visits_30d || 0))

    // ─── Team totals ─────────────────────────────────────────
    const totalForwardHours = providers.reduce((s, p) => s + p.forward_hours, 0)
    const totalForwardRevenue = providers.reduce((s, p) => s + p.forward_revenue, 0)

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.json({
      executive,
      providers,
      book_health: {
        forward_hours: totalForwardHours,
        forward_revenue: totalForwardRevenue,
        available_hours: AVAILABLE_HOURS_90D * providers.length,
        fill_rate: providers.length > 0
          ? Math.round((totalForwardHours / (AVAILABLE_HOURS_90D * providers.length)) * 100)
          : 0,
      },
    })
  } catch (err) {
    console.error('[intelligence/injector-dashboard]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
