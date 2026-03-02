// src/pages/api/admin/bird/sync-contacts.js
// Bulk-sync unsynced leads to Bird as contacts.
// POST — processes up to 100 unsynced leads per call.
import { getServiceClient } from '@/lib/supabase'
import { upsertBirdContact } from '@/lib/birdContacts'
import { withAdminAuth } from '@/lib/adminAuth'
import { decryptPhone } from '@/lib/piiHash'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()

  const { data: unsynced, error: qErr } = await db
    .from('leads')
    .select('id, first_name, phone_encrypted')
    .eq('synced_to_bird', false)
    .not('phone_encrypted', 'is', null)
    .order('created_at', { ascending: true })
    .limit(100)

  if (qErr) return res.status(500).json({ error: qErr.message })
  if (!unsynced?.length) return res.json({ ok: true, synced: 0, message: 'Nothing to sync' })

  let synced = 0
  const errors = []

  for (const lead of unsynced) {
    const phone = decryptPhone(lead.phone_encrypted)
    if (!phone) { errors.push({ lead_id: lead.id, error: 'decrypt_failed' }); continue }

    const result = await upsertBirdContact({
      phone,
      firstName: lead.first_name || undefined,
    })

    if (result.ok) {
      await db.from('leads')
        .update({
          bird_contact_id: result.contactId,
          synced_to_bird: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id)
      synced++
    } else {
      console.error(`[sync-contacts] Failed for lead ${lead.id}:`, result.error, result.detail)
      errors.push({ lead_id: lead.id, error: result.error, detail: result.detail })
    }
  }

  res.json({
    ok: true,
    synced,
    attempted: unsynced.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}

export default withAdminAuth(handler)
