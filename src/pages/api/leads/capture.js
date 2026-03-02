// src/pages/api/leads/capture.js
// Dedicated lead capture endpoint for email & text signups.
// Stores lead in Supabase and syncs to Bird CRM.
import { getServiceClient } from '@/lib/supabase'
import { upsertBirdContact } from '@/lib/birdContacts'
import { fireCAPIEvent, buildUserData } from '@/lib/metaCAPI'
import { createRateLimiter, getClientIp, applyRateLimit } from '@/lib/rateLimit'
import { hashPhone, hashEmail, encryptPhone } from '@/lib/piiHash'
import { safeWarn, safeError } from '@/lib/logSanitizer'

const limiter = createRateLimiter('leads-capture', 10, 60_000) // 10/min per IP

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (applyRateLimit(req, res, limiter, getClientIp(req))) return

  const { email, phone, firstName, lastName, source, tags } = req.body

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required' })
  }

  // Basic validation
  if (email && !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' })
  }
  if (phone && phone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ error: 'Invalid phone number' })
  }

  const db = getServiceClient()
  const normalizedEmail = email?.toLowerCase().trim() || null
  const normalizedPhone = phone ? `+1${phone.replace(/\D/g, '').slice(-10)}` : null
  const leadSource = source || 'website'
  const leadTags = Array.isArray(tags) ? tags : tags ? [tags] : []

  try {
    // 1. Dedup by hash, then insert (raw PII columns dropped)
    const phoneHash = hashPhone(normalizedPhone)
    const emailHash = hashEmail(normalizedEmail)

    let existing = null
    if (phoneHash) {
      const { data } = await db.from('leads').select('id').eq('phone_hash_v1', phoneHash).limit(1)
      existing = data?.[0]
    }
    if (!existing && emailHash) {
      const { data } = await db.from('leads').select('id').eq('email_hash_v1', emailHash).limit(1)
      existing = data?.[0]
    }

    let lead = existing
    if (!existing) {
      const { data: newLead, error: leadErr } = await db
        .from('leads')
        .insert({
          phone_encrypted: encryptPhone(normalizedPhone),
          phone_hash_v1: phoneHash,
          email_hash_v1: emailHash,
          first_name: firstName || null,
          source: leadSource,
          tags: leadTags,
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (leadErr) {
        safeWarn('[leads/capture] Insert warning:', leadErr.message)
      }
      lead = newLead
    }

    // 2. Sync to Bird CRM (fire-and-forget)
    if (normalizedPhone || normalizedEmail) {
      upsertBirdContact({
        phone: normalizedPhone || undefined,
        email: normalizedEmail || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        source: 'leads_capture',
        leadId: lead?.id || undefined,
      }).catch((err) => safeError('[leads/capture] Bird sync error:', err.message))
    }

    // Fire-and-forget: Meta CAPI Lead event
    fireCAPIEvent({
      eventName: 'Lead',
      eventId: req.body.event_id || undefined,
      eventSourceUrl: req.headers.referer || 'https://reluxemedspa.com',
      actionSource: 'website',
      userData: buildUserData({
        email: normalizedEmail,
        phone: normalizedPhone,
        firstName,
        lastName,
        fbp: req.cookies?._fbp || req.body._fbp,
        fbc: req.cookies?._fbc || req.body._fbc,
        clientIp: getClientIp(req),
        userAgent: req.headers['user-agent'],
      }),
      customData: {
        content_name: `Lead: ${leadSource}`,
        content_category: leadTags.length ? leadTags.join(', ') : undefined,
      },
    })

    return res.status(200).json({
      ok: true,
      leadId: lead?.id || null,
    })
  } catch (err) {
    safeError('[leads/capture]', err.message)
    return res.status(500).json({ error: 'Internal error' })
  }
}
