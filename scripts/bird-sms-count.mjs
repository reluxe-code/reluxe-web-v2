import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf8')
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
})

const WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID
const ACCESS_KEY = process.env.BIRD_ACCESS_KEY

async function fetchPage(pageToken) {
  const url = new URL(`https://api.bird.com/workspaces/${WORKSPACE_ID}/contacts`)
  url.searchParams.set('limit', '100')
  if (pageToken) url.searchParams.set('pageToken', pageToken)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `AccessKey ${ACCESS_KEY}`, 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Bird API ${res.status}: ${text}`)
  }
  return res.json()
}

let total = 0
let smsSubscribed = 0
let smsUnsubscribed = 0
let smsReachable = 0
let hasPhone = 0
let noPhone = 0
let pageToken = null
let page = 0

while (true) {
  page++
  const data = await fetchPage(pageToken)
  const contacts = data.results || []
  if (contacts.length === 0) break

  for (const c of contacts) {
    total++
    const attrs = c.attributes || {}
    const phones = attrs.phonenumber || []

    if (phones.length === 0) { noPhone++; continue }
    hasPhone++

    if (attrs.subscribedSms === true) smsSubscribed++
    else smsUnsubscribed++

    const reachable = attrs.reachableIdentifiersForSmsMarketing || []
    if (reachable.length > 0) smsReachable++
  }

  if (!data.nextPageToken || contacts.length < 100) break
  pageToken = data.nextPageToken

  if (page % 10 === 0) console.log(`  ...page ${page} (${total} contacts)`)
}

console.log(`\n=== BIRD SMS OPT-IN REPORT ===`)
console.log(`Total contacts:        ${total}`)
console.log(`With phone:            ${hasPhone}`)
console.log(`Without phone:         ${noPhone}`)
console.log(`subscribedSms=true:    ${smsSubscribed}`)
console.log(`subscribedSms=false:   ${smsUnsubscribed}`)
console.log(`SMS reachable:         ${smsReachable}`)
console.log(`Opt-in rate:           ${hasPhone > 0 ? ((smsSubscribed / hasPhone) * 100).toFixed(1) : 0}%`)
