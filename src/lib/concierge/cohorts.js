// src/lib/concierge/cohorts.js
// Cohort computation engine — produces candidate arrays for each campaign.

const OVERDUE_TRIGGERS = [15, 30, 45, 60, 75, 90]
const DEFAULT_TOX_CYCLE = 90
const MIN_VISITS_FOR_PERSONALIZED_INTERVAL = 3

const FACIAL_SLUGS = ['facials', 'glo2facial', 'hydrafacial']
const FACIAL_WINBACK_WINDOW = { min: 55, max: 65 } // ~60 days

/**
 * Fetch all rows from a Supabase query, paginating past the 1000-row default.
 */
async function fetchAllRows(buildQuery, chunkSize = 1000, maxRows = 50000) {
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

// ============================================================
// Cohort 1: Tox Journey (Priority 1)
// ============================================================
/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @returns {Promise<Array>} candidates
 */
export async function computeToxJourney(db) {
  // Get all tox patients who are due, overdue, or probably lost
  const toxClients = await fetchAllRows(() =>
    db
      .from('client_tox_summary')
      .select('client_id, first_name, last_name, name, phone, email, tox_visits, days_since_last_tox, avg_tox_interval_days, last_provider_staff_id, last_location_key, tox_segment')
      .in('tox_segment', ['due', 'overdue', 'probably_lost'])
      .not('phone', 'is', null)
  )

  if (!toxClients.length) return []

  // Get upcoming appointments to exclude patients who already booked
  const clientIds = toxClients.map((c) => c.client_id)
  const bookedSet = await getUpcomingBookedClients(db, clientIds)

  // Resolve provider names
  const providerIds = [...new Set(toxClients.map((c) => c.last_provider_staff_id).filter(Boolean))]
  const staffLookup = await getStaffLookup(db, providerIds)

  const candidates = []

  for (const client of toxClients) {
    if (bookedSet.has(client.client_id)) continue

    // Determine the cycle length: personalized or default 90 days
    let cycle = DEFAULT_TOX_CYCLE
    const usePersonalized =
      client.tox_visits >= MIN_VISITS_FOR_PERSONALIZED_INTERVAL &&
      client.avg_tox_interval_days &&
      client.avg_tox_interval_days < DEFAULT_TOX_CYCLE

    if (usePersonalized) {
      cycle = client.avg_tox_interval_days
    }

    const daysOverdue = client.days_since_last_tox - cycle
    if (daysOverdue < 0) continue

    // Check if days overdue falls on a trigger milestone
    const matchedTrigger = OVERDUE_TRIGGERS.find(
      (t) => daysOverdue >= t - 3 && daysOverdue <= t + 3
    )

    // If not near a trigger milestone, still include but note as general overdue
    const staff = staffLookup[client.last_provider_staff_id]
    const providerName = staff?.name || null
    const providerSlug = staff?.slug || null

    const logicTrace = [
      `Tox cycle: ${cycle}d${usePersonalized ? ' (personalized)' : ' (standard)'}`,
      `Last visit: ${client.days_since_last_tox}d ago`,
      `Overdue by: ${daysOverdue}d`,
      matchedTrigger ? `Trigger milestone: Day ${matchedTrigger}` : `General overdue`,
      `Segment: ${client.tox_segment}`,
      `Total tox visits: ${client.tox_visits}`,
      providerName ? `Last provider: ${providerName}` : 'No provider on record',
    ]

    candidates.push({
      client_id: client.client_id,
      phone: client.phone,
      first_name: client.first_name || client.name?.split(' ')[0] || null,
      campaign_slug: 'tox_journey',
      cohort: 'P1',
      priority: 1,
      provider_staff_id: client.last_provider_staff_id,
      provider_name: providerName,
      provider_slug: providerSlug,
      service_name: 'Tox Treatment',
      location_key: client.last_location_key,
      days_overdue: daysOverdue,
      avg_interval: cycle,
      logic_trace: logicTrace,
    })
  }

  return candidates
}

// ============================================================
// Cohort 2: Membership Voucher Recovery (Priority 2)
// ============================================================
export async function computeVoucherRecovery(db) {
  // Get active memberships with voucher data
  const memberships = await fetchAllRows(() =>
    db
      .from('blvd_memberships')
      .select('id, client_id, client_boulevard_id, name, vouchers, location_key')
      .eq('status', 'ACTIVE')
      .not('vouchers', 'is', null)
  )

  if (!memberships.length) return []

  // Filter to memberships with unused vouchers
  // Handle both native JSONB arrays and double-encoded strings from legacy sync
  const withVouchers = memberships.filter((m) => {
    let v = m.vouchers
    if (!v) return false
    if (typeof v === 'string') { try { v = JSON.parse(v) } catch { return false } }
    if (!Array.isArray(v)) return false
    m.vouchers = v // normalize for downstream use
    return v.some((item) => item.quantity > 0)
  })

  if (!withVouchers.length) return []

  // Get client details
  const clientIds = [...new Set(withVouchers.map((m) => m.client_id).filter(Boolean))]
  const { data: clients } = await db
    .from('blvd_clients')
    .select('id, first_name, last_name, name, phone, email, last_visit_at')
    .in('id', clientIds)
    .not('phone', 'is', null)

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]))

  // Get upcoming appointments
  const bookedSet = await getUpcomingBookedClients(db, clientIds)

  // Get provider lookup for voucher services (use the client's most recent provider)
  const { data: recentAppts } = await db
    .from('blvd_appointments')
    .select('client_id, blvd_appointment_services(provider_staff_id)')
    .in('client_id', clientIds)
    .in('status', ['completed', 'final'])
    .order('start_at', { ascending: false })
    .limit(500)

  const clientProviderMap = {}
  for (const appt of recentAppts || []) {
    if (clientProviderMap[appt.client_id]) continue
    const svc = Array.isArray(appt.blvd_appointment_services)
      ? appt.blvd_appointment_services[0]
      : appt.blvd_appointment_services
    if (svc?.provider_staff_id) {
      clientProviderMap[appt.client_id] = svc.provider_staff_id
    }
  }

  const allProviderIds = [...new Set(Object.values(clientProviderMap))]
  const staffLookup = await getStaffLookup(db, allProviderIds)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const candidates = []

  for (const membership of withVouchers) {
    const client = clientMap[membership.client_id]
    if (!client) continue
    if (bookedSet.has(client.id)) continue

    // No visit in 30 days
    if (client.last_visit_at && client.last_visit_at > thirtyDaysAgo) continue

    // Find first unused voucher
    const unusedVoucher = membership.vouchers.find((v) => v.quantity > 0)
    if (!unusedVoucher) continue

    const voucherServiceName = unusedVoucher.services?.[0]?.name || membership.name
    const daysSinceVisit = client.last_visit_at
      ? Math.round((Date.now() - new Date(client.last_visit_at).getTime()) / (1000 * 60 * 60 * 24))
      : null

    const providerId = clientProviderMap[client.id]
    const staff = providerId ? staffLookup[providerId] : null

    const logicTrace = [
      `Active membership: ${membership.name}`,
      `Unused voucher: ${voucherServiceName} (${unusedVoucher.quantity} remaining)`,
      daysSinceVisit != null ? `No visit in ${daysSinceVisit} days` : 'No visit on record',
      'No upcoming appointment',
      staff ? `Preferred provider: ${staff.name}` : 'No preferred provider',
      `Location: ${membership.location_key || 'unknown'}`,
    ]

    candidates.push({
      client_id: client.id,
      phone: client.phone,
      first_name: client.first_name || client.name?.split(' ')[0] || null,
      campaign_slug: 'voucher_recovery',
      cohort: 'P2',
      priority: 2,
      provider_staff_id: providerId || null,
      provider_name: staff?.name || null,
      provider_slug: staff?.slug || null,
      service_name: voucherServiceName,
      voucher_service: voucherServiceName,
      location_key: membership.location_key,
      days_overdue: daysSinceVisit,
      avg_interval: null,
      logic_trace: logicTrace,
    })
  }

  return candidates
}

