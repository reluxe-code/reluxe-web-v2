// src/pages/api/admin/referral/enroll.js
// Manual referral enrollment — create member + referral code from paper card.
// POST { firstName, lastName, phone }
import { getServiceClient } from '@/lib/supabase'
import { generateReferralCode, generateFallbackCode } from '@/lib/referralCodes'
import { hashPhone } from '@/lib/piiHash'
import { withAdminAuth } from '@/lib/adminAuth'

function normalizePhone(raw) {
  const digits = (raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

async function handler(req, res) {
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
    // Check if member already exists by phone hash
    const phoneHash = hashPhone(normalized)
    const { data: existingMember } = await db
      .from('members')
      .select('id')
      .eq('phone_hash_v1', phoneHash)
      .limit(1)
      .maybeSingle()

    let memberId

    if (existingMember) {
      memberId = existingMember.id
    } else {
      // Create new member
      const { data: newMember, error: memberErr } = await db
        .from('members')
        .insert({
          first_name: firstName.trim(),
          last_name: (lastName || '').trim() || null,
          phone: normalized,
          phone_hash_v1: phoneHash,
        })
        .select('id')
        .single()

      if (memberErr) {
        console.error('[admin/referral/enroll] member insert:', memberErr.message)
        return res.status(500).json({ error: 'Failed to create member' })
      }
      memberId = newMember.id
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

      return res.json({
        ok: true,
        alreadyEnrolled: true,
        memberId,
        code,
        referralUrl,
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

    return res.json({
      ok: true,
      alreadyEnrolled: false,
      memberId,
      code,
      referralUrl,
    })
  } catch (err) {
    console.error('[admin/referral/enroll]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
