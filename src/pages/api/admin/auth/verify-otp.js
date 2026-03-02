// src/pages/api/admin/auth/verify-otp.js
// Verifies OTP code for admin login. Double-checks ADMIN_EMAILS after verification.
import { createClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/adminAuth'
import { rateLimiters, applyRateLimit, getClientIp } from '@/lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const ip = getClientIp(req)
  if (applyRateLimit(req, res, rateLimiters.tight, ip)) return

  const { email, code } = req.body || {}
  if (!email?.trim() || !code?.trim()) {
    return res.status(400).json({ error: 'Email and code required' })
  }

  const normalized = email.trim().toLowerCase()

  if (!isAdminEmail(normalized)) {
    return res.status(403).json({ error: 'Access denied' })
  }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data, error: verifyError } = await anonClient.auth.verifyOtp({
    email: normalized,
    token: code.trim(),
    type: 'email',
  })

  if (verifyError) {
    return res.status(400).json({ error: 'Invalid or expired code' })
  }

  if (!data?.session) {
    return res.status(400).json({ error: 'Verification failed' })
  }

  return res.json({
    ok: true,
    session: data.session,
  })
}
