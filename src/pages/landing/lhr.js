// pages/landing/lhr.js
// High-intent laser hair removal landing page — real-time slot discovery + instant booking
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

const PAGE_ID = 'lhr_lp'

// Contact
const MARKETING_SMS = '3173609000'
const PHONE_CALL = '3177631142'
const DISPLAY_PHONE = '317-763-1142'

// Hero deal hook cards
const DEAL_HOOKS = [
  { id: 'multi_area', title: 'Buy 1 Area, Get 1 50% Off', subtitle: 'Largest full price, additional areas 50% off', badge: null },
  { id: 'small_area', title: 'Small Area — $100', subtitle: 'Upper Lip · Chin · Hands · Feet', badge: 'Best for Beginners' },
  { id: 'package', title: 'Buy 5, Get 3 Free', subtitle: '8 sessions + 50% off 2nd area', badge: 'Best Value' },
]

// Area pricing data (matches FindMyAreaSelector.js)
const AREA_TIERS = [
  { tier: 'small', label: 'Small', color: '#10b981', areas: ['Upper Lip', 'Chin', 'Hands', 'Feet'] },
  { tier: 'standard', label: 'Standard', color: '#0ea5e9', areas: ['Underarms', 'Bikini Line', 'Face', 'Half Arms', 'Half Back', 'Stomach', 'Shoulder'] },
  { tier: 'large', label: 'Large', color: '#7C3AED', areas: ['Brazilian (female only)', 'Lower Legs', 'Full Back', 'Full Chest'] },
  { tier: 'xlarge', label: 'X-Large', color: '#f59e0b', areas: ['Full Legs'] },
]

const TIER_PRICES = {
  small: { single: 100, pkg: 500, pkgLabel: '$500 (8 sessions)' },
  standard: { single: 250, pkg: 1250, pkgLabel: '$1,250 (8 sessions)' },
  large: { single: 450, pkg: 2250, pkgLabel: '$2,250 (8 sessions)' },
  xlarge: { single: 750, pkg: 3750, pkgLabel: '$3,750 (8 sessions)' },
}

const UNLIMITED = { price: 5000, label: '$5,000', note: '18 months · All areas · Unlimited sessions' }

const LHR_RESULTS = []
// TODO: Add result images when available

const SCARCITY_TAGS = ['Last slot', '1 available', 'Only opening']

/** ======================================================
 * Helpers
 * ====================================================== */
let _utmCache = null
function getUTMs() {
  if (_utmCache) return _utmCache
  if (typeof window === 'undefined') return {}
  try {
    const sp = new URL(window.location.href).searchParams
    const utms = {}
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach((k) => {
      const v = sp.get(k)
      if (v) utms[k] = v
    })
    _utmCache = utms
    return utms
  } catch { return {} }
}

