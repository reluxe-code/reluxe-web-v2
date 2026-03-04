// src/pages/api/admin/concierge/generate.js
// POST: compute all cohort candidates, apply anti-spam, insert into concierge_queue.
import crypto from 'crypto'
import { getServiceClient } from '@/lib/supabase'
import { computeToxJourney, computeVoucherRecovery, computeAestheticWinback, computeLastMinuteGap, computePackageVoucherRecovery, computeMassageJourney } from '@/lib/concierge/cohorts'
import { applyAntiSpam } from '@/lib/concierge/antiSpam'
import { buildSmsBody, pickVariant } from '@/lib/concierge/smsBuilder'
import { generateConciergeLink } from '@/lib/concierge/linkService'
import { withAdminAuth } from '@/lib/adminAuth'
import { resolveClientBatch } from '@/services/phiProxy'
import { adminQuery } from '@/server/blvdAdmin'
import { LOCATION_IDS } from '@/server/blvd'
import { encryptPhone, decryptPhone } from '@/lib/piiHash'
import { safeError } from '@/lib/logSanitizer'

export const config = { maxDuration: 60 }

// ── Boulevard live appointment check ──
// Verifies candidates don't have upcoming appointments directly from Boulevard.
// This catches appointments that haven't synced to our DB yet.
const LOCATION_URNS = Object.entries(LOCATION_IDS).map(([key, uuid]) => ({
  key,
  urn: `urn:blvd:Location:${uuid}`,
}))

const CANCELLED_STATES = new Set(['CANCELLED', 'NO_SHOW'])

async function filterBookedCandidates(candidates) {
  if (!candidates.length) return candidates

  // Collect unique boulevard_ids
  const blvdIdSet = new Set()
  for (const c of candidates) {
    if (c.boulevard_id) blvdIdSet.add(c.boulevard_id)
  }
  if (!blvdIdSet.size) return candidates

  const blvdIds = [...blvdIdSet]
  const bookedBlvdIds = new Set()

  // For each location, batch-check candidates' upcoming appointments
  for (const loc of LOCATION_URNS) {
    // Check 10 clients at a time using GraphQL aliases
    for (let i = 0; i < blvdIds.length; i += 10) {
      const batch = blvdIds.slice(i, i + 10)
      const fragments = batch.map((clientId, idx) =>
        `loc${idx}: appointments(locationId: "${loc.urn}", clientId: "${clientId}", first: 5) {
          edges { node { id state startAt } }
        }`
      )

      try {
        const data = await adminQuery(`query { ${fragments.join('\n')} }`)
        const now = new Date()

        batch.forEach((clientId, idx) => {
          const edges = data?.[`loc${idx}`]?.edges || []
          for (const edge of edges) {
            const appt = edge.node
            if (!appt?.startAt) continue
            if (CANCELLED_STATES.has(appt.state)) continue
            if (new Date(appt.startAt) >= now) {
              bookedBlvdIds.add(clientId)
              break
            }
          }
        })
      } catch (err) {
        safeError('[concierge/generate] Boulevard appointment check error:', err.message)
      }
    }
  }

  if (!bookedBlvdIds.size) return candidates

  const filtered = candidates.filter((c) => !bookedBlvdIds.has(c.boulevard_id))
  const removed = candidates.length - filtered.length
  if (removed > 0) {
    safeError(`[concierge/generate] Filtered ${removed} candidates with upcoming Boulevard appointments`)
  }
  return filtered
}

