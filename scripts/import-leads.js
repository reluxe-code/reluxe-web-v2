// scripts/import-leads.js
// One-time script to import historical leads from CSV into Supabase.
// Run: node scripts/import-leads.js
const fs = require('fs')
const path = require('path')

// Parse .env.local manually
const envPath = path.resolve(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx < 0) continue
  const key = trimmed.slice(0, idx).trim()
  const val = trimmed.slice(idx + 1).trim()
  if (!process.env[key]) process.env[key] = val
}

const { createClient } = require('@supabase/supabase-js')

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function normalizePhone(raw) {
  const digits = (raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits.length >= 10 ? `+${digits}` : null
}

function normalizeEmail(raw) {
  return (raw || '').trim().toLowerCase() || null
}

function resolveSource(platform) {
  const p = (platform || '').toLowerCase()
  if (p === 'fb') return 'facebook'
  if (p === 'ig') return 'instagram'
  return 'facebook'
}

function parseServiceInterest(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  if (/\btox\b|botox|dysport|jeuveau|daxxify|xeomin|neurotoxin/.test(lower)) return 'tox'
  if (/filler|lip|cheek|jawline/.test(lower)) return 'filler'
  if (/facial|hydrafacial|peel/.test(lower)) return 'facial'
  if (/laser|ipl|bbl/.test(lower)) return 'laser'
  if (/body|coolsculpt|emsculpt/.test(lower)) return 'body'
  if (/hbot|hyperbaric/.test(lower)) return 'hbot'
  if (/member/.test(lower)) return 'membership'
  if (/skincare|skin\s?care|skinbetter/.test(lower)) return 'skincare'
  if (/weight|semaglutide|tirzepatide|glp/.test(lower)) return 'weight_loss'
  if (/iv\b|nad|drip/.test(lower)) return 'iv_therapy'
  return null
}

function parseDate(raw) {
  if (!raw) return null
  // Format: "1/4/2026 16:43:16" or "1/3/2026 0:00:00"
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const d = new Date(trimmed)
    if (isNaN(d.getTime())) return null
    return d.toISOString()
  } catch {
    return null
  }
}

// Simple CSV line parser (handles our data which has no quoted commas)
function parseLine(line) {
  return line.split(',').map(f => f.trim())
}

