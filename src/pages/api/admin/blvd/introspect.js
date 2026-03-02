// src/pages/api/admin/blvd/introspect.js
// One-time diagnostic: discover all Boulevard Admin API mutations.
// Used to determine if tag mutations exist for audience sync.
import { adminQuery } from '@/server/blvdAdmin'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  try {
    // Full mutation introspection
    const data = await adminQuery(`{
      __schema {
        mutationType {
          fields {
            name
            description
            args { name type { name kind ofType { name } } }
          }
        }
      }
    }`)

    const mutations = data?.__schema?.mutationType?.fields || []
    const mutationNames = mutations.map((m) => m.name)

    // Look for tag-related mutations
    const tagMutations = mutations.filter((m) =>
      /tag|label|client.*update|update.*client/i.test(m.name)
    )

    // Look for client-write mutations
    const clientMutations = mutations.filter((m) =>
      /client/i.test(m.name)
    )

    return res.json({
      ok: true,
      totalMutations: mutationNames.length,
      allMutations: mutationNames.sort(),
      tagRelated: tagMutations.map((m) => ({
        name: m.name,
        description: m.description,
        args: m.args?.map((a) => a.name),
      })),
      clientRelated: clientMutations.map((m) => ({
        name: m.name,
        description: m.description,
        args: m.args?.map((a) => a.name),
      })),
    })
  } catch (err) {
    console.error('[blvd/introspect]', err.message)
    return res.status(500).json({ error: 'Introspection failed' })
  }
}

export default withAdminAuth(handler)
