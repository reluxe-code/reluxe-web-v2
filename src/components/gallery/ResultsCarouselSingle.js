// src/components/gallery/ResultsCarouselSingle.js
import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { getProviderResults } from '@/data/providers/providerGalleries'

export default function ResultsCarouselSingle({
  providerSlug = 'default',
  limit = 6,
  autoplayMs = 5000,
}) {
  const baseSlides = getProviderResults(providerSlug, { limit })
  const hasLoop = baseSlides.length > 1

  // Build clones for seamless infinite loop: [last, ...slides, first]
  const slides = useMemo(() => {
    if (!hasLoop) return baseSlides
    const first = baseSlides[0]
    const last = baseSlides[baseSlides.length - 1]
    return [last, ...baseSlides, first]
  }, [baseSlides, hasLoop])

  // Index starts at 1 (first real slide)
  const [index, setIndex] = useState(hasLoop ? 1 : 0)
  const [animating, setAnimating] = useState(true)
  useEffect(() => {
    setIndex(hasLoop ? 1 : 0)
    setAnimating(true)
  }, [hasLoop])

  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const timerRef = useRef(null)

  // Autoplay (true infinite: just increment; boundary will be handled on transitionend)
  useEffect(() => {
    if (!autoplayMs || autoplayMs < 1000 || !hasLoop) return
    const start = () => {
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => setIndex((i) => i + 1), autoplayMs)
    }
    const stop = () => clearInterval(timerRef.current)
    start()

    const node = viewportRef.current
    node?.addEventListener('mouseenter', stop)
    node?.addEventListener('mouseleave', start)
    node?.addEventListener('focusin', stop)
    node?.addEventListener('focusout', start)

    return () => {
      stop()
      node?.removeEventListener('mouseenter', stop)
      node?.removeEventListener('mouseleave', start)
      node?.removeEventListener('focusin', stop)
      node?.removeEventListener('focusout', start)
    }
  }, [autoplayMs, hasLoop])

  // Handle the seamless wrap using transitionend
  useEffect(() => {
    if (!hasLoop) return
    const el = trackRef.current
    if (!el) return
    const onEnd = () => {
      // If we hit the clone after the last real slide, jump (without animation) to first real
      if (index === slides.length - 1) {
        setAnimating(false)
        setIndex(1)
      }
      // If we hit the clone before the first real slide, jump (without animation) to last real
      if (index === 0) {
        setAnimating(false)
        setIndex(slides.length - 2)
      }
    }
    el.addEventListener('transitionend', onEnd)
    return () => el.removeEventListener('transitionend', onEnd)
  }, [index, slides.length, hasLoop])

  // Re-enable animation on next frame after a jump
  useEffect(() => {
    if (animating) return
    const id = requestAnimationFrame(() => setAnimating(true))
    return () => cancelAnimationFrame(id)
  }, [animating])

  const goNext = () => setIndex((i) => (hasLoop ? i + 1 : Math.min(slides.length - 1, i + 1)))
  const goPrev = () => setIndex((i) => (hasLoop ? i - 1 : Math.max(0, i - 1)))

  // Which dot is active (map cloned index back to real index)
  const activeDot = hasLoop ? (index - 1 + baseSlides.length) % baseSlides.length : index

  if (!slides.length) return null

  return (
    <div className="w-full max-w-[440px] md:max-w-[500px] mx-auto">
      {/* Controls above the image */}
      {slides.length > 1 && (
        <div className="mb-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous result"
            className="rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next result"
            className="rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            ›
          </button>
        </div>
      )}

      {/* Square viewport (slightly smaller), image stays square */}
      <div
        ref={viewportRef}
        className="overflow-hidden rounded-3xl ring-1 ring-black/5 shadow-sm"
        style={{ aspectRatio: '1 / 1' }}
      >
        <div
          ref={trackRef}
          className="flex h-full"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: animating ? 'transform 500ms ease-out' : 'none',
            willChange: 'transform',
          }}
        >
          {slides.map((s, i) => (
            <figure key={s.id ?? i} className="w-full shrink-0 h-full relative">
              <img src={s.src} alt={s.alt || 'Before & After'} className="h-full w-full object-cover" loading="lazy" />
            </figure>
          ))}
        </div>
      </div>

      {/* Dots */}
      {baseSlides.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {baseSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(hasLoop ? i + 1 : i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                i === activeDot ? 'bg-black' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

ResultsCarouselSingle.propTypes = {
  providerSlug: PropTypes.string,
  limit: PropTypes.number,
  autoplayMs: PropTypes.number,
}
