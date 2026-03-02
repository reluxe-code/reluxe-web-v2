// src/pages/api/admin/tracking-tokens/sync-to-bird.js
// Writes reluxe_token custom attribute back to Bird contacts.
// POST — processes up to 100 unsynced tokens per call.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

const WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID
const ACCESS_KEY = process.env.BIRD_ACCESS_KEY

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  if (!WORKSPACE_ID || !ACCESS_KEY) {
    return res.status(500).json({ error: 'Bird env vars not configured' })
  }

  const db = getServiceClient()
  const { data: unsynced, error: qErr } = await db
    .from('tracking_tokens')
    .select('*')
    .eq('synced_to_bird', false)
    .not('bird_contact_id', 'is', null)
    .limit(100)

  if (qErr) return res.status(500).json({ error: qErr.message })
  if (!unsynced?.length) return res.json({ ok: true, synced: 0, message: 'Nothing to sync' })

  let synced = 0
  const errors = []

  for (const row of unsynced) {
    try {
      const birdRes = await fetch(
        `https://api.bird.com/workspaces/${WORKSPACE_ID}/contacts/${row.bird_contact_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `AccessKey ${ACCESS_KEY}`,
          },
          body: JSON.stringify({
            attributes: { reluxeToken: row.token },
          }),
        }
      )

      if (birdRes.ok) {
        await db.from('tracking_tokens')
          .update({ synced_to_bird: true, updated_at: new Date().toISOString() })
          .eq('id', row.id)
        synced++
      } else {
        const errText = await birdRes.text().catch(() => '')
        console.error(`[sync-to-bird] Failed for ${row.bird_contact_id}: ${birdRes.status}`, errText)
        errors.push({ bird_contact_id: row.bird_contact_id, status: birdRes.status })
      }
    } catch (err) {
      console.error(`[sync-to-bird] Error for ${row.bird_contact_id}:`, err.message)
      errors.push({ bird_contact_id: row.bird_contact_id, error: err.message })
    }
  }

  res.json({ ok: true, synced, attempted: unsynced.length, errors: errors.length > 0 ? errors : undefined })
}

export default withAdminAuth(handler)
