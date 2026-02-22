// src/lib/trackWidgetEvent.js
// Lightweight tracker for inspiration widget interactions.
// Fires to both internal DB (via API) and external analytics (GA4 + Meta Pixel).

let deviceId = null
function getDeviceId() {
  if (deviceId) return deviceId
  try {
    deviceId = localStorage.getItem('reluxe_device_id')
    if (!deviceId) {
      deviceId = 'wd_' + crypto.randomUUID()
      localStorage.setItem('reluxe_device_id', deviceId)
    }
  } catch {
    deviceId = 'wd_' + Math.random().toString(36).slice(2)
  }
  return deviceId
}

// Batch queue — flush every 3 seconds or on page unload
const queue = []
let flushTimer = null

function flush() {
  if (!queue.length) return
  const batch = queue.splice(0, 50)
  const payload = JSON.stringify({ events: batch })

  // Use sendBeacon for reliability on page unload
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/widget-events', new Blob([payload], { type: 'application/json' }))
  } else {
    fetch('/api/analytics/widget-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    }).catch(() => {})
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

/**
 * Track a widget interaction event.
 *
 * @param {string} eventName - e.g. 'quiz_complete', 'calculator_use'
 * @param {string} widgetType - component name e.g. 'QuizAssessment'
 * @param {string} articleSlug - the article the widget is embedded in
 * @param {object} metadata - arbitrary event data
 */
export default function trackWidgetEvent(eventName, widgetType, articleSlug, metadata = {}) {
  if (typeof window === 'undefined') return

  const event = {
    event_name: eventName,
    widget_type: widgetType,
    article_slug: articleSlug || null,
    metadata,
    device_id: getDeviceId(),
    page_path: window.location.pathname,
    timestamp: new Date().toISOString(),
  }

  queue.push(event)

  // Debounce flush
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(flush, 3000)

  // Also fire to GA4 / Meta Pixel
  if (typeof window.reluxeTrack === 'function') {
    window.reluxeTrack(`widget_${eventName}`, {
      widget_type: widgetType,
      article_slug: articleSlug,
      ...metadata,
    })
  }
}
