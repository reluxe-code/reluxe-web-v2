#!/usr/bin/env node
// One-time script: Import product sales CSVs with client/provider linkage.
// Usage: node scripts/import-product-sales.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// Load .env.local
const envFile = fs.readFileSync(path.join(root, '.env.local'), 'utf-8')
const env = {}
for (const line of envFile.split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const db = createClient(supabaseUrl, supabaseKey)

// CSV files to import (oldest first)
const CSV_FILES = [
  'data/API Product Sales - 2023.csv',
  'data/[API] Product Sales -2024.csv',
  'data/[API] Product Sales -2025.csv',
  'data/[API] Product Sales 2026.csv',
]

function parseCSV(text) {
  const lines = text.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row = {}
    headers.forEach((h, idx) => { row[h] = values[idx] || '' })
    rows.push(row)
  }
  return rows
}

function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; continue }
      inQuotes = !inQuotes; continue
    }
    if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue }
    current += ch
  }
  values.push(current.trim())
  return values
}

function normalizeLocation(value) {
  const v = String(value || '').toLowerCase()
  if (v.includes('westfield')) return 'westfield'
  if (v.includes('carmel')) return 'carmel'
  return null
}

function normalizePersonKey(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function parseDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const cleaned = String(value).replace(/[$,%]/g, '').replace(/,/g, '').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : fallback
}

async function chunkedUpsert(table, rows, conflictKey, chunkSize = 200) {
  let upserted = 0
  for (let i = 0; i < rows.length; i += chunkSize) {
    const batch = rows.slice(i, i + chunkSize)
    const { error } = await db.from(table).upsert(batch, { onConflict: conflictKey })
    if (error) {
      console.error(`  Upsert error on ${table} chunk ${i}:`, error.message)
    } else {
      upserted += batch.length
    }
  }
  return upserted
}

