// src/lib/concierge/cohorts.js
// Cohort computation engine — produces candidate arrays for each campaign.

const OVERDUE_TRIGGERS = [15, 30, 45, 60, 75, 90]
const DEFAULT_TOX_CYCLE = 90
const MIN_VISITS_FOR_PERSONALIZED_INTERVAL = 3

const FACIAL_SLUGS = ['facials', 'glo2facial', 'hydrafacial']
const FACIAL_WINBACK_WINDOW = { min: 55, max: 65 } // ~60 days

// Series treatment slugs and their default intervals (days) for package voucher recovery.
// Overridden by engineConfig.series_intervals when available.
const SERIES_SLUG_PATTERNS = {
  morpheus8: /morpheus|rf micro/i,
  microneedling: /skinpen|skin pen|micro.?needl/i,
  ipl: /ipl|bbl|photofacial|clearlift|opus/i,
  'laser-hair-removal': /laser hair|lhr/i,
}
const DEFAULT_SERIES_INTERVALS = { morpheus8: 42, microneedling: 28, ipl: 28, 'laser-hair-removal': 42 }
const DEFAULT_STANDALONE_INACTIVITY_DAYS = 21

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
  // Select boulevard_id + phone_hash_v1 instead of raw PII (Zero-PHI)
  const toxClients = await fetchAllRows(() =>
    db
      .from('client_tox_summary')
      .select('client_id, boulevard_id, tox_visits, days_since_last_tox, avg_tox_interval_days, last_provider_staff_id, last_location_key, tox_segment')
      .in('tox_segment', ['due', 'overdue', 'probably_lost'])
  )

  if (!toxClients.length) return []

  // Get boulevard_id + phone_hash_v1 for anti-spam dedup (views don't carry hashes)
  const clientIds = toxClients.map((c) => c.client_id)
  const hashLookup = await getClientHashLookup(db, clientIds)

  // Get upcoming appointments to exclude patients who already booked
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

    const clientHash = hashLookup[client.client_id]
    if (!clientHash) continue // no phone hash = can't send SMS

    candidates.push({
      client_id: client.client_id,
      boulevard_id: client.boulevard_id || clientHash.boulevard_id,
      phone_hash_v1: clientHash.phone_hash_v1,
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

  // Get client details (Zero-PHI: boulevard_id + phone_hash_v1 only)
  const clientIds = [...new Set(withVouchers.map((m) => m.client_id).filter(Boolean))]
  const { data: clients } = await db
    .from('blvd_clients')
    .select('id, boulevard_id, phone_hash_v1, last_visit_at')
    .in('id', clientIds)
    .not('phone_hash_v1', 'is', null)

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
      boulevard_id: client.boulevard_id,
      phone_hash_v1: client.phone_hash_v1,
      campaign_slug: 'membership_voucher',
      cohort: 'P3',
      priority: 3,
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

  // Get client details (Zero-PHI: boulevard_id + phone_hash_v1 only)
  const { data: clients } = await db
    .from('blvd_clients')
    .select('id, boulevard_id, phone_hash_v1')
    .in('id', clientIds)
    .not('phone_hash_v1', 'is', null)

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
      boulevard_id: client.boulevard_id,
      phone_hash_v1: client.phone_hash_v1,
      campaign_slug: 'aesthetic_winback',
      cohort: 'P4',
      priority: 4,
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
// Cohort 4: Last-Minute Fill (Priority 5)
// Proactive outreach to fill openings — two sub-audiences:
//   A) Prospects: leads who never visited → consultation offers
//   B) Catch-all: existing clients not covered by P1–P4/P6 → return visit offers
// ============================================================
export async function computeLastMinuteGap(db, engineConfig = {}) {
  const candidates = []

  // Sub-audience A: Prospects (never visited) → consultation offers
  const prospects = await computeProspects(db, engineConfig)
  candidates.push(...prospects)

  // Sub-audience B: Catch-all returning clients → return visit offers
  const returning = await computeCatchAll(db, engineConfig)
  candidates.push(...returning)

  return candidates
}

/**
 * Sub-audience A: Prospects — leads who have never visited.
 * Offers consultations to recent leads with no client record (or zero visits).
 */
async function computeProspects(db, engineConfig) {
  const prospectLimit = Number(engineConfig.last_minute_prospect_limit || 50)
  const dayMs = 24 * 60 * 60 * 1000
  const sixMonthsAgo = new Date(Date.now() - 180 * dayMs).toISOString()

  // 1. Leads with phone_hash that are new/contacted and have no linked client
  const newLeads = await fetchAllRows(() =>
    db
      .from('leads')
      .select('id, first_name, phone_hash_v1, service_interest, status, blvd_client_id, created_at')
      .not('phone_hash_v1', 'is', null)
      .in('status', ['new', 'contacted'])
      .is('blvd_client_id', null)
      .gte('created_at', sixMonthsAgo)
  )

  // 2. Leads that booked but whose linked client has visit_count = 0 (no-showed)
  const bookedLeads = await fetchAllRows(() =>
    db
      .from('leads')
      .select('id, first_name, phone_hash_v1, service_interest, status, blvd_client_id, created_at')
      .not('phone_hash_v1', 'is', null)
      .eq('status', 'booked')
      .not('blvd_client_id', 'is', null)
      .gte('created_at', sixMonthsAgo)
  )

  let zeroVisitLeads = []
  if (bookedLeads.length) {
    const linkedClientIds = [...new Set(bookedLeads.map((l) => l.blvd_client_id).filter(Boolean))]
    const zeroVisitClientIds = new Set()
    for (let i = 0; i < linkedClientIds.length; i += 100) {
      const chunk = linkedClientIds.slice(i, i + 100)
      const { data } = await db
        .from('blvd_clients')
        .select('id')
        .in('id', chunk)
        .eq('visit_count', 0)
      for (const c of data || []) zeroVisitClientIds.add(c.id)
    }
    zeroVisitLeads = bookedLeads.filter((l) => zeroVisitClientIds.has(l.blvd_client_id))
  }

  // 3. Dedup by phone_hash_v1
  const seen = new Set()
  const allProspects = [...newLeads, ...zeroVisitLeads].filter((l) => {
    if (seen.has(l.phone_hash_v1)) return false
    seen.add(l.phone_hash_v1)
    return true
  })

  if (!allProspects.length) return []

  // 4. Cross-check: exclude phone hashes that match a client with visits > 0
  const prospectHashes = allProspects.map((l) => l.phone_hash_v1)
  const visitedHashSet = new Set()
  const hashToClientId = {}
  for (let i = 0; i < prospectHashes.length; i += 100) {
    const chunk = prospectHashes.slice(i, i + 100)
    const { data } = await db
      .from('blvd_clients')
      .select('id, phone_hash_v1, visit_count')
      .in('phone_hash_v1', chunk)
    for (const c of data || []) {
      hashToClientId[c.phone_hash_v1] = c.id
      if (c.visit_count > 0) visitedHashSet.add(c.phone_hash_v1)
    }
  }

  const filteredProspects = allProspects.filter((l) => !visitedHashSet.has(l.phone_hash_v1))
  if (!filteredProspects.length) return []

  // 5. Exclude those with upcoming appointments
  const matchedClientIds = [...new Set(
    filteredProspects.map((l) => hashToClientId[l.phone_hash_v1]).filter(Boolean)
  )]
  const bookedSet = matchedClientIds.length
    ? await getUpcomingBookedClients(db, matchedClientIds)
    : new Set()

  // 6. Build candidates (capped)
  const candidates = []

  for (const lead of filteredProspects) {
    if (candidates.length >= prospectLimit) break

    const linkedClientId = hashToClientId[lead.phone_hash_v1] || lead.blvd_client_id
    if (linkedClientId && bookedSet.has(linkedClientId)) continue

    const daysSinceSubmission = Math.round(
      (Date.now() - new Date(lead.created_at).getTime()) / dayMs
    )

    candidates.push({
      client_id: linkedClientId || null,
      lead_id: lead.id,
      boulevard_id: null,
      phone_hash_v1: lead.phone_hash_v1,
      campaign_slug: 'last_minute_gap',
      cohort: 'P5',
      priority: 5,
      sub_audience: 'prospect',
      provider_staff_id: null,
      provider_name: null,
      provider_slug: null,
      service_name: 'Consultation',
      service_slug: 'consult',
      location_key: null,
      days_overdue: daysSinceSubmission,
      avg_interval: null,
      first_name: lead.first_name || null,
      logic_trace: [
        'Sub-audience: Prospect (never visited)',
        `Lead source: ${lead.status === 'booked' ? 'booked-no-show' : 'new/contacted'}`,
        lead.service_interest ? `Service interest: ${lead.service_interest}` : 'No specific service interest',
        `Lead submitted ${daysSinceSubmission} days ago`,
        'Offering: Consultation',
      ],
    })
  }

  return candidates
}

/**
 * Sub-audience B: Catch-all returning clients.
 * Targets clients inactive for 45–365 days who are NOT covered by any other cohort
 * (not tox, massage, facial, membership-voucher, or package-voucher candidates).
 */
async function computeCatchAll(db, engineConfig) {
  const minInactiveDays = Number(engineConfig.last_minute_min_inactive_days || 45)
  const maxInactiveDays = Number(engineConfig.last_minute_max_inactive_days || 365)
  const dayMs = 24 * 60 * 60 * 1000

  // 1. Build exclusion sets — clients covered by other cohorts
  const [toxIds, massageIds, facialIds, membershipIds, packageIds] = await Promise.all([
    getToxClientIds(db),
    getMassageClientIds(db),
    getFacialClientIds(db),
    getMembershipClientIds(db),
    getPackageClientIds(db),
  ])

  const excludedIds = new Set([...toxIds, ...massageIds, ...facialIds, ...membershipIds, ...packageIds])

  // 2. Get clients inactive for the configured window
  const inactiveStart = new Date(Date.now() - maxInactiveDays * dayMs).toISOString()
  const inactiveEnd = new Date(Date.now() - minInactiveDays * dayMs).toISOString()

  const eligibleClients = await fetchAllRows(() =>
    db
      .from('blvd_clients')
      .select('id, boulevard_id, phone_hash_v1, last_visit_at, visit_count, total_spend')
      .not('phone_hash_v1', 'is', null)
      .gte('last_visit_at', inactiveStart)
      .lte('last_visit_at', inactiveEnd)
      .gt('visit_count', 0)
  )

  if (!eligibleClients.length) return []

  // 3. Filter out clients in other cohorts
  const filtered = eligibleClients.filter((c) => !excludedIds.has(c.id))
  if (!filtered.length) return []

  // 4. Exclude those with upcoming appointments
  const clientIds = filtered.map((c) => c.id)
  const bookedSet = await getUpcomingBookedClients(db, clientIds)

  // 5. Resolve last provider + last service for personalization
  const [clientProviderMap, clientLastService] = await Promise.all([
    getLastProviderMap(db, clientIds),
    getLastServiceMap(db, clientIds),
  ])

  const allProviderIds = [...new Set(Object.values(clientProviderMap).filter(Boolean))]
  const staffLookup = await getStaffLookup(db, allProviderIds)

  // 6. Build candidates
  const candidates = []

  for (const client of filtered) {
    if (bookedSet.has(client.id)) continue

    const daysSinceVisit = client.last_visit_at
      ? Math.round((Date.now() - new Date(client.last_visit_at).getTime()) / dayMs)
      : null
    if (daysSinceVisit == null) continue

    const providerId = clientProviderMap[client.id]
    const staff = providerId ? staffLookup[providerId] : null
    const lastService = clientLastService[client.id]

    candidates.push({
      client_id: client.id,
      boulevard_id: client.boulevard_id,
      phone_hash_v1: client.phone_hash_v1,
      campaign_slug: 'last_minute_gap',
      cohort: 'P5',
      priority: 5,
      sub_audience: 'returning',
      provider_staff_id: providerId || null,
      provider_name: staff?.name || null,
      provider_slug: staff?.slug || null,
      service_name: lastService?.service_name || 'Treatment',
      service_slug: lastService?.service_slug || null,
      location_key: lastService?.location_key || null,
      days_overdue: daysSinceVisit,
      avg_interval: null,
      logic_trace: [
        'Sub-audience: Returning client (catch-all)',
        `Last visit: ${daysSinceVisit} days ago`,
        `Total visits: ${client.visit_count}`,
        `Total spend: $${Math.round((client.total_spend || 0) / 100)}`,
        lastService ? `Last service: ${lastService.service_name}` : 'Last service unknown',
        staff ? `Last provider: ${staff.name}` : 'No provider on record',
        'Not in tox/massage/facial/membership/package cohorts',
      ],
    })
  }

  return candidates
}

// ============================================================
// Cohort 5: Package Voucher Recovery (Priority 5)
// ============================================================
/**
 * Finds patients with unused package vouchers.
 * - Series treatments (Morpheus, SkinPen, IPL, Laser Hair): due based on per-service interval
 * - Standalone (facials, massages, etc.): due after 21 days of inactivity
 * - Expiry urgency: boosts priority + adds reminder text at 90/30/7 days before expiration
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {object} engineConfig - Concierge engine config from site_config
 * @returns {Promise<Array>} candidates
 */
export async function computePackageVoucherRecovery(db, engineConfig = {}) {
  const seriesIntervals = { ...DEFAULT_SERIES_INTERVALS, ...(engineConfig.series_intervals || {}) }
  const standaloneInactivityDays = Number(engineConfig.package_standalone_inactivity_days || DEFAULT_STANDALONE_INACTIVITY_DAYS)
  const expiryReminderDays = engineConfig.package_expiry_reminder_days || [90, 30, 7]

  // Fetch active packages with unused vouchers
  const packages = await fetchAllRows(() =>
    db
      .from('blvd_packages')
      .select('id, client_id, client_boulevard_id, name, vouchers, location_key, purchased_at, expires_at')
      .in('status', ['ACTIVE'])
      .not('vouchers', 'is', null)
  )

  if (!packages.length) return []

  // Filter to packages with unused vouchers (handle string + native JSONB)
  const withVouchers = packages.filter((pkg) => {
    let v = pkg.vouchers
    if (!v) return false
    if (typeof v === 'string') { try { v = JSON.parse(v) } catch { return false } }
    if (!Array.isArray(v)) return false
    pkg.vouchers = v
    return v.some((item) => item.quantity > 0)
  })

  if (!withVouchers.length) return []

  // Get client details (Zero-PHI: boulevard_id + phone_hash_v1 only)
  const clientIds = [...new Set(withVouchers.map((p) => p.client_id).filter(Boolean))]
  const { data: clients } = await db
    .from('blvd_clients')
    .select('id, boulevard_id, phone_hash_v1, last_visit_at')
    .in('id', clientIds)
    .not('phone_hash_v1', 'is', null)

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]))

  // Get upcoming appointments
  const bookedSet = await getUpcomingBookedClients(db, clientIds)

  // Get last appointment per client per service slug (for series timing)
  const { data: recentSvcAppts } = await db
    .from('blvd_appointment_services')
    .select('service_slug, provider_staff_id, blvd_appointments!inner(client_id, start_at, status)')
    .in('blvd_appointments.client_id', clientIds)
    .in('blvd_appointments.status', ['completed', 'final'])
    .order('blvd_appointments(start_at)', { ascending: false })

  // Build map: clientId → { serviceSlug → { start_at, provider_staff_id } }
  const clientServiceMap = {}
  for (const row of recentSvcAppts || []) {
    const appt = row.blvd_appointments
    if (!appt?.client_id || !row.service_slug) continue
    if (!clientServiceMap[appt.client_id]) clientServiceMap[appt.client_id] = {}
    if (!clientServiceMap[appt.client_id][row.service_slug]) {
      clientServiceMap[appt.client_id][row.service_slug] = {
        start_at: appt.start_at,
        provider_staff_id: row.provider_staff_id,
      }
    }
  }

  // Also get most recent provider per client (for standalone vouchers)
  const clientProviderMap = {}
  for (const row of recentSvcAppts || []) {
    const appt = row.blvd_appointments
    if (!appt?.client_id || clientProviderMap[appt.client_id]) continue
    if (row.provider_staff_id) {
      clientProviderMap[appt.client_id] = row.provider_staff_id
    }
  }

  const allProviderIds = [...new Set([
    ...Object.values(clientProviderMap),
    ...(Object.values(clientServiceMap).flatMap((m) => Object.values(m).map((v) => v.provider_staff_id))),
  ].filter(Boolean))]
  const staffLookup = await getStaffLookup(db, allProviderIds)

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const candidates = []

  for (const pkg of withVouchers) {
    const client = clientMap[pkg.client_id]
    if (!client) continue
    if (bookedSet.has(client.id)) continue

    // Compute expiry info
    const expiresAt = pkg.expires_at ? new Date(pkg.expires_at) : null
    const daysUntilExpiry = expiresAt ? Math.round((expiresAt.getTime() - now) / dayMs) : null
    if (expiresAt && daysUntilExpiry < 0) continue // already expired

    let expiryText = ''
    let priorityBoost = 5 // default P5
    if (daysUntilExpiry != null) {
      const [tier1, tier2, tier3] = expiryReminderDays
      const expiryDateStr = expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      if (daysUntilExpiry <= tier3) {
        expiryText = `Last chance - these expire ${expiryDateStr}! `
        priorityBoost = 1
      } else if (daysUntilExpiry <= tier2) {
        expiryText = `Don't forget - these expire ${expiryDateStr}! `
        priorityBoost = 2
      } else if (daysUntilExpiry <= tier1) {
        expiryText = `Heads up - these expire ${expiryDateStr}. `
        priorityBoost = 3
      }
    }

    // Process each unused voucher in the package
    for (const voucher of pkg.vouchers) {
      if (!voucher.quantity || voucher.quantity <= 0) continue

      const serviceName = voucher.services?.[0]?.name || pkg.name
      const serviceSlug = classifySeriesService(serviceName)
      const isSeries = !!serviceSlug

      let daysOverdue = 0
      let providerId = null
      let logicLines = [`Package: ${pkg.name}`, `Voucher: ${serviceName} (${voucher.quantity} remaining)`]

      if (isSeries) {
        // Series: check last appointment for this service type
        const interval = seriesIntervals[serviceSlug] || 42
        const lastAppt = clientServiceMap[client.id]?.[serviceSlug]

        if (lastAppt) {
          const daysSince = Math.round((now - new Date(lastAppt.start_at).getTime()) / dayMs)
          daysOverdue = daysSince - interval
          if (daysOverdue < 0) continue // not due yet
          providerId = lastAppt.provider_staff_id
          logicLines.push(
            `Series type: ${serviceSlug} (${interval}-day interval)`,
            `Last session: ${daysSince} days ago`,
            `Overdue by: ${daysOverdue} days`,
          )
        } else {
          // No prior session found — they bought but never started, include them
          daysOverdue = 0
          logicLines.push(
            `Series type: ${serviceSlug} (${interval}-day interval)`,
            'No prior session found — package unused',
          )
        }
      } else {
        // Standalone: check last_visit_at
        const daysSinceVisit = client.last_visit_at
          ? Math.round((now - new Date(client.last_visit_at).getTime()) / dayMs)
          : null

        if (daysSinceVisit != null && daysSinceVisit < standaloneInactivityDays) continue // visited recently

        daysOverdue = daysSinceVisit != null ? daysSinceVisit - standaloneInactivityDays : 0
        providerId = clientProviderMap[client.id] || null
        logicLines.push(
          `Standalone voucher (${standaloneInactivityDays}-day inactivity threshold)`,
          daysSinceVisit != null ? `No visit in ${daysSinceVisit} days` : 'No visit on record',
        )
      }

      // Skip if this client already added (from another voucher in same/different package)
      if (candidates.some((c) => c.client_id === client.id && c.voucher_service === serviceName)) continue

      const staff = providerId ? staffLookup[providerId] : null

      if (daysUntilExpiry != null) {
        logicLines.push(`Expires: ${expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${daysUntilExpiry} days)`)
      }
      if (staff) logicLines.push(`Provider: ${staff.name}`)
      logicLines.push('No upcoming appointment')

      candidates.push({
        client_id: client.id,
        boulevard_id: client.boulevard_id,
        phone_hash_v1: client.phone_hash_v1,
        campaign_slug: 'package_voucher',
        cohort: 'P6',
        priority: priorityBoost,
        provider_staff_id: providerId,
        provider_name: staff?.name || null,
        provider_slug: staff?.slug || null,
        service_name: serviceName,
        service_slug: serviceSlug,
        voucher_service: serviceName,
        sessions_remaining: voucher.quantity,
        voucher_expiry_text: expiryText,
        location_key: pkg.location_key,
        days_overdue: daysOverdue,
        avg_interval: null,
        logic_trace: logicLines,
      })
    }
  }

  return candidates
}

