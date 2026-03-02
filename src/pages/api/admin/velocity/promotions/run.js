// Admin API: Execute a bulk promotion against target clients
import { getServiceClient } from '@/lib/supabase'
import { getCurrentBalance, updateBalanceCache, pushCreditToBlvd } from '@/lib/velocity'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const db = getServiceClient()
  const { promotionId, targetFilter = 'all_clients', customIds, dryRun = true, pushActive = false } = req.body

  if (!promotionId) return res.status(400).json({ error: 'promotionId required' })

  try {
    // Load promotion
    const { data: promo } = await db
      .from('velocity_promotions')
      .select('*')
      .eq('id', promotionId)
      .single()

    if (!promo) return res.status(404).json({ error: 'Promotion not found' })
    if (!promo.is_active) return res.status(400).json({ error: 'Promotion is not active' })

    // Determine target clients
    let targetMembers = []
    const activeCutoff = new Date(Date.now() - 90 * 86400000).toISOString()

    if (targetFilter === 'all_clients') {
      // All members with a linked blvd_client
      const { data } = await db.from('members').select('id, blvd_client_id').not('blvd_client_id', 'is', null)
      targetMembers = data || []
    } else if (targetFilter === 'non_loyalty') {
      // Members NOT already in velocity_ledger with 'import' event
      const { data: allMembers } = await db.from('members').select('id, blvd_client_id').not('blvd_client_id', 'is', null)
      const { data: imported } = await db.from('velocity_ledger').select('member_id').eq('event_type', 'import')
      const importedSet = new Set((imported || []).map((i) => i.member_id))
      targetMembers = (allMembers || []).filter((m) => !importedSet.has(m.id))
    } else if (targetFilter === 'inactive_90d') {
      // Members whose blvd_client.last_visit_at < 90 days ago
      const { data: members } = await db.from('members').select('id, blvd_client_id').not('blvd_client_id', 'is', null)
      const clientIds = (members || []).map((m) => m.blvd_client_id).filter(Boolean)
      const { data: clients } = await db.from('blvd_clients').select('id, last_visit_at').in('id', clientIds)
      const inactiveClientIds = new Set((clients || []).filter((c) => !c.last_visit_at || c.last_visit_at < activeCutoff).map((c) => c.id))
      targetMembers = (members || []).filter((m) => inactiveClientIds.has(m.blvd_client_id))
    } else if (targetFilter === 'custom_ids' && customIds?.length) {
      const { data } = await db.from('members').select('id, blvd_client_id').in('id', customIds)
      targetMembers = data || []
    }

    // Filter out already-claimed if one_per_member
    if (promo.one_per_member) {
      const { data: claims } = await db.from('velocity_promotion_claims').select('member_id').eq('promotion_id', promotionId)
      const claimedSet = new Set((claims || []).map((c) => c.member_id))
      targetMembers = targetMembers.filter((m) => !claimedSet.has(m.id))
    }

    // Check max_claims
    if (promo.max_claims && promo.total_claimed + targetMembers.length > promo.max_claims) {
      targetMembers = targetMembers.slice(0, promo.max_claims - promo.total_claimed)
    }

    if (dryRun) {
      return res.json({
        ok: true,
        dryRun: true,
        targetCount: targetMembers.length,
        totalCents: targetMembers.length * promo.amount_cents,
        promotion: { name: promo.name, amount_cents: promo.amount_cents },
      })
    }

    // Execute
    const results = { granted: 0, pushed: 0, errors: [] }

    for (const member of targetMembers) {
      try {
        const currentBalance = await getCurrentBalance(db, member.id)
        const expiresAt = new Date(Date.now() + promo.expiry_days * 86400000).toISOString()

        // Insert ledger entry
        const { data: ledgerEntry } = await db.from('velocity_ledger').insert({
          member_id: member.id,
          blvd_client_id: member.blvd_client_id,
          event_type: 'promo',
          promotion_id: promotionId,
          amount_cents: promo.amount_cents,
          balance_after_cents: currentBalance + promo.amount_cents,
          expires_at: expiresAt,
          admin_note: `Promotion: ${promo.name}`,
          blvd_pushed: false,
        }).select('id').single()

        // Insert claim record
        await db.from('velocity_promotion_claims').insert({
          promotion_id: promotionId,
          member_id: member.id,
          ledger_entry_id: ledgerEntry.id,
        })

        // Push to BLVD if pushActive
        if (pushActive && member.blvd_client_id) {
          const { data: blvdClient } = await db.from('blvd_clients').select('boulevard_id, last_visit_at').eq('id', member.blvd_client_id).maybeSingle()
          const isActive = blvdClient?.last_visit_at && blvdClient.last_visit_at >= activeCutoff

          if (blvdClient?.boulevard_id && isActive) {
            try {
              await pushCreditToBlvd(blvdClient.boulevard_id, promo.amount_cents, `RELUXE Rewards - ${promo.description || promo.name}`, 'westfield')
              await db.from('velocity_ledger').update({ blvd_pushed: true }).eq('id', ledgerEntry.id)
              results.pushed++
            } catch (pushErr) {
              console.error(`[velocity/promo] Push failed for member ${member.id}:`, pushErr.message)
            }
          }
        }

        await updateBalanceCache(db, member.id)
        results.granted++
      } catch (err) {
        results.errors.push({ memberId: member.id, error: err.message })
      }
    }

    // Update total_claimed
    await db.from('velocity_promotions').update({ total_claimed: promo.total_claimed + results.granted }).eq('id', promotionId)

    return res.json({ ok: true, ...results })
  } catch (err) {
    console.error('[velocity/promo/run]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
