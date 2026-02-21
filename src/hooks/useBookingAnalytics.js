// src/hooks/useBookingAnalytics.js
// Centralized booking analytics hook.
// Observes step changes, fires GA4/Meta events via reluxeTrack,
// and persists sessions + events to Supabase.
import { useRef, useEffect, useCallback } from 'react'

// Step ordinal maps for funnel position
const MODAL_STEPS = ['HOME', 'CATEGORIES', 'CATEGORY_ITEMS', 'BUNDLE_ITEMS', 'PROVIDER_SERVICES', 'OPTIONS', 'DATE_TIME', 'CHECKOUT', 'BOOKED']
const PICKER_STEPS = ['SPECIALTY', 'BUNDLE_ITEMS', 'MENU_ITEM', 'OPTIONS', 'ADD_SERVICE', 'ADDON_OPTIONS', 'DATE_TIME', 'CHECKOUT']

function getStepIndex(step, flowType) {
  const steps = flowType === 'modal' ? MODAL_STEPS : PICKER_STEPS
  const idx = steps.indexOf(step)
  return idx >= 0 ? idx : -1
}

function generateSessionId() {
  return 'bs_' + crypto.randomUUID()
}

function getOrCreateDeviceId() {
  const KEY = 'reluxe_device_id'
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = 'dev_' + crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch { return null }
}

function getUTMParams() {
  try {
    const p = new URLSearchParams(window.location.search)
    return {
      utm_source: p.get('utm_source') || null,
      utm_medium: p.get('utm_medium') || null,
      utm_campaign: p.get('utm_campaign') || null,
    }
  } catch { return {} }
}

