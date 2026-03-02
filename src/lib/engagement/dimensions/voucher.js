// src/lib/engagement/dimensions/voucher.js
// Voucher utilization score (0-100). Weight: 0.05

/**
 * Compute voucher utilization scores for a batch of client IDs.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string[]} clientIds
 * @returns {Promise<Record<string, { score: number, detail: object }>>}
 */
export async function computeVoucherScores(db, clientIds) {
  if (!clientIds.length) return {}

  // 1. Membership vouchers
  const { data: memberships } = await db
    .from('blvd_memberships')
    .select('client_id, vouchers, status')
    .in('client_id', clientIds)
    .eq('status', 'ACTIVE')

  // 2. Package vouchers
  const { data: packages } = await db
    .from('blvd_packages')
    .select('client_id, vouchers, status, expires_at')
    .in('client_id', clientIds)
    .eq('status', 'ACTIVE')

  // Aggregate vouchers per client
  const clientVouchers = {}
  for (const clientId of clientIds) {
    clientVouchers[clientId] = { available: 0, total: 0, nearestExpiry: null }
  }

  for (const m of memberships || []) {
    const vouchers = parseVouchers(m.vouchers)
    for (const v of vouchers) {
      clientVouchers[m.client_id].available += v.quantity || 0
      clientVouchers[m.client_id].total += v.quantity || 0
    }
  }

  for (const p of packages || []) {
    const vouchers = parseVouchers(p.vouchers)
    for (const v of vouchers) {
      clientVouchers[p.client_id].available += v.quantity || 0
      clientVouchers[p.client_id].total += v.quantity || 0
    }
    if (p.expires_at) {
      const expiry = new Date(p.expires_at)
      if (!clientVouchers[p.client_id].nearestExpiry || expiry < clientVouchers[p.client_id].nearestExpiry) {
        clientVouchers[p.client_id].nearestExpiry = expiry
      }
    }
  }

  // 3. Count used vouchers from completed appointments with voucher services
  // (Approximate: count appointments with membership/package services)
  const { data: usedAppts } = await db
    .from('blvd_appointments')
    .select('client_id')
    .in('client_id', clientIds)
    .in('status', ['completed', 'final'])

  const usedCounts = {}
  for (const a of usedAppts || []) {
    usedCounts[a.client_id] = (usedCounts[a.client_id] || 0)
  }

  const results = {}
  const now = new Date()

  for (const clientId of clientIds) {
    const v = clientVouchers[clientId]

    if (v.total === 0 && v.available === 0) {
      // No vouchers ever — neutral
      results[clientId] = { score: 50, detail: { no_vouchers: true } }
      continue
    }

    // Utilization rate (used / total allocated)
    const used = Math.max(0, v.total - v.available)
    const totalEver = v.total + used
    const utilizationRate = totalEver > 0 ? used / totalEver : 0

    const utilizationScore = Math.round(utilizationRate * 60)

    // Urgency bonus — using vouchers before expiry is good
    let urgencyBonus = 0
    if (v.nearestExpiry) {
      const daysUntilExpiry = Math.floor((v.nearestExpiry - now) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry <= 7) urgencyBonus = 0 // About to lose them — not great
      else if (daysUntilExpiry <= 30) urgencyBonus = 10
      else if (daysUntilExpiry <= 90) urgencyBonus = 20
      else urgencyBonus = 15
    }

    // Volume bonus — more vouchers used = more engaged
    const volumeBonus = Math.min(used * 5, 20)

    const score = Math.min(utilizationScore + urgencyBonus + volumeBonus, 100)

    results[clientId] = {
      score,
      detail: {
        available: v.available,
        used,
        utilization_rate: Math.round(utilizationRate * 100),
        nearest_expiry: v.nearestExpiry?.toISOString() || null,
        urgency_bonus: urgencyBonus,
        volume_bonus: volumeBonus,
      },
    }
  }

  for (const id of clientIds) {
    if (!results[id]) results[id] = { score: 50, detail: { no_vouchers: true } }
  }

  return results
}

/**
 * Parse vouchers from JSONB (handles legacy string-encoded format).
 */
function parseVouchers(raw) {
  if (!raw) return []
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  if (Array.isArray(raw)) return raw
  return []
}
