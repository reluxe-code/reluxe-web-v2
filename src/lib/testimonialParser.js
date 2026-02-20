// src/lib/testimonialParser.js
// CSV parsing utilities for testimonial imports.
// Used by both the admin CSV import UI and the one-time migration script.

/**
 * Service name patterns → service slugs.
 * Order matters — first match wins.
 */
const SERVICE_PATTERNS = [
  // Injectables
  [/facial balancing/i, 'facial-balancing'],
  [/sculptra/i, 'sculptra'],
  [/dermal filler|versa.*lips|juvéderm|juvederm|restylane|RHA\s*\d/i, 'filler'],
  [/botox|dysport|jeuveau|xeomin|lip\s*flip|neuromodulator|post\s*inject/i, 'tox'],
  // Lasers
  [/morpheus\s*8/i, 'morpheus8'],
  [/IPL\s*session/i, 'ipl'],
  [/clearlift/i, 'clearlift'],
  [/clearskin/i, 'clearskin'],
  [/vascupen/i, 'vascupen'],
  [/laser\s*hair\s*removal/i, 'laser-hair-removal'],
  [/CO₂|CO2/i, 'co2'],
  [/opus/i, 'opus'],
  // Facials
  [/glo2facial/i, 'glo2facial'],
  [/hydrafacial/i, 'hydrafacial'],
  [/microneedling|skinpen/i, 'skinpen'],
  [/biorepeel|peel/i, 'peels'],
  [/signature\s*facial|cucumber\s*quench|red\s*carpet\s*facial|dermaplane|facial\s*treatment/i, 'facials'],
  // Body / Massage / Wellness
  [/evolvex|body\s*contouring/i, 'evolvex'],
  [/massage|deep\s*tissue|gua\s*sha/i, 'massage'],
  [/sauna|salt|halo\s*ir/i, 'salt-sauna'],
  // Skin IQ
  [/reveal|skin\s*analysis|skin\s*iq/i, 'skin-iq'],
]

/** Skip patterns — add-ons & standalone consultations that aren't real services */
const SKIP_PATTERNS = [
  /^b12\s*shot$/i,
  /^consultation$/i,
  /^filler\s*consultation$/i,
  /^employee\s*/i,
  /^free\s*first\s*/i,
  /^free\s*demo/i,
  /^post\s*treatment\s*follow/i,
]

/**
 * Extract the primary service slug from a verbose booking system service string.
 * The Service(s) field can contain multiple services separated by "/" or ",".
 * Returns the slug for the first recognized service, or null if none match.
 */
export function normalizeServiceSlug(rawServices) {
  if (!rawServices) return null
  // Split multi-service entries (handle both "/" and "," separators)
  const parts = rawServices.split(/[/,]/)
  for (const part of parts) {
    const cleaned = part.trim()
    if (!cleaned) continue
    // Skip add-ons
    if (SKIP_PATTERNS.some(p => p.test(cleaned))) continue
    // Match against known patterns
    for (const [pattern, slug] of SERVICE_PATTERNS) {
      if (pattern.test(cleaned)) return slug
    }
  }
  return null
}

/**
 * Extract the provider first name from a service entry string.
 * Format: "Service Name - ProviderName (Role)" or "Service Name - ProviderName"
 * For multi-service rows, returns the most common provider.
 */
export function extractProvider(rawServices) {
  if (!rawServices) return null
  const parts = rawServices.split('/')
  const names = []

  for (const part of parts) {
    const trimmed = part.trim()
    // Match " - Name (Role)" or " - Name" at end of string
    const m = trimmed.match(/\s-\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*(?:\([^)]+\))?\s*$/)
    if (m) {
      // Extract first name only
      const firstName = m[1].split(/\s/)[0]
      // Skip machine/booth names
      if (!/booth|sauna|therapy/i.test(firstName)) {
        names.push(firstName)
      }
    }
  }

  if (names.length === 0) return null

  // Return the most common name
  const counts = {}
  for (const n of names) {
    counts[n] = (counts[n] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

/**
 * Parse a single CSV row object into a testimonial DB record.
 * @param {object} row - Parsed CSV row (from papaparse)
 * @param {string} location - 'westfield' or 'carmel'
 * @returns {object|null} - DB-ready record or null to skip
 */
/**
 * Extract provider first name from a Provider(s) column value.
 * Format: "Krista (NP Injector),Krista (NP Injector)" or "Anna" or "Jane"
 * Returns the most common first name, or null.
 */
function extractProviderFromColumn(rawProviders) {
  if (!rawProviders) return null
  const parts = rawProviders.split(',')
  const names = []
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    // Extract first name (before space or parenthesis)
    const firstName = trimmed.split(/[\s(]/)[0]
    if (firstName && /^[A-Z]/.test(firstName) && !/booth|sauna|therapy/i.test(firstName)) {
      names.push(firstName)
    }
  }
  if (names.length === 0) return null
  // Return the most common name
  const counts = {}
  for (const n of names) { counts[n] = (counts[n] || 0) + 1 }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

/**
 * Parse a single CSV row object into a testimonial DB record.
 * Supports both old format (provider in Service(s)) and new format (separate Provider(s) column).
 * @param {object} row - Parsed CSV row (from papaparse)
 * @param {string} location - 'westfield' or 'carmel'
 * @returns {object|null} - DB-ready record or null to skip
 */
export function parseCSVRow(row, location) {
  const client = (row['Client'] || '').trim()
  const rawServices = (row['Service(s)'] || '').trim()
  const rawProviders = (row['Provider(s)'] || '').trim()
  const rating = parseInt(row['Rating'], 10)
  const comment = (row['Comment'] || '').trim()
  const reviewDate = row['Rating Created On'] || null
  const reply = (row['Rating Reply'] || '').trim() || null
  const replyBy = (row['Rating Reply by Staff'] || '').trim() || null

  // Skip test entries
  if (/^testing\s+tester$/i.test(client)) return null
  // Skip invalid ratings
  if (!rating || rating < 1 || rating > 5) return null

  const service = normalizeServiceSlug(rawServices)
  // Use separate Provider(s) column if available, else fall back to parsing Service(s)
  const provider = extractProviderFromColumn(rawProviders) || extractProvider(rawServices)

  const hasComment = comment.length > 0
  const recommendable = hasComment && rating >= 4

  return {
    author_name: client,
    quote: comment || `${rating}-star rating`,
    rating,
    location: location || 'westfield',
    provider,
    service,
    recommendable,
    featured: false,
    review_date: reviewDate,
    reply,
    reply_by: replyBy,
    raw_services: rawServices,
    status: 'published',
  }
}
