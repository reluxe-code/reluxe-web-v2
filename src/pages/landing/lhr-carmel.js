// pages/landing/lhr-carmel.js
// RELUXE • Laser Hair Removal Consults (Carmel) — High-converting FAQ video landing page

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const PAGE_PATH = '/landing/laser-hair-removal'
const BRAND = 'RELUXE Med Spa'
const FOCUS_LOCATION_LABEL = 'Carmel, IN'

// IMPORTANT: point this to your real Boulevard consult route for Carmel
const BOOK_CONSULT = '/book/laser-consult?loc=carmel'

// Contact
const MARKETING_SMS = '3173609000'
const PHONE_CALL = '3177631142'
const DISPLAY_PHONE = '317-763-1142'

// Video (your esti FAQ reel)
const REEL_URL = 'https://www.instagram.com/reel/DUn02FGDoSu/'
const REEL_EMBED_URL = 'https://www.instagram.com/reel/DUn02FGDoSu/embed'

/** FAQ: tight, ad-matched, fear-reducing */
const FAQS = [
  {
    q: 'Does laser hair removal hurt?',
    a: 'Most people describe quick snaps + warmth. It\u2019s fast, and we\u2019ll keep you comfortable the whole time.',
  },
  {
    q: 'How many sessions will I need?',
    a: 'Hair grows in cycles, so you\u2019ll need multiple sessions. Your plan depends on area, hair density, hormones, and goals\u2014we\u2019ll map it in your consult.',
  },
  {
    q: 'Is it safe for my skin tone?',
    a: 'We\u2019ll confirm candidacy at your consult and tailor settings to you. If you\u2019re a fit, we\u2019ll build a safe plan for your skin and hair.',
  },
  {
    q: 'Should I shave before my treatment?',
    a: 'Yes\u2014shave the area about 24 hours before. Skip waxing/epilating (we need the follicle). We\u2019ll give you the full prep checklist.',
  },
  {
    q: 'When will I see results?',
    a: 'Many clients notice changes after early sessions, and results build with consistency. We\u2019ll set realistic expectations for your hair + skin type.',
  },
  {
    q: 'What areas can be treated?',
    a: 'Face, underarms, bikini, legs, arms, back, chest\u2014most areas are fair game. We\u2019ll confirm what\u2019s best for you in consult.',
  },
]

/** Tracking helper */
function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  const payload = {
    ...params,
    page_path: window.location?.pathname || '',
    page_url: window.location?.href || '',
  }

  if (typeof window.fbq === 'function') {
    try { window.fbq('trackCustom', eventName, payload) } catch {}
  }
  if (typeof window.gtag === 'function') {
    try { window.gtag('event', eventName, payload) } catch {}
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...payload })
  }
}

/** Preserve UTMs into booking link */
function withUTMs(baseHref) {
  if (typeof window === 'undefined') return baseHref
  try {
    const url = new URL(baseHref, window.location.origin)
    const current = new URL(window.location.href)

    ;[
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'fbclid',
      'gclid',
    ].forEach((k) => {
      const v = current.searchParams.get(k)
      if (v && !url.searchParams.get(k)) url.searchParams.set(k, v)
    })

    return url.pathname + (url.search ? url.search : '')
  } catch {
    return baseHref
  }
}

