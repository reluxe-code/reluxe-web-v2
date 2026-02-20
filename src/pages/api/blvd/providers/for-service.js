// src/pages/api/blvd/providers/for-service.js
// Returns providers who can perform a given service at a location,
// sorted by next available date.
import { getServiceClient } from '@/lib/supabase'
import { createCartWithItem } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { serviceSlug, locationKey } = req.query

  if (!serviceSlug || !locationKey) {
    return res.status(400).json({ error: 'serviceSlug and locationKey are required' })
  }

  const cacheKey = `providers-for:${serviceSlug}:${locationKey}`
  const cached = getCached(cacheKey, 300_000) // 5 min TTL
  if (cached && !cached.stale) {
    return res.json(cached.data)
  }

  try {
    const sb = getServiceClient()

    // Get all published staff who have this service in their boulevard_service_map
    const { data: staff } = await sb
      .from('staff')
      .select('slug, name, title, featured_image, boulevard_provider_id, boulevard_service_map, locations')
      .eq('status', 'published')
      .not('boulevard_provider_id', 'is', null)

    if (!staff?.length) {
      const empty = []
      setCache(cacheKey, empty)
      return res.json(empty)
    }

    // Filter to providers who have this service at this location
    const eligible = staff.filter(s => {
      const map = s.boulevard_service_map || {}
      if (!map[serviceSlug]?.[locationKey]) return false
      // Also check they work at this location
      const locs = Array.isArray(s.locations) ? s.locations : []
      return locs.some(l => {
        const locSlug = (l.slug || l.title || '').toLowerCase()
        return locSlug.includes(locationKey)
      })
    })

    // For each provider, try to get their next available date (in parallel, max 5)
    const today = new Date().toISOString().split('T')[0]
    const twoWeeksOut = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]

    const results = await Promise.allSettled(
      eligible.map(async (s) => {
        const serviceItemId = s.boulevard_service_map[serviceSlug][locationKey]
        let nextDate = null
        try {
          const { cart } = await createCartWithItem(locationKey, serviceItemId, s.boulevard_provider_id)
          const dates = await cart.getBookableDates({
            searchRangeLower: today,
            searchRangeUpper: twoWeeksOut,
          })
          if (dates?.length) {
            nextDate = typeof dates[0] === 'string' ? dates[0] : dates[0].date || null
          }
        } catch {
          // Provider not available for this service right now
        }
        return {
          slug: s.slug,
          name: s.name,
          title: s.title,
          image: s.featured_image,
          boulevardProviderId: s.boulevard_provider_id,
          serviceItemId,
          nextAvailableDate: nextDate,
        }
      })
    )

    const providers = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .sort((a, b) => {
        // Providers with availability first, sorted by soonest
        if (!a.nextAvailableDate && !b.nextAvailableDate) return 0
        if (!a.nextAvailableDate) return 1
        if (!b.nextAvailableDate) return -1
        return a.nextAvailableDate.localeCompare(b.nextAvailableDate)
      })

    setCache(cacheKey, providers)
    res.json(providers)
  } catch (err) {
    console.error('[blvd/providers/for-service]', err.message)
    if (cached) return res.json(cached.data)
    res.status(200).json([])
  }
}
