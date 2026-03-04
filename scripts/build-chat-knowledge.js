#!/usr/bin/env node
// scripts/build-chat-knowledge.js
// Compiles data files into a structured knowledge string for the chat system prompt.
// Run: node scripts/build-chat-knowledge.js
// Output: src/lib/chat/chatKnowledge.js

const fs = require('fs')
const path = require('path')

// We can't import ESM directly, so we read + transform the files manually.
// This approach is simpler than setting up ESM compilation for a build script.

function readAndEval(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  // Strip import/export statements for simple evaluation
  const cleaned = raw
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+(default\s+)?/gm, '')
    .replace(/^module\.exports\s*=\s*/gm, '')
  return cleaned
}

// ── 1. Pricing ──
const pricingRaw = fs.readFileSync(path.join(__dirname, '../src/data/Pricing.js'), 'utf-8')
// Extract data using a lightweight approach
const pricingLines = []
let currentCategory = ''
for (const line of pricingRaw.split('\n')) {
  const titleMatch = line.match(/title:\s*'([^']+)'/)
  if (titleMatch) {
    currentCategory = titleMatch[1]
    pricingLines.push(`\n## ${currentCategory}`)
    continue
  }
  const itemMatch = line.match(/name:\s*'([^']+)'.*price:\s*'([^']+)'/)
  if (itemMatch) {
    pricingLines.push(`- ${itemMatch[1]}: ${itemMatch[2]}`)
  }
}
// Packages
for (const line of pricingRaw.split('\n')) {
  const pkgName = line.match(/name:\s*'([^']+)'/)
  const pkgPrice = line.match(/price:\s*'([^']+)'/)
  const pkgDesc = line.match(/description:\s*'([^']+)'/)
  // We'll handle packages in the section below
}

// ── 2. FAQs ──
const faqRaw = fs.readFileSync(path.join(__dirname, '../src/data/faqs.js'), 'utf-8')
const faqLines = []
let faqCategory = ''
for (const line of faqRaw.split('\n')) {
  const catMatch = line.match(/^\s*'([^']+)':\s*\[/)
  if (catMatch) {
    faqCategory = catMatch[1]
    faqLines.push(`\n## ${faqCategory}`)
    continue
  }
  const qMatch = line.match(/q:\s*'([^']*)'/)
  if (qMatch) {
    faqLines.push(`Q: ${qMatch[1]}`)
    continue
  }
  const aMatch = line.match(/a:\s*'([^']*)'/)
  if (aMatch) {
    faqLines.push(`A: ${aMatch[1]}`)
  }
}

// ── 3. Locations ──
const locRaw = fs.readFileSync(path.join(__dirname, '../src/data/locations.js'), 'utf-8')
const locLines = []
const locBlocks = locRaw.split(/\{[\s\n]*key:/)
for (const block of locBlocks.slice(1)) {
  const get = (field) => {
    const m = block.match(new RegExp(`${field}:\\s*'([^']*)'`))
    return m ? m[1] : ''
  }
  const key = get('key') || block.match(/^\s*'([^']+)'/)?.[1] || ''
  locLines.push(`\n## ${get('city') || key} Location`)
  locLines.push(`- Key: ${key}`)
  locLines.push(`- Address: ${get('address')}`)
  locLines.push(`- Phone: ${get('phone')}`)
  locLines.push(`- Parking: ${get('parking')}`)
  // Hours need unicode handling
  const hoursMatch = block.match(/hoursNote:\s*'([^']*)'/)
  if (hoursMatch) {
    locLines.push(`- Hours: ${hoursMatch[1].replace(/\\u2013/g, '–').replace(/\\u00b7/g, '·')}`)
  }
}

// ── 4. Offers ──
const offersRaw = fs.readFileSync(path.join(__dirname, '../src/data/offers.js'), 'utf-8')
const offerLines = []
// Extract each offer slug and title
const offerBlocks = offersRaw.split(/\n\s*\{[\s\n]*slug:/)
for (const block of offerBlocks.slice(1)) {
  const get = (field) => {
    const m = block.match(new RegExp(`${field}:\\s*'([^']*)'`))
    return m ? m[1] : ''
  }
  const title = get('title')
  const overview = block.match(/overview:\s*\n?\s*'([^']*)'/)
  const displayPrice = block.match(/display:\s*'([^']*)'/)
  const locations = block.match(/locations:\s*\[([^\]]*)\]/)

  if (title) {
    offerLines.push(`\n- ${title}`)
    if (displayPrice) offerLines.push(`  Price: ${displayPrice[1]}`)
    if (locations) offerLines.push(`  Locations: ${locations[1].replace(/'/g, '')}`)
    if (overview) offerLines.push(`  ${overview[1].slice(0, 200)}`)
  }
}

