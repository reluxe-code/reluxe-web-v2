// src/components/booking/TodayWidget.js
// Reusable "live availability" widget for embedding on provider pages, location pages, etc.
// Compact version of the /today board — no hero, minimal header, auto-refresh.
import { useState, useEffect, useCallback, useRef } from 'react'
import { colors, gradients, fontPairings } from '@/components/preview/tokens'

const fonts = fontPairings.bold
const PHONE_NUMBER = '3174008785'
const PHONE_DISPLAY = '(317) 400-8785'
const REFRESH_INTERVAL_MS = 50_000

/**
 * <TodayWidget />
 *
 * Props:
 *   locationId       — filter to location (e.g. "westfield")
 *   providerId       — filter to provider
 *   serviceId        — filter to service
 *   serviceCategoryId — filter by category
 *   maxResults       — max cards to show (default 6)
 *   showSocialProofCards — show "Booked" ghost cards (default false)
 *   titleOverride    — custom heading text
 *   trackEvent       — optional analytics fn(eventName, metadata)
 */
export default function TodayWidget({
  locationId,
  providerId,
  serviceId,
  serviceCategoryId,
  maxResults = 6,
  showSocialProofCards = false,
  titleOverride,
  trackEvent: externalTrackEvent,
}) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [claimedIds, setClaimedIds] = useState(new Set())
  const prevIdsRef = useRef(new Set())

  const trackEvent = useCallback((name, meta = {}) => {
    if (externalTrackEvent) externalTrackEvent(name, meta)
  }, [externalTrackEvent])

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const params = new URLSearchParams()
      if (locationId) params.set('locationId', locationId)
      if (providerId) params.set('providerId', providerId)
      if (serviceId) params.set('serviceId', serviceId)
      if (serviceCategoryId) params.set('serviceCategoryId', serviceCategoryId)
      params.set('limit', String(maxResults + 4)) // fetch extra for social proof

      const res = await fetch(`/api/availability/today?${params}`)
      if (!res.ok) throw new Error('Failed')
      const newData = await res.json()

      if (isRefresh && data) {
        const newIds = new Set(newData.openings.map(o => `${o.provider.id}:${o.startAt}`))
        prevIdsRef.current.forEach(id => {
          if (!newIds.has(id)) setClaimedIds(prev => new Set([...prev, id]))
        })
      }
      prevIdsRef.current = new Set(newData.openings.map(o => `${o.provider.id}:${o.startAt}`))
      setData(newData)
    } catch {
      // Silent fail on widget
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [locationId, providerId, serviceId, serviceCategoryId, maxResults, data])

  useEffect(() => { fetchData(false) }, [locationId, providerId, serviceId, serviceCategoryId])

  useEffect(() => {
    const timer = setInterval(() => fetchData(true), REFRESH_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [fetchData])

  const openings = (data?.openings || []).slice(0, maxResults)

  if (loading) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {Array.from({ length: Math.min(4, maxResults) }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.75rem', padding: '1rem', height: 120,
            }}>
              <div style={{ width: '40%', height: 10, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 6 }} />
              <div style={{ width: '55%', height: 20, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
              <div style={{ width: '70%', height: 10, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />
              <div style={{ width: '100%', height: 28, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || openings.length === 0) {
    return (
      <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
          No immediate openings right now.
        </p>
        <a href="/today" style={{
          fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600,
          color: colors.violet, textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block',
        }}>
          Check full availability
        </a>
      </div>
    )
  }

  // Build display list with optional social proof
  const display = []
  let realIdx = 0
  for (let i = 0; realIdx < openings.length && display.length < maxResults; i++) {
    if (showSocialProofCards && i === 2 && realIdx > 0 && realIdx < openings.length) {
      display.push({ type: 'booked', data: openings[realIdx - 1], key: `booked-${i}` })
    }
    if (realIdx < openings.length && display.length < maxResults) {
      const o = openings[realIdx]
      const uid = `${o.provider.id}:${o.startAt}`
      display.push({
        type: claimedIds.has(uid) ? 'claimed' : 'available',
        data: o,
        key: uid,
      })
      realIdx++
    }
  }

  return (
    <div style={{ padding: '0.75rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white }}>
            {titleOverride || 'Available Now'}
          </h3>
          <a href="/today" style={{
            fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500,
            color: colors.violet, textDecoration: 'none',
          }}>
            See all
          </a>
        </div>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.125rem' }}>
          These openings move quickly.
        </p>
      </div>

      {/* Cards */}
      <div
        className="transition-opacity duration-500"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', opacity: refreshing ? 0.7 : 1 }}
      >
        {display.map((item, i) => {
          if (item.type === 'claimed') {
            return (
              <div key={item.key} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.75rem', padding: '0.75rem', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'rgba(26,26,26,0.85)', borderRadius: '0.75rem', zIndex: 1,
                }}>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, color: colors.rose, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Just Claimed
                  </span>
                </div>
                <div style={{ width: '40%', height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 6 }} />
                <div style={{ width: '50%', height: 18, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 10 }} />
                <div style={{ width: '60%', height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)' }} />
              </div>
            )
          }
          if (item.type === 'booked') {
            return (
              <div key={item.key} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.75rem', padding: '0.75rem', opacity: 0.45,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(255,255,255,0.3)' }}>{item.data.dayLabel}</span>
                  <span style={{
                    fontFamily: fonts.body, fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase',
                    padding: '0.1rem 0.35rem', borderRadius: '0.25rem',
                    backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)',
                  }}>Booked</span>
                </div>
                <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', lineHeight: 1.1 }}>
                  {item.data.timeLabel}
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.375rem' }}>
                  {item.data.provider.name}
                </p>
              </div>
            )
          }
          // Available
          const o = item.data
          const isCta = o.bookingMode === 'CALL_ONLY' || o.bookingMode === 'CALL_PREFERRED'
          return (
            <div key={item.key} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.75rem', padding: '0.75rem',
            }}>
              <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 500, color: colors.violet, marginBottom: 1 }}>
                {o.dayLabel}
              </p>
              <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white, lineHeight: 1.1 }}>
                {o.timeLabel}
              </p>
              <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.375rem' }}>
                {o.provider.name} &middot; {o.location.name}
              </p>
              <span style={{
                fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 600,
                color: colors.white, backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
                display: 'inline-block', marginTop: '0.25rem',
              }}>
                {o.service.name}
              </span>
              {isCta ? (
                <a href={`tel:${PHONE_NUMBER}`} className="block text-center rounded-full" style={{
                  fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 700,
                  padding: '0.375rem', marginTop: '0.5rem',
                  background: o.bookingMode === 'CALL_ONLY' ? colors.rose : gradients.primary,
                  color: '#fff', textDecoration: 'none', borderRadius: 9999,
                }}>
                  {o.bookingMode === 'CALL_ONLY' ? 'Call Now' : 'Call to Book'}
                </a>
              ) : (
                <a href={o.bookingDeepLink || '/today'} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackEvent('today_widget_book_click', { provider: o.provider.name, startAt: o.startAt })}
                  className="block text-center rounded-full"
                  style={{
                    fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 700,
                    padding: '0.375rem', marginTop: '0.5rem',
                    background: gradients.primary, color: '#fff',
                    textDecoration: 'none', borderRadius: 9999,
                  }}>
                  Reserve
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
