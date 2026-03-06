// src/pages/api/admin/intelligence/experiments.js
// Dashboard API for experiment analytics — aggregates sessions + events.
// Supports any experiment_id (landing pages, quizzes, etc).
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'
import { maskPhone, maskEmail, nameInitial } from '@/lib/piiHash'

// Known funnel configs — unknown experiments get auto-built funnels from event data
const FUNNEL_CONFIGS = {
  thisorthat_v1: {
    label: 'This or That',
    steps: [
      { key: 'experiment_view', label: 'Page View' },
      { key: 'experiment_start', label: 'Tap Start' },
      { key: 'experiment_swipe', label: 'Swipes (total)', isCounter: true },
      { key: 'experiment_results_view', label: 'Results Shown' },
      { key: 'experiment_booking_start', label: 'Book CTA Tap' },
      { key: 'experiment_booking_complete', label: 'Booking Complete' },
    ],
    goals: {
      bookings: { label: 'Bookings', target: 60 },
      memberships: { label: 'Membership Clicks', target: 15, sessionField: 'membership_clicked' },
      laserStarts: { label: 'Laser Hair Starts', target: 20, bookingService: 'laserhair' },
    },
  },
  reveal_v1: {
    label: 'Reveal Board',
    steps: [
      { key: 'reveal_page_view', label: 'Page View' },
      { key: 'reveal_filter_submit', label: 'Filter Submit' },
      { key: 'reveal_board_loaded', label: 'Board Loaded' },
      { key: 'reveal_tile_tap', label: 'Tile Tap' },
      { key: 'reveal_booking_start', label: 'Booking Start' },
      { key: 'reveal_booking_complete', label: 'Booking Complete' },
    ],
    goals: {
      bookings: { label: 'Bookings', target: 30 },
      tileTaps: { label: 'Tile Taps', eventKey: 'reveal_tile_tap', target: 100 },
      boardViews: { label: 'Board Views', eventKey: 'reveal_board_loaded', target: 200 },
    },
  },
  tox_lp: {
    label: 'Tox Landing Page',
    steps: [
      { key: 'landing_view', label: 'Page View' },
      { key: 'section_view', label: 'Section Scroll', isCounter: true },
      { key: 'tile_tap', label: 'Slot Tap' },
      { key: 'booking_reserved', label: 'Slot Reserved' },
      { key: 'booking_complete', label: 'Booking Complete' },
    ],
    goals: {
      bookings: { label: 'Bookings', target: 50 },
      tileTaps: { label: 'Slot Taps', eventKey: 'tile_tap', target: 200 },
    },
  },
  lhr_lp: {
    label: 'Laser Hair Removal',
    steps: [
      { key: 'experiment_view', label: 'Page View' },
      { key: 'sms_click', label: 'SMS Click' },
      { key: 'call_click', label: 'Call Click' },
      { key: 'video_fullscreen_open', label: 'Video Opened' },
      { key: 'ig_reel_click', label: 'IG Reel Click' },
    ],
    goals: null,
  },
}

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()

  // List mode — return all experiment IDs with counts
  if (req.query.list === '1') {
    try {
      const { data: allSessions, error } = await db
        .from('experiment_sessions')
        .select('experiment_id, started_at')
      if (error) throw error

      const counts = {}
      const latestAt = {}
      ;(allSessions || []).forEach(s => {
        counts[s.experiment_id] = (counts[s.experiment_id] || 0) + 1
        if (!latestAt[s.experiment_id] || s.started_at > latestAt[s.experiment_id]) {
          latestAt[s.experiment_id] = s.started_at
        }
      })

      const experiments = Object.entries(counts)
        .map(([id, count]) => ({
          id,
          label: FUNNEL_CONFIGS[id]?.label || id,
          count,
          lastActivity: latestAt[id],
        }))
        .sort((a, b) => (b.lastActivity || '').localeCompare(a.lastActivity || ''))

      return res.json({ experiments })
    } catch (err) {
      console.error('[admin/intelligence/experiments] list', err.message)
      return res.status(500).json({ error: err.message || 'Unknown error' })
    }
  }

  const { from, to, experiment_id } = req.query
  const expId = experiment_id || 'thisorthat_v1'
  const funnelConfig = FUNNEL_CONFIGS[expId] || null

  // Date filters
  const dateFrom = from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const dateTo = to || new Date().toISOString().slice(0, 10)
  const dateFromISO = `${dateFrom}T00:00:00`
  const dateToISO = `${dateTo}T23:59:59`

  try {
    // 1. All sessions in range
    const { data: sessions, error: sErr } = await db
      .from('experiment_sessions')
      .select('*')
      .eq('experiment_id', expId)
      .gte('started_at', dateFromISO)
      .lte('started_at', dateToISO)
      .order('started_at', { ascending: false })

    if (sErr) throw sErr

    const total = sessions.length
    const completed = sessions.filter(s => s.outcome === 'completed_quiz' || s.outcome === 'booked')
    const booked = sessions.filter(s => s.outcome === 'booked')
    const abandoned = sessions.filter(s => s.outcome === 'abandoned' || s.outcome === 'in_progress')

    // 2. Persona distribution
    const personaCounts = {}
    completed.forEach(s => {
      if (s.persona_name) personaCounts[s.persona_name] = (personaCounts[s.persona_name] || 0) + 1
    })

    // 3. Service breakdown
    const serviceBooked = {}
    const serviceRecommended = {}
    completed.forEach(s => {
      const services = s.persona_services || []
      services.forEach(slug => {
        serviceRecommended[slug] = (serviceRecommended[slug] || 0) + 1
      })
    })
    booked.forEach(s => {
      if (s.booking_service) {
        serviceBooked[s.booking_service] = (serviceBooked[s.booking_service] || 0) + 1
      }
    })

    // 4. Location split
    const locationCounts = {}
    booked.forEach(s => {
      if (s.booking_location) {
        locationCounts[s.booking_location] = (locationCounts[s.booking_location] || 0) + 1
      }
    })

    // 5. Funnel — get event counts + per-session stats
    const sessionIds = sessions.map(s => s.session_id)
    const eventCounts = {}
    const perSessionEvents = {} // { session_id: { count, lastEvent, lastAt } }
    // Supabase .in() has a limit, batch if needed
    for (let i = 0; i < sessionIds.length; i += 200) {
      const batch = sessionIds.slice(i, i + 200)
      const { data: events, error: eErr } = await db
        .from('experiment_events')
        .select('session_id,event_name,created_at')
        .in('session_id', batch)
      if (eErr) throw eErr
      ;(events || []).forEach(e => {
        eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1
        // Track per-session
        if (!perSessionEvents[e.session_id]) {
          perSessionEvents[e.session_id] = { count: 0, lastEvent: e.event_name, lastAt: e.created_at }
        }
        perSessionEvents[e.session_id].count++
        if (e.created_at > perSessionEvents[e.session_id].lastAt) {
          perSessionEvents[e.session_id].lastEvent = e.event_name
          perSessionEvents[e.session_id].lastAt = e.created_at
        }
      })
    }

    // 6. Abandon phase breakdown
    const abandonPhases = {}
    abandoned.forEach(s => {
      const phase = s.abandon_phase || 'unknown'
      abandonPhases[phase] = (abandonPhases[phase] || 0) + 1
    })

    // 7. Average duration for completed
    const durations = completed.filter(s => s.duration_ms).map(s => s.duration_ms)
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0

    // 8. Build funnel — known configs use defined steps, unknown auto-build from events
    let funnel
    if (funnelConfig) {
      funnel = funnelConfig.steps.map(step => ({
        key: step.key,
        label: step.label,
        count: eventCounts[step.key] || 0,
        isCounter: step.isCounter || false,
      }))
    } else {
      // Dynamic funnel from event data, sorted by count descending
      funnel = Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => ({
          key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          count,
          isCounter: false,
        }))
    }

    // 9. Goals — only for experiments with defined targets
    let goals = null
    if (funnelConfig?.goals) {
      goals = {}
      for (const [k, g] of Object.entries(funnelConfig.goals)) {
        let current = 0
        if (g.eventKey) {
          current = eventCounts[g.eventKey] || 0
        } else if (g.sessionField) {
          current = sessions.filter(s => s[g.sessionField]).length
        } else if (g.bookingService) {
          current = booked.filter(s => s.booking_service === g.bookingService).length
        } else {
          // Default: bookings count
          current = booked.length
        }
        goals[k] = { label: g.label, current, target: g.target }
      }
    }

    // 10. Recent sessions (last 50)
    const recent = sessions.slice(0, 50).map(s => {
      const pse = perSessionEvents[s.session_id]
      return {
        session_id: s.session_id,
        started_at: s.started_at,
        outcome: s.outcome,
        persona_name: s.persona_name,
        booking_service: s.booking_service,
        booking_location: s.booking_location,
        booking_provider: s.booking_provider,
        duration_ms: s.duration_ms,
        is_heavy_responder: s.is_heavy_responder,
        utm_source: s.utm_source,
        utm_campaign: s.utm_campaign,
        contact_phone: maskPhone(s.contact_phone),
        client_name: s.client_name_initial || nameInitial(s.client_name) || null,
        client_email: maskEmail(s.client_email),
        blvd_client_id: s.blvd_client_id || null,
        appointment_id: s.appointment_id || null,
        event_count: pse?.count || 0,
        last_event: pse?.lastEvent || null,
      }
    })

    // 11. UTM source breakdown
    const utmSources = {}
    sessions.forEach(s => {
      const src = s.utm_source || 'direct'
      utmSources[src] = (utmSources[src] || 0) + 1
    })

    // 12. Booked patients (all, not limited to 50)
    const bookedPatients = booked.map(s => {
      const pse = perSessionEvents[s.session_id]
      return {
        session_id: s.session_id,
        started_at: s.started_at,
        client_name: s.client_name_initial || nameInitial(s.client_name) || null,
        client_email: maskEmail(s.client_email),
        contact_phone: maskPhone(s.contact_phone),
        booking_service: s.booking_service || null,
        booking_location: s.booking_location || null,
        booking_provider: s.booking_provider || null,
        appointment_id: s.appointment_id || null,
        persona_name: s.persona_name || null,
        duration_ms: s.duration_ms,
        utm_source: s.utm_source || null,
        utm_campaign: s.utm_campaign || null,
        event_count: pse?.count || 0,
      }
    })

    res.json({
      dateFrom,
      dateTo,
      experiment_id: expId,
      experimentLabel: funnelConfig?.label || expId,
      summary: {
        total,
        completed: completed.length,
        booked: booked.length,
        abandoned: abandoned.length,
        completionRate: total ? Math.round((completed.length / total) * 100) : 0,
        bookingRate: total ? Math.round((booked.length / total) * 100) : 0,
        avgDurationMs: avgDuration,
      },
      funnel,
      goals,
      allEventCounts: eventCounts,
      personas: personaCounts,
      services: {
        recommended: serviceRecommended,
        booked: serviceBooked,
      },
      locations: locationCounts,
      abandonPhases,
      utmSources,
      recent,
      bookedPatients,
    })
  } catch (err) {
    console.error('[admin/intelligence/experiments]', err.message, err.stack)
    res.status(500).json({ error: err.message || 'Unknown error' })
  }
}

export default withAdminAuth(handler)