function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  const payload = { ...params, ...getUTMs(), page: PAGE_ID, page_path: window.location?.pathname || '' }
  // FB pixel — only if loaded
  if (typeof window.fbq === 'function') {
    try { window.fbq('trackCustom', eventName, payload) } catch (_) {}
  }
  // GA4 — queue via dataLayer even before gtag.js loads (Google's standard async pattern)
  window.dataLayer = window.dataLayer || []
  const gtag = window.gtag || function () { window.dataLayer.push(arguments) }
  try { gtag('event', eventName, payload) } catch (_) {}
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
export default function LhrLandingPage() {
  const { openBookingModal } = useMember()
  const { locationKey } = useLocationPref()
  const [scrolled, setScrolled] = useState(false)

  // Slot state
  const [tiles, setTiles] = useState([])
  const [moreTiles, setMoreTiles] = useState([])
  const [showMore, setShowMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [degraded, setDegraded] = useState(false)

  // Filters
  const [filterLocation, setFilterLocation] = useState('either')
  const [filterTime, setFilterTime] = useState(null)
  const [filterProvider, setFilterProvider] = useState(null)
  const [availableProviders, setAvailableProviders] = useState([])

  // Booking
  const [bookingTile, setBookingTile] = useState(null)
  const [bookingStep, setBookingStep] = useState('area') // area | confirm | reserving | verify | error
  const [cartData, setCartData] = useState(null)
  const [bookingError, setBookingError] = useState(null)
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingCodeId, setBookingCodeId] = useState(null)
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false)

  // Area selection
  const [selectedAreaOption, setSelectedAreaOption] = useState(null) // { id, name }
  const [areaOptions, setAreaOptions] = useState([])
  const [areaOptionsLoading, setAreaOptionsLoading] = useState(false)

  useEffect(() => {
    trackEvent('landing_view', { variant: 'lhr_slots_v1' })
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Fetch LHR slots
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
          serviceSlugs: ['laserhair'],
          providerSlug: filterProvider || null,
          timeOfDay: filterTime || null,
          limit: 8,
        }),
      })
      if (!res.ok) throw new Error('Failed to load availability')
      const data = await res.json()
      const meta = data.meta || {}

      const isDegraded = meta.degraded === true
      const isFallback = !!meta.fallbackReason
      const noResults = !(data.tiles?.length) && !(data.moreTiles?.length)

      if (isFallback || (isDegraded && noResults)) {
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
        if (isDegraded) setDegraded(true)

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

  // Lazy-fetch
  const slotSectionRef = useRef(null)
  const hasFetchedRef = useRef(false)
  const fetchSlotsRef = useRef(fetchSlots)
  fetchSlotsRef.current = fetchSlots

  useEffect(() => {
    const el = slotSectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasFetchedRef.current) {
          hasFetchedRef.current = true
          fetchSlotsRef.current()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const prevFilters = useRef({ filterLocation, filterTime, filterProvider })
  useEffect(() => {
    if (!hasFetchedRef.current) return
    const prev = prevFilters.current
    if (prev.filterLocation === filterLocation && prev.filterTime === filterTime && prev.filterProvider === filterProvider) return
    prevFilters.current = { filterLocation, filterTime, filterProvider }
    fetchSlots()
  }, [filterLocation, filterTime, filterProvider, fetchSlots])

  // Fetch area options from Boulevard when booking sheet opens
  const fetchAreaOptions = useCallback(async (tile) => {
    setAreaOptionsLoading(true)
    setAreaOptions([])
    try {
      const params = new URLSearchParams({
        locationKey: tile.locationKey,
        serviceItemId: tile.serviceItemId,
        staffProviderId: tile.boulevardProviderId,
      })
      const res = await fetch(`/api/blvd/services/options?${params}`)
      if (!res.ok) throw new Error('Failed to load options')
      const data = await res.json()

      // Find the first option group with options (area selection)
      const group = (data.optionGroups || []).find((g) => g.options?.length > 0)
      if (group) {
        setAreaOptions(group.options)
      } else {
        // No option groups — skip area step
        setBookingStep('confirm')
      }
    } catch {
      // Graceful degradation — skip area step
      setBookingStep('confirm')
    } finally {
      setAreaOptionsLoading(false)
    }
  }, [])

  // Booking handlers
  const handleTileTap = (tile) => {
    trackEvent('tile_tap', { provider: tile.providerName, date: tile.date, time: tile.timeLabel, location: tile.locationKey })
    setBookingTile(tile)
    setBookingStep('area')
    setCartData(null)
    setBookingError(null)
    setBookingPhone('')
    setBookingCodeId(null)
    setSelectedAreaOption(null)
    setBookingSheetOpen(true)
    fetchAreaOptions(tile)
  }

  const handleAreaSelect = (option) => {
    setSelectedAreaOption(option)
    trackEvent('area_select', { area: option.name })
    setBookingStep('confirm')
  }

  const handleReserveAndSendCode = async (phone) => {
    if (!bookingTile) return
    setBookingStep('reserving')
    setBookingError(null)
    try {
      const cartRes = await fetch('/api/blvd/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationKey: bookingTile.locationKey,
          serviceItemId: bookingTile.serviceItemId,
          staffProviderId: bookingTile.boulevardProviderId,
          date: bookingTile.date,
          startTime: bookingTile.startTime,
          selectedOptionIds: selectedAreaOption ? [selectedAreaOption.id] : [],
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

      trackEvent('booking_reserved', { provider: bookingTile.providerName, cartId: cartJson.cartId, area: selectedAreaOption?.name || 'none' })
      setCartData(cartJson)

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
        console.warn('[lhr] send-code failed, proceeding without verification:', sendErr.message)
      }

      setBookingPhone(phone)
      setBookingCodeId(sentCodeId)
      setBookingStep('verify')
    } catch (e) {
      setBookingError(e.message)
      setBookingStep('error')
    }
  }

  const handleBookingSuccess = () => {
    trackEvent('booking_complete', { provider: bookingTile?.providerName, location: bookingTile?.locationKey, area: selectedAreaOption?.name || 'none' })
    setCartData(null)
  }

  const dismissBooking = () => {
    setBookingSheetOpen(false)
  }

  const resetBooking = () => {
    setBookingTile(null)
    setBookingStep('area')
    setCartData(null)
    setBookingError(null)
    setBookingPhone('')
    setBookingCodeId(null)
    setSelectedAreaOption(null)
    setBookingSheetOpen(false)
  }

  const resumeBooking = () => {
    setBookingSheetOpen(true)
  }

  const hasActiveReservation = cartData && bookingStep === 'verify' && !bookingSheetOpen
  const reservationExpired = cartData?.expiresAt && new Date(cartData.expiresAt) < new Date()

  const allVisible = showMore ? [...tiles, ...moreTiles] : tiles
  const { todayTiles, tomorrowTiles, thisWeekTiles, laterTiles } = groupTilesByTimeframe(allVisible)
  const smsBody = encodeURIComponent('Hi RELUXE! I\'d like to book laser hair removal.')
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`

  return (
    <BetaLayout
      minimal
      title="Laser Hair Removal Pricing & Booking"
      description="Laser hair removal starting at $100. Buy 5, get 3 free. Book in 60 seconds. RELUXE Med Spa in Carmel & Westfield, IN."
      canonical="https://reluxemedspa.com/landing/lhr"
      noindex
    >
      {/* ========== STICKY HERO ========== */}
      <section
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(16,185,129,0.15), transparent 60%)`,
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
            Smooth skin starts at{' '}
            <span style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>$100.</span>
          </h1>

          {/* Deal Hook Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" style={{ marginTop: '0.75rem', maxWidth: '40rem', marginLeft: 'auto', marginRight: 'auto' }}>
            {DEAL_HOOKS.map((deal) => (
              <div key={deal.id} style={{ position: 'relative', borderRadius: '0.875rem', border: deal.badge ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(250,248,245,0.1)', backgroundColor: deal.badge ? 'rgba(16,185,129,0.06)' : 'rgba(250,248,245,0.04)', padding: '0.75rem 0.625rem', paddingTop: deal.badge ? '1.25rem' : '0.75rem', textAlign: 'center' }}>
                {deal.badge && (
                  <span style={{
                    position: 'absolute', top: '-0.5rem', left: '50%', transform: 'translateX(-50%)',
                    background: deal.id === 'package' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    color: '#fff',
                    fontFamily: fonts.body, fontSize: '0.5rem', fontWeight: 700,
                    padding: '0.125rem 0.5rem', borderRadius: '9999px',
                    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>
                    {deal.badge}
                  </span>
                )}
                <p style={{ fontFamily: fonts.display, fontSize: 'clamp(0.875rem, 2.5vw, 1.0625rem)', fontWeight: 700, color: colors.white, lineHeight: 1.2 }}>{deal.title}</p>
                <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.5)' }}>{deal.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Featured review */}
          <div style={{ marginTop: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
              <Stars rating={5} size={10} />
              <span style={{ fontFamily: fonts.body, fontSize: '0.5625rem', color: 'rgba(250,248,245,0.35)', marginLeft: '0.125rem' }}>Google Review</span>
            </div>
            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.7)', lineHeight: 1.45, fontStyle: 'italic' }}>
              &ldquo;Best decision I&apos;ve made. After 6 sessions my underarms are completely smooth. The pricing was straightforward and booking took 30 seconds.&rdquo;
            </p>
          </div>

          {/* "See area pricing" callout */}
          <p style={{ marginTop: '0.375rem', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#34d399' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
            See area pricing below
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
        <section ref={slotSectionRef} style={{ backgroundColor: colors.ink, backgroundImage: grain, padding: '0 0 2rem' }}>
          <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1rem' }}>

            {/* Section header */}
            <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem' }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.white }}>
                Claim Your Spot
              </h2>
              <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>
                Real-time laser hair removal availability. Pick a time, lock it in.
              </p>
              <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>
                Not sure which area? No problem — your technician helps you choose at your visit.
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
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, color: colors.white }}>No laser hair removal openings match your filters</p>
                <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>Try adjusting your filters, or text us to find a time.</p>
                <a href={smsHref} onClick={() => trackEvent('sms_click', { placement: 'empty_state' })} style={{ marginTop: '0.75rem', display: 'inline-block', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#34d399', textDecoration: 'underline' }}>
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
                {todayTiles.length === 0 && tomorrowTiles.length === 0 && thisWeekTiles.length === 0 && laterTiles.length === 0 && (
                  <SlotRow label="Available" tiles={allVisible} onTap={handleTileTap} />
                )}
                {moreTiles.length > 0 && !showMore && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                      onClick={() => { setShowMore(true); trackEvent('show_more_slots') }}
                      style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#34d399', background: 'none', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '9999px', padding: '0.5rem 1.25rem', cursor: 'pointer' }}
                    >
                      Show More Times
                    </button>
                  </div>
                )}

                {/* Fallback CTA */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(250,248,245,0.06)' }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)' }}>
                    Don&apos;t see a time that works?{' '}
                    <a href={smsHref} onClick={() => trackEvent('sms_click', { placement: 'after_slots' })} style={{ color: '#34d399', fontWeight: 600, textDecoration: 'underline' }}>
                      Text us
                    </a>{' '}
                    and we&apos;ll find a spot.
                  </p>
                  <p style={{ marginTop: '0.625rem', fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)' }}>
                    Just want to talk first?{' '}
                    <button
                      onClick={() => { trackEvent('consult_click', { placement: 'after_slots' }); openBookingModal(filterLocation === 'either' ? (locationKey || 'westfield') : filterLocation) }}
                      style={{ color: '#34d399', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: fonts.body, fontSize: '0.8125rem', padding: 0 }}
                    >
                      Book a free consult
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ——— AREA PRICING TABLE ——— */}
        <AreaPricingTable />

        {/* ——— SELL CONTENT ——— */}
        <WhyLaserSection />

        {LHR_RESULTS.length > 0 && <ResultsSection images={LHR_RESULTS} />}

        <section style={{ padding: '3rem 0' }}>
          <TestimonialWidget service="laser-hair-removal" heading="What Our Patients Say" subheading="Real reviews from real laser hair removal treatments." showViewAll={false} />
        </section>

        <FaqSection
          title="Quick Answers"
          items={[
            { q: 'How much does laser hair removal cost?', a: 'Small areas start at $100/session. Packages (buy 5, get 3 free) offer the best value. Unlimited is $5,000 for 18 months — all areas, unlimited sessions.' },
            { q: 'How many sessions do I need?', a: '6-10+ sessions spaced 4-8 weeks apart. Hair grows in cycles — the laser catches ~20-30% of follicles each visit. Most patients see dramatic reduction by session 4-5.' },
            { q: 'Does it hurt?', a: 'Brief snaps with warmth — like a rubber band flick. Our devices have built-in cooling. Numbing cream is available but rarely needed.' },
            { q: 'Is it safe for dark skin?', a: 'Yes — with the right settings. We adjust wavelength and pulse width by skin type. We perform test spots on darker tones before full treatment.' },
            { q: 'What areas can you treat?', a: 'Face, underarms, bikini (including Brazilian), legs, arms, back, chest, hands, feet, and more. Small areas take 5-10 minutes, large areas 30-45 minutes.' },
            { q: 'How permanent is it?', a: 'Laser hair removal provides long-term reduction of 70-90%. Some fine or hormonal hair may return over years, but most patients enjoy smooth skin with minimal maintenance.' },
          ]}
        />

        {/* Final CTA */}
        <section style={{ backgroundColor: colors.ink, backgroundImage: `${grain}, radial-gradient(50% 50% at 50% 0%, rgba(16,185,129,0.12), transparent 60%)`, padding: '3rem 1rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: 700, color: colors.white }}>Ready for smooth skin?</h2>
            <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: typeScale.subhead.size, color: 'rgba(250,248,245,0.7)' }}>Pick a time. We&apos;ll handle the rest.</p>
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
              <a
                href={smsHref}
                onClick={() => trackEvent('sms_click', { placement: 'final_cta' })}
                style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#34d399', textDecoration: 'underline' }}
              >
                Prefer to text? Message us
              </a>
              <a
                href={`tel:${PHONE_CALL}`}
                onClick={() => trackEvent('call_click', { placement: 'final_cta' })}
                className="flex items-center gap-2 rounded-full"
                style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', padding: '0.625rem 1.5rem', textDecoration: 'none' }}
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
            <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.15)' }}>Results vary. 6-10+ sessions typically needed for optimal reduction.</p>
          </div>
        </section>
      </div>

      {/* ========== RESUME BANNER ========== */}
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
          areaOptions={areaOptions}
          areaOptionsLoading={areaOptionsLoading}
          selectedArea={selectedAreaOption}
          onAreaSelect={handleAreaSelect}
          onAreaSkip={() => setBookingStep('confirm')}
          onReserveAndSendCode={handleReserveAndSendCode}
          onSuccess={handleBookingSuccess}
          onClose={bookingStep === 'verify' ? dismissBooking : resetBooking}
          onRetry={() => setBookingStep('confirm')}
        />
      )}
    </BetaLayout>
  )
}

