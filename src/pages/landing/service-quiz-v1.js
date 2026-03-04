// src/pages/landing/service-quiz.js
// RELUXE Service Match Quiz (Phase 1)
// - Never "consult-only" result; always recommend a best first service
// - CTA area has TWO buttons: Book service OR Getting Started with RELUXE (consult)
// - Lead capture upgraded: send plan + routine + $25 credit (code QUIZ) via SMS/Email
// - Optional lead step + inline lead under results (only if skipped)
// - Posts completion + lead to /api/quiz-service-results (server-only)

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
  getting_started: '/book/consult',
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
    title: 'What\u2019s your main goal right now?',
    subtitle: 'What are you hoping to improve most?',
    options: [
      { id: 'wrinkles', label: 'Fine lines or wrinkles' },
      { id: 'tone_texture', label: 'Texture, tone, or sun damage' },
      { id: 'breakouts', label: 'Breakouts or congestion' },
      { id: 'dull', label: 'Dull, tired-looking skin' },
      { id: 'body', label: 'Body concerns (tone, shape, smoothing)' },
      { id: 'not_sure', label: 'I\u2019m not sure \u2014 I want guidance' },
    ],
  },
  {
    id: 'q2_style',
    title: 'How do you like to make decisions?',
    subtitle: 'Be honest \u2014 which sounds most like you?',
    options: [
      { id: 'guided', label: 'I want an expert to guide me before committing' },
      { id: 'research', label: 'I do my research and decide quickly' },
      { id: 'advanced', label: 'I want visible results, even if it\u2019s more advanced' },
      { id: 'low_commit', label: 'I prefer low-commitment, easy maintenance' },
    ],
  },
  {
    id: 'q3_comfort',
    title: 'Which feels most comfortable right now?',
    subtitle: 'There\u2019s no wrong answer.',
    options: [
      { id: 'small', label: 'I want to start small and build' },
      { id: 'mid', label: 'I\u2019m comfortable with mid-range treatments' },
      { id: 'premium', label: 'I\u2019m open to premium results' },
      { id: 'unsure', label: 'I\u2019m not sure yet' },
    ],
  },
  {
    id: 'q4_timing',
    title: 'When are you hoping to start?',
    subtitle: null,
    options: [
      { id: 'asap', label: 'As soon as possible' },
      { id: 'weeks', label: 'In the next few weeks' },
      { id: 'exploring', label: 'I\u2019m just exploring' },
    ],
  },
]

/** =========================
 * SERVICES
 * ========================= */
const SERVICES = {
  monthly_facial: { key: 'monthly_facial', name: '$99 Monthly Facial', price: '$99/mo', image: '/images/quiz/services/monthly-facial.jpg', blurb: 'Low-commitment consistency. Great for maintenance and momentum.', routine: 'Best for: maintenance + "keep me on track" routines.' },
  signature_facial: { key: 'signature_facial', name: 'Signature Facial', price: '$150', image: '/images/quiz/services/signature-facial.jpg', blurb: 'The classic \u201creset.\u201d Clean, calm, refreshed \u2014 perfect first facial.', routine: 'Best for: a fresh start and a great first RELUXE experience.' },
  glo2: { key: 'glo2', name: 'Glo2Facial', price: '$250', image: '/images/quiz/services/glo2.jpg', blurb: 'Glow-forward and fun. Great when you want visible results without downtime.', routine: 'Best for: instant glow + \u201cI want to see it\u201d results.' },
  hydrafacial: { key: 'hydrafacial', name: 'HydraFacial', price: '$275', image: '/images/quiz/services/hydrafacial.jpg', blurb: 'Trusted, noticeable, and worth it \u2014 especially for texture + congestion.', routine: 'Best for: congestion/texture and a reliable \u201cwow\u201d clean feeling.' },
  jeuveau: { key: 'jeuveau', name: 'Jeuveau', price: '$380', image: '/images/quiz/services/jeuveau.jpg', blurb: 'A high-value \u201cline softener\u201d for common wrinkle areas (customized dosing).', routine: 'Best for: first-time tox or value-focused wrinkle softening.' },
  daxxify: { key: 'daxxify', name: 'Daxxify', price: '$580', image: '/images/quiz/services/daxxify.jpg', blurb: 'Premium, longevity-minded tox for people who want fewer visits.', routine: 'Best for: premium results + fewer maintenance visits.' },
  ipl_clearlift: { key: 'ipl_clearlift', name: 'IPL / ClearLift', price: 'Device consult recommended', image: '/images/quiz/services/ipl-clearlift.jpg', blurb: 'Tone, sun damage, redness, and texture \u2014 the \u201cskin reset\u201d category.', routine: 'Best for: sun damage/redness/uneven tone (plan-based results).' },
  vascupen: { key: 'vascupen', name: 'VascuPen', price: 'Targeted treatment', image: '/images/quiz/services/vascupen.jpg', blurb: 'Precision-focused help for small, stubborn concerns.', routine: 'Best for: targeted issues that bother you every time you look in the mirror.' },
  evolve_body: { key: 'evolve_body', name: 'Evolve Body', price: 'Body consult recommended', image: '/images/quiz/services/evolve.jpg', blurb: 'Tone + smoothing + shape support \u2014 for body goals without major downtime.', routine: 'Best for: body contouring and \u201cI want a plan\u201d goals.' },
}

