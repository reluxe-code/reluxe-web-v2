// src/pages/landing/service-quiz.js
// RELUXE • Service Match Quiz (FAST VERSION)
// Changes implemented:
// - Quiz is now 3 questions (fast + decisive)
// - Auto-advance on tap (no Next button)
// - More visual answer cards
// - NO lead capture before results (removed friction)
// - Lead capture only AFTER results (save plan + routine + $25 off code QUIZ)
// - Two CTA buttons: Book recommended service OR Getting Started with RELUXE
// - Always emails completion to hello@reluxemedspa.com via /api/quiz-service-results
// - Captures attribution (full URL + UTMs + click IDs + referrer + first landing URL + device + fbc/fbp cookies)
// - Captures startedAt + durationSeconds + userAgent and includes in email

import { useEffect, useMemo, useRef, useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

/** =========================
 * EDIT THESE CONSTANTS
 * ========================= */
const PAGE_PATH = '/landing/service-quiz'
const BRAND = 'RELUXE Med Spa'
const LOCATION_TAGLINE = 'Carmel & Westfield, IN'

const COUPON_CODE = 'QUIZ'
const COUPON_VALUE = '$25'
const COUPON_COPY = `${COUPON_VALUE} off your first service`

// Booking links (your real routes)
const BOOK_LINKS = {
  monthly_facial: '/book/facials',
  signature_facial: '/book/signature-facial',
  glo2: '/book/glo2facial',
  hydrafacial: '/book/hydrafacial',
  jeuveau: '/book/tox',
  daxxify: '/book/tox',
  ipl_clearlift: '/book/ipl',
  vascupen: '/book/vascupen',
  evolve_body: '/book/body-contouring',

  // guided consult (secondary button)
  getting_started: '/book/consult', // keep your existing route
}

const QUIZ_NOTIFY_TO = 'hello@reluxemedspa.com'

/** ======================================================
 * Tracking helper: Meta Pixel (fbq) + GA4 (gtag) + dataLayer
 * ====================================================== */
function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  const payload = {
    ...params,
    page_path: window.location?.pathname || '',
    page_url: window.location?.href || '',
    ts: Date.now(),
  }

  if (typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, payload)
    } catch (_) {}
  }
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, payload)
    } catch (_) {}
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...payload })
  }
}

/** =========================
 * Utils
 * ========================= */
