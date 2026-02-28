// src/pages/_error.js
// Catch-all error page for runtime errors.
// 404 and 500 have their own static pages; this handles everything else.
import Head from 'next/head'
import Link from 'next/link'

function ErrorPage({ statusCode }) {
  const title = statusCode === 404
    ? 'Page Not Found'
    : statusCode === 503
      ? 'Temporarily Unavailable'
      : 'Something Went Wrong'

  const message = statusCode === 404
    ? 'The link might be broken or the page may have moved.'
    : statusCode === 503
      ? 'We\'re doing a quick update. Please check back in a minute.'
      : 'We hit an unexpected error. Please try again in a moment.'

  return (
    <>
      <Head>
        <title>{title} • RELUXE</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1A1A', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#FAF8F5', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
          {statusCode && (
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7C3AED', marginBottom: '0.5rem' }}>
              Error {statusCode}
            </p>
          )}
          <h1 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            {title}
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(250,248,245,0.6)', lineHeight: 1.5, marginBottom: '2rem' }}>
            {message}
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
            <Link href="/contact" style={{ color: 'rgba(250,248,245,0.5)', textDecoration: 'underline' }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage
