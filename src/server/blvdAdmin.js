// src/server/blvdAdmin.js
// Boulevard Admin API (GraphQL) client.
//
// From Boulevard docs:
//   Admin URL: https://dashboard.boulevard.io/api/2020-01/admin
//   Auth: HMAC-signed token (same pattern as Client API but with "blvd-admin-v1" prefix)
//
// Token format (derived from Client API docs):
//   payload  = "blvd-admin-v1" + BUSINESS_ID + unix_timestamp
//   signature = base64(hmac_sha256(payload, base64_decode(SECRET_KEY)))
//   token    = signature + payload
//   header   = "Basic " + base64(API_KEY + ":" + token)

import crypto from 'crypto'

const BUSINESS_ID = process.env.BLVD_BUSINESS_ID
const API_KEY = process.env.BLVD_ADMIN_API_KEY
const API_SECRET = process.env.BLVD_ADMIN_API_SECRET

if (!BUSINESS_ID) throw new Error('Missing BLVD_BUSINESS_ID')
if (!API_KEY) throw new Error('Missing BLVD_ADMIN_API_KEY')
if (!API_SECRET) throw new Error('Missing BLVD_ADMIN_API_SECRET')

const ADMIN_URL = `https://dashboard.boulevard.io/api/2020-01/admin`

function buildAuthHeader() {
  const prefix = 'blvd-admin-v1'
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const tokenPayload = `${prefix}${BUSINESS_ID}${timestamp}`

  // HMAC-SHA256 sign the payload with the base64-decoded secret
  const rawKey = Buffer.from(API_SECRET, 'base64')
  const rawMac = crypto.createHmac('sha256', rawKey).update(tokenPayload, 'utf8').digest()
  const signature = rawMac.toString('base64')

  // Token = signature + payload
  const token = `${signature}${tokenPayload}`

  // Basic auth: base64(API_KEY:token)
  const credentials = Buffer.from(`${API_KEY}:${token}`).toString('base64')
  return `Basic ${credentials}`
}

export function getAdminAuthHeader() {
  return buildAuthHeader()
}

export async function adminQuery(query, variables = {}) {
  const res = await fetch(ADMIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: buildAuthHeader(),
    },
    body: JSON.stringify({ query, variables }),
  })

  const text = await res.text()

  // Detect HTML responses (wrong URL or auth redirect)
  if (text.startsWith('<') || text.includes('<!DOCTYPE')) {
    throw new Error(
      `Boulevard returned HTML instead of JSON. ` +
      `URL: ${ADMIN_URL} | Status: ${res.status} | ` +
      `First 200 chars: ${text.slice(0, 200).replace(/\s+/g, ' ')}`
    )
  }

  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(
      `Boulevard returned non-JSON. Status: ${res.status} | Body: ${text.slice(0, 300)}`
    )
  }

  if (!res.ok) {
    throw new Error(
      `Boulevard Admin API error ${res.status}: ${json?.error || json?.message || text.slice(0, 300)}`
    )
  }

  if (json.errors?.length) {
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join('; ')}`
    )
  }

  return json.data
}

// Export URL for debugging
export { ADMIN_URL }
