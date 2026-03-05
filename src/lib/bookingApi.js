// src/lib/bookingApi.js
// Shared Boulevard API fetching for all booking flows.
// Single source of truth for caching, degraded detection, and multi-location support.

import { cachedFetch } from './apiCache'

const LOCATION_LABELS = { westfield: 'Westfield', carmel: 'Carmel' }

function today() { return new Date().toISOString().split('T')[0] }
function horizonDate() { return new Date(Date.now() + 183 * 86400000).toISOString().split('T')[0] }

/**
 * Fetch available dates — single or multi-location.
 * @returns {{ dates: string[], locationMap: Record<string, string[]> | null, degraded?: boolean }}
 */
export async function fetchAvailableDates({
  locationKey,
  serviceItemId,
  altServiceItemId,
  staffProviderId,
  startDate,
  endDate,
}) {
  const start = startDate || today()
  const end = endDate || horizonDate()
  const isAll = locationKey === 'all'

  if (isAll) {
    const fetches = [
      { key: 'westfield', serviceItemId },
      ...(altServiceItemId ? [{ key: 'carmel', serviceItemId: altServiceItemId }] : []),
    ]
    const results = await Promise.all(fetches.map(loc => {
      const params = new URLSearchParams({ locationKey: loc.key, serviceItemId: loc.serviceItemId, startDate: start, endDate: end })
      if (staffProviderId) params.set('staffProviderId', staffProviderId)
      return fetch(`/api/blvd/availability/dates?${params}`)
        .then(r => r.json())
        .then(data => {
          if (data.degraded) return { degraded: true }
          return Array.isArray(data) ? data : []
        })
        .catch(() => [])
    }))
    // Check for degraded
    if (results.some(r => r?.degraded)) return { dates: [], locationMap: null, degraded: true }
    const locationMap = {}
    fetches.forEach((loc, i) => {
      const dates = Array.isArray(results[i]) ? results[i] : []
      dates.forEach(d => { if (!locationMap[d]) locationMap[d] = []; locationMap[d].push(loc.key) })
    })
    const allDates = [...new Set(results.flat().filter(d => typeof d === 'string'))].sort()
    return { dates: allDates, locationMap }
  }

  // Single location
  const params = new URLSearchParams({ locationKey, serviceItemId, startDate: start, endDate: end })
  if (staffProviderId) params.set('staffProviderId', staffProviderId)
  try {
    const res = await fetch(`/api/blvd/availability/dates?${params}`)
    const data = await res.json()
    if (data.degraded) return { dates: [], locationMap: null, degraded: true }
    return { dates: Array.isArray(data) ? data : [], locationMap: null }
  } catch {
    return { dates: [], locationMap: null, degraded: true }
  }
}

/**
 * Fetch available times — single or multi-location.
 * Multi-location slots are tagged with locationKey/locationLabel.
 * @returns {{ times: object[], degraded?: boolean }}
 */
export async function fetchAvailableTimes({
  locationKey,
  serviceItemId,
  altServiceItemId,
  staffProviderId,
  date,
  dateLocationMap,
}) {
  const isAll = locationKey === 'all'

  if (isAll) {
    const fetches = [
      { key: 'westfield', label: 'Westfield', serviceItemId },
      ...(altServiceItemId ? [{ key: 'carmel', label: 'Carmel', serviceItemId: altServiceItemId }] : []),
    ]
    // Only fetch from locations that have availability on this date
    const availableFetches = dateLocationMap
      ? fetches.filter(loc => dateLocationMap[date]?.includes(loc.key))
      : fetches
    const results = await Promise.all(availableFetches.map(loc => {
      const params = new URLSearchParams({ locationKey: loc.key, serviceItemId: loc.serviceItemId, date })
      if (staffProviderId) params.set('staffProviderId', staffProviderId)
      return fetch(`/api/blvd/availability/times?${params}`)
        .then(r => r.json())
        .then(data => {
          if (data.degraded) return { degraded: true }
          return (data || []).map(s => ({ ...s, locationKey: loc.key, locationLabel: loc.label }))
        })
        .catch(() => [])
    }))
    if (results.some(r => r?.degraded)) return { times: [], degraded: true }
    const merged = results.flat().sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    return { times: merged }
  }

  // Single location
  const params = new URLSearchParams({ locationKey, serviceItemId, date })
  if (staffProviderId) params.set('staffProviderId', staffProviderId)
  try {
    const res = await fetch(`/api/blvd/availability/times?${params}`)
    const data = await res.json()
    if (data.degraded) return { times: [], degraded: true }
    return { times: Array.isArray(data) ? data : [] }
  } catch {
    return { times: [], degraded: true }
  }
}

