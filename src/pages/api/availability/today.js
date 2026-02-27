import { getServiceClient } from '@/lib/supabase'
import { createCartWithItem, LOCATION_IDS } from '@/server/blvd'
import { getCached, setCache } from '@/server/cache'
import { REVEAL_CATEGORIES } from '@/data/revealCategories'

const WINDOW_TZ = 'America/New_York'
const LOCATION_LABELS = {
  westfield: 'Westfield',
  carmel: 'Carmel',
}
const CATEGORY_BY_ID = Object.fromEntries(REVEAL_CATEGORIES.map((c) => [String(c.id).toLowerCase(), c.slug]))
const CATEGORY_BY_SLUG = Object.fromEntries(REVEAL_CATEGORIES.map((c) => [String(c.slug).toLowerCase(), c.slug]))
const CATEGORY_LABEL_BY_SLUG = Object.fromEntries(REVEAL_CATEGORIES.map((c) => [String(c.slug).toLowerCase(), c.label]))

function getTzParts(date = new Date(), timeZone = WINDOW_TZ) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const map = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]))
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
  }
}

function isoFromParts(parts) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

function addDaysISO(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0))
  return dt.toISOString().slice(0, 10)
}

function toDayName(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: WINDOW_TZ,
  }).format(new Date(Date.UTC(y, m - 1, d, 12, 0, 0)))
}

function getWindowInfo() {
  const nowParts = getTzParts(new Date(), WINDOW_TZ)
  const todayISO = isoFromParts(nowParts)
  const isAfterTwoPm = nowParts.hour >= 14

  // Always look at least 3 days out so late-night/early-morning always finds tomorrow.
  // After 2 PM we already showed 3 days — extend to 4 so day 3 sticks around.
  const daysOut = isAfterTwoPm ? 4 : 3
  const windowDates = []
  for (let i = 0; i < daysOut; i++) {
    windowDates.push(addDaysISO(todayISO, i))
  }

  const windowDays = ['Today', 'Tomorrow']
  for (let i = 2; i < windowDates.length; i++) {
    windowDays.push(toDayName(windowDates[i]))
  }

  return {
    isAfterTwoPm,
    windowStart: windowDates[0],
    windowEnd: windowDates[windowDates.length - 1],
    windowDates,
    windowDays,
  }
}

function flexibleIdMatch(source, target) {
  if (!source || !target) return false
  return source === target || source.includes(target) || target.includes(source)
}

function resolveLocationKey(locationId) {
  if (!locationId) return null
  const raw = String(locationId).toLowerCase().trim()

  if (raw.includes('westfield') || flexibleIdMatch(LOCATION_IDS.westfield, raw)) return 'westfield'
  if (raw.includes('carmel') || flexibleIdMatch(LOCATION_IDS.carmel, raw)) return 'carmel'
  return null
}

function serviceLabelFromSlug(slug) {
  const canonical = CATEGORY_LABEL_BY_SLUG[String(slug || '').toLowerCase()]
  if (canonical) return canonical
  return String(slug || 'Service')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatTimeLabel(startAt) {
  try {
    return new Date(startAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: WINDOW_TZ,
    })
  } catch {
    return ''
  }
}

function getBookingMode(hoursUntilStart) {
  if (hoursUntilStart < 1) return 'CALL_ONLY'
  if (hoursUntilStart <= 2.5) return 'CALL_PREFERRED'
  return 'ONLINE'
}

