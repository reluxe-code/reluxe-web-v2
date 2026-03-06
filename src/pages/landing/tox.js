// pages/landing/tox.js
// High-intent tox landing page — real-time slot discovery + instant booking
// Designed for Meta ad traffic (mobile-first, no nav, pure conversion)

import { useState, useEffect, useRef, useCallback } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import TestimonialWidget from '@/components/testimonials/TestimonialWidget'
import ClientInfoForm from '@/components/booking/ClientInfoForm'
import { formatPhone, stripPhone, isValidPhone } from '@/lib/phoneUtils'
import { trackAuditEvent } from '@/hooks/useAuditTracker'
import { useMember } from '@/context/MemberContext'
import { useLocationPref } from '@/context/LocationContext'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const PAGE_ID = 'tox_lp'

// Contact
const MARKETING_SMS = '3173609000'
const PHONE_CALL = '3177631142'
const DISPLAY_PHONE = '317-763-1142'

// Before/after images
const TOX_RESULTS = [
  { src: '/images/results/tox/injector.hannah - 25.png', alt: 'Forehead smoothing — 2 weeks after tox' },
  { src: '/images/results/tox/injector.krista - 01.png', alt: 'Frown lines softened — 2 weeks after tox' },
  { src: '/images/results/tox/injector.hannah - 26.png', alt: 'Natural movement preserved after tox' },
  { src: '/images/results/tox/injector.hannah - 27.png', alt: 'Crow\'s feet reduction — 2 weeks after tox' },
  { src: '/images/results/tox/injector.hannah - 30.png', alt: 'Refreshed, not frozen — real RELUXE patient' },
]

// Pricing data
const PRICING = {
  new: [
    { brand: 'Jeuveau', price: '$200', units: 'First 20 Units', addon: '$6/unit after', note: '*' },
    { brand: 'Botox', price: '$280', units: 'First 20 Units', addon: '$9/unit after' },
    { brand: 'Dysport', price: '$225', units: 'First 50 Units', addon: '$3/unit after' },
    { brand: 'Daxxify', price: '$280', units: 'First 40 Units', addon: '$4/unit after' },
  ],
  returning: [
    { brand: 'Jeuveau', price: '$8', units: 'Per Unit', addon: 'No minimum' },
    { brand: 'Botox', price: '$10', units: 'Per Unit', addon: 'No minimum' },
    { brand: 'Dysport', price: '$3.50', units: 'Per Unit', addon: 'No minimum' },
    { brand: 'Daxxify', price: '$5', units: 'Per Unit', addon: 'No minimum' },
  ],
}

const TIME_OPTIONS = [
  { id: null, label: 'Any Time' },
  { id: 'morning', label: 'Morning' },
  { id: 'midday', label: 'Midday' },
  { id: 'after3', label: 'After 3pm' },
]

// "Most popular dose" pricing — calculated from per-unit rates
const POPULAR_DOSES = {
  new: [
    { brand: 'Jeuveau', dose: '50 units', total: '$380', note: '*' },
    { brand: 'Botox', dose: '64 units', total: '$676' },
    { brand: 'Dysport', dose: '100 units', total: '$375' },
    { brand: 'Daxxify', dose: '100 units', total: '$520' },
  ],
  returning: [
    { brand: 'Jeuveau', dose: '50 units', total: '$400' },
    { brand: 'Botox', dose: '64 units', total: '$640' },
    { brand: 'Dysport', dose: '100 units', total: '$350' },
    { brand: 'Daxxify', dose: '100 units', total: '$500' },
  ],
}

const SCARCITY_TAGS = ['Last slot', '1 available', 'Only opening']

/** ======================================================
 * Helpers
 * ====================================================== */
function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  const payload = { ...params, page: PAGE_ID, page_path: window.location?.pathname || '' }
  if (typeof window.fbq === 'function') {
    try { window.fbq('trackCustom', eventName, payload) } catch (_) {}
  }
  if (typeof window.gtag === 'function') {
    try { window.gtag('event', eventName, payload) } catch (_) {}
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...payload })
  }
}

function useSectionTrack(sectionName) {
  const ref = useRef(null)
  const firedRef = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el || firedRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true
          trackEvent('section_view', { section: sectionName })
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [sectionName])
  return ref
}

function getScarcityTag(tileId, index) {
  if (index < 1) return null
  const hash = tileId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  if (hash % 3 !== 0) return null
  return SCARCITY_TAGS[hash % SCARCITY_TAGS.length]
}

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function groupTilesByTimeframe(tiles) {
  const now = new Date()
  const todayStr = toLocalDateStr(now)
  const tomorrowStr = toLocalDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))

  // End of current week (Sunday)
  const daysUntilSunday = 7 - now.getDay()
  const endOfWeekStr = toLocalDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday))

  const todayTiles = tiles.filter((t) => t.date === todayStr)
  const tomorrowTiles = tiles.filter((t) => t.date === tomorrowStr)
  const thisWeekTiles = tiles.filter((t) => t.date > tomorrowStr && t.date <= endOfWeekStr)
  const laterTiles = tiles.filter((t) => t.date > endOfWeekStr)
  return { todayTiles, tomorrowTiles, thisWeekTiles, laterTiles }
}

/** ======================================================
 * Main page component
 * ====================================================== */
