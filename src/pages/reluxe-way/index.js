// pages/reluxe-way/index.js
// The RELUXE Way — Hub Page (spokes + story + CTAs)

import { useMemo } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/og/new-default-1200x630.png`

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
      'Botox\u00AE, Jeuveau\u00AE, Dysport\u00AE, Daxxify\u00AE\u2014each has a role. We choose based on your face, movement, and goals.',
    uses: 'Pre-consult • Upsell (no pressure)',
    icon: 'compare',
  },
  {
    href: '/reluxe-way/your-consult',
    eyebrow: 'Experience',
    title: 'Your Consultation',
    desc:
      "You\u2019re not a template. What actually happens in the chair at RELUXE\u2014and why patients feel confident saying yes.",
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
    title: 'Local\u2014On Purpose',
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
      'If you want the cheapest option, we may not be your place. If you value results, trust, and guidance\u2014welcome.',
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
  const smsBody = useMemo(
    () =>
      encodeURIComponent(
        `Hi RELUXE! I'm reading "The RELUXE Way" and have a quick question. Can you help?`
      ),
    []
  )
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  return (
    <BetaLayout
      title={PAGE_TITLE}
      description={PAGE_DESCRIPTION}
      canonical={CANONICAL_URL}
      ogImage={OG_IMAGE}
      structuredData={getSchema()}
    >
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative' }} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-4xl" style={{ color: colors.white }}>
            <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
              RELUXE &middot; Carmel & Westfield
            </p>

            <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, marginTop: '0.75rem' }}>
              The{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                RELUXE Way.
              </span>
            </h1>

            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.7)', marginTop: '1.5rem' }}>
              RELUXE wasn't built to be the cheapest med spa. It was built to be the one patients trust—
              <strong> visit after visit, year after year.</strong>
            </p>

            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', marginTop: '1rem' }}>
              This is our hub for how we price, treat, and care—so you can book with confidence.
              If you're looking for <strong>Botox pricing</strong>, <strong>Daxxify pricing</strong>,{' '}
              <strong>Jeuveau pricing</strong>, or <strong>Dysport pricing</strong> in{' '}
              <strong>Carmel</strong> or <strong>Westfield</strong>, start with our pricing philosophy.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start">
              <a
                href={START_URL}
                onClick={() => trackEvent('hub_start_click', { placement: 'hero_primary', target: START_URL })}
                style={{ fontFamily: fonts.body, fontWeight: 600, background: gradients.primary, color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '9999px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Start with Tox Pricing
                <Arrow />
              </a>

              <GravityBookButton fontKey={FONT_KEY} size="hero" />

              <a
                href={smsHref}
                onClick={() => trackEvent('sms_click', { placement: 'hero_sms', phone: MARKETING_SMS })}
                style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Text a Question
              </a>
            </div>

            <div style={{ marginTop: '2rem', borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '1.25rem' }}>
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="Built for certainty" value="No bait & switch" />
                <MiniStat label="Built for results" value="Right plan wins" />
                <MiniStat label="Built for trust" value="Local, family-owned" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2" style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)', fontFamily: fonts.body }}>
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('instagram_click', { placement: 'hero_instagram' })}
                  className="underline hover:text-white/60"
                >
                  @reluxemedspa
                </a>
                <span>&middot;</span>
                <a
                  href={IG_DM_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('instagram_dm_click', { placement: 'hero_ig_dm' })}
                  className="underline hover:text-white/60"
                >
                  DM us
                </a>
                <span>&middot;</span>
                <a
                  href={FB_MSG_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('facebook_message_click', { placement: 'hero_fb_msg' })}
                  className="underline hover:text-white/60"
                >
                  Message us
                </a>
                <span>&middot;</span>
                <a
                  href={callHref}
                  onClick={() => trackEvent('call_click', { placement: 'hero_call', phone: PHONE_CALL })}
                  className="underline hover:text-white/60"
                >
                  Call {DISPLAY_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT MAKES RELUXE DIFFERENT */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>What makes RELUXE different</Eyebrow>
              <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>
                Not just what we do — how and why we do it.
              </h2>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>
                Anyone can offer tox. What matters is how it's priced, how it's dosed, who injects it,
                and how results are planned over time.
              </p>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>
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
              <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading }}>
                  Not sure where to start?
                </h3>
                <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.75rem' }}>
                  Most patients begin with pricing. If your question is "how much?"—start there. If your question is
                  "why RELUXE?"—pick any spoke below.
                </p>

                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={START_URL}
                    onClick={() => trackEvent('hub_start_click', { placement: 'start_card_primary', target: START_URL })}
                    style={{ fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white, padding: '0.75rem 1.25rem', borderRadius: '9999px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    Start with Tox Pricing
                    <Arrow />
                  </a>

                  <a
                    href={smsHref}
                    onClick={() => trackEvent('sms_click', { placement: 'start_card_sms', phone: MARKETING_SMS })}
                    style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading, padding: '0.75rem 1.25rem', borderRadius: '9999px', border: `1px solid ${colors.stone}`, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Text a Question
                  </a>

                  <a
                    href={IG_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('instagram_click', { placement: 'start_card_ig' })}
                    style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading, padding: '0.75rem 1.25rem', borderRadius: '9999px', border: `1px solid ${colors.stone}`, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    See Results on Instagram
                  </a>

                  <p style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: colors.muted, fontFamily: fonts.body }}>
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
                    &middot;{" "}
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

              <div style={{ marginTop: '1rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>One line summary</p>
                <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.5rem' }}>
                  We price with one goal in mind:{" "}
                  <strong>exceptional results that earn your trust—every visit.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPOKES GRID */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}`, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Explore the RELUXE Way</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>
              Each spoke stands alone — together they tell the whole story.
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>
              Click any topic below. Every page is built to be shareable via SMS, social, or as part of your consult
              journey.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {SPOKES.map((s) => (
              <SpokeCard key={s.href} spoke={s} />
            ))}
          </div>

          <div style={{ marginTop: '2rem', borderRadius: '1.5rem', background: '#fff', border: `1px solid ${colors.stone}`, padding: '1.75rem 2rem' }}>
            <div className="grid lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.375rem', color: colors.heading }}>
                  Want help choosing what to read?
                </h3>
                <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.5rem' }}>
                  Text us what you're looking for—price, longevity, first time tox, a natural look—and we'll point you
                  to the best page (or just book you).
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-col sm:flex-row gap-2 lg:justify-end">
                <a
                  href={smsHref}
                  onClick={() => trackEvent('sms_click', { placement: 'mid_help_sms', phone: MARKETING_SMS })}
                  style={{ fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white, padding: '0.75rem 1.25rem', borderRadius: '9999px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Text a Question
                </a>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ borderRadius: '1.5rem', background: colors.ink, padding: '2.5rem', color: colors.white, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
            <div style={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'radial-gradient(60% 60% at 10% 20%, rgba(124,58,237,0.25), transparent 60%)' }} />
            <div style={{ position: 'relative' }} className="max-w-3xl">
              <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>Ready when you are</p>
              <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, marginTop: '0.5rem' }}>
                Book with{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  confidence.
                </span>
              </h2>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.6)', lineHeight: 1.6, marginTop: '1rem' }}>
                We believe informed patients make confident decisions—and confident decisions lead to better results.
                Explore the RELUXE Way, then book when it feels right.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />

                <a
                  href={START_URL}
                  onClick={() => trackEvent('hub_start_click', { placement: 'final_start', target: START_URL })}
                  style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Start with Pricing
                </a>

                <a
                  href={smsHref}
                  onClick={() => trackEvent('sms_click', { placement: 'final_sms', phone: MARKETING_SMS })}
                  style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Text Us
                </a>
              </div>

              <p style={{ marginTop: '1rem', fontSize: '0.6875rem', color: 'rgba(250,248,245,0.35)', fontFamily: fonts.body }}>
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
                &middot;{" "}
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
    </BetaLayout>
  )
}

ReluxeWayHub.getLayout = (page) => page

/* -----------------------------
   Components
------------------------------ */

function Eyebrow({ children }) {
  return <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>{children}</p>
}

function MiniStat({ label, value }) {
  return (
    <div style={{ borderRadius: '0.75rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '0.75rem' }}>
      <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>{label}</p>
      <p style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.875rem', color: colors.white, marginTop: '0.25rem' }}>{value}</p>
    </div>
  )
}

function BeliefCard({ title, copy }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: '0.9375rem', color: colors.heading }}>{title}</p>
      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, marginTop: '0.5rem' }}>{copy}</p>
    </div>
  )
}

function SpokeCard({ spoke }) {
  const featuredStyle = spoke.featured
    ? { boxShadow: `0 0 0 2px rgba(124,58,237,0.25)` }
    : {}

  return (
    <a
      href={spoke.href}
      onClick={() => trackEvent('spoke_click', { placement: 'spoke_grid', href: spoke.href, title: spoke.title })}
      className="group"
      style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s', ...featuredStyle }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>{spoke.eyebrow}</p>
          <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>
            {spoke.title}
          </h3>
        </div>

        <div style={{ height: 44, width: 44, borderRadius: '0.75rem', background: colors.ink, color: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.charcoal}` }}>
          <Icon name={spoke.icon} />
        </div>
      </div>

      <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>{spoke.desc}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>{spoke.uses}</span>
        <span style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.875rem', color: colors.violet }}>
          Explore <span style={{ marginLeft: '0.25rem' }}>&rarr;</span>
        </span>
      </div>
    </a>
  )
}

function Icon({ name }) {
  const common = 'h-5 w-5'
  switch (name) {
    case 'pricing':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M5 4h14a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case 'results':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 17l5-5 4 4 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 7v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'standard':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case 'compare':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 4H6a2 2 0 0 0-2 2v14h6V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M20 10h-6v10h4a2 2 0 0 0 2-2V10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M14 4h4a2 2 0 0 1 2 2v4h-6V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case 'consult':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 7a4 4 0 0 1-4 4H8l-4 4V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M8 7h8M8 10h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'stay':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.6-9.5 9-9.5 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case 'local':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case 'fit':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="2" />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.6-9.5 9-9.5 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
  }
}

function Arrow() {
  return (
    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}
