// pages/landing/spf-quiz.js
// RELUXE • Colorescience SPF Finder Quiz (high-end interactive, GA4/Meta tracked)

import Head from 'next/head'
import { useEffect, useMemo, useRef, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'
import { AnimatePresence, motion } from 'framer-motion'

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const PAGE_NAME = 'SPF Finder Quiz'
const PAGE_PATH = '/landing/spf-quiz'
const BRAND = 'RELUXE Med Spa'
const LOCATION_TAGLINE = 'Carmel & Westfield, IN'
const COMPLETION_EMAIL_TO = 'hello@reluxemedspa.com' // server also sends here every completion

// Optional: note shown on page
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

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, payload)
    } catch (_) {}
  }

  // GA4 via gtag
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, payload)
    } catch (_) {}
  }

  // GTM / dataLayer
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...payload })
  }
}

/** =========================
 * Utilities
 * ========================= */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function makeSessionId() {
  // No dependency; good enough for correlation
  return `spf_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function isValidEmail(v) {
  const s = String(v || '').trim()
  if (!s) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function normalizePhoneDigits(v) {
  const digits = String(v || '').replace(/[^\d]/g, '')
  // keep last 10 if 11 and leading 1
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}

function isValidPhone(v) {
  const d = normalizePhoneDigits(v)
  return d.length === 10
}

/** =========================
 * Product Catalog (easy edit)
 * - Update image path + URLs here only
 * - Images should live in /public/images/products/spf/
 * ========================= */
const PRODUCTS = {
  brush_spf50: {
    id: 'brush_spf50',
    brand: 'Colorescience',
    name: 'Sunforgettable® Total Protection® Brush-On Shield SPF 50',
    why: 'Best for effortless reapplication + makeup-friendly touch-ups.',
    format: 'Brush',
    img: '/images/products/spf/colorescience-brush-on-shield-spf50.jpg',
    url: 'https://www.colorescience.com/products/sunforgettable-total-protection-brush-on-shield-spf-50?designate-location=25130',
  },
  flex_spf50: {
    id: 'flex_spf50',
    brand: 'Colorescience',
    name: 'Sunforgettable® Total Protection® Face Shield Flex SPF 50',
    why: 'Tinted mineral SPF with tone-adapting coverage for everyday wear.',
    format: 'Liquid (Tinted)',
    img: '/images/products/spf/colorescience-face-shield-flex-spf50.jpg',
    url: 'https://www.colorescience.com/products/sunforgettable-total-protection-face-shield-flex-spf-50?designate-location=25130',
  },
  sport_stick_spf50: {
    id: 'sport_stick_spf50',
    brand: 'Colorescience',
    name: 'Sunforgettable® Total Protection® Sport Stick SPF 50',
    why: 'On-the-go durability for outdoor days, sweat, and sports.',
    format: 'Stick',
    img: '/images/products/spf/colorescience-sport-stick-spf50.jpg',
    url: 'https://www.colorescience.com/products/sunforgettable-total-protection-sport-stick-spf-50?designate-location=25130',
  },
  noshow_spf50: {
    id: 'noshow_spf50',
    brand: 'Colorescience',
    name: 'Total Protection® No-Show™ Mineral Sunscreen SPF 50',
    why: 'Sheer mineral SPF that looks like skin — great for many skin tones.',
    format: 'Liquid (Untinted)',
    img: '/images/products/spf/colorescience-no-show-mineral-spf50.jpg',
    url: 'https://www.colorescience.com/products/total-protection-no-show-mineral-sunscreen-spf-50?designate-location=25130',
  },
}

/** =========================
 * Personas
 * V1: 2–3 product recommendations
 * ========================= */
const PERSONAS = {
  everyday_glow_getter: {
    id: 'everyday_glow_getter',
    emoji: '🌞',
    name: 'Everyday Glow Getter',
    tagline: 'Daily protection that fits your life — no fuss, no skipping days.',
    bullets: [
      'You want SPF that layers easily and feels “routine-proof.”',
      'Convenience + reapplication matter to you.',
      'You want protection that looks good in real life.',
    ],
    recommended: ['flex_spf50', 'noshow_spf50', 'brush_spf50'],
    primaryCtaLabel: 'Shop My Best Match',
    bundleCtaLabel: 'Get the Full SPF Set',
  },
  outdoor_mvp: {
    id: 'outdoor_mvp',
    emoji: '🏖️',
    name: 'Outdoor MVP',
    tagline: 'Sun, sweat, and outdoor days — you need SPF that can keep up.',
    bullets: [
      'You’re outdoors a lot (or when you are, you go hard).',
      'Durability matters: movement, sweat, water, and reapplication.',
      'You want something easy to throw in a bag and use anywhere.',
    ],
    recommended: ['sport_stick_spf50', 'noshow_spf50', 'brush_spf50'],
    primaryCtaLabel: 'Shop My Best Match',
    bundleCtaLabel: 'Build My SPF Kit',
  },
  on_the_go_protector: {
    id: 'on_the_go_protector',
    emoji: '✈️',
    name: 'On-the-Go Protector',
    tagline: 'Portable, quick, and easy — SPF that lives in your bag.',
    bullets: [
      'You want the easiest possible way to reapply SPF.',
      'You need something compact and mess-free.',
      'You’ll actually use it because it’s always nearby.',
    ],
    recommended: ['brush_spf50', 'sport_stick_spf50', 'noshow_spf50'],
    primaryCtaLabel: 'Shop My Best Match',
    bundleCtaLabel: 'Get the Travel Set',
  },
  family_defender: {
    id: 'family_defender',
    emoji: '👨‍👩‍👧',
    name: 'Family Defender',
    tagline: 'Simple, versatile SPF that works for the whole crew.',
    bullets: [
      'You want coverage that’s easy and dependable.',
      'You’re thinking about convenience (and compliance).',
      'You want options that work in multiple situations.',
    ],
    recommended: ['noshow_spf50', 'sport_stick_spf50', 'brush_spf50'],
    primaryCtaLabel: 'Shop My Best Match',
    bundleCtaLabel: 'Get the Family SPF Set',
  },
  sensitive_skin_pro: {
    id: 'sensitive_skin_pro',
    emoji: '🌸',
    name: 'Sensitive-Skin Pro',
    tagline: 'Gentle, mineral-first SPF that feels good on reactive skin.',
    bullets: [
      'You want simple, trustworthy protection.',
      'You prefer formulas that feel comfortable and wear well.',
      'You want options that won’t make your skin feel “angry.”',
    ],
    recommended: ['noshow_spf50', 'brush_spf50', 'flex_spf50'],
    primaryCtaLabel: 'Shop My Best Match',
    bundleCtaLabel: 'Get the Calm SPF Set',
  },
}

/** =========================
 * Quiz definition (locked)
 * - Q2 is multi-select (max 2)
 * ========================= */
const QUIZ = [
  {
    id: 'q1_for_who',
    type: 'single',
    title: 'Who are you shopping for?',
    subtitle: 'Pick the closest match.',
    options: [
      { id: 'me', label: 'Me', emoji: '🙋‍♀️' },
      { id: 'him', label: 'For him', emoji: '👨' },
      { id: 'kids', label: 'Kids / family', emoji: '👩‍👧' },
      { id: 'multiple', label: 'Multiple people', emoji: '👨‍👩‍👧' },
    ],
  },
  {
    id: 'q2_usage',
    type: 'multi',
    max: 2,
    title: 'How will you mostly use SPF?',
    subtitle: 'Select up to 2.',
    options: [
      { id: 'daily', label: 'Everyday / daily wear', emoji: '🌞' },
      { id: 'outdoor', label: 'Outdoor & beach days', emoji: '🏖️' },
      { id: 'water_sweat', label: 'Swimming / sweating', emoji: '🏊' },
      { id: 'sports', label: 'Sports & activities', emoji: '🎿' },
      { id: 'travel', label: 'Travel & on-the-go', emoji: '✈️' },
    ],
  },
  {
    id: 'q3_apply',
    type: 'single',
    title: 'How do you prefer to apply SPF?',
    subtitle: 'Choose what you’ll actually use.',
    options: [
      { id: 'brush', label: 'Brush-on / powder', emoji: '🖌' },
      { id: 'liquid', label: 'Liquid or lotion', emoji: '🧴' },
      { id: 'stick', label: 'Stick', emoji: '🧼' },
      { id: 'help', label: 'Not sure — help me choose', emoji: '🤝' },
    ],
  },
  {
    id: 'q4_store',
    type: 'single',
    title: 'Where will you keep it most of the time?',
    subtitle: 'Think “where will I actually reach for it?”',
    options: [
      { id: 'purse', label: 'Purse or bag', emoji: '👛' },
      { id: 'home', label: 'At home', emoji: '🏠' },
      { id: 'beach', label: 'Beach / pool bag', emoji: '🏖️' },
      { id: 'golf_gym', label: 'Golf bag / gym bag', emoji: '🏌️' },
      { id: 'travel_kit', label: 'Travel kit', emoji: '🧳' },
    ],
  },
  {
    id: 'q5_skin',
    type: 'single_optional',
    title: 'Anything we should keep in mind about your skin?',
    subtitle: 'Optional — but helps us personalize.',
    options: [
      { id: 'sensitive', label: 'Sensitive or reactive', emoji: '🌸' },
      { id: 'fair', label: 'Very fair / burns easily', emoji: '🌞' },
      { id: 'deeper', label: 'Deeper skin tone', emoji: '🌎' },
      { id: 'oily', label: 'Acne-prone or oily', emoji: '✨' },
      { id: 'none', label: 'No major concerns', emoji: '👍' },
    ],
  },
]

/** =========================
 * Persona logic (simple & effective)
 * Primary drivers: Q2 usage + Q5 sensitive
 * Secondary: storage + family
 * ========================= */
function computePersona(answers) {
  const a1 = answers.q1_for_who
  const a2 = answers.q2_usage || []
  const a4 = answers.q4_store
  const a5 = answers.q5_skin

  if (a5 === 'sensitive') return PERSONAS.sensitive_skin_pro
  if (a2.includes('water_sweat') || a2.includes('sports') || a2.includes('outdoor')) return PERSONAS.outdoor_mvp
  if (a2.includes('travel') || a4 === 'purse' || a4 === 'travel_kit') return PERSONAS.on_the_go_protector
  if (a1 === 'kids' || a1 === 'multiple') return PERSONAS.family_defender
  return PERSONAS.everyday_glow_getter
}

export default function SpfQuizLandingPage() {
  // quiz flow
  const [started, setStarted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0) // 0..totalSteps-1 quiz, totalSteps = optional lead step
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  // lead capture
  const [leadChannel, setLeadChannel] = useState(null) // 'sms' | 'email' | null
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)

  // whether lead was captured (pre-results OR inline on results)
  const [leadCaptured, setLeadCaptured] = useState(false)
  const [leadCaptureSource, setLeadCaptureSource] = useState(null) // 'bonus_step' | 'results_inline' | 'skipped'

  // API status for inline lead submit
  const [leadSubmitStatus, setLeadSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [leadSubmitting, setLeadSubmitting] = useState(false)

  // completion email: send once per session completion
  const [completionSent, setCompletionSent] = useState(false)

  // session id for correlation in emails
  const [sessionId, setSessionId] = useState('')
  const completionSentRef = useRef(false)

  const totalSteps = QUIZ.length
  const isBonusStep = started && !showResults && stepIndex === totalSteps
  const current = stepIndex < totalSteps ? QUIZ[stepIndex] : null

  const persona = useMemo(() => computePersona(answers), [answers])
  const recProducts = useMemo(
    () => (persona?.recommended || []).map((id) => PRODUCTS[id]).filter(Boolean),
    [persona]
  )

  // init session id (persist)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const existing = window.localStorage.getItem('reluxe_spf_quiz_session')
      if (existing) {
        setSessionId(existing)
      } else {
        const sid = makeSessionId()
        window.localStorage.setItem('reluxe_spf_quiz_session', sid)
        setSessionId(sid)
      }
    } catch (_) {
      setSessionId(makeSessionId())
    }
  }, [])

  // page view
  useEffect(() => {
    trackEvent('spf_quiz_view', { page: PAGE_PATH })
  }, [])

  // question view tracking
  useEffect(() => {
    if (!started || showResults) return
    if (stepIndex < totalSteps) {
      trackEvent('spf_question_view', {
        step_index: stepIndex + 1,
        step_id: current?.id,
        step_type: current?.type,
      })
    } else {
      trackEvent('spf_lead_step_view', { placement: 'post_quiz_bonus_step' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, showResults, stepIndex])

  // persist local progress (helps with drop-offs)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const payload = {
        sessionId,
        started,
        stepIndex,
        answers,
        showResults,
        leadCaptured,
        leadCaptureSource,
        name,
        email,
        phone,
        smsConsent,
        ts: Date.now(),
      }
      window.localStorage.setItem('reluxe_spf_quiz_state', JSON.stringify(payload))
    } catch (_) {}
  }, [sessionId, started, stepIndex, answers, showResults, leadCaptured, leadCaptureSource, name, email, phone, smsConsent])

  useEffect(() => {
    // Auto-start so Q1 is visible on landing
    if (!started && !showResults) {
        beginQuiz({ silent: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


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
    setLeadSubmitStatus(null)
    setCompletionSent(false)
    completionSentRef.current = false

    trackEvent('spf_quiz_start', { placement: silent ? 'auto' : 'hero' })
    }


  function restart() {
    trackEvent('spf_quiz_restart', { from: showResults ? 'results' : 'quiz' })
    beginQuiz()
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function canGoNext() {
    // bonus step: always optional
    if (stepIndex === totalSteps) return true
    const q = current
    if (!q) return false
    const v = answers[q.id]

    if (q.type === 'single_optional') return true
    if (q.type === 'single') return typeof v === 'string' && v.length > 0
    if (q.type === 'multi') return Array.isArray(v) && v.length > 0
    return false
  }

  function next() {
    // moving through quiz steps only
    if (stepIndex < totalSteps) {
      trackEvent('spf_question_next', {
        step_index: stepIndex + 1,
        step_id: current?.id,
        answered: Boolean(
          answers[current?.id] &&
            (Array.isArray(answers[current?.id]) ? answers[current?.id].length : true)
        ),
      })

      // last quiz question -> go to bonus (optional) step
      if (stepIndex >= totalSteps - 1) {
        setStepIndex(totalSteps)
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      setStepIndex((s) => clamp(s + 1, 0, totalSteps))
    }
  }

  function back() {
    if (stepIndex === totalSteps) {
      trackEvent('spf_lead_back_to_quiz', {})
      setStepIndex(totalSteps - 1)
      return
    }
    trackEvent('spf_question_back', { step_index: stepIndex + 1, step_id: current?.id })
    setStepIndex((s) => clamp(s - 1, 0, totalSteps))
  }

  function selectOption(question, optionId) {
    const qid = question.id

    if (question.type === 'multi') {
      const max = question.max || 2
      const existing = Array.isArray(answers[qid]) ? answers[qid] : []
      const isSelected = existing.includes(optionId)

      let nextArr = existing
      if (isSelected) {
        nextArr = existing.filter((x) => x !== optionId)
        trackEvent('spf_answer_deselect', { step_id: qid, option_id: optionId })
      } else {
        if (existing.length >= max) {
          // replace oldest for better UX
          nextArr = [...existing.slice(1), optionId]
        } else {
          nextArr = [...existing, optionId]
        }
        trackEvent('spf_answer_select', { step_id: qid, option_id: optionId })
      }

      setAnswers((prev) => ({ ...prev, [qid]: nextArr }))
      return
    }

    // single / optional single
    setAnswers((prev) => ({ ...prev, [qid]: optionId }))
    trackEvent('spf_answer_select', { step_id: qid, option_id: optionId })
  }

  async function sendCompletionEmailOnce(finalPayload) {
    if (completionSentRef.current) return
    completionSentRef.current = true
    setCompletionSent(true)

    trackEvent('spf_completion_email_attempt', { session_id: sessionId })

    try {
      const res = await fetch('/api/spf-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      })
      if (!res.ok) throw new Error('Bad response')
      trackEvent('spf_completion_email_success', { session_id: sessionId })
    } catch (e) {
      // do not block user
      trackEvent('spf_completion_email_error', { session_id: sessionId, message: String(e?.message || e) })
    }
  }

  function buildCompletionPayload(extra = {}) {
    const finalPersona = computePersona(answers)
    return {
      eventType: 'quiz_complete',
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
      persona: { id: finalPersona?.id, name: finalPersona?.name },
      recommendations: (finalPersona?.recommended || []).map((pid) => PRODUCTS[pid]).filter(Boolean),
      answers,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...extra,
    }
  }

  function showFinalResults({ leadSource = 'skipped', leadWasCaptured = false, leadChannelOverride = null } = {}) {
    const finalPersona = computePersona(answers)
    setShowResults(true)

    trackEvent('spf_quiz_complete', {
      session_id: sessionId,
      persona_id: finalPersona?.id,
      persona_name: finalPersona?.name,
    })
    trackEvent('spf_persona_view', {
      session_id: sessionId,
      persona_id: finalPersona?.id,
      persona_name: finalPersona?.name,
    })

    // mark lead source in state (used to show/hide inline form)
    setLeadCaptureSource(leadSource)
    setLeadCaptured(Boolean(leadWasCaptured))

    // send completion email (always)
    const payload = buildCompletionPayload({
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

  function handleBonusSkip() {
    trackEvent('spf_lead_skip', { session_id: sessionId })
    showFinalResults({ leadSource: 'skipped', leadWasCaptured: false, leadChannelOverride: null })
  }

  function handleBonusChooseChannel(ch) {
    setLeadChannel(ch)
    trackEvent('spf_lead_channel_select', { session_id: sessionId, channel: ch })
  }

  function handleBonusSubmit() {
    // optional step, but if they submit we store it and proceed
    const ch = leadChannel
    const trimmedName = (name || '').trim()
    const trimmedEmail = (email || '').trim()
    const normalizedPhone = normalizePhoneDigits(phone || '')

    if (ch === 'email') {
      if (trimmedEmail && !isValidEmail(trimmedEmail)) {
        trackEvent('spf_lead_validation_error', { session_id: sessionId, channel: ch, reason: 'bad_email' })
        return
      }
    }
    if (ch === 'sms') {
      if (!isValidPhone(normalizedPhone)) {
        trackEvent('spf_lead_validation_error', { session_id: sessionId, channel: ch, reason: 'bad_phone' })
        return
      }
      if (!smsConsent) {
        trackEvent('spf_lead_validation_error', { session_id: sessionId, channel: ch, reason: 'no_consent' })
        return
      }
    }

    trackEvent('spf_lead_submit', {
      session_id: sessionId,
      channel: ch,
      has_name: Boolean(trimmedName),
      has_email: Boolean(trimmedEmail),
      has_phone: Boolean(normalizedPhone),
    })

    // Mark captured + source
    setLeadCaptured(true)
    setLeadCaptureSource('bonus_step')

    // Show results (completion email will include lead data)
    showFinalResults({ leadSource: 'bonus_step', leadWasCaptured: true, leadChannelOverride: ch })
  }

  async function submitInlineLeadUnderResults() {
    // This is for people who SKIPPED bonus step.
    // It emails you a "lead_update" with the same quiz data + lead.
    const trimmedName = (name || '').trim()
    const trimmedEmail = (email || '').trim()
    const normalizedPhone = normalizePhoneDigits(phone || '')

    // require at least one contact method
    if (!trimmedEmail && !normalizedPhone) {
      setLeadSubmitStatus('error')
      trackEvent('spf_results_inline_validation_error', { session_id: sessionId, reason: 'no_contact' })
      return
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setLeadSubmitStatus('error')
      trackEvent('spf_results_inline_validation_error', { session_id: sessionId, reason: 'bad_email' })
      return
    }

    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      setLeadSubmitStatus('error')
      trackEvent('spf_results_inline_validation_error', { session_id: sessionId, reason: 'bad_phone' })
      return
    }

    if (normalizedPhone && !smsConsent) {
      setLeadSubmitStatus('error')
      trackEvent('spf_results_inline_validation_error', { session_id: sessionId, reason: 'no_consent' })
      return
    }

    setLeadSubmitting(true)
    setLeadSubmitStatus(null)

    trackEvent('spf_results_inline_submit', {
      session_id: sessionId,
      has_name: Boolean(trimmedName),
      has_email: Boolean(trimmedEmail),
      has_phone: Boolean(normalizedPhone),
    })

    try {
      const payload = buildCompletionPayload({
        eventType: 'lead_update_after_results',
        lead: {
          captured: true,
          source: 'results_inline',
          channel: normalizedPhone ? 'sms' : 'email',
          name: trimmedName || null,
          email: trimmedEmail || null,
          phone: normalizedPhone || null,
          smsConsent: Boolean(smsConsent),
        },
      })

      const res = await fetch('/api/spf-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Bad response')

      setLeadSubmitStatus('success')
      setLeadCaptured(true)
      setLeadCaptureSource('results_inline')

      trackEvent('spf_results_inline_submit_success', { session_id: sessionId })
    } catch (e) {
      setLeadSubmitStatus('error')
      trackEvent('spf_results_inline_submit_error', { session_id: sessionId, message: String(e?.message || e) })
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
          content="A fun, fast SPF quiz that matches you to the right Colorescience sunscreen format — daily, travel, outdoor, family, and more."
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta property="og:title" content={`${PAGE_NAME} | ${BRAND}`} />
        <meta property="og:description" content="Find your SPF match in under 45 seconds." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://reluxemedspa.com${PAGE_PATH}`} />
        <meta property="og:image" content="https://reluxemedspa.com/images/landing/spf-quiz-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* Compact Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.20),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
            <div className="max-w-4xl text-white">
            <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
                {BRAND} • {LOCATION_TAGLINE}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Which SPF is right for you?
            </h1>
            <p className="mt-2 text-neutral-300 text-sm sm:text-base">
                45 seconds. Fun. Personalized. <span className="text-neutral-400">{PARTNER_NOTE}</span>
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

                {/* Quiz question steps */}
                {stepIndex < totalSteps && (
                  <QuizCard
                    question={current}
                    answers={answers}
                    onSelect={(optionId) => selectOption(current, optionId)}
                  />
                )}

                {/* Bonus lead step (optional) */}
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
                    onChooseChannel={handleBonusChooseChannel}
                    onSkip={handleBonusSkip}
                    onSubmit={handleBonusSubmit}
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
                      onClick={next}
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

                <Card title="Your recommended SPF picks">
                  <p className="text-sm text-neutral-600">
                    2–3 curated options based on your answers. Choose one — or grab the set if you want it easy.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {recProducts.map((p, idx) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        rank={idx === 0 ? 'Top Pick' : (idx === 1 ? 'Great Alt' : 'Power Move')}
                        onClick={() => {
                          trackEvent('spf_product_click', {
                            session_id: sessionId,
                            persona_id: persona?.id,
                            product_id: p.id,
                            product_name: p.name,
                            rank: idx + 1,
                          })
                        }}
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={recProducts?.[0]?.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackEvent('spf_primary_cta_click', { session_id: sessionId, persona_id: persona?.id, product_id: recProducts?.[0]?.id })}
                      className="group inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition bg-neutral-900 text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {persona?.primaryCtaLabel || 'Shop My Best Match'} <Arrow />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        trackEvent('spf_bundle_cta_click', { session_id: sessionId, persona_id: persona?.id, products: recProducts.map((p) => p.id) })
                        // v1 bundle simulation: open all product links in new tabs
                        recProducts.forEach((p, i) => {
                          setTimeout(() => {
                            try { window.open(p.url, '_blank', 'noopener,noreferrer') } catch (_) {}
                          }, i * 220)
                        })
                      }}
                      className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] transition text-neutral-900 bg-white ring-1 ring-neutral-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {persona?.bundleCtaLabel || 'Get the Full SPF Set'}
                    </button>
                  </div>

                  <p className="mt-3 text-[11px] text-neutral-500">{PARTNER_NOTE}</p>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {completionSent ? '✅ Completion logged.' : 'Logging completion…'}
                  </p>
                </Card>

                {/* Inline lead form ONLY if they did NOT complete the bonus step */}
                {!leadCaptured && leadCaptureSource !== 'bonus_step' && (
                  <Card title="Want your persona + personalized plan sent to you?">
                    <p className="text-sm text-neutral-600">
                      Totally optional — we’ll send your persona + picks + a quick “how to use it” routine.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-neutral-700">First name (optional)</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="First Name"
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
                          trackEvent('spf_results_inline_skip', { session_id: sessionId })
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

                    <p className="mt-3 text-[11px] text-neutral-500">
                      We always send the quiz completion to our team for analytics. This just adds your contact info + the plan.
                    </p>
                  </Card>
                )}

                {/* How it works */}
                <div id="how-it-works">
                  <Card title="How it works">
                    <div className="grid gap-4 sm:grid-cols-3 text-sm text-neutral-700">
                      <div className="rounded-2xl bg-neutral-100 p-4">
                        <p className="font-semibold">1) Answer 4–5 quick questions</p>
                        <p className="mt-1 text-neutral-600">Designed for speed — no overthinking.</p>
                      </div>
                      <div className="rounded-2xl bg-neutral-100 p-4">
                        <p className="font-semibold">2) Get a fun SPF persona</p>
                        <p className="mt-1 text-neutral-600">It’s a vibe — and it’s practical.</p>
                      </div>
                      <div className="rounded-2xl bg-neutral-100 p-4">
                        <p className="font-semibold">3) Shop 2–3 curated picks</p>
                        <p className="mt-1 text-neutral-600">Choose one, or grab the set.</p>
                      </div>
                    </div>
                  </Card>
                </div>

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
  const isMulti = question.type === 'multi'

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-sm">
      <p className="text-[11px] tracking-widest uppercase text-neutral-500">SPF Quiz</p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
        {question.title}
      </h2>
      <p className="mt-2 text-sm text-neutral-600">{question.subtitle}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {question.options.map((opt) => {
          const selected = isMulti
            ? Array.isArray(v) && v.includes(opt.id)
            : v === opt.id

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

      {question.type === 'multi' && (
        <p className="mt-3 text-[11px] text-neutral-500">
          Pick up to {question.max || 2}. If you pick more, we’ll keep your newest choices.
        </p>
      )}
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
        Want your SPF match sent to you?
      </h2>
      <p className="mt-2 text-sm text-neutral-600">
        We’ll send your persona + picks + a quick “how to use it” routine. Totally optional.
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
            placeholder="First Name"
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
            <p className="mt-2 text-[11px] text-neutral-500">Optional. You can still skip and see results.</p>
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
            onClick={onSubmit}
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

      <p className="mt-3 text-[11px] text-neutral-500">
        This is optional and won’t change your results.
      </p>
    </div>
  )
}

function ResultsHeader({ persona, onRestart }) {
  if (!persona) return null
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-widest uppercase text-neutral-500">Your SPF persona</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            {persona.emoji} The {persona.name}
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
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
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

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
      <span>{children}</span>
    </li>
  )
}

function Arrow() {
  return (
    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}