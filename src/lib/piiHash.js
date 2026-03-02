// src/lib/piiHash.js
// HMAC-SHA256 hashing with salt + pepper for PII (phone, email).
// Salt and pepper are stored in separate env vars — never in DB or git.
import { createHmac, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const SALT = process.env.PATIENT_DATA_SALT
const PEPPER = process.env.PATIENT_DATA_PEPPER || ''

// Current hash version — increment when rotating salt/pepper
export const HASH_VERSION = 1

/**
 * Normalize phone to last 10 digits, then HMAC with salt+pepper.
 * Returns null if phone is missing or too short.
 */
export function hashPhone(phone) {
  if (!phone || !SALT) return null
  const digits = phone.replace(/\D/g, '').slice(-10)
  if (digits.length < 10) return null
  return createHmac('sha256', SALT).update(digits + PEPPER).digest('hex')
}

/**
 * Lowercase + trim email, then HMAC with salt+pepper.
 * Returns null if email is missing.
 */
export function hashEmail(email) {
  if (!email || !SALT) return null
  return createHmac('sha256', SALT).update(email.trim().toLowerCase() + PEPPER).digest('hex')
}

/**
 * Hash only the first 6 digits of a phone number (area code + prefix).
 * Used for rate-limiting brute-force hash reversal attempts.
 */
export function hashPhonePrefix(phone) {
  if (!phone || !SALT) return null
  const digits = phone.replace(/\D/g, '').slice(-10)
  if (digits.length < 6) return null
  return createHmac('sha256', SALT).update(digits.slice(0, 6) + PEPPER).digest('hex')
}

// ============================================================
// Masking utilities — for admin display (never store masked values)
// ============================================================

/** Mask phone to ***-***-1234 format. */
export function maskPhone(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return '***'
  return '***-***-' + digits.slice(-4)
}

/** Mask email to kl***@gmail.com format. */
export function maskEmail(email) {
  if (!email) return null
  return email.replace(/(.{2}).*(@.*)/, '$1***$2')
}

/** Reduce name to first initial: "Kyle" → "K." */
export function nameInitial(name) {
  if (!name) return null
  const first = name.trim().charAt(0).toUpperCase()
  return first ? first + '.' : null
}

// ============================================================
// AES-256-GCM encryption for transient PII (concierge queue phone)
// ============================================================
const QUEUE_KEY = process.env.QUEUE_ENCRYPTION_KEY // 64-char hex string (32 bytes)

/**
 * Encrypt a phone number for transient storage (concierge queue).
 * Returns base64-encoded string: iv(12) + authTag(16) + ciphertext.
 */
export function encryptPhone(phone) {
  if (!phone || !QUEUE_KEY) return null
  const key = Buffer.from(QUEUE_KEY, 'hex')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(phone, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

/**
 * Decrypt a phone number from transient storage.
 * Input: base64-encoded string from encryptPhone().
 */
export function decryptPhone(encrypted) {
  if (!encrypted || !QUEUE_KEY) return null
  try {
    const key = Buffer.from(QUEUE_KEY, 'hex')
    const buf = Buffer.from(encrypted, 'base64')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const ciphertext = buf.subarray(28)
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8')
  } catch {
    return null
  }
}
