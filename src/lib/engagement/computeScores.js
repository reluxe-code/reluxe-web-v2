// src/lib/engagement/computeScores.js
// Main orchestrator: batch-computes engagement scores for all clients.

import { computeBookingScores } from './dimensions/booking'
import { computeSmsScores } from './dimensions/sms'
import { computeEmailScores } from './dimensions/email'
import { computeWebScores } from './dimensions/web'
import { computeMembershipScores } from './dimensions/membership'
import { computeVoucherScores } from './dimensions/voucher'
import { computeProductScores } from './dimensions/product'
import { computeLoyaltyScores } from './dimensions/loyalty'
import { classifyCustomerType } from './classify'
import { detectChannelPreferences } from './channel'

const DEFAULT_WEIGHTS = {
  sms: 0.20,
  email: 0.05,
  web: 0.10,
  booking: 0.30,
  membership: 0.15,
  voucher: 0.05,
  product: 0.10,
  loyalty: 0.05,
}

const BATCH_SIZE = 200

/**
 * Compute engagement scores for all clients (or a single client).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {{ clientId?: string }} options - If clientId provided, compute for just that client
 * @returns {Promise<{ computed: number, errors: number }>}
 */
export async function computeAllScores(db, options = {}) {
  // Load scoring config
  const { data: configRow } = await db
    .from('site_config')
    .select('value')
    .eq('key', 'engagement_scoring')
    .single()

  const config = configRow?.value || {}
  if (config.enabled === false) {
    return { computed: 0, errors: 0, skipped: 'disabled' }
  }

  const weights = { ...DEFAULT_WEIGHTS, ...(config.scoring_weights || {}) }

  // Load unsubscribed phones/emails for opt-out scoring
  const { data: unsubscribed } = await db
    .from('client_channel_status')
    .select('phone, email, channel')
    .eq('status', 'unsubscribed')

  const unsubscribedPhones = new Set()
  const unsubscribedEmails = new Set()
  for (const row of unsubscribed || []) {
    if (row.channel === 'sms' && row.phone) unsubscribedPhones.add(row.phone)
    if (row.channel === 'email' && row.email) unsubscribedEmails.add(row.email)
  }

  let totalComputed = 0
  let totalErrors = 0

  if (options.clientId) {
    // Single client compute
    const result = await computeBatch(db, [options.clientId], weights, unsubscribedPhones, unsubscribedEmails)
    return { computed: result.computed, errors: result.errors }
  }

  // Full batch compute — paginate through all clients
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data: clients, error } = await db
      .from('blvd_clients')
      .select('id')
      .eq('active', true)
      .order('id')
      .range(offset, offset + BATCH_SIZE - 1)

    if (error) {
      console.error('[engagement] Client fetch error:', error.message)
      totalErrors++
      break
    }

    if (!clients || clients.length === 0) {
      hasMore = false
      break
    }

    const clientIds = clients.map(c => c.id)
    const result = await computeBatch(db, clientIds, weights, unsubscribedPhones, unsubscribedEmails)
    totalComputed += result.computed
    totalErrors += result.errors

    offset += BATCH_SIZE
    hasMore = clients.length === BATCH_SIZE
  }

  return { computed: totalComputed, errors: totalErrors }
}

/**
 * Compute scores for a batch of client IDs.
 */
