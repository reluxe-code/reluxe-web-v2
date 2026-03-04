// scripts/import-package-purchases.mjs
// Import Boulevard sales report CSVs into blvd_product_sales.
// Auto-detects format:
//
// 1. "Package Purchases" reports (has Product Category column):
//    Memberships     → skipped (already tracked via blvd_memberships)
//    Other Products  → imported as category 'product' (skincare/retail)
//    Everything else → imported as category 'package' (deferred revenue)
//
// 2. "Gift Cards" reports (Sale Type = gift_card, no Product Category):
//    All rows → imported as category 'gift_card' (deferred revenue)
//
// Usage: node scripts/import-package-purchases.mjs "sql/[API] Packages Purchases 2026 v2.csv"
//        node scripts/import-package-purchases.mjs "sql/[API] Gift Cards (Detailed Line Item) 2026.csv"

import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'

// Load env
const envContent = fs.readFileSync('.env.local', 'utf8')
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
})

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function classifyByCategory(blvdCategory) {
  const cat = (blvdCategory || '').toLowerCase().trim()
  if (cat === 'memberships') return 'membership'
  if (cat === 'other products') return 'product'
  // Everything else: Packages, promotional campaigns, uncategorized → package
  return 'package'
}

function normalizeLocation(value) {
  const v = String(value || '').toLowerCase()
  if (v.includes('westfield')) return 'westfield'
  if (v.includes('carmel')) return 'carmel'
  return null
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

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('Usage: node scripts/import-package-purchases.mjs <csv-file>')
    process.exit(1)
  }

  const csvText = fs.readFileSync(csvPath, 'utf8')
  const { data: rows } = Papa.parse(csvText, { header: true, skipEmptyLines: true })

  console.log(`Parsed ${rows.length} rows from CSV`)

  // Auto-detect format based on columns and Sale Type
  const hasProductCategory = rows.some(r => r['Product Category'])
  const isGiftCardReport = !hasProductCategory && rows.some(r => (r['Sale Type'] || '').toLowerCase() === 'gift_card')
  const isProductSalesReport = !hasProductCategory && !isGiftCardReport && rows.some(r => (r['Sale Type'] || '').toLowerCase() === 'product')

  if (isGiftCardReport) {
    console.log(`Detected: Gift Card report (Sale Type = gift_card)`)
  } else if (isProductSalesReport) {
    console.log(`Detected: Product Sales report (Sale Type = product)`)
  } else {
    console.log(`Detected: Package Purchases report (Product Category column)`)
  }

  // Load staff lookup for provider matching
  const { data: staffRows } = await db.from('staff').select('id, name')
  const staffByName = new Map(
    (staffRows || []).filter(s => s.name).map(s => [
      s.name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' '),
      s.id
    ])
  )

  // Load existing client boulevard IDs (only if column exists)
  const clientBlvdIds = [...new Set(rows.map(r => r['Client Id']).filter(Boolean))]
  const clientMap = new Map()
  if (clientBlvdIds.length) {
    for (let i = 0; i < clientBlvdIds.length; i += 200) {
      const chunk = clientBlvdIds.slice(i, i + 200)
      const { data: clients } = await db
        .from('blvd_clients')
        .select('id, boulevard_id')
        .in('boulevard_id', chunk)
      for (const c of clients || []) clientMap.set(c.boulevard_id, c.id)
    }
  }
  console.log(`Resolved ${clientMap.size} client IDs`)

  const stats = { membership: 0, product: 0, package: 0, gift_card: 0, imported: 0 }
  const categoryBreakdown = {}
  const upsertRows = []

  for (const row of rows) {
    const saleId = row['Sale id']
    if (!saleId || saleId === 'All') continue // skip summary row

    // Classify row
    let category
    if (isGiftCardReport) {
      category = 'gift_card'
    } else if (isProductSalesReport) {
      const productName = row['Product Name']
      if (!productName) continue
      category = 'product'
    } else {
      const productName = row['Product Name']
      if (!productName) continue

      const blvdCategory = row['Product Category'] || ''
      category = classifyByCategory(blvdCategory)

      // Track Boulevard's original categories for the report
      const catLabel = blvdCategory || '(empty)'
      categoryBreakdown[catLabel] = (categoryBreakdown[catLabel] || 0) + 1
    }

    stats[category] = (stats[category] || 0) + 1

    // Skip memberships (already tracked via blvd_memberships)
    if (category === 'membership') continue

    const soldAt = parseDate(row['Sale Date'])
    if (!soldAt) continue

    const netSales = toNumber(row['Net Sales'], 0)
    const grossSales = toNumber(row['Gross Sales'], 0)
    const discountAmount = toNumber(row['Discount Amount'], 0)
    const locationKey = normalizeLocation(row['Location Name'])
    const clientBoulevardId = row['Client Id'] || null
    const clientId = clientBoulevardId ? clientMap.get(clientBoulevardId) || null : null
    const staffName = row['Staff Name'] || null
    const staffKey = staffName ? staffName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ') : null
    const providerStaffId = staffKey ? staffByName.get(staffKey) || null : null

    upsertRows.push({
      boulevard_sale_line_id: saleId,
      order_id: saleId,
      sold_at: soldAt,
      location_key: locationKey,
      client_id: clientId,
      client_boulevard_id: clientBoulevardId,
      provider_staff_id: providerStaffId,
      product_name: row['Product Name'] || 'Gift Card',
      category,
      quantity: 1,
      unit_price: grossSales,
      discount_amount: Math.abs(discountAmount),
      net_sales: netSales,
      synced_at: new Date().toISOString(),
    })
  }

  if (!isGiftCardReport) {
    console.log(`\nBoulevard Product Categories:`)
    for (const [cat, count] of Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${cat}: ${count}`)
    }
  }

  console.log(`\nClassification:`)
  if (isGiftCardReport) {
    console.log(`  Gift cards:            ${stats.gift_card}`)
  } else if (isProductSalesReport) {
    console.log(`  Products (skincare):   ${stats.product}`)
  } else {
    console.log(`  Memberships (skipped): ${stats.membership}`)
    console.log(`  Products (skincare):   ${stats.product}`)
    console.log(`  Packages (deferred):   ${stats.package}`)
  }
  console.log(`  Total to import:       ${upsertRows.length}`)

  // Upsert in chunks
  for (let i = 0; i < upsertRows.length; i += 200) {
    const chunk = upsertRows.slice(i, i + 200)
    const { error } = await db.from('blvd_product_sales').upsert(chunk, { onConflict: 'boulevard_sale_line_id' })
    if (error) {
      console.error(`Upsert error at offset ${i}:`, error.message)
      process.exit(1)
    }
    stats.imported += chunk.length
  }

  console.log(`\nImported ${stats.imported} rows into blvd_product_sales`)

  // Verification: Feb 2026 Westfield
  const { data: febData } = await db
    .from('blvd_product_sales')
    .select('category, net_sales')
    .gte('sold_at', '2026-02-01')
    .lt('sold_at', '2026-03-01')
    .eq('location_key', 'westfield')

  let pkgTotal = 0, prodTotal = 0
  for (const r of febData || []) {
    if (r.category === 'package') pkgTotal += Number(r.net_sales || 0)
    else if (r.category === 'product') prodTotal += Number(r.net_sales || 0)
  }
  console.log(`\nFeb 2026 Westfield verification:`)
  console.log(`  Packages:  $${pkgTotal.toFixed(2)}  (Boulevard source: $21,875.75)`)
  console.log(`  Products:  $${prodTotal.toFixed(2)}`)
}

main().catch(err => { console.error(err); process.exit(1) })
