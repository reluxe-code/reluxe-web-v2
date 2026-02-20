// pages/landing/skinbetter-starter-quiz.js
// RELUXE • Skinbetter Starter Quiz (auto-start, premium motion, GA4/Meta tracking, completion email)

import Head from 'next/head'
import { useEffect, useMemo, useRef, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'
import { AnimatePresence, motion } from 'framer-motion'

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const PAGE_NAME = 'Skinbetter Starter Quiz'
const PAGE_PATH = '/landing/skinbetter-starter-quiz'
const BRAND = 'RELUXE Med Spa'
const LOCATION_TAGLINE = 'Carmel & Westfield, IN'
const COMPLETION_EMAIL_TO = 'hello@reluxemedspa.com'
const PARTNER_NOTE = 'You may be redirected to our authorized partner site to complete purchase.'

/** ======================================================
 * Tracking helper: Meta Pixel (fbq) + GA4 (gtag) + dataLayer
 * ====================================================== */
function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return

  const payload = {
    ...params,
    page_name: PAGE_NAME,
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
 * Utilities
 * ========================= */
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)) }
function makeSessionId() { return `sb_${Date.now()}_${Math.random().toString(16).slice(2)}` }

function isValidEmail(v) {
  const s = String(v || '').trim()
  if (!s) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}
