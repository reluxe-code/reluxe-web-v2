// src/pages/api/admin/tracking-tokens/import-csv.js
// Bulk-import Bird contacts from TSV export. Generates rlx_ tokens, skips duplicates.
// POST with raw TSV text in body (Content-Type: text/plain or application/json with { csv: "..." })
import crypto from 'crypto'
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

function generateToken() {
  return 'rlx_' + crypto.randomBytes(9).toString('base64url')
}

function parseTSV(raw) {
  const lines = raw.split('\n').filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split('\t').map(h => h.replace(/^"|"$/g, ''))
  const contactIdIdx = headers.indexOf('Contact ID')
  const emailIdx = headers.indexOf('Email')
  const phoneIdx = headers.indexOf('Phone')

  if (contactIdIdx === -1) throw new Error('Missing "Contact ID" column')

  const contacts = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    const bird_contact_id = cols[contactIdIdx]?.replace(/^"|"$/g, '')
    const email = cols[emailIdx]?.replace(/^"|"$/g, '')
    const phone = cols[phoneIdx]?.replace(/^"|"$/g, '')

    if (!bird_contact_id || bird_contact_id === '\\N') continue

    contacts.push({
      bird_contact_id,
      email: (email && email !== '\\N') ? email : null,
      phone: (phone && phone !== '\\N') ? phone : null,
    })
  }
  return contacts
}

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  try {
    const raw = typeof req.body === 'string' ? req.body : req.body?.csv
    if (!raw) return res.status(400).json({ error: 'Send TSV as plain text body or { csv: "..." }' })

    const contacts = parseTSV(raw)
    if (!contacts.length) return res.status(400).json({ error: 'No valid contacts found' })

    const db = getServiceClient()

    // Fetch existing tokens to skip duplicates
    const { data: existing } = await db
      .from('tracking_tokens')
      .select('bird_contact_id')
      .not('bird_contact_id', 'is', null)

    const existingSet = new Set((existing || []).map(r => r.bird_contact_id))

    const toInsert = contacts
      .filter(c => !existingSet.has(c.bird_contact_id))
      .map(c => ({
        token: generateToken(),
        bird_contact_id: c.bird_contact_id,
        phone: c.phone,
        email: c.email,
      }))

    // Batch insert in chunks of 500
    let inserted = 0
    const errors = []
    for (let i = 0; i < toInsert.length; i += 500) {
      const batch = toInsert.slice(i, i + 500)
      const { error } = await db.from('tracking_tokens').insert(batch)
      if (error) {
        errors.push({ batch: i, error: error.message })
      } else {
        inserted += batch.length
      }
    }

    res.json({
      ok: true,
      parsed: contacts.length,
      skipped_existing: contacts.length - toInsert.length,
      inserted,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('[tracking-tokens/import-csv]', err.message)
    res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
