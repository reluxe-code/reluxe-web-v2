// src/pages/api/blvd/services/menu.js
// Returns the full Boulevard service menu for a provider at a location.
// Used by the "Looking for something else?" expanded menu in the booking picker.
import { blvd, LOCATION_IDS, getLocationById } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'
import { recordSuccess, recordFailure, getCircuitState } from '@/server/circuitBreaker'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'

export const config = { maxDuration: 30 }

function normalizeId(value) {
  const str = String(value || '')
  if (!str) return ''
  const parts = str.split(':')
  return (parts[parts.length - 1] || str).toLowerCase()
}

function matchId(sdkId, targetId) {
  const a = normalizeId(sdkId)
  const b = normalizeId(targetId)
  if (!a || !b) return false
  return a === b
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })
  if (applyRateLimit(req, res, rateLimiters.loose, getClientIp(req))) return

  const { locationKey, staffProviderId } = req.query

  if (!locationKey) {
    return res.status(400).json({ error: 'locationKey is required' })
  }

  const cacheKey = `menu:v2:${locationKey}:${staffProviderId || 'all'}`
  const cached = getCached(cacheKey, 3_600_000) // 1 hr TTL — menu is static
  if (cached && !cached.stale) {
    return res.json(cached.data)
  }

  const circuit = getCircuitState()
  if (circuit.state === 'OPEN') {
    if (cached) return res.json(cached.data)
    return res.status(503).json({ error: 'SERVICE_DEGRADED', degraded: true })
  }

  try {
    const locationId = LOCATION_IDS[locationKey]
    if (!locationId) throw new Error(`Unknown location: ${locationKey}`)

    const location = await getLocationById(locationId)
    const cart = await blvd.carts.create(location)
    const categories = await cart.getAvailableCategories()

    const result = { categories: [] }

    // Process all categories, filtering items by provider
    for (const category of categories) {
      const items = category.availableItems || []
      if (!items.length) continue

      // When staffProviderId provided, filter items by provider availability
      // When not provided, return all items at the location
      let filteredItems
      if (staffProviderId) {
        const itemResults = await Promise.allSettled(
          items.map(async (item) => {
            try {
              const staffVariants = await item.getStaffVariants()
              const hasProvider = staffVariants.some((v) => matchId(v.staff?.id, staffProviderId))
              if (!hasProvider) return null
              return {
                id: item.id,
                name: item.name,
                description: item.description || null,
                duration: {
                  min: item.listDurationRange?.min ?? null,
                  max: item.listDurationRange?.max ?? null,
                },
                price: {
                  min: item.listPriceRange?.min ?? null,
                  max: item.listPriceRange?.max ?? null,
                },
              }
            } catch {
              return null
            }
          })
        )
        filteredItems = itemResults
          .filter((r) => r.status === 'fulfilled' && r.value)
          .map((r) => r.value)
      } else {
        filteredItems = items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || null,
          duration: {
            min: item.listDurationRange?.min ?? null,
            max: item.listDurationRange?.max ?? null,
          },
          price: {
            min: item.listPriceRange?.min ?? null,
            max: item.listPriceRange?.max ?? null,
          },
        }))
      }

      if (filteredItems.length > 0) {
        result.categories.push({
          id: category.id,
          name: category.name,
          items: filteredItems,
        })
      }
    }

    recordSuccess()
    setCache(cacheKey, result)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
    res.json(result)
  } catch (err) {
    recordFailure()
    console.error('[blvd/services/menu]', err.message)
    if (cached) return res.json(cached.data)
    res.status(503).json({ error: 'SERVICE_DEGRADED', degraded: true, categories: [] })
  }
}
