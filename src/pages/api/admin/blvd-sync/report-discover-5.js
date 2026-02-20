// src/pages/api/admin/blvd-sync/report-discover-5.js
// Try creating export with execution time, also check DurationInterval type.
import { adminQuery } from '@/server/blvdAdmin'

export const config = { maxDuration: 60 }

const TOX_REPORT_ID = 'urn:blvd:Report:0bb8e07b-8405-4335-a8cc-b7b736ef7b7b'
const EXISTING_EXPORT_ID = 'urn:blvd:ReportExport:4fd5dae1-f879-46be-a762-e4e88ed6ca76'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const results = { steps: [] }

  // Step 1: Check the DurationInterval scalar type
  try {
    const data = await adminQuery(`
      query {
        __type(name: "DurationInterval") { name kind description }
      }
    `)
    results.durationIntervalType = data.__type
    results.steps.push({ step: 'duration_interval_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'duration_interval_type', ok: false, error: err.message })
  }

  // Step 2: Check the Time scalar type
  try {
    const data = await adminQuery(`
      query {
        __type(name: "Time") { name kind description }
      }
    `)
    results.timeType = data.__type
    results.steps.push({ step: 'time_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'time_type', ok: false, error: err.message })
  }

  // Step 3: Delete the existing export first (since it has no execution time)
  try {
    const data = await adminQuery(`
      mutation {
        deleteReportExport(input: { id: "${EXISTING_EXPORT_ID}" }) {
          reportExport { id }
        }
      }
    `)
    results.deleted = data
    results.steps.push({ step: 'delete_old_export', ok: true })
  } catch (err) {
    results.steps.push({ step: 'delete_old_export', ok: false, error: err.message })
  }

  // Step 4: Create new export with utcExecutionTime set to ~1 min from now
  const now = new Date()
  // Round up to next minute
  now.setMinutes(now.getMinutes() + 1, 0, 0)
  const timeStr = now.toISOString().split('T')[1].split('.')[0] // "HH:MM:SS"

  try {
    const data = await adminQuery(`
      mutation {
        createReportExport(input: {
          reportId: "${TOX_REPORT_ID}"
          frequency: ONCE
          fileContentType: JSON
          utcExecutionTime: "${timeStr}"
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
    results.requestedTime = timeStr
    results.steps.push({ step: 'create_timed_export', ok: true })
  } catch (err) {
    results.steps.push({ step: 'create_timed_export', ok: false, error: err.message })
  }

  // Step 5: Also try with DAILY frequency to see if that triggers immediately
  try {
    const data = await adminQuery(`
      mutation {
        createReportExport(input: {
          reportId: "${TOX_REPORT_ID}"
          frequency: DAILY
          fileContentType: JSON
          utcExecutionTime: "${timeStr}"
        }) {
          reportExport {
            id fileUrl fileContentType frequency
            currentExportAt reportId utcExecutionTime
            report { id name templateId }
          }
        }
      }
    `)
    results.dailyExport = data.createReportExport?.reportExport
    results.steps.push({ step: 'create_daily_export', ok: true })
  } catch (err) {
    results.steps.push({ step: 'create_daily_export', ok: false, error: err.message })
  }

  // Step 6: List all exports
  try {
    const data = await adminQuery(`
      query {
        reportExports(first: 10) {
          edges {
            node {
              id fileUrl fileContentType frequency
              currentExportAt reportId utcExecutionTime
              report { id name }
            }
          }
        }
      }
    `)
    results.allExports = data.reportExports?.edges?.map((e) => e.node) || []
    results.steps.push({ step: 'list_exports', ok: true })
  } catch (err) {
    results.steps.push({ step: 'list_exports', ok: false, error: err.message })
  }

  return res.json(results)
}
