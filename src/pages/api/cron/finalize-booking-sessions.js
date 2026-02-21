// src/pages/api/cron/finalize-booking-sessions.js
// Marks stale in_progress booking sessions as abandoned.
// Runs every 15 minutes via Vercel cron.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  // Verify cron secret or allow GET (Vercel cron uses GET with Authorization header)
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getServiceClient()
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 min ago

  const { data, error } = await db
    .from('booking_sessions')
    .update({
      outcome: 'abandoned',
      abandon_step: db.rpc ? undefined : undefined, // keep existing abandon_step
    })
    .eq('outcome', 'in_progress')
    .lt('last_activity', cutoff)
    .select('session_id, abandon_step, max_step')

  if (error) {
    console.error('[cron/finalize-booking-sessions]', error.message)
    return res.status(500).json({ error: error.message })
  }

  // For rows that don't have an abandon_step set, use max_step
  if (data?.length) {
    const needsStep = data.filter((r) => !r.abandon_step)
    for (const row of needsStep) {
      await db
        .from('booking_sessions')
        .update({ abandon_step: row.max_step || 'unknown' })
        .eq('session_id', row.session_id)
    }
  }

  console.log(`[cron/finalize-booking-sessions] Finalized ${data?.length || 0} stale sessions`)
  return res.json({ ok: true, finalized: data?.length || 0 })
}
