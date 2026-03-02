// src/services/phiProxy/index.js
// PHI Proxy — all Boulevard identity lookups go through here.
// Main app code NEVER calls blvdAdmin directly for client PII.
// Responses are transient — never persisted to DB.
import { adminQuery } from '@/server/blvdAdmin'
import { safeError } from '@/lib/logSanitizer'

const CLIENT_FIELDS = 'firstName lastName email mobilePhone'

/**
 * Resolve a single client by boulevard_id.
 * Returns masked fields by default (first name, last initial, masked contact info).
 */
export async function resolveClient(boulevardId, { masked = true } = {}) {
  if (!boulevardId) return null
  try {
    const data = await adminQuery(
      `query ($id: ID!) { node(id: $id) { ... on Client { ${CLIENT_FIELDS} } } }`,
      { id: boulevardId }
    )
    const client = data?.node
    if (!client) return null
    return masked ? maskClient(client) : client
  } catch (err) {
    safeError('[phiProxy] resolveClient error:', err.message)
    return null
  }
}

/**
 * Batch-resolve up to 10 clients via GraphQL aliases.
 * Returns { [boulevardId]: clientData } map.
 */
export async function resolveClientBatch(boulevardIds, { masked = true } = {}) {
  if (!boulevardIds?.length) return {}
  const ids = boulevardIds.slice(0, 10)
  const fragments = ids.map(
    (id, i) => `c${i}: node(id: "${id}") { ... on Client { id ${CLIENT_FIELDS} } }`
  )
  try {
    const data = await adminQuery(`query { ${fragments.join('\n')} }`)
    const result = {}
    ids.forEach((id, i) => {
      if (data?.[`c${i}`]) {
        result[id] = masked ? maskClient(data[`c${i}`]) : data[`c${i}`]
      }
    })
    return result
  } catch (err) {
    safeError('[phiProxy] resolveClientBatch error:', err.message)
    return {}
  }
}

/**
 * Resolve only the phone number for SMS send pipeline.
 * Returns the raw mobilePhone string or null.
 */
export async function resolvePhoneForSend(boulevardId) {
  if (!boulevardId) return null
  try {
    const data = await adminQuery(
      `query ($id: ID!) { node(id: $id) { ... on Client { mobilePhone } } }`,
      { id: boulevardId }
    )
    return data?.node?.mobilePhone || null
  } catch (err) {
    safeError('[phiProxy] resolvePhoneForSend error:', err.message)
    return null
  }
}

/**
 * Full (unmasked) client resolve — caller must audit-log this access.
 */
export async function resolveClientFull(boulevardId) {
  return resolveClient(boulevardId, { masked: false })
}

/**
 * Mask client PII for default display.
 * Shows first name, last initial, masked email/phone.
 */
function maskClient(client) {
  return {
    firstName: client.firstName || null,
    lastInitial: client.lastName?.[0] ? `${client.lastName[0]}.` : null,
    emailMasked: client.email
      ? client.email.replace(/(.{2}).*(@.*)/, '$1***$2')
      : null,
    phoneMasked: client.mobilePhone
      ? `***-***-${client.mobilePhone.slice(-4)}`
      : null,
  }
}
