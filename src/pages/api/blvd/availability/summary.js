// src/pages/api/blvd/availability/summary.js
// Returns scarcity data: openings today (slot counts) plus
// available dates this week and next week per service.
import { createCartWithItem } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'
import { getServiceClient } from '@/lib/supabase'

// High-demand services to check for scarcity signals
const SCARCITY_SERVICES = ['tox', 'filler', 'facials', 'massage']

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/** Returns { thisWeekDates: string[], nextWeekStart: string, nextWeekEnd: string } */
function getWeekBounds() {
  const now = new Date()
  const dow = now.getDay() // 0=Sun … 6=Sat

  // Days remaining this week (after today, through Sunday)
  const daysUntilSunday = dow === 0 ? 0 : 7 - dow
  const thisWeekDates = []
  for (let i = 1; i <= daysUntilSunday; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    thisWeekDates.push(d.toISOString().split('T')[0])
  }

  // Next week: Monday through Sunday
  const nextMonday = new Date(now)
  nextMonday.setDate(nextMonday.getDate() + daysUntilSunday + 1)
  const nextWeekDates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(nextMonday)
    d.setDate(d.getDate() + i)
    nextWeekDates.push(d.toISOString().split('T')[0])
  }

  return { thisWeekDates, nextWeekDates }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { locationKey, staffProviderId } = req.query

  if (!locationKey) {
    return res.status(400).json({ error: 'locationKey is required' })
  }

  const cacheKey = `summary:v2:${locationKey}:${staffProviderId || 'any'}`
  const cached = getCached(cacheKey, 300_000) // 5 min TTL
  if (cached && !cached.stale) {
    return res.json(cached.data)
  }

  try {
    // If a specific provider, get their service map from Supabase
    let serviceMap = null
    if (staffProviderId) {
      const sb = getServiceClient()
      const { data } = await sb
        .from('staff')
        .select('boulevard_service_map')
        .eq('boulevard_provider_id', staffProviderId)
        .limit(1)
      serviceMap = data?.[0]?.boulevard_service_map || {}
    }

    const today = todayISO()
    const { thisWeekDates, nextWeekDates } = getWeekBounds()
    const allDates = [...thisWeekDates, ...nextWeekDates]
    const endDate = allDates.length > 0 ? allDates[allDates.length - 1] : today
    const thisWeekSet = new Set(thisWeekDates)
    const nextWeekSet = new Set(nextWeekDates)

    const result = {
      today: {},
      thisWeek: { _dates: thisWeekDates },
      nextWeek: { _dates: nextWeekDates },
      updatedAt: new Date().toISOString(),
    }

    // Check each service in parallel
    const checks = SCARCITY_SERVICES.map(async (slug) => {
      try {
        let serviceItemId = null
        if (serviceMap && serviceMap[slug]?.[locationKey]) {
          serviceItemId = serviceMap[slug][locationKey]
        }
        if (!serviceItemId) return

        const { cart } = await createCartWithItem(locationKey, serviceItemId, staffProviderId)

        // Get today's TIME slots (for exact count)
        try {
          const todayTimes = await cart.getBookableTimes({ date: today })
          result.today[slug] = (todayTimes || []).length
        } catch {
          result.today[slug] = 0
        }

        // Get bookable DATES for rest of week + next week (single call)
        try {
          const dates = await cart.getBookableDates({
            searchRangeLower: thisWeekDates[0] || nextWeekDates[0],
            searchRangeUpper: endDate,
          })
          const dateStrings = (dates || []).map((d) => (typeof d === 'string' ? d : d.date || d))
          result.thisWeek[slug] = dateStrings.filter((d) => thisWeekSet.has(d))
          result.nextWeek[slug] = dateStrings.filter((d) => nextWeekSet.has(d))
        } catch {
          result.thisWeek[slug] = []
          result.nextWeek[slug] = []
        }
      } catch {
        // Service not available at this location, skip
      }
    })

    await Promise.allSettled(checks)

    // Calculate totals
    result.today.total = Object.entries(result.today)
      .reduce((a, [k, v]) => a + (typeof v === 'number' ? v : 0), 0)

    setCache(cacheKey, result)
    res.json(result)
  } catch (err) {
    console.error('[blvd/availability/summary]', err.message)
    if (cached) return res.json(cached.data)
    res.status(200).json({ today: {}, thisWeek: {}, nextWeek: {}, updatedAt: new Date().toISOString() })
  }
}
