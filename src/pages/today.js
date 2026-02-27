// src/pages/today.js
// RELUXE /today — Live availability board. High-conversion, mobile-first.
// Surfaces same-day + near-term openings for SMS/social/ad traffic.
import { useState, useEffect, useCallback, useRef, Component } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { colors, gradients, fontPairings } from '@/components/preview/tokens'
import ClientInfoForm from '@/components/booking/ClientInfoForm'
import useExperimentSession from '@/hooks/useExperimentSession'
import { getTrackingToken } from '@/lib/trackingToken'

const fonts = fontPairings.bold

const PHONE_NUMBER = '3174008785'
const PHONE_DISPLAY = '(317) 400-8785'
const REFRESH_INTERVAL_MS = 50_000 // ~50s (within 45-60s range)

// ─── Error Boundary ───
class TodayErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('[TodayErrorBoundary]', error, info?.componentStack) }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', color: colors.white, marginBottom: 12 }}>
              Something went wrong
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
              Please try again or call us to book.
            </p>
            <a href={`tel:${PHONE_NUMBER}`} style={{
              fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600,
              padding: '0.75rem 2rem', borderRadius: 9999, background: gradients.primary,
              color: '#fff', textDecoration: 'none', display: 'inline-block',
            }}>
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Inventory Count Line ───
function InventoryLine({ count, windowDays, pulse }) {
  if (count === 0) return null
  let text
  if (count <= 2) text = "Just a couple openings left."
  else if (count <= 5) text = `Only ${count} openings remaining.`
  else text = `${count} openings available over the next ${windowDays} days.`

  return (
    <p
      className="transition-colors duration-700"
      style={{
        fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
        color: pulse ? colors.violet : 'rgba(255,255,255,0.6)',
        marginTop: '0.375rem',
      }}
    >
      {text}
    </p>
  )
}

// ─── Skeleton Card ───
function SkeletonCard() {
  return (
    <div className="animate-pulse" style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '1rem', padding: '1rem', display: 'flex', gap: '0.625rem',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ width: '30%', height: 10, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 6 }} />
        <div style={{ width: '55%', height: 24, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 10 }} />
        <div style={{ width: '40%', height: 10, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 6 }} />
        <div style={{ width: '50%', height: 10, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />
        <div style={{ width: '100%', height: 36, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.06)' }} />
      </div>
      <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', flexShrink: 0, alignSelf: 'center' }} />
    </div>
  )
}

// ─── Badge Component ───
function Badge({ label, variant }) {
  const styles = {
    booked: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' },
    claimed: { bg: `${colors.rose}15`, color: colors.rose, border: `1px solid ${colors.rose}30` },
    startingSoon: { bg: `${colors.violet}15`, color: colors.violet, border: `1px solid ${colors.violet}30` },
    lastSlot: { bg: `${colors.rose}12`, color: colors.rose, border: `1px solid ${colors.rose}25` },
    callOnly: { bg: `${colors.rose}12`, color: colors.rose, border: `1px solid ${colors.rose}25` },
  }
  const s = styles[variant] || styles.booked
  return (
    <span style={{
      fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      padding: '0.15rem 0.5rem', borderRadius: '0.375rem',
      backgroundColor: s.bg, color: s.color, border: s.border,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ─── CTA Button (booking mode aware) ───
function CTAButton({ bookingMode, onClick }) {
  if (bookingMode === 'CALL_ONLY') {
    return (
      <a href={`tel:${PHONE_NUMBER}`} className="block text-center rounded-full" style={{
        fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 700,
        padding: '0.625rem', background: colors.rose, color: '#fff',
        textDecoration: 'none',
      }}>
        Call Now
      </a>
    )
  }
  if (bookingMode === 'CALL_PREFERRED') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <a href={`tel:${PHONE_NUMBER}`} className="block text-center rounded-full" style={{
          fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 700,
          padding: '0.625rem', background: gradients.primary, color: '#fff',
          textDecoration: 'none',
        }}>
          Call to Book
        </a>
        <button onClick={onClick} className="w-full rounded-full" style={{
          fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500,
          padding: '0.375rem', background: 'transparent', color: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
        }}>
          Try booking online
        </button>
      </div>
    )
  }
  // ONLINE
  return (
    <button onClick={onClick} className="w-full rounded-full" style={{
      fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 700,
      padding: '0.625rem', background: gradients.primary, color: '#fff',
      border: 'none', cursor: 'pointer',
    }}>
      Reserve This Time
    </button>
  )
}

// ─── Availability Card (matches reveal TileCard style) ───
function AvailabilityCard({ opening, onBook, animDelay = 0, isLastSlotForDay = false }) {
  const badge = opening.bookingMode === 'CALL_ONLY'
    ? { label: 'Starting Soon', variant: 'callOnly' }
    : opening.bookingMode === 'CALL_PREFERRED'
    ? { label: 'Starting Soon', variant: 'startingSoon' }
    : isLastSlotForDay
    ? { label: 'Last Slot', variant: 'lastSlot' }
    : null

  const providerImage = opening.provider.image

  return (
    <div
      className="animate-[tileIn_0.4s_ease-out_both]"
      style={{
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem',
        padding: '1rem', animationDelay: `${animDelay}ms`,
        display: 'flex', gap: '0.625rem',
      }}
    >
      {/* Left: info + CTA */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Day label + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: 2 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.violet }}>
            {opening.dayLabel}
          </p>
          {badge && <Badge label={badge.label} variant={badge.variant} />}
        </div>

        {/* Time */}
        <p style={{
          fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700,
          color: colors.white, lineHeight: 1.1,
        }}>
          {opening.timeLabel}
        </p>

        {/* Provider name */}
        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.375rem' }}>
          {opening.provider.name}
        </p>

        {/* Service pill + location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600,
            color: colors.white, backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
          }}>
            {opening.service.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: colors.violet, display: 'inline-block' }} />
            <span style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>
              {opening.location.name}
            </span>
          </div>
        </div>

        {/* Call-only microcopy */}
        {opening.bookingMode === 'CALL_ONLY' && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.5625rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.375rem', lineHeight: 1.3 }}>
            Online booking closes 1 hr before. Call for availability.
          </p>
        )}

        {/* CTA */}
        <div style={{ marginTop: '0.5rem' }}>
          <CTAButton bookingMode={opening.bookingMode} onClick={() => onBook(opening)} />
        </div>
      </div>

      {/* Right: provider image */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {providerImage ? (
          <img
            src={providerImage}
            alt={opening.provider.name}
            loading="lazy"
            style={{
              width: 72, height: 72, borderRadius: '50%',
              objectFit: 'cover', objectPosition: 'top center',
            }}
          />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: gradients.primary, opacity: 0.4,
          }} />
        )}
      </div>
    </div>
  )
}

