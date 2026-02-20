// src/components/testimonials/TestimonialWidget.js
// Unified testimonial widget used across the entire site.
// Accepts pre-fetched testimonials (SSR) or fetches client-side via filters.

import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { getTestimonialsClient } from '@/lib/testimonials'

const SERVICE_LABELS = {
  tox: 'Tox',
  filler: 'Filler',
  'facial-balancing': 'Facial Balancing',
  morpheus8: 'Morpheus8',
  co2: 'CO\u2082',
  opus: 'Opus',
  sculptra: 'Sculptra',
  skinpen: 'SkinPen',
  ipl: 'IPL',
  clearlift: 'ClearLift',
  clearskin: 'ClearSkin',
  vascupen: 'VascuPen',
  'laser-hair-removal': 'Laser Hair Removal',
  facials: 'Facials',
  glo2facial: 'Glo2Facial',
  hydrafacial: 'HydraFacial',
  peels: 'Peels',
  evolvex: 'EvolveX',
  massage: 'Massage',
  'salt-sauna': 'Salt Sauna',
  'skin-iq': 'Skin IQ',
}

function Star({ filled }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 ${filled ? 'fill-amber-400' : 'fill-neutral-200'}`}>
      <path d="M10 1.5l2.47 5 5.53.8-4 3.9.95 5.52L10 14.9l-4.95 2.82.95-5.52-4-3.9 5.53-.8L10 1.5z" />
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="snap-start bg-white rounded-2xl border p-4 shadow-sm min-w-[85%] sm:min-w-[75%] md:min-w-[32%] animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="flex gap-1 mb-2">{[0,1,2,3,4].map(i => <div key={i} className="h-3.5 w-3.5 bg-gray-200 rounded" />)}</div>
      <div className="space-y-1.5 mb-3">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  )
}

const QUOTE_LIMIT = 140

function TestimonialCard({ t, serviceLabel }) {
  const [expanded, setExpanded] = useState(false)
  const quote = t.quote || ''
  const needsTruncate = quote.length > QUOTE_LIMIT
  const displayQuote = needsTruncate && !expanded ? quote.slice(0, QUOTE_LIMIT).trimEnd() + '...' : quote
  const providerName = t.provider || ''
  const dateStr = formatDate(t.review_date)

  return (
    <figure
      data-testimonial-card
      className="snap-start bg-white rounded-2xl border p-4 shadow-sm min-w-[85%] sm:min-w-[75%] md:min-w-[32%] flex flex-col"
    >
      {/* Header row: service badge, provider, stars, date */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {serviceLabel && (
            <span className="inline-block text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 shrink-0">
              {serviceLabel}
            </span>
          )}
          {providerName && (
            <span className="text-xs text-neutral-500 truncate">with {providerName}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5" aria-label={`Rating: ${t.rating} out of 5`}>
            {[0, 1, 2, 3, 4].map(n => <Star key={n} filled={n < t.rating} />)}
          </div>
          {dateStr && <span className="text-[11px] text-neutral-400">{dateStr}</span>}
        </div>
      </div>

      {/* Quote */}
      <blockquote className="text-neutral-800 text-sm leading-snug flex-1">
        &ldquo;{displayQuote}&rdquo;
        {needsTruncate && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="ml-1 text-violet-600 hover:text-violet-700 text-xs font-medium"
          >
            {expanded ? 'less' : 'more'}
          </button>
        )}
      </blockquote>

      {/* Author */}
      <figcaption className="text-xs text-neutral-500 mt-2 pt-2 border-t border-gray-100">
        &mdash; {formatAuthor(t.author_name)}
        {t.location && (
          <span className="text-neutral-400"> &middot; {t.location === 'carmel' ? 'Carmel' : 'Westfield'}</span>
        )}
      </figcaption>
    </figure>
  )
}

function formatAuthor(name) {
  if (!name) return 'RELUXE Patient'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function TestimonialWidget({
  testimonials: prefetched,
  location,
  provider,
  service,
  heading = 'Loved by Our Patients',
  subheading,
  serviceName,
  showViewAll = true,
  limit = 20,
}) {
  const scrollerRef = useRef(null)
  const indexRef = useRef(0)
  const [items, setItems] = useState(prefetched || [])
  const [loading, setLoading] = useState(!prefetched)

  // Client-side fetch when no prefetched data
  useEffect(() => {
    if (prefetched) return
    let cancelled = false
    setLoading(true)
    getTestimonialsClient({ location, provider, service, limit }).then(data => {
      if (!cancelled) {
        setItems(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [prefetched, location, provider, service, limit])

  const list = useMemo(() => items.filter(t => t.quote && t.quote.length > 0 && !t.quote.match(/^\d-star rating$/)), [items])

  const scrollByCards = useCallback((dir) => {
    const el = scrollerRef.current
    if (!el) return
    const cards = el.querySelectorAll('[data-testimonial-card]')
    if (!cards.length) return
    const n = cards.length
    const target = ((indexRef.current + dir) % n + n) % n
    indexRef.current = target
    cards[target].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }, [])

  // Track scroll position
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let t
    const onScroll = () => {
      clearTimeout(t)
      t = setTimeout(() => {
        const cards = el.querySelectorAll('[data-testimonial-card]')
        if (!cards.length) return
        let nearest = 0
        let min = Infinity
        cards.forEach((card, i) => {
          const d = Math.abs(card.offsetLeft - el.scrollLeft)
          if (d < min) { min = d; nearest = i }
        })
        indexRef.current = nearest
      }, 100)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => { el.removeEventListener('scroll', onScroll); clearTimeout(t) }
  }, [])

  // Schema.org JSON-LD
  const schemaData = useMemo(() => {
    const rated = list.filter(t => t.rating > 0)
    if (!rated.length) return null
    const avg = (rated.reduce((s, t) => s + t.rating, 0) / rated.length).toFixed(1)
    return {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "RELUXE Med Spa",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avg,
        "ratingCount": rated.length,
        "bestRating": 5,
        "worstRating": 1,
      },
      "review": list.slice(0, 10).map(t => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": formatAuthor(t.author_name) },
        "datePublished": t.review_date ? new Date(t.review_date).toISOString().split('T')[0] : undefined,
        "reviewBody": t.quote,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": t.rating,
          "bestRating": 5,
        },
      })),
    }
  }, [list])

  const defaultSub = serviceName
    ? `Real reviews from recent ${serviceName.toLowerCase()} treatments.`
    : 'Real reviews from real patients across our locations.'

  if (!loading && list.length === 0) return null

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">{heading}</h2>
            <p className="text-sm mt-1 text-neutral-500">{subheading || defaultSub}</p>
          </div>

          {list.length > 1 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                className="h-9 w-9 rounded-full border bg-white hover:bg-neutral-50 shadow-sm grid place-items-center"
                aria-label="Previous testimonials"
              >
                <span className="inline-block -translate-x-[1px]">&larr;</span>
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                className="h-9 w-9 rounded-full border bg-white hover:bg-neutral-50 shadow-sm grid place-items-center"
                aria-label="Next testimonials"
              >
                <span className="inline-block translate-x-[1px]">&rarr;</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div
            ref={scrollerRef}
            className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {list.map((t, i) => (
              <TestimonialCard
                key={t.id || i}
                t={t}
                serviceLabel={SERVICE_LABELS[t.service] || serviceName || ''}
              />
            ))}
          </div>
        )}

        {/* Mobile nav + View All */}
        <div className="mt-4 flex items-center justify-between">
          {list.length > 1 && (
            <div className="flex md:hidden items-center gap-3">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                className="h-9 px-3 rounded-full border bg-white hover:bg-neutral-50 shadow-sm text-sm"
                aria-label="Previous"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                className="h-9 px-3 rounded-full border bg-white hover:bg-neutral-50 shadow-sm text-sm"
                aria-label="Next"
              >
                Next
              </button>
            </div>
          )}
          {showViewAll && (
            <Link
              href="/reviews"
              className="ml-auto text-sm font-medium text-violet-600 hover:text-violet-700 transition"
            >
              View All Reviews &rarr;
            </Link>
          )}
        </div>
      </div>

      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}

      <style jsx global>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
