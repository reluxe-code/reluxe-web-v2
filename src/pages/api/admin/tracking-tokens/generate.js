// src/pages/api/admin/tracking-tokens/generate.js
// Generate tracking tokens for Bird contacts. Accepts JSON array of contacts.
// POST { contacts: [{ phone, email, bird_contact_id }] }
import crypto from 'crypto'
import { getServiceClient } from '@/lib/supabase'
import { hashPhone, hashEmail } from '@/lib/piiHash'
import { withAdminAuth } from '@/lib/adminAuth'

function generateToken() {
  return 'rlx_' + crypto.randomBytes(9).toString('base64url')
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { contacts } = req.body
  if (!Array.isArray(contacts) || !contacts.length) {
    return res.status(400).json({ error: 'contacts array required' })
  }

  const db = getServiceClient()
  const results = []

  for (const c of contacts.slice(0, 500)) {
    const phoneHash = c.phone ? hashPhone(c.phone) : null
    const emailHash = c.email ? hashEmail(c.email) : null

    // Check if token already exists for this phone hash or bird_contact_id
    let existing = null
    if (phoneHash) {
      const { data } = await db.from('tracking_tokens').select('token').eq('phone_hash_v1', phoneHash).maybeSingle()
      existing = data
    }
    if (!existing && c.bird_contact_id) {
      const { data } = await db.from('tracking_tokens').select('token').eq('bird_contact_id', c.bird_contact_id).maybeSingle()
      existing = data
    }
    if (existing) {
      results.push({ token: existing.token, existed: true })
      continue
    }

    const token = generateToken()
    const { error } = await db.from('tracking_tokens').insert({
      token,
      bird_contact_id: c.bird_contact_id || null,
      phone: c.phone || null,
      email: c.email || null,
      phone_hash_v1: phoneHash,
      email_hash_v1: emailHash,
    })

    if (error) {
      console.error('[tracking-tokens/generate]', error.message)
      results.push({ error: error.message })
      continue
    }
    results.push({ token, existed: false })
  }

  const created = results.filter(r => !r.existed && !r.error).length
  res.json({ ok: true, created, total: results.length, tokens: results })
}

export default withAdminAuth(handler)