async function main() {
  console.log('=== Product Sales Import ===\n')

  // 1. Read and parse all CSV files
  const allRows = []
  for (const file of CSV_FILES) {
    const filePath = path.join(root, file)
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP: ${file} (not found)`)
      continue
    }
    const text = fs.readFileSync(filePath, 'utf-8')
    const rows = parseCSV(text)
    console.log(`  ${file}: ${rows.length} rows`)
    allRows.push(...rows)
  }
  console.log(`\n  Total raw rows: ${allRows.length}`)

  // 2. Normalize rows (skip summary rows with "All" as Sale id)
  const normalized = []
  for (const raw of allRows) {
    const saleId = raw['Sale id'] || raw['sale_id'] || ''
    if (!saleId || saleId.toLowerCase() === 'all') continue

    const productName = raw['Product Name'] || raw['product_name'] || ''
    if (!productName || productName.toLowerCase() === 'all') continue

    const soldAt = parseDate(raw['Sale Date'] || raw['sale_date'])
    if (!soldAt) continue

    const netSales = toNumber(raw['Net Sales'] || raw['net_sales'], 0)
    const grossSales = toNumber(raw['Gross Sales'] || raw['gross_sales'], 0)
    const discountAmount = Math.abs(toNumber(raw['Discount Amount'] || raw['discount_amount'], 0))
    const quantity = Math.max(1, Math.round(grossSales > 0 && netSales > 0 ? grossSales / (netSales / Math.max(1, 1)) : 1))

    normalized.push({
      boulevard_sale_line_id: saleId,
      sold_at: soldAt,
      location_key: normalizeLocation(raw['Location Name'] || raw['location_name']),
      client_boulevard_id: raw['Client Id'] || raw['client_id'] || null,
      client_name: raw['Client Name'] || raw['client_name'] || null,
      staff_name: raw['Staff Name'] || raw['staff_name'] || null,
      product_name: productName,
      brand: null, // extract from product name if needed
      net_sales: netSales,
      gross_sales: grossSales,
      discount_amount: discountAmount,
      quantity: 1, // each row = 1 line item
      unit_price: netSales, // single item
      raw,
    })
  }
  console.log(`  Normalized: ${normalized.length} detail rows (skipped summary rows)\n`)

  // 3. Load staff for provider matching
  console.log('Loading staff...')
  const { data: staffRows } = await db.from('staff').select('id, boulevard_provider_id, name')
  // Match by full normalized name AND by first name (DB uses first names only)
  const staffByName = new Map(
    (staffRows || []).filter((s) => s.name).map((s) => [normalizePersonKey(s.name), s.id])
  )
  // Also index by first name for "Anna Coccaro" → "anna" matching
  const staffByFirstName = new Map(
    (staffRows || []).filter((s) => s.name).map((s) => [s.name.toLowerCase().trim(), s.id])
  )
  console.log(`  ${staffRows?.length || 0} staff loaded, ${staffByName.size} with names`)
  console.log(`  First-name keys: ${[...staffByFirstName.keys()].join(', ')}`)

  // 4. Load/create client mappings
  console.log('Loading clients...')
  const clientBlvdIds = [...new Set(normalized.map((r) => r.client_boulevard_id).filter(Boolean))]
  console.log(`  ${clientBlvdIds.length} unique client IDs in CSV`)

  const existingClientsByBlvd = new Map()
  for (let i = 0; i < clientBlvdIds.length; i += 200) {
    const batch = clientBlvdIds.slice(i, i + 200)
    const { data: clients } = await db.from('blvd_clients').select('id, boulevard_id').in('boulevard_id', batch)
    for (const c of clients || []) existingClientsByBlvd.set(c.boulevard_id, c.id)
  }
  console.log(`  ${existingClientsByBlvd.size} already in blvd_clients`)

  // Auto-create missing clients
  const missingClients = normalized
    .filter((r) => r.client_boulevard_id && !existingClientsByBlvd.has(r.client_boulevard_id))
    .map((r) => ({
      boulevard_id: r.client_boulevard_id,
      name: r.client_name || null,
      synced_at: new Date().toISOString(),
    }))
  const dedupMissing = Array.from(new Map(missingClients.map((c) => [c.boulevard_id, c])).values())
  if (dedupMissing.length > 0) {
    console.log(`  Creating ${dedupMissing.length} missing clients...`)
    await chunkedUpsert('blvd_clients', dedupMissing, 'boulevard_id')

    // Reload
    for (let i = 0; i < clientBlvdIds.length; i += 200) {
      const batch = clientBlvdIds.slice(i, i + 200)
      const { data: clients } = await db.from('blvd_clients').select('id, boulevard_id').in('boulevard_id', batch)
      for (const c of clients || []) existingClientsByBlvd.set(c.boulevard_id, c.id)
    }
    console.log(`  Now ${existingClientsByBlvd.size} clients mapped`)
  }

  // 5. Delete existing product sales (full refresh)
  console.log('\nDeleting existing product sales (full refresh)...')
  const { error: delErr } = await db.from('blvd_product_sales').delete().not('id', 'is', null)
  if (delErr) console.error('  Delete error:', delErr.message)
  else console.log('  Deleted.')

  // 6. Build and insert sales rows
  console.log('Building sales rows...')
  let withClient = 0
  let withProvider = 0

  const salesRows = normalized.map((r) => {
    const clientId = r.client_boulevard_id ? existingClientsByBlvd.get(r.client_boulevard_id) || null : null
    // Try full name match first, then first-name-only match
    const fullKey = r.staff_name ? normalizePersonKey(r.staff_name) : null
    const firstName = r.staff_name ? r.staff_name.split(/[\s(]/)[0].toLowerCase().trim() : null
    const providerStaffId = (fullKey && staffByName.get(fullKey)) ||
      (firstName && staffByFirstName.get(firstName)) || null

    if (clientId) withClient++
    if (providerStaffId) withProvider++

    return {
      boulevard_sale_line_id: r.boulevard_sale_line_id,
      order_id: null,
      order_number: null,
      sold_at: r.sold_at,
      location_key: r.location_key,
      location_id: null,
      client_id: clientId,
      client_boulevard_id: r.client_boulevard_id,
      provider_staff_id: providerStaffId,
      provider_boulevard_id: null,
      product_id: null,
      boulevard_product_id: null,
      sku: null,
      product_name: r.product_name,
      brand: r.brand,
      category: null,
      quantity: r.quantity,
      unit_price: r.unit_price,
      discount_amount: r.discount_amount,
      net_sales: r.net_sales,
      raw: r.raw,
      synced_at: new Date().toISOString(),
    }
  })

  // Dedup by sale line id
  const dedupSales = Array.from(new Map(salesRows.map((r) => [r.boulevard_sale_line_id, r])).values())

  console.log(`  ${dedupSales.length} rows to insert`)
  console.log(`  ${withClient} with client_id (${Math.round(withClient / dedupSales.length * 100)}%)`)
  console.log(`  ${withProvider} with provider_staff_id (${Math.round(withProvider / dedupSales.length * 100)}%)`)

  // 7. Insert
  console.log('\nInserting...')
  const upserted = await chunkedUpsert('blvd_product_sales', dedupSales, 'boulevard_sale_line_id')
  console.log(`  Upserted ${upserted} rows.`)

  // 8. Run auto-map to update SKU classifications
  console.log('\nRunning rie_auto_map_skus()...')
  const { data: mapResult, error: mapErr } = await db.rpc('rie_auto_map_skus')
  if (mapErr) console.error('  Auto-map error:', mapErr.message)
  else console.log(`  Auto-map result:`, mapResult)

  console.log('\n=== Done! ===')
  console.log('The RIE views (Core 4, Replenishment Radar, Sales DNA) should now have data.')
}

main().catch((err) => { console.error(err); process.exit(1) })
