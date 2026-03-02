// src/pages/api/admin/packages/import.js
// POST: Import client package purchase data.
// Boulevard's API only exposes package catalog templates, not purchased instances.
// This endpoint lets admins import purchase data from Boulevard's dashboard exports.
//
// Accepts JSON body: { packages: [{ client_phone, package_name, purchased_at, sessions_total, sessions_used, location_key }] }
// Or a single package: { client_phone, package_name, purchased_at, sessions_total, sessions_used, location_key }

import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()

  try {
    // Accept either { packages: [...] } or a single package object
    const input = req.body?.packages || (req.body?.client_phone ? [req.body] : null)
    if (!input?.length) {
      return res.status(400).json({ error: 'Provide packages array or single package with client_phone, package_name, sessions_total' })
    }

    // Load package catalog for voucher template matching
    const { data: catalog } = await db
      .from('blvd_package_catalog')
      .select('boulevard_id, name, vouchers')

    const catalogByName = Object.fromEntries(
      (catalog || []).map((c) => [c.name.toLowerCase().trim(), c])
    )

    // Load engine config for expiry policy
    const { data: configRow } = await db
      .from('site_config')
      .select('value')
      .eq('key', 'concierge_engine')
      .single()
    const engineConfig = configRow?.value || {}

    const results = { imported: 0, skipped: 0, errors: [] }

    for (const pkg of input) {
      const { client_phone, package_name, purchased_at, sessions_total, sessions_used, location_key } = pkg

      if (!client_phone || !package_name) {
        results.errors.push({ client_phone, error: 'Missing client_phone or package_name' })
        results.skipped++
        continue
      }

      // Find client by phone
      const normalizedPhone = client_phone.replace(/\D/g, '').replace(/^1/, '')
      const { data: client } = await db
        .from('blvd_clients')
        .select('id, boulevard_id')
        .or(`phone.ilike.%${normalizedPhone},phone.ilike.%${client_phone}`)
        .limit(1)
        .maybeSingle()

      if (!client) {
        results.errors.push({ client_phone, package_name, error: 'Client not found' })
        results.skipped++
        continue
      }

      // Match to catalog for voucher details
      const catalogMatch = catalogByName[package_name.toLowerCase().trim()]

      // Compute vouchers JSONB — use catalog voucher template if available
      let vouchers = []
      if (catalogMatch?.vouchers?.length) {
        // Use catalog voucher definitions, adjust quantity for remaining sessions
        const remaining = (sessions_total || 0) - (sessions_used || 0)
        vouchers = catalogMatch.vouchers.map((v) => ({
          ...v,
          quantity: Math.max(0, remaining > 0 ? remaining : v.quantity),
        }))
      } else {
        // No catalog match — create a simple voucher entry
        const remaining = (sessions_total || 0) - (sessions_used || 0)
        vouchers = [{ quantity: remaining > 0 ? remaining : sessions_total || 0, services: [{ name: package_name }] }]
      }

      // Compute expiry
      let expiresAt = null
      const purchaseDate = purchased_at ? new Date(purchased_at) : null
      if (purchaseDate) {
        const cutoff = new Date('2026-01-01')
        if (purchaseDate >= cutoff) {
          expiresAt = new Date(purchaseDate)
          expiresAt.setMonth(expiresAt.getMonth() + 18)
        } else {
          expiresAt = new Date('2027-06-30')
        }
      }

      // Generate a stable boulevard_id for upsert (import-sourced records)
      const boulevardId = `import:${client.id}:${package_name.toLowerCase().replace(/\s+/g, '-')}`

      const { error } = await db.from('blvd_packages').upsert({
        boulevard_id: boulevardId,
        client_id: client.id,
        client_boulevard_id: client.boulevard_id || null,
        name: package_name,
        status: 'ACTIVE',
        purchased_at: purchaseDate?.toISOString() || null,
        expires_at: expiresAt?.toISOString() || null,
        location_key: location_key || null,
        vouchers,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'boulevard_id' })

      if (error) {
        results.errors.push({ client_phone, package_name, error: error.message })
        results.skipped++
      } else {
        results.imported++
      }
    }

    return res.json({ ok: true, ...results })
  } catch (err) {
    console.error('[packages/import]', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
