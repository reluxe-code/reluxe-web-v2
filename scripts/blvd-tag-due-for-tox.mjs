// scripts/blvd-tag-due-for-tox.mjs
// Tags all clients with tox_segment='due' as "DUE_FOR_TOX" in Boulevard.
import fs from 'fs'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const envContent = fs.readFileSync('.env.local', 'utf8')
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
})

const BUSINESS_ID = process.env.BLVD_BUSINESS_ID
const API_KEY = process.env.BLVD_ADMIN_API_KEY
const API_SECRET = process.env.BLVD_ADMIN_API_SECRET
const ADMIN_URL = 'https://dashboard.boulevard.io/api/2020-01/admin'

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function buildAuthHeader() {
  const prefix = 'blvd-admin-v1'
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const tokenPayload = `${prefix}${BUSINESS_ID}${timestamp}`
  const rawKey = Buffer.from(API_SECRET, 'base64')
  const rawMac = crypto.createHmac('sha256', rawKey).update(tokenPayload, 'utf8').digest()
  const signature = rawMac.toString('base64')
  const token = `${signature}${tokenPayload}`
  const credentials = Buffer.from(`${API_KEY}:${token}`).toString('base64')
  return `Basic ${credentials}`
}

async function blvdQuery(query, variables = {}) {
  const res = await fetch(ADMIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: buildAuthHeader() },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(`GraphQL: ${json.errors.map(e => e.message).join('; ')}`)
  }
  return json.data
}

const TAG_NAME = 'DUE_FOR_TOX'

// 1. Create or find the tag
console.log(`Creating tag "${TAG_NAME}"...`)
let tagId
try {
  const createResult = await blvdQuery(`
    mutation CreateTag($input: CreateTagInput!) {
      createTag(input: $input) {
        tag { id name }
      }
    }
  `, { input: { name: TAG_NAME } })
  tagId = createResult?.createTag?.tag?.id
  console.log(`Created tag: ${tagId}`)
} catch (err) {
  // Tag may already exist — find it by checking a client that has tags
  console.log(`Tag creation failed (${err.message.slice(0, 80)}), searching for existing tag...`)

  // Paginate through clients looking for the tag
  let cursor = null
  for (let page = 0; page < 50 && !tagId; page++) {
    const afterClause = cursor ? `, after: "${cursor}"` : ''
    const r = await blvdQuery(`{
      clients(first: 100${afterClause}) {
        edges {
          node { tags { id name } }
          cursor
        }
        pageInfo { hasNextPage endCursor }
      }
    }`)
    for (const edge of r?.clients?.edges || []) {
      const match = (edge.node.tags || []).find(t => t.name === TAG_NAME)
      if (match) { tagId = match.id; break }
    }
    if (!r?.clients?.pageInfo?.hasNextPage) break
    cursor = r.clients.pageInfo.endCursor
  }

  if (!tagId) {
    console.error('Could not find or create tag. Aborting.')
    process.exit(1)
  }
  console.log(`Found existing tag: ${tagId}`)
}

// 2. Get clients due for tox
console.log('\nFetching clients due for tox...')
const { data: dueClients, error } = await db
  .from('client_tox_summary')
  .select('client_id, boulevard_id, days_since_last_tox, last_tox_type, tox_visits')
  .eq('tox_segment', 'due')

if (error) {
  console.error('Supabase error:', error.message)
  process.exit(1)
}

const clients = dueClients.filter(c => c.boulevard_id)
console.log(`Found ${dueClients.length} due clients (${clients.length} with boulevard_id)`)

// 3. Tag each client
let tagged = 0
let failed = 0
let alreadyTagged = 0

for (const c of clients) {
  try {
    await blvdQuery(`
      mutation AddTag($input: AddTagInput!) {
        addTag(input: $input) {
          tags { id name }
        }
      }
    `, {
      input: {
        entityId: c.boulevard_id,
        tagId: tagId,
      },
    })
    tagged++
    if (tagged % 25 === 0) console.log(`  ...tagged ${tagged}/${clients.length}`)
  } catch (err) {
    if (err.message.includes('already') || err.message.includes('duplicate')) {
      alreadyTagged++
    } else {
      failed++
      if (failed <= 3) console.error(`  Failed ${c.boulevard_id}: ${err.message}`)
    }
  }
}

console.log(`\n=== RESULTS ===`)
console.log(`Tagged:         ${tagged}`)
console.log(`Already tagged: ${alreadyTagged}`)
console.log(`Failed:         ${failed}`)
console.log(`\nDone! Filter by tag "${TAG_NAME}" in Boulevard's dashboard.`)
