// src/pages/api/admin/intelligence/experiments.js
// Dashboard API for experiment analytics — aggregates sessions + events.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()
  const { from, to, experiment_id } = req.query
  const expId = experiment_id || 'thisorthat_v1'

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

    // 5. Membership metrics
    const membershipShown = sessions.filter(s => s.membership_shown).length
    const membershipClicked = sessions.filter(s => s.membership_clicked).length

    // 6. Funnel — get event counts
    const { data: events, error: eErr } = await db
      .from('experiment_events')
      .select('event_name')
      .in('session_id', sessions.map(s => s.session_id))

    if (eErr) throw eErr

    const eventCounts = {}
    ;(events || []).forEach(e => {
      eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1
    })

    // 7. Abandon phase breakdown
    const abandonPhases = {}
    abandoned.forEach(s => {
      const phase = s.abandon_phase || 'unknown'
      abandonPhases[phase] = (abandonPhases[phase] || 0) + 1
    })

    // 8. Average duration for completed
    const durations = completed.filter(s => s.duration_ms).map(s => s.duration_ms)
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0

    // 9. Heavy responders
    const heavyCount = sessions.filter(s => s.is_heavy_responder).length

    // 10. Recent sessions (last 50)
    const recent = sessions.slice(0, 50).map(s => ({
      session_id: s.session_id,
      started_at: s.started_at,
      outcome: s.outcome,
      persona_name: s.persona_name,
      booking_service: s.booking_service,
      booking_location: s.booking_location,
      duration_ms: s.duration_ms,
      is_heavy_responder: s.is_heavy_responder,
      utm_source: s.utm_source,
      utm_campaign: s.utm_campaign,
    }))

    // 11. UTM source breakdown
    const utmSources = {}
    sessions.forEach(s => {
      const src = s.utm_source || 'direct'
      utmSources[src] = (utmSources[src] || 0) + 1
    })

    res.json({
      dateFrom,
      dateTo,
      experiment_id: expId,
      summary: {
        total,
        completed: completed.length,
        booked: booked.length,
        abandoned: abandoned.length,
        completionRate: total ? Math.round((completed.length / total) * 100) : 0,
        bookingRate: total ? Math.round((booked.length / total) * 100) : 0,
        membershipShown,
        membershipClicked,
        heavyResponders: heavyCount,
        avgDurationMs: avgDuration,
      },
      funnel: {
        view: eventCounts.experiment_view || 0,
        start: eventCounts.experiment_start || 0,
        swipes: eventCounts.experiment_swipe || 0,
        results: eventCounts.experiment_results_view || 0,
        bookingStart: eventCounts.experiment_booking_start || 0,
        bookingComplete: eventCounts.experiment_booking_complete || 0,
      },
      goals: {
        bookings: { current: booked.length, target: 60 },
        memberships: { current: membershipClicked, target: 15 },
        laserStarts: {
          current: booked.filter(s => s.booking_service === 'laserhair').length,
          target: 20,
        },
      },
      personas: personaCounts,
      services: {
        recommended: serviceRecommended,
        booked: serviceBooked,
      },
      locations: locationCounts,
      abandonPhases,
      utmSources,
      recent,
    })
  } catch (err) {
    console.error('[admin/intelligence/experiments]', err.message)
    res.status(500).json({ error: err.message })
  }
}
