// src/pages/api/member/profile.js
// Fetches full member dashboard data for an authenticated member.
// Returns: summary stats, visit history, tox status, provider relationships,
// service categories, and recommendations.
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 15 }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired session' })

  const db = getServiceClient()

  const { data: member } = await db
    .from('members')
    .select('id, phone, first_name, last_name, email, interests, preferred_location, blvd_client_id, onboarded_at')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return res.status(404).json({ error: 'Member profile not found' })

  // Default response shape
  const result = {
    member,
    stats: null,
    lastService: null,
    upcomingAppointment: null,
    primaryProvider: null,
    // Rich data for drawer
    visits: [],
    toxStatus: null,
    providers: [],
    serviceCategories: [],
    recommendations: [],
    locationSplit: null,
  }

  if (!member.blvd_client_id) return res.json(result)

  const clientId = member.blvd_client_id

  // Run all queries in parallel
  const [visitSummary, toxSummary, appointments, upcomingAppts, allStaff, productSales] = await Promise.all([
    // 1. Visit summary
    db.from('client_visit_summary')
      .select('total_visits, total_spend, ltv_bucket, days_since_last_visit, first_visit, last_visit, avg_days_between_visits')
      .eq('client_id', clientId).maybeSingle().then(r => r.data).catch(() => null),

    // 2. Tox summary
    db.from('client_tox_summary')
      .select('tox_visits, total_tox_spend, days_since_last_tox, avg_tox_interval_days, primary_tox_type, last_tox_type, tox_segment, last_provider_staff_id, consultation_count, treatment_count, tox_switching')
      .eq('client_id', clientId).maybeSingle().then(r => r.data).catch(() => null),

    // 3. Last 20 completed appointments with services
    db.from('blvd_appointments')
      .select('id, start_at, location_key, blvd_appointment_services(service_name, service_slug, service_category, provider_staff_id, price, duration_minutes)')
      .eq('client_id', clientId).in('status', ['completed', 'final'])
      .order('start_at', { ascending: false }).limit(20)
      .then(r => r.data || []).catch(() => []),

    // 4. Upcoming appointments
    db.from('blvd_appointments')
      .select('id, start_at, location_key, blvd_appointment_services(service_name, service_slug, provider_staff_id)')
      .eq('client_id', clientId).in('status', ['booked', 'confirmed', 'arrived'])
      .gt('start_at', new Date().toISOString())
      .order('start_at', { ascending: true }).limit(5)
      .then(r => r.data || []).catch(() => []),

    // 5. All staff (for resolving names + Boulevard booking IDs)
    db.from('staff')
      .select('id, name, title, slug, featured_image, transparent_bg, boulevard_provider_id, boulevard_service_map')
      .then(r => r.data || []).catch(() => []),

    // 6. Product purchases
    db.from('blvd_product_sales')
      .select('product_name, brand, category, sku, quantity, unit_price, net_sales, sold_at, location_key')
      .eq('client_id', clientId)
      .order('sold_at', { ascending: false })
      .then(r => r.data || []).catch(() => []),
  ])

  // Staff lookup map
  const staffMap = {}
  for (const s of allStaff) staffMap[s.id] = s

  // ── Stats ──
  if (visitSummary) {
    const firstVisit = visitSummary.first_visit ? new Date(visitSummary.first_visit) : null
    const monthsWithUs = firstVisit ? Math.max(1, Math.round((Date.now() - firstVisit.getTime()) / (30.44 * 86400000))) : 0
    result.stats = {
      total_visits: visitSummary.total_visits || 0,
      total_spend: parseFloat(visitSummary.total_spend) || 0,
      ltv_bucket: visitSummary.ltv_bucket || 'low',
      days_since_last_visit: visitSummary.days_since_last_visit,
      avg_days_between_visits: visitSummary.avg_days_between_visits,
      first_visit: visitSummary.first_visit,
      last_visit: visitSummary.last_visit,
      months_with_us: monthsWithUs,
      total_treatments: appointments.reduce((sum, a) => sum + (a.blvd_appointment_services?.length || 0), 0),
    }
  }

  // ── Visit history (for drawer) ──
  const providerVisitCounts = {}
  const serviceSlugsUsed = new Set()

  for (const appt of appointments) {
    const services = (appt.blvd_appointment_services || []).map((svc) => {
      const staff = svc.provider_staff_id ? staffMap[svc.provider_staff_id] : null
      if (svc.provider_staff_id) {
        providerVisitCounts[svc.provider_staff_id] = (providerVisitCounts[svc.provider_staff_id] || 0) + 1
      }
      if (svc.service_slug) serviceSlugsUsed.add(svc.service_slug)
      return {
        name: svc.service_name,
        slug: svc.service_slug,
        category: svc.service_category,
        price: svc.price ? parseFloat(svc.price) : null,
        duration: svc.duration_minutes,
        provider: staff ? { name: staff.name, slug: staff.slug, image: staff.transparent_bg || staff.featured_image, staffId: staff.id, boulevardProviderId: staff.boulevard_provider_id } : null,
      }
    })

    result.visits.push({
      id: appt.id,
      date: appt.start_at,
      location: appt.location_key,
      services,
    })
  }

  // ── Location split ──
  const locCounts = {}
  for (const v of result.visits) {
    if (v.location) locCounts[v.location] = (locCounts[v.location] || 0) + 1
  }
  if (Object.keys(locCounts).length > 0) {
    const total = result.visits.length
    const entries = Object.entries(locCounts).sort((a, b) => b[1] - a[1])
    result.locationSplit = {
      primary: entries[0][0],
      locations: entries.map(([key, count]) => ({
        key,
        visits: count,
        pct: Math.round((count / total) * 100),
      })),
      multi: entries.length > 1,
    }
  }

  // ── Last service + primary provider (for hero card) ──
  if (result.visits.length > 0) {
    const lastVisit = result.visits[0]
    const svc = lastVisit.services[0]
    if (svc) {
      result.lastService = {
        name: svc.name,
        slug: svc.slug,
        date: lastVisit.date,
        location_key: lastVisit.location,
        provider: svc.provider,
      }
    }
  }

  // ── Upcoming appointment ──
  if (upcomingAppts.length > 0) {
    const next = upcomingAppts[0]
    const svc = next.blvd_appointment_services?.[0]
    const staff = svc?.provider_staff_id ? staffMap[svc.provider_staff_id] : null
    result.upcomingAppointment = {
      date: next.start_at,
      service: svc?.service_name || 'Appointment',
      slug: svc?.service_slug || null,
      location_key: next.location_key,
      provider: staff?.name || null,
    }
  }

  // ── Provider relationships ──
  const providerEntries = Object.entries(providerVisitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  for (const [staffId, count] of providerEntries) {
    const staff = staffMap[staffId]
    if (staff) {
      result.providers.push({
        name: staff.name,
        title: staff.title,
        slug: staff.slug,
        image: staff.transparent_bg || staff.featured_image,
        visit_count: count,
        staffId: staff.id,
        boulevardProviderId: staff.boulevard_provider_id,
        serviceMap: staff.boulevard_service_map,
      })
    }
  }

  if (result.providers.length > 0) {
    result.primaryProvider = result.providers[0]
  }

  // ── Service categories tried ──
  const SERVICE_LABELS = {
    tox: 'Tox', filler: 'Fillers', sculptra: 'Sculptra', facials: 'Facials & Peels',
    hydrafacial: 'HydraFacial', glo2facial: 'Glo2Facial', morpheus8: 'Morpheus8',
    microneedling: 'Microneedling', ipl: 'IPL Photofacial', 'laser-hair-removal': 'Laser Hair Removal',
    massage: 'Massage', 'co2-resurfacing': 'CO₂ Resurfacing', 'body-contouring': 'Body Contouring',
  }
  for (const slug of serviceSlugsUsed) {
    if (SERVICE_LABELS[slug]) {
      result.serviceCategories.push({ slug, label: SERVICE_LABELS[slug] })
    }
  }

  // ── Tox status ──
  if (toxSummary) {
    const staff = toxSummary.last_provider_staff_id ? staffMap[toxSummary.last_provider_staff_id] : null
    result.toxStatus = {
      segment: toxSummary.tox_segment,
      visits: toxSummary.tox_visits,
      days_since_last: toxSummary.days_since_last_tox,
      avg_interval: toxSummary.avg_tox_interval_days,
      primary_type: toxSummary.primary_tox_type,
      last_type: toxSummary.last_tox_type,
      switching: toxSummary.tox_switching,
      last_provider: staff ? { name: staff.name, slug: staff.slug, image: staff.transparent_bg || staff.featured_image, staffId: staff.id } : null,
    }
  }

  // ── Smart recommendations ──
  const allServices = Object.keys(SERVICE_LABELS)
  const tried = [...serviceSlugsUsed]
  const untried = allServices.filter((s) => !serviceSlugsUsed.has(s))

  // Tox-based recommendations
  if (toxSummary) {
    if (toxSummary.tox_segment === 'due' || toxSummary.tox_segment === 'overdue') {
      result.recommendations.push({
        type: 'rebook',
        title: toxSummary.tox_segment === 'due' ? 'Your tox is due' : 'You\'re overdue for tox',
        subtitle: `It's been ${toxSummary.days_since_last_tox} days since your last ${toxSummary.last_tox_type || 'tox'} session`,
        action: 'Book Tox',
        slug: 'tox',
      })
    }
  }

  // Cross-sell: if they do tox but not fillers
  if (serviceSlugsUsed.has('tox') && !serviceSlugsUsed.has('filler')) {
    result.recommendations.push({
      type: 'try_new',
      title: 'Complete your look',
      subtitle: 'Tox + filler combo is our most popular pairing. Most clients add fillers after their 3rd tox visit.',
      action: 'Explore Fillers',
      slug: 'filler',
    })
  }

  // If they do injectables but haven't tried skin treatments
  if ((serviceSlugsUsed.has('tox') || serviceSlugsUsed.has('filler')) && !serviceSlugsUsed.has('facials') && !serviceSlugsUsed.has('hydrafacial')) {
    result.recommendations.push({
      type: 'try_new',
      title: 'Elevate your skin',
      subtitle: 'A medical facial between injectable visits keeps your skin glowing year-round.',
      action: 'Explore Facials',
      slug: 'facials',
    })
  }

  // If hasn't tried morpheus8
  if (!serviceSlugsUsed.has('morpheus8') && (visitSummary?.total_visits || 0) >= 3) {
    result.recommendations.push({
      type: 'try_new',
      title: 'Ready for Morpheus8?',
      subtitle: 'Our #1 skin remodeling treatment. Tightens, smooths, and reverses aging at the cellular level.',
      action: 'Learn More',
      slug: 'morpheus8',
    })
  }

  // No-show risk: if avg visit cadence is known and they're past it
  if (visitSummary?.avg_days_between_visits && visitSummary?.days_since_last_visit) {
    const pastDue = visitSummary.days_since_last_visit - visitSummary.avg_days_between_visits
    if (pastDue > 14 && !result.recommendations.some(r => r.type === 'rebook')) {
      result.recommendations.push({
        type: 'rebook',
        title: 'We miss you',
        subtitle: `You usually visit every ${visitSummary.avg_days_between_visits} days. It's been ${visitSummary.days_since_last_visit}.`,
        action: 'Book Now',
        slug: null,
      })
    }
  }

  // ── Products purchased ──
  if (productSales.length > 0) {
    // Aggregate by product name + brand
    const productMap = {}
    let totalProductSpend = 0
    for (const sale of productSales) {
      const key = sale.sku || sale.product_name
      if (!productMap[key]) {
        productMap[key] = {
          name: sale.product_name,
          brand: sale.brand,
          category: sale.category,
          qty: 0,
          spend: 0,
          purchases: 0,
          last_purchased: sale.sold_at,
        }
      }
      productMap[key].qty += parseFloat(sale.quantity) || 0
      productMap[key].spend += parseFloat(sale.net_sales) || 0
      productMap[key].purchases += 1
      totalProductSpend += parseFloat(sale.net_sales) || 0
    }
    result.products = {
      total_spend: Math.round(totalProductSpend),
      total_purchases: productSales.length,
      items: Object.values(productMap)
        .sort((a, b) => b.purchases - a.purchases)
        .map(p => ({ ...p, qty: Math.round(p.qty), spend: Math.round(p.spend) })),
    }
  }

  res.json(result)
}
