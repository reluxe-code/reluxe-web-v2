// src/pages/landing/thisorthat.js
// RELUXE "This or That" — Tinder-style landing page experiment
// Mobile-first swipe experience → persona → service recs → inline booking
import Head from 'next/head'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, gradients, fontPairings } from '@/components/preview/tokens'
import useExperimentSession from '@/hooks/useExperimentSession'
import { formatPhone, isValidPhone } from '@/lib/phoneUtils'

const fonts = fontPairings.bold
const EXPERIMENT_ID = 'thisorthat_v1'

// ─── Round Definitions ───────────────────────────────────────────────
// Each round tells a mini story — a real moment, not a clinical label.
const ROUNDS = [
  {
    id: 'r1',
    prompt: 'You catch yourself in the mirror before heading out...',
    a: {
      label: 'I wish this forehead would relax',
      story: 'You look great — but those lines between your brows are doing overtime. You want to look as calm as you actually feel.',
      tags: ['tox'],
    },
    b: {
      label: 'I just look... tired',
      story: 'You slept 8 hours but your skin didn\'t get the memo. You want that lit-from-within thing people keep talking about.',
      tags: ['glo2facial', 'laserhair'],
    },
  },
  {
    id: 'r2',
    prompt: 'Summer is coming. What\'s the dream?',
    a: {
      label: 'Never shaving again',
      story: 'The razor burn, the ingrowns, the 4pm stubble. You\'re over it. You want effortlessly smooth skin that just... stays.',
      tags: ['laserhair'],
    },
    b: {
      label: 'Bare face confidence',
      story: 'You want to walk out the door with nothing on your skin and feel genuinely good about it. No filter needed.',
      tags: ['glo2facial'],
    },
  },
  {
    id: 'r3',
    prompt: 'You get one upgrade. What changes everything?',
    a: {
      label: 'A sharper, more sculpted face',
      story: 'Your jawline used to be your thing. You want that definition back — tighter, lifted, like the structure was always there.',
      tags: ['morpheus8'],
    },
    b: {
      label: 'Softening what time has added',
      story: 'You\'re not trying to look 25. You just want to stop looking stressed. Softer expression lines, fewer "are you tired?" comments.',
      tags: ['tox'],
    },
  },
  {
    id: 'r4',
    prompt: 'How do you want this to feel?',
    a: {
      label: 'One powerful session',
      story: 'You want the kind of appointment where you walk out genuinely different. A real before-and-after moment — worth every minute.',
      tags: ['morpheus8', 'evolvex'],
    },
    b: {
      label: 'Something I keep up monthly',
      story: 'You like the idea of a routine — showing up every month, your skin getting better each time. Consistency over intensity.',
      tags: ['membership'],
    },
  },
  {
    id: 'r5',
    prompt: 'Last one. What would make you feel most like yourself?',
    a: {
      label: 'My body matching my effort',
      story: 'You work out, you eat well — but some areas just won\'t budge. You want your body to finally reflect what you put in.',
      tags: ['evolvex'],
    },
    b: {
      label: 'Skin that feels tighter everywhere',
      story: 'It\'s not about losing weight — it\'s about firmness. You want your skin to feel as strong and alive as you do.',
      tags: ['morpheus8'],
    },
  },
]

// ─── Persona Definitions ─────────────────────────────────────────────
const PERSONAS = [
  {
    id: 'subtle_refresher',
    name: 'The Subtle Refresher',
    emoji: '✨',
    tagline: 'You don\'t want anyone to know you did something — you just want them to say you look amazing. That\'s the art of it.',
    topTags: ['tox', 'glo2facial'],
    services: [
      {
        slug: 'tox', name: 'Tox',
        tagline: 'The lines between your brows and across your forehead don\'t stand a chance. Natural movement, zero frozen look — just you, but smoother.',
        price: 'From $380',
      },
      {
        slug: 'glo2facial', name: 'Glo2Facial',
        tagline: 'Oxygen, exfoliation, and ultrasound in one session. You\'ll leave looking like you slept 12 hours and drank a gallon of water.',
        price: '$250',
      },
    ],
  },
  {
    id: 'full_reset',
    name: 'The Full Reset',
    emoji: '🔥',
    tagline: 'You\'re not here for subtle — you want a real before and after. The kind of result that makes you do a double-take in the mirror.',
    topTags: ['morpheus8', 'laserhair'],
    services: [
      {
        slug: 'morpheus8', name: 'Morpheus8',
        tagline: 'Radiofrequency microneedling that remodels skin from the inside out. Tighter jawline, smoother texture, real structural change.',
        price: 'From $800',
      },
      {
        slug: 'laserhair', name: 'Laser Hair Removal',
        tagline: 'Throw away the razor for good. Permanently smooth skin that saves you time, irritation, and money in the long run.',
        price: 'From $150',
      },
    ],
  },
  {
    id: 'maintenance_queen',
    name: 'The Ritual Keeper',
    emoji: '👑',
    tagline: 'You believe in showing up — for your skin, for yourself. You don\'t need a dramatic transformation. You need a plan that compounds.',
    topTags: ['membership', 'tox'],
    services: [
      {
        slug: 'tox', name: 'Tox',
        tagline: 'Regular touch-ups keep your expression soft and natural. The longer you stay on schedule, the less you need over time.',
        price: 'From $380',
      },
      {
        slug: 'glo2facial', name: 'Glo2Facial',
        tagline: 'Your monthly reset. Each session builds on the last — better texture, more glow, skin that keeps improving.',
        price: '$250',
      },
    ],
    showMembership: true,
  },
  {
    id: 'body_sculptor',
    name: 'The Body Sculptor',
    emoji: '💪',
    tagline: 'You put in the work at the gym and in the kitchen. Now you want your body to actually show it — in the places that have been stubbornly resistant.',
    topTags: ['evolvex', 'morpheus8'],
    services: [
      {
        slug: 'evolvex', name: 'EvolveX',
        tagline: 'Hands-free body contouring that targets fat, tightens skin, and tones muscle — all in one session. Finally, technology that matches your effort.',
        price: 'From $500',
      },
      {
        slug: 'morpheus8', name: 'Morpheus8',
        tagline: 'Deep tissue remodeling that firms and tightens from within. Works on face and body for skin that feels as strong as you are.',
        price: 'From $800',
      },
    ],
  },
  {
    id: 'glow_getter',
    name: 'The Glow Getter',
    emoji: '💎',
    tagline: 'You want to look like you just came back from somewhere amazing. Radiant, effortless, the kind of skin people notice across the room.',
    topTags: ['glo2facial', 'laserhair'],
    services: [
      {
        slug: 'glo2facial', name: 'Glo2Facial',
        tagline: 'This isn\'t your average facial. Oxygenation + ultrasound + exfoliation = the kind of instant glow that makes people ask what you\'re using.',
        price: '$250',
      },
      {
        slug: 'laserhair', name: 'Laser Hair Removal',
        tagline: 'Silky smooth everywhere with zero effort. Because glowing skin shouldn\'t have to compete with stubble.',
        price: 'From $150',
      },
    ],
  },
]

