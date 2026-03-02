// src/pages/api/admin/intelligence/client-jit.js
// JIT (Just-In-Time) client identity resolution via Boulevard API.
// Returns masked PII by default; full reveal requires ?reveal=true.
// Every access is audit-logged to admin_access_logs.
import { withAdminAuth } from '@/lib/adminAuth'
import { getServiceClient } from '@/lib/supabase'
import { createRateLimiter, getClientIp, applyRateLimit } from '@/lib/rateLimit'
import { resolveClient, resolveClientFull, resolveClientBatch } from '@/services/phiProxy'

const jitLimiter = createRateLimiter('client-jit', 20, 60_000)        // 20/min per admin
const revealLimiter = createRateLimiter('client-jit-reveal', 5, 60_000) // 5/min for full reveal

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  try {
    const ip = getClientIp(req)
    if (applyRateLimit(req, res, jitLimiter, ip)) return

    const { boulevard_id, boulevard_ids, reveal } = req.query
    const isReveal = reveal === 'true'
    const adminEmail = req.adminUser?.email || 'unknown'
    const adminId = req.adminUser?.id || null

    // Full reveal has a stricter rate limit
    if (isReveal && applyRateLimit(req, res, revealLimiter, ip)) return

    const db = getServiceClient()

    // Batch mode: resolve multiple clients
    if (boulevard_ids) {
      const ids = boulevard_ids.split(',').slice(0, 10)
      const results = await resolveClientBatch(ids, { masked: !isReveal })

      // Audit log (best-effort — table may not exist yet)
      db.from('admin_access_logs').insert(
        ids.map((bid) => ({
          admin_id: adminId,
          admin_email: adminEmail,
          boulevard_id: bid,
          action: 'VIEW_CLIENT',
          reveal_level: isReveal ? 'full' : 'masked',
          ip_address: ip,
          user_agent: (req.headers['user-agent'] || '').slice(0, 500),
        }))
      ).then(() => {}).catch(() => {})

      return res.json({ ok: true, clients: results })
    }

    // Single mode
    if (!boulevard_id) {
      return res.status(400).json({ error: 'boulevard_id or boulevard_ids required' })
    }

    const client = isReveal
      ? await resolveClientFull(boulevard_id)
      : await resolveClient(boulevard_id)

    // Audit log (best-effort)
    db.from('admin_access_logs').insert({
      admin_id: adminId,
      admin_email: adminEmail,
      boulevard_id,
      action: 'VIEW_CLIENT',
      reveal_level: isReveal ? 'full' : 'masked',
      ip_address: ip,
      user_agent: (req.headers['user-agent'] || '').slice(0, 500),
    }).then(() => {}).catch(() => {})

    if (!client) {
      return res.status(404).json({ error: 'Client not found in Boulevard' })
    }

    return res.json({ ok: true, client })
  } catch (err) {
    console.error('[client-jit] Unhandled error:', err.message, err.stack)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
