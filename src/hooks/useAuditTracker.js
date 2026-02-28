// src/hooks/useAuditTracker.js
// Global client-side audit event collector.
// Captures JS errors, unhandled rejections, and manual events (404, login failure, booking fallback).
// Batches and sends to /api/audit/events. Toggleable via site_config.
import { useEffect, useRef } from 'react'

const FLUSH_INTERVAL = 2000
const MAX_EVENTS_PER_PAGE = 50
const DEDUP_WINDOW_MS = 5000
const BATCH_LIMIT = 50

let queue = []
let eventCount = 0
let enabled = true // optimistic; disabled by config response
let recentMessages = new Map() // message → timestamp for dedup
let flushTimer = null
let initialized = false

function getDeviceId() {
  if (typeof window === 'undefined') return null
  let id = localStorage.getItem('reluxe_device_id')
  if (!id) {
    id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('reluxe_device_id', id)
  }
  return id
}

function flush() {
  if (queue.length === 0) return

  const batch = queue.splice(0, BATCH_LIMIT)
  const body = JSON.stringify({ events: batch })

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/audit/events', new Blob([body], { type: 'application/json' }))
  } else {
    fetch('/api/audit/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
  }
}

function isDuplicate(message) {
  const now = Date.now()
  const key = String(message || '').slice(0, 200)
  if (!key) return false
  const lastSeen = recentMessages.get(key)
  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) return true
  recentMessages.set(key, now)
  // Prune old entries
  if (recentMessages.size > 100) {
    for (const [k, t] of recentMessages) {
      if (now - t > DEDUP_WINDOW_MS) recentMessages.delete(k)
    }
  }
  return false
}

/**
 * Track an audit event from anywhere in the app.
 * @param {string} eventType - 'error' | '404' | 'login_failure' | 'booking_fallback' | 'booking_error' | 'unhandled_rejection'
 * @param {string} [message]
 * @param {object} [metadata]
 */
export function trackAuditEvent(eventType, message, metadata) {
  if (typeof window === 'undefined') return
  if (!enabled) return
  if (eventCount >= MAX_EVENTS_PER_PAGE) return
  if (isDuplicate(message)) return

  eventCount++

  queue.push({
    event_type: eventType,
    message: String(message || '').slice(0, 2000),
    metadata: metadata || {},
    url: window.location.href,
    user_agent: navigator.userAgent,
    device_id: getDeviceId(),
    timestamp: new Date().toISOString(),
  })
}

/**
 * React hook — mount once in _app.js.
 * Sets up global error listeners and flush interval.
 */
export function useAuditTracker() {
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true

    if (initialized) return
    initialized = true

    // Check feature flag
    fetch('/api/audit/config')
      .then(r => r.json())
      .then(data => { enabled = data.enabled !== false })
      .catch(() => { enabled = true }) // default on if config fails

    // Global JS errors
    const onError = (event) => {
      trackAuditEvent('error', event.message || 'Unknown error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    // Unhandled promise rejections
    const onRejection = (event) => {
      const reason = event.reason
      const message = reason?.message || reason?.toString?.() || 'Unhandled rejection'
      trackAuditEvent('unhandled_rejection', message, {
        stack: reason?.stack?.slice(0, 500),
      })
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    // Flush on interval
    flushTimer = setInterval(flush, FLUSH_INTERVAL)

    // Flush on page unload
    const onUnload = () => flush()
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
    window.addEventListener('beforeunload', onUnload)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      window.removeEventListener('beforeunload', onUnload)
      clearInterval(flushTimer)
      flush()
    }
  }, [])
}
