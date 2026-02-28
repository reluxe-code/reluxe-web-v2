// src/components/experiments/NLSearchExplorer.js
// Natural language appointment search — UI demo with static data.
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, gradients } from '@/components/preview/tokens'

/* ─── grain texture ─── */
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

/* ─── example prompts ─── */
const EXAMPLES = [
  { icon: '\uD83D\uDCC5', title: 'Facial & Time', query: 'I want a facial appointment next week' },
  { icon: '\uD83D\uDC69\u200D\u2695\uFE0F', title: 'Staff Availability', query: "Show me all of Hannah's availability this weekend" },
  { icon: '\u2728', title: 'New Patient & Tox', query: 'I am a new patient and want to get tox in the next 2 weeks and am available on Mon & Friday from 2-5pm' },
  { icon: '\uD83D\uDC86', title: 'Specific Request', query: 'Morpheus8 with Kim at the Carmel location on a Saturday morning' },
  { icon: '\uD83D\uDC89', title: 'Quick Refresh', query: 'Botox touch-up, any provider, soonest available' },
]

/* ─── static demo result ─── */
const STATIC_DATES = (() => {
  const base = new Date()
  // Start from next Monday
  const dayOfWeek = base.getDay()
  const daysUntilMon = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek
  const dates = []
  for (let i = -2; i < 14; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + daysUntilMon + i)
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    // Available: Mon, Tue, Wed only
    const dow = d.getDay()
    dates.push({
      date: d.toISOString().split('T')[0],
      day: dayNames[dow],
      num: d.getDate(),
      month: monthNames[d.getMonth()],
      available: dow >= 1 && dow <= 3, // Mon-Wed
    })
  }
  return dates
})()

const STATIC_TIMES = [
  { label: '12:15 PM', range: '12:15 PM \u2013 1:15 PM' },
  { label: '1:45 PM', range: '1:45 PM \u2013 2:45 PM' },
  { label: '2:15 PM', range: '2:15 PM \u2013 3:15 PM' },
  { label: '3:45 PM', range: '3:45 PM \u2013 4:45 PM' },
]

/* ─── voice hook ─── */
function useVoice() {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setSupported(!!SR)
    if (SR) {
      const r = new SR()
      r.continuous = false
      r.interimResults = false
      r.lang = 'en-US'
      recRef.current = r
    }
  }, [])

  const start = useCallback((onResult) => {
    const r = recRef.current
    if (!r) return
    r.onresult = (e) => { onResult(e.results[0][0].transcript); setListening(false) }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
    setListening(true)
  }, [])

  const stop = useCallback(() => { recRef.current?.stop(); setListening(false) }, [])

  return { listening, supported, start, stop }
}

/* ─── shimmer skeleton ─── */
function SearchingShimmer({ fonts }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{ maxWidth: 720, margin: '0 auto' }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        border: '1px solid rgba(124,58,237,0.15)',
      }}>
        {/* Header skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="animate-pulse" style={{ width: 200, height: 18, borderRadius: 6, background: colors.stone }} />
        </div>
        <div className="animate-pulse" style={{ width: 180, height: 12, borderRadius: 6, background: colors.stone, marginBottom: 24 }} />
        <div className="animate-pulse" style={{ width: 120, height: 32, borderRadius: 999, background: `${colors.violet}15`, border: `1px solid ${colors.violet}25`, marginBottom: 32 }} />
        {/* Date strip skeleton */}
        <div className="animate-pulse" style={{ width: 80, height: 12, borderRadius: 6, background: colors.stone, marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{ width: 56, height: 72, borderRadius: 11, background: i === 2 ? `${colors.violet}20` : colors.stone, flexShrink: 0 }} />
          ))}
        </div>
        {/* Time grid skeleton */}
        <div className="animate-pulse" style={{ width: 160, height: 12, borderRadius: 6, background: colors.stone, marginBottom: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: 48, borderRadius: 10, background: colors.stone }} />
          ))}
        </div>
      </div>
      <p className="text-center mt-4" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)' }}>
        Analyzing your request...
      </p>
    </motion.div>
  )
}