export default function ToxLandingPage() {
  const [isNew, setIsNew] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  // Slot state
  const [tiles, setTiles] = useState([])
  const [moreTiles, setMoreTiles] = useState([])
  const [showMore, setShowMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [degraded, setDegraded] = useState(false) // true when BLVD API partially/fully failed

  // Filters
  const [filterLocation, setFilterLocation] = useState('either')
  const [filterTime, setFilterTime] = useState(null)
  const [filterProvider, setFilterProvider] = useState(null)
  const [availableProviders, setAvailableProviders] = useState([])

  // Booking
  const [bookingTile, setBookingTile] = useState(null)
  const [bookingStep, setBookingStep] = useState('confirm') // confirm | reserving | verify | error
  const [cartData, setCartData] = useState(null)
  const [bookingError, setBookingError] = useState(null)
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingCodeId, setBookingCodeId] = useState(null)
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false)

  // Track page view
  useEffect(() => {
    trackEvent('landing_view', { variant: 'slots_v1' })
  }, [])

  // Scroll detection for hero shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Fetch tox slots
  const fetchSlots = useCallback(async () => {
    setLoading(true)
    setError(null)
    setDegraded(false)
    try {
      const locations = filterLocation === 'either' ? ['westfield', 'carmel'] : [filterLocation]
      const res = await fetch('/api/reveal/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations,
          serviceSlugs: ['tox'],
          providerSlug: filterProvider || null,
          timeOfDay: filterTime || null,
          limit: 16,
        }),
      })
      if (!res.ok) throw new Error('Failed to load availability')
      const data = await res.json()
      const meta = data.meta || {}

      // Check if the API is degraded (partial BLVD failure or circuit open fallback)
      const isDegraded = meta.degraded === true
      const isFallback = !!meta.fallbackReason
      const noResults = !(data.tiles?.length) && !(data.moreTiles?.length)

      if (isFallback || (isDegraded && noResults)) {
        // Full fallback — BLVD is down, show static booking UI
        setDegraded(true)
        setTiles([])
        setMoreTiles([])
        trackAuditEvent('booking_fallback', 'Board API returned degraded/fallback response', {
          reason: meta.fallbackReason || 'degraded_no_results',
          location: filterLocation,
        })
      } else {
        setTiles(data.tiles || [])
        setMoreTiles(data.moreTiles || [])
        setShowMore(false)
        if (isDegraded) setDegraded(true) // partial degradation but we have some tiles

        // Extract unique providers for filter
        if (!filterProvider) {
          const allTiles = [...(data.tiles || []), ...(data.moreTiles || [])]
          const seen = new Map()
          allTiles.forEach((t) => {
            if (!seen.has(t.providerSlug)) {
              seen.set(t.providerSlug, { slug: t.providerSlug, name: t.providerName, image: t.providerImage })
            }
          })
          setAvailableProviders([...seen.values()])
        }
      }
    } catch (e) {
      setError(e.message)
      setDegraded(true)
      trackAuditEvent('booking_fallback', `Board API fetch failed: ${e.message}`, {
        reason: 'fetch_error',
        location: filterLocation,
      })
    } finally {
      setLoading(false)
    }
  }, [filterLocation, filterTime, filterProvider])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  // Booking handlers
  const handleTileTap = (tile) => {
    trackEvent('tile_tap', { provider: tile.providerName, date: tile.date, time: tile.timeLabel, location: tile.locationKey })
    setBookingTile(tile)
    setBookingStep('confirm')
    setCartData(null)
    setBookingError(null)
    setBookingPhone('')
    setBookingCodeId(null)
    setBookingSheetOpen(true)
  }

  const handleReserveAndSendCode = async (phone) => {
    if (!bookingTile) return
    setBookingStep('reserving')
    setBookingError(null)
    try {
      // Step 1: Create cart (reserve the slot)
      const cartRes = await fetch('/api/blvd/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationKey: bookingTile.locationKey,
          serviceItemId: bookingTile.serviceItemId,
          staffProviderId: bookingTile.boulevardProviderId,
          date: bookingTile.date,
          startTime: bookingTile.startTime,
        }),
      })
      const cartText = await cartRes.text()
      let cartJson
      try { cartJson = JSON.parse(cartText) } catch { throw new Error('Booking system unavailable. Please try again.') }

      if (cartRes.status === 409) {
        setBookingError(cartJson.error || 'That slot was just taken. Try another time.')
        setBookingStep('error')
        return
      }
      if (!cartRes.ok) throw new Error(cartJson.error || 'Failed to reserve')
      if (!cartJson.cartId) throw new Error('Failed to create reservation. Please try again.')

      trackEvent('booking_reserved', { provider: bookingTile.providerName, cartId: cartJson.cartId })
      setCartData(cartJson)

      // Step 2: Send verification code (best-effort — cart is already reserved)
      let sentCodeId = null
      try {
        const e164 = phone.replace(/[^\d+]/g, '').replace(/^(\d{10})$/, '+1$1').replace(/^1(\d{10})$/, '+1$1')
        const codeRes = await fetch(`/api/blvd/cart/${cartJson.cartId}/send-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: e164 }),
        })
        const codeText = await codeRes.text()
        let codeJson
        try { codeJson = JSON.parse(codeText) } catch { codeJson = {} }
        sentCodeId = codeJson.codeId || null
      } catch (sendErr) {
        console.warn('[tox] send-code failed, proceeding without verification:', sendErr.message)
      }

      setBookingPhone(phone)
      setBookingCodeId(sentCodeId)
      setBookingStep('verify')
    } catch (e) {
      setBookingError(e.message)
      setBookingStep('error')
    }
  }

  const handleBookingSuccess = (data) => {
    trackEvent('booking_complete', { provider: bookingTile?.providerName, location: bookingTile?.locationKey })
    // Clear reservation state so resume banner doesn't show
    setCartData(null)
  }

  const dismissBooking = () => {
    // Just hide the sheet — preserve cart/code state so user can resume
    setBookingSheetOpen(false)
  }

  const resetBooking = () => {
    setBookingTile(null)
    setBookingStep('confirm')
    setCartData(null)
    setBookingError(null)
    setBookingPhone('')
    setBookingCodeId(null)
    setBookingSheetOpen(false)
  }

  const resumeBooking = () => {
    setBookingSheetOpen(true)
  }

  // Check if there's an active reservation the user can resume
  const hasActiveReservation = cartData && bookingStep === 'verify' && !bookingSheetOpen
  const reservationExpired = cartData?.expiresAt && new Date(cartData.expiresAt) < new Date()

  const pricing = isNew ? PRICING.new : PRICING.returning
  const allVisible = showMore ? [...tiles, ...moreTiles] : tiles
  const { todayTiles, tomorrowTiles, thisWeekTiles, laterTiles } = groupTilesByTimeframe(allVisible)
  const smsBody = encodeURIComponent('Hi RELUXE! I\'d like to book tox.')
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`

  return (
    <BetaLayout
      minimal
      title="Tox Pricing & Booking"
      description="See exactly what you'll pay for Botox, Jeuveau, Dysport, or Daxxify at RELUXE Med Spa. Book in 60 seconds. Carmel & Westfield, IN."
      canonical="https://reluxemedspa.com/landing/tox"
      noindex
    >
      {/* ========== STICKY HERO ========== */}
      <section
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18), transparent 60%)`,
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.25rem 1rem 1.25rem', textAlign: 'center', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/logo.png" alt="RELUXE Med Spa" style={{ height: '2.125rem', margin: '0 auto 0.75rem', display: 'block' }} />
          <a
            href={`tel:${PHONE_CALL}`}
            onClick={() => trackEvent('call_click', { placement: 'header' })}
            aria-label="Call RELUXE"
            style={{
              position: 'absolute', top: '1.25rem', right: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(250,248,245,0.08)', border: '1px solid rgba(250,248,245,0.12)',
              color: 'rgba(250,248,245,0.6)', transition: 'all 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </a>
          <h1 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: 'clamp(1.25rem, 4vw, 1.875rem)', fontWeight: 700, lineHeight: 1.15, color: colors.white }}>
            See the price. Pick a time.{' '}
            <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Done.</span>
          </h1>

          {/* New / Returning Toggle */}
          <div style={{ marginTop: '0.625rem', display: 'inline-flex', borderRadius: '9999px', backgroundColor: 'rgba(250,248,245,0.08)', border: '1px solid rgba(250,248,245,0.1)', padding: '3px' }}>
            <button onClick={() => { setIsNew(true); trackEvent('toggle_pricing', { type: 'new' }) }} style={{ padding: '0.3rem 0.875rem', borderRadius: '9999px', fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: isNew ? gradients.primary : 'transparent', color: isNew ? '#fff' : 'rgba(250,248,245,0.5)' }}>
              New Patient
            </button>
            <button onClick={() => { setIsNew(false); trackEvent('toggle_pricing', { type: 'returning' }) }} style={{ padding: '0.3rem 0.875rem', borderRadius: '9999px', fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: !isNew ? gradients.primary : 'transparent', color: !isNew ? '#fff' : 'rgba(250,248,245,0.5)' }}>
              Returning
            </button>
          </div>

          {/* Pricing Grid — Foundation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ marginTop: '0.625rem', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto' }}>
            {pricing.map((item) => (
              <div key={item.brand} style={{ borderRadius: '0.875rem', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: 'rgba(250,248,245,0.04)', padding: '0.75rem 0.625rem', textAlign: 'center', borderLeft: '3px solid rgba(124,58,237,0.5)' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700, color: 'rgba(250,248,245,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.brand}</p>
                <p style={{ marginTop: '0.25rem', fontFamily: fonts.display, fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', fontWeight: 700, background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                  {item.price}{item.note && <span style={{ fontSize: '0.625rem', verticalAlign: 'super', WebkitTextFillColor: '#c4b5fd' }}>*</span>}
                </p>
                <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(250,248,245,0.55)' }}>{item.units}</p>
                <p style={{ marginTop: '0.125rem', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 700, color: '#c4b5fd' }}>{item.addon}</p>
              </div>
            ))}
          </div>

          {/* Evolus Rewards footnote — only show for new patient pricing */}
          {isNew && (
            <p style={{ marginTop: '0.375rem', fontFamily: fonts.body, fontSize: '0.5625rem', color: 'rgba(250,248,245,0.35)' }}>
              *After $40 Evolus Rewards. We help you enroll at your visit.
            </p>
          )}

          {/* "See popular dose" callout */}
          <p style={{ marginTop: '0.375rem', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#c4b5fd' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
            See popular dose pricing below
          </p>

          {/* Trust bar */}
          <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <Stars rating={5} />
            <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.white }}>5.0</span>
            <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>&bull; 300+ Reviews</span>
          </div>
        </div>
      </section>

      {/* ========== SCROLLING CONTENT ========== */}
      <div style={{ position: 'relative', zIndex: 20 }}>

        {/* ——— SLOT DISCOVERY SECTION ——— */}
        <section style={{ backgroundColor: colors.ink, backgroundImage: grain, padding: '0 0 2rem' }}>
          <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1rem' }}>

            {/* Section header */}
            <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem' }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.white }}>
                Claim Your Spot
              </h2>
              <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>
                Real-time tox availability. Pick a time, lock it in.
              </p>
            </div>

            {/* Filter Bar */}
            <FilterBar
              location={filterLocation}
              onLocationChange={(v) => { setFilterLocation(v); trackEvent('filter_location', { location: v }) }}
              loading={loading}
            />

            {/* Slot Rows */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonTile key={i} />)}
              </div>
            ) : (error || (degraded && allVisible.length === 0)) ? (
              <StaticFallback smsHref={smsHref} location={filterLocation} />
            ) : allVisible.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, color: colors.white }}>No tox openings match your filters</p>
                <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>Try adjusting your filters, or text us to find a time.</p>
                <a href={smsHref} onClick={() => trackEvent('sms_click', { placement: 'empty_state' })} style={{ marginTop: '0.75rem', display: 'inline-block', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#a78bfa', textDecoration: 'underline' }}>
                  Text us to book
                </a>
              </div>
            ) : (
              <>
                {todayTiles.length > 0 && (
                  <SlotRow label="Today" tiles={todayTiles} onTap={handleTileTap} />
                )}
                {tomorrowTiles.length > 0 && (
                  <SlotRow label="Tomorrow" tiles={tomorrowTiles} onTap={handleTileTap} />
                )}
                {thisWeekTiles.length > 0 && (
                  <SlotRow label="This Week" tiles={thisWeekTiles} onTap={handleTileTap} />
                )}
                {laterTiles.length > 0 && (
                  <SlotRow label="Next Week" tiles={laterTiles} onTap={handleTileTap} />
                )}
                {/* If no grouping matched, show flat */}
                {todayTiles.length === 0 && tomorrowTiles.length === 0 && thisWeekTiles.length === 0 && laterTiles.length === 0 && (
                  <SlotRow label="Available" tiles={allVisible} onTap={handleTileTap} />
                )}
                {moreTiles.length > 0 && !showMore && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                      onClick={() => { setShowMore(true); trackEvent('show_more_slots') }}
                      style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#a78bfa', background: 'none', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '9999px', padding: '0.5rem 1.25rem', cursor: 'pointer' }}
                    >
                      Show More Times
                    </button>
                  </div>
                )}

                {/* Fallback CTA */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(250,248,245,0.06)' }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)' }}>
                    Don&apos;t see a time that works?{' '}
                    <a href={smsHref} onClick={() => trackEvent('sms_click', { placement: 'after_slots' })} style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'underline' }}>
                      Text us
                    </a>{' '}
                    and we&apos;ll find a spot.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ——— MOST POPULAR DOSE CHART ——— */}
        <PopularDoseChart />

        {/* ——— SELL CONTENT ——— */}
        <WhyReluxeSection />
        <ResultsSection images={TOX_RESULTS} onOpen={setLightbox} />

        <section style={{ padding: '3rem 0' }}>
          <TestimonialWidget service="tox" heading="What Our Patients Say" subheading="Real reviews from real tox appointments." showViewAll={false} />
        </section>

        <FaqSection
          title="Quick Answers"
          items={[
            { q: 'Do I pick a tox brand before booking?', a: 'No. Book "Tox" and your injector will recommend the best option for your face, goals, and budget.' },
            { q: 'How long does the appointment take?', a: 'About 30 minutes including consult. The injections themselves are 10\u201315 minutes.' },
            { q: 'Does it hurt?', a: 'Most patients describe quick pinches \u2014 a 2\u20133 out of 10. The needles are ultra-fine.' },
            { q: 'When will I see results?', a: '2\u20137 days depending on brand. Full results by day 14. Plan 2+ weeks before events.' },
            { q: 'Switching from another provider?', a: 'We\u2019ll match your tox and dose. Just tell us what you\u2019ve been getting.' },
          ]}
        />

        {/* Final CTA */}
        <section style={{ backgroundColor: colors.ink, backgroundImage: `${grain}, radial-gradient(50% 50% at 50% 0%, rgba(124,58,237,0.15), transparent 60%)`, padding: '3rem 1rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: 700, color: colors.white }}>Ready?</h2>
            <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: typeScale.subhead.size, color: 'rgba(250,248,245,0.7)' }}>Pick a time. We&apos;ll handle the rest.</p>
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
              <a
                href={smsHref}
                onClick={() => trackEvent('sms_click', { placement: 'final_cta' })}
                style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#a78bfa', textDecoration: 'underline' }}
              >
                Prefer to text? Message us
              </a>
              <a
                href={`tel:${PHONE_CALL}`}
                onClick={() => trackEvent('call_click', { placement: 'final_cta' })}
                className="flex items-center gap-2 rounded-full"
                style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', padding: '0.625rem 1.5rem', textDecoration: 'none' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                Call {DISPLAY_PHONE}
              </a>
            </div>
          </div>
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(250,248,245,0.06)' }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.25)' }}>RELUXE Med Spa &middot; Westfield &amp; Carmel, IN &middot; {DISPLAY_PHONE}</p>
            <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.15)' }}>Results vary. Dosing customized by your injector.</p>
          </div>
        </section>
      </div>

      {lightbox && <Lightbox img={lightbox} onClose={() => setLightbox(null)} />}

      {/* ========== RESUME BANNER (shown when sheet dismissed with active cart) ========== */}
      {hasActiveReservation && !reservationExpired && (
        <ResumeBookingBanner
          expiresAt={cartData.expiresAt}
          tile={bookingTile}
          onResume={resumeBooking}
          onExpired={resetBooking}
        />
      )}

      {/* ========== BOOKING SHEET OVERLAY ========== */}
      {bookingTile && bookingSheetOpen && (
        <BookingSheet
          tile={bookingTile}
          step={bookingStep}
          cartData={cartData}
          error={bookingError}
          phone={bookingPhone}
          codeId={bookingCodeId}
          onReserveAndSendCode={handleReserveAndSendCode}
          onSuccess={handleBookingSuccess}
          onClose={bookingStep === 'verify' ? dismissBooking : resetBooking}
          onRetry={() => setBookingStep('confirm')}
        />
      )}
    </BetaLayout>
  )
}

ToxLandingPage.getLayout = (page) => page

/* ======================================================
   SLOT COMPONENTS
   ====================================================== */

function FilterBar({ location, onLocationChange, loading }) {
  const chipStyle = (active) => ({
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    fontFamily: fonts.body,
    fontSize: '0.6875rem',
    fontWeight: 600,
    border: active ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(250,248,245,0.12)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: active ? 'rgba(167,139,250,0.15)' : 'rgba(250,248,245,0.04)',
    color: active ? '#a78bfa' : 'rgba(250,248,245,0.55)',
    whiteSpace: 'nowrap',
  })

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', paddingBottom: '0.5rem' }}>
      {[{ id: 'either', label: 'Either Location' }, { id: 'westfield', label: 'Westfield' }, { id: 'carmel', label: 'Carmel' }].map((loc) => (
        <button key={loc.id} onClick={() => onLocationChange(loc.id)} style={chipStyle(location === loc.id)}>{loc.label}</button>
      ))}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.25rem' }}>
          <div style={{ width: 14, height: 14, border: '2px solid rgba(250,248,245,0.15)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          <style jsx>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}
    </div>
  )
}

function SlotRow({ label, tiles, onTap }) {
  if (!tiles.length) return null
  return (
    <div style={{ marginTop: '1.25rem' }}>
      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
        {label}
      </p>
      {/* Desktop: 3-col grid. Mobile: horizontal scroll */}
      <div className="hidden sm:grid grid-cols-3 gap-3">
        {tiles.slice(0, 6).map((tile, i) => (
          <TileCard key={tile.id} tile={tile} index={i} onTap={onTap} />
        ))}
      </div>
      <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
        {tiles.slice(0, 6).map((tile, i) => (
          <div key={tile.id} className="snap-start shrink-0 w-[calc(50%-0.375rem)]">
            <TileCard tile={tile} index={i} onTap={onTap} />
          </div>
        ))}
      </div>
    </div>
  )
}

function getCredentialBadge(title) {
  const t = (title || '').toLowerCase()
  if (/\bnp\b|nurse\s*practitioner/i.test(t)) return 'NP'
  if (/\brn\b|registered\s*nurse/i.test(t)) return 'RN'
  if (/\blmt\b|massage/i.test(t)) return 'LMT'
  if (/\bpa\b|physician\s*assistant/i.test(t)) return 'PA'
  return null
}

function TileCard({ tile, index, onTap }) {
  const scarcity = getScarcityTag(tile.id, index)
  const badge = getCredentialBadge(tile.providerTitle)
  return (
    <button
      onClick={() => onTap(tile)}
      className="w-full text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem',
        padding: '1rem',
      }}
    >
      {/* Day + date */}
      <p style={{ fontSize: '0.6875rem', fontFamily: fonts.body, color: '#a78bfa', fontWeight: 600 }}>{tile.dayLabel}</p>

      {/* Time */}
      <p style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: fonts.display, color: colors.white, marginTop: '0.125rem' }}>{tile.timeLabel}</p>

      {/* Provider */}
      <div className="flex items-center gap-2 mt-2">
        <div className="relative flex-shrink-0" style={{ width: 26, height: 26 }}>
          {tile.providerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tile.providerImage} alt={tile.providerName} className="rounded-full object-cover" style={{ width: 26, height: 26 }} />
          ) : (
            <div className="rounded-full" style={{ width: 26, height: 26, background: gradients.primary }} />
          )}
          {badge && (
            <span style={{ position: 'absolute', bottom: -3, right: -4, fontSize: '0.5rem', fontWeight: 700, fontFamily: fonts.body, color: '#fff', backgroundColor: colors.violet, borderRadius: '4px', padding: '0 3px', lineHeight: '14px', border: '1px solid rgba(26,26,26,0.8)' }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }}>with {tile.providerName}</span>
      </div>

      {/* Location + scarcity */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tile.locationKey === 'westfield' ? colors.violet : colors.fuchsia }} />
          <span style={{ fontSize: '0.625rem', fontFamily: fonts.body, color: 'rgba(250,248,245,0.4)', textTransform: 'capitalize' }}>{tile.locationKey}</span>
        </div>
        {scarcity && (
          <span style={{ fontSize: '0.5625rem', fontWeight: 600, fontFamily: fonts.body, color: colors.rose, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{scarcity}</span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-2.5 text-center rounded-full" style={{ fontSize: '0.6875rem', fontWeight: 600, fontFamily: fonts.body, padding: '0.4rem', background: gradients.primary, color: '#fff' }}>
        Claim This Spot
      </div>
    </button>
  )
}

function SkeletonTile() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '1rem' }} className="animate-pulse">
      <div style={{ height: 10, width: '40%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
      <div style={{ height: 22, width: '60%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: 8 }} />
      <div className="flex items-center gap-2 mt-3">
        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ height: 10, width: '50%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
      </div>
      <div style={{ height: 28, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '9999px', marginTop: 12 }} />
    </div>
  )
}

/** Static Fallback — shown when BLVD API is degraded/down.
 *  Opens the standard booking modal via useMember context. */
function StaticFallback({ smsHref, location }) {
  const { openBookingModal } = useMember()
  const { locationKey } = useLocationPref()
  const locKey = location === 'either' ? (locationKey || 'westfield') : location

  const handleBook = () => {
    trackEvent('fallback_book_click', { location: locKey })
    openBookingModal(locKey)
  }

  return (
    <div style={{ padding: '1.5rem 0 1rem', textAlign: 'center' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, color: colors.white }}>
          Book your tox appointment
        </p>
        <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>
          Pick a time &mdash; we&apos;ll confirm your spot instantly.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxWidth: '24rem', margin: '0 auto' }}>
        <button
          onClick={handleBook}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '1rem', borderRadius: '0.875rem',
            background: gradients.primary, border: 'none', cursor: 'pointer',
            fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: '#fff',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Book Now
        </button>
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <a
          href={smsHref}
          onClick={() => trackEvent('sms_click', { placement: 'fallback' })}
          style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#a78bfa', textDecoration: 'underline' }}
        >
          Or text us to book
        </a>
        <a
          href={`tel:${PHONE_CALL}`}
          onClick={() => trackEvent('call_click', { placement: 'fallback' })}
          style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, textDecoration: 'none' }}
        >
          Call {DISPLAY_PHONE}
        </a>
      </div>
    </div>
  )
}

/* ======================================================
   BOOKING SHEET (overlay modal)
   ====================================================== */

function BookingSheet({ tile, step, cartData, error, phone: confirmedPhone, codeId, onReserveAndSendCode, onSuccess, onClose, onRetry }) {
  const locLabel = tile.locationKey === 'westfield' ? 'RELUXE Westfield' : 'RELUXE Carmel'
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState(null)
  const phoneRef = useRef(null)

  const handlePhoneChange = (e) => {
    const digits = stripPhone(e.target.value)
    if (digits.length <= 11) setPhone(formatPhone(digits))
    if (phoneError) setPhoneError(null)
  }

  const handleSubmit = () => {
    if (!isValidPhone(phone)) {
      setPhoneError('Enter a valid 10-digit phone number')
      return
    }
    onReserveAndSendCode(phone)
  }

  return (
    <div className="fixed inset-0 z-[998] flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-md mx-auto rounded-t-2xl sm:rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: colors.ink, border: '1px solid rgba(250,248,245,0.1)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10" style={{ background: 'rgba(250,248,245,0.08)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: 'rgba(250,248,245,0.5)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>

        <div style={{ padding: '1.5rem' }}>
          {/* ── COMBINED: Confirm + Phone (single step) ── */}
          {step === 'confirm' && (
            <>
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Claim Your Spot</p>

              {/* Appointment summary */}
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <DetailRow label="Service" value="Tox" />
                <DetailRow label="Provider" value={tile.providerName} image={tile.providerImage} />
                <DetailRow label="Date" value={tile.dayLabel} />
                <DetailRow label="Time" value={tile.timeLabel} />
                <DetailRow label="Location" value={locLabel} />
              </div>

              {/* Phone input */}
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)', marginBottom: '0.5rem' }}>
                  Enter your mobile number to receive your confirmation code.
                </p>
                <input
                  ref={phoneRef}
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit() } }}
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '1rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.75rem',
                    border: phoneError ? `1.5px solid ${colors.rose}` : '1.5px solid #a78bfa',
                    backgroundColor: 'rgba(250,248,245,0.06)',
                    color: colors.white,
                    outline: 'none',
                    width: '100%',
                  }}
                />
                {phoneError && (
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.rose, marginTop: 4 }}>{phoneError}</p>
                )}
              </div>

              {/* Single CTA */}
              <button
                onClick={handleSubmit}
                disabled={!isValidPhone(phone)}
                className="w-full mt-4 rounded-full"
                style={{
                  padding: '1rem',
                  fontFamily: fonts.body,
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: isValidPhone(phone) ? gradients.primary : 'rgba(250,248,245,0.1)',
                  color: isValidPhone(phone) ? '#fff' : 'rgba(250,248,245,0.3)',
                  border: 'none',
                  cursor: isValidPhone(phone) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                Send Code &amp; Lock It In
              </button>
              <p style={{ marginTop: '0.5rem', textAlign: 'center', fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.3)' }}>
                We&apos;ll hold this spot for ~10 minutes while you verify.
              </p>
            </>
          )}

          {/* ── RESERVING: spinner ── */}
          {step === 'reserving' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(250,248,245,0.1)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto' }} />
              <p style={{ marginTop: '1rem', fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.white }}>Reserving &amp; sending code&hellip;</p>
              <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>Don&apos;t close this window</p>
              <style jsx>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* ── VERIFY: ClientInfoForm starting at verify step ── */}
          {step === 'verify' && cartData && (
            <ClientInfoForm
              cartId={cartData.cartId}
              expiresAt={cartData.expiresAt}
              summary={cartData.summary}
              fonts={fonts}
              initialPhone={confirmedPhone}
              initialCodeId={codeId}
              skipVerification={!codeId}
              onSuccess={onSuccess}
              onExpired={() => onRetry()}
              onBack={() => onRetry()}
            />
          )}

          {/* ── ERROR ── */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, color: colors.white }}>{error}</p>
              <button onClick={onRetry} className="mt-4 rounded-full" style={{ padding: '0.75rem 2rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                Try Another Time
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResumeBookingBanner({ expiresAt, tile, onResume, onExpired }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt) - new Date()
      if (diff <= 0) { onExpired(); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${m}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpired])

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[50] lg:bottom-4 lg:left-auto lg:right-4 lg:inset-x-auto"
      style={{ pointerEvents: 'auto' }}
    >
      <button
        onClick={onResume}
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem max(0.75rem, env(safe-area-inset-bottom))',
          backgroundColor: 'rgba(26,26,26,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(167,139,250,0.3)',
          cursor: 'pointer',
          border: 'none',
          textAlign: 'left',
        }}
      >
        {/* Pulsing dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#a78bfa' }} />
          <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2px solid rgba(167,139,250,0.4)', animation: 'pulse-ring 1.5s ease-out infinite' }} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>
            Your spot is held — enter your code
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.5)', marginTop: 1 }}>
            {tile?.providerName ? `with ${tile.providerName} · ` : ''}{tile?.timeLabel || ''}
          </p>
        </div>

        {/* Timer */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', fontWeight: 700, color: '#a78bfa', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}</p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.5rem', color: 'rgba(250,248,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>remaining</p>
        </div>

        {/* Arrow */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <style jsx>{`@keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }`}</style>
    </div>
  )
}

function DetailRow({ label, value, image }) {
  return (
    <div className="flex items-center justify-between" style={{ borderBottom: '1px solid rgba(250,248,245,0.06)', paddingBottom: '0.625rem' }}>
      <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>{label}</span>
      <div className="flex items-center gap-2">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="rounded-full object-cover" style={{ width: 22, height: 22 }} />
        )}
        <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{value}</span>
      </div>
    </div>
  )
}

/* ======================================================
   POPULAR DOSE CHART (with own toggle)
   ====================================================== */

function PopularDoseChart() {
  const [showNew, setShowNew] = useState(true)
  const rows = showNew ? POPULAR_DOSES.new : POPULAR_DOSES.returning

  return (
    <section style={{ backgroundColor: colors.ink, backgroundImage: grain, padding: '2rem 0' }}>
      <div style={{ maxWidth: '36rem', margin: '0 auto', padding: '0 1rem' }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.white, textAlign: 'center' }}>
          Transparent Pricing
        </h2>
        <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, textAlign: 'center' }}>
          Most popular dose &mdash; what most patients actually pay.
        </p>

        {/* New / Returning toggle */}
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
          <button
            onClick={() => setShowNew(true)}
            style={{
              fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
              padding: '0.375rem 0.875rem', borderRadius: '9999px', cursor: 'pointer', border: 'none',
              background: showNew ? gradients.primary : 'rgba(250,248,245,0.06)',
              color: showNew ? '#fff' : 'rgba(250,248,245,0.5)',
              transition: 'all 0.2s ease',
            }}
          >
            New Patient
          </button>
          <button
            onClick={() => setShowNew(false)}
            style={{
              fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
              padding: '0.375rem 0.875rem', borderRadius: '9999px', cursor: 'pointer', border: 'none',
              background: !showNew ? gradients.primary : 'rgba(250,248,245,0.06)',
              color: !showNew ? '#fff' : 'rgba(250,248,245,0.5)',
              transition: 'all 0.2s ease',
            }}
          >
            Returning
          </button>
        </div>

        <div style={{ marginTop: '1rem', borderRadius: '1rem', border: '1px solid rgba(250,248,245,0.1)', overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '0.625rem 1rem', backgroundColor: 'rgba(250,248,245,0.06)', borderBottom: '1px solid rgba(250,248,245,0.08)' }}>
            <span style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Brand</span>
            <span style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Dose</span>
            <span style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Price</span>
          </div>
          {/* Rows */}
          {rows.map((row, i, arr) => (
            <div key={row.brand} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '0.75rem 1rem', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid rgba(250,248,245,0.06)' : 'none' }}>
              <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>
                {row.brand}{row.note && <span style={{ fontSize: '0.5625rem', verticalAlign: 'super', color: '#c4b5fd' }}>*</span>}
              </span>
              <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.55)', textAlign: 'center' }}>{row.dose}</span>
              <span style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 700, background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'right' }}>{row.total}</span>
            </div>
          ))}
        </div>

        {showNew && (
          <p style={{ marginTop: '0.375rem', fontFamily: fonts.body, fontSize: '0.5625rem', color: 'rgba(250,248,245,0.35)', textAlign: 'center' }}>
            *After $40 Evolus Rewards. We help you enroll at your visit.
          </p>
        )}
        <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', textAlign: 'center' }}>
          Your injector customizes your dose. Final price may vary.
        </p>
      </div>
    </section>
  )
}

/* ======================================================
   SELL SECTIONS
   ====================================================== */

function WhyReluxeSection() {
  const ref = useSectionTrack('why_reluxe')
  const tiles = [
    { icon: <DollarIcon />, title: 'Transparent Pricing', copy: 'Every brand, every unit, posted online. No consult fees. No bait-and-switch.' },
    { icon: <PulseIcon />, title: 'Skilled, Expert Injectors', copy: 'Every injector is trained to educate — not just inject. We explain your options, map your anatomy, and customize every dose.' },
    { icon: <SmileIcon />, title: 'Natural Results', copy: 'You, just refreshed. We preserve your expressions \u2014 never frozen, never overdone.' },
  ]

  return (
    <section ref={ref} style={{ padding: '3rem 0', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1rem' }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, textAlign: 'center' }}>
          Why RELUXE Is Different
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.title} style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.5rem' }}>
              <div style={{ color: colors.violet, marginBottom: '0.75rem' }}>{tile.icon}</div>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 700, color: colors.heading }}>{tile.title}</h3>
              <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, lineHeight: 1.6 }}>{tile.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ResultsSection({ images, onOpen }) {
  const ref = useSectionTrack('results')
  const imgs = Array.isArray(images) ? images.slice(0, 6) : []

  return (
    <section ref={ref} style={{ padding: '3rem 0', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div className="md:grid md:grid-cols-12 md:gap-8 items-start">
          <div className="md:col-span-4">
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Real Patients. Real Results.</h2>
            <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>Every face is different. Your injector customizes dosing to your anatomy and goals.</p>
            <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>Results vary. Photos shown are representative outcomes.</p>
          </div>
          <div className="mt-8 md:mt-0 md:col-span-8">
            <div className="hidden md:grid grid-cols-3 gap-5">
              {imgs.map((img, i) => (
                <button key={i} type="button" onClick={() => { trackEvent('result_image_open', { index: i + 1 }); onOpen(img) }} className="relative aspect-square overflow-hidden shadow-sm hover:shadow-md transition text-left" style={{ borderRadius: '9999px' }} aria-label={`View result ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" style={{ borderRadius: '9999px' }} loading={i < 2 ? 'eager' : 'lazy'} />
                </button>
              ))}
            </div>
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">
              {imgs.map((img, i) => (
                <button key={i} type="button" onClick={() => { trackEvent('result_image_open', { index: i + 1 }); onOpen(img) }} className="snap-start shrink-0 w-[calc(50%-0.5rem)] relative aspect-square overflow-hidden shadow-sm" style={{ borderRadius: '9999px' }} aria-label={`View result ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" style={{ borderRadius: '9999px' }} loading={i < 2 ? 'eager' : 'lazy'} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqSection({ title, items }) {
  const ref = useSectionTrack('faq')
  const list = Array.isArray(items) ? items : []
  return (
    <section ref={ref} style={{ maxWidth: '48rem', margin: '0 auto', padding: '3rem 1rem' }}>
      <h3 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, textAlign: 'center', color: colors.heading }}>{title}</h3>
      <div style={{ marginTop: '1.5rem', border: `1px solid ${colors.stone}`, borderRadius: '1.5rem', backgroundColor: '#fff', overflow: 'hidden' }} className="divide-y divide-neutral-200">
        {list.map((x, i) => <FaqItem key={i} q={x.q} a={x.a} />)}
      </div>
    </section>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1rem 1.5rem', fontFamily: fonts.body, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9375rem', color: colors.heading }}>{q}</span>
        <svg className={`h-5 w-5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: colors.muted }} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
        </svg>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', fontFamily: fonts.body, color: colors.body, fontSize: '0.9375rem' }}>{a}</div>
    </details>
  )
}

function Lightbox({ img, onClose }) {
  return (
    <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: '#000' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={img.alt || 'Result'} className="w-full h-auto object-contain" />
        </div>
        <button type="button" className="mt-3 w-full rounded-xl bg-white/10 text-white py-2 text-sm font-semibold hover:bg-white/15 transition" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function Stars({ rating = 5 }) {
  const r = Math.max(0, Math.min(5, Number(rating || 0)))
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Rating: ${r} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-3 w-3 ${i < r ? 'fill-amber-400' : 'fill-neutral-300'}`} aria-hidden="true">
          <path d="M10 15.27 15.18 18l-1.64-5.03L18 9.24l-5.19-.03L10 4 7.19 9.21 2 9.24l4.46 3.73L4.82 18z" />
        </svg>
      ))}
    </div>
  )
}

/* SVG Icons */
function DollarIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
}
function PulseIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
}
function SmileIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>
}