LhrLandingPage.getLayout = (page) => page

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
    border: active ? '1px solid rgba(52,211,153,0.5)' : '1px solid rgba(250,248,245,0.12)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: active ? 'rgba(52,211,153,0.15)' : 'rgba(250,248,245,0.04)',
    color: active ? '#34d399' : 'rgba(250,248,245,0.55)',
    whiteSpace: 'nowrap',
  })

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', paddingBottom: '0.5rem' }}>
      {[{ id: 'either', label: 'Either Location' }, { id: 'westfield', label: 'Westfield' }, { id: 'carmel', label: 'Carmel' }].map((loc) => (
        <button key={loc.id} onClick={() => onLocationChange(loc.id)} style={chipStyle(location === loc.id)}>{loc.label}</button>
      ))}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.25rem' }}>
          <div style={{ width: 14, height: 14, border: '2px solid rgba(250,248,245,0.15)', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          <style jsx>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}
    </div>
  )
}

function SlotRow({ label, tiles, onTap }) {
  const [expanded, setExpanded] = useState(false)
  if (!tiles.length) return null

  const MOBILE_INIT = 2
  const DESKTOP_INIT = 3
  const visibleMobile = expanded ? tiles : tiles.slice(0, MOBILE_INIT)
  const visibleDesktop = expanded ? tiles : tiles.slice(0, DESKTOP_INIT)
  const hasMoreMobile = tiles.length > MOBILE_INIT
  const hasMoreDesktop = tiles.length > DESKTOP_INIT

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
        {label}
      </p>
      <div className="hidden sm:grid grid-cols-3 gap-3">
        {visibleDesktop.map((tile, i) => (
          <TileCard key={tile.id} tile={tile} index={i} onTap={onTap} />
        ))}
      </div>
      <div className="sm:hidden grid grid-cols-2 gap-3">
        {visibleMobile.map((tile, i) => (
          <TileCard key={tile.id} tile={tile} index={i} onTap={onTap} />
        ))}
      </div>
      {!expanded && hasMoreMobile && (
        <div className="sm:hidden" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={() => setExpanded(true)}
            style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: '#34d399', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
          >
            +{tiles.length - MOBILE_INIT} more {label.toLowerCase()} times
          </button>
        </div>
      )}
      {!expanded && hasMoreDesktop && (
        <div className="hidden sm:block" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={() => setExpanded(true)}
            style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: '#34d399', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
          >
            +{tiles.length - DESKTOP_INIT} more {label.toLowerCase()} times
          </button>
        </div>
      )}
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
      <p style={{ fontSize: '0.6875rem', fontFamily: fonts.body, color: '#34d399', fontWeight: 600 }}>{tile.dayLabel}</p>
      <p style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: fonts.display, color: colors.white, marginTop: '0.125rem' }}>{tile.timeLabel}</p>
      <div className="flex items-center gap-2 mt-2">
        <div className="relative flex-shrink-0" style={{ width: 26, height: 26 }}>
          {tile.providerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tile.providerImage} alt={tile.providerName} className="rounded-full object-cover" style={{ width: 26, height: 26 }} />
          ) : (
            <div className="rounded-full" style={{ width: 26, height: 26, background: 'linear-gradient(135deg, #10b981, #0ea5e9)' }} />
          )}
          {badge && (
            <span style={{ position: 'absolute', bottom: -3, right: -4, fontSize: '0.5rem', fontWeight: 700, fontFamily: fonts.body, color: '#fff', backgroundColor: '#10b981', borderRadius: '4px', padding: '0 3px', lineHeight: '14px', border: '1px solid rgba(26,26,26,0.8)' }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }}>with {tile.providerName}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tile.locationKey === 'westfield' ? '#10b981' : '#0ea5e9' }} />
          <span style={{ fontSize: '0.625rem', fontFamily: fonts.body, color: 'rgba(250,248,245,0.4)', textTransform: 'capitalize' }}>{tile.locationKey}</span>
        </div>
        {scarcity && (
          <span style={{ fontSize: '0.5625rem', fontWeight: 600, fontFamily: fonts.body, color: colors.rose, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{scarcity}</span>
        )}
      </div>
      <div className="mt-2.5 text-center rounded-full" style={{ fontSize: '0.6875rem', fontWeight: 600, fontFamily: fonts.body, padding: '0.4rem', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: '#fff' }}>
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
          Book your laser hair removal appointment
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
            background: 'linear-gradient(135deg, #10b981, #0ea5e9)', border: 'none', cursor: 'pointer',
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
        <a href={smsHref} onClick={() => trackEvent('sms_click', { placement: 'fallback' })} style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#34d399', textDecoration: 'underline' }}>
          Or text us to book
        </a>
        <a href={`tel:${PHONE_CALL}`} onClick={() => trackEvent('call_click', { placement: 'fallback' })} style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, textDecoration: 'none' }}>
          Call {DISPLAY_PHONE}
        </a>
      </div>
    </div>
  )
}

