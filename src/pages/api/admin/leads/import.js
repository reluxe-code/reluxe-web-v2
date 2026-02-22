// src/pages/api/admin/leads/import.js
// One-time bulk import of historical leads from Google Sheet export.
// POST { leads: [...] } — inserts + auto-matches against blvd_clients.
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 120 }

function normalizePhone(raw) {
  const digits = (raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits.length >= 10 ? `+${digits}` : null
}

function normalizeEmail(raw) {
  return (raw || '').trim().toLowerCase() || null
}

function parseServiceInterest(campaign) {
  if (!campaign) return null
  const lower = campaign.toLowerCase()
  if (/\btox\b|botox|dysport|jeuveau|daxxify|xeomin|neurotoxin/.test(lower)) return 'tox'
  if (/filler|lip|cheek|jawline/.test(lower)) return 'filler'
  if (/facial|hydrafacial|peel/.test(lower)) return 'facial'
  if (/laser|ipl|bbl/.test(lower)) return 'laser'
  if (/body|coolsculpt|emsculpt/.test(lower)) return 'body'
  if (/member/.test(lower)) return 'membership'
  if (/skincare|skin\s?care|skinbetter/.test(lower)) return 'skincare'
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { leads } = req.body
  if (!Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ error: 'Body must contain leads array' })
  }

  const db = getServiceClient()
  let inserted = 0
  let skipped = 0
  let matched = 0
  let converted = 0
  const errors = []

  // Phase 1: Insert leads
  for (const lead of leads) {
    const phone = normalizePhone(lead.phone)
    const email = normalizeEmail(lead.email)

    if (!phone && !email) { skipped++; continue }

    // Dedup check
    let existing = null
    if (phone) {
      const { data } = await db.from('leads').select('id').eq('phone', phone).limit(1)
      existing = data?.[0]
    }
    if (!existing && email) {
      const { data } = await db.from('leads').select('id').eq('email', email).limit(1)
      existing = data?.[0]
    }
    if (existing) { skipped++; continue }

    const serviceInterest = lead.service_interest || parseServiceInterest(lead.campaign)

    const { error } = await db.from('leads').insert({
      first_name: (lead.first_name || '').trim() || null,
      last_name: (lead.last_name || '').trim() || null,
      email,
      phone,
      source: (lead.source || 'facebook').toLowerCase(),
      platform: lead.platform || null,
      campaign: lead.campaign || null,
      ad_set: lead.ad_set || null,
      ad_name: lead.ad_name || null,
      service_interest: serviceInterest,
      status: 'new',
      source_created_at: lead.created || lead.source_created_at || null,
      created_at: lead.created || lead.source_created_at || new Date().toISOString(),
      raw_payload: lead,
    })

    if (error) {
      if (error.code === '23505') { skipped++ }
      else { errors.push(error.message) }
      continue
    }
    inserted++
  }

  // Phase 2: Auto-match all unmatched leads (loop through all)
  let unmatchedLeads = []
  let offset = 0
  const PAGE = 500
  while (true) {
    const { data: batch } = await db
      .from('leads')
      .select('id, phone, email, status, created_at')
      .in('status', ['new', 'contacted', 'booked'])
      .is('blvd_client_id', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE - 1)
    if (!batch || batch.length === 0) break
    unmatchedLeads = unmatchedLeads.concat(batch)
    if (batch.length < PAGE) break
    offset += PAGE
  }

  for (const lead of unmatchedLeads) {
    let client = null

    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/\D/g, '').slice(-10)
      if (cleanPhone.length === 10) {
        const { data } = await db.from('blvd_clients')
          .select('id, visit_count, first_visit_at')
          .ilike('phone', `%${cleanPhone}`)
          .limit(1)
        client = data?.[0]
      }
    }

    if (!client && lead.email) {
      const { data } = await db.from('blvd_clients')
        .select('id, visit_count, first_visit_at')
        .ilike('email', lead.email)
        .limit(1)
      client = data?.[0]
    }

    if (!client) continue

    const updates = { blvd_client_id: client.id, updated_at: new Date().toISOString() }

    if (client.visit_count > 0 && client.first_visit_at) {
      updates.status = 'converted'
      updates.converted_at = client.first_visit_at
      updates.days_to_convert = Math.max(0, Math.round(
        (new Date(client.first_visit_at) - new Date(lead.created_at)) / 86400000
      ))

      const { data: firstAppt } = await db.from('blvd_appointments')
        .select('id')
        .eq('client_id', client.id)
        .in('status', ['completed', 'final'])
        .order('start_at', { ascending: true })
        .limit(1)
      if (firstAppt?.[0]) updates.first_appointment_id = firstAppt[0].id

      converted++
    } else {
      updates.status = 'booked'
    }

    await db.from('leads').update(updates).eq('id', lead.id)
    await db.from('lead_events').insert({
      lead_id: lead.id,
      event_type: 'matched',
      old_value: lead.status,
      new_value: updates.status,
      metadata: { blvd_client_id: client.id, match_type: lead.phone ? 'phone' : 'email' },
    })
    matched++
  }

  return res.json({
    ok: true,
    inserted,
    skipped,
    matched,
    converted,
    errors: errors.length > 0 ? errors : undefined,
    total_submitted: leads.length,
  })
}
