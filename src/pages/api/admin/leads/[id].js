// src/pages/api/admin/leads/[id].js
// Update lead status, notes, or manual blvd_client link.
import { getServiceClient } from '@/lib/supabase'

const VALID_STATUSES = ['new', 'contacted', 'booked', 'converted', 'lost']

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Lead ID required' })

  const db = getServiceClient()

  // ── GET: Full lead detail for drawer ──
  if (req.method === 'GET') {
    const { data: lead, error } = await db.from('leads').select('*').eq('id', id).single()
    if (error || !lead) return res.status(404).json({ error: 'Lead not found' })

    let client = null
    let appointments = []

    if (lead.blvd_client_id) {
      const { data: c } = await db.from('blvd_clients')
        .select('id, name, first_name, last_name, email, phone, visit_count, total_spend, first_visit_at, last_visit_at, tags')
        .eq('id', lead.blvd_client_id)
        .single()
      client = c

      if (client) {
        const { data: appts } = await db.from('blvd_appointments')
          .select('id, start_at, end_at, status, duration_minutes, created_at, notes')
          .eq('client_id', client.id)
          .order('start_at', { ascending: false })
          .limit(20)
        appointments = appts || []

        if (appointments.length > 0) {
          const apptIds = appointments.map(a => a.id)
          const { data: services } = await db.from('blvd_appointment_services')
            .select('appointment_id, service_name, service_category, price')
            .in('appointment_id', apptIds)
          const svcMap = {}
          for (const s of (services || [])) {
            if (!svcMap[s.appointment_id]) svcMap[s.appointment_id] = []
            svcMap[s.appointment_id].push(s)
          }
          appointments = appointments.map(a => ({ ...a, services: svcMap[a.id] || [] }))
        }
      }
    }

    const { data: events } = await db.from('lead_events')
      .select('*').eq('lead_id', id)
      .order('created_at', { ascending: false }).limit(20)

    return res.json({
      lead: { ...lead, name: [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Unknown' },
      client,
      appointments,
      events: events || [],
    })
  }

  // ── PATCH: Update lead ──
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'GET or PATCH only' })

  const { data: lead, error: fetchErr } = await db
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !lead) return res.status(404).json({ error: 'Lead not found' })

  const { status, notes, blvd_client_id } = req.body
  const updates = { updated_at: new Date().toISOString() }
  const events = []

  if (status && status !== lead.status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` })
    }
    updates.status = status
    events.push({ lead_id: id, event_type: 'status_change', old_value: lead.status, new_value: status })

    if (status === 'converted' && !lead.converted_at) {
      updates.converted_at = new Date().toISOString()
      updates.days_to_convert = Math.round((Date.now() - new Date(lead.created_at)) / 86400000)
    }
  }

  if (notes !== undefined) {
    updates.notes = notes
    events.push({ lead_id: id, event_type: 'note_added', new_value: notes })
  }

  if (blvd_client_id !== undefined) {
    updates.blvd_client_id = blvd_client_id || null
    events.push({ lead_id: id, event_type: 'manual_link', old_value: lead.blvd_client_id, new_value: blvd_client_id })
  }

  const { data: updated, error: updateErr } = await db
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (updateErr) return res.status(500).json({ error: updateErr.message })

  if (events.length > 0) {
    await db.from('lead_events').insert(events)
  }

  return res.json({ ok: true, lead: updated })
}
