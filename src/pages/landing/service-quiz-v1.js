// src/pages/landing/service-quiz.js
// RELUXE • Service Match Quiz (Phase 1)
// Updates:
// - Never “consult-only” result; always recommend a best first service
// - CTA area has TWO buttons (one section): Book service OR Getting Started with RELUXE (consult)
// - Lead capture upgraded: send plan + routine + $25 credit (code QUIZ) via SMS/Email
// - Optional lead step + inline lead under results (only if skipped)
// - Posts completion + lead to /api/quiz-service-results (server-only)

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

// Booking links (update to your exact routes)
const BOOK_LINKS = {
  // recommended services
  monthly_facial: '/book/facials',
  signature_facial: '/book/signature-facial',
  glo2: '/book/glo2facial',
  hydrafacial: '/book/hydrafacial',
  jeuveau: '/book/tox',
  daxxify: '/book/tox',
  ipl_clearlift: '/book/ipl',
  vascupen: '/book/vascupen',
  evolve_body: '/book/body-contouring',

  // consult (always available as secondary button)
  getting_started: '/book/consult', // <-- UPDATE to your real route
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
    try { window.fbq('trackCustom', eventName, payload) } catch (_) {}
  }
  if (typeof window.gtag === 'function') {
    try { window.gtag('event', eventName, payload) } catch (_) {}
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
function safeTrim(v) { return String(v || '').trim() }
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
 * QUESTIONS (Phase 1)
 * ========================= */
const QUESTIONS = [
  {
    id: 'q1_goal',
    title: 'What’s your main goal right now?',
    subtitle: 'What are you hoping to improve most?',
    options: [
      { id: 'wrinkles', label: 'Fine lines or wrinkles' },
      { id: 'tone_texture', label: 'Texture, tone, or sun damage' },
      { id: 'breakouts', label: 'Breakouts or congestion' },
      { id: 'dull', label: 'Dull, tired-looking skin' },
      { id: 'body', label: 'Body concerns (tone, shape, smoothing)' },
      { id: 'not_sure', label: 'I’m not sure — I want guidance' },
    ],
  },
  {
    id: 'q2_style',
    title: 'How do you like to make decisions?',
    subtitle: 'Be honest — which sounds most like you?',
    options: [
      { id: 'guided', label: 'I want an expert to guide me before committing' },
      { id: 'research', label: 'I do my research and decide quickly' },
      { id: 'advanced', label: 'I want visible results, even if it’s more advanced' },
      { id: 'low_commit', label: 'I prefer low-commitment, easy maintenance' },
    ],
  },
  {
    id: 'q3_comfort',
    title: 'Which feels most comfortable right now?',
    subtitle: 'There’s no wrong answer.',
    options: [
      { id: 'small', label: 'I want to start small and build' },
      { id: 'mid', label: 'I’m comfortable with mid-range treatments' },
      { id: 'premium', label: 'I’m open to premium results' },
      { id: 'unsure', label: 'I’m not sure yet' },
    ],
  },
  {
    id: 'q4_timing',
    title: 'When are you hoping to start?',
    subtitle: null,
    options: [
      { id: 'asap', label: 'As soon as possible' },
      { id: 'weeks', label: 'In the next few weeks' },
      { id: 'exploring', label: 'I’m just exploring' },
    ],
  },
]

/** =========================
 * SERVICES (only these can be recommended)
 * ========================= */
const SERVICES = {
  monthly_facial: {
    key: 'monthly_facial',
    name: '$99 Monthly Facial',
    price: '$99/mo',
    image: '/images/quiz/services/monthly-facial.jpg',
    blurb: 'Low-commitment consistency. Great for maintenance and momentum.',
    routine: 'Best for: maintenance + “keep me on track” routines.',
  },
  signature_facial: {
    key: 'signature_facial',
    name: 'Signature Facial',
    price: '$150',
    image: '/images/quiz/services/signature-facial.jpg',
    blurb: 'The classic “reset.” Clean, calm, refreshed — perfect first facial.',
    routine: 'Best for: a fresh start and a great first RELUXE experience.',
  },
  glo2: {
    key: 'glo2',
    name: 'Glo2Facial',
    price: '$250',
    image: '/images/quiz/services/glo2.jpg',
    blurb: 'Glow-forward and fun. Great when you want visible results without downtime.',
    routine: 'Best for: instant glow + “I want to see it” results.',
  },
  hydrafacial: {
    key: 'hydrafacial',
    name: 'HydraFacial',
    price: '$275',
    image: '/images/quiz/services/hydrafacial.jpg',
    blurb: 'Trusted, noticeable, and worth it — especially for texture + congestion.',
    routine: 'Best for: congestion/texture and a reliable “wow” clean feeling.',
  },
  jeuveau: {
    key: 'jeuveau',
    name: 'Jeuveau',
    price: '$380',
    image: '/images/quiz/services/jeuveau.jpg',
    blurb: 'A high-value “line softener” for common wrinkle areas (customized dosing).',
    routine: 'Best for: first-time tox or value-focused wrinkle softening.',
  },
  daxxify: {
    key: 'daxxify',
    name: 'Daxxify',
    price: '$580',
    image: '/images/quiz/services/daxxify.jpg',
    blurb: 'Premium, longevity-minded tox for people who want fewer visits.',
    routine: 'Best for: premium results + fewer maintenance visits.',
  },
  ipl_clearlift: {
    key: 'ipl_clearlift',
    name: 'IPL / ClearLift',
    price: 'Device consult recommended',
    image: '/images/quiz/services/ipl-clearlift.jpg',
    blurb: 'Tone, sun damage, redness, and texture — the “skin reset” category.',
    routine: 'Best for: sun damage/redness/uneven tone (plan-based results).',
  },
  vascupen: {
    key: 'vascupen',
    name: 'VascuPen',
    price: 'Targeted treatment',
    image: '/images/quiz/services/vascupen.jpg',
    blurb: 'Precision-focused help for small, stubborn concerns.',
    routine: 'Best for: targeted issues that bother you every time you look in the mirror.',
  },
  evolve_body: {
    key: 'evolve_body',
    name: 'Evolve Body',
    price: 'Body consult recommended',
    image: '/images/quiz/services/evolve.jpg',
    blurb: 'Tone + smoothing + shape support — for body goals without major downtime.',
    routine: 'Best for: body contouring and “I want a plan” goals.',
  },
}

/** =========================
 * PERSONAS
 * Important: Each persona maps to a SERVICE (not consult)
 * ========================= */
const PERSONAS = {
  maintenance_maven: {
    key: 'maintenance_maven',
    emoji: '🗓️',
    title: 'The Maintenance Maven',
    vibe: 'Consistency > intensity. You’ll get results the smart way.',
    bullets: ['Low-commitment and repeatable', 'Perfect for routines', 'Build momentum month to month'],
    serviceKey: 'monthly_facial',
  },
  classic_client: {
    key: 'classic_client',
    emoji: '✨',
    title: 'The Classic Skincare Client',
    vibe: 'You want a great experience and great skin — no drama.',
    bullets: ['Refreshing, reliable, straightforward', 'Great first facial', 'Perfect “reset”'],
    serviceKey: 'signature_facial',
  },
  glow_seeker: {
    key: 'glow_seeker',
    emoji: '🌟',
    title: 'The Glow Seeker',
    vibe: 'You want visible results fast — and you love a glow moment.',
    bullets: ['Instant gratification energy', 'Zero downtime vibe', 'Great for events and “boosts”'],
    serviceKey: 'glo2',
  },
  results_pro: {
    key: 'results_pro',
    emoji: '📈',
    title: 'The Results-Driven Professional',
    vibe: 'Efficient, proven, and worth it. You want payoff.',
    bullets: ['Trusted results', 'Great for congestion/texture', 'Feels like a “reset + polish”'],
    serviceKey: 'hydrafacial',
  },
  line_softener: {
    key: 'line_softener',
    emoji: '🙂',
    title: 'The Line Softener',
    vibe: 'You’re here for smoother. Period.',
    bullets: ['Wrinkles are the priority', 'Value-conscious start', 'Great first tox experience'],
    serviceKey: 'jeuveau',
  },
  longevity_planner: {
    key: 'longevity_planner',
    emoji: '⏳',
    title: 'The Longevity Planner',
    vibe: 'Premium results, fewer visits. You’re playing chess.',
    bullets: ['Premium comfort', 'Longevity-minded', 'Ideal for busy schedules'],
    serviceKey: 'daxxify',
  },
  skin_resetter: {
    key: 'skin_resetter',
    emoji: '🌞',
    title: 'The Skin Resetter',
    vibe: 'You’re ready for a real “tone + texture” reset path.',
    bullets: ['Sun damage/redness focus', 'Open to devices', 'Best results come from a plan'],
    serviceKey: 'ipl_clearlift',
  },
  detail_corrector: {
    key: 'detail_corrector',
    emoji: '🎯',
    title: 'The Detail Corrector',
    vibe: 'You’re precise — and you want a targeted solution.',
    bullets: ['Small stubborn concerns', 'Not interested in overkill', 'Targeted wins'],
    serviceKey: 'vascupen',
  },
  body_optimizer: {
    key: 'body_optimizer',
    emoji: '💪',
    title: 'The Body Optimizer',
    vibe: 'Body goals, but done smart and plan-based.',
    bullets: ['Tone/smoothing goals', 'Device-forward approach', 'Results-driven'],
    serviceKey: 'evolve_body',
  },
}

/** =========================
 * DECISION LOGIC
 * Key change: even “not sure/guided” get a starter service, not consult.
 * Consult is always available as secondary button.
 * ========================= */
function computePersona(answers) {
  const goal = answers.q1_goal
  const style = answers.q2_style
  const comfort = answers.q3_comfort

  // If unsure OR guided, start with Signature Facial (safe, high conversion)
  if (goal === 'not_sure' || style === 'guided') return PERSONAS.classic_client

  // Body -> Evolve
  if (goal === 'body') return PERSONAS.body_optimizer

  // Wrinkles -> Jeuveau vs Daxxify
  if (goal === 'wrinkles') {
    if (comfort === 'premium') return PERSONAS.longevity_planner
    return PERSONAS.line_softener
  }

  // Tone/texture -> device vs Hydrafacial
  if (goal === 'tone_texture') {
    if (style === 'advanced') return PERSONAS.skin_resetter
    return PERSONAS.results_pro
  }

  // Breakouts/dull -> maintenance vs glow vs signature
  if (goal === 'breakouts' || goal === 'dull') {
    if (style === 'low_commit' || comfort === 'small') return PERSONAS.maintenance_maven
    if (style === 'advanced' || comfort === 'premium') return PERSONAS.glow_seeker
    return PERSONAS.classic_client
  }

  return PERSONAS.classic_client
}

export default function ServiceQuizPage() {
  const [sessionId] = useState(() => makeSessionId())

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showLeadStep, setShowLeadStep] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // lead
  const [leadChannel, setLeadChannel] = useState(null) // 'sms' | 'email' | null
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)

  const [leadCaptured, setLeadCaptured] = useState(false)
  const [leadSource, setLeadSource] = useState(null) // 'bonus_step' | 'results_inline'
  const [leadStatus, setLeadStatus] = useState(null) // 'ok' | 'error' | null
  const [sendingLead, setSendingLead] = useState(false)

  // completion email (always)
  const completionSentRef = useRef(false)
  const [completionSent, setCompletionSent] = useState(false)

  const totalSteps = QUESTIONS.length
  const current = QUESTIONS[stepIndex]

  const persona = useMemo(() => computePersona(answers), [answers])
  const service = useMemo(() => SERVICES[persona?.serviceKey] || SERVICES.signature_facial, [persona])

  useEffect(() => {
    trackEvent('service_quiz_view', { session_id: sessionId })
  }, [sessionId])

  useEffect(() => {
    if (showResults) return
    if (showLeadStep) {
      trackEvent('service_lead_step_view', { session_id: sessionId })
      return
    }
    trackEvent('service_question_view', { session_id: sessionId, qid: current?.id, step: stepIndex + 1 })
  }, [showResults, showLeadStep, stepIndex, current?.id, sessionId])

  function setAnswer(qid, value) {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
    trackEvent('service_answer_select', { session_id: sessionId, qid, value, step: stepIndex + 1 })
  }

  function back() {
    if (showLeadStep) {
      setShowLeadStep(false)
      trackEvent('service_lead_back', { session_id: sessionId })
      return
    }
    setStepIndex((i) => Math.max(0, i - 1))
    trackEvent('service_back', { session_id: sessionId, to_step: Math.max(1, stepIndex) })
  }

  function next() {
    const q = QUESTIONS[stepIndex]
    if (!answers[q.id]) {
      trackEvent('service_next_blocked', { session_id: sessionId, qid: q.id })
      return
    }
    if (stepIndex === totalSteps - 1) {
      setShowLeadStep(true)
      trackEvent('service_to_lead_step', { session_id: sessionId })
      return
    }
    setStepIndex((i) => Math.min(totalSteps - 1, i + 1))
    trackEvent('service_next', { session_id: sessionId, to_step: stepIndex + 2 })
  }

  function resetAll() {
    setStepIndex(0)
    setAnswers({})
    setShowLeadStep(false)
    setShowResults(false)
    setLeadChannel(null)
    setName('')
    setEmail('')
    setPhone('')
    setSmsConsent(false)
    setLeadCaptured(false)
    setLeadSource(null)
    setLeadStatus(null)
    setSendingLead(false)
    setCompletionSent(false)
    completionSentRef.current = false
    trackEvent('service_restart', { session_id: sessionId })
  }

  async function sendCompletionOnce(extraLead = {}) {
    if (completionSentRef.current) return
    completionSentRef.current = true

    try {
      await postQuiz({
        type: 'service_quiz_complete',
        toEmail: QUIZ_NOTIFY_TO,
        page: PAGE_PATH,
        sessionId,
        completed_at: new Date().toISOString(),
        persona: persona?.key,
        personaTitle: persona?.title,
        recommendedService: service?.name,
        recommendedServiceKey: service?.key,
        coupon: { code: COUPON_CODE, value: COUPON_VALUE },
        answers,
        lead: {
          captured: Boolean(extraLead.captured),
          source: extraLead.source || null,
          channel: extraLead.channel || null,
          name: extraLead.name || null,
          email: extraLead.email || null,
          phone: extraLead.phone || null,
          smsConsent: Boolean(extraLead.smsConsent),
        },
      })
      setCompletionSent(true)
      trackEvent('service_completion_email_ok', { session_id: sessionId })
    } catch (e) {
      trackEvent('service_completion_email_error', { session_id: sessionId, message: String(e?.message || e) })
    }
  }

  async function goToResults({ lead = null } = {}) {
    setShowLeadStep(false)
    setShowResults(true)
    trackEvent('service_results_view', { session_id: sessionId, persona: persona?.key, service: service?.key })
    await sendCompletionOnce(lead || { captured: false, source: 'none' })
  }

  async function skipLead() {
    trackEvent('service_lead_skip', { session_id: sessionId })
    await goToResults({ lead: { captured: false, source: 'skipped' } })
  }

  async function submitLead({ source }) {
    setLeadStatus(null)

    const nm = safeTrim(name) || null
    const em = safeTrim(email) || null
    const ph = normalizePhoneDigits(phone) || null

    if (!leadChannel) {
      setLeadStatus('error')
      return
    }
    if (leadChannel === 'email') {
      if (!em || !isValidEmail(em)) {
        setLeadStatus('error')
        return
      }
    }
    if (leadChannel === 'sms') {
      if (!ph || !isValidPhone(ph) || !smsConsent) {
        setLeadStatus('error')
        return
      }
    }

    setSendingLead(true)
    trackEvent('service_lead_submit', { session_id: sessionId, channel: leadChannel, source })

    try {
      await postQuiz({
        type: 'service_quiz_lead',
        toEmail: QUIZ_NOTIFY_TO,
        page: PAGE_PATH,
        sessionId,
        submitted_at: new Date().toISOString(),
        persona: persona?.key,
        personaTitle: persona?.title,
        recommendedService: service?.name,
        recommendedServiceKey: service?.key,
        coupon: { code: COUPON_CODE, value: COUPON_VALUE },
        answers,
        lead: {
          captured: true,
          source,
          channel: leadChannel,
          name: nm,
          email: leadChannel === 'email' ? em : null,
          phone: leadChannel === 'sms' ? ph : null,
          smsConsent: Boolean(smsConsent),
        },
      })

      setLeadCaptured(true)
      setLeadSource(source)
      setLeadStatus('ok')

      trackEvent('service_lead_submit_ok', { session_id: sessionId, channel: leadChannel, source })

      if (source === 'bonus_step') {
        await goToResults({
          lead: {
            captured: true,
            source,
            channel: leadChannel,
            name: nm,
            email: leadChannel === 'email' ? em : null,
            phone: leadChannel === 'sms' ? ph : null,
            smsConsent,
          },
        })
      }
    } catch (e) {
      setLeadStatus('error')
      trackEvent('service_lead_submit_error', { session_id: sessionId, message: String(e?.message || e) })
    } finally {
      setSendingLead(false)
    }
  }

  const progressLabel = showResults
    ? 'Results'
    : showLeadStep
      ? 'Bonus (optional)'
      : `Question ${stepIndex + 1}/${totalSteps}`

  const bookServiceHref = BOOK_LINKS[service?.key] || '/book'
  const consultHref = BOOK_LINKS.getting_started || '/book/getting-started'

  return (
    <>
      <Head>
        <title>What Should I Book? — Quick Quiz | {BRAND}</title>
        <meta name="description" content="Not sure what to book? Take our quick quiz and get one confident starting recommendation." />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta property="og:title" content={`What Should I Book? — Quick Quiz | ${BRAND}`} />
        <meta property="og:description" content="45 seconds. Fun. Personalized. One confident place to start." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://reluxemedspa.com${PAGE_PATH}`} />
        <meta property="og:image" content="/images/quiz/service-quiz-og.jpg" />
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
              What should I book?
            </h1>
            <p className="mt-2 text-neutral-300 text-sm sm:text-base">
              45 seconds. Fun. Personalized. <span className="text-neutral-400">One confident place to start.</span>
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
            {!showResults && (
              <div className="p-5 sm:p-7">
                {!showLeadStep ? (
                  <>
                    <p className="text-[11px] tracking-widest uppercase text-neutral-500">Quick Match Quiz</p>
                    <h2 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
                      {current.title}
                    </h2>
                    {current.subtitle && <p className="mt-2 text-sm text-neutral-600">{current.subtitle}</p>}

                    <div className="mt-5 grid gap-2">
                      {current.options.map((opt) => {
                        const selected = answers[current.id] === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setAnswer(current.id, opt.id)}
                            className={[
                              'w-full text-left rounded-2xl border px-4 py-3 transition',
                              'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                              selected ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 hover:bg-neutral-50',
                            ].join(' ')}
                            aria-pressed={selected}
                          >
                            <div className="flex items-start gap-3">
                              <span className={[
                                'mt-1.5 h-4 w-4 rounded-full border flex items-center justify-center',
                                selected ? 'border-emerald-500' : 'border-neutral-300',
                              ].join(' ')}>
                                {selected && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                              </span>
                              <span className="text-sm sm:text-base font-semibold text-neutral-900">{opt.label}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={back}
                        disabled={stepIndex === 0}
                        className={[
                          'rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition min-h-[48px]',
                          stepIndex === 0
                            ? 'ring-neutral-200 text-neutral-400 cursor-not-allowed'
                            : 'ring-neutral-200 text-neutral-800 hover:bg-neutral-50',
                        ].join(' ')}
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={next}
                        className="rounded-2xl px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900 transition min-h-[48px] inline-flex items-center justify-center gap-2"
                      >
                        Next <Arrow />
                      </button>
                    </div>

                    <p className="mt-4 text-[11px] text-neutral-500">
                      Tip: This quiz suggests a starting point. Your provider customizes your plan.
                    </p>
                  </>
                ) : (
                  <>
                    {/* Lead step with offer */}
                    <p className="text-[11px] tracking-widest uppercase text-neutral-500">Save your plan + credit</p>
                    <h2 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
                      Want your plan + routine + {COUPON_COPY}?
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                      We’ll send your recommendation + a simple routine, plus your {COUPON_VALUE} credit code: <strong>{COUPON_CODE}</strong>.
                    </p>

                    <div className="mt-5 grid sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLeadChannel('sms')}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${leadChannel === 'sms' ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 hover:bg-neutral-50'}`}
                      >
                        <p className="font-extrabold text-neutral-900">📲 Text it to me</p>
                        <p className="text-xs text-neutral-600 mt-1">Fastest way to save the code + plan.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLeadChannel('email')}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${leadChannel === 'email' ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 hover:bg-neutral-50'}`}
                      >
                        <p className="font-extrabold text-neutral-900">✉️ Email it to me</p>
                        <p className="text-xs text-neutral-600 mt-1">Great if you want it saved in your inbox.</p>
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <div>
                        <label className="text-sm font-semibold text-neutral-900">First name (optional)</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Your Name"
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
                          ✅ Saved. Sending you to results…
                        </div>
                      )}

                      <div className="mt-1 flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => submitLead({ source: 'bonus_step' })}
                          disabled={sendingLead}
                          className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white transition min-h-[48px] inline-flex items-center justify-center gap-2 ${
                            sendingLead ? 'bg-neutral-300 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900'
                          }`}
                        >
                          {sendingLead ? 'Sending…' : 'Send my plan + code'} <Arrow />
                        </button>

                        <button
                          type="button"
                          onClick={skipLead}
                          className="rounded-2xl px-6 py-3 text-sm font-semibold ring-1 ring-neutral-200 text-neutral-900 hover:bg-neutral-50 transition min-h-[48px]"
                        >
                          Skip & see results
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={back}
                        className="text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-700 text-left"
                      >
                        Back to last question
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {showResults && (
              <div className="p-5 sm:p-7">
                <p className="text-[11px] tracking-widest uppercase text-neutral-500">Your match</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                  {persona?.emoji} {persona?.title}
                </h2>
                <p className="mt-2 text-neutral-700">{persona?.vibe}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {persona?.bullets?.map((b, i) => (
                    <div key={i} className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
                      <p className="text-sm font-semibold text-neutral-900">{b}</p>
                    </div>
                  ))}
                </div>

                {/* Recommended service card */}
                <div className="mt-6 rounded-3xl border border-neutral-200 overflow-hidden">
                  <div className="grid sm:grid-cols-12">
                    <div className="sm:col-span-5 bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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

                      {/* One CTA area with two buttons */}
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <a
                          href={bookServiceHref}
                          onClick={() => trackEvent('service_book_click', { session_id: sessionId, service: service?.key, persona: persona?.key })}
                          className="rounded-2xl px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900 transition min-h-[48px] inline-flex items-center justify-center gap-2"
                        >
                          Book {service?.name} <Arrow />
                        </a>

                        <a
                          href={consultHref}
                          onClick={() => trackEvent('service_getting_started_click', { session_id: sessionId, persona: persona?.key })}
                          className="rounded-2xl px-6 py-3 text-sm font-semibold ring-1 ring-neutral-200 text-neutral-900 hover:bg-neutral-50 transition min-h-[48px] inline-flex items-center justify-center"
                        >
                          Getting Started with RELUXE
                        </a>
                      </div>

                      {/* Coupon display (always visible) */}
                      <div className="mt-4 rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
                        <p className="text-sm font-semibold text-neutral-900">Your credit code</p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-neutral-200">
                          <span className="text-xs text-neutral-500">Use code</span>
                          <span className="text-sm font-extrabold tracking-widest">{COUPON_CODE}</span>
                          <span className="text-xs text-neutral-500">for {COUPON_COPY}</span>
                        </div>
                        <p className="mt-2 text-[11px] text-neutral-500">
                          Apply at checkout/booking. Terms may apply. One per new client.
                        </p>
                      </div>

                      <p className="mt-3 text-[11px] text-neutral-500">
                        Completion emailed to the team: {completionSent ? '✅' : 'sending…'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inline lead capture ONLY if skipped earlier */}
                {!leadCaptured && leadSource !== 'bonus_step' && (
                  <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
                    <h4 className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">
                      Want to save your plan + routine + {COUPON_COPY}?
                    </h4>
                    <p className="mt-2 text-sm text-neutral-600">
                      We’ll send your recommendation + simple routine + code <strong>{COUPON_CODE}</strong>.
                    </p>

                    <div className="mt-4 grid sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLeadChannel('email')}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${leadChannel === 'email' ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 hover:bg-white'}`}
                      >
                        <p className="font-extrabold text-neutral-900">✉️ Email me</p>
                        <p className="text-xs text-neutral-600 mt-1">Save the plan + code in your inbox.</p>
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
                          placeholder="Your Name"
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
                        onClick={async () => {
                          setLeadStatus(null)
                          const nm = safeTrim(name) || null
                          const em = safeTrim(email) || null
                          const ph = normalizePhoneDigits(phone) || null

                          if (!leadChannel) { setLeadStatus('error'); return }
                          if (leadChannel === 'email' && (!em || !isValidEmail(em))) { setLeadStatus('error'); return }
                          if (leadChannel === 'sms' && (!ph || !isValidPhone(ph) || !smsConsent)) { setLeadStatus('error'); return }

                          setSendingLead(true)
                          try {
                            await postQuiz({
                              type: 'service_quiz_lead',
                              toEmail: QUIZ_NOTIFY_TO,
                              page: PAGE_PATH,
                              sessionId,
                              submitted_at: new Date().toISOString(),
                              persona: persona?.key,
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
                            setLeadSource('results_inline')
                            setLeadStatus('ok')
                          } catch (e) {
                            setLeadStatus('error')
                          } finally {
                            setSendingLead(false)
                          }
                        }}
                        disabled={sendingLead}
                        className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white transition min-h-[48px] inline-flex items-center justify-center gap-2 ${
                          sendingLead
                            ? 'bg-neutral-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900'
                        }`}
                      >
                        {sendingLead ? 'Sending…' : 'Send my plan + code'} <Arrow />
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

          {/* Ensure completion is posted if user somehow lands on results without calling it */}
          {!showResults && (
            <CompletionGuard
              showResults={showResults}
              onComplete={async () => {
                if (completionSentRef.current) return
                // if they never reach results via goToResults (shouldn’t happen), no-op
              }}
            />
          )}
        </div>
      </section>
    </>
  )
}

function CompletionGuard() {
  return null
}

function Arrow() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}
