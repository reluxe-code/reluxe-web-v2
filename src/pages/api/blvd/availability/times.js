// src/pages/api/blvd/availability/times.js
// Returns available time slots for a specific date+service+provider+location.
// Supports multi-service via optional additionalItems param.
import { createCartWithItem, createCartWithItems } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

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
  const cached = getCached(cacheKey, 60_000)
  if (cached && !cached.stale) {
    return res.json(cached.data)
  }

  try {
    let cart
    if (parsedAdditional.length > 0) {
      const items = [{ serviceItemId }, ...parsedAdditional]
      const result = await createCartWithItems(locationKey, items, staffProviderId)
      cart = result.cart
    } else {
      const result = await createCartWithItem(locationKey, serviceItemId, staffProviderId)
      cart = result.cart
    }

    const times = await cart.getBookableTimes({ date })

    const result = (times || []).map(t => ({
      id: t.id || `${date}T${t.startTime}`,
      startTime: t.startTime,
    }))

    setCache(cacheKey, result)
    res.json(result)
  } catch (err) {
    console.error('[blvd/availability/times]', err.message)
    if (cached) return res.json(cached.data)
    res.status(200).json([])
  }
}
