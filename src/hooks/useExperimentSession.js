// src/hooks/useExperimentSession.js
// Manages experiment session lifecycle: create on mount, update on transitions, finalize on unmount.
import { useEffect, useRef, useCallback } from 'react'
import trackExperimentEvent, { getDeviceId, flushExperimentEvents } from '@/lib/trackExperimentEvent'

function generateSessionId() {
  return 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

function getAttribution() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    referrer: document.referrer || null,
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_content: params.get('utm_content') || null,
    fbclid: params.get('fbclid') || null,
    gclid: params.get('gclid') || null,
  }
}

export default function useExperimentSession(experimentId = 'thisorthat_v1') {
  const sessionIdRef = useRef(null)
  const startedAtRef = useRef(null)
  const createdRef = useRef(false)

  // Create session on mount
  useEffect(() => {
    if (createdRef.current) return
    createdRef.current = true

    const sid = generateSessionId()
    sessionIdRef.current = sid
    startedAtRef.current = Date.now()

    fetch('/api/analytics/experiment-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sid,
        experiment_id: experimentId,
        device_id: getDeviceId(),
        ...getAttribution(),
      }),
    }).catch(() => {})

    trackExperimentEvent(sid, 'experiment_view', { experiment_id: experimentId })

    return () => {
      flushExperimentEvents()
    }
  }, [experimentId])

  const updateSession = useCallback((fields) => {
    const sid = sessionIdRef.current
    if (!sid) return
    fetch('/api/analytics/experiment-session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sid, last_activity: new Date().toISOString(), ...fields }),
    }).catch(() => {})
  }, [])

  const trackEvent = useCallback((eventName, metadata = {}) => {
    const sid = sessionIdRef.current
    if (!sid) return
    trackExperimentEvent(sid, eventName, metadata)
  }, [])

  const getDuration = useCallback(() => {
    return startedAtRef.current ? Date.now() - startedAtRef.current : 0
  }, [])

  return {
    getSessionId: () => sessionIdRef.current,
    updateSession,
    trackEvent,
    getDuration,
  }
}
