// src/lib/concierge/conciergeToken.js
// Captures and persists the ?cg_token= concierge tracking token from SMS booking links.
// Mirrors trackingToken.js pattern — cookie (90 days) + localStorage for redundancy.

const COOKIE_NAME = 'rlx_cg'
const LS_KEY = 'reluxe_cg_token'
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
 * Capture ?cg_token= from URL if present, persist to cookie + localStorage.
 * Call once on page load (in _app.js useEffect).
 */
export function captureConciergeToken() {
  if (typeof window === 'undefined') return null
  try {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('cg_token')
    if (token && token.length > 0 && token.length < 64) {
      writeCookie(COOKIE_NAME, token)
      try { localStorage.setItem(LS_KEY, token) } catch {}
      return token
    }
  } catch {}
  return null
}

/**
 * Get the current concierge token from cookie or localStorage.
 * Returns null if not present.
 */
export function getConciergeToken() {
  if (typeof window === 'undefined') return null
  const ck = readCookie(COOKIE_NAME)
  if (ck) return ck
  try { return localStorage.getItem(LS_KEY) || null } catch {}
  return null
}
