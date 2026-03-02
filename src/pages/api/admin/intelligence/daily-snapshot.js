import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

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

function keyForDay(ts) {
  if (!ts) return null
  return new Date(ts).toISOString().slice(0, 10)
}

function toSortedRows(map, mapFn, valueKey = 'amount') {
  return [...map.values()]
    .sort((a, b) => Number(b?.[valueKey] || 0) - Number(a?.[valueKey] || 0))
    .map(mapFn)
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
  giftCardOrders,
  memberships,
  packages,
  packagePriceMap,
}) {
  let serviceRevenue = 0
  let deferredRevenue = 0
  let deferredGiftCards = 0
  let deferredMemberships = 0
  let deferredPackages = 0
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

  // Gift card orders (no location field — only include for 'total' scope)
  for (const gc of (giftCardOrders || [])) {
    const ts = toTs(gc.created_at)
    if (!inRange(ts, start, end)) continue
    if (scope !== 'total') continue
    const amount = (Number(gc.amount_cents || 0) - Number(gc.discount_cents || 0)) / 100
    deferredGiftCards += amount
  }

  // Membership signups
  for (const m of (memberships || [])) {
    if (!matchesLocation(m.location_key, scope)) continue
    const ts = toTs(m.start_on)
    if (!inRange(ts, start, end)) continue
    deferredMemberships += Number(m.unit_price || 0) / 100
  }

  // Package purchases
  for (const p of (packages || [])) {
    if (!matchesLocation(p.location_key, scope)) continue
    const ts = toTs(p.purchased_at)
    if (!inRange(ts, start, end)) continue
    const price = (packagePriceMap || {})[p.name.toLowerCase().trim()] || 0
    deferredPackages += price / 100
  }

  deferredRevenue += deferredGiftCards + deferredMemberships + deferredPackages

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
    deferred_gift_cards: Math.round(deferredGiftCards),
    deferred_memberships: Math.round(deferredMemberships),
    deferred_packages: Math.round(deferredPackages),
    product_sales: Math.round(productSalesAmount),
    bookings,
    cancellations,
    cancellations_rescheduled_2w: cancellationsRescheduled2w,
    cancellation_reschedule_rate_pct: cancellationRescheduleRate,
  }
}

