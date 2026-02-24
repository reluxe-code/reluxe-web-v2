// src/pages/api/reveal/alternatives.js
// Returns up to 3 alternative time slots when a tile is taken (409).
import { createCartWithItem } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTimeLabel(startTime) {
  return new Date(startTime).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const {
    locationKey, serviceSlug, serviceLabel, serviceItemId,
    boulevardProviderId, providerSlug, providerName, providerImage,
    date, excludeStartTime,
  } = req.body

  if (!locationKey || !serviceItemId || !boulevardProviderId || !date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Fetch times for same provider+service on same date
    const timeCacheKey = `reveal-alt:${locationKey}:${serviceItemId}:${boulevardProviderId}:${date}`
    let times = null
    const cached = getCached(timeCacheKey, 30_000) // 30s TTL for alternatives (fresher)
    if (cached && !cached.stale) {
      times = cached.data
    } else {
      const { cart } = await createCartWithItem(locationKey, serviceItemId, boulevardProviderId)
      const rawTimes = await cart.getBookableTimes({ date })
      times = (rawTimes || []).map(t => t.startTime)
      setCache(timeCacheKey, times)
    }

    // Exclude the taken slot
    let available = times.filter(t => t !== excludeStartTime)

    // If < 3, also try next day
    if (available.length < 3) {
      const nextDate = new Date(new Date(date + 'T12:00:00').getTime() + 86400000)
        .toISOString().split('T')[0]
      try {
        const { cart } = await createCartWithItem(locationKey, serviceItemId, boulevardProviderId)
        const rawTimes = await cart.getBookableTimes({ date: nextDate })
        const nextTimes = (rawTimes || []).map(t => ({ startTime: t.startTime, date: nextDate }))
        available = [
          ...available.map(t => ({ startTime: t, date })),
          ...nextTimes,
        ].slice(0, 3)
      } catch {
        available = available.map(t => ({ startTime: t, date }))
      }
    } else {
      available = available.slice(0, 3).map(t => ({ startTime: t, date }))
    }

    const alternatives = available.map((a, idx) => ({
      id: `alt-${providerSlug}-${serviceSlug}-${a.date}-${a.startTime}`,
      locationKey,
      serviceSlug,
      serviceLabel: serviceLabel || serviceSlug,
      providerSlug,
      providerName,
      providerImage,
      boulevardProviderId,
      serviceItemId,
      date: a.date,
      startTime: a.startTime,
      dayLabel: formatDayLabel(a.date),
      timeLabel: formatTimeLabel(a.startTime),
    }))

    res.json({ alternatives })
  } catch (err) {
    console.error('[reveal/alternatives]', err.message)
    res.status(500).json({ error: 'Could not find alternatives' })
  }
}
