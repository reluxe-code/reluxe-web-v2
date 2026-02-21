// src/pages/api/referral/[code].js
// Validate a referral code (or phone number) and return referrer info.
import { getServiceClient } from '@/lib/supabase'
import { resolveReferralCode } from '@/lib/referralCodes'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { code } = req.query
  if (!code) return res.status(400).json({ error: 'Code required' })

  const db = getServiceClient()
  const rc = await resolveReferralCode(db, code)

  if (!rc) {
    return res.status(404).json({ valid: false, error: 'Invalid referral code' })
  }

  // Get referrer's first name
  const { data: member } = await db
    .from('members')
    .select('first_name')
    .eq('id', rc.member_id)
    .single()

  return res.json({
    valid: true,
    code: rc.code,
    tier: rc.tier,
    referrerFirstName: member?.first_name || 'A friend',
  })
}