export default function LaserHairRemovalLanding() {
  const [videoOpen, setVideoOpen] = useState(false)

  useEffect(() => {
    if (!videoOpen) return
    const onKey = (e) => e.key === 'Escape' && setVideoOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [videoOpen])

  const consultHref = useMemo(() => withUTMs(BOOK_CONSULT), [])
  const smsBody = encodeURIComponent(
    `Hi RELUXE! I want to start Laser Hair Removal for spring/pool season. Can you help me book a FREE consult in Carmel?`
  )
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const ogDesc =
    'Laser Hair Removal FAQ \u2014 answered. Watch the quick video, then book your free consult in Carmel to get started for spring/pool season.'

  return (
    <BetaLayout
      title="Laser Hair Removal Consult | Carmel"
      description={ogDesc}
      canonical={`https://reluxemedspa.com${PAGE_PATH}`}
    >
      {/* HERO */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18), transparent 60%)`,
        }}
      >
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem 2.5rem' }}>
          <div className="grid lg:grid-cols-12 gap-7 lg:gap-10 items-stretch">
            {/* LEFT */}
            <div className="lg:col-span-7" style={{ color: colors.white, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.letterSpacing, textTransform: 'uppercase', color: colors.muted }}>
                {BRAND} &bull; {FOCUS_LOCATION_LABEL}
              </p>

              <h1 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white }}>
                Laser Hair Removal: Your Most Common Questions &mdash;{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Answered</span>
              </h1>

              <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, fontSize: typeScale.subhead.size, lineHeight: typeScale.subhead.lineHeight, color: colors.white, maxWidth: '42rem' }}>
                You&apos;re not alone. Most people hesitate because they&apos;re unsure what it feels like, how many sessions it takes,
                or whether it&apos;s right for them. Watch the quick FAQ video&mdash;then book your <strong>free consult</strong> so we can build
                a plan for <strong>bikini/pool/spring season</strong>.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <MiniProof title="Free Consult" copy="Candidacy + plan + pricing clarity." />
                <MiniProof title="Fast Answers" copy="Pain, prep, areas, timeline\u2014covered." />
                <MiniProof title="Start Now" copy="Best results come from consistency." />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <TrackedLink href={smsHref} onClick={() => trackEvent('sms_click', { service: 'lhr', placement: 'hero', phone: MARKETING_SMS })}>
                    Text Us (Quick Help)
                  </TrackedLink>
                  <TrackedLink href={callHref} onClick={() => trackEvent('call_click', { service: 'lhr', placement: 'hero', phone: PHONE_CALL })}>
                    Call {DISPLAY_PHONE}
                  </TrackedLink>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', borderRadius: '9999px', backgroundColor: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)', padding: '1rem' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>What happens in your consult</p>
                <ul style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: colors.violet, flexShrink: 0 }} />
                    <span>Confirm you&apos;re a candidate + review skin/hair type</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: colors.violet, flexShrink: 0 }} />
                    <span>Pick areas + create a realistic session plan</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: colors.violet, flexShrink: 0 }} />
                    <span>Answer prep + pain questions so you feel confident</span>
                  </li>
                </ul>
                <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>
                  Goal: you leave knowing exactly what to do next (and what results to expect).
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5 flex flex-col">
              <div style={{ borderRadius: '1.5rem', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: 'rgba(250,248,245,0.05)', padding: '1rem 1.25rem', flex: 1 }}>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.letterSpacing, textTransform: 'uppercase', color: colors.muted }}>Watch the FAQ</p>
                <h3 style={{ marginTop: '0.25rem', fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.white }}>
                  Does it hurt? What areas? How do I start?
                </h3>
                <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>
                  This is the exact consult conversation&mdash;just faster.
                </p>

                {/* Mobile: inline embed */}
                <div className="mt-4 md:hidden" style={{ aspectRatio: '9/16', width: '100%', overflow: 'hidden', borderRadius: '1rem', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: '#000' }}>
                  <iframe
                    src={REEL_EMBED_URL}
                    title="RELUXE Laser Hair Removal FAQ video"
                    className="h-full w-full"
                    style={{ border: 0 }}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>

                {/* Desktop: preview -> modal */}
                <div className="mt-4 hidden md:block">
                  <div style={{ margin: '0 auto', maxWidth: 320 }}>
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent('video_fullscreen_open', { service: 'lhr', placement: 'hero_video' })
                        setVideoOpen(true)
                      }}
                      className="group w-full text-left"
                      aria-label="Open video fullscreen"
                    >
                      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '1rem', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: '#000' }}>
                        <div style={{ aspectRatio: '9/16', maxHeight: 420 }}>
                          <iframe
                            src={REEL_EMBED_URL}
                            title="RELUXE Laser Hair Removal preview"
                            className="h-full w-full"
                            style={{ border: 0 }}
                            scrolling="no"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        </div>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.1), transparent)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(250,248,245,0.1)', padding: '0.375rem 0.75rem', fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.white, border: '1px solid rgba(250,248,245,0.1)' }}>
                            <span style={{ height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: colors.violet }} />
                            Watch fullscreen
                          </span>
                          <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.8)' }}>&nearr;</span>
                        </div>
                      </div>
                    </button>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <TrackedLink href={REEL_URL} primary onClick={() => trackEvent('ig_reel_click', { service: 'lhr', placement: 'video_card' })}>
                        Watch on IG
                      </TrackedLink>
                      <TrackedLink href={consultHref} onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'video_card_cta', location: 'carmel' })}>
                        Book Consult
                      </TrackedLink>
                    </div>
                  </div>
                </div>

                {/* Urgency block */}
                <div style={{ marginTop: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(250,248,245,0.1)', padding: '1rem' }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>Timing matters for spring/pool season</p>
                  <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>
                    If you want smoother skin with less maintenance, the best move is to start now. Your consult makes it simple:
                    we&apos;ll confirm candidacy and map the fastest realistic plan for you.
                  </p>
                  <div style={{ marginTop: '0.75rem' }}>
                    <GravityBookButton fontKey={FONT_KEY} size="hero" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ anchors */}
          <div className="mt-8 grid gap-2 sm:grid-cols-3">
            <QuickJump label="Does it hurt?" to="#faq" />
            <QuickJump label="Skin tone safe?" to="#faq" />
            <QuickJump label="How many sessions?" to="#faq" />
          </div>
        </div>
      </section>

      {videoOpen && (
        <VideoModal
          title="RELUXE Laser Hair Removal FAQ"
          src={REEL_EMBED_URL}
          onClose={() => setVideoOpen(false)}
        />
      )}

      {/* FAQ */}
      <section id="faq" style={{ backgroundColor: colors.cream, padding: '3rem 0 3.5rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1rem' }}>
          <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.letterSpacing, textTransform: 'uppercase', color: colors.muted, textAlign: 'center' }}>
            Laser Hair Removal FAQ
          </p>
          <h2 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, textAlign: 'center', color: colors.heading }}>
            The questions everyone asks (tap to expand)
          </h2>
          <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, textAlign: 'center', color: colors.body, maxWidth: '42rem', margin: '0.5rem auto 0' }}>
            Exactly what your consult covers&mdash;so you feel confident before you start.
          </p>

          <div style={{ marginTop: '1.75rem', border: `1px solid ${colors.stone}`, borderRadius: '1.5rem', backgroundColor: '#fff', overflow: 'hidden' }} className="divide-y divide-neutral-200">
            {FAQS.map((x) => (
              <FaqItem key={x.q} q={x.q} a={x.a} />
            ))}
          </div>

          <div className="mt-8 grid gap-2 sm:grid-cols-2">
            <div>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>
            <TrackedLink href={smsHref} onClick={() => trackEvent('sms_click', { service: 'lhr', placement: 'faq', phone: MARKETING_SMS })}>
              Text Us Your Questions
            </TrackedLink>
          </div>

          <div style={{ marginTop: '2rem', borderRadius: '1.5rem', backgroundColor: '#fff', border: `1px solid ${colors.stone}`, padding: '1.5rem' }}>
            <h3 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.heading }}>Still unsure if it&apos;s &ldquo;worth it&rdquo;?</h3>
            <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, color: colors.body }}>
              Laser hair removal is one of the best ways to reduce constant shaving/waxing and improve irritation over time&mdash;
              but results depend on consistency, skin type, and hair type. That&apos;s why the consult matters.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

LaserHairRemovalLanding.getLayout = (page) => page

/* -----------------------------
   UI Components
------------------------------ */

function TrackedLink({ href, children, primary, onClick }) {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', padding: '0.75rem 1.5rem', fontFamily: fonts.body, fontWeight: 600, minHeight: '3rem', touchAction: 'manipulation', transition: 'all 150ms ease', textDecoration: 'none', width: '100%' }
  const styles = primary
    ? { ...base, color: '#fff', background: gradients.primary }
    : { ...base, color: colors.white, border: '1px solid rgba(250,248,245,0.2)', backgroundColor: 'rgba(250,248,245,0.05)' }

  return (
    <a href={href} style={styles} rel="noopener" onClick={onClick}>
      {children}
    </a>
  )
}

function MiniProof({ title, copy }) {
  return (
    <div style={{ borderRadius: '1rem', backgroundColor: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)', padding: '0.75rem' }}>
      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{title}</p>
      <p style={{ marginTop: '0.25rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>{copy}</p>
    </div>
  )
}

function QuickJump({ label, to }) {
  return (
    <a
      href={to}
      style={{ borderRadius: '9999px', backgroundColor: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)', padding: '0.75rem 1rem', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: 'rgba(250,248,245,0.9)', textDecoration: 'none', display: 'block', textAlign: 'center', transition: 'background 150ms ease' }}
      onClick={() => trackEvent('jump_click', { service: 'lhr', label })}
      rel="noopener"
    >
      {label} &rarr;
    </a>
  )
}

function VideoModal({ title, src, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="w-full max-w-md sm:max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: '#000' }}>
          <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{title}</p>
            <button type="button" style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.8)', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>
              Close
            </button>
          </div>

          <div style={{ aspectRatio: '9/16', width: '100%' }}>
            <iframe
              src={src}
              title={title}
              className="h-full w-full"
              style={{ border: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details className="group">
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1rem 1.5rem', fontFamily: fonts.body, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9375rem', color: colors.heading }}>{q}</span>
        <svg
          className="h-5 w-5 transition-transform group-open:rotate-180"
          style={{ color: colors.muted }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', fontFamily: fonts.body, color: colors.body, fontSize: '0.9375rem' }}>{a}</div>
    </details>
  )
}
