// src/pages/api/member/referral.js
// GET: Get or create the member's referral code, stats, tier, and recent referrals.
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'
import { generateReferralCode, generateFallbackCode, TIER_INFO } from '@/lib/referralCodes'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired session' })

  const db = getServiceClient()

  const { data: member } = await db
    .from('members')
    .select('id, first_name')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return res.status(404).json({ error: 'Member not found' })

  // Get or create referral code
  let { data: rc } = await db
    .from('referral_codes')
    .select('*')
    .eq('member_id', member.id)
    .maybeSingle()

  if (!rc) {
    // Generate a unique code
    let code = generateReferralCode(member.first_name)
    let attempts = 0

    while (attempts < 10) {
      const { data: existing } = await db
        .from('referral_codes')
        .select('id')
        .eq('code', code)
        .maybeSingle()

      if (!existing) break
      attempts++
      if (attempts >= 5) {
        code = generateFallbackCode()
      } else {
        code = generateReferralCode(member.first_name)
      }
    }

    const { data: newRc, error: insertErr } = await db
      .from('referral_codes')
      .insert({ member_id: member.id, code })
      .select('*')
      .single()

    if (insertErr) {
      console.error('[member/referral] Failed to create code:', insertErr.message)
      return res.status(500).json({ error: 'Failed to create referral code' })
    }
    rc = newRc
  }

  // Get recent referrals
  const { data: referrals } = await db
    .from('referrals')
    .select('id, status, referee_phone, referee_email, location_key, booked_at, completed_at, credited_at, referrer_reward_amount, is_self_referral')
    .eq('referral_code_id', rc.id)
    .neq('status', 'fraud_rejected')
    .order('created_at', { ascending: false })
    .limit(20)

  const tierInfo = TIER_INFO[rc.tier] || TIER_INFO.member

  return res.json({
    code: rc.custom_code || rc.code,
    tier: rc.tier,
    tierLabel: tierInfo.label,
    tierColor: tierInfo.color,
    nextTier: tierInfo.next ? TIER_INFO[tierInfo.next]?.label : null,
    nextTierAt: tierInfo.nextAt,
    stats: {
      total_shares: rc.total_shares,
      total_clicks: rc.total_clicks,
      total_signups: rc.total_signups,
      total_completed: rc.total_completed,
      total_earned: Number(rc.total_earned),
    },
    referrals: (referrals || []).map((r) => ({
      id: r.id,
      status: r.status,
      location: r.location_key,
      bookedAt: r.booked_at,
      completedAt: r.completed_at,
      creditedAt: r.credited_at,
      rewardAmount: Number(r.referrer_reward_amount),
    })),
    referralUrl: `https://reluxemedspa.com/referral/${rc.custom_code || rc.code}`,
  })
}
