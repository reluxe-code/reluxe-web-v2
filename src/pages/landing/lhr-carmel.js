// pages/landing/lhr-carmel.js
// RELUXE • Laser Hair Removal Consults (Carmel) — High-converting FAQ video landing page

/* eslint-disable @next/next/no-img-element */

import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

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
    a: 'Most people describe quick snaps + warmth. It’s fast, and we’ll keep you comfortable the whole time.',
  },
  {
    q: 'How many sessions will I need?',
    a: 'Hair grows in cycles, so you’ll need multiple sessions. Your plan depends on area, hair density, hormones, and goals—we’ll map it in your consult.',
  },
  {
    q: 'Is it safe for my skin tone?',
    a: 'We’ll confirm candidacy at your consult and tailor settings to you. If you’re a fit, we’ll build a safe plan for your skin and hair.',
  },
  {
    q: 'Should I shave before my treatment?',
    a: 'Yes—shave the area about 24 hours before. Skip waxing/epilating (we need the follicle). We’ll give you the full prep checklist.',
  },
  {
    q: 'When will I see results?',
    a: 'Many clients notice changes after early sessions, and results build with consistency. We’ll set realistic expectations for your hair + skin type.',
  },
  {
    q: 'What areas can be treated?',
    a: 'Face, underarms, bikini, legs, arms, back, chest—most areas are fair game. We’ll confirm what’s best for you in consult.',
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
    try {
      window.fbq('trackCustom', eventName, payload)
    } catch {}
  }
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, payload)
    } catch {}
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
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 260)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const ogTitle = 'Laser Hair Removal Consult | Carmel | RELUXE Med Spa'
  const ogDesc =
    'Laser Hair Removal FAQ — answered. Watch the quick video, then book your free consult in Carmel to get started for spring/pool season.'

  return (
    <>
      <Head>
        <title>Laser Hair Removal Consult | Carmel | RELUXE Med Spa</title>
        <meta name="description" content={ogDesc} />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://reluxemedspa.com${PAGE_PATH}`} />
        <meta property="og:image" content="https://reluxemedspa.com/images/landing/laser-hair-removal-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.18),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid lg:grid-cols-12 gap-7 lg:gap-10 items-stretch">
            {/* LEFT */}
            <div className="lg:col-span-7 text-white lg:min-h-[560px] flex flex-col">
              <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
                {BRAND} • {FOCUS_LOCATION_LABEL}
              </p>

              <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Laser Hair Removal: Your Most Common Questions — Answered ✨
              </h1>

              <p className="mt-3 text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                You’re not alone. Most people hesitate because they’re unsure what it feels like, how many sessions it takes,
                or whether it’s right for them. Watch the quick FAQ video—then book your <strong>free consult</strong> so we can build
                a plan for <strong>bikini/pool/spring season</strong>.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <MiniProof title="Free Consult" copy="Candidacy + plan + pricing clarity." />
                <MiniProof title="Fast Answers" copy="Pain, prep, areas, timeline—covered." />
                <MiniProof title="Start Now" copy="Best results come from consistency." />
              </div>

              <div className="mt-6">
                <CTA
                  href={consultHref}
                  primary
                  onClick={() =>
                    trackEvent('book_consult_click', {
                      service: 'lhr',
                      placement: 'hero',
                      location: 'carmel',
                    })
                  }
                >
                  Book Free Consult (Carmel)
                </CTA>

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <CTA
                    href={smsHref}
                    onClick={() =>
                      trackEvent('sms_click', { service: 'lhr', placement: 'hero', phone: MARKETING_SMS })
                    }
                  >
                    Text Us (Quick Help)
                  </CTA>
                  <CTA
                    href={callHref}
                    onClick={() =>
                      trackEvent('call_click', { service: 'lhr', placement: 'hero', phone: PHONE_CALL })
                    }
                  >
                    Call {DISPLAY_PHONE}
                  </CTA>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <p className="text-sm font-semibold text-white">What happens in your consult</p>
                <ul className="mt-2 space-y-2 text-sm text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                    <span>Confirm you’re a candidate + review skin/hair type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                    <span>Pick areas + create a realistic session plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                    <span>Answer prep + pain questions so you feel confident</span>
                  </li>
                </ul>
                <p className="mt-3 text-xs text-neutral-400">
                  Goal: you leave knowing exactly what to do next (and what results to expect).
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5 lg:min-h-[560px] flex flex-col">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 flex-1">
                <p className="text-[11px] tracking-widest uppercase text-neutral-300">Watch the FAQ</p>
                <h3 className="mt-1 text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Does it hurt? What areas? How do I start?
                </h3>
                <p className="mt-2 text-sm text-neutral-300">
                  This is the exact consult conversation—just faster.
                </p>

                {/* Mobile: inline embed */}
                <div className="mt-4 md:hidden aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
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
                  <div className="mx-auto w-full max-w-[320px]">
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent('video_fullscreen_open', { service: 'lhr', placement: 'hero_video' })
                        setVideoOpen(true)
                      }}
                      className="group w-full text-left"
                      aria-label="Open video fullscreen"
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
                        <div className="aspect-[9/16] max-h-[420px]">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/10">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            Watch fullscreen
                          </span>
                          <span className="text-xs text-white/80 group-hover:text-white transition">↗</span>
                        </div>
                      </div>
                    </button>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <CTA
                        href={REEL_URL}
                        primary
                        onClick={() => trackEvent('ig_reel_click', { service: 'lhr', placement: 'video_card' })}
                      >
                        Watch on IG
                      </CTA>
                      <CTA
                        href={consultHref}
                        onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'video_card_cta', location: 'carmel' })}
                      >
                        Book Consult
                      </CTA>
                    </div>
                  </div>
                </div>

                {/* Urgency block */}
                <div className="mt-5 rounded-2xl bg-black/40 ring-1 ring-white/10 p-4">
                  <p className="text-sm font-semibold text-white">Timing matters for spring/pool season</p>
                  <p className="mt-1 text-sm text-neutral-300">
                    If you want smoother skin with less maintenance, the best move is to start now. Your consult makes it simple:
                    we’ll confirm candidacy and map the fastest realistic plan for you.
                  </p>
                  <div className="mt-3">
                    <CTA
                      href={consultHref}
                      primary
                      onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'urgency_card', location: 'carmel' })}
                    >
                      Book Free Consult (Carmel)
                    </CTA>
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
      <section id="faq" className="bg-neutral-50 py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] tracking-widest uppercase text-neutral-500 text-center">
            Laser Hair Removal FAQ
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-neutral-900">
            The questions everyone asks (tap to expand)
          </h2>
          <p className="mt-2 text-center text-neutral-600 max-w-2xl mx-auto">
            Exactly what your consult covers—so you feel confident before you start.
          </p>

          <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
            {FAQS.map((x) => (
              <FaqItem key={x.q} q={x.q} a={x.a} />
            ))}
          </div>

          <div className="mt-8 grid gap-2 sm:grid-cols-2">
            <CTA
              href={consultHref}
              primary
              onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'faq', location: 'carmel' })}
            >
              Book Free Consult (Carmel)
            </CTA>
            <CTA
              href={smsHref}
              onClick={() => trackEvent('sms_click', { service: 'lhr', placement: 'faq', phone: MARKETING_SMS })}
            >
              Text Us Your Questions
            </CTA>
          </div>

          <div className="mt-8 rounded-3xl bg-white ring-1 ring-neutral-200 p-6">
            <h3 className="text-lg font-extrabold tracking-tight text-neutral-900">Still unsure if it’s “worth it”?</h3>
            <p className="mt-2 text-neutral-700">
              Laser hair removal is one of the best ways to reduce constant shaving/waxing and improve irritation over time—
              but results depend on consistency, skin type, and hair type. That’s why the consult matters.
            </p>
            <div className="mt-4">
              <CTA
                href={consultHref}
                primary
                onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'worth_it_card', location: 'carmel' })}
              >
                Book Free Consult (Carmel)
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      {showSticky && <StickyOneCTA href={consultHref} />}
    </>
  )
}

