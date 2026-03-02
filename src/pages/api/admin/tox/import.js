// src/pages/api/admin/tox/import.js
// POST: Import tox unit usage data from Boulevard inventory adjustment CSV.
// Accepts { csv: "raw CSV text" }
// CSV format: QuantityAdjustment product_name, QuantityAdjustment id, Location Name,
//             Brand Name, Product Name, Adjustment Reason, Product Quantity Change,
//             Inventory Adjustment Cost, Created On
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

function parseDate(str) {
  if (!str) return null
  const parts = str.trim().split('/')
  if (parts.length !== 3) return null
  const [m, d, y] = parts
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  if (isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
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

function parseCSVLine(line) {
  // Simple CSV parser — handles basic comma-separated values
  const fields = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; continue }
    current += ch
  }
  fields.push(current.trim())
  return fields
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { csv } = req.body
  if (!csv || typeof csv !== 'string') {
    return res.status(400).json({ error: 'Provide csv field with raw CSV text' })
  }

  const db = getServiceClient()
  const lines = csv.split('\n').filter((l) => l.trim())

  if (lines.length < 2) {
    return res.status(400).json({ error: 'CSV must have a header row and at least one data row' })
  }

  // Skip header
  const dataLines = lines.slice(1)
  let imported = 0
  let skipped = 0
  const errors = []
  const batch = []

  for (const line of dataLines) {
    const fields = parseCSVLine(line)
    if (fields.length < 9) { skipped++; continue }

    const [productName, adjustmentId, locationName, , , adjustmentReason, quantityChange, costStr, dateStr] = fields

    // Skip summary rows
    if (adjustmentId === 'All' || !adjustmentId) { skipped++; continue }

    // Only process service_usage adjustments
    if (adjustmentReason !== 'service_usage') { skipped++; continue }

    const brand = deriveBrand(productName)
    if (!brand) { skipped++; continue }

    const serviceDate = parseDate(dateStr)
    if (!serviceDate) { skipped++; continue }

    const units = Math.abs(parseFloat(quantityChange) || 0)
    const cost = Math.abs(parseFloat(costStr) || 0)
    if (units === 0) { skipped++; continue }

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

  // Upsert in chunks of 200
  const CHUNK = 200
  for (let i = 0; i < batch.length; i += CHUNK) {
    const chunk = batch.slice(i, i + CHUNK)
    const { error } = await db
      .from('tox_unit_usage')
      .upsert(chunk, { onConflict: 'boulevard_id' })

    if (error) {
      errors.push({ offset: i, error: error.message })
    } else {
      imported += chunk.length
    }
  }

  return res.json({ ok: true, imported, skipped, errors: errors.length ? errors : undefined })
}

export default withAdminAuth(handler)
