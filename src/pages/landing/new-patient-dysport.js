// pages/landing/new-patient-dysport.js
// New Patient Intro — Dysport 100 units for $375 (+ add-ons $3/unit)

import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const BOOK_URL = '/book/tox'
const OFFER_URL = '/book/new-patient-dysport' // optional: if you have a direct checkout link

// NOTE: If any of these file paths include spaces, consider renaming files to use dashes.
// Example: "injector.hannah - 25.png" -> "injector.hannah-25.png"
const DYSPORT_RESULTS = [
  { src: '/images/results/tox/injector.hannah - 25.png', alt: 'Forehead lines before/after – smoother after 2 weeks' },
  { src: '/images/results/tox/injector.krista - 01.png', alt: 'Forehead lines before/after – smoother after 2 weeks' },
  { src: '/images/results/tox/injector.hannah - 26.png', alt: 'Forehead lines before/after – smoother after 2 weeks' },
  { src: '/images/results/tox/injector.hannah - 27.png', alt: 'Forehead lines before/after – smoother after 2 weeks' },
  { src: '/images/results/tox/injector.hannah - 30.png', alt: 'Forehead lines before/after – smoother after 2 weeks' },
]

const DYSPORT_TESTIMONIALS = [
  {
    author: 'Jennifer S.',
    location: 'Westfield, IN',
    service: 'Dysport',
    rating: 5,
    text: 'The whole visit was so easy—and I loved my results! Krista was incredibly gentle and explained everything step-by-step.',
    monthYear: 'Feb 2025',
  },
  {
    author: 'Marcus L.',
    location: 'Carmel, IN',
    service: 'Dysport (Forehead + 11s)',
    rating: 5,
    text: 'Natural look, no heaviness. Booking again before my next event.',
    monthYear: 'Jan 2025',
  },
  {
    author: 'Priya A.',
    service: 'Dysport',
    rating: 5,
    text: 'Quick appointment and super friendly team. Subtle but noticeable improvement.',
    monthYear: 'Dec 2024',
  },
]