// ============================================================
// Cohort 3: Aesthetic Winback (Priority 3)
// ============================================================
export async function computeAestheticWinback(db) {
  // Find patients whose last facial was ~60 days ago
  const windowStart = new Date(Date.now() - FACIAL_WINBACK_WINDOW.max * 24 * 60 * 60 * 1000).toISOString()
  const windowEnd = new Date(Date.now() - FACIAL_WINBACK_WINDOW.min * 24 * 60 * 60 * 1000).toISOString()

  // Get completed facial appointments in the 55-65 day window
  const facialAppts = await fetchAllRows(() =>
    db
      .from('blvd_appointment_services')
      .select(`
        appointment_id,
        service_name,
        service_slug,
        provider_staff_id,
        blvd_appointments!inner (
          id,
          client_id,
          start_at,
          status,
          location_key
        )
      `)
      .in('service_slug', FACIAL_SLUGS)
      .in('blvd_appointments.status', ['completed', 'final'])
      .gte('blvd_appointments.start_at', windowStart)
      .lte('blvd_appointments.start_at', windowEnd)
  )

  if (!facialAppts.length) return []

  // Group by client — keep the most recent facial per client
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
        service_slug: row.service_slug,
        provider_staff_id: row.provider_staff_id,
        location_key: appt.location_key,
      }
    }
  }

  const clientIds = Object.keys(clientFacials)
  if (!clientIds.length) return []

  // Get client details
  const { data: clients } = await db
    .from('blvd_clients')
    .select('id, first_name, last_name, name, phone, email')
    .in('id', clientIds)
    .not('phone', 'is', null)

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]))

  // Exclude patients who had a facial since the window
  const { data: recentFacials } = await db
    .from('blvd_appointment_services')
    .select('blvd_appointments!inner(client_id, start_at, status)')
    .in('service_slug', FACIAL_SLUGS)
    .in('blvd_appointments.status', ['completed', 'final'])
    .gt('blvd_appointments.start_at', windowEnd)

  const hadRecentFacial = new Set(
    (recentFacials || []).map((r) => r.blvd_appointments?.client_id).filter(Boolean)
  )

  // Exclude patients with upcoming appointments
  const bookedSet = await getUpcomingBookedClients(db, clientIds)

  // Resolve provider names
  const providerIds = [...new Set(Object.values(clientFacials).map((f) => f.provider_staff_id).filter(Boolean))]
  const staffLookup = await getStaffLookup(db, providerIds)

  const candidates = []

  for (const [clientId, facial] of Object.entries(clientFacials)) {
    const client = clientMap[clientId]
    if (!client) continue
    if (hadRecentFacial.has(clientId)) continue
    if (bookedSet.has(clientId)) continue

    const daysSince = Math.round(
      (Date.now() - new Date(facial.start_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    const staff = staffLookup[facial.provider_staff_id]

    const logicTrace = [
      `Last facial: ${facial.service_name}`,
      `Date: ${new Date(facial.start_at).toLocaleDateString('en-US')}`,
      `${daysSince} days ago (30-day cycle renewal due)`,
      'No facial since',
      'No upcoming appointment',
      staff ? `Provider: ${staff.name}` : 'No provider on record',
      `Location: ${facial.location_key || 'unknown'}`,
    ]

    candidates.push({
      client_id: clientId,
      phone: client.phone,
      first_name: client.first_name || client.name?.split(' ')[0] || null,
      campaign_slug: 'aesthetic_winback',
      cohort: 'P3',
      priority: 3,
      provider_staff_id: facial.provider_staff_id,
      provider_name: staff?.name || null,
      provider_slug: staff?.slug || null,
      service_name: facial.service_name,
      service_slug: facial.service_slug,
      location_key: facial.location_key,
      days_overdue: daysSince - 30, // days past the 30-day cycle
      avg_interval: 30,
      logic_trace: logicTrace,
    })
  }

  return candidates
}

// ============================================================
// Cohort 4: Last-Minute Gaps "The Closer" (Priority 4)
// ============================================================
export async function computeLastMinuteGap(db) {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const tomorrowEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()

  // Find same-day/next-day cancellations
  const { data: cancellations } = await db
    .from('blvd_appointments')
    .select(`
      id, client_id, location_key, start_at, cancelled_at,
      blvd_appointment_services (service_name, service_slug, provider_staff_id)
    `)
    .in('status', ['cancelled'])
    .gte('cancelled_at', twentyFourHoursAgo)
    .gte('start_at', now.toISOString())
    .lte('start_at', tomorrowEnd)

  if (!cancellations?.length) return []

  // Build the "available slots" from cancellations
  const slots = cancellations.map((appt) => {
    const svc = Array.isArray(appt.blvd_appointment_services)
      ? appt.blvd_appointment_services[0]
      : appt.blvd_appointment_services
    return {
      location_key: appt.location_key,
      start_at: appt.start_at,
      service_name: svc?.service_name || 'Treatment',
      service_slug: svc?.service_slug || null,
      provider_staff_id: svc?.provider_staff_id || null,
    }
  })

  // Find eligible patients: 0 marketing touches in 14 days + no upcoming appointments
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // Get phones that received touches in last 14 days
  const { data: recentTouches } = await db
    .from('marketing_touches')
    .select('phone')
    .gte('sent_at', fourteenDaysAgo)

  const touchedPhones = new Set((recentTouches || []).map((r) => r.phone))

  // Get all clients with phone numbers who visited in last 180 days (active patients)
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString()
  const eligibleClients = await fetchAllRows(() =>
    db
      .from('blvd_clients')
      .select('id, first_name, last_name, name, phone, email, last_visit_at')
      .not('phone', 'is', null)
      .gte('last_visit_at', sixMonthsAgo)
  )

  // Exclude clients with 14-day touches and those with upcoming appointments
  const clientIds = eligibleClients.map((c) => c.id)
  const bookedSet = await getUpcomingBookedClients(db, clientIds)

  const providerIds = [...new Set(slots.map((s) => s.provider_staff_id).filter(Boolean))]
  const staffLookup = await getStaffLookup(db, providerIds)

  const candidates = []

  // For each slot, find matching patients (same location preference, not touched, not booked)
  for (const slot of slots) {
    const staff = slot.provider_staff_id ? staffLookup[slot.provider_staff_id] : null

    for (const client of eligibleClients) {
      if (touchedPhones.has(client.phone)) continue
      if (bookedSet.has(client.id)) continue

      // Avoid duplicating same client for multiple slots
      if (candidates.some((c) => c.client_id === client.id)) continue

      const daysSinceVisit = client.last_visit_at
        ? Math.round((Date.now() - new Date(client.last_visit_at).getTime()) / (1000 * 60 * 60 * 24))
        : null

      const slotTime = new Date(slot.start_at)
      const isToday = slotTime.toDateString() === now.toDateString()

      const logicTrace = [
        `${isToday ? 'Same-day' : 'Next-day'} cancellation at ${slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        daysSinceVisit != null ? `Patient last visited ${daysSinceVisit}d ago` : 'Visit history unknown',
        'Zero marketing touches in 14 days',
        'No upcoming appointment',
        staff ? `Available provider: ${staff.name}` : 'Provider TBD',
        `Location: ${slot.location_key || 'unknown'}`,
      ]

      candidates.push({
        client_id: client.id,
        phone: client.phone,
        first_name: client.first_name || client.name?.split(' ')[0] || null,
        campaign_slug: 'last_minute_gap',
        cohort: 'P4',
        priority: 4,
        provider_staff_id: slot.provider_staff_id,
        provider_name: staff?.name || null,
        provider_slug: staff?.slug || null,
        service_name: slot.service_name,
        service_slug: slot.service_slug,
        location_key: slot.location_key,
        days_overdue: daysSinceVisit,
        avg_interval: null,
        logic_trace: logicTrace,
      })

      // Limit to top 20 candidates per slot to avoid spam
      if (candidates.filter((c) => c.campaign_slug === 'last_minute_gap').length >= 20) break
    }
  }

  return candidates
}

// ============================================================
// Shared helpers
// ============================================================

async function getUpcomingBookedClients(db, clientIds) {
  if (!clientIds.length) return new Set()

  const booked = new Set()
  // Query in chunks to avoid URL length limits
  for (let i = 0; i < clientIds.length; i += 100) {
    const chunk = clientIds.slice(i, i + 100)
    const { data } = await db
      .from('blvd_appointments')
      .select('client_id')
      .in('client_id', chunk)
      .in('status', ['booked', 'confirmed', 'arrived'])
      .gte('start_at', new Date().toISOString())

    for (const row of data || []) {
      booked.add(row.client_id)
    }
  }

  return booked
}

async function getStaffLookup(db, staffIds) {
  if (!staffIds.length) return {}

  const { data } = await db
    .from('staff')
    .select('id, name, slug, title')
    .in('id', staffIds)

  return Object.fromEntries((data || []).map((s) => [s.id, s]))
}
