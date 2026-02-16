// pages/landing/laser-hair-removal.js
// RELUXE • Laser Hair Removal Packages (Carmel & Westfield)
// Drop-in page with client-only "Find My Area" + safe SSR/SSG rendering

/* eslint-disable @next/next/no-img-element */

import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

// Client-only selector (prevents prerender / window access issues)
const FindMyAreaSelector = dynamic(() => import('../../components/laser/FindMyAreaSelector'), {
  ssr: false,
})

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const PAGE_PATH = '/landing/laser-hair-removal'
const BRAND = 'RELUXE Med Spa'
const LOCATION_TAGLINE = 'Carmel & Westfield, IN'

// Booking links (swap to your real Boulevard routes)
const BOOK_CONSULT_WESTFIELD = '/book/laser-consult?loc=westfield'
const BOOK_CONSULT_CARMEL = '/book/laser-consult?loc=carmel'
const BOOK_FIRST_SERVICE = '/book/laser-hair-removal'

// Contact
const MARKETING_SMS = '3173609000'
const PHONE_CALL = '3177631142'
const DISPLAY_PHONE = '317-763-1142'
const IG_URL = 'https://instagram.com/reluxemedspa'

// Reel
const REEL_URL = 'https://www.instagram.com/reel/DUn02FGDoSu/'
const REEL_EMBED_URL = 'https://www.instagram.com/reel/DUn02FGDoSu/embed'

// Pricing table data
const PRICING = [
  {
    size: 'Small Area',
    single: '$100',
    package: '$500',
    packageNote: 'Buy 5, get 3 free (8 total)',
    areas: 'Upper Lip • Chin • Hands • Feet',
  },
  {
    size: 'Standard Area',
    single: '$250',
    package: '$1,250',
    packageNote: 'Buy 5, get 3 free (8 total)',
    areas: 'Underarms • Bikini Line • Face • Half Arms • Half Back • Stomach • Shoulder',
  },
  {
    size: 'Large Area',
    single: '$450',
    package: '$2,250',
    packageNote: 'Buy 5, get 3 free (8 total)',
    areas: 'Brazilian (female only) • Lower Legs • Full Back • Full Chest',
  },
  {
    size: 'X-Large Area',
    single: '$750',
    package: '$3,750',
    packageNote: 'Buy 5, get 3 free (8 total)',
    areas: 'Full Legs',
  },
]

const UNLIMITED = {
  name: 'Truly Unlimited',
  price: '$5,000',
  note: 'Unlimited sessions • Unlimited areas • 18 months',
}

