// src/pages/api/admin/packages/dashboard.js
// GET: Package sales dashboard stats + lists
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()
  const days = parseInt(req.query.days) || 30
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const now = new Date()
  const in90Days = new Date(now.getTime() + 90 * 86400000).toISOString()

  try {
    // Run stats queries in parallel
    const [
      { count: totalSold },
      { data: recentPkgs },
      { data: allActive },
      { data: expiringSoon },
      { data: catalog },
    ] = await Promise.all([
      // Total sold in date range
      db.from('blvd_packages')
        .select('*', { count: 'exact', head: true })
        .gte('purchased_at', since),

      // Recent packages with client name
      db.from('blvd_packages')
        .select('id, name, status, purchased_at, expires_at, location_key, vouchers, blvd_clients(name)')
        .order('purchased_at', { ascending: false })
        .limit(50),

      // All active packages (for sessions + revenue calc)
      db.from('blvd_packages')
        .select('id, name, status, vouchers, purchased_at, expires_at')
        .eq('status', 'ACTIVE'),

      // Expiring within 90 days
      db.from('blvd_packages')
        .select('id, name, expires_at, vouchers, location_key, blvd_clients(name)')
        .eq('status', 'ACTIVE')
        .not('expires_at', 'is', null)
        .lte('expires_at', in90Days)
        .gte('expires_at', now.toISOString())
        .order('expires_at', { ascending: true }),

      // Package catalog
      db.from('blvd_package_catalog')
        .select('id, name, unit_price, active, vouchers')
        .order('name'),
    ])

    // Build catalog price lookup (name lowercase → unit_price in cents)
    const catalogPriceMap = Object.fromEntries(
      (catalog || []).map((c) => [c.name.toLowerCase().trim(), c.unit_price || 0])
    )

    // Calculate revenue for packages sold in date range
    const soldInRange = (recentPkgs || []).filter(
      (p) => p.purchased_at && new Date(p.purchased_at) >= new Date(since)
    )
    const revenue = soldInRange.reduce((sum, p) => {
      const price = catalogPriceMap[p.name.toLowerCase().trim()] || 0
      return sum + price
    }, 0)

    // Sum sessions remaining across all active packages
    const sessionsRemaining = (allActive || []).reduce((sum, p) => {
      const vouchers = p.vouchers || []
      return sum + vouchers.reduce((vs, v) => vs + (v.quantity || 0), 0)
    }, 0)

    return res.json({
      stats: {
        totalSold: totalSold || 0,
        revenue,
        activePackages: (allActive || []).length,
        sessionsRemaining,
        expiringSoon: (expiringSoon || []).length,
      },
      recentPackages: (recentPkgs || []).map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        purchased_at: p.purchased_at,
        expires_at: p.expires_at,
        location_key: p.location_key,
        client_name: p.blvd_clients?.name || 'Unknown',
        sessions_remaining: (p.vouchers || []).reduce((s, v) => s + (v.quantity || 0), 0),
      })),
      expiringSoon: (expiringSoon || []).map((p) => ({
        id: p.id,
        name: p.name,
        expires_at: p.expires_at,
        location_key: p.location_key,
        client_name: p.blvd_clients?.name || 'Unknown',
        sessions_remaining: (p.vouchers || []).reduce((s, v) => s + (v.quantity || 0), 0),
      })),
      catalog: (catalog || []).map((c) => ({
        id: c.id,
        name: c.name,
        unit_price: c.unit_price || 0,
        active: c.active,
        voucher_count: (c.vouchers || []).reduce((s, v) => s + (v.quantity || 0), 0),
      })),
      days,
    })
  } catch (err) {
    console.error('[packages/dashboard]', err.message)
    return res.status(500).json({ error: 'Failed to load packages dashboard' })
  }
}

export default withAdminAuth(handler)