/* -----------------------------
   UI Components
------------------------------ */

function CTA({ href, children, primary, onClick }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] touch-manipulation transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
  const styles = primary
    ? 'text-white w-full bg-gradient-to-r from-emerald-500 to-black shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-neutral-900'
    : 'text-white/90 w-full ring-1 ring-white/20 hover:bg-white/10 bg-neutral-900'

  return (
    <a href={href} className={`${base} ${styles}`} rel="noopener" onClick={onClick}>
      {children}
    </a>
  )
}

function MiniProof({ title, copy }) {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-neutral-300">{copy}</p>
    </div>
  )
}

function QuickJump({ label, to }) {
  return (
    <a
      href={to}
      className="rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
      onClick={() => trackEvent('jump_click', { service: 'lhr', label })}
      rel="noopener"
    >
      {label} →
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
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
          <div className="px-4 py-3 flex items-center justify-between bg-black/60">
            <p className="text-sm font-semibold text-white">{title}</p>
            <button type="button" className="text-white/80 hover:text-white text-sm font-semibold" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="aspect-[9/16] w-full">
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

function StickyOneCTA({ href }) {
  return (
    <div className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-24px)] max-w-lg rounded-2xl bg-neutral-900/95 px-3 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:hidden">
      <a
        href={href}
        className="inline-flex w-full items-center justify-center rounded-xl px-3 py-3 text-sm font-extrabold text-white bg-gradient-to-r from-emerald-500 to-black active:scale-[.99] touch-manipulation"
        onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'sticky', location: 'carmel' })}
        rel="noopener"
      >
        Book Free Consult (Carmel)
      </a>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 font-semibold flex items-center justify-between">
        <span className="text-sm sm:text-base text-neutral-900">{q}</span>
        <svg
          className="h-5 w-5 text-neutral-400 transition-transform group-open:rotate-180"
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
      <div className="px-4 sm:px-6 pb-5 text-neutral-700 text-sm sm:text-base">{a}</div>
    </details>
  )
}