/**
 * Classify a service name as a series treatment slug, or null if standalone.
 */
function classifySeriesService(name) {
  const n = (name || '').toLowerCase()
  for (const [slug, pattern] of Object.entries(SERIES_SLUG_PATTERNS)) {
    if (pattern.test(n)) return slug
  }
  return null
}

// ============================================================
// Cohort 6: Massage Journey (Priority 6)
// ============================================================
const MASSAGE_MILESTONES = [
  { days: 25, tier: 'gentle' },
  { days: 40, tier: 'reminder' },
  { days: 55, tier: 'winback' },
  { days: 70, tier: 'urgent' },
  { days: 85, tier: 'last_call' },
]

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @returns {Promise<Array>} candidates
 */
export async function computeMassageJourney(db) {
  // Select boulevard_id + behavioral data (no PII) from rebuilt view
  const massageClients = await fetchAllRows(() =>
    db
      .from('client_massage_summary')
      .select('client_id, boulevard_id, massage_visits, days_since_last_massage, avg_massage_interval_days, last_provider_staff_id, last_location_key, massage_tier')
      .not('massage_tier', 'is', null)
  )

  if (!massageClients.length) return []

  // Get phone_hash_v1 for anti-spam dedup (views don't carry hashes)
  const clientIds = massageClients.map((c) => c.client_id)
  const hashLookup = await getClientHashLookup(db, clientIds)

  const bookedSet = await getUpcomingBookedClients(db, clientIds)

  const providerIds = [...new Set(massageClients.map((c) => c.last_provider_staff_id).filter(Boolean))]
  const staffLookup = await getStaffLookup(db, providerIds)

  const candidates = []

  for (const client of massageClients) {
    if (bookedSet.has(client.client_id)) continue

    const milestone = MASSAGE_MILESTONES.find((m) => m.tier === client.massage_tier)
    const staff = staffLookup[client.last_provider_staff_id]
    const providerName = staff?.name || null
    const providerSlug = staff?.slug || null

    const logicTrace = [
      `Massage client`,
      `Last visit: ${client.days_since_last_massage}d ago`,
      `Tier: ${client.massage_tier}`,
      milestone ? `Milestone: Day ${milestone.days}` : 'Unknown milestone',
      `Total massage visits: ${client.massage_visits}`,
      providerName ? `Last provider: ${providerName}` : 'No provider on record',
    ]

    const clientHash = hashLookup[client.client_id]
    if (!clientHash) continue // no phone hash = can't send SMS

    candidates.push({
      client_id: client.client_id,
      boulevard_id: client.boulevard_id || clientHash.boulevard_id,
      phone_hash_v1: clientHash.phone_hash_v1,
      campaign_slug: 'massage_journey',
      cohort: 'P2',
      priority: 2,
      provider_staff_id: client.last_provider_staff_id,
      provider_name: providerName,
      provider_slug: providerSlug,
      service_name: 'Massage',
      location_key: client.last_location_key,
      days_overdue: client.days_since_last_massage,
      avg_interval: client.avg_massage_interval_days,
      logic_trace: logicTrace,
    })
  }

  return candidates
}

