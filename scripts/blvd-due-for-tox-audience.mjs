// scripts/blvd-due-for-tox-audience.mjs
// Creates a Boulevard manual audience "DUE_FOR_TOX" with all clients
// whose tox_segment = 'due' from client_tox_summary view.
import fs from 'fs'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Load env
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

// 1. Get all clients with tox_segment = 'due'
console.log('Fetching clients due for tox from client_tox_summary...')
const { data: dueClients, error } = await db
  .from('client_tox_summary')
  .select('client_id, boulevard_id, tox_visits, days_since_last_tox, last_tox_type')
  .eq('tox_segment', 'due')

if (error) {
  console.error('Supabase error:', error.message)
  process.exit(1)
}

console.log(`Found ${dueClients.length} clients due for tox`)

if (dueClients.length === 0) {
  console.log('No clients due — nothing to do.')
  process.exit(0)
}

// Show sample
dueClients.slice(0, 5).forEach(c => {
  console.log(`  ${c.boulevard_id} | ${c.days_since_last_tox}d since last | ${c.last_tox_type} | ${c.tox_visits} visits`)
})
if (dueClients.length > 5) console.log(`  ... and ${dueClients.length - 5} more`)

// 2. Get Boulevard IDs (the API needs Boulevard's internal client IDs)
const blvdIds = dueClients.map(c => c.boulevard_id).filter(Boolean)
console.log(`\n${blvdIds.length} have boulevard_id`)

if (blvdIds.length === 0) {
  console.error('No boulevard_ids found — cannot create audience.')
  process.exit(1)
}

// 3. Create the manual audience
console.log('\nCreating Boulevard audience "DUE_FOR_TOX"...')
const createResult = await blvdQuery(`
  mutation CreateAudience($input: CreateManualAudienceInput!) {
    createManualAudience(input: $input) {
      manualAudience {
        id
        name
      }
    }
  }
`, {
  input: {
    name: 'DUE_FOR_TOX',
    clientIds: blvdIds,
  },
})

const audience = createResult?.createManualAudience?.manualAudience
if (!audience) {
  console.error('Failed to create audience:', JSON.stringify(createResult))
  process.exit(1)
}

console.log(`\nCreated audience: ${audience.name} (ID: ${audience.id})`)
console.log(`Added ${blvdIds.length} clients`)
console.log('\nDone! You can now use this audience in Boulevard\'s marketing dashboard to send a blast.')