// ─── Social Proof "Booked" Card ───
function BookedCard({ opening, animDelay = 0 }) {
  const providerImage = opening.provider.image
  return (
    <div
      className="animate-[tileIn_0.4s_ease-out_both]"
      style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '1rem', padding: '1rem', opacity: 0.5,
        animationDelay: `${animDelay}ms`,
        display: 'flex', gap: '0.625rem',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: 2 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>
            {opening.dayLabel}
          </p>
          <Badge label="Booked" variant="booked" />
        </div>
        <p style={{ fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', lineHeight: 1.1 }}>
          {opening.timeLabel}
        </p>
        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.375rem' }}>
          {opening.provider.name}
        </p>
        <span style={{
          fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600,
          color: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.04)',
          padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
          display: 'inline-block', marginTop: '0.25rem',
        }}>
          {opening.service.name}
        </span>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {providerImage ? (
          <img src={providerImage} alt="" loading="lazy"
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', opacity: 0.4, filter: 'grayscale(0.5)' }}
          />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        )}
      </div>
    </div>
  )
}

// ─── "Just Claimed" Card ───
function ClaimedCard() {
  return (
    <div
      className="animate-[fadeToTaken_0.6s_ease-out_forwards]"
      style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '1rem', padding: '1.25rem', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(26,26,26,0.85)', borderRadius: '1rem', zIndex: 1,
      }}>
        <p style={{
          fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600,
          color: colors.rose, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Just Claimed
        </p>
      </div>
      <div style={{ width: '40%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
      <div style={{ width: '50%', height: 28, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
      <div style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
      <div style={{ width: '40%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
      <div style={{ width: '100%', height: 40, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}

// ─── Next Available Highlight ───
function NextAvailableHighlight({ opening, onBook }) {
  if (!opening || opening.bookingMode === 'CALL_ONLY') return null
  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.violet}12, ${colors.fuchsia}08)`,
      border: `1px solid ${colors.violet}30`,
      borderRadius: '1rem', padding: '1rem 1.25rem', marginBottom: '1.25rem',
    }}>
      <p style={{
        fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: colors.violet, marginBottom: '0.375rem',
      }}>
        Next Available Appointment
      </p>
      <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white, lineHeight: 1.2 }}>
        {opening.dayLabel} at {opening.timeLabel}
        <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>
          {' '}&mdash; {opening.provider.name} &middot; {opening.location.name}
        </span>
      </p>
      <button
        onClick={() => onBook(opening)}
        className="w-full rounded-full mt-3"
        style={{
          fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 700,
          padding: '0.625rem', background: gradients.primary, color: '#fff',
          border: 'none', cursor: 'pointer',
        }}
      >
        Reserve This Time
      </button>
    </div>
  )
}

// ─── Detail Row (booking sheet) ───
function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: `1px solid ${colors.taupe}30` }}>
      <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>
        {value}
      </span>
    </div>
  )
}

// ─── Booking Sheet ───
function BookingSheet({ opening, onClose, onSuccess, trackEvent }) {
  const [step, setStep] = useState('CONFIRM')
  const [cartData, setCartData] = useState(null)
  const [error, setError] = useState(null)

  const locationLabel = opening.location.name
  const dateObj = new Date(opening.startAt)
  const fullDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York' })

  const reserveSpot = async () => {
    setStep('RESERVING')
    setError(null)
    try {
      const res = await fetch('/api/blvd/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationKey: opening.location.id,
          serviceItemId: opening.serviceItemId,
          staffProviderId: opening.provider.id,
          date: opening.startAt.slice(0, 10),
          startTime: opening.startAt,
        }),
      })
      const data = await res.json()

      if (res.status === 409) {
        trackEvent('today_slot_taken', {
          provider: opening.provider.name, location: opening.location.id,
          startAt: opening.startAt,
        })
        setError('That slot was just taken. Please pick another time.')
        setStep('CONFIRM')
        return
      }
      if (!res.ok) throw new Error(data.error || 'Failed to reserve')

      trackEvent('today_booking_start', { cartId: data.cartId })
      setCartData(data)
      setStep('PHONE')
    } catch (e) {
      setError(e.message)
      setStep('CONFIRM')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 480,
        backgroundColor: colors.cream, borderRadius: '1.5rem 1.5rem 0 0',
        padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, color: colors.muted,
          background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1,
        }}>
          &times;
        </button>

        {step === 'CONFIRM' && (
          <>
            <p style={{
              fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: colors.violet, marginBottom: '0.5rem',
            }}>
              Confirm Your Appointment
            </p>
            <h3 style={{
              fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700,
              color: colors.heading, lineHeight: 1.2, marginBottom: '1.25rem',
            }}>
              {opening.service.name}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${colors.taupe}30` }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: gradients.primary, flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>
                  {opening.provider.name}
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>Your provider</p>
              </div>
            </div>

            <DetailRow label="Date" value={fullDate} />
            <DetailRow label="Time" value={opening.timeLabel} />
            <DetailRow label="Location" value={`RELUXE ${locationLabel}`} />
            <DetailRow label="Service" value={opening.service.name} />

            {error && (
              <div style={{
                borderRadius: '0.75rem', padding: '0.75rem', marginTop: '1rem',
                backgroundColor: `${colors.rose}08`, border: `1px solid ${colors.rose}20`,
              }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.rose }}>{error}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={onClose} style={{
                fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600,
                padding: '0.75rem 1.25rem', borderRadius: 9999,
                color: colors.body, backgroundColor: colors.stone, border: 'none', cursor: 'pointer',
              }}>
                Back
              </button>
              <button onClick={reserveSpot} style={{
                flex: 1, fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 700,
                padding: '0.75rem', borderRadius: 9999,
                background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer',
              }}>
                Lock It In
              </button>
            </div>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted, textAlign: 'center', marginTop: '0.75rem' }}>
              Once confirmed, this spot is yours.
            </p>
          </>
        )}

        {step === 'RESERVING' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="inline-block animate-spin rounded-full" style={{
              width: 32, height: 32, border: `3px solid ${colors.taupe}`,
              borderTopColor: colors.violet, marginBottom: '0.75rem',
            }} />
            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>
              Locking your spot...
            </p>
          </div>
        )}

        {step === 'PHONE' && cartData && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              borderRadius: '0.75rem', padding: '0.625rem', marginBottom: '1rem',
              backgroundColor: `${colors.violet}06`, border: `1px solid ${colors.violet}15`,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.heading }}>
                {opening.service.name} &middot; {opening.dayLabel} at {opening.timeLabel} &middot; {locationLabel}
              </span>
            </div>
            <ClientInfoForm
              cartId={cartData.cartId}
              expiresAt={cartData.expiresAt}
              summary={cartData.summary}
              fonts={fonts}
              onSuccess={(data) => onSuccess({ ...data, opening })}
              onExpired={() => { setError('Your reservation expired. Please pick another time.'); setStep('CONFIRM'); setCartData(null) }}
              onBack={() => { setStep('CONFIRM'); setCartData(null) }}
            />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Empty State ───
function EmptyState({ todayEmpty, hasOtherDays }) {
  if (todayEmpty && hasOtherDays) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
          Nothing left today.
        </p>
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)' }}>
          Scroll down for tomorrow's openings.
        </p>
      </div>
    )
  }
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>
        Nothing immediate right now.
      </p>
      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>
        We still have openings this week.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="https://blvd.app/@reluxemedspa?location=westfield" target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
            padding: '0.625rem 1.5rem', borderRadius: 9999,
            background: gradients.primary, color: '#fff', textDecoration: 'none',
          }}>
          View full schedule
        </a>
        <a href={`tel:${PHONE_NUMBER}`}
          style={{
            fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
            padding: '0.625rem 1.5rem', borderRadius: 9999,
            color: colors.violet, border: `1.5px solid ${colors.violet}`,
            textDecoration: 'none', backgroundColor: 'transparent',
          }}>
          Call us
        </a>
      </div>
    </div>
  )
}

