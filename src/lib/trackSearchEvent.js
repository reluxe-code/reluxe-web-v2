// src/lib/trackSearchEvent.js
// Client-side search event tracker — batch queue with sendBeacon flush.

const ENDPOINT = '/api/analytics/search-events'
const FLUSH_DELAY = 3000

let queue = []
let timer = null

function getDeviceId() {
  if (typeof window === 'undefined') return null
  let id = localStorage.getItem('reluxe_device_id')
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('reluxe_device_id', id)
  }
  return id
}

let _sessionId = null
function getSessionId() {
  if (_sessionId) return _sessionId
  _sessionId = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)
  return _sessionId
}

function flush() {
  if (!queue.length) return
  const events = [...queue]
  queue = []
  timer = null

  const body = JSON.stringify({ events })
  if (navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))
  } else {
    fetch(ENDPOINT, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
  }
}

function enqueue(event) {
  queue.push(event)
  if (timer) clearTimeout(timer)
  timer = setTimeout(flush, FLUSH_DELAY)
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flush)
  window.addEventListener('pagehide', flush)
}

export function trackSearchQuery(query, resultCount, source = 'overlay', activeFilter = null) {
  if (typeof window === 'undefined' || !query) return
  enqueue({
    event_type: 'query',
    query,
    query_normalized: query.toLowerCase().trim().replace(/\s+/g, ' '),
    result_count: resultCount,
    source,
    active_filter: activeFilter,
    device_id: getDeviceId(),
    session_id: getSessionId(),
    page_path: window.location.pathname,
  })
  // Also fire GA4 event
  if (window.reluxeTrack) {
    window.reluxeTrack('site_search', { query, result_count: resultCount, source })
  }
}

export function trackSearchClick(query, url, title, type, position, source = 'overlay') {
  if (typeof window === 'undefined' || !query) return
  enqueue({
    event_type: 'click',
    query,
    query_normalized: query.toLowerCase().trim().replace(/\s+/g, ' '),
    result_count: 0,
    clicked_url: url,
    clicked_title: title,
    clicked_type: type,
    click_position: position,
    source,
    device_id: getDeviceId(),
    session_id: getSessionId(),
    page_path: window.location.pathname,
  })
}