async function main() {
  const csv = fs.readFileSync('sql/allleads.csv', 'utf8')
  const lines = csv.split('\n').filter(l => l.trim())
  const rows = lines.slice(1) // skip header

  console.log(`Parsing ${rows.length} rows...`)

  // Parse all rows
  const leads = rows.map(line => {
    const [firstName, lastName, email, phone, source, campaign, platform, ...rest] = parseLine(line)
    const created = rest.join(',').trim() // rejoin in case date had commas
    return { firstName, lastName, email, phone, source, campaign, platform, created }
  })

  // Dedup by phone (keep earliest by Created date)
  const seenPhones = new Map() // normalized phone → index
  const seenEmails = new Map()
  const uniqueLeads = []
  let dupeCount = 0
  let noContactCount = 0

  for (const lead of leads) {
    const phone = normalizePhone(lead.phone)
    const email = normalizeEmail(lead.email)

    if (!phone && !email) { noContactCount++; continue }

    // Dedup by phone (primary key)
    if (phone && seenPhones.has(phone)) { dupeCount++; continue }
    // If no phone, dedup by email
    if (!phone && email && seenEmails.has(email)) { dupeCount++; continue }

    if (phone) seenPhones.set(phone, true)
    if (email) seenEmails.set(email, true)

    const formName = lead.source || null
    const resolvedSource = resolveSource(lead.platform)
    const serviceInterest = parseServiceInterest(formName) || parseServiceInterest(lead.campaign)

    uniqueLeads.push({
      first_name: lead.firstName || null,
      last_name: lead.lastName || null,
      email,
      phone,
      source: resolvedSource,
      platform: lead.platform || null,
      campaign: lead.campaign || null,
      ad_name: formName,
      service_interest: serviceInterest,
      status: 'new',
      source_created_at: parseDate(lead.created),
      raw_payload: { csv_import: true, original: lead },
    })
  }

  console.log(`Unique leads to insert: ${uniqueLeads.length}`)
  console.log(`Duplicates skipped: ${dupeCount}`)
  console.log(`No contact info: ${noContactCount}`)

  // Insert in batches of 100
  let inserted = 0
  let errors = 0
  const batchSize = 100

  for (let i = 0; i < uniqueLeads.length; i += batchSize) {
    const batch = uniqueLeads.slice(i, i + batchSize)
    const { data, error } = await db.from('leads').upsert(batch, {
      onConflict: 'phone,email',
      ignoreDuplicates: true,
    })

    if (error) {
      // Fall back to individual inserts
      for (const lead of batch) {
        const { error: singleErr } = await db.from('leads').insert(lead)
        if (singleErr) {
          if (singleErr.code === '23505') { /* dup, skip */ }
          else { errors++; console.error('Insert error:', singleErr.message) }
        } else {
          inserted++
        }
      }
    } else {
      inserted += batch.length
    }

    if ((i + batchSize) % 500 === 0 || i + batchSize >= uniqueLeads.length) {
      console.log(`Progress: ${Math.min(i + batchSize, uniqueLeads.length)}/${uniqueLeads.length} (${inserted} inserted, ${errors} errors)`)
    }
  }

  console.log(`\n=== Import Complete ===`)
  console.log(`Inserted: ${inserted}`)
  console.log(`Errors: ${errors}`)

  // Phase 2: Auto-match against blvd_clients
  console.log(`\nRunning auto-match against Boulevard clients...`)

  const { data: unmatchedLeads } = await db
    .from('leads')
    .select('id, phone, email, status, created_at')
    .in('status', ['new', 'contacted', 'booked'])
    .is('blvd_client_id', null)
    .order('created_at', { ascending: true })
    .limit(5000)

  let matched = 0, converted = 0, booked = 0

  for (const lead of (unmatchedLeads || [])) {
    let client = null

    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/\D/g, '').slice(-10)
      if (cleanPhone.length === 10) {
        const { data } = await db.from('blvd_clients')
          .select('id, visit_count, first_visit_at')
          .ilike('phone', `%${cleanPhone}`)
          .limit(1)
        client = data?.[0]
      }
    }

    if (!client && lead.email) {
      const { data } = await db.from('blvd_clients')
        .select('id, visit_count, first_visit_at')
        .ilike('email', lead.email)
        .limit(1)
      client = data?.[0]
    }

    if (!client) continue

    const updates = { blvd_client_id: client.id, updated_at: new Date().toISOString() }

    if (client.visit_count > 0 && client.first_visit_at) {
      updates.status = 'converted'
      updates.converted_at = client.first_visit_at
      updates.days_to_convert = Math.max(0, Math.round(
        (new Date(client.first_visit_at) - new Date(lead.created_at)) / 86400000
      ))
      converted++
    } else {
      updates.status = 'booked'
      booked++
    }

    await db.from('leads').update(updates).eq('id', lead.id)
    await db.from('lead_events').insert({
      lead_id: lead.id,
      event_type: 'matched',
      old_value: 'new',
      new_value: updates.status,
      metadata: { blvd_client_id: client.id, match_type: lead.phone ? 'phone' : 'email' },
    })
    matched++
  }

  console.log(`\n=== Matching Complete ===`)
  console.log(`Checked: ${(unmatchedLeads || []).length}`)
  console.log(`Matched: ${matched}`)
  console.log(`Converted (has visits): ${converted}`)
  console.log(`Booked (client exists, no visits): ${booked}`)
  console.log(`Unmatched: ${(unmatchedLeads || []).length - matched}`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
