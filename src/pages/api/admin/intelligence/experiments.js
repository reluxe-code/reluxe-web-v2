// src/pages/api/admin/intelligence/experiments.js
// Dashboard API for experiment analytics — aggregates sessions + events.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'
import { maskPhone, maskEmail, nameInitial } from '@/lib/piiHash'

async function handler(req, res) {
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

    // 6. Funnel — get event counts + per-session stats
    const sessionIds = sessions.map(s => s.session_id)
    let eventCounts = {}
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

    // Build funnel based on experiment type
    const isReveal = expId === 'reveal_v1'
    const funnel = isReveal
      ? {
          pageView: eventCounts.reveal_page_view || 0,
          filterSubmit: eventCounts.reveal_filter_submit || 0,
          boardLoaded: eventCounts.reveal_board_loaded || 0,
          tileTap: eventCounts.reveal_tile_tap || 0,
          bookingStart: eventCounts.reveal_booking_start || 0,
          bookingComplete: eventCounts.reveal_booking_complete || 0,
        }
      : {
          view: eventCounts.experiment_view || 0,
          start: eventCounts.experiment_start || 0,
          swipes: eventCounts.experiment_swipe || 0,
          results: eventCounts.experiment_results_view || 0,
          bookingStart: eventCounts.experiment_booking_start || 0,
          bookingComplete: eventCounts.experiment_booking_complete || 0,
        }

    const goals = isReveal
      ? {
          bookings: { current: booked.length, target: 30 },
          tileTaps: { current: eventCounts.reveal_tile_tap || 0, target: 100 },
          boardViews: { current: eventCounts.reveal_board_loaded || 0, target: 200 },
        }
      : {
          bookings: { current: booked.length, target: 60 },
          memberships: { current: membershipClicked, target: 15 },
          laserStarts: {
            current: booked.filter(s => s.booking_service === 'laserhair').length,
            target: 20,
          },
        }

    // Reveal-specific: slots taken, alternatives shown
    const revealExtras = isReveal
      ? {
          slotsTaken: eventCounts.reveal_slot_taken || 0,
          alternativeTaps: eventCounts.reveal_alternative_tap || 0,
          showMoreClicks: eventCounts.reveal_show_more || 0,
        }
      : null

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
      isReveal,
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
      funnel,
      goals,
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
      revealExtras,
    })
  } catch (err) {
    console.error('[admin/intelligence/experiments]', err.message, err.stack)
    res.status(500).json({ error: err.message || 'Unknown error' })
  }
}

export default withAdminAuth(handler)
