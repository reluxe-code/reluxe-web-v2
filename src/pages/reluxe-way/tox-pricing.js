// src/pages/reluxe-way/tox-pricing.js
// The RELUXE Way — Tox Pricing (standalone spoke page in the RELUXE Way hub)

/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const PAGE_NAME = 'Tox Pricing — The RELUXE Way'
const HUB_URL = '/reluxe-way'

// ✅ Booking URLs
const BOOK_TOX_URL = '/book/tox'
const BOOK_TOX_URL_WESTFIELD = '/book/tox?loc=westfield'
const BOOK_TOX_URL_CARMEL = '/book/tox?loc=carmel'

// ✅ Consult URLs
const CONSULT_URL = '/book/getting-started'
const CONSULT_URL_WESTFIELD = '/book/getting-started?loc=westfield'
const CONSULT_URL_CARMEL = '/book/getting-started?loc=carmel'
const CONSULT_NAME = 'Getting Started with RELUXE'

// ✅ Absolute URLs for social previews
const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way/tox-pricing'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`
const OG_IMAGE = `${SITE_URL}/images/reluxe-way/tox-pricing-og.jpg`
const OG_IMAGE_SQUARE = `${SITE_URL}/images/reluxe-way/tox-pricing-og-square.jpg` // optional

// Contact / social
const MARKETING_SMS = '3173609000'
const PHONE_CALL = '3177631142'
const DISPLAY_PHONE = '317-763-1142'
const IG_URL = 'https://instagram.com/reluxemedspa'
const IG_DM_URL = 'https://ig.me/m/reluxemedspa'
const FB_MSG_URL = 'https://m.me/reluxemedspa'

/**
 * Pricing
 * NOTE: We’re adding `popularDose` so the page can anchor expectations
 * without implying “foundation” is the typical amount.
 */
