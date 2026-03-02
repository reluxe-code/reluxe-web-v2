// src/pages/api/admin/intelligence/booking-detail.js
// Detail drawer API: fetches full session + events (online) or appointment + services (in-office).
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'
import { maskPhone, maskEmail } from '@/lib/piiHash'

function deriveSource(pagePath) {
  if (!pagePath) return 'Unknown'
  if (pagePath === '/today') return 'Today Widget'
  if (pagePath.includes('/reveal')) return 'Reveal Board'
  if (pagePath.startsWith('/services/')) return 'Service Page'
  if (pagePath.startsWith('/team/')) return 'Provider Page'
  if (pagePath.startsWith('/locations/')) return 'Location Page'
  if (pagePath === '/') return 'Homepage'
  if (pagePath.startsWith('/start')) return 'Start Flow'
  return 'Other'
}

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { session_id, appointment_id } = req.query

  if (!session_id && !appointment_id) {
    return res.status(400).json({ error: 'session_id or appointment_id required' })
  }

  const db = getServiceClient()

  try {
    if (session_id) {
      return await handleOnline(db, session_id, res)
    } else {
      return await handleInOffice(db, appointment_id, res)
    }
  } catch (err) {
    console.error('[intelligence/booking-detail]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

async function handleOnline(db, sessionId, res) {
  // Fetch session
  const { data: session, error: sErr } = await db
    .from('booking_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (sErr) throw sErr

  // Fetch all events
  const { data: events, error: eErr } = await db
    .from('booking_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (eErr) throw eErr

  // Build step journey from step_view events
  const stepViews = (events || []).filter(e => e.event_name === 'step_view')
  const journey = stepViews.map((e, i) => ({
    step: e.step,
    timestamp: e.created_at,
    time_on_step: e.time_on_step,
    step_index: e.step_index ?? i,
    metadata: e.metadata,
  }))

  // Find the longest step
  let longestStep = null
  let longestTime = 0
  for (const j of journey) {
    if (j.time_on_step && j.time_on_step > longestTime) {
      longestTime = j.time_on_step
      longestStep = j.step
    }
  }

  // Mask PII before sending to client
  const maskedSession = { ...session }
  maskedSession.contact_phone = maskPhone(session.contact_phone)
  maskedSession.contact_email = maskEmail(session.contact_email)

  return res.json({
    type: 'online',
    session: maskedSession,
    events: events || [],
    journey,
    source: deriveSource(session.page_path),
    longest_step: longestStep,
    longest_time_ms: longestTime,
  })
}

async function handleInOffice(db, appointmentId, res) {
  // Fetch appointment
  const { data: appointment, error: aErr } = await db
    .from('blvd_appointments')
    .select('*')
    .eq('id', appointmentId)
    .single()

  if (aErr) throw aErr

  // Fetch services
  const { data: services, error: sErr } = await db
    .from('blvd_appointment_services')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: true })

  if (sErr) throw sErr

  // Fetch client (limited fields — no raw phone/email)
  let client = null
  if (appointment.client_id) {
    const { data } = await db
      .from('blvd_clients')
      .select('id, boulevard_id, visit_count, total_spend, last_visit_at')
      .eq('id', appointment.client_id)
      .single()
    client = data
  }

  // Fetch provider info from staff table
  const providerIds = [...new Set((services || []).map(s => s.provider_staff_id).filter(Boolean))]
  let providers = []
  if (providerIds.length > 0) {
    const { data } = await db
      .from('staff')
      .select('id, name, slug, title, featured_image')
      .in('id', providerIds)
    providers = data || []
  }

  return res.json({
    type: 'in_office',
    appointment,
    services: services || [],
    client,
    providers,
    total_price: (services || []).reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0),
  })
}

export default withAdminAuth(handler)
