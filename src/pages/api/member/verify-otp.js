// src/pages/api/member/verify-otp.js
// Verifies OTP (email or SMS), links to blvd_clients, upserts members row.
import { createClient } from '@supabase/supabase-js'
import { isValidPhone, toE164 } from '@/lib/phoneUtils'
import { isValidEmail, normalizeEmail } from '@/lib/emailUtils'
import { getServiceClient } from '@/lib/supabase'
import { ensureReferralCode } from '@/lib/referralCodes'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'
import { hashPhone, hashEmail } from '@/lib/piiHash'
import { resolveClient } from '@/services/phiProxy'
import { safeError, safeWarn } from '@/lib/logSanitizer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (applyRateLimit(req, res, rateLimiters.tight, getClientIp(req))) return

  const { phone, email, code } = req.body || {}

  const useEmail = !!email
  const usePhone = !!phone

  if (!useEmail && !usePhone) {
    return res.status(400).json({ error: 'Email or phone required' })
  }
  if (!code || code.length !== 6) {
    return res.status(400).json({ error: 'Six-digit code required' })
  }

  // Validate the identifier
  if (usePhone && !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Valid US phone number required' })
  }
  if (useEmail && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address required' })
  }

  // Verify OTP with anon client (returns session tokens)
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  let verifyPayload
  if (useEmail) {
    const normalized = normalizeEmail(email)
    verifyPayload = { email: normalized, token: code, type: 'email' }
  } else {
    const e164 = toE164(phone)
    verifyPayload = { phone: e164, token: code, type: 'sms' }
  }

  const { data: verifyData, error: verifyError } = await anonClient.auth.verifyOtp(verifyPayload)

  if (verifyError) {
    safeError('[member/verify-otp]', verifyError.message)
    return res.status(400).json({ error: verifyError.message || 'Invalid code' })
  }

  const session = verifyData.session
  const authUser = verifyData.user

  if (!session || !authUser) {
    return res.status(500).json({ error: 'Verification succeeded but no session returned' })
  }

  // Look up blvd_clients — hash-based lookup only (no raw PII columns)
  const db = getServiceClient()
  const blvdSelect = 'id, boulevard_id, phone_hash_v1, email_hash_v1, visit_count, total_spend, last_visit_at'
  let blvdClient = null

  if (usePhone) {
    // Hash-based phone lookup (primary)
    const phoneHash = hashPhone(toE164(phone))
    if (phoneHash) {
      try {
        const { data } = await db
          .from('blvd_clients')
          .select(blvdSelect)
          .eq('phone_hash_v1', phoneHash)
          .order('visit_count', { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle()
        blvdClient = data
      } catch (e) {
        safeWarn('[member/verify-otp] blvd_clients hash lookup failed:', e.message)
      }
    }
  } else {
    // Hash-based email lookup (primary)
    const normalized = normalizeEmail(email)
    const emailHash = hashEmail(normalized)
    if (emailHash) {
      try {
        const { data } = await db
          .from('blvd_clients')
          .select(blvdSelect)
          .eq('email_hash_v1', emailHash)
          .order('visit_count', { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle()
        blvdClient = data
      } catch (e) {
        safeWarn('[member/verify-otp] blvd_clients hash email lookup failed:', e.message)
      }
    }
    // Fallback: check existing member by email hash for blvd_client_id or phone hash cross-ref
    if (!blvdClient) {
      try {
        const memberEmailHash = hashEmail(normalized)
        let existingMember = null
        if (memberEmailHash) {
          const { data } = await db.from('members').select('blvd_client_id, phone_hash_v1')
            .eq('email_hash_v1', memberEmailHash).not('blvd_client_id', 'is', null).limit(1).maybeSingle()
          existingMember = data
        }

        if (existingMember?.blvd_client_id) {
          const { data } = await db.from('blvd_clients').select(blvdSelect)
            .eq('id', existingMember.blvd_client_id).maybeSingle()
          blvdClient = data
        } else if (existingMember?.phone_hash_v1) {
          const { data } = await db.from('blvd_clients').select(blvdSelect)
            .eq('phone_hash_v1', existingMember.phone_hash_v1)
            .order('visit_count', { ascending: false, nullsFirst: false }).limit(1).maybeSingle()
          blvdClient = data
        }
      } catch (e) {
        safeWarn('[member/verify-otp] fallback blvd lookup failed:', e.message)
      }
    }
  }

  // Resolve PII transiently via PHI Proxy for member record population
  let resolvedPii = null
  if (blvdClient?.boulevard_id) {
    resolvedPii = await resolveClient(blvdClient.boulevard_id, { masked: false })
  }

  // ─── Resolve or create member row ───
  // A person may have logged in via SMS before (different auth_user_id).
  // We need to find any existing member by blvd_client or contact info
  // and re-link rather than creating a duplicate.
  const selectCols = 'id, phone_hash_v1, email_hash_v1, interests, preferred_location, blvd_client_id, onboarded_at'
  let member = null

  // 1. Check if a member already exists for this auth_user_id (returning via same method)
  const { data: existingByAuth } = await db
    .from('members')
    .select(selectCols)
    .eq('auth_user_id', authUser.id)
    .maybeSingle()

  if (existingByAuth) {
    // Update with latest info (hash-only — no raw PII persisted)
    const updates = { updated_at: new Date().toISOString() }
    if (blvdClient?.id && !existingByAuth.blvd_client_id) updates.blvd_client_id = blvdClient.id
    if (useEmail) updates.email_hash_v1 = hashEmail(normalizeEmail(email))
    if (usePhone) updates.phone_hash_v1 = hashPhone(toE164(phone))

    const { data: updated } = await db
      .from('members')
      .update(updates)
      .eq('id', existingByAuth.id)
      .select(selectCols)
      .single()
    member = updated || existingByAuth
  } else {
    // 2. Check if a member exists via blvd_client_id (same person, different login method)
    let existingMember = null
    if (blvdClient?.id) {
      const { data } = await db.from('members').select(selectCols)
        .eq('blvd_client_id', blvdClient.id).maybeSingle()
      existingMember = data
    }
    // 3. Or by email/phone hash match
    if (!existingMember && useEmail) {
      const eHash = hashEmail(normalizeEmail(email))
      if (eHash) {
        const { data } = await db.from('members').select(selectCols).eq('email_hash_v1', eHash).maybeSingle()
        existingMember = data
      }
    }
    if (!existingMember && usePhone) {
      const pHash = hashPhone(toE164(phone))
      if (pHash) {
        const { data } = await db.from('members').select(selectCols).eq('phone_hash_v1', pHash).maybeSingle()
        existingMember = data
      }
    }

    if (existingMember) {
      // Re-link existing member to new auth_user_id (hash-only)
      const updates = { auth_user_id: authUser.id, updated_at: new Date().toISOString() }
      if (useEmail) updates.email_hash_v1 = hashEmail(normalizeEmail(email))
      if (usePhone) updates.phone_hash_v1 = hashPhone(toE164(phone))

      const { data: updated, error: updateErr } = await db
        .from('members')
        .update(updates)
        .eq('id', existingMember.id)
        .select(selectCols)
        .single()

      if (updateErr) safeError('[member/verify-otp] re-link error:', updateErr.message)
      member = updated || existingMember
    } else {
      // 4. Brand-new member — insert (hash-only — no raw PII persisted)
      const memberData = {
        auth_user_id: authUser.id,
        blvd_client_id: blvdClient?.id || null,
        updated_at: new Date().toISOString(),
      }
      if (usePhone) {
        memberData.phone_hash_v1 = hashPhone(toE164(phone))
        if (resolvedPii?.email) memberData.email_hash_v1 = hashEmail(resolvedPii.email)
      } else {
        memberData.email_hash_v1 = hashEmail(normalizeEmail(email))
        if (resolvedPii?.mobilePhone) memberData.phone_hash_v1 = hashPhone(resolvedPii.mobilePhone)
      }

      const { data: inserted, error: insertErr } = await db
        .from('members')
        .insert(memberData)
        .select(selectCols)
        .single()

      if (insertErr) {
        safeError('[member/verify-otp] insert error:', insertErr.message)
      }
      if (!member) member = inserted
    }
  }

  // Auto-enroll in referral program
  if (member?.id) {
    try {
      await ensureReferralCode(db, member.id, resolvedPii?.firstName || null)
    } catch (e) {
      safeWarn('[member/verify-otp] referral auto-enroll failed:', e.message)
    }
  }

  const isReturning = !!blvdClient

  res.json({
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    },
    member: member ? {
      id: member.id,
      interests: member.interests,
      preferred_location: member.preferred_location,
      blvd_client_id: member.blvd_client_id,
      onboarded_at: member.onboarded_at,
      // Transient PII from PHI Proxy (not persisted)
      first_name: resolvedPii?.firstName || null,
    } : { auth_user_id: authUser.id },
    isReturning,
    blvdClient: blvdClient
      ? {
          name: resolvedPii ? `${resolvedPii.firstName || ''} ${resolvedPii.lastName || ''}`.trim() : null,
          visit_count: blvdClient.visit_count || 0,
          total_spend: blvdClient.total_spend || 0,
          last_visit_at: blvdClient.last_visit_at,
        }
      : null,
  })
}
