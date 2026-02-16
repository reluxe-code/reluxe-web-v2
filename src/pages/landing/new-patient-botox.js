// pages/landing/new-patient-botox.js
// New Patient Intro — Botox (update offer constants below)

import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const OFFER_NAME = 'New Patient Botox Intro'
const OFFER_PRICE = '$550'          // e.g. "$575"
const OFFER_VALUE = '$700 value'    // e.g. "$700 value"
const OFFER_BASELINE = '50 units'   // e.g. "50 units"
const OFFER_ADDON = '$9/unit'     // e.g. "$10/unit" or "$3/unit"
const OFFER_NOTE = 'Most patients fall ±10 units.' // e.g. "Most patients fall ±10 units."

const BOOK_URL = '/book/tox'
const OFFER_URL = '/book/new-patient-botox' // optional if you have it

// Swap these to your Botox-specific results when ready
const BOTOX_RESULTS = [
  { src: '/images/results/tox/injector.hannah - 25.png', alt: 'Before/after – smoother after 2 weeks' },
  { src: '/images/results/tox/injector.krista - 01.png', alt: 'Before/after – smoother after 2 weeks' },
  { src: '/images/results/tox/injector.hannah - 26.png', alt: 'Before/after – smoother after 2 weeks' },
  { src: '/images/results/tox/injector.hannah - 27.png', alt: 'Before/after – smoother after 2 weeks' },
  { src: '/images/results/tox/injector.hannah - 30.png', alt: 'Before/after – smoother after 2 weeks' },
]

const BOTOX_TESTIMONIALS = [
  {
    author: 'Jennifer S.',
    location: 'Westfield, IN',
    service: 'Botox',
    rating: 5,
    text: 'The whole visit was so easy—and I loved my results! Krista was incredibly gentle and explained everything step-by-step.',
    monthYear: 'Feb 2025',
  },
  {
    author: 'Marcus L.',
    location: 'Carmel, IN',
    service: 'Botox (Forehead + 11s)',
    rating: 5,
    text: 'Natural look, no heaviness. Booking again before my next event.',
    monthYear: 'Jan 2025',
  },
  {
    author: 'Priya A.',
    service: 'Botox',
    rating: 5,
    text: 'Quick appointment and super friendly team. Subtle but noticeable improvement.',
    monthYear: 'Dec 2024',
  },
]

