// src/lib/referral.js
// Client-side referral attribution: cookie + localStorage management.

const REF_COOKIE = 'reluxe_ref'
const REF_MAX_AGE = 60 * 60 * 24 * 180 // 180 days

function readCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function writeCookie(name, value, maxAge) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`
}

/**
 * Get the active referral code from URL param, cookie, or localStorage.
 * If ?ref= is present, persists it to cookie + localStorage.
 */
export function getReferralCode() {
  if (typeof window === 'undefined') return null

  // Check URL param first
  try {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferralCode(ref)
      return ref
    }
  } catch {}

  // Then cookie
  const cookie = readCookie(REF_COOKIE)
  if (cookie) return cookie

  // Then localStorage
  try {
    return localStorage.getItem(REF_COOKIE)
  } catch {}

  return null
}

/**
 * Persist a referral code to cookie + localStorage.
 */
export function setReferralCode(code) {
  if (!code) return
  writeCookie(REF_COOKIE, code, REF_MAX_AGE)
  try { localStorage.setItem(REF_COOKIE, code) } catch {}
}

/**
 * Clear referral attribution after successful booking.
 */
export function clearReferralCode() {
  writeCookie(REF_COOKIE, '', 0)
  try { localStorage.removeItem(REF_COOKIE) } catch {}
}
