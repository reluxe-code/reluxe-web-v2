// src/lib/concierge/smsBuilder.js
// Builds SMS message body from campaign templates + candidate data.
// Auto-appends RELUXE branding, reply/call CTA, and STOP opt-out footer.
// Sanitizes output for GSM-7 encoding to keep messages at 1-2 SMS segments (≤320 chars).

const LOCATION_NAMES = {
  westfield: 'Westfield',
  carmel: 'Carmel',
}

// Auto-appended to every outbound SMS
const SMS_FOOTER = '\n\n-RELUXE Med Spa\nReply or call (317) 763-1142 to book\nReply STOP to opt out'

/**
 * Replace non-GSM-7 characters with safe equivalents.
 * Prevents accidental UCS-2 encoding (which halves segment capacity from 160 to 70 chars).
 */
function sanitizeGsm7(text) {
  return text
    .replace(/[\u2018\u2019\u201A]/g, "'")   // smart single quotes → straight
    .replace(/[\u201C\u201D\u201E]/g, '"')    // smart double quotes → straight
    .replace(/\u2026/g, '...')                 // ellipsis → three dots
    .replace(/\u2014/g, '-')                   // em dash → hyphen
    .replace(/\u2013/g, '-')                   // en dash → hyphen
    .replace(/\u00A0/g, ' ')                   // non-breaking space → space
    .replace(/\u200B/g, '')                    // zero-width space → remove
    .replace(/\u00AB|\u00BB/g, '"')            // guillemets → quotes
}

/**
 * Replace {{placeholders}} in a template with candidate data.
 * Appends RELUXE branding footer with reply/call CTA and STOP opt-out.
 * @param {string} template - SMS template with {{placeholders}}
 * @param {object} candidate - Cohort candidate data
 * @param {string} bookingUrl - The concierge link URL
 * @param {object} [opts] - Options
 * @param {number} [opts.creditReminderThreshold] - Minimum credit (in cents) to trigger {{credit_reminder}}
 * @returns {string} Rendered SMS body
 */
export function buildSmsBody(template, candidate, bookingUrl, opts = {}) {
  // Build credit reminder text (conditional — only renders when above threshold)
  const creditCents = Number(candidate.account_credit || 0)
  const threshold = Number(opts.creditReminderThreshold || 0)
  const creditReminder = threshold > 0 && creditCents >= threshold
    ? `Remember, you have $${Math.round(creditCents / 100)} in account credit available! `
    : ''

  const replacements = {
    first_name: candidate.first_name || 'there',
    provider_name: candidate.provider_name || 'your provider',
    service_name: candidate.service_name || 'your treatment',
    days_overdue: String(candidate.days_overdue || ''),
    voucher_service: candidate.voucher_service || candidate.service_name || 'your service',
    sessions_remaining: String(candidate.sessions_remaining || ''),
    voucher_expiry: candidate.voucher_expiry_text || '',
    location_name: LOCATION_NAMES[candidate.location_key] || candidate.location_key || '',
    booking_link: bookingUrl || '',
    credit_reminder: creditReminder,
  }

  let body = template
  for (const [key, value] of Object.entries(replacements)) {
    body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }

  // Clean up leftover whitespace from empty {{credit_reminder}} (trailing newlines/spaces)
  body = body.replace(/\n{3,}/g, '\n\n').trim()

  // Append standard footer
  body += SMS_FOOTER

  // Sanitize for GSM-7 (replace smart quotes, em dashes, etc.)
  body = sanitizeGsm7(body)

  return body
}

/**
 * Pick A or B variant based on campaign config split ratio.
 * @param {{ variant_a_template: string, variant_b_template?: string, ab_split?: number }} campaign
 * @returns {{ variant: 'A' | 'B', template: string }}
 */
export function pickVariant(campaign) {
  if (!campaign.variant_b_template) {
    return { variant: 'A', template: campaign.variant_a_template }
  }

  const roll = Math.random()
  const split = Number(campaign.ab_split) || 0.5

  if (roll < split) {
    return { variant: 'A', template: campaign.variant_a_template }
  }
  return { variant: 'B', template: campaign.variant_b_template }
}

/**
 * Estimate SMS segment count for a rendered message.
 * GSM-7: 160 chars/segment (or 153 in multi-part). UCS-2: 70/67.
 * @param {string} text - Rendered SMS body
 * @returns {{ segments: number, encoding: 'GSM-7' | 'UCS-2', length: number }}
 */
export function estimateSegments(text) {
  // Check for non-GSM-7 characters (simplified check)
  const gsm7 = /^[@\u00a3$\u00a5\u00e8\u00e9\u00f9\u00ec\u00f2\u00c7\n\u00d8\u00f8\r\u00c5\u00e5\u0394_\u03a6\u0393\u039b\u03a9\u03a0\u03a8\u03a3\u0398\u039e\u00c6\u00e6\u00df\u00c9 !"#\u00a4%&'()*+,\-.\/0-9:;<=>?\u00a1A-Z\u00c4\u00d6\u00d1\u00dc\u00a7\u00bfa-z\u00e4\u00f6\u00f1\u00fc\u00e0^{}\[\]~|\u20ac]*$/
  const isGsm7 = gsm7.test(text)
  const len = text.length

  if (isGsm7) {
    const segments = len <= 160 ? 1 : Math.ceil(len / 153)
    return { segments, encoding: 'GSM-7', length: len }
  }
  const segments = len <= 70 ? 1 : Math.ceil(len / 67)
  return { segments, encoding: 'UCS-2', length: len }
}
