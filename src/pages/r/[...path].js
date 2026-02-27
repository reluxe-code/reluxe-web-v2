// src/pages/r/[...path].js
// Redirect wrapper: captures ?t= tracking token, sets cookie server-side, redirects.
// Example: /r/reveal?t=rlx_abc123&utm_source=bird → 302 to /reveal?utm_source=bird

export default function RedirectPage() {
  return null
}

export async function getServerSideProps(ctx) {
  const { path } = ctx.params
  const { t, ...rest } = ctx.query

  // Build destination URL (strip 'path' key from query)
  const destination = '/' + (path || []).join('/')
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(rest)) {
    if (k === 'path') continue
    qs.set(k, Array.isArray(v) ? v[0] : v)
  }
  const dest = qs.toString() ? `${destination}?${qs}` : destination

  // Set tracking token cookie server-side
  if (t) {
    const maxAge = 60 * 60 * 24 * 90 // 90 days
    ctx.res.setHeader('Set-Cookie', `rlx_t=${encodeURIComponent(t)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`)
  }

  return { redirect: { destination: dest, permanent: false } }
}
