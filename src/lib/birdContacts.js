// src/lib/birdContacts.js
// Upsert contacts to Bird CRM via Contacts API.
// Uses PATCH-by-identifier for idempotent create-or-update (phone as key).

const WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID
const ACCESS_KEY = process.env.BIRD_ACCESS_KEY

const BASE_URL = 'https://api.bird.com/workspaces'

/**
 * Create or update a Bird contact by phone number.
 * Only syncs Bird built-in attributes (firstName, lastName).
 * Custom attributes (lead_source, campaign, etc.) can be added once
 * their definitions are created in Bird's attribute settings.
 *
 * @param {object} opts
 * @param {string} opts.phone     - E.164 phone (e.g. +13175551234). Required.
 * @param {string} [opts.email]   - Email address (added as secondary identifier).
 * @param {string} [opts.firstName]
 * @param {string} [opts.lastName]
 * @returns {{ ok: boolean, contactId?: string, created?: boolean, error?: string }}
 */
export async function upsertBirdContact({ phone, email, firstName, lastName }) {
  if (!WORKSPACE_ID || !ACCESS_KEY) {
    console.warn('[birdContacts] Not configured — missing BIRD env vars')
    return { ok: false, error: 'Bird not configured' }
  }
  if (!phone) {
    return { ok: false, error: 'Phone number is required' }
  }

  // Only Bird built-in attributes
  const attrs = {}
  if (firstName) attrs.firstName = firstName
  if (lastName) attrs.lastName = lastName

  const url = `${BASE_URL}/${WORKSPACE_ID}/contacts/identifiers/phonenumber/${phone}`

  const body = { attributes: attrs }
  if (email) {
    body.addIdentifiers = [{ key: 'emailaddress', value: email.toLowerCase() }]
  }

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `AccessKey ${ACCESS_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error(`[birdContacts] Upsert failed (${res.status}):`, errText)
      return { ok: false, error: `Bird API ${res.status}`, detail: errText }
    }

    const data = await res.json()
    return {
      ok: true,
      contactId: data.id,
      created: res.status === 201,
    }
  } catch (err) {
    console.error('[birdContacts] Upsert error:', err.message)
    return { ok: false, error: err.message }
  }
}
