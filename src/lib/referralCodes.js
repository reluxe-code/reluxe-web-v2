// src/lib/referralCodes.js
// Referral code generation utilities.

const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I,O,0,1

/**
 * Generate a referral code from the member's first name.
 * Format: FIRSTNAME + 2 random digits (e.g., SARAH25)
 */
export function generateReferralCode(firstName) {
  const clean = (firstName || 'RELUXE')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 8)
  const suffix = String(Math.floor(Math.random() * 100)).padStart(2, '0')
  return `${clean}${suffix}`
}

/**
 * Fallback code when name-based codes collide.
 * Format: RLX-XXXXX (5 alphanumeric chars)
 */
export function generateFallbackCode() {
  let code = 'RLX-'
  for (let i = 0; i < 5; i++) {
    code += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
  }
  return code
}

/**
 * Reward amount based on tier.
 */
export function getRewardAmount(tier) {
  switch (tier) {
    case 'vip_ambassador': return 50
    case 'ambassador': return 35
    case 'advocate': return 30
    default: return 25
  }
}

/**
 * Compute tier from total completed referrals.
 */
export function computeTier(totalCompleted) {
  if (totalCompleted >= 25) return 'vip_ambassador'
  if (totalCompleted >= 10) return 'ambassador'
  if (totalCompleted >= 3) return 'advocate'
  return 'member'
}

/**
 * Resolve a referral code or phone number to a referral_codes row.
 * Tries: code/custom_code match → phone number → null.
 * If a member is found by phone but has no referral code, auto-creates one.
 * Requires a Supabase service client (db).
 */
export async function resolveReferralCode(db, input) {
  if (!input) return null

  // 1. Try code/custom_code match
  const { data: byCode } = await db
    .from('referral_codes')
    .select('id, member_id, code, custom_code, tier, total_shares, total_clicks, total_signups, total_completed, total_earned')
    .or(`code.eq.${input},custom_code.eq.${input}`)
    .limit(1)
    .maybeSingle()

  if (byCode) return byCode

  // 2. Try phone number lookup — strip to last 10 digits
  const digits = input.replace(/\D/g, '')
  if (digits.length < 7) return null // not a phone number

  const last10 = digits.slice(-10)
  const { data: member } = await db
    .from('members')
    .select('id, first_name, phone')
    .or(`phone.ilike.%${last10}`)
    .limit(1)
    .maybeSingle()

  if (!member) return null

  // Found member by phone — check if they already have a referral code
  const { data: existingCode } = await db
    .from('referral_codes')
    .select('id, member_id, code, custom_code, tier, total_shares, total_clicks, total_signups, total_completed, total_earned')
    .eq('member_id', member.id)
    .limit(1)
    .maybeSingle()

  if (existingCode) return existingCode

  // Auto-create referral code for this member
  let code = generateReferralCode(member.first_name)
  let attempts = 0
  while (attempts < 10) {
    const { data: dup } = await db
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .maybeSingle()
    if (!dup) break
    attempts++
    code = attempts >= 5 ? generateFallbackCode() : generateReferralCode(member.first_name)
  }

  const { data: newCode } = await db
    .from('referral_codes')
    .insert({ member_id: member.id, code })
    .select('id, member_id, code, custom_code, tier, total_shares, total_clicks, total_signups, total_completed, total_earned')
    .single()

  return newCode || null
}

/**
 * Ensure a member has a referral code. Creates one if missing.
 * Returns the referral_codes row (existing or newly created).
 * Requires a Supabase service client (db) and a member_id + first_name.
 */
export async function ensureReferralCode(db, memberId, firstName) {
  // Check if member already has a code
  const { data: existing } = await db
    .from('referral_codes')
    .select('id, code')
    .eq('member_id', memberId)
    .limit(1)
    .maybeSingle()

  if (existing) return existing

  // Generate and insert a unique code
  let code = generateReferralCode(firstName)
  let attempts = 0
  while (attempts < 10) {
    const { data: dup } = await db
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .maybeSingle()
    if (!dup) break
    attempts++
    code = attempts >= 5 ? generateFallbackCode() : generateReferralCode(firstName)
  }

  const { data: newCode } = await db
    .from('referral_codes')
    .insert({ member_id: memberId, code, is_primary: true })
    .select('id, code')
    .single()

  return newCode || null
}

/**
 * Tier display metadata.
 */
export const TIER_INFO = {
  member: { label: 'Member', color: 'neutral', threshold: 0, reward: 25, next: 'advocate', nextAt: 3 },
  advocate: { label: 'Advocate', color: 'emerald', threshold: 3, reward: 30, next: 'ambassador', nextAt: 10 },
  ambassador: { label: 'Ambassador', color: 'violet', threshold: 10, reward: 35, next: 'vip_ambassador', nextAt: 25 },
  vip_ambassador: { label: 'VIP Ambassador', color: 'amber', threshold: 25, reward: 50, next: null, nextAt: null },
}
