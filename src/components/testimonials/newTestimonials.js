// src/components/testimonials/newTestimonials.js
import PropTypes from 'prop-types'
import { useRef, useMemo, useEffect } from 'react'
import defaultTestimonials from '@/data/testimonialData'

function Star({ filled }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 ${filled ? 'fill-amber-400' : 'fill-neutral-200'}`}>
      <path d="M10 1.5l2.47 5 5.53.8-4 3.9.95 5.52L10 14.9l-4.95 2.82.95-5.52-4-3.9 5.53-.8L10 1.5z" />
    </svg>
  )
}
Star.propTypes = { filled: PropTypes.bool }

export default function TestimonialsBlock({
  heading = 'Loved by patients',
  subheading = 'Real reviews from recent treatments.',
  serviceName,
  testimonials = defaultTestimonials,
  bgImage,
  bgOverlay = 0.35,
  locationName // OPTIONAL: e.g., "Carmel, IN" to bake geo into schema
}) {
  const scrollerRef = useRef(null)
  const indexRef = useRef(0)

  const list = useMemo(() => {
    const items = Array.isArray(testimonials) ? testimonials : []
    return items.map((t) => {
      const rating = Math.max(0, Math.min(5, Number(t.rating || 0)))
      const monthYear =
        t.monthYear ||
        (t.date
          ? new Date(t.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
          : '')
      return { ...t, rating, monthYear }
    })
  }, [testimonials])

  const goToIndex = (idx) => {
    const el = scrollerRef.current
    if (!el) return
    const cards = el.querySelectorAll('[data-testimonial-card]')
    if (!cards.length) return
    const n = cards.length
    const target = ((idx % n) + n) % n
    indexRef.current = target
    el.scrollTo({ left: cards[target].offsetLeft, behavior: 'smooth' })
  }

  const scrollByCards = (dir = 1) => {
    goToIndex(indexRef.current + dir)
  }

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

  const hasBg = !!bgImage
  const bgStyle = hasBg
    ? {
        position: 'relative',
        backgroundImage: `linear-gradient(rgba(0,0,0,${bgOverlay}), rgba(0,0,0,${bgOverlay})), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {}

  // ---------- JSON-LD for Reviews / AggregateRating ----------
  // Compute aggregate values only from testimonials with numeric ratings
  const rated = list.filter(t => typeof t.rating === 'number' && !Number.isNaN(t.rating) && t.rating > 0)
  const aggregateRating = rated.length
    ? {
        "@type": "AggregateRating",
        "ratingValue": (rated.reduce((sum, t) => sum + t.rating, 0) / rated.length).toFixed(1),
        "ratingCount": rated.length
      }
    : undefined

  const reviews = list.map((t) => ({
    "@type": "Review",
    "author": t.author || t.name || "RELUXE Patient",
    "datePublished": t.date || undefined,
    "reviewBody": t.text || t.quote || "Great experience and fantastic results.",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": t.rating || 5,
      "bestRating": 5,
      "worstRating": 1
    }
  }))

  // Treat each service section like a "Product" (Google’s recommended pattern for review snippets)
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": serviceName ? `RELUXE ${serviceName}` : "RELUXE Treatment",
    "brand": { "@type": "Brand", "name": "RELUXE Med Spa" },
    ...(locationName ? { "areaServed": { "@type": "Place", "name": locationName } } : {}),
    ...(aggregateRating ? { "aggregateRating": aggregateRating } : {}),
    "review": reviews
  }
  // -----------------------------------------------------------

  return (
    <section className={`py-14 ${hasBg ? 'bg-black/80' : 'bg-gray-50'}`} style={bgStyle}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${hasBg ? 'text-white drop-shadow' : 'text-neutral-900'}`}>
              {hasBg ? 'Hear from our patients' : heading}
            </h2>
            <p className={`text-sm mt-1 ${hasBg ? 'text-white/90' : 'text-neutral-500'}`}>
              {serviceName ? `Real reviews from recent ${serviceName.toLowerCase()} treatments.` : subheading}
            </p>
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

        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {list.map((t, i) => {
            const provider = (t.provider || 'RELUXE Team').toUpperCase()
            const service = t.service || serviceName || 'Service'
            return (
              <figure
                key={i}
                data-testimonial-card
                className={`snap-start ${hasBg ? 'bg-white/95 backdrop-blur' : 'bg-white'} rounded-2xl border p-5 shadow-sm min-w-[85%] sm:min-w-[75%] md:min-w-[32%]`}
                itemScope
                itemType="https://schema.org/Review"
              >
                {/* Service by PROVIDER + date */}
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-xs sm:text-sm text-neutral-800">
                    {service} by {provider}
                  </strong>
                  {t.monthYear && <span className="text-xs text-neutral-500">{t.monthYear}</span>}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3" aria-label={`Rating: ${t.rating} out of 5`}>
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} filled={n < t.rating} />
                  ))}
                </div>

                {/* Text */}
                <blockquote className="text-neutral-800 leading-relaxed">
                  {t.text || t.quote || 'Great experience and fantastic results.'}
                </blockquote>

                {/* Author */}
                {(t.author || t.name) && (
                  <figcaption className="text-sm text-neutral-600 mt-3">
                    — {t.author || t.name}
                    {t.location
                      ? ` (${t.location} RELUXE)`
                      : (locationName ? ` (${locationName} RELUXE)` : '')
                    }
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>

        {list.length > 1 && (
          <div className="mt-4 flex md:hidden items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              className="h-9 px-3 rounded-full border bg-white hover:bg-neutral-50 shadow-sm"
              aria-label="Previous testimonials"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              className="h-9 px-3 rounded-full border bg-white hover:bg-neutral-50 shadow-sm"
              aria-label="Next testimonials"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Inject Review / AggregateRating JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      <style jsx global>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}

TestimonialsBlock.propTypes = {
  heading: PropTypes.string,
  subheading: PropTypes.string,
  serviceName: PropTypes.string,
  testimonials: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      quote: PropTypes.string,
      author: PropTypes.string,
      name: PropTypes.string,
      location: PropTypes.string,
      rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      service: PropTypes.string,
      provider: PropTypes.string,
      date: PropTypes.string,
      monthYear: PropTypes.string,
    })
  ),
  bgImage: PropTypes.string,
  bgOverlay: PropTypes.number,
  locationName: PropTypes.string
}
