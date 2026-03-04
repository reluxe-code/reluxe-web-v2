// src/pages/api/admin/intelligence/tox.js
// Tox Intelligence Engine API — segments, provider retention, tox type breakdown.
// GET ?location=all|westfield|carmel&provider=staffId&segment=on_schedule|due|overdue|lost
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'
import { hashPhone, hashEmail } from '@/lib/piiHash'

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

  const { location, provider, segment, search, tox_type, min_visits, sort, page = '1', limit = '50' } = req.query
  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, parseInt(limit, 10) || 50)
  const offset = (pageNum - 1) * pageSize

  try {
    // 1. Summary stats — segment counts
    // Default PostgREST limit is 1000 rows — override to get all patients.
    const toxClients = await fetchAllRows(() =>
      db
        .from('client_tox_summary')
        .select('client_id, tox_segment, days_since_last_tox, total_tox_spend, tox_visits, last_location_key')
    )

    let filtered = toxClients || []

    // Apply location filter
    if (location && location !== 'all') {
      filtered = filtered.filter((r) => r.last_location_key === location)
    }

    const segments = {
      on_schedule: filtered.filter((r) => r.tox_segment === 'on_schedule'),
      due: filtered.filter((r) => r.tox_segment === 'due'),
      overdue: filtered.filter((r) => r.tox_segment === 'overdue'),
      probably_lost: filtered.filter((r) => r.tox_segment === 'probably_lost'),
      lost: filtered.filter((r) => r.tox_segment === 'lost'),
    }

    const total = filtered.length
    const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0
    const summary = {
      total_tox_patients: total,
      on_schedule: segments.on_schedule.length,
      on_schedule_pct: pct(segments.on_schedule.length),
      due: segments.due.length,
      due_pct: pct(segments.due.length),
      overdue: segments.overdue.length,
      overdue_pct: pct(segments.overdue.length),
      probably_lost: segments.probably_lost.length,
      probably_lost_pct: pct(segments.probably_lost.length),
      lost: segments.lost.length,
      lost_pct: pct(segments.lost.length),
      total_tox_revenue: filtered.reduce((s, r) => s + Number(r.total_tox_spend || 0), 0),
      avg_visits: total > 0
        ? Math.round(filtered.reduce((s, r) => s + (r.tox_visits || 0), 0) / total * 10) / 10
        : 0,
    }

    // 2. Tox type breakdown (from add-on services, excluding containers & follow-ups)
    const toxTypeRows = await fetchAllRows(() =>
      db
        .from('blvd_appointment_services')
        .select(`
          service_name,
          price,
          appointment_id,
          blvd_appointments!inner (
            client_id,
            status,
            location_key,
            start_at
          )
        `)
        .eq('service_slug', 'tox')
        .in('blvd_appointments.status', ['completed', 'final'])
    )

    const toxTypeMap = {}
    for (const row of toxTypeRows || []) {
      if (location && location !== 'all' && row.blvd_appointments?.location_key !== location) continue
      // Skip container services (name mentions 2+ brands) and follow-ups
      if (isContainerService(row.service_name)) continue
      if (isFollowUp(row.service_name)) continue
      // Pre-June 2024 data predates system switch — default to Jeuveau
      const PRE_SWITCH_CUTOFF = '2024-06-01'
      const name = row.blvd_appointments?.start_at < PRE_SWITCH_CUTOFF
        ? 'Jeuveau'
        : guessToxBrand(row.service_name)
      if (!toxTypeMap[name]) toxTypeMap[name] = { name, appointments: new Set(), revenue: 0, clients: new Set() }
      toxTypeMap[name].appointments.add(row.appointment_id)
      toxTypeMap[name].revenue += Number(row.price || 0)
      if (row.blvd_appointments?.client_id) toxTypeMap[name].clients.add(row.blvd_appointments.client_id)
    }

    const tox_types = Object.values(toxTypeMap)
      .map((t) => ({ name: t.name, bookings: t.appointments.size, revenue: Math.round(t.revenue), unique_clients: t.clients.size }))
      .sort((a, b) => b.bookings - a.bookings)

    // 3. Provider tox retention leaderboard
    const providerToxRows = await fetchAllRows(() =>
      db
        .from('client_tox_summary')
        .select('client_id, last_provider_staff_id, tox_segment, tox_visits, total_tox_spend, avg_tox_interval_days, last_tox_visit, first_tox_visit')
    )

    const providerMap = {}
    for (const row of providerToxRows || []) {
      const pid = row.last_provider_staff_id
      if (!pid) continue
      if (!providerMap[pid]) providerMap[pid] = {
        staff_id: pid, patients: 0, on_schedule: 0, total_revenue: 0,
        intervals: [], activeIntervals: [],
        due: 0, overdue: 0, probably_lost: 0, lost: 0,
      }
      providerMap[pid].patients++
      const seg = row.tox_segment
      if (seg === 'on_schedule') providerMap[pid].on_schedule++
      else if (seg === 'due') providerMap[pid].due++
      else if (seg === 'overdue') providerMap[pid].overdue++
      else if (seg === 'probably_lost') providerMap[pid].probably_lost++
      else if (seg === 'lost') providerMap[pid].lost++
      providerMap[pid].total_revenue += Number(row.total_tox_spend || 0)
      if (row.avg_tox_interval_days) {
        providerMap[pid].intervals.push(row.avg_tox_interval_days)
        // Active = on_schedule + due (patients still in their cycle)
        if (seg === 'on_schedule' || seg === 'due') {
          providerMap[pid].activeIntervals.push(row.avg_tox_interval_days)
        }
      }
    }

    // 3b. Rebook rate: % of completed tox visits where patient had a future appointment
    // booked on or before the day of their visit (leading indicator of discipline)
    const twelveMonthsAgo = new Date(Date.now() - 365 * 86400000).toISOString()
    const now = new Date().toISOString()

    const toxAppointments = await fetchAllRows(() =>
      db
        .from('blvd_appointment_services')
        .select(`
          provider_staff_id,
          appointment_id,
          price,
          blvd_appointments!inner (
            client_id,
            start_at,
            status
          )
        `)
        .eq('service_slug', 'tox')
        .in('blvd_appointments.status', ['completed', 'final'])
        .gte('blvd_appointments.start_at', twelveMonthsAgo)
        .lte('blvd_appointments.start_at', now)
    )

    // Deduplicate: each appointment = 1 treatment (multiple service lines are add-ons)
    // Group by appointment_id, sum prices, keep one provider/client/date per appointment.
    const toxApptMap = {}
    for (const row of toxAppointments || []) {
      const aid = row.appointment_id
      if (!toxApptMap[aid]) {
        toxApptMap[aid] = {
          appointment_id: aid,
          provider_staff_id: row.provider_staff_id,
          price: 0,
          blvd_appointments: row.blvd_appointments,
        }
      }
      toxApptMap[aid].price += Number(row.price || 0)
    }
    const dedupedToxAppts = Object.values(toxApptMap)

    // Group by provider: total completed tox treatments + treatments where client returned
    const rebookMap = {}
    const clientVisitDates = {}
    for (const row of dedupedToxAppts) {
      const pid = row.provider_staff_id
      const appt = row.blvd_appointments
      if (!pid || !appt?.client_id) continue
      if (!rebookMap[pid]) rebookMap[pid] = { total: 0, rebooked: 0 }
      rebookMap[pid].total++

      // Track per-client visit dates for this provider
      const key = `${appt.client_id}:${pid}`
      if (!clientVisitDates[key]) clientVisitDates[key] = []
      clientVisitDates[key].push(new Date(appt.start_at).getTime())
    }

    // A visit "rebooked" if the same client+provider has a later visit in the data
    for (const [key, dates] of Object.entries(clientVisitDates)) {
      const pid = key.split(':')[1]
      dates.sort((a, b) => a - b)
      // Every visit except the last one counts as "rebooked" (they came back)
      if (dates.length > 1) {
        rebookMap[pid].rebooked += dates.length - 1
      }
    }

    // 3c. Trailing 12mo treatments per patient — count deduplicated appointments per provider
    const visits12moMap = {}
    const providerClientSets = {}
    for (const row of dedupedToxAppts) {
      const pid = row.provider_staff_id
      const appt = row.blvd_appointments
      if (!pid || !appt?.client_id) continue
      if (!visits12moMap[pid]) visits12moMap[pid] = 0
      visits12moMap[pid]++
      if (!providerClientSets[pid]) providerClientSets[pid] = new Set()
      providerClientSets[pid].add(appt.client_id)
    }

    // 3d. Monthly trend computation — per provider × month
    // Build: { providerId: { 'YYYY-MM': { appts, clients, intervals[], revenue } } }
    const monthlyData = {}
    const monthlyClientVisits = {} // key: 'pid:clientId' → sorted visit timestamps

    for (const row of dedupedToxAppts) {
      const pid = row.provider_staff_id
      const appt = row.blvd_appointments
      if (!pid || !appt?.client_id || !appt.start_at) continue

      const month = appt.start_at.slice(0, 7) // 'YYYY-MM'
      const mkey = `${pid}:${month}`
      if (!monthlyData[mkey]) monthlyData[mkey] = { pid, month, appts: 0, clients: new Set(), revenue: 0 }
      monthlyData[mkey].appts++
      monthlyData[mkey].clients.add(appt.client_id)
      monthlyData[mkey].revenue += row.price

      // Track all visit timestamps per client+provider for interval computation
      const cvKey = `${pid}:${appt.client_id}`
      if (!monthlyClientVisits[cvKey]) monthlyClientVisits[cvKey] = []
      monthlyClientVisits[cvKey].push({ ts: new Date(appt.start_at).getTime(), month })
    }

    // Sort each client's visits and compute per-visit intervals
    const monthlyIntervals = {} // 'pid:month' → intervals[]
    const monthlyRebook = {} // 'pid:month' → { total, rebooked }

    for (const [cvKey, visits] of Object.entries(monthlyClientVisits)) {
      const pid = cvKey.split(':')[0]
      visits.sort((a, b) => a.ts - b.ts)

      for (let i = 0; i < visits.length; i++) {
        const v = visits[i]
        const mkey = `${pid}:${v.month}`

        // Interval: days since previous visit for this client+provider
        if (i > 0) {
          const gap = Math.round((v.ts - visits[i - 1].ts) / 86400000)
          if (gap > 0 && gap < 365) { // sanity bound
            if (!monthlyIntervals[mkey]) monthlyIntervals[mkey] = []
            monthlyIntervals[mkey].push(gap)
          }
        }

        // Rebook: did this visit lead to a future visit?
        if (!monthlyRebook[mkey]) monthlyRebook[mkey] = { total: 0, rebooked: 0 }
        monthlyRebook[mkey].total++
        if (i < visits.length - 1) monthlyRebook[mkey].rebooked++
      }
    }

    // Assemble monthly trends per provider
    const providerTrends = {} // providerId → [ { month, appts, patients, avg_interval, rebook_pct, revenue } ]
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

    // Sort each provider's months chronologically
    for (const pid of Object.keys(providerTrends)) {
      providerTrends[pid].sort((a, b) => a.month.localeCompare(b.month))
    }

    // Compute trend direction (last 3 months avg vs prior 3 months avg)
    function computeTrend(months, field) {
      if (months.length < 4) return null // need at least 4 months of data
      const recent = months.slice(-3)
      const prior = months.slice(-6, -3)
      if (prior.length < 2) return null

      const recentVals = recent.map(m => m[field]).filter(v => v != null)
      const priorVals = prior.map(m => m[field]).filter(v => v != null)
      if (!recentVals.length || !priorVals.length) return null

      const recentAvg = recentVals.reduce((a, b) => a + b, 0) / recentVals.length
      const priorAvg = priorVals.reduce((a, b) => a + b, 0) / priorVals.length
      const delta = recentAvg - priorAvg
      const pctChange = priorAvg !== 0 ? (delta / priorAvg) * 100 : 0

      // Threshold: 5% change = meaningful trend
      if (Math.abs(pctChange) < 5) return 'stable'
      return delta > 0 ? 'up' : 'down'
    }

    // 3e. Interval drift cohort per patient: are intervals stable, expanding, or shrinking?
    // For each patient with 3+ visits, compare the last 3 inter-visit gaps
    const driftCohorts = {} // providerId → { stable, expanding, shrinking }
    for (const [cvKey, visits] of Object.entries(monthlyClientVisits)) {
      const pid = cvKey.split(':')[0]
      if (visits.length < 3) continue // need 3+ visits to measure drift

      visits.sort((a, b) => a.ts - b.ts)
      // Compute last 3 gaps (need 4 visits for 3 gaps, or 3 visits for 2 gaps)
      const gaps = []
      for (let i = 1; i < visits.length; i++) {
        gaps.push(Math.round((visits[i].ts - visits[i - 1].ts) / 86400000))
      }
      const recentGaps = gaps.slice(-3) // last 2-3 gaps
      if (recentGaps.length < 2) continue

      if (!driftCohorts[pid]) driftCohorts[pid] = { stable: 0, expanding: 0, shrinking: 0 }

      // Compare first recent gap to last recent gap
      const firstGap = recentGaps[0]
      const lastGap = recentGaps[recentGaps.length - 1]
      const drift = lastGap - firstGap

      if (Math.abs(drift) <= 10) driftCohorts[pid].stable++
      else if (drift > 10) driftCohorts[pid].expanding++ // intervals getting longer = bad
      else driftCohorts[pid].shrinking++ // intervals getting shorter = good
    }

    // 3f. First-year retention: % of new tox patients who return
    // "New" = first_tox_visit within relevant windows
    const firstYearRetention = {} // providerId → { new_4mo, returned_4mo, new_12mo, returned_12mo }
    const nowMs = Date.now()
    for (const row of providerToxRows || []) {
      const pid = row.last_provider_staff_id
      if (!pid || !row.first_tox_visit) continue
      if (!firstYearRetention[pid]) firstYearRetention[pid] = { new_4mo: 0, returned_4mo: 0, new_12mo: 0, returned_12mo: 0 }

      const firstVisitMs = new Date(row.first_tox_visit).getTime()
      const daysSinceFirst = (nowMs - firstVisitMs) / 86400000

      // 4-month cohort: patients whose first visit was 120-365 days ago (enough time to return)
      if (daysSinceFirst >= 120 && daysSinceFirst <= 365) {
        firstYearRetention[pid].new_4mo++
        if (row.tox_visits >= 2) firstYearRetention[pid].returned_4mo++
      }

      // 12-month cohort: patients whose first visit was 365-730 days ago
      if (daysSinceFirst >= 365 && daysSinceFirst <= 730) {
        firstYearRetention[pid].new_12mo++
        if (row.tox_visits >= 2) firstYearRetention[pid].returned_12mo++
      }
    }

    // 3g. Revenue per active tox patient (trailing 12mo)
    const revenue12moMap = {}
    for (const row of dedupedToxAppts) {
      const pid = row.provider_staff_id
      if (!pid) continue
      if (!revenue12moMap[pid]) revenue12moMap[pid] = 0
      revenue12moMap[pid] += row.price
    }

    // Fetch staff names
    const providerIds = Object.keys(providerMap)
    let staffLookup = {}
    if (providerIds.length > 0) {
      const { data: staffRows } = await db
        .from('staff')
        .select('id, name, title')
        .in('id', providerIds)
      staffLookup = Object.fromEntries((staffRows || []).map((s) => [s.id, s]))
    }

    const TARGET_INTERVAL = 95

    const provider_leaderboard = Object.values(providerMap)
      .map((p) => {
        const activeAvg = p.activeIntervals.length > 0
          ? Math.round(p.activeIntervals.reduce((a, b) => a + b, 0) / p.activeIntervals.length)
          : null
        const allAvg = p.intervals.length > 0
          ? Math.round(p.intervals.reduce((a, b) => a + b, 0) / p.intervals.length)
          : null
        const winback = p.overdue + p.probably_lost + p.lost

        // Lost revenue from interval drift
        const activePatients = p.on_schedule + p.due
        const totalVisits = providerToxRows.filter(r => r.last_provider_staff_id === p.staff_id).reduce((s, r) => s + (r.tox_visits || 0), 0)
        const avgRevenuePerVisit = totalVisits > 0 ? p.total_revenue / totalVisits : 0
        let projectedMonthlyLift = null
        if (activeAvg && activeAvg > TARGET_INTERVAL && activePatients > 0) {
          const extraVisitsPerYear = (365 / TARGET_INTERVAL - 365 / activeAvg) * activePatients
          projectedMonthlyLift = Math.round((extraVisitsPerYear / 12) * avgRevenuePerVisit)
        }

        // Rebook rate (trailing 12mo)
        const rb = rebookMap[p.staff_id]
        const rebookRate = rb && rb.total > 0
          ? Math.round((rb.rebooked / rb.total) * 100)
          : null

        // Visits per patient per year (trailing 12mo)
        const visits12mo = visits12moMap[p.staff_id] || 0
        const clients12mo = providerClientSets[p.staff_id]?.size || 0
        const visitsPerPatientYear = clients12mo > 0
          ? Math.round((visits12mo / clients12mo) * 10) / 10
          : null

        // Monthly trends + direction
        const months = providerTrends[p.staff_id] || []
        const intervalTrend = computeTrend(months, 'avg_interval')
        const rebookTrend = computeTrend(months, 'rebook_pct')
        const volumeTrend = computeTrend(months, 'patients')

        // Interval drift cohort: stable / expanding / shrinking
        const dc = driftCohorts[p.staff_id] || { stable: 0, expanding: 0, shrinking: 0 }
        const driftTotal = dc.stable + dc.expanding + dc.shrinking

        // First-year retention
        const fyr = firstYearRetention[p.staff_id] || { new_4mo: 0, returned_4mo: 0, new_12mo: 0, returned_12mo: 0 }
        const retention4mo = fyr.new_4mo > 0 ? Math.round((fyr.returned_4mo / fyr.new_4mo) * 100) : null
        const retention12mo = fyr.new_12mo > 0 ? Math.round((fyr.returned_12mo / fyr.new_12mo) * 100) : null

        // Revenue per active tox patient (trailing 12mo)
        const rev12mo = revenue12moMap[p.staff_id] || 0
        const revenuePerActivePatient = activePatients > 0
          ? Math.round(rev12mo / activePatients)
          : null

        return {
          staff_id: p.staff_id,
          name: staffLookup[p.staff_id]?.name || 'Unknown',
          title: staffLookup[p.staff_id]?.title || '',
          patients: p.patients,
          retention_pct: p.patients > 0 ? Math.round((p.on_schedule / p.patients) * 100) : 0,
          total_revenue: Math.round(p.total_revenue),
          avg_interval_days: allAvg,
          active_avg_interval: activeAvg,
          target_interval: TARGET_INTERVAL,
          drift: activeAvg ? activeAvg - TARGET_INTERVAL : null,
          winback_opps: winback,
          projected_monthly_lift: projectedMonthlyLift,
          rebook_rate: rebookRate,
          visits_per_patient_year: visitsPerPatientYear,
          // Interval drift cohort (patients with 3+ visits)
          cadence_drift: driftTotal > 0 ? {
            stable: dc.stable,
            expanding: dc.expanding,
            shrinking: dc.shrinking,
            expanding_pct: Math.round((dc.expanding / driftTotal) * 100),
          } : null,
          // First-year retention
          first_year: {
            retention_4mo: retention4mo,     // % returning within 120d
            retention_12mo: retention12mo,   // % returning within 1yr
            cohort_4mo: fyr.new_4mo,         // how many new patients in window
            cohort_12mo: fyr.new_12mo,
          },
          // Revenue per active patient (trailing 12mo)
          revenue_per_active: revenuePerActivePatient,
          revenue_12mo: Math.round(rev12mo),
          // Trend directions: 'up', 'down', 'stable', or null
          trends: {
            interval: intervalTrend,   // down = improving
            rebook: rebookTrend,       // up = improving
            volume: volumeTrend,       // up = improving
          },
          // Monthly detail for expandable row
          monthly: months,
        }
      })
      .sort((a, b) => b.retention_pct - a.retention_pct)

    // Compute provider variance summary (spread across key metrics)
    const leaderboardForVariance = provider_leaderboard.filter(p => p.patients >= 10)
    const providerVariance = leaderboardForVariance.length >= 2 ? {
      rebook_range: {
        min: Math.min(...leaderboardForVariance.map(p => p.rebook_rate).filter(v => v != null)),
        max: Math.max(...leaderboardForVariance.map(p => p.rebook_rate).filter(v => v != null)),
        spread: null,
      },
      interval_range: {
        min: Math.min(...leaderboardForVariance.filter(p => p.active_avg_interval).map(p => p.active_avg_interval)),
        max: Math.max(...leaderboardForVariance.filter(p => p.active_avg_interval).map(p => p.active_avg_interval)),
        spread: null,
      },
      retention_range: {
        min: Math.min(...leaderboardForVariance.map(p => p.retention_pct)),
        max: Math.max(...leaderboardForVariance.map(p => p.retention_pct)),
        spread: null,
      },
    } : null
    if (providerVariance) {
      providerVariance.rebook_range.spread = providerVariance.rebook_range.max - providerVariance.rebook_range.min
      providerVariance.interval_range.spread = providerVariance.interval_range.max - providerVariance.interval_range.min
      providerVariance.retention_range.spread = providerVariance.retention_range.max - providerVariance.retention_range.min
    }

    // 4. Patient list (paginated, filterable)
    // Search: views no longer have PII columns — search blvd_clients first
    let searchClientIds = null
    if (search) {
      const q = `%${search}%`
      const conditions = [`name.ilike.${q}`]
      const phoneHash = hashPhone(search)
      const emailHash = hashEmail(search)
      if (phoneHash) conditions.push(`phone_hash_v1.eq.${phoneHash}`)
      if (emailHash) conditions.push(`email_hash_v1.eq.${emailHash}`)
      const { data: matchingClients } = await db
        .from('blvd_clients')
        .select('id')
        .or(conditions.join(','))
      searchClientIds = (matchingClients || []).map(c => c.id)
    }

    let patientQuery = db
      .from('client_tox_summary')
      .select('*', { count: 'exact' })

    if (segment) {
      patientQuery = patientQuery.eq('tox_segment', segment)
    }
    if (location && location !== 'all') {
      patientQuery = patientQuery.eq('last_location_key', location)
    }
    if (provider) {
      patientQuery = patientQuery.eq('last_provider_staff_id', provider)
    }
    if (search) {
      if (searchClientIds && searchClientIds.length > 0) {
        patientQuery = patientQuery.in('client_id', searchClientIds)
      } else {
        patientQuery = patientQuery.eq('client_id', '00000000-0000-0000-0000-000000000000')
      }
    }
    if (tox_type) {
      patientQuery = patientQuery.eq('primary_tox_type', tox_type)
    }
    if (min_visits) {
      patientQuery = patientQuery.gte('tox_visits', parseInt(min_visits, 10))
    }

    // Sort (name_asc no longer available in view)
    const sortMap = {
      days_desc: ['days_since_last_tox', { ascending: false }],
      days_asc: ['days_since_last_tox', { ascending: true }],
      spend_desc: ['total_tox_spend', { ascending: false }],
      spend_asc: ['total_tox_spend', { ascending: true }],
      visits_desc: ['tox_visits', { ascending: false }],
      visits_asc: ['tox_visits', { ascending: true }],
    }
    const [sortCol, sortOpts] = sortMap[sort] || sortMap.days_desc
    patientQuery = patientQuery.order(sortCol, sortOpts)

    const { data: patients, count: patientCount, error: patientErr } = await patientQuery
      .range(offset, offset + pageSize - 1)

    if (patientErr) throw patientErr

    // Enrich with client names + provider names
    const patientClientIds = (patients || []).map(p => p.client_id).filter(Boolean)
    const patientProviderIds = [...new Set((patients || []).map((p) => p.last_provider_staff_id).filter(Boolean))]
    let clientInfoMap = {}
    let patientStaffLookup = {}

    const enrichPromises = []
    if (patientClientIds.length > 0) {
      enrichPromises.push(
        db.from('blvd_clients')
          .select('id, boulevard_id')
          .in('id', patientClientIds)
          .then(({ data }) => {
            for (const c of (data || [])) clientInfoMap[c.id] = c
          })
      )
    }
    if (patientProviderIds.length > 0) {
      enrichPromises.push(
        db.from('staff')
          .select('id, name')
          .in('id', patientProviderIds)
          .then(({ data }) => {
            patientStaffLookup = Object.fromEntries((data || []).map((s) => [s.id, s.name]))
          })
      )
    }
    await Promise.all(enrichPromises)

    const patient_list = (patients || []).map((p) => {
      const ci = clientInfoMap[p.client_id]
      return {
        client_id: p.client_id,
        boulevard_id: ci?.boulevard_id || p.boulevard_id || null,
        tox_visits: p.tox_visits,
        last_tox_visit: p.last_tox_visit,
        days_since_last_tox: p.days_since_last_tox,
        tox_segment: p.tox_segment,
        primary_tox_type: p.primary_tox_type,
        last_tox_type: p.last_tox_type,
        tox_switching: p.tox_switching,
        total_tox_spend: Number(p.total_tox_spend || 0),
        avg_interval_days: p.avg_tox_interval_days,
        provider_name: patientStaffLookup[p.last_provider_staff_id] || null,
        location: p.last_location_key,
      }
    })

    return res.json({
      summary,
      tox_types,
      provider_leaderboard,
      provider_variance: providerVariance,
      patients: {
        data: patient_list,
        total: patientCount || 0,
        page: pageNum,
        page_size: pageSize,
      },
    })
  } catch (err) {
    console.error('[intelligence/tox]', err)
    return res.status(500).json({ error: err.message })
  }
}

function guessToxBrand(serviceName) {
  const name = (serviceName || '').toLowerCase()
  if (name.includes('botox')) return 'Botox'
  if (name.includes('dysport')) return 'Dysport'
  if (name.includes('jeuveau')) return 'Jeuveau'
  if (name.includes('daxxify')) return 'Daxxify'
  if (name.includes('xeomin')) return 'Xeomin'
  return 'Neurotoxin'
}

// Container services list all brand names (e.g. "Botox, Dysport, Jeuveau, Daxxify Treatment").
// Add-ons mention exactly one brand. Container = 2+ brand mentions.
const TOX_BRANDS = ['botox', 'dysport', 'jeuveau', 'daxxify', 'xeomin']

function isContainerService(serviceName) {
  const lower = (serviceName || '').toLowerCase()
  const brandCount = TOX_BRANDS.filter((b) => lower.includes(b)).length
  return brandCount >= 2
}

function isFollowUp(serviceName) {
  const lower = (serviceName || '').toLowerCase()
  return lower.includes('post injection') || (lower.includes('follow') && lower.includes('up'))
}

export default withAdminAuth(handler)
