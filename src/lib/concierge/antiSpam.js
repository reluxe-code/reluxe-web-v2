// src/lib/concierge/antiSpam.js
// Anti-spam shield: opt-out enforcement, frequency capping, quiet hours,
// priority dedup, booking checks, score-aware negative signal suppression.

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

  // 1. Priority dedup — if same phone_hash in multiple cohorts, keep highest priority
  const deduped = deduplicateByPriority(candidates)

  // 2. Batch-load opt-out status (hard gate — checked first)
  const phoneHashes = [...new Set(deduped.map((c) => c.phone_hash_v1).filter(Boolean))]
  const optedOutHashes = await getOptedOutHashes(db, phoneHashes)

  // 3. Batch-load frequency cap data
  const capCounts = await getFrequencyCapCounts(db, phoneHashes)

  // 3b. Batch-load per-campaign cooldown (same campaign within 7 days = skip)
  const campaignSlugs = [...new Set(deduped.map((c) => c.campaign_slug).filter(Boolean))]
  const campaignCooldowns = await getCampaignCooldowns(db, phoneHashes, campaignSlugs)

  // 4. Batch-load upcoming appointments
  const clientIds = [...new Set(deduped.map((c) => c.client_id).filter(Boolean))]
  const bookedClients = await getBookedClients(db, clientIds)

  // 5. Batch-load engagement scores for enhanced negative signal thresholds
  const scoreMap = await getClientEngagementScores(db, clientIds)

  // 6. Batch-load negative signal data (score-aware thresholds)
  const negativeSignalClients = await getNegativeSignalClients(db, phoneHashes, scoreMap, deduped)

  // 7. Check quiet hours
  const inQuietHours = isQuietHours(config)

  const ready = []
  const flagged = []

  for (const candidate of deduped) {
    // Opt-out check (hard gate — first check, no override)
    if (optedOutHashes.has(candidate.phone_hash_v1)) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'OPTED_OUT' })
      continue
    }

    // Quiet hours check
    if (inQuietHours) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'QUIET_HOURS' })
      continue
    }

    // Frequency cap check (global — any campaign)
    const touchCount = capCounts[candidate.phone_hash_v1] || 0
    if (touchCount >= (config.max_touches_per_week || 2)) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'CAP_REACHED' })
      continue
    }

    // Per-campaign cooldown — same campaign within 7 days
    const cooldownKey = `${candidate.phone_hash_v1}:${candidate.campaign_slug}`
    if (campaignCooldowns.has(cooldownKey)) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'CAMPAIGN_COOLDOWN' })
      continue
    }

    // Already booked check
    if (candidate.client_id && bookedClients.has(candidate.client_id)) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'ALREADY_BOOKED' })
      continue
    }

    // Negative signal suppression (score-aware thresholds)
    if (negativeSignalClients.has(candidate.phone_hash_v1)) {
      flagged.push({ ...candidate, status: 'flagged', flag_reason: 'NEGATIVE_SIGNAL_SUPPRESSION' })
      continue
    }

    // Attach engagement data to candidate for downstream use (logic_trace, priority boost)
    if (candidate.client_id && scoreMap[candidate.client_id]) {
      const scores = scoreMap[candidate.client_id]
      candidate.engagement_score = scores.score_overall
      candidate.customer_type = scores.customer_type

      // Priority boost: champions and loyal get priority - 1 (higher)
      if (scores.customer_type === 'champion' || scores.customer_type === 'loyal') {
        candidate.priority = Math.max(1, candidate.priority - 1)
        candidate.logic_trace = [
          ...(candidate.logic_trace || []),
          `PRIORITY_BOOST: ${scores.customer_type} (score: ${scores.score_overall})`,
        ]
      }

      // Priority demotion: low engagement or hibernating get +1
      if (scores.score_overall < 20 || scores.customer_type === 'hibernating') {
        candidate.priority = candidate.priority + 1
        candidate.logic_trace = [
          ...(candidate.logic_trace || []),
          `PRIORITY_DEMOTE: low engagement (score: ${scores.score_overall}, type: ${scores.customer_type})`,
        ]
      }
    }

    ready.push({ ...candidate, status: 'ready' })
  }

  return { ready, flagged }
}

/**
 * If a phone_hash appears in multiple cohorts, keep only the highest priority (lowest number).
 */
function deduplicateByPriority(candidates) {
  const byHash = new Map()
  for (const c of candidates) {
    const key = c.phone_hash_v1
    if (!key) continue
    const existing = byHash.get(key)
    if (!existing || c.priority < existing.priority) {
      byHash.set(key, c)
    }
  }
  return Array.from(byHash.values())
}

