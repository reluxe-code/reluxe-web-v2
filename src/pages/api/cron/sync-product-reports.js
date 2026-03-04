// src/pages/api/cron/sync-product-reports.js
// Cron: daily sync of Boulevard reports into blvd_product_sales + tox_unit_usage.
// Report IDs configured via env vars:
//   BLVD_GIFT_CARD_REPORT_ID        — Gift Cards (Detailed Line Item)
//   BLVD_PACKAGE_REPORT_ID          — Package Purchases
//   BLVD_PRODUCT_SALES_REPORT_ID    — Skincare / Retail Product Sales
//   BLVD_TOX_REPORT_ID              — Inventory Adjustments (tox units)
import Papa from 'papaparse'
import { adminQuery } from '@/server/blvdAdmin'
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 120 }

// Product sales reports — all share the same CSV format (Sale id, Sale Date, etc.)
// Skincare syncs separately every 15 min via sync-skincare.js
const PRODUCT_REPORTS = [
  { envVar: 'BLVD_GIFT_CARD_REPORT_ID', label: 'Gift Cards', defaultCategory: 'gift_card' },
  { envVar: 'BLVD_PACKAGE_REPORT_ID', label: 'Package Purchases', defaultCategory: null },
]

const CREATE_EXPORT_MUTATION = `
  mutation CreateExport($reportId: ID!) {
    createReportExport(input: {
      reportId: $reportId
      frequency: ONCE
      fileContentType: CSV
    }) {
      reportExport { id fileUrl reportId currentExportAt }
    }
  }
`

const LIST_EXPORTS_QUERY = `
  query ListExports {
    reportExports(first: 25) {
      edges {
        node { id fileUrl reportId currentExportAt report { id name } }
      }
    }
  }
`

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function buildReportIdCandidates(rawId) {
  const input = String(rawId || '').trim()
  if (!input) return []
  const candidates = new Set([input])
  const uuidMatch = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)
  const uuid = uuidMatch ? uuidMatch[0] : null
  if (uuid) {
    const urn = `urn:blvd:Report:${uuid}`
    candidates.add(urn)
    candidates.add(Buffer.from(`Report:${uuid}`).toString('base64'))
    candidates.add(Buffer.from(urn).toString('base64'))
  }
  if (input.startsWith('urn:blvd:Report:')) {
    candidates.add(Buffer.from(input).toString('base64'))
  }
  return Array.from(candidates)
}

function matchesAnyReportId(actual, candidates) {
  if (!actual) return false
  const a = String(actual).trim()
  return candidates.some(c => {
    const s = String(c).trim()
    return a === s || a.includes(s) || s.includes(a)
  })
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

function classifyByCategory(blvdCategory) {
  const cat = (blvdCategory || '').toLowerCase().trim()
  if (cat === 'memberships') return 'membership'
  if (cat === 'other products') return 'product'
  return 'package'
}

function normalizeStaffKey(name) {
  return name ? name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ') : null
}

// ── Resolve + download a Boulevard report export ──

async function resolveExportFileUrl(reportId) {
  const candidates = buildReportIdCandidates(reportId)

  // Try to create a fresh export
  let createdExportId = null
  for (const candidate of candidates) {
    try {
      const data = await adminQuery(CREATE_EXPORT_MUTATION, { reportId: candidate })
      createdExportId = data?.createReportExport?.reportExport?.id || null
      break
    } catch (_) { /* try next candidate */ }
  }

  // Poll for the export file URL
  for (let attempt = 0; attempt < 8; attempt++) {
    const exportData = await adminQuery(LIST_EXPORTS_QUERY)
    const exports = (exportData.reportExports?.edges || []).map(e => e.node)
    const matching = exports
      .filter(exp => matchesAnyReportId(exp.reportId, candidates) || matchesAnyReportId(exp.report?.id, candidates))
      .sort((a, b) => new Date(b.currentExportAt || 0) - new Date(a.currentExportAt || 0))

    if (createdExportId) {
      const exact = matching.find(exp => exp.id === createdExportId)
      if (exact?.fileUrl) return exact.fileUrl
    }

    if (matching[0]?.fileUrl) return matching[0].fileUrl
    await sleep(2000)
  }

  throw new Error('No export file URL found after polling')
}

async function downloadCsv(fileUrl) {
  let res = await fetch(fileUrl)
  if (!res.ok) {
    // Some URLs need Boulevard auth
    const { getAdminAuthHeader } = await import('@/server/blvdAdmin')
    res = await fetch(fileUrl, { headers: { Authorization: getAdminAuthHeader() } })
  }
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const text = await res.text()
  if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
    throw new Error('Downloaded export returned HTML instead of CSV')
  }
  return Papa.parse(text, { header: true, skipEmptyLines: true }).data || []
}

// ── Tox inventory adjustments (different CSV format) ──