// ─── Success Screen ───
function SuccessScreen({ result }) {
  const opening = result?.opening
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '4rem 1.25rem', textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 72, height: 72, borderRadius: '50%', background: `${colors.violet}20`, marginBottom: '1.5rem',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke={colors.violet} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
        You're Booked
      </h2>
      {opening && (
        <div style={{
          marginTop: '1.5rem', borderRadius: '1rem', padding: '1.25rem',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left',
        }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>
            {opening.service.name}
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
            with {opening.provider.name}
          </p>
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)' }}>
                {opening.dayLabel} at {opening.timeLabel}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <circle cx="12" cy="10" r="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              </svg>
              <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>
                RELUXE {opening.location.name}
              </span>
            </div>
          </div>
        </div>
      )}
      <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', marginTop: '1.25rem', lineHeight: 1.6 }}>
        A confirmation is on the way with everything you need, including any forms to fill out before your visit.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{
          fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600,
          padding: '0.75rem 2rem', borderRadius: 9999, background: gradients.primary,
          color: '#fff', textDecoration: 'none', display: 'inline-block',
        }}>
          Explore RELUXE
        </a>
      </div>
    </div>
  )
}

// ─── Filter Chip ───
function FilterChip({ label, selected, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-all duration-150"
      style={{
        fontFamily: fonts.body, fontSize: '0.6875rem',
        fontWeight: selected ? 600 : 400,
        padding: '0.3rem 0.75rem', borderRadius: 9999,
        border: selected ? `1.5px solid ${colors.violet}` : '1px solid rgba(255,255,255,0.12)',
        backgroundColor: selected ? `${colors.violet}15` : 'transparent',
        color: selected ? colors.violet : 'rgba(255,255,255,0.5)',
        cursor: 'pointer', whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      }}
    >
      {label}
      {count != null && (
        <span style={{
          fontSize: '0.5625rem', fontWeight: 700,
          opacity: selected ? 0.8 : 0.5,
        }}>
          {count}
        </span>
      )}
    </button>
  )
}

