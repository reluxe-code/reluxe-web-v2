// src/pages/500.js
// Static 500 page — pre-rendered at build time, minimal dependencies.
import Head from 'next/head'
import Link from 'next/link'

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>Something Went Wrong • RELUXE</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1A1A', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#FAF8F5', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7C3AED', marginBottom: '0.5rem' }}>
            Error 500
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Something went wrong.
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(250,248,245,0.6)', lineHeight: 1.5, marginBottom: '2rem' }}>
            We hit an unexpected error. Please try again in a moment. If the issue persists, give us a call and we&apos;ll get you taken care of.
          </p>

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
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)' }}>
            <a href="tel:+13177631142" style={{ color: 'rgba(250,248,245,0.5)', textDecoration: 'underline' }}>
              (317) 763-1142
            </a>
            <a href="sms:+13177631142" style={{ color: 'rgba(250,248,245,0.5)', textDecoration: 'underline' }}>
              Text Us
            </a>
            <Link href="/contact" style={{ color: 'rgba(250,248,245,0.5)', textDecoration: 'underline' }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
