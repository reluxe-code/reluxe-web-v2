// src/pages/api/blvd/providers/at-location.js
// Returns all bookable providers at a given location.
// Lighter than for-service.js — no Boulevard availability calls.
import { getServiceClient } from '@/lib/supabase'
import { getCached, setCache } from '@/server/cache'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { locationKey } = req.query
  if (!locationKey) return res.status(400).json({ error: 'locationKey is required' })

  const cacheKey = `providers-at:${locationKey}`
  const cached = getCached(cacheKey, 300_000) // 5 min
  if (cached && !cached.stale) return res.json(cached.data)

  try {
    const sb = getServiceClient()
    const { data: staff } = await sb
      .from('staff')
      .select('id, slug, name, title, featured_image, transparent_bg, role, boulevard_provider_id, boulevard_service_map, locations, specialties')
      .eq('status', 'published')
      .not('boulevard_provider_id', 'is', null)
      .order('sort_order')

    if (!staff?.length) {
      setCache(cacheKey, [])
      return res.json([])
    }

    const filtered = staff.filter(s => {
      // Must be at this location
      const locs = Array.isArray(s.locations) ? s.locations : []
      const atLocation = locs.some(l => {
        const locSlug = (l.slug || l.title || l || '').toString().toLowerCase()
        return locSlug.includes(locationKey)
      })
      if (!atLocation) return false
      // Must have at least one service mapped at this location in boulevard_service_map
      const serviceMap = s.boulevard_service_map || {}
      return Object.values(serviceMap).some(locMap =>
        locMap && typeof locMap === 'object' && locMap[locationKey]
      )
    })

    const result = filtered.map(s => ({
      staffId: s.id,
      slug: s.slug,
      name: s.name,
      title: s.title,
      image: s.transparent_bg || s.featured_image,
      role: s.role,
      boulevardProviderId: s.boulevard_provider_id,
      boulevardServiceMap: s.boulevard_service_map,
      specialties: s.specialties,
    }))

    setCache(cacheKey, result)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    res.json(result)
  } catch (err) {
    console.error('[blvd/providers/at-location]', err.message)
    if (cached) return res.json(cached.data)
    res.status(200).json([])
  }
}
