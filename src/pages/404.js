// src/pages/404.js
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { trackAuditEvent } from '@/hooks/useAuditTracker'

export default function NotFoundPage() {
  const router = useRouter()

  useEffect(() => {
    trackAuditEvent('404', router.asPath, { referrer: document.referrer || null })
  }, [router.asPath])

  return (
    <>
      <Head>
        <title>Page Not Found • RELUXE</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="We couldn't find that page." />
      </Head>

      <div style={{ minHeight: '100vh', background: '#1A1A1A', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#FAF8F5', padding: '2rem 1rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', paddingTop: '2rem', marginBottom: '3rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#FAF8F5', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.06em' }}>
            RELUXE
          </Link>
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7C3AED', marginBottom: '0.5rem' }}>
            Error 404
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            We can&apos;t find that page.
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(250,248,245,0.6)', lineHeight: 1.5, marginBottom: '2rem' }}>
            The link might be broken or the page may have moved. Try searching or use the links below.
          </p>

          {/* Quick actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Link
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg, #7C3AED, #C026D3)', color: '#fff', fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none' }}
            >
              Go Home
            </Link>
            <Link
              href="/services"
              style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5', fontWeight: 500, fontSize: '0.9375rem', textDecoration: 'none' }}
            >
              Browse Services
            </Link>
            <Link
              href="/memberships"
              style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', color: '#FAF8F5', fontWeight: 500, fontSize: '0.9375rem', textDecoration: 'none' }}
            >
              Memberships
            </Link>
          </div>

          {/* Search */}
          <form action="/search" method="GET" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
            <input
              name="q"
              type="search"
              inputMode="search"
              placeholder="Search treatments, concerns..."
              defaultValue={decodeURIComponent(router.asPath || '').replace(/^\/+/, '')}
              style={{ flex: 1, padding: '0.875rem 1.25rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.12)', background: 'rgba(250,248,245,0.06)', color: '#FAF8F5', fontSize: '0.9375rem', outline: 'none' }}
            />
            <button
              type="submit"
              style={{ padding: '0.875rem 1.5rem', borderRadius: '9999px', border: 'none', background: '#FAF8F5', color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Search
            </button>
          </form>

          {/* Helpful links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left' }}>
            <div style={{ padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(250,248,245,0.08)', background: 'rgba(250,248,245,0.03)' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Popular</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/locations/westfield" style={{ color: 'rgba(250,248,245,0.6)', textDecoration: 'underline', fontSize: '0.875rem' }}>Westfield</Link></li>
                <li><Link href="/locations/carmel" style={{ color: 'rgba(250,248,245,0.6)', textDecoration: 'underline', fontSize: '0.875rem' }}>Carmel</Link></li>
                <li><Link href="/services" style={{ color: 'rgba(250,248,245,0.6)', textDecoration: 'underline', fontSize: '0.875rem' }}>All Services</Link></li>
                <li><Link href="/pricing" style={{ color: 'rgba(250,248,245,0.6)', textDecoration: 'underline', fontSize: '0.875rem' }}>Pricing</Link></li>
              </ul>
            </div>
            <div style={{ padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(250,248,245,0.08)', background: 'rgba(250,248,245,0.03)' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Need help?</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/team" style={{ color: 'rgba(250,248,245,0.6)', textDecoration: 'underline', fontSize: '0.875rem' }}>Meet the Team</Link></li>
                <li><Link href="/contact" style={{ color: 'rgba(250,248,245,0.6)', textDecoration: 'underline', fontSize: '0.875rem' }}>Contact Us</Link></li>
                <li><a href="tel:+13177631142" style={{ color: 'rgba(250,248,245,0.6)', textDecoration: 'underline', fontSize: '0.875rem' }}>Call (317) 763-1142</a></li>
                <li><a href="sms:+13177631142" style={{ color: 'rgba(250,248,245,0.6)', textDecoration: 'underline', fontSize: '0.875rem' }}>Text (317) 763-1142</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
