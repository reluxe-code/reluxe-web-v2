// src/pages/api/admin/blvd-sync/report-cleanup.js
// Clean up duplicate test exports, keep only the DAILY one.
import { adminQuery } from '@/server/blvdAdmin'

export const config = { maxDuration: 30 }

// Keep the DAILY export, delete the ONCE exports
const DELETE_IDS = [
  'urn:blvd:ReportExport:4fd5dae1-f879-46be-a762-e4e88ed6ca76', // original ONCE (no time)
  'urn:blvd:ReportExport:15144e8b-95e1-4192-81a5-f78a25d7157b', // ONCE with time
]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const results = []

  for (const id of DELETE_IDS) {
    try {
      await adminQuery(`
        mutation { deleteReportExport(input: { id: "${id}" }) { __typename } }
      `)
      results.push({ id, deleted: true })
    } catch (err) {
      results.push({ id, deleted: false, error: err.message })
    }
  }

  // List remaining
  const data = await adminQuery(`
    query {
      reportExports(first: 10) {
        edges { node { id fileUrl frequency utcExecutionTime report { name } } }
      }
    }
  `)

  return res.json({
    deleted: results,
    remaining: data.reportExports?.edges?.map((e) => e.node) || [],
  })
}