const FAQS = [
  {
    q: 'Do I need a consult first?',
    a: 'If you’re new to laser, a consult is the fastest way to confirm candidacy and map your areas + plan. If you already know what you want, you can book your first session directly.',
  },
  {
    q: 'How many sessions do most people need?',
    a: 'Most people need multiple sessions because hair grows in cycles. Your provider will recommend a plan based on area, hair density, and your goals.',
  },
  {
    q: 'Does it hurt?',
    a: 'Most clients describe it as quick snaps + warmth. It’s fast, and we’ll keep you comfortable the whole time.',
  },
  {
    q: 'How do I prep for my appointment?',
    a: 'Shave the area 24 hours before. Avoid tanning/sunburn. Skip waxing/epilating (we need the follicle). We’ll review the full prep at consult or before your first session.',
  },
  {
    q: 'Can I do multiple areas in one visit?',
    a: 'Yes — and additional areas are 50% off the same visit. Additional packages are also 50% off (lowest price).',
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

  const smsBody = encodeURIComponent(
    `Hi RELUXE! I’m interested in Laser Hair Removal packages. Can you help me book a consult?`
  )
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const ogTitle = 'Laser Hair Removal Packages | Carmel & Westfield | RELUXE'
  const ogDesc =
    'Smooth skin, less upkeep. Clear packages, flexible plans, and a consult that makes it easy to start. Book Carmel or Westfield.'

  return (
    <>
      <Head>
        <title>Laser Hair Removal Packages | Carmel & Westfield | RELUXE Med Spa</title>
        <meta name="description" content={ogDesc} />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://reluxemedspa.com${PAGE_PATH}`} />
        <meta property="og:image" content="/images/landing/laser-hair-removal-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.18),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid lg:grid-cols-12 gap-7 lg:gap-10 items-stretch">
            {/* LEFT */}
            <div className="lg:col-span-7 text-white lg:min-h-[540px] flex flex-col">
              <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
                {BRAND} • {LOCATION_TAGLINE}
              </p>

              <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Laser Hair Removal that feels simple.
              </h1>

              <p className="mt-3 text-neutral-300 text-base sm:text-lg leading-relaxed">
                Packages that match real treatment plans (and actually save you money). Start with a consult—or book
                your first session today.
              </p>

              {/* NOTE: pure <li> (no LI component risk) */}
              <ul className="mt-5 space-y-2 text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                  <span>Clear pricing by area size (Small → X-Large)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                  <span>
                    <strong>Buy 5, get 3 free</strong> packages (8 total sessions)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                  <span>
                    Additional areas <strong>50% off</strong> the same visit
                  </span>
                </li>
              </ul>

              <div className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <CTA
                    href={BOOK_CONSULT_CARMEL}
                    primary
                    onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'hero', location: 'carmel' })}
                  >
                    Book Consult (Carmel)
                  </CTA>

                  <CTA
                    href={BOOK_CONSULT_WESTFIELD}
                    primary
                    onClick={() =>
                      trackEvent('book_consult_click', { service: 'lhr', placement: 'hero', location: 'westfield' })
                    }
                  >
                    Book Consult (Westfield)
                  </CTA>

                  <CTA
                    href={BOOK_FIRST_SERVICE}
                    onClick={() => trackEvent('book_first_click', { service: 'lhr', placement: 'hero' })}
                  >
                    Book First Session
                  </CTA>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="grid gap-3 sm:grid-cols-12 sm:items-center">
                  <div className="sm:col-span-4">
                    <p className="text-sm font-semibold text-white">Questions before you book?</p>
                    <p className="text-xs text-neutral-400">We’ll help you choose areas + plan.</p>
                  </div>
                  <div className="sm:col-span-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CTA
                        href={smsHref}
                        primary
                        onClick={() => trackEvent('sms_click', { service: 'lhr', placement: 'hero_help', phone: MARKETING_SMS })}
                      >
                        Text Us
                      </CTA>
                      <CTA
                        href={callHref}
                        onClick={() => trackEvent('call_click', { service: 'lhr', placement: 'hero_help', phone: PHONE_CALL })}
                      >
                        Call {DISPLAY_PHONE}
                      </CTA>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5 lg:min-h-[540px] flex flex-col">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 flex-1">
                <p className="text-[11px] tracking-widest uppercase text-neutral-300">Watch</p>
                <h3 className="mt-1 text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  What laser is really like (and why packages win)
                </h3>
                <p className="mt-2 text-sm text-neutral-300">
                  Mobile plays inline. Desktop: tap to watch fullscreen.
                </p>

                {/* Mobile: inline embed */}
                <div className="mt-4 md:hidden aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <iframe
                    src={REEL_EMBED_URL}
                    title="RELUXE Laser Hair Removal video"
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
                        trackEvent('video_fullscreen_open', { service: 'lhr', placement: 'hero_preview' })
                        setVideoOpen(true)
                      }}
                      className="group w-full text-left"
                      aria-label="Open video fullscreen"
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
                        <div className="aspect-[9/16] max-h-[380px]">
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
                        href={IG_URL}
                        onClick={() => trackEvent('instagram_click', { service: 'lhr', placement: 'video_card_profile' })}
                      >
                        See more
                      </CTA>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {videoOpen && <VideoModal title="RELUXE Laser Hair Removal" src={REEL_EMBED_URL} onClose={() => setVideoOpen(false)} />}

      {/* FIND MY AREA (client-only) */}
      <FindMyAreaSelector
        onTrack={(name, params) => trackEvent(name, params)}
        bookCarmel={BOOK_CONSULT_CARMEL}
        bookWestfield={BOOK_CONSULT_WESTFIELD}
        bookFirst={BOOK_FIRST_SERVICE}
      />

      {/* PRICING */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-widest uppercase text-neutral-500">Pricing</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Simple by-area pricing
              </h2>
              <p className="mt-2 text-neutral-600 max-w-2xl">
                Packages are built for real treatment plans—not “one and done.”
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <CTA
                href={BOOK_CONSULT_CARMEL}
                primary
                onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'pricing_header', location: 'carmel' })}
              >
                Book Carmel Consult
              </CTA>
              <CTA
                href={BOOK_CONSULT_WESTFIELD}
                primary
                onClick={() =>
                  trackEvent('book_consult_click', { service: 'lhr', placement: 'pricing_header', location: 'westfield' })
                }
              >
                Book Westfield Consult
              </CTA>
            </div>
          </div>

          <div className="mt-7 rounded-3xl border border-neutral-200 overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 bg-neutral-50 px-5 py-3 text-xs font-semibold text-neutral-600">
              <div className="col-span-6">Option</div>
              <div className="col-span-3 text-right">Single</div>
              <div className="col-span-3 text-right">Package</div>
            </div>

            <div className="divide-y divide-neutral-200 bg-white">
              {PRICING.map((row) => (
                <div key={row.size} className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-5 py-5">
                  <div className="sm:col-span-6">
                    <p className="text-lg font-extrabold tracking-tight text-neutral-900">{row.size}</p>
                    <p className="mt-1 text-sm text-neutral-600">{row.areas}</p>

                    <div className="mt-3 sm:hidden grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 p-3">
                        <p className="text-xs font-semibold text-neutral-600">Single</p>
                        <p className="mt-1 text-lg font-extrabold text-neutral-900">{row.single}</p>
                      </div>
                      <div className="rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 p-3">
                        <p className="text-xs font-semibold text-neutral-600">Package</p>
                        <p className="mt-1 text-lg font-extrabold text-neutral-900">{row.package}</p>
                        <p className="mt-1 text-[11px] text-neutral-600">{row.packageNote}</p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block sm:col-span-3 text-right">
                    <p className="text-xl font-extrabold text-neutral-900">{row.single}</p>
                  </div>
                  <div className="hidden sm:block sm:col-span-3 text-right">
                    <p className="text-xl font-extrabold text-neutral-900">{row.package}</p>
                    <p className="mt-1 text-xs text-neutral-600">{row.packageNote}</p>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-5 py-6 bg-neutral-50">
                <div className="sm:col-span-7">
                  <p className="text-lg font-extrabold tracking-tight text-neutral-900">{UNLIMITED.name}</p>
                  <p className="mt-1 text-sm text-neutral-700">{UNLIMITED.note}</p>
                </div>
                <div className="sm:col-span-5 text-left sm:text-right">
                  <p className="text-2xl font-extrabold text-neutral-900">{UNLIMITED.price}</p>
                  <p className="mt-1 text-xs text-neutral-700">Best for multi-area goals.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-neutral-600">
            <strong>Bonus:</strong> Additional areas 50% off (same visit). Additional packages 50% off (lowest price).
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-neutral-50 py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-neutral-900">
            Laser Hair Removal FAQ
          </h3>

          <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
            {FAQS.map((x) => (
              <FaqItem key={x.q} q={x.q} a={x.a} />
            ))}
          </div>

          <div className="mt-8 grid gap-2 sm:grid-cols-2">
            <CTA
              href={BOOK_CONSULT_CARMEL}
              primary
              onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'faq', location: 'carmel' })}
            >
              Book Consult (Carmel)
            </CTA>
            <CTA
              href={BOOK_CONSULT_WESTFIELD}
              primary
              onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'faq', location: 'westfield' })}
            >
              Book Consult (Westfield)
            </CTA>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      {showSticky && <StickyTwoCTA leftHref={BOOK_CONSULT_CARMEL} rightHref={BOOK_CONSULT_WESTFIELD} />}
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

function StickyTwoCTA({ leftHref, rightHref }) {
  return (
    <div className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-24px)] max-w-lg rounded-2xl bg-neutral-900/95 px-3 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={leftHref}
          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-black active:scale-[.99] touch-manipulation"
          onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'sticky', location: 'carmel' })}
          rel="noopener"
        >
          Carmel Consult
        </a>
        <a
          href={rightHref}
          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-black active:scale-[.99] touch-manipulation"
          onClick={() => trackEvent('book_consult_click', { service: 'lhr', placement: 'sticky', location: 'westfield' })}
          rel="noopener"
        >
          Westfield Consult
        </a>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 font-semibold flex items-center justify-between">
        <span className="text-sm sm:text-base text-neutral-900">{q}</span>
        <svg className="h-5 w-5 text-neutral-400 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
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
