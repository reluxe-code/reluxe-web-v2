// src/pages/api/admin/blvd-sync/product-sales.js
// Sync retail product sales from a Boulevard report export file.
// POST { fileUrl?, dryRun?, mode?: 'latest'|'create' }
import crypto from 'crypto'
import Papa from 'papaparse'
import { adminQuery, getAdminAuthHeader } from '@/server/blvdAdmin'
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 60 }

const PRODUCT_REPORT_ID = process.env.BLVD_PRODUCT_SALES_REPORT_ID || ''

const CREATE_EXPORT_MUTATION = `
  mutation CreateProductExport($reportId: ID!) {
    createReportExport(input: {
      reportId: $reportId
      frequency: ONCE
      fileContentType: CSV
    }) {
      reportExport {
        id
        fileUrl
        reportId
        currentExportAt
      }
    }
  }
`

const LIST_EXPORTS_QUERY = `
  query ListExports {
    reportExports(first: 25) {
      edges {
        node {
          id
          fileUrl
          reportId
          currentExportAt
          report { id name }
        }
      }
    }
  }
`

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeKey(input) {
  return String(input || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function pickValue(row, candidates = []) {
  const normalized = Object.fromEntries(
    Object.entries(row || {}).map(([key, value]) => [normalizeKey(key), value])
  )
  for (const key of candidates) {
    const value = normalized[normalizeKey(key)]
    if (value !== undefined && value !== null && String(value).trim() !== '') return value
  }
  return null
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const cleaned = String(value).replace(/[$,%]/g, '').replace(/,/g, '').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : fallback
}

function parseDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function normalizeLocation(value) {
  const v = String(value || '').toLowerCase()
  if (v.includes('westfield')) return 'westfield'
  if (v.includes('carmel')) return 'carmel'
  return null
}

function toRowsFromPayload(text, contentType = '') {
  if (contentType.includes('application/json') || text.trim().startsWith('[') || text.trim().startsWith('{')) {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed
    if (Array.isArray(parsed?.rows)) return parsed.rows
    if (Array.isArray(parsed?.data)) return parsed.data
    return []
  }

  const csv = Papa.parse(text, { header: true, skipEmptyLines: true })
  return Array.isArray(csv.data) ? csv.data : []
}

function detectDateFromAnyField(row) {
  for (const [key, value] of Object.entries(row || {})) {
    if (!value) continue
    const lowerKey = String(key).toLowerCase()
    if (!lowerKey.includes('date') && !lowerKey.includes('time') && !lowerKey.includes('at')) continue
    const parsed = parseDate(value)
    if (parsed) return parsed
  }
  return null
}

function normalizeSaleRow(raw, idx, options = {}) {
  const defaultSoldAt = options.defaultSoldAt || null
  const contextSoldAt = options.contextSoldAt || null
  const contextOrderId = options.contextOrderId || null
  const contextProviderName = options.contextProviderName || null
  const soldAt =
    parseDate(
      pickValue(raw, [
        'sold_at',
        'date',
        'datetime',
        'checkout_at',
        'purchased_at',
        'sale_date',
        'transaction_date',
        'sale_datetime',
        'completed_at',
        'closed_at',
      ])
    ) || detectDateFromAnyField(raw) || contextSoldAt || defaultSoldAt
  if (!soldAt) return null

  const quantity = Math.max(
    0,
    toNumber(
      pickValue(raw, [
        'quantity',
        'qty',
        'units',
        'item_quantity',
        'sold_quantity',
        'product quantity sold',
        'product_quantity_sold',
      ]),
      1
    )
  )
  const unitPrice = Math.max(
    0,
    toNumber(
      pickValue(raw, [
        'unit_price',
        'price_per_unit',
        'price',
        'retail_price',
        'list_price',
        'sales per order',
        'sales_per_order',
      ]),
      0
    )
  )
  const discountAmount = Math.max(
    0,
    toNumber(
      pickValue(raw, [
        'discount',
        'discount_amount',
        'line_discount',
        'discounts',
        'discount_total',
        'product sales tax',
        'product_sales_tax',
      ]),
      0
    )
  )

  const explicitNet = toNumber(
    pickValue(raw, [
      'net_sales',
      'line_total',
      'line_amount',
      'amount',
      'subtotal',
      'total',
      'net',
      'net_amount',
      'net_revenue',
      'product sales',
      'product_sales',
    ]),
    NaN
  )
  const netSales = Number.isFinite(explicitNet) ? explicitNet : Math.max(0, quantity * unitPrice - discountAmount)

  const explicitProductName = pickValue(raw, ['product_name', 'item_name', 'product', 'item', 'line_item_name', 'line_item', 'name'])
  const explicitSku = pickValue(raw, ['sku', 'product_sku', 'upc'])
  const hasExplicitProductIdentity = Boolean(explicitProductName || explicitSku)
  if (!hasExplicitProductIdentity) return null
  const productName = explicitProductName || explicitSku
  if (String(productName).trim().toLowerCase() === 'all') return null

  const orderId =
    pickValue(raw, ['order_id', 'sale_order_number', 'sale order number', 'sale_id', 'transaction_id', 'invoice_id', 'ticket_id', 'order']) ||
    contextOrderId
  const sku = pickValue(raw, ['sku', 'product_sku', 'upc'])
  const providerBoulevardId = pickValue(raw, ['provider_id', 'staff_id', 'employee_id', 'provider_boulevard_id', 'provider_urn']) || null
  const providerName =
    pickValue(raw, ['provider_name', 'staff_name', 'employee_name', 'provider', 'staff']) ||
    contextProviderName ||
    null
  const lineId =
    pickValue(raw, ['sale_line_id', 'line_id', 'transaction_line_id']) ||
    crypto
      .createHash('sha1')
      .update([
        orderId || '',
        sku || '',
        String(productName || '').toLowerCase(),
        soldAt ? soldAt.slice(0, 19) : '',
        String(providerBoulevardId || '').toLowerCase(),
        String(providerName || '').toLowerCase(),
        String(quantity || 0),
        String(netSales || 0),
      ].join('|'))
      .digest('hex')

  return {
    boulevard_sale_line_id: String(lineId),
    order_id: orderId ? String(orderId) : null,
    order_number: pickValue(raw, ['order_number', 'invoice_number', 'receipt_number']) || null,
    sold_at: soldAt,
    location_key: normalizeLocation(pickValue(raw, ['location', 'location_name', 'clinic', 'store'])),
    location_id: pickValue(raw, ['location_id']) || null,
    client_boulevard_id: pickValue(raw, ['client_id', 'customer_id', 'guest_id']) || null,
    client_name: pickValue(raw, ['client_name', 'customer_name', 'guest_name']) || null,
    client_email: pickValue(raw, ['client_email', 'customer_email', 'email']) || null,
    provider_boulevard_id: providerBoulevardId,
    provider_name: providerName,
    boulevard_product_id: pickValue(raw, ['product_id', 'item_id']) || null,
    sku: sku ? String(sku) : null,
    product_name: String(productName),
    brand: pickValue(raw, ['brand']) || null,
    category: pickValue(raw, ['category', 'product_category']) || null,
    quantity,
    unit_price: unitPrice,
    discount_amount: discountAmount,
    net_sales: netSales,
    raw,
  }
}

function normalizeSummaryProductRow(raw, idx, options = {}) {
  const defaultSoldAt = options.defaultSoldAt || new Date().toISOString()
  const productName = pickValue(raw, ['product name', 'product_name', 'name', 'product'])
  const brand = pickValue(raw, ['product brand_name', 'product brand', 'brand_name', 'brand'])
  const quantity = Math.max(0, toNumber(pickValue(raw, ['product quantity sold', 'quantity sold', 'qty sold', 'quantity']), 0))
  const netSales = Math.max(0, toNumber(pickValue(raw, ['product sales', 'sales', 'net sales', 'net']), 0))
  const salesPerOrder = Math.max(0, toNumber(pickValue(raw, ['sales per order', 'avg order sales', 'average order value']), 0))
  const salesTax = Math.max(0, toNumber(pickValue(raw, ['product sales tax', 'sales tax', 'tax']), 0))
  const providerName = pickValue(raw, ['provider_name', 'staff_name', 'employee_name', 'provider', 'staff']) || null

  if (!productName || (quantity <= 0 && netSales <= 0)) return null

  const unitPrice = quantity > 0 ? netSales / quantity : salesPerOrder
  const lineId = crypto
    .createHash('sha1')
    .update([
      'summary',
      String(productName).toLowerCase(),
      String(brand || '').toLowerCase(),
      String(providerName || '').toLowerCase(),
      new Date(defaultSoldAt).toISOString().slice(0, 10),
      String(quantity || 0),
      String(netSales || 0),
    ].join('|'))
    .digest('hex')

  return {
    boulevard_sale_line_id: String(lineId),
    order_id: null,
    order_number: null,
    sold_at: defaultSoldAt,
    location_key: null,
    location_id: null,
    client_boulevard_id: null,
    client_name: null,
    client_email: null,
    provider_boulevard_id: null,
    provider_name: providerName,
    boulevard_product_id: null,
    sku: null,
    product_name: String(productName),
    brand: brand ? String(brand) : null,
    category: null,
    quantity,
    unit_price: unitPrice,
    discount_amount: 0,
    net_sales: netSales,
    raw: {
      ...raw,
      _summary_mode: true,
      _product_sales_tax: salesTax,
    },
  }
}

function normalizePersonKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
}

async function resolveExportFileUrl(mode) {
  if (!PRODUCT_REPORT_ID) {
    throw new Error('Missing BLVD_PRODUCT_SALES_REPORT_ID env var')
  }

  const reportIdCandidates = buildReportIdCandidates(PRODUCT_REPORT_ID)

  const requestedAt = new Date()

  let createdExportId = null

  if (mode === 'create') {
    let created = false
    const createErrors = []
    for (const candidate of reportIdCandidates) {
      try {
        const createData = await adminQuery(CREATE_EXPORT_MUTATION, { reportId: candidate })
        createdExportId = createData?.createReportExport?.reportExport?.id || null
        created = true
        break
      } catch (err) {
        createErrors.push(`[${candidate}] ${err.message}`)
      }
    }
    if (!created) {
      throw new Error(
        `Failed to create report export with configured BLVD_PRODUCT_SALES_REPORT_ID. Attempts: ${createErrors.join(' | ')}`
      )
    }
  }

  let match = null
  const maxPolls = mode === 'create' ? 8 : 1
  for (let attempt = 0; attempt < maxPolls; attempt += 1) {
    const exportData = await adminQuery(LIST_EXPORTS_QUERY)
    const exports = (exportData.reportExports?.edges || []).map((e) => e.node)
    const candidates = exports
      .filter((exp) => matchesAnyReportId(exp.reportId, reportIdCandidates) || matchesAnyReportId(exp.report?.id, reportIdCandidates))
      .sort((a, b) => new Date(b.currentExportAt || 0).getTime() - new Date(a.currentExportAt || 0).getTime())

    if (mode === 'create' && createdExportId) {
      const exact = candidates.find((exp) => exp.id === createdExportId)
      if (exact?.fileUrl) {
        match = exact
        break
      }
    }

    if (mode !== 'create') {
      match = candidates[0] || null
      break
    }

    const fresh = candidates.find((exp) => {
      const exportAt = new Date(exp.currentExportAt || 0).getTime()
      return exportAt >= requestedAt.getTime() - 5000
    })

    if (fresh) {
      match = fresh
      break
    }

    match = candidates[0] || null
    await sleep(2000)
  }

  if (!match?.fileUrl) {
    throw new Error('No product report export with fileUrl found for BLVD_PRODUCT_SALES_REPORT_ID')
  }

  return {
    fileUrl: match.fileUrl,
    exportAt: match.currentExportAt || null,
    exportId: match.id || null,
  }
}

async function listMatchingExports() {
  if (!PRODUCT_REPORT_ID) return []
  const reportIdCandidates = buildReportIdCandidates(PRODUCT_REPORT_ID)
  const exportData = await adminQuery(LIST_EXPORTS_QUERY)
  return (exportData.reportExports?.edges || [])
    .map((e) => e.node)
    .filter((exp) => matchesAnyReportId(exp.reportId, reportIdCandidates) || matchesAnyReportId(exp.report?.id, reportIdCandidates))
    .sort((a, b) => new Date(b.currentExportAt || 0).getTime() - new Date(a.currentExportAt || 0).getTime())
}

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
    const base = Buffer.from(input).toString('base64')
    candidates.add(base)
  }

  return Array.from(candidates)
}

