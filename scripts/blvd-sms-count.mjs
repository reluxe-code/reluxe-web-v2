// scripts/blvd-sms-count.mjs
// One-time script: count Boulevard clients opted in for SMS marketing.
import fs from 'fs'
import crypto from 'crypto'

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

async function query(q) {
  const res = await fetch(ADMIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: buildAuthHeader() },
    body: JSON.stringify({ query: q }),
  })
  return res.json()
}

// Show sample client first
const sample = await query(`{
  clients(first: 3) {
    edges {
      node {
        name
        mobilePhone
        marketingSettings { email push sms type }
      }
    }
  }
}`)

if (sample.errors) {
  console.log('ERRORS:', JSON.stringify(sample.errors, null, 2))
  process.exit(1)
}

console.log('=== SAMPLE CLIENTS ===')
for (const e of sample.data.clients.edges) {
  const c = e.node
  console.log(`${c.name} | ${c.mobilePhone || 'no phone'}`)
  console.log(`  marketing: ${JSON.stringify(c.marketingSettings)}`)
}

// Paginate through all clients
let cursor = null
let smsOptIn = 0
let smsOptOut = 0
let noPhone = 0
let total = 0
let page = 0

while (true) {
  page++
  const afterClause = cursor ? `, after: "${cursor}"` : ''
  const r = await query(`{
    clients(first: 100${afterClause}) {
      edges {
        node {
          mobilePhone
          marketingSettings { sms type }
        }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }`)

  if (r.errors) {
    console.log('Pagination error:', JSON.stringify(r.errors))
    break
  }

  const edges = r?.data?.clients?.edges || []
  if (edges.length === 0) break

  for (const e of edges) {
    total++
    const c = e.node
    if (!c.mobilePhone) { noPhone++; continue }

    // marketingSettings is an array of { sms, type } objects
    // type might be 'MARKETING' or similar
    const hasSmsOn = (c.marketingSettings || []).some(s => s.sms === true)
    if (hasSmsOn) smsOptIn++
    else smsOptOut++
  }

  const pi = r?.data?.clients?.pageInfo
  if (!pi?.hasNextPage) break
  cursor = pi.endCursor

  if (page % 10 === 0) console.log(`  ...page ${page} (${total} clients so far)`)
}

const withPhone = smsOptIn + smsOptOut
console.log(`\n=== SMS MARKETING OPT-IN REPORT (Boulevard) ===`)
console.log(`Total clients:    ${total}`)
console.log(`With phone:       ${withPhone}`)
console.log(`Without phone:    ${noPhone}`)
console.log(`SMS opted IN:     ${smsOptIn}`)
console.log(`SMS opted OUT:    ${smsOptOut}`)
console.log(`Opt-in rate:      ${withPhone > 0 ? ((smsOptIn / withPhone) * 100).toFixed(1) : 0}%`)
