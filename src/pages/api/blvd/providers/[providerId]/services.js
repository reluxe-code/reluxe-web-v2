// src/pages/api/blvd/providers/[providerId]/services.js
import { blvd, getLocationById } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'
import { recordSuccess, recordFailure, getCircuitState } from '@/server/circuitBreaker'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (applyRateLimit(req, res, rateLimiters.loose, getClientIp(req))) return

  const { providerId, locationId } = req.query
  if (!providerId) return res.status(400).json({ error: 'providerId is required' })

  const cacheKey = `provider-services:${providerId}:${locationId || 'default'}`
  const cached = getCached(cacheKey, 1_800_000) // 30 min — service lists are semi-static
  if (cached && !cached.stale) {
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    return res.json(cached.data)
  }

  const circuit = getCircuitState()
  if (circuit.state === 'OPEN') {
    if (cached) return res.json(cached.data)
    return res.status(503).json({ error: 'SERVICE_DEGRADED', degraded: true })
  }

  try {
    const location = await getLocationById(locationId)
    const cart = await blvd.carts.create(location)

    // Use the async method — the `.availableCategories` property can be undefined
    const categories = await cart.getAvailableCategories()
    const items = (categories || []).flatMap(c => c.availableItems || [])

    const staffItems = items.filter(it =>
      (it.availableStaff?.some(s => s.id === providerId)) ||
      it.staff?.id === providerId
    )

    const payload = staffItems.map(it => ({
      id: it.id,
      name: it.name,
      durationMinutes: it.durationMinutes ?? null,
      price: it.price ?? null,
    }))

    recordSuccess()
    setCache(cacheKey, payload)
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.json(payload)
  } catch (e) {
    recordFailure()
    console.error('[blvd/providers/services]', e.message)
    if (cached) return res.json(cached.data)
    res.status(503).json({ error: 'SERVICE_DEGRADED', degraded: true })
  }
}
