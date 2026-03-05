// src/lib/apiCache.js
// Client-side fetch wrapper with sessionStorage caching + request dedup.
// Eliminates repeat API calls within a browser session for static-ish data.

const CACHE_DURATIONS = {
  '/api/blvd/services/menu': 15 * 60 * 1000,         // 15 min
  '/api/blvd/services/options': 10 * 60 * 1000,      // 10 min
  '/api/blvd/bundles': 30 * 60 * 1000,               // 30 min
  '/api/blvd/providers/at-location': 10 * 60 * 1000,  // 10 min
}

const inflight = new Map()

/**
 * Cached fetch for GET requests to Boulevard API routes.
 * - Checks sessionStorage first (survives page navigation)
 * - Deduplicates in-flight requests (prevents React double-renders)
 * - Falls through to normal fetch for non-matching URLs and POST requests
 */
export async function cachedFetch(url, options = {}) {
  // Only cache GET requests
  if (options.method && options.method !== 'GET') return fetch(url, options)

  // Find matching cache duration
  const matchingKey = Object.keys(CACHE_DURATIONS).find(k => url.startsWith(k))
  if (!matchingKey) return fetch(url, options)

  const cacheKey = `blvd:${url}`

  // Check sessionStorage
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      const { data, ts } = JSON.parse(cached)
      if (Date.now() - ts < CACHE_DURATIONS[matchingKey]) {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  } catch {
    // Safari private mode or quota exceeded — skip cache
  }

  // Deduplicate in-flight requests
  if (inflight.has(url)) return inflight.get(url).then(r => r.clone())

  const promise = fetch(url, options)
    .then(async (res) => {
      inflight.delete(url)

      if (res.ok) {
        const data = await res.json()

        // Don't cache degraded or empty responses
        if (!data.degraded && !(Array.isArray(data) && data.length === 0)) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }))
          } catch {
            // Quota exceeded — skip
          }
        }

        return new Response(JSON.stringify(data), {
          status: res.status,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return res
    })
    .catch((err) => {
      inflight.delete(url)
      throw err
    })

  inflight.set(url, promise)
  return promise
}
