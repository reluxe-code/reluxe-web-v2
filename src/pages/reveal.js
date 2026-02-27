// src/pages/reveal.js
// RELUXE Reveal Board — curated appointment booking experience.
// SMS/email campaigns link here. 2 quick questions → Board → Tap → Book.
import { useState, useEffect, useCallback, Component } from 'react'
import Head from 'next/head'
import { colors, gradients, fontPairings } from '@/components/preview/tokens'
import { REVEAL_TIERS, TIME_OPTIONS, PRICE_TIERS } from '@/data/revealCategories'
import ClientInfoForm from '@/components/booking/ClientInfoForm'
import useExperimentSession from '@/hooks/useExperimentSession'
import { getTrackingToken } from '@/lib/trackingToken'

const fonts = fontPairings.bold

// Error boundary to catch render crashes and show diagnostic info instead of black screen
class RevealErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('[RevealErrorBoundary]', error, info?.componentStack)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#0f0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#faf8f5', marginBottom: 12 }}>
              Something went wrong
            </h2>
            <p style={{ fontFamily: 'system-ui', fontSize: '0.875rem', color: 'rgba(250,248,245,0.6)', marginBottom: 20 }}>
              We hit an unexpected error. Please try again or book directly.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
              <a href="/reveal" style={{ fontFamily: 'system-ui', fontSize: '0.875rem', fontWeight: 600, padding: '10px 24px', borderRadius: 99, background: '#8b5cf6', color: '#fff', textDecoration: 'none' }}>
                Try Again
              </a>
              <a href="https://blvd.app/@reluxemedspa" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'system-ui', fontSize: '0.875rem', fontWeight: 600, padding: '10px 24px', borderRadius: 99, border: '1.5px solid #8b5cf6', color: '#8b5cf6', textDecoration: 'none', background: 'transparent' }}>
                Book Direct
              </a>
            </div>
            <details style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 12 }}>
              <summary style={{ fontFamily: 'system-ui', fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', cursor: 'pointer' }}>Error details</summary>
              <pre style={{ fontFamily: 'monospace', fontSize: '0.625rem', color: 'rgba(250,248,245,0.5)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: 8 }}>
                {this.state.error?.message || 'Unknown error'}
                {'\n\n'}
                {this.state.error?.stack || ''}
              </pre>
            </details>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const PHASE = {
  FILTERS: 'FILTERS',
  LOADING: 'LOADING',
  BOARD: 'BOARD',
  BOOKING: 'BOOKING',
  ALTERNATIVES: 'ALTERNATIVES',
  SUCCESS: 'SUCCESS',
}

// ─── Small Chip (refinement bar) ───
function MiniChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-all duration-150 shrink-0"
      style={{
        fontFamily: fonts.body,
        fontSize: '0.6875rem',
        fontWeight: selected ? 600 : 400,
        padding: '0.3rem 0.625rem',
        borderRadius: '9999px',
        border: selected ? `1.5px solid ${colors.violet}` : `1px solid rgba(255,255,255,0.15)`,
        backgroundColor: selected ? `${colors.violet}18` : 'transparent',
        color: selected ? colors.violet : 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

// ─── Location Chip (filter screen) ───
function LocationChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-all duration-150"
      style={{
        fontFamily: fonts.body,
        fontSize: '0.875rem',
        fontWeight: selected ? 600 : 400,
        padding: '0.625rem 1.25rem',
        borderRadius: '9999px',
        border: selected ? `2px solid ${colors.violet}` : `1.5px solid rgba(255,255,255,0.15)`,
        backgroundColor: selected ? `${colors.violet}12` : 'transparent',
        color: selected ? colors.violet : colors.white,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

// ─── Tier Card (filter screen) ───
function TierCard({ tier, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left transition-all duration-200"
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '1rem',
        border: selected ? `2px solid ${colors.violet}` : `1.5px solid rgba(255,255,255,0.1)`,
        backgroundColor: selected ? `${colors.violet}10` : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
      }}
    >
      <p style={{
        fontFamily: fonts.body,
        fontSize: '0.9375rem',
        fontWeight: 600,
        color: selected ? colors.violet : colors.white,
        marginBottom: '0.25rem',
      }}>
        {tier.label}
      </p>
      <p style={{
        fontFamily: fonts.body,
        fontSize: '0.75rem',
        color: selected ? `${colors.violet}99` : 'rgba(255,255,255,0.4)',
      }}>
        {tier.subtitle}
      </p>
    </button>
  )
}

// ─── Price Tag ───
function PriceTag({ tier }) {
  const label = '$'.repeat(tier || 2)
  const tierData = PRICE_TIERS.find(t => t.id === tier)
  return (
    <span
      title={tierData?.description || ''}
      style={{
        fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700,
        letterSpacing: '0.04em',
        padding: '0.15rem 0.4rem',
        borderRadius: '0.375rem',
        background: tier >= 4 ? 'linear-gradient(135deg, rgba(168,130,85,0.25), rgba(168,130,85,0.1))'
                  : tier >= 3 ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.05)',
        color: tier >= 4 ? '#c9a96e'
             : tier >= 3 ? 'rgba(255,255,255,0.6)'
             : 'rgba(255,255,255,0.4)',
        border: tier >= 4 ? '1px solid rgba(168,130,85,0.3)' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {label}
    </span>
  )
}

// Scarcity micro-tags — deterministic per tile ID so they stay stable across re-renders
const SCARCITY_TAGS = ['Last slot', '1 available', 'Only opening']
function getScarcityTag(tileId, index) {
  // Show on ~30% of tiles (indices 2, 4, 7 etc.) — never first tile
  if (index < 1) return null
  const hash = tileId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  if (hash % 3 !== 0) return null
  return SCARCITY_TAGS[hash % SCARCITY_TAGS.length]
}

// ─── Tile Card ───
function TileCard({ tile, onTap, index = 0, animDelay = 0 }) {
  const scarcity = getScarcityTag(tile.id, index)
  return (
    <button
      onClick={() => onTap(tile)}
      className="w-full text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-[tileIn_0.4s_ease-out_both]"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem',
        padding: '1.25rem',
        cursor: 'pointer',
        animationDelay: `${animDelay}ms`,
      }}
    >
      <div className="flex items-center justify-between mb-0.5">
        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.violet }}>
          {tile.dayLabel}
        </p>
        <PriceTag tier={tile.priceTier} />
      </div>
      <p style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.white, lineHeight: 1.1 }}>
        {tile.timeLabel}
      </p>
      <div className="flex items-center gap-2 mt-3">
        {tile.providerImage ? (
          <img src={tile.providerImage} alt="" className="rounded-full object-cover" style={{ width: 28, height: 28 }} />
        ) : (
          <div className="rounded-full" style={{ width: 28, height: 28, background: gradients.primary }} />
        )}
        <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)' }}>
          with {tile.providerName}
        </span>
      </div>
      <div className="mt-2.5 mb-2">
        <span style={{
          fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
          color: colors.white, backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
          display: 'inline-block',
        }}>
          {tile.serviceLabel}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.violet, display: 'inline-block' }} />
          <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
            {tile.locationKey}
          </span>
        </div>
        {scarcity && (
          <span style={{
            fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 600,
            color: colors.rose, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {scarcity}
          </span>
        )}
      </div>
      <div
        className="mt-3 text-center rounded-full"
        style={{
          fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600,
          padding: '0.5rem', background: gradients.primary, color: '#fff',
        }}
      >
        Claim This Spot
      </div>
    </button>
  )
}

