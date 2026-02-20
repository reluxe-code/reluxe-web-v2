// src/lib/provider-roles.js
// Shared utility for categorizing providers by role.
// Extracted from src/pages/beta/team/index.js so it can be reused
// in getBundlesForProvider and admin UI.

export const PROVIDER_CATEGORIES = ['Injectors', 'Aestheticians', 'Massage Therapists', 'Support Staff']

const lower = (v) => (v ?? '').toString().toLowerCase().trim()
const injectorSlugs = new Set(['tox', 'filler', 'sculptra'])
const aestheticianSlugs = new Set(['facials', 'hydrafacial', 'glo2facial', 'ipl', 'microneedling', 'morpheus8', 'peels', 'laser-hair-removal'])
const massageSlugs = new Set(['massage'])

function deriveSubtitle(staff) {
  const candidates = [
    staff?.staffFields?.staffTitle,
    staff?.staffFields?.stafftitle,
    staff?.staffFields?.role,
    staff?.staff_title,
    staff?.staffTitle,
    staff?.title,
    staff?.role,
  ]
  for (const v of candidates) {
    if (v && String(v).trim()) return String(v).trim()
  }
  return ''
}

/**
 * Categorize a staff member into one of PROVIDER_CATEGORIES.
 * Works with both WP-shaped objects (from toWPStaffShape) and raw Supabase rows.
 */
export function categorizeProvider(staff) {
  const title = lower(deriveSubtitle(staff))
  const has = (re) => re.test(title)

  if (has(/\binjector\b/) || has(/\bnurse\s+injector\b/) || has(/\bnurse\s+practitioner\b/) ||
      has(/\bphysician\b/) || has(/\bmd\b/) || has(/\bdo\b/) || has(/\brn\b/) || has(/\bnp\b/) ||
      has(/\bpa\b/) || has(/\bmedical\s+director\b/) || has(/\bowner\b/)) {
    return 'Injectors'
  }
  if (has(/\b(aesthetician|esthetician)\b/)) return 'Aestheticians'
  if (has(/\b(front\s*desk|reception|coordinator|support|manager|director|admin|assistant|concierge|operations)\b/)) return 'Support Staff'

  const hay = lower(JSON.stringify(staff || {}))
  if (/\binjector\b|\brn\b|\bnp\b/.test(hay)) return 'Injectors'
  if (/\b(aesthetician|esthetician)\b/.test(hay)) return 'Aestheticians'
  if (/\b(massage|lmt)\b/.test(hay)) return 'Massage Therapists'

  // Fallback: infer role from Boulevard services on profile
  const map = staff?.boulevardServiceMap || staff?.boulevard_service_map || {}
  const slugs = Object.keys(map || {})
  if (slugs.some((slug) => injectorSlugs.has(slug))) return 'Injectors'
  if (slugs.some((slug) => massageSlugs.has(slug))) return 'Massage Therapists'
  if (slugs.some((slug) => aestheticianSlugs.has(slug))) return 'Aestheticians'

  return 'Support Staff'
}

function canonicalRoleLabel(v) {
  const s = lower(v)
  if (s.includes('inject')) return 'injector'
  if (s.includes('aesthetic') || s.includes('esthetic') || s.includes('esthi')) return 'aesthetician'
  if (s.includes('massage')) return 'massage-therapist'
  if (s.includes('support') || s.includes('admin') || s.includes('front')) return 'support-staff'
  return s
}

export function roleMatches(providerRole, bundleRole) {
  return canonicalRoleLabel(providerRole) === canonicalRoleLabel(bundleRole)
}
