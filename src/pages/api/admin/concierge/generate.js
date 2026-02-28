// src/pages/api/admin/concierge/generate.js
// POST: compute all cohort candidates, apply anti-spam, insert into concierge_queue.
import crypto from 'crypto'
import { getServiceClient } from '@/lib/supabase'
import { computeToxJourney, computeVoucherRecovery, computeAestheticWinback, computeLastMinuteGap, computePackageVoucherRecovery } from '@/lib/concierge/cohorts'
import { applyAntiSpam } from '@/lib/concierge/antiSpam'
import { buildSmsBody, pickVariant } from '@/lib/concierge/smsBuilder'
import { generateConciergeLink } from '@/lib/concierge/linkService'

export const config = { maxDuration: 60 }

const COHORT_FUNCTIONS = {
  tox_journey: computeToxJourney,
  membership_voucher: computeVoucherRecovery,
  aesthetic_winback: computeAestheticWinback,
  last_minute_gap: computeLastMinuteGap,
  package_voucher: computePackageVoucherRecovery,
}

export default async function handler(req, res) {
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
        console.error(`[concierge/generate] Error computing ${cohortKey}:`, err.message)
        cohortCounts[cohortKey] = { computed: 0, error: err.message }
      }
    }

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
        console.error('[concierge/generate] Link generation failed:', err.message)
      }

      // Build SMS body
      const smsBody = buildSmsBody(template, candidate, bookingUrl || '', smsOpts)

      queueInserts.push({
        batch_id: batchId,
        client_id: candidate.client_id,
        phone: candidate.phone,
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
        membership_voucher: { cohort: 'P2', priority: 2 },
        aesthetic_winback: { cohort: 'P3', priority: 3 },
        last_minute_gap: { cohort: 'P4', priority: 4 },
        package_voucher: { cohort: 'P5', priority: 5 },
      }[cohortKey] || { cohort: 'P0', priority: 0 }

      const testCandidate = {
        first_name: 'Kyle',
        provider_name: testProvider.name,
        service_name: cohortKey === 'aesthetic_winback' ? 'HydraFacial' : cohortKey === 'package_voucher' ? 'Morpheus8 Treatment' : 'Tox Treatment',
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
          console.error('[concierge/generate] Test link generation failed:', err.message)
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
          phone: TEST_PHONE,
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
        console.error('[concierge/generate] Insert error:', error.message)
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
    console.error('[concierge/generate]', err)
    return res.status(500).json({ error: err.message })
  }
}
