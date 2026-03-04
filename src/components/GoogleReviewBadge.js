// src/components/GoogleReviewBadge.js
// Clickable Google Reviews badge — shows star rating + review count, links to Google
import { useState, useEffect } from 'react'

// Google "G" logo as inline SVG
function GoogleG({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function Stars({ rating, size = 14 }) {
  const full = Math.floor(rating)
  const partial = rating - full
  return (
    <span className="inline-flex items-center gap-px">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = i < full ? 1 : i === full ? partial : 0
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`star-fill-${i}-${size}`}>
                <stop offset={`${fill * 100}%`} stopColor="#FBBC05" />
                <stop offset={`${fill * 100}%`} stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <polygon
              points="10,1.5 12.5,7 18.5,7.5 14,11.5 15.5,17.5 10,14 4.5,17.5 6,11.5 1.5,7.5 7.5,7"
              fill={`url(#star-fill-${i}-${size})`}
            />
          </svg>
        )
      })}
    </span>
  )
}

// Client-side cache in sessionStorage
const CACHE_KEY = 'reluxe_google_reviews'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, expiresAt } = JSON.parse(raw)
    return Date.now() < expiresAt ? data : null
  } catch {
    return null
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL }))
  } catch {}
}

/**
 * GoogleReviewBadge — interactive badge linking to Google reviews
 *
 * Variants:
 *  - "hero" — large badge for homepage hero (dark background)
 *  - "inline" — small inline badge for trust bars
 *  - "card" — standalone card with location breakdown
 */
export default function GoogleReviewBadge({ variant = 'inline', fonts = {}, className = '' }) {
  const [reviews, setReviews] = useState(null)

  useEffect(() => {
    const cached = getCached()
    if (cached) {
      setReviews(cached)
      return
    }
    fetch('/api/google-reviews')
      .then((r) => r.json())
      .then((data) => {
        setReviews(data)
        setCache(data)
      })
      .catch(() => {
        // Silent fail — badge just won't render
      })
  }, [])

  if (!reviews) return null

  const { combined } = reviews
  if (!combined.reviewCount) return null
  const countLabel = combined.reviewCount >= 1000
    ? `${(combined.reviewCount / 1000).toFixed(1)}k`
    : `${combined.reviewCount}+`

  if (variant === 'hero') {
    return (
      <a
        href={combined.reviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 transition-all duration-200 hover:scale-[1.02] ${className}`}
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          textDecoration: 'none',
          backdropFilter: 'blur(8px)',
        }}
        title="View our Google reviews"
      >
        <GoogleG size={18} />
        <Stars rating={combined.rating} size={14} />
        <span
          style={{
            fontFamily: fonts.body || 'inherit',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'rgba(250,248,245,0.8)',
          }}
        >
          {combined.rating} ({countLabel} reviews)
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.4 }}>
          <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    )
  }

  if (variant === 'card') {
    return (
      <a
        href={combined.reviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${className}`}
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          textDecoration: 'none',
        }}
        title="View our Google reviews"
      >
        <div className="flex items-center gap-3 mb-3">
          <GoogleG size={24} />
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: fonts.display || 'inherit', fontSize: '1.5rem', fontWeight: 700, color: '#111' }}>
                {combined.rating}
              </span>
              <Stars rating={combined.rating} size={16} />
            </div>
            <p style={{ fontFamily: fonts.body || 'inherit', fontSize: '0.8125rem', color: '#6b7280' }}>
              {countLabel} reviews on Google
            </p>
          </div>
        </div>
        {reviews.locations?.length > 1 && (
          <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
            {reviews.locations.map((loc) => (
              <div key={loc.key} className="flex-1">
                <p style={{ fontFamily: fonts.body || 'inherit', fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {loc.key}
                </p>
                <p style={{ fontFamily: fonts.body || 'inherit', fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>
                  {loc.rating} <span style={{ fontWeight: 400, color: '#6b7280' }}>({loc.reviewCount})</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </a>
    )
  }

  // Default: inline variant
  return (
    <a
      href={combined.reviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-80 ${className}`}
      style={{ textDecoration: 'none' }}
      title="View our Google reviews"
    >
      <GoogleG size={14} />
      <Stars rating={combined.rating} size={12} />
      <span
        style={{
          fontFamily: fonts.body || 'inherit',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'inherit',
        }}
      >
        {combined.rating} ({countLabel})
      </span>
    </a>
  )
}
