import { getServiceClient } from '@/lib/supabase'
import { toWPStaffShape } from '@/lib/staff-helpers'

export const START_FONTS = {
  body: 'Poppins, system-ui, sans-serif',
  display: 'Bodoni Moda, Georgia, serif',
}

export function normalizeToken(v) {
  return String(v || '').trim().toLowerCase()
}

export function parseFlexibleDate(input) {
  const raw = String(input || '').trim()
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (!match) return null
  const m = Number(match[1])
  const d = Number(match[2])
  let y = Number(match[3])
  if (y < 100) y += 2000
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) return null
  return `${String(y)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function resolveLocation(raw) {
  const t = normalizeToken(raw)
  if (!t) return null
  if (t === 'westfield' || t === 'w') return 'westfield'
  if (t === 'carmel' || t === 'c') return 'carmel'
  if (t === 'any' || t === 'all' || t === 'no-preference' || t === 'nopreference' || t === 'no preference') return 'any'
  return null
}

function providerRoleText(person) {
  return String(
    person?.staffFields?.staffTitle ||
      person?.staffFields?.stafftitle ||
      person?.staffFields?.role ||
      person?.staff_title ||
      person?.staffTitle ||
      person?.role ||
      ''
  ).toLowerCase()
}

export function isBookableProvider(person) {
  if (!person?.boulevardProviderId) return false
  const roleText = providerRoleText(person)
  const hasProviderRole = /(injector|nurse|np|rn|aesthetician|esthetician|massage|lmt)/i.test(roleText)
  const hasSupportOnlyRole = /(front\s*desk|reception|admin|administrator|office|director|manager|coordinator|assistant|concierge|operations|support)/i.test(roleText)
  if (hasProviderRole) return true
  if (hasSupportOnlyRole) return false
  return true
}

export function providerLocationKeys(provider) {
  const locs = Array.isArray(provider?.staffFields?.location) ? provider.staffFields.location : []
  const keys = new Set()
  for (const l of locs) {
    const s = normalizeToken(l?.slug || l?.title || l)
    if (s.includes('westfield')) keys.add('westfield')
    if (s.includes('carmel')) keys.add('carmel')
  }
  return [...keys]
}

export function matchesLocation(provider, locationKey) {
  if (!locationKey || locationKey === 'any') return true
  return providerLocationKeys(provider).includes(locationKey)
}

export function buildLocationOptions(scope) {
  if (scope === 'westfield') return [{ key: 'westfield', label: 'Westfield' }]
  if (scope === 'carmel') return [{ key: 'carmel', label: 'Carmel' }]
  return [
    { key: 'any', label: 'No preference' },
    { key: 'westfield', label: 'Westfield' },
    { key: 'carmel', label: 'Carmel' },
  ]
}

export function parseStartPrefill(query = {}) {
  return {
    locationKey: resolveLocation(query.location || query.l),
    provider: String(query.provider || query.p || '').trim() || null,
    serviceCategory: String(query.category || query.c || '').trim() || null,
    service: String(query.service || query.s || '').trim() || null,
    date: parseFlexibleDate(query.date || query.d),
    dateEnd: parseFlexibleDate(query.date_end || query.d2),
  }
}

export function toQueryString(obj = {}) {
  const params = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => {
    if (v == null || v === '') return
    params.set(k, String(v))
  })
  const q = params.toString()
  return q ? `?${q}` : ''
}

export async function getStartBookingBaseProps(query = {}) {
  const sb = getServiceClient()
  const [{ data: staffRows }, { data: configRow }, { data: routingRow }] = await Promise.all([
    sb.from('staff').select('*').eq('status', 'published').order('sort_order').order('name'),
    sb.from('site_config').select('value').eq('key', 'treatment_bundles').limit(1).single(),
    sb.from('site_config').select('value').eq('key', 'provider_routing').limit(1).single(),
  ])

  const prefill = parseStartPrefill(query)
  const allProviders = (staffRows || []).map(toWPStaffShape).filter(isBookableProvider)
  const providers = allProviders

  return {
    providers,
    globalBundles: configRow?.value || null,
    routingConfig: routingRow?.value || null,
    prefill,
  }
}

