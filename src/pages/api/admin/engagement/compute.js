// src/pages/api/admin/engagement/compute.js
// POST: trigger engagement score computation for all clients (or single client).
// GET: return current score distribution stats.
import { getServiceClient } from '@/lib/supabase'
import { computeAllScores } from '@/lib/engagement/computeScores'
import { withAdminAuth } from '@/lib/adminAuth'

export const config = { maxDuration: 300 } // 5 min for full recompute

async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    // Return score distribution and last compute time
    try {
      const { data: distribution } = await db
        .from('engagement_type_distribution')
        .select('*')

      const { data: lastCompute } = await db
        .from('client_engagement_scores')
        .select('computed_at')
        .order('computed_at', { ascending: false })
        .limit(1)
        .single()

      const { count } = await db
        .from('client_engagement_scores')
        .select('*', { count: 'exact', head: true })

      return res.json({
        ok: true,
        total_scored: count || 0,
        last_computed_at: lastCompute?.computed_at || null,
        distribution: distribution || [],
      })
    } catch (err) {
      console.error('[engagement/compute GET]', err)
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'POST') {
    const { client_id } = req.body || {}

    try {
      const startTime = Date.now()
      const result = await computeAllScores(db, { clientId: client_id || undefined })
      const duration = Date.now() - startTime

      // Log to audit events
      await db.from('site_audit_events').insert({
        event_type: 'engagement_compute',
        message: `Computed ${result.computed} scores (${result.errors} errors) in ${duration}ms`,
        metadata: {
          computed: result.computed,
          errors: result.errors,
          duration_ms: duration,
          single_client: client_id || null,
        },
      })

      return res.json({
        ok: true,
        computed: result.computed,
        errors: result.errors,
        duration_ms: duration,
      })
    } catch (err) {
      console.error('[engagement/compute POST]', err)
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'GET or POST only' })
}

export default withAdminAuth(handler)