export default function NewPatientBotoxPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 280)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>{OFFER_NAME} — {OFFER_BASELINE} for {OFFER_PRICE} | RELUXE Med Spa</title>
        <meta
          name="description"
          content={`New to RELUXE? ${OFFER_NAME}: ${OFFER_BASELINE} for ${OFFER_PRICE} (${OFFER_VALUE}). We start with a proven baseline, then tailor to your anatomy. Add-ons available at ${OFFER_ADDON}.`}
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta property="og:title" content={`${OFFER_NAME} — ${OFFER_BASELINE} for ${OFFER_PRICE} | RELUXE`} />
        <meta
          property="og:description"
          content={`Start with ${OFFER_BASELINE}, customize from there. Add-ons at ${OFFER_ADDON}. Natural results, not frozen.`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/landing/new-patient-botox" />
        <meta property="og:image" content="/images/landing/new-patient-botox-og.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.20),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[320px] py-7 md:py-10">
          <div className="text-white max-w-3xl">
            <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
              RELUXE • Carmel & Westfield
            </p>

            <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {OFFER_NAME}
            </h1>

            <p className="mt-3 text-neutral-300 text-base sm:text-lg leading-relaxed">
              Get <strong>{OFFER_BASELINE} for {OFFER_PRICE}</strong>{' '}
              <span className="text-neutral-400">({OFFER_VALUE})</span>. We start with a proven baseline—then tailor it to your anatomy.
            </p>

            <ul className="mt-4 space-y-2 text-neutral-300">
              <LI>
                Baseline: <strong>{OFFER_BASELINE}</strong>. {OFFER_NOTE}
              </LI>
              <LI>
                Add extra areas or lower face at <strong>{OFFER_ADDON}</strong>.
              </LI>
              <LI>
                Designed to find <strong>your</strong> perfect dose (not “one size fits all”).
              </LI>
            </ul>

            <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <div className="inline-flex items-center gap-2">
                <Stars rating={5} />
                <span className="text-sm font-semibold text-white">5</span>
                <span className="text-sm text-neutral-400">•</span>
                <span className="text-sm text-neutral-200">300+ Google Reviews</span>
              </div>
              <span className="text-xs text-neutral-400">Results vary. Dosing customized by injector.</span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
              <CTA href={BOOK_URL} primary>Book Botox Intro</CTA>
              <CTA href={BOOK_URL} dataAttr="westfield">Book Westfield</CTA>
              <CTA href={BOOK_URL} dataAttr="carmel">Book Carmel</CTA>
            </div>

            <div className="mt-2 text-[11px] text-neutral-400">
              Intro pricing: {OFFER_BASELINE} {OFFER_PRICE} • Add-ons {OFFER_ADDON}.
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <ResultsSection
        title="Real results. Natural movement."
        copy="These are real RELUXE patients. Your injector customizes dosing to your anatomy and goals."
        images={BOTOX_RESULTS}
        onOpen={setLightbox}
        bookHref={BOOK_URL}
        buttonText="Book Botox Intro"
      />

      {/* Reviews */}
      <ReviewsSection
        title="Loved by patients"
        subtitle="Quick visits. Natural results. Friendly injectors."
        testimonials={BOTOX_TESTIMONIALS}
        bookHref={BOOK_URL}
        buttonText="Book Botox Intro"
      />

      {/* How it works */}
      <section className="relative bg-neutral-50 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-6">
            <Card title={`How the ${OFFER_NAME} Works`}>
              <ul className="space-y-2 text-neutral-700">
                <Bullet>
                  We start with <strong>{OFFER_BASELINE}</strong> as a baseline.
                </Bullet>
                <Bullet>Your injector customizes your exact dose based on muscle strength and goals.</Bullet>
                <Bullet>{OFFER_NOTE}</Bullet>
                <Bullet>
                  Want extra areas? Add units for <strong>{OFFER_ADDON}</strong>.
                </Bullet>
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card title="Why this dose-first approach converts better">
              <ul className="space-y-2 text-neutral-700">
                <Bullet>
                  It avoids under-treating. You get a <strong>real result</strong> that matches your anatomy.
                </Bullet>
                <Bullet>
                  It dials your long-term plan so you know <strong>your</strong> ideal dose moving forward.
                </Bullet>
                <Bullet>
                  You can add targeted areas the same day—no extra appointment required.
                </Bullet>
              </ul>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center px-4">
          <CTA href={BOOK_URL} primary>Book Now</CTA>
          <p className="mt-2 text-xs text-neutral-500">Treatment plan and dosing are customized by your injector.</p>
        </div>
      </section>

      {/* What to Expect */}
      <WhatToExpectSection bookHref={BOOK_URL} buttonText="Book Botox Intro" />

      {/* FAQs */}
      <FaqSection
        title="Botox Intro — FAQ"
        items={[
          { q: `Is ${OFFER_BASELINE} a full face treatment?`, a: `No. It’s a baseline for the most common areas. We customize from there based on anatomy and goals.` },
          { q: `What if I need more or less than ${OFFER_BASELINE}?`, a: `Perfect—that’s the point. We’ll tailor your dose and adjust units based on your face and desired result.` },
          { q: `Can I add extra areas?`, a: `Yes. Add-ons are available at ${OFFER_ADDON}.` },
          { q: 'How long do results last?', a: 'Most patients see results for ~3–4 months. Your injector will help you choose the right cadence.' },
        ]}
        bookHref={BOOK_URL}
      />

      {/* Lightbox */}
      {lightbox && <Lightbox img={lightbox} onClose={() => setLightbox(null)} />}

      {/* Sticky mobile CTA */}
      {showStickyCta && (
        <StickyCTA
          title={`${OFFER_NAME} • ${OFFER_BASELINE} for ${OFFER_PRICE}`}
          subtitle={`Add-ons ${OFFER_ADDON} • ${OFFER_NOTE}`}
          href={BOOK_URL}
        />
      )}
    </>
  )
}

/* =========================
 *  Shared Sections/Components
 *  (kept inline so page is truly copy/paste)
 * ========================= */

