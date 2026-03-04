// src/pages/reluxe-way/tox-pricing.js
// The RELUXE Way — Tox Pricing (standalone spoke page in the RELUXE Way hub)

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState, useEffect } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const PAGE_NAME = 'Tox Pricing — The RELUXE Way'
const HUB_URL = '/reluxe-way'

// Booking URLs
const BOOK_TOX_URL = '/book/tox'
const BOOK_TOX_URL_WESTFIELD = '/book/tox?loc=westfield'
const BOOK_TOX_URL_CARMEL = '/book/tox?loc=carmel'

// Consult URLs
const CONSULT_URL = '/book/getting-started'
const CONSULT_URL_WESTFIELD = '/book/getting-started?loc=westfield'
const CONSULT_URL_CARMEL = '/book/getting-started?loc=carmel'
const CONSULT_NAME = 'Getting Started with RELUXE'

// Absolute URLs for social previews
const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way/tox-pricing'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`
const OG_IMAGE = `${SITE_URL}/images/og/new-default-1200x630.png`

// Contact / social
const MARKETING_SMS = '3173609000'
const PHONE_CALL = '3177631142'
const DISPLAY_PHONE = '317-763-1142'
const IG_URL = 'https://instagram.com/reluxemedspa'
const IG_DM_URL = 'https://ig.me/m/reluxemedspa'
const FB_MSG_URL = 'https://m.me/reluxemedspa'

/**
 * Pricing
 * NOTE: We're adding `popularDose` so the page can anchor expectations
 * without implying "foundation" is the typical amount.
 */
const TOX_PRICING = [
  {
    key: 'jeuveau',
    name: 'Jeuveau\u00AE',
    tagline: 'Best Value, Natural Results',
    foundation: { units: 20, price: 200, note: 'after $40 off w/ Evolus Rewards' },
    addOns: { new: 6, returning: 8 },
    popularDose: 50,
    popularLabel: 'Most popular visit',
  },
  {
    key: 'botox',
    name: 'Botox\u00AE',
    tagline: 'Premium, Proven Results',
    foundation: { units: 20, price: 280, note: null },
    addOns: { new: 9, returning: 10 },
    popularDose: 50,
    popularLabel: 'Most popular visit',
  },
  {
    key: 'dysport',
    name: 'Dysport\u00AE',
    tagline: 'Fast-Acting, Great Coverage',
    foundation: { units: 50, price: 225, note: null },
    addOns: { new: 3, returning: 3.5 },
    popularDose: 100,
    popularLabel: 'Most popular visit',
  },
  {
    key: 'daxxify',
    name: 'Daxxify\u00AE',
    tagline: 'Longest-Lasting, Premium Tox',
    foundation: { units: 40, price: 280, note: null },
    addOns: { new: 4, returning: 5 },
    popularDose: 100,
    popularLabel: 'Most popular visit',
  },
]

/** ======================================================
 * Tracking helper: Meta Pixel (fbq) + GA4 (gtag) + GTM
 * ====================================================== */
