// src/pages/api/member/send-otp.js
// Sends an SMS OTP via Supabase Auth for member phone login.
import { createClient } from '@supabase/supabase-js'
import { isValidPhone, toE164 } from '@/lib/phoneUtils'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { phone } = req.body || {}
  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Valid US phone number required' })
  }

  const e164 = toE164(phone)

  // Use a dedicated admin client for auth operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error } = await supabase.auth.admin.createUser({
    phone: e164,
    phone_confirm: false,
  }).catch(() => ({ error: null }))
  // Ignore "user already exists" — we just want to ensure the user exists

  // Now send the OTP
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { error: otpError } = await anonClient.auth.signInWithOtp({ phone: e164 })

  if (otpError) {
    console.error('[member/send-otp]', otpError.message)
    if (otpError.message.includes('rate')) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' })
    }
    return res.status(500).json({ error: 'Failed to send verification code' })
  }

  res.json({ success: true })
}
