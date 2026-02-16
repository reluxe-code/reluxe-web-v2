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
// - ✅ Captures attribution (full URL + UTMs + click IDs + referrer + first landing URL + device + fbc/fbp cookies)
// - ✅ Captures startedAt + durationSeconds + userAgent and includes in email

import Head from 'next/head'
import { useEffect, useMemo, useRef, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

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
    subtitle: 'Tap one. We’ll tell you what to book first.',
    options: [
      { id: 'wrinkles', label: 'Wrinkles / fine lines', emoji: '🙂' },
      { id: 'tone_texture', label: 'Sun damage / texture', emoji: '🌞' },
      { id: 'dull', label: 'Dull / tired skin', emoji: '✨' },
      { id: 'breakouts', label: 'Breakouts / congestion', emoji: '🫧' },
      { id: 'body', label: 'Body goals', emoji: '💪' },
      { id: 'not_sure', label: 'Not sure — tell me', emoji: '🤝' },
    ],
  },
  {
    id: 'q2_style',
    title: 'What’s your vibe?',
    subtitle: 'This helps us pick the best starting point.',
    options: [
      { id: 'easy', label: 'Easy + relaxing', emoji: '😌' },
      { id: 'visible', label: 'I want visible results', emoji: '🔥' },
      { id: 'low_commit', label: 'Low commitment', emoji: '🗓️' },
      { id: 'guided', label: 'I want a pro to guide me', emoji: '🧠' },
    ],
  },
  {
    id: 'q3_timing',
    title: 'When are you hoping to start?',
    subtitle: null,
    options: [
      { id: 'asap', label: 'As soon as possible', emoji: '🚀' },
      { id: 'weeks', label: 'In the next few weeks', emoji: '🗓️' },
      { id: 'exploring', label: 'I’m just exploring', emoji: '🔎' },
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
    blurb: 'The classic “reset.” Clean, calm, refreshed — perfect first facial.',
    routine: 'Routine: start here → then we build your plan.',
  },
  glo2: {
    key: 'glo2',
    name: 'Glo2Facial',
    price: '$250',
    image: '/images/quiz/services/glo2.jpg',
    blurb: 'Glow-forward and fun. Great when you want visible results without downtime.',
    routine: 'Routine: glow now → maintain with monthly facials.',
  },
  hydrafacial: {
    key: 'hydrafacial',
    name: 'HydraFacial',
    price: '$275',
    image: '/images/quiz/services/hydrafacial.jpg',
    blurb: 'Trusted, noticeable, and worth it — especially for texture + congestion.',
    routine: 'Routine: deep clean + hydrate → repeat as needed.',
  },
  jeuveau: {
    key: 'jeuveau',
    name: 'Jeuveau',
    price: '$380',
    image: '/images/quiz/services/jeuveau.jpg',
    blurb: 'A high-value “line softener” for common wrinkle areas (customized dosing).',
    routine: 'Routine: treat → reassess at 2 weeks → maintenance plan.',
  },
  daxxify: {
    key: 'daxxify',
    name: 'Daxxify',
    price: '$580',
    image: '/images/quiz/services/daxxify.jpg',
    blurb: 'Premium, longevity-minded tox for people who want fewer visits.',
    routine: 'Routine: premium longevity → fewer touchpoints.',
  },
  ipl_clearlift: {
    key: 'ipl_clearlift',
    name: 'IPL / ClearLift',
    price: 'Plan-based results',
    image: '/images/quiz/services/ipl-clearlift.jpg',
    blurb: 'Tone, sun damage, redness, and texture — the “skin reset” category.',
    routine: 'Routine: series-based plan → maintain with skincare/facials.',
  },
  vascupen: {
    key: 'vascupen',
    name: 'VascuPen',
    price: 'Targeted treatment',
    image: '/images/quiz/services/vascupen.jpg',
    blurb: 'Precision-focused help for small, stubborn concerns.',
    routine: 'Routine: targeted correction → optional follow-up.',
  },
  evolve_body: {
    key: 'evolve_body',
    name: 'Evolve Body',
    price: 'Plan-based results',
    image: '/images/quiz/services/evolve.jpg',
    blurb: 'Tone + smoothing + shape support — for body goals without major downtime.',
    routine: 'Routine: body plan + progress check-ins.',
  },
}

/** =========================
 * “PERSONA” OUTPUT (shorter, tighter)
 * ========================= */