function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  const payload = {
    ...params,
    page_path: window.location?.pathname || '',
    page_url: window.location?.href || '',
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

function money(n) {
  const num = Number(n || 0)
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function money2(n) {
  const num = Number(n || 0)
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function clampInt(v, min, max) {
  const n = Math.round(Number(v || 0))
  return Math.max(min, Math.min(max, n))
}

function computeTotal({ toxKey, patientType, totalUnits }) {
  const t = TOX_PRICING.find((x) => x.key === toxKey)
  if (!t) return 0
  const baseUnits = t.foundation.units
  const basePrice = t.foundation.price
  const extraUnits = Math.max(0, Number(totalUnits || 0) - baseUnits)
  const perUnit = patientType === 'returning' ? t.addOns.returning : t.addOns.new
  return basePrice + extraUnits * perUnit
}

function computePopularTotals(tox) {
  const baseUnits = tox.foundation.units
  const popularUnits = tox.popularDose || baseUnits
  const addUnits = Math.max(0, popularUnits - baseUnits)
  const newTotal = tox.foundation.price + addUnits * tox.addOns.new
  const returningTotal = tox.foundation.price + addUnits * tox.addOns.returning
  return { baseUnits, popularUnits, addUnits, newTotal, returningTotal }
}

function getSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL_URL}#webpage`,
        url: CANONICAL_URL,
        name: 'Tox Pricing in Carmel & Westfield | Botox, Daxxify, Jeuveau, Dysport Pricing | RELUXE',
        description:
          'Transparent tox pricing in Carmel & Westfield. View Botox\u00AE, Daxxify\u00AE, Jeuveau\u00AE, and Dysport\u00AE pricing with our foundation + right dosing model for new and returning patients at RELUXE Med Spa.',
        isPartOf: { '@id': `${SITE_URL}#website` },
        about: [
          { '@type': 'Thing', name: 'Botox pricing' },
          { '@type': 'Thing', name: 'Daxxify pricing' },
          { '@type': 'Thing', name: 'Jeuveau pricing' },
          { '@type': 'Thing', name: 'Dysport pricing' },
          { '@type': 'Thing', name: 'Carmel IN' },
          { '@type': 'Thing', name: 'Westfield IN' },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${CANONICAL_URL}#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'The RELUXE Way', item: `${SITE_URL}${HUB_URL}` },
          { '@type': 'ListItem', position: 3, name: 'Tox Pricing', item: CANONICAL_URL },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${CANONICAL_URL}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is the foundation dose what most people get?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Not usually. The foundation dose is the starting block that\u2019s included in every visit, but most patients land at our most popular doses (for example, 50 units for Botox\u00AE/Jeuveau\u00AE and 100 units for Dysport\u00AE/Daxxify\u00AE). Your injector confirms the best plan for your face.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this a discount or promo?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'No. This is our pricing model. Your visit includes a foundation dose at a standard price, and additional units switch to our Right Dosing rates so choosing the right plan doesn\u2019t feel like an upsell.',
            },
          },
          {
            '@type': 'Question',
            name: 'Why do you price it this way?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Because expert dosing drives satisfaction and longevity. We want pricing to support the plan that delivers the best result\u2014without pressure or surprise totals.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do you use premium brands?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Yes. We only use premium, reputable neurotoxin brands and follow best practices for storage, handling, and technique.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I know which tox is right for me?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Start with a consult with one of our nurse injectors. We\u2019ll map movement, discuss your goals, and recommend the right plan and dose.',
            },
          },
        ],
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}#organization`,
        name: 'RELUXE Med Spa',
        url: SITE_URL,
        sameAs: [IG_URL],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: 'RELUXE Med Spa',
        publisher: { '@id': `${SITE_URL}#organization` },
      },
    ],
  }
}

