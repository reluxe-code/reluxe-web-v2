// src/components/GoogleReviewsCarousel.js
// Horizontal snap-scroll carousel of real Google reviews from both locations
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { colors, typeScale } from '@/components/preview/tokens'

// Google "G" logo
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
              <linearGradient id={`grc-star-${i}-${size}`}>
                <stop offset={`${fill * 100}%`} stopColor="#FBBC05" />
                <stop offset={`${fill * 100}%`} stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <polygon
              points="10,1.5 12.5,7 18.5,7.5 14,11.5 15.5,17.5 10,14 4.5,17.5 6,11.5 1.5,7.5 7.5,7"
              fill={`url(#grc-star-${i}-${size})`}
            />
          </svg>
        )
      })}
    </span>
  )
}

// Share sessionStorage cache with GoogleReviewBadge
const CACHE_KEY = 'reluxe_google_reviews'
const CACHE_TTL = 60 * 60 * 1000

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

const LOCATION_LABELS = { westfield: 'Westfield', carmel: 'Carmel' }

export default function GoogleReviewsCarousel({ fonts = {} }) {
  const [reviews, setReviews] = useState(null)
  const [reviewUrl, setReviewUrl] = useState(null)
  const scrollerRef = useRef(null)
  const indexRef = useRef(0)

  useEffect(() => {
    const cached = getCached()
    // Only use cache if it has the reviews array (avoid stale badge-only cache)
    if (cached?.reviews?.length) {
      setReviews(cached.reviews)
      setReviewUrl(cached.combined?.reviewUrl)
      return
    }
    fetch('/api/google-reviews')
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || [])
        setReviewUrl(data.combined?.reviewUrl)
        setCache(data)
      })
      .catch(() => {})
  }, [])

  // Infinite scroll: render 3 copies, keep user in the middle set
  const realCount = reviews?.length || 0

  const scrollByCards = (dir = 1) => {
    const el = scrollerRef.current
    if (!el) return
    const cards = el.querySelectorAll('[data-review-card]')
    if (!cards.length) return
    const next = indexRef.current + dir
    if (next >= 0 && next < cards.length) {
      indexRef.current = next
      el.scrollTo({ left: cards[next].offsetLeft, behavior: 'smooth' })
    }
  }

  // Track current index + silently reset to middle set at edges
  useEffect(() => {
    const el = scrollerRef.current
    if (!el || !realCount) return
    let t
    const onScroll = () => {
      clearTimeout(t)
      t = setTimeout(() => {
        const cards = el.querySelectorAll('[data-review-card]')
        if (!cards.length) return
        let nearest = 0
        let min = Infinity
        cards.forEach((card, i) => {
          const d = Math.abs(card.offsetLeft - el.scrollLeft)
          if (d < min) { min = d; nearest = i }
        })
        indexRef.current = nearest

        // If scrolled into first or third copy, silently jump to middle copy
        const midStart = realCount
        const midEnd = realCount * 2 - 1
        if (nearest < midStart || nearest > midEnd) {
          const offset = nearest < midStart ? nearest + realCount : nearest - realCount
          indexRef.current = offset
          el.scrollTo({ left: cards[offset].offsetLeft, behavior: 'auto' })
        }
      }, 150)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => { el.removeEventListener('scroll', onScroll); clearTimeout(t) }
  }, [realCount])

  // Start scrolled to the middle set
  useEffect(() => {
    const el = scrollerRef.current
    if (!el || !realCount) return
    const cards = el.querySelectorAll('[data-review-card]')
    if (cards.length > realCount) {
      indexRef.current = realCount
      el.scrollTo({ left: cards[realCount].offsetLeft, behavior: 'auto' })
    }
  }, [realCount])

  // Autoplay
  useEffect(() => {
    const el = scrollerRef.current
    if (!el || !reviews?.length || reviews.length <= 1) return
    let timer = setInterval(() => scrollByCards(1), 6000)
    const pause = () => clearInterval(timer)
    const resume = () => { clearInterval(timer); timer = setInterval(() => scrollByCards(1), 6000) }
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    el.addEventListener('focusin', pause)
    el.addEventListener('focusout', resume)
    return () => {
      clearInterval(timer)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('focusin', pause)
      el.removeEventListener('focusout', resume)
    }
  }, [reviews])

  if (!reviews?.length) return null

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-12">
        {/* Header */}
        <motion.div
          className="flex items-end justify-between gap-4 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <p className="mb-4 flex items-center gap-2" style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet }}>
              <GoogleG size={14} />
              Verified on Google
            </p>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
              Real Reviews. Real Patients.
            </h2>
            <p className="mt-3 max-w-lg" style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body }}>
              What our patients are saying across both locations.
            </p>
          </div>

          {reviews.length > 1 && (
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                className="h-10 w-10 rounded-full grid place-items-center transition-colors"
                style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                aria-label="Previous review"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke={colors.heading} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                className="h-10 w-10 rounded-full grid place-items-center transition-colors"
                style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                aria-label="Next review"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={colors.heading} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          )}
        </motion.div>

        {/* Carousel */}
        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {[...reviews, ...reviews, ...reviews].map((review, i) => (
            <motion.div
              key={`${i}-${review.authorName}-${review.time}`}
              data-review-card
              className="snap-start rounded-2xl p-5 flex flex-col"
              style={{
                backgroundColor: '#fff',
                borderLeft: `3px solid #FBBC05`,
                flexShrink: 0,
                width: 300,
                maxWidth: '85vw',
              }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              {/* Top row: Google G + stars + time */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GoogleG size={16} />
                  <Stars rating={review.rating} size={14} />
                </div>
                {review.relativeTime && (
                  <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>
                    {review.relativeTime}
                  </span>
                )}
              </div>

              {/* Review text */}
              <p className="flex-1 mb-4" style={{
                fontFamily: fonts.body,
                fontSize: '0.875rem',
                color: colors.body,
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Author row */}
              <div className="flex items-center gap-3 mt-auto">
                {review.profilePhotoUrl ? (
                  <img
                    src={review.profilePhotoUrl}
                    alt={review.authorName}
                    className="w-9 h-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.stone, color: colors.muted, fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600 }}
                  >
                    {review.authorName?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>
                    {review.authorName}
                  </p>
                  {review.locationKey && (
                    <span
                      className="inline-block mt-0.5 rounded-full px-2 py-0.5"
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: colors.violet,
                        backgroundColor: 'rgba(124,58,237,0.08)',
                      }}
                    >
                      {LOCATION_LABELS[review.locationKey] || review.locationKey}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile arrows */}
        {reviews.length > 1 && (
          <div className="mt-5 flex md:hidden items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              className="h-9 px-4 rounded-full"
              style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.heading }}
              aria-label="Previous review"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              className="h-9 px-4 rounded-full"
              style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.heading }}
              aria-label="Next review"
            >
              Next
            </button>
          </div>
        )}

        {/* View all link */}
        {reviewUrl && (
          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.violet, textDecoration: 'none' }}
            >
              View all reviews on Google
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