function parseMultiValue(raw) {
  if (!raw) return []
  return String(raw)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function resolveServiceFilters(serviceId, serviceCategoryId) {
  const serviceTokens = parseMultiValue(serviceId)
  const categoryTokens = parseMultiValue(serviceCategoryId)

  const serviceSlugs = new Set()
  let serviceItemIdFilter = null

  for (const token of [...serviceTokens, ...categoryTokens]) {
    const normalized = token.toLowerCase()
    if (CATEGORY_BY_ID[normalized]) {
      serviceSlugs.add(CATEGORY_BY_ID[normalized])
      continue
    }
    if (CATEGORY_BY_SLUG[normalized]) {
      serviceSlugs.add(CATEGORY_BY_SLUG[normalized])
      continue
    }

    // If it isn't a known slug/category token, treat serviceId as potential Boulevard item id.
    if (!serviceItemIdFilter && serviceTokens.includes(token)) {
      serviceItemIdFilter = token
    }
  }

  return {
    serviceSlugs,
    serviceItemIdFilter,
  }
}

function providerMatches(provider, providerId) {
  if (!providerId) return true
  const needle = String(providerId).toLowerCase()
  return [provider.slug, provider.id, provider.boulevard_provider_id]
    .filter(Boolean)
    .some((v) => flexibleIdMatch(String(v).toLowerCase(), needle))
}

function providerAtLocation(provider, locationKey) {
  const locs = Array.isArray(provider.locations) ? provider.locations : []
  return locs.some((loc) => {
    const text = (loc?.slug || loc?.title || loc || '').toString().toLowerCase()
    return text.includes(locationKey)
  })
}

function buildWhyShowingLine({ provider, locationKey }) {
  if (provider?.name) return `Showing ${provider.name}'s next available openings.`
  if (locationKey === 'westfield') return "Showing Westfield's next available openings."
  if (locationKey === 'carmel') return "Showing Carmel's next available openings."
  return 'Showing next available across both locations.'
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const {
    locationId,
    providerId,
    serviceId,
    serviceCategoryId,
    limit,
  } = req.query

  const limitNum = Math.max(1, Math.min(60, Number(limit) || 24))
  const window = getWindowInfo()
  const locationKey = resolveLocationKey(locationId)
  const effectiveLocationKeys = locationKey ? [locationKey] : ['westfield', 'carmel']
  const { serviceSlugs, serviceItemIdFilter } = resolveServiceFilters(serviceId, serviceCategoryId)

  const comboCachePrefix = [
    locationKey || 'both',
    providerId || 'any',
    serviceId || 'all',
    serviceCategoryId || 'all',
    window.windowStart,
    window.windowEnd,
  ].join(':')

  const topCacheKey = `today-availability:${comboCachePrefix}:${limitNum}`
  const topCached = getCached(topCacheKey, 60_000)
  // Serve from cache only if fresh AND non-empty (empty results are never cached, but guard anyway)
  if (topCached && !topCached.stale && topCached.data?.totalOpenings > 0) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res.json(topCached.data)
  }

  try {
    const sb = getServiceClient()
    const { data: staff } = await sb
      .from('staff')
      .select('id, slug, name, featured_image, transparent_bg, boulevard_provider_id, boulevard_service_map, locations')
      .eq('status', 'published')
      .not('boulevard_provider_id', 'is', null)

    const providers = Array.isArray(staff) ? staff : []
    const filteredProviders = providers.filter((p) => providerMatches(p, providerId))

    const selectedProvider = filteredProviders.length === 1 ? filteredProviders[0] : null

    // Build all valid provider×service×location combos
    const allCombos = []
    for (const provider of filteredProviders) {
      const serviceMap = provider.boulevard_service_map || {}
      const mapSlugs = Object.keys(serviceMap)

      for (const slug of mapSlugs) {
        if (serviceSlugs.size > 0 && !serviceSlugs.has(slug)) continue

        for (const locKey of effectiveLocationKeys) {
          if (!providerAtLocation(provider, locKey)) continue

          const serviceItemId = serviceMap[slug]?.[locKey]
          if (!serviceItemId) continue

          if (serviceItemIdFilter && !flexibleIdMatch(String(serviceItemId), String(serviceItemIdFilter))) {
            continue
          }

          allCombos.push({
            provider,
            providerId: provider.boulevard_provider_id,
            providerName: provider.name,
            providerSlug: provider.slug,
            providerImage: provider.transparent_bg || provider.featured_image || null,
            locationKey: locKey,
            locationName: LOCATION_LABELS[locKey] || locKey,
            serviceSlug: slug,
            serviceLabel: serviceLabelFromSlug(slug),
            serviceItemId,
          })
        }
      }
    }

    // Prioritize: 1 combo per provider first (ensure everyone shows up),
    // then backfill with remaining combos for service variety.
    const MAX_COMBOS = 24
    const selectedCombos = []
    const usedProviders = new Set()
    const usedKeys = new Set()

    // Pass 1: one combo per provider (first service in their map)
    for (const combo of allCombos) {
      if (usedProviders.has(combo.providerId)) continue
      usedProviders.add(combo.providerId)
      const key = `${combo.providerId}:${combo.serviceItemId}:${combo.locationKey}`
      usedKeys.add(key)
      selectedCombos.push(combo)
    }

    // Pass 2: backfill remaining combos, up to MAX_COMBOS
    for (const combo of allCombos) {
      if (selectedCombos.length >= MAX_COMBOS) break
      const key = `${combo.providerId}:${combo.serviceItemId}:${combo.locationKey}`
      if (usedKeys.has(key)) continue
      usedKeys.add(key)
      selectedCombos.push(combo)
    }
    const wantedDates = new Set(window.windowDates)

    const dateResults = await Promise.allSettled(
      selectedCombos.map(async (combo) => {
        const dateCacheKey = `today-dates:${combo.providerId}:${combo.locationKey}:${combo.serviceItemId}:${window.windowStart}:${window.windowEnd}`
        const dateCached = getCached(dateCacheKey, 60_000)

        if (dateCached && !dateCached.stale) {
          return { combo, dates: dateCached.data }
        }

        const { cart } = await createCartWithItem(combo.locationKey, combo.serviceItemId, combo.providerId)
        const rawDates = await cart.getBookableDates({
          searchRangeLower: window.windowStart,
          searchRangeUpper: window.windowEnd,
        })
        const normalized = (rawDates || []).map((d) => (typeof d === 'string' ? d : d.date || d))
        setCache(dateCacheKey, normalized)

        return { combo, dates: normalized }
      })
    )

    const datesFulfilled = dateResults.filter((r) => r.status === 'fulfilled').length
    const datesFailed = dateResults.filter((r) => r.status === 'rejected').length
    const datesWithSlots = dateResults.filter((r) => r.status === 'fulfilled' && r.value.dates.length > 0).length
    console.log(`[availability/today] combos=${selectedCombos.length} datesFulfilled=${datesFulfilled} datesFailed=${datesFailed} datesWithSlots=${datesWithSlots}`)

    const timeFetches = []
    for (const result of dateResults) {
      if (result.status !== 'fulfilled') continue
      const { combo, dates } = result.value
      const selectedDates = dates.filter((d) => wantedDates.has(d))
      for (const date of selectedDates) {
        timeFetches.push({ combo, date })
      }
    }

    const timeResults = await Promise.allSettled(
      timeFetches.map(async ({ combo, date }) => {
        const timeCacheKey = `today-times:${combo.providerId}:${combo.locationKey}:${combo.serviceItemId}:${date}`
        const timeCached = getCached(timeCacheKey, 60_000)

        if (timeCached && !timeCached.stale) {
          return { combo, date, times: timeCached.data }
        }

        const { cart } = await createCartWithItem(combo.locationKey, combo.serviceItemId, combo.providerId)
        const rawTimes = await cart.getBookableTimes({ date })
        const normalized = (rawTimes || []).map((t) => ({
          id: t.id || `${date}:${t.startTime}`,
          startTime: t.startTime,
        }))

        setCache(timeCacheKey, normalized)
        return { combo, date, times: normalized }
      })
    )

    const timesFulfilled = timeResults.filter((r) => r.status === 'fulfilled').length
    const timesFailed = timeResults.filter((r) => r.status === 'rejected').length
    const timesWithSlots = timeResults.filter((r) => r.status === 'fulfilled' && r.value.times.length > 0).length
    console.log(`[availability/today] timeFetches=${timeFetches.length} timesFulfilled=${timesFulfilled} timesFailed=${timesFailed} timesWithSlots=${timesWithSlots}`)

    const now = new Date()
    const openings = []

    for (const result of timeResults) {
      if (result.status !== 'fulfilled') continue

      const { combo, date, times } = result.value
      for (const t of times) {
        const startAt = t.startTime
        const hoursUntilStart = (new Date(startAt).getTime() - now.getTime()) / 3_600_000
        if (!Number.isFinite(hoursUntilStart) || hoursUntilStart <= 0) continue

        const bookingMode = getBookingMode(hoursUntilStart)
        const dayLabel =
          date === window.windowDates[0]
            ? 'Today'
            : date === window.windowDates[1]
            ? 'Tomorrow'
            : toDayName(date)

        openings.push({
          id: `${combo.providerId}:${combo.serviceItemId}:${combo.locationKey}:${startAt}`,
          startAt,
          dayLabel,
          timeLabel: formatTimeLabel(startAt),
          location: { id: combo.locationKey, name: combo.locationName },
          provider: { id: combo.providerId, name: combo.providerName, slug: combo.providerSlug, image: combo.providerImage },
          service: { id: combo.serviceSlug, name: combo.serviceLabel },
          serviceItemId: combo.serviceItemId,
          bookingMode,
          hoursUntilStart: Number(hoursUntilStart.toFixed(2)),
          bookingDeepLink: `https://blvd.app/@reluxemedspa?location=${combo.locationKey}`,
        })
      }
    }

    openings.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

    const deduped = []
    const seen = new Set()
    for (const opening of openings) {
      if (seen.has(opening.id)) continue
      seen.add(opening.id)
      deduped.push(opening)
    }

    // Diversity pass: spread services per provider so one service doesn't dominate.
    // For each provider, allow max 2 slots per service before requiring a different service.
    // This ensures aestheticians (who have 4-6 services) show variety on the board.
    const MAX_PER_PROVIDER_SERVICE = 2
    const diverse = []
    const providerServiceCount = {} // "providerId:serviceSlug" -> count
    const deferred = []

    for (const opening of deduped) {
      const psKey = `${opening.provider.id}:${opening.service.id}`
      const count = providerServiceCount[psKey] || 0
      if (count < MAX_PER_PROVIDER_SERVICE) {
        providerServiceCount[psKey] = count + 1
        diverse.push(opening)
      } else {
        deferred.push(opening)
      }
    }
    // Append deferred slots at the end (still available, just lower priority)
    diverse.push(...deferred)

    const totalOpenings = diverse.length
    const totalTodayOpenings = diverse.filter((o) => o.dayLabel === 'Today').length

    const payload = {
      windowStart: window.windowStart,
      windowEnd: window.windowEnd,
      windowDays: window.windowDays,
      totalOpenings,
      totalTodayOpenings,
      isAfterTwoPm: window.isAfterTwoPm,
      whyThisShowing: buildWhyShowingLine({ provider: selectedProvider, locationKey }),
      openings: diverse.slice(0, limitNum).map((o) => ({
        startAt: o.startAt,
        dayLabel: o.dayLabel,
        timeLabel: o.timeLabel,
        location: o.location,
        provider: o.provider,
        service: o.service,
        serviceItemId: o.serviceItemId,
        bookingMode: o.bookingMode,
        hoursUntilStart: o.hoursUntilStart,
        bookingDeepLink: o.bookingDeepLink,
      })),
    }

    // Only cache non-empty results — empty may be a transient Boulevard failure
    if (totalOpenings > 0) {
      setCache(topCacheKey, payload)
    }
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res.json(payload)
  } catch (err) {
    console.error('[availability/today]', err.message)

    if (topCached) {
      return res.json(topCached.data)
    }

    return res.status(200).json({
      windowStart: window.windowStart,
      windowEnd: window.windowEnd,
      windowDays: window.windowDays,
      totalOpenings: 0,
      totalTodayOpenings: 0,
      isAfterTwoPm: window.isAfterTwoPm,
      whyThisShowing: buildWhyShowingLine({ provider: null, locationKey }),
      openings: [],
    })
  }
}
