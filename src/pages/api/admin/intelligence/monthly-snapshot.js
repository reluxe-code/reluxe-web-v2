// src/pages/api/admin/intelligence/monthly-snapshot.js
// GET ?month=2026-02&location=total
// Returns monthly P&L: revenue breakdown, appointments by category/service,
// tox units by brand, COGS per service.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

const COMPLETED_STATES = new Set(['completed', 'final'])
const DEFERRED_REVENUE_RE = /(gift|package|membership|voucher|credit|pre[ -]?pay|deposit)/i
const GIFT_CARD_RE = /gift/i
const TOX_BRANDS = ['botox', 'dysport', 'jeuveau', 'daxxify', 'xeomin']

function deriveToxBrand(name) {
  const n = (name || '').toLowerCase()
  for (const b of TOX_BRANDS) {
    if (n.includes(b)) return b.charAt(0).toUpperCase() + b.slice(1)
  }
  return null
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

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { month, location = 'total' } = req.query
  const scope = ['total', 'westfield', 'carmel'].includes(location) ? location : 'total'

  // Parse month param (YYYY-MM)
  const now = new Date()
  let year, mo
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number)
    year = y
    mo = m - 1
  } else {
    // Default to previous month
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    year = prev.getFullYear()
    mo = prev.getMonth()
  }

  const monthStart = new Date(year, mo, 1)
  const monthEnd = new Date(year, mo + 1, 0, 23, 59, 59, 999)
  const monthStartISO = monthStart.toISOString()
  const monthEndISO = monthEnd.toISOString()
  const monthStartDate = monthStart.toISOString().slice(0, 10)
  const monthEndDate = monthEnd.toISOString().slice(0, 10)

  const db = getServiceClient()

  try {
    const [appointments, appointmentServices, productSales, giftCardOrders, membershipRows, toxUnits, cogsMapping, staffRows] = await Promise.all([
      fetchAllRows(() =>
        db.from('blvd_appointments')
          .select('id, client_id, location_key, status, start_at')
          .gte('start_at', monthStartISO)
          .lte('start_at', monthEndISO)
      ),
      fetchAllRows(() =>
        db.from('blvd_appointment_services')
          .select('appointment_id, service_name, service_slug, service_category, price, provider_staff_id')
      ),
      // Product sales — skincare, packages, and gift cards (all from Boulevard reports)
      fetchAllRows(() =>
        db.from('blvd_product_sales')
          .select('sold_at, location_key, product_name, category, quantity, net_sales, provider_staff_id')
          .gte('sold_at', monthStartISO)
          .lte('sold_at', monthEndISO)
      ),
      // Gift cards — our online Square-based system (in addition to Boulevard in-office)
      fetchAllRows(() =>
        db.from('gift_card_orders')
          .select('id, amount_cents, discount_cents, payment_status, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', monthStartISO)
          .lte('created_at', monthEndISO)
      ),
      // Memberships — ALL that were active during this month
      fetchAllRows(() =>
        db.from('blvd_memberships')
          .select('id, name, status, start_on, cancel_on, unit_price, interval, location_key')
          .lte('start_on', monthEndDate)
      ),
      fetchAllRows(() =>
        db.from('tox_unit_usage')
          .select('brand, location_key, units, cost_cents, service_date')
          .gte('service_date', monthStartDate)
          .lte('service_date', monthEndDate)
      ),
      fetchAllRows(() =>
        db.from('service_cogs').select('service_name, cogs_cents')
      ),
      fetchAllRows(() =>
        db.from('staff').select('id, name')
      ),
    ])

    const staffById = new Map((staffRows || []).map((s) => [s.id, s]))
    const cogsMap = Object.fromEntries(
      (cogsMapping || []).map((c) => [c.service_name, c.cogs_cents])
    )

    // Build appointment lookup
    const apptById = new Map()
    for (const a of appointments) apptById.set(a.id, a)

    // ── Revenue computation ──
    let serviceRevenue = 0
    let totalAppointments = 0
    const completedApptIds = new Set()

    const byCategory = new Map()
    const byService = new Map()

    for (const svc of appointmentServices) {
      const appt = apptById.get(svc.appointment_id)
      if (!appt) continue
      if (!matchesLocation(appt.location_key, scope)) continue
      if (!COMPLETED_STATES.has((appt.status || '').toLowerCase())) continue

      const price = Number(svc.price || 0)
      const isDeferred = DEFERRED_REVENUE_RE.test(svc.service_name || '')

      if (!isDeferred) {
        serviceRevenue += price
      }

      // Track unique completed appointments
      completedApptIds.add(appt.id)

      // Skip deferred for category/service breakdowns
      if (isDeferred) continue

      const slug = svc.service_slug || 'other'
      const serviceName = svc.service_name || 'Unknown Service'
      const providerId = svc.provider_staff_id || null
      const providerName = providerId ? (staffById.get(providerId)?.name || 'Unknown') : 'Unassigned'

      // By category — split tox into individual brands
      const isTox = slug === 'tox'
      const catKey = isTox ? (deriveToxBrand(serviceName) || 'tox') : slug
      if (!byCategory.has(catKey)) byCategory.set(catKey, { slug: catKey, count: 0, revenue: 0, cogs: 0 })
      const cat = byCategory.get(catKey)
      cat.count += 1
      cat.revenue += price

      // By service — for tox, roll up all lines into one brand row (count unique appointments)
      const svcKey = isTox ? catKey : serviceName
      if (!byService.has(svcKey)) byService.set(svcKey, { service_name: svcKey, slug, count: 0, revenue: 0, cogs: 0, cogs_per: 0, providers: new Set(), apptIds: new Set() })
      const svcRow = byService.get(svcKey)
      if (isTox) {
        svcRow.apptIds.add(appt.id)
        svcRow.count = svcRow.apptIds.size
      } else {
        svcRow.count += 1
      }
      svcRow.revenue += price
      svcRow.providers.add(providerName)

      // Apply COGS from manual mapping (non-tox services — values stored as dollars)
      const cogsDollars = cogsMap[serviceName]
      if (cogsDollars != null) {
        cat.cogs += cogsDollars
        svcRow.cogs += cogsDollars
        svcRow.cogs_per = cogsDollars
      }
    }

    totalAppointments = completedApptIds.size

    // ── Product revenue (skincare) + packages (deferred) + gift cards ──
    // blvd_product_sales.category: 'product' = skincare, 'package' = deferred, gift cards matched by name
    let productRevenue = 0
    let blvdGiftCards = 0
    let blvdGiftCardCount = 0
    let deferredPackages = 0
    let packageCount = 0

    for (const p of productSales) {
      if (!matchesLocation(p.location_key, scope)) continue
      const net = Number(p.net_sales || 0)
      const cat = (p.category || '').toLowerCase()
      const name = (p.product_name || '').toLowerCase()

      if (GIFT_CARD_RE.test(cat) || GIFT_CARD_RE.test(name)) {
        blvdGiftCards += net
        blvdGiftCardCount++
      } else if (cat === 'package') {
        deferredPackages += net
        packageCount++
      } else {
        productRevenue += net
      }
    }

    // ── Deferred revenue ──

    // Gift cards = Boulevard in-office + our online Square system
    let deferredGiftCards = blvdGiftCards
    let giftCardCount = blvdGiftCardCount
    for (const gc of (giftCardOrders || [])) {
      if (scope !== 'total') continue
      deferredGiftCards += (Number(gc.amount_cents || 0) - Number(gc.discount_cents || 0)) / 100
      giftCardCount++
    }

    // Memberships — count only those whose renewal day has passed this month.
    // Renewal day = day-of-month from start_on. For the current month, only count
    // if today >= renewal day. For completed past months, count all active.
    const todayDate = now.toISOString().slice(0, 10)
    const isCurrentMonth = monthStartDate <= todayDate && todayDate <= monthEndDate
    const todayDay = now.getDate()

    let deferredMemberships = 0
    let membershipCount = 0
    for (const m of (membershipRows || [])) {
      if (!matchesLocation(m.location_key, scope)) continue
      if (m.cancel_on && m.cancel_on < monthStartDate) continue
      const isMonthly = !m.interval || m.interval === 'P1M'
      if (!isMonthly) {
        if (m.start_on < monthStartDate || m.start_on > monthEndDate) continue
      }

      // For current month: only count if the membership's renewal day has passed
      if (isCurrentMonth && isMonthly) {
        const renewalDay = new Date(m.start_on + 'T00:00:00').getDate()
        if (todayDay < renewalDay) continue
      }

      deferredMemberships += Number(m.unit_price || 0) / 100
      membershipCount++
    }

    const deferredRevenue = Math.round(deferredGiftCards + deferredMemberships + deferredPackages)
    const totalRevenue = Math.round(serviceRevenue) + deferredRevenue + Math.round(productRevenue)

    // ── Tox units ──
    let toxUnitsTotal = 0
    let toxCostTotal = 0
    const toxByBrand = new Map()

    for (const t of (toxUnits || [])) {
      if (!matchesLocation(t.location_key, scope)) continue
      const units = Number(t.units || 0)
      const cost = Number(t.cost_cents || 0) / 100
      toxUnitsTotal += units
      toxCostTotal += cost

      const brand = t.brand || 'Unknown'
      if (!toxByBrand.has(brand)) toxByBrand.set(brand, { brand, units: 0, cost: 0 })
      const b = toxByBrand.get(brand)
      b.units += units
      b.cost += cost
    }

    // ── Apply tox COGS from inventory data into categories ──
    for (const [brand, tb] of toxByBrand) {
      const cat = byCategory.get(brand)
      if (cat) cat.cogs = tb.cost
    }

    // ── Format response ──
    const categoriesArr = [...byCategory.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .map((c) => ({
        slug: c.slug,
        count: c.count,
        revenue: Math.round(c.revenue),
        cogs: Math.round(c.cogs),
        margin: Math.round(c.revenue - c.cogs),
      }))

    const servicesArr = [...byService.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 50)
      .map((s) => ({
        service_name: s.service_name,
        slug: s.slug,
        count: s.count,
        revenue: Math.round(s.revenue),
        cogs: Math.round(s.cogs),
        cogs_per: s.cogs_per || 0,
        margin: Math.round(s.revenue - s.cogs),
        providers: [...s.providers].join(', '),
      }))

    const toxBrandsArr = [...toxByBrand.values()]
      .sort((a, b) => b.units - a.units)
      .map((b) => ({
        brand: b.brand,
        units: Math.round(b.units),
        cost: Math.round(b.cost),
        cost_per_unit: b.units > 0 ? Math.round((b.cost / b.units) * 100) / 100 : 0,
      }))

    return res.json({
      month: `${year}-${String(mo + 1).padStart(2, '0')}`,
      location: scope,
      summary: {
        total_revenue: totalRevenue,
        service_revenue: Math.round(serviceRevenue),
        deferred_revenue: deferredRevenue,
        product_revenue: Math.round(productRevenue),
        total_appointments: totalAppointments,
        tox_units_total: Math.round(toxUnitsTotal),
        tox_cost_total: Math.round(toxCostTotal),
      },
      deferred: {
        gift_cards: { revenue: Math.round(deferredGiftCards), count: giftCardCount },
        memberships: { revenue: Math.round(deferredMemberships), count: membershipCount },
        packages: { revenue: Math.round(deferredPackages), count: packageCount },
      },
      by_category: categoriesArr,
      by_service: servicesArr,
      tox_by_brand: toxBrandsArr,
    })
  } catch (err) {
    console.error('[intelligence/monthly-snapshot]', err.message)
    return res.status(500).json({ error: 'Failed to load monthly snapshot' })
  }
}

export default withAdminAuth(handler)
