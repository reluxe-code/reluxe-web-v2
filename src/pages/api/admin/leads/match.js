// src/pages/api/admin/leads/match.js
// Auto-match leads to blvd_clients by phone/email.
// When a match is found, updates lead status to 'booked' or 'converted'.
// Loops through ALL unmatched leads (no artificial limit).
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()

  const results = { total_checked: 0, matched: 0, converted: 0, booked: 0 }
  const PAGE_SIZE = 500
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

        // Link first completed appointment
        const { data: firstAppt } = await db
          .from('blvd_appointments')
          .select('id')
          .eq('client_id', client.id)
          .in('status', ['completed', 'final'])
          .order('start_at', { ascending: true })
          .limit(1)

        if (firstAppt?.[0]) {
          updates.first_appointment_id = firstAppt[0].id
        }
        results.converted++
      } else {
        if (lead.status === 'new' || lead.status === 'contacted') {
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

    // Since matched leads change status and won't appear in next query,
    // only advance offset by unmatched count
    if (leads.length < PAGE_SIZE) { hasMore = false }
    else { offset += PAGE_SIZE }
  }

  return res.json({ ok: true, summary: results })
}
