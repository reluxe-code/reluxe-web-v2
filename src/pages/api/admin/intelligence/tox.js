// src/pages/api/admin/intelligence/tox.js
// Tox Intelligence Engine API — segments, provider retention, tox type breakdown.
// GET ?location=all|westfield|carmel&provider=staffId&segment=on_schedule|due|overdue|lost
import { getServiceClient } from '@/lib/supabase'

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

export default async function handler(req, res) {
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
        .select('last_provider_staff_id, tox_segment, tox_visits, total_tox_spend, avg_tox_interval_days')
    )

    const providerMap = {}
    for (const row of providerToxRows || []) {
      const pid = row.last_provider_staff_id
      if (!pid) continue
      if (!providerMap[pid]) providerMap[pid] = { staff_id: pid, patients: 0, on_schedule: 0, total_revenue: 0, intervals: [] }
      providerMap[pid].patients++
      if (row.tox_segment === 'on_schedule') providerMap[pid].on_schedule++
      providerMap[pid].total_revenue += Number(row.total_tox_spend || 0)
      if (row.avg_tox_interval_days) providerMap[pid].intervals.push(row.avg_tox_interval_days)
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
      .map((p) => ({
        staff_id: p.staff_id,
        name: staffLookup[p.staff_id]?.name || 'Unknown',
        title: staffLookup[p.staff_id]?.title || '',
        patients: p.patients,
        retention_pct: p.patients > 0 ? Math.round((p.on_schedule / p.patients) * 100) : 0,
        total_revenue: Math.round(p.total_revenue),
        avg_interval_days: p.intervals.length > 0
          ? Math.round(p.intervals.reduce((a, b) => a + b, 0) / p.intervals.length)
          : null,
      }))
      .sort((a, b) => b.retention_pct - a.retention_pct)

    // 4. Patient list (paginated, filterable)
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
      // Search by name, email, or phone (case-insensitive)
      const q = `%${search}%`
      patientQuery = patientQuery.or(`name.ilike.${q},email.ilike.${q},phone.ilike.${q},first_name.ilike.${q},last_name.ilike.${q}`)
    }
    if (tox_type) {
      patientQuery = patientQuery.eq('primary_tox_type', tox_type)
    }
    if (min_visits) {
      patientQuery = patientQuery.gte('tox_visits', parseInt(min_visits, 10))
    }

    // Sort
    const sortMap = {
      days_desc: ['days_since_last_tox', { ascending: false }],
      days_asc: ['days_since_last_tox', { ascending: true }],
      spend_desc: ['total_tox_spend', { ascending: false }],
      spend_asc: ['total_tox_spend', { ascending: true }],
      visits_desc: ['tox_visits', { ascending: false }],
      visits_asc: ['tox_visits', { ascending: true }],
      name_asc: ['name', { ascending: true }],
    }
    const [sortCol, sortOpts] = sortMap[sort] || sortMap.days_desc
    patientQuery = patientQuery.order(sortCol, sortOpts)

    const { data: patients, count: patientCount, error: patientErr } = await patientQuery
      .range(offset, offset + pageSize - 1)

    if (patientErr) throw patientErr

    // Resolve provider names for the patient list
    const patientProviderIds = [...new Set((patients || []).map((p) => p.last_provider_staff_id).filter(Boolean))]
    let patientStaffLookup = {}
    if (patientProviderIds.length > 0) {
      const { data: pStaff } = await db
        .from('staff')
        .select('id, name')
        .in('id', patientProviderIds)
      patientStaffLookup = Object.fromEntries((pStaff || []).map((s) => [s.id, s.name]))
    }

    const patient_list = (patients || []).map((p) => ({
      client_id: p.client_id,
      name: p.name || [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown',
      email: p.email,
      phone: p.phone,
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
    }))

    return res.json({
      summary,
      tox_types,
      provider_leaderboard,
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
