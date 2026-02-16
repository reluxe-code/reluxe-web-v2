// pages/reluxe-way/index.js
// The RELUXE Way — Hub Page (spokes + story + CTAs)

import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/reluxe-way/reluxe-way-og.jpg` // ✅ create this (1200x630)
const OG_IMAGE_SQUARE = `${SITE_URL}/images/reluxe-way/reluxe-way-og-square.jpg` // optional (1080x1080)

const PAGE_TITLE =
  'The RELUXE Way | Why Patients Choose RELUXE (Carmel & Westfield)'
const PAGE_DESCRIPTION =
  'The RELUXE Way is our hub that explains how we price, treat, and care—so you can book with confidence. Explore our philosophy on tox pricing, results, injectors, consultations, and long-term care in Carmel & Westfield.'

// Contact / social
const MARKETING_SMS = '3173609000' // Click-to-text number (marketing)
const PHONE_CALL = '3177631142' // Click-to-call number (main phone)
const DISPLAY_PHONE = '317-763-1142'
const IG_URL = 'https://instagram.com/reluxemedspa'
const IG_DM_URL = 'https://ig.me/m/reluxemedspa'
const FB_MSG_URL = 'https://m.me/reluxemedspa'

// Primary CTAs
const BOOK_URL = '/book/tox' // hub-level “book” (change if desired)
const START_URL = '/reluxe-way/tox-pricing' // first spoke

const SPOKES = [
  {
    href: '/reluxe-way/tox-pricing',
    eyebrow: 'Pricing',
    title: 'Transparent Tox Pricing',
    desc:
      'We re-invented tox pricing to remove guesswork, pressure, and bait-and-switch—while making it easier to choose the right dose.',
    uses: 'Ads • SMS • SEO',
    icon: 'pricing',
    featured: true,
  },
  {
    href: '/reluxe-way/results-over-deals',
    eyebrow: 'Value',
    title: 'Results Over Deals',
    desc:
      'Why cheaper tox often costs more—and how under-dosing impacts longevity, satisfaction, and trust.',
    uses: 'Objections • Education',
    icon: 'results',
  },
  {
    href: '/reluxe-way/injector-standard',
    eyebrow: 'Expertise',
    title: 'The Injector Standard',
    desc:
      'Same product. Completely different outcomes. Why technique and judgment matter more than the brand on the vial.',
    uses: 'Trust • Referrals',
    icon: 'standard',
  },
  {
    href: '/reluxe-way/choosing-your-tox',
    eyebrow: 'Guidance',
    title: 'Choosing the Right Tox',
    desc:
      'Botox®, Jeuveau®, Dysport®, Daxxify®—each has a role. We choose based on your face, movement, and goals.',
    uses: 'Pre-consult • Upsell (no pressure)',
    icon: 'compare',
  },
  {
    href: '/reluxe-way/your-consult',
    eyebrow: 'Experience',
    title: 'Your Consultation',
    desc:
      'You’re not a template. What actually happens in the chair at RELUXE—and why patients feel confident saying yes.',
    uses: 'First-timers • Anxiety reducers',
    icon: 'consult',
  },
  {
    href: '/reluxe-way/why-patients-stay',
    eyebrow: 'Trust',
    title: 'Why Patients Stay',
    desc:
      'Consistency, predictability, and long-term planning. Why patients stop shopping around after RELUXE.',
    uses: 'Retention • Membership framing',
    icon: 'stay',
  },
  {
    href: '/reluxe-way/local-on-purpose',
    eyebrow: 'Community',
    title: 'Local—On Purpose',
    desc:
      'We answer to patients, not shareholders. Why independence shapes how we price, plan, and care.',
    uses: 'Local SEO • Brand affinity',
    icon: 'local',
  },
  {
    href: '/reluxe-way/not-for-everyone',
    eyebrow: 'Fit',
    title: 'Not for Everyone',
    desc:
      'If you want the cheapest option, we may not be your place. If you value results, trust, and guidance—welcome.',
    uses: 'Qualification • Premium positioning',
    icon: 'fit',
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

  // GTM / dataLayer (optional)
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
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        isPartOf: { '@id': `${SITE_URL}#website` },
        about: [
          { '@type': 'Thing', name: 'Botox pricing' },
          { '@type': 'Thing', name: 'Daxxify pricing' },
          { '@type': 'Thing', name: 'Jeuveau pricing' },
          { '@type': 'Thing', name: 'Dysport pricing' },
          { '@type': 'Thing', name: 'Carmel IN med spa' },
          { '@type': 'Thing', name: 'Westfield IN med spa' },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${CANONICAL_URL}#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'The RELUXE Way', item: CANONICAL_URL },
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

export default function ReluxeWayHub() {
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 340)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const smsBody = useMemo(
    () =>
      encodeURIComponent(
        `Hi RELUXE! I’m reading “The RELUXE Way” and have a quick question. Can you help?`
      ),
    []
  )
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />

        <link rel="canonical" href={CANONICAL_URL} />
        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />

        {/* Open Graph */}
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="The RELUXE Way — why patients choose RELUXE in Carmel & Westfield"
        />
        {/* Optional square */}
        <meta property="og:image" content={OG_IMAGE_SQUARE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* Local relevance helpers */}
        <meta name="geo.region" content="US-IN" />
        <meta name="geo.placename" content="Carmel, IN; Westfield, IN" />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchema(), null, 2) }}
        />
      </Head>

      <HeaderTwo />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.22),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-4xl text-white">
            <p className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400">
              RELUXE • Carmel & Westfield
            </p>

            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              The RELUXE Way
            </h1>

            <p className="mt-4 text-neutral-200 text-base sm:text-lg leading-relaxed">
              RELUXE wasn’t built to be the cheapest med spa. It was built to be the one patients trust—
              <strong> visit after visit, year after year.</strong>
            </p>

            <p className="mt-3 text-neutral-300 text-sm sm:text-base leading-relaxed">
              This is our hub for how we price, treat, and care—so you can book with confidence.
              If you’re looking for <strong>Botox pricing</strong>, <strong>Daxxify pricing</strong>,{' '}
              <strong>Jeuveau pricing</strong>, or <strong>Dysport pricing</strong> in{' '}
              <strong>Carmel</strong> or <strong>Westfield</strong>, start with our pricing philosophy.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <CTA
                href={START_URL}
                primary
                trackName="hub_start_click"
                trackParams={{ placement: 'hero_primary', target: START_URL }}
              >
                Start with Tox Pricing
              </CTA>

              <CTA
                href={BOOK_URL}
                trackName="book_click"
                trackParams={{ placement: 'hero_book', location: 'any' }}
              >
                Book Now
              </CTA>

              <CTA
                href={smsHref}
                trackName="sms_click"
                trackParams={{ placement: 'hero_sms', phone: MARKETING_SMS }}
              >
                Text a Question
              </CTA>
            </div>

            <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="Built for certainty" value="No bait & switch" />
                <MiniStat label="Built for results" value="Right plan wins" />
                <MiniStat label="Built for trust" value="Local, family-owned" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-neutral-400">
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('instagram_click', { placement: 'hero_instagram' })}
                  className="underline hover:text-neutral-200"
                >
                  @reluxemedspa
                </a>
                <span className="text-neutral-600">•</span>
                <a
                  href={IG_DM_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('instagram_dm_click', { placement: 'hero_ig_dm' })}
                  className="underline hover:text-neutral-200"
                >
                  DM us
                </a>
                <span className="text-neutral-600">•</span>
                <a
                  href={FB_MSG_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('facebook_message_click', { placement: 'hero_fb_msg' })}
                  className="underline hover:text-neutral-200"
                >
                  Message us
                </a>
                <span className="text-neutral-600">•</span>
                <a
                  href={callHref}
                  onClick={() => trackEvent('call_click', { placement: 'hero_call', phone: PHONE_CALL })}
                  className="underline hover:text-neutral-200"
                >
                  Call {DISPLAY_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT MAKES RELUXE DIFFERENT */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>What makes RELUXE different</Eyebrow>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Not just what we do — how and why we do it.
              </h2>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                Anyone can offer tox. What matters is how it’s priced, how it’s dosed, who injects it,
                and how results are planned over time.
              </p>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                The RELUXE Way is built around a few core beliefs:
              </p>

              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <BeliefCard title="Results > Deals" copy="We optimize for longevity and satisfaction, not gimmicks." />
                <BeliefCard title="Expertise > Brands" copy="Technique and judgment drive outcomes more than labels." />
                <BeliefCard title="Trust > Short-term margin" copy="We price and plan for long-term relationships." />
                <BeliefCard title="Education > Pressure" copy="We guide you to the right plan—then you choose." />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7 shadow-sm">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">
                  Not sure where to start?
                </h3>
                <p className="mt-3 text-neutral-700">
                  Most patients begin with pricing. If your question is “how much?”—start there. If your question is
                  “why RELUXE?”—pick any spoke below.
                </p>

                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={START_URL}
                    onClick={() => trackEvent('hub_start_click', { placement: 'start_card_primary', target: START_URL })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
                  >
                    Start with Tox Pricing
                    <Arrow />
                  </a>

                  <a
                    href={smsHref}
                    onClick={() => trackEvent('sms_click', { placement: 'start_card_sms', phone: MARKETING_SMS })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
                  >
                    Text a Question
                  </a>

                  <a
                    href={IG_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('instagram_click', { placement: 'start_card_ig' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
                  >
                    See Results on Instagram
                  </a>

                  <p className="mt-3 text-[11px] text-neutral-500">
                    DM links work best on mobile:{" "}
                    <a
                      href={IG_DM_URL}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackEvent('instagram_dm_click', { placement: 'start_card_ig_dm' })}
                      className="underline"
                    >
                      Instagram DM
                    </a>{" "}
                    •{" "}
                    <a
                      href={FB_MSG_URL}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackEvent('facebook_message_click', { placement: 'start_card_fb_msg' })}
                      className="underline"
                    >
                      Facebook message
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
                <p className="text-[11px] tracking-widest uppercase text-neutral-500">One line summary</p>
                <p className="mt-2 text-neutral-800 leading-relaxed">
                  We price with one goal in mind:{" "}
                  <strong>exceptional results that earn your trust—every visit.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPOKES GRID */}
      <section className="bg-neutral-50 border-y border-neutral-200 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Explore the RELUXE Way</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Each spoke stands alone — together they tell the whole story.
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              Click any topic below. Every page is built to be shareable via SMS, social, or as part of your consult
              journey.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {SPOKES.map((s) => (
              <SpokeCard key={s.href} spoke={s} />
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-white ring-1 ring-neutral-200 p-6 sm:p-7">
            <div className="grid lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
                  Want help choosing what to read?
                </h3>
                <p className="mt-2 text-neutral-700">
                  Text us what you’re looking for—price, longevity, first time tox, a natural look—and we’ll point you
                  to the best page (or just book you).
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-col sm:flex-row gap-2 lg:justify-end">
                <a
                  href={smsHref}
                  onClick={() => trackEvent('sms_click', { placement: 'mid_help_sms', phone: MARKETING_SMS })}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
                >
                  Text a Question
                </a>
                <a
                  href={BOOK_URL}
                  onClick={() => trackEvent('book_click', { placement: 'mid_help_book' })}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-neutral-50 transition"
                >
                  Book Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-black ring-1 ring-neutral-800 p-7 sm:p-10 text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(60%_60%_at_10%_20%,rgba(16,185,129,0.25),transparent_60%)]" />
            <div className="relative max-w-3xl">
              <p className="text-[11px] tracking-widest uppercase text-neutral-400">Ready when you are</p>
              <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Book with confidence.
              </h2>
              <p className="mt-4 text-neutral-200 leading-relaxed">
                We believe informed patients make confident decisions—and confident decisions lead to better results.
                Explore the RELUXE Way, then book when it feels right.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <a
                  href={BOOK_URL}
                  onClick={() => trackEvent('book_click', { placement: 'final_primary_book' })}
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900 transition"
                >
                  Book Your Appointment
                  <Arrow />
                </a>

                <a
                  href={START_URL}
                  onClick={() => trackEvent('hub_start_click', { placement: 'final_start', target: START_URL })}
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ring-1 ring-white/15 hover:bg-white/10 transition"
                >
                  Start with Pricing
                </a>

                <a
                  href={smsHref}
                  onClick={() => trackEvent('sms_click', { placement: 'final_sms', phone: MARKETING_SMS })}
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ring-1 ring-white/15 hover:bg-white/10 transition"
                >
                  Text Us
                </a>
              </div>

              <p className="mt-4 text-[11px] text-neutral-400">
                Prefer a message?{" "}
                <a
                  href={IG_DM_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('instagram_dm_click', { placement: 'final_ig_dm' })}
                  className="underline"
                >
                  Instagram DM
                </a>{" "}
                •{" "}
                <a
                  href={FB_MSG_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('facebook_message_click', { placement: 'final_fb_msg' })}
                  className="underline"
                >
                  Facebook message
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY CTA */}
      {showSticky && (
        <StickyCTA
          title="The RELUXE Way"
          subtitle="Start with transparent tox pricing"
          href={START_URL}
        />
      )}
    </>
  )
}

/* -----------------------------
   Components
------------------------------ */

function CTA({ href, children, primary, trackName, trackParams }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold min-h-[48px] touch-manipulation transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
  const styles = primary
    ? 'text-white w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-black shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-neutral-900'
    : 'text-white/90 w-full sm:w-auto ring-1 ring-white/20 hover:bg-white/10'

  return (
    <a
      href={href}
      className={`${base} ${styles} group`}
      rel="noopener"
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

function BeliefCard({ title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
      <p className="mt-2 text-sm text-neutral-600">{copy}</p>
    </div>
  )
}

function SpokeCard({ spoke }) {
  const featured =
    spoke.featured &&
    'ring-2 ring-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'

  return (
    <a
      href={spoke.href}
      onClick={() => trackEvent('spoke_click', { placement: 'spoke_grid', href: spoke.href, title: spoke.title })}
      className={`group rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition ${featured || ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-widest uppercase text-neutral-500">{spoke.eyebrow}</p>
          <h3 className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">
            {spoke.title}
          </h3>
        </div>

        <div className="h-11 w-11 rounded-2xl bg-neutral-950 text-white flex items-center justify-center ring-1 ring-neutral-800">
          <Icon name={spoke.icon} />
        </div>
      </div>

      <p className="mt-3 text-neutral-700 leading-relaxed">{spoke.desc}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[11px] tracking-widest uppercase text-neutral-500">{spoke.uses}</span>
        <span className="text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
          Explore <span className="ml-1">→</span>
        </span>
      </div>
    </a>
  )
}

function Icon({ name }) {
  // Simple inline icons so you don’t need extra deps
  const common = 'h-5 w-5'
  switch (name) {
    case 'pricing':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 7h10M7 12h10M7 17h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M5 4h14a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'results':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 17l5-5 4 4 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 7v6h-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'standard':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'compare':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10 4H6a2 2 0 0 0-2 2v14h6V4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M20 10h-6v10h4a2 2 0 0 0 2-2V10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M14 4h4a2 2 0 0 1 2 2v4h-6V4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'consult':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 7a4 4 0 0 1-4 4H8l-4 4V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M8 7h8M8 10h5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'stay':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.6-9.5 9-9.5 9Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'local':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'fit':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 12h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.6-9.5 9-9.5 9Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

function Arrow() {
  return (
    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
        <a
          href={href}
          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-black active:scale-[.99] touch-manipulation"
          onClick={() => trackEvent('hub_start_click', { placement: 'sticky_cta', target: href })}
        >
          Start
        </a>
      </div>
    </div>
  )
}