async function computeBatch(db, clientIds, weights, unsubscribedPhones, unsubscribedEmails) {
  let computed = 0
  let errors = 0

  try {
    // 1. Load client data for phone/email/member lookups
    const { data: clients } = await db
      .from('blvd_clients')
      .select('id, phone, email, visit_count, total_spend, first_visit_at, last_visit_at')
      .in('id', clientIds)

    const clientPhoneMap = new Map()
    const clientEmailMap = new Map()
    const clientVisitData = {}

    for (const c of clients || []) {
      if (c.phone) clientPhoneMap.set(c.id, c.phone)
      if (c.email) clientEmailMap.set(c.id, c.email)

      const now = Date.now()
      clientVisitData[c.id] = {
        visit_count: c.visit_count || 0,
        total_spend: parseFloat(c.total_spend) || 0,
        days_since_last_visit: c.last_visit_at
          ? Math.floor((now - new Date(c.last_visit_at).getTime()) / (1000 * 60 * 60 * 24))
          : null,
        days_since_first_visit: c.first_visit_at
          ? Math.floor((now - new Date(c.first_visit_at).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      }
    }

    // Load member mappings (client → member)
    const { data: members } = await db
      .from('members')
      .select('id, blvd_client_id')
      .in('blvd_client_id', clientIds)

    const clientMemberMap = new Map()
    for (const m of members || []) {
      if (m.blvd_client_id) clientMemberMap.set(m.blvd_client_id, m.id)
    }

    // 2. Run all dimension computations in parallel
    const [
      bookingScores,
      smsScores,
      emailScores,
      webScores,
      membershipScores,
      voucherScores,
      productScores,
      loyaltyScores,
      channelPrefs,
    ] = await Promise.all([
      computeBookingScores(db, clientIds),
      computeSmsScores(db, clientIds, clientPhoneMap, unsubscribedPhones),
      computeEmailScores(db, clientIds, clientEmailMap, unsubscribedEmails),
      computeWebScores(db, clientIds, clientMemberMap),
      computeMembershipScores(db, clientIds),
      computeVoucherScores(db, clientIds),
      computeProductScores(db, clientIds),
      computeLoyaltyScores(db, clientIds, clientMemberMap),
      detectChannelPreferences(db, clientIds, clientPhoneMap, clientEmailMap, clientMemberMap),
    ])

    // 3. Assemble and upsert scores
    const rows = []

    for (const clientId of clientIds) {
      const booking = bookingScores[clientId] || { score: 0, detail: {} }
      const sms = smsScores[clientId] || { score: 0, detail: {} }
      const email = emailScores[clientId] || { score: 0, detail: {} }
      const web = webScores[clientId] || { score: 0, detail: {} }
      const membership = membershipScores[clientId] || { score: 0, detail: {} }
      const voucher = voucherScores[clientId] || { score: 0, detail: {} }
      const product = productScores[clientId] || { score: 0, detail: {} }
      const loyalty = loyaltyScores[clientId] || { score: 0, detail: {} }
      const channel = channelPrefs[clientId] || { channel: 'sms', confidence: 0, detail: {} }

      const overall = Math.round(
        (sms.score * weights.sms) +
        (email.score * weights.email) +
        (web.score * weights.web) +
        (booking.score * weights.booking) +
        (membership.score * weights.membership) +
        (voucher.score * weights.voucher) +
        (product.score * weights.product) +
        (loyalty.score * weights.loyalty)
      )

      const customerType = classifyCustomerType(
        { score_overall: overall },
        clientVisitData[clientId] || { visit_count: 0 }
      )

      rows.push({
        client_id: clientId,
        score_sms: sms.score,
        score_email: email.score,
        score_web: web.score,
        score_booking: booking.score,
        score_membership: membership.score,
        score_voucher: voucher.score,
        score_product: product.score,
        score_loyalty: loyalty.score,
        score_overall: Math.min(overall, 100),
        customer_type: customerType,
        preferred_channel: channel.channel,
        channel_confidence: channel.confidence,
        score_detail: {
          booking: booking.detail,
          sms: sms.detail,
          email: email.detail,
          web: web.detail,
          membership: membership.detail,
          voucher: voucher.detail,
          product: product.detail,
          loyalty: loyalty.detail,
          channel: channel.detail,
        },
        computed_at: new Date().toISOString(),
      })
    }

    // Batch upsert
    if (rows.length > 0) {
      const { error: upsertErr } = await db
        .from('client_engagement_scores')
        .upsert(rows, { onConflict: 'client_id' })

      if (upsertErr) {
        console.error('[engagement] Upsert error:', upsertErr.message)
        errors += rows.length
      } else {
        computed += rows.length
      }
    }
  } catch (err) {
    console.error('[engagement] Batch compute error:', err.message)
    errors += clientIds.length
  }

  return { computed, errors }
}

/**
 * Load engagement scores for a list of client IDs (for concierge use).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @returns {Promise<Record<string, { score_overall: number, customer_type: string }>>}
 */
export async function getEngagementScores(db, clientIds) {
  if (!clientIds.length) return {}

  const { data } = await db
    .from('client_engagement_scores')
    .select('client_id, score_overall, customer_type, preferred_channel')
    .in('client_id', clientIds)

  const map = {}
  for (const row of data || []) {
    map[row.client_id] = row
  }
  return map
}
