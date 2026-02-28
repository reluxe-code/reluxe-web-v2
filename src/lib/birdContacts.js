// src/lib/birdContacts.js
// Upsert contacts to Bird CRM via Contacts API.
// Uses PATCH-by-identifier for idempotent create-or-update (phone as key).
// Logs all sync attempts to bird_sync_log for auditing.

import { getServiceClient } from '@/lib/supabase'

const WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID
const ACCESS_KEY = process.env.BIRD_ACCESS_KEY

const BASE_URL = 'https://api.bird.com/workspaces'

/**
 * Log a Bird sync attempt to the audit table.
 */
async function logSyncAttempt({ phone, email, leadId, action, status, errorDetail, birdContactId, source }) {
  try {
    const db = getServiceClient()
    await db.from('bird_sync_log').insert({
      phone: phone || null,
      email: email || null,
      lead_id: leadId || null,
      action,
      status,
      error_detail: errorDetail || null,
      bird_contact_id: birdContactId || null,
      source: source || null,
    })
  } catch (err) {
    // Never let logging break the main flow
    console.warn('[birdContacts] Failed to write sync log:', err.message)
  }
}

/**
 * Create or update a Bird contact by phone number.
 * Includes retry with backoff for 429/5xx errors (max 2 retries).
 *
 * @param {object} opts
 * @param {string} opts.phone     - E.164 phone (e.g. +13175551234). Required.
 * @param {string} [opts.email]   - Email address (added as secondary identifier).
 * @param {string} [opts.firstName]
 * @param {string} [opts.lastName]
 * @param {string} [opts.source]  - Where this sync originated (checkout, leads_capture, etc.)
 * @param {string} [opts.leadId]  - Associated lead UUID for audit trail.
 * @returns {{ ok: boolean, contactId?: string, created?: boolean, error?: string }}
 */
export async function upsertBirdContact({ phone, email, firstName, lastName, source, leadId }) {
  if (!WORKSPACE_ID || !ACCESS_KEY) {
    console.warn('[birdContacts] Not configured — missing BIRD env vars')
    return { ok: false, error: 'Bird not configured' }
  }
  if (!phone) {
    return { ok: false, error: 'Phone number is required' }
  }

  const attrs = {}
  if (firstName) attrs.firstName = firstName
  if (lastName) attrs.lastName = lastName

  const url = `${BASE_URL}/${WORKSPACE_ID}/contacts/identifiers/phonenumber/${phone}`

  const body = { attributes: attrs }
  if (email) {
    body.addIdentifiers = [{ key: 'emailaddress', value: email.toLowerCase() }]
  }

  const MAX_RETRIES = 2

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `AccessKey ${ACCESS_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000), // 10s timeout
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        // Retry on 429 or 5xx
        if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 4000)
          console.warn(`[birdContacts] ${res.status} on attempt ${attempt + 1}, retrying in ${delay}ms`)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
        console.error(`[birdContacts] Upsert failed (${res.status}):`, errText)
        await logSyncAttempt({ phone, email, leadId, action: 'upsert', status: 'failed', errorDetail: `${res.status}: ${errText}`, source })
        return { ok: false, error: `Bird API ${res.status}`, detail: errText }
      }

      const data = await res.json()
      await logSyncAttempt({ phone, email, leadId, action: 'upsert', status: 'success', birdContactId: data.id, source })
      return {
        ok: true,
        contactId: data.id,
        created: res.status === 201,
      }
    } catch (err) {
      if (attempt < MAX_RETRIES && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 4000)
        console.warn(`[birdContacts] Timeout on attempt ${attempt + 1}, retrying in ${delay}ms`)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      console.error('[birdContacts] Upsert error:', err.message)
      await logSyncAttempt({ phone, email, leadId, action: 'upsert', status: 'failed', errorDetail: err.message, source })
      return { ok: false, error: err.message }
    }
  }
}
