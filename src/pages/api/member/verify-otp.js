// src/pages/api/member/verify-otp.js
// Verifies OTP (email or SMS), links to blvd_clients, upserts members row.
import { createClient } from '@supabase/supabase-js'
import { isValidPhone, toE164, stripPhone } from '@/lib/phoneUtils'
import { isValidEmail, normalizeEmail } from '@/lib/emailUtils'
import { getServiceClient } from '@/lib/supabase'
import { ensureReferralCode } from '@/lib/referralCodes'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'

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
    console.error('[member/verify-otp]', verifyError.message)
    return res.status(400).json({ error: verifyError.message || 'Invalid code' })
  }

  const session = verifyData.session
  const authUser = verifyData.user

  if (!session || !authUser) {
    return res.status(500).json({ error: 'Verification succeeded but no session returned' })
  }

  // Look up blvd_clients
  const db = getServiceClient()
  let blvdClient = null

  if (usePhone) {
    // Phone-based lookup (existing fuzzy match)
    const digits = stripPhone(phone)
    const last10 = digits.slice(-10)
    try {
      const { data } = await db
        .from('blvd_clients')
        .select('id, first_name, last_name, name, email, phone, visit_count, total_spend, last_visit_at')
        .or(`phone.ilike.%${last10}%,phone.ilike.%${last10.slice(0,3)}%${last10.slice(3,6)}%${last10.slice(6)}%`)
        .order('visit_count', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()
      blvdClient = data
    } catch (e) {
      console.warn('[member/verify-otp] blvd_clients phone lookup failed:', e.message)
    }
  } else {
    // Email-based lookup
    const normalized = normalizeEmail(email)
    try {
      const { data } = await db
        .from('blvd_clients')
        .select('id, first_name, last_name, name, email, phone, visit_count, total_spend, last_visit_at')
        .ilike('email', normalized)
        .order('visit_count', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()
      blvdClient = data
    } catch (e) {
      console.warn('[member/verify-otp] blvd_clients email lookup failed:', e.message)
    }

    // Fallback: if email didn't match a Boulevard client, check if an existing
    // member with this email already has a blvd_client_id or phone we can use
    if (!blvdClient) {
      try {
        const { data: existingMember } = await db
          .from('members')
          .select('blvd_client_id, phone')
          .ilike('email', normalized)
          .not('blvd_client_id', 'is', null)
          .limit(1)
          .maybeSingle()

        if (existingMember?.blvd_client_id) {
          // Re-use the already-linked Boulevard client
          const { data } = await db
            .from('blvd_clients')
            .select('id, first_name, last_name, name, email, phone, visit_count, total_spend, last_visit_at')
            .eq('id', existingMember.blvd_client_id)
            .maybeSingle()
          blvdClient = data
        } else {
          // Check if any member with this email has a phone we can cross-reference
          const { data: memberWithPhone } = await db
            .from('members')
            .select('phone')
            .ilike('email', normalized)
            .not('phone', 'is', null)
            .limit(1)
            .maybeSingle()

          if (memberWithPhone?.phone) {
            const digits = stripPhone(memberWithPhone.phone)
            const last10 = digits.slice(-10)
            const { data } = await db
              .from('blvd_clients')
              .select('id, first_name, last_name, name, email, phone, visit_count, total_spend, last_visit_at')
              .or(`phone.ilike.%${last10}%,phone.ilike.%${last10.slice(0,3)}%${last10.slice(3,6)}%${last10.slice(6)}%`)
              .order('visit_count', { ascending: false, nullsFirst: false })
              .limit(1)
              .maybeSingle()
            blvdClient = data
          }
        }
      } catch (e) {
        console.warn('[member/verify-otp] fallback blvd lookup failed:', e.message)
      }
    }
  }

  // ─── Resolve or create member row ───
  // A person may have logged in via SMS before (different auth_user_id).
  // We need to find any existing member by blvd_client or contact info
  // and re-link rather than creating a duplicate.
  const selectCols = 'id, phone, first_name, last_name, email, interests, preferred_location, blvd_client_id, onboarded_at'
  let member = null

  // 1. Check if a member already exists for this auth_user_id (returning via same method)
  const { data: existingByAuth } = await db
    .from('members')
    .select(selectCols)
    .eq('auth_user_id', authUser.id)
    .maybeSingle()

  if (existingByAuth) {
    // Update with latest info
    const updates = { updated_at: new Date().toISOString() }
    if (blvdClient?.id && !existingByAuth.blvd_client_id) updates.blvd_client_id = blvdClient.id
    if (blvdClient?.first_name && !existingByAuth.first_name) updates.first_name = blvdClient.first_name
    if (blvdClient?.last_name && !existingByAuth.last_name) updates.last_name = blvdClient.last_name
    if (useEmail) updates.email = normalizeEmail(email)
    if (usePhone) updates.phone = toE164(phone)

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
    // 3. Or by email/phone match
    if (!existingMember && useEmail) {
      const { data } = await db.from('members').select(selectCols)
        .ilike('email', normalizeEmail(email)).maybeSingle()
      existingMember = data
    }
    if (!existingMember && usePhone) {
      const { data } = await db.from('members').select(selectCols)
        .eq('phone', toE164(phone)).maybeSingle()
      existingMember = data
    }

    if (existingMember) {
      // Re-link existing member to new auth_user_id
      const updates = { auth_user_id: authUser.id, updated_at: new Date().toISOString() }
      if (useEmail) updates.email = normalizeEmail(email)
      if (usePhone) updates.phone = toE164(phone)
      if (blvdClient?.first_name && !existingMember.first_name) updates.first_name = blvdClient.first_name
      if (blvdClient?.last_name && !existingMember.last_name) updates.last_name = blvdClient.last_name

      const { data: updated, error: updateErr } = await db
        .from('members')
        .update(updates)
        .eq('id', existingMember.id)
        .select(selectCols)
        .single()

      if (updateErr) console.error('[member/verify-otp] re-link error:', updateErr.message)
      member = updated || existingMember
    } else {
      // 4. Brand-new member — insert
      const memberData = {
        auth_user_id: authUser.id,
        blvd_client_id: blvdClient?.id || null,
        first_name: blvdClient?.first_name || null,
        last_name: blvdClient?.last_name || null,
        updated_at: new Date().toISOString(),
      }
      if (usePhone) {
        memberData.phone = toE164(phone)
        memberData.email = blvdClient?.email || null
      } else {
        memberData.email = normalizeEmail(email)
        if (blvdClient?.phone) memberData.phone = blvdClient.phone
        // Omit phone entirely if null — let DB default handle it
      }

      const { data: inserted, error: insertErr } = await db
        .from('members')
        .insert(memberData)
        .select(selectCols)
        .single()

      if (insertErr) {
        console.error('[member/verify-otp] insert error:', insertErr.message)
        // Retry without phone if it was a NOT NULL constraint failure
        if (insertErr.message?.includes('null') || insertErr.code === '23502') {
          const fallbackData = { ...memberData }
          delete fallbackData.phone
          const { data: retried } = await db
            .from('members')
            .insert(fallbackData)
            .select(selectCols)
            .single()
          member = retried
        }
      }
      if (!member) member = inserted
    }
  }

  // Auto-enroll in referral program
  if (member?.id) {
    try {
      await ensureReferralCode(db, member.id, member.first_name)
    } catch (e) {
      console.warn('[member/verify-otp] referral auto-enroll failed:', e.message)
    }
  }

  const isReturning = !!blvdClient

  res.json({
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    },
    member: member || { auth_user_id: authUser.id, email: useEmail ? normalizeEmail(email) : null, phone: usePhone ? toE164(phone) : null },
    isReturning,
    blvdClient: blvdClient
      ? {
          name: blvdClient.name || `${blvdClient.first_name || ''} ${blvdClient.last_name || ''}`.trim(),
          visit_count: blvdClient.visit_count || 0,
          total_spend: blvdClient.total_spend || 0,
          last_visit_at: blvdClient.last_visit_at,
        }
      : null,
  })
}
