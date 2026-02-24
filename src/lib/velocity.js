// src/lib/velocity.js
// Shared helpers for the Velocity Loyalty Rewards system.

import { adminQuery } from '@/server/blvdAdmin'

const AUTOMATOR_STAFF_ID = process.env.BLVD_AUTOMATOR_STAFF_ID
const LOCATIONS = {
  westfield: 'urn:blvd:Location:cf34bcaa-6702-46c6-9f5f-43be8943cc58',
  carmel: 'urn:blvd:Location:3ce18260-2e1f-4beb-8fcf-341bc85a682c',
}

// ---------------------------------------------------------------------------
// Balance helpers
// ---------------------------------------------------------------------------

export async function getCurrentBalance(db, memberId) {
  const { data } = await db
    .from('velocity_balances')
    .select('active_balance_cents')
    .eq('member_id', memberId)
    .maybeSingle()
  return data?.active_balance_cents || 0
}

export async function updateBalanceCache(db, memberId) {
  // Recompute from ledger — not incremental, always accurate
  const { data: rows } = await db
    .from('velocity_ledger')
    .select('event_type, amount_cents, expires_at, is_frozen, expired_at, created_at')
    .eq('member_id', memberId)

  if (!rows?.length) return

  let totalEarned = 0
  let totalExpired = 0
  let activeBalance = 0
  let lastEarnAt = null

  // Collect unexpired earn rows for next-expiry calculation
  const activeExpiries = []

  for (const r of rows) {
    if (['earn', 'earn_package', 'earn_product', 'import', 'promo', 'bonus_rebook', 'bonus_package_complete', 'reactivate', 'manual_adjust'].includes(r.event_type) && r.amount_cents > 0) {
      totalEarned += r.amount_cents
      if (!lastEarnAt || r.created_at > lastEarnAt) lastEarnAt = r.created_at
    }
    if (r.event_type === 'expire') {
      totalExpired += Math.abs(r.amount_cents)
    }
    activeBalance += r.amount_cents

    // Track active earn rows for next-expiry
    if (['earn', 'earn_package', 'earn_product', 'import', 'promo'].includes(r.event_type) && r.amount_cents > 0 && !r.expired_at && r.expires_at) {
      activeExpiries.push({ expires_at: r.expires_at, amount: r.amount_cents, is_frozen: r.is_frozen })
    }
  }

  // Find next expiry (unfrozen only)
  const unfrozenExpiries = activeExpiries
    .filter((e) => !e.is_frozen)
    .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at))

  const nextExpiry = unfrozenExpiries[0] || null

  // Aggregate amount expiring on the same date
  let nextExpiryAmount = 0
  if (nextExpiry) {
    const nextDate = new Date(nextExpiry.expires_at).toDateString()
    for (const e of unfrozenExpiries) {
      if (new Date(e.expires_at).toDateString() === nextDate) {
        nextExpiryAmount += e.amount
      }
    }
  }

  // Check for active booking
  const hasActiveBooking = activeExpiries.some((e) => e.is_frozen)

  await db.from('velocity_balances').upsert(
    {
      member_id: memberId,
      total_earned_cents: totalEarned,
      total_expired_cents: totalExpired,
      active_balance_cents: Math.max(0, activeBalance),
      next_expiry_at: nextExpiry?.expires_at || null,
      next_expiry_amount_cents: nextExpiryAmount,
      has_active_booking: hasActiveBooking,
      last_earn_at: lastEarnAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'member_id' }
  )
}

// ---------------------------------------------------------------------------
// Boulevard credit push / clawback
// ---------------------------------------------------------------------------

export async function pushCreditToBlvd(clientBoulevardId, amountCents, reason, locationKey) {
  if (!AUTOMATOR_STAFF_ID) throw new Error('BLVD_AUTOMATOR_STAFF_ID not configured')
  if (amountCents <= 0) return { ok: false, error: 'amount must be positive' }

  const clientUrn = clientBoulevardId.startsWith('urn:') ? clientBoulevardId : `urn:blvd:Client:${clientBoulevardId}`
  const locationUrn = LOCATIONS[locationKey] || LOCATIONS.westfield

  const data = await adminQuery(`
    mutation {
      createAccountCreditAdjustment(input: {
        id: "${clientUrn}"
        locationId: "${locationUrn}"
        staffId: "${AUTOMATOR_STAFF_ID}"
        balanceDelta: ${amountCents}
        adjustmentReason: "${reason.replace(/"/g, '\\"')}"
      }) {
        client { id currentAccountBalance }
      }
    }
  `)

  return {
    ok: true,
    newBalance: data.createAccountCreditAdjustment.client.currentAccountBalance,
  }
}

export async function clawbackFromBlvd(clientBoulevardId, amountCents, reason, locationKey) {
  if (!AUTOMATOR_STAFF_ID) throw new Error('BLVD_AUTOMATOR_STAFF_ID not configured')
  if (amountCents <= 0) return { ok: false, error: 'amount must be positive' }

  const clientUrn = clientBoulevardId.startsWith('urn:') ? clientBoulevardId : `urn:blvd:Client:${clientBoulevardId}`

  // Read current balance first — never go below 0
  const balanceData = await adminQuery(`
    query {
      node(id: "${clientUrn}") {
        ... on Client { currentAccountBalance }
      }
    }
  `)

  const currentBalance = balanceData?.node?.currentAccountBalance || 0
  if (currentBalance <= 0) return { ok: true, skipped: true, reason: 'balance_already_zero' }

  const clawAmount = Math.min(amountCents, currentBalance)
  const locationUrn = LOCATIONS[locationKey] || LOCATIONS.westfield

  const data = await adminQuery(`
    mutation {
      createAccountCreditAdjustment(input: {
        id: "${clientUrn}"
        locationId: "${locationUrn}"
        staffId: "${AUTOMATOR_STAFF_ID}"
        balanceDelta: ${-clawAmount}
        adjustmentReason: "${reason.replace(/"/g, '\\"')}"
      }) {
        client { id currentAccountBalance }
      }
    }
  `)

  return {
    ok: true,
    clawedBack: clawAmount,
    newBalance: data.createAccountCreditAdjustment.client.currentAccountBalance,
  }
}

// ---------------------------------------------------------------------------
// Member resolution
// ---------------------------------------------------------------------------

export async function resolveMemberFromClientId(db, blvdClientId) {
  // Direct match via blvd_client_id
  const { data: directMember } = await db
    .from('members')
    .select('id, blvd_client_id, phone')
    .eq('blvd_client_id', blvdClientId)
    .maybeSingle()

  if (directMember) return directMember

  // Fallback: match by phone
  const { data: client } = await db
    .from('blvd_clients')
    .select('phone')
    .eq('id', blvdClientId)
    .maybeSingle()

  if (!client?.phone) return null

  const digits = client.phone.replace(/\D/g, '').slice(-10)
  if (digits.length < 10) return null

  const { data: phoneMember } = await db
    .from('members')
    .select('id, blvd_client_id, phone')
    .like('phone', `%${digits}`)
    .limit(1)
    .maybeSingle()

  return phoneMember || null
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`
}