// ============================================================
// Shared helpers
// ============================================================

/**
 * Batch-fetch boulevard_id + phone_hash_v1 from blvd_clients for a list of client IDs.
 * Used by view-based cohorts (tox, massage) that don't have phone_hash_v1 in the view.
 * Returns { [client_id]: { id, boulevard_id, phone_hash_v1 } }.
 */
async function getClientHashLookup(db, clientIds) {
  if (!clientIds.length) return {}
  const lookup = {}
  for (let i = 0; i < clientIds.length; i += 100) {
    const chunk = clientIds.slice(i, i + 100)
    const { data } = await db
      .from('blvd_clients')
      .select('id, boulevard_id, phone_hash_v1')
      .in('id', chunk)
      .not('phone_hash_v1', 'is', null)
    for (const row of data || []) {
      lookup[row.id] = row
    }
  }
  return lookup
}

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

// ── P5 catch-all exclusion helpers ──

/**
 * Get all client IDs from client_tox_summary (anyone who's ever had tox).
 */
async function getToxClientIds(db) {
  const ids = new Set()
  const rows = await fetchAllRows(() =>
    db.from('client_tox_summary').select('client_id')
  )
  for (const r of rows) if (r.client_id) ids.add(r.client_id)
  return ids
}

/**
 * Get all client IDs from client_massage_summary (anyone who's ever had massage).
 */
async function getMassageClientIds(db) {
  const ids = new Set()
  const rows = await fetchAllRows(() =>
    db.from('client_massage_summary').select('client_id')
  )
  for (const r of rows) if (r.client_id) ids.add(r.client_id)
  return ids
}

/**
 * Get all client IDs who have ever had a facial service (completed/final).
 */
async function getFacialClientIds(db) {
  const ids = new Set()
  const rows = await fetchAllRows(() =>
    db
      .from('blvd_appointment_services')
      .select('blvd_appointments!inner(client_id)')
      .in('service_slug', FACIAL_SLUGS)
      .in('blvd_appointments.status', ['completed', 'final'])
  )
  for (const r of rows) {
    const cid = r.blvd_appointments?.client_id
    if (cid) ids.add(cid)
  }
  return ids
}

/**
 * Get all client IDs with active memberships that have vouchers.
 */
async function getMembershipClientIds(db) {
  const ids = new Set()
  const rows = await fetchAllRows(() =>
    db
      .from('blvd_memberships')
      .select('client_id')
      .eq('status', 'ACTIVE')
      .not('vouchers', 'is', null)
  )
  for (const r of rows) if (r.client_id) ids.add(r.client_id)
  return ids
}

/**
 * Get all client IDs with active packages that have vouchers.
 */
