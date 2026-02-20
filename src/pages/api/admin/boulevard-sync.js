// src/pages/api/admin/boulevard-sync.js
// Tests Admin API connection and manages staff Boulevard ID mappings.
import { adminQuery, ADMIN_URL } from '@/server/blvdAdmin'
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method === 'GET') return handleDiscover(req, res)
  if (req.method === 'POST') return handleSave(req, res)
  return res.status(405).json({ error: 'Method not allowed' })
}

async function handleDiscover(req, res) {
  try {
    // Step 1: Test connection with simplest possible query
    const data = await adminQuery(`
      query TestConnection {
        business {
          id
          name
        }
      }
    `)

    // Step 2: Try to discover what queries are available (introspection)
    let availableQueries = []
    try {
      const schema = await adminQuery(`
        query IntrospectQueries {
          __schema {
            queryType {
              fields {
                name
                description
              }
            }
          }
        }
      `)
      availableQueries = schema?.__schema?.queryType?.fields || []
    } catch (e) {
      // Introspection might be disabled — that's OK
      availableQueries = [{ name: '(introspection disabled)', description: e.message }]
    }

    // Step 3: Get Supabase staff for mapping
    const db = getServiceClient()
    const { data: supabaseStaff } = await db
      .from('staff')
      .select('id, name, boulevard_provider_id, boulevard_service_map')
      .order('name')

    return res.json({
      connected: true,
      adminUrl: ADMIN_URL,
      business: data.business,
      availableQueries,
      supabaseStaff: supabaseStaff || [],
    })
  } catch (err) {
    console.error('Boulevard discover error:', err)
    return res.status(500).json({
      connected: false,
      adminUrl: ADMIN_URL,
      error: err.message,
    })
  }
}

async function handleSave(req, res) {
  const { mappings } = req.body || {}
  if (!Array.isArray(mappings)) return res.status(400).json({ error: 'Invalid mappings' })

  const db = getServiceClient()
  const results = []

  for (const { staffId, boulevardProviderId, boulevardServiceMap } of mappings) {
    if (!staffId) continue
    const { error } = await db
      .from('staff')
      .update({
        boulevard_provider_id: boulevardProviderId || null,
        boulevard_service_map: boulevardServiceMap || {},
      })
      .eq('id', staffId)

    results.push({ staffId, ok: !error, error: error?.message })
  }

  return res.json({ ok: true, results })
}