// ─── Taken Tile (urgency flip with fade-in animation) ───
function TakenTile() {
  return (
    <div
      className="w-full relative overflow-hidden animate-[fadeToTaken_0.6s_ease-out_forwards]"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '1rem',
        padding: '1.25rem',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(26,26,26,0.85)', borderRadius: '1rem', zIndex: 1,
      }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.rose, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Just Claimed
        </p>
      </div>
      <div style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
      <div style={{ width: '40%', height: 24, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
      <div style={{ width: '70%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
      <div style={{ width: '50%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
      <div style={{ width: '100%', height: 32, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}

// ─── Skeleton Tile ───
function SkeletonTile() {
  return (
    <div
      className="animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '1rem',
        padding: '1.25rem',
        height: 200,
      }}
    >
      <div style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
      <div style={{ width: '40%', height: 24, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />
      <div style={{ width: '70%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
      <div style={{ width: '50%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />
      <div style={{ width: '100%', height: 32, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}

// ─── Provider Picker Modal ───
function ProviderPicker({ locationKey, onSelect, onClose }) {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loc = locationKey === 'either' ? 'westfield' : locationKey
    fetch(`/api/blvd/providers/at-location?locationKey=${loc}`)
      .then(r => r.json())
      .then(data => { setProviders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [locationKey])

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 480, maxHeight: '70vh',
        backgroundColor: colors.charcoal, borderRadius: '1.5rem 1.5rem 0 0',
        padding: '1.5rem', overflowY: 'auto',
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white }}>
            Choose Your Provider
          </h3>
          <button onClick={onClose} style={{ color: colors.muted, background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            &times;
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            fontFamily: fonts.body, fontSize: '0.875rem', width: '100%',
            padding: '0.625rem 1rem', borderRadius: '0.75rem',
            border: `1.5px solid ${colors.taupe}40`, backgroundColor: 'rgba(255,255,255,0.06)',
            color: colors.white, outline: 'none', marginBottom: '1rem',
          }}
        />
        {loading && <p style={{ fontFamily: fonts.body, color: colors.muted, fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Loading...</p>}
        {!loading && filtered.map(p => (
          <button
            key={p.slug}
            onClick={() => onSelect(p)}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {p.image ? (
              <img src={p.image} alt="" className="rounded-full object-cover" style={{ width: 40, height: 40 }} />
            ) : (
              <div className="rounded-full" style={{ width: 40, height: 40, background: gradients.primary }} />
            )}
            <div>
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{p.name}</p>
              {p.title && <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>{p.title}</p>}
            </div>
          </button>
        ))}
        {!loading && filtered.length === 0 && (
          <p style={{ fontFamily: fonts.body, color: colors.muted, fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
            No providers found.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Detail Row ───
function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${colors.taupe}30` }}>
      <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>
        {value}
      </span>
    </div>
  )
}

// ─── Booking Sheet (2-step: Confirm → Phone) ───
function BookingSheet({ tile, onClose, onSuccess, onSlotTaken, trackEvent }) {
  const [step, setStep] = useState('CONFIRM') // CONFIRM → RESERVING → PHONE
  const [cartData, setCartData] = useState(null)
  const [error, setError] = useState(null)

  const locationLabel = (tile.locationKey || '').charAt(0).toUpperCase() + (tile.locationKey || '').slice(1)
  const dateObj = new Date(tile.date + 'T12:00:00')
  const fullDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const reserveSpot = async () => {
    setStep('RESERVING')
    setError(null)
    try {
      const res = await fetch('/api/blvd/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationKey: tile.locationKey,
          serviceItemId: tile.serviceItemId,
          staffProviderId: tile.boulevardProviderId,
          date: tile.date,
          startTime: tile.startTime,
        }),
      })
      const data = await res.json()

      if (res.status === 409) {
        trackEvent('reveal_slot_taken', {
          service: tile.serviceSlug, provider: tile.providerSlug,
          date: tile.date, time: tile.startTime,
        })
        onSlotTaken(tile)
        return
      }
      if (!res.ok) throw new Error(data.error || 'Failed to reserve')

      trackEvent('reveal_booking_start', { cartId: data.cartId, service: tile.serviceSlug })
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
        padding: '1.5rem',
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, color: colors.muted,
          background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1,
        }}>
          &times;
        </button>

        {/* ─── Step 1: CONFIRM details ─── */}
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
              {tile.serviceLabel}
            </h3>

            {/* Provider */}
            <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: `1px solid ${colors.taupe}30` }}>
              {tile.providerImage ? (
                <img src={tile.providerImage} alt="" className="rounded-full object-cover" style={{ width: 44, height: 44 }} />
              ) : (
                <div className="rounded-full" style={{ width: 44, height: 44, background: gradients.primary }} />
              )}
              <div>
                <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>
                  {tile.providerName}
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>
                  Your provider
                </p>
              </div>
            </div>

            {/* Details grid */}
            <DetailRow label="Date" value={fullDate} />
            <DetailRow label="Time" value={tile.timeLabel} />
            <DetailRow label="Location" value={`RELUXE ${locationLabel}`} />
            <DetailRow label="Service" value={tile.serviceLabel} />

            {error && (
              <div className="rounded-lg p-3 mt-4" style={{ backgroundColor: `${colors.rose}08`, border: `1px solid ${colors.rose}20` }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.rose }}>{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="rounded-full"
                style={{
                  fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600,
                  padding: '0.75rem 1.25rem', color: colors.body,
                  backgroundColor: colors.stone, border: 'none', cursor: 'pointer',
                }}>
                Back
              </button>
              <button onClick={reserveSpot} className="flex-1 rounded-full"
                style={{
                  fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 700,
                  padding: '0.75rem', background: gradients.primary,
                  color: '#fff', border: 'none', cursor: 'pointer',
                }}>
                Lock It In
              </button>
            </div>
            <p style={{
              fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted,
              textAlign: 'center', marginTop: '0.75rem',
            }}>
              Once confirmed, this spot is yours.
            </p>
            <p style={{
              fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(255,255,255,0.25)',
              textAlign: 'center', marginTop: '0.375rem',
            }}>
              Standard service pricing applies.
            </p>
          </>
        )}

        {/* ─── Reserving spinner ─── */}
        {step === 'RESERVING' && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full mb-3" style={{
              width: 32, height: 32, border: `3px solid ${colors.taupe}`,
              borderTopColor: colors.violet,
            }} />
            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>
              Locking your spot...
            </p>
          </div>
        )}

        {/* ─── Step 2: Phone / OTP via ClientInfoForm ─── */}
        {step === 'PHONE' && cartData && (
          <>
            {/* Compact confirmed summary */}
            <div className="flex items-center gap-2 rounded-lg p-2.5 mb-4"
              style={{ backgroundColor: `${colors.violet}06`, border: `1px solid ${colors.violet}15` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.heading }}>
                {tile.serviceLabel} &middot; {tile.dayLabel} at {tile.timeLabel} &middot; {locationLabel}
              </span>
            </div>

            <ClientInfoForm
              cartId={cartData.cartId}
              expiresAt={cartData.expiresAt}
              summary={cartData.summary}
              fonts={fonts}
              onSuccess={(data) => onSuccess({ ...data, tile })}
              onExpired={() => { setError('Your reservation expired. Please pick another time.'); setStep('CONFIRM'); setCartData(null) }}
              onBack={() => { setStep('CONFIRM'); setCartData(null) }}
            />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Refinement Bar (on board) ───
function RefinementBar({ location, onLocationChange, provider, onProviderTap, timeOfDay, onTimeChange, priceFilter, onPriceChange, refetching }) {
  return (
    <div
      className="flex items-center gap-3 overflow-x-auto pb-1 mb-5 -mx-1.5 px-1.5"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {/* Location group */}
      <div className="flex items-center gap-1 shrink-0">
        {['westfield', 'carmel', 'either'].map(loc => (
          <MiniChip
            key={loc}
            label={loc === 'either' ? 'No Preference' : loc.charAt(0).toUpperCase() + loc.slice(1)}
            selected={location === loc}
            onClick={() => onLocationChange(loc)}
          />
        ))}
      </div>

      <span style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Price tier */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span style={{ fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          Investment
        </span>
        {PRICE_TIERS.map(tier => (
          <MiniChip
            key={tier.id}
            label={tier.label}
            selected={priceFilter === tier.id}
            onClick={() => onPriceChange(priceFilter === tier.id ? null : tier.id)}
          />
        ))}
      </div>

      <span style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Provider */}
      <button
        onClick={onProviderTap}
        className="shrink-0 transition-all duration-150"
        style={{
          fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: provider ? 600 : 400,
          padding: '0.3rem 0.625rem', borderRadius: '9999px',
          border: provider ? `1.5px solid ${colors.violet}` : `1px solid rgba(255,255,255,0.15)`,
          backgroundColor: provider ? `${colors.violet}18` : 'transparent',
          color: provider ? colors.violet : 'rgba(255,255,255,0.5)',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {provider ? provider.name : 'Any provider'}
      </button>

      <span style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Time of day */}
      <div className="flex items-center gap-1 shrink-0">
        {TIME_OPTIONS.map(opt => (
          <MiniChip
            key={opt.id}
            label={opt.label}
            selected={timeOfDay === opt.id}
            onClick={() => onTimeChange(timeOfDay === opt.id ? null : opt.id)}
          />
        ))}
      </div>

      {refetching && (
        <div className="shrink-0 animate-spin rounded-full" style={{
          width: 14, height: 14, border: `1.5px solid rgba(255,255,255,0.1)`,
          borderTopColor: colors.violet,
        }} />
      )}
    </div>
  )
}

// ─── Main Page ───
export default function RevealBoard() {
  const { getSessionId, updateSession, trackEvent, getDuration } = useExperimentSession('reveal_v1')

  const [phase, setPhase] = useState(PHASE.FILTERS)

  // Filter state (entry screen)
  const [location, setLocation] = useState(null)
  const [selectedTiers, setSelectedTiers] = useState([])

  // Board refinement state
  const [boardLocation, setBoardLocation] = useState(null)
  const [boardProvider, setBoardProvider] = useState(null)
  const [boardTimeOfDay, setBoardTimeOfDay] = useState(null)
  const [showProviderPicker, setShowProviderPicker] = useState(false)
  const [boardPriceFilter, setBoardPriceFilter] = useState(null) // client-side filter
  const [refetching, setRefetching] = useState(false)

  // Board data
  const [tiles, setTiles] = useState([])
  const [moreTiles, setMoreTiles] = useState([])
  const [showMore, setShowMore] = useState(false)
  const [boardError, setBoardError] = useState(null)

  // The service slugs derived from selected tiers
  const [activeSlugs, setActiveSlugs] = useState([])

  // Urgency: tiles that "flip" to taken state
  const [takenTileIds, setTakenTileIds] = useState(new Set())

  // Booking
  const [bookingTile, setBookingTile] = useState(null)
  const [alternatives, setAlternatives] = useState(null)
  const [bookingResult, setBookingResult] = useState(null)

  // Safe sessionStorage wrapper (iOS private mode throws SecurityError)
  const ssGet = (k) => { try { return sessionStorage.getItem(k) } catch { return null } }
  const ssSet = (k, v) => { try { sessionStorage.setItem(k, v) } catch {} }

  // Parse URL params on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('ph')) ssSet('reveal_ph', params.get('ph'))

      trackEvent('reveal_page_view', {
        tracking_token: getTrackingToken() || null,
        ph: params.get('ph') || null,
        utm_source: params.get('utm_source'),
        utm_campaign: params.get('utm_campaign'),
      })
    } catch (e) {
      trackEvent('reveal_page_view', {})
    }
  }, [])

  const canSubmitFilters = location && selectedTiers.length > 0

  // Resolve tier selections to service slugs
  const resolveSlugs = (tiers) => {
    const slugs = new Set()
    tiers.forEach(tierId => {
      const tier = REVEAL_TIERS.find(t => t.id === tierId)
      if (tier) tier.slugs.forEach(s => slugs.add(s))
    })
    return [...slugs]
  }

  // ─── Fetch Board ───
  const fetchBoard = useCallback(async (opts = {}) => {
    const loc = opts.location || boardLocation || location
    const provider = opts.provider !== undefined ? opts.provider : boardProvider
    const time = opts.timeOfDay !== undefined ? opts.timeOfDay : boardTimeOfDay
    const slugs = opts.slugs || activeSlugs

    const isRefine = phase === PHASE.BOARD
    if (isRefine) {
      setRefetching(true)
    } else {
      setPhase(PHASE.LOADING)
    }
    setBoardError(null)
    setShowMore(false)
    const startMs = Date.now()

    trackEvent('reveal_filter_submit', {
      locations: loc === 'either' ? ['westfield', 'carmel'] : [loc],
      services: slugs,
      timeOfDay: time || 'any',
      provider: provider?.slug || 'any',
    })

    updateSession({
      choices: {
        filter_locations: loc,
        filter_services: slugs,
        filter_time_of_day: time,
        filter_provider: provider?.slug || null,
      },
      tracking_token: getTrackingToken() || null,
    })

    try {
      const res = await fetch('/api/reveal/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: loc === 'either' ? ['westfield', 'carmel'] : [loc],
          providerSlug: provider?.slug || null,
          serviceSlugs: slugs,
          when: null,
          timeOfDay: time || null,
          limit: 16,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')

      setTiles(data.tiles || [])
      setMoreTiles(data.moreTiles || [])
      setTakenTileIds(new Set())

      trackEvent('reveal_board_loaded', {
        tileCount: (data.tiles?.length || 0) + (data.moreTiles?.length || 0),
        loadTimeMs: Date.now() - startMs,
      })

      updateSession({ board_tile_count: (data.tiles?.length || 0) + (data.moreTiles?.length || 0) })
      setPhase(PHASE.BOARD)
    } catch (e) {
      setBoardError(e.message)
      if (!isRefine) setPhase(PHASE.FILTERS)
    } finally {
      setRefetching(false)
    }
  }, [phase, boardLocation, boardProvider, boardTimeOfDay, activeSlugs, location])

  // ─── Urgency: first flip at 8-10s, second at a random later time ───
  useEffect(() => {
    if (phase !== PHASE.BOARD || tiles.length < 5) return
    const timers = []
    const candidates = tiles.slice(2).map((_, i) => i + 2)
    const shuffled = candidates.sort(() => Math.random() - 0.5)
    const picks = shuffled.slice(0, 2)

    // First flip: 8-10 seconds (immediate urgency)
    const firstDelay = 8000 + Math.random() * 2000
    timers.push(setTimeout(() => {
      const tile = tiles[picks[0]]
      if (tile && phase === PHASE.BOARD) {
        setTakenTileIds(prev => new Set([...prev, tile.id]))
      }
    }, firstDelay))

    // Second flip: 35-60 seconds later
    if (picks[1] !== undefined) {
      const secondDelay = 35000 + Math.random() * 25000
      timers.push(setTimeout(() => {
        const tile = tiles[picks[1]]
        if (tile && phase === PHASE.BOARD) {
          setTakenTileIds(prev => new Set([...prev, tile.id]))
        }
      }, secondDelay))
    }

    return () => timers.forEach(clearTimeout)
  }, [phase, tiles.length])

  // ─── Initial submit from filters ───
  const handleFilterSubmit = () => {
    const slugs = resolveSlugs(selectedTiers)
    setActiveSlugs(slugs)
    setBoardLocation(location)
    setBoardProvider(null)
    setBoardTimeOfDay(null)
    setBoardPriceFilter(null)
    fetchBoard({ location, slugs, provider: null, timeOfDay: null })
  }

  // ─── Board refinement handlers ───
  const handleLocationRefine = (loc) => {
    setBoardLocation(loc)
    fetchBoard({ location: loc })
  }

  const handleProviderRefine = (p) => {
    setBoardProvider(p)
    setShowProviderPicker(false)
    fetchBoard({ provider: p })
  }

  const handleTimeRefine = (time) => {
    setBoardTimeOfDay(time)
    fetchBoard({ timeOfDay: time })
  }

  // ─── Tile Tap ───
  const handleTileTap = (tile) => {
    const allTiles = showMore ? [...tiles, ...moreTiles] : tiles
    const position = allTiles.findIndex(t => t.id === tile.id)
    trackEvent('reveal_tile_tap', {
      service: tile.serviceSlug, provider: tile.providerSlug,
      location: tile.locationKey, date: tile.date, time: tile.startTime, position,
    })
    setBookingTile(tile)
    setPhase(PHASE.BOOKING)
  }

  // ─── Slot Taken → Fetch Alternatives ───
  const handleSlotTaken = async (tile) => {
    setPhase(PHASE.ALTERNATIVES)
    try {
      const res = await fetch('/api/reveal/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationKey: tile.locationKey,
          serviceSlug: tile.serviceSlug,
          serviceLabel: tile.serviceLabel,
          serviceItemId: tile.serviceItemId,
          boulevardProviderId: tile.boulevardProviderId,
          providerSlug: tile.providerSlug,
          providerName: tile.providerName,
          providerImage: tile.providerImage,
          date: tile.date,
          excludeStartTime: tile.startTime,
        }),
      })
      const data = await res.json()
      setAlternatives(data.alternatives || [])
    } catch {
      setAlternatives([])
    }
  }

  // ─── Booking Success ───
  const handleBookingSuccess = (data) => {
    setBookingResult(data)
    setPhase(PHASE.SUCCESS)

    const conf = data.confirmation || {}
    updateSession({
      outcome: 'booked',
      booking_completed: true,
      appointment_id: data.appointmentId,
      booking_service: data.tile?.serviceSlug,
      booking_location: data.tile?.locationKey,
      booking_provider: data.tile?.providerSlug,
      duration_ms: getDuration(),
      completed_at: new Date().toISOString(),
      contact_phone: data.phone || null,
      client_name: [conf.firstName, conf.lastName].filter(Boolean).join(' ') || null,
      client_email: conf.email || null,
      blvd_client_id: data.clientId || null,
    })

    trackEvent('reveal_booking_complete', {
      appointmentId: data.appointmentId,
      service: data.tile?.serviceSlug,
      location: data.tile?.locationKey,
    })

    if (typeof window !== 'undefined' && window.reluxeTrack) {
      window.reluxeTrack('booking_complete', {
        source: 'reveal_board',
        service: data.tile?.serviceSlug,
        location: data.tile?.locationKey,
      })
    }

    if (data.tile) {
      fetch('/api/reveal/track-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.confirmation?.phone || null,
          appointmentId: data.appointmentId,
          serviceSlug: data.tile.serviceSlug,
          locationKey: data.tile.locationKey,
          tracking_token: getTrackingToken(),
          sessionId: getSessionId(),
        }),
      }).catch(() => {})
    }
  }

  // ─── Tier toggle ───
  const toggleTier = (id) => {
    setSelectedTiers(prev => {
      if (prev.includes(id)) return prev.filter(t => t !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  return (
    <>
      <Head>
        <title>This Week's Spots Just Dropped | RELUXE</title>
        <meta name="description" content="Curated appointments at RELUXE Med Spa. Pick your spot and book instantly." />
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
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', backgroundColor: colors.ink, color: colors.white }}>
        {/* ─── FILTERS (2 questions) ─── */}
        {phase === PHASE.FILTERS && (<>
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '3rem 1.25rem 3rem' }}>
            <div className="text-center mb-10">
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.violet, marginBottom: '0.5rem' }}>
                RELUXE
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: colors.white, lineHeight: 1.1, marginBottom: '0.75rem' }}>
                This Week's Best Spots Just Dropped.
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', maxWidth: 360, margin: '0 auto' }}>
                Answer two quick picks. We'll unlock the best openings before someone else grabs them.
              </p>
              <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', maxWidth: 360, margin: '0.75rem auto 0' }}>
                A new way to book. These are real appointment openings — just curated and limited.
              </p>
            </div>

            {boardError && (
              <div className="rounded-xl p-3 mb-6" style={{ backgroundColor: `${colors.rose}15`, border: `1px solid ${colors.rose}30` }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.rose }}>{boardError}</p>
              </div>
            )}

            {/* 1. Location */}
            <div className="mb-8">
              <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>
                Where?
              </p>
              <div className="flex flex-wrap gap-2">
                {['westfield', 'carmel', 'either'].map(loc => (
                  <LocationChip
                    key={loc}
                    label={loc === 'either' ? 'No Preference' : loc.charAt(0).toUpperCase() + loc.slice(1)}
                    selected={location === loc}
                    onClick={() => setLocation(loc)}
                  />
                ))}
              </div>
            </div>

            {/* 2. Tiers */}
            <div className="mb-28">
              <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>
                What are you looking for?
              </p>
              <div className="grid grid-cols-1 gap-3">
                {REVEAL_TIERS.map(tier => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    selected={selectedTiers.includes(tier.id)}
                    onClick={() => toggleTier(tier.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sticky CTA */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            padding: '1rem 1.25rem 1.5rem',
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0.5rem))',
            background: 'linear-gradient(to top, rgba(26,26,26,0.98) 60%, rgba(26,26,26,0))',
            backdropFilter: 'blur(12px)',
          }}>
            <button
              onClick={handleFilterSubmit}
              disabled={!canSubmitFilters}
              className="w-full rounded-full transition-all duration-200"
              style={{
                maxWidth: 520, margin: '0 auto', display: 'block',
                fontFamily: fonts.body, fontSize: '1rem', fontWeight: 700,
                padding: '1rem',
                background: canSubmitFilters ? gradients.primary : 'rgba(255,255,255,0.08)',
                color: canSubmitFilters ? '#fff' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: canSubmitFilters ? 'pointer' : 'not-allowed',
              }}
            >
              Show Me My Spots
            </button>
          </div>
        </>)}

        {/* ─── LOADING ─── */}
        {phase === PHASE.LOADING && (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.25rem' }}>
            <div className="text-center mb-6">
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
                Finding your perfect openings...
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonTile key={i} />)}
            </div>
          </div>
        )}

        {/* ─── BOARD ─── */}
        {phase === PHASE.BOARD && (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.white }}>
                  Your Board
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                  These are the only openings we're releasing today.
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.25rem' }}>
                  Not all availability is shown here.{' '}
                  <a href="/start" style={{ color: colors.violet, textDecoration: 'underline' }}>Book Westfield</a>
                  {' / '}
                  <a href="/start" style={{ color: colors.violet, textDecoration: 'underline' }}>Book Carmel</a>
                  {' '}the usual way.
                </p>
              </div>
              <button
                onClick={() => { setPhase(PHASE.FILTERS); setShowMore(false) }}
                style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Start over
              </button>
            </div>

            {/* Inline refinement bar */}
            <RefinementBar
              location={boardLocation}
              onLocationChange={handleLocationRefine}
              provider={boardProvider}
              onProviderTap={() => setShowProviderPicker(true)}
              timeOfDay={boardTimeOfDay}
              onTimeChange={handleTimeRefine}
              priceFilter={boardPriceFilter}
              onPriceChange={setBoardPriceFilter}
              refetching={refetching}
            />

            {(() => {
              const pf = boardPriceFilter
              const filteredTiles = pf ? tiles.filter(t => t.priceTier === pf) : tiles
              const filteredMore = pf ? moreTiles.filter(t => t.priceTier === pf) : moreTiles
              return filteredTiles.length === 0 && !refetching ? (
              <div className="text-center py-12">
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
                  {pf ? 'No openings at that price range. Try a different filter.' : 'No openings match right now. Try adjusting your filters above.'}
                </p>
              </div>
            ) : (
              <>
                <div
                  className="grid grid-cols-2 md:grid-cols-3 gap-3 transition-opacity duration-300"
                  style={{ opacity: refetching ? 0.5 : 1 }}
                >
                  {filteredTiles.map((tile, i) => (
                    takenTileIds.has(tile.id)
                      ? <TakenTile key={tile.id} />
                      : <TileCard key={tile.id} tile={tile} onTap={handleTileTap} index={i} animDelay={i * 60} />
                  ))}
                  {showMore && filteredMore.map((tile, i) => (
                    takenTileIds.has(tile.id)
                      ? <TakenTile key={tile.id} />
                      : <TileCard key={tile.id} tile={tile} onTap={handleTileTap} index={filteredTiles.length + i} animDelay={(filteredTiles.length + i) * 60} />
                  ))}
                </div>

                {filteredMore.length > 0 && !showMore && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => {
                        setShowMore(true)
                        trackEvent('reveal_show_more', { tilesShown: filteredTiles.length + filteredMore.length })
                      }}
                      className="rounded-full transition-colors"
                      style={{
                        fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                        padding: '0.625rem 1.5rem', color: colors.violet,
                        backgroundColor: `${colors.violet}12`, border: `1.5px solid ${colors.violet}40`,
                        cursor: 'pointer',
                      }}
                    >
                      Show {filteredMore.length} more
                    </button>
                  </div>
                )}

                {/* Full booking fallback — shown after More Options expanded */}
                {showMore && (
                  <div style={{
                    marginTop: '2rem', padding: '1.25rem', borderRadius: '1rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>
                      Not finding the time you want?
                    </p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
                      Browse all availability in our full booking experience
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                      <a
                        href="https://blvd.app/@reluxemedspa?location=westfield"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600,
                          padding: '0.5rem 1.25rem', borderRadius: '9999px',
                          color: colors.white, background: colors.violet,
                          textDecoration: 'none', cursor: 'pointer',
                        }}
                      >
                        Book Westfield
                      </a>
                      <a
                        href="https://blvd.app/@reluxemedspa?location=carmel"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600,
                          padding: '0.5rem 1.25rem', borderRadius: '9999px',
                          color: colors.violet, background: 'transparent',
                          border: `1.5px solid ${colors.violet}`,
                          textDecoration: 'none', cursor: 'pointer',
                        }}
                      >
                        Book Carmel
                      </a>
                    </div>
                  </div>
                )}
              </>
            )
            })()}

            {/* Micro-FAQ */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { q: 'What is this?', a: 'A curated list of real appointment openings this week.' },
                { q: 'Is there a catch?', a: 'No. These are normal appointments — just limited and easier to claim.' },
                { q: 'Why only a few?', a: 'We highlight a small number at a time to make booking faster.' },
              ].map(({ q, a }) => (
                <div key={q} style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>{q}</p>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.125rem' }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ALTERNATIVES (slot taken) ─── */}
        {phase === PHASE.ALTERNATIVES && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div onClick={() => setPhase(PHASE.BOARD)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
            <div style={{
              position: 'relative', width: '100%', maxWidth: 480,
              backgroundColor: colors.charcoal, borderRadius: '1.5rem 1.5rem 0 0',
              padding: '1.5rem',
            }}>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white, marginBottom: '0.5rem' }}>
                That one just got grabbed!
              </h3>
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem' }}>
                Here are some similar openings:
              </p>

              {!alternatives && (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full" style={{
                    width: 24, height: 24, border: `2px solid ${colors.taupe}`,
                    borderTopColor: colors.violet,
                  }} />
                </div>
              )}

              {alternatives && alternatives.length === 0 && (
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '1rem 0' }}>
                  No alternatives available right now. Try picking a different tile.
                </p>
              )}

              {alternatives && alternatives.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                  {alternatives.map((alt, i) => (
                    <TileCard key={alt.id} tile={alt} index={i} animDelay={i * 60} onTap={(t) => {
                      trackEvent('reveal_alternative_tap', { alternativeIndex: i })
                      handleTileTap(t)
                    }} />
                  ))}
                </div>
              )}

              <button
                onClick={() => { setPhase(PHASE.BOARD); setAlternatives(null) }}
                className="w-full mt-4 rounded-full"
                style={{
                  fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500,
                  padding: '0.75rem', color: 'rgba(255,255,255,0.5)',
                  backgroundColor: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
                }}
              >
                Back to board
              </button>
            </div>
          </div>
        )}

        {/* ─── BOOKING SHEET ─── */}
        {phase === PHASE.BOOKING && bookingTile && (
          <BookingSheet
            tile={bookingTile}
            onClose={() => { setBookingTile(null); setPhase(PHASE.BOARD) }}
            onSuccess={handleBookingSuccess}
            onSlotTaken={handleSlotTaken}
            trackEvent={trackEvent}
          />
        )}

        {/* ─── SUCCESS ─── */}
        {phase === PHASE.SUCCESS && bookingResult && (
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '4rem 1.25rem', textAlign: 'center' }}>
            <div className="inline-flex items-center justify-center rounded-full mb-6" style={{ width: 72, height: 72, background: `${colors.violet}20` }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke={colors.violet} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
              You're Booked!
            </h2>
            {bookingResult.tile && (
              <div className="mt-6 rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>
                  {bookingResult.tile.serviceLabel}
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                  with {bookingResult.tile.providerName}
                </p>
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.375rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)' }}>
                      {bookingResult.tile.dayLabel} at {bookingResult.tile.timeLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                      <circle cx="12" cy="10" r="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    </svg>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>
                      RELUXE {bookingResult.tile.locationKey}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', marginTop: '1.25rem', lineHeight: 1.6 }}>
              A confirmation is on the way with everything you need, including any forms to fill out before your visit.
            </p>

            <div className="mt-8">
              <a href="/" className="inline-block rounded-full transition-opacity hover:opacity-90"
                style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: gradients.primary, color: '#fff', textDecoration: 'none' }}>
                Explore RELUXE
              </a>
            </div>
          </div>
        )}

        {/* ─── Provider Picker Modal ─── */}
        {showProviderPicker && (
          <ProviderPicker
            locationKey={boardLocation || location || 'westfield'}
            onSelect={handleProviderRefine}
            onClose={() => setShowProviderPicker(false)}
          />
        )}
      </div>
    </>
  )
}

RevealBoard.getLayout = (page) => <RevealErrorBoundary>{page}</RevealErrorBoundary>
