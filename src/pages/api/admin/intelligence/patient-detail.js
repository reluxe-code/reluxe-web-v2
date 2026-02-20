// src/pages/api/admin/intelligence/patient-detail.js
// Detailed patient profile for intelligence drawer.
// GET ?client_id=<uuid>
import { getServiceClient } from '@/lib/supabase'

function collapseServicesForDisplay(services = []) {
  const toxRows = services.filter((s) => s.slug === 'tox')
  const nonTox = services.filter((s) => s.slug !== 'tox')

  if (toxRows.length === 0) return services

  const toxTotal = toxRows.reduce((sum, s) => sum + Number(s.price || 0), 0)
  const toxNames = Array.from(new Set(toxRows.map((s) => s.name).filter(Boolean)))

  return [
    {
      name: toxNames.length > 0 ? `Tox (${toxNames.length} items)` : 'Tox',
      slug: 'tox',
      price: Math.round(toxTotal),
      provider_staff_id: toxRows.find((s) => s.provider_staff_id)?.provider_staff_id || null,
      collapsed: true,
    },
    ...nonTox,
  ]
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { client_id, window_days = '365' } = req.query
  if (!client_id) return res.status(400).json({ error: 'client_id required' })

  const db = getServiceClient()
  const windowDays = window_days === 'all' ? null : Math.max(1, parseInt(window_days, 10) || 365)
  const sinceIso = windowDays ? new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString() : null

  try {
    let appointmentServicesQuery = db
      .from('blvd_appointment_services')
      .select(`
        appointment_id,
        service_name,
        service_slug,
        price,
        provider_staff_id,
        blvd_appointments!inner (
          id,
          client_id,
          status,
          start_at,
          end_at,
          location_key
        )
      `)
      .eq('blvd_appointments.client_id', client_id)
      .order('blvd_appointments(start_at)', { ascending: false })
      .limit(5000)

    if (sinceIso) appointmentServicesQuery = appointmentServicesQuery.gte('blvd_appointments.start_at', sinceIso)

    let productSalesQuery = db
      .from('blvd_product_sales')
      .select('sold_at, order_id, provider_staff_id, product_name, sku, quantity, net_sales')
      .eq('client_id', client_id)
      .order('sold_at', { ascending: false })
      .limit(1000)

    if (sinceIso) productSalesQuery = productSalesQuery.gte('sold_at', sinceIso)

    const [
      clientSummaryRes,
      appointmentServicesRes,
      upcomingAppointmentsRes,
      productSalesRes,
      staffRowsRes,
    ] = await Promise.all([
      db
        .from('client_visit_summary')
        .select('*')
        .eq('client_id', client_id)
        .single(),
      appointmentServicesQuery,
      db
        .from('blvd_appointments')
        .select('id, status, start_at, end_at, location_key')
        .eq('client_id', client_id)
        .in('status', ['booked', 'confirmed', 'arrived'])
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(20),
      productSalesQuery,
      db
        .from('staff')
        .select('id, name, title')
        .limit(1000),
    ])

    if (clientSummaryRes.error) throw clientSummaryRes.error
    if (appointmentServicesRes.error) throw appointmentServicesRes.error
    if (upcomingAppointmentsRes.error) throw upcomingAppointmentsRes.error
    if (productSalesRes.error) throw productSalesRes.error
    if (staffRowsRes.error) throw staffRowsRes.error

    const summary = clientSummaryRes.data
    const appointmentRows = appointmentServicesRes.data || []
    const upcomingAppointments = upcomingAppointmentsRes.data || []
    const productRows = productSalesRes.data || []
    const staffRows = staffRowsRes.data || []

    const staffById = new Map(staffRows.map((s) => [s.id, s]))

    const appointmentsById = new Map()
    const providerAgg = new Map()

    for (const row of appointmentRows) {
      const appt = row.blvd_appointments
      if (!appt?.id) continue

      if (!appointmentsById.has(appt.id)) {
        appointmentsById.set(appt.id, {
          appointment_id: appt.id,
          date: appt.start_at,
          end_at: appt.end_at,
          status: appt.status,
          location: appt.location_key,
          total: 0,
          services: [],
          provider_ids: new Set(),
        })
      }

      const item = appointmentsById.get(appt.id)
      const price = Number(row.price || 0)
      item.total += price
      item.services.push({
        name: row.service_name,
        slug: row.service_slug,
        price,
        provider_staff_id: row.provider_staff_id,
      })

      if (row.provider_staff_id) {
        item.provider_ids.add(row.provider_staff_id)

        if (!providerAgg.has(row.provider_staff_id)) {
          providerAgg.set(row.provider_staff_id, {
            provider_staff_id: row.provider_staff_id,
            visits: 0,
            services: 0,
            revenue: 0,
            last_seen: appt.start_at,
          })
        }

        const provider = providerAgg.get(row.provider_staff_id)
        provider.services += 1
        provider.revenue += price
        if (new Date(appt.start_at) > new Date(provider.last_seen)) {
          provider.last_seen = appt.start_at
        }
      }
    }

    const appointmentHistory = Array.from(appointmentsById.values())
      .map((appt) => {
        for (const pid of appt.provider_ids) {
          const provider = providerAgg.get(pid)
          if (provider) provider.visits += 1
        }

        const providerNames = Array.from(appt.provider_ids)
          .map((id) => staffById.get(id)?.name)
          .filter(Boolean)

        return {
          ...appt,
          provider_ids: undefined,
          providers: providerNames,
          total: Math.round(appt.total),
          services: collapseServicesForDisplay(appt.services),
        }
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    const providersSeen = Array.from(providerAgg.values())
      .map((provider) => ({
        ...provider,
        provider_name: staffById.get(provider.provider_staff_id)?.name || 'Unknown',
        provider_title: staffById.get(provider.provider_staff_id)?.title || '',
        revenue: Math.round(provider.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue)

    const productsByKey = new Map()
    let totalProductSpend = 0
    let totalProductUnits = 0

    for (const row of productRows) {
      const key = row.sku || row.product_name || 'unknown'
      const qty = Number(row.quantity || 0)
      const sales = Number(row.net_sales || 0)
      totalProductSpend += sales
      totalProductUnits += qty

      if (!productsByKey.has(key)) {
        productsByKey.set(key, {
          sku_key: key,
          sku: row.sku,
          product_name: row.product_name,
          qty: 0,
          spend: 0,
          purchase_count: 0,
          last_purchased_at: row.sold_at,
        })
      }

      const product = productsByKey.get(key)
      product.qty += qty
      product.spend += sales
      product.purchase_count += 1
      if (new Date(row.sold_at) > new Date(product.last_purchased_at)) {
        product.last_purchased_at = row.sold_at
      }
    }

    const productsPurchased = Array.from(productsByKey.values())
      .map((p) => ({
        ...p,
        qty: Math.round(p.qty * 10) / 10,
        spend: Math.round(p.spend),
      }))
      .sort((a, b) => b.spend - a.spend)

    const appointmentRevenue = appointmentHistory.reduce((sum, row) => sum + Number(row.total || 0), 0)

    const client = {
      client_id: summary.client_id,
      name: summary.name || [summary.first_name, summary.last_name].filter(Boolean).join(' ') || 'Unknown',
      email: summary.email,
      phone: summary.phone,
      ltv_bucket: summary.ltv_bucket,
      total_visits: summary.total_visits,
      total_spend: Math.round(Number(summary.total_spend || 0)),
      first_visit: summary.first_visit,
      last_visit: summary.last_visit,
      days_since_last_visit: summary.days_since_last_visit,
      avg_days_between_visits: summary.avg_days_between_visits,
      locations_visited: summary.locations_visited,
    }

    const insightSummary = {
      appointment_revenue: Math.round(appointmentRevenue),
      product_spend: Math.round(totalProductSpend),
      product_units: Math.round(totalProductUnits * 10) / 10,
      providers_seen: providersSeen.length,
      upcoming_appointments: upcomingAppointments.length,
      first_seen_days_ago: summary.first_visit
        ? Math.floor((Date.now() - new Date(summary.first_visit).getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }

    return res.json({
      filters: {
        window_days: windowDays || 'all',
      },
      client,
      insight_summary: insightSummary,
      upcoming_appointments: upcomingAppointments,
      appointment_history: appointmentHistory,
      providers_seen: providersSeen,
      products_purchased: productsPurchased,
    })
  } catch (err) {
    console.error('[intelligence/patient-detail]', err)
    return res.status(500).json({ error: err.message })
  }
}
