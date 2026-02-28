// src/pages/reviews.js
// Public page showing all recommendable testimonials with filters.

import { useState, useMemo, useCallback } from 'react'
import Head from 'next/head'
import HeaderTwo from '@/components/header/header-2'
import { getTestimonialsSSR } from '@/lib/testimonials'

const SERVICE_LABELS = {
  tox: 'Tox', filler: 'Filler', 'facial-balancing': 'Facial Balancing',
  morpheus8: 'Morpheus8', co2: 'CO\u2082', opus: 'Opus', sculptra: 'Sculptra',
  skinpen: 'SkinPen', ipl: 'IPL', clearlift: 'ClearLift', clearskin: 'ClearSkin',
  vascupen: 'VascuPen', 'laser-hair-removal': 'Laser Hair Removal',
  facials: 'Facials', glo2facial: 'Glo2Facial', hydrafacial: 'HydraFacial',
  peels: 'Peels', evolvex: 'EvolveX', massage: 'Massage',
  'salt-sauna': 'Salt Sauna', 'skin-iq': 'Skin IQ',
}

function Star({ filled }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 ${filled ? 'fill-amber-400' : 'fill-neutral-200'}`}>
      <path d="M10 1.5l2.47 5 5.53.8-4 3.9.95 5.52L10 14.9l-4.95 2.82.95-5.52-4-3.9 5.53-.8L10 1.5z" />
    </svg>
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
  } catch { return '' }
}

const QUOTE_LIMIT = 140

function ReviewCard({ t }) {
  const [expanded, setExpanded] = useState(false)
  const serviceLabel = SERVICE_LABELS[t.service] || ''
  const quote = t.quote || ''
  const needsTruncate = quote.length > QUOTE_LIMIT
  const displayQuote = needsTruncate && !expanded ? quote.slice(0, QUOTE_LIMIT).trimEnd() + '...' : quote

  return (
    <div className="bg-white rounded-2xl border p-4 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {serviceLabel && (
            <span className="inline-block text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 shrink-0">
              {serviceLabel}
            </span>
          )}
          {t.provider && (
            <span className="text-xs text-neutral-500 truncate">with {t.provider}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5">
            {[0,1,2,3,4].map(n => <Star key={n} filled={n < t.rating} />)}
          </div>
          {t.review_date && (
            <span className="text-[11px] text-neutral-400">{formatDate(t.review_date)}</span>
          )}
        </div>
      </div>

      {/* Quote */}
      <p className="text-neutral-800 text-sm leading-snug flex-1">
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
      </p>

      {/* Author */}
      <p className="text-xs text-neutral-500 mt-2 pt-2 border-t border-gray-100">
        &mdash; {formatAuthor(t.author_name)}
        {t.location && (
          <span className="text-neutral-400"> &middot; {t.location === 'carmel' ? 'Carmel' : 'Westfield'}</span>
        )}
      </p>
    </div>
  )
}

export async function getStaticProps() {
  // Fetch all 5-star recommendable reviews (no service/location filter)
  const testimonials = await getTestimonialsSSR({ limit: 500 })
  return { props: { testimonials }, revalidate: 3600 }
}

export default function ReviewsPage({ testimonials = [] }) {
  const [filterLocation, setFilterLocation] = useState('')
  const [filterProvider, setFilterProvider] = useState('')
  const [filterService, setFilterService] = useState('')
  const [showCount, setShowCount] = useState(24)

  // Derive unique providers and services from data
  const { providers, services } = useMemo(() => {
    const provSet = new Set()
    const svcSet = new Set()
    for (const t of testimonials) {
      if (t.provider) provSet.add(t.provider)
      if (t.service) svcSet.add(t.service)
    }
    return {
      providers: [...provSet].sort(),
      services: [...svcSet].sort(),
    }
  }, [testimonials])

  const filtered = useMemo(() => {
    return testimonials.filter(t => {
      if (filterLocation && t.location !== filterLocation) return false
      if (filterProvider && t.provider !== filterProvider) return false
      if (filterService && t.service !== filterService) return false
      return true
    })
  }, [testimonials, filterLocation, filterProvider, filterService])

  const visible = filtered.slice(0, showCount)

  // Aggregate rating for schema
  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : '5.0'

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "RELUXE Med Spa",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "ratingCount": testimonials.length,
      "bestRating": 5,
      "worstRating": 1,
    },
  }

  return (
    <>
      <Head>
        <title>Patient Reviews | RELUXE Med Spa</title>
        <meta name="description" content="Read real patient reviews from RELUXE Med Spa in Westfield and Carmel, Indiana. 5-star rated Botox, fillers, facials, laser treatments and more." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <HeaderTwo />

      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-12 text-center">
            <span className="inline-block text-xs tracking-widest uppercase text-gray-500 mb-2">Patient Reviews</span>
            <h1 className="text-3xl md:text-4xl font-bold">
              What Our{' '}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Patients Say
              </span>
            </h1>
            <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
              {testimonials.length} five-star reviews from real patients across our Westfield and Carmel locations.
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filterLocation}
              onChange={e => { setFilterLocation(e.target.value); setShowCount(24) }}
              className="border rounded-full px-4 py-2 text-sm bg-white"
            >
              <option value="">All Locations</option>
              <option value="westfield">Westfield</option>
              <option value="carmel">Carmel</option>
            </select>
            <select
              value={filterProvider}
              onChange={e => { setFilterProvider(e.target.value); setShowCount(24) }}
              className="border rounded-full px-4 py-2 text-sm bg-white"
            >
              <option value="">All Providers</option>
              {providers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={filterService}
              onChange={e => { setFilterService(e.target.value); setShowCount(24) }}
              className="border rounded-full px-4 py-2 text-sm bg-white"
            >
              <option value="">All Services</option>
              {services.map(s => <option key={s} value={s}>{SERVICE_LABELS[s] || s}</option>)}
            </select>
            {(filterLocation || filterProvider || filterService) && (
              <button
                onClick={() => { setFilterLocation(''); setFilterProvider(''); setFilterService(''); setShowCount(24) }}
                className="text-sm text-violet-600 hover:underline"
              >
                Clear Filters
              </button>
            )}
            <span className="ml-auto text-sm text-gray-500">{filtered.length} reviews</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((t) => <ReviewCard key={t.id} t={t} />)}
          </div>

          {/* Load More */}
          {showCount < filtered.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowCount(c => c + 24)}
                className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition"
              >
                Load More Reviews ({filtered.length - showCount} remaining)
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
