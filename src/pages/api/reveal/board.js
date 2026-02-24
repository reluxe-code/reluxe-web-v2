// src/pages/api/reveal/board.js
// Aggregate board API: fetches availability across services/providers,
// applies diversity rules, returns 9-16 curated bookable tiles.
import { getServiceClient } from '@/lib/supabase'
import { createCartWithItem } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'
import { REVEAL_CATEGORIES } from '@/data/revealCategories'

const SLUG_MAP = Object.fromEntries(REVEAL_CATEGORIES.map(c => [c.id, c.slug]))
const LABEL_MAP = Object.fromEntries(REVEAL_CATEGORIES.map(c => [c.slug, c.label]))
const PRICE_MAP = Object.fromEntries(REVEAL_CATEGORIES.map(c => [c.slug, c.priceTier]))

function getDateRange(when) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayOfWeek = today.getDay() // 0 = Sun

  const fmt = (d) => d.toISOString().split('T')[0]
  const addDays = (d, n) => new Date(d.getTime() + n * 86400000)

  switch (when) {
    case 'this_week': {
      const end = addDays(today, 7 - dayOfWeek) // through Sunday
      return { lower: fmt(today), upper: fmt(end) }
    }
    case 'next_week': {
      const nextMon = addDays(today, (8 - dayOfWeek) % 7 || 7)
      const nextSun = addDays(nextMon, 6)
      return { lower: fmt(nextMon), upper: fmt(nextSun) }
    }
    case 'march':
      return { lower: '2026-03-01', upper: '2026-03-31' }
    case 'weekdays':
    case 'weekends':
      return { lower: fmt(today), upper: fmt(addDays(today, 21)) }
    default:
      return { lower: fmt(today), upper: fmt(addDays(today, 21)) }
  }
}

function isWeekend(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.getDay() === 0 || d.getDay() === 6
}