// ── 5. Service Booking Map ──
const mapRaw = fs.readFileSync(path.join(__dirname, '../src/data/serviceBookingMap.js'), 'utf-8')
const mapLines = []
for (const line of mapRaw.split('\n')) {
  const serviceMatch = line.match(/^\s*'?([a-z0-9-]+)'?\s*:\s*\{.*name:\s*'([^']+)'/)
  if (serviceMatch) {
    const typeMatch = line.match(/type:\s*'([^']+)'/)
    const blvdMatch = line.match(/blvdId:\s*'([^']+)'/)
    const matchMatch = line.match(/match:\s*'([^']+)'/)
    const type = typeMatch?.[1] || 'unknown'
    const detail = type === 'service' ? `blvdId: ${blvdMatch?.[1] || '?'}` : `category match: "${matchMatch?.[1] || '?'}"`
    mapLines.push(`- ${serviceMatch[1]} → "${serviceMatch[2]}" (${type}, ${detail})`)
  }
}

// ── 6. Treatment Bundles ──
const bundlesRaw = fs.readFileSync(path.join(__dirname, '../src/data/treatmentBundles.js'), 'utf-8')
const bundleLines = []
const bundleBlocks = bundlesRaw.split(/\{[\s\n]*id:/)
for (const block of bundleBlocks.slice(1)) {
  const title = block.match(/title:\s*'([^']*)'/)
  const desc = block.match(/description:\s*'([^']*)'/)
  const items = [...block.matchAll(/label:\s*'([^']*)'/g)].map(m => m[1])
  if (title) {
    bundleLines.push(`- ${title[1]}: ${desc?.[1] || ''} (${items.join(', ')})`)
  }
}

// ── 7. Memberships (hardcoded since it's in a page component) ──
const membershipLines = [
  '## VIP $100/month Membership',
  '- 1 voucher per month, choose one: 60-min Massage, Signature Facial, 10 units Choice Tox, or Lip Flip',
  '- Benefits: 10% off single services, 10% off packages, 15% off products, member tox pricing, free monthly sauna, $50 off filler',
  '',
  '## VIP $200/month Membership',
  '- 1 voucher per month, choose one: Glo2Facial, HydraFacial, Facial+Massage, 120-min Massage, or 20 units Choice Tox',
  '- Same benefits as $100 plan plus higher-tier service vouchers',
  '',
  '- No long-term commitment, cancel anytime',
  '- Members get special tox pricing (lower per-unit rates)',
]

// ── Assemble ──
const knowledge = `
=== PRICING ===
${pricingLines.join('\n')}

=== CURRENT OFFERS ===
${offerLines.join('\n')}

=== MEMBERSHIPS ===
${membershipLines.join('\n')}

=== LOCATIONS ===
${locLines.join('\n')}

=== FAQS ===
${faqLines.join('\n')}

=== SERVICE BOOKING MAP ===
These map site service slugs to Boulevard booking system IDs. Use these when the user wants to book.
${mapLines.join('\n')}

=== TREATMENT BUNDLES ===
Curated treatment combinations by concern:
${bundleLines.join('\n')}
`.trim()

// Write output
const outputPath = path.join(__dirname, '../src/lib/chat/chatKnowledge.js')
const outputDir = path.dirname(outputPath)
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

const output = `// AUTO-GENERATED by scripts/build-chat-knowledge.js — do not edit manually.
// Re-run: node scripts/build-chat-knowledge.js
// Last built: ${new Date().toISOString()}

export const CHAT_KNOWLEDGE = ${JSON.stringify(knowledge)}
`

fs.writeFileSync(outputPath, output, 'utf-8')
console.log(`✓ Chat knowledge compiled (${knowledge.length} chars) → ${outputPath}`)