function normalizePhoneDigits(v) {
  const digits = String(v || '').replace(/[^\d]/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}
function isValidPhone(v) {
  const d = normalizePhoneDigits(v)
  return d.length === 10
}

/** =========================
 * Product Catalog (EDIT HERE)
 * Put images in /public/images/products/skinbetter/
 * URLs can point to your future shop pages or partner site.
 * ========================= */
const PRODUCTS = {
  ateam: {
    id: 'ateam',
    brand: 'skinbetter science',
    name: 'The A-Team (AlphaRet + Alto)',
    why: 'The simplest high-confidence place to start for visible improvement + prevention.',
    format: 'Starter Duo',
    img: '/images/products/skinbetter/ateam.jpg',
    url: 'https://reluxemedspa.com/shop/skinbetter/a-team', // TODO: update
  },
  alpharet: {
    id: 'alpharet',
    brand: 'skinbetter science',
    name: 'AlphaRet Overnight Cream',
    why: 'Your best “one product” step to improve texture + fine lines with Skinbetter’s signature approach.',
    format: 'PM Treatment',
    img: '/images/products/skinbetter/alpharet.jpg',
    url: 'https://reluxemedspa.com/shop/skinbetter/alpharet', // TODO: update
  },
  alpharet_intensive: {
    id: 'alpharet_intensive',
    brand: 'skinbetter science',
    name: 'AlphaRet Intensive Overnight Cream',
    why: 'A stronger option for experienced retinoid users chasing maximum correction.',
    format: 'PM Treatment (Advanced)',
    img: '/images/products/skinbetter/alpharet-intensive.jpg',
    url: 'https://reluxemedspa.com/shop/skinbetter/alpharet-intensive', // TODO: update
  },
  alto: {
    id: 'alto',
    brand: 'skinbetter science',
    name: 'Alto Advanced Defense Serum',
    why: 'A daily antioxidant “power move” for glow, tone support, and long-term skin health.',
    format: 'AM Serum',
    img: '/images/products/skinbetter/alto.jpg',
    url: 'https://reluxemedspa.com/shop/skinbetter/alto', // TODO: update
  },
  eventone: {
    id: 'eventone',
    brand: 'skinbetter science',
    name: 'Even Tone Correcting Serum',
    why: 'Targets the look of uneven tone and discoloration — a common “next best” add-on.',
    format: 'Corrective Serum',
    img: '/images/products/skinbetter/eventone.jpg',
    url: 'https://reluxemedspa.com/shop/skinbetter/even-tone', // TODO: update
  },
  trio: {
    id: 'trio',
    brand: 'skinbetter science',
    name: 'Trio Rebalancing Moisture Treatment',
    why: 'Barrier support + comfort — ideal if you’re sensitive, reactive, or want a calmer routine.',
    format: 'Moisturizer',
    img: '/images/products/skinbetter/trio.jpg',
    url: 'https://reluxemedspa.com/shop/skinbetter/trio', // TODO: update
  },
}

/** =========================
 * Quiz definition (LOCKED)
 * ========================= */
const QUIZ = [
  {
    id: 'q1_experience',
    type: 'single',
    title: 'Have you used medical-grade skincare before?',
    subtitle: 'Pick the closest match.',
    options: [
      { id: 'new', label: 'I’m new (mostly drugstore/Sephora)', emoji: '🌱' },
      { id: 'some', label: 'Some experience', emoji: '🙂' },
      { id: 'consistent', label: 'Yes — consistently', emoji: '💪' },
    ],
  },
  {
    id: 'q2_goal',
    type: 'single',
    title: 'What’s your main skin goal right now?',
    subtitle: 'Choose your #1 priority.',
    options: [
      { id: 'aging', label: 'Fine lines & aging', emoji: '⏳' },
      { id: 'tone', label: 'Uneven tone / sun damage', emoji: '✨' },
      { id: 'acne', label: 'Acne or congestion', emoji: '🫧' },
      { id: 'redness', label: 'Redness / sensitivity', emoji: '🌸' },
      { id: 'glow', label: 'Overall glow & prevention', emoji: '🌞' },
    ],
  },
  {
    id: 'q3_simple',
    type: 'single',
    title: 'How simple do you want your routine?',
    subtitle: 'Be honest — what will you actually stick to?',
    options: [
      { id: 'simple', label: 'Very simple (1–2 products)', emoji: '✅' },
      { id: 'balanced', label: 'Balanced (AM + PM)', emoji: '⚖️' },
      { id: 'full', label: 'I’m open to a full routine', emoji: '🚀' },
    ],
  },
  {
    id: 'q4_retinol',
    type: 'single',
    title: 'Are you currently using a retinol?',
    subtitle: 'This helps us recommend safely.',
    options: [
      { id: 'none', label: 'No', emoji: '🧼' },
      { id: 'gentle', label: 'Yes, gentle retinol', emoji: '🙂' },
      { id: 'strong', label: 'Yes, prescription/strong', emoji: '🔥' },
    ],
  },
  {
    id: 'q5_sensitive',
    type: 'single_optional',
    title: 'Any sensitivity we should consider?',
    subtitle: 'Optional — but helps personalize.',
    options: [
      { id: 'sensitive', label: 'Sensitive or reactive', emoji: '🌸' },
      { id: 'not_sensitive', label: 'Not sensitive', emoji: '👍' },
      { id: 'not_sure', label: 'Not sure', emoji: '🤷' },
    ],
  },
]

/** =========================
 * Personas + Recommendation Logic (SAFE + SIMPLE)
 * Each persona returns 2–3 product IDs
 * ========================= */
const PERSONAS = {
  smart_starter: {
    id: 'smart_starter',
    emoji: '🟢',
    name: 'Smart Starter',
    tagline: 'Simple, high-confidence starting point — great results without overwhelm.',
    bullets: [
      'You want a plan that’s easy to stick to.',
      'You want visible improvement with low drama.',
      'You want a “safe best bet” that works for most people.',
    ],
  },
  glow_builder: {
    id: 'glow_builder',
    emoji: '🟡',
    name: 'Glow Builder',
    tagline: 'Tone support + brightening — the “you look rested” routine upgrade.',
    bullets: [
      'You want glow and smoother-looking tone.',
      'You want daily products you’ll actually use.',
      'You’re building consistency (not chasing perfection).',
    ],
  },
  aging_optimizer: {
    id: 'aging_optimizer',
    emoji: '🔵',
    name: 'Aging Optimizer',
    tagline: 'Correction-focused — your next step for texture + fine lines.',
    bullets: [
      'You’re ready for meaningful improvement.',
      'You want a plan built around the right PM treatment.',
      'You’re comfortable with a consistent routine.',
    ],
  },
  clear_and_calm: {
    id: 'clear_and_calm',
    emoji: '🟣',
    name: 'Clear & Calm',
    tagline: 'Barrier-first + calm — support your skin while improving what you see.',
    bullets: [
      'You want comfort and calm while you correct.',
      'You prefer a gentler, steadier approach.',
      'You want a routine that supports your barrier.',
    ],
  },
  prevention_pro: {
    id: 'prevention_pro',
    emoji: '🌞',
    name: 'Prevention Pro',
    tagline: 'Protect + strengthen — the long-game routine that pays off.',
    bullets: [
      'You want to stay ahead of aging and dullness.',
      'You value easy daily consistency.',
      'You want smart prevention with high-end products.',
    ],
  },
}

function computeResult(answers) {
  const exp = answers.q1_experience
  const goal = answers.q2_goal
  const simple = answers.q3_simple
  const ret = answers.q4_retinol
  const sens = answers.q5_sensitive

  const sensitive = sens === 'sensitive' || goal === 'redness'

  // Primary: sensitive/redness -> Clear & Calm
  if (sensitive) {
    const persona = PERSONAS.clear_and_calm
    const rec = ['trio']
    // Add an entry product that still feels like progress
    if (goal === 'tone') rec.push('eventone')
    else rec.push('alto')
    // Optional 3rd: A-Team if not brand new and wants more
    if (exp !== 'new' && simple !== 'simple') rec.push('ateam')
    return { persona, recommended: uniqueTop3(rec) }
  }

  // Goal: acne/congestion -> Clear & Calm (barrier-first) + antioxidant
  if (goal === 'acne') {
    const persona = PERSONAS.clear_and_calm
    const rec = ['trio', 'alto']
    // If they want more correction and have some experience, suggest AlphaRet
    if (exp !== 'new' && ret !== 'none') rec.push('alpharet')
    return { persona, recommended: uniqueTop3(rec) }
  }

  // Goal: uneven tone
  if (goal === 'tone') {
    const persona = PERSONAS.glow_builder
    const rec = ['alto', 'eventone']
    // If they’re new -> A-Team as safe start; if experienced -> AlphaRet
    if (exp === 'new' || ret === 'none') rec.push('ateam')
    else rec.push('alpharet')
    return { persona, recommended: uniqueTop3(rec) }
  }

  // Goal: aging
  if (goal === 'aging') {
    const persona = exp === 'new' || ret === 'none' ? PERSONAS.smart_starter : PERSONAS.aging_optimizer
    const rec = []
    if (exp === 'new' || ret === 'none') {
      rec.push('ateam', 'alto')
      if (simple !== 'simple') rec.push('trio')
    } else {
      // experienced: AlphaRet; intensive only if strong retinoid + not sensitive
      if (ret === 'strong') rec.push('alpharet_intensive')
      else rec.push('alpharet')
      rec.push('alto')
      if (simple !== 'simple') rec.push('trio')
    }
    return { persona, recommended: uniqueTop3(rec) }
  }

  // Default: glow & prevention
  {
    const persona = PERSONAS.prevention_pro
    const rec = ['alto']
    if (simple === 'simple') rec.push('ateam')
    else rec.push('alpharet')
    rec.push('trio')
    return { persona, recommended: uniqueTop3(rec) }
  }
}

function uniqueTop3(arr) {
  const out = []
  for (const x of arr) {
    if (!x) continue
    if (!out.includes(x)) out.push(x)
    if (out.length >= 3) break
  }
  return out
}

export default function SkinbetterStarterQuizPage() {
  // flow
  const [started, setStarted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0) // 0..totalSteps-1 quiz, totalSteps = optional lead step
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  // lead capture (bonus step + inline)
  const [leadChannel, setLeadChannel] = useState(null) // 'sms' | 'email' | null
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)

  const [leadCaptured, setLeadCaptured] = useState(false)
  const [leadCaptureSource, setLeadCaptureSource] = useState(null) // 'bonus_step' | 'results_inline' | 'skipped'
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadSubmitStatus, setLeadSubmitStatus] = useState(null) // 'success' | 'error' | null

  // completion send
  const [sessionId, setSessionId] = useState('')
  const [completionSent, setCompletionSent] = useState(false)
  const completionSentRef = useRef(false)

  const totalSteps = QUIZ.length
  const isBonusStep = started && !showResults && stepIndex === totalSteps
  const current = stepIndex < totalSteps ? QUIZ[stepIndex] : null

  const result = useMemo(() => computeResult(answers), [answers])
  const persona = result?.persona
  const recProducts = useMemo(
    () => (result?.recommended || []).map((id) => PRODUCTS[id]).filter(Boolean),
    [result]
  )

  // session id
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const existing = window.localStorage.getItem('reluxe_skinbetter_quiz_session')
      if (existing) setSessionId(existing)
      else {
        const sid = makeSessionId()
        window.localStorage.setItem('reluxe_skinbetter_quiz_session', sid)
        setSessionId(sid)
      }
    } catch (_) {
      setSessionId(makeSessionId())
    }
  }, [])

  // page view
  useEffect(() => {
    trackEvent('sb_quiz_view', { page: PAGE_PATH })
  }, [])

  // auto-start quiz (first question immediately)
  useEffect(() => {
    if (!started && !showResults) beginQuiz({ silent: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // question/bonus view events
  useEffect(() => {
    if (!started || showResults) return
    if (stepIndex < totalSteps) {
      trackEvent('sb_question_view', { session_id: sessionId, step_index: stepIndex + 1, step_id: current?.id })
    } else {
      trackEvent('sb_lead_step_view', { session_id: sessionId, placement: 'post_quiz_bonus_step' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, showResults, stepIndex])

  function beginQuiz({ silent = false } = {}) {
    setStarted(true)
    setShowResults(false)
    setStepIndex(0)
    setAnswers({})
    setLeadChannel(null)
    setName('')
    setEmail('')
    setPhone('')
    setSmsConsent(false)
    setLeadCaptured(false)
    setLeadCaptureSource(null)
    setLeadSubmitting(false)
    setLeadSubmitStatus(null)
    setCompletionSent(false)
    completionSentRef.current = false

    trackEvent('sb_quiz_start', { placement: silent ? 'auto' : 'hero' })
  }

  function restart() {
    trackEvent('sb_quiz_restart', { session_id: sessionId, from: showResults ? 'results' : 'quiz' })
    beginQuiz({ silent: true })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function canGoNext() {
    if (stepIndex === totalSteps) return true // bonus step optional
    const q = current
    if (!q) return false
    const v = answers[q.id]
    if (q.type === 'single_optional') return true
    if (q.type === 'single') return typeof v === 'string' && v.length > 0
    return false
  }

  function next() {
    if (stepIndex < totalSteps) {
      trackEvent('sb_question_next', { session_id: sessionId, step_index: stepIndex + 1, step_id: current?.id })

      if (stepIndex >= totalSteps - 1) {
        setStepIndex(totalSteps) // go to bonus step
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setStepIndex((s) => clamp(s + 1, 0, totalSteps))
    }
  }

  function back() {
    if (stepIndex === totalSteps) {
      trackEvent('sb_lead_back_to_quiz', { session_id: sessionId })
      setStepIndex(totalSteps - 1)
      return
    }
    trackEvent('sb_question_back', { session_id: sessionId, step_index: stepIndex + 1, step_id: current?.id })
    setStepIndex((s) => clamp(s - 1, 0, totalSteps))
  }

  function selectOption(question, optionId) {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
    trackEvent('sb_answer_select', { session_id: sessionId, step_id: question.id, option_id: optionId })
  }

  function buildPayload(extra = {}) {
    const final = computeResult(answers)
    return {
      eventType: extra.eventType || 'quiz_complete',
      toEmail: COMPLETION_EMAIL_TO,
      sessionId,
      page: PAGE_PATH,
      submittedAt: new Date().toISOString(),
      lead: {
        captured: Boolean(leadCaptured),
        source: leadCaptureSource || 'none',
        channel: extra.leadChannel || (leadChannel || null),
        name: (name || '').trim() || null,
        email: (email || '').trim() || null,
        phone: normalizePhoneDigits(phone || '') || null,
        smsConsent: Boolean(smsConsent),
      },
      persona: { id: final?.persona?.id, name: final?.persona?.name },
      recommendations: (final?.recommended || []).map((pid) => PRODUCTS[pid]).filter(Boolean),
      answers,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...extra,
    }
  }

  async function sendCompletionEmailOnce(payload) {
    if (completionSentRef.current) return
    completionSentRef.current = true
    setCompletionSent(true)

    trackEvent('sb_completion_email_attempt', { session_id: sessionId })

    try {
      const res = await fetch('/api/skinbetter-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Bad response')
      trackEvent('sb_completion_email_success', { session_id: sessionId })
    } catch (e) {
      trackEvent('sb_completion_email_error', { session_id: sessionId, message: String(e?.message || e) })
    }
  }

  function showFinalResults({ leadSource = 'skipped', leadWasCaptured = false, leadChannelOverride = null } = {}) {
    setShowResults(true)

    trackEvent('sb_quiz_complete', {
      session_id: sessionId,
      persona_id: persona?.id,
      persona_name: persona?.name,
    })
    trackEvent('sb_persona_view', { session_id: sessionId, persona_id: persona?.id, persona_name: persona?.name })

    setLeadCaptured(Boolean(leadWasCaptured))
    setLeadCaptureSource(leadSource)

    const payload = buildPayload({
      leadChannel: leadChannelOverride,
      lead: {
        captured: Boolean(leadWasCaptured),
        source: leadSource,
        channel: leadChannelOverride || leadChannel || null,
        name: (name || '').trim() || null,
        email: (email || '').trim() || null,
        phone: normalizePhoneDigits(phone || '') || null,
        smsConsent: Boolean(smsConsent),
      },
    })
    sendCompletionEmailOnce(payload)

    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function bonusSkip() {
    trackEvent('sb_lead_skip', { session_id: sessionId })
    showFinalResults({ leadSource: 'skipped', leadWasCaptured: false, leadChannelOverride: null })
  }

  function bonusChooseChannel(ch) {
    setLeadChannel(ch)
    trackEvent('sb_lead_channel_select', { session_id: sessionId, channel: ch })
  }

  function bonusSubmit() {
    const ch = leadChannel
    const trimmedEmail = (email || '').trim()
    const normalizedPhone = normalizePhoneDigits(phone || '')

    if (ch === 'email') {
      if (trimmedEmail && !isValidEmail(trimmedEmail)) {
        trackEvent('sb_lead_validation_error', { session_id: sessionId, channel: ch, reason: 'bad_email' })
        return
      }
    }
    if (ch === 'sms') {
      if (!isValidPhone(normalizedPhone)) {
        trackEvent('sb_lead_validation_error', { session_id: sessionId, channel: ch, reason: 'bad_phone' })
        return
      }
      if (!smsConsent) {
        trackEvent('sb_lead_validation_error', { session_id: sessionId, channel: ch, reason: 'no_consent' })
        return
      }
    }

    trackEvent('sb_lead_submit', { session_id: sessionId, channel: ch })
    setLeadCaptured(true)
    setLeadCaptureSource('bonus_step')

    showFinalResults({ leadSource: 'bonus_step', leadWasCaptured: true, leadChannelOverride: ch })
  }

  async function submitInlineLeadUnderResults() {
    const trimmedEmail = (email || '').trim()
    const normalizedPhone = normalizePhoneDigits(phone || '')

    if (!trimmedEmail && !normalizedPhone) {
      setLeadSubmitStatus('error')
      trackEvent('sb_results_inline_validation_error', { session_id: sessionId, reason: 'no_contact' })
      return
    }
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setLeadSubmitStatus('error')
      trackEvent('sb_results_inline_validation_error', { session_id: sessionId, reason: 'bad_email' })
      return
    }
    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      setLeadSubmitStatus('error')
      trackEvent('sb_results_inline_validation_error', { session_id: sessionId, reason: 'bad_phone' })
      return
    }
    if (normalizedPhone && !smsConsent) {
      setLeadSubmitStatus('error')
      trackEvent('sb_results_inline_validation_error', { session_id: sessionId, reason: 'no_consent' })
      return
    }

    setLeadSubmitting(true)
    setLeadSubmitStatus(null)

    trackEvent('sb_results_inline_submit', { session_id: sessionId })

    try {
      const payload = buildPayload({
        eventType: 'lead_update_after_results',
        lead: {
          captured: true,
          source: 'results_inline',
          channel: normalizedPhone ? 'sms' : 'email',
          name: (name || '').trim() || null,
          email: trimmedEmail || null,
          phone: normalizedPhone || null,
          smsConsent: Boolean(smsConsent),
        },
      })

      const res = await fetch('/api/skinbetter-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Bad response')

      setLeadSubmitStatus('success')
      setLeadCaptured(true)
      setLeadCaptureSource('results_inline')
      trackEvent('sb_results_inline_submit_success', { session_id: sessionId })
    } catch (e) {
      setLeadSubmitStatus('error')
      trackEvent('sb_results_inline_submit_error', { session_id: sessionId, message: String(e?.message || e) })
    } finally {
      setLeadSubmitting(false)
    }
  }

  const progressPct =
    started && !showResults && stepIndex < totalSteps
      ? Math.round(((stepIndex + 1) / totalSteps) * 100)
      : started && !showResults && stepIndex === totalSteps
        ? 100
        : 0

  return (
    <>
      <Head>
        <title>{PAGE_NAME} | {BRAND}</title>
        <meta
          name="description"
          content="A simple quiz to tell you exactly where to start with skinbetter science — fast, premium, and personalized."
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta property="og:title" content={`${PAGE_NAME} | ${BRAND}`} />
        <meta property="og:description" content="Find your Skinbetter starting point in under a minute." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://reluxemedspa.com${PAGE_PATH}`} />
        <meta property="og:image" content="https://reluxemedspa.com/images/landing/skinbetter-quiz-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* Compact Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.20),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="max-w-5xl text-white">
            <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
              {BRAND} • {LOCATION_TAGLINE}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Where should I start with Skinbetter?
            </h1>
            <p className="mt-2 text-neutral-300 text-sm sm:text-base">
              Quick quiz → persona + 2–3 product picks. <span className="text-neutral-400">{PARTNER_NOTE}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="bg-neutral-50 py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">

            {started && !showResults && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                {/* Progress */}
                <div className="mb-4 sm:mb-5">
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span className="font-semibold">
                      {stepIndex < totalSteps ? `Step ${stepIndex + 1} of ${totalSteps}` : `Bonus (optional)`}
                    </span>
                    <span className="tabular-nums">
                      {stepIndex < totalSteps ? `${progressPct}%` : '✓'}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-neutral-900 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Quiz steps */}
                {stepIndex < totalSteps && (
                  <QuizCard
                    question={current}
                    answers={answers}
                    onSelect={(optionId) => selectOption(current, optionId)}
                  />
                )}

                {/* Bonus lead step */}
                {isBonusStep && (
                  <LeadCaptureCard
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    phone={phone}
                    setPhone={setPhone}
                    smsConsent={smsConsent}
                    setSmsConsent={setSmsConsent}
                    leadChannel={leadChannel}
                    onChooseChannel={bonusChooseChannel}
                    onSkip={bonusSkip}
                    onSubmit={bonusSubmit}
                  />
                )}

                {/* Controls */}
                <div className="mt-5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={back}
                    className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold min-h-[48px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      stepIndex === 0 ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-white text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50'
                    }`}
                    disabled={stepIndex === 0}
                  >
                    Back
                  </button>

                  {stepIndex < totalSteps && (
                    <button
                      type="button"
                      onClick={() => {
                        if (stepIndex === totalSteps - 1) {
                          // last question -> bonus step
                          next()
                        } else {
                          next()
                        }
                      }}
                      disabled={!canGoNext()}
                      className={`group inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        !canGoNext()
                          ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                      }`}
                    >
                      {stepIndex === totalSteps - 1 ? 'Continue' : 'Next'} <Arrow />
                    </button>
                  )}
                </div>

                <p className="mt-3 text-[11px] text-neutral-500">
                  We track each step to improve the quiz (and reduce drop-off).
                </p>
              </motion.div>
            )}

            {showResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <ResultsHeader persona={persona} onRestart={restart} />

                <Card title="Your recommended Skinbetter picks">
                  <p className="text-sm text-neutral-600">
                    2–3 curated options based on your answers. Choose one — or grab the set if you want it easy.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {recProducts.map((p, idx) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        rank={idx === 0 ? 'Top Pick' : (idx === 1 ? 'Great Add-On' : 'Power Move')}
                        onClick={() => {
                          trackEvent('sb_product_click', { session_id: sessionId, persona_id: persona?.id, product_id: p.id, rank: idx + 1 })
                        }}
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={recProducts?.[0]?.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackEvent('sb_primary_cta_click', { session_id: sessionId, persona_id: persona?.id, product_id: recProducts?.[0]?.id })}
                      className="group inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition bg-neutral-900 text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Shop My Best Match <Arrow />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        trackEvent('sb_bundle_cta_click', { session_id: sessionId, persona_id: persona?.id, products: recProducts.map((p) => p.id) })
                        recProducts.forEach((p, i) => {
                          setTimeout(() => {
                            try { window.open(p.url, '_blank', 'noopener,noreferrer') } catch (_) {}
                          }, i * 220)
                        })
                      }}
                      className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition text-neutral-900 bg-white ring-1 ring-neutral-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Get the full set
                    </button>
                  </div>

                  <p className="mt-3 text-[11px] text-neutral-500">{PARTNER_NOTE}</p>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {completionSent ? '✅ Completion logged to team email.' : 'Logging completion…'}
                  </p>
                </Card>

                {/* Inline lead form ONLY if they did NOT submit on bonus step */}
                {!leadCaptured && leadCaptureSource !== 'bonus_step' && (
                  <Card title="Want your persona + personalized plan sent to you?">
                    <p className="text-sm text-neutral-600">
                      Totally optional — we’ll send your persona + picks + a quick “how to use it” plan.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-700">First name (optional)</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Kyle"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-700">Email (optional)</label>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="you@email.com"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-neutral-700">Mobile (optional)</label>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="(317) 555-1234"
                          inputMode="tel"
                        />
                        <label className="mt-3 flex items-start gap-2 text-xs text-neutral-600">
                          <input
                            type="checkbox"
                            checked={smsConsent}
                            onChange={(e) => setSmsConsent(e.target.checked)}
                            className="mt-0.5"
                          />
                          <span>
                            If you include your mobile: Yes — text me my results + occasional offers. Msg &amp; data rates may apply. Reply STOP to opt out.
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={submitInlineLeadUnderResults}
                        disabled={leadSubmitting}
                        className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          leadSubmitting ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        {leadSubmitting ? 'Sending…' : 'Send my plan'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          trackEvent('sb_results_inline_skip', { session_id: sessionId })
                          setLeadCaptured(false)
                          setLeadCaptureSource('skipped')
                        }}
                        className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition bg-white text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        No thanks
                      </button>
                    </div>

                    {leadSubmitStatus === 'success' && (
                      <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
                        ✅ Sent. Check your inbox/text shortly.
                      </div>
                    )}
                    {leadSubmitStatus === 'error' && (
                      <div className="mt-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
                        ⚠️ Didn’t send. Double-check email/phone format and SMS consent if phone is provided.
                      </div>
                    )}
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}

/** =========================
 * Components
 * ========================= */

function QuizCard({ question, answers, onSelect }) {
  const v = answers?.[question.id]
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-sm">
      <p className="text-[11px] tracking-widest uppercase text-neutral-500">Skinbetter Quiz</p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
        {question.title}
      </h2>
      <p className="mt-2 text-sm text-neutral-600">{question.subtitle}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {question.options.map((opt) => {
          const selected = v === opt.id
          return (
            <motion.button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              whileTap={{ scale: 0.99 }}
              className={`text-left rounded-2xl border px-4 py-4 transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                selected ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'
              }`}
              aria-pressed={selected}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="font-semibold text-neutral-900">{opt.label}</span>
                </div>
                <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${selected ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300'}`}>
                  {selected && (
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-white" aria-hidden="true">
                      <path d="M7.629 13.314 4.3 9.986l-1.06 1.06 4.39 4.39 9.19-9.19-1.06-1.06-8.13 8.13z" />
                    </svg>
                  )}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {question.type === 'single_optional' && (
        <p className="mt-3 text-[11px] text-neutral-500">
          Optional — you can hit “Next” without choosing.
        </p>
      )}
    </div>
  )
}

function LeadCaptureCard({
  name, setName,
  email, setEmail,
  phone, setPhone,
  smsConsent, setSmsConsent,
  leadChannel,
  onChooseChannel,
  onSkip,
  onSubmit,
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-sm">
      <p className="text-[11px] tracking-widest uppercase text-neutral-500">Bonus (optional)</p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
        Want your Skinbetter plan sent to you?
      </h2>
      <p className="mt-2 text-sm text-neutral-600">
        We’ll send your persona + picks + a quick “how to use it” plan. Totally optional.
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onChooseChannel('sms')}
          className={`rounded-2xl px-4 py-3 font-semibold ring-1 transition ${
            leadChannel === 'sms' ? 'bg-emerald-50 ring-emerald-200 text-neutral-900' : 'bg-white ring-neutral-200 hover:bg-neutral-50'
          }`}
        >
          📲 Text it to me
        </button>
        <button
          type="button"
          onClick={() => onChooseChannel('email')}
          className={`rounded-2xl px-4 py-3 font-semibold ring-1 transition ${
            leadChannel === 'email' ? 'bg-emerald-50 ring-emerald-200 text-neutral-900' : 'bg-white ring-neutral-200 hover:bg-neutral-50'
          }`}
        >
          ✉️ Email it to me
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-2xl px-4 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
        >
          Skip & see results →
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-neutral-700">First name (optional)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Kyle"
          />
        </div>

        {leadChannel === 'email' && (
          <div>
            <label className="text-xs font-semibold text-neutral-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@email.com"
            />
          </div>
        )}

        {leadChannel === 'sms' && (
          <div>
            <label className="text-xs font-semibold text-neutral-700">Mobile number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="(317) 555-1234"
              inputMode="tel"
            />
            <label className="mt-3 flex items-start gap-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Yes — text me my results + occasional offers. Msg &amp; data rates may apply. Reply STOP to opt out.
              </span>
            </label>
          </div>
        )}
      </div>

      {(leadChannel === 'sms' || leadChannel === 'email') && (
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => {
              // light validation here; stricter logic is in page handlers
              if (leadChannel === 'email' && email && !isValidEmail(email)) return
              if (leadChannel === 'sms' && (!isValidPhone(phone) || !smsConsent)) return
              onSubmit()
            }}
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Send & show my results →
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition bg-white text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  )
}

function ResultsHeader({ persona, onRestart }) {
  if (!persona) return null
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-widest uppercase text-neutral-500">Your Skinbetter persona</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            {persona.emoji} {persona.name}
          </h2>
          <p className="mt-3 text-neutral-700 text-base sm:text-lg">{persona.tagline}</p>

          <ul className="mt-4 space-y-2 text-neutral-700">
            {persona.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold min-h-[48px] transition text-neutral-900 bg-white ring-1 ring-neutral-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          Retake <span className="ml-2">↻</span>
        </button>
      </div>
    </div>
  )
}

function ProductCard({ product, rank, onClick }) {
  if (!product) return null
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className="group rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div className="relative aspect-[4/3] bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.img}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900 ring-1 ring-neutral-200">
          {rank}
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-neutral-500">{product.brand} • {product.format}</p>
        <h3 className="mt-1 font-extrabold tracking-tight text-neutral-900 leading-snug">
          {product.name}
        </h3>
        <p className="mt-2 text-sm text-neutral-600">{product.why}</p>

        <div className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
          View product <span className="ml-1">→</span>
        </div>
      </div>
    </a>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">{title}</h3>
      <div className="mt-3 sm:mt-4">{children}</div>
    </div>
  )
}

function Arrow() {
  return (
    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}