function personaFromServiceKey(serviceKey) {
  const map = {
    monthly_facial: { emoji: '🗓️', title: 'Maintenance Mode', vibe: 'Easy consistency that actually sticks.' },
    signature_facial: { emoji: '✨', title: 'The Perfect Reset', vibe: 'The cleanest, safest place to start.' },
    glo2: { emoji: '🌟', title: 'Glow Seeker', vibe: 'You want visible results fast.' },
    hydrafacial: { emoji: '💧', title: 'Results-Driven', vibe: 'Reliable payoff. Worth it.' },
    jeuveau: { emoji: '🙂', title: 'Line Softener', vibe: 'Smoother is the goal.' },
    daxxify: { emoji: '⏳', title: 'Longevity Planner', vibe: 'Premium results, fewer visits.' },
    ipl_clearlift: { emoji: '🌞', title: 'Skin Resetter', vibe: 'Tone + texture + sun damage focus.' },
    vascupen: { emoji: '🎯', title: 'Detail Fixer', vibe: 'Targeted correction, not overkill.' },
    evolve_body: { emoji: '💪', title: 'Body Optimizer', vibe: 'Body goals with a plan.' },
  }
  return map[serviceKey] || { emoji: '✨', title: 'Your Best Start', vibe: 'Let’s keep it simple and effective.' }
}

/** =========================
 * Decision logic (now includes timing)
 * ========================= */
