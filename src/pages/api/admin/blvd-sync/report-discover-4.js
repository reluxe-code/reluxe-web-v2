// src/pages/api/admin/blvd-sync/report-discover-4.js
// Find the correct global ID for the tox report and create an export.
import { adminQuery } from '@/server/blvdAdmin'

export const config = { maxDuration: 60 }

const TOX_REPORT_UUID = '0bb8e07b-8405-4335-a8cc-b7b736ef7b7b'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const results = { steps: [] }

  // Step 1: List all reports (availableFilters is [String!]!, not an object)
  try {
    const data = await adminQuery(`
      query {
        reports(first: 50) {
          edges {
            node {
              id
              name
              templateId
              folder { name }
              availableFilters
            }
          }
        }
      }
    `)
    results.availableReports = data.reports?.edges?.map((e) => e.node) || []
    results.steps.push({ step: 'list_reports', ok: true })
  } catch (err) {
    results.steps.push({ step: 'list_reports', ok: false, error: err.message })
  }

  // Step 2: Find the tox report - try matching by UUID in the global ID
  const toxReport = results.availableReports?.find((r) =>
    r.id?.includes(TOX_REPORT_UUID) ||
    r.name?.toLowerCase().includes('tox') ||
    r.name?.toLowerCase().includes('inventory')
  )
  results.toxReport = toxReport || null

  // Step 3: Try different global ID formats
  const idCandidates = [
    toxReport?.id, // use the actual global ID from the reports list
    `urn:blvd:Report:${TOX_REPORT_UUID}`,
    Buffer.from(`Report:${TOX_REPORT_UUID}`).toString('base64'),
    Buffer.from(`urn:blvd:Report:${TOX_REPORT_UUID}`).toString('base64'),
  ].filter(Boolean)

  results.idCandidates = idCandidates

  // Step 4: Try creating export with each ID candidate
  for (const reportId of idCandidates) {
    try {
      const data = await adminQuery(`
        mutation {
          createReportExport(input: {
            reportId: "${reportId}"
            frequency: ONCE
            fileContentType: JSON
          }) {
            reportExport {
              id
              fileUrl
              fileContentType
              frequency
              currentExportAt
              reportId
              report { id name templateId }
            }
          }
        }
      `)
      results.exportCreated = {
        ok: true,
        usedId: reportId,
        data: data.createReportExport?.reportExport,
      }
      results.steps.push({ step: 'create_export', ok: true, usedId: reportId })
      break
    } catch (err) {
      results.steps.push({
        step: 'create_export_attempt',
        ok: false,
        triedId: reportId,
        error: err.message,
      })
    }
  }

  // Step 5: Get ReportFilterRelativeDateQueryInput shape
  try {
    const data = await adminQuery(`
      query {
        __type(name: "ReportFilterRelativeDateQueryInput") {
          name kind
          inputFields {
            name
            type { kind name ofType { kind name ofType { kind name } } }
          }
        }
      }
    `)
    results.dateFilterInput = data.__type
    results.steps.push({ step: 'date_filter_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'date_filter_type', ok: false, error: err.message })
  }

  // Step 6: If export created, try fetching the file immediately
  const fileUrl = results.exportCreated?.data?.fileUrl
  if (fileUrl) {
    try {
      const fileRes = await fetch(fileUrl)
      const contentType = fileRes.headers.get('content-type')
      const text = await fileRes.text()
      results.fileContent = {
        status: fileRes.status,
        contentType,
        size: text.length,
        preview: text.slice(0, 3000),
      }
      results.steps.push({ step: 'fetch_file', ok: fileRes.ok })
    } catch (err) {
      results.steps.push({ step: 'fetch_file', ok: false, error: err.message })
    }
  }

  // Step 7: List all exports after creation
  try {
    const data = await adminQuery(`
      query {
        reportExports(first: 10) {
          edges {
            node {
              id fileUrl fileContentType frequency
              currentExportAt reportId
              report { id name templateId }
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
