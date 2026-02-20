import { getServiceClient } from '@/lib/supabase'

const CANCELLED_STATES = new Set(['cancelled', 'no_show'])
const ACTIVE_BOOKING_STATES = new Set(['booked', 'confirmed', 'arrived', 'started', 'completed', 'final'])
const COMPLETED_STATES = new Set(['completed', 'final'])
const DEFERRED_REVENUE_RE = /(gift|package|membership|voucher|credit|pre[ -]?pay|deposit)/i

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfWeek(d) {
  const x = startOfDay(d)
  const day = x.getDay() // 0 Sunday
  const diff = day === 0 ? -6 : 1 - day // Monday start
  x.setDate(x.getDate() + diff)
  return x
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfDay(d) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function toTs(v) {
  if (!v) return null
  const t = new Date(v).getTime()
  return Number.isFinite(t) ? t : null
}

function inRange(ts, start, end) {
  return ts !== null && ts >= start.getTime() && ts <= end.getTime()
}

function matchesLocation(recordLocation, scope) {
  if (scope === 'total') return true
  return recordLocation === scope
}

async function fetchAllRows(buildQuery, chunkSize = 1000, maxRows = 250000) {
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

function computeWindowMetrics({
  appointments,
  appointmentServices,
  productSales,
  scope,
  start,
  end,
  clientFutureStarts,
}) {
  let serviceRevenue = 0
  let deferredRevenue = 0
  let bookings = 0
  let cancellations = 0
  let cancellationsRescheduled2w = 0

  const apptById = new Map()
  for (const a of appointments) apptById.set(a.id, a)

  for (const svc of appointmentServices) {
    const appt = apptById.get(svc.appointment_id)
    if (!appt) continue
    if (!matchesLocation(appt.location_key, scope)) continue
    if (!COMPLETED_STATES.has((appt.status || '').toLowerCase())) continue

    const startTs = toTs(appt.start_at)
    if (!inRange(startTs, start, end)) continue

    const price = Number(svc.price || 0)
    if (DEFERRED_REVENUE_RE.test(svc.service_name || '')) deferredRevenue += price
    else serviceRevenue += price
  }

  for (const p of productSales) {
    if (!matchesLocation(p.location_key, scope)) continue
    const soldTs = toTs(p.sold_at)
    if (!inRange(soldTs, start, end)) continue

    const amount = Number(p.net_sales || 0)
    if (DEFERRED_REVENUE_RE.test(p.product_name || '')) deferredRevenue += amount
  }

  const productSalesAmount = productSales.reduce((sum, row) => {
    if (!matchesLocation(row.location_key, scope)) return sum
    const soldTs = toTs(row.sold_at)
    if (!inRange(soldTs, start, end)) return sum
    return sum + Number(row.net_sales || 0)
  }, 0)

  for (const appt of appointments) {
    if (!matchesLocation(appt.location_key, scope)) continue
    const status = (appt.status || '').toLowerCase()

    const createdTs = toTs(appt.created_at)
    if (createdTs && inRange(createdTs, start, end) && ACTIVE_BOOKING_STATES.has(status)) {
      bookings += 1
    }

    if (CANCELLED_STATES.has(status)) {
      const cancelRef = toTs(appt.cancelled_at) ?? toTs(appt.updated_at) ?? toTs(appt.start_at)
      if (inRange(cancelRef, start, end)) {
        cancellations += 1

        if (appt.client_id) {
          const futureStarts = clientFutureStarts.get(appt.client_id) || []
          const maxTs = addDays(new Date(cancelRef), 14).getTime()
          const hasReschedule = futureStarts.some((startAtTs) => startAtTs > cancelRef && startAtTs <= maxTs)
          if (hasReschedule) cancellationsRescheduled2w += 1
        }
      }
    }
  }

  const cancellationRescheduleRate = cancellations > 0
    ? Math.round((cancellationsRescheduled2w / cancellations) * 1000) / 10
    : 0

  return {
    service_revenue: Math.round(serviceRevenue),
    deferred_revenue: Math.round(deferredRevenue),
    product_sales: Math.round(productSalesAmount),
    bookings,
    cancellations,
    cancellations_rescheduled_2w: cancellationsRescheduled2w,
    cancellation_reschedule_rate_pct: cancellationRescheduleRate,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { location = 'total' } = req.query
  const selectedLocation = ['total', 'westfield', 'carmel'].includes(location) ? location : 'total'
  const db = getServiceClient()

  try {
    const since = addDays(new Date(), -450).toISOString()

    const [appointments, appointmentServices, productSales] = await Promise.all([
      fetchAllRows(() =>
        db
          .from('blvd_appointments')
          .select('id, client_id, location_key, status, start_at, created_at, updated_at, cancelled_at')
          .gte('start_at', since)
      ),
      fetchAllRows(() =>
        db
          .from('blvd_appointment_services')
          .select('appointment_id, service_name, price')
      ),
      fetchAllRows(() =>
        db
          .from('blvd_product_sales')
          .select('sold_at, location_key, product_name, net_sales')
          .gte('sold_at', since)
      ),
    ])

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)

    const prevWeekStart = addDays(weekStart, -7)
    const prevWeekEnd = addDays(weekStart, -1)

    const dayOfMonth = now.getDate()
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthComparableEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() - 1, dayOfMonth))

    const clientFutureStarts = new Map()
    for (const appt of appointments) {
      const status = (appt.status || '').toLowerCase()
      if (!ACTIVE_BOOKING_STATES.has(status)) continue
      const startTs = toTs(appt.start_at)
      if (!startTs || !appt.client_id) continue
      if (!clientFutureStarts.has(appt.client_id)) clientFutureStarts.set(appt.client_id, [])
      clientFutureStarts.get(appt.client_id).push(startTs)
    }

    for (const starts of clientFutureStarts.values()) {
      starts.sort((a, b) => a - b)
    }

    const scopes = ['total', 'westfield', 'carmel']
    const metricsByScope = {}

    for (const scope of scopes) {
      const today = computeWindowMetrics({
        appointments,
        appointmentServices,
        productSales,
        scope,
        start: todayStart,
        end: todayEnd,
        clientFutureStarts,
      })

      const week = computeWindowMetrics({
        appointments,
        appointmentServices,
        productSales,
        scope,
        start: weekStart,
        end: todayEnd,
        clientFutureStarts,
      })

      const month = computeWindowMetrics({
        appointments,
        appointmentServices,
        productSales,
        scope,
        start: monthStart,
        end: todayEnd,
        clientFutureStarts,
      })

      const previousWeek = computeWindowMetrics({
        appointments,
        appointmentServices,
        productSales,
        scope,
        start: prevWeekStart,
        end: prevWeekEnd,
        clientFutureStarts,
      })

      const previousMonthToDate = computeWindowMetrics({
        appointments,
        appointmentServices,
        productSales,
        scope,
        start: prevMonthStart,
        end: prevMonthComparableEnd,
        clientFutureStarts,
      })

      const weekVsLastWeekPct = previousWeek.service_revenue > 0
        ? Math.round(((week.service_revenue - previousWeek.service_revenue) / previousWeek.service_revenue) * 1000) / 10
        : 0

      const monthVsLastMonthToDatePct = previousMonthToDate.service_revenue > 0
        ? Math.round(((month.service_revenue - previousMonthToDate.service_revenue) / previousMonthToDate.service_revenue) * 1000) / 10
        : 0

      metricsByScope[scope] = {
        today,
        week,
        month,
        pace: {
          week_vs_last_week_pct: weekVsLastWeekPct,
          month_vs_last_month_to_date_pct: monthVsLastMonthToDatePct,
          week_service_revenue: week.service_revenue,
          previous_week_service_revenue: previousWeek.service_revenue,
          month_service_revenue: month.service_revenue,
          previous_month_to_date_service_revenue: previousMonthToDate.service_revenue,
        },
      }
    }

    return res.json({
      generated_at: new Date().toISOString(),
      selected_location: selectedLocation,
      metrics: metricsByScope,
      notes: {
        deferred_revenue_mode: 'heuristic_from_names',
        deferred_revenue_note: 'Gift cards/packages/membership deferred revenue is approximated via name matching until a dedicated liability ledger is synced.',
      },
    })
  } catch (err) {
    console.error('[intelligence/daily-snapshot]', err)
    return res.status(500).json({ error: err.message })
  }
}
