// src/pages/c/[token].js
// Concierge link click-through redirect.
// Resolves the token, marks it used, updates marketing_touches, redirects with UTMs + cg_token.
import { getServiceClient } from '@/lib/supabase'
import { resolveConciergeLink } from '@/lib/concierge/linkService'

export async function getServerSideProps({ params }) {
  const { token } = params
  if (!token) {
    return { props: { error: 'missing_token' } }
  }

  const db = getServiceClient()
  const result = await resolveConciergeLink(db, token)

  if (!result) {
    // Distinguish between not_found and expired
    const { data: link } = await db
      .from('concierge_links')
      .select('expires_at')
      .eq('token', token)
      .single()

    if (link && new Date(link.expires_at) < new Date()) {
      return { props: { error: 'expired' } }
    }
    return { props: { error: 'not_found' } }
  }

  return {
    redirect: {
      destination: result.destination,
      permanent: false,
    },
  }
}

export default function ConciergeRedirect({ error }) {
  const messages = {
    expired: 'This booking link has expired. Please contact RELUXE to schedule your appointment.',
    not_found: 'This link is no longer valid.',
    missing_token: 'Invalid link.',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', background: '#fafafa' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Link Unavailable</h1>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>
          {messages[error] || 'Something went wrong.'}
        </p>
        <a
          href="https://reluxemedspa.com"
          style={{ display: 'inline-block', marginTop: 20, padding: '10px 24px', background: '#7c3aed', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
        >
          Visit RELUXE
        </a>
      </div>
    </div>
  )
}
