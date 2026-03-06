// src/lib/antispam.js
// Invisible anti-spam for public forms: honeypot + timing + JS token.
// Client: useAntispam() hook adds hidden fields to form payloads.
// Server: validateAntispam() rejects bots before processing.

// ─── Client-side hook ────────────────────────────────────
import { useRef, useCallback } from 'react'

const TOKEN_SECRET = 'rlx'

function generateToken(ts) {
  // Simple proof-of-JS: base36-encode a transform of the timestamp
  // Bots without JS can't produce this; replay is limited by timing check
  const n = (ts * 7 + 1337) ^ 0xA5A5
  return n.toString(36)
}

/**
 * React hook for invisible anti-spam.
 * Call getFields() when submitting to get { _hp, _ts, _tk } to merge into payload.
 */
export function useAntispam() {
  const mountedAt = useRef(Date.now())

  const getFields = useCallback(() => {
    const ts = mountedAt.current
    return {
      _hp: '',              // honeypot — must stay empty
      _ts: String(ts),      // form render timestamp
      _tk: generateToken(ts) // JS proof token
    }
  }, [])

  return { getFields }
}

// ─── Server-side validation ──────────────────────────────
const MIN_SUBMIT_MS = 2000     // 2 seconds minimum
const MAX_SUBMIT_MS = 3600000  // 1 hour maximum

/**
 * Validate anti-spam fields from form submission.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
export function validateAntispam(body) {
  // 1. Honeypot: if filled, it's a bot
  if (body._hp) {
    return { ok: false, reason: 'honeypot' }
  }

  // 2. Timing: bots submit instantly
  const ts = parseInt(body._ts, 10)
  if (!ts || isNaN(ts)) {
    return { ok: false, reason: 'missing_timestamp' }
  }
  const elapsed = Date.now() - ts
  if (elapsed < MIN_SUBMIT_MS) {
    return { ok: false, reason: 'too_fast' }
  }
  if (elapsed > MAX_SUBMIT_MS) {
    return { ok: false, reason: 'too_old' }
  }

  // 3. JS token: must match expected value
  const expected = generateToken(ts)
  if (body._tk !== expected) {
    return { ok: false, reason: 'bad_token' }
  }

  return { ok: true }
}
