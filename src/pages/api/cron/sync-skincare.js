// src/pages/api/cron/sync-skincare.js
// Cron: every 15 min — sync skincare/retail product sales from Boulevard report.
// Uses BLVD_PRODUCT_SALES_REPORT_ID env var.
import Papa from 'papaparse'
import { adminQuery } from '@/server/blvdAdmin'
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 60 }

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

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const cleaned = String(value).replace(/[$,%]/g, '').replace(/,/g, '').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : fallback
}

function normalizeStaffKey(name) {
  return name ? name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ') : null
}

async function resolveExportFileUrl(reportId) {
  const candidates = buildReportIdCandidates(reportId)

  let createdExportId = null
  for (const candidate of candidates) {
    try {
      const data = await adminQuery(CREATE_EXPORT_MUTATION, { reportId: candidate })
      createdExportId = data?.createReportExport?.reportExport?.id || null
      break
    } catch (_) { /* try next candidate */ }
  }

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

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const reportId = process.env.BLVD_PRODUCT_SALES_REPORT_ID
  if (!reportId) {
    return res.json({ ok: true, skipped: true, reason: 'BLVD_PRODUCT_SALES_REPORT_ID not set' })
  }

  const db = getServiceClient()

  try {
    const fileUrl = await resolveExportFileUrl(reportId)

    let fileRes = await fetch(fileUrl)
    if (!fileRes.ok) {
      const { getAdminAuthHeader } = await import('@/server/blvdAdmin')
      fileRes = await fetch(fileUrl, { headers: { Authorization: getAdminAuthHeader() } })
    }
    if (!fileRes.ok) throw new Error(`Download failed: ${fileRes.status}`)

    const text = await fileRes.text()
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      throw new Error('Downloaded export returned HTML instead of CSV')
    }

    const rows = Papa.parse(text, { header: true, skipEmptyLines: true }).data || []

    // Load staff lookup
    const { data: staffRows } = await db.from('staff').select('id, name')
    const staffByName = new Map(
      (staffRows || []).filter(s => s.name).map(s => [normalizeStaffKey(s.name), s.id])
    )

    const stats = { total: rows.length, skipped: 0, imported: 0 }
    const upsertRows = []

    for (const row of rows) {
      const saleId = row['Sale id']
      if (!saleId || saleId === 'All') { stats.skipped++; continue }

      const productName = row['Product Name']
      if (!productName) { stats.skipped++; continue }

      const soldAt = row['Sale Date'] ? new Date(row['Sale Date']) : null
      if (!soldAt || isNaN(soldAt.getTime())) { stats.skipped++; continue }

      const staffKey = normalizeStaffKey(row['Staff Name'])

      upsertRows.push({
        boulevard_sale_line_id: saleId,
        order_id: saleId,
        sold_at: soldAt.toISOString(),
        location_key: normalizeLocation(row['Location Name']),
        client_id: null,
        client_boulevard_id: row['Client Id'] || null,
        provider_staff_id: staffKey ? staffByName.get(staffKey) || null : null,
        product_name: productName,
        category: 'product',
        quantity: 1,
        unit_price: toNumber(row['Gross Sales'], 0),
        discount_amount: Math.abs(toNumber(row['Discount Amount'], 0)),
        net_sales: toNumber(row['Net Sales'], 0),
        synced_at: new Date().toISOString(),
      })
    }

    // Resolve client IDs
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

    // Upsert
    for (let i = 0; i < upsertRows.length; i += 200) {
      const chunk = upsertRows.slice(i, i + 200)
      const { error } = await db.from('blvd_product_sales').upsert(chunk, { onConflict: 'boulevard_sale_line_id' })
      if (error) throw new Error(`Upsert error: ${error.message}`)
    }

    stats.imported = upsertRows.length
    return res.json({ ok: true, ...stats })
  } catch (err) {
    console.error('[cron/sync-skincare]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
