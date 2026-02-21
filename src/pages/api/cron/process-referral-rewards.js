// src/pages/api/cron/process-referral-rewards.js
// Finds booked referrals whose appointments are completed, issues
// Boulevard store credit to the referrer, updates tiers.
import { getServiceClient } from '@/lib/supabase'
import { adminQuery } from '@/server/blvdAdmin'
import { computeTier, getRewardAmount } from '@/lib/referralCodes'

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getServiceClient()
  const results = { credited: 0, cancelled: 0, expired: 0, errors: [] }

  try {
    // Find all booked referrals pending referrer credit
    const { data: pending, error } = await db
      .from('referrals')
      .select(`
        id, referrer_member_id, referral_code_id,
        appointment_blvd_id, referee_phone, referee_email,
        referrer_reward_amount, is_self_referral
      `)
      .eq('status', 'booked')
      .eq('referrer_credit_issued', false)
      .eq('is_self_referral', false)

    if (error) throw error
    if (!pending?.length) {
      return res.json({ ok: true, message: 'No pending referrals', ...results })
    }

    for (const referral of pending) {
      try {
        // Look up appointment status in synced data
        let appointmentCompleted = false
        let appointmentCancelled = false

        if (referral.appointment_blvd_id) {
          const { data: appt } = await db
            .from('blvd_appointments')
            .select('status')
            .eq('boulevard_id', referral.appointment_blvd_id)
            .maybeSingle()

          if (appt) {
            const status = (appt.status || '').toLowerCase()
            appointmentCompleted = status === 'completed' || status === 'final'
            appointmentCancelled = status === 'cancelled' || status === 'no_show'
          }
        } else if (referral.referee_phone) {
          // Fallback: find recent completed appointment by phone
          const cleanPhone = referral.referee_phone.replace(/\D/g, '').slice(-10)
          const cutoff = new Date(Date.now() - 90 * 86400000).toISOString()
          const { data: clients } = await db
            .from('blvd_clients')
            .select('id')
            .like('phone', `%${cleanPhone}`)
            .limit(1)

          if (clients?.[0]) {
            const { data: appts } = await db
              .from('blvd_appointments')
              .select('boulevard_id, status')
              .eq('client_id', clients[0].id)
              .in('status', ['completed', 'final'])
              .gte('start_at', cutoff)
              .order('start_at', { ascending: false })
              .limit(1)

            if (appts?.[0]) {
              appointmentCompleted = true
              // Link the appointment
              await db.from('referrals')
                .update({ appointment_blvd_id: appts[0].boulevard_id })
                .eq('id', referral.id)
            }
          }
        }

        if (appointmentCancelled) {
          await db.from('referrals')
            .update({ status: 'cancelled' })
            .eq('id', referral.id)
          await db.from('referral_events').insert({
            referral_id: referral.id,
            event_type: 'cancelled',
            metadata: { reason: 'appointment_cancelled' },
          })
          results.cancelled++
          continue
        }

        if (!appointmentCompleted) continue // Still waiting

        // --- Issue credit to referrer ---
        // Get referrer's Boulevard client ID
        const { data: member } = await db
          .from('members')
          .select('blvd_client_id')
          .eq('id', referral.referrer_member_id)
          .maybeSingle()

        if (!member?.blvd_client_id) {
          // Can't issue credit yet — member not linked to Boulevard
          continue
        }

        const { data: blvdClient } = await db
          .from('blvd_clients')
          .select('boulevard_id')
          .eq('id', member.blvd_client_id)
          .maybeSingle()

        if (!blvdClient?.boulevard_id) continue

        // Get reward amount based on tier
        const { data: rc } = await db
          .from('referral_codes')
          .select('tier, total_completed, total_earned')
          .eq('id', referral.referral_code_id)
          .maybeSingle()

        const tier = rc?.tier || 'member'
        const rewardAmount = getRewardAmount(tier)
        const rewardCents = rewardAmount * 100

        // Call Boulevard Admin API
        const blvdClientId = blvdClient.boulevard_id.startsWith('urn:')
          ? blvdClient.boulevard_id
          : `urn:blvd:Client:${blvdClient.boulevard_id}`

        await adminQuery(
          `mutation IssueReferrerCredit($clientId: ID!) {
            createAccountCreditAdjustment(input: {
              clientId: $clientId
              balanceDelta: ${rewardCents}
              adjustmentReason: "Referral reward - your friend completed their first visit at RELUXE! ($${rewardAmount})"
            }) {
              client { id currentAccountBalance }
            }
          }`,
          { clientId: blvdClientId }
        )

        // Update referral
        const now = new Date().toISOString()
        await db.from('referrals').update({
          status: 'credited',
          referrer_credit_issued: true,
          referrer_credited_at: now,
          credited_at: now,
          completed_at: now,
          referrer_reward_amount: rewardAmount,
        }).eq('id', referral.id)

        // Update referral_codes stats
        const newCompleted = (rc?.total_completed || 0) + 1
        const newEarned = Number(rc?.total_earned || 0) + rewardAmount
        const newTier = computeTier(newCompleted)

        const codeUpdates = {
          total_completed: newCompleted,
          total_earned: newEarned,
        }
        if (newTier !== tier) codeUpdates.tier = newTier

        await db.from('referral_codes').update(codeUpdates).eq('id', referral.referral_code_id)

        // Log events
        await db.from('referral_events').insert({
          referral_id: referral.id,
          event_type: 'credit_issued',
          metadata: { amount: rewardAmount, boulevard_client_id: blvdClientId, tier },
        })

        // Tier up event
        if (newTier !== tier) {
          await db.from('referral_events').insert({
            referral_id: referral.id,
            event_type: 'tier_up',
            metadata: { from: tier, to: newTier, total_completed: newCompleted },
          })

          // Milestone bonuses
          if (newTier === 'advocate' && tier === 'member') {
            // $50 bonus at 3 referrals
            await adminQuery(
              `mutation IssueMilestoneBonus($clientId: ID!) {
                createAccountCreditAdjustment(input: {
                  clientId: $clientId
                  balanceDelta: 5000
                  adjustmentReason: "Advocate milestone bonus - thank you for 3 referrals! ($50)"
                }) {
                  client { id }
                }
              }`,
              { clientId: blvdClientId }
            )
            await db.from('referral_codes')
              .update({ total_earned: newEarned + 50 })
              .eq('id', referral.referral_code_id)
          }
        }

        results.credited++
      } catch (err) {
        console.error(`[cron/referral-rewards] Error processing referral ${referral.id}:`, err.message)
        results.errors.push({ referralId: referral.id, error: err.message })
      }
    }

    // Expire old clicked referrals (90+ days, never booked)
    const expiryCutoff = new Date(Date.now() - 90 * 86400000).toISOString()
    const { data: expired } = await db
      .from('referrals')
      .update({ status: 'expired' })
      .eq('status', 'clicked')
      .lt('clicked_at', expiryCutoff)
      .select('id')

    results.expired = expired?.length || 0

    console.log(`[cron/referral-rewards] Credited: ${results.credited}, Cancelled: ${results.cancelled}, Expired: ${results.expired}, Errors: ${results.errors.length}`)
    return res.json({ ok: true, ...results })
  } catch (err) {
    console.error('[cron/referral-rewards]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
