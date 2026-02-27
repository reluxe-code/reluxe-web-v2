// src/pages/api/admin/tracking-tokens/generate.js
// Generate tracking tokens for Bird contacts. Accepts JSON array of contacts.
// POST { contacts: [{ phone, email, bird_contact_id }] }
import crypto from 'crypto'
import { getServiceClient } from '@/lib/supabase'

function generateToken() {
  return 'rlx_' + crypto.randomBytes(9).toString('base64url')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { contacts } = req.body
  if (!Array.isArray(contacts) || !contacts.length) {
    return res.status(400).json({ error: 'contacts array required' })
  }

  const db = getServiceClient()
  const results = []

  for (const c of contacts.slice(0, 500)) {
    // Check if token already exists for this phone or bird_contact_id
    let existing = null
    if (c.phone) {
      const { data } = await db.from('tracking_tokens').select('token').eq('phone', c.phone).maybeSingle()
      existing = data
    }
    if (!existing && c.bird_contact_id) {
      const { data } = await db.from('tracking_tokens').select('token').eq('bird_contact_id', c.bird_contact_id).maybeSingle()
      existing = data
    }
    if (existing) {
      results.push({ phone: c.phone, token: existing.token, existed: true })
      continue
    }

    const token = generateToken()
    const { error } = await db.from('tracking_tokens').insert({
      token,
      bird_contact_id: c.bird_contact_id || null,
      phone: c.phone || null,
      email: c.email || null,
    })

    if (error) {
      console.error('[tracking-tokens/generate]', error.message)
      results.push({ phone: c.phone, error: error.message })
      continue
    }
    results.push({ phone: c.phone, token, existed: false })
  }

  const created = results.filter(r => !r.existed && !r.error).length
  res.json({ ok: true, created, total: results.length, tokens: results })
}
