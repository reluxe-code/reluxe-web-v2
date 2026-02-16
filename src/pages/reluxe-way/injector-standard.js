// src/pages/reluxe-way/injector-standard.js
// The RELUXE Way — The Injector Standard (standalone spoke page)

/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way/injector-standard'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/reluxe-way/injector-standard-og.jpg` // ✅ create (1200x630)
const OG_IMAGE_SQUARE = `${SITE_URL}/images/reluxe-way/injector-standard-og-square.jpg` // optional (1080x1080)

const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'
const RESULTS_OVER_DEALS_URL = '/reluxe-way/results-over-deals'

// ✅ Consult URLs (update to your true “Getting Started with RELUXE” route)
const CONSULT_URL = '/book/getting-started'
const CONSULT_URL_WESTFIELD = '/book/getting-started?loc=westfield'
const CONSULT_URL_CARMEL = '/book/getting-started?loc=carmel'
const CONSULT_NAME = 'Getting Started with RELUXE'

// Contact / social
const MARKETING_SMS = '3173609000'
const PHONE_CALL = '3177631142'
const DISPLAY_PHONE = '317-763-1142'
const IG_URL = 'https://instagram.com/reluxemedspa'
const IG_DM_URL = 'https://ig.me/m/reluxemedspa'
const FB_MSG_URL = 'https://m.me/reluxemedspa'

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

  if (typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, payload)
    } catch (_) {}
  }
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, payload)
    } catch (_) {}
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...payload })
  }
}

function getSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL_URL}#webpage`,
        url: CANONICAL_URL,
        name: 'The Injector Standard | Why Who Injects You Matters | RELUXE (Carmel & Westfield)',
        description:
          'Same product, different results. Learn why injector training, technique, and judgment matter more than the brand on the vial — and what the RELUXE Injector Standard means in Carmel & Westfield.',
        isPartOf: { '@id': `${SITE_URL}#website` },
        about: [
          { '@type': 'Thing', name: 'Botox injector' },
          { '@type': 'Thing', name: 'Dysport injector' },
          { '@type': 'Thing', name: 'Jeuveau injector' },
          { '@type': 'Thing', name: 'Daxxify injector' },
          { '@type': 'Thing', name: 'injector technique' },
          { '@type': 'Thing', name: 'facial balancing' },
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
          { '@type': 'ListItem', position: 3, name: 'The Injector Standard', item: CANONICAL_URL },
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

export default function InjectorStandardPage() {
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 360)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const smsBody = encodeURIComponent(`Hi RELUXE! I’d love to book a ${CONSULT_NAME}. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const pageTitle =
    'The Injector Standard | Same Product, Different Results | RELUXE (Carmel & Westfield)'
  const pageDescription =
    'Same product, different results. Learn why injector training, technique, and judgment matter more than the brand on the vial — and what the RELUXE Injector Standard means in Carmel & Westfield.'

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
        <meta property="og:title" content="The Injector Standard — The RELUXE Way" />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="The Injector Standard — The RELUXE Way (Carmel & Westfield)" />
        <meta property="og:image" content={OG_IMAGE_SQUARE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Injector Standard — The RELUXE Way" />
        <meta name="twitter:description" content={pageDescription} />
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

            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Same product. Completely different results.
            </h1>

            <p className="mt-4 text-neutral-200 text-base sm:text-lg leading-relaxed">
              Neurotoxins aren’t the full story. <strong>Technique is the treatment.</strong>
            </p>

            <p className="mt-3 text-neutral-300 text-sm sm:text-base leading-relaxed">
              Botox®, Jeuveau®, Dysport®, Daxxify® — the brand matters. But what matters more is who injects it, how they map your movement,
              and how they plan your results over time.
            </p>

            {/* Consult-first CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <CTA
                href={CONSULT_URL}
                primary
                trackName="consult_click"
                trackParams={{ placement: 'hero_primary_consult', location: 'any' }}
              >
                Book a Consult
              </CTA>

              <CTA
                href={TOX_PRICING_URL}
                trackName="spoke_click"
                trackParams={{ placement: 'hero_secondary_pricing', target: TOX_PRICING_URL }}
              >
                See Transparent Pricing
              </CTA>

              <CTA
                href={IG_URL}
                external
                trackName="instagram_click"
                trackParams={{ placement: 'hero_instagram' }}
              >
                See Our Work (@reluxemedspa)
              </CTA>
            </div>

            <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="What we optimize for" value="Natural results" />
                <MiniStat label="How we get there" value="Expert mapping" />
                <MiniStat label="Why it matters" value="Better longevity" />
              </div>
              <p className="mt-3 text-[12px] text-neutral-400">
                Education only. Treatment plan and dosing are customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Why who injects matters */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>Why it matters</Eyebrow>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                The injector matters more than the vial.
              </h2>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                Tox is simple to buy. It’s not simple to deliver consistently great outcomes.
              </p>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                Great results come from an injector who understands:
              </p>

              <ul className="mt-4 space-y-2 text-neutral-700">
                <Bullet>How your facial muscles actually move (not just “where wrinkles are”).</Bullet>
                <Bullet>How dosing changes balance, lift, and expression.</Bullet>
                <Bullet>How to preserve natural movement while still smoothing lines.</Bullet>
                <Bullet>How to plan your face over time, not just today.</Bullet>
              </ul>

              <p className="mt-5 text-neutral-700 leading-relaxed">
                In other words: it’s not “injecting tox.” It’s <strong>facial decision-making</strong>.
              </p>
            </div>

            <div className="lg:col-span-5">
              <SideCard>
                <p className="text-[11px] tracking-widest uppercase text-neutral-500">A simple truth</p>
                <h3 className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">
                  Same number of units can still look different.
                </h3>
                <p className="mt-3 text-neutral-700 leading-relaxed">
                  Placement, dilution practices, muscle mapping, and planning determine whether results look refreshed or “off.”
                </p>

                <div className="mt-5 grid sm:grid-cols-2 gap-2">
                  <a
                    href={CONSULT_URL_WESTFIELD}
                    onClick={() => trackEvent('consult_click', { placement: 'side_westfield', location: 'westfield' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
                  >
                    Westfield Consult
                  </a>
                  <a
                    href={CONSULT_URL_CARMEL}
                    onClick={() => trackEvent('consult_click', { placement: 'side_carmel', location: 'carmel' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
                  >
                    Carmel Consult
                  </a>
                </div>

                <div className="mt-4 text-[11px] text-neutral-500">
                  Prefer to message us?{' '}
                  <a
                    href={IG_DM_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('instagram_dm_click', { placement: 'side_ig_dm' })}
                    className="underline"
                  >
                    Instagram DM
                  </a>{' '}
                  •{' '}
                  <a
                    href={FB_MSG_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('facebook_message_click', { placement: 'side_fb_msg' })}
                    className="underline"
                  >
                    Facebook message
                  </a>
                </div>
              </SideCard>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: RELUXE Injector Standard */}
      <section className="bg-neutral-50 border-y border-neutral-200 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>The RELUXE Injector Standard</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              What “standard” means at RELUXE
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              This is what we hold ourselves to—every visit, every face, every injector.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <StandardCard title="Movement mapping first">
              We assess how your face moves in motion, not just how it looks at rest.
            </StandardCard>
            <StandardCard title="Dose with intention">
              Units are chosen based on your anatomy and goals—not a generic template.
            </StandardCard>
            <StandardCard title="Natural > frozen">
              We aim for a refreshed look with expression intact (unless you want a stronger hold).
            </StandardCard>
            <StandardCard title="Facial balance mindset">
              We consider the whole face—how each area affects lift, symmetry, and harmony.
            </StandardCard>
            <StandardCard title="Plan for longevity">
              We design cadence and dosing that reduces “wore off too fast” frustration.
            </StandardCard>
            <StandardCard title="Education without pressure">
              You’ll understand your options clearly. Then you choose what feels right.
            </StandardCard>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
              Why this aligns with our pricing
            </h3>
            <p className="mt-3 text-neutral-700 leading-relaxed">
              Our pricing model is designed to support the right plan—so expert recommendations don’t feel like an upsell.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <a
                href={TOX_PRICING_URL}
                onClick={() => trackEvent('spoke_click', { placement: 'standard_pricing', target: TOX_PRICING_URL })}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
              >
                See Tox Pricing Model
              </a>
              <a
                href={RESULTS_OVER_DEALS_URL}
                onClick={() => trackEvent('spoke_click', { placement: 'standard_results_over_deals', target: RESULTS_OVER_DEALS_URL })}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-neutral-50 transition"
              >
                Read Results Over Deals
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: What your consult looks like */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>What to expect</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              What happens in a RELUXE consult
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              We keep it straightforward: movement, goals, plan. No pressure.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <StepCard step="Step 1" title="Assess movement" copy="We look at how your face moves—smile, squint, raise brows, talk." />
            <StepCard step="Step 2" title="Align on your look" copy="Soft + natural, stronger hold, event timing, maintenance cadence—your preference drives the plan." />
            <StepCard step="Step 3" title="Build the plan" copy="We recommend dosing and areas with clear reasoning, then you choose what feels right." />
          </div>

          <div className="mt-8 rounded-3xl bg-neutral-50 border border-neutral-200 p-6 sm:p-7">
            <p className="text-neutral-800 leading-relaxed">
              The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking? Call, text, or DM us and we’re happy to help.
            </p>

            <div className="mt-5 grid sm:grid-cols-2 gap-2 max-w-2xl">
              <a
                href={CONSULT_URL_WESTFIELD}
                onClick={() => trackEvent('consult_click', { placement: 'expect_consult', location: 'westfield' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
              >
                Book Westfield Consult
              </a>
              <a
                href={CONSULT_URL_CARMEL}
                onClick={() => trackEvent('consult_click', { placement: 'expect_consult', location: 'carmel' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
              >
                Book Carmel Consult
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
              <a
                href={smsHref}
                onClick={() => trackEvent('sms_click', { placement: 'expect_sms', phone: MARKETING_SMS })}
                className="underline"
              >
                Text us
              </a>
              <span>•</span>
              <a
                href={callHref}
                onClick={() => trackEvent('call_click', { placement: 'expect_call', phone: PHONE_CALL })}
                className="underline"
              >
                Call {DISPLAY_PHONE}
              </a>
              <span>•</span>
              <a
                href={IG_DM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_dm_click', { placement: 'expect_ig_dm' })}
                className="underline"
              >
                DM us
              </a>
              <span>•</span>
              <a
                href={IG_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_click', { placement: 'expect_instagram' })}
                className="underline"
              >
                @reluxemedspa
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-neutral-950 text-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-7 sm:p-10">
            <p className="text-[11px] tracking-widest uppercase text-neutral-400">Bottom line</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Technique is the treatment.
            </h2>
            <p className="mt-4 text-neutral-200 leading-relaxed max-w-3xl">
              If you want results that feel natural, last longer, and are planned intentionally—start with a consult.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-2 max-w-2xl">
              <a
                href={CONSULT_URL_WESTFIELD}
                onClick={() => trackEvent('consult_click', { placement: 'final_consult', location: 'westfield' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900 transition"
              >
                Book Westfield Consult
                <Arrow />
              </a>
              <a
                href={CONSULT_URL_CARMEL}
                onClick={() => trackEvent('consult_click', { placement: 'final_consult', location: 'carmel' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ring-1 ring-white/15 hover:bg-white/10 transition"
              >
                Book Carmel Consult
              </a>
            </div>

            <div className="mt-5 text-sm text-neutral-300">
              Prefer help booking?{' '}
              <a
                href={`sms:${MARKETING_SMS}?&body=${encodeURIComponent(`Hi RELUXE! I’d like help booking a ${CONSULT_NAME}.`)}`}
                onClick={() => trackEvent('sms_click', { placement: 'final_sms', phone: MARKETING_SMS })}
                className="underline"
              >
                Text us
              </a>{' '}
              or{' '}
              <a
                href={`tel:${PHONE_CALL}`}
                onClick={() => trackEvent('call_click', { placement: 'final_call', phone: PHONE_CALL })}
                className="underline"
              >
                call {DISPLAY_PHONE}
              </a>
              .
            </div>
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

function Eyebrow({ children }) {
  return <p className="text-[11px] tracking-widest uppercase text-neutral-500">{children}</p>
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-black/20 ring-1 ring-white/10 p-3">
      <p className="text-[11px] tracking-widest uppercase text-neutral-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
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

function SideCard({ children }) {
  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7 shadow-sm">{children}</div>
    </div>
  )
}

function StandardCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
      <p className="text-[11px] tracking-widest uppercase text-neutral-500">Standard</p>
      <h3 className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">{title}</h3>
      <p className="mt-3 text-neutral-700 leading-relaxed">{children}</p>
    </div>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 min-w-[88px] px-3 rounded-xl bg-gradient-to-br from-emerald-500 to-neutral-900 text-white font-bold text-[11px] tracking-tight flex items-center justify-center">
          {step}
        </div>
        <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-neutral-900">{title}</h3>
      </div>
      <p className="mt-3 text-neutral-700 leading-relaxed">{copy}</p>
    </div>
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
