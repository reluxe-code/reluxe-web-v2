// src/pages/api/admin/blvd-sync/report-discover-2.js
// Deep introspection of report export types + test run.
import { adminQuery } from '@/server/blvdAdmin'

export const config = { maxDuration: 60 }

const TOX_REPORT_ID = '0bb8e07b-8405-4335-a8cc-b7b736ef7b7b'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const results = { steps: [] }

  // Step 1: Get enum values for ReportExportFrequency and ReportExportContentType
  for (const enumName of ['ReportExportFrequency', 'ReportExportContentType']) {
    try {
      const data = await adminQuery(`
        query { __type(name: "${enumName}") { name enumValues { name description } } }
      `)
      results[enumName] = data.__type?.enumValues || []
      results.steps.push({ step: `enum_${enumName}`, ok: true })
    } catch (err) {
      results.steps.push({ step: `enum_${enumName}`, ok: false, error: err.message })
    }
  }

  // Step 2: Get full input type for createReportExport
  try {
    const data = await adminQuery(`
      query {
        __type(name: "CreateReportExportInput") {
          name
          inputFields {
            name
            type {
              kind name
              ofType { kind name ofType { kind name ofType { kind name } } }
            }
            defaultValue
          }
        }
      }
    `)
    results.createReportExportInput = data.__type?.inputFields || []
    results.steps.push({ step: 'input_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'input_type', ok: false, error: err.message })
  }

  // Step 3: Get the Report type fields
  try {
    const data = await adminQuery(`
      query {
        __type(name: "Report") {
          name
          fields {
            name
            type { kind name ofType { kind name ofType { kind name } } }
          }
        }
      }
    `)
    results.reportType = data.__type?.fields || []
    results.steps.push({ step: 'report_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'report_type', ok: false, error: err.message })
  }

  // Step 4: Get CreateReportExportPayload type
  try {
    const data = await adminQuery(`
      query {
        __type(name: "CreateReportExportPayload") {
          name
          fields {
            name
            type { kind name ofType { kind name ofType { kind name } } }
          }
        }
      }
    `)
    results.createReportExportPayload = data.__type?.fields || []
    results.steps.push({ step: 'payload_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'payload_type', ok: false, error: err.message })
  }

  // Step 5: List available reports to verify the tox report exists
  try {
    const data = await adminQuery(`
      query {
        reports(first: 50) {
          edges {
            node {
              id
              name
              description
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

  // Step 6: Check ReportExportFilter type
  try {
    const data = await adminQuery(`
      query {
        __type(name: "ReportExportFilterInput") {
          name
          inputFields {
            name
            type {
              kind name
              ofType { kind name ofType { kind name ofType { kind name } } }
            }
          }
        }
      }
    `)
    results.reportExportFilterInput = data.__type?.inputFields || []
    results.steps.push({ step: 'filter_type', ok: true })
  } catch (err) {
    results.steps.push({ step: 'filter_type', ok: false, error: err.message })
  }

  // Step 7: Try creating a one-time report export (using discovered frequency enum)
  const frequency = results.ReportExportFrequency?.[0]?.name
  if (frequency) {
    try {
      const data = await adminQuery(`
        mutation {
          createReportExport(input: {
            reportId: "${TOX_REPORT_ID}"
            frequency: ${frequency}
            fileContentType: CSV
          }) {
            reportExport {
              id
              fileUrl
              fileContentType
              frequency
              currentExportAt
              reportId
              utcExecutionTime
              reportFilters { name value }
            }
          }
        }
      `)
      results.exportResult = { ok: true, data }
      results.steps.push({ step: 'create_export', ok: true })
    } catch (err) {
      results.steps.push({ step: 'create_export', ok: false, error: err.message })
    }
  }

  // Step 8: Check if there are any existing report exports already
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
              utcExecutionTime
              report { id name }
            }
          }
        }
      }
    `)
    results.existingExports = data.reportExports?.edges?.map((e) => e.node) || []
    results.steps.push({ step: 'list_exports', ok: true })
  } catch (err) {
    results.steps.push({ step: 'list_exports', ok: false, error: err.message })
  }

  return res.json(results)
}
