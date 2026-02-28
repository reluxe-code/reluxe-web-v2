// src/server/circuitBreaker.js
// Per-instance circuit breaker for Boulevard API calls.
// Prevents burning API budget when Boulevard is rate-limiting or down.
//
// States: CLOSED (normal) → OPEN (degraded) → HALF_OPEN (probing) → CLOSED
// No Redis needed — Boulevard outages are global, each serverless
// instance discovers independently within 1-2 requests.

const WINDOW_MS = 60_000        // Rolling window for failure tracking
const FAILURE_THRESHOLD = 0.5   // Trip at 50% failure rate
const MIN_REQUESTS = 5          // Need at least 5 requests before tripping
const OPEN_DURATION_MS = 30_000 // Stay open for 30s before probing

let state = 'CLOSED'  // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
let openedAt = 0
let halfOpenInFlight = false
const history = []     // [{ ts, ok }]

function pruneHistory() {
  const cutoff = Date.now() - WINDOW_MS
  while (history.length > 0 && history[0].ts < cutoff) {
    history.shift()
  }
}

export function recordSuccess() {
  history.push({ ts: Date.now(), ok: true })
  pruneHistory()

  if (state === 'HALF_OPEN') {
    state = 'CLOSED'
    halfOpenInFlight = false
  }
}

export function recordFailure() {
  history.push({ ts: Date.now(), ok: false })
  pruneHistory()

  if (state === 'HALF_OPEN') {
    state = 'OPEN'
    openedAt = Date.now()
    halfOpenInFlight = false
    return
  }

  if (state === 'CLOSED' && history.length >= MIN_REQUESTS) {
    const failures = history.filter(h => !h.ok).length
    if (failures / history.length >= FAILURE_THRESHOLD) {
      state = 'OPEN'
      openedAt = Date.now()
      console.warn(`[circuitBreaker] OPEN — ${failures}/${history.length} failures in ${WINDOW_MS / 1000}s window`)
    }
  }
}

export function getCircuitState() {
  if (state === 'OPEN') {
    // Check if it's time to probe
    if (Date.now() - openedAt >= OPEN_DURATION_MS) {
      state = 'HALF_OPEN'
      halfOpenInFlight = false
    }
  }

  if (state === 'HALF_OPEN' && halfOpenInFlight) {
    // Another request is already probing — block this one
    return { state: 'OPEN' }
  }

  if (state === 'HALF_OPEN') {
    halfOpenInFlight = true
  }

  return { state }
}
