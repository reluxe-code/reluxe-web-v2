// src/lib/adminAuth.js
// Shared admin authentication: verifies Supabase session + ADMIN_EMAILS whitelist.
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email) {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Verify that an API request comes from an authenticated admin user.
 * Reads the Supabase auth token from cookie or Authorization header.
 * Returns { user, error } — if error is set, the request should be rejected.
 */
export async function requireAdmin(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Extract token from cookie (sb-*-auth-token) or Authorization header
  let token = null

  // Try Authorization header first
  const authHeader = req.headers?.authorization || req.headers?.Authorization
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  }

  // Fall back to Supabase auth cookie
  if (!token) {
    const cookieHeader = req.headers?.cookie || ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [k, ...v] = c.trim().split('=')
        return [k, v.join('=')]
      })
    )

    // Supabase stores session in sb-<ref>-auth-token cookie
    const sbCookie = Object.entries(cookies).find(([k]) => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (sbCookie) {
      try {
        const decoded = decodeURIComponent(sbCookie[1])
        const parsed = JSON.parse(decoded)
        token = parsed?.access_token || parsed?.[0]?.access_token || null

        // Supabase may chunk cookies (sb-*-auth-token.0, sb-*-auth-token.1, etc.)
        if (!token) {
          const base = sbCookie[0]
          const chunks = Object.entries(cookies)
            .filter(([k]) => k.startsWith(base + '.'))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, v]) => decodeURIComponent(v))
            .join('')
          if (chunks) {
            const chunkParsed = JSON.parse(chunks)
            token = chunkParsed?.access_token || null
          }
        }
      } catch (_) { /* malformed cookie */ }
    }
  }

  if (!token) {
    return { user: null, error: 'Not authenticated' }
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return { user: null, error: 'Invalid session' }
  }

  if (!isAdminEmail(user.email)) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, error: null }
}

/**
 * Higher-order wrapper: wraps an admin API handler with requireAdmin() check.
 * Usage: export default withAdminAuth(handler)
 */
export function withAdminAuth(handler) {
  return async function authedHandler(req, res) {
    // Allow Vercel cron requests with valid CRON_SECRET
    const cronSecret = process.env.CRON_SECRET
    const authHeader = req.headers?.authorization || ''
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      req.adminUser = { email: 'cron@system', isCron: true }
      return handler(req, res)
    }

    const { user, error } = await requireAdmin(req)
    if (error) {
      return res.status(401).json({ error })
    }
    req.adminUser = user
    return handler(req, res)
  }
}
