import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing SUPABASE env vars'); process.exit(1) }
const db = createClient(url, key)

function parseCSVLine(line) {
  const fields = []
  let current = '', inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; continue }
    current += ch
  }
  fields.push(current.trim())
  return fields
}

function parseDate(str) {
  if (!str) return null
  const parts = str.trim().split('/')
  if (parts.length !== 3) return null
  const [m, d, y] = parts
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

function deriveLocationKey(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('westfield')) return 'westfield'
  if (n.includes('carmel')) return 'carmel'
  return null
}

function deriveBrand(productName) {
  const n = (productName || '').toLowerCase()
  if (n.includes('botox')) return 'Botox'
  if (n.includes('dysport')) return 'Dysport'
  if (n.includes('jeuveau')) return 'Jeuveau'
  if (n.includes('daxxify')) return 'Daxxify'
  if (n.includes('xeomin')) return 'Xeomin'
  return null
}

const files = [
  'sql/API - Tox Units - DO NOT REMOVE.csv',
  'sql/API - Tox Units - DO NOT REMOVE (1).csv',
  'sql/API - Tox Units - DO NOT REMOVE (2).csv',
]

let totalImported = 0, totalSkipped = 0

for (const file of files) {
  const csv = readFileSync(file, 'utf-8')
  const lines = csv.split('\n').filter(l => l.trim())
  const dataLines = lines.slice(1) // skip header
  const batch = []

  for (const line of dataLines) {
    const fields = parseCSVLine(line)
    if (fields.length < 9) { totalSkipped++; continue }
    const [productName, adjustmentId, locationName, , , adjustmentReason, quantityChange, costStr, dateStr] = fields
    if (adjustmentId === 'All' || !adjustmentId) { totalSkipped++; continue }
    if (adjustmentReason !== 'service_usage') { totalSkipped++; continue }
    const brand = deriveBrand(productName)
    if (!brand) { totalSkipped++; continue }
    const serviceDate = parseDate(dateStr)
    if (!serviceDate) { totalSkipped++; continue }
    const units = Math.abs(parseFloat(quantityChange) || 0)
    const cost = Math.abs(parseFloat(costStr) || 0)
    if (units === 0) { totalSkipped++; continue }

    batch.push({
      boulevard_id: adjustmentId,
      product_name: productName,
      brand,
      location_key: deriveLocationKey(locationName),
      units,
      cost_cents: Math.round(cost * 100),
      service_date: serviceDate,
    })
  }

  // Upsert in chunks
  for (let i = 0; i < batch.length; i += 200) {
    const chunk = batch.slice(i, i + 200)
    const { error } = await db.from('tox_unit_usage').upsert(chunk, { onConflict: 'boulevard_id' })
    if (error) { console.error(`Error in ${file} at offset ${i}:`, error.message); continue }
    totalImported += chunk.length
  }
  console.log(`${file}: ${batch.length} rows parsed`)
}

console.log(`Done. Imported: ${totalImported}, Skipped: ${totalSkipped}`)
