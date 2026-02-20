// src/pages/api/blvd/services/options.js
// Returns option groups, duration, and add-on info for a specific service+provider.
import { blvd, LOCATION_IDS, getLocationById } from '@/server/blvd'

function normalizeId(value) {
  const str = String(value || '')
  if (!str) return ''
  const parts = str.split(':')
  return (parts[parts.length - 1] || str).toLowerCase()
}

function matchId(a, b) {
  const x = normalizeId(a)
  const y = normalizeId(b)
  if (!x || !y) return false
  return x === y
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { locationKey, serviceItemId, staffProviderId } = req.query

  if (!locationKey || !serviceItemId) {
    return res.status(400).json({ error: 'locationKey and serviceItemId are required' })
  }

  try {
    const locationId = LOCATION_IDS[locationKey]
    if (!locationId) throw new Error(`Unknown location: ${locationKey}`)

    const location = await getLocationById(locationId)
    const cart = await blvd.carts.create(location)

    const categories = await cart.getAvailableCategories()
    const allItems = categories.flatMap((c) => c.availableItems || [])

    const item = allItems.find(
      (i) => i.id === serviceItemId || i.id?.includes(serviceItemId) || serviceItemId?.includes(i.id)
    )
    if (!item) {
      return res.status(404).json({ error: `Service not found: ${serviceItemId}` })
    }

    // Get option groups (e.g. "Choose Your Tox", "Special Offers")
    const optionGroups = await item.getOptionGroups()

    // Get staff variant duration if a specific provider is requested
    let staffDuration = null
    if (staffProviderId) {
      const staffVariants = await item.getStaffVariants()
      const variant = staffVariants.find(
        (v) => matchId(v.staff?.id, staffProviderId)
      )
      if (variant) {
        staffDuration = variant.duration // minutes
      }
    }

    // Build response
    const result = {
      serviceName: item.name,
      description: item.description || null,
      duration: {
        min: item.listDurationRange?.min ?? staffDuration ?? null,
        max: item.listDurationRange?.max ?? staffDuration ?? null,
        staffDuration,
      },
      price: {
        min: item.listPriceRange?.min ?? null,
        max: item.listPriceRange?.max ?? null,
      },
      optionGroups: optionGroups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description || null,
        minLimit: g.minLimit ?? 0,
        maxLimit: g.maxLimit ?? null,
        options: (g.options || []).map((o) => ({
          id: o.id,
          name: o.name,
          description: o.description || null,
          durationDelta: o.durationDelta || 0,
          priceDelta: o.priceDelta || '$0',
        })),
      })),
    }

    res.json(result)
  } catch (err) {
    console.error('[blvd/services/options]', err.message)
    res.status(500).json({ error: 'Failed to load service options.' })
  }
}
