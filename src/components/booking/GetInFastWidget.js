import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { colors, fontPairings, gradients } from '@/components/preview/tokens'
import useExperimentSession from '@/hooks/useExperimentSession'

const fonts = fontPairings.bold
const CALL_HREF = 'tel:+13177631142'
const FULL_SCHEDULE_HREF = 'https://blvd.app/@reluxemedspa'

function randomRefreshMs() {
  return 45_000 + Math.floor(Math.random() * 15_001)
}

function getInventoryLine(totalOpenings, windowDayCount) {
  if (totalOpenings <= 2) return 'Just a couple openings left.'
  if (totalOpenings <= 5) return `Only ${totalOpenings} openings remaining.`
  return `${totalOpenings} openings available over the next ${windowDayCount} days.`
}

function getCardState(opening) {
  if (opening._isClaimed) return 'CLAIMED'
  if (opening._isBooked) return 'BOOKED'
  if (opening.bookingMode === 'CALL_ONLY') return 'CALL_ONLY'
  if (opening.bookingMode === 'CALL_PREFERRED') return 'STARTING_SOON'
  return 'AVAILABLE'
}

function mergeFeed(openings, claimedCards, showSocialProofCards) {
  const base = openings.map((o) => ({ ...o, _key: `open:${o.startAt}:${o.provider?.id}:${o.location?.id}` }))

  if (showSocialProofCards && base.length > 1) {
    const social = []
    const first = base[Math.min(1, base.length - 1)]
    if (first) social.push({ ...first, _isBooked: true, _key: `booked:${first._key}` })

    const second = base[Math.min(3, base.length - 1)]
    if (second && second._key !== first?._key) {
      social.push({ ...second, _isBooked: true, _key: `booked:${second._key}` })
    }

    if (social[0]) base.splice(Math.min(1, base.length), 0, social[0])
    if (social[1]) base.splice(Math.min(4, base.length), 0, social[1])
  }

  if (claimedCards.length > 0) {
    const claimed = claimedCards.map((c, i) => ({ ...c, _isClaimed: true, _key: `claimed:${c.startAt}:${c.provider?.id}:${i}` }))
    return [...claimed, ...base]
  }

  return base
}

function formatHeader(data) {
  if (data?.isAfterTwoPm) {
    return {
      title: "Here's what's open right now.",
      subtitle: 'A few last-minute appointments just became available across Carmel & Westfield.',
      liveCopy: 'Availability updates live. Some times fill quickly.',
    }
  }

  return {
    title: 'Need in today?',
    subtitle: "Here's what's actually available.",
    liveCopy: 'Availability updates live.',
  }
}

