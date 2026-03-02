// src/pages/api/admin/auth/send-otp.js
// Sends OTP code for admin login. Only whitelisted ADMIN_EMAILS can request a code.
import { createClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/adminAuth'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const ip = getClientIp(req)
  if (applyRateLimit(req, res, rateLimiters.tight, ip)) return

  const { email } = req.body || {}
  if (!email?.trim()) {
    return res.status(400).json({ error: 'Email required' })
  }

  const normalized = email.trim().toLowerCase()

  // Gate: only admin emails can request OTP
  if (!isAdminEmail(normalized)) {
    return res.status(403).json({ error: 'Access denied' })
  }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { error: otpError } = await anonClient.auth.signInWithOtp({ email: normalized })

  if (otpError) {
    if (otpError.status === 429 || otpError.message?.includes('rate') || otpError.message?.includes('seconds')) {
      return res.status(429).json({ error: 'Please wait a moment before requesting another code.' })
    }
    return res.status(500).json({ error: 'Failed to send verification code' })
  }

  return res.json({ ok: true })
}
