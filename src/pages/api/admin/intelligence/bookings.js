// src/pages/api/admin/intelligence/bookings.js
// Unified bookings list: online (booking_sessions) + in-office (blvd_appointments).
import { getServiceClient } from '@/lib/supabase'

function deriveSource(pagePath) {
  if (!pagePath) return 'Unknown'
  if (pagePath === '/today') return 'Today Widget'
  if (pagePath.includes('/reveal')) return 'Reveal Board'
  if (pagePath.startsWith('/services/')) return 'Service Page'
  if (pagePath.startsWith('/team/')) return 'Provider Page'
  if (pagePath.startsWith('/locations/')) return 'Location Page'
  if (pagePath === '/') return 'Homepage'
  if (pagePath.startsWith('/start')) return 'Start Flow'
  return 'Other'
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const {
    since = '30d',
    source = 'all',
    location = '',
    provider = '',
    search = '',
    page = '1',
    per_page = '50',
  } = req.query

  const pageNum = Math.max(parseInt(page) || 1, 1)
  const perPage = Math.min(Math.max(parseInt(per_page) || 50, 1), 100)

  // Resolve date range
  let sinceDate
  if (since === '24h') sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
  else if (since === '7d') sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  else if (since === '30d') sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  else if (since === '90d') sinceDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  else sinceDate = new Date(since)

  const sinceISO = sinceDate.toISOString()
  const db = getServiceClient()

  try {
    const merged = []

    // ── Online bookings (completed booking_sessions) ──
    if (source === 'all' || source === 'online') {
      let q = db
        .from('booking_sessions')
        .select('*')
        .eq('outcome', 'completed')
        .gte('started_at', sinceISO)
        .order('completed_at', { ascending: false })

      if (location) q = q.eq('location_key', location)
      if (provider) q = q.ilike('provider_name', `%${provider}%`)

      const { data: sessions, error } = await q
      if (error) throw error

      for (const s of sessions || []) {
        const src = deriveSource(s.page_path)
        if (search && !matchesSearch(s, search)) continue

        merged.push({
          id: s.session_id,
          type: 'online',
          booked_at: s.completed_at || s.started_at,
          appointment_at: null, // not stored in booking_sessions
          service: s.service_name || null,
          provider: s.provider_name || null,
          location: s.location_key || null,
          client_name: s.contact_email || s.contact_phone || (s.member_id ? 'Member' : 'Anonymous'),
          source: src,
          flow_type: s.flow_type,
          page_path: s.page_path,
          duration_ms: s.duration_ms,
          session_id: s.session_id,
          blvd_appointment_id: null,
          steps_visited: s.steps_visited,
          step_count: s.step_count,
        })
      }
    }

    // ── In-office bookings (blvd_appointments) ──
    if (source === 'all' || source === 'in_office') {
      let q = db
        .from('blvd_appointments')
        .select(`
          *,
          blvd_clients ( name, first_name, last_name, email, phone ),
          blvd_appointment_services ( service_name, service_slug, provider_staff_id, price, duration_minutes, provider_boulevard_id )
        `)
        .in('status', ['booked', 'confirmed', 'arrived', 'started', 'completed'])
        .gte('start_at', sinceISO)
        .order('start_at', { ascending: false })

      if (location) q = q.eq('location_key', location)

      const { data: appointments, error } = await q
      if (error) throw error

      // Fetch staff names for provider mapping
      const { data: staffRows } = await db.from('staff').select('id, name, slug')
      const staffById = new Map()
      for (const s of staffRows || []) staffById.set(s.id, s)

      for (const appt of appointments || []) {
        const services = appt.blvd_appointment_services || []
        const client = appt.blvd_clients
        const primaryService = services[0]
        const providerStaffId = primaryService?.provider_staff_id
        const providerInfo = providerStaffId ? staffById.get(providerStaffId) : null
        const providerName = providerInfo?.name || null
        const serviceName = services.map(s => s.service_name).filter(Boolean).join(', ') || null
        const clientName = client?.name || [client?.first_name, client?.last_name].filter(Boolean).join(' ') || null

        if (provider && providerName && !providerName.toLowerCase().includes(provider.toLowerCase())) continue
        if (search && !matchesSearchInOffice(appt, client, serviceName, providerName, search)) continue

        merged.push({
          id: appt.boulevard_id,
          type: 'in_office',
          booked_at: appt.created_at,
          appointment_at: appt.start_at,
          service: serviceName,
          provider: providerName,
          location: appt.location_key || null,
          client_name: clientName,
          source: 'In-Office',
          flow_type: null,
          page_path: null,
          duration_ms: appt.duration_minutes ? appt.duration_minutes * 60000 : null,
          session_id: null,
          blvd_appointment_id: appt.id,
          status: appt.status,
          total_price: services.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0),
        })
      }
    }

    // Sort by booked_at descending
    merged.sort((a, b) => new Date(b.booked_at) - new Date(a.booked_at))

    // ── Compute stats ──
    const stats = {
      total_bookings: merged.length,
      online: merged.filter(b => b.type === 'online').length,
      in_office: merged.filter(b => b.type === 'in_office').length,
      by_source: {},
      by_location: {},
      top_providers: [],
      top_services: [],
    }

    const providerCounts = new Map()
    const serviceCounts = new Map()

    for (const b of merged) {
      stats.by_source[b.source] = (stats.by_source[b.source] || 0) + 1
      if (b.location) stats.by_location[b.location] = (stats.by_location[b.location] || 0) + 1
      if (b.provider) providerCounts.set(b.provider, (providerCounts.get(b.provider) || 0) + 1)
      if (b.service) serviceCounts.set(b.service, (serviceCounts.get(b.service) || 0) + 1)
    }

    stats.top_providers = [...providerCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    stats.top_services = [...serviceCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // ── Paginate ──
    const total = merged.length
    const offset = (pageNum - 1) * perPage
    const bookings = merged.slice(offset, offset + perPage)

    return res.json({ stats, bookings, total, page: pageNum, per_page: perPage })
  } catch (err) {
    console.error('[intelligence/bookings]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

function matchesSearch(session, term) {
  const t = term.toLowerCase()
  return (
    (session.service_name || '').toLowerCase().includes(t) ||
    (session.provider_name || '').toLowerCase().includes(t) ||
    (session.contact_email || '').toLowerCase().includes(t) ||
    (session.contact_phone || '').includes(t)
  )
}

function matchesSearchInOffice(appt, client, serviceName, providerName, term) {
  const t = term.toLowerCase()
  return (
    (serviceName || '').toLowerCase().includes(t) ||
    (providerName || '').toLowerCase().includes(t) ||
    (client?.name || '').toLowerCase().includes(t) ||
    (client?.email || '').toLowerCase().includes(t) ||
    (client?.phone || '').includes(t)
  )
}
