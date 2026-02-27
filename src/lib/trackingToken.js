// src/lib/trackingToken.js
// Captures and persists the ?t= tracking token from Bird SMS/email campaigns.
// Stores in cookie (90 days) + localStorage for redundancy.

const COOKIE_NAME = 'rlx_t'
const LS_KEY = 'reluxe_tracking_token'
const MAX_AGE = 60 * 60 * 24 * 90 // 90 days

function readCookie(name) {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

function writeCookie(name, value) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`
}

/**
 * Capture ?t= from URL if present, persist to cookie + localStorage.
 * Call once on page load (in _app.js useEffect).
 */
export function captureTrackingToken() {
  if (typeof window === 'undefined') return null
  try {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('t')
    if (t && t.length > 0 && t.length < 64) {
      writeCookie(COOKIE_NAME, t)
      try { localStorage.setItem(LS_KEY, t) } catch {}
      return t
    }
  } catch {}
  return null
}

/**
 * Get the current tracking token from cookie or localStorage.
 * Returns null if not identified.
 */
export function getTrackingToken() {
  if (typeof window === 'undefined') return null
  const ck = readCookie(COOKIE_NAME)
  if (ck) return ck
  try { return localStorage.getItem(LS_KEY) || null } catch {}
  return null
}
