// src/pages/reluxe-way/your-consult.js
// The RELUXE Way — Your Consultation (standalone spoke page)

/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way/your-consult'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/reluxe-way/your-consult-og.jpg` // ✅ create (1200x630)
const OG_IMAGE_SQUARE = `${SITE_URL}/images/reluxe-way/your-consult-og-square.jpg` // optional (1080x1080)

const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'
const RESULTS_OVER_DEALS_URL = '/reluxe-way/results-over-deals'
const INJECTOR_STANDARD_URL = '/reluxe-way/injector-standard'
const CHOOSING_TOX_URL = '/reluxe-way/choosing-your-tox'

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
        name: 'Your Consultation | Getting Started with RELUXE | Carmel & Westfield',
        description:
          'What to expect during your RELUXE consult: movement mapping, goals, plan, and transparent guidance—so you can book with confidence in Carmel & Westfield.',
        isPartOf: { '@id': `${SITE_URL}#website` },
        about: [
          { '@type': 'Thing', name: 'tox consultation' },
          { '@type': 'Thing', name: 'injector consultation' },
          { '@type': 'Thing', name: 'Carmel IN med spa' },
          { '@type': 'Thing', name: 'Westfield IN med spa' },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${CANONICAL_URL}#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'The RELUXE Way', item: `${SITE_URL}${HUB_URL}` },
          { '@type': 'ListItem', position: 3, name: 'Your Consultation', item: CANONICAL_URL },
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

export default function YourConsultPage() {
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
    'Your Consultation | What to Expect at RELUXE | Carmel & Westfield'
  const pageDescription =
    'What to expect during your RELUXE consult: movement mapping, goals, plan, and transparent guidance—so you can book with confidence in Carmel & Westfield.'

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
        <meta property="og:title" content="Your Consultation — The RELUXE Way" />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Your Consultation — The RELUXE Way (Carmel & Westfield)" />
        <meta property="og:image" content={OG_IMAGE_SQUARE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Your Consultation — The RELUXE Way" />
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
              You’re not a template.
            </h1>

            <p className="mt-4 text-neutral-200 text-base sm:text-lg leading-relaxed">
              A RELUXE consult is simple: movement, goals, plan. No pressure—just clarity.
            </p>

            <p className="mt-3 text-neutral-300 text-sm sm:text-base leading-relaxed">
              If you’re new to tox (or just want a better experience), this is the best place to start. We’ll map your movement,
              align on your desired look, and recommend a plan you can feel confident saying yes to.
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
                See Pricing
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
                <MiniStat label="What we do" value="Movement mapping" />
                <MiniStat label="What you get" value="Clear plan" />
                <MiniStat label="What you avoid" value="Pressure + surprises" />
              </div>
              <p className="mt-3 text-[12px] text-neutral-400">
                Education only. Treatment plan and dosing are customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: What happens */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>What to expect</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              What happens in a RELUXE consult
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              We keep it straightforward. We assess movement, align on your goal, then build an intentional plan.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <StepCard step="Step 1" title="Assess movement" copy="We look at how your face moves—smile, squint, raise brows, talk. This is where great plans start." />
            <StepCard step="Step 2" title="Align on your look" copy="Soft + natural, stronger hold, event timing, maintenance cadence—your preference drives the plan." />
            <StepCard step="Step 3" title="Build the plan" copy="We recommend areas + dosing with clear reasoning, then you choose what feels right." />
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
              What makes it different
            </h3>
            <div className="mt-4 grid md:grid-cols-2 gap-4 sm:gap-6">
              <ListCard title="Education first">
                You’ll understand what we’re recommending and why—without feeling rushed or pressured.
              </ListCard>
              <ListCard title="Customization, not templates">
                We don’t inject from a chart. We tailor to your anatomy, movement, and goals.
              </ListCard>
              <ListCard title="Planning over time">
                Your plan gets smarter as we learn your face. Consistency is the real luxury.
              </ListCard>
              <ListCard title="No surprise pricing">
                Transparent pricing means you know the foundation and what add-ons cost before you decide.
              </ListCard>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: What we recommend */}
      <section className="bg-neutral-50 border-y border-neutral-200 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>How we recommend</Eyebrow>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                We recommend the plan that produces the best outcome
              </h2>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                Sometimes that means adding an area you’ve never treated. Sometimes it means slightly more dosing than you’ve had before.
                Sometimes it means switching toxins based on your anatomy and preferences.
              </p>

              <ul className="mt-4 space-y-2 text-neutral-700">
                <Bullet>We listen to your goals first.</Bullet>
                <Bullet>We explain options clearly.</Bullet>
                <Bullet>We recommend what we believe will make you happiest.</Bullet>
                <Bullet>You choose what feels right—no pressure.</Bullet>
              </ul>

              <p className="mt-5 text-neutral-700 leading-relaxed">
                This is why our philosophy ties directly into our pricing model: it should be easy to say “yes” to the right plan.
              </p>
            </div>

            <div className="lg:col-span-5">
              <SideCard>
                <p className="text-[11px] tracking-widest uppercase text-neutral-500">Best place to start</p>
                <h3 className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">
                  Getting Started with RELUXE
                </h3>
                <p className="mt-3 text-neutral-700 leading-relaxed">
                  Not sure what you need? This consult is designed to guide you into the right plan quickly and confidently.
                </p>

                <div className="mt-5 grid sm:grid-cols-2 gap-2">
                  <a
                    href={CONSULT_URL_WESTFIELD}
                    onClick={() => trackEvent('consult_click', { placement: 'side_consult', location: 'westfield' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
                  >
                    Westfield Consult
                  </a>
                  <a
                    href={CONSULT_URL_CARMEL}
                    onClick={() => trackEvent('consult_click', { placement: 'side_consult', location: 'carmel' })}
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

      {/* SECTION 3: Helpful related links */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Helpful reads</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              If you’re the “I want to understand it” type…
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              These pages are designed to answer the most common questions before you ever sit in the chair.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <LinkCard href={TOX_PRICING_URL} title="Transparent Pricing" copy="See foundation + Right Dosing pricing." />
            <LinkCard href={INJECTOR_STANDARD_URL} title="Injector Standard" copy="Why technique matters more than the vial." />
            <LinkCard href={CHOOSING_TOX_URL} title="Choosing Your Tox" copy="Botox vs Jeuveau vs Dysport vs Daxxify." />
            <LinkCard href={RESULTS_OVER_DEALS_URL} title="Results Over Deals" copy="Why cheaper often costs more over time." />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-neutral-950 text-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-7 sm:p-10">
            <p className="text-[11px] tracking-widest uppercase text-neutral-400">Ready when you are</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Book a consult. Get a plan you’ll love.
            </h2>
            <p className="mt-4 text-neutral-200 leading-relaxed max-w-3xl">
              The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking? Call, text, or DM us and we’re happy to help.
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

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-neutral-300">
              <a
                href={`sms:${MARKETING_SMS}?&body=${encodeURIComponent(`Hi RELUXE! I’d like help booking a ${CONSULT_NAME}.`)}`}
                onClick={() => trackEvent('sms_click', { placement: 'final_sms', phone: MARKETING_SMS })}
                className="underline"
              >
                Text us
              </a>
              <span>•</span>
              <a
                href={`tel:${PHONE_CALL}`}
                onClick={() => trackEvent('call_click', { placement: 'final_call', phone: PHONE_CALL })}
                className="underline"
              >
                Call {DISPLAY_PHONE}
              </a>
              <span>•</span>
              <a
                href={IG_DM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_dm_click', { placement: 'final_ig_dm' })}
                className="underline"
              >
                DM us
              </a>
              <span>•</span>
              <a
                href={IG_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_click', { placement: 'final_instagram' })}
                className="underline"
              >
                @reluxemedspa
              </a>
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

function ListCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
      <p className="mt-2 text-sm text-neutral-600">{children}</p>
    </div>
  )
}

function SideCard({ children }) {
  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7 shadow-sm">{children}</div>
    </div>
  )
}

function LinkCard({ href, title, copy }) {
  return (
    <a
      href={href}
      onClick={() => trackEvent('spoke_click', { placement: 'helpful_reads', target: href, title })}
      className="group rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition"
    >
      <p className="text-[11px] tracking-widest uppercase text-neutral-500">Read</p>
      <h3 className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">{title}</h3>
      <p className="mt-3 text-neutral-700 leading-relaxed">{copy}</p>
      <p className="mt-4 text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
        Explore <span className="ml-1">→</span>
      </p>
    </a>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 font-semibold flex items-center justify-between">
        <span className="text-sm sm:text-base text-neutral-900">{q}</span>
        <svg className={`h-5 w-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.188l3.71-3.957a.75.75 0 1 1 1.08 1.04l-4.24 4.52a.75.75 0 0 1-1.08 0L5.25 8.27a.75.75 0 0 1-.02-1.06Z" clipRule="evenodd" />
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
