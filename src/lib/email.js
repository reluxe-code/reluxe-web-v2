// src/lib/email.js
// Shared SMTP email utilities used by all API routes that send email.
import nodemailer from 'nodemailer'

/**
 * Read SMTP env vars and create a nodemailer transporter.
 * Returns { transporter, from, to } or throws if required vars are missing.
 */
export function getSmtpConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT = '587',
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
    MAIL_TO,
    // backwards-compat aliases used by some quiz routes
    SMTP_FROM,
    QUIZ_NOTIFY_TO,
  } = process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null // SMTP not configured — caller can skip or error
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  return {
    transporter,
    from: MAIL_FROM || SMTP_FROM || SMTP_USER,
    to: MAIL_TO || QUIZ_NOTIFY_TO || '',
  }
}

/**
 * Parse a comma-separated "to" string into an array of addresses.
 */
export function parseToList(to) {
  return String(to || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

/**
 * Escape a string for safe HTML interpolation (prevents XSS in emails).
 */
export function escHtml(s) {
  return String(s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

/**
 * JSON.stringify with fallback to String().
 */
export function safeJson(obj) {
  try { return JSON.stringify(obj, null, 2) } catch { return String(obj) }
}
