// pages/search.js — Enhanced search page with faceted results
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState, useCallback } from 'react'
import { fontPairings, colors, gradients } from '@/components/preview/tokens'
import { trackSearchQuery, trackSearchClick } from '@/lib/trackSearchEvent'
import { addRecentSearch } from '@/components/search/SearchEmptyState'

const fonts = fontPairings.bold

const TABS = [
  { key: null, label: 'All' },
  { key: 'services', label: 'Services' },
  { key: 'team', label: 'Team' },
  { key: 'blog', label: 'Blog' },
  { key: 'conditions', label: 'Conditions' },
  { key: 'products', label: 'Products' },
  { key: 'deals', label: 'Deals' },
  { key: 'locations', label: 'Locations' },
  { key: 'faqs', label: 'FAQs' },
]

const TYPE_COLORS = {
  Service: { bg: 'rgba(124,58,237,0.15)', text: '#7C3AED' },
  Condition: { bg: 'rgba(192,38,211,0.15)', text: '#C026D3' },
  Team: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  Blog: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  Product: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  Deal: { bg: 'rgba(225,29,115,0.15)', text: '#E11D73' },
  Location: { bg: 'rgba(14,165,233,0.15)', text: '#0EA5E9' },
  FAQ: { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' },
  Story: { bg: 'rgba(168,85,247,0.15)', text: '#A855F7' },
  Inspiration: { bg: 'rgba(236,72,153,0.15)', text: '#EC4899' },
  Comparison: { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' },
  'Cost Guide': { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' },
}

const POPULAR = ['Botox', 'HydraFacial', 'Morpheus8', 'Fillers', 'Laser Hair Removal', 'Facials']

export default function SearchPage() {
  const router = useRouter()
  const inputRef = useRef(null)
  const q = (router.query.q || '').toString().trim()
  const activeType = router.query.type || null
  const page = parseInt(router.query.page) || 1
  const LIMIT = 20

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [groups, setGroups] = useState({})
  const [didYouMean, setDidYouMean] = useState(null)
  const trackedRef = useRef('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [])

  // Fetch results
  useEffect(() => {
    let active = true
    async function run() {
      if (!q) {
        setResults([]); setTotal(0); setGroups({}); setDidYouMean(null); setError('')
        return
      }
      setLoading(true); setError('')
      try {
        const params = new URLSearchParams({ q, limit: LIMIT, offset: (page - 1) * LIMIT })
        if (activeType) params.set('type', activeType)
        const res = await fetch(`/api/search?${params}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (!active) return
        setResults(data.results || [])
        setTotal(data.total || 0)
        setGroups(data.groups || {})
        setDidYouMean(data.didYouMean || null)
      } catch {
        if (active) setError('Search failed. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [q, activeType, page])

  // Track search
  useEffect(() => {
    if (q && !loading && trackedRef.current !== `${q}:${activeType}`) {
      trackedRef.current = `${q}:${activeType}`
      trackSearchQuery(q, total, 'page', activeType)
      addRecentSearch(q)
    }
  }, [q, loading, total, activeType])

  const onSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const nextQ = (fd.get('q') || '').toString().trim()
    if (nextQ) router.push({ pathname: '/search', query: { q: nextQ } })
  }

  const setTab = useCallback((key) => {
    const query = { q }
    if (key) query.type = key
    router.push({ pathname: '/search', query }, undefined, { shallow: true })
  }, [q, router])

  const onResultClick = (result, index) => {
    trackSearchClick(q, result.url, result.title, result.type, index, 'page')
  }

  return (
    <>
      <Head>
        <title>{q ? `Search: ${q} | RELUXE Med Spa` : 'Search | RELUXE Med Spa'}</title>
        <meta name="description" content="Search RELUXE Med Spa services, conditions, providers, and guides." />
        <link rel="canonical" href="https://reluxemedspa.com/search" />
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* Hero */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #171717 100%)',
        color: colors.white,
        paddingTop: 100,
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.2,
          background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.25), transparent 60%)',
        }} />
        <div style={{
          position: 'relative',
          maxWidth: 800,
          margin: '0 auto',
          padding: '48px 16px 40px',
        }}>
          <h1 style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Search RELUXE
          </h1>
          <p style={{
            fontFamily: fonts.body,
            fontSize: '1rem',
            color: 'rgba(250,248,245,0.55)',
            marginBottom: 24,
          }}>
            Find services, treatments, providers, and more.
          </p>

          <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="rgba(250,248,245,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                name="q"
                defaultValue={q}
                key={q}
                type="search"
                placeholder="Search treatments, concerns, providers..."
                style={{
                  fontFamily: fonts.body,
                  fontSize: '1rem',
                  fontWeight: 500,
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '0.75rem',
                  border: '1.5px solid rgba(250,248,245,0.12)',
                  backgroundColor: 'rgba(250,248,245,0.06)',
                  color: colors.white,
                  outline: 'none',
                  caretColor: colors.violet,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                fontFamily: fonts.body,
                fontSize: '0.9375rem',
                fontWeight: 600,
                padding: '14px 24px',
                borderRadius: '0.75rem',
                background: gradients.primary,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Search
            </button>
          </form>

          {q && (
            <p style={{
              fontFamily: fonts.body,
              fontSize: '0.8125rem',
              color: 'rgba(250,248,245,0.4)',
              marginTop: 10,
            }}>
              {loading ? 'Searching...' : `${total} result${total !== 1 ? 's' : ''} for `}
              {!loading && <span style={{ color: colors.white, fontWeight: 600 }}>{q}</span>}
            </p>
          )}
        </div>
      </section>

      {/* Filter tabs */}
      {q && (
        <div style={{
          background: '#171717',
          borderBottom: '1px solid rgba(250,248,245,0.06)',
          position: 'sticky',
          top: 64,
          zIndex: 20,
        }}>
          <div style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
          }}>
            {TABS.map(tab => {
              const isActive = activeType === tab.key
              const count = tab.key ? (groups[tab.key] || 0) : total
              return (
                <button
                  key={tab.key || 'all'}
                  onClick={() => setTab(tab.key)}
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? colors.white : 'rgba(250,248,245,0.45)',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${colors.violet}` : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                  {count > 0 && (
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      marginLeft: 6,
                      padding: '1px 5px',
                      borderRadius: 999,
                      background: isActive ? 'rgba(124,58,237,0.2)' : 'rgba(250,248,245,0.08)',
                      color: isActive ? colors.violet : 'rgba(250,248,245,0.3)',
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Results */}
      <main style={{
        background: '#0a0a0a',
        minHeight: '50vh',
        padding: '32px 16px 64px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Loading */}
          {loading && (
            <div style={{ display: 'grid', gap: 8 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: 80, borderRadius: '0.75rem',
                  background: 'rgba(250,248,245,0.03)',
                  border: '1px solid rgba(250,248,245,0.06)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{
              padding: 24, borderRadius: '0.75rem',
              background: 'rgba(225,29,115,0.08)',
              border: '1px solid rgba(225,29,115,0.2)',
              color: colors.rose,
              fontFamily: fonts.body,
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {/* Results list */}
          {!loading && !error && q && results.length > 0 && (
            <div style={{ display: 'grid', gap: 8 }}>
              {results.map((r, i) => (
                <ResultCard key={r.url || i} result={r} index={i} q={q} onClick={onResultClick} />
              ))}

              {/* Pagination */}
              {total > LIMIT && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                  {page > 1 && (
                    <Link
                      href={{ pathname: '/search', query: { q, ...(activeType ? { type: activeType } : {}), page: page - 1 } }}
                      style={{
                        fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                        color: colors.violet, textDecoration: 'none',
                        padding: '10px 20px', borderRadius: '0.75rem',
                        border: '1px solid rgba(124,58,237,0.3)',
                      }}
                    >
                      Previous
                    </Link>
                  )}
                  {page * LIMIT < total && (
                    <Link
                      href={{ pathname: '/search', query: { q, ...(activeType ? { type: activeType } : {}), page: page + 1 } }}
                      style={{
                        fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                        color: '#fff', textDecoration: 'none',
                        padding: '10px 20px', borderRadius: '0.75rem',
                        background: gradients.primary,
                      }}
                    >
                      Load more results
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Zero results */}
          {!loading && !error && q && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <h3 style={{
                fontFamily: fonts.display,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: colors.white,
                marginBottom: 8,
              }}>
                No results for &ldquo;{q}&rdquo;
              </h3>
              {didYouMean && (
                <p style={{
                  fontFamily: fonts.body,
                  fontSize: '0.875rem',
                  color: 'rgba(250,248,245,0.5)',
                  marginBottom: 20,
                }}>
                  Did you mean{' '}
                  <Link
                    href={{ pathname: '/search', query: { q: didYouMean } }}
                    style={{ color: colors.violet, fontWeight: 600 }}
                  >
                    {didYouMean}
                  </Link>
                  ?
                </p>
              )}
              <p style={{
                fontFamily: fonts.body,
                fontSize: '0.8125rem',
                color: 'rgba(250,248,245,0.4)',
                marginBottom: 20,
              }}>
                Try a different term or browse popular searches:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                {POPULAR.map(s => (
                  <Link
                    key={s}
                    href={{ pathname: '/search', query: { q: s } }}
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'rgba(250,248,245,0.6)',
                      padding: '6px 16px',
                      borderRadius: 999,
                      border: '1px solid rgba(250,248,245,0.1)',
                      textDecoration: 'none',
                    }}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No query — quick links */}
          {!loading && !q && (
            <div>
              <h3 style={{
                fontFamily: fonts.display,
                fontSize: '1.125rem',
                fontWeight: 700,
                color: colors.white,
                marginBottom: 16,
              }}>
                Popular destinations
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {[
                  { href: '/services', label: 'All Services' },
                  { href: '/conditions', label: 'What We Treat' },
                  { href: '/team', label: 'Our Team' },
                  { href: '/locations/westfield', label: 'Westfield Location' },
                  { href: '/locations/carmel', label: 'Carmel Location' },
                  { href: '/blog', label: 'Blog & Guides' },
                  { href: '/skincare', label: 'Skincare Shop' },
                  { href: '/specials', label: 'Specials' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/faqs', label: 'FAQs' },
                  { href: '/reviews', label: 'Reviews' },
                  { href: '/contact', label: 'Contact Us' },
                ].map(it => (
                  <Link
                    key={it.href}
                    href={it.href}
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'rgba(250,248,245,0.65)',
                      padding: '12px 16px',
                      borderRadius: '0.625rem',
                      border: '1px solid rgba(250,248,245,0.08)',
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {it.label}
                  </Link>
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <h3 style={{
                  fontFamily: fonts.display,
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: colors.white,
                  marginBottom: 12,
                }}>
                  Popular searches
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {POPULAR.map(s => (
                    <Link
                      key={s}
                      href={{ pathname: '/search', query: { q: s } }}
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'rgba(250,248,245,0.5)',
                        padding: '6px 14px',
                        borderRadius: 999,
                        border: '1px solid rgba(250,248,245,0.08)',
                        textDecoration: 'none',
                      }}
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}

function ResultCard({ result, index, q, onClick }) {
  const typeStyle = TYPE_COLORS[result.type] || TYPE_COLORS.FAQ
  const hasImage = result.image && ['Service', 'Team', 'Blog', 'Product'].includes(result.type)

  return (
    <Link
      href={result.url}
      onClick={() => onClick(result, index)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        borderRadius: '0.75rem',
        background: 'rgba(250,248,245,0.02)',
        border: '1px solid rgba(250,248,245,0.06)',
        textDecoration: 'none',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(250,248,245,0.05)'
        e.currentTarget.style.borderColor = 'rgba(250,248,245,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(250,248,245,0.02)'
        e.currentTarget.style.borderColor = 'rgba(250,248,245,0.06)'
      }}
    >
      {/* Image */}
      {hasImage && (
        <div style={{
          width: 56, height: 56, borderRadius: result.type === 'Team' ? '50%' : '0.5rem',
          overflow: 'hidden', flexShrink: 0,
          background: 'rgba(250,248,245,0.06)',
        }}>
          <img src={result.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontFamily: fonts.body,
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: colors.white,
          }}>
            {result.title}
          </span>
          <span style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            fontFamily: fonts.body,
            padding: '2px 6px',
            borderRadius: 999,
            backgroundColor: typeStyle.bg,
            color: typeStyle.text,
            flexShrink: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {result.type}
          </span>
        </div>
        {result.description && (
          <p style={{
            fontFamily: fonts.body,
            fontSize: '0.8125rem',
            color: 'rgba(250,248,245,0.45)',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {result.description}
          </p>
        )}
        <span style={{
          fontFamily: fonts.body,
          fontSize: '0.6875rem',
          color: 'rgba(250,248,245,0.2)',
          marginTop: 4,
          display: 'block',
        }}>
          {result.url}
        </span>
      </div>

      {/* Arrow */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="rgba(250,248,245,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  )
}
