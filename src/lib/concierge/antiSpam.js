// src/lib/concierge/antiSpam.js
// Anti-spam shield: frequency capping, quiet hours, priority dedup, booking checks.

/**
 * Apply all anti-spam logic gates to a flat list of candidates.
 * Returns { ready: [], flagged: [] } with flag_reason set on each flagged entry.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {Array} candidates - All cohort candidates merged
 * @param {{ max_touches_per_week: number, quiet_start_hour: number, quiet_end_hour: number, timezone: string }} config
 * @returns {Promise<{ ready: Array, flagged: Array }>}
 */
export async function applyAntiSpam(db, candidates, config) {
  if (!candidates.length) return { ready: [], flagged: [] }

  // 1. Priority dedup — if same phone in multiple cohorts, keep highest priority
  const deduped = deduplicateByPriority(candidates)

  // 2. Batch-load frequency cap data
  const phones = [...new Set(deduped.map((c) => c.phone))]
  const capCounts = await getFrequencyCapCounts(db, phones)

  // 3. Batch-load upcoming appointments
  const clientIds = [...new Set(deduped.map((c) => c.client_id).filter(Boolean))]
  const bookedClients = await getBookedClients(db, clientIds)

  // 4. Batch-load negative signal data (clicks without booking)
  const negativeSignalClients = await getNegativeSignalClients(db, phones)

  // 5. Check quiet hours
  const inQuietHours = isQuietHours(config)

  const ready = []
  const flagged = []

  for (const candidate of deduped) {
    // Quiet hours check
    if (inQuietHours) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'QUIET_HOURS' })
      continue
    }

    // Frequency cap check
    const touchCount = capCounts[candidate.phone] || 0
    if (touchCount >= (config.max_touches_per_week || 2)) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'CAP_REACHED' })
      continue
    }

    // Already booked check
    if (candidate.client_id && bookedClients.has(candidate.client_id)) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'ALREADY_BOOKED' })
      continue
    }

    // Negative signal suppression (3+ clicks without booking)
    if (negativeSignalClients.has(candidate.phone)) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'NEGATIVE_SIGNAL_SUPPRESSION' })
      continue
    }

    ready.push({ ...candidate, status: 'ready' })
  }

  return { ready, flagged }
}

/**
 * If a phone appears in multiple cohorts, keep only the highest priority (lowest number).
 */
function deduplicateByPriority(candidates) {
  const byPhone = new Map()
  for (const c of candidates) {
    const existing = byPhone.get(c.phone)
    if (!existing || c.priority < existing.priority) {
      byPhone.set(c.phone, c)
    }
  }
  return Array.from(byPhone.values())
}

/**
 * Count marketing touches in the last 7 days per phone.
 */
async function getFrequencyCapCounts(db, phones) {
  if (!phones.length) return {}

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const counts = {}

  // Batch query in chunks of 100 phones
  for (let i = 0; i < phones.length; i += 100) {
    const chunk = phones.slice(i, i + 100)
    const { data } = await db
      .from('marketing_touches')
      .select('phone')
      .in('phone', chunk)
      .gte('sent_at', sevenDaysAgo)

    for (const row of data || []) {
      counts[row.phone] = (counts[row.phone] || 0) + 1
    }
  }

  return counts
}

/**
 * Get set of client IDs with upcoming booked/confirmed appointments.
 */
async function getBookedClients(db, clientIds) {
  if (!clientIds.length) return new Set()

  const { data } = await db
    .from('blvd_appointments')
    .select('client_id')
    .in('client_id', clientIds)
    .in('status', ['booked', 'confirmed'])
    .gte('start_at', new Date().toISOString())

  return new Set((data || []).map((r) => r.client_id))
}

/**
 * Get set of phones with 3+ clicked marketing touches in the last 90 days
 * but no booked status — indicating disinterest.
 */
async function getNegativeSignalClients(db, phones) {
  if (!phones.length) return new Set()

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await db
    .from('marketing_touches')
    .select('phone, status')
    .in('phone', phones)
    .gte('sent_at', ninetyDaysAgo)

  // Group by phone: count clicks vs bookings
  const phoneStats = {}
  for (const row of data || []) {
    if (!phoneStats[row.phone]) phoneStats[row.phone] = { clicks: 0, bookings: 0 }
    if (row.status === 'clicked') phoneStats[row.phone].clicks++
    if (row.status === 'booked') phoneStats[row.phone].bookings++
  }

  const suppressed = new Set()
  for (const [phone, stats] of Object.entries(phoneStats)) {
    if (stats.clicks >= 3 && stats.bookings === 0) {
      suppressed.add(phone)
    }
  }

  return suppressed
}

/**
 * Check if we're currently in quiet hours (outside 10 AM – 7 PM in configured timezone).
 */
export function isQuietHours(config) {
  const tz = config.timezone || 'America/New_York'
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    hour12: false,
  })
  const currentHour = parseInt(formatter.format(now), 10)

  const start = config.quiet_start_hour ?? 10
  const end = config.quiet_end_hour ?? 19

  // Outside allowed window = quiet hours
  return currentHour < start || currentHour >= end
}