/* ======================================================
   BOOKING SHEET (overlay modal) — with area selection step
   ====================================================== */

function BookingSheet({ tile, step, cartData, error, phone: confirmedPhone, codeId, areaOptions, areaOptionsLoading, selectedArea, onAreaSelect, onAreaSkip, onReserveAndSendCode, onSuccess, onClose, onRetry }) {
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

  // Match area names to tiers for color coding
  const getTierColor = (optionName) => {
    const name = (optionName || '').toLowerCase()
    for (const t of AREA_TIERS) {
      if (t.areas.some((a) => a.toLowerCase() === name)) return t.color
    }
    return '#10b981' // default emerald
  }

  return (
    <div className="fixed inset-0 z-[998] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-md mx-auto rounded-t-2xl sm:rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: colors.ink, border: '1px solid rgba(250,248,245,0.1)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10" style={{ background: 'rgba(250,248,245,0.08)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: 'rgba(250,248,245,0.5)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>

        <div style={{ padding: '1.5rem' }}>

          {/* ── AREA SELECTION STEP ── */}
          {step === 'area' && (
            <>
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pick Your Area</p>
              <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)' }}>
                Choose the area you&apos;d like treated. Your provider can adjust at your visit.
              </p>

              {areaOptionsLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse" style={{ height: 48, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem' }} />
                  ))}
                </div>
              ) : areaOptions.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                  {areaOptions.map((opt) => {
                    const isSelected = selectedArea?.id === opt.id
                    const tierColor = getTierColor(opt.name)
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onAreaSelect(opt)}
                        style={{
                          padding: '0.625rem 0.5rem',
                          borderRadius: '0.75rem',
                          border: isSelected ? `2px solid ${tierColor}` : '1px solid rgba(250,248,245,0.1)',
                          backgroundColor: isSelected ? `${tierColor}15` : 'rgba(250,248,245,0.04)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: isSelected ? '#fff' : 'rgba(250,248,245,0.7)' }}>{opt.name}</p>
                        {opt.priceDelta && opt.priceDelta !== '$0' && (
                          <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.4)', marginTop: 2 }}>{opt.priceDelta}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : null}

              <button
                onClick={onAreaSkip}
                style={{ marginTop: '0.75rem', display: 'block', width: '100%', textAlign: 'center', fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Not sure yet — I&apos;ll decide at my visit
              </button>
            </>
          )}

          {/* ── CONFIRM + PHONE ── */}
          {step === 'confirm' && (
            <>
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Claim Your Spot</p>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <DetailRow label="Service" value="Laser Hair Removal" />
                {selectedArea && <DetailRow label="Area" value={selectedArea.name} />}
                <DetailRow label="Provider" value={tile.providerName} image={tile.providerImage} />
                <DetailRow label="Date" value={tile.dayLabel} />
                <DetailRow label="Time" value={tile.timeLabel} />
                <DetailRow label="Location" value={locLabel} />
              </div>

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
                    fontFamily: fonts.body, fontSize: '1rem', padding: '0.875rem 1rem',
                    borderRadius: '0.75rem',
                    border: phoneError ? `1.5px solid ${colors.rose}` : '1.5px solid #34d399',
                    backgroundColor: 'rgba(250,248,245,0.06)', color: colors.white,
                    outline: 'none', width: '100%',
                  }}
                />
                {phoneError && (
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.rose, marginTop: 4 }}>{phoneError}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isValidPhone(phone)}
                className="w-full mt-4 rounded-full"
                style={{
                  padding: '1rem', fontFamily: fonts.body, fontSize: '1rem', fontWeight: 700,
                  background: isValidPhone(phone) ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : 'rgba(250,248,245,0.1)',
                  color: isValidPhone(phone) ? '#fff' : 'rgba(250,248,245,0.3)',
                  border: 'none', cursor: isValidPhone(phone) ? 'pointer' : 'not-allowed',
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

          {/* ── RESERVING ── */}
          {step === 'reserving' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(250,248,245,0.1)', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto' }} />
              <p style={{ marginTop: '1rem', fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.white }}>Reserving &amp; sending code&hellip;</p>
              <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>Don&apos;t close this window</p>
              <style jsx>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* ── VERIFY ── */}
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
              <button onClick={onRetry} className="mt-4 rounded-full" style={{ padding: '0.75rem 2rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: '#fff', border: 'none', cursor: 'pointer' }}>
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
          width: '100%', maxWidth: 480, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem max(0.75rem, env(safe-area-inset-bottom))',
          backgroundColor: 'rgba(26,26,26,0.95)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(52,211,153,0.3)',
          cursor: 'pointer', border: 'none', textAlign: 'left',
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#34d399' }} />
          <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2px solid rgba(52,211,153,0.4)', animation: 'pulse-ring 1.5s ease-out infinite' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>
            Your spot is held — enter your code
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.5)', marginTop: 1 }}>
            {tile?.providerName ? `with ${tile.providerName} · ` : ''}{tile?.timeLabel || ''}
          </p>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', fontWeight: 700, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}</p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.5rem', color: 'rgba(250,248,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>remaining</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
   AREA PRICING TABLE
   ====================================================== */

function AreaPricingTable() {
  const ref = useSectionTrack('area_pricing')

  return (
    <section ref={ref} style={{ backgroundColor: colors.ink, backgroundImage: grain, padding: '2rem 0' }}>
      <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '0 1rem' }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.white, textAlign: 'center' }}>
          Area Pricing
        </h2>
        <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, textAlign: 'center' }}>
          Every area, every package &mdash; no hidden fees.
        </p>

        <div style={{ marginTop: '1rem', borderRadius: '1rem', border: '1px solid rgba(250,248,245,0.1)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1.2fr', padding: '0.625rem 0.75rem', backgroundColor: 'rgba(250,248,245,0.06)', borderBottom: '1px solid rgba(250,248,245,0.08)' }}>
            <span style={{ fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Size</span>
            <span style={{ fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Areas</span>
            <span style={{ fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Single</span>
            <span style={{ fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Pkg (8)</span>
          </div>
          {/* Tier rows */}
          {AREA_TIERS.map((t, i) => {
            const price = TIER_PRICES[t.tier]
            return (
              <div key={t.tier} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1.2fr', padding: '0.75rem', alignItems: 'start', borderBottom: i < AREA_TIERS.length - 1 ? '1px solid rgba(250,248,245,0.06)' : 'none' }}>
                <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: t.color }}>{t.label}</span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)', lineHeight: 1.5 }}>{t.areas.join(', ')}</span>
                <span style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 700, color: colors.white, textAlign: 'right' }}>${price.single}</span>
                <span style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'right' }}>${price.pkg.toLocaleString()}</span>
              </div>
            )
          })}
          {/* Unlimited row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2.2fr', padding: '0.75rem', alignItems: 'center', borderTop: '1px solid rgba(250,248,245,0.1)', backgroundColor: 'rgba(16,185,129,0.06)' }}>
            <span style={{ fontFamily: fonts.display, fontSize: '0.875rem', fontWeight: 700, color: '#34d399' }}>Unlimited</span>
            <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)' }}>{UNLIMITED.note}</span>
            <span style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'right' }}>{UNLIMITED.label}</span>
          </div>
        </div>

        {/* Multi-area discount */}
        <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', textAlign: 'center' }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>
            Multi-area discount: Largest area full price, every additional area 50% off same visit.
          </p>
        </div>

        <p style={{ marginTop: '0.375rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', textAlign: 'center' }}>
          Packages are Buy 5, Get 3 Free (8 total sessions). Area sizing confirmed at visit.
        </p>
      </div>
    </section>
  )
}

/* ======================================================
   SELL SECTIONS
   ====================================================== */

function WhyLaserSection() {
  const ref = useSectionTrack('why_laser')
  const tiles = [
    { icon: <TargetIcon />, title: 'Permanent Results', copy: 'Target follicles at the root. 70-90% reduction after a full series — no more daily shaving or ingrowns.' },
    { icon: <ClockIcon />, title: 'Fast Sessions', copy: 'Upper lip in 5 minutes. Full legs in 30-45. Quick appointments that fit your schedule.' },
    { icon: <ShieldIcon />, title: 'All Skin Types', copy: 'We adjust wavelength and settings by Fitzpatrick type. Safe and effective for skin types I-VI.' },
  ]

  return (
    <section ref={ref} style={{ padding: '3rem 0', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1rem' }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, textAlign: 'center' }}>
          Why Laser?
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.title} style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.5rem' }}>
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}>{tile.icon}</div>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 700, color: colors.heading }}>{tile.title}</h3>
              <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, lineHeight: 1.6 }}>{tile.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ResultsSection({ images }) {
  const ref = useSectionTrack('results')
  const imgs = Array.isArray(images) ? images.slice(0, 6) : []
  if (!imgs.length) return null

  return (
    <section ref={ref} style={{ padding: '3rem 0', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, textAlign: 'center' }}>Real Patients. Real Results.</h2>
        <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3">
          {imgs.map((img, i) => (
            <div key={i} className="aspect-square overflow-hidden shadow-sm" style={{ borderRadius: '1rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading={i < 2 ? 'eager' : 'lazy'} />
            </div>
          ))}
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

function Stars({ rating = 5, size }) {
  const r = Math.max(0, Math.min(5, Number(rating || 0)))
  const sizeClass = size ? undefined : 'h-3 w-3'
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Rating: ${r} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`${sizeClass || ''} ${i < r ? 'fill-amber-400' : 'fill-neutral-300'}`} style={size ? { width: size, height: size } : undefined} aria-hidden="true">
          <path d="M10 15.27 15.18 18l-1.64-5.03L18 9.24l-5.19-.03L10 4 7.19 9.21 2 9.24l4.46 3.73L4.82 18z" />
        </svg>
      ))}
    </div>
  )
}

/* SVG Icons */
function TargetIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
}
function ClockIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}
function ShieldIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
}
