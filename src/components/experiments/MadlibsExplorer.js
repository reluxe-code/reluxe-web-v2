// src/components/experiments/MadlibsExplorer.js
// Mad-libs style appointment builder: "I want [X] with [Y] on [Z]"
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, gradients } from '@/components/preview/tokens'
import { SERVICE_BOOKING_MAP } from '@/data/serviceBookingMap'
import { useMember } from '@/context/MemberContext'
import { fetchAvailableDates, fetchAvailableTimes } from '@/lib/bookingApi'
import { formatTime, formatDate } from '@/lib/bookingFormatters'

/* ─── treatment options ─── */
const TREATMENTS = [
  { slug: 'tox', label: 'a Botox treatment' },
  { slug: 'filler', label: 'Filler' },
  { slug: 'morpheus8', label: 'a Morpheus8 session' },
  { slug: 'facials', label: 'a Facial' },
  { slug: 'laser-hair-removal', label: 'Laser Hair Removal' },
  { slug: 'peels', label: 'a Peel' },
  { slug: 'massage', label: 'a Massage' },
]

/* ─── day options (computed dynamically) ─── */
function buildDayOptions() {
  const now = new Date()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const options = []

  // Today (if before 5pm)
  if (now.getHours() < 17) {
    options.push({ key: 'today', label: 'Today', start: fmtDate(now), end: fmtDate(now) })
  }

  // Tomorrow
  const tmrw = addDays(now, 1)
  options.push({ key: 'tomorrow', label: 'Tomorrow', start: fmtDate(tmrw), end: fmtDate(tmrw) })

  // Rest of this week (up to Saturday)
  const todayDay = now.getDay() // 0=Sun
  for (let d = todayDay + 2; d <= 6; d++) {
    const date = addDays(now, d - todayDay)
    options.push({ key: dayNames[d].toLowerCase(), label: dayNames[d], start: fmtDate(date), end: fmtDate(date) })
  }

  // Next week
  const nextMon = addDays(now, 7 - todayDay + 1)
  const nextSat = addDays(nextMon, 5)
  options.push({ key: 'next-week', label: 'Next Week', start: fmtDate(nextMon), end: fmtDate(nextSat) })

  // Anytime (next 30 days)
  const month = addDays(now, 30)
  options.push({ key: 'anytime', label: 'Anytime', start: fmtDate(now), end: fmtDate(month) })

  return options
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}
function fmtDate(d) {
  return d.toISOString().split('T')[0]
}

/* ─── grain texture ─── */
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

/* ─── custom pill dropdown ─── */
function PillSelect({ value, options, onChange, placeholder, fonts, color = colors.violet }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  // Keyboard support
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open) }
    if (e.key === 'ArrowDown' && open) {
      e.preventDefault()
      const idx = options.findIndex(o => o.key === value || o.slug === value)
      const next = options[(idx + 1) % options.length]
      onChange(next.key || next.slug)
    }
    if (e.key === 'ArrowUp' && open) {
      e.preventDefault()
      const idx = options.findIndex(o => o.key === value || o.slug === value)
      const prev = options[(idx - 1 + options.length) % options.length]
      onChange(prev.key || prev.slug)
    }
  }

  const selected = options.find(o => (o.key || o.slug) === value)
  const displayLabel = selected?.label || placeholder
  const hasValue = !!selected

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        style={{
          fontFamily: fonts.display,
          fontSize: 'inherit',
          fontWeight: 600,
          color: hasValue ? color : 'rgba(250,248,245,0.35)',
          background: hasValue ? `${color}12` : 'rgba(250,248,245,0.04)',
          border: `1.5px solid ${hasValue ? `${color}40` : 'rgba(250,248,245,0.1)'}`,
          borderRadius: 12,
          padding: '0.35em 1em',
          cursor: 'pointer',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
          outline: 'none',
          lineHeight: 1.3,
        }}
      >
        {displayLabel}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 6, verticalAlign: 'middle', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : '' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 50,
              minWidth: 200,
              maxHeight: 280,
              overflowY: 'auto',
              background: 'rgba(30,30,30,0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(250,248,245,0.1)',
              borderRadius: 14,
              padding: '6px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            {options.map((opt) => {
              const optKey = opt.key || opt.slug
              const isActive = optKey === value
              return (
                <button
                  key={optKey}
                  onClick={() => { onChange(optKey); setOpen(false) }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: fonts.body,
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? color : 'rgba(250,248,245,0.7)',
                    background: isActive ? `${color}15` : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.target.style.background = 'rgba(250,248,245,0.06)' }}
                  onMouseLeave={(e) => { if (!isActive) e.target.style.background = 'transparent' }}
                >
                  {opt.label}
                  {opt.sub && <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)', marginTop: 2 }}>{opt.sub}</span>}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