export default function NewPatientDysportPage() {
  const [lightbox, setLightbox] = useState(null)

  return (
    <BetaLayout
      title="New Patient Dysport Intro — 100 Units for $375"
      description="New to RELUXE? Try Dysport: 100 units for $375 (a $450 value). This is our most popular upper-face dose; most patients fall ±20 units. Add lower face or extra areas for $3/unit."
      canonical="https://reluxemedspa.com/landing/new-patient-dysport"
    >
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18), transparent 60%)`,
        }}
      >
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1rem', minHeight: 320 }}>
          <div style={{ color: colors.white, maxWidth: '48rem' }}>
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.letterSpacing, textTransform: 'uppercase', color: colors.muted }}>
              RELUXE &bull; Carmel &amp; Westfield
            </p>

            <h1 style={{ marginTop: '0.5rem', fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white }}>
              New Patient Dysport Intro
            </h1>

            <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, fontSize: typeScale.subhead.size, lineHeight: typeScale.subhead.lineHeight, color: colors.white }}>
              Get <strong>100 units for $375</strong>{' '}
              <span style={{ color: colors.muted }}>(a $450 value)</span>. This is our most popular{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>upper face</span> starting point—then we tailor it to your anatomy.
            </p>

            <ul style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: fonts.body, color: colors.white }}>
              <LI>
                Most popular upper face dose. <strong>Most patients fall ±20 units.</strong>
              </LI>
              <LI>
                Add lower face or extra areas for <strong>$3/unit</strong>.
              </LI>
              <LI>
                Designed to find <strong>your</strong> perfect dose (not &quot;one size fits all&quot;).
              </LI>
            </ul>

            {/* Trust bar */}
            <div style={{ marginTop: '1.25rem', display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(250,248,245,0.05)', padding: '0.75rem 1rem', border: '1px solid rgba(250,248,245,0.1)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stars rating={5} />
                <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>5</span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>&bull;</span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.white }}>300+ Google Reviews</span>
              </div>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>Results vary. Dosing customized by injector.</span>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>

            <div style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>
              Intro pricing: 100 units $375 &bull; Add-ons $3/unit.
            </div>
          </div>
        </div>
      </section>

      {/* Results (Before & After) */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="md:grid md:grid-cols-12 md:gap-8 items-start">
            {/* Left copy */}
            <div className="md:col-span-4">
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
                Real results.
                <br />
                Natural movement.
              </h2>
              <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>
                These are real RELUXE patients. Your injector customizes dosing to your anatomy and goals.
              </p>

              <div style={{ marginTop: '1.25rem' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>
                  Results vary. Photos shown are representative outcomes.
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className="mt-8 md:mt-0 md:col-span-8">
              <div className="hidden md:grid grid-cols-3 gap-5">
                {DYSPORT_RESULTS.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightbox(img)}
                    style={{ borderRadius: '9999px' }}
                    className="relative aspect-square overflow-hidden shadow-sm hover:shadow-md transition text-left"
                    aria-label={`View result ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt={img.alt} className="h-full w-full object-cover" style={{ borderRadius: '9999px' }} loading={i < 2 ? 'eager' : 'lazy'} />
                  </button>
                ))}
              </div>

              {/* Mobile slider */}
              <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">
                {DYSPORT_RESULTS.slice(0, 8).map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightbox(img)}
                    style={{ borderRadius: '9999px' }}
                    className="snap-start shrink-0 w-[calc(50%-0.5rem)] relative aspect-square overflow-hidden shadow-sm"
                    aria-label={`View result ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt={img.alt} className="h-full w-full object-cover" style={{ borderRadius: '9999px' }} loading={i < 2 ? 'eager' : 'lazy'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews / Testimonials */}
      <section style={{ padding: '3.5rem 0', backgroundColor: colors.cream }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, color: colors.heading }}>
                Loved by patients
              </h2>
              <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>
                Quick visits. Natural results. Friendly injectors.
              </p>

              <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '9999px', backgroundColor: '#fff', padding: '0.375rem 0.75rem', border: `1px solid ${colors.stone}` }}>
                <Stars rating={5} />
                <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>5</span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>&bull;</span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>300+ Google Reviews</span>
              </div>
            </div>

            <div className="hidden sm:block">
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>
          </div>

          <div className="mt-7 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
            <style jsx>{`
              section :global(::-webkit-scrollbar) { display: none; }
            `}</style>

            {DYSPORT_TESTIMONIALS.map((t, i) => (
              <figure
                key={i}
                className="snap-start min-w-[85%] sm:min-w-[60%] lg:min-w-[32%]"
                style={{ backgroundColor: '#fff', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: fonts.body, display: 'inline-flex', alignItems: 'center', borderRadius: '9999px', backgroundColor: colors.cream, padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: 500, color: colors.body }}>
                    {t.service || 'Dysport'}
                  </span>
                  <Stars rating={t.rating || 5} />
                </div>

                <blockquote style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.heading, lineHeight: 1.625 }}>
                  &ldquo;{t.text}&rdquo;
                </blockquote>

                <figcaption style={{ marginTop: '1rem', fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>
                  &mdash; {t.author}
                  {t.location ? `, ${t.location}` : ''}
                  {t.monthYear ? ` \u2022 ${t.monthYear}` : ''}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: colors.cream, padding: '3rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 28rem), 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
          <Card title="How the New Patient Dysport Intro Works">
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: fonts.body, color: colors.body }}>
              <Bullet>
                We start with <strong>100 units</strong>&mdash;our most common upper-face baseline.
              </Bullet>
              <Bullet>Your injector customizes your exact dose based on muscle strength and goals.</Bullet>
              <Bullet>
                Most patients land <strong>within ±20 units</strong> of this baseline.
              </Bullet>
              <Bullet>
                Want lower face (lip flip, DAO, chin) or extra areas? Add units for <strong>$3/unit</strong>.
              </Bullet>
            </ul>
          </Card>

          <Card title="Why This Dose-First Approach Works Better">
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: fonts.body, color: colors.body }}>
              <Bullet>
                It avoids under-treating. You get a <strong>real result</strong> that matches your anatomy.
              </Bullet>
              <Bullet>
                It lets us fine-tune your long-term plan so you know what <strong>your</strong> ideal dose is.
              </Bullet>
              <Bullet>
                You can add targeted areas the same day&mdash;no &quot;come back just for a lip flip&quot; situation.
              </Bullet>
            </ul>
          </Card>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', padding: '0 1rem' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
          <p style={{ marginTop: '0.5rem', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>
            Treatment plan and dosing are always customized by your injector.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>What to Expect</h2>
          <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>
            Quick visit. Natural results. Your &ldquo;dose dialed in&rdquo; for future appointments.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
          <StepCard step="Day 0" title="Consult + Treatment" copy="We map your upper face and tailor dosing to your goals (~20–30 minutes)." />
          <StepCard step="Days 2–7" title="Starts Kicking In" copy="Muscles relax, lines soften, and you look refreshed—not frozen." />
          <StepCard step="Week 2" title="Peak Result" copy="You'll see the final result and we'll know your ideal dose moving forward." />
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" style={{ maxWidth: '64rem', margin: '0 auto', padding: '3.5rem 1rem' }}>
        <h3 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, textAlign: 'center', color: colors.heading }}>Dysport Intro — FAQ</h3>
        <div style={{ marginTop: '1.75rem', border: `1px solid ${colors.stone}`, borderRadius: '1.5rem', backgroundColor: '#fff', overflow: 'hidden' }} className="divide-y divide-neutral-200">
          <FaqItem
            q="Is 100 units a full face treatment?"
            a="No. It's best thought of as our most common upper-face baseline. Most patients land within ±20 units depending on muscle strength and goals."
          />
          <FaqItem
            q="What if I need more or less than 100 units?"
            a="Perfect—that's the point. We'll customize your dose and adjust units based on your anatomy and desired result."
          />
          <FaqItem
            q="Can I add lower face?"
            a="Yes. Lower face and extra areas can be added as needed at $3/unit."
          />
          <FaqItem
            q="How long do results last?"
            a="Most patients see results for ~3–4 months. Your injector will help you choose the right cadence."
          />
        </div>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div style={{ borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(250,248,245,0.1)', backgroundColor: '#000' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightbox.src} alt={lightbox.alt || 'Result'} className="w-full h-auto object-contain" />
            </div>
            <button
              type="button"
              className="mt-3 w-full rounded-xl bg-white/10 text-white py-2 text-sm font-semibold hover:bg-white/15 transition"
              onClick={() => setLightbox(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </BetaLayout>
  )
}

NewPatientDysportPage.getLayout = (page) => page

/* ---------- Shared Components ---------- */

function Card({ title, children }) {
  return (
    <div style={{ border: `1px solid ${colors.stone}`, borderRadius: '1.5rem', backgroundColor: '#fff', padding: '1.25rem 1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <h3 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.heading }}>{title}</h3>
      <div style={{ marginTop: '0.75rem' }}>{children}</div>
    </div>
  )
}

function Bullet({ children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
      <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: gradients.primary, flexShrink: 0 }} />
      <span>{children}</span>
    </li>
  )
}

function LI({ children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
      <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', backgroundColor: colors.violet, flexShrink: 0 }} />
      <span>{children}</span>
    </li>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div style={{ border: `1px solid ${colors.stone}`, borderRadius: '1.5rem', backgroundColor: '#fff', padding: '1.25rem 1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ height: '2.5rem', minWidth: '5.5rem', padding: '0 0.75rem', borderRadius: '0.75rem', background: gradients.primary, color: '#fff', fontFamily: fonts.body, fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
          {step}
        </div>
        <h6 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.heading }}>{title}</h6>
      </div>
      <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body, fontSize: '0.9375rem' }}>{copy}</p>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1rem 1.5rem', fontFamily: fonts.body, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9375rem', color: colors.heading }}>{q}</span>
        <svg className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: colors.muted }} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
        </svg>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', fontFamily: fonts.body, color: colors.body, fontSize: '0.9375rem' }}>{a}</div>
    </details>
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