const TOX_PRICING = [
  {
    key: 'jeuveau',
    name: 'Jeuveau®',
    tagline: 'Best Value, Natural Results',
    foundation: { units: 20, price: 200, note: 'after $40 off w/ Evolus Rewards' },
    addOns: { new: 6, returning: 8 },
    popularDose: 50, // ✅ most popular
    popularLabel: 'Most popular visit',
  },
  {
    key: 'botox',
    name: 'Botox®',
    tagline: 'Premium, Proven Results',
    foundation: { units: 20, price: 280, note: null },
    addOns: { new: 9, returning: 10 },
    popularDose: 50, // ✅ most popular
    popularLabel: 'Most popular visit',
  },
  {
    key: 'dysport',
    name: 'Dysport®',
    tagline: 'Fast-Acting, Great Coverage',
    foundation: { units: 50, price: 225, note: null },
    addOns: { new: 3, returning: 3.5 },
    popularDose: 100, // ✅ most popular
    popularLabel: 'Most popular visit',
  },
  {
    key: 'daxxify',
    name: 'Daxxify®',
    tagline: 'Longest-Lasting, Premium Tox',
    foundation: { units: 40, price: 280, note: null },
    addOns: { new: 4, returning: 5 },
    popularDose: 100, // ✅ most popular
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
          'Transparent tox pricing in Carmel & Westfield. View Botox®, Daxxify®, Jeuveau®, and Dysport® pricing with our foundation + right dosing model for new and returning patients at RELUXE Med Spa.',
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
                'Not usually. The foundation dose is the starting block that’s included in every visit, but most patients land at our most popular doses (for example, 50 units for Botox®/Jeuveau® and 100 units for Dysport®/Daxxify®). Your injector confirms the best plan for your face.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this a discount or promo?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'No. This is our pricing model. Your visit includes a foundation dose at a standard price, and additional units switch to our Right Dosing rates so choosing the right plan doesn’t feel like an upsell.',
            },
          },
          {
            '@type': 'Question',
            name: 'Why do you price it this way?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Because expert dosing drives satisfaction and longevity. We want pricing to support the plan that delivers the best result—without pressure or surprise totals.',
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
                'Start with a consult with one of our nurse injectors. We’ll map movement, discuss your goals, and recommend the right plan and dose.',
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
  const [showSticky, setShowSticky] = useState(false)

  // Calculator defaults
  const [calcTox, setCalcTox] = useState('jeuveau')
  const [calcType, setCalcType] = useState('new') // 'new' | 'returning'
  const [calcUnits, setCalcUnits] = useState(50)

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 360)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const smsBody = encodeURIComponent(`Hi RELUXE! I’d love to book a ${CONSULT_NAME}. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const selected = useMemo(() => TOX_PRICING.find((t) => t.key === calcTox), [calcTox])

  // ✅ When tox changes, default the slider to the most popular dose (not the foundation)
  useEffect(() => {
    const t = TOX_PRICING.find((x) => x.key === calcTox)
    if (!t) return
    const defaultUnits = t.popularDose || t.foundation.units
    setCalcUnits((prev) => {
      // If user already moved it far from defaults, don’t override aggressively.
      // But on tox change, set a sane default.
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
    'Transparent tox pricing in Carmel & Westfield. View Botox®, Daxxify®, Jeuveau®, and Dysport® pricing with our foundation + right dosing model for new and returning patients at RELUXE Med Spa.'

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
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />

        {/* Open Graph */}
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:title" content="RELUXE Tox Pricing — Botox, Daxxify, Jeuveau, Dysport (Carmel & Westfield)" />
        <meta property="og:description" content="Transparent tox pricing in Carmel & Westfield. Foundation + Right Dosing pricing for new & returning patients." />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="RELUXE Tox Pricing — Transparent pricing for Botox, Daxxify, Jeuveau, Dysport in Carmel & Westfield"
        />
        {/* Optional square */}
        <meta property="og:image" content={OG_IMAGE_SQUARE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RELUXE Tox Pricing — Carmel & Westfield" />
        <meta name="twitter:description" content="Transparent pricing for Botox®, Daxxify®, Jeuveau®, and Dysport® with our foundation + right dosing model." />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* Local */}
        <meta name="geo.region" content="US-IN" />
        <meta name="geo.placename" content="Carmel, IN; Westfield, IN" />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchema(), null, 2) }} />
      </Head>

      <HeaderTwo />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.22),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-5xl text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] tracking-widest uppercase text-neutral-400">The RELUXE Way</span>
              <span className="text-neutral-600">•</span>
              <span className="text-[11px] tracking-widest uppercase text-neutral-400">Carmel & Westfield</span>
              <span className="text-neutral-600">•</span>
              <a
                href={HUB_URL}
                onClick={() => trackEvent('hub_click', { placement: 'hero_breadcrumb' })}
                className="text-[11px] tracking-widest uppercase text-emerald-300 hover:text-emerald-200"
              >
                Back to the hub →
              </a>
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Tox Pricing, Re-Invented.</h1>

            <p className="mt-4 text-neutral-200 text-base sm:text-lg leading-relaxed">
              You told us you want <strong>certainty</strong>—not deal-chasing, not surprises, and not pricing that feels like a gimmick.
              So we built a model that protects quality and rewards what matters most: <strong>the right dose.</strong>
            </p>

            <p className="mt-3 text-neutral-300 text-sm sm:text-base leading-relaxed">
              The most common “sweet spot” we see: <strong>50 units for Botox® / Jeuveau®</strong> and <strong>100 units for Dysport® / Daxxify®</strong>.
              Your injector confirms what’s right for your face.
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

            <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="Built for certainty" value="No bait & switch" />
                <MiniStat label="Built for results" value="Right dose wins" />
                <MiniStat label="Built for trust" value="Local, family-owned" />
              </div>
              <p className="mt-3 text-[12px] text-neutral-400">
                Pricing shown is for tox injections only. Treatment plans and dosing are customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SNAPSHOT (NEW) */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Quick pricing snapshot</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Most popular dose, made simple.
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              We include a <strong>foundation dose</strong> in every visit (so quality is protected), then add-on units switch to <strong>Right Dosing</strong> pricing.
              The foundation is a starting block—not a “typical amount.”
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 overflow-hidden">
            <div className="grid md:grid-cols-4 gap-0 bg-neutral-50 border-b border-neutral-200">
              <div className="p-4 text-xs tracking-widest uppercase text-neutral-500 font-semibold">Tox</div>
              <div className="p-4 text-xs tracking-widest uppercase text-neutral-500 font-semibold">Most popular dose</div>
              <div className="p-4 text-xs tracking-widest uppercase text-neutral-500 font-semibold">New patient estimate</div>
              <div className="p-4 text-xs tracking-widest uppercase text-neutral-500 font-semibold">Returning estimate</div>
            </div>

            {snapshotRows.map((r) => (
              <div key={r.key} className="grid md:grid-cols-4 gap-0 border-b border-neutral-200 last:border-b-0">
                <div className="p-4">
                  <p className="font-extrabold text-neutral-900">{r.name}</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Includes foundation ({r.baseUnits}u) + add-ons ({r.addUnits}u)
                  </p>
                </div>
                <div className="p-4 flex items-center">
                  <span className="inline-flex items-center rounded-full bg-neutral-900 text-white px-3 py-1 text-sm font-semibold">
                    {r.popularUnits} units
                  </span>
                </div>
                <div className="p-4 flex items-center">
                  <p className="text-xl font-extrabold text-neutral-900">{money(r.newTotal)}</p>
                </div>
                <div className="p-4 flex items-center">
                  <p className="text-xl font-extrabold text-neutral-900">{money(r.returningTotal)}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-neutral-500">
            Estimates are transparent math based on the model below—not a quote. Your injector confirms the best dose and plan in the chair.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <a
              href={CONSULT_URL}
              onClick={() => trackEvent('consult_click', { placement: 'snapshot_primary_consult', location: 'any' })}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition w-full sm:w-auto"
            >
              Book a Consult
            </a>
            <a
              href={BOOK_TOX_URL}
              onClick={() => trackEvent('book_click', { placement: 'snapshot_secondary_book_tox', location: 'any' })}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-neutral-50 transition w-full sm:w-auto"
            >
              Book Tox
            </a>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="bg-white py-12 sm:py-14 border-t border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>What we heard</Eyebrow>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Patients don’t want “promos.” They want confidence.
              </h2>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                Over our first two years, we tried what most med spas try: new patient specials, rotating offers, monthly discounts. And we listened.
              </p>

              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <QuoteCard title="“I just want to know what it’s going to cost.”" copy="Certainty beats surprise. Especially when it’s your face." />
                <QuoteCard title="“I don’t want to hop around for deals.”" copy="You want a place you can trust, not a place you have to time." />
              </div>

              <p className="mt-5 text-neutral-700 leading-relaxed">
                Many pricing models unintentionally reward under-dosing—because it looks cheaper in the moment. Long term, under-dosing is the fastest way to disappointment.
              </p>
            </div>

            <div className="lg:col-span-5">
              <StickySideCard>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">Our belief</h3>
                <p className="mt-3 text-neutral-700 leading-relaxed">
                  <strong>Dosing determines duration.</strong>
                  <br />
                  <strong>Expert dosing determines satisfaction.</strong>
                </p>
                <p className="mt-3 text-sm text-neutral-600">
                  Our pricing is designed to make it easy to say “yes” to the plan that delivers the best result.
                </p>

                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={CONSULT_URL}
                    onClick={() => trackEvent('consult_click', { placement: 'belief_card_primary_consult', location: 'any' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
                  >
                    Book a Consult
                  </a>

                  <a
                    href={BOOK_TOX_URL}
                    onClick={() => trackEvent('book_click', { placement: 'belief_card_secondary_book_tox', location: 'any' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-neutral-50 transition"
                  >
                    Book Tox
                  </a>
                </div>
              </StickySideCard>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-neutral-50 border-y border-neutral-200 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Foundation + Right Dosing
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              Every tox visit includes a <strong>foundation dose</strong> at a standard price. That foundation protects the experience (expert injectors, advanced technique, ongoing education, and a plan built around your anatomy).
              <span className="block mt-3">
                Then, if your plan needs more units (which is common), add-ons switch to <strong>Right Dosing</strong> pricing—so the “most popular dose” stays straightforward.
              </span>
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <StepCard
              step="Step 1"
              title="Foundation is included"
              copy="Your visit starts with a foundation dose that’s included in every appointment. It’s not the “typical amount”—it’s the starting block that protects quality."
            />
            <StepCard
              step="Step 2"
              title="We map your movement"
              copy="We listen to your goals, map expression, and design the plan for your face—often across multiple areas."
            />
            <StepCard
              step="Step 3"
              title="Add-ons switch to Right Dosing"
              copy="Units above foundation switch to our Right Dosing rates, so choosing the correct plan doesn’t feel like an upsell."
            />
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">The RELUXE promise</h3>
            <p className="mt-2 text-neutral-700 leading-relaxed">
              No bait & switch. No pressure. Just expert injectors + transparent pricing built for results.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <a
                href={CONSULT_URL}
                onClick={() => trackEvent('consult_click', { placement: 'promise_primary_consult', location: 'any' })}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition w-full sm:w-auto"
              >
                Book a Consult
              </a>
              <a
                href={BOOK_TOX_URL}
                onClick={() => trackEvent('book_click', { placement: 'promise_secondary_book_tox', location: 'any' })}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-neutral-50 transition w-full sm:w-auto"
              >
                Book Tox
              </a>
            </div>

            <p className="mt-3 text-[11px] text-neutral-500">
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
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Transparent pricing</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">Choose your tox. See your pricing.</h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              Each option shows the foundation dose, add-on rates, and an easy “most popular dose” example so you can understand total cost without guessing.
            </p>
          </div>

          <div className="mt-8 grid lg:grid-cols-2 gap-4 sm:gap-6">
            {TOX_PRICING.map((t) => (
              <ToxPricingCard key={t.key} tox={t} />
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">Want help choosing?</h3>
                <p className="mt-1 text-sm text-neutral-600">Tell us your goals and your timeline. We’ll point you to the best fit.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={smsHref}
                  onClick={() => trackEvent('sms_click', { placement: 'pricing_help_sms', phone: MARKETING_SMS })}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
                >
                  Text Questions
                </a>
                <a
                  href={IG_DM_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('instagram_dm_click', { placement: 'pricing_help_ig_dm' })}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
                >
                  DM on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="bg-neutral-950 text-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <Eyebrow dark>Quick estimate</Eyebrow>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">What would my appointment cost?</h2>
              <p className="mt-4 text-neutral-200 leading-relaxed">
                This is an estimate tool to keep pricing clear. We default to our <strong>most popular dose</strong> so you’re not stuck thinking “foundation = typical.”
              </p>

              <div className="mt-6 rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                <p className="text-sm font-semibold">Estimated total</p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight">{money(calcTotal)}</p>
                <p className="mt-2 text-sm text-neutral-300">Includes foundation + add-on units at Right Dosing pricing.</p>

                <div className="mt-5 grid sm:grid-cols-2 gap-2">
                  <a
                    href={CONSULT_URL_WESTFIELD}
                    onClick={() =>
                      trackEvent('consult_click', {
                        placement: 'calculator_consult',
                        location: 'westfield',
                        tox: calcTox,
                        patient_type: calcType,
                        units: calcUnits,
                      })
                    }
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900 transition"
                  >
                    Book Westfield Consult
                    <Arrow />
                  </a>
                  <a
                    href={CONSULT_URL_CARMEL}
                    onClick={() =>
                      trackEvent('consult_click', {
                        placement: 'calculator_consult',
                        location: 'carmel',
                        tox: calcTox,
                        patient_type: calcType,
                        units: calcUnits,
                      })
                    }
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-white/15 hover:bg-white/10 transition"
                  >
                    Book Carmel Consult
                  </a>
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
                    className="inline-flex items-center justify-center w-full rounded-2xl px-5 py-3 font-semibold ring-1 ring-white/15 hover:bg-white/10 transition"
                  >
                    Text Us This Estimate
                  </a>
                </div>

                <p className="mt-3 text-[11px] text-neutral-400">Transparent estimate tool, not a quote. Dosing and plan are customized by your injector.</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6 sm:p-7">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-neutral-400">Choose your tox</label>
                    <select
                      value={calcTox}
                      onChange={(e) => {
                        setCalcTox(e.target.value)
                        trackEvent('calculator_change', { field: 'tox', value: e.target.value })
                      }}
                      className="mt-2 w-full rounded-2xl bg-neutral-900 ring-1 ring-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {TOX_PRICING.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    <p className="mt-3 text-sm text-neutral-300">
                      Foundation: <strong>{selected?.foundation.units} units</strong> for <strong>{money(selected?.foundation.price)}</strong>{' '}
                      {selected?.foundation.note ? <span className="text-neutral-400">({selected.foundation.note})</span> : null}
                    </p>

                    <p className="mt-2 text-sm text-neutral-300">
                      Most popular dose: <strong>{selected?.popularDose} units</strong>
                    </p>
                  </div>

                  <div>
                    <label className="text-xs tracking-widest uppercase text-neutral-400">Patient type</label>
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

                    <p className="mt-3 text-sm text-neutral-300">
                      Add-on units:{' '}
                      <strong>{money2(calcType === 'returning' ? selected?.addOns.returning : selected?.addOns.new)}/unit</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-xs tracking-widest uppercase text-neutral-400">Total units</label>
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
                    <div className="min-w-[72px] text-right font-semibold">{calcUnits}</div>
                  </div>

                  <p className="mt-2 text-sm text-neutral-300">
                    Tip: If you’re not sure, start at the most popular dose ({selected?.popularDose}u) and adjust.
                  </p>
                </div>

                <div className="mt-6 rounded-2xl bg-neutral-900/60 ring-1 ring-white/10 p-4">
                  <p className="text-sm font-semibold">How we calculated it</p>
                  <p className="mt-2 text-sm text-neutral-300">Total = foundation price + (units above foundation × add-on per-unit rate)</p>
                </div>

                <p className="mt-4 text-[11px] text-neutral-400">Dosing and plan are customized by your injector.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT / HUMAN ANSWER */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>Why patients stay</Eyebrow>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Because it feels straightforward—and the results feel right.
              </h2>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                We’re local, family-owned, and relationship-driven. Our pricing model is built to make you feel confident before you book—and proud of your decision after you leave.
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <InfoCard title="No surprise pricing" copy="You’ll always know the foundation, and you’ll always know what add-on units cost." />
                <InfoCard title="No pressure" copy="We educate, you choose. The goal is the right plan—not a bigger ticket." />
                <InfoCard title="Better longevity" copy="Right dosing reduces the “it wore off too fast” frustration and helps you love your cadence." />
                <InfoCard title="Consistency" copy="Your plan gets smarter over time. We learn what works best for your face." />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7 shadow-sm">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">Want a human answer?</h3>
                <p className="mt-3 text-neutral-700">
                  The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking?
                  Call, text, or DM us and we’re happy to help.
                </p>

                <div className="mt-5 grid gap-2">
                  <a
                    href={CONSULT_URL}
                    onClick={() => trackEvent('consult_click', { placement: 'contact_card_consult', location: 'any' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
                  >
                    Book a Consult
                  </a>

                  <a
                    href={smsHref}
                    onClick={() => trackEvent('sms_click', { placement: 'contact_card_sms', phone: MARKETING_SMS })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
                  >
                    Text Us
                  </a>

                  <a
                    href={callHref}
                    onClick={() => trackEvent('call_click', { placement: 'contact_card_call', phone: PHONE_CALL })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
                  >
                    Call {DISPLAY_PHONE}
                  </a>

                  <a
                    href={IG_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('instagram_click', { placement: 'contact_card_instagram' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
                  >
                    Follow @reluxemedspa
                  </a>
                </div>

                <p className="mt-4 text-[11px] text-neutral-500">
                  DM links work best on mobile and when you’re logged in:{' '}
                  <a
                    href={IG_DM_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('instagram_dm_click', { placement: 'contact_card_ig_dm' })}
                    className="underline"
                  >
                    Instagram DM
                  </a>{' '}
                  •{' '}
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
      <section className="bg-neutral-50 border-t border-neutral-200 py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-neutral-900">Tox Pricing FAQ</h2>

          <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
            <FaqItem
              q="Is the foundation dose what most people get?"
              a="Not usually. The foundation dose is included in every visit, but most patients land closer to our most popular doses (50 units for Botox®/Jeuveau® and 100 units for Dysport®/Daxxify®). Your injector confirms what’s right for your face."
            />
            <FaqItem
              q="Is this a discount or promo?"
              a="No. This is our pricing model. Your visit includes a foundation dose at a standard price, and additional units switch to our Right Dosing rates so choosing the right plan doesn’t feel like an upsell."
            />
            <FaqItem
              q="Why do you price it this way?"
              a="Because expert dosing drives satisfaction and longevity. We want it to be easy to choose the plan that delivers the best result—without pressure or surprise totals."
            />
            <FaqItem q="Do you use premium brands?" a="Yes. We only use premium, reputable neurotoxin brands and follow best practices for storage, handling, and technique." />
            <FaqItem
              q="How do I know which tox is right for me?"
              a="Start with a consult with one of our nurse injectors. We’ll map movement, discuss your goals, and recommend the right plan and dose."
            />
          </div>

          <div className="mt-8 text-center">
            <a
              href={CONSULT_URL}
              onClick={() => trackEvent('consult_click', { placement: 'faq_primary_consult', location: 'any' })}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold bg-gradient-to-r from-emerald-500 to-black text-white hover:from-emerald-400 hover:to-neutral-900 transition"
            >
              Book a Consult
              <Arrow />
            </a>
            <p className="mt-2 text-xs text-neutral-500">Dosing and treatment plan are customized by your injector. Results vary.</p>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY CTA */}
      {showSticky && <StickyCTA title="Book a Consult" subtitle={CONSULT_NAME} href={CONSULT_URL} />}
    </>
  )
}

/* -----------------------------
   Components
------------------------------ */

function CTA({ href, children, primary, external, trackName, trackParams }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] touch-manipulation transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
  const styles = primary
    ? 'text-white w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-black shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-neutral-900'
    : 'text-white/90 w-full sm:w-auto ring-1 ring-white/20 hover:bg-white/10'

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : 'noopener'}
      className={`${base} ${styles} group`}
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
    <div className="rounded-2xl bg-black/20 ring-1 ring-white/10 p-3">
      <p className="text-[11px] tracking-widest uppercase text-neutral-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function Eyebrow({ children, dark }) {
  return <p className={`text-[11px] tracking-widest uppercase ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>{children}</p>
}