function makeSessionId() {
  return `svc_${Date.now()}_${Math.random().toString(16).slice(2)}`
}
function safeTrim(v) {
  return String(v || '').trim()
}
function normalizePhoneDigits(v) {
  const digits = String(v || '').replace(/[^\d]/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}
function isValidEmail(v) {
  const s = safeTrim(v)
  if (!s) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}
function isValidPhone(v) {
  const d = normalizePhoneDigits(v)
  return d.length === 10
}

/** =========================
 * Attribution (URL/UTM/click IDs)
 * ========================= */
function readCookie(name) {
  if (typeof document === 'undefined') return ''
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : ''
}

function getAttributionPayload() {
  if (typeof window === 'undefined') return {}

  const url = window.location.href
  const u = new URL(url)
  const qp = u.searchParams
  const pick = (k) => qp.get(k) || ''

  // Persist first landing URL for this session
  const firstKey = 'reluxe_first_landing_url'
  let firstLandingUrl = ''
  try {
    firstLandingUrl = sessionStorage.getItem(firstKey) || url
    if (!sessionStorage.getItem(firstKey)) sessionStorage.setItem(firstKey, url)
  } catch (_) {
    firstLandingUrl = url
  }

  return {
    url,
    path: window.location.pathname,
    query: u.search,
    firstLandingUrl,
    referrer: document.referrer || '',
    utm: {
      source: pick('utm_source'),
      medium: pick('utm_medium'),
      campaign: pick('utm_campaign'),
      content: pick('utm_content'),
      term: pick('utm_term'),
    },
    clickIds: {
      fbclid: pick('fbclid'),
      gclid: pick('gclid'),
      wbraid: pick('wbraid'),
      gbraid: pick('gbraid'),
      ttclid: pick('ttclid'),
    },
    cookies: {
      fbc: readCookie('_fbc'),
      fbp: readCookie('_fbp'),
    },
    device: {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      language: navigator.language || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    },
  }
}

async function postQuiz(payload) {
  const res = await fetch('/api/quiz-service-results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(txt || 'Failed')
  }
  return res.json().catch(() => ({}))
}

/** =========================
 * FAST QUIZ QUESTIONS (3)
 * ========================= */
const QUESTIONS = [
  {
    id: 'q1_goal',
    title: 'What are you here for?',
    subtitle: 'Tap one. We\u2019ll tell you what to book first.',
    options: [
      { id: 'wrinkles', label: 'Wrinkles / fine lines', emoji: '\ud83d\ude42' },
      { id: 'tone_texture', label: 'Sun damage / texture', emoji: '\ud83c\udf1e' },
      { id: 'dull', label: 'Dull / tired skin', emoji: '\u2728' },
      { id: 'breakouts', label: 'Breakouts / congestion', emoji: '\ud83e\udee7' },
      { id: 'body', label: 'Body goals', emoji: '\ud83d\udcaa' },
      { id: 'not_sure', label: 'Not sure \u2014 tell me', emoji: '\ud83e\udd1d' },
    ],
  },
  {
    id: 'q2_style',
    title: 'What\u2019s your vibe?',
    subtitle: 'This helps us pick the best starting point.',
    options: [
      { id: 'easy', label: 'Easy + relaxing', emoji: '\ud83d\ude0c' },
      { id: 'visible', label: 'I want visible results', emoji: '\ud83d\udd25' },
      { id: 'low_commit', label: 'Low commitment', emoji: '\ud83d\uddd3\ufe0f' },
      { id: 'guided', label: 'I want a pro to guide me', emoji: '\ud83e\udde0' },
    ],
  },
  {
    id: 'q3_timing',
    title: 'When are you hoping to start?',
    subtitle: null,
    options: [
      { id: 'asap', label: 'As soon as possible', emoji: '\ud83d\ude80' },
      { id: 'weeks', label: 'In the next few weeks', emoji: '\ud83d\uddd3\ufe0f' },
      { id: 'exploring', label: 'I\u2019m just exploring', emoji: '\ud83d\udd0e' },
    ],
  },
]

/** =========================
 * SERVICES (recommendations)
 * ========================= */
const SERVICES = {
  monthly_facial: {
    key: 'monthly_facial',
    name: '$99 Monthly Facial',
    price: '$99/mo',
    image: '/images/quiz/services/monthly-facial.jpg',
    blurb: 'Low-commitment consistency. Great for maintenance and momentum.',
    routine: 'Routine: monthly maintenance + simple home routine.',
  },
  signature_facial: {
    key: 'signature_facial',
    name: 'Signature Facial',
    price: '$150',
    image: '/images/quiz/services/signature-facial.jpg',
    blurb: 'The classic \u201creset.\u201d Clean, calm, refreshed \u2014 perfect first facial.',
    routine: 'Routine: start here \u2192 then we build your plan.',
  },
  glo2: {
    key: 'glo2',
    name: 'Glo2Facial',
    price: '$250',
    image: '/images/quiz/services/glo2.jpg',
    blurb: 'Glow-forward and fun. Great when you want visible results without downtime.',
    routine: 'Routine: glow now \u2192 maintain with monthly facials.',
  },
  hydrafacial: {
    key: 'hydrafacial',
    name: 'HydraFacial',
    price: '$275',
    image: '/images/quiz/services/hydrafacial.jpg',
    blurb: 'Trusted, noticeable, and worth it \u2014 especially for texture + congestion.',
    routine: 'Routine: deep clean + hydrate \u2192 repeat as needed.',
  },
  jeuveau: {
    key: 'jeuveau',
    name: 'Jeuveau',
    price: '$380',
    image: '/images/quiz/services/jeuveau.jpg',
    blurb: 'A high-value \u201cline softener\u201d for common wrinkle areas (customized dosing).',
    routine: 'Routine: treat \u2192 reassess at 2 weeks \u2192 maintenance plan.',
  },
  daxxify: {
    key: 'daxxify',
    name: 'Daxxify',
    price: '$580',
    image: '/images/quiz/services/daxxify.jpg',
    blurb: 'Premium, longevity-minded tox for people who want fewer visits.',
    routine: 'Routine: premium longevity \u2192 fewer touchpoints.',
  },
  ipl_clearlift: {
    key: 'ipl_clearlift',
    name: 'IPL / ClearLift',
    price: 'Plan-based results',
    image: '/images/quiz/services/ipl-clearlift.jpg',
    blurb: 'Tone, sun damage, redness, and texture \u2014 the \u201cskin reset\u201d category.',
    routine: 'Routine: series-based plan \u2192 maintain with skincare/facials.',
  },
  vascupen: {
    key: 'vascupen',
    name: 'VascuPen',
    price: 'Targeted treatment',
    image: '/images/quiz/services/vascupen.jpg',
    blurb: 'Precision-focused help for small, stubborn concerns.',
    routine: 'Routine: targeted correction \u2192 optional follow-up.',
  },
  evolve_body: {
    key: 'evolve_body',
    name: 'Evolve Body',
    price: 'Plan-based results',
    image: '/images/quiz/services/evolve.jpg',
    blurb: 'Tone + smoothing + shape support \u2014 for body goals without major downtime.',
    routine: 'Routine: body plan + progress check-ins.',
  },
}

/** =========================
 * "PERSONA" OUTPUT (shorter, tighter)
 * ========================= */
function personaFromServiceKey(serviceKey) {
  const map = {
    monthly_facial: { emoji: '\ud83d\uddd3\ufe0f', title: 'Maintenance Mode', vibe: 'Easy consistency that actually sticks.' },
    signature_facial: { emoji: '\u2728', title: 'The Perfect Reset', vibe: 'The cleanest, safest place to start.' },
    glo2: { emoji: '\ud83c\udf1f', title: 'Glow Seeker', vibe: 'You want visible results fast.' },
    hydrafacial: { emoji: '\ud83d\udca7', title: 'Results-Driven', vibe: 'Reliable payoff. Worth it.' },
    jeuveau: { emoji: '\ud83d\ude42', title: 'Line Softener', vibe: 'Smoother is the goal.' },
    daxxify: { emoji: '\u23f3', title: 'Longevity Planner', vibe: 'Premium results, fewer visits.' },
    ipl_clearlift: { emoji: '\ud83c\udf1e', title: 'Skin Resetter', vibe: 'Tone + texture + sun damage focus.' },
    vascupen: { emoji: '\ud83c\udfaf', title: 'Detail Fixer', vibe: 'Targeted correction, not overkill.' },
    evolve_body: { emoji: '\ud83d\udcaa', title: 'Body Optimizer', vibe: 'Body goals with a plan.' },
  }
  return map[serviceKey] || { emoji: '\u2728', title: 'Your Best Start', vibe: 'Let\u2019s keep it simple and effective.' }
}

/** =========================
 * Decision logic (now includes timing)
 * ========================= */
function computeServiceKey(answers) {
  const goal = answers.q1_goal
  const vibe = answers.q2_style
  const timing = answers.q3_timing

  // Not sure or wants guidance -> best safe start
  if (goal === 'not_sure' || vibe === 'guided') return 'signature_facial'

  if (goal === 'body') return 'evolve_body'

  if (goal === 'wrinkles') {
    // ASAP + visible -> daxxify; exploring/low-commit -> jeuveau
    if (vibe === 'visible' && timing === 'asap') return 'daxxify'
    if (vibe === 'visible') return 'daxxify'
    return 'jeuveau'
  }

  if (goal === 'tone_texture') {
    // exploring -> hydrafacial first; visible -> device
    if (timing === 'exploring') return 'hydrafacial'
    if (vibe === 'visible') return 'ipl_clearlift'
    return 'hydrafacial'
  }

  if (goal === 'breakouts') {
    // low-commit -> monthly; otherwise hydrafacial
    if (vibe === 'low_commit') return 'monthly_facial'
    return 'hydrafacial'
  }

  if (goal === 'dull') {
    // visible -> glo2, low-commit -> monthly, easy -> signature
    if (vibe === 'visible') return 'glo2'
    if (vibe === 'low_commit') return 'monthly_facial'
    return 'signature_facial'
  }

  return 'signature_facial'
}

export default function ServiceQuizPage() {
  const [sessionId] = useState(() => makeSessionId())

  const startedAtRef = useRef(null)
  const attributionRef = useRef(null)
  const completionSentRef = useRef(false)

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  // Lead capture (ONLY after results)
  const [leadChannel, setLeadChannel] = useState(null) // 'sms' | 'email' | null
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)

  const [leadCaptured, setLeadCaptured] = useState(false)
  const [leadStatus, setLeadStatus] = useState(null) // 'ok' | 'error' | null
  const [sendingLead, setSendingLead] = useState(false)

  // Completion email (always)
  const [completionSent, setCompletionSent] = useState(false)

  const totalSteps = QUESTIONS.length
  const current = QUESTIONS[stepIndex]

  const serviceKey = useMemo(() => computeServiceKey(answers), [answers])
  const service = useMemo(() => SERVICES[serviceKey] || SERVICES.signature_facial, [serviceKey])
  const persona = useMemo(() => personaFromServiceKey(serviceKey), [serviceKey])

  function durationSecondsSinceStart(endIso) {
    try {
      const startIso = startedAtRef.current
      if (!startIso) return null
      const a = new Date(startIso).getTime()
      const b = new Date(endIso).getTime()
      if (!Number.isFinite(a) || !Number.isFinite(b)) return null
      return Math.max(0, Math.round((b - a) / 1000))
    } catch {
      return null
    }
  }

  // page view
  useEffect(() => {
    if (!startedAtRef.current) startedAtRef.current = new Date().toISOString()
    if (!attributionRef.current) attributionRef.current = getAttributionPayload()

    trackEvent('service_quiz_view', { session_id: sessionId })
    trackEvent('service_quiz_start', { session_id: sessionId })
  }, [sessionId])

  // step view
  useEffect(() => {
    if (showResults) return
    trackEvent('service_question_view', { session_id: sessionId, qid: current?.id, step: stepIndex + 1 })
  }, [showResults, stepIndex, current?.id, sessionId])

  async function sendCompletionOnce() {
    if (completionSentRef.current) return
    completionSentRef.current = true

    const completedAtIso = new Date().toISOString()
    const durationSeconds = durationSecondsSinceStart(completedAtIso)

    try {
      await postQuiz({
        type: 'service_quiz_complete',
        toEmail: QUIZ_NOTIFY_TO,
        page: PAGE_PATH,
        sessionId,
        completed_at: completedAtIso,

        startedAt: startedAtRef.current,
        durationSeconds,
        attribution: attributionRef.current,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',

        persona: persona?.title,
        personaTitle: persona?.title,
        recommendedService: service?.name,
        recommendedServiceKey: service?.key,
        coupon: { code: COUPON_CODE, value: COUPON_VALUE },
        answers,
        lead: {
          captured: false,
          source: 'none',
          channel: null,
          name: null,
          email: null,
          phone: null,
          smsConsent: false,
        },
      })
      setCompletionSent(true)
      trackEvent('service_completion_email_ok', { session_id: sessionId })
    } catch (e) {
      trackEvent('service_completion_email_error', { session_id: sessionId, message: String(e?.message || e) })
    }
  }

  async function goToResults() {
    setShowResults(true)
    trackEvent('service_results_view', { session_id: sessionId, service: service?.key })
    await sendCompletionOnce()
  }

  // AUTO-ADVANCE: when user selects an option, advance automatically
  function choose(qid, optionId) {
    setAnswers((prev) => ({ ...prev, [qid]: optionId }))

    trackEvent('service_answer_select', { session_id: sessionId, qid, value: optionId, step: stepIndex + 1 })

    setTimeout(async () => {
      if (stepIndex >= totalSteps - 1) {
        await goToResults()
      } else {
        setStepIndex((i) => Math.min(totalSteps - 1, i + 1))
        trackEvent('service_next_auto', { session_id: sessionId, from_step: stepIndex + 1, to_step: stepIndex + 2 })
      }
    }, 180)
  }

  function resetAll() {
    setStepIndex(0)
    setAnswers({})
    setShowResults(false)

    setLeadChannel(null)
    setName('')
    setEmail('')
    setPhone('')
    setSmsConsent(false)
    setLeadCaptured(false)
    setLeadStatus(null)
    setSendingLead(false)

    setCompletionSent(false)
    completionSentRef.current = false

    // reset timing + attribution for a clean run
    startedAtRef.current = new Date().toISOString()
    attributionRef.current = getAttributionPayload()

    trackEvent('service_restart', { session_id: sessionId })
  }

  async function submitLead() {
    setLeadStatus(null)

    const nm = safeTrim(name) || null
    const em = safeTrim(email) || null
    const ph = normalizePhoneDigits(phone) || null

    if (!leadChannel) { setLeadStatus('error'); return }
    if (leadChannel === 'email' && (!em || !isValidEmail(em))) { setLeadStatus('error'); return }
    if (leadChannel === 'sms' && (!ph || !isValidPhone(ph) || !smsConsent)) { setLeadStatus('error'); return }

    setSendingLead(true)
    trackEvent('service_lead_submit', { session_id: sessionId, channel: leadChannel })

    const submittedIso = new Date().toISOString()
    const durationSeconds = durationSecondsSinceStart(submittedIso)

    try {
      await postQuiz({
        type: 'service_quiz_lead',
        toEmail: QUIZ_NOTIFY_TO,
        page: PAGE_PATH,
        sessionId,
        submitted_at: submittedIso,

        startedAt: startedAtRef.current,
        durationSeconds,
        attribution: attributionRef.current,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',

        persona: persona?.title,
        personaTitle: persona?.title,
        recommendedService: service?.name,
        recommendedServiceKey: service?.key,
        coupon: { code: COUPON_CODE, value: COUPON_VALUE },
        answers,
        lead: {
          captured: true,
          source: 'results_inline',
          channel: leadChannel,
          name: nm,
          email: leadChannel === 'email' ? em : null,
          phone: leadChannel === 'sms' ? ph : null,
          smsConsent: Boolean(smsConsent),
        },
      })

      setLeadCaptured(true)
      setLeadStatus('ok')
      trackEvent('service_lead_submit_ok', { session_id: sessionId, channel: leadChannel })

      await sendCompletionOnce()
    } catch (e) {
      setLeadStatus('error')
      trackEvent('service_lead_submit_error', { session_id: sessionId, message: String(e?.message || e) })
    } finally {
      setSendingLead(false)
    }
  }

  const progressLabel = showResults ? 'Results' : `Question ${stepIndex + 1}/${totalSteps}`
  const bookServiceHref = BOOK_LINKS[service?.key] || '/book'
  const consultHref = BOOK_LINKS.getting_started || '/book/getting-started'

  return (
    <BetaLayout
      title={`What Should I Book? \u2014 Quick Quiz | ${BRAND}`}
      description="Not sure what to book? Tap through 3 quick questions and we'll recommend your best first service."
      canonical={`https://reluxemedspa.com${PAGE_PATH}`}
    >
      {/* Compact hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(16,185,129,0.15), transparent 60%)`,
        }}
      >
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
          <div style={{ maxWidth: '56rem' }}>
            <p style={{
              fontFamily: fonts.body,
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: colors.muted,
            }}>
              {BRAND} &middot; {LOCATION_TAGLINE}
            </p>
            <h1 style={{
              marginTop: '0.25rem',
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.white,
            }}>
              Find your{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                perfect first service
              </span>
            </h1>
            <p style={{
              marginTop: '0.5rem',
              fontFamily: fonts.body,
              fontSize: '0.9375rem',
              color: 'rgba(250,248,245,0.6)',
            }}>
              Three quick taps. One confident recommendation. <span style={{ color: colors.muted }}>Finish and unlock {COUPON_COPY} (code {COUPON_CODE}).</span>
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>{progressLabel}</span>
              <button
                type="button"
                onClick={resetAll}
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'rgba(250,248,245,0.7)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section style={{ backgroundColor: colors.cream, padding: '1.5rem 0 2rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            borderRadius: '1.5rem',
            border: `1px solid ${colors.stone}`,
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            {!showResults ? (
              <div style={{ padding: '1.5rem' }}>
                <p style={{
                  fontFamily: fonts.body,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: colors.muted,
                }}>
                  Quick Match Quiz
                </p>
                <h2 style={{
                  marginTop: '0.5rem',
                  fontFamily: fonts.display,
                  fontSize: typeScale.subhead.size,
                  fontWeight: typeScale.subhead.weight,
                  lineHeight: typeScale.subhead.lineHeight,
                  color: colors.heading,
                }}>
                  {current.title}
                </h2>
                {current.subtitle && <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{current.subtitle}</p>}

                {/* Visual card grid */}
                <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))' }}>
                  {current.options.map((opt) => {
                    const selected = answers[current.id] === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => choose(current.id, opt.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          borderRadius: '1rem',
                          border: selected ? `2px solid ${colors.violet}` : `1px solid ${colors.stone}`,
                          backgroundColor: selected ? `${colors.violet}08` : '#fff',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s, background-color 0.15s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                        aria-pressed={selected}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <div style={{
                            height: '2.5rem',
                            width: '2.5rem',
                            borderRadius: '1rem',
                            backgroundColor: colors.ink,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.125rem',
                            flexShrink: 0,
                          }}>
                            {opt.emoji}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: '0.9375rem', color: colors.heading }}>{opt.label}</div>
                            <div style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>Tap to continue &rarr;</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (stepIndex === 0) return
                      setStepIndex((i) => Math.max(0, i - 1))
                      trackEvent('service_back', { session_id: sessionId, to_step: Math.max(1, stepIndex) })
                    }}
                    disabled={stepIndex === 0}
                    style={{
                      borderRadius: '9999px',
                      padding: '0.75rem 1rem',
                      fontFamily: fonts.body,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      border: `1px solid ${colors.stone}`,
                      backgroundColor: '#fff',
                      color: stepIndex === 0 ? colors.muted : colors.heading,
                      cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
                      minHeight: '2.75rem',
                    }}
                  >
                    Back
                  </button>
                  <div style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>
                    No forms yet. Just a match.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1.5rem' }}>
                <p style={{
                  fontFamily: fonts.body,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: colors.muted,
                }}>
                  Your match
                </p>
                <h2 style={{
                  marginTop: '0.5rem',
                  fontFamily: fonts.display,
                  fontSize: typeScale.sectionHeading.size,
                  fontWeight: typeScale.sectionHeading.weight,
                  lineHeight: typeScale.sectionHeading.lineHeight,
                  color: colors.heading,
                }}>
                  {persona.emoji} {persona.title}
                </h2>
                <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, color: colors.body }}>{persona.vibe}</p>

                {/* Recommended service */}
                <div style={{
                  marginTop: '1.5rem',
                  borderRadius: '1.5rem',
                  border: `1px solid ${colors.stone}`,
                  overflow: 'hidden',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))' }}>
                    <div style={{ backgroundColor: colors.cream }}>
                      <img
                        src={service?.image}
                        alt={service?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '4/3', display: 'block' }}
                        loading="eager"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>

                    <div style={{ padding: '1.5rem', backgroundColor: '#fff' }}>
                      <p style={{
                        fontFamily: fonts.body,
                        fontSize: '0.6875rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: colors.muted,
                      }}>
                        Best service to start with
                      </p>
                      <h3 style={{
                        marginTop: '0.5rem',
                        fontFamily: fonts.display,
                        fontSize: typeScale.subhead.size,
                        fontWeight: typeScale.subhead.weight,
                        color: colors.heading,
                      }}>
                        {service?.name}
                      </h3>
                      <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>{service?.price}</p>
                      <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>{service?.blurb}</p>

                      {/* Two buttons, one CTA area */}
                      <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))' }}>
                        <a
                          href={bookServiceHref}
                          onClick={() => trackEvent('service_book_click', { session_id: sessionId, service: service?.key })}
                          style={{
                            borderRadius: '9999px',
                            padding: '0.75rem 1.5rem',
                            fontFamily: fonts.body,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#fff',
                            background: gradients.primary,
                            textDecoration: 'none',
                            minHeight: '3rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          Book {service?.name} <Arrow />
                        </a>

                        <a
                          href={consultHref}
                          onClick={() => trackEvent('service_getting_started_click', { session_id: sessionId })}
                          style={{
                            borderRadius: '9999px',
                            padding: '0.75rem 1.5rem',
                            fontFamily: fonts.body,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            border: `1px solid ${colors.stone}`,
                            color: colors.heading,
                            textDecoration: 'none',
                            minHeight: '3rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                          }}
                        >
                          Getting Started with RELUXE
                        </a>
                      </div>

                      {/* Credit code display */}
                      <div style={{
                        marginTop: '1rem',
                        borderRadius: '1rem',
                        backgroundColor: colors.cream,
                        border: `1px solid ${colors.stone}`,
                        padding: '1rem',
                      }}>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>Your {COUPON_COPY}</p>
                        <div style={{
                          marginTop: '0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          borderRadius: '0.75rem',
                          backgroundColor: '#fff',
                          padding: '0.5rem 0.75rem',
                          border: `1px solid ${colors.stone}`,
                        }}>
                          <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>Use code</span>
                          <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.12em' }}>{COUPON_CODE}</span>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
                          Apply at booking/checkout. One per new client. Terms may apply.
                        </p>
                      </div>

                      <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
                        Completion emailed to the team: {completionSent ? 'sent' : 'sending\u2026'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lead capture AFTER value */}
                {!leadCaptured && (
                  <div style={{
                    marginTop: '1.5rem',
                    borderRadius: '1.5rem',
                    border: `1px solid ${colors.stone}`,
                    backgroundColor: colors.cream,
                    padding: '1.5rem',
                  }}>
                    <h4 style={{
                      fontFamily: fonts.display,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: colors.heading,
                    }}>
                      Want to save your plan + routine + {COUPON_COPY}?
                    </h4>
                    <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>
                      We'll send your recommendation + routine + code <strong>{COUPON_CODE}</strong>.
                    </p>

                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setLeadChannel('email')}
                        style={{
                          borderRadius: '1rem',
                          border: leadChannel === 'email' ? `2px solid ${colors.violet}` : `1px solid ${colors.stone}`,
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          backgroundColor: leadChannel === 'email' ? `${colors.violet}08` : '#fff',
                        }}
                      >
                        <p style={{ fontFamily: fonts.body, fontWeight: 700, color: colors.heading }}>Email me</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body, marginTop: '0.25rem' }}>Save it in your inbox.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLeadChannel('sms')}
                        style={{
                          borderRadius: '1rem',
                          border: leadChannel === 'sms' ? `2px solid ${colors.violet}` : `1px solid ${colors.stone}`,
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          backgroundColor: leadChannel === 'sms' ? `${colors.violet}08` : '#fff',
                        }}
                      >
                        <p style={{ fontFamily: fonts.body, fontWeight: 700, color: colors.heading }}>Text me</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body, marginTop: '0.25rem' }}>Fastest way to keep the code handy.</p>
                      </button>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>First name (optional)</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          style={{
                            marginTop: '0.25rem',
                            width: '100%',
                            borderRadius: '9999px',
                            border: `1px solid ${colors.stone}`,
                            padding: '0.75rem 1rem',
                            fontFamily: fonts.body,
                            fontSize: '0.875rem',
                            outline: 'none',
                          }}
                          placeholder="Your name"
                        />
                      </div>

                      {leadChannel === 'email' && (
                        <div>
                          <label style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>Email</label>
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                              marginTop: '0.25rem',
                              width: '100%',
                              borderRadius: '9999px',
                              border: `1px solid ${colors.stone}`,
                              padding: '0.75rem 1rem',
                              fontFamily: fonts.body,
                              fontSize: '0.875rem',
                              outline: 'none',
                            }}
                            placeholder="you@email.com"
                            inputMode="email"
                            autoComplete="email"
                          />
                        </div>
                      )}

                      {leadChannel === 'sms' && (
                        <>
                          <div>
                            <label style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>Mobile number</label>
                            <input
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              style={{
                                marginTop: '0.25rem',
                                width: '100%',
                                borderRadius: '9999px',
                                border: `1px solid ${colors.stone}`,
                                padding: '0.75rem 1rem',
                                fontFamily: fonts.body,
                                fontSize: '0.875rem',
                                outline: 'none',
                              }}
                              placeholder="317-555-1234"
                              inputMode="tel"
                              autoComplete="tel"
                            />
                          </div>

                          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body }}>
                            <input
                              type="checkbox"
                              checked={smsConsent}
                              onChange={(e) => setSmsConsent(e.target.checked)}
                              style={{ marginTop: '0.125rem', height: '1rem', width: '1rem' }}
                            />
                            <span>
                              Yes &mdash; text me my plan + {COUPON_COPY}. Msg &amp; data rates may apply. Reply STOP to opt out.
                            </span>
                          </label>
                        </>
                      )}

                      {leadStatus === 'error' && (
                        <div style={{
                          borderRadius: '1rem',
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          padding: '0.75rem',
                          fontFamily: fonts.body,
                          fontSize: '0.875rem',
                          color: '#991b1b',
                        }}>
                          Please pick SMS or email and fill required fields (and consent for SMS).
                        </div>
                      )}
                      {leadStatus === 'ok' && (
                        <div style={{
                          borderRadius: '1rem',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '0.75rem',
                          fontFamily: fonts.body,
                          fontSize: '0.875rem',
                          color: '#065f46',
                        }}>
                          Saved. Thank you!
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={submitLead}
                        disabled={sendingLead}
                        style={{
                          borderRadius: '9999px',
                          padding: '0.75rem 1.5rem',
                          fontFamily: fonts.body,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#fff',
                          background: sendingLead ? colors.muted : gradients.primary,
                          border: 'none',
                          cursor: sendingLead ? 'not-allowed' : 'pointer',
                          minHeight: '3rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {sendingLead ? 'Sending\u2026' : 'Send my plan + code'} <Arrow />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLeadCaptured(true)
                          trackEvent('service_lead_skip', { session_id: sessionId })
                        }}
                        style={{
                          fontFamily: fonts.body,
                          fontSize: '0.75rem',
                          color: colors.muted,
                          textDecoration: 'underline',
                          textUnderlineOffset: '4px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        No thanks
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={resetAll}
                    style={{
                      width: '100%',
                      borderRadius: '9999px',
                      padding: '0.75rem 1.5rem',
                      fontFamily: fonts.body,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      border: `1px solid ${colors.stone}`,
                      backgroundColor: '#fff',
                      color: colors.heading,
                      cursor: 'pointer',
                    }}
                  >
                    Retake quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

ServiceQuizPage.getLayout = (page) => page

function Arrow() {
  return (
    <svg style={{ height: '1rem', width: '1rem' }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}