async function getPackageClientIds(db) {
  const ids = new Set()
  const rows = await fetchAllRows(() =>
    db
      .from('blvd_packages')
      .select('client_id')
      .in('status', ['ACTIVE'])
      .not('vouchers', 'is', null)
  )
  for (const r of rows) if (r.client_id) ids.add(r.client_id)
  return ids
}

/**
 * Get the most recent provider_staff_id per client from completed appointments.
 * Returns { [client_id]: provider_staff_id }.
 */
async function getLastProviderMap(db, clientIds) {
  if (!clientIds.length) return {}

  const map = {}
  for (let i = 0; i < clientIds.length; i += 100) {
    const chunk = clientIds.slice(i, i + 100)
    const { data } = await db
      .from('blvd_appointment_services')
      .select('provider_staff_id, blvd_appointments!inner(client_id, start_at, status)')
      .in('blvd_appointments.client_id', chunk)
      .in('blvd_appointments.status', ['completed', 'final'])
      .order('blvd_appointments(start_at)', { ascending: false })

    for (const row of data || []) {
      const cid = row.blvd_appointments?.client_id
      if (!cid || map[cid]) continue
      if (row.provider_staff_id) map[cid] = row.provider_staff_id
    }
  }
  return map
}

/**
 * Get the last service name/slug/location for each client from completed appointments.
 * Returns { [client_id]: { service_name, service_slug, location_key } }.
 */
async function getLastServiceMap(db, clientIds) {
  if (!clientIds.length) return {}

  const map = {}
  for (let i = 0; i < clientIds.length; i += 100) {
    const chunk = clientIds.slice(i, i + 100)
    const { data } = await db
      .from('blvd_appointment_services')
      .select('service_name, service_slug, blvd_appointments!inner(client_id, start_at, location_key, status)')
      .in('blvd_appointments.client_id', chunk)
      .in('blvd_appointments.status', ['completed', 'final'])
      .order('blvd_appointments(start_at)', { ascending: false })

    for (const row of data || []) {
      const cid = row.blvd_appointments?.client_id
      if (!cid || map[cid]) continue
      map[cid] = {
        service_name: row.service_name,
        service_slug: row.service_slug,
        location_key: row.blvd_appointments.location_key,
      }
    }
  }
  return map
}
