// src/pages/api/admin/blvd-sync/discover.js
// Tests Admin API connection and discovers available queries via introspection.
import { adminQuery, ADMIN_URL } from '@/server/blvdAdmin'
import { withAdminAuth } from '@/lib/adminAuth'

export const config = { maxDuration: 30 }

async function handler(req, res) {
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

  // Step 5: Check for package-related queries
  // Filter all queries whose name contains "package", "series", "cart", "purchase"
  const packageRelatedQueries = (results.queries || []).filter((q) =>
    /package|series|cart|purchase|gift|bundle/i.test(q.name)
  )
  results.packageRelatedQueries = packageRelatedQueries

  // Also list all query names for reference
  results.allQueryNames = (results.queries || []).map((q) => q.name).sort()

  // Probe memberships (known working) for comparison
  if (results.queries?.some((q) => q.name === 'memberships')) {
    try {
      const probe = await adminQuery(`
        query { memberships(first: 1) { edges { node { id } } } }
      `)
      results.membershipsProbe = { count: probe.memberships?.edges?.length || 0 }
      results.steps.push({ step: 'memberships_probe', ok: true })
    } catch (err) {
      results.steps.push({ step: 'memberships_probe', ok: false, error: err.message })
    }
  }

  // Probe packages query directly
  try {
    const probe = await adminQuery(`
      query { packages(first: 1) { edges { node { id } } } }
    `)
    results.packagesProbe = { count: probe.packages?.edges?.length || 0 }
    results.steps.push({ step: 'packages_probe', ok: true })
  } catch (err) {
    results.steps.push({ step: 'packages_probe', ok: false, error: err.message })
  }

  // If packages query failed, try alternative query names
  if (!results.steps.find((s) => s.step === 'packages_probe' && s.ok)) {
    for (const alt of packageRelatedQueries.map((q) => q.name)) {
      try {
        const probe = await adminQuery(`
          query { ${alt}(first: 1) { edges { node { id } } } }
        `)
        results[`${alt}Probe`] = { count: probe[alt]?.edges?.length || 0 }
        results.steps.push({ step: `${alt}_probe`, ok: true })
      } catch (err) {
        results.steps.push({ step: `${alt}_probe`, ok: false, error: err.message })
      }
    }
  }

  // Step 6: Deep introspect types to understand data model
  for (const typeName of ['Package', 'Membership', 'Client', 'Order', 'OrderLine', 'Voucher', 'PackageVoucher']) {
    try {
      const typeInfo = await adminQuery(`
        query { __type(name: "${typeName}") {
          name kind description
          fields { name description type { kind name ofType { kind name ofType { kind name } } } }
        } }
      `)
      results[`${typeName.toLowerCase()}Type`] = typeInfo.__type
      results.steps.push({ step: `introspect_${typeName}`, ok: true })
    } catch (err) {
      results.steps.push({ step: `introspect_${typeName}`, ok: false, error: err.message })
    }
  }

  // Step 7: Probe packages with all fields to see what we actually get
  try {
    const probe = await adminQuery(`
      query { packages(first: 2) {
        edges { node {
          id name description
        } }
      } }
    `)
    results.packagesSample = probe.packages?.edges?.map((e) => e.node) || []
    results.steps.push({ step: 'packages_sample', ok: true })
  } catch (err) {
    results.steps.push({ step: 'packages_sample', ok: false, error: err.message })
  }

  // Step 8: Probe orders to find purchased packages
  try {
    const probe = await adminQuery(`
      query { orders(first: 1) {
        edges { node {
          id clientId closedAt locationId
          lineGroups { lines { id packageVoucher { id } product { id name } service { id name } } }
        } }
      } }
    `)
    results.orderSample = probe.orders?.edges?.[0]?.node
    results.steps.push({ step: 'orders_probe', ok: true })
  } catch (err) {
    results.steps.push({ step: 'orders_probe', ok: false, error: err.message })
  }

  // Step 9: Try vouchers on a package template to understand voucher structure
  try {
    const probe = await adminQuery(`
      query { packages(first: 1) {
        edges { node {
          id name vouchers { quantity services { id name } }
        } }
      } }
    `)
    results.packageVoucherSample = probe.packages?.edges?.[0]?.node
    results.steps.push({ step: 'package_voucher_sample', ok: true })
  } catch (err) {
    results.steps.push({ step: 'package_voucher_sample', ok: false, error: err.message })
  }

  // Step 10: Introspect order-related types
  for (const typeName of ['OrderLineGroup', 'OrderSummary', 'AppliedVoucher']) {
    try {
      const typeInfo = await adminQuery(`
        query { __type(name: "${typeName}") {
          name kind
          fields { name type { kind name ofType { kind name ofType { kind name } } } }
        } }
      `)
      results[`${typeName.charAt(0).toLowerCase() + typeName.slice(1)}Type`] = typeInfo.__type
      results.steps.push({ step: `introspect_${typeName}`, ok: true })
    } catch (err) {
      results.steps.push({ step: `introspect_${typeName}`, ok: false, error: err.message })
    }
  }

  // Step 11: Check Client type fields
  try {
    const clientType = await adminQuery(`
      query { __type(name: "Client") {
        fields { name type { kind name ofType { kind name } } }
      } }
    `)
    const clientFields = (clientType.__type?.fields || []).map((f) => f.name).sort()
    results.clientAllFields = clientFields
    results.steps.push({ step: 'client_all_fields', ok: true })
  } catch (err) {
    results.steps.push({ step: 'client_all_fields', ok: false, error: err.message })
  }

  // Step 12: Probe orders with locationId to get actual order data
  try {
    const locationUrn = results.queries?.some((q) => q.name === 'locations') ?
      (await adminQuery(`query { locations { edges { node { id } } } }`))?.locations?.edges?.[0]?.node?.id : null
    if (locationUrn) {
      const orderProbe = await adminQuery(`
        query { orders(locationId: "${locationUrn}", first: 2) {
          edges { node {
            id clientId closedAt number
            lineGroups { name lines { id quantity currentPrice } }
            appliedVouchers { id }
          } }
          pageInfo { hasNextPage endCursor }
        } }
      `)
      results.orderWithLocationSample = orderProbe.orders?.edges?.map((e) => e.node) || []
      results.steps.push({ step: 'orders_with_location', ok: true })
    }
  } catch (err) {
    results.steps.push({ step: 'orders_with_location', ok: false, error: err.message })
  }

  return res.json({ connected: true, ...results })
}

export default withAdminAuth(handler)
