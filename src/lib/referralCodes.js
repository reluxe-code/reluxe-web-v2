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
 * Tier display metadata.
 */
export const TIER_INFO = {
  member: { label: 'Member', color: 'neutral', threshold: 0, reward: 25, next: 'advocate', nextAt: 3 },
  advocate: { label: 'Advocate', color: 'emerald', threshold: 3, reward: 30, next: 'ambassador', nextAt: 10 },
  ambassador: { label: 'Ambassador', color: 'violet', threshold: 10, reward: 35, next: 'vip_ambassador', nextAt: 25 },
  vip_ambassador: { label: 'VIP Ambassador', color: 'amber', threshold: 25, reward: 50, next: null, nextAt: null },
}
