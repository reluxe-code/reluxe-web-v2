// src/pages/api/admin/leads/match.js
// Auto-match leads to blvd_clients by phone/email.
// Phase 1: Match unmatched leads → booked, cancelled, or converted.
// Phase 2: Re-evaluate existing 'booked' leads for cancellations or conversions.
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 120 }

async function checkAppointmentStatus(db, clientId) {
  const { data: appts } = await db.from('blvd_appointments')
    .select('status')
    .eq('client_id', clientId)
    .limit(50)
  if (!appts || appts.length === 0) return 'no_appointments'
  const hasActive = appts.some(a => ['booked', 'confirmed', 'arrived', 'started'].includes(a.status))
  const hasCancelled = appts.some(a => ['cancelled', 'no_show'].includes(a.status))
  if (hasActive) return 'has_active'
  if (hasCancelled) return 'all_cancelled'
  return 'no_appointments'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()

  const results = { total_checked: 0, matched: 0, converted: 0, booked: 0, cancelled: 0, re_evaluated: 0 }
  const PAGE_SIZE = 500

  // ── Phase 1: Match unmatched leads ──
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data: leads, error: leadsErr } = await db
      .from('leads')
      .select('id, phone, email, status, created_at')
      .in('status', ['new', 'contacted', 'booked'])
      .is('blvd_client_id', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (leadsErr) return res.status(500).json({ error: leadsErr.message })
    if (!leads || leads.length === 0) { hasMore = false; break }

    results.total_checked += leads.length

    for (const lead of leads) {
      let client = null

      // Match by phone (last 10 digits)
      if (lead.phone) {
        const cleanPhone = lead.phone.replace(/\D/g, '').slice(-10)
        if (cleanPhone.length === 10) {
          const { data } = await db
            .from('blvd_clients')
            .select('id, visit_count, first_visit_at')
            .ilike('phone', `%${cleanPhone}`)
            .limit(1)
          client = data?.[0]
        }
      }

      // Fallback: match by email
      if (!client && lead.email) {
        const { data } = await db
          .from('blvd_clients')
          .select('id, visit_count, first_visit_at')
          .ilike('email', lead.email)
          .limit(1)
        client = data?.[0]
      }

      if (!client) continue

      let newStatus = lead.status
      const updates = { blvd_client_id: client.id, updated_at: new Date().toISOString() }

      if (client.visit_count > 0 && client.first_visit_at) {
        newStatus = 'converted'
        updates.status = 'converted'
        updates.converted_at = client.first_visit_at
        updates.days_to_convert = Math.max(0, Math.round(
          (new Date(client.first_visit_at) - new Date(lead.created_at)) / 86400000
        ))

        const { data: firstAppt } = await db
          .from('blvd_appointments')
          .select('id')
          .eq('client_id', client.id)
          .in('status', ['completed', 'final'])
          .order('start_at', { ascending: true })
          .limit(1)

        if (firstAppt?.[0]) updates.first_appointment_id = firstAppt[0].id
        results.converted++
      } else {
        // Check if all appointments are cancelled
        const apptStatus = await checkAppointmentStatus(db, client.id)
        if (apptStatus === 'all_cancelled') {
          newStatus = 'cancelled'
          updates.status = 'cancelled'
          results.cancelled++
        } else {
          newStatus = 'booked'
          updates.status = 'booked'
          results.booked++
        }
      }

      await db.from('leads').update(updates).eq('id', lead.id)

      await db.from('lead_events').insert({
        lead_id: lead.id,
        event_type: 'matched',
        old_value: lead.status,
        new_value: newStatus,
        metadata: {
          blvd_client_id: client.id,
          match_type: lead.phone ? 'phone' : 'email',
          visit_count: client.visit_count,
        },
      })

      results.matched++
    }

    if (leads.length < PAGE_SIZE) { hasMore = false }
    else { offset += PAGE_SIZE }
  }

  // ── Phase 2: Re-evaluate existing 'booked' leads for cancellations/conversions ──
  offset = 0
  hasMore = true

  while (hasMore) {
    const { data: bookedLeads, error: bErr } = await db
      .from('leads')
      .select('id, blvd_client_id, status, created_at')
      .eq('status', 'booked')
      .not('blvd_client_id', 'is', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (bErr) break
    if (!bookedLeads || bookedLeads.length === 0) { hasMore = false; break }

    for (const lead of bookedLeads) {
      // Re-check client for completed visits
      const { data: client } = await db.from('blvd_clients')
        .select('id, visit_count, first_visit_at')
        .eq('id', lead.blvd_client_id)
        .single()

      if (!client) continue

      if (client.visit_count > 0 && client.first_visit_at) {
        // Upgraded to converted
        const updates = {
          status: 'converted',
          converted_at: client.first_visit_at,
          days_to_convert: Math.max(0, Math.round(
            (new Date(client.first_visit_at) - new Date(lead.created_at)) / 86400000
          )),
          updated_at: new Date().toISOString(),
        }
        await db.from('leads').update(updates).eq('id', lead.id)
        await db.from('lead_events').insert({
          lead_id: lead.id, event_type: 'status_change',
          old_value: 'booked', new_value: 'converted',
          metadata: { reason: 're_evaluation', visit_count: client.visit_count },
        })
        results.converted++
        results.re_evaluated++
      } else {
        const apptStatus = await checkAppointmentStatus(db, client.id)
        if (apptStatus === 'all_cancelled') {
          await db.from('leads').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', lead.id)
          await db.from('lead_events').insert({
            lead_id: lead.id, event_type: 'status_change',
            old_value: 'booked', new_value: 'cancelled',
            metadata: { reason: 're_evaluation' },
          })
          results.cancelled++
          results.re_evaluated++
        }
      }
    }

    if (bookedLeads.length < PAGE_SIZE) { hasMore = false }
    else { offset += PAGE_SIZE }
  }

  return res.json({ ok: true, summary: results })
}