/* ─── results slot card ─── */
function SlotCard({ slot, fonts, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, borderColor: `${colors.violet}60` }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        background: 'rgba(250,248,245,0.03)',
        border: '1px solid rgba(250,248,245,0.08)',
        borderRadius: 14,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Time */}
      <div style={{ minWidth: 72 }}>
        <p style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.white }}>
          {formatTime(slot.startTime)}
        </p>
      </div>

      {/* Location badge */}
      <span style={{
        fontFamily: fonts.body,
        fontSize: '0.625rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: slot.locationKey === 'westfield' ? colors.violet : colors.fuchsia,
        background: slot.locationKey === 'westfield' ? `${colors.violet}15` : `${colors.fuchsia}15`,
        padding: '3px 8px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
      }}>
        {slot.locationLabel || slot.locationKey}
      </span>

      {/* Arrow */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.4 }}>
        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  )
}

/* ─── main component ─── */
export default function MadlibsExplorer({ fonts, fontKey, staff = [] }) {
  const { openBookingModal } = useMember()
  const [treatment, setTreatment] = useState(null)
  const [provider, setProvider] = useState('anyone')
  const [day, setDay] = useState(null)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null) // null = not searched, [] = no results
  const [error, setError] = useState(null)
  const resultsRef = useRef(null)

  const dayOptions = useMemo(() => buildDayOptions(), [])

  // Filter providers by treatment availability
  const providerOptions = useMemo(() => {
    const base = [{ key: 'anyone', label: 'anyone available' }]
    if (!treatment) return base

    const filtered = staff.filter(s => {
      if (!s.boulevard_service_map) return false
      return !!s.boulevard_service_map[treatment]
    })

    return [
      ...base,
      ...filtered.map(s => ({
        key: s.slug,
        label: s.name,
        sub: s.title || '',
        providerId: s.boulevard_provider_id,
        serviceMap: s.boulevard_service_map,
        image: s.featured_image,
      })),
    ]
  }, [treatment, staff])

  // Reset provider when treatment changes (if current provider doesn't offer it)
  useEffect(() => {
    if (provider === 'anyone') return
    const stillValid = providerOptions.some(p => p.key === provider)
    if (!stillValid) setProvider('anyone')
  }, [providerOptions, provider])

  // Clear results when selections change
  useEffect(() => {
    setResults(null)
    setError(null)
  }, [treatment, provider, day])

  const canSearch = treatment && day

  const handleSearch = useCallback(async () => {
    if (!canSearch) return
    setSearching(true)
    setResults(null)
    setError(null)

    try {
      // Resolve service item ID
      const svcConfig = SERVICE_BOOKING_MAP[treatment]
      if (!svcConfig) throw new Error('Service not found')

      // For category types, we'll just open the booking modal directly
      if (svcConfig.type === 'category') {
        const dayOpt = dayOptions.find(d => d.key === day)
        // Can't search categories via availability API, open modal instead
        openBookingModal('all', treatment)
        setSearching(false)
        return
      }

      const serviceItemId = svcConfig.blvdId

      // Resolve provider
      let staffProviderId = null
      if (provider !== 'anyone') {
        const prov = providerOptions.find(p => p.key === provider)
        staffProviderId = prov?.providerId || null
      }

      // Resolve dates
      const dayOpt = dayOptions.find(d => d.key === day)
      if (!dayOpt) throw new Error('Invalid day')

      // Fetch available dates
      const { dates, locationMap, degraded } = await fetchAvailableDates({
        locationKey: 'all',
        serviceItemId,
        staffProviderId,
        startDate: dayOpt.start,
        endDate: dayOpt.end,
      })

      if (degraded) {
        setError('Our booking system is being a little slow. Try again in a moment.')
        setSearching(false)
        return
      }

      if (!dates || dates.length === 0) {
        setResults([])
        setSearching(false)
        return
      }

      // Fetch times for up to 3 dates
      const datesToFetch = dates.slice(0, 3)
      const allSlots = []

      for (const date of datesToFetch) {
        const { times } = await fetchAvailableTimes({
          locationKey: 'all',
          serviceItemId,
          staffProviderId,
          date,
          dateLocationMap: locationMap,
        })
        // Take up to 4 slots per day
        const daySlots = (times || []).slice(0, 4).map(t => ({ ...t, date }))
        allSlots.push(...daySlots)
      }

      setResults(allSlots)

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    } catch (e) {
      console.error('[MadlibsExplorer] search error:', e.message)
      setError('Something went wrong. Please try again.')
    } finally {
      setSearching(false)
    }
  }, [canSearch, treatment, provider, day, dayOptions, providerOptions, openBookingModal])

  const handleSlotClick = (slot) => {
    const loc = slot.locationKey || 'westfield'
    openBookingModal(loc, treatment)
  }

  // Group results by date
  const groupedResults = useMemo(() => {
    if (!results || results.length === 0) return []
    const map = {}
    results.forEach(s => {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    })
    return Object.entries(map).map(([date, slots]) => ({ date, slots }))
  }, [results])

  const selectedTreatment = TREATMENTS.find(t => t.slug === treatment)

  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative', overflow: 'hidden' }}>
      {/* Grain overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none', opacity: 0.5 }} />

      {/* Subtle gradient glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60%',
        height: '80%',
        background: `radial-gradient(ellipse, ${colors.violet}08, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28 relative">
        {/* Label */}
        <motion.p
          className="text-center mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: fonts.body,
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: colors.violet,
          }}
        >
          Curate Your Perfect Visit
        </motion.p>

        {/* ─── The Sentence ─── */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(1.5rem, 4vw, 2.75rem)',
            fontWeight: 500,
            color: colors.white,
            lineHeight: 2.2,
          }}
        >
          <span style={{ color: 'rgba(250,248,245,0.5)' }}>I want </span>
          <PillSelect
            value={treatment}
            options={TREATMENTS}
            onChange={setTreatment}
            placeholder="choose treatment"
            fonts={fonts}
          />
          <br className="hidden lg:inline" />
          <span style={{ color: 'rgba(250,248,245,0.5)' }}> with </span>
          <PillSelect
            value={provider}
            options={providerOptions}
            onChange={setProvider}
            placeholder="anyone"
            fonts={fonts}
            color={colors.fuchsia}
          />
          <br className="hidden lg:inline" />
          <span style={{ color: 'rgba(250,248,245,0.5)' }}> on </span>
          <PillSelect
            value={day}
            options={dayOptions}
            onChange={setDay}
            placeholder="pick a day"
            fonts={fonts}
            color={colors.rose}
          />
        </motion.div>

        {/* Examples */}
        <motion.p
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            fontFamily: fonts.body,
            fontSize: '0.8125rem',
            color: 'rgba(250,248,245,0.25)',
            fontStyle: 'italic',
          }}
        >
          &ldquo;I want Botox with Hannah on Monday&rdquo; &middot; &ldquo;A Facial with anyone next week&rdquo;
        </motion.p>

        {/* CTA Button */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <button
            onClick={handleSearch}
            disabled={!canSearch || searching}
            style={{
              fontFamily: fonts.body,
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '1rem 3rem',
              borderRadius: 999,
              background: canSearch ? gradients.primary : 'rgba(250,248,245,0.06)',
              color: canSearch ? '#fff' : 'rgba(250,248,245,0.2)',
              border: 'none',
              cursor: canSearch ? 'pointer' : 'default',
              transition: 'all 0.3s',
              opacity: searching ? 0.7 : 1,
            }}
          >
            {searching ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                />
                Searching...
              </span>
            ) : (
              'Find This Slot'
            )}
          </button>
        </motion.div>

        {/* ─── Results ─── */}
        <div ref={resultsRef}>
          <AnimatePresence mode="wait">
            {/* No results */}
            {results !== null && results.length === 0 && !searching && (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-center mt-12"
              >
                <div style={{
                  padding: '2rem',
                  borderRadius: 20,
                  border: '1px solid rgba(250,248,245,0.06)',
                  background: 'rgba(250,248,245,0.02)',
                }}>
                  <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.white, marginBottom: 8 }}>
                    No slots match — yet
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.45)', marginBottom: 16 }}>
                    Try a different day or &ldquo;anyone available&rdquo; for more options.
                  </p>
                  <button
                    onClick={() => openBookingModal('all', treatment)}
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: colors.violet,
                      background: `${colors.violet}12`,
                      border: `1px solid ${colors.violet}30`,
                      borderRadius: 999,
                      padding: '0.625rem 1.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    Browse all {selectedTreatment?.label || 'availability'} →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Has results */}
            {results !== null && results.length > 0 && !searching && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, staggerChildren: 0.05 }}
                className="mt-12"
              >
                <div className="text-center mb-6">
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.violet }}>
                    {results.length} slot{results.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {groupedResults.map(({ date, slots }) => (
                    <div key={date}>
                      <p style={{
                        fontFamily: fonts.body,
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'rgba(250,248,245,0.35)',
                        marginBottom: 8,
                        paddingLeft: 4,
                      }}>
                        {formatDate(date)}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                        {slots.map((slot, i) => (
                          <SlotCard
                            key={`${slot.date}-${slot.startTime}-${slot.locationKey}-${i}`}
                            slot={slot}
                            fonts={fonts}
                            onClick={() => handleSlotClick(slot)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <button
                    onClick={() => openBookingModal('all', treatment)}
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'rgba(250,248,245,0.4)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                    }}
                  >
                    See all available times →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && !searching && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center mt-10"
              >
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.rose }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
