// src/pages/reluxe-way/choosing-your-tox.js
// The RELUXE Way — Choosing Your Tox (standalone spoke page)

/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way/choosing-your-tox'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/reluxe-way/choosing-your-tox-og.jpg` // ✅ create (1200x630)
const OG_IMAGE_SQUARE = `${SITE_URL}/images/reluxe-way/choosing-your-tox-og-square.jpg` // optional (1080x1080)

const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'
const INJECTOR_STANDARD_URL = '/reluxe-way/injector-standard'

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
        name: 'Choosing Your Tox | Botox, Jeuveau, Dysport, Daxxify | RELUXE (Carmel & Westfield)',
        description:
          'Botox®, Jeuveau®, Dysport®, or Daxxify®? Learn the differences, when each shines, and how RELUXE helps you choose based on your face and goals in Carmel & Westfield.',
        isPartOf: { '@id': `${SITE_URL}#website` },
        about: [
          { '@type': 'Thing', name: 'Botox vs Jeuveau' },
          { '@type': 'Thing', name: 'Dysport vs Botox' },
          { '@type': 'Thing', name: 'Daxxify longevity' },
          { '@type': 'Thing', name: 'neurotoxin comparison' },
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
          { '@type': 'ListItem', position: 3, name: 'Choosing Your Tox', item: CANONICAL_URL },
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

export default function ChoosingYourToxPage() {
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
    'Choosing Your Tox | Botox vs Jeuveau vs Dysport vs Daxxify | RELUXE (Carmel & Westfield)'
  const pageDescription =
    'Botox®, Jeuveau®, Dysport®, or Daxxify®? Learn the differences, when each shines, and how RELUXE helps you choose based on your face and goals in Carmel & Westfield.'

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
        <meta property="og:title" content="Choosing Your Tox — The RELUXE Way" />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Choosing Your Tox — Botox, Jeuveau, Dysport, Daxxify (RELUXE)" />
        <meta property="og:image" content={OG_IMAGE_SQUARE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Choosing Your Tox — The RELUXE Way" />
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
              There’s no “best” tox—only the right one.
            </h1>

            <p className="mt-4 text-neutral-200 text-base sm:text-lg leading-relaxed">
              Botox®, Jeuveau®, Dysport®, and Daxxify® each have a role. We choose based on your movement, anatomy, goals, and timeline.
            </p>

            <p className="mt-3 text-neutral-300 text-sm sm:text-base leading-relaxed">
              The fastest way to choose is a consult. We’ll map your movement, talk through your preferences (soft vs strong hold),
              and recommend the best fit—without pressure.
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
                href={INJECTOR_STANDARD_URL}
                trackName="spoke_click"
                trackParams={{ placement: 'hero_secondary_injector_standard', target: INJECTOR_STANDARD_URL }}
              >
                Injector Standard
              </CTA>
            </div>

            <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="Decision factors" value="Movement + goals" />
                <MiniStat label="Your preference" value="Soft vs strong hold" />
                <MiniStat label="Your timeline" value="Events + maintenance" />
              </div>
              <p className="mt-3 text-[12px] text-neutral-400">
                Education only. Your plan is customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK GUIDE */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Quick guide</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              How we choose your tox at RELUXE
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              People often ask, “Which tox is best?” Our answer: it depends on your facial movement, your goals, and your ideal cadence.
              Here’s the exact decision framework we use.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <StepCard step="Step 1" title="Map movement" copy="We look at how your face moves in motion—not just lines at rest." />
            <StepCard step="Step 2" title="Clarify your goal" copy="Soft + natural, stronger hold, lift feel, or longevity-first." />
            <StepCard step="Step 3" title="Match tox to you" copy="We choose based on fit—then adjust over time as we learn your face." />
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
            <p className="text-neutral-800 leading-relaxed">
              Want the fastest answer? Book a consult. We’ll recommend the best fit, explain why, and tailor the plan to your preferences.
            </p>
            <div className="mt-5 grid sm:grid-cols-2 gap-2 max-w-2xl">
              <a
                href={CONSULT_URL_WESTFIELD}
                onClick={() => trackEvent('consult_click', { placement: 'quick_guide_consult', location: 'westfield' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
              >
                Book Westfield Consult
              </a>
              <a
                href={CONSULT_URL_CARMEL}
                onClick={() => trackEvent('consult_click', { placement: 'quick_guide_consult', location: 'carmel' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
              >
                Book Carmel Consult
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON CARDS */}
      <section className="bg-neutral-50 border-y border-neutral-200 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Compare</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              What each tox is great for
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              These are general tendencies—not hard rules. Your injector will guide final selection based on your anatomy and goals.
            </p>
          </div>

          <div className="mt-8 grid lg:grid-cols-2 gap-4 sm:gap-6">
            <ToxCard
              name="Botox®"
              vibe="Proven + predictable"
              bestFor={[
                'Patients who want a very established option',
                'Predictable holds and cadence planning',
                'Great for consistent maintenance',
              ]}
              notes={[
                'Excellent “baseline” choice for many faces',
                'We tailor dosing to your desired movement',
              ]}
            />
            <ToxCard
              name="Jeuveau®"
              vibe="Soft, expressive, value-forward"
              bestFor={[
                'Patients who want a natural, refreshed look',
                'Great value with premium results',
                'Common choice for consistent maintenance',
              ]}
              notes={[
                'A RELUXE favorite when you want a subtle, confident refresh',
                'Ask us about Evolus Rewards',
              ]}
              highlight
            />
            <ToxCard
              name="Dysport®"
              vibe="Great coverage + fast feel for many patients"
              bestFor={[
                'Patients who like how it “settles” across larger areas',
                'Those who want a fast-feeling onset (varies)',
                'Forehead-style areas for many faces (injector dependent)',
              ]}
              notes={[
                'Units are not 1:1 with Botox—your injector will translate dosing correctly',
              ]}
            />
            <ToxCard
              name="Daxxify®"
              vibe="Longevity-first, premium option"
              bestFor={[
                'Patients who prioritize longer time between visits',
                'Those who want a stronger, longer hold (fit-dependent)',
                'Planning around travel, schedules, or life events',
              ]}
              notes={[
                'Longevity varies—your injector will help set expectations',
              ]}
            />
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
              The “right tox” can change over time
            </h3>
            <p className="mt-3 text-neutral-700 leading-relaxed">
              As we learn your face and your preferences, we may adjust dose, areas, or even the tox itself. That’s not inconsistency—it’s personalization.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <a
                href={CONSULT_URL}
                onClick={() => trackEvent('consult_click', { placement: 'compare_primary_consult', location: 'any' })}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
              >
                Book a Consult
              </a>
              <a
                href={TOX_PRICING_URL}
                onClick={() => trackEvent('spoke_click', { placement: 'compare_secondary_pricing', target: TOX_PRICING_URL })}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-neutral-50 transition"
              >
                See Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-neutral-900">
            Choosing Your Tox — FAQ
          </h2>

          <div className="mt-7 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
            <FaqItem
              q="Can I switch tox brands later?"
              a="Yes. Many patients try one option and later switch based on how they like the feel, look, or cadence. We guide you based on results and preferences."
            />
            <FaqItem
              q="Is one tox always ‘stronger’ than the others?"
              a="Not necessarily. “Strength” depends on dose, placement, and your anatomy. Your injector will choose the best fit and tailor dosing to your goals."
            />
            <FaqItem
              q="How do I choose if I’m new to tox?"
              a="Start with a consult. We’ll map your movement, learn your preferences, and recommend the best option to begin with—then adjust as we learn your face."
            />
            <FaqItem
              q="Does pricing differ between toxins?"
              a="Yes. Each has its own pricing structure. See our transparent pricing model to compare foundation doses and add-on unit pricing."
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
            <p className="mt-2 text-xs text-neutral-500">
              Dosing and treatment plan are customized by your injector. Results vary.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section className="bg-neutral-50 border-t border-neutral-200 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-neutral-200 bg-white p-7 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Want a human answer?
            </h2>
            <p className="mt-3 text-neutral-700 leading-relaxed max-w-3xl">
              The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking? Call, text, or DM us and we’re happy to help.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-2 max-w-2xl">
              <a
                href={CONSULT_URL_WESTFIELD}
                onClick={() => trackEvent('consult_click', { placement: 'contact_consult', location: 'westfield' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
              >
                Book Westfield Consult
              </a>
              <a
                href={CONSULT_URL_CARMEL}
                onClick={() => trackEvent('consult_click', { placement: 'contact_consult', location: 'carmel' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
              >
                Book Carmel Consult
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
              <a
                href={smsHref}
                onClick={() => trackEvent('sms_click', { placement: 'contact_sms', phone: MARKETING_SMS })}
                className="underline"
              >
                Text us
              </a>
              <span>•</span>
              <a
                href={callHref}
                onClick={() => trackEvent('call_click', { placement: 'contact_call', phone: PHONE_CALL })}
                className="underline"
              >
                Call {DISPLAY_PHONE}
              </a>
              <span>•</span>
              <a
                href={IG_DM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_dm_click', { placement: 'contact_ig_dm' })}
                className="underline"
              >
                DM us
              </a>
              <span>•</span>
              <a
                href={IG_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_click', { placement: 'contact_instagram' })}
                className="underline"
              >
                @reluxemedspa
              </a>
              <span>•</span>
              <a
                href={FB_MSG_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('facebook_message_click', { placement: 'contact_fb_msg' })}
                className="underline"
              >
                Message us
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

function ToxCard({ name, vibe, bestFor, notes, highlight }) {
  return (
    <div className={`rounded-3xl border p-6 sm:p-7 shadow-sm ${highlight ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">{name}</h3>
          <p className="mt-1 text-sm text-neutral-600">{vibe}</p>
        </div>
        {highlight ? (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            RELUXE Favorite
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            Option
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-[11px] tracking-widest uppercase text-neutral-500">Best for</p>
        <ul className="mt-3 space-y-2 text-neutral-800">
          {bestFor.map((x, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={`mt-2 h-2 w-2 rounded-full ${highlight ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <p className="text-[11px] tracking-widest uppercase text-neutral-500">Notes</p>
        <ul className="mt-3 space-y-2 text-neutral-700">
          {notes.map((x, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={`mt-2 h-2 w-2 rounded-full ${highlight ? 'bg-emerald-400' : 'bg-neutral-300'}`} />
              <span>{x}</span>
            </li>
          ))}
        </ul>
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
