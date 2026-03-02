// src/pages/api/member/send-otp.js
// Sends an OTP via Supabase Auth for member login (email or SMS).
import { createClient } from '@supabase/supabase-js'
import { isValidPhone, toE164 } from '@/lib/phoneUtils'
import { isValidEmail, normalizeEmail } from '@/lib/emailUtils'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'
import { safeError, safeLog } from '@/lib/logSanitizer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const ip = getClientIp(req)
  if (applyRateLimit(req, res, rateLimiters.tight, ip)) return
  if (applyRateLimit(req, res, rateLimiters.otpHour, ip)) return

  const { phone, email } = req.body || {}

  // Determine method
  const useEmail = !!email
  const usePhone = !!phone

  if (!useEmail && !usePhone) {
    return res.status(400).json({ error: 'Email or phone number required' })
  }

  // Use a dedicated admin client for auth operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (useEmail) {
    const normalized = normalizeEmail(email)
    if (!isValidEmail(normalized)) {
      return res.status(400).json({ error: 'Valid email address required' })
    }

    // Ensure auth user exists (email_confirm: true so Supabase doesn't send its own confirmation email)
    await supabase.auth.admin.createUser({
      email: normalized,
      email_confirm: true,
    }).catch((e) => {
      safeError('[member/send-otp] createUser (email) exception:', e.message)
      return { error: null }
    })

    safeLog('[member/send-otp] Sending email OTP')
    const { data: otpData, error: otpError } = await anonClient.auth.signInWithOtp({ email: normalized })

    if (otpError) {
      safeError('[member/send-otp] Email OTP error:', JSON.stringify({
        message: otpError.message,
        status: otpError.status,
        code: otpError.code,
      }, null, 2))
      if (otpError.status === 429 || otpError.code === 'over_email_send_rate_limit' || otpError.message?.includes('rate') || otpError.message?.includes('seconds')) {
        return res.status(429).json({ error: 'Please wait a moment before requesting another code.' })
      }
      return res.status(500).json({ error: 'Failed to send verification code' })
    }

    safeLog('[member/send-otp] Email OTP sent successfully')
    return res.json({ success: true, method: 'email' })
  }

  // Phone path (existing logic)
  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: 'Valid US phone number required' })
  }

  const e164 = toE164(phone)

  // Ensure auth user exists
  const { error } = await supabase.auth.admin.createUser({
    phone: e164,
    phone_confirm: false,
  }).catch((e) => {
    safeError('[member/send-otp] createUser exception:', e.message)
    return { error: null }
  })
  if (error) {
    safeLog('[member/send-otp] createUser error (may be expected):', error.message)
  }

  safeLog('[member/send-otp] Sending SMS OTP')
  const { data: otpData, error: otpError } = await anonClient.auth.signInWithOtp({ phone: e164 })

  if (otpError) {
    safeError('[member/send-otp] SMS OTP error:', JSON.stringify({
      message: otpError.message,
      status: otpError.status,
      code: otpError.code,
    }, null, 2))
    if (otpError.message?.includes('rate')) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' })
    }
    return res.status(500).json({ error: 'Failed to send verification code' })
  }

  safeLog('[member/send-otp] SMS OTP sent successfully')
  res.json({ success: true, method: 'sms' })
}