export default function ReluxeWayToxPricingPage() {
  // Calculator defaults
  const [calcTox, setCalcTox] = useState('jeuveau')
  const [calcType, setCalcType] = useState('new') // 'new' | 'returning'
  const [calcUnits, setCalcUnits] = useState(50)

  const smsBody = encodeURIComponent(`Hi RELUXE! I'd love to book a ${CONSULT_NAME}. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const selected = useMemo(() => TOX_PRICING.find((t) => t.key === calcTox), [calcTox])

  // When tox changes, default the slider to the most popular dose (not the foundation)
  useEffect(() => {
    const t = TOX_PRICING.find((x) => x.key === calcTox)
    if (!t) return
    const defaultUnits = t.popularDose || t.foundation.units
    setCalcUnits((prev) => {
      if (prev === 0) return defaultUnits
      return defaultUnits
    })
  }, [calcTox])

  const calcTotal = useMemo(
    () => computeTotal({ toxKey: calcTox, patientType: calcType, totalUnits: calcUnits }),
    [calcTox, calcType, calcUnits]
  )

  const pageTitle = 'Tox Pricing in Carmel & Westfield | Botox, Daxxify, Jeuveau, Dysport Pricing | RELUXE'
  const pageDescription =
    'Transparent tox pricing in Carmel & Westfield. View Botox, Daxxify, Jeuveau, and Dysport pricing with our foundation + right dosing model for new and returning patients at RELUXE Med Spa.'

  const snapshotRows = useMemo(() => {
    return TOX_PRICING.map((t) => {
      const p = computePopularTotals(t)
      return {
        key: t.key,
        name: t.name,
        popularUnits: p.popularUnits,
        baseUnits: p.baseUnits,
        addUnits: p.addUnits,
        newTotal: p.newTotal,
        returningTotal: p.returningTotal,
        foundationPrice: t.foundation.price,
      }
    })
  }, [])

  return (
    <BetaLayout
      title={pageTitle}
      description={pageDescription}
      canonical={CANONICAL_URL}
      ogImage={OG_IMAGE}
      structuredData={getSchema()}
    >
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative' }} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-5xl" style={{ color: colors.white }}>
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>The RELUXE Way</span>
              <span style={{ color: colors.muted }}>&bull;</span>
              <span style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Carmel & Westfield</span>
              <span style={{ color: colors.muted }}>&bull;</span>
              <a
                href={HUB_URL}
                onClick={() => trackEvent('hub_click', { placement: 'hero_breadcrumb' })}
                style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Back to the hub &rarr;
              </a>
            </div>

            <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight }} className="mt-3">
              Tox Pricing,{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Re-Invented.</span>
            </h1>

            <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.85)' }} className="mt-4 text-base sm:text-lg leading-relaxed">
              You told us you want <strong>certainty</strong>--not deal-chasing, not surprises, and not pricing that feels like a gimmick.
              So we built a model that protects quality and rewards what matters most: <strong>the right dose.</strong>
            </p>

            <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-3 text-sm sm:text-base leading-relaxed">
              The most common &ldquo;sweet spot&rdquo; we see: <strong>50 units for Botox&reg; / Jeuveau&reg;</strong> and <strong>100 units for Dysport&reg; / Daxxify&reg;</strong>.
              Your injector confirms what&rsquo;s right for your face.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <CTA href={CONSULT_URL} primary trackName="consult_click" trackParams={{ placement: 'hero_primary_consult', location: 'any' }}>
                Book a Consult
              </CTA>

              <CTA href={BOOK_TOX_URL} trackName="book_click" trackParams={{ placement: 'hero_secondary_book_tox', location: 'any' }}>
                Book Tox
              </CTA>

              <CTA href={IG_URL} external trackName="instagram_click" trackParams={{ placement: 'hero_instagram' }}>
                See Our Work (@reluxemedspa)
              </CTA>
            </div>

            <div style={{ borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }} className="mt-5 p-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="Built for certainty" value="No bait & switch" />
                <MiniStat label="Built for results" value="Right dose wins" />
                <MiniStat label="Built for trust" value="Local, family-owned" />
              </div>
              <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-3 text-[12px]">
                Pricing shown is for tox injections only. Treatment plans and dosing are customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SNAPSHOT */}
      <section className="py-12 sm:py-14" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Quick pricing snapshot</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Most popular dose, made simple.
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
              We include a <strong>foundation dose</strong> in every visit (so quality is protected), then add-on units switch to <strong>Right Dosing</strong> pricing.
              The foundation is a starting block--not a &ldquo;typical amount.&rdquo;
            </p>
          </div>

          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, overflow: 'hidden' }} className="mt-8">
            <div className="grid md:grid-cols-4 gap-0" style={{ backgroundColor: colors.cream, borderBottom: `1px solid ${colors.stone}` }}>
              <div className="p-4" style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted, fontWeight: 600 }}>Tox</div>
              <div className="p-4" style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted, fontWeight: 600 }}>Most popular dose</div>
              <div className="p-4" style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted, fontWeight: 600 }}>New patient estimate</div>
              <div className="p-4" style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted, fontWeight: 600 }}>Returning estimate</div>
            </div>

            {snapshotRows.map((r) => (
              <div key={r.key} className="grid md:grid-cols-4 gap-0" style={{ borderBottom: `1px solid ${colors.stone}` }}>
                <div className="p-4">
                  <p style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }}>{r.name}</p>
                  <p style={{ fontFamily: fonts.body, color: colors.body }} className="text-xs mt-1">
                    Includes foundation ({r.baseUnits}u) + add-ons ({r.addUnits}u)
                  </p>
                </div>
                <div className="p-4 flex items-center">
                  <span style={{ borderRadius: '9999px', background: colors.ink, color: colors.white, fontFamily: fonts.body, fontWeight: 600 }} className="inline-flex items-center px-3 py-1 text-sm">
                    {r.popularUnits} units
                  </span>
                </div>
                <div className="p-4 flex items-center">
                  <p style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }} className="text-xl">{money(r.newTotal)}</p>
                </div>
                <div className="p-4 flex items-center">
                  <p style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }} className="text-xl">{money(r.returningTotal)}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-4 text-[11px]">
            Estimates are transparent math based on the model below--not a quote. Your injector confirms the best dose and plan in the chair.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-12 sm:py-14" style={{ background: '#fff', borderTop: `1px solid ${colors.stone}` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>What we heard</Eyebrow>
              <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Patients don&rsquo;t want &ldquo;promos.&rdquo; They want confidence.
              </h2>
              <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
                Over our first two years, we tried what most med spas try: new patient specials, rotating offers, monthly discounts. And we listened.
              </p>

              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <QuoteCard title={'\u201CI just want to know what it\u2019s going to cost.\u201D'} copy="Certainty beats surprise. Especially when it's your face." />
                <QuoteCard title={'\u201CI don\u2019t want to hop around for deals.\u201D'} copy="You want a place you can trust, not a place you have to time." />
              </div>

              <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-5 leading-relaxed">
                Many pricing models unintentionally reward under-dosing--because it looks cheaper in the moment. Long term, under-dosing is the fastest way to disappointment.
              </p>
            </div>

            <div className="lg:col-span-5">
              <StickySideCard>
                <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="text-lg sm:text-xl font-extrabold tracking-tight">Our belief</h3>
                <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed">
                  <strong>Dosing determines duration.</strong>
                  <br />
                  <strong>Expert dosing determines satisfaction.</strong>
                </p>
                <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 text-sm">
                  Our pricing is designed to make it easy to say &ldquo;yes&rdquo; to the plan that delivers the best result.
                </p>

                <div className="mt-5 flex flex-col gap-2">
                  <GravityBookButton fontKey={FONT_KEY} size="hero" />
                </div>
              </StickySideCard>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}` }} className="py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Foundation + Right Dosing
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
              Every tox visit includes a <strong>foundation dose</strong> at a standard price. That foundation protects the experience (expert injectors, advanced technique, ongoing education, and a plan built around your anatomy).
              <span className="block mt-3">
                Then, if your plan needs more units (which is common), add-ons switch to <strong>Right Dosing</strong> pricing--so the &ldquo;most popular dose&rdquo; stays straightforward.
              </span>
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <StepCard
              step="Step 1"
              title="Foundation is included"
              copy={'Your visit starts with a foundation dose that\u2019s included in every appointment. It\u2019s not the \u201Ctypical amount\u201D\u2014it\u2019s the starting block that protects quality.'}
            />
            <StepCard
              step="Step 2"
              title="We map your movement"
              copy="We listen to your goals, map expression, and design the plan for your face--often across multiple areas."
            />
            <StepCard
              step="Step 3"
              title="Add-ons switch to Right Dosing"
              copy={'Units above foundation switch to our Right Dosing rates, so choosing the correct plan doesn\u2019t feel like an upsell.'}
            />
          </div>

          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} className="mt-8">
            <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="text-xl sm:text-2xl font-extrabold tracking-tight">The RELUXE promise</h3>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-2 leading-relaxed">
              No bait & switch. No pressure. Just expert injectors + transparent pricing built for results.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>

            <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-3 text-[11px]">
              Prefer Facebook?{' '}
              <a
                href={FB_MSG_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('facebook_message_click', { placement: 'promise_fb_msg' })}
                className="underline"
              >
                Message us here
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* PRICING GRID */}
      <section className="py-12 sm:py-14" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Transparent pricing</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">Choose your tox. See your pricing.</h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
              Each option shows the foundation dose, add-on rates, and an easy &ldquo;most popular dose&rdquo; example so you can understand total cost without guessing.
            </p>
          </div>

          <div className="mt-8 grid lg:grid-cols-2 gap-4 sm:gap-6">
            {TOX_PRICING.map((t) => (
              <ToxPricingCard key={t.key} tox={t} />
            ))}
          </div>

          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem' }} className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="text-lg sm:text-xl font-extrabold tracking-tight">Want help choosing?</h3>
                <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-1 text-sm">Tell us your goals and your timeline. We&rsquo;ll point you to the best fit.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={smsHref}
                  onClick={() => trackEvent('sms_click', { placement: 'pricing_help_sms', phone: MARKETING_SMS })}
                  style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white }}
                  className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-90"
                >
                  Text Questions
                </a>
                <a
                  href={IG_DM_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('instagram_dm_click', { placement: 'pricing_help_ig_dm' })}
                  style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                  className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-80"
                >
                  DM on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section style={{ background: colors.ink, color: colors.white }} className="py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <Eyebrow dark>Quick estimate</Eyebrow>
              <h2 style={{ fontFamily: fonts.display, fontWeight: typeScale.sectionHeading.weight }} className="mt-2 text-2xl sm:text-3xl tracking-tight">What would my appointment cost?</h2>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.85)' }} className="mt-4 leading-relaxed">
                This is an estimate tool to keep pricing clear. We default to our <strong>most popular dose</strong> so you&rsquo;re not stuck thinking &ldquo;foundation = typical.&rdquo;
              </p>

              <div style={{ borderRadius: '1.5rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }} className="mt-6 p-5">
                <p style={{ fontFamily: fonts.body, fontWeight: 600 }} className="text-sm">Estimated total</p>
                <p style={{ fontFamily: fonts.display, fontWeight: 800 }} className="mt-2 text-4xl tracking-tight">{money(calcTotal)}</p>
                <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-2 text-sm">Includes foundation + add-on units at Right Dosing pricing.</p>

                <div className="mt-5">
                  <GravityBookButton fontKey={FONT_KEY} size="hero" />
                </div>

                <div className="mt-3">
                  <a
                    href={smsHref}
                    onClick={() =>
                      trackEvent('sms_click', {
                        placement: 'calculator_sms_estimate',
                        phone: MARKETING_SMS,
                        tox: calcTox,
                        patient_type: calcType,
                        units: calcUnits,
                      })
                    }
                    style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: '1px solid rgba(250,248,245,0.15)' }}
                    className="inline-flex items-center justify-center w-full px-5 py-3 transition hover:bg-white/10"
                  >
                    Text Us This Estimate
                  </a>
                </div>

                <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-3 text-[11px]">Transparent estimate tool, not a quote. Dosing and plan are customized by your injector.</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div style={{ borderRadius: '1.5rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }} className="p-6 sm:p-7">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Choose your tox</label>
                    <select
                      value={calcTox}
                      onChange={(e) => {
                        setCalcTox(e.target.value)
                        trackEvent('calculator_change', { field: 'tox', value: e.target.value })
                      }}
                      style={{ borderRadius: '1rem', background: 'rgba(26,26,26,0.8)', border: '1px solid rgba(250,248,245,0.1)', color: colors.white, fontFamily: fonts.body }}
                      className="mt-2 w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {TOX_PRICING.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-3 text-sm">
                      Foundation: <strong>{selected?.foundation.units} units</strong> for <strong>{money(selected?.foundation.price)}</strong>{' '}
                      {selected?.foundation.note ? <span style={{ color: colors.muted }}>({selected.foundation.note})</span> : null}
                    </p>

                    <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-2 text-sm">
                      Most popular dose: <strong>{selected?.popularDose} units</strong>
                    </p>
                  </div>

                  <div>
                    <label style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Patient type</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Toggle
                        active={calcType === 'new'}
                        onClick={() => {
                          setCalcType('new')
                          trackEvent('calculator_change', { field: 'patient_type', value: 'new' })
                        }}
                      >
                        New
                      </Toggle>
                      <Toggle
                        active={calcType === 'returning'}
                        onClick={() => {
                          setCalcType('returning')
                          trackEvent('calculator_change', { field: 'patient_type', value: 'returning' })
                        }}
                      >
                        Returning
                      </Toggle>
                    </div>

                    <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-3 text-sm">
                      Add-on units:{' '}
                      <strong>{money2(calcType === 'returning' ? selected?.addOns.returning : selected?.addOns.new)}/unit</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Total units</label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min={Math.max(0, selected?.foundation.units || 20)}
                      max={(selected?.foundation.units || 20) + 120}
                      value={calcUnits}
                      onChange={(e) => {
                        const v = clampInt(e.target.value, 0, 500)
                        setCalcUnits(v)
                        trackEvent('calculator_change', { field: 'units', value: v, tox: calcTox, patient_type: calcType })
                      }}
                      className="w-full"
                    />
                    <div style={{ fontFamily: fonts.body, fontWeight: 600 }} className="min-w-[72px] text-right">{calcUnits}</div>
                  </div>

                  <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-2 text-sm">
                    Tip: If you&rsquo;re not sure, start at the most popular dose ({selected?.popularDose}u) and adjust.
                  </p>
                </div>

                <div style={{ borderRadius: '1rem', background: 'rgba(26,26,26,0.6)', border: '1px solid rgba(250,248,245,0.1)' }} className="mt-6 p-4">
                  <p style={{ fontFamily: fonts.body, fontWeight: 600 }} className="text-sm">How we calculated it</p>
                  <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-2 text-sm">Total = foundation price + (units above foundation x add-on per-unit rate)</p>
                </div>

                <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-4 text-[11px]">Dosing and plan are customized by your injector.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT / HUMAN ANSWER */}
      <section className="py-12 sm:py-14" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>Why patients stay</Eyebrow>
              <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Because it feels straightforward--and the results feel right.
              </h2>
              <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
                We&rsquo;re local, family-owned, and relationship-driven. Our pricing model is built to make you feel confident before you book--and proud of your decision after you leave.
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <InfoCard title="No surprise pricing" copy={'You\u2019ll always know the foundation, and you\u2019ll always know what add-on units cost.'} />
                <InfoCard title="No pressure" copy="We educate, you choose. The goal is the right plan--not a bigger ticket." />
                <InfoCard title="Better longevity" copy={'Right dosing reduces the \u201Cit wore off too fast\u201D frustration and helps you love your cadence.'} />
                <InfoCard title="Consistency" copy="Your plan gets smarter over time. We learn what works best for your face." />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="text-xl sm:text-2xl font-extrabold tracking-tight">Want a human answer?</h3>
                <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3">
                  The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking?
                  Call, text, or DM us and we&rsquo;re happy to help.
                </p>

                <div className="mt-5 grid gap-2">
                  <GravityBookButton fontKey={FONT_KEY} size="hero" />

                  <a
                    href={smsHref}
                    onClick={() => trackEvent('sms_click', { placement: 'contact_card_sms', phone: MARKETING_SMS })}
                    style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                    className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-80"
                  >
                    Text Us
                  </a>

                  <a
                    href={callHref}
                    onClick={() => trackEvent('call_click', { placement: 'contact_card_call', phone: PHONE_CALL })}
                    style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                    className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-80"
                  >
                    Call {DISPLAY_PHONE}
                  </a>

                  <a
                    href={IG_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('instagram_click', { placement: 'contact_card_instagram' })}
                    style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                    className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-80"
                  >
                    Follow @reluxemedspa
                  </a>
                </div>

                <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-4 text-[11px]">
                  DM links work best on mobile and when you&rsquo;re logged in:{' '}
                  <a
                    href={IG_DM_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('instagram_dm_click', { placement: 'contact_card_ig_dm' })}
                    className="underline"
                  >
                    Instagram DM
                  </a>{' '}
                  &bull;{' '}
                  <a
                    href={FB_MSG_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('facebook_message_click', { placement: 'contact_card_fb_msg' })}
                    className="underline"
                  >
                    Facebook message
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}` }} className="py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">Tox Pricing FAQ</h2>

          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff' }} className="mt-7">
            <FaqItem
              q="Is the foundation dose what most people get?"
              a="Not usually. The foundation dose is included in every visit, but most patients land closer to our most popular doses (50 units for Botox/Jeuveau and 100 units for Dysport/Daxxify). Your injector confirms what's right for your face."
            />
            <FaqItem
              q="Is this a discount or promo?"
              a="No. This is our pricing model. Your visit includes a foundation dose at a standard price, and additional units switch to our Right Dosing rates so choosing the right plan doesn't feel like an upsell."
            />
            <FaqItem
              q="Why do you price it this way?"
              a="Because expert dosing drives satisfaction and longevity. We want it to be easy to choose the plan that delivers the best result--without pressure or surprise totals."
            />
            <FaqItem q="Do you use premium brands?" a="Yes. We only use premium, reputable neurotoxin brands and follow best practices for storage, handling, and technique." />
            <FaqItem
              q="How do I know which tox is right for me?"
              a="Start with a consult with one of our nurse injectors. We'll map movement, discuss your goals, and recommend the right plan and dose."
            />
          </div>

          <div className="mt-8 text-center">
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
            <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-2 text-xs">Dosing and treatment plan are customized by your injector. Results vary.</p>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

ReluxeWayToxPricingPage.getLayout = (page) => page

/* -----------------------------
   Components
------------------------------ */

function CTA({ href, children, primary, external, trackName, trackParams }) {
  const baseStyle = {
    borderRadius: '9999px',
    fontFamily: fonts.body,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 1.5rem',
    minHeight: '48px',
    transition: 'all 0.2s',
  }
  const primaryStyle = primary
    ? { background: gradients.primary, color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }
    : { border: '1px solid rgba(250,248,245,0.2)', color: 'rgba(250,248,245,0.9)' }

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : 'noopener'}
      style={{ ...baseStyle, ...primaryStyle }}
      className="w-full sm:w-auto group"
      onClick={() => {
        if (trackName) trackEvent(trackName, trackParams || {})
      }}
    >
      {children}
      {primary ? <Arrow /> : null}
    </a>
  )
}

function MiniStat({ label, value }) {
  return (
    <div style={{ borderRadius: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(250,248,245,0.08)', padding: '0.75rem' }}>
      <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>{label}</p>
      <p style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.white }} className="mt-1 text-sm">{value}</p>
    </div>
  )
}

function Eyebrow({ children, dark }) {
  return (
    <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: dark ? colors.muted : colors.muted }}>{children}</p>
  )
}

function QuoteCard({ title, copy }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading }} className="text-sm">{title}</p>
      <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-2 text-sm">{copy}</p>
    </div>
  )
}

function StickySideCard({ children }) {
  return (
    <div className="lg:sticky lg:top-24">
      <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>{children}</div>
    </div>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3">
        <div style={{ borderRadius: '0.75rem', background: gradients.primary, color: '#fff', fontFamily: fonts.body, fontWeight: 700, fontSize: '11px', letterSpacing: '-0.01em', height: '2.5rem', minWidth: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.75rem' }}>
          {step}
        </div>
        <h3 style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }} className="text-sm sm:text-base tracking-tight">{title}</h3>
      </div>
      <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 text-sm sm:text-base">{copy}</p>
    </div>
  )
}

function InfoCard({ title, copy }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading }} className="text-sm">{title}</p>
      <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-2 text-sm">{copy}</p>
    </div>
  )
}

function Toggle({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: '9999px',
        fontFamily: fonts.body,
        fontWeight: 600,
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        transition: 'all 0.2s',
        ...(active
          ? { background: gradients.primary, color: '#fff' }
          : { background: 'rgba(26,26,26,0.8)', color: colors.white, border: '1px solid rgba(250,248,245,0.1)' }),
      }}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      {children}
    </button>
  )
}

function ToxPricingCard({ tox }) {
  const p = computePopularTotals(tox)

  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }} className="text-xl sm:text-2xl tracking-tight">{tox.name}</h3>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-1 text-sm">{tox.tagline}</p>
          </div>
          <span style={{ borderRadius: '9999px', backgroundColor: colors.cream, fontFamily: fonts.body, fontWeight: 600, color: colors.body }} className="inline-flex items-center px-3 py-1 text-xs">
            Foundation + Add-Ons
          </span>
        </div>

        {/* Most popular */}
        <div style={{ borderRadius: '1.5rem', background: colors.ink, color: colors.white, padding: '1.25rem' }} className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: 'rgba(250,248,245,0.6)' }}>{tox.popularLabel || 'Most popular visit'}</p>
            <span style={{ borderRadius: '9999px', background: 'rgba(250,248,245,0.1)', fontFamily: fonts.body, fontWeight: 600 }} className="inline-flex items-center px-3 py-1 text-sm">
              {p.popularUnits} units
            </span>
          </div>

          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div style={{ borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '1rem' }}>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: 'rgba(250,248,245,0.5)' }}>New patient estimate</p>
              <p style={{ fontFamily: fonts.display, fontWeight: 800 }} className="mt-1 text-3xl">{money(p.newTotal)}</p>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.5)' }} className="mt-1 text-xs">
                Includes foundation ({p.baseUnits}u) + add-ons ({p.addUnits}u)
              </p>
            </div>
            <div style={{ borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '1rem' }}>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: 'rgba(250,248,245,0.5)' }}>Returning estimate</p>
              <p style={{ fontFamily: fonts.display, fontWeight: 800 }} className="mt-1 text-3xl">{money(p.returningTotal)}</p>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.5)' }} className="mt-1 text-xs">
                Includes foundation ({p.baseUnits}u) + add-ons ({p.addUnits}u)
              </p>
            </div>
          </div>

          <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.5)' }} className="mt-3 text-[11px]">
            Not a quote--just transparent math. Your injector confirms dose and plan.
          </p>
        </div>

        {/* Foundation */}
        <div style={{ borderRadius: '1rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, padding: '1rem' }} className="mt-5">
          <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Foundation (included in every visit)</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="text-sm sm:text-base">
              <strong>{tox.foundation.units} Units</strong>
              <span style={{ color: colors.muted }}> (starting block)</span>
            </p>
            <p style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }} className="text-lg sm:text-xl">{money(tox.foundation.price)}</p>
          </div>
          {tox.foundation.note ? <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-2 text-xs">{tox.foundation.note}</p> : <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-2 text-xs">Standard foundation pricing.</p>}
          <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-2 text-xs">
            Most patients add units beyond foundation to reach their ideal plan.
          </p>
        </div>

        {/* Add-ons */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div style={{ borderRadius: '1rem', border: `1px solid ${colors.stone}`, padding: '1rem' }}>
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Add-on Units</p>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-2 text-sm">New Patients</p>
            <p style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }} className="mt-1 text-2xl">{money2(tox.addOns.new)}/unit</p>
          </div>
          <div style={{ borderRadius: '1rem', border: `1px solid ${colors.stone}`, padding: '1rem' }}>
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Add-on Units</p>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-2 text-sm">Returning Patients</p>
            <p style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }} className="mt-1 text-2xl">{money2(tox.addOns.returning)}/unit</p>
          </div>
        </div>

        {/* Booking buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <a
            href={CONSULT_URL_WESTFIELD}
            onClick={() => trackEvent('consult_click', { placement: 'tox_card_consult', tox: tox.key, location: 'westfield' })}
            style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white }}
            className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-90 w-full sm:w-auto"
          >
            Book at Westfield
          </a>
          <a
            href={CONSULT_URL_CARMEL}
            onClick={() => trackEvent('consult_click', { placement: 'tox_card_consult', tox: tox.key, location: 'carmel' })}
            style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
            className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-80 w-full sm:w-auto"
          >
            Book at Carmel
          </a>
        </div>

        <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-3 text-[11px]">
          Foundation is included in every visit. Add-on units apply only beyond the foundation dose.
        </p>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group" style={{ borderBottom: `1px solid ${colors.stone}` }}>
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 flex items-center justify-between" style={{ fontFamily: fonts.body, fontWeight: 600 }}>
        <span style={{ color: colors.heading }} className="text-sm sm:text-base">{q}</span>
        <svg className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: colors.muted }} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.188l3.71-3.957a.75.75 0 1 1 1.08 1.04l-4.24 4.52a.75.75 0 0 1-1.08 0L5.25 8.27a.75.75 0 0 1-.02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div style={{ fontFamily: fonts.body, color: colors.body }} className="px-4 sm:px-6 pb-5 text-sm sm:text-base">{a}</div>
    </details>
  )
}

function Arrow() {
  return (
    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M12.293 5.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 1 1-1.414-1.414L14.586 11H3a1 1 0 1 1 0-2h11.586l-2.293-2.293a1 1 0 0 1 0-1.414z" />
    </svg>
  )
}