function matchesAnyReportId(actual, candidates) {
  if (!actual) return false
  const normalizedActual = String(actual).trim()
  return candidates.some((candidate) => {
    const c = String(candidate).trim()
    return normalizedActual === c || normalizedActual.includes(c) || c.includes(normalizedActual)
  })
}

async function fetchExportFile(url) {
  const first = await fetch(url)
  if (first.ok) return { response: first, usedAuth: false }

  if (first.status === 401 || first.status === 403) {
    const second = await fetch(url, {
      headers: {
        Authorization: getAdminAuthHeader(),
      },
    })
    if (second.ok) return { response: second, usedAuth: true }
    return { response: second, usedAuth: true }
  }

  return { response: first, usedAuth: false }
}

async function chunkedUpsert(db, table, rows, onConflict, chunkSize = 500) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await db.from(table).upsert(chunk, { onConflict })
    if (error) throw error
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { fileUrl, dryRun = false, mode = 'latest', fullRefresh = false } = req.body || {}
  const db = getServiceClient()

  try {
    let sourceFileUrl = fileUrl
    let exportAt = null
    let exportId = null
    if (!sourceFileUrl) {
      const resolved = await resolveExportFileUrl(mode)
      sourceFileUrl = resolved.fileUrl
      exportAt = resolved.exportAt
      exportId = resolved.exportId
    }

    let { response: fileRes, usedAuth } = await fetchExportFile(sourceFileUrl)

    // Fallback: stale/expired file URL. Create a fresh export and retry once.
    if (!fileRes.ok && (fileRes.status === 401 || fileRes.status === 403) && !fileUrl && mode !== 'create') {
      const refreshed = await resolveExportFileUrl('create')
      sourceFileUrl = refreshed.fileUrl
      exportAt = refreshed.exportAt
      exportId = refreshed.exportId
      const retry = await fetchExportFile(sourceFileUrl)
      fileRes = retry.response
      usedAuth = retry.usedAuth
    }

    // Some Boulevard export URLs remain 403 briefly; try recent matching exports as fallback.
    if (!fileRes.ok && (fileRes.status === 401 || fileRes.status === 403) && !fileUrl) {
      const exports = await listMatchingExports()
      for (const exp of exports.slice(0, 8)) {
        if (!exp?.fileUrl) continue
        const attempt = await fetchExportFile(exp.fileUrl)
        if (attempt.response.ok) {
          sourceFileUrl = exp.fileUrl
          exportAt = exp.currentExportAt || exportAt
          exportId = exp.id || exportId
          fileRes = attempt.response
          usedAuth = attempt.usedAuth
          break
        }
      }
    }

    if (!fileRes.ok) {
      throw new Error(`Failed to download report file: ${fileRes.status}${usedAuth ? ' (auth retry attempted)' : ''}`)
    }

    const contentType = fileRes.headers.get('content-type') || 'text/csv'
    const text = await fileRes.text()
    const parsedRows = toRowsFromPayload(text, contentType)
    const sampleHeaders = Array.from(
      new Set(parsedRows.slice(0, 25).flatMap((row) => Object.keys(row || {})))
    )

    if (contentType.includes('text/html') || text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      throw new Error('Downloaded export returned HTML instead of CSV/JSON. The file URL likely requires a fresh export.')
    }

    let summaryMode = false

    let lastOrderId = null
    let lastSoldAt = exportAt || null
    let lastProviderName = null
    let normalized = []

    for (let idx = 0; idx < parsedRows.length; idx += 1) {
      const row = parsedRows[idx]
      const rowOrder =
        pickValue(row, ['order_id', 'sale_order_number', 'sale order number', 'sale_id', 'transaction_id', 'invoice_id', 'ticket_id', 'order']) ||
        null
      const rowProvider =
        pickValue(row, ['provider_name', 'staff_name', 'employee_name', 'provider', 'staff']) ||
        null
      const rowSoldAt =
        parseDate(
          pickValue(row, [
            'sold_at',
            'date',
            'datetime',
            'checkout_at',
            'purchased_at',
            'sale_date',
            'transaction_date',
            'sale_datetime',
            'completed_at',
            'closed_at',
          ])
        ) || detectDateFromAnyField(row)

      if (rowOrder) lastOrderId = rowOrder
      if (rowProvider) lastProviderName = rowProvider
      if (rowSoldAt) lastSoldAt = rowSoldAt

      const mapped = normalizeSaleRow(row, idx, {
        defaultSoldAt: exportAt,
        contextSoldAt: lastSoldAt,
        contextOrderId: lastOrderId,
        contextProviderName: lastProviderName,
      })
      if (mapped) normalized.push(mapped)
    }

    if (parsedRows.length > 0 && normalized.length === 0) {
      const hasSummaryHeaders =
        sampleHeaders.some((h) => normalizeKey(h).includes('productname')) &&
        sampleHeaders.some((h) => normalizeKey(h).includes('productsales'))

      if (hasSummaryHeaders) {
        summaryMode = true
        normalized = parsedRows
          .map((row, idx) => normalizeSummaryProductRow(row, idx, { defaultSoldAt: exportAt || new Date().toISOString() }))
          .filter(Boolean)
      }
    }

    if (parsedRows.length > 0 && normalized.length === 0) {
      throw new Error(
        `Parsed ${parsedRows.length} rows but none matched expected sales columns. Detected headers: ${sampleHeaders.join(', ')}`
      )
    }

    if (dryRun) {
      return res.json({
        ok: true,
        dryRun: true,
        sourceFileUrl,
        parsed_rows: parsedRows.length,
        valid_rows: normalized.length,
        summary_mode: summaryMode,
        sample_headers: sampleHeaders,
        sample: normalized.slice(0, 5),
      })
    }

    if (fullRefresh) {
      const { error: salesDeleteErr } = await db
        .from('blvd_product_sales')
        .delete()
        .not('id', 'is', null)
      if (salesDeleteErr) throw salesDeleteErr

      const { error: catalogDeleteErr } = await db
        .from('blvd_product_catalog')
        .delete()
        .not('id', 'is', null)
      if (catalogDeleteErr) throw catalogDeleteErr
    }

    // Provider mapping
    const { data: staffRows, error: staffErr } = await db
      .from('staff')
      .select('id, boulevard_provider_id, name')
    if (staffErr) throw staffErr
    const staffByBlvd = new Map((staffRows || []).map((s) => [s.boulevard_provider_id, s.id]))
    const staffByName = new Map(
      (staffRows || [])
        .filter((s) => s.name)
        .map((s) => [normalizePersonKey(s.name), s.id])
    )

    // Client mapping + upsert unknown clients
    const clientBlvdIds = [...new Set(normalized.map((r) => r.client_boulevard_id).filter(Boolean))]
    const existingClientsByBlvd = new Map()

    for (let i = 0; i < clientBlvdIds.length; i += 200) {
      const batch = clientBlvdIds.slice(i, i + 200)
      const { data: clients, error: cErr } = await db
        .from('blvd_clients')
        .select('id, boulevard_id')
        .in('boulevard_id', batch)
      if (cErr) throw cErr
      for (const c of clients || []) existingClientsByBlvd.set(c.boulevard_id, c.id)
    }

    const missingClients = normalized
      .filter((r) => r.client_boulevard_id && !existingClientsByBlvd.has(r.client_boulevard_id))
      .map((r) => ({
        boulevard_id: r.client_boulevard_id,
        name: r.client_name || null,
        email: r.client_email || null,
        synced_at: new Date().toISOString(),
      }))

    const dedupMissingClients = Array.from(new Map(missingClients.map((c) => [c.boulevard_id, c])).values())
    if (dedupMissingClients.length > 0) {
      await chunkedUpsert(db, 'blvd_clients', dedupMissingClients, 'boulevard_id')

      for (let i = 0; i < clientBlvdIds.length; i += 200) {
        const batch = clientBlvdIds.slice(i, i + 200)
        const { data: clients } = await db
          .from('blvd_clients')
          .select('id, boulevard_id')
          .in('boulevard_id', batch)
        for (const c of clients || []) existingClientsByBlvd.set(c.boulevard_id, c.id)
      }
    }

    // Product catalog upsert
    const productCandidates = normalized.map((r) => ({
      boulevard_product_id: r.boulevard_product_id,
      sku: r.sku,
      product_name: r.product_name,
      brand: r.brand,
      category: r.category,
      synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const productBySku = Array.from(
      new Map(productCandidates.filter((r) => r.sku).map((r) => [r.sku, r])).values()
    )
    const productByBlvdId = Array.from(
      new Map(productCandidates.filter((r) => !r.sku && r.boulevard_product_id).map((r) => [r.boulevard_product_id, r])).values()
    )

    if (productBySku.length > 0) {
      await chunkedUpsert(db, 'blvd_product_catalog', productBySku, 'sku')
    }
    if (productByBlvdId.length > 0) {
      await chunkedUpsert(db, 'blvd_product_catalog', productByBlvdId, 'boulevard_product_id')
    }

    const skus = [...new Set(normalized.map((r) => r.sku).filter(Boolean))]
    const blvdProductIds = [...new Set(normalized.map((r) => r.boulevard_product_id).filter(Boolean))]
    const productMapBySku = new Map()
    const productMapByBlvd = new Map()

    for (let i = 0; i < skus.length; i += 200) {
      const batch = skus.slice(i, i + 200)
      const { data } = await db.from('blvd_product_catalog').select('id, sku, boulevard_product_id').in('sku', batch)
      for (const p of data || []) {
        if (p.sku) productMapBySku.set(p.sku, p.id)
        if (p.boulevard_product_id) productMapByBlvd.set(p.boulevard_product_id, p.id)
      }
    }

    for (let i = 0; i < blvdProductIds.length; i += 200) {
      const batch = blvdProductIds.slice(i, i + 200)
      const { data } = await db.from('blvd_product_catalog').select('id, sku, boulevard_product_id').in('boulevard_product_id', batch)
      for (const p of data || []) {
        if (p.sku) productMapBySku.set(p.sku, p.id)
        if (p.boulevard_product_id) productMapByBlvd.set(p.boulevard_product_id, p.id)
      }
    }

    const salesRowsRaw = normalized.map((r) => ({
      boulevard_sale_line_id: r.boulevard_sale_line_id,
      order_id: r.order_id,
      order_number: r.order_number,
      sold_at: r.sold_at,
      location_key: r.location_key,
      location_id: r.location_id,
      client_id: r.client_boulevard_id ? existingClientsByBlvd.get(r.client_boulevard_id) || null : null,
      client_boulevard_id: r.client_boulevard_id,
      provider_staff_id:
        (r.provider_boulevard_id ? staffByBlvd.get(r.provider_boulevard_id) || null : null) ||
        (r.provider_name ? staffByName.get(normalizePersonKey(r.provider_name)) || null : null),
      provider_boulevard_id: r.provider_boulevard_id,
      product_id: (r.sku && productMapBySku.get(r.sku)) || (r.boulevard_product_id && productMapByBlvd.get(r.boulevard_product_id)) || null,
      boulevard_product_id: r.boulevard_product_id,
      sku: r.sku,
      product_name: r.product_name,
      brand: r.brand,
      category: r.category,
      quantity: r.quantity,
      unit_price: r.unit_price,
      discount_amount: r.discount_amount,
      net_sales: r.net_sales,
      raw: r.raw,
      synced_at: new Date().toISOString(),
    }))

    // Guard against duplicate keys in a single payload (can happen with grouped report exports).
    const salesRows = Array.from(
      new Map(
        salesRowsRaw.map((row) => [row.boulevard_sale_line_id, row])
      ).values()
    )

    const soldAtValues = salesRows
      .map((r) => r.sold_at)
      .filter(Boolean)
      .sort()
    const soldAtMin = soldAtValues[0] || null
    const soldAtMax = soldAtValues[soldAtValues.length - 1] || null

    await chunkedUpsert(db, 'blvd_product_sales', salesRows, 'boulevard_sale_line_id')

    return res.json({
      ok: true,
      sourceFileUrl,
      export_id: exportId,
      parsed_rows: parsedRows.length,
      synced_rows: salesRows.length,
      dropped_duplicate_rows: Math.max(0, salesRowsRaw.length - salesRows.length),
      sold_at_min: soldAtMin,
      sold_at_max: soldAtMax,
      summary_mode: summaryMode,
      full_refresh: Boolean(fullRefresh),
      sample_headers: sampleHeaders,
      products_upserted: productBySku.length + productByBlvdId.length,
      missing_clients_created: dedupMissingClients.length,
    })
  } catch (err) {
    console.error('[blvd-sync/product-sales]', err)
    return res.status(500).json({ error: err.message })
  }
}
