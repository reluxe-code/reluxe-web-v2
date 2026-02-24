// src/lib/trackExperimentEvent.js
// Batch event tracker for experiment landing pages.
// Queues events and flushes to Supabase via API + fires to GA4/Meta/Bird.

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

const queue = []
let flushTimer = null

function flush() {
  if (!queue.length) return
  const batch = queue.splice(0, 50)
  const payload = JSON.stringify({ events: batch })

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/experiment-events', new Blob([payload], { type: 'application/json' }))
  } else {
    fetch('/api/analytics/experiment-events', {
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
 * Track an experiment event.
 * @param {string} sessionId - Experiment session ID
 * @param {string} eventName - e.g. 'experiment_swipe'
 * @param {object} metadata - Arbitrary event data
 */
export default function trackExperimentEvent(sessionId, eventName, metadata = {}) {
  if (typeof window === 'undefined') return

  queue.push({
    session_id: sessionId,
    event_name: eventName,
    metadata,
    timestamp: new Date().toISOString(),
  })

  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(flush, 3000)

  // Also fire to GA4 / Meta Pixel / Bird
  if (typeof window.reluxeTrack === 'function') {
    window.reluxeTrack(eventName, metadata)
  }
}

export { getDeviceId, flush as flushExperimentEvents }
