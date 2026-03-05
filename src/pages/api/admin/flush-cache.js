// src/pages/api/admin/flush-cache.js
// Clears server-side in-memory cache + triggers Vercel on-demand revalidation.
import { withAdminAuth } from '@/lib/adminAuth'
import { clearCache } from '@/server/cache'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { paths } = req.body || {}

  // 1. Clear server-side in-memory cache (Boulevard API responses)
  const cleared = clearCache()

  // 2. Revalidate specific pages if requested
  let revalidated = []
  if (Array.isArray(paths) && paths.length > 0) {
    for (const path of paths.slice(0, 20)) {
      try {
        await res.revalidate(path)
        revalidated.push(path)
      } catch {
        // Page may not exist or ISR not enabled — skip
      }
    }
  }

  return res.json({
    ok: true,
    serverCacheCleared: cleared,
    pagesRevalidated: revalidated,
  })
}

export default withAdminAuth(handler)