// ─── Filter Bar ───
function FilterBar({
  showLocationFilter, availableLocations, filterLocation, onLocationChange,
  showProviderFilter, availableProviders, filterProvider, onProviderChange,
}) {
  if (!showLocationFilter && !showProviderFilter) return null

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Location chips */}
        {showLocationFilter && (
          <>
            <FilterChip
              label="All"
              selected={!filterLocation}
              onClick={() => onLocationChange(null)}
            />
            {availableLocations.map(loc => (
              <FilterChip
                key={loc}
                label={loc.charAt(0).toUpperCase() + loc.slice(1)}
                selected={filterLocation === loc}
                onClick={() => onLocationChange(filterLocation === loc ? null : loc)}
              />
            ))}
          </>
        )}

        {/* Divider */}
        {showLocationFilter && showProviderFilter && (
          <span style={{ width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        )}

        {/* Provider chips */}
        {showProviderFilter && availableProviders.map(p => (
          <FilterChip
            key={p.slug}
            label={p.name}
            count={p.count}
            selected={filterProvider === p.slug}
            onClick={() => onProviderChange(filterProvider === p.slug ? null : p.slug)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ───
export default function TodayPage() {
  const router = useRouter()
  const { getSessionId, updateSession, trackEvent, getDuration } = useExperimentSession('today_v2')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [bookingOpening, setBookingOpening] = useState(null)
  const [bookingResult, setBookingResult] = useState(null)
  const [claimedIds, setClaimedIds] = useState(new Set())
  const [inventoryPulse, setInventoryPulse] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Smart filters (client-side, derived from data)
  const [filterLocation, setFilterLocation] = useState(null) // null = all
  const [filterProvider, setFilterProvider] = useState(null)  // null = all

  const prevOpeningIdsRef = useRef(new Set())
  const impressedRef = useRef(new Set())
  const refreshTimerRef = useRef(null)

  // Parse context from URL params for "why this is showing"
  const { locationId, providerId, serviceId, serviceCategoryId } = router.query

  // Fetch availability
  const fetchAvailability = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const params = new URLSearchParams()
      if (locationId) params.set('locationId', locationId)
      if (providerId) params.set('providerId', providerId)
      if (serviceId) params.set('serviceId', serviceId)
      if (serviceCategoryId) params.set('serviceCategoryId', serviceCategoryId)
      params.set('limit', '30')

      const res = await fetch(`/api/availability/today?${params}`)
      if (!res.ok) throw new Error('Failed to load availability')
      const newData = await res.json()

      // Detect disappeared slots for "Just Claimed"
      if (isRefresh && data) {
        const newIds = new Set(newData.openings.map(o => `${o.provider.id}:${o.startAt}`))
        const oldIds = prevOpeningIdsRef.current
        oldIds.forEach(id => {
          if (!newIds.has(id)) setClaimedIds(prev => new Set([...prev, id]))
        })

        // Inventory change pulse
        if (newData.totalOpenings !== data.totalOpenings) {
          setInventoryPulse(true)
          setTimeout(() => setInventoryPulse(false), 2000)
          trackEvent('today_inventory_change', {
            from: data.totalOpenings, to: newData.totalOpenings,
          })
        }

        trackEvent('today_auto_refresh', { totalOpenings: newData.totalOpenings })
      }

      prevOpeningIdsRef.current = new Set(newData.openings.map(o => `${o.provider.id}:${o.startAt}`))
      setData(newData)
    } catch {
      // Silent — skeleton or stale data remains visible
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [locationId, providerId, serviceId, serviceCategoryId, data, trackEvent])

  // Initial fetch — retry once if Boulevard returns empty (cold-start protection)
  const retriedRef = useRef(false)
  useEffect(() => {
    if (!router.isReady) return
    retriedRef.current = false
    fetchAvailability(false)
  }, [router.isReady, locationId, providerId, serviceId, serviceCategoryId])

  useEffect(() => {
    if (loading || retriedRef.current) return
    if (data && data.totalOpenings === 0) {
      retriedRef.current = true
      const timer = setTimeout(() => fetchAvailability(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [loading, data])

  // Auto-refresh timer
  useEffect(() => {
    if (bookingOpening || bookingResult) return // pause during booking
    refreshTimerRef.current = setInterval(() => {
      fetchAvailability(true)
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(refreshTimerRef.current)
  }, [bookingOpening, bookingResult, fetchAvailability])

  // Page view analytics
  useEffect(() => {
    if (!data) return
    trackEvent('today_page_view', {
      windowDays: data.windowDays?.length || 0,
      totalOpenings: data.totalOpenings,
      isAfterTwoPm: data.isAfterTwoPm,
      tracking_token: getTrackingToken(),
    })
    updateSession({
      tracking_token: getTrackingToken(),
      total_openings: data.totalOpenings,
    })
  }, [!!data])

  // Track impressions
  useEffect(() => {
    if (!data?.openings) return
    data.openings.forEach(o => {
      const key = `${o.provider.id}:${o.startAt}`
      if (!impressedRef.current.has(key)) {
        impressedRef.current.add(key)
        trackEvent('today_card_impression', {
          provider: o.provider.name, location: o.location.id,
          service: o.service.id, startAt: o.startAt, bookingMode: o.bookingMode,
        })
      }
    })
  }, [data?.openings])

  // Handle booking
  const handleBook = useCallback((opening) => {
    trackEvent('today_book_click', {
      bookingMode: opening.bookingMode, provider: opening.provider.name,
      location: opening.location.id, startAt: opening.startAt,
    })
    setBookingOpening(opening)
  }, [trackEvent])

  // Handle call click
  const handleCallClick = useCallback(() => {
    trackEvent('today_call_click', {})
  }, [trackEvent])

  // Booking success
  const handleBookingSuccess = useCallback((result) => {
    setBookingResult(result)
    setBookingOpening(null)

    const conf = result.confirmation || {}
    updateSession({
      outcome: 'booked',
      booking_completed: true,
      appointment_id: result.appointmentId,
      booking_service: result.opening?.service?.id,
      booking_location: result.opening?.location?.id,
      booking_provider: result.opening?.provider?.name,
      duration_ms: getDuration(),
      completed_at: new Date().toISOString(),
      contact_phone: result.phone || null,
      client_name: [conf.firstName, conf.lastName].filter(Boolean).join(' ') || null,
      client_email: conf.email || null,
      blvd_client_id: result.clientId || null,
    })

    trackEvent('today_booking_complete', {
      appointmentId: result.appointmentId,
      service: result.opening?.service?.id,
      location: result.opening?.location?.id,
    })

    if (result.opening) {
      fetch('/api/reveal/track-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: result.confirmation?.phone || null,
          appointmentId: result.appointmentId,
          serviceSlug: result.opening.service?.id,
          locationKey: result.opening.location?.id,
          tracking_token: getTrackingToken(),
          sessionId: getSessionId(),
        }),
      }).catch(() => {})
    }
  }, [updateSession, trackEvent, getDuration, getSessionId])

  // Determine social proof card injection positions
  const buildDisplayList = useCallback((openings) => {
    if (!openings || openings.length === 0) return []

    const list = []
    const socialProofPositions = new Set()

    // Inject 1-2 "booked" cards among real cards
    if (openings.length >= 4) {
      // Deterministic positions based on total count
      socialProofPositions.add(2)
      if (openings.length >= 7) socialProofPositions.add(5)
    }

    let realIdx = 0
    for (let i = 0; realIdx < openings.length; i++) {
      if (socialProofPositions.has(i) && realIdx > 0 && realIdx < openings.length) {
        // Build a synthetic "booked" card that never matches a real opening
        const template = openings[realIdx > 0 ? realIdx - 1 : 0]
        const bookedTime = new Date(new Date(template.startAt).getTime() - 30 * 60_000)
        const syntheticLabel = bookedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' })
        list.push({ type: 'booked', data: { ...template, timeLabel: syntheticLabel }, key: `booked-${i}` })
      }
      if (realIdx < openings.length) {
        const o = openings[realIdx]
        const uid = `${o.provider.id}:${o.startAt}`
        if (claimedIds.has(uid)) {
          list.push({ type: 'claimed', data: o, key: `claimed-${uid}` })
        } else {
          list.push({ type: 'available', data: o, key: uid })
        }
        realIdx++
      }
    }

    return list
  }, [claimedIds])

  // Compute last-slot-for-day flags
  const getLastSlotDays = useCallback((openings) => {
    if (!openings) return new Set()
    const countByDay = {}
    openings.forEach(o => {
      countByDay[o.dayLabel] = (countByDay[o.dayLabel] || 0) + 1
    })
    const lastSlotDays = new Set()
    Object.entries(countByDay).forEach(([day, count]) => {
      if (count === 1) lastSlotDays.add(day)
    })
    return lastSlotDays
  }, [])

  // ─── Derive filter options from full data ───
  const allOpenings = data?.openings || []

  // Available locations (only show filter if >1 location present)
  const availableLocations = [...new Set(allOpenings.map(o => o.location.id))]
  const showLocationFilter = availableLocations.length > 1

  // Available providers (with counts, only from current location filter)
  const locationFiltered = filterLocation
    ? allOpenings.filter(o => o.location.id === filterLocation)
    : allOpenings
  const providerMap = new Map()
  locationFiltered.forEach(o => {
    if (!providerMap.has(o.provider.slug)) {
      providerMap.set(o.provider.slug, { name: o.provider.name, slug: o.provider.slug, count: 0 })
    }
    providerMap.get(o.provider.slug).count++
  })
  const availableProviders = [...providerMap.values()].sort((a, b) => b.count - a.count)
  const showProviderFilter = availableProviders.length > 1

  // Apply filters to get visible openings
  const filteredOpenings = allOpenings.filter(o => {
    if (filterLocation && o.location.id !== filterLocation) return false
    if (filterProvider && o.provider.slug !== filterProvider) return false
    return true
  })

  // Copy logic
  const isAfterTwoPm = data?.isAfterTwoPm
  const headerCopy = isAfterTwoPm
    ? "Here's what's open right now."
    : "Need in today?"
  const subCopy = isAfterTwoPm
    ? "A few last-minute appointments just became available across Carmel & Westfield."
    : "Here's what's actually available."
  const liveCopy = isAfterTwoPm
    ? "Availability updates live. Some times fill quickly."
    : "Availability updates live."

  // Success screen
  if (bookingResult) {
    return (
      <>
        <Head>
          <title>Booked | RELUXE</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href={fonts.googleUrl} rel="stylesheet" />
        </Head>
        <div style={{ minHeight: '100vh', backgroundColor: colors.ink, color: colors.white }}>
          <SuccessScreen result={bookingResult} />
        </div>
      </>
    )
  }

  const openings = filteredOpenings
  const displayList = buildDisplayList(openings)
  const lastSlotDays = getLastSlotDays(openings)
  const nextAvailable = openings.find(o => o.bookingMode === 'ONLINE')
  const todayOpenings = openings.filter(o => o.dayLabel === 'Today')
  const hasOtherDays = openings.some(o => o.dayLabel !== 'Today')
  const hasAnyData = allOpenings.length > 0
  const noAvailability = !loading && openings.length === 0
  const isFiltered = !!(filterLocation || filterProvider)

  return (
    <>
      <Head>
        <title>Available Now | RELUXE</title>
        <meta name="description" content="Same-day and next-day appointments at RELUXE Med Spa. Book instantly." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href={fonts.googleUrl} rel="stylesheet" />
        <style>{`
          @keyframes fadeToTaken {
            0% { opacity: 1; transform: scale(1); }
            40% { opacity: 0.7; transform: scale(0.98); }
            100% { opacity: 0.5; transform: scale(1); }
          }
          @keyframes tileIn {
            0% { opacity: 0; transform: translateY(12px) scale(0.97); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes pulseGlow {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', backgroundColor: colors.ink, color: colors.white }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 1.25rem' }}>

          {/* ─── Header ─── */}
          <header style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
            <p style={{
              fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: colors.violet, marginBottom: '0.5rem',
            }}>
              RELUXE
            </p>

            {/* Only show confident copy when we have openings or are still loading */}
            {!noAvailability && (
              <>
                <h1 style={{
                  fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700,
                  color: colors.white, lineHeight: 1.15, marginBottom: '0.5rem',
                }}>
                  {headerCopy}
                </h1>

                <p style={{
                  fontFamily: fonts.body, fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: '0.25rem',
                }}>
                  {subCopy}
                </p>

                {/* Live indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e',
                    display: 'inline-block', animation: 'pulseGlow 2s ease-in-out infinite',
                  }} />
                  <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)' }}>
                    {liveCopy}
                  </span>
                  {refreshing && (
                    <div className="animate-spin" style={{
                      width: 10, height: 10, borderRadius: '50%',
                      border: '1.5px solid rgba(255,255,255,0.1)', borderTopColor: colors.violet,
                      marginLeft: '0.25rem',
                    }} />
                  )}
                </div>

                {/* Inventory count — show filtered count if filtering */}
                {data && (
                  <InventoryLine
                    count={isFiltered ? openings.length : data.totalOpenings}
                    windowDays={data.windowDays?.length || 2}
                    pulse={inventoryPulse}
                  />
                )}

                {/* Why this is showing */}
                {data?.whyThisShowing && (
                  <p style={{
                    fontFamily: fonts.body, fontSize: '0.75rem', fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.25)', marginTop: '0.25rem',
                  }}>
                    {data.whyThisShowing}
                  </p>
                )}
              </>
            )}
          </header>

          {/* ─── Loading ─── */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '3rem' }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ─── No Availability (true empty, not filtered) ─── */}
          {noAvailability && !isFiltered && (
            <EmptyState todayEmpty={todayOpenings.length === 0} hasOtherDays={hasOtherDays} />
          )}

          {/* ─── Filter Bar (shown when we have data, even if current filter yields 0) ─── */}
          {!loading && hasAnyData && (
            <FilterBar
              showLocationFilter={showLocationFilter}
              availableLocations={availableLocations}
              filterLocation={filterLocation}
              onLocationChange={(loc) => {
                setFilterLocation(loc)
                // Clear provider if they're not at the new location
                if (loc && filterProvider) {
                  const stillValid = allOpenings.some(o => o.location.id === loc && o.provider.slug === filterProvider)
                  if (!stillValid) setFilterProvider(null)
                }
                trackEvent('today_filter_location', { location: loc || 'all' })
              }}
              showProviderFilter={showProviderFilter}
              availableProviders={availableProviders}
              filterProvider={filterProvider}
              onProviderChange={(slug) => {
                setFilterProvider(slug)
                trackEvent('today_filter_provider', { provider: slug || 'all' })
              }}
            />
          )}

          {/* ─── No results for current filter ─── */}
          {!loading && hasAnyData && openings.length === 0 && isFiltered && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem' }}>
                No openings match that filter right now.
              </p>
              <button
                onClick={() => { setFilterLocation(null); setFilterProvider(null) }}
                style={{
                  fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600,
                  color: colors.violet, background: 'none', border: 'none', cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* ─── Board ─── */}
          {!loading && openings.length > 0 && (
            <div style={{ paddingBottom: '3rem' }}>
              {/* Next Available Highlight */}
              {nextAvailable && (
                <NextAvailableHighlight opening={nextAvailable} onBook={handleBook} />
              )}

              {/* Cards Grid */}
              <div
                className="transition-opacity duration-500"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  opacity: refreshing ? 0.7 : 1,
                }}
              >
                {displayList.map((item, i) => {
                  if (item.type === 'claimed') {
                    return <ClaimedCard key={item.key} />
                  }
                  if (item.type === 'booked') {
                    return <BookedCard key={item.key} opening={item.data} animDelay={i * 50} />
                  }
                  return (
                    <AvailabilityCard
                      key={item.key}
                      opening={item.data}
                      onBook={handleBook}
                      animDelay={i * 50}
                      isLastSlotForDay={lastSlotDays.has(item.data.dayLabel)}
                    />
                  )
                })}
              </div>

              {/* Fallback CTA */}
              <div style={{
                marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: '1rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>
                  Don't see the right time?
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.75rem' }}>
                  Browse all availability or give us a call.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <a href="https://blvd.app/@reluxemedspa?location=westfield" target="_blank" rel="noopener noreferrer"
                    onClick={() => trackEvent('today_see_more_click', { location: 'westfield' })}
                    style={{
                      fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
                      padding: '0.5rem 1rem', borderRadius: 9999,
                      background: colors.violet, color: '#fff', textDecoration: 'none',
                    }}>
                    View Full Schedule
                  </a>
                  <a href={`tel:${PHONE_NUMBER}`}
                    onClick={handleCallClick}
                    style={{
                      fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
                      padding: '0.5rem 1rem', borderRadius: 9999,
                      color: colors.violet, border: `1.5px solid ${colors.violet}`,
                      textDecoration: 'none', backgroundColor: 'transparent',
                    }}>
                    Call Us
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ─── No-availability analytics ─── */}
          {noAvailability && <NoAvailabilityTracker trackEvent={trackEvent} />}
        </div>

        {/* ─── Booking Sheet ─── */}
        {bookingOpening && (
          <BookingSheet
            opening={bookingOpening}
            onClose={() => setBookingOpening(null)}
            onSuccess={handleBookingSuccess}
            trackEvent={trackEvent}
          />
        )}
      </div>
    </>
  )
}

// Fire no-availability event once
function NoAvailabilityTracker({ trackEvent }) {
  useEffect(() => {
    trackEvent('today_no_availability', {})
  }, [])
  return null
}

TodayPage.getLayout = (page) => <TodayErrorBoundary>{page}</TodayErrorBoundary>
