// src/pages/api/leads/ingest.js
// Public webhook endpoint for Zapier (or any source) to POST leads.
// Secured by x-api-key header. Supports single lead or batch { leads: [...] }.
//
// Zapier field mapping (from Facebook Lead Ads):
//   first_name  → FB First Name
//   last_name   → FB Last Name
//   email       → FB Email
//   phone       → FB Phone Number  (e.g. "+13177922891")
//   form_name   → FB Form Name     (e.g. "$380 Jeuveau New Patient")
//   campaign    → FB Ad Name       (e.g. "Q1 Jeuveau Pricing")
//   platform    → FB Platform      ("fb" or "ig")
//   created     → FB Created Time  (ISO timestamp)
import { getServiceClient } from '@/lib/supabase'

function normalizePhone(raw) {
  const digits = (raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits.length >= 10 ? `+${digits}` : null
}

function normalizeEmail(raw) {
  return (raw || '').trim().toLowerCase() || null
}

// Map Zapier "platform" field to our source values
function resolveSource(platform, fallback) {
  const p = (platform || '').toLowerCase()
  if (p === 'fb') return 'facebook'
  if (p === 'ig') return 'instagram'
  if (['facebook', 'instagram', 'google', 'tiktok'].includes(p)) return p
  // If no platform, check fallback (might be the old "source" field)
  const f = (fallback || '').toLowerCase()
  if (['facebook', 'instagram', 'google', 'tiktok', 'walk_in', 'website', 'referral'].includes(f)) return f
  return 'facebook'
}

function parseServiceInterest(text) {
  if (!text) return null
  const lower = text.toLowerCase()
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

  const apiKey = req.headers['x-api-key']
  if (!apiKey || apiKey !== process.env.LEADS_API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' })
  }

  const db = getServiceClient()
  const body = req.body
  const incoming = Array.isArray(body.leads) ? body.leads : [body]

  const created = []
  const skipped = []

  for (const lead of incoming) {
    const phone = normalizePhone(lead.phone)
    const email = normalizeEmail(lead.email)

    if (!phone && !email) {
      skipped.push({ reason: 'no_contact_info' })
      continue
    }

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

    if (existing) {
      skipped.push({ reason: 'duplicate', existing_id: existing.id })
      continue
    }

    // Zapier sends "source" as Form Name and "platform" as fb/ig.
    // Also accept form_name directly for clarity.
    const formName = lead.form_name || lead.source || null
    const source = resolveSource(lead.platform, lead.source)
    const campaign = lead.campaign || null

    // Parse service interest from form name first (more specific), then campaign
    const serviceInterest = lead.service_interest
      || parseServiceInterest(formName)
      || parseServiceInterest(campaign)

    const { data: newLead, error } = await db.from('leads').insert({
      first_name: (lead.first_name || '').trim() || null,
      last_name: (lead.last_name || '').trim() || null,
      email,
      phone,
      source,
      platform: lead.platform || null,
      campaign,
      ad_set: lead.ad_set || null,
      ad_name: formName,
      service_interest: serviceInterest,
      status: 'new',
      source_created_at: lead.created || lead.source_created_at || null,
      raw_payload: lead,
    }).select('id').single()

    if (error) {
      if (error.code === '23505') {
        skipped.push({ reason: 'duplicate', error: error.message })
      } else {
        skipped.push({ reason: 'insert_error', error: error.message })
      }
      continue
    }

    created.push(newLead.id)
  }

  return res.status(created.length > 0 ? 201 : 200).json({
    ok: true,
    created,
    skipped,
    total_processed: incoming.length,
  })
}
