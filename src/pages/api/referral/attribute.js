// src/pages/api/referral/attribute.js
// Called after checkout to attribute a booking to a referral.
// Matches by code + deviceId, falls back to code + phone.
// Runs fraud checks, issues referee credit, updates status to 'booked'.
import { getServiceClient } from '@/lib/supabase'
import { adminQuery } from '@/server/blvdAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { code, phone, email, deviceId, appointmentId, clientId, locationKey, bookingSessionId } = req.body
  if (!code) return res.status(400).json({ error: 'code required' })

  const db = getServiceClient()

  // Look up the referral code
  const { data: rc } = await db
    .from('referral_codes')
    .select('id, member_id, tier')
    .or(`code.eq.${code},custom_code.eq.${code}`)
    .single()

  if (!rc) return res.status(404).json({ error: 'Invalid referral code' })

  // Get referrer info for fraud checks
  const { data: referrer } = await db
    .from('members')
    .select('id, phone, email')
    .eq('id', rc.member_id)
    .single()

  // Find matching referral: prefer deviceId match, fall back to any clicked referral for this code
  let referral = null

  if (deviceId) {
    const { data } = await db
      .from('referrals')
      .select('*')
      .eq('referral_code_id', rc.id)
      .eq('referee_device_id', deviceId)
      .eq('status', 'clicked')
      .order('clicked_at', { ascending: false })
      .limit(1)
    referral = data?.[0]
  }

  if (!referral && phone) {
    // Check if this phone already has a referral from this code
    const { data } = await db
      .from('referrals')
      .select('*')
      .eq('referral_code_id', rc.id)
      .eq('referee_phone', phone)
      .in('status', ['clicked', 'booked'])
      .limit(1)
    referral = data?.[0]
  }

  if (!referral) {
    // Grab the most recent clicked referral for this code (within 30 days)
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data } = await db
      .from('referrals')
      .select('*')
      .eq('referral_code_id', rc.id)
      .eq('status', 'clicked')
      .gte('clicked_at', cutoff)
      .order('clicked_at', { ascending: false })
      .limit(1)
    referral = data?.[0]
  }

  if (!referral) {
    // No matching click found — create one retroactively
    const { data: newRef } = await db
      .from('referrals')
      .insert({
        referral_code_id: rc.id,
        referrer_member_id: rc.member_id,
        referee_device_id: deviceId || null,
        referee_phone: phone || null,
        referee_email: email || null,
        status: 'clicked',
      })
      .select('*')
      .single()
    referral = newRef
  }

  if (!referral) {
    return res.status(500).json({ error: 'Failed to create referral record' })
  }

  // --- Fraud checks ---
  const fraudFlags = [...(referral.fraud_flags || [])]
  let isSelfReferral = false

  // 1. Self-referral: referee phone/email matches referrer
  if (referrer) {
    const refPhone = (phone || '').replace(/\D/g, '').slice(-10)
    const referrerPhone = (referrer.phone || '').replace(/\D/g, '').slice(-10)
    if (refPhone && referrerPhone && refPhone === referrerPhone) {
      isSelfReferral = true
      fraudFlags.push('self_referral_phone')
    }
    if (email && referrer.email && email.toLowerCase() === referrer.email.toLowerCase()) {
      isSelfReferral = true
      fraudFlags.push('self_referral_email')
    }
  }

  // 2. Existing client check: does this phone have 2+ completed visits?
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const { data: existingClient } = await db
      .from('blvd_clients')
      .select('id, visit_count')
      .or(`phone.like.%${cleanPhone}`)
      .limit(1)

    if (existingClient?.[0]?.visit_count >= 2) {
      fraudFlags.push('existing_client')
    }
  }

  // 3. Duplicate: same phone already has a completed/credited referral
  if (phone) {
    const { data: dupes } = await db
      .from('referrals')
      .select('id')
      .eq('referee_phone', phone)
      .in('status', ['booked', 'completed', 'credited'])
      .neq('id', referral.id)
      .limit(1)

    if (dupes?.length) {
      fraudFlags.push('duplicate_phone')
    }
  }

  // Update referral to 'booked'
  const updates = {
    status: isSelfReferral ? 'fraud_rejected' : 'booked',
    referee_phone: phone || referral.referee_phone,
    referee_email: email || referral.referee_email,
    referee_device_id: deviceId || referral.referee_device_id,
    appointment_blvd_id: appointmentId || null,
    booking_session_id: bookingSessionId || null,
    location_key: locationKey || null,
    booked_at: new Date().toISOString(),
    is_self_referral: isSelfReferral,
    fraud_flags: fraudFlags,
  }

  // Match Boulevard client
  if (clientId) {
    const { data: blvdClient } = await db
      .from('blvd_clients')
      .select('id')
      .eq('boulevard_id', clientId)
      .limit(1)
    if (blvdClient?.[0]) {
      updates.referee_blvd_client_id = blvdClient[0].id
    }
  }

  await db.from('referrals').update(updates).eq('id', referral.id)

  // Log event
  await db.from('referral_events').insert({
    referral_id: referral.id,
    event_type: isSelfReferral ? 'fraud_flagged' : 'booked',
    metadata: { appointment_id: appointmentId, location_key: locationKey, fraud_flags: fraudFlags },
  })

  // Increment signups count
  if (!isSelfReferral) {
    await db
      .from('referral_codes')
      .update({ total_signups: (rc.total_signups || 0) + 1 })
      .eq('id', rc.id)
  }

  // --- Issue referee $25 credit at booking time (if not fraud) ---
  let refereeCredited = false
  if (!isSelfReferral && !fraudFlags.includes('duplicate_phone') && clientId) {
    try {
      // clientId from Boulevard checkout is already the URN format
      const blvdClientId = clientId.startsWith('urn:') ? clientId : `urn:blvd:Client:${clientId}`
      await adminQuery(
        `mutation IssueRefereeCredit($clientId: ID!) {
          createAccountCreditAdjustment(input: {
            clientId: $clientId
            balanceDelta: 2500
            adjustmentReason: "Referral welcome credit - $25 off your first visit at RELUXE"
          }) {
            client { id currentAccountBalance }
          }
        }`,
        { clientId: blvdClientId }
      )
      refereeCredited = true
      await db.from('referrals').update({ referee_credit_issued: true }).eq('id', referral.id)
    } catch (err) {
      console.error('[referral/attribute] Failed to issue referee credit:', err.message)
      // Non-blocking — the referral is still tracked
    }
  }

  return res.json({
    ok: true,
    referralId: referral.id,
    status: updates.status,
    refereeCredited,
    fraudFlags,
  })
}
