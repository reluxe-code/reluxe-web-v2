// src/pages/api/blvd/availability/dates.js
// Returns available booking dates for a service+provider+location combo.
// Supports multi-service via optional additionalItems param.
import { createCartWithItem, createCartWithItems } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { locationKey, serviceItemId, staffProviderId, startDate, endDate, additionalItems } = req.query

  if (!locationKey || !serviceItemId) {
    return res.status(400).json({ error: 'locationKey and serviceItemId are required' })
  }

  let parsedAdditional = []
  if (additionalItems) {
    try { parsedAdditional = JSON.parse(additionalItems) } catch {}
  }

  const additionalKey = parsedAdditional.map(i => i.serviceItemId).sort().join(',')
  const cacheKey = `dates:${locationKey}:${serviceItemId}:${staffProviderId || 'any'}:${startDate}:${endDate}:${additionalKey}`
  const cached = getCached(cacheKey, 120_000)
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

    const dates = await cart.getBookableDates({
      searchRangeLower: startDate || undefined,
      searchRangeUpper: endDate || undefined,
    })

    const result = (dates || []).map(d => typeof d === 'string' ? d : d.date || d)
    setCache(cacheKey, result)
    res.json(result)
  } catch (err) {
    console.error('[blvd/availability/dates]', err.message)
    if (cached) return res.json(cached.data)
    res.status(200).json([])
  }
}