function parseToxDate(str) {
  if (!str) return null
  const parts = str.trim().split('/')
  if (parts.length !== 3) return null
  const [m, d, y] = parts
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  if (isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function deriveToxBrand(productName) {
  const n = (productName || '').toLowerCase()
  if (n.includes('botox')) return 'Botox'
  if (n.includes('dysport')) return 'Dysport'
  if (n.includes('jeuveau')) return 'Jeuveau'
  if (n.includes('daxxify')) return 'Daxxify'
  if (n.includes('xeomin')) return 'Xeomin'
  return null
}

async function syncToxReport(db, reportId) {
  const fileUrl = await resolveExportFileUrl(reportId)
  const rows = await downloadCsv(fileUrl)

  const stats = { total: rows.length, skipped: 0, imported: 0 }
  const batch = []

  for (const row of rows) {
    // Column names from Boulevard inventory adjustment report
    const adjustmentId = row['QuantityAdjustment id']
    if (!adjustmentId || adjustmentId === 'All') { stats.skipped++; continue }

    const adjustmentReason = row['Adjustment Reason']
    if (adjustmentReason !== 'service_usage') { stats.skipped++; continue }

    const productName = row['QuantityAdjustment product_name'] || row['Product Name'] || ''
    const brand = deriveToxBrand(productName)
    if (!brand) { stats.skipped++; continue }

    const serviceDate = parseToxDate(row['Created On'])
    if (!serviceDate) { stats.skipped++; continue }

    const units = Math.abs(parseFloat(row['Product Quantity Change']) || 0)
    if (units === 0) { stats.skipped++; continue }

    const cost = Math.abs(parseFloat(row['Inventory Adjustment Cost']) || 0)

    batch.push({
      boulevard_id: adjustmentId,
      product_name: productName,
      brand,
      location_key: normalizeLocation(row['Location Name']),
      units,
      cost_cents: Math.round(cost * 100),
      service_date: serviceDate,
    })
  }

  for (let i = 0; i < batch.length; i += 200) {
    const chunk = batch.slice(i, i + 200)
    const { error } = await db.from('tox_unit_usage').upsert(chunk, { onConflict: 'boulevard_id' })
    if (error) throw new Error(`Tox upsert error: ${error.message}`)
  }

  stats.imported = batch.length
  return stats
}

// ── Product sales reports ──

async function syncReport(db, reportId, label, defaultCategory, staffByName) {
  const fileUrl = await resolveExportFileUrl(reportId)
  const rows = await downloadCsv(fileUrl)

  const isGiftCardReport = defaultCategory === 'gift_card'
  const stats = { total: rows.length, skipped: 0, imported: 0 }
  const upsertRows = []

  for (const row of rows) {
    const saleId = row['Sale id']
    if (!saleId || saleId === 'All') { stats.skipped++; continue }

    let category
    if (isGiftCardReport) {
      category = 'gift_card'
    } else {
      const productName = row['Product Name']
      if (!productName) { stats.skipped++; continue }
      category = classifyByCategory(row['Product Category'] || '')
      if (category === 'membership') { stats.skipped++; continue }
    }

    const soldAt = parseDate(row['Sale Date'])
    if (!soldAt) { stats.skipped++; continue }

    const staffKey = normalizeStaffKey(row['Staff Name'])
    const providerStaffId = staffKey ? staffByName.get(staffKey) || null : null

    upsertRows.push({
      boulevard_sale_line_id: saleId,
      order_id: saleId,
      sold_at: soldAt,
      location_key: normalizeLocation(row['Location Name']),
      client_id: null,
      client_boulevard_id: row['Client Id'] || null,
      provider_staff_id: providerStaffId,
      product_name: row['Product Name'] || 'Gift Card',
      category,
      quantity: 1,
      unit_price: toNumber(row['Gross Sales'], 0),
      discount_amount: Math.abs(toNumber(row['Discount Amount'], 0)),
      net_sales: toNumber(row['Net Sales'], 0),
      synced_at: new Date().toISOString(),
    })
  }

  // Resolve client IDs in bulk
  const clientBlvdIds = [...new Set(upsertRows.map(r => r.client_boulevard_id).filter(Boolean))]
  const clientMap = new Map()
  for (let i = 0; i < clientBlvdIds.length; i += 200) {
    const chunk = clientBlvdIds.slice(i, i + 200)
    const { data: clients } = await db.from('blvd_clients').select('id, boulevard_id').in('boulevard_id', chunk)
    for (const c of clients || []) clientMap.set(c.boulevard_id, c.id)
  }
  for (const r of upsertRows) {
    if (r.client_boulevard_id) r.client_id = clientMap.get(r.client_boulevard_id) || null
  }

  // Upsert in chunks
  for (let i = 0; i < upsertRows.length; i += 200) {
    const chunk = upsertRows.slice(i, i + 200)
    const { error } = await db.from('blvd_product_sales').upsert(chunk, { onConflict: 'boulevard_sale_line_id' })
    if (error) throw new Error(`${label} upsert error: ${error.message}`)
  }

  stats.imported = upsertRows.length
  return stats
}

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getServiceClient()
  const results = {}

  // Load staff lookup once
  const { data: staffRows } = await db.from('staff').select('id, name')
  const staffByName = new Map(
    (staffRows || []).filter(s => s.name).map(s => [normalizeStaffKey(s.name), s.id])
  )

  // Sync product sales reports (gift cards, packages, skincare)
  for (const report of PRODUCT_REPORTS) {
    const reportId = process.env[report.envVar]
    if (!reportId) {
      results[report.label] = { skipped: true, reason: `${report.envVar} not set` }
      continue
    }

    try {
      results[report.label] = await syncReport(db, reportId, report.label, report.defaultCategory, staffByName)
    } catch (err) {
      console.error(`[cron/sync-product-reports] ${report.label}:`, err.message)
      results[report.label] = { error: err.message }
    }
  }

  // Sync tox inventory adjustments
  const toxReportId = process.env.BLVD_TOX_REPORT_ID
  if (!toxReportId) {
    results['Tox Units'] = { skipped: true, reason: 'BLVD_TOX_REPORT_ID not set' }
  } else {
    try {
      results['Tox Units'] = await syncToxReport(db, toxReportId)
    } catch (err) {
      console.error('[cron/sync-product-reports] Tox Units:', err.message)
      results['Tox Units'] = { error: err.message }
    }
  }

  return res.json({ ok: true, results })
}