function computeServiceKey(answers) {
  const goal = answers.q1_goal
  const vibe = answers.q2_style
  const timing = answers.q3_timing

  // Not sure or wants guidance → best safe start
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
    <>
      <Head>
        <title>What Should I Book? — Quick Quiz | {BRAND}</title>
        <meta name="description" content="Not sure what to book? Tap through 3 quick questions and we’ll recommend your best first service." />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />

        {/* Social sharing */}
        <meta property="og:title" content={`What Should I Book? — Quick Quiz | ${BRAND}`} />
        <meta property="og:description" content="3 quick taps. One confident recommendation." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://reluxemedspa.com${PAGE_PATH}`} />
        <meta property="og:image" content="/images/quiz/service-quiz-og.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <HeaderTwo />

      {/* Compact hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.20),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="max-w-4xl text-white">
            <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
              {BRAND} • {LOCATION_TAGLINE}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Find your perfect first service
            </h1>
            <p className="mt-2 text-neutral-300 text-sm sm:text-base">
              Three quick taps. One confident recommendation. <span className="text-neutral-400">Finish and unlock {COUPON_COPY} (code {COUPON_CODE}).</span>
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-neutral-400">{progressLabel}</span>
              <button
                type="button"
                onClick={resetAll}
                className="text-xs font-semibold text-white/80 hover:text-white underline underline-offset-4"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="bg-neutral-50 py-6 sm:py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            {!showResults ? (
              <div className="p-5 sm:p-7">
                <p className="text-[11px] tracking-widest uppercase text-neutral-500">Quick Match Quiz</p>
                <h2 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
                  {current.title}
                </h2>
                {current.subtitle && <p className="mt-2 text-sm text-neutral-600">{current.subtitle}</p>}

                {/* Visual card grid */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {current.options.map((opt) => {
                    const selected = answers[current.id] === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => choose(current.id, opt.id)}
                        className={[
                          'w-full text-left rounded-2xl border p-4 transition shadow-sm',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                          selected ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300',
                        ].join(' ')}
                        aria-pressed={selected}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-lg">
                            {opt.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm sm:text-base font-extrabold text-neutral-900">{opt.label}</div>
                            <div className="mt-1 text-xs text-neutral-600">Tap to continue →</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (stepIndex === 0) return
                      setStepIndex((i) => Math.max(0, i - 1))
                      trackEvent('service_back', { session_id: sessionId, to_step: Math.max(1, stepIndex) })
                    }}
                    disabled={stepIndex === 0}
                    className={[
                      'rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition min-h-[44px]',
                      stepIndex === 0 ? 'ring-neutral-200 text-neutral-400 cursor-not-allowed' : 'ring-neutral-200 text-neutral-800 hover:bg-neutral-50',
                    ].join(' ')}
                  >
                    Back
                  </button>

                  <div className="text-xs text-neutral-500">
                    No forms yet. Just a match.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-7">
                <p className="text-[11px] tracking-widest uppercase text-neutral-500">Your match</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                  {persona.emoji} {persona.title}
                </h2>
                <p className="mt-2 text-neutral-700">{persona.vibe}</p>

                {/* Recommended service */}
                <div className="mt-6 rounded-3xl border border-neutral-200 overflow-hidden">
                  <div className="grid sm:grid-cols-12">
                    <div className="sm:col-span-5 bg-neutral-100">
                      <img
                        src={service?.image}
                        alt={service?.name}
                        className="w-full h-full object-cover aspect-[4/3] sm:aspect-auto"
                        loading="eager"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>

                    <div className="sm:col-span-7 p-5 sm:p-6 bg-white">
                      <p className="text-[11px] tracking-widest uppercase text-neutral-500">Best service to start with</p>
                      <h3 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
                        {service?.name}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600">{service?.price}</p>
                      <p className="mt-3 text-neutral-700">{service?.blurb}</p>

                      {/* Two buttons, one CTA area */}
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <a
                          href={bookServiceHref}
                          onClick={() => trackEvent('service_book_click', { session_id: sessionId, service: service?.key })}
                          className="rounded-2xl px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900 transition min-h-[48px] inline-flex items-center justify-center gap-2"
                        >
                          Book {service?.name} <Arrow />
                        </a>

                        <a
                          href={consultHref}
                          onClick={() => trackEvent('service_getting_started_click', { session_id: sessionId })}
                          className="rounded-2xl px-6 py-3 text-sm font-semibold ring-1 ring-neutral-200 text-neutral-900 hover:bg-neutral-50 transition min-h-[48px] inline-flex items-center justify-center"
                        >
                          Getting Started with RELUXE
                        </a>
                      </div>

                      {/* Credit code display */}
                      <div className="mt-4 rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
                        <p className="text-sm font-semibold text-neutral-900">Your {COUPON_COPY}</p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-neutral-200">
                          <span className="text-xs text-neutral-500">Use code</span>
                          <span className="text-sm font-extrabold tracking-widest">{COUPON_CODE}</span>
                        </div>
                        <p className="mt-2 text-[11px] text-neutral-500">
                          Apply at booking/checkout. One per new client. Terms may apply.
                        </p>
                      </div>

                      <p className="mt-3 text-[11px] text-neutral-500">
                        Completion emailed to the team: {completionSent ? '✅' : 'sending…'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lead capture AFTER value */}
                {!leadCaptured && (
                  <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
                    <h4 className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">
                      Want to save your plan + routine + {COUPON_COPY}?
                    </h4>
                    <p className="mt-2 text-sm text-neutral-600">
                      We’ll send your recommendation + routine + code <strong>{COUPON_CODE}</strong>.
                    </p>

                    <div className="mt-4 grid sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLeadChannel('email')}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${leadChannel === 'email' ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 hover:bg-white'}`}
                      >
                        <p className="font-extrabold text-neutral-900">✉️ Email me</p>
                        <p className="text-xs text-neutral-600 mt-1">Save it in your inbox.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLeadChannel('sms')}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${leadChannel === 'sms' ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 hover:bg-white'}`}
                      >
                        <p className="font-extrabold text-neutral-900">📲 Text me</p>
                        <p className="text-xs text-neutral-600 mt-1">Fastest way to keep the code handy.</p>
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <div>
                        <label className="text-sm font-semibold text-neutral-900">First name (optional)</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Your name"
                        />
                      </div>

                      {leadChannel === 'email' && (
                        <div>
                          <label className="text-sm font-semibold text-neutral-900">Email</label>
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="you@email.com"
                            inputMode="email"
                            autoComplete="email"
                          />
                        </div>
                      )}

                      {leadChannel === 'sms' && (
                        <>
                          <div>
                            <label className="text-sm font-semibold text-neutral-900">Mobile number</label>
                            <input
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="317-555-1234"
                              inputMode="tel"
                              autoComplete="tel"
                            />
                          </div>

                          <label className="flex items-start gap-2 text-xs text-neutral-600">
                            <input
                              type="checkbox"
                              checked={smsConsent}
                              onChange={(e) => setSmsConsent(e.target.checked)}
                              className="mt-0.5 h-4 w-4 rounded border-neutral-300"
                            />
                            <span>
                              Yes — text me my plan + {COUPON_COPY}. Msg &amp; data rates may apply. Reply STOP to opt out.
                            </span>
                          </label>
                        </>
                      )}

                      {leadStatus === 'error' && (
                        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
                          Please pick SMS or email and fill required fields (and consent for SMS).
                        </div>
                      )}
                      {leadStatus === 'ok' && (
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900">
                          ✅ Saved. Thank you!
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={submitLead}
                        disabled={sendingLead}
                        className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white transition min-h-[48px] inline-flex items-center justify-center gap-2 ${
                          sendingLead
                            ? 'bg-neutral-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900'
                        }`}
                      >
                        {sendingLead ? 'Sending…' : 'Send my plan + code'} <Arrow />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLeadCaptured(true)
                          trackEvent('service_lead_skip', { session_id: sessionId })
                        }}
                        className="text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-700 text-left"
                      >
                        No thanks
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={resetAll}
                    className="w-full rounded-2xl px-6 py-3 text-sm font-semibold ring-1 ring-neutral-200 hover:bg-neutral-50 transition"
                  >
                    Retake quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function Arrow() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}
