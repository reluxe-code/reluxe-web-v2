// src/pages/api/admin/blvd-sync/report-discover-3.js
// Final discovery: list reports, create a one-time export, check its file URL.
import { adminQuery } from '@/server/blvdAdmin'

export const config = { maxDuration: 60 }

const TOX_REPORT_ID = '0bb8e07b-8405-4335-a8cc-b7b736ef7b7b'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const results = { steps: [] }

  // Step 1: List reports (without description field which doesn't exist)
  try {
    const data = await adminQuery(`
      query {
        reports(first: 50) {
          edges {
            node {
              id
              name
              templateId
              folder { id name }
              availableFilters { name type options { label value } }
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

  // Step 2: Check ReportFilter output type fields
  try {
    const data = await adminQuery(`
      query {
        __type(name: "ReportFilter") {
          name kind
          fields { name type { kind name ofType { kind name } } }
        }
      }
    `)
    results.reportFilterType = data.__type
    results.steps.push({ step: 'report_filter_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'report_filter_type', ok: false, error: err.message })
  }

  // Step 3: Check ReportFilterInput input type
  try {
    const data = await adminQuery(`
      query {
        __type(name: "ReportFilterInput") {
          name kind
          inputFields { name type { kind name ofType { kind name ofType { kind name } } } }
        }
      }
    `)
    results.reportFilterInputType = data.__type
    results.steps.push({ step: 'report_filter_input_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'report_filter_input_type', ok: false, error: err.message })
  }

  // Step 4: Check ReportAvailableFilter type
  try {
    const data = await adminQuery(`
      query {
        __type(name: "ReportAvailableFilter") {
          name kind
          fields { name type { kind name ofType { kind name ofType { kind name } } } }
        }
      }
    `)
    results.reportAvailableFilterType = data.__type
    results.steps.push({ step: 'report_available_filter_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'report_available_filter_type', ok: false, error: err.message })
  }

  // Step 5: Create a one-time JSON export of the tox report
  try {
    const data = await adminQuery(`
      mutation {
        createReportExport(input: {
          reportId: "${TOX_REPORT_ID}"
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
            utcExecutionTime
            report { id name templateId }
          }
        }
      }
    `)
    results.exportCreated = data.createReportExport?.reportExport || null
    results.steps.push({ step: 'create_once_export', ok: true })
  } catch (err) {
    results.steps.push({ step: 'create_once_export', ok: false, error: err.message })
  }

  // Step 6: If export was created, try fetching the file
  if (results.exportCreated?.fileUrl) {
    try {
      const fileRes = await fetch(results.exportCreated.fileUrl)
      const contentType = fileRes.headers.get('content-type')
      const text = await fileRes.text()
      results.fileContent = {
        status: fileRes.status,
        contentType,
        size: text.length,
        // Show first 2000 chars of the file
        preview: text.slice(0, 2000),
      }
      results.steps.push({ step: 'fetch_file', ok: fileRes.ok })
    } catch (err) {
      results.steps.push({ step: 'fetch_file', ok: false, error: err.message })
    }
  }

  // Step 7: List any existing exports now (including the one we just created)
  try {
    const data = await adminQuery(`
      query {
        reportExports(first: 10) {
          edges {
            node {
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
      }
    `)
    results.allExports = data.reportExports?.edges?.map((e) => e.node) || []
    results.steps.push({ step: 'list_all_exports', ok: true })
  } catch (err) {
    results.steps.push({ step: 'list_all_exports', ok: false, error: err.message })
  }

  return res.json(results)
}
