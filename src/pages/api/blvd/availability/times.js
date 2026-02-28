// src/pages/api/blvd/availability/times.js
// Returns available time slots for a specific date+service+provider+location.
// Supports multi-service via optional additionalItems param.
import { createCartWithItem, createCartWithItems } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'
import { recordSuccess, recordFailure, getCircuitState } from '@/server/circuitBreaker'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (applyRateLimit(req, res, rateLimiters.loose, getClientIp(req))) return

  const { locationKey, serviceItemId, staffProviderId, date, additionalItems } = req.query

  if (!locationKey || !serviceItemId || !date) {
    return res.status(400).json({ error: 'locationKey, serviceItemId, and date are required' })
  }

  let parsedAdditional = []
  if (additionalItems) {
    try { parsedAdditional = JSON.parse(additionalItems) } catch {}
  }

  const additionalKey = parsedAdditional.map(i => i.serviceItemId).sort().join(',')
  const cacheKey = `times:${locationKey}:${serviceItemId}:${staffProviderId || 'any'}:${date}:${additionalKey}`
  const cached = getCached(cacheKey, 120_000) // 2 min
  if (cached && !cached.stale) {
    return res.json(cached.data)
  }

  const circuit = getCircuitState()
  if (circuit.state === 'OPEN') {
    if (cached) return res.json(cached.data)
    return res.status(503).json({ error: 'SERVICE_DEGRADED', degraded: true })
  }

  try {
    let cart
    if (parsedAdditional.length > 0) {
      const items = [{ serviceItemId }, ...parsedAdditional]
      const result = await createCartWithItems(locationKey, items, staffProviderId)
      cart = result.cart
    } else {
      const result = await createCartWithItem(locationKey, serviceItemId, staffProviderId)
      if (result.staffMismatch) return res.json([])
      cart = result.cart
    }

    const times = await cart.getBookableTimes({ date })

    const result = (times || []).map(t => ({
      id: t.id || `${date}T${t.startTime}`,
      startTime: t.startTime,
    }))

    recordSuccess()
    setCache(cacheKey, result)
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    res.json(result)
  } catch (err) {
    recordFailure()
    console.error('[blvd/availability/times]', err.message)
    if (cached) return res.json(cached.data)
    res.status(503).json({ error: 'SERVICE_DEGRADED', degraded: true })
  }
}