/**
 * Get set of phone hashes that have opted out of SMS.
 */
async function getOptedOutHashes(db, phoneHashes) {
  if (!phoneHashes.length) return new Set()

  const opted = new Set()

  for (let i = 0; i < phoneHashes.length; i += 100) {
    const chunk = phoneHashes.slice(i, i + 100)
    const { data } = await db
      .from('client_channel_status')
      .select('phone_hash_v1')
      .in('phone_hash_v1', chunk)
      .eq('channel', 'sms')
      .eq('status', 'unsubscribed')

    for (const row of data || []) {
      opted.add(row.phone_hash_v1)
    }
  }

  return opted
}

/**
 * Get set of "phoneHash:campaignSlug" keys where the client was already
 * sent the same campaign within the last 7 days. Prevents repeat triggers.
 */
async function getCampaignCooldowns(db, phoneHashes, campaignSlugs) {
  if (!phoneHashes.length || !campaignSlugs.length) return new Set()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const cooldowns = new Set()

  for (let i = 0; i < phoneHashes.length; i += 100) {
    const chunk = phoneHashes.slice(i, i + 100)
    const { data } = await db
      .from('marketing_touches')
      .select('phone_hash_v1, campaign_slug')
      .in('phone_hash_v1', chunk)
      .in('campaign_slug', campaignSlugs)
      .gte('sent_at', sevenDaysAgo)

    for (const row of data || []) {
      if (row.phone_hash_v1 && row.campaign_slug) {
        cooldowns.add(`${row.phone_hash_v1}:${row.campaign_slug}`)
      }
    }
  }

  return cooldowns
}

/**
 * Count marketing touches in the last 7 days per phone hash.
 */
async function getFrequencyCapCounts(db, phoneHashes) {
  if (!phoneHashes.length) return {}

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const counts = {}

  for (let i = 0; i < phoneHashes.length; i += 100) {
    const chunk = phoneHashes.slice(i, i + 100)
    const { data } = await db
      .from('marketing_touches')
      .select('phone_hash_v1')
      .in('phone_hash_v1', chunk)
      .gte('sent_at', sevenDaysAgo)

    for (const row of data || []) {
      counts[row.phone_hash_v1] = (counts[row.phone_hash_v1] || 0) + 1
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
 * Load engagement scores for candidate client IDs.
 */
async function getClientEngagementScores(db, clientIds) {
  if (!clientIds.length) return {}

  const map = {}

  for (let i = 0; i < clientIds.length; i += 100) {
    const chunk = clientIds.slice(i, i + 100)
    const { data } = await db
      .from('client_engagement_scores')
      .select('client_id, score_overall, customer_type')
      .in('client_id', chunk)

    for (const row of data || []) {
      map[row.client_id] = row
    }
  }

  return map
}

/**
 * Get set of phone hashes with clicks without booking — score-aware thresholds.
 * High engagers (score >= 60): 5 clicks before suppression
 * Low engagers: 3 clicks before suppression (original behavior)
 */
async function getNegativeSignalClients(db, phoneHashes, scoreMap, candidates) {
  if (!phoneHashes.length) return new Set()

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await db
    .from('marketing_touches')
    .select('phone_hash_v1, status')
    .in('phone_hash_v1', phoneHashes)
    .gte('sent_at', ninetyDaysAgo)

  // Group by phone hash: count clicks vs bookings
  const hashStats = {}
  for (const row of data || []) {
    if (!row.phone_hash_v1) continue
    if (!hashStats[row.phone_hash_v1]) hashStats[row.phone_hash_v1] = { clicks: 0, bookings: 0 }
    if (row.status === 'clicked') hashStats[row.phone_hash_v1].clicks++
    if (row.status === 'booked') hashStats[row.phone_hash_v1].bookings++
  }

  // Build phone_hash → client_id map for score lookup
  const hashToClient = {}
  for (const c of candidates) {
    if (c.phone_hash_v1 && c.client_id) hashToClient[c.phone_hash_v1] = c.client_id
  }

  const suppressed = new Set()
  for (const [hash, stats] of Object.entries(hashStats)) {
    const clientId = hashToClient[hash]
    const clientScore = clientId ? scoreMap[clientId]?.score_overall : null

    const threshold = (clientScore != null && clientScore >= 60) ? 5 : 3

    if (stats.clicks >= threshold && stats.bookings === 0) {
      suppressed.add(hash)
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
