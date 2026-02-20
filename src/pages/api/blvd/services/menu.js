// src/pages/api/blvd/services/menu.js
// Returns the full Boulevard service menu for a provider at a location.
// Used by the "Looking for something else?" expanded menu in the booking picker.
import { blvd, LOCATION_IDS, getLocationById } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'

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

  const { locationKey, staffProviderId } = req.query

  if (!locationKey || !staffProviderId) {
    return res.status(400).json({ error: 'locationKey and staffProviderId are required' })
  }

  const cacheKey = `menu:v2:${locationKey}:${staffProviderId}`
  const cached = getCached(cacheKey, 600_000) // 10 min TTL
  if (cached && !cached.stale) {
    return res.json(cached.data)
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

      // Check staff variants for all items in parallel
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

      const filteredItems = itemResults
        .filter((r) => r.status === 'fulfilled' && r.value)
        .map((r) => r.value)

      if (filteredItems.length > 0) {
        result.categories.push({
          id: category.id,
          name: category.name,
          items: filteredItems,
        })
      }
    }

    setCache(cacheKey, result)
    res.json(result)
  } catch (err) {
    console.error('[blvd/services/menu]', err.message)
    if (cached) return res.json(cached.data)
    res.status(200).json({ categories: [] })
  }
}
