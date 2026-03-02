// src/pages/api/cron/process-velocity-rewards.js
// Cron: earn credit for completed appointments + product sales, freeze/unfreeze based on bookings, expire old credits.
import { getServiceClient } from '@/lib/supabase'
import {
  getCurrentBalance,
  updateBalanceCache,
  pushCreditToBlvd,
  clawbackFromBlvd,
  resolveMemberFromClientId,
} from '@/lib/velocity'

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getServiceClient()
  const results = { earned: 0, expired: 0, frozen: 0, unfrozen: 0, pushed: 0, skipped: 0, errors: [] }

  try {
    // ---------------------------------------------------------------
    // 1. Load config
    // ---------------------------------------------------------------
    const { data: configs } = await db.from('velocity_config').select('*')
    const globalConfig = configs?.find((c) => !c.location_key) || { earn_rate: 0.01, expiry_days: 90, excluded_service_slugs: [], is_active: true }
    if (!globalConfig.is_active) {
      return res.json({ ok: true, skipped: true, reason: 'program_paused' })
    }
    const locationConfigs = {}
    ;(configs || []).filter((c) => c.location_key).forEach((c) => { locationConfigs[c.location_key] = c })

    // ---------------------------------------------------------------
    // 2. Load active multipliers
    // ---------------------------------------------------------------
    const now = new Date().toISOString()
    const { data: multipliers } = await db
      .from('velocity_service_multipliers')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', now)

    const activeMultipliers = (multipliers || []).filter(
      (m) => !m.ends_at || m.ends_at >= now
    )

    // ---------------------------------------------------------------
    // 3. EARN: Find unprocessed completed appointments
    // ---------------------------------------------------------------
    const { data: completedAppts } = await db
      .from('blvd_appointments')
      .select('id, boulevard_id, client_id, start_at, location_key')
      .in('status', ['completed', 'final'])
      .gt('start_at', '2024-01-01')
      .order('start_at', { ascending: true })
      .limit(200)

    // Filter to unprocessed (can't do NOT IN subquery in supabase-js easily)
    const apptIds = (completedAppts || []).map((a) => a.id)
    const { data: alreadyProcessed } = apptIds.length
      ? await db.from('velocity_processed_appointments').select('appointment_id').in('appointment_id', apptIds)
      : { data: [] }
    const processedSet = new Set((alreadyProcessed || []).map((p) => p.appointment_id))
    const unprocessed = (completedAppts || []).filter((a) => !processedSet.has(a.id))

    for (const appt of unprocessed) {
      try {
        // Resolve to member
        const member = await resolveMemberFromClientId(db, appt.client_id)
        if (!member) {
          await markProcessed(db, appt.id, null, 0, 0, 'no_member')
          results.skipped++
          continue
        }

        // Get services with price > 0 (new money only)
        const { data: services } = await db
          .from('blvd_appointment_services')
          .select('service_name, service_slug, price')
          .eq('appointment_id', appt.id)
          .gt('price', 0)

        if (!services?.length) {
          await markProcessed(db, appt.id, member.id, 0, 0, 'no_paid_services')
          results.skipped++
          continue
        }

        // Get config for this location
        const config = locationConfigs[appt.location_key] || globalConfig
        const excluded = new Set(config.excluded_service_slugs || [])

        // Calculate qualifying spend
        let qualifyingSpendCents = 0
        const qualifyingNames = []
        for (const svc of services) {
          if (svc.service_slug && excluded.has(svc.service_slug)) continue
          qualifyingSpendCents += Math.round(parseFloat(svc.price) * 100)
          qualifyingNames.push(svc.service_name)
        }

        if (qualifyingSpendCents <= 0) {
          await markProcessed(db, appt.id, member.id, 0, 0, 'all_excluded')
          results.skipped++
          continue
        }

        // Check for service multiplier (best match)
        let bestMultiplier = 1.0
        for (const svc of services) {
          if (!svc.service_slug) continue
          const match = activeMultipliers.find(
            (m) => m.service_slug === svc.service_slug && (!m.location_key || m.location_key === appt.location_key)
          )
          if (match && match.multiplier > bestMultiplier) bestMultiplier = parseFloat(match.multiplier)
        }

        // Calculate earned
        const earnedCents = Math.floor(qualifyingSpendCents * parseFloat(config.earn_rate) * bestMultiplier)
        if (earnedCents <= 0) {
          await markProcessed(db, appt.id, member.id, qualifyingSpendCents, 0, 'rounded_to_zero')
          results.skipped++
          continue
        }

        const currentBalance = await getCurrentBalance(db, member.id)
        const expiresAt = new Date(Date.now() + config.expiry_days * 86400000).toISOString()

        // Get blvd_client boulevard_id for BLVD push
        const { data: blvdClient } = await db
          .from('blvd_clients')
          .select('boulevard_id')
          .eq('id', appt.client_id)
          .maybeSingle()

        // Insert ledger entry
        const ledgerEntry = {
          member_id: member.id,
          blvd_client_id: appt.client_id,
          event_type: 'earn',
          amount_cents: earnedCents,
          balance_after_cents: currentBalance + earnedCents,
          appointment_id: appt.id,
          appointment_boulevard_id: appt.boulevard_id,
          service_name: qualifyingNames.join(', '),
          location_key: appt.location_key,
          qualifying_spend_cents: qualifyingSpendCents,
          earn_rate: config.earn_rate,
          multiplier: bestMultiplier,
          expires_at: expiresAt,
          blvd_pushed: false,
        }

        const { data: inserted } = await db.from('velocity_ledger').insert(ledgerEntry).select('id').single()

        // Push to Boulevard
        if (blvdClient?.boulevard_id) {
          try {
            await pushCreditToBlvd(
              blvdClient.boulevard_id,
              earnedCents,
              `Velocity Rewards - earned from ${qualifyingNames[0] || 'service'}`,
              appt.location_key
            )
            await db.from('velocity_ledger').update({ blvd_pushed: true }).eq('id', inserted.id)
            results.pushed++
          } catch (pushErr) {
            console.error(`[velocity] BLVD push failed for member ${member.id}:`, pushErr.message)
            await db.from('velocity_ledger').update({ blvd_push_failed: true }).eq('id', inserted.id)
          }
        }

        await markProcessed(db, appt.id, member.id, qualifyingSpendCents, earnedCents, null)
        await updateBalanceCache(db, member.id)
        results.earned++
      } catch (err) {
        console.error(`[velocity] Error processing appointment ${appt.id}:`, err.message)
        results.errors.push({ appointmentId: appt.id, error: err.message })
      }
    }

    // ---------------------------------------------------------------
    // 3b. EARN (PRODUCTS): Find unprocessed product sales
    // ---------------------------------------------------------------
    const { data: recentSales } = await db
      .from('blvd_product_sales')
      .select('id, client_id, sold_at, location_key, product_name, brand, net_sales')
      .gt('sold_at', '2024-01-01')
      .gt('net_sales', 0)
      .order('sold_at', { ascending: true })
      .limit(200)

    // Filter to unprocessed (check velocity_ledger for matching product_sale_id)
    const saleIds = (recentSales || []).map((s) => s.id)
    const { data: alreadyProcessedSales } = saleIds.length
      ? await db.from('velocity_ledger').select('product_sale_id').in('product_sale_id', saleIds).not('product_sale_id', 'is', null)
      : { data: [] }
    const processedSaleSet = new Set((alreadyProcessedSales || []).map((p) => p.product_sale_id))
    const unprocessedSales = (recentSales || []).filter((s) => !processedSaleSet.has(s.id))

    for (const sale of unprocessedSales) {
      try {
        const member = await resolveMemberFromClientId(db, sale.client_id)
        if (!member) {
          results.skipped++
          continue
        }

        const config = locationConfigs[sale.location_key] || globalConfig
        const qualifyingSpendCents = Math.round(parseFloat(sale.net_sales) * 100)
        if (qualifyingSpendCents <= 0) {
          results.skipped++
          continue
        }

        const earnedCents = Math.floor(qualifyingSpendCents * parseFloat(config.earn_rate))
        if (earnedCents <= 0) {
          results.skipped++
          continue
        }

        const currentBalance = await getCurrentBalance(db, member.id)
        const expiresAt = new Date(Date.now() + config.expiry_days * 86400000).toISOString()

        const { data: blvdClient } = await db
          .from('blvd_clients')
          .select('boulevard_id')
          .eq('id', sale.client_id)
          .maybeSingle()

        const { data: inserted } = await db.from('velocity_ledger').insert({
          member_id: member.id,
          blvd_client_id: sale.client_id,
          event_type: 'earn_product',
          amount_cents: earnedCents,
          balance_after_cents: currentBalance + earnedCents,
          product_sale_id: sale.id,
          service_name: sale.product_name + (sale.brand ? ` (${sale.brand})` : ''),
          location_key: sale.location_key,
          qualifying_spend_cents: qualifyingSpendCents,
          earn_rate: config.earn_rate,
          multiplier: 1.0,
          expires_at: expiresAt,
          blvd_pushed: false,
        }).select('id').single()

        if (blvdClient?.boulevard_id) {
          try {
            await pushCreditToBlvd(
              blvdClient.boulevard_id,
              earnedCents,
              `Velocity Rewards - earned from ${sale.product_name}`,
              sale.location_key
            )
            await db.from('velocity_ledger').update({ blvd_pushed: true }).eq('id', inserted.id)
            results.pushed++
          } catch (pushErr) {
            console.error(`[velocity] BLVD push failed for product sale member ${member.id}:`, pushErr.message)
            await db.from('velocity_ledger').update({ blvd_push_failed: true }).eq('id', inserted.id)
          }
        }

        await updateBalanceCache(db, member.id)
        results.earned++
      } catch (err) {
        console.error(`[velocity] Error processing product sale ${sale.id}:`, err.message)
        results.errors.push({ productSaleId: sale.id, error: err.message })
      }
    }

    // ---------------------------------------------------------------
    // 4. FREEZE / UNFREEZE
    // ---------------------------------------------------------------
    const { data: membersWithBalance } = await db
      .from('velocity_balances')
      .select('member_id')
      .gt('active_balance_cents', 0)

    for (const { member_id } of membersWithBalance || []) {
      try {
        const { data: memberData } = await db
          .from('members')
          .select('blvd_client_id')
          .eq('id', member_id)
          .maybeSingle()

        if (!memberData?.blvd_client_id) continue

        // Also check all linked clients by phone
        const { data: memberPhone } = await db
          .from('members')
          .select('phone')
          .eq('id', member_id)
          .maybeSingle()

        let clientIds = [memberData.blvd_client_id]
        if (memberPhone?.phone) {
          const digits = memberPhone.phone.replace(/\D/g, '').slice(-10)
          if (digits.length === 10) {
            const { data: phoneClients } = await db
              .from('blvd_clients')
              .select('id')
              .like('phone', `%${digits}`)
            for (const pc of phoneClients || []) {
              if (!clientIds.includes(pc.id)) clientIds.push(pc.id)
            }
          }
        }

        // Check for any future booking across all linked clients
        const { data: futureBooking } = await db
          .from('blvd_appointments')
          .select('id')
          .in('client_id', clientIds)
          .in('status', ['booked', 'confirmed', 'arrived'])
          .gt('start_at', new Date().toISOString())
          .limit(1)

        const hasBooking = !!futureBooking?.length

        if (hasBooking) {
          // Freeze unfrozen earn rows
          const { data: frozenRows } = await db
            .from('velocity_ledger')
            .update({ is_frozen: true, frozen_until_appointment_id: futureBooking[0].id })
            .in('event_type', ['earn', 'earn_package', 'earn_product', 'import', 'promo'])
            .eq('member_id', member_id)
            .eq('is_frozen', false)
            .is('expired_at', null)
            .gt('amount_cents', 0)
            .select('id')

          results.frozen += frozenRows?.length || 0
        } else {
          // Unfreeze — clock resumes from original expires_at
          const { data: unfrozenRows } = await db
            .from('velocity_ledger')
            .update({ is_frozen: false, frozen_until_appointment_id: null })
            .eq('member_id', member_id)
            .eq('is_frozen', true)
            .select('id')

          results.unfrozen += unfrozenRows?.length || 0
        }

        await db
          .from('velocity_balances')
          .update({ has_active_booking: hasBooking, updated_at: new Date().toISOString() })
          .eq('member_id', member_id)
      } catch (err) {
        console.error(`[velocity] Freeze check error for member ${member_id}:`, err.message)
      }
    }

    // ---------------------------------------------------------------
    // 5. EXPIRE
    // ---------------------------------------------------------------
    const { data: expiring } = await db
      .from('velocity_ledger')
      .select('id, member_id, amount_cents, blvd_client_id, location_key')
      .in('event_type', ['earn', 'earn_package', 'earn_product', 'import', 'promo'])
      .eq('is_frozen', false)
      .is('expired_at', null)
      .gt('amount_cents', 0)
      .lte('expires_at', new Date().toISOString())
      .limit(100)

    for (const entry of expiring || []) {
      try {
        const currentBalance = await getCurrentBalance(db, entry.member_id)

        // Insert expire event
        await db.from('velocity_ledger').insert({
          member_id: entry.member_id,
          blvd_client_id: entry.blvd_client_id,
          event_type: 'expire',
          amount_cents: -entry.amount_cents,
          balance_after_cents: Math.max(0, currentBalance - entry.amount_cents),
          location_key: entry.location_key,
          admin_note: `Auto-expired earn entry ${entry.id}`,
        })

        // Mark original as expired
        await db
          .from('velocity_ledger')
          .update({ expired_at: new Date().toISOString() })
          .eq('id', entry.id)

        // Clawback from Boulevard
        if (entry.blvd_client_id) {
          const { data: blvdClient } = await db
            .from('blvd_clients')
            .select('boulevard_id')
            .eq('id', entry.blvd_client_id)
            .maybeSingle()

          if (blvdClient?.boulevard_id) {
            try {
              await clawbackFromBlvd(
                blvdClient.boulevard_id,
                entry.amount_cents,
                'Velocity Rewards - credit expired (90 days)',
                entry.location_key || 'westfield'
              )
            } catch (clawErr) {
              console.error(`[velocity] Clawback failed for member ${entry.member_id}:`, clawErr.message)
            }
          }
        }

        await updateBalanceCache(db, entry.member_id)
        results.expired++
      } catch (err) {
        console.error(`[velocity] Expire error for entry ${entry.id}:`, err.message)
        results.errors.push({ ledgerId: entry.id, error: err.message })
      }
    }

    // ---------------------------------------------------------------
    // 6. CATCH-UP PUSH: push unpushed balances for recently active members
    // ---------------------------------------------------------------
    const { data: unpushedEntries } = await db
      .from('velocity_ledger')
      .select('id, member_id, blvd_client_id, amount_cents, location_key, event_type')
      .eq('blvd_pushed', false)
      .eq('blvd_push_failed', false)
      .gt('amount_cents', 0)
      .is('expired_at', null)
      .in('event_type', ['import', 'promo'])
      .limit(50)

    // Group by member
    const unpushedByMember = {}
    for (const entry of unpushedEntries || []) {
      if (!unpushedByMember[entry.member_id]) unpushedByMember[entry.member_id] = []
      unpushedByMember[entry.member_id].push(entry)
    }

    for (const [memberId, entries] of Object.entries(unpushedByMember)) {
      // Only push if this member has a recent completed appointment (i.e. they came back)
      const { data: recentAppt } = await db
        .from('velocity_processed_appointments')
        .select('appointment_id')
        .eq('member_id', memberId)
        .is('skipped_reason', null)
        .order('processed_at', { ascending: false })
        .limit(1)

      if (!recentAppt?.length) continue // Not yet active, skip

      const blvdClientId = entries[0].blvd_client_id
      if (!blvdClientId) continue

      const { data: blvdClient } = await db
        .from('blvd_clients')
        .select('boulevard_id')
        .eq('id', blvdClientId)
        .maybeSingle()

      if (!blvdClient?.boulevard_id) continue

      const totalUnpushed = entries.reduce((sum, e) => sum + e.amount_cents, 0)
      try {
        await pushCreditToBlvd(
          blvdClient.boulevard_id,
          totalUnpushed,
          `Velocity Rewards - ${entries.length} pending credits applied`,
          entries[0].location_key || 'westfield'
        )
        // Mark all as pushed
        const entryIds = entries.map((e) => e.id)
        await db.from('velocity_ledger').update({ blvd_pushed: true }).in('id', entryIds)
        results.pushed += entries.length
      } catch (pushErr) {
        console.error(`[velocity] Catch-up push failed for member ${memberId}:`, pushErr.message)
      }
    }

    console.log(`[velocity] Earned: ${results.earned}, Expired: ${results.expired}, Frozen: ${results.frozen}, Unfrozen: ${results.unfrozen}, Pushed: ${results.pushed}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`)
    return res.json({ ok: true, ...results })
  } catch (err) {
    console.error('[velocity]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

async function markProcessed(db, appointmentId, memberId, qualifyingSpendCents, earnedCents, skippedReason) {
  await db.from('velocity_processed_appointments').upsert(
    {
      appointment_id: appointmentId,
      member_id: memberId || '00000000-0000-0000-0000-000000000000',
      qualifying_spend_cents: qualifyingSpendCents,
      earned_cents: earnedCents,
      skipped_reason: skippedReason,
    },
    { onConflict: 'appointment_id' }
  )
}
