// src/lib/provider-routing.js
// Pure utility for weighted provider routing. No React or API dependencies.

/**
 * Given eligible providers and routing rules, return providers with effective weights.
 * Providers without a matching rule get weight 50 (equal baseline).
 * Most-specific rule wins: service+location > service-only > location-only > global.
 *
 * @param {Array} providers - objects with .slug
 * @param {Object|null} routingConfig - { enabled, rules: [...] } from site_config
 * @param {{ serviceSlug?: string, locationKey?: string }} context
 * @returns {Array<{ provider: Object, weight: number }>}
 */
export function getWeightedProviders(providers, routingConfig, context = {}) {
  const defaultWeight = 50

  if (!routingConfig?.enabled || !routingConfig?.rules?.length) {
    return providers.map((p) => ({ provider: p, weight: defaultWeight }))
  }

  const { serviceSlug, locationKey } = context
  const activeRules = routingConfig.rules.filter((r) => r.active !== false)

  return providers.map((provider) => {
    const matching = activeRules.filter((r) => {
      if (r.providerSlug !== provider.slug) return false
      if (r.serviceSlug && r.serviceSlug !== serviceSlug) return false
      if (r.locationKey && r.locationKey !== locationKey) return false
      return true
    })

    if (matching.length === 0) return { provider, weight: defaultWeight }

    // Specificity: service+location (3) > service (2) > location (1) > global (0)
    const best = matching.sort((a, b) => {
      const spec = (r) => (r.serviceSlug ? 2 : 0) + (r.locationKey ? 1 : 0)
      return spec(b) - spec(a)
    })[0]

    return { provider, weight: best.weight ?? defaultWeight }
  })
}

/**
 * Weighted random selection from a list of { provider, weight } entries.
 * @param {Array<{ provider: Object, weight: number }>} weighted
 * @param {string|null} excludeSlug - optionally exclude a provider slug (for re-roll)
 * @returns {Object|null} selected provider
 */
export function selectProviderByWeight(weighted, excludeSlug = null) {
  const pool = excludeSlug
    ? weighted.filter((w) => w.provider.slug !== excludeSlug)
    : weighted

  if (pool.length === 0) return weighted[0]?.provider || null
  if (pool.length === 1) return pool[0].provider

  const totalWeight = pool.reduce((sum, w) => sum + w.weight, 0)
  let random = Math.random() * totalWeight

  for (const entry of pool) {
    random -= entry.weight
    if (random <= 0) return entry.provider
  }

  return pool[0].provider
}