function QuoteCard({ title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
      <p className="mt-2 text-sm text-neutral-600">{copy}</p>
    </div>
  )
}

function StickySideCard({ children }) {
  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">{children}</div>
    </div>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 min-w-[88px] px-3 rounded-xl bg-gradient-to-br from-emerald-500 to-neutral-900 text-white font-bold text-[11px] tracking-tight flex items-center justify-center">
          {step}
        </div>
        <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-neutral-900">{title}</h3>
      </div>
      <p className="mt-3 text-neutral-700 text-sm sm:text-base">{copy}</p>
    </div>
  )
}

function InfoCard({ title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
      <p className="mt-2 text-sm text-neutral-600">{copy}</p>
    </div>
  )
}

function Toggle({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        active ? 'bg-emerald-500 text-black' : 'bg-neutral-900 text-white ring-1 ring-white/10 hover:bg-neutral-800'
      }`}
    >
      {children}
    </button>
  )
}

function ToxPricingCard({ tox }) {
  const p = computePopularTotals(tox)

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">{tox.name}</h3>
            <p className="mt-1 text-sm text-neutral-600">{tox.tagline}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            Foundation + Add-Ons
          </span>
        </div>

        {/* Most popular (NEW) */}
        <div className="mt-5 rounded-3xl bg-neutral-900 text-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs tracking-widest uppercase text-white/70">{tox.popularLabel || 'Most popular visit'}</p>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
              {p.popularUnits} units
            </span>
          </div>

          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
              <p className="text-xs tracking-widest uppercase text-white/60">New patient estimate</p>
              <p className="mt-1 text-3xl font-extrabold">{money(p.newTotal)}</p>
              <p className="mt-1 text-xs text-white/60">
                Includes foundation ({p.baseUnits}u) + add-ons ({p.addUnits}u)
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
              <p className="text-xs tracking-widest uppercase text-white/60">Returning estimate</p>
              <p className="mt-1 text-3xl font-extrabold">{money(p.returningTotal)}</p>
              <p className="mt-1 text-xs text-white/60">
                Includes foundation ({p.baseUnits}u) + add-ons ({p.addUnits}u)
              </p>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-white/60">
            Not a quote—just transparent math. Your injector confirms dose and plan.
          </p>
        </div>

        {/* Foundation */}
        <div className="mt-5 rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 p-4">
          <p className="text-xs tracking-widest uppercase text-neutral-500">Foundation (included in every visit)</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-sm sm:text-base text-neutral-800">
              <strong>{tox.foundation.units} Units</strong>
              <span className="text-neutral-500"> (starting block)</span>
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-neutral-900">{money(tox.foundation.price)}</p>
          </div>
          {tox.foundation.note ? <p className="mt-2 text-xs text-neutral-600">{tox.foundation.note}</p> : <p className="mt-2 text-xs text-neutral-500">Standard foundation pricing.</p>}
          <p className="mt-2 text-xs text-neutral-600">
            Most patients add units beyond foundation to reach their ideal plan.
          </p>
        </div>

        {/* Add-ons */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs tracking-widest uppercase text-neutral-500">Add-on Units</p>
            <p className="mt-2 text-sm text-neutral-700">New Patients</p>
            <p className="mt-1 text-2xl font-extrabold text-neutral-900">{money2(tox.addOns.new)}/unit</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs tracking-widest uppercase text-neutral-500">Add-on Units</p>
            <p className="mt-2 text-sm text-neutral-700">Returning Patients</p>
            <p className="mt-1 text-2xl font-extrabold text-neutral-900">{money2(tox.addOns.returning)}/unit</p>
          </div>
        </div>

        {/* Booking buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <a
            href={CONSULT_URL_WESTFIELD}
            onClick={() => trackEvent('consult_click', { placement: 'tox_card_consult', tox: tox.key, location: 'westfield' })}
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition w-full sm:w-auto"
          >
            Book at Westfield
          </a>
          <a
            href={CONSULT_URL_CARMEL}
            onClick={() => trackEvent('consult_click', { placement: 'tox_card_consult', tox: tox.key, location: 'carmel' })}
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-neutral-50 transition w-full sm:w-auto"
          >
            Book at Carmel
          </a>
        </div>

        <p className="mt-3 text-[11px] text-neutral-500">
          Foundation is included in every visit. Add-on units apply only beyond the foundation dose.
        </p>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 font-semibold flex items-center justify-between">
        <span className="text-sm sm:text-base text-neutral-900">{q}</span>
        <svg
          className={`h-5 w-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.188l3.71-3.957a.75.75 0 1 1 1.08 1.04l-4.24 4.52a.75.75 0 0 1-1.08 0L5.25 8.27a.75.75 0 0 1-.02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div className="px-4 sm:px-6 pb-5 text-neutral-700 text-sm sm:text-base">{a}</div>
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

function StickyCTA({ title, subtitle, href }) {
  return (
    <div className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-24px)] sm:w-full max-w-md rounded-2xl bg-neutral-900/95 px-3 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-neutral-900" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-[11px] text-neutral-400">{subtitle}</p>
        </div>
        <a
          href={href}
          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-black active:scale-[.99] touch-manipulation"
          onClick={() => trackEvent('consult_click', { placement: 'sticky_cta', location: 'any' })}
        >
          Book
        </a>
      </div>
    </div>
  )
}