function SkeletonCard() {
  return (
    <div
      className="animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        padding: '1rem',
        minHeight: 176,
      }}
    >
      <div style={{ width: '50%', height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.08)', marginBottom: 10 }} />
      <div style={{ width: '40%', height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
      <div style={{ width: '65%', height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
      <div style={{ width: '35%', height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.08)', marginBottom: 14 }} />
      <div style={{ width: '100%', height: 44, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}

function Card({ opening, isLastSlot, onBookClick, onCallClick }) {
  const state = getCardState(opening)
  const disabled = state === 'BOOKED' || state === 'CLAIMED'
  const badge =
    state === 'BOOKED'
      ? 'Booked'
      : state === 'CLAIMED'
      ? 'Just Claimed'
      : state === 'STARTING_SOON'
      ? 'Starting Soon'
      : isLastSlot
      ? 'Last Slot'
      : null

  return (
    <article
      style={{
        background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
        border: disabled ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.12)',
        borderRadius: '1rem',
        padding: '1rem',
        opacity: disabled ? 0.68 : 1,
        transition: 'opacity 220ms ease, transform 220ms ease',
      }}
    >
      <div className="flex items-center justify-between">
        <p style={{ fontFamily: fonts.body, fontSize: '0.74rem', color: '#A78BFA', fontWeight: 600 }}>{opening.dayLabel}</p>
        {badge && (
          <span
            style={{
              fontFamily: fonts.body,
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: state === 'CLAIMED' ? colors.rose : 'rgba(250,248,245,0.86)',
              border: `1px solid ${state === 'CLAIMED' ? `${colors.rose}44` : 'rgba(250,248,245,0.26)'}`,
              borderRadius: 999,
              padding: '0.18rem 0.45rem',
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <p style={{ fontFamily: fonts.display, fontSize: '1.5rem', lineHeight: 1.05, color: colors.white, marginTop: 6 }}>
        {opening.timeLabel}
      </p>

      <div className="flex items-center gap-2 mt-3">
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: gradients.primary }} />
        <p style={{ fontFamily: fonts.body, fontSize: '0.86rem', color: 'rgba(250,248,245,0.82)' }}>
          {opening.provider?.name} | {opening.location?.name}
        </p>
      </div>

      <p style={{ fontFamily: fonts.body, fontSize: '0.74rem', color: 'rgba(250,248,245,0.58)', marginTop: 6 }}>
        {opening.service?.name || 'Treatment'}
      </p>

      {state === 'BOOKED' || state === 'CLAIMED' ? (
        <div
          style={{
            marginTop: 14,
            borderRadius: 999,
            padding: '0.72rem 0.9rem',
            textAlign: 'center',
            fontFamily: fonts.body,
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'rgba(250,248,245,0.7)',
            border: '1px solid rgba(250,248,245,0.18)',
          }}
        >
          No longer available
        </div>
      ) : state === 'CALL_ONLY' ? (
        <a
          href={CALL_HREF}
          onClick={() => onCallClick(opening)}
          style={{
            marginTop: 14,
            borderRadius: 999,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fonts.body,
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#fff',
            background: gradients.primary,
            textDecoration: 'none',
          }}
        >
          Call Now
        </a>
      ) : state === 'STARTING_SOON' ? (
        <div style={{ marginTop: 14 }}>
          <a
            href={CALL_HREF}
            onClick={() => onCallClick(opening)}
            style={{
              borderRadius: 999,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.body,
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#fff',
              background: gradients.primary,
              textDecoration: 'none',
            }}
          >
            Call to Book
          </a>
          <a
            href={opening.bookingDeepLink || FULL_SCHEDULE_HREF}
            onClick={() => onBookClick(opening)}
            style={{
              marginTop: 8,
              display: 'inline-block',
              fontFamily: fonts.body,
              fontSize: '0.8rem',
              color: 'rgba(250,248,245,0.76)',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            Try booking online
          </a>
        </div>
      ) : (
        <a
          href={opening.bookingDeepLink || FULL_SCHEDULE_HREF}
          onClick={() => onBookClick(opening)}
          style={{
            marginTop: 14,
            borderRadius: 999,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fonts.body,
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#fff',
            background: gradients.primary,
            textDecoration: 'none',
          }}
        >
          Reserve This Time
        </a>
      )}
    </article>
  )
}

export default function GetInFastWidget({
  locationId,
  providerId,
  serviceId,
  serviceCategoryId,
  maxResults = 6,
  showSocialProofCards = false,
  titleOverride,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [claimedCards, setClaimedCards] = useState([])
  const [inventoryPulse, setInventoryPulse] = useState(false)

  const refreshTimerRef = useRef(null)
  const firstLoadTrackedRef = useRef(false)
  const impressionSetRef = useRef(new Set())
  const prevRealOpeningsRef = useRef([])

  const { trackEvent } = useExperimentSession('today_v1')

  const fallbackQueryParams = useMemo(() => {
    if (typeof window === 'undefined') return {}
    const params = new URLSearchParams(window.location.search)
    return {
      locationId: params.get('locationId') || params.get('location') || undefined,
      providerId: params.get('providerId') || params.get('provider') || undefined,
      serviceId: params.get('serviceId') || params.get('service') || undefined,
      serviceCategoryId: params.get('serviceCategoryId') || params.get('category') || undefined,
    }
  }, [])

  const query = useMemo(
    () => ({
      locationId: locationId || fallbackQueryParams.locationId,
      providerId: providerId || fallbackQueryParams.providerId,
      serviceId: serviceId || fallbackQueryParams.serviceId,
      serviceCategoryId: serviceCategoryId || fallbackQueryParams.serviceCategoryId,
      limit: String(Math.max(4, Math.min(30, Number(maxResults) || 6)) * 3),
    }),
    [locationId, providerId, serviceId, serviceCategoryId, maxResults, fallbackQueryParams]
  )

  const fetchBoard = useCallback(
    async ({ isAutoRefresh = false } = {}) => {
      try {
        if (isAutoRefresh) {
          setRefreshing(true)
          trackEvent('today_auto_refresh', {})
        }

        const params = new URLSearchParams()
        Object.entries(query).forEach(([k, v]) => {
          if (v) params.set(k, v)
        })

        const res = await fetch(`/api/availability/today?${params.toString()}`)
        const payload = await res.json()

        const prevOpenings = prevRealOpeningsRef.current || []
        const nextIds = new Set((payload.openings || []).map((o) => o.id || `${o.startAt}:${o.provider?.id}:${o.location?.id}`))

        const disappeared = prevOpenings.filter((o) => {
          const id = o.id || `${o.startAt}:${o.provider?.id}:${o.location?.id}`
          return !nextIds.has(id)
        })

        if (disappeared.length > 0) {
          const claimed = disappeared.slice(0, 2).map((o) => ({ ...o }))
          setClaimedCards((curr) => [...claimed, ...curr].slice(0, 3))
          setTimeout(() => {
            setClaimedCards((curr) => curr.slice(0, Math.max(0, curr.length - claimed.length)))
          }, 8000)
        }

        if (data && typeof data.totalOpenings === 'number' && data.totalOpenings !== payload.totalOpenings) {
          setInventoryPulse(true)
          trackEvent('today_inventory_change', {
            from: data.totalOpenings,
            to: payload.totalOpenings,
          })
          setTimeout(() => setInventoryPulse(false), 420)
        }

        prevRealOpeningsRef.current = payload.openings || []
        setData(payload)
        setLoading(false)

        if (!firstLoadTrackedRef.current) {
          firstLoadTrackedRef.current = true
          trackEvent('today_page_view', {
            windowDays: Array.isArray(payload.windowDays) ? payload.windowDays.length : 0,
            totalOpenings: payload.totalOpenings || 0,
          })
          if (!payload.totalOpenings) {
            trackEvent('today_no_availability', {
              windowDays: Array.isArray(payload.windowDays) ? payload.windowDays.length : 0,
            })
          }
        }

        for (const opening of payload.openings || []) {
          const impressionId = opening.id || `${opening.startAt}:${opening.provider?.id}:${opening.location?.id}`
          if (impressionSetRef.current.has(impressionId)) continue
          impressionSetRef.current.add(impressionId)
          trackEvent('today_card_impression', {
            bookingMode: opening.bookingMode,
            providerId: opening.provider?.id,
            locationId: opening.location?.id,
            startAt: opening.startAt,
          })
        }
      } catch {
        setLoading(false)
      } finally {
        setRefreshing(false)
      }
    },
    [data, query, trackEvent]
  )

  useEffect(() => {
    fetchBoard({ isAutoRefresh: false })
  }, [fetchBoard])

  useEffect(() => {
    let active = true

    const loop = async () => {
      const wait = randomRefreshMs()
      refreshTimerRef.current = window.setTimeout(async () => {
        if (!active) return
        await fetchBoard({ isAutoRefresh: true })
        if (!active) return
        loop()
      }, wait)
    }

    if (typeof window !== 'undefined') {
      loop()
    }

    return () => {
      active = false
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [fetchBoard])

  const boardOpenings = useMemo(() => {
    const real = data?.openings || []
    const merged = mergeFeed(real, claimedCards, showSocialProofCards)
    return merged.slice(0, Math.max(4, Number(maxResults) || 6))
  }, [data, claimedCards, showSocialProofCards, maxResults])

  const header = formatHeader(data)
  const inventoryLine = getInventoryLine(data?.totalOpenings || 0, (data?.windowDays || []).length || 2)
  const nextAvailable = (data?.openings || [])[0] || null
  const nothingToday = (data?.totalTodayOpenings || 0) === 0 && (data?.totalOpenings || 0) > 0

  const handleBookClick = useCallback(
    (opening) => {
      trackEvent('today_book_click', {
        bookingMode: opening.bookingMode,
        providerId: opening.provider?.id,
        locationId: opening.location?.id,
        startAt: opening.startAt,
      })
    },
    [trackEvent]
  )

  const handleCallClick = useCallback(
    (opening) => {
      trackEvent('today_call_click', {
        bookingMode: opening.bookingMode,
        providerId: opening.provider?.id,
        locationId: opening.location?.id,
        startAt: opening.startAt,
      })
    },
    [trackEvent]
  )

  return (
    <section
      style={{
        background: 'linear-gradient(165deg, #130f20 0%, #171226 42%, #1f152d 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '1.25rem',
        padding: '1rem',
      }}
    >
      <header>
        <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.8rem, 5vw, 2.35rem)', color: colors.white, lineHeight: 1.08 }}>
          {titleOverride || header.title}
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: '0.95rem', color: 'rgba(250,248,245,0.78)', marginTop: 8 }}>{header.subtitle}</p>
        <p style={{ fontFamily: fonts.body, fontSize: '0.8rem', color: 'rgba(250,248,245,0.68)', marginTop: 8 }}>{header.liveCopy}</p>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: '0.88rem',
            color: inventoryPulse ? colors.rose : 'rgba(250,248,245,0.9)',
            marginTop: 8,
            transition: 'color 200ms ease, opacity 200ms ease',
          }}
        >
          {inventoryLine}
        </p>
        <p style={{ fontFamily: fonts.body, fontSize: '0.82rem', color: 'rgba(250,248,245,0.6)', marginTop: 4 }}>{data?.whyThisShowing || 'Showing next available across both locations.'}</p>
      </header>

      <p style={{ fontFamily: fonts.body, fontSize: '0.76rem', color: 'rgba(250,248,245,0.58)', marginTop: 10 }}>These openings move quickly.</p>

      {nextAvailable && (
        <div
          style={{
            marginTop: 14,
            background: 'rgba(124,58,237,0.13)',
            border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: '1rem',
            padding: '0.9rem',
          }}
        >
          <p style={{ fontFamily: fonts.body, fontSize: '0.68rem', color: 'rgba(250,248,245,0.68)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Next Available Appointment
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.92rem', color: colors.white, marginTop: 4 }}>
            {nextAvailable.dayLabel} at {nextAvailable.timeLabel} | {nextAvailable.provider?.name} | {nextAvailable.location?.name}
          </p>
          <a
            href={nextAvailable.bookingDeepLink || FULL_SCHEDULE_HREF}
            onClick={() => handleBookClick(nextAvailable)}
            style={{
              marginTop: 10,
              borderRadius: 999,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.body,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#fff',
              background: gradients.primary,
              textDecoration: 'none',
            }}
          >
            Reserve This Time
          </a>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 mt-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : data?.totalOpenings ? (
        <>
          {nothingToday && (
            <p style={{ fontFamily: fonts.body, fontSize: '0.86rem', color: 'rgba(250,248,245,0.78)', marginTop: 14 }}>
              Nothing left today.
            </p>
          )}
          <div style={{ marginTop: 12, opacity: refreshing ? 0.7 : 1, transition: 'opacity 220ms ease' }}>
            <div className="grid grid-cols-1 gap-3">
              {boardOpenings.map((opening, i) => (
                <Card
                  key={opening._key || i}
                  opening={opening}
                  isLastSlot={!opening._isBooked && !opening._isClaimed && i === 0 && data.totalOpenings === 1}
                  onBookClick={handleBookClick}
                  onCallClick={handleCallClick}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            marginTop: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '1rem',
            padding: '1rem',
          }}
        >
          <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', color: colors.white }}>Nothing immediate right now.</h3>
          <p style={{ fontFamily: fonts.body, fontSize: '0.9rem', color: 'rgba(250,248,245,0.74)', marginTop: 8 }}>
            We still have openings this week.
          </p>
          <div className="flex items-center gap-2" style={{ marginTop: 12 }}>
            <a
              href={FULL_SCHEDULE_HREF}
              onClick={() => trackEvent('today_see_more_click', { source: 'empty_state' })}
              style={{
                minHeight: 44,
                borderRadius: 999,
                padding: '0.7rem 1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: gradients.primary,
                color: '#fff',
                fontFamily: fonts.body,
                fontSize: '0.88rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              View full schedule
            </a>
            <a
              href={CALL_HREF}
              onClick={() => trackEvent('today_call_click', { source: 'empty_state' })}
              style={{
                minHeight: 44,
                borderRadius: 999,
                padding: '0.7rem 1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(250,248,245,0.3)',
                color: 'rgba(250,248,245,0.9)',
                fontFamily: fonts.body,
                fontSize: '0.88rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Call us
            </a>
          </div>
        </div>
      )}

      {data?.totalOpenings > boardOpenings.filter((o) => !o._isBooked && !o._isClaimed).length && (
        <a
          href={FULL_SCHEDULE_HREF}
          onClick={() => trackEvent('today_see_more_click', { source: 'footer_link' })}
          style={{
            marginTop: 14,
            display: 'inline-block',
            fontFamily: fonts.body,
            fontSize: '0.82rem',
            color: 'rgba(250,248,245,0.76)',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          View full schedule
        </a>
      )}

      {data?.openings?.some((o) => o.bookingMode === 'CALL_ONLY') && (
        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.64)', marginTop: 10 }}>
          Online booking closes 1 hour before start time. Call us to check immediate availability.
        </p>
      )}
    </section>
  )
}
