// src/pages/api/member/referral.js
// GET: Get or create the member's referral codes, aggregated stats, tier, and recent referrals.
// POST: Create a new custom referral code (up to 5 total per member).
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'
import { generateReferralCode, generateFallbackCode, TIER_INFO } from '@/lib/referralCodes'

const MAX_CODES = 5

async function authenticateMember(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return { error: 'Authentication required' }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return { error: 'Invalid or expired session' }

  const db = getServiceClient()
  const { data: member } = await db
    .from('members')
    .select('id, first_name, phone')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return { error: 'Member not found' }
  return { member, db }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)
  return res.status(405).json({ error: 'GET or POST only' })
}

async function handleGet(req, res) {
  const auth = await authenticateMember(req)
  if (auth.error) return res.status(401).json({ error: auth.error })
  const { member, db } = auth

  // Get all codes for this member
  let { data: codes } = await db
    .from('referral_codes')
    .select('*')
    .eq('member_id', member.id)
    .order('created_at', { ascending: true })

  if (!codes?.length) {
    // Auto-create primary code
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
      code = attempts >= 5 ? generateFallbackCode() : generateReferralCode(member.first_name)
    }

    const { data: newRc, error: insertErr } = await db
      .from('referral_codes')
      .insert({ member_id: member.id, code, is_primary: true })
      .select('*')
      .single()

    if (insertErr) {
      console.error('[member/referral] Failed to create code:', insertErr.message)
      return res.status(500).json({ error: 'Failed to create referral code' })
    }
    codes = [newRc]
  }

  // Aggregate stats across all codes
  const stats = {
    total_shares: 0,
    total_clicks: 0,
    total_signups: 0,
    total_completed: 0,
    total_earned: 0,
  }
  for (const c of codes) {
    stats.total_shares += c.total_shares || 0
    stats.total_clicks += c.total_clicks || 0
    stats.total_signups += c.total_signups || 0
    stats.total_completed += c.total_completed || 0
    stats.total_earned += Number(c.total_earned || 0)
  }

  // Tier from primary code (or first code)
  const primaryCode = codes.find(c => c.is_primary) || codes[0]
  const tierInfo = TIER_INFO[primaryCode.tier] || TIER_INFO.member

  // Get recent referrals across all codes
  const codeIds = codes.map(c => c.id)
  const { data: referrals } = await db
    .from('referrals')
    .select('id, status, referee_phone, referee_email, location_key, clicked_at, booked_at, completed_at, credited_at, referrer_reward_amount, is_self_referral')
    .in('referral_code_id', codeIds)
    .neq('status', 'fraud_rejected')
    .order('created_at', { ascending: false })
    .limit(20)

  // Format phone for display (member can share their phone number too)
  const phoneDisplay = member.phone
    ? member.phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    : null

  return res.json({
    code: primaryCode.custom_code || primaryCode.code,
    codes: codes.map(c => ({
      id: c.id,
      code: c.custom_code || c.code,
      isPrimary: !!c.is_primary,
      createdAt: c.created_at,
    })),
    canAddCode: codes.length < MAX_CODES,
    phoneCode: phoneDisplay,
    tier: primaryCode.tier,
    tierLabel: tierInfo.label,
    tierColor: tierInfo.color,
    nextTier: tierInfo.next ? TIER_INFO[tierInfo.next]?.label : null,
    nextTierAt: tierInfo.nextAt,
    stats,
    recentReferrals: (referrals || []).map((r) => ({
      id: r.id,
      status: r.status,
      referee_phone: r.referee_phone,
      referee_email: r.referee_email,
      location: r.location_key,
      clicked_at: r.clicked_at,
      bookedAt: r.booked_at,
      completedAt: r.completed_at,
      creditedAt: r.credited_at,
      rewardAmount: Number(r.referrer_reward_amount),
    })),
    referralUrl: `https://reluxemedspa.com/referral/${primaryCode.custom_code || primaryCode.code}`,
  })
}

async function handlePost(req, res) {
  const auth = await authenticateMember(req)
  if (auth.error) return res.status(401).json({ error: auth.error })
  const { member, db } = auth

  const { customCode } = req.body
  if (!customCode || typeof customCode !== 'string') {
    return res.status(400).json({ error: 'customCode is required' })
  }

  // Sanitize: uppercase, alphanumeric + hyphens only, 3-20 chars
  const clean = customCode.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20)
  if (clean.length < 3) {
    return res.status(400).json({ error: 'Code must be at least 3 characters (letters, numbers, hyphens)' })
  }

  // Check member's code count
  const { count } = await db
    .from('referral_codes')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', member.id)

  if (count >= MAX_CODES) {
    return res.status(400).json({ error: `Maximum of ${MAX_CODES} referral codes allowed` })
  }

  // Check uniqueness against both code and custom_code columns
  const { data: existing } = await db
    .from('referral_codes')
    .select('id')
    .or(`code.eq.${clean},custom_code.eq.${clean}`)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return res.status(409).json({ error: 'This code is already taken. Try a different one.' })
  }

  // Get the primary code to copy tier info
  const { data: primary } = await db
    .from('referral_codes')
    .select('tier')
    .eq('member_id', member.id)
    .eq('is_primary', true)
    .maybeSingle()

  const { data: newCode, error } = await db
    .from('referral_codes')
    .insert({
      member_id: member.id,
      code: clean,
      tier: primary?.tier || 'member',
      is_primary: false,
    })
    .select('id, code, is_primary, created_at')
    .single()

  if (error) {
    console.error('[member/referral] create custom code error:', error.message)
    return res.status(500).json({ error: 'Failed to create code' })
  }

  return res.json({
    ok: true,
    code: newCode.code,
    referralUrl: `https://reluxemedspa.com/referral/${newCode.code}`,
  })
}