/** =========================
 * PERSONAS
 * ========================= */
const PERSONAS = {
  maintenance_maven: { key: 'maintenance_maven', emoji: '\ud83d\uddd3\ufe0f', title: 'The Maintenance Maven', vibe: 'Consistency > intensity. You\u2019ll get results the smart way.', bullets: ['Low-commitment and repeatable', 'Perfect for routines', 'Build momentum month to month'], serviceKey: 'monthly_facial' },
  classic_client: { key: 'classic_client', emoji: '\u2728', title: 'The Classic Skincare Client', vibe: 'You want a great experience and great skin \u2014 no drama.', bullets: ['Refreshing, reliable, straightforward', 'Great first facial', 'Perfect \u201creset\u201d'], serviceKey: 'signature_facial' },
  glow_seeker: { key: 'glow_seeker', emoji: '\ud83c\udf1f', title: 'The Glow Seeker', vibe: 'You want visible results fast \u2014 and you love a glow moment.', bullets: ['Instant gratification energy', 'Zero downtime vibe', 'Great for events and \u201cboosts\u201d'], serviceKey: 'glo2' },
  results_pro: { key: 'results_pro', emoji: '\ud83d\udcc8', title: 'The Results-Driven Professional', vibe: 'Efficient, proven, and worth it. You want payoff.', bullets: ['Trusted results', 'Great for congestion/texture', 'Feels like a \u201creset + polish\u201d'], serviceKey: 'hydrafacial' },
  line_softener: { key: 'line_softener', emoji: '\ud83d\ude42', title: 'The Line Softener', vibe: 'You\u2019re here for smoother. Period.', bullets: ['Wrinkles are the priority', 'Value-conscious start', 'Great first tox experience'], serviceKey: 'jeuveau' },
  longevity_planner: { key: 'longevity_planner', emoji: '\u23f3', title: 'The Longevity Planner', vibe: 'Premium results, fewer visits. You\u2019re playing chess.', bullets: ['Premium comfort', 'Longevity-minded', 'Ideal for busy schedules'], serviceKey: 'daxxify' },
  skin_resetter: { key: 'skin_resetter', emoji: '\ud83c\udf1e', title: 'The Skin Resetter', vibe: 'You\u2019re ready for a real \u201ctone + texture\u201d reset path.', bullets: ['Sun damage/redness focus', 'Open to devices', 'Best results come from a plan'], serviceKey: 'ipl_clearlift' },
  detail_corrector: { key: 'detail_corrector', emoji: '\ud83c\udfaf', title: 'The Detail Corrector', vibe: 'You\u2019re precise \u2014 and you want a targeted solution.', bullets: ['Small stubborn concerns', 'Not interested in overkill', 'Targeted wins'], serviceKey: 'vascupen' },
  body_optimizer: { key: 'body_optimizer', emoji: '\ud83d\udcaa', title: 'The Body Optimizer', vibe: 'Body goals, but done smart and plan-based.', bullets: ['Tone/smoothing goals', 'Device-forward approach', 'Results-driven'], serviceKey: 'evolve_body' },
}

