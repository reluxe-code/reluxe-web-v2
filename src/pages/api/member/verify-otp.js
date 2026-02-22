// src/pages/api/member/verify-otp.js
// Verifies SMS OTP, links to blvd_clients, upserts members row.
import { createClient } from '@supabase/supabase-js'
import { isValidPhone, toE164, stripPhone } from '@/lib/phoneUtils'
import { getServiceClient } from '@/lib/supabase'
import { ensureReferralCode } from '@/lib/referralCodes'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { phone, code } = req.body || {}
  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Valid US phone number required' })
  }
  if (!code || code.length !== 6) {
    return res.status(400).json({ error: 'Six-digit code required' })
  }

  const e164 = toE164(phone)

  // Verify OTP with anon client (returns session tokens)
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: verifyData, error: verifyError } = await anonClient.auth.verifyOtp({
    phone: e164,
    token: code,
    type: 'sms',
  })

  if (verifyError) {
    console.error('[member/verify-otp]', verifyError.message)
    return res.status(400).json({ error: verifyError.message || 'Invalid code' })
  }

  const session = verifyData.session
  const authUser = verifyData.user

  if (!session || !authUser) {
    return res.status(500).json({ error: 'Verification succeeded but no session returned' })
  }

  // Look up blvd_clients by phone using service client
  const db = getServiceClient()
  const digits = stripPhone(phone)
  const last10 = digits.slice(-10)

  let blvdClient = null
  try {
    const { data } = await db
      .from('blvd_clients')
      .select('id, first_name, last_name, name, email, phone, visit_count, total_spend, last_visit_at')
      .or(`phone.ilike.%${last10}%,phone.ilike.%${last10.slice(0,3)}%${last10.slice(3,6)}%${last10.slice(6)}%`)
      .limit(1)
      .maybeSingle()
    blvdClient = data
  } catch (e) {
    console.warn('[member/verify-otp] blvd_clients lookup failed:', e.message)
  }

  // Upsert members row
  const memberData = {
    auth_user_id: authUser.id,
    phone: e164,
    blvd_client_id: blvdClient?.id || null,
    first_name: blvdClient?.first_name || null,
    last_name: blvdClient?.last_name || null,
    email: blvdClient?.email || null,
    updated_at: new Date().toISOString(),
  }

  const { data: member, error: upsertError } = await db
    .from('members')
    .upsert(memberData, { onConflict: 'phone' })
    .select('id, phone, first_name, last_name, email, interests, preferred_location, blvd_client_id, onboarded_at')
    .single()

  if (upsertError) {
    console.error('[member/verify-otp] upsert error:', upsertError.message)
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
    member: member || memberData,
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
