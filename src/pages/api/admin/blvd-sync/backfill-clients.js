// src/pages/api/admin/blvd-sync/backfill-clients.js
// One-time utility: recomputes lifecycle fields (visit_count, total_spend,
// first_visit_at, last_visit_at) for ALL clients from existing appointment data.
// No Boulevard API calls — works entirely from Supabase data.
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const db = getServiceClient()

  try {
    // Get all client IDs
    const { data: clients, error: fetchErr } = await db
      .from('blvd_clients')
      .select('id')
    if (fetchErr) throw fetchErr

    const clientIds = (clients || []).map((c) => c.id)
    if (clientIds.length === 0) {
      return res.json({ ok: true, updated: 0, message: 'No clients found' })
    }

    // Process in batches of 100
    let totalUpdated = 0
    for (let i = 0; i < clientIds.length; i += 100) {
      const batch = clientIds.slice(i, i + 100)
      const { data: result, error: rpcErr } = await db.rpc('compute_client_lifecycle', {
        client_ids: batch,
      })
      if (rpcErr) throw rpcErr
      totalUpdated += result?.length || 0
    }

    return res.json({
      ok: true,
      total_clients: clientIds.length,
      updated: totalUpdated,
    })
  } catch (err) {
    console.error('Backfill clients error:', err)
    return res.status(500).json({ error: err.message })
  }
}
