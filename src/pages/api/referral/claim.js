// src/pages/api/referral/claim.js
// Authenticated endpoint: referee claims a referral code to lock in $25 credit.
// Creates/updates a referral with status 'claimed'.
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'
import { resolveReferralCode } from '@/lib/referralCodes'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { code, deviceId } = req.body
  if (!code) return res.status(400).json({ error: 'code required' })

  // Authenticate
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' })

  const db = getServiceClient()

  // Find member
  const { data: member } = await db
    .from('members')
    .select('id, phone, email')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) {
    return res.status(400).json({ error: 'Member not found. Please verify your phone first.' })
  }

  // Resolve referral code
  const rc = await resolveReferralCode(db, code)
  if (!rc) return res.status(404).json({ error: 'Invalid referral code' })

  // Self-referral check
  if (rc.member_id === member.id) {
    return res.status(400).json({ error: "You can't claim your own referral code" })
  }

  // Check if this member already has a claimed/booked/credited referral
  const memberPhone = (member.phone || '').replace(/\D/g, '').slice(-10)
  if (memberPhone) {
    const { data: alreadyClaimed } = await db
      .from('referrals')
      .select('id')
      .ilike('referee_phone', `%${memberPhone}`)
      .in('status', ['claimed', 'booked', 'completed', 'credited'])
      .limit(1)

    if (alreadyClaimed?.length) {
      return res.status(409).json({ error: 'You have already claimed a referral credit' })
    }
  }

  // Find existing referral for this code (clicked or invited)
  let referral = null

  // Match by device ID
  if (deviceId) {
    const { data } = await db
      .from('referrals')
      .select('*')
      .eq('referral_code_id', rc.id)
      .eq('referee_device_id', deviceId)
      .in('status', ['clicked', 'invited'])
      .order('clicked_at', { ascending: false })
      .limit(1)
    referral = data?.[0]
  }

  // Match by phone
  if (!referral && memberPhone) {
    const { data } = await db
      .from('referrals')
      .select('*')
      .eq('referral_code_id', rc.id)
      .ilike('referee_phone', `%${memberPhone}`)
      .in('status', ['clicked', 'invited'])
      .order('clicked_at', { ascending: false })
      .limit(1)
    referral = data?.[0]
  }

  // Match most recent click for this code (within 30 days)
  if (!referral) {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data } = await db
      .from('referrals')
      .select('*')
      .eq('referral_code_id', rc.id)
      .in('status', ['clicked', 'invited'])
      .gte('clicked_at', cutoff)
      .order('clicked_at', { ascending: false })
      .limit(1)
    referral = data?.[0]
  }

  const now = new Date().toISOString()

  if (referral) {
    // Update existing referral to claimed
    await db.from('referrals').update({
      status: 'claimed',
      claimed_at: now,
      referee_phone: member.phone || referral.referee_phone,
      referee_email: member.email || referral.referee_email,
    }).eq('id', referral.id)

    await db.from('referral_events').insert({
      referral_id: referral.id,
      event_type: 'claimed',
      metadata: { member_id: member.id, code },
    })
  } else {
    // Create new referral as claimed
    const { data: newRef, error: insertErr } = await db
      .from('referrals')
      .insert({
        referral_code_id: rc.id,
        referrer_member_id: rc.member_id,
        referee_phone: member.phone,
        referee_email: member.email,
        referee_device_id: deviceId || null,
        status: 'claimed',
        claimed_at: now,
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('[referral/claim] insert error:', insertErr.message)
      return res.status(500).json({ error: 'Failed to create claim' })
    }

    await db.from('referral_events').insert({
      referral_id: newRef.id,
      event_type: 'claimed',
      metadata: { member_id: member.id, code },
    })
  }

  // Increment signups count on the referral code
  await db.from('referral_codes')
    .update({ total_signups: (rc.total_signups || 0) + 1 })
    .eq('id', rc.id)

  return res.json({
    ok: true,
    creditAmount: 25,
    message: "You've claimed $25 in RELUXE credit!",
  })
}
