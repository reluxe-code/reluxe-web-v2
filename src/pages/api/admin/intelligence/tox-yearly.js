// src/pages/api/admin/intelligence/tox-yearly.js
// Tox Yearly Report API — rolled-up annual metrics, quarterly breakdown, YoY comparison.
// GET ?year=2025&location=all|westfield|carmel
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

const TOX_BRANDS = ['botox', 'dysport', 'jeuveau', 'daxxify', 'xeomin']

function guessToxBrand(serviceName) {
  const name = (serviceName || '').toLowerCase()
  if (name.includes('botox')) return 'Botox'
  if (name.includes('dysport')) return 'Dysport'
  if (name.includes('jeuveau')) return 'Jeuveau'
  if (name.includes('daxxify')) return 'Daxxify'
  if (name.includes('xeomin')) return 'Xeomin'
  return 'Neurotoxin'
}

function isContainerService(serviceName) {
  const lower = (serviceName || '').toLowerCase()
  const brandCount = TOX_BRANDS.filter((b) => lower.includes(b)).length
  return brandCount >= 2
}

function isFollowUp(serviceName) {
  const lower = (serviceName || '').toLowerCase()
  return lower.includes('post injection') || (lower.includes('follow') && lower.includes('up'))
}

function quarterOf(month) {
  // month is 0-indexed (0=Jan)
  return Math.floor(month / 3) + 1
}

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { year: yearStr, location } = req.query
  const currentYear = new Date().getFullYear()
  const year = parseInt(yearStr, 10) || currentYear
  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31T23:59:59`
  const prevYear = year - 1
  const prevYearStart = `${prevYear}-01-01`
  const prevYearEnd = `${prevYear}-12-31T23:59:59`

  const db = getServiceClient()

  try {
    // 1. Fetch all tox appointment services for the selected year + previous year (for YoY)
    const [allToxRows, allToxUnits] = await Promise.all([
      fetchAllRows(() =>
        db
          .from('blvd_appointment_services')
          .select(`
            service_name,
            price,
            appointment_id,
            provider_staff_id,
            blvd_appointments!inner (
              client_id,
              status,
              location_key,
              start_at
            )
          `)
          .eq('service_slug', 'tox')
          .in('blvd_appointments.status', ['completed', 'final'])
          .gte('blvd_appointments.start_at', prevYearStart)
          .lte('blvd_appointments.start_at', yearEnd)
      ),
      // Fetch tox unit usage (COGS) for both years
      fetchAllRows(() =>
        db
          .from('tox_unit_usage')
          .select('brand, location_key, units, cost_cents, service_date')
          .gte('service_date', `${prevYear}-01-01`)
          .lte('service_date', `${year}-12-31`)
      ),
    ])

    // Filter by location
    let rows = allToxRows || []
    if (location && location !== 'all') {
      rows = rows.filter((r) => r.blvd_appointments?.location_key === location)
    }

    // Split into current year and previous year
    const currentYearRows = rows.filter((r) => r.blvd_appointments?.start_at >= yearStart && r.blvd_appointments?.start_at <= yearEnd)
    const prevYearRows = rows.filter((r) => r.blvd_appointments?.start_at >= prevYearStart && r.blvd_appointments?.start_at <= prevYearEnd)

    // Deduplicate appointments (multiple service lines per appointment)
    function dedupeAppts(serviceRows) {
      const map = {}
      for (const row of serviceRows) {
        if (isContainerService(row.service_name)) continue
        if (isFollowUp(row.service_name)) continue
        const aid = row.appointment_id
        if (!map[aid]) {
          map[aid] = {
            appointment_id: aid,
            provider_staff_id: row.provider_staff_id,
            price: 0,
            client_id: row.blvd_appointments?.client_id,
            start_at: row.blvd_appointments?.start_at,
            location_key: row.blvd_appointments?.location_key,
            service_name: row.service_name,
          }
        }
        map[aid].price += Number(row.price || 0)
      }
      return Object.values(map)
    }

    const currentAppts = dedupeAppts(currentYearRows)
    const prevAppts = dedupeAppts(prevYearRows)

    // ── COGS: Filter and split tox_unit_usage by year ──
    let toxUnits = allToxUnits || []
    if (location && location !== 'all') {
      toxUnits = toxUnits.filter((t) => t.location_key === location)
    }
    const currentUnits = toxUnits.filter((t) => t.service_date >= yearStart && t.service_date <= `${year}-12-31`)
    const prevUnits = toxUnits.filter((t) => t.service_date >= `${prevYear}-01-01` && t.service_date <= `${prevYear}-12-31`)

    // Aggregate COGS by brand for current year
    const cogsByBrand = {}
    let totalCogs = 0
    let totalUnitsUsed = 0
    for (const t of currentUnits) {
      const brand = t.brand || 'Unknown'
      const units = Number(t.units || 0)
      const cost = Number(t.cost_cents || 0) / 100
      totalCogs += cost
      totalUnitsUsed += units
      if (!cogsByBrand[brand]) cogsByBrand[brand] = { brand, units: 0, cost: 0 }
      cogsByBrand[brand].units += units
      cogsByBrand[brand].cost += cost
    }

    // Previous year COGS totals
    let prevTotalCogs = 0
    let prevTotalUnits = 0
    for (const t of prevUnits) {
      prevTotalCogs += Number(t.cost_cents || 0) / 100
      prevTotalUnits += Number(t.units || 0)
    }

    // 2. Current year summary
    const currentClients = new Set(currentAppts.map((a) => a.client_id).filter(Boolean))
    const prevClients = new Set(prevAppts.map((a) => a.client_id).filter(Boolean))
    const currentRevenue = currentAppts.reduce((s, a) => s + a.price, 0)
    const prevRevenue = prevAppts.reduce((s, a) => s + a.price, 0)

    // New patients this year = clients in current year who were NOT in the previous year
    const newClients = new Set([...currentClients].filter((c) => !prevClients.has(c)))
    // Returning patients = clients in current year who WERE also in previous year
    const returningClients = new Set([...currentClients].filter((c) => prevClients.has(c)))

    const grossMargin = Math.round(currentRevenue) - Math.round(totalCogs)

    const summary = {
      year,
      total_appointments: currentAppts.length,
      total_revenue: Math.round(currentRevenue),
      total_cogs: Math.round(totalCogs),
      gross_margin: grossMargin,
      margin_pct: currentRevenue > 0 ? Math.round((grossMargin / currentRevenue) * 100) : 0,
      total_units: Math.round(totalUnitsUsed),
      cost_per_unit: totalUnitsUsed > 0 ? Math.round((totalCogs / totalUnitsUsed) * 100) / 100 : 0,
      unique_clients: currentClients.size,
      new_clients: newClients.size,
      returning_clients: returningClients.size,
      avg_revenue_per_appt: currentAppts.length > 0 ? Math.round(currentRevenue / currentAppts.length) : 0,
      avg_revenue_per_client: currentClients.size > 0 ? Math.round(currentRevenue / currentClients.size) : 0,
    }

    // 3. Year-over-year comparison
    const prevGrossMargin = Math.round(prevRevenue) - Math.round(prevTotalCogs)
    const yoy = {
      prev_year: prevYear,
      prev_appointments: prevAppts.length,
      prev_revenue: Math.round(prevRevenue),
      prev_cogs: Math.round(prevTotalCogs),
      prev_margin: prevGrossMargin,
      prev_units: Math.round(prevTotalUnits),
      prev_unique_clients: prevClients.size,
      appt_change_pct: prevAppts.length > 0 ? Math.round(((currentAppts.length - prevAppts.length) / prevAppts.length) * 100) : null,
      revenue_change_pct: prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) : null,
      cogs_change_pct: prevTotalCogs > 0 ? Math.round(((totalCogs - prevTotalCogs) / prevTotalCogs) * 100) : null,
      margin_change_pct: prevGrossMargin > 0 ? Math.round(((grossMargin - prevGrossMargin) / prevGrossMargin) * 100) : null,
      units_change_pct: prevTotalUnits > 0 ? Math.round(((totalUnitsUsed - prevTotalUnits) / prevTotalUnits) * 100) : null,
      client_change_pct: prevClients.size > 0 ? Math.round(((currentClients.size - prevClients.size) / prevClients.size) * 100) : null,
    }

    // 4. Quarterly breakdown
    const quarters = [1, 2, 3, 4].map((q) => {
      const qAppts = currentAppts.filter((a) => {
        const m = new Date(a.start_at).getMonth()
        return quarterOf(m) === q
      })
      const qClients = new Set(qAppts.map((a) => a.client_id).filter(Boolean))
      const qRevenue = qAppts.reduce((s, a) => s + a.price, 0)

      // COGS for this quarter
      const qUnits = currentUnits.filter((t) => {
        const m = new Date(t.service_date).getMonth()
        return quarterOf(m) === q
      })
      const qCogs = qUnits.reduce((s, t) => s + Number(t.cost_cents || 0) / 100, 0)
      const qUnitsTotal = qUnits.reduce((s, t) => s + Number(t.units || 0), 0)
      const qMargin = Math.round(qRevenue) - Math.round(qCogs)

      // Previous year same quarter
      const pqAppts = prevAppts.filter((a) => {
        const m = new Date(a.start_at).getMonth()
        return quarterOf(m) === q
      })
      const pqRevenue = pqAppts.reduce((s, a) => s + a.price, 0)

      return {
        quarter: q,
        label: `Q${q} ${year}`,
        appointments: qAppts.length,
        revenue: Math.round(qRevenue),
        cogs: Math.round(qCogs),
        margin: qMargin,
        margin_pct: qRevenue > 0 ? Math.round((qMargin / qRevenue) * 100) : 0,
        units: Math.round(qUnitsTotal),
        unique_clients: qClients.size,
        avg_revenue_per_appt: qAppts.length > 0 ? Math.round(qRevenue / qAppts.length) : 0,
        // YoY for this quarter
        prev_appointments: pqAppts.length,
        prev_revenue: Math.round(pqRevenue),
        appt_change_pct: pqAppts.length > 0 ? Math.round(((qAppts.length - pqAppts.length) / pqAppts.length) * 100) : null,
        revenue_change_pct: pqRevenue > 0 ? Math.round(((qRevenue - pqRevenue) / pqRevenue) * 100) : null,
      }
    })

    // 5. Monthly breakdown (12 months)
    const months = []
    for (let m = 0; m < 12; m++) {
      const mStr = `${year}-${String(m + 1).padStart(2, '0')}`
      const mAppts = currentAppts.filter((a) => a.start_at?.startsWith(mStr))
      const mClients = new Set(mAppts.map((a) => a.client_id).filter(Boolean))
      const mRevenue = mAppts.reduce((s, a) => s + a.price, 0)

      // Previous year same month
      const pmStr = `${prevYear}-${String(m + 1).padStart(2, '0')}`
      const pmAppts = prevAppts.filter((a) => a.start_at?.startsWith(pmStr))
      const pmRevenue = pmAppts.reduce((s, a) => s + a.price, 0)

      // COGS for this month
      const mUnits = currentUnits.filter((t) => t.service_date?.startsWith(mStr))
      const mCogs = mUnits.reduce((s, t) => s + Number(t.cost_cents || 0) / 100, 0)
      const mUnitsTotal = mUnits.reduce((s, t) => s + Number(t.units || 0), 0)
      const mMargin = Math.round(mRevenue) - Math.round(mCogs)

      months.push({
        month: mStr,
        label: new Date(year, m, 1).toLocaleDateString('en-US', { month: 'short' }),
        appointments: mAppts.length,
        revenue: Math.round(mRevenue),
        cogs: Math.round(mCogs),
        margin: mMargin,
        units: Math.round(mUnitsTotal),
        unique_clients: mClients.size,
        prev_appointments: pmAppts.length,
        prev_revenue: Math.round(pmRevenue),
      })
    }

    // 6. Tox type breakdown for the year
    const toxTypeMap = {}
    const PRE_SWITCH_CUTOFF = '2024-06-01'
    for (const row of currentYearRows) {
      if (location && location !== 'all' && row.blvd_appointments?.location_key !== location) continue
      if (isContainerService(row.service_name)) continue
      if (isFollowUp(row.service_name)) continue
      const name = row.blvd_appointments?.start_at < PRE_SWITCH_CUTOFF
        ? 'Jeuveau'
        : guessToxBrand(row.service_name)
      if (!toxTypeMap[name]) toxTypeMap[name] = { name, appointments: new Set(), revenue: 0, clients: new Set() }
      toxTypeMap[name].appointments.add(row.appointment_id)
      toxTypeMap[name].revenue += Number(row.price || 0)
      if (row.blvd_appointments?.client_id) toxTypeMap[name].clients.add(row.blvd_appointments.client_id)
    }

    const tox_types = Object.values(toxTypeMap)
      .map((t) => {
        const brandCogs = cogsByBrand[t.name]
        const cogs = brandCogs ? Math.round(brandCogs.cost) : 0
        const units = brandCogs ? Math.round(brandCogs.units) : 0
        const revenue = Math.round(t.revenue)
        return {
          name: t.name,
          bookings: t.appointments.size,
          revenue,
          unique_clients: t.clients.size,
          cogs,
          units,
          margin: revenue - cogs,
          cost_per_unit: units > 0 ? Math.round((cogs / units) * 100) / 100 : 0,
        }
      })
      .sort((a, b) => b.bookings - a.bookings)

    // 7. Provider leaderboard for the year
    const providerMap = {}
    for (const appt of currentAppts) {
      const pid = appt.provider_staff_id
      if (!pid) continue
      if (!providerMap[pid]) providerMap[pid] = {
        staff_id: pid, appointments: 0, revenue: 0,
        clients: new Set(), clientVisits: {},
      }
      providerMap[pid].appointments++
      providerMap[pid].revenue += appt.price
      if (appt.client_id) {
        providerMap[pid].clients.add(appt.client_id)
        // Track visits per client for rebook + interval
        if (!providerMap[pid].clientVisits[appt.client_id]) providerMap[pid].clientVisits[appt.client_id] = []
        providerMap[pid].clientVisits[appt.client_id].push(new Date(appt.start_at).getTime())
      }
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

    const provider_leaderboard = Object.values(providerMap)
      .map((p) => {
        // Rebook rate: for each client with multiple visits, all but last count as "rebooked"
        let rebookTotal = 0
        let rebookCount = 0
        const intervals = []
        for (const [, dates] of Object.entries(p.clientVisits)) {
          dates.sort((a, b) => a - b)
          rebookTotal += dates.length
          if (dates.length > 1) {
            rebookCount += dates.length - 1
            for (let i = 1; i < dates.length; i++) {
              const gap = Math.round((dates[i] - dates[i - 1]) / 86400000)
              if (gap > 0 && gap < 365) intervals.push(gap)
            }
          }
        }

        const rebookRate = rebookTotal > 0 ? Math.round((rebookCount / rebookTotal) * 100) : null
        const avgInterval = intervals.length > 0
          ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
          : null

        // Quarterly revenue for sparkline
        const quarterlyRevenue = [1, 2, 3, 4].map((q) => {
          const qAppts = currentAppts.filter((a) => {
            if (a.provider_staff_id !== p.staff_id) return false
            const m = new Date(a.start_at).getMonth()
            return quarterOf(m) === q
          })
          return { quarter: q, revenue: Math.round(qAppts.reduce((s, a) => s + a.price, 0)), appointments: qAppts.length }
        })

        return {
          staff_id: p.staff_id,
          name: staffLookup[p.staff_id]?.name || 'Unknown',
          title: staffLookup[p.staff_id]?.title || '',
          appointments: p.appointments,
          unique_clients: p.clients.size,
          total_revenue: Math.round(p.revenue),
          avg_revenue_per_appt: p.appointments > 0 ? Math.round(p.revenue / p.appointments) : 0,
          rebook_rate: rebookRate,
          avg_interval_days: avgInterval,
          visits_per_client: p.clients.size > 0 ? Math.round((p.appointments / p.clients.size) * 10) / 10 : null,
          quarterly: quarterlyRevenue,
        }
      })
      .sort((a, b) => b.total_revenue - a.total_revenue)

    // 8. Current segment health (real-time snapshot, not year-specific)
    const toxClients = await fetchAllRows(() =>
      db
        .from('client_tox_summary')
        .select('client_id, tox_segment, last_location_key')
    )

    let segmentRows = toxClients || []
    if (location && location !== 'all') {
      segmentRows = segmentRows.filter((r) => r.last_location_key === location)
    }

    const total = segmentRows.length
    const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0
    const onSchedule = segmentRows.filter((r) => r.tox_segment === 'on_schedule').length
    const due = segmentRows.filter((r) => r.tox_segment === 'due').length
    const overdue = segmentRows.filter((r) => r.tox_segment === 'overdue').length
    const probablyLost = segmentRows.filter((r) => r.tox_segment === 'probably_lost').length
    const lost = segmentRows.filter((r) => r.tox_segment === 'lost').length

    const current_segments = {
      total,
      on_schedule: onSchedule,
      on_schedule_pct: pct(onSchedule),
      due,
      due_pct: pct(due),
      overdue,
      overdue_pct: pct(overdue),
      probably_lost: probablyLost,
      probably_lost_pct: pct(probablyLost),
      lost,
      lost_pct: pct(lost),
    }

    // 9. Available years (for dropdown)
    const { data: yearRange } = await db
      .from('blvd_appointment_services')
      .select('blvd_appointments!inner(start_at)')
      .eq('service_slug', 'tox')
      .in('blvd_appointments.status', ['completed', 'final'])
      .order('blvd_appointments(start_at)', { ascending: true })
      .limit(1)

    const { data: yearRangeMax } = await db
      .from('blvd_appointment_services')
      .select('blvd_appointments!inner(start_at)')
      .eq('service_slug', 'tox')
      .in('blvd_appointments.status', ['completed', 'final'])
      .order('blvd_appointments(start_at)', { ascending: false })
      .limit(1)

    const minYear = yearRange?.[0]?.blvd_appointments?.start_at
      ? new Date(yearRange[0].blvd_appointments.start_at).getFullYear()
      : currentYear - 2
    const maxYear = yearRangeMax?.[0]?.blvd_appointments?.start_at
      ? new Date(yearRangeMax[0].blvd_appointments.start_at).getFullYear()
      : currentYear

    const available_years = []
    for (let y = maxYear; y >= minYear; y--) {
      available_years.push(y)
    }

    // COGS by brand (for dedicated table)
    const cogs_by_brand = Object.values(cogsByBrand)
      .map((b) => ({
        brand: b.brand,
        units: Math.round(b.units),
        cost: Math.round(b.cost),
        cost_per_unit: b.units > 0 ? Math.round((b.cost / b.units) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.cost - a.cost)

    return res.json({
      summary,
      yoy,
      quarters,
      months,
      tox_types,
      cogs_by_brand,
      provider_leaderboard,
      current_segments,
      available_years,
    })
  } catch (err) {
    console.error('[intelligence/tox-yearly]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