function computeWindowDetails({
  appointments,
  appointmentServices,
  productSales,
  scope,
  start,
  end,
  staffById,
  clientById,
}) {
  const apptById = new Map()
  const servicesByAppt = new Map()
  for (const appt of appointments) apptById.set(appt.id, appt)
  for (const svc of appointmentServices) {
    if (!servicesByAppt.has(svc.appointment_id)) servicesByAppt.set(svc.appointment_id, [])
    servicesByAppt.get(svc.appointment_id).push(svc)
  }

  const serviceByLocation = new Map()
  const serviceByProvider = new Map()
  const serviceByDay = new Map()
  const serviceByName = new Map()

  const productByLocation = new Map()
  const productByProvider = new Map()
  const productByDay = new Map()
  const productByName = new Map()

  const cancelByProvider = new Map()
  const cancelByService = new Map()
  const cancelByClient = new Map()
  const cancellationEvents = []

  const upsertRevenue = (map, key, amount, extra = {}) => {
    if (!key) return
    const current = map.get(key) || { key, amount: 0, ...extra }
    current.amount += Number(amount || 0)
    map.set(key, current)
  }

  const upsertCount = (map, key, extra = {}) => {
    if (!key) return
    const current = map.get(key) || { key, count: 0, ...extra }
    current.count += 1
    map.set(key, current)
  }

  for (const svc of appointmentServices) {
    const appt = apptById.get(svc.appointment_id)
    if (!appt) continue
    if (!matchesLocation(appt.location_key, scope)) continue
    if (!COMPLETED_STATES.has((appt.status || '').toLowerCase())) continue
    const startTs = toTs(appt.start_at)
    if (!inRange(startTs, start, end)) continue

    const amount = Number(svc.price || 0)
    const isDeferred = DEFERRED_REVENUE_RE.test(svc.service_name || '')
    if (isDeferred) continue

    const providerId = svc.provider_staff_id || null
    const providerName = providerId ? (staffById.get(providerId)?.name || 'Unknown') : 'Unassigned'
    const dayKey = keyForDay(startTs)
    const locationKey = appt.location_key || 'unknown'
    const serviceName = svc.service_name || 'Unknown Service'

    upsertRevenue(serviceByLocation, locationKey, amount, { location_key: locationKey })
    upsertRevenue(serviceByProvider, providerId || 'unassigned', amount, {
      provider_staff_id: providerId,
      provider_name: providerName,
      services: 0,
    })
    const p = serviceByProvider.get(providerId || 'unassigned')
    p.services += 1
    serviceByProvider.set(providerId || 'unassigned', p)
    upsertRevenue(serviceByDay, dayKey, amount, { date: dayKey })
    upsertRevenue(serviceByName, serviceName, amount, { service_name: serviceName, count: 0 })
    const s = serviceByName.get(serviceName)
    s.count += 1
    serviceByName.set(serviceName, s)
  }

  for (const row of productSales) {
    if (!matchesLocation(row.location_key, scope)) continue
    const soldTs = toTs(row.sold_at)
    if (!inRange(soldTs, start, end)) continue
    const amount = Number(row.net_sales || 0)
    const providerId = row.provider_staff_id || null
    const providerName = providerId
      ? (staffById.get(providerId)?.name || 'Unknown')
      : 'Unassigned'
    const dayKey = keyForDay(soldTs)
    const locationKey = row.location_key || 'unknown'
    const productName = row.product_name || 'Unknown Product'

    upsertRevenue(productByLocation, locationKey, amount, { location_key: locationKey })
    upsertRevenue(productByProvider, providerId || `name:${providerName}`, amount, {
      provider_staff_id: providerId,
      provider_name: providerName,
      quantity: 0,
    })
    const pp = productByProvider.get(providerId || `name:${providerName}`)
    pp.quantity += Number(row.quantity || 0)
    productByProvider.set(providerId || `name:${providerName}`, pp)
    upsertRevenue(productByDay, dayKey, amount, { date: dayKey })
    upsertRevenue(productByName, productName, amount, { product_name: productName, quantity: 0 })
    const pr = productByName.get(productName)
    pr.quantity += Number(row.quantity || 0)
    productByName.set(productName, pr)
  }

  for (const appt of appointments) {
    if (!matchesLocation(appt.location_key, scope)) continue
    const status = (appt.status || '').toLowerCase()
    if (!CANCELLED_STATES.has(status)) continue

    const cancelRef = toTs(appt.cancelled_at) ?? toTs(appt.updated_at) ?? toTs(appt.start_at)
    if (!inRange(cancelRef, start, end)) continue

    const apptServices = servicesByAppt.get(appt.id) || []
    const primaryService = apptServices[0]?.service_name || 'Unknown Service'
    const serviceNames = [...new Set(apptServices.map((s) => s.service_name).filter(Boolean))]
    const providerIds = [...new Set(apptServices.map((s) => s.provider_staff_id).filter(Boolean))]
    const providerName = providerIds[0] ? (staffById.get(providerIds[0])?.name || 'Unknown') : 'Unassigned'

    upsertCount(cancelByService, primaryService, { service_name: primaryService })
    upsertCount(cancelByProvider, providerIds[0] || 'unassigned', {
      provider_staff_id: providerIds[0] || null,
      provider_name: providerName,
    })
    const clientBlvdId = appt.client_id
      ? (clientById.get(appt.client_id)?.boulevard_id || null)
      : null

    if (appt.client_id) upsertCount(cancelByClient, appt.client_id, { client_id: appt.client_id, boulevard_id: clientBlvdId })

    cancellationEvents.push({
      appointment_id: appt.id,
      client_id: appt.client_id || null,
      boulevard_id: clientBlvdId,
      cancelled_at: new Date(cancelRef).toISOString(),
      location_key: appt.location_key || null,
      status,
      provider_name: providerName,
      provider_staff_id: providerIds[0] || null,
      service_name: primaryService,
      service_names: serviceNames,
    })
  }

  cancellationEvents.sort((a, b) => (b.cancelled_at || '').localeCompare(a.cancelled_at || ''))

  return {
    service_revenue_breakdown: {
      by_location: toSortedRows(serviceByLocation, (r) => ({ location_key: r.location_key, revenue: Math.round(r.amount) })),
      by_provider: toSortedRows(serviceByProvider, (r) => ({
        provider_staff_id: r.provider_staff_id,
        provider_name: r.provider_name,
        revenue: Math.round(r.amount),
        services: r.services,
      })),
      by_day: [...serviceByDay.values()]
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        .map((r) => ({ date: r.date, revenue: Math.round(r.amount) })),
      top_services: toSortedRows(serviceByName, (r) => ({ service_name: r.service_name, revenue: Math.round(r.amount), count: r.count }))
        .slice(0, 25),
    },
    product_revenue_breakdown: {
      by_location: toSortedRows(productByLocation, (r) => ({ location_key: r.location_key, revenue: Math.round(r.amount) })),
      by_provider: toSortedRows(productByProvider, (r) => ({
        provider_staff_id: r.provider_staff_id,
        provider_name: r.provider_name,
        revenue: Math.round(r.amount),
        quantity: r.quantity,
      })),
      by_day: [...productByDay.values()]
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        .map((r) => ({ date: r.date, revenue: Math.round(r.amount) })),
      top_products: toSortedRows(productByName, (r) => ({ product_name: r.product_name, revenue: Math.round(r.amount), quantity: r.quantity }))
        .slice(0, 25),
    },
    cancellation_report: {
      by_provider: [...cancelByProvider.values()]
        .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
        .map((r) => ({
          provider_staff_id: r.provider_staff_id,
          provider_name: r.provider_name,
          cancellations: r.count,
        })),
      by_service: [...cancelByService.values()]
        .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
        .map((r) => ({
          service_name: r.service_name,
          cancellations: r.count,
        })),
      top_clients: [...cancelByClient.values()]
        .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
        .slice(0, 25)
        .map((r) => ({
          client_id: r.client_id,
          boulevard_id: r.boulevard_id || null,
          cancellations: r.count,
        })),
      recent_events: cancellationEvents.slice(0, 50),
    },
  }
}

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { location = 'total' } = req.query
  const selectedLocation = ['total', 'westfield', 'carmel'].includes(location) ? location : 'total'
  const db = getServiceClient()

  try {
    const since = addDays(new Date(), -450).toISOString()

    const [appointments, appointmentServices, productSales, staffRows, clientRows, giftCardOrders, memberships, packages, packageCatalog] = await Promise.all([
      fetchAllRows(() =>
        db
          .from('blvd_appointments')
          .select('id, client_id, location_key, status, start_at, created_at, updated_at, cancelled_at')
          .gte('start_at', since)
      ),
      fetchAllRows(() =>
        db
          .from('blvd_appointment_services')
          .select('appointment_id, service_name, price, provider_staff_id')
      ),
      fetchAllRows(() =>
        db
          .from('blvd_product_sales')
          .select('sold_at, location_key, product_name, quantity, net_sales, provider_staff_id')
          .gte('sold_at', since)
      ),
      fetchAllRows(() =>
        db
          .from('staff')
          .select('id, name, title')
      ),
      fetchAllRows(() =>
        db
          .from('blvd_clients')
          .select('id, boulevard_id')
      ),
      // Deferred revenue sources
      fetchAllRows(() =>
        db
          .from('gift_card_orders')
          .select('id, amount_cents, discount_cents, payment_status, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', since)
      ),
      fetchAllRows(() =>
        db
          .from('blvd_memberships')
          .select('id, name, status, start_on, unit_price, location_key')
          .gte('start_on', since.slice(0, 10))
      ),
      fetchAllRows(() =>
        db
          .from('blvd_packages')
          .select('id, name, status, purchased_at, location_key')
          .gte('purchased_at', since)
      ),
      fetchAllRows(() =>
        db
          .from('blvd_package_catalog')
          .select('name, unit_price')
      ),
    ])

    // Build package catalog price lookup
    const packagePriceMap = Object.fromEntries(
      (packageCatalog || []).map((c) => [c.name.toLowerCase().trim(), c.unit_price || 0])
    )

    const staffById = new Map((staffRows || []).map((s) => [s.id, s]))
    const clientById = new Map((clientRows || []).map((c) => [c.id, c]))

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)

    const prevWeekStart = addDays(weekStart, -7)
    const prevWeekEnd = addDays(weekStart, -1)

    const dayOfMonth = now.getDate()
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)) // last day of prev month
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

    const deferredArgs = { giftCardOrders, memberships, packages, packagePriceMap }

    for (const scope of scopes) {
      const today = computeWindowMetrics({
        appointments, appointmentServices, productSales, scope,
        start: todayStart, end: todayEnd, clientFutureStarts, ...deferredArgs,
      })

      const week = computeWindowMetrics({
        appointments, appointmentServices, productSales, scope,
        start: weekStart, end: todayEnd, clientFutureStarts, ...deferredArgs,
      })

      const month = computeWindowMetrics({
        appointments, appointmentServices, productSales, scope,
        start: monthStart, end: todayEnd, clientFutureStarts, ...deferredArgs,
      })

      const previousWeek = computeWindowMetrics({
        appointments, appointmentServices, productSales, scope,
        start: prevWeekStart, end: prevWeekEnd, clientFutureStarts, ...deferredArgs,
      })

      const previousMonthToDate = computeWindowMetrics({
        appointments, appointmentServices, productSales, scope,
        start: prevMonthStart, end: prevMonthComparableEnd, clientFutureStarts, ...deferredArgs,
      })

      const lastMonth = computeWindowMetrics({
        appointments, appointmentServices, productSales, scope,
        start: prevMonthStart, end: prevMonthEnd, clientFutureStarts, ...deferredArgs,
      })

      const details = {
        today: computeWindowDetails({
          appointments,
          appointmentServices,
          productSales,
          scope,
          start: todayStart,
          end: todayEnd,
          staffById,
          clientById,
        }),
        week: computeWindowDetails({
          appointments,
          appointmentServices,
          productSales,
          scope,
          start: weekStart,
          end: todayEnd,
          staffById,
          clientById,
        }),
        month: computeWindowDetails({
          appointments,
          appointmentServices,
          productSales,
          scope,
          start: monthStart,
          end: todayEnd,
          staffById,
          clientById,
        }),
        lastMonth: computeWindowDetails({
          appointments,
          appointmentServices,
          productSales,
          scope,
          start: prevMonthStart,
          end: prevMonthEnd,
          staffById,
          clientById,
        }),
      }

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
        lastMonth,
        pace: {
          week_vs_last_week_pct: weekVsLastWeekPct,
          month_vs_last_month_to_date_pct: monthVsLastMonthToDatePct,
          week_service_revenue: week.service_revenue,
          previous_week_service_revenue: previousWeek.service_revenue,
          month_service_revenue: month.service_revenue,
          previous_month_to_date_service_revenue: previousMonthToDate.service_revenue,
        },
        details,
      }
    }

    return res.json({
      generated_at: new Date().toISOString(),
      selected_location: selectedLocation,
      metrics: metricsByScope,
      notes: {},
    })
  } catch (err) {
    console.error('[intelligence/daily-snapshot]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
