// src/pages/api/admin/referral/enroll.js
// Manual referral enrollment — create member + referral code from paper card.
// POST { firstName, lastName, phone }
import { getServiceClient } from '@/lib/supabase'
import { generateReferralCode, generateFallbackCode } from '@/lib/referralCodes'

function normalizePhone(raw) {
  const digits = (raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { firstName, lastName, phone } = req.body
  if (!firstName || !phone) {
    return res.status(400).json({ error: 'firstName and phone are required' })
  }

  const normalized = normalizePhone(phone)
  if (!normalized) {
    return res.status(400).json({ error: 'Invalid phone number — must be 10 digits' })
  }

  const db = getServiceClient()

  try {
    // Check if member already exists by phone
    const last10 = normalized.replace(/\D/g, '').slice(-10)
    const { data: existingMember } = await db
      .from('members')
      .select('id, first_name, last_name, phone')
      .or(`phone.ilike.%${last10}`)
      .limit(1)
      .maybeSingle()

    let memberId
    let memberName

    if (existingMember) {
      memberId = existingMember.id
      memberName = `${existingMember.first_name || ''} ${existingMember.last_name || ''}`.trim()
    } else {
      // Create new member
      const { data: newMember, error: memberErr } = await db
        .from('members')
        .insert({
          first_name: firstName.trim(),
          last_name: (lastName || '').trim() || null,
          phone: normalized,
        })
        .select('id')
        .single()

      if (memberErr) {
        console.error('[admin/referral/enroll] member insert:', memberErr.message)
        return res.status(500).json({ error: 'Failed to create member' })
      }
      memberId = newMember.id
      memberName = `${firstName.trim()} ${(lastName || '').trim()}`.trim()
    }

    // Check if member already has a referral code
    const { data: existingCode } = await db
      .from('referral_codes')
      .select('id, code, custom_code, tier')
      .eq('member_id', memberId)
      .eq('is_primary', true)
      .maybeSingle()

    if (existingCode) {
      const code = existingCode.custom_code || existingCode.code
      const referralUrl = `https://reluxemedspa.com/referral/${code}`
      const smsBody = encodeURIComponent(`Hey! I wanted to share my RELUXE Med Spa referral link with you. You'll get $25 off your first treatment: ${referralUrl}`)

      return res.json({
        ok: true,
        alreadyEnrolled: true,
        memberId,
        memberName,
        code,
        referralUrl,
        smsLink: `sms:${normalized}?body=${smsBody}`,
      })
    }

    // Generate unique referral code
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

    const { error: codeErr } = await db
      .from('referral_codes')
      .insert({
        member_id: memberId,
        code,
        is_primary: true,
        tier: 'member',
      })

    if (codeErr) {
      console.error('[admin/referral/enroll] code insert:', codeErr.message)
      return res.status(500).json({ error: 'Failed to create referral code' })
    }

    const referralUrl = `https://reluxemedspa.com/referral/${code}`
    const smsBody = encodeURIComponent(`Hey! I wanted to share my RELUXE Med Spa referral link with you. You'll get $25 off your first treatment: ${referralUrl}`)

    return res.json({
      ok: true,
      alreadyEnrolled: false,
      memberId,
      memberName,
      code,
      referralUrl,
      smsLink: `sms:${normalized}?body=${smsBody}`,
    })
  } catch (err) {
    console.error('[admin/referral/enroll]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
