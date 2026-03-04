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
  '',
  '## Membership Terms',
  '- Monthly recurring billing until canceled',
  '- Credits are non-transferable and have no cash value',
  '- Unused credits roll over as long as membership is active, or for 90 days after cancellation',
  '- Cancellation requires at least one full billing cycle notice',
  '- One pause (1-2 months) permitted per 12-month period, subject to approval',
  '- Discounts cannot be combined unless explicitly stated',
]

// ── 8. Location-Specific Service Availability ──
const locationAvailLines = [
  '## Westfield-Only Services (NOT available at Carmel)',
  '- CO2 Laser Resurfacing (co2) — Carmel alternative: Morpheus8',
  '- HydraFacial (hydrafacial) — Carmel alternative: Glo2Facial or Signature Facials',
  '- EvolveX Body Contouring (evolvex) — Carmel alternative: Morpheus8 Body',
  '- VascuPen (vascupen) — Carmel alternative: IPL Photofacial',
  '- ClearSkin (clearskin) — Carmel alternative: Facials or Chemical Peels',
  '- Salt Sauna (salt-sauna)',
  '- Massage (massage) — Carmel alternative: Facials',
  '- Skin IQ (skin-iq)',
  '',
  '## Available at Both Locations',
  '- Tox (Botox, Dysport, Jeuveau, Daxxify)',
  '- Dermal Fillers (Juvederm, Restylane, Versa, RHA)',
  '- Sculptra',
  '- Facial Balancing Consultation',
  '- SkinPen Microneedling',
  '- Morpheus8',
  '- Opus Plasma',
  '- IPL Photofacial',
  '- ClearLift',
  '- Glo2Facial',
  '- Signature Facials',
  '- Laser Hair Removal',
  '- Peels (BioRepeel, Micro Peel, Perfect Dermapeel)',
  '',
  'IMPORTANT: If a user wants a Westfield-only service at Carmel, tell them it is only at Westfield and suggest the Carmel alternative.',
]

// ── 9. Tox Comparison ──
const toxCompareLines = [
  '## Neuromodulator (Tox) Comparison',
  '',
  'Botox:',
  '- Onset: 3-7 days | Duration: 3-4 months | Spread: Standard',
  '- Pricing: $14/unit, $9/unit additional (new), $10/unit additional (returning), $10/unit member',
  '- Best for: Balanced control, gold standard',
  '',
  'Jeuveau:',
  '- Onset: 2-5 days | Duration: 3-4 months | Spread: Standard',
  '- Pricing: $12/unit, $9.50/unit member, $200 for first 20 units after $40 Evolus Rewards',
  '- Best for: Smooth aesthetic finish, great value',
  '',
  'Dysport:',
  '- Onset: 2-5 days | Duration: 3-4 months | Spread: Slightly broader',
  '- Pricing: $4.50/unit, $4.00/unit member, 50 units foundation for $225',
  '- Best for: Larger areas (forehead), natural look',
  '',
  'Daxxify:',
  '- Onset: 2-4 days | Duration: 4-6 months (varies) | Spread: Tight',
  '- Pricing: $7/unit, $5/unit member, 40 units foundation for $280',
  '- Best for: Longevity focus, fewer appointments per year',
  '',
  'NOTE: Dysport uses ~2.5x the units of Botox for the same area. Do NOT compare unit-for-unit pricing across brands. Guide users to the right brand based on their stated priorities (budget, longevity, speed of onset) but do NOT make a personalized medical recommendation.',
]

// ── 10. Financing & Gift Cards ──
const financeLines = [
  '## Payment Methods',
  '- All major credit cards, Apple Pay, CareCredit',
  '- SpaFinder gift cards accepted at both locations for any service',
  '- RELUXE gift cards (digital and physical, never expire)',
  '',
  '## Cherry Financing',
  '- Flexible monthly payment plans for treatments',
  '- No hard credit check (will not impact credit score)',
  '- Fast approval, even for first-time patients',
  '- Apply at: withcherry.com/patient/apply/?partner_id=reluxemedspa',
  '- Eligible for: Botox, fillers, facials, laser hair removal, Morpheus8, EvolveX, memberships, wedding/event prep',
  '',
  '## Package & Voucher Policy',
  '- Packages valid for 24 months from purchase date',
  '- Dollar-value gift cards valid for 5 years (federal law)',
  '- Packages lock in services at purchase price',
  '- Transfers require approval; some services must be used by original purchaser',
  '- Medical holds may be considered case-by-case with documentation',
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

=== LOCATION-SPECIFIC SERVICE AVAILABILITY ===
${locationAvailLines.join('\n')}

=== TOX BRAND COMPARISON ===
${toxCompareLines.join('\n')}

=== FINANCING & GIFT CARDS ===
${financeLines.join('\n')}

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
