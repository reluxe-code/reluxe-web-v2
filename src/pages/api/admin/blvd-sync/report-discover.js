// src/pages/api/admin/blvd-sync/report-discover.js
// Discovers report-export-related mutations/queries and tries running the tox usage report.
import { adminQuery } from '@/server/blvdAdmin'

export const config = { maxDuration: 60 }

const TOX_REPORT_ID = '0bb8e07b-8405-4335-a8cc-b7b736ef7b7b'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const results = { steps: [] }

  // Step 1: Find all report-related queries and mutations
  try {
    const schema = await adminQuery(`
      query {
        __schema {
          queryType {
            fields { name description }
          }
          mutationType {
            fields { name description }
          }
        }
      }
    `)
    const queries = schema.__schema?.queryType?.fields || []
    const mutations = schema.__schema?.mutationType?.fields || []

    results.reportQueries = queries.filter(
      (f) => /report/i.test(f.name) || /export/i.test(f.name)
    )
    results.reportMutations = mutations.filter(
      (f) => /report/i.test(f.name) || /export/i.test(f.name)
    )
    results.allMutations = mutations.map((f) => f.name)
    results.allQueries = queries.map((f) => f.name)
    results.steps.push({ step: 'schema_introspection', ok: true })
  } catch (err) {
    results.steps.push({ step: 'schema_introspection', ok: false, error: err.message })
    return res.json(results)
  }

  // Step 2: Introspect report-related types
  for (const typeName of [
    'ReportExport',
    'RunReportExportInput',
    'RunReportExportPayload',
    'ReportExportConnection',
    'ReportExportEdge',
    'ReportExportResult',
    'ReportExportRow',
  ]) {
    try {
      const typeInfo = await adminQuery(`
        query {
          __type(name: "${typeName}") {
            name
            kind
            fields {
              name
              type { kind name ofType { kind name ofType { kind name } } }
            }
            inputFields {
              name
              type { kind name ofType { kind name ofType { kind name } } }
            }
          }
        }
      `)
      if (typeInfo.__type) {
        results[`type_${typeName}`] = typeInfo.__type
      }
    } catch {
      // Type doesn't exist, skip
    }
  }
  results.steps.push({ step: 'type_introspection', ok: true })

  // Step 3: Introspect the specific mutation/query signatures for report export
  try {
    const mutationType = await adminQuery(`
      query {
        __type(name: "Mutation") {
          fields {
            name
            args {
              name
              type { kind name ofType { kind name ofType { kind name } } }
            }
            type { kind name ofType { kind name } }
          }
        }
      }
    `)
    const reportFields = mutationType.__type?.fields?.filter(
      (f) => /report/i.test(f.name) || /export/i.test(f.name)
    )
    if (reportFields?.length) {
      results.reportMutationDetails = reportFields
    }
    results.steps.push({ step: 'mutation_args_introspection', ok: true })
  } catch (err) {
    results.steps.push({ step: 'mutation_args_introspection', ok: false, error: err.message })
  }

  // Step 4: Try running the tox report export
  // Try common mutation patterns
  const mutationAttempts = [
    {
      name: 'runReportExport',
      query: `mutation { runReportExport(input: { reportId: "${TOX_REPORT_ID}" }) { reportExport { id status } } }`,
    },
    {
      name: 'exportReport',
      query: `mutation { exportReport(input: { reportId: "${TOX_REPORT_ID}" }) { reportExport { id status } } }`,
    },
    {
      name: 'createReportExport',
      query: `mutation { createReportExport(input: { reportId: "${TOX_REPORT_ID}" }) { reportExport { id status } } }`,
    },
  ]

  // Only try mutations that actually exist in the schema
  const existingMutations = new Set(results.allMutations || [])

  for (const attempt of mutationAttempts) {
    if (existingMutations.has(attempt.name)) {
      try {
        const data = await adminQuery(attempt.query)
        results.exportAttempt = { mutation: attempt.name, ok: true, data }
        results.steps.push({ step: `run_${attempt.name}`, ok: true })
        break
      } catch (err) {
        results.exportAttempt = { mutation: attempt.name, ok: false, error: err.message }
        results.steps.push({ step: `run_${attempt.name}`, ok: false, error: err.message })
      }
    }
  }

  // Step 5: If we got an export ID, try fetching its status and results
  const exportId = results.exportAttempt?.data?.runReportExport?.reportExport?.id
    || results.exportAttempt?.data?.exportReport?.reportExport?.id
    || results.exportAttempt?.data?.createReportExport?.reportExport?.id

  if (exportId) {
    // Try fetching the export status
    const queryAttempts = [
      `query { node(id: "${exportId}") { ... on ReportExport { id status results { edges { node { values } } } } } }`,
      `query { reportExport(id: "${exportId}") { id status results { edges { node { values } } } } }`,
    ]

    for (const q of queryAttempts) {
      try {
        const data = await adminQuery(q)
        results.exportStatus = { ok: true, data }
        results.steps.push({ step: 'fetch_export_status', ok: true })
        break
      } catch (err) {
        results.exportStatus = { ok: false, error: err.message }
      }
    }
  }

  return res.json(results)
}
