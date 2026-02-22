// src/pages/api/admin/blvd-sync/clients.js
// Full client sync — pages through ALL Boulevard clients and upserts to blvd_clients.
// POST — run manually or on a daily cron. Ensures every Boulevard client exists locally.
import { adminQuery } from '@/server/blvdAdmin'
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 120 }

const CLIENTS_QUERY = `
  query GetClients($first: Int!, $after: String) {
    clients(first: $first, after: $after) {
      edges {
        node {
          id
          firstName
          lastName
          name
          email
          mobilePhone
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()
  let totalFetched = 0
  let upserted = 0
  let errors = 0
  let pages = 0

  try {
    let cursor = null
    const maxPages = 100 // safety: 100 pages * 100 per page = 10,000 max

    for (let p = 0; p < maxPages; p++) {
      const data = await adminQuery(CLIENTS_QUERY, {
        first: 100,
        after: cursor,
      })

      const edges = data.clients?.edges || []
      const pageInfo = data.clients?.pageInfo || {}
      pages++

      for (const edge of edges) {
        const c = edge.node
        if (!c?.id) continue
        totalFetched++

        try {
          await db.from('blvd_clients').upsert({
            boulevard_id: c.id,
            first_name: c.firstName || null,
            last_name: c.lastName || null,
            name: c.name || [c.firstName, c.lastName].filter(Boolean).join(' ') || null,
            email: c.email || null,
            phone: c.mobilePhone || null,
            synced_at: new Date().toISOString(),
          }, { onConflict: 'boulevard_id' })
          upserted++
        } catch {
          errors++
        }
      }

      if (!pageInfo.hasNextPage) break
      cursor = pageInfo.endCursor

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300))
    }

    return res.json({
      ok: true,
      totalFetched,
      upserted,
      errors,
      pages,
    })
  } catch (err) {
    console.error('[blvd-sync/clients]', err.message)
    return res.status(500).json({
      error: err.message,
      totalFetched,
      upserted,
      errors,
      pages,
    })
  }
}