// Fire-and-forget API call, prefer sendBeacon for reliability on close
function sendToAPI(url, method, body) {
  try {
    const json = JSON.stringify(body)
    if (method === 'POST' && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([json], { type: 'application/json' }))
    } else {
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: json,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {}
}

function fireExternal(eventName, params) {
  if (typeof window !== 'undefined' && window.reluxeTrack) {
    window.reluxeTrack(eventName, params)
  }
}

/**
 * @param {Object} opts
 * @param {'modal'|'provider_picker'} opts.flowType
 * @param {string} opts.step          - current step name
 * @param {boolean} opts.isActive     - is the flow visible/open
 * @param {string} opts.locationKey
 * @param {Object} opts.selectedProvider
 * @param {Object} opts.selectedService
 * @param {Object} opts.selectedCategory
 * @param {Object} opts.selectedBundle
 * @param {string} opts.selectedDate
 * @param {Object} opts.selectedTime
 * @param {string} opts.memberId
 */
export function useBookingAnalytics({
  flowType, step, isActive, locationKey,
  selectedProvider, selectedService, selectedCategory, selectedBundle,
  selectedDate, selectedTime, memberId,
}) {
  const sessionRef = useRef(null)
  const prevStepRef = useRef(null)
  const stepEnteredAt = useRef(null)
  const stepsVisited = useRef(new Set())
  const maxStepIdx = useRef(-1)
  const startedAt = useRef(null)
  const batchQueue = useRef([])
  const flushTimer = useRef(null)
  const finalizedRef = useRef(false)
  // Keep refs to latest values for use in event handlers
  const latestRef = useRef({})
  latestRef.current = {
    step, locationKey, selectedProvider, selectedService,
    selectedCategory, selectedBundle, selectedDate, selectedTime,
  }

  // --- Batch flush ---
  const flushEvents = useCallback(() => {
    const events = batchQueue.current.splice(0)
    if (events.length === 0) return
    sendToAPI('/api/analytics/booking-events', 'POST', { events })
  }, [])

  const scheduleBatchFlush = useCallback(() => {
    if (flushTimer.current) return
    flushTimer.current = setTimeout(() => {
      flushEvents()
      flushTimer.current = null
    }, 2000)
  }, [flushEvents])

  const queueEvent = useCallback((event) => {
    batchQueue.current.push({
      ...event,
      session_id: sessionRef.current,
      timestamp: new Date().toISOString(),
    })
    scheduleBatchFlush()
  }, [scheduleBatchFlush])

  // --- Session finalize ---
  const finalizeSession = useCallback((outcome, abandonStep) => {
    if (!sessionRef.current || finalizedRef.current) return
    finalizedRef.current = true
    // Flush remaining events first
    if (flushTimer.current) { clearTimeout(flushTimer.current); flushTimer.current = null }
    flushEvents()

    const L = latestRef.current
    const duration = startedAt.current ? Date.now() - startedAt.current : null
    const updates = {
      session_id: sessionRef.current,
      outcome,
      abandon_step: abandonStep || null,
      max_step: prevStepRef.current || L.step || 'HOME',
      steps_visited: [...stepsVisited.current],
      step_count: stepsVisited.current.size,
      duration_ms: duration,
      service_name: L.selectedService?.name || null,
      service_id: L.selectedService?.id || null,
      provider_name: L.selectedProvider?.name || null,
      provider_id: L.selectedProvider?.boulevardProviderId || null,
      category_name: L.selectedCategory?.name || null,
      bundle_title: L.selectedBundle?.title || null,
      location_key: L.locationKey || null,
    }
    if (outcome === 'completed') updates.completed_at = new Date().toISOString()

    sendToAPI('/api/analytics/booking-session', 'PATCH', updates)

    // Fire external event
    if (outcome === 'abandoned') {
      fireExternal('booking_abandon', {
        flow_type: flowType,
        abandon_step: abandonStep,
        service_name: L.selectedService?.name,
        provider_name: L.selectedProvider?.name,
        location_key: L.locationKey,
        duration_ms: duration,
      })
    }
  }, [flowType, flushEvents])

  // --- Session lifecycle: start when active, abandon on close ---
  useEffect(() => {
    if (isActive && !sessionRef.current) {
      const sid = generateSessionId()
      sessionRef.current = sid
      prevStepRef.current = null
      stepEnteredAt.current = Date.now()
      stepsVisited.current = new Set()
      maxStepIdx.current = -1
      startedAt.current = Date.now()
      finalizedRef.current = false

      sendToAPI('/api/analytics/booking-session', 'POST', {
        session_id: sid,
        flow_type: flowType,
        location_key: locationKey || null,
        member_id: memberId || null,
        device_id: getOrCreateDeviceId(),
        page_path: typeof window !== 'undefined' ? window.location.pathname : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        ...getUTMParams(),
      })

      fireExternal('booking_flow_start', {
        flow_type: flowType,
        location_key: locationKey,
        page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      })
    }

    if (!isActive && sessionRef.current) {
      const lastStep = prevStepRef.current || step
      if (lastStep !== 'BOOKED') {
        finalizeSession('abandoned', lastStep)
      }
      sessionRef.current = null
    }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Step transitions ---
  useEffect(() => {
    if (!isActive || !sessionRef.current) return
    if (step === prevStepRef.current) return

    const now = Date.now()
    const timeOnPrev = prevStepRef.current ? (now - (stepEnteredAt.current || now)) : 0
    const stepIdx = getStepIndex(step, flowType)

    stepsVisited.current.add(step)
    if (stepIdx > maxStepIdx.current) maxStepIdx.current = stepIdx

    queueEvent({
      event_name: 'step_view',
      step,
      step_index: stepIdx,
      time_on_step: timeOnPrev,
      metadata: {
        previous_step: prevStepRef.current,
        flow_type: flowType,
        location_key: locationKey,
        provider_name: selectedProvider?.name || null,
        service_name: selectedService?.name || null,
        category_name: selectedCategory?.name || null,
        bundle_title: selectedBundle?.title || null,
      },
    })

    fireExternal('booking_step_view', {
      flow_type: flowType,
      step,
      step_index: stepIdx,
      previous_step: prevStepRef.current,
      location_key: locationKey,
      service_name: selectedService?.name || null,
      provider_name: selectedProvider?.name || null,
    })

    // Checkout start
    if (step === 'CHECKOUT') {
      fireExternal('booking_checkout_start', {
        flow_type: flowType,
        service_name: selectedService?.name,
        provider_name: selectedProvider?.name,
        location_key: locationKey,
      })
    }

    // Booking complete
    if (step === 'BOOKED') {
      finalizeSession('completed', null)
      fireExternal('booking_complete', {
        flow_type: flowType,
        location_key: locationKey,
        service_name: selectedService?.name,
        provider_name: selectedProvider?.name,
        date: selectedDate,
      })
    }

    // Heartbeat: update last_activity
    sendToAPI('/api/analytics/booking-session', 'PATCH', {
      session_id: sessionRef.current,
      last_activity: new Date().toISOString(),
    })

    prevStepRef.current = step
    stepEnteredAt.current = now
  }, [step, isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Page close / tab hide ---
  useEffect(() => {
    if (!isActive) return

    const handleUnload = () => {
      if (sessionRef.current && !finalizedRef.current && prevStepRef.current !== 'BOOKED') {
        finalizeSession('abandoned', prevStepRef.current || step)
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && sessionRef.current && !finalizedRef.current) {
        flushEvents()
        sendToAPI('/api/analytics/booking-session', 'PATCH', {
          session_id: sessionRef.current,
          last_activity: new Date().toISOString(),
        })
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isActive, step, finalizeSession, flushEvents])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current)
      if (sessionRef.current && !finalizedRef.current) {
        flushEvents()
        const lastStep = prevStepRef.current || 'unknown'
        if (lastStep !== 'BOOKED') {
          finalizeSession('abandoned', lastStep)
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Specific action trackers ---
  const trackServiceSelect = useCallback((service) => {
    if (!sessionRef.current) return
    queueEvent({
      event_name: 'service_select',
      step: prevStepRef.current || 'unknown',
      metadata: { service_name: service?.name, service_id: service?.id, category_name: service?.categoryName },
    })
    fireExternal('booking_service_select', {
      flow_type: flowType,
      service_name: service?.name,
      category_name: service?.categoryName,
    })
  }, [flowType, queueEvent])

  const trackProviderSelect = useCallback((provider) => {
    if (!sessionRef.current) return
    queueEvent({
      event_name: 'provider_select',
      step: prevStepRef.current || 'unknown',
      metadata: { provider_name: provider?.name, provider_slug: provider?.slug },
    })
    fireExternal('booking_provider_select', {
      flow_type: flowType,
      provider_name: provider?.name,
    })
  }, [flowType, queueEvent])

  const trackDateSelect = useCallback((date) => {
    if (!sessionRef.current) return
    queueEvent({
      event_name: 'date_select',
      step: 'DATE_TIME',
      metadata: { date, location_key: latestRef.current.locationKey },
    })
    fireExternal('booking_date_select', {
      flow_type: flowType,
      date,
      location_key: latestRef.current.locationKey,
    })
  }, [flowType, queueEvent])

  const trackTimeSelect = useCallback((time) => {
    if (!sessionRef.current) return
    queueEvent({
      event_name: 'time_select',
      step: 'DATE_TIME',
      metadata: { time_slot: time?.startTime || time },
    })
    fireExternal('booking_time_select', {
      flow_type: flowType,
      time_slot: time?.startTime || time,
    })
  }, [flowType, queueEvent])

  const trackContactProvided = useCallback((phone, email) => {
    if (!sessionRef.current) return
    sendToAPI('/api/analytics/booking-session', 'PATCH', {
      session_id: sessionRef.current,
      contact_phone: phone || null,
      contact_email: email || null,
    })
  }, [])

  return {
    trackServiceSelect,
    trackProviderSelect,
    trackDateSelect,
    trackTimeSelect,
    trackContactProvided,
    sessionId: sessionRef.current,
  }
}
