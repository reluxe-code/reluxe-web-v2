// src/pages/api/admin/concierge/projection.js
// GET ?offset=3  — project cohort volumes for N days from now.
// Returns candidate counts + patient lists per cohort for that future date.
import { getServiceClient } from '@/lib/supabase'

const DEFAULT_TOX_CYCLE = 90
const MIN_VISITS_FOR_PERSONALIZED_INTERVAL = 3
const FACIAL_SLUGS = ['facials', 'glo2facial', 'hydrafacial']

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()
  const offset = Math.min(Math.max(parseInt(req.query.offset) || 0, 0), 30)
  const targetDate = new Date(Date.now() + offset * 24 * 60 * 60 * 1000)

  try {
    const [tox, voucher, winback] = await Promise.all([
      projectToxJourney(db, offset),
      projectVoucherRecovery(db, offset),
      projectAestheticWinback(db, offset, targetDate),
    ])

    return res.json({
      date: targetDate.toISOString().slice(0, 10),
      offset_days: offset,
      cohorts: {
        tox_journey: tox,
        membership_voucher: voucher,
        aesthetic_winback: winback,
        last_minute_gap: {
          count: 0,
          patients: [],
          note: 'Cannot project — depends on future cancellations',
        },
      },
      total: tox.count + voucher.count + winback.count,
    })
  } catch (err) {
    console.error('[concierge/projection]', err)
    return res.status(500).json({ error: err.message })
  }
}

// ── P1 Tox Journey Projection ──────────────────────────────────

async function projectToxJourney(db, offset) {
  const { data: toxClients, error } = await db
    .from('client_tox_summary')
    .select('client_id, first_name, last_name, name, phone, tox_visits, days_since_last_tox, avg_tox_interval_days, last_provider_staff_id, tox_segment')
    .not('phone', 'is', null)
    .not('days_since_last_tox', 'is', null)

  if (error) throw error
  if (!toxClients?.length) return { count: 0, patients: [] }

  // Get upcoming booked clients to exclude
  const clientIds = toxClients.map((c) => c.client_id)
  const bookedSet = await getBookedClients(db, clientIds)

  // Get staff names
  const providerIds = [...new Set(toxClients.map((c) => c.last_provider_staff_id).filter(Boolean))]
  const staffLookup = await getStaffLookup(db, providerIds)

  const patients = []

  for (const client of toxClients) {
    if (bookedSet.has(client.client_id)) continue

    let cycle = DEFAULT_TOX_CYCLE
    if (
      client.tox_visits >= MIN_VISITS_FOR_PERSONALIZED_INTERVAL &&
      client.avg_tox_interval_days &&
      client.avg_tox_interval_days < DEFAULT_TOX_CYCLE
    ) {
      cycle = client.avg_tox_interval_days
    }

    const projectedDaysSince = client.days_since_last_tox + offset
    const projectedOverdue = projectedDaysSince - cycle
    if (projectedOverdue < 0) continue

    const staff = staffLookup[client.last_provider_staff_id]

    patients.push({
      client_id: client.client_id,
      name: client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim(),
      phone: client.phone,
      days_overdue: projectedOverdue,
      cycle,
      segment: client.tox_segment,
      provider_name: staff?.name || null,
    })
  }

  // Sort by most overdue first
  patients.sort((a, b) => b.days_overdue - a.days_overdue)

  return { count: patients.length, patients }
}

// ── P2 Voucher Recovery Projection ─────────────────────────────

async function projectVoucherRecovery(db, offset) {
  const { data: memberships, error } = await db
    .from('blvd_memberships')
    .select('id, client_id, name, vouchers, location_key')
    .eq('status', 'ACTIVE')
    .not('vouchers', 'is', null)

  if (error) throw error
  if (!memberships?.length) return { count: 0, patients: [] }

  const withVouchers = memberships.filter((m) => {
    if (!m.vouchers || !Array.isArray(m.vouchers)) return false
    return m.vouchers.some((v) => v.quantity > 0)
  })

  if (!withVouchers.length) return { count: 0, patients: [] }

  const clientIds = [...new Set(withVouchers.map((m) => m.client_id).filter(Boolean))]
  const { data: clients } = await db
    .from('blvd_clients')
    .select('id, first_name, last_name, name, phone, last_visit_at')
    .in('id', clientIds)
    .not('phone', 'is', null)

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]))
  const bookedSet = await getBookedClients(db, clientIds)

  // 30 days from the projected date
  const thirtyDaysCutoff = new Date(Date.now() + offset * 86400000 - 30 * 86400000).toISOString()

  const patients = []
  const seenClients = new Set()

  for (const membership of withVouchers) {
    const client = clientMap[membership.client_id]
    if (!client || seenClients.has(client.id)) continue
    if (bookedSet.has(client.id)) continue

    // On the projected date, would they have no visit in 30 days?
    if (client.last_visit_at && client.last_visit_at > thirtyDaysCutoff) continue

    const unusedVoucher = membership.vouchers.find((v) => v.quantity > 0)
    if (!unusedVoucher) continue

    const daysSince = client.last_visit_at
      ? Math.round((Date.now() + offset * 86400000 - new Date(client.last_visit_at).getTime()) / 86400000)
      : null

    seenClients.add(client.id)
    patients.push({
      client_id: client.id,
      name: client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim(),
      phone: client.phone,
      days_since_visit: daysSince,
      voucher_name: unusedVoucher.services?.[0]?.name || membership.name,
      membership: membership.name,
    })
  }

  patients.sort((a, b) => (b.days_since_visit || 0) - (a.days_since_visit || 0))

  return { count: patients.length, patients }
}

