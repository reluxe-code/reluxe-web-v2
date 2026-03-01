// src/lib/metaCAPI.js
// Server-side Meta Conversions API (CAPI) client.
// Sends hashed conversion events to Meta for campaign optimization,
// retargeting, and offline attribution. Fire-and-forget pattern
// matches birdTracking.js.

import crypto from 'crypto'

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || ''
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || ''
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || ''
const API_VERSION = 'v21.0'
const ENDPOINT = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`

/**
 * SHA-256 hash a value for Meta's user_data fields.
 * Trims, lowercases, then hashes. Returns null if falsy.
 */
export function hashForMeta(value) {
  if (!value) return null
  return crypto.createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex')
}

/**
 * Normalize phone to digits-only with US country code.
 */
function normalizePhone(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 ? `1${digits}` : digits
}

/**
 * Build the user_data object for a CAPI event.
 * Hashes PII fields; passes fbp/fbc/ip/ua as-is.
 */
export function buildUserData({ email, phone, firstName, lastName, externalId, fbp, fbc, clientIp, userAgent }) {
  return {
    em: email ? [hashForMeta(email)] : undefined,
    ph: phone ? [hashForMeta(normalizePhone(phone))] : undefined,
    fn: hashForMeta(firstName) || undefined,
    ln: hashForMeta(lastName) || undefined,
    external_id: externalId ? [hashForMeta(externalId)] : undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined,
    client_ip_address: clientIp || undefined,
    client_user_agent: userAgent || undefined,
  }
}

/**
 * Generate a unique event_id for deduplication.
 */
export function generateEventId() {
  return crypto.randomUUID()
}

/**
 * Send event(s) to Meta Conversions API.
 * @param {Object|Object[]} events - Single event or array (max 1000).
 * @returns {Promise<{ok: boolean, response?: any, error?: string}>}
 */
export async function sendCAPIEvents(events) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return { ok: false, error: 'Missing META_ACCESS_TOKEN or FB_PIXEL_ID' }
  }

  const eventArray = Array.isArray(events) ? events : [events]
  const body = {
    data: eventArray,
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  }

  try {
    const res = await fetch(`${ENDPOINT}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) {
      console.error('[metaCAPI] API error:', json)
      return { ok: false, error: json.error?.message || `HTTP ${res.status}` }
    }
    return { ok: true, response: json }
  } catch (err) {
    console.error('[metaCAPI] Network error:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Fire a single CAPI event (fire-and-forget). Does not throw.
 */
export function fireCAPIEvent({ eventName, eventId, eventSourceUrl, actionSource, userData, customData }) {
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId || generateEventId(),
    action_source: actionSource || 'website',
    user_data: userData,
    custom_data: customData || {},
    ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
  }
  sendCAPIEvents(event).catch(err => {
    console.error(`[metaCAPI] Fire-and-forget error for ${eventName}:`, err.message)
  })
}