/** =========================
 * DECISION LOGIC
 * ========================= */
function computePersona(answers) {
  const goal = answers.q1_goal
  const style = answers.q2_style
  const comfort = answers.q3_comfort

  if (goal === 'not_sure' || style === 'guided') return PERSONAS.classic_client
  if (goal === 'body') return PERSONAS.body_optimizer
  if (goal === 'wrinkles') {
    if (comfort === 'premium') return PERSONAS.longevity_planner
    return PERSONAS.line_softener
  }
  if (goal === 'tone_texture') {
    if (style === 'advanced') return PERSONAS.skin_resetter
    return PERSONAS.results_pro
  }
  if (goal === 'breakouts' || goal === 'dull') {
    if (style === 'low_commit' || comfort === 'small') return PERSONAS.maintenance_maven
    if (style === 'advanced' || comfort === 'premium') return PERSONAS.glow_seeker
    return PERSONAS.classic_client
  }
  return PERSONAS.classic_client
}

export default function ServiceQuizV1Page() {
  const [sessionId] = useState(() => makeSessionId())

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showLeadStep, setShowLeadStep] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const [leadChannel, setLeadChannel] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)

  const [leadCaptured, setLeadCaptured] = useState(false)
  const [leadSource, setLeadSource] = useState(null)
  const [leadStatus, setLeadStatus] = useState(null)
  const [sendingLead, setSendingLead] = useState(false)

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

    if (!leadChannel) { setLeadStatus('error'); return }
    if (leadChannel === 'email' && (!em || !isValidEmail(em))) { setLeadStatus('error'); return }
    if (leadChannel === 'sms' && (!ph || !isValidPhone(ph) || !smsConsent)) { setLeadStatus('error'); return }

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
        await goToResults({ lead: { captured: true, source, channel: leadChannel, name: nm, email: leadChannel === 'email' ? em : null, phone: leadChannel === 'sms' ? ph : null, smsConsent } })
      }
    } catch (e) {
      setLeadStatus('error')
      trackEvent('service_lead_submit_error', { session_id: sessionId, message: String(e?.message || e) })
    } finally {
      setSendingLead(false)
    }
  }

  const progressLabel = showResults ? 'Results' : showLeadStep ? 'Bonus (optional)' : `Question ${stepIndex + 1}/${totalSteps}`
  const bookServiceHref = BOOK_LINKS[service?.key] || '/book'
  const consultHref = BOOK_LINKS.getting_started || '/book/getting-started'

  // Shared inline styles
  const inputStyle = {
    marginTop: '0.25rem', width: '100%', borderRadius: '9999px', border: `1px solid ${colors.stone}`,
    padding: '0.75rem 1rem', fontFamily: fonts.body, fontSize: '0.875rem', outline: 'none',
  }
  const channelBtnStyle = (active) => ({
    borderRadius: '1rem', border: active ? `2px solid ${colors.violet}` : `1px solid ${colors.stone}`,
    padding: '0.75rem 1rem', textAlign: 'left', cursor: 'pointer',
    backgroundColor: active ? `${colors.violet}08` : '#fff',
  })

  return (
    <BetaLayout
      title={`What Should I Book? \u2014 Quick Quiz | ${BRAND}`}
      description="Not sure what to book? Take our quick quiz and get one confident starting recommendation."
      canonical={`https://reluxemedspa.com${PAGE_PATH}`}
    >
      {/* Compact hero */}
      <section style={{
        position: 'relative', overflow: 'hidden', backgroundColor: colors.ink,
        backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(16,185,129,0.15), transparent 60%)`,
      }}>
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
          <div style={{ maxWidth: '56rem' }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.muted }}>
              {BRAND} &middot; {LOCATION_TAGLINE}
            </p>
            <h1 style={{
              marginTop: '0.25rem', fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white,
            }}>
              What should I{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>book?</span>
            </h1>
            <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(250,248,245,0.6)' }}>
              45 seconds. Fun. Personalized. <span style={{ color: colors.muted }}>One confident place to start.</span>
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>{progressLabel}</span>
              <button type="button" onClick={resetAll} style={{
                fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(250,248,245,0.7)',
                textDecoration: 'underline', textUnderlineOffset: '4px', background: 'none', border: 'none', cursor: 'pointer',
              }}>Restart</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section style={{ backgroundColor: colors.cream, padding: '1.5rem 0 2rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            {!showResults && (
              <div style={{ padding: '1.5rem' }}>
                {!showLeadStep ? (
                  <>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.muted }}>Quick Match Quiz</p>
                    <h2 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: typeScale.subhead.weight, lineHeight: typeScale.subhead.lineHeight, color: colors.heading }}>{current.title}</h2>
                    {current.subtitle && <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{current.subtitle}</p>}

                    <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {current.options.map((opt) => {
                        const selected = answers[current.id] === opt.id
                        return (
                          <button key={opt.id} type="button" onClick={() => setAnswer(current.id, opt.id)}
                            style={{
                              width: '100%', textAlign: 'left', borderRadius: '1rem',
                              border: selected ? `2px solid ${colors.violet}` : `1px solid ${colors.stone}`,
                              backgroundColor: selected ? `${colors.violet}08` : '#fff',
                              padding: '0.75rem 1rem', cursor: 'pointer', transition: 'border-color 0.15s',
                            }} aria-pressed={selected}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                              <span style={{
                                marginTop: '0.25rem', height: '1rem', width: '1rem', borderRadius: '9999px',
                                border: selected ? `2px solid ${colors.violet}` : `1px solid ${colors.stone}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                {selected && <span style={{ height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.violet }} />}
                              </span>
                              <span style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.9375rem', color: colors.heading }}>{opt.label}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <button type="button" onClick={back} disabled={stepIndex === 0}
                        style={{
                          borderRadius: '9999px', padding: '0.75rem 1rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600,
                          border: `1px solid ${colors.stone}`, backgroundColor: '#fff',
                          color: stepIndex === 0 ? colors.muted : colors.heading,
                          cursor: stepIndex === 0 ? 'not-allowed' : 'pointer', minHeight: '3rem',
                        }}>Back</button>
                      <button type="button" onClick={next}
                        style={{
                          borderRadius: '9999px', padding: '0.75rem 1.5rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600,
                          color: '#fff', background: gradients.primary, border: 'none', cursor: 'pointer',
                          minHeight: '3rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        }}>Next <Arrow /></button>
                    </div>

                    <p style={{ marginTop: '1rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
                      Tip: This quiz suggests a starting point. Your provider customizes your plan.
                    </p>
                  </>
                ) : (
                  <>
                    {/* Lead step with offer */}
                    <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.muted }}>Save your plan + credit</p>
                    <h2 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: typeScale.subhead.weight, color: colors.heading }}>
                      Want your plan + routine + {COUPON_COPY}?
                    </h2>
                    <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>
                      We'll send your recommendation + a simple routine, plus your {COUPON_VALUE} credit code: <strong>{COUPON_CODE}</strong>.
                    </p>

                    <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))', gap: '0.5rem' }}>
                      <button type="button" onClick={() => setLeadChannel('sms')} style={channelBtnStyle(leadChannel === 'sms')}>
                        <p style={{ fontFamily: fonts.body, fontWeight: 700, color: colors.heading }}>Text it to me</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body, marginTop: '0.25rem' }}>Fastest way to save the code + plan.</p>
                      </button>
                      <button type="button" onClick={() => setLeadChannel('email')} style={channelBtnStyle(leadChannel === 'email')}>
                        <p style={{ fontFamily: fonts.body, fontWeight: 700, color: colors.heading }}>Email it to me</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body, marginTop: '0.25rem' }}>Great if you want it saved in your inbox.</p>
                      </button>
                    </div>

                    <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>First name (optional)</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Your Name" />
                      </div>
                      {leadChannel === 'email' && (
                        <div>
                          <label style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>Email</label>
                          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@email.com" inputMode="email" autoComplete="email" />
                        </div>
                      )}
                      {leadChannel === 'sms' && (
                        <>
                          <div>
                            <label style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>Mobile number</label>
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="317-555-1234" inputMode="tel" autoComplete="tel" />
                          </div>
                          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body }}>
                            <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} style={{ marginTop: '0.125rem', height: '1rem', width: '1rem' }} />
                            <span>Yes &mdash; text me my plan + {COUPON_COPY}. Msg &amp; data rates may apply. Reply STOP to opt out.</span>
                          </label>
                        </>
                      )}

                      {leadStatus === 'error' && <div style={{ borderRadius: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', fontFamily: fonts.body, fontSize: '0.875rem', color: '#991b1b' }}>Please pick SMS or email and fill required fields (and consent for SMS).</div>}
                      {leadStatus === 'ok' && <div style={{ borderRadius: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', fontFamily: fonts.body, fontSize: '0.875rem', color: '#065f46' }}>Saved. Sending you to results...</div>}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <button type="button" onClick={() => submitLead({ source: 'bonus_step' })} disabled={sendingLead}
                          style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#fff', background: sendingLead ? colors.muted : gradients.primary, border: 'none', cursor: sendingLead ? 'not-allowed' : 'pointer', minHeight: '3rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          {sendingLead ? 'Sending\u2026' : 'Send my plan + code'} <Arrow />
                        </button>
                        <button type="button" onClick={skipLead}
                          style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, border: `1px solid ${colors.stone}`, color: colors.heading, backgroundColor: '#fff', cursor: 'pointer', minHeight: '3rem' }}>
                          Skip &amp; see results
                        </button>
                      </div>
                      <button type="button" onClick={back}
                        style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted, textDecoration: 'underline', textUnderlineOffset: '4px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        Back to last question
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {showResults && (
              <div style={{ padding: '1.5rem' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.muted }}>Your match</p>
                <h2 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
                  {persona?.emoji} {persona?.title}
                </h2>
                <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, color: colors.body }}>{persona?.vibe}</p>

                <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 10rem), 1fr))' }}>
                  {persona?.bullets?.map((b, i) => (
                    <div key={i} style={{ borderRadius: '1rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, padding: '1rem' }}>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>{b}</p>
                    </div>
                  ))}
                </div>

                {/* Recommended service card */}
                <div style={{ marginTop: '1.5rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))' }}>
                    <div style={{ backgroundColor: colors.cream }}>
                      <img src={service?.image} alt={service?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '4/3', display: 'block' }} loading="eager" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#fff' }}>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.muted }}>Best service to start with</p>
                      <h3 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: typeScale.subhead.weight, color: colors.heading }}>{service?.name}</h3>
                      <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>{service?.price}</p>
                      <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>{service?.blurb}</p>

                      <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))' }}>
                        <a href={bookServiceHref} onClick={() => trackEvent('service_book_click', { session_id: sessionId, service: service?.key, persona: persona?.key })}
                          style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#fff', background: gradients.primary, textDecoration: 'none', minHeight: '3rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          Book {service?.name} <Arrow />
                        </a>
                        <a href={consultHref} onClick={() => trackEvent('service_getting_started_click', { session_id: sessionId, persona: persona?.key })}
                          style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, border: `1px solid ${colors.stone}`, color: colors.heading, textDecoration: 'none', minHeight: '3rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                          Getting Started with RELUXE
                        </a>
                      </div>

                      <div style={{ marginTop: '1rem', borderRadius: '1rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, padding: '1rem' }}>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>Your credit code</p>
                        <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.75rem', backgroundColor: '#fff', padding: '0.5rem 0.75rem', border: `1px solid ${colors.stone}` }}>
                          <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>Use code</span>
                          <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.12em' }}>{COUPON_CODE}</span>
                          <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>for {COUPON_COPY}</span>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>Apply at checkout/booking. Terms may apply. One per new client.</p>
                      </div>

                      <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
                        Completion emailed to the team: {completionSent ? 'sent' : 'sending\u2026'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inline lead capture ONLY if skipped earlier */}
                {!leadCaptured && leadSource !== 'bonus_step' && (
                  <div style={{ marginTop: '1.5rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.5rem' }}>
                    <h4 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>Want to save your plan + routine + {COUPON_COPY}?</h4>
                    <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>We'll send your recommendation + simple routine + code <strong>{COUPON_CODE}</strong>.</p>

                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))', gap: '0.5rem' }}>
                      <button type="button" onClick={() => setLeadChannel('email')} style={channelBtnStyle(leadChannel === 'email')}>
                        <p style={{ fontFamily: fonts.body, fontWeight: 700, color: colors.heading }}>Email me</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body, marginTop: '0.25rem' }}>Save the plan + code in your inbox.</p>
                      </button>
                      <button type="button" onClick={() => setLeadChannel('sms')} style={channelBtnStyle(leadChannel === 'sms')}>
                        <p style={{ fontFamily: fonts.body, fontWeight: 700, color: colors.heading }}>Text me</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body, marginTop: '0.25rem' }}>Fastest way to keep the code handy.</p>
                      </button>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>First name (optional)</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Your Name" />
                      </div>
                      {leadChannel === 'email' && (
                        <div>
                          <label style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>Email</label>
                          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@email.com" />
                        </div>
                      )}
                      {leadChannel === 'sms' && (
                        <>
                          <div>
                            <label style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>Mobile number</label>
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="317-555-1234" inputMode="tel" />
                          </div>
                          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.body }}>
                            <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} style={{ marginTop: '0.125rem', height: '1rem', width: '1rem' }} />
                            <span>Yes &mdash; text me my plan + {COUPON_COPY}. Msg &amp; data rates may apply. Reply STOP to opt out.</span>
                          </label>
                        </>
                      )}
                      {leadStatus === 'error' && <div style={{ borderRadius: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', fontFamily: fonts.body, fontSize: '0.875rem', color: '#991b1b' }}>Please pick SMS or email and fill required fields (and consent for SMS).</div>}
                      {leadStatus === 'ok' && <div style={{ borderRadius: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', fontFamily: fonts.body, fontSize: '0.875rem', color: '#065f46' }}>Saved. Thank you!</div>}
                      <button type="button"
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
                            await postQuiz({ type: 'service_quiz_lead', toEmail: QUIZ_NOTIFY_TO, page: PAGE_PATH, sessionId, submitted_at: new Date().toISOString(), persona: persona?.key, personaTitle: persona?.title, recommendedService: service?.name, recommendedServiceKey: service?.key, coupon: { code: COUPON_CODE, value: COUPON_VALUE }, answers, lead: { captured: true, source: 'results_inline', channel: leadChannel, name: nm, email: leadChannel === 'email' ? em : null, phone: leadChannel === 'sms' ? ph : null, smsConsent: Boolean(smsConsent) } })
                            setLeadCaptured(true)
                            setLeadSource('results_inline')
                            setLeadStatus('ok')
                          } catch (e) { setLeadStatus('error') } finally { setSendingLead(false) }
                        }}
                        disabled={sendingLead}
                        style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#fff', background: sendingLead ? colors.muted : gradients.primary, border: 'none', cursor: sendingLead ? 'not-allowed' : 'pointer', minHeight: '3rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        {sendingLead ? 'Sending\u2026' : 'Send my plan + code'} <Arrow />
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                  <button type="button" onClick={resetAll}
                    style={{ width: '100%', borderRadius: '9999px', padding: '0.75rem 1.5rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, border: `1px solid ${colors.stone}`, backgroundColor: '#fff', color: colors.heading, cursor: 'pointer' }}>
                    Retake quiz
                  </button>
                </div>
              </div>
            )}
          </div>

          {!showResults && <CompletionGuard />}
        </div>
      </section>
    </BetaLayout>
  )
}

ServiceQuizV1Page.getLayout = (page) => page

function CompletionGuard() { return null }

function Arrow() {
  return (
    <svg style={{ height: '1rem', width: '1rem' }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}