// ── P3 Aesthetic Winback Projection ────────────────────────────

async function projectAestheticWinback(db, offset, targetDate) {
  // On the target date, we want patients whose last facial was 55-65 days ago.
  // So today their last facial was (55 - offset) to (65 - offset) days ago.
  const windowMinToday = 55 - offset
  const windowMaxToday = 65 - offset

  // If the window hasn't started yet (all in the future), skip
  if (windowMinToday < 0) return { count: 0, patients: [] }

  const windowStart = new Date(Date.now() - windowMaxToday * 86400000).toISOString()
  const windowEnd = new Date(Date.now() - Math.max(windowMinToday, 0) * 86400000).toISOString()

  const { data: facialAppts, error } = await db
    .from('blvd_appointment_services')
    .select(`
      service_name, service_slug, provider_staff_id,
      blvd_appointments!inner(id, client_id, start_at, status, location_key)
    `)
    .in('service_slug', FACIAL_SLUGS)
    .in('blvd_appointments.status', ['completed', 'final'])
    .gte('blvd_appointments.start_at', windowStart)
    .lte('blvd_appointments.start_at', windowEnd)

  if (error) throw error
  if (!facialAppts?.length) return { count: 0, patients: [] }

  // Group by client — most recent facial per client
  const clientFacials = {}
  for (const row of facialAppts) {
    const appt = row.blvd_appointments
    if (!appt?.client_id) continue
    const existing = clientFacials[appt.client_id]
    if (!existing || appt.start_at > existing.start_at) {
      clientFacials[appt.client_id] = {
        client_id: appt.client_id,
        start_at: appt.start_at,
        service_name: row.service_name,
        provider_staff_id: row.provider_staff_id,
      }
    }
  }

  const clientIds = Object.keys(clientFacials)
  if (!clientIds.length) return { count: 0, patients: [] }

  const { data: clients } = await db
    .from('blvd_clients')
    .select('id, first_name, last_name, name, phone')
    .in('id', clientIds)
    .not('phone', 'is', null)

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]))

  // Exclude patients who had a more recent facial
  const { data: recentFacials } = await db
    .from('blvd_appointment_services')
    .select('blvd_appointments!inner(client_id, start_at, status)')
    .in('service_slug', FACIAL_SLUGS)
    .in('blvd_appointments.status', ['completed', 'final'])
    .gt('blvd_appointments.start_at', windowEnd)

  const hadRecentFacial = new Set(
    (recentFacials || []).map((r) => r.blvd_appointments?.client_id).filter(Boolean)
  )

  const bookedSet = await getBookedClients(db, clientIds)

  const providerIds = [...new Set(Object.values(clientFacials).map((f) => f.provider_staff_id).filter(Boolean))]
  const staffLookup = await getStaffLookup(db, providerIds)

  const patients = []

  for (const [clientId, facial] of Object.entries(clientFacials)) {
    const client = clientMap[clientId]
    if (!client) continue
    if (hadRecentFacial.has(clientId)) continue
    if (bookedSet.has(clientId)) continue

    const daysSinceToday = Math.round((Date.now() - new Date(facial.start_at).getTime()) / 86400000)
    const staff = staffLookup[facial.provider_staff_id]

    patients.push({
      client_id: clientId,
      name: client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim(),
      phone: client.phone,
      days_since_facial: daysSinceToday + offset,
      service_name: facial.service_name,
      provider_name: staff?.name || null,
    })
  }

  patients.sort((a, b) => b.days_since_facial - a.days_since_facial)

  return { count: patients.length, patients }
}

// ── Shared helpers ─────────────────────────────────────────────

async function getBookedClients(db, clientIds) {
  if (!clientIds.length) return new Set()
  const booked = new Set()
  for (let i = 0; i < clientIds.length; i += 100) {
    const chunk = clientIds.slice(i, i + 100)
    const { data } = await db
      .from('blvd_appointments')
      .select('client_id')
      .in('client_id', chunk)
      .in('status', ['booked', 'confirmed', 'arrived'])
      .gte('start_at', new Date().toISOString())
    for (const row of data || []) booked.add(row.client_id)
  }
  return booked
}

async function getStaffLookup(db, staffIds) {
  if (!staffIds.length) return {}
  const { data } = await db.from('staff').select('id, name, slug, title').in('id', staffIds)
  return Object.fromEntries((data || []).map((s) => [s.id, s]))
}
