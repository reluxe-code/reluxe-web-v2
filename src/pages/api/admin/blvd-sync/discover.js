// src/pages/api/admin/blvd-sync/discover.js
// Tests Admin API connection and discovers available queries via introspection.
import { adminQuery, ADMIN_URL } from '@/server/blvdAdmin'

export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const results = { url: ADMIN_URL, steps: [] }

  // Step 1: Basic connection test
  try {
    const data = await adminQuery(`query { business { id name } }`)
    results.business = data.business
    results.steps.push({ step: 'connection', ok: true })
  } catch (err) {
    results.steps.push({ step: 'connection', ok: false, error: err.message })
    return res.status(200).json({ connected: false, ...results })
  }

  // Step 2: Introspect available query fields
  try {
    const schema = await adminQuery(`
      query {
        __schema {
          queryType {
            fields { name description }
          }
          mutationType {
            fields { name }
          }
        }
      }
    `)
    results.queries = schema.__schema?.queryType?.fields || []
    results.mutations = schema.__schema?.mutationType?.fields?.map((f) => f.name) || []
    results.steps.push({ step: 'introspection', ok: true })
  } catch (err) {
    results.steps.push({ step: 'introspection', ok: false, error: err.message })
  }

  // Step 2b: Deep introspect appointments query to see all available arguments
  try {
    const schema = await adminQuery(`
      query {
        __type(name: "Query") {
          fields {
            name
            args {
              name
              description
              type {
                kind
                name
                ofType { kind name }
              }
              defaultValue
            }
          }
        }
      }
    `)
    const appointmentsField = schema.__type?.fields?.find((f) => f.name === 'appointments')
    if (appointmentsField) {
      results.appointmentsQueryArgs = appointmentsField.args || []
    }
    results.steps.push({ step: 'introspection_appointments_args', ok: true })
  } catch (err) {
    results.steps.push({ step: 'introspection_appointments_args', ok: false, error: err.message })
  }

  // Step 3: Check if appointments query exists and probe its shape
  if (results.queries?.some((q) => q.name === 'appointments')) {
    try {
      const probe = await adminQuery(`
        query {
          appointments(first: 1) {
            edges {
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `)
      results.appointmentProbe = {
        count: probe.appointments?.edges?.length || 0,
        hasNextPage: probe.appointments?.pageInfo?.hasNextPage,
      }
      results.steps.push({ step: 'appointments_probe', ok: true })
    } catch (err) {
      results.steps.push({ step: 'appointments_probe', ok: false, error: err.message })
    }
  }

  // Step 4: Check if clients query exists
  if (results.queries?.some((q) => q.name === 'clients')) {
    try {
      const probe = await adminQuery(`
        query {
          clients(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      `)
      results.clientProbe = { count: probe.clients?.edges?.length || 0 }
      results.steps.push({ step: 'clients_probe', ok: true })
    } catch (err) {
      results.steps.push({ step: 'clients_probe', ok: false, error: err.message })
    }
  }

  return res.json({ connected: true, ...results })
}
