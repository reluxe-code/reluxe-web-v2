// src/pages/api/blvd/providers/[providerId]/profile.js
import { blvd } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'
import { recordSuccess, recordFailure, getCircuitState } from '@/server/circuitBreaker'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (applyRateLimit(req, res, rateLimiters.loose, getClientIp(req))) return

  const { providerId } = req.query
  if (!providerId) return res.status(400).json({ error: 'providerId is required' })

  const cacheKey = `provider-profile:${providerId}`
  const cached = getCached(cacheKey, 3_600_000) // 1 hr — profiles are static
  if (cached && !cached.stale) {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
    return res.json(cached.data)
  }

  const circuit = getCircuitState()
  if (circuit.state === 'OPEN') {
    if (cached) return res.json(cached.data)
    return res.status(503).json({ error: 'SERVICE_DEGRADED', degraded: true })
  }

  try {
    const tm = (await blvd.teamMembers?.getById?.(providerId)) || { id: providerId }
    const result = {
      id: tm.id,
      name: tm.name || null,
      title: tm.title || null,
      photoUrl: tm.photoUrl || null,
    }
    recordSuccess()
    setCache(cacheKey, result)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
    res.json(result)
  } catch (e) {
    recordFailure()
    console.error('[blvd/providers/profile]', e.message)
    if (cached) return res.json(cached.data)
    res.status(503).json({ id: providerId, name: null, title: null, photoUrl: null, degraded: true })
  }
}