/**
 * Create a cart reservation. Resolves actual location from slot in 'all' mode.
 * @returns {{ data: object, degraded?: boolean, error?: string }}
 */
export async function createCartReservation({
  locationKey,
  serviceItemId,
  altServiceItemId,
  staffProviderId,
  date,
  slot,
  selectedOptionIds = [],
  additionalItems,
}) {
  const actualLocation = slot.locationKey || locationKey
  // Resolve correct service item ID for the slot's location
  let resolvedServiceItemId = serviceItemId
  if (locationKey === 'all' && slot.locationKey === 'carmel' && altServiceItemId) {
    resolvedServiceItemId = altServiceItemId
  }
  const body = {
    locationKey: actualLocation,
    serviceItemId: resolvedServiceItemId,
    staffProviderId: staffProviderId || undefined,
    date,
    startTime: slot.startTime,
    selectedOptionIds,
  }
  if (additionalItems?.length) body.additionalItems = additionalItems
  try {
    const res = await fetch('/api/blvd/cart/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.degraded) return { data: null, degraded: true }
    if (!res.ok) return { data: null, error: data.error || 'Failed to reserve' }
    return { data }
  } catch (err) {
    return { data: null, error: err.message || 'Failed to reserve' }
  }
}

/**
 * Fetch service menu — single or dual (for 'all' mode).
 * Uses cachedFetch for sessionStorage caching.
 * @returns {{ primary: object, alt: object | null, degraded?: boolean }}
 */
export async function fetchServiceMenu({ locationKey, staffProviderId }) {
  const isAll = locationKey === 'all'
  const buildUrl = (loc) => {
    let url = `/api/blvd/services/menu?locationKey=${loc}`
    if (staffProviderId) url += `&staffProviderId=${encodeURIComponent(staffProviderId)}`
    return url
  }

  if (isAll) {
    try {
      const [wf, cm] = await Promise.all([
        cachedFetch(buildUrl('westfield')).then(r => r.json()),
        cachedFetch(buildUrl('carmel')).then(r => r.json()),
      ])
      if (wf.degraded || cm.degraded) return { primary: null, alt: null, degraded: true }
      return { primary: wf, alt: cm }
    } catch {
      return { primary: null, alt: null, degraded: true }
    }
  }

  try {
    const res = await cachedFetch(buildUrl(locationKey))
    const data = await res.json()
    if (data.degraded) return { primary: null, alt: null, degraded: true }
    return { primary: data, alt: null }
  } catch {
    return { primary: null, alt: null, degraded: true }
  }
}

/**
 * Fetch service options/info. Uses cachedFetch.
 * @returns {{ data: object | null, degraded?: boolean }}
 */
export async function fetchServiceOptions({ locationKey, serviceItemId, staffProviderId }) {
  const effectiveLocation = locationKey === 'all' ? 'westfield' : locationKey
  const params = new URLSearchParams({ locationKey: effectiveLocation, serviceItemId })
  if (staffProviderId) params.set('staffProviderId', staffProviderId)
  try {
    const res = await cachedFetch(`/api/blvd/services/options?${params}`)
    const data = await res.json()
    if (data.degraded) return { data: null, degraded: true }
    return { data }
  } catch {
    return { data: null, degraded: true }
  }
}

/**
 * Fetch providers at a location. Uses cachedFetch.
 * @returns {{ data: object[] | null, degraded?: boolean }}
 */
export async function fetchProvidersAtLocation({ locationKey }) {
  if (locationKey === 'all') {
    // Fetch both locations and merge, deduplicating by staff id
    try {
      const [wRes, cRes] = await Promise.all([
        cachedFetch('/api/blvd/providers/at-location?locationKey=westfield'),
        cachedFetch('/api/blvd/providers/at-location?locationKey=carmel'),
      ])
      const [wData, cData] = await Promise.all([wRes.json(), cRes.json()])
      const wArr = Array.isArray(wData) ? wData : []
      const cArr = Array.isArray(cData) ? cData : []
      const seen = new Set()
      const merged = []
      for (const p of [...wArr, ...cArr]) {
        const key = p.boulevardProviderId || p.id || p.name
        if (seen.has(key)) continue
        seen.add(key)
        merged.push(p)
      }
      return { data: merged }
    } catch {
      return { data: [] }
    }
  }
  try {
    const res = await cachedFetch(`/api/blvd/providers/at-location?locationKey=${locationKey}`)
    const data = await res.json()
    return { data: Array.isArray(data) ? data : [] }
  } catch {
    return { data: [] }
  }
}
