// src/lib/logSanitizer.js
// Strips PII patterns (phone, email, names) from strings before logging.
// Use safeLog() in any code path that may handle PII.

const PHONE_REGEX = /\+?1?\d{10,11}/g
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const NAME_FIELDS = /("(?:first_name|last_name|name|firstName|lastName|client_name|recipientName|recipientEmail)":\s*)"[^"]+"/g

/**
 * Redact PII patterns from a string or object.
 */
export function sanitize(input) {
  if (input == null) return ''
  const str = typeof input === 'string' ? input : JSON.stringify(input)
  return str
    .replace(PHONE_REGEX, '[REDACTED_PHONE]')
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(NAME_FIELDS, '$1"[REDACTED]"')
}

/**
 * Safe console.log wrapper — sanitizes all arguments.
 */
export function safeLog(prefix, ...args) {
  console.log(
    prefix,
    ...args.map((a) =>
      typeof a === 'string' ? sanitize(a) : sanitize(JSON.stringify(a))
    )
  )
}

/**
 * Safe console.warn wrapper — sanitizes all arguments.
 */
export function safeWarn(prefix, ...args) {
  console.warn(
    prefix,
    ...args.map((a) =>
      typeof a === 'string' ? sanitize(a) : sanitize(JSON.stringify(a))
    )
  )
}

/**
 * Safe console.error wrapper — sanitizes all arguments.
 */
export function safeError(prefix, ...args) {
  console.error(
    prefix,
    ...args.map((a) =>
      typeof a === 'string' ? sanitize(a) : sanitize(JSON.stringify(a))
    )
  )
}