// ─── Persona Scoring ─────────────────────────────────────────────────
function computePersona(choices) {
  const scores = {}
  choices.forEach(c => {
    ;(c.tags || []).forEach(t => { scores[t] = (scores[t] || 0) + 1 })
  })

  const isHeavy = ((scores.morpheus8 || 0) + (scores.evolvex || 0) >= 3) || (scores.membership || 0) >= 1

  // Find best persona by matching top tags
  let best = PERSONAS[0]
  let bestScore = -1
  for (const p of PERSONAS) {
    const s = p.topTags.reduce((sum, t) => sum + (scores[t] || 0), 0)
    if (s > bestScore) { bestScore = s; best = p }
  }

  return { persona: best, scores, isHeavy }
}

// ─── Service images ──────────────────────────────────────────────────
const SERVICE_IMAGES = {
  tox: '/images/services/tox-hero.jpg',
  glo2facial: '/images/services/glo2-hero.jpg',
  laserhair: '/images/services/laser-hero.jpg',
  morpheus8: '/images/services/morpheus8-hero.jpg',
  evolvex: '/images/services/evolve-hero.jpg',
}

// ─── Location data ───────────────────────────────────────────────────
const LOCATIONS = [
  { key: 'carmel', label: 'Carmel', address: '14390 Clay Terrace Blvd, Carmel' },
  { key: 'westfield', label: 'Westfield', address: '17340 Mercantile Blvd, Westfield' },
]

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function ThisOrThatPage() {
  // Phase: SPLASH | SWIPE | RESULTS | BOOKING
  const [phase, setPhase] = useState('SPLASH')
  const [round, setRound] = useState(0)
  const [choices, setChoices] = useState([])
  const [choosing, setChoosing] = useState(null) // 'a' | 'b' during animation
  const [persona, setPersona] = useState(null)
  const [scores, setScores] = useState({})
  const [isHeavy, setIsHeavy] = useState(false)
  const roundStartRef = useRef(Date.now())

  // Booking state
  const [bookingService, setBookingService] = useState(null)
  const [bookingStep, setBookingStep] = useState('LOCATION') // LOCATION | PROVIDER | DATETIME | PHONE | CONFIRM | SUCCESS
  const [bookingLocation, setBookingLocation] = useState(null)
  const [providers, setProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableTimes, setAvailableTimes] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [cartId, setCartId] = useState(null)
  const [cartSummary, setCartSummary] = useState(null)
  const [phone, setPhone] = useState('')
  const [codeId, setCodeId] = useState(null)
  const [code, setCode] = useState('')
  const [verifiedClient, setVerifiedClient] = useState(null)
  const [skipVerification, setSkipVerification] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [appointmentResult, setAppointmentResult] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  // Experiment session
  const { getSessionId, updateSession, trackEvent, getDuration } = useExperimentSession(EXPERIMENT_ID)

  // ─── Phase: SPLASH ──────────────────────────────────────────────────
  function handleStart() {
    setPhase('SWIPE')
    setRound(0)
    roundStartRef.current = Date.now()
    trackEvent('experiment_start')
  }

  // ─── Phase: SWIPE ───────────────────────────────────────────────────
  function handleChoice(side) {
    if (choosing) return
    setChoosing(side)
    const chosen = ROUNDS[round][side]
    const timeMs = Date.now() - roundStartRef.current

    trackEvent('experiment_swipe', {
      round_id: ROUNDS[round].id,
      round_index: round,
      choice: chosen.label,
      side,
      time_ms: timeMs,
    })

    const newChoices = [...choices, chosen]

    setTimeout(() => {
      setChoices(newChoices)
      setChoosing(null)

      if (round >= ROUNDS.length - 1) {
        // Compute results
        const result = computePersona(newChoices)
        setPersona(result.persona)
        setScores(result.scores)
        setIsHeavy(result.isHeavy)
        setPhase('RESULTS')

        updateSession({
          outcome: 'completed_quiz',
          rounds_completed: ROUNDS.length,
          persona_name: result.persona.name,
          persona_services: result.persona.services.map(s => s.slug),
          is_heavy_responder: result.isHeavy,
          choices: newChoices.map(c => c.label),
          scores: result.scores,
          completed_at: new Date().toISOString(),
          duration_ms: getDuration(),
        })

        trackEvent('experiment_results_view', {
          persona: result.persona.name,
          services: result.persona.services.map(s => s.slug),
          is_heavy: result.isHeavy,
          duration_ms: getDuration(),
        })
      } else {
        setRound(r => r + 1)
        roundStartRef.current = Date.now()
      }
    }, 400)
  }

  // ─── Phase: BOOKING ─────────────────────────────────────────────────
  function startBooking(service) {
    setBookingService(service)
    setBookingStep('LOCATION')
    setBookingLocation(null)
    setProviders([])
    setSelectedProvider(null)
    setAvailableDates([])
    setSelectedDate(null)
    setAvailableTimes([])
    setSelectedTime(null)
    setCartId(null)
    setPhone('')
    setCodeId(null)
    setCode('')
    setVerifiedClient(null)
    setSkipVerification(false)
    setFirstName('')
    setLastName('')
    setEmail('')
    setAppointmentResult(null)
    setBookingError(null)
    setPhase('BOOKING')

    trackEvent('experiment_booking_start', { service_slug: service.slug })
    updateSession({ booking_started: true, booking_service: service.slug })
  }

  // Fetch providers for location
  async function selectLocation(loc) {
    setBookingLocation(loc)
    setBookingError(null)
    setBookingLoading(true)
    trackEvent('experiment_booking_location', { location_key: loc.key })
    updateSession({ booking_location: loc.key })

    try {
      const res = await fetch(`/api/blvd/providers/for-service?serviceSlug=${bookingService.slug}&locationKey=${loc.key}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load providers')
      setProviders(data.providers || data || [])
      setBookingStep('PROVIDER')
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  // Fetch dates for provider
  async function selectProvider(prov) {
    setSelectedProvider(prov)
    setBookingError(null)
    setBookingLoading(true)
    trackEvent('experiment_booking_provider', { provider_name: prov.name })

    try {
      const res = await fetch(
        `/api/blvd/availability/dates?locationKey=${bookingLocation.key}&serviceItemId=${prov.serviceItemId}&staffProviderId=${prov.boulevardProviderId}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load dates')
      setAvailableDates(data.dates || data || [])
      setBookingStep('DATETIME')
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  // Fetch times for date
  async function selectDate(dateStr) {
    setSelectedDate(dateStr)
    setSelectedTime(null)
    setBookingError(null)
    setBookingLoading(true)

    try {
      const res = await fetch(
        `/api/blvd/availability/times?locationKey=${bookingLocation.key}&serviceItemId=${selectedProvider.serviceItemId}&staffProviderId=${selectedProvider.boulevardProviderId}&date=${dateStr}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load times')
      setAvailableTimes(data.times || data || [])
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  // Create cart + reserve
  async function selectTime(slot) {
    setSelectedTime(slot)
    setBookingError(null)
    setBookingLoading(true)

    trackEvent('experiment_booking_datetime', { date: selectedDate, time: slot.startTime })

    try {
      const res = await fetch('/api/blvd/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationKey: bookingLocation.key,
          serviceItemId: selectedProvider.serviceItemId,
          staffProviderId: selectedProvider.boulevardProviderId,
          date: selectedDate,
          startTime: slot.startTime,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reserve time')
      setCartId(data.cartId)
      setCartSummary(data.summary)
      setBookingStep('PHONE')
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  // Send verification code
  async function sendVerificationCode() {
    if (!isValidPhone(phone)) {
      setBookingError('Please enter a valid 10-digit phone number.')
      return
    }
    setBookingError(null)
    setBookingLoading(true)
    updateSession({ contact_phone: phone })

    try {
      const formatted = formatPhone(phone)
      const res = await fetch(`/api/blvd/cart/${cartId}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatted }),
      })
      const data = await res.json()
      if (data.skipVerification) {
        // Boulevard couldn't send code — skip to details
        setSkipVerification(true)
        setBookingStep('CONFIRM')
      } else if (!res.ok) {
        throw new Error(data.error || 'Failed to send code')
      } else {
        setCodeId(data.codeId)
      }
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  // Verify code
  async function verifyCode() {
    if (code.length < 6) return
    setBookingError(null)
    setBookingLoading(true)

    try {
      const res = await fetch(`/api/blvd/cart/${cartId}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeId,
          code,
          date: selectedDate,
          startTime: selectedTime.startTime,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid code')
      setVerifiedClient(data.client)
      setBookingStep('CONFIRM')
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  // Checkout
  async function checkout() {
    setBookingError(null)
    setBookingLoading(true)

    try {
      const body = { ownershipVerified: !skipVerification }
      if (skipVerification || !verifiedClient?.firstName) {
        if (!firstName || !lastName || !email) {
          setBookingError('Please fill in all fields.')
          setBookingLoading(false)
          return
        }
        body.firstName = firstName
        body.lastName = lastName
        body.email = email
        body.phone = formatPhone(phone)
      }

      const res = await fetch(`/api/blvd/cart/${cartId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')

      setAppointmentResult(data)
      setBookingStep('SUCCESS')

      updateSession({
        outcome: 'booked',
        booking_completed: true,
        appointment_id: data.appointmentId,
      })

      trackEvent('experiment_booking_complete', {
        appointment_id: data.appointmentId,
        service: bookingService.slug,
        location: bookingLocation.key,
      })

      // Fire conversion to GA4/Meta/Bird
      if (typeof window !== 'undefined' && window.reluxeTrack) {
        window.reluxeTrack('booking_complete', {
          source: 'thisorthat',
          service: bookingService.slug,
          location: bookingLocation.key,
          appointment_id: data.appointmentId,
        })
      }
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  // ─── Membership upsell ──────────────────────────────────────────────
  function handleMembershipClick() {
    trackEvent('experiment_membership_click', { persona: persona?.name })
    updateSession({ membership_clicked: true })
    window.open('/memberships', '_blank')
  }

  // Track membership view
  useEffect(() => {
    if (phase === 'RESULTS' && isHeavy) {
      trackEvent('experiment_membership_view', { persona: persona?.name })
      updateSession({ membership_shown: true })
    }
  }, [phase, isHeavy]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Abandon tracking on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      if (phase === 'BOOKING' && bookingStep !== 'SUCCESS') {
        updateSession({ outcome: 'abandoned', abandon_phase: `booking_${bookingStep.toLowerCase()}`, duration_ms: getDuration() })
      } else if (phase === 'SWIPE') {
        updateSession({ outcome: 'abandoned', abandon_phase: `swipe_round_${round}`, rounds_completed: round, duration_ms: getDuration() })
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <>
      <Head>
        <title>This or That — Find Your Perfect Treatment | RELUXE</title>
        <meta name="description" content="5 quick taps. Discover your beauty persona and book your perfect treatment in seconds." />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href={fonts.googleUrl} rel="stylesheet" />
        <meta property="og:title" content="This or That — RELUXE Med Spa" />
        <meta property="og:description" content="5 taps. Your personalized result. Book instantly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/landing/thisorthat" />
      </Head>

      <div style={{
        minHeight: '100dvh',
        background: colors.ink,
        fontFamily: fonts.body,
        color: colors.cream,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Subtle radial glow */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.12), transparent 70%)',
        }} />

        {/* Logo */}
        <header style={{
          position: 'relative', zIndex: 10,
          padding: '16px 20px 0',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: fonts.display,
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(250,248,245,0.5)',
          }}>
            RELUXE
          </div>
        </header>

        <main style={{ position: 'relative', zIndex: 5, padding: '0 20px 40px' }}>
          <AnimatePresence mode="wait">
            {phase === 'SPLASH' && <SplashScreen key="splash" onStart={handleStart} />}
            {phase === 'SWIPE' && (
              <SwipeRound
                key={`round-${round}`}
                round={ROUNDS[round]}
                roundIndex={round}
                total={ROUNDS.length}
                choosing={choosing}
                onChoice={handleChoice}
              />
            )}
            {phase === 'RESULTS' && (
              <ResultsScreen
                key="results"
                persona={persona}
                isHeavy={isHeavy}
                onBook={startBooking}
                onMembership={handleMembershipClick}
              />
            )}
            {phase === 'BOOKING' && (
              <BookingFlow
                key="booking"
                step={bookingStep}
                service={bookingService}
                location={bookingLocation}
                providers={providers}
                selectedProvider={selectedProvider}
                availableDates={availableDates}
                selectedDate={selectedDate}
                availableTimes={availableTimes}
                selectedTime={selectedTime}
                cartSummary={cartSummary}
                phone={phone}
                setPhone={setPhone}
                codeId={codeId}
                code={code}
                setCode={setCode}
                verifiedClient={verifiedClient}
                skipVerification={skipVerification}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
                appointmentResult={appointmentResult}
                loading={bookingLoading}
                error={bookingError}
                onSelectLocation={selectLocation}
                onSelectProvider={selectProvider}
                onSelectDate={selectDate}
                onSelectTime={selectTime}
                onSendCode={sendVerificationCode}
                onVerifyCode={verifyCode}
                onCheckout={checkout}
                onBack={() => {
                  if (bookingStep === 'LOCATION') { setPhase('RESULTS') }
                  else if (bookingStep === 'PROVIDER') { setBookingStep('LOCATION') }
                  else if (bookingStep === 'DATETIME') { setBookingStep('PROVIDER') }
                  else if (bookingStep === 'PHONE') { setBookingStep('DATETIME') }
                  else if (bookingStep === 'CONFIRM') { setBookingStep('PHONE') }
                }}
                persona={persona}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  )
}

// Remove default layout
ThisOrThatPage.getLayout = (page) => page

// ═══════════════════════════════════════════════════════════════════════
// SPLASH SCREEN
// ═══════════════════════════════════════════════════════════════════════
function SplashScreen({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100dvh - 100px)', textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 style={{
          fontFamily: fontPairings.bold.display,
          fontSize: 'clamp(2.5rem, 10vw, 4.5rem)',
          fontWeight: 700,
          lineHeight: 1.05,
          background: gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          This or That
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          marginTop: 16,
          fontSize: '1.05rem',
          color: 'rgba(250,248,245,0.55)',
          fontWeight: 400,
          maxWidth: 300,
          lineHeight: 1.5,
        }}
      >
        Tell us what matters to you. We'll tell you exactly where to start.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        whileTap={{ scale: 0.96 }}
        onClick={onStart}
        style={{
          marginTop: 48,
          padding: '16px 48px',
          borderRadius: 999,
          border: 'none',
          background: gradients.primary,
          color: '#fff',
          fontFamily: fontPairings.bold.body,
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.02em',
        }}
      >
        Tap to Start →
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        style={{
          marginTop: 48,
          fontSize: '0.75rem',
          color: 'rgba(250,248,245,0.3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        RELUXE Med Spa • Carmel & Westfield
      </motion.p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// SWIPE ROUND
// ═══════════════════════════════════════════════════════════════════════
function SwipeRound({ round, roundIndex, total, choosing, onChoice }) {
  const progress = ((roundIndex + 1) / total) * 100

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        display: 'flex', flexDirection: 'column',
        minHeight: 'calc(100dvh - 100px)',
        paddingTop: 16,
      }}
    >
      {/* Progress bar */}
      <div style={{
        height: 3,
        borderRadius: 2,
        background: 'rgba(250,248,245,0.08)',
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        <motion.div
          initial={{ width: `${(roundIndex / total) * 100}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: gradients.primary, borderRadius: 2 }}
        />
      </div>

      {/* Prompt / scenario */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ textAlign: 'center', marginBottom: 20 }}
      >
        <p style={{
          fontSize: '0.7rem',
          color: 'rgba(250,248,245,0.3)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          {roundIndex + 1} of {total}
        </p>
        <p style={{
          fontFamily: fontPairings.bold.display,
          fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)',
          fontWeight: 500,
          fontStyle: 'italic',
          color: 'rgba(250,248,245,0.75)',
          lineHeight: 1.4,
          maxWidth: 340,
          margin: '0 auto',
        }}>
          {round.prompt}
        </p>
      </motion.div>

      {/* Two choice cards */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        {['a', 'b'].map(side => {
          const opt = round[side]
          const isChosen = choosing === side
          const isFaded = choosing && choosing !== side

          return (
            <motion.button
              key={side}
              onClick={() => onChoice(side)}
              disabled={!!choosing}
              animate={{
                scale: isChosen ? 1.02 : isFaded ? 0.97 : 1,
                opacity: isFaded ? 0.2 : 1,
                borderColor: isChosen ? colors.violet : 'rgba(250,248,245,0.06)',
              }}
              whileTap={!choosing ? { scale: 0.98 } : {}}
              transition={{ duration: 0.3 }}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '24px 24px',
                borderRadius: 24,
                border: '1.5px solid rgba(250,248,245,0.06)',
                background: isChosen
                  ? 'rgba(124,58,237,0.08)'
                  : 'rgba(250,248,245,0.025)',
                backdropFilter: 'blur(8px)',
                cursor: choosing ? 'default' : 'pointer',
                color: colors.cream,
                fontFamily: fontPairings.bold.body,
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle gradient edge on chosen */}
              {isChosen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
                    background: gradients.primary, borderRadius: '24px 0 0 24px',
                  }}
                />
              )}

              <span style={{
                fontFamily: fontPairings.bold.display,
                fontSize: 'clamp(1.1rem, 4.5vw, 1.35rem)',
                fontWeight: 600,
                lineHeight: 1.25,
                display: 'block',
                marginBottom: 8,
              }}>
                "{opt.label}"
              </span>
              <span style={{
                fontSize: '0.85rem',
                lineHeight: 1.55,
                color: 'rgba(250,248,245,0.5)',
                display: 'block',
              }}>
                {opt.story}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// RESULTS SCREEN
// ═══════════════════════════════════════════════════════════════════════
function ResultsScreen({ persona, isHeavy, onBook, onMembership }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, type: 'spring', damping: 20 }}
      style={{ paddingTop: 24, paddingBottom: 40 }}
    >
      {/* Persona reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 32 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', damping: 12 }}
          style={{ fontSize: '3.5rem', marginBottom: 16 }}
        >
          {persona.emoji}
        </motion.div>
        <p style={{
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(250,248,245,0.35)',
          marginBottom: 10,
        }}>
          Your result
        </p>
        <h2 style={{
          fontFamily: fontPairings.bold.display,
          fontSize: 'clamp(1.75rem, 7vw, 2.5rem)',
          fontWeight: 700,
          background: gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.1,
        }}>
          {persona.name}
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{
            marginTop: 16,
            fontSize: '0.95rem',
            color: 'rgba(250,248,245,0.6)',
            maxWidth: 340,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}
        >
          {persona.tagline}
        </motion.p>
      </motion.div>

      {/* Where to start */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(250,248,245,0.3)',
          marginBottom: 16,
        }}
      >
        We'd start you here
      </motion.p>

      {/* Service recommendation cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {persona.services.map((svc, i) => (
          <motion.div
            key={svc.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.2, duration: 0.5 }}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(250,248,245,0.08)',
              background: 'rgba(250,248,245,0.03)',
            }}
          >
            {SERVICE_IMAGES[svc.slug] && (
              <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                <img
                  src={SERVICE_IMAGES[svc.slug]}
                  alt={svc.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="eager"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
                  background: 'linear-gradient(transparent, rgba(26,26,26,0.9))',
                }} />
              </div>
            )}
            <div style={{ padding: '20px 20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <h3 style={{
                  fontFamily: fontPairings.bold.display,
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: colors.cream,
                }}>
                  {svc.name}
                </h3>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'rgba(250,248,245,0.4)',
                  whiteSpace: 'nowrap',
                }}>
                  {svc.price}
                </span>
              </div>
              <p style={{
                marginTop: 10,
                fontSize: '0.9rem',
                color: 'rgba(250,248,245,0.6)',
                lineHeight: 1.6,
              }}>
                {svc.tagline}
              </p>
              <button
                onClick={() => onBook(svc)}
                style={{
                  marginTop: 20,
                  width: '100%',
                  padding: '15px 24px',
                  borderRadius: 14,
                  border: 'none',
                  background: gradients.primary,
                  color: '#fff',
                  fontFamily: fontPairings.bold.body,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                Book {svc.name} →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inline booking nudge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        style={{
          marginTop: 24,
          padding: '16px 20px',
          borderRadius: 14,
          background: 'rgba(124,58,237,0.06)',
          border: '1px solid rgba(124,58,237,0.12)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.55)', lineHeight: 1.5 }}>
          Pick your provider, choose your time, and book — all right here. No phone calls, no waiting.
        </p>
      </motion.div>

      {/* Membership upsell for heavy responders */}
      {(isHeavy || persona.showMembership) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          style={{
            marginTop: 20,
            padding: '24px 20px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(192,38,211,0.08))',
            border: '1px solid rgba(124,58,237,0.2)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>👑</p>
          <h3 style={{
            fontFamily: fontPairings.bold.display,
            fontSize: '1.2rem',
            fontWeight: 600,
            color: colors.cream,
          }}>
            Looks like you'd love a membership
          </h3>
          <p style={{
            marginTop: 8,
            fontSize: '0.9rem',
            color: 'rgba(250,248,245,0.6)',
            lineHeight: 1.5,
          }}>
            Save on everything you love with a monthly membership. Members get exclusive pricing on all services.
          </p>
          <button
            onClick={onMembership}
            style={{
              marginTop: 16,
              padding: '12px 32px',
              borderRadius: 12,
              border: '1.5px solid rgba(124,58,237,0.4)',
              background: 'transparent',
              color: colors.cream,
              fontFamily: fontPairings.bold.body,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Learn about Membership →
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// BOOKING FLOW
// ═══════════════════════════════════════════════════════════════════════
function BookingFlow({
  step, service, location, providers, selectedProvider,
  availableDates, selectedDate, availableTimes, selectedTime,
  cartSummary, phone, setPhone, codeId, code, setCode,
  verifiedClient, skipVerification,
  firstName, setFirstName, lastName, setLastName, email, setEmail,
  appointmentResult,
  loading, error,
  onSelectLocation, onSelectProvider, onSelectDate, onSelectTime,
  onSendCode, onVerifyCode, onCheckout, onBack,
  persona,
}) {
  const codeInputRefs = useRef([])

  function handleCodeChange(i, e) {
    const ch = e.target.value.replace(/\D/g, '').slice(-1)
    const next = code.split('')
    while (next.length < 6) next.push('')
    next[i] = ch
    const joined = next.join('')
    setCode(joined)
    if (ch && i < 5) setTimeout(() => codeInputRefs.current[i + 1]?.focus(), 0)
  }

  function handleCodeKeyDown(i, e) {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      setTimeout(() => codeInputRefs.current[i - 1]?.focus(), 0)
    }
  }

  function handleCodePaste(e) {
    e.preventDefault()
    const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
    if (pasted) setCode(pasted)
  }

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && codeId && step === 'PHONE') {
      onVerifyCode()
    }
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps

  const cardStyle = {
    borderRadius: 20,
    border: '1px solid rgba(250,248,245,0.08)',
    background: 'rgba(250,248,245,0.03)',
    padding: '24px 20px',
  }

  const stepLabelStyle = {
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(250,248,245,0.35)',
    marginBottom: 8,
  }

  const headingStyle = {
    fontFamily: fontPairings.bold.display,
    fontSize: '1.4rem',
    fontWeight: 600,
    color: colors.cream,
    marginBottom: 20,
  }

  const optionBtnStyle = (selected) => ({
    width: '100%',
    padding: '16px 20px',
    borderRadius: 16,
    border: selected ? `2px solid ${colors.violet}` : '1.5px solid rgba(250,248,245,0.08)',
    background: selected ? 'rgba(124,58,237,0.1)' : 'rgba(250,248,245,0.02)',
    color: colors.cream,
    fontFamily: fontPairings.bold.body,
    fontSize: '1rem',
    fontWeight: 500,
    cursor: loading ? 'default' : 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    WebkitTapHighlightColor: 'transparent',
  })

  const primaryBtnStyle = (disabled) => ({
    width: '100%',
    padding: '14px 24px',
    borderRadius: 14,
    border: 'none',
    background: disabled ? 'rgba(250,248,245,0.1)' : gradients.primary,
    color: disabled ? 'rgba(250,248,245,0.3)' : '#fff',
    fontFamily: fontPairings.bold.body,
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: '1.5px solid rgba(250,248,245,0.1)',
    background: 'rgba(250,248,245,0.04)',
    color: colors.cream,
    fontFamily: fontPairings.bold.body,
    fontSize: '1rem',
    outline: 'none',
    caretColor: colors.violet,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ paddingTop: 16, paddingBottom: 40 }}
    >
      {/* Back button */}
      {step !== 'SUCCESS' && (
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none',
            color: 'rgba(250,248,245,0.5)',
            fontFamily: fontPairings.bold.body,
            fontSize: '0.85rem',
            cursor: 'pointer',
            marginBottom: 16,
            padding: 0,
          }}
        >
          ← Back
        </button>
      )}

      {/* Booking header */}
      <div style={{
        textAlign: 'center', marginBottom: 24,
        padding: '16px 0',
        borderBottom: '1px solid rgba(250,248,245,0.05)',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Booking
        </p>
        <p style={{
          fontFamily: fontPairings.bold.display,
          fontSize: '1.25rem',
          fontWeight: 600,
          color: colors.cream,
          marginTop: 4,
        }}>
          {service?.name}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 16,
          padding: '12px 16px',
          borderRadius: 12,
          background: 'rgba(225,29,115,0.1)',
          border: '1px solid rgba(225,29,115,0.2)',
          color: colors.rose,
          fontSize: '0.85rem',
        }}>
          {error}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px 0',
          color: 'rgba(250,248,245,0.5)',
          fontSize: '0.9rem',
        }}>
          <div style={{
            width: 32, height: 32, margin: '0 auto 12px',
            border: '3px solid rgba(250,248,245,0.1)',
            borderTopColor: colors.violet,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          Loading...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Step: LOCATION */}
      {step === 'LOCATION' && !loading && (
        <div style={cardStyle}>
          <p style={stepLabelStyle}>Step 1</p>
          <h3 style={headingStyle}>Choose your location</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {LOCATIONS.map(loc => (
              <button
                key={loc.key}
                onClick={() => onSelectLocation(loc)}
                style={optionBtnStyle(false)}
              >
                <div style={{ fontWeight: 600 }}>{loc.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(250,248,245,0.4)', marginTop: 4 }}>
                  {loc.address}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: PROVIDER */}
      {step === 'PROVIDER' && !loading && (
        <div style={cardStyle}>
          <p style={stepLabelStyle}>Step 2</p>
          <h3 style={headingStyle}>Choose your provider</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {providers.map(prov => (
              <button
                key={prov.boulevardProviderId || prov.slug}
                onClick={() => onSelectProvider(prov)}
                style={optionBtnStyle(false)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {prov.image && (
                    <img
                      src={prov.image}
                      alt={prov.name}
                      style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{prov.name}</div>
                    {prov.nextAvailableDate && (
                      <div style={{ fontSize: '0.8rem', color: 'rgba(250,248,245,0.4)', marginTop: 2 }}>
                        Next available: {new Date(prov.nextAvailableDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {providers.length === 0 && (
              <p style={{ color: 'rgba(250,248,245,0.4)', fontSize: '0.9rem', textAlign: 'center', padding: 20 }}>
                No providers available for this service at this location.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step: DATETIME */}
      {step === 'DATETIME' && !loading && (
        <div style={cardStyle}>
          <p style={stepLabelStyle}>Step 3</p>
          <h3 style={headingStyle}>Pick a date & time</h3>

          {/* Date pills */}
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12,
            WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none',
          }}>
            {availableDates.slice(0, 21).map(d => {
              const date = new Date(d + 'T12:00:00')
              const isSelected = d === selectedDate
              return (
                <button
                  key={d}
                  onClick={() => selectDate(d)}
                  style={{
                    flexShrink: 0,
                    width: 64, height: 72,
                    borderRadius: 14,
                    border: isSelected ? `2px solid ${colors.violet}` : '1.5px solid rgba(250,248,245,0.08)',
                    background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(250,248,245,0.02)',
                    color: colors.cream,
                    fontFamily: fontPairings.bold.body,
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 2,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(250,248,245,0.4)' }}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {date.getDate()}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(250,248,245,0.4)' }}>
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Time slots */}
          {selectedDate && availableTimes.length > 0 && (
            <div style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}>
              {availableTimes.map(slot => {
                const time = new Date(slot.startTime)
                const label = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                return (
                  <button
                    key={slot.id}
                    onClick={() => onSelectTime(slot)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 10,
                      border: '1.5px solid rgba(250,248,245,0.08)',
                      background: 'rgba(250,248,245,0.02)',
                      color: colors.cream,
                      fontFamily: fontPairings.bold.body,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {selectedDate && availableTimes.length === 0 && !loading && (
            <p style={{ color: 'rgba(250,248,245,0.4)', fontSize: '0.85rem', textAlign: 'center', marginTop: 16 }}>
              No times available for this date. Try another.
            </p>
          )}
        </div>
      )}

      {/* Step: PHONE */}
      {step === 'PHONE' && !loading && (
        <div style={cardStyle}>
          <p style={stepLabelStyle}>Step 4</p>
          <h3 style={headingStyle}>Verify your phone</h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.5)', marginBottom: 20 }}>
            We'll text you a 6-digit code to link this booking to your account.
          </p>

          {!codeId ? (
            <>
              <input
                type="tel"
                inputMode="tel"
                placeholder="(317) 555-1234"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={inputStyle}
              />
              <button
                onClick={onSendCode}
                disabled={!isValidPhone(phone)}
                style={{ ...primaryBtnStyle(!isValidPhone(phone)), marginTop: 16 }}
              >
                Send Code
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.6)', marginBottom: 16, textAlign: 'center' }}>
                Enter the 6-digit code sent to your phone
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {Array.from({ length: 6 }, (_, i) => (
                  <input
                    key={i}
                    ref={el => { codeInputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={code[i] || ''}
                    onChange={e => handleCodeChange(i, e)}
                    onKeyDown={e => handleCodeKeyDown(i, e)}
                    onPaste={i === 0 ? handleCodePaste : undefined}
                    style={{
                      width: 44, height: 52,
                      borderRadius: 12,
                      border: code[i] ? `2px solid ${colors.violet}` : '1.5px solid rgba(250,248,245,0.1)',
                      background: 'rgba(250,248,245,0.04)',
                      color: colors.cream,
                      fontFamily: fontPairings.bold.body,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      outline: 'none',
                      caretColor: colors.violet,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step: CONFIRM */}
      {step === 'CONFIRM' && !loading && (
        <div style={cardStyle}>
          <p style={stepLabelStyle}>Almost there</p>
          <h3 style={headingStyle}>Confirm your booking</h3>

          {/* Summary */}
          {cartSummary && (
            <div style={{
              marginBottom: 20, padding: '16px', borderRadius: 14,
              background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)',
            }}>
              <p style={{ fontWeight: 600, color: colors.cream }}>{cartSummary.serviceName}</p>
              {cartSummary.staffName && <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.6)', marginTop: 4 }}>with {cartSummary.staffName}</p>}
              <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.6)', marginTop: 4 }}>
                {new Date(cartSummary.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {' at '}
                {new Date(cartSummary.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.6)', marginTop: 4 }}>
                {location?.label}
              </p>
            </div>
          )}

          {/* Client details form (if new client or skip verification) */}
          {(skipVerification || !verifiedClient?.firstName) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <input
                placeholder="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {verifiedClient?.firstName && !skipVerification && (
            <p style={{ fontSize: '0.9rem', color: 'rgba(250,248,245,0.7)', marginBottom: 20 }}>
              Welcome back, {verifiedClient.firstName}! Tap below to confirm.
            </p>
          )}

          <button
            onClick={onCheckout}
            style={primaryBtnStyle(false)}
          >
            Confirm Booking →
          </button>
        </div>
      )}

      {/* Step: SUCCESS */}
      {step === 'SUCCESS' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ ...cardStyle, textAlign: 'center' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
          <h3 style={{
            fontFamily: fontPairings.bold.display,
            fontSize: '1.5rem',
            fontWeight: 700,
            background: gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            You're booked!
          </h3>
          <p style={{ marginTop: 12, fontSize: '0.9rem', color: 'rgba(250,248,245,0.6)', lineHeight: 1.5 }}>
            We'll send you a confirmation text shortly. See you at RELUXE!
          </p>

          {cartSummary && (
            <div style={{
              marginTop: 20, padding: '16px',
              borderRadius: 14, background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.1)',
              textAlign: 'left',
            }}>
              <p style={{ fontWeight: 600, color: colors.cream }}>{cartSummary.serviceName}</p>
              {cartSummary.staffName && <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.6)', marginTop: 4 }}>with {cartSummary.staffName}</p>}
              <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.6)', marginTop: 4 }}>
                {new Date(cartSummary.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {' at '}
                {new Date(cartSummary.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.6)', marginTop: 4 }}>
                {location?.label}
              </p>
            </div>
          )}

          <button
            onClick={() => window.location.href = '/beta'}
            style={{
              marginTop: 24,
              padding: '12px 32px',
              borderRadius: 12,
              border: '1.5px solid rgba(250,248,245,0.1)',
              background: 'transparent',
              color: colors.cream,
              fontFamily: fontPairings.bold.body,
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Explore RELUXE →
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