/* ─── static booking result panel ─── */
function BookingResult({ fonts, staff }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const first = STATIC_DATES.find(d => d.available)
    return first?.date || null
  })
  const [selectedTime, setSelectedTime] = useState(null)

  // Find provider image from staff
  const hannah = staff?.find(s => s.slug === 'hannah' || s.name === 'Hannah')

  const selectedDateObj = STATIC_DATES.find(d => d.date === selectedDate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ maxWidth: 720, margin: '0 auto' }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        border: '1px solid rgba(124,58,237,0.15)',
      }}>
        {/* Gradient top bar */}
        <div style={{ height: 3, background: gradients.primary }} />

        <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <h3 style={{
                fontFamily: fonts.body,
                fontSize: 'clamp(1rem, 2.5vw, 1.375rem)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: colors.violet,
                margin: 0,
              }}>
                Book with Hannah
              </h3>
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, marginTop: 4 }}>
                RELUXE Westfield &middot; 317.763.1142
              </p>
            </div>
            {hannah?.featured_image && (
              <img
                src={hannah.featured_image}
                alt="Hannah"
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.violet}30` }}
              />
            )}
          </div>

          {/* Service pill */}
          <div style={{ marginTop: 16, marginBottom: 24 }}>
            <span style={{
              fontFamily: fonts.body,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: colors.violet,
              background: `${colors.violet}08`,
              border: `1.5px solid ${colors.violet}25`,
              borderRadius: 999,
              padding: '6px 16px',
              display: 'inline-block',
            }}>
              Signature Facial &middot; 1h
            </span>
          </div>

          {/* Progress stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
            {['Service', 'Date & Time', 'Confirm'].map((step, i) => (
              <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  height: 3,
                  width: '100%',
                  borderRadius: 2,
                  background: i <= 1 ? colors.violet : colors.stone,
                  transition: 'background 0.3s',
                }} />
                <span style={{
                  fontFamily: fonts.body,
                  fontSize: '0.6875rem',
                  fontWeight: i <= 1 ? 600 : 400,
                  color: i <= 1 ? colors.violet : colors.muted,
                }}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* + Add another service */}
          <button style={{
            fontFamily: fonts.body,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: colors.violet,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: 20,
          }}>
            + Add another service with Hannah
          </button>

          {/* Date strip */}
          <p style={{
            fontFamily: fonts.body,
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: colors.heading,
            marginBottom: 12,
          }}>
            Pick a date
          </p>

          <div style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            {STATIC_DATES.map((d, i) => {
              const isSelected = d.date === selectedDate
              const prevMonth = i > 0 ? STATIC_DATES[i - 1].month : null
              const showMonthDivider = d.month !== prevMonth

              return (
                <div key={d.date} style={{ display: 'flex', alignItems: 'stretch', gap: 4, flexShrink: 0 }}>
                  {showMonthDivider && i > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      fontFamily: fonts.body,
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      color: colors.violet,
                      letterSpacing: '0.05em',
                      padding: '0 2px',
                    }}>
                      {d.month}
                    </div>
                  )}
                  <button
                    onClick={() => d.available && setSelectedDate(d.date)}
                    style={{
                      width: 56,
                      padding: '8px 0 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      borderRadius: 11,
                      border: isSelected
                        ? `2px solid ${colors.violet}`
                        : d.available
                          ? `2px solid ${colors.violet}35`
                          : '2px solid transparent',
                      backgroundColor: isSelected
                        ? colors.violet
                        : d.available
                          ? `${colors.violet}08`
                          : 'transparent',
                      cursor: d.available ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      fontFamily: fonts.body,
                      fontSize: '0.625rem',
                      fontWeight: 500,
                      color: isSelected ? 'rgba(255,255,255,0.7)' : colors.muted,
                      textTransform: 'uppercase',
                    }}>
                      {d.day}
                    </span>
                    <span style={{
                      fontFamily: fonts.body,
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: isSelected ? '#fff' : d.available ? colors.violet : 'rgba(0,0,0,0.15)',
                    }}>
                      {d.num}
                    </span>
                    <span style={{
                      fontFamily: fonts.body,
                      fontSize: '0.5625rem',
                      fontWeight: 500,
                      color: isSelected ? 'rgba(255,255,255,0.6)' : colors.muted,
                    }}>
                      {d.month}
                    </span>
                    {d.available && (
                      <div style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: isSelected ? '#fff' : colors.violet,
                        marginTop: 2,
                      }} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Time grid */}
          {selectedDate && (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ marginTop: 24 }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>
                  {selectedDateObj?.day}, {selectedDateObj?.month} {selectedDateObj?.num} &mdash; Pick a time
                </p>
                <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>1h</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {STATIC_TIMES.map((t) => {
                  const isActive = selectedTime === t.label
                  return (
                    <button
                      key={t.label}
                      onClick={() => setSelectedTime(isActive ? null : t.label)}
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: isActive ? '#fff' : colors.heading,
                        backgroundColor: isActive ? colors.violet : '#fff',
                        border: isActive ? `2px solid ${colors.violet}` : `1.5px solid ${colors.stone}`,
                        borderRadius: 10,
                        padding: '10px 8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}
                    >
                      {t.range}
                    </button>
                  )
                })}
              </div>

              {/* Confirm button */}
              <AnimatePresence>
                {selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    style={{ marginTop: 20 }}
                  >
                    <button style={{
                      fontFamily: fonts.body,
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: 999,
                      background: gradients.primary,
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '0.02em',
                    }}>
                      Confirm {selectedTime?.split(' \u2013 ')[0]} with Hannah
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── card icons (SVG line art matching mockup) ─── */
const CARD_ICONS = {
  'Facial & Time': (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke={colors.fuchsia} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="8" width="28" height="26" rx="3" />
      <line x1="6" y1="16" x2="34" y2="16" />
      <line x1="14" y1="4" x2="14" y2="12" />
      <line x1="26" y1="4" x2="26" y2="12" />
      <circle cx="20" cy="25" r="4" />
      <path d="M20 23v2l1.5 1" />
    </svg>
  ),
  'Staff Availability': (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke={colors.fuchsia} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="14" r="6" />
      <path d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12" />
      <circle cx="30" cy="12" r="3" />
      <path d="M30 15v-2" />
      <path d="M28.5 13.5l1.5-1.5 1.5 1.5" />
    </svg>
  ),
  'New Patient & Tox': (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke={colors.fuchsia} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4l2.5 7.5H30l-6 4.5 2.5 7.5-6.5-4.5L13.5 23.5l2.5-7.5-6-4.5h7.5z" />
      <path d="M10 30l2 6" />
      <path d="M30 30l-2 6" />
      <path d="M20 28v8" />
    </svg>
  ),
}

/* ─── main component ─── */
export default function NLSearchExplorer({ fonts, fontKey, staff = [] }) {
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState('idle') // idle | searching | results
  const [activeExample, setActiveExample] = useState(0)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const { listening, supported, start, stop } = useVoice()

  // Rotate examples every 5s
  useEffect(() => {
    if (phase !== 'idle') return
    const t = setInterval(() => setActiveExample(i => (i + 1) % EXAMPLES.length), 5000)
    return () => clearInterval(t)
  }, [phase])

  const handleExampleClick = (ex) => {
    setQuery(ex.query)
    setPhase('idle')
    inputRef.current?.focus()
  }

  const handleSearch = useCallback(() => {
    if (!query.trim()) return
    setPhase('searching')
    setTimeout(() => {
      setPhase('results')
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }, 1800)
  }, [query])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleMic = () => {
    if (listening) { stop(); return }
    start((text) => setQuery(text))
  }

  const handleBack = () => {
    setPhase('idle')
  }

  // Only show first 3 examples in the card grid
  const visibleExamples = EXAMPLES.slice(0, 3)

  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative', overflow: 'hidden' }}>
      {/* Grain overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none', opacity: 0.5 }} />

      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16 relative">
        {/* ─── Main card container with fuchsia border ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'rgba(250,248,245,0.03)',
            border: `1.5px solid ${colors.fuchsia}50`,
            borderRadius: 24,
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle glow behind card */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '60%',
            height: '140%',
            background: `radial-gradient(ellipse, ${colors.fuchsia}08, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Two-column grid: left (input area) + right (example cards) */}
          <div className="nl-search-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(1.5rem, 3vw, 2.5rem)', alignItems: 'start', position: 'relative' }}>
            {/* ─── Left column ─── */}
            <div>
              {/* Heading */}
              <h2 style={{
                fontFamily: fonts.display,
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                fontWeight: 700,
                color: colors.white,
                lineHeight: 1.15,
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}>
                Tell Us Your Ideal Appointment...
              </h2>

              {/* Search input */}
              <div style={{
                position: 'relative',
                background: 'rgba(250,248,245,0.06)',
                border: `1.5px solid ${query ? `${colors.violet}50` : 'rgba(250,248,245,0.12)'}`,
                borderRadius: 12,
                transition: 'border-color 0.2s',
                marginBottom: 12,
              }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe services, providers, times, or patient status. Use voice or type..."
                  style={{
                    width: '100%',
                    fontFamily: fonts.body,
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    color: colors.white,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '0.875rem 3rem 0.875rem 1rem',
                    caretColor: colors.violet,
                  }}
                />
                {/* Mic button */}
                {supported && (
                  <button
                    onClick={handleMic}
                    title={listening ? 'Stop recording' : 'Voice input'}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: 'none',
                      background: listening ? `${colors.rose}20` : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {listening ? (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={colors.rose} stroke="none">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      </motion.div>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,245,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* Helper text */}
              <p style={{
                fontFamily: fonts.body,
                fontSize: '0.75rem',
                color: 'rgba(250,248,245,0.3)',
                lineHeight: 1.5,
                marginBottom: 24,
              }}>
                Ask for specific treatments, particular staff, preferred days/times, or complex requests. The more detail, the better!
              </p>

              {/* AGI-SEARCH CTA Button */}
              <button
                onClick={handleSearch}
                disabled={!query.trim() || phase === 'searching'}
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '0.875rem 2rem',
                  borderRadius: 999,
                  background: query.trim() ? gradients.primary : `linear-gradient(135deg, ${colors.fuchsia}, ${colors.rose})`,
                  color: '#fff',
                  border: 'none',
                  cursor: query.trim() ? 'pointer' : 'default',
                  transition: 'all 0.3s',
                  opacity: phase === 'searching' ? 0.7 : !query.trim() ? 0.85 : 1,
                  width: '100%',
                }}
              >
                {phase === 'searching' ? 'Searching...' : '\u2728 AGI-SEARCH \uD83D\uDD2E \u2728'}
              </button>
            </div>

            {/* ─── Right column: Example cards ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="nl-examples-grid">
              {visibleExamples.map((ex, i) => (
                <motion.button
                  key={ex.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  onClick={() => handleExampleClick(ex)}
                  className="nl-example-card"
                  style={{
                    padding: '20px 12px 16px',
                    background: 'rgba(250,248,245,0.04)',
                    border: '1px solid rgba(250,248,245,0.1)',
                    borderRadius: 16,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'border-color 0.2s, background 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${colors.fuchsia}50`
                    e.currentTarget.style.background = 'rgba(250,248,245,0.06)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(250,248,245,0.1)'
                    e.currentTarget.style.background = 'rgba(250,248,245,0.04)'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: `${colors.fuchsia}10`,
                    border: `1px solid ${colors.fuchsia}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 4,
                  }}>
                    {CARD_ICONS[ex.title] || <span style={{ fontSize: '1.5rem' }}>{ex.icon}</span>}
                  </div>
                  {/* Title */}
                  <span style={{
                    fontFamily: fonts.body,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: colors.fuchsia,
                  }}>
                    {ex.title}
                  </span>
                  {/* Description */}
                  <p style={{
                    fontFamily: fonts.body,
                    fontSize: '0.6875rem',
                    color: 'rgba(250,248,245,0.45)',
                    lineHeight: 1.45,
                    margin: 0,
                  }}>
                    {ex.query}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Results Area ─── */}
        <div ref={resultsRef} style={{ marginTop: 48 }}>
          <AnimatePresence mode="wait">
            {phase === 'searching' && (
              <SearchingShimmer key="shimmer" fonts={fonts} />
            )}
            {phase === 'results' && (
              <motion.div key="results">
                {/* Back link */}
                <div className="text-center mb-4">
                  <button
                    onClick={handleBack}
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
                    &larr; Search again
                  </button>
                </div>
                <BookingResult fonts={fonts} staff={staff} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .nl-search-grid { grid-template-columns: 1fr !important; }
          .nl-examples-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .nl-examples-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