function filterTimeOfDay(startTime, timeOfDay) {
  if (!timeOfDay || timeOfDay === 'any') return true
  const hour = new Date(startTime).getHours()
  switch (timeOfDay) {
    case 'morning': return hour < 12
    case 'midday': return hour >= 11 && hour < 15
    case 'after3': return hour >= 15
    case 'evening': return hour >= 17
    default: return true
  }
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTimeLabel(startTime) {
  return new Date(startTime).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

// Diversity curation: greedy selection for spread across providers, locations, services, times
function curateTiles(candidates, limit = 16) {
  if (candidates.length <= limit) return candidates

  const selected = []
  const used = new Set()
  const providerCounts = {}
  const locationCounts = {}
  const serviceCounts = {}
  let lastTime = null

  // Sort by date/time (earliest first)
  const sorted = [...candidates].sort((a, b) =>
    a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
  )

  function score(tile) {
    const prov = providerCounts[tile.providerSlug] || 0
    const loc = locationCounts[tile.locationKey] || 0
    const svc = serviceCounts[tile.serviceSlug] || 0
    // Penalize over-represented dimensions
    let s = -(prov * 3 + loc * 2 + svc * 2)
    // Penalize consecutive same-time slots
    if (lastTime && tile.startTime === lastTime) s -= 2
    return s
  }

  for (let pass = 0; pass < limit && sorted.length > 0; pass++) {
    // Score all remaining candidates
    let best = null
    let bestScore = -Infinity
    let bestIdx = -1
    for (let i = 0; i < sorted.length; i++) {
      const t = sorted[i]
      const key = `${t.providerSlug}:${t.serviceSlug}:${t.date}:${t.startTime}`
      if (used.has(key)) continue
      const s = score(t)
      if (s > bestScore) {
        bestScore = s
        best = t
        bestIdx = i
      }
    }
    if (!best) break
    const key = `${best.providerSlug}:${best.serviceSlug}:${best.date}:${best.startTime}`
    used.add(key)
    selected.push(best)
    providerCounts[best.providerSlug] = (providerCounts[best.providerSlug] || 0) + 1
    locationCounts[best.locationKey] = (locationCounts[best.locationKey] || 0) + 1
    serviceCounts[best.serviceSlug] = (serviceCounts[best.serviceSlug] || 0) + 1
    lastTime = best.startTime
    sorted.splice(bestIdx, 1)
  }

  return selected
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { locations = [], providerSlug, serviceSlugs = [], when, timeOfDay, limit = 16 } = req.body

  if (!serviceSlugs.length) {
    return res.status(400).json({ error: 'At least one service is required' })
  }

  const locationKeys = locations.includes('either')
    ? ['westfield', 'carmel']
    : locations.length ? locations : ['westfield', 'carmel']

  // Resolve Boulevard slugs from category IDs
  const resolvedSlugs = serviceSlugs.map(s => SLUG_MAP[s] || s)

  try {
    const sb = getServiceClient()

    // 1. Get eligible providers from Supabase
    const { data: staff } = await sb
      .from('staff')
      .select('slug, name, title, featured_image, boulevard_provider_id, boulevard_service_map, locations')
      .eq('status', 'published')
      .not('boulevard_provider_id', 'is', null)

    if (!staff?.length) return res.json({ tiles: [], moreTiles: [], meta: { totalCandidates: 0 } })

    // Build (provider, service, location) combos
    const combos = []
    for (const s of staff) {
      const map = s.boulevard_service_map || {}
      const locs = Array.isArray(s.locations) ? s.locations : []

      // If a specific provider is requested, filter
      if (providerSlug && s.slug !== providerSlug) continue

      for (const slug of resolvedSlugs) {
        for (const locKey of locationKeys) {
          const serviceItemId = map[slug]?.[locKey]
          if (!serviceItemId) continue
          // Verify provider works at this location
          const worksHere = locs.some(l => {
            const locSlug = (l.slug || l.title || '').toLowerCase()
            return locSlug.includes(locKey)
          })
          if (!worksHere) continue

          combos.push({
            providerSlug: s.slug,
            providerName: s.name,
            providerImage: s.featured_image,
            boulevardProviderId: s.boulevard_provider_id,
            serviceSlug: slug,
            serviceLabel: LABEL_MAP[slug] || slug,
            serviceItemId,
            locationKey: locKey,
          })
        }
      }
    }

    // Cap combos to avoid excessive API calls
    const maxCombos = 12
    const selectedCombos = combos.slice(0, maxCombos)

    // 2. Date range from filter
    const range = getDateRange(when)

    // 3. Fetch dates for each combo (parallel, cached)
    const dateResults = await Promise.allSettled(
      selectedCombos.map(async (combo) => {
        const dateCacheKey = `reveal-dates:${combo.locationKey}:${combo.serviceItemId}:${combo.boulevardProviderId}:${range.lower}:${range.upper}`
        const cached = getCached(dateCacheKey, 120_000)
        if (cached && !cached.stale) return { combo, dates: cached.data }

        const { cart } = await createCartWithItem(
          combo.locationKey, combo.serviceItemId, combo.boulevardProviderId
        )
        const rawDates = await cart.getBookableDates({
          searchRangeLower: range.lower,
          searchRangeUpper: range.upper,
        })
        const dates = (rawDates || []).map(d => typeof d === 'string' ? d : d.date || d)

        // Apply weekday/weekend filter
        const filtered = when === 'weekdays'
          ? dates.filter(d => !isWeekend(d))
          : when === 'weekends'
          ? dates.filter(d => isWeekend(d))
          : dates

        setCache(dateCacheKey, filtered)
        return { combo, dates: filtered }
      })
    )

    // 4. For each combo with dates, fetch times for first 2 dates
    const timeFetches = []
    for (const result of dateResults) {
      if (result.status !== 'fulfilled' || !result.value.dates.length) continue
      const { combo, dates } = result.value
      const datesToFetch = dates.slice(0, 2)
      for (const date of datesToFetch) {
        timeFetches.push({ combo, date })
      }
    }

    const timeResults = await Promise.allSettled(
      timeFetches.map(async ({ combo, date }) => {
        const timeCacheKey = `reveal-times:${combo.locationKey}:${combo.serviceItemId}:${combo.boulevardProviderId}:${date}`
        const cached = getCached(timeCacheKey, 60_000)
        if (cached && !cached.stale) return { combo, date, times: cached.data }

        const { cart } = await createCartWithItem(
          combo.locationKey, combo.serviceItemId, combo.boulevardProviderId
        )
        const rawTimes = await cart.getBookableTimes({ date })
        const times = (rawTimes || []).map(t => ({
          startTime: t.startTime,
        }))

        setCache(timeCacheKey, times)
        return { combo, date, times }
      })
    )

    // 5. Build candidate tiles
    const allCandidates = []
    for (const result of timeResults) {
      if (result.status !== 'fulfilled') continue
      const { combo, date, times } = result.value

      for (const t of times) {
        if (!filterTimeOfDay(t.startTime, timeOfDay)) continue
        allCandidates.push({
          id: `${combo.providerSlug}-${combo.serviceSlug}-${combo.locationKey}-${date}-${t.startTime}`,
          locationKey: combo.locationKey,
          serviceSlug: combo.serviceSlug,
          serviceLabel: combo.serviceLabel,
          providerSlug: combo.providerSlug,
          providerName: combo.providerName,
          providerImage: combo.providerImage,
          boulevardProviderId: combo.boulevardProviderId,
          serviceItemId: combo.serviceItemId,
          date,
          startTime: t.startTime,
          dayLabel: formatDayLabel(date),
          timeLabel: formatTimeLabel(t.startTime),
          priceTier: PRICE_MAP[combo.serviceSlug] || 2,
        })
      }
    }

    // 6. Curate with diversity rules
    const curated = curateTiles(allCandidates, Math.min(limit, 16))

    const tiles = curated.slice(0, 9)
    const moreTiles = curated.slice(9)

    const providerSet = [...new Set(curated.map(t => t.providerName))]

    res.json({
      tiles,
      moreTiles,
      meta: {
        totalCandidates: allCandidates.length,
        providers: providerSet,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('[reveal/board]', err.message)
    res.status(500).json({ error: 'Failed to build board. Please try again.' })
  }
}
