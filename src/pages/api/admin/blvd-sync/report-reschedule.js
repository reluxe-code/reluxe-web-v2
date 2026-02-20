// src/pages/api/admin/blvd-sync/report-reschedule.js
// Delete old export, create new DAILY at 00:30 UTC (7:30 PM EST).
import { adminQuery } from '@/server/blvdAdmin'

export const config = { maxDuration: 30 }

const TOX_REPORT_ID = 'urn:blvd:Report:0bb8e07b-8405-4335-a8cc-b7b736ef7b7b'
const OLD_EXPORT_ID = 'urn:blvd:ReportExport:f4ef3b82-0f2b-4a45-8d70-824d10741899'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const results = {}

  // Step 1: Delete the old 22:10 UTC export
  try {
    await adminQuery(`
      mutation { deleteReportExport(input: { id: "${OLD_EXPORT_ID}" }) { __typename } }
    `)
    results.deleted = true
  } catch (err) {
    results.deleted = false
    results.deleteError = err.message
  }

  // Step 2: Create new DAILY export at 00:30 UTC (7:30 PM EST)
  try {
    const data = await adminQuery(`
      mutation {
        createReportExport(input: {
          reportId: "${TOX_REPORT_ID}"
          frequency: DAILY
          fileContentType: JSON
          utcExecutionTime: "00:30:00"
        }) {
          reportExport {
            id fileUrl fileContentType frequency
            currentExportAt reportId utcExecutionTime
            report { id name templateId }
          }
        }
      }
    `)
    results.newExport = data.createReportExport?.reportExport
  } catch (err) {
    results.createError = err.message
  }

  // Step 3: Confirm what's active
  try {
    const data = await adminQuery(`
      query {
        reportExports(first: 10) {
          edges { node { id frequency utcExecutionTime fileUrl report { name } } }
        }
      }
    `)
    results.activeExports = data.reportExports?.edges?.map((e) => e.node) || []
  } catch (err) {
    results.listError = err.message
  }

  return res.json(results)
}