const COHORT_FUNCTIONS = {
  tox_journey: computeToxJourney,
  membership_voucher: computeVoucherRecovery,
  aesthetic_winback: computeAestheticWinback,
  last_minute_gap: computeLastMinuteGap,
  package_voucher: computePackageVoucherRecovery,
  massage_journey: computeMassageJourney,
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()
  const { cohorts: requestedCohorts } = req.body || {}

  try {
    // 1. Load engine config
    const { data: configRow } = await db
      .from('site_config')
      .select('value')
      .eq('key', 'concierge_engine')
      .single()

    const engineConfig = configRow?.value || {}
    if (!engineConfig.enabled) {
      return res.status(400).json({ error: 'Concierge engine is disabled. Enable it in config first.' })
    }

    // 2. Load campaign templates
    const { data: campaigns } = await db
      .from('concierge_campaigns')
      .select('*')
      .eq('active', true)

    const campaignMap = Object.fromEntries((campaigns || []).map((c) => [c.campaign_slug, c]))

    // 3. Expire old queue entries — both time-expired AND stale ready/flagged entries for cohorts being regenerated
    await db
      .from('concierge_queue')
      .update({ status: 'expired' })
      .eq('status', 'ready')
      .lt('expires_at', new Date().toISOString())

    // 3b. Expire all existing ready+flagged entries for the cohorts we're about to regenerate
    for (const cohortKey of (requestedCohorts?.length
      ? Object.keys(COHORT_FUNCTIONS).filter((k) => requestedCohorts.includes(k))
      : Object.keys(COHORT_FUNCTIONS))) {
      await db
        .from('concierge_queue')
        .update({ status: 'expired' })
        .in('status', ['ready', 'flagged'])
        .eq('campaign_slug', cohortKey)
    }

    // 4. Generate batch ID
    const batchId = `${new Date().toISOString().slice(0, 10)}_${crypto.randomBytes(4).toString('hex')}`

    // 5. Compute each cohort
    const cohortsToRun = requestedCohorts?.length
      ? Object.keys(COHORT_FUNCTIONS).filter((k) => requestedCohorts.includes(k))
      : Object.keys(COHORT_FUNCTIONS)

    let allCandidates = []
    const cohortCounts = {}

    for (const cohortKey of cohortsToRun) {
      const computeFn = COHORT_FUNCTIONS[cohortKey]
      if (!computeFn) continue

      try {
        const candidates = await computeFn(db, engineConfig)
        cohortCounts[cohortKey] = { computed: candidates.length }
        allCandidates.push(...candidates)
      } catch (err) {
        safeError(`[concierge/generate] Error computing ${cohortKey}:`, err.message)
        cohortCounts[cohortKey] = { computed: 0, error: err.message }
      }
    }

    // 5b. Live Boulevard check — filter out candidates with upcoming appointments
    // that may not have synced to our DB yet
    allCandidates = await filterBookedCandidates(allCandidates)

    // 6. Apply anti-spam shield
    const { ready, flagged } = await applyAntiSpam(db, allCandidates, engineConfig)

    // 6b. Batch-fetch account credits for all candidates
    const creditReminderThreshold = Number(engineConfig.credit_reminder_threshold || 0)
    const allForSms = [...ready, ...flagged]
    const uniqueClientIds = [...new Set(allForSms.map((c) => c.client_id).filter(Boolean))]

    if (uniqueClientIds.length && creditReminderThreshold > 0) {
      const creditMap = {}
      for (let i = 0; i < uniqueClientIds.length; i += 100) {
        const chunk = uniqueClientIds.slice(i, i + 100)
        const { data: clients } = await db
          .from('blvd_clients')
          .select('id, account_credit')
          .in('id', chunk)
        for (const c of clients || []) {
          creditMap[c.id] = c.account_credit || 0
        }
      }
      for (const candidate of allForSms) {
        if (candidate.client_id && creditMap[candidate.client_id]) {
          candidate.account_credit = creditMap[candidate.client_id]
        }
      }
    }

    // 6c. PHI Proxy: batch-resolve PII for SMS body interpolation + phone encryption
    // Candidates carry boulevard_id but no raw PII — resolve transiently via Boulevard API
    const candidateBoulevardIds = [...new Set(allForSms.map((c) => c.boulevard_id).filter(Boolean))]
    const resolvedPii = {}
    for (let i = 0; i < candidateBoulevardIds.length; i += 10) {
      const batch = candidateBoulevardIds.slice(i, i + 10)
      try {
        const resolved = await resolveClientBatch(batch, { masked: false })
        Object.assign(resolvedPii, resolved)
      } catch (err) {
        safeError('[concierge/generate] PHI Proxy batch failed:', err.message)
      }
    }

    // Attach transient PII to candidates (never persisted to DB in raw form)
    for (const candidate of allForSms) {
      const pii = candidate.boulevard_id ? resolvedPii[candidate.boulevard_id] : null
      if (pii) {
        candidate.first_name = pii.firstName || null
        candidate._resolved_phone = pii.mobilePhone || null
      } else if (!candidate.first_name) {
        // Prospects may already carry first_name from leads table
        candidate.first_name = null
        candidate._resolved_phone = null
      }
    }

    // 6d. Resolve phone for prospects (leads without boulevard_id)
    // Phone is AES-256-GCM encrypted in leads table — decrypt transiently
    const prospectCandidates = allForSms.filter((c) => c.sub_audience === 'prospect' && c.lead_id)
    if (prospectCandidates.length) {
      const leadMap = {}
      const leadIds = prospectCandidates.map((c) => c.lead_id)
      for (let i = 0; i < leadIds.length; i += 100) {
        const chunk = leadIds.slice(i, i + 100)
        const { data: leadRows } = await db
          .from('leads')
          .select('id, phone_encrypted, first_name')
          .in('id', chunk)
          .not('phone_encrypted', 'is', null)
        for (const l of leadRows || []) leadMap[l.id] = l
      }
      for (const candidate of prospectCandidates) {
        const lead = leadMap[candidate.lead_id]
        if (lead) {
          candidate._resolved_phone = decryptPhone(lead.phone_encrypted)
          candidate.first_name = candidate.first_name || lead.first_name || null
        }
      }
    }

    // 7. For each candidate, build SMS + link and insert into queue
    const smsOpts = creditReminderThreshold > 0 ? { creditReminderThreshold } : {}
    const unavailableProviders = new Set(engineConfig.unavailable_providers || [])
    const queueInserts = []

    for (const candidate of allForSms) {
      const campaign = campaignMap[candidate.campaign_slug]
      if (!campaign) continue

      // Check if provider is unavailable — use generic template + strip provider from link
      const providerUnavailable = candidate.provider_slug && unavailableProviders.has(candidate.provider_slug)

      let variant, template
      if (providerUnavailable && campaign.unavailable_template) {
        variant = 'U'
        template = campaign.unavailable_template
        candidate.logic_trace = [...(candidate.logic_trace || []), `PROVIDER_UNAVAILABLE: ${candidate.provider_name} (${candidate.provider_slug})`]
        candidate.provider_slug = null
        candidate.provider_name = null
        candidate.provider_staff_id = null
      } else {
        ;({ variant, template } = pickVariant(campaign))
      }

      // Generate booking link (provider cleared above if unavailable → generic link)
      let linkToken = null
      let bookingUrl = null

      try {
        const link = await generateConciergeLink(db, {
          clientId: candidate.client_id,
          providerSlug: candidate.provider_slug,
          campaignSlug: candidate.campaign_slug,
          serviceSlug: candidate.service_slug || null,
          locationKey: candidate.location_key,
        })
        linkToken = link.token
        bookingUrl = link.url
      } catch (err) {
        safeError('[concierge/generate] Link generation failed:', err.message)
      }

      // Build SMS body
      const smsBody = buildSmsBody(template, candidate, bookingUrl || '', smsOpts)

      // Encrypt phone for transient queue storage (nulled after send)
      const rawPhone = candidate._resolved_phone
      const phoneEncrypted = rawPhone ? encryptPhone(rawPhone) : null

      queueInserts.push({
        batch_id: batchId,
        client_id: candidate.client_id,
        boulevard_id: candidate.boulevard_id || null,
        phone_encrypted: phoneEncrypted,
        phone_hash_v1: candidate.phone_hash_v1 || null,
        campaign_slug: candidate.campaign_slug,
        cohort: candidate.cohort,
        priority: candidate.priority,
        variant,
        sms_body: smsBody,
        logic_trace: candidate.logic_trace,
        booking_url: bookingUrl,
        link_token: linkToken,
        provider_staff_id: candidate.provider_staff_id,
        provider_name: candidate.provider_name,
        service_name: candidate.service_name,
        location_key: candidate.location_key,
        days_overdue: candidate.days_overdue,
        avg_interval: candidate.avg_interval,
        lead_id: candidate.lead_id || null,
        sub_audience: candidate.sub_audience || null,
        status: candidate.status || 'ready',
        flag_reason: candidate.flag_reason || null,
      })
    }

    // 7b. Inject test records — 1 per variant per active campaign, phone → admin
    // Uses a real provider so the concierge link + booking flow actually works end-to-end
    const TEST_PHONE = '+13177963048'

    // Grab a real provider for realistic test links
    const { data: testStaff } = await db
      .from('staff')
      .select('id, name, slug')
      .eq('status', 'published')
      .not('slug', 'is', null)
      .limit(1)
      .single()

    const testProvider = testStaff || { id: null, name: 'Provider', slug: null }

    for (const cohortKey of cohortsToRun) {
      const campaign = campaignMap[cohortKey]
      if (!campaign) continue

      const cohortMeta = {
        tox_journey: { cohort: 'P1', priority: 1 },
        massage_journey: { cohort: 'P2', priority: 2 },
        membership_voucher: { cohort: 'P3', priority: 3 },
        aesthetic_winback: { cohort: 'P4', priority: 4 },
        last_minute_gap: { cohort: 'P5', priority: 5 },
        package_voucher: { cohort: 'P6', priority: 6 },
      }[cohortKey] || { cohort: 'P0', priority: 0 }

      const testCandidate = {
        first_name: 'Kyle',
        provider_name: testProvider.name,
        service_name: cohortKey === 'aesthetic_winback' ? 'HydraFacial' : cohortKey === 'package_voucher' ? 'Morpheus8 Treatment' : cohortKey === 'massage_journey' ? 'Massage' : cohortKey === 'last_minute_gap' ? 'Consultation' : 'Tox Treatment',
        days_overdue: 30,
        voucher_service: cohortKey === 'package_voucher' ? 'Morpheus8 Treatment' : 'Monthly Facial',
        sessions_remaining: cohortKey === 'package_voucher' ? 2 : undefined,
        voucher_expiry_text: cohortKey === 'package_voucher' ? 'Heads up - these expire Jun 30, 2027. ' : undefined,
        location_key: 'westfield',
        account_credit: creditReminderThreshold > 0 ? 15000 : 0, // $150 test credit
      }

      // Generate a real concierge link for the test record
      let testLinkToken = null
      let testBookingUrl = null
      if (testProvider.slug) {
        try {
          const link = await generateConciergeLink(db, {
            clientId: null,
            providerSlug: testProvider.slug,
            campaignSlug: cohortKey,
            serviceSlug: cohortKey === 'aesthetic_winback' ? 'hydrafacial' : null,
            locationKey: 'westfield',
          })
          testLinkToken = link.token
          testBookingUrl = link.url
        } catch (err) {
          safeError('[concierge/generate] Test link generation failed:', err.message)
        }
      }

      const variants = [{ variant: 'A', template: campaign.variant_a_template }]
      if (campaign.variant_b_template) {
        variants.push({ variant: 'B', template: campaign.variant_b_template })
      }

      for (const { variant, template } of variants) {
        const smsBody = buildSmsBody(template, testCandidate, testBookingUrl || '', smsOpts)

        queueInserts.unshift({
          batch_id: batchId,
          client_id: null,
          boulevard_id: null,
          phone_encrypted: encryptPhone(TEST_PHONE),
          phone_hash_v1: null,
          campaign_slug: cohortKey,
          cohort: cohortMeta.cohort,
          priority: 0,
          variant,
          sms_body: smsBody,
          logic_trace: ['TEST RECORD — sends to admin phone', `Campaign: ${cohortKey}`, `Variant: ${variant}`, `Provider: ${testProvider.name}`],
          booking_url: testBookingUrl,
          link_token: testLinkToken,
          provider_staff_id: testProvider.id,
          provider_name: testProvider.name,
          service_name: testCandidate.service_name,
          location_key: 'westfield',
          days_overdue: 30,
          avg_interval: null,
          status: 'ready',
          flag_reason: null,
        })
      }
    }

    // Insert in chunks of 50
    for (let i = 0; i < queueInserts.length; i += 50) {
      const chunk = queueInserts.slice(i, i + 50)
      const { error } = await db.from('concierge_queue').insert(chunk)
      if (error) {
        safeError('[concierge/generate] Insert error:', error.message)
        throw error
      }
    }

    // 8. Build summary
    const summary = {}
    for (const cohortKey of cohortsToRun) {
      summary[cohortKey] = {
        computed: cohortCounts[cohortKey]?.computed || 0,
        ready: queueInserts.filter((q) => q.campaign_slug === cohortKey && q.status === 'ready').length,
        flagged: queueInserts.filter((q) => q.campaign_slug === cohortKey && q.status === 'flagged').length,
        error: cohortCounts[cohortKey]?.error || null,
      }
    }

    return res.json({
      ok: true,
      batch_id: batchId,
      summary,
      total_ready: ready.length,
      total_flagged: flagged.length,
    })
  } catch (err) {
    safeError('[concierge/generate]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