function ResultsSection({ title, copy, images, onOpen, bookHref, buttonText }) {
  const imgs = Array.isArray(images) ? images.slice(0, 6) : []
  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-12 md:gap-8 items-start">
          <div className="md:col-span-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">{title}</h2>
            <p className="mt-3 text-neutral-600">{copy}</p>
            <div className="mt-5">
              <CTA href={bookHref} primary>{buttonText}</CTA>
              <p className="mt-2 text-xs text-neutral-500">Results vary. Photos shown are representative outcomes.</p>
            </div>
          </div>

          <div className="mt-8 md:mt-0 md:col-span-8">
            <div className="hidden md:grid grid-cols-3 gap-5">
              {imgs.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onOpen(img)}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition text-left"
                  aria-label={`View result ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading={i < 2 ? 'eager' : 'lazy'} />
                </button>
              ))}
            </div>

            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">
              {imgs.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onOpen(img)}
                  className="snap-start shrink-0 w-[calc(50%-0.5rem)] relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 shadow-sm"
                  aria-label={`View result ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading={i < 2 ? 'eager' : 'lazy'} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ReviewsSection({ title, subtitle, testimonials, bookHref, buttonText }) {
  const list = Array.isArray(testimonials) ? testimonials : []
  return (
    <section className="py-14 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">{title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-neutral-200">
              <Stars rating={5} />
              <span className="text-sm font-semibold text-neutral-900">5</span>
              <span className="text-sm text-neutral-500">•</span>
              <span className="text-sm text-neutral-700">300+ Google Reviews</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <CTA href={bookHref} primary>{buttonText}</CTA>
          </div>
        </div>

        <div className="mt-7 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
          <style jsx>{`section :global(::-webkit-scrollbar){display:none;}`}</style>

          {list.map((t, i) => (
            <figure key={i} className="snap-start min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] bg-white rounded-3xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                  {t.service || 'Tox'}
                </span>
                <Stars rating={t.rating || 5} />
              </div>
              <blockquote className="mt-3 text-neutral-800 leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-4 text-sm text-neutral-600">
                — {t.author}{t.location ? `, ${t.location}` : ''}{t.monthYear ? ` • ${t.monthYear}` : ''}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <CTA href={bookHref} primary>{buttonText}</CTA>
        </div>
      </div>
    </section>
  )
}

function WhatToExpectSection({ bookHref, buttonText }) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">What to Expect</h2>
        <p className="mt-3 text-neutral-600">Quick visit. Natural results. Your dose dialed in for future appointments.</p>
      </div>

      <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
        <StepCard step="Day 0" title="Consult + Treatment" copy="We map your movement and tailor dosing to your goals (~20–30 minutes)." />
        <StepCard step="Days 2–7" title="Starts Kicking In" copy="Muscles relax, lines soften, and you look refreshed—not frozen." />
        <StepCard step="Week 2" title="Peak Result" copy="You’ll see the final result and we’ll know your ideal plan moving forward." />
      </div>

      <div className="mt-8 text-center">
        <CTA href={bookHref} primary>{buttonText}</CTA>
      </div>
    </section>
  )
}

function FaqSection({ title, items, bookHref }) {
  const list = Array.isArray(items) ? items : []
  return (
    <section className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">{title}</h3>
      <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
        {list.map((x, i) => <FaqItem key={i} q={x.q} a={x.a} />)}
      </div>
      <div className="mt-8 text-center">
        <CTA href={bookHref} primary>Book Now</CTA>
      </div>
    </section>
  )
}

function Lightbox({ img, onClose }) {
  return (
    <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={img.alt || 'Result'} className="w-full h-auto object-contain" />
        </div>
        <button type="button" className="mt-3 w-full rounded-xl bg-white/10 text-white py-2 text-sm font-semibold hover:bg-white/15 transition" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function CTA({ href, children, primary, dataAttr }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] touch-manipulation transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
  const styles = primary
    ? 'text-white w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-black shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-neutral-900'
    : 'text-white/90 w-full sm:w-auto ring-1 ring-white/20 hover:bg-white/10'
  return (
    <a href={href} data-book-loc={dataAttr} className={`${base} ${styles} group`} rel="noopener">
      {children}
      {primary && <Arrow />}
    </a>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h3>
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

function LI({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
      <span>{children}</span>
    </li>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 min-w-[86px] px-3 rounded-xl bg-gradient-to-br from-emerald-500 to-neutral-900 text-white font-bold text-[11px] sm:text-xs tracking-tight flex items-center justify-center whitespace-nowrap">
          {step}
        </div>
        <h6 className="text-sm sm:text-base font-extrabold tracking-tight">{title}</h6>
      </div>
      <p className="mt-3 text-neutral-700 text-sm sm:text-base">{copy}</p>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 font-semibold flex items-center justify-between">
        <span className="text-sm sm:text-base">{q}</span>
        <svg className={`h-5 w-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
        </svg>
      </summary>
      <div className="px-4 sm:px-6 pb-5 text-neutral-700 text-sm sm:text-base">{a}</div>
    </details>
  )
}

function Arrow() {
  return (
    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}

function StickyCTA({ title, subtitle, href }) {
  return (
    <div className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-24px)] sm:w-full max-w-md rounded-2xl bg-neutral-900/95 px-3 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-neutral-900" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-[11px] text-neutral-400">{subtitle}</p>
        </div>
        <a href={href} className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-black active:scale-[.99] touch-manipulation">
          Book
        </a>
      </div>
    </div>
  )
}

function Stars({ rating = 5 }) {
  const r = Math.max(0, Math.min(5, Number(rating || 0)))
  return (
    <div className="inline-flex items-center gap-1" aria-label={`Rating: ${r} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i < r ? 'fill-amber-400' : 'fill-neutral-300'}`} aria-hidden="true">
          <path d="M10 15.27 15.18 18l-1.64-5.03L18 9.24l-5.19-.03L10 4 7.19 9.21 2 9.24l4.46 3.73L4.82 18z" />
        </svg>
      ))}
    </div>
  )
}
