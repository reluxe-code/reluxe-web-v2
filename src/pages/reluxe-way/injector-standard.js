// src/pages/reluxe-way/injector-standard.js
// The RELUXE Way — The Injector Standard (standalone spoke page)

/* eslint-disable @next/next/no-img-element */
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
const PAGE_PATH = '/reluxe-way/injector-standard'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/og/new-default-1200x630.png`

const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'
const RESULTS_OVER_DEALS_URL = '/reluxe-way/results-over-deals'

// Consult URLs
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
          'Same product, different results. Learn why injector training, technique, and judgment matter more than the brand on the vial \u2014 and what the RELUXE Injector Standard means in Carmel & Westfield.',
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
  const smsBody = encodeURIComponent(`Hi RELUXE! I'd love to book a ${CONSULT_NAME}. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const pageTitle =
    'The Injector Standard | Same Product, Different Results | RELUXE (Carmel & Westfield)'
  const pageDescription =
    'Same product, different results. Learn why injector training, technique, and judgment matter more than the brand on the vial \u2014 and what the RELUXE Injector Standard means in Carmel & Westfield.'

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
              Same product.{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Completely different results.</span>
            </h1>

            <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.85)' }} className="mt-4 text-base sm:text-lg leading-relaxed">
              Neurotoxins aren&rsquo;t the full story. <strong>Technique is the treatment.</strong>
            </p>

            <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-3 text-sm sm:text-base leading-relaxed">
              Botox&reg;, Jeuveau&reg;, Dysport&reg;, Daxxify&reg; -- the brand matters. But what matters more is who injects it, how they map your movement,
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

            <div style={{ borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }} className="mt-5 p-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="What we optimize for" value="Natural results" />
                <MiniStat label="How we get there" value="Expert mapping" />
                <MiniStat label="Why it matters" value="Better longevity" />
              </div>
              <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-3 text-[12px]">
                Education only. Treatment plan and dosing are customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Why who injects matters */}
      <section className="py-12 sm:py-14" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>Why it matters</Eyebrow>
              <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                The injector matters more than the vial.
              </h2>
              <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
                Tox is simple to buy. It&rsquo;s not simple to deliver consistently great outcomes.
              </p>
              <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
                Great results come from an injector who understands:
              </p>

              <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
                <Bullet>How your facial muscles actually move (not just &ldquo;where wrinkles are&rdquo;).</Bullet>
                <Bullet>How dosing changes balance, lift, and expression.</Bullet>
                <Bullet>How to preserve natural movement while still smoothing lines.</Bullet>
                <Bullet>How to plan your face over time, not just today.</Bullet>
              </ul>

              <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-5 leading-relaxed">
                In other words: it&rsquo;s not &ldquo;injecting tox.&rdquo; It&rsquo;s <strong>facial decision-making</strong>.
              </p>
            </div>

            <div className="lg:col-span-5">
              <SideCard>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>A simple truth</p>
                <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight">
                  Same number of units can still look different.
                </h3>
                <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed">
                  Placement, dilution practices, muscle mapping, and planning determine whether results look refreshed or &ldquo;off.&rdquo;
                </p>

                <div className="mt-5 grid sm:grid-cols-2 gap-2">
                  <a
                    href={CONSULT_URL_WESTFIELD}
                    onClick={() => trackEvent('consult_click', { placement: 'side_westfield', location: 'westfield' })}
                    style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white }}
                    className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-90"
                  >
                    Westfield Consult
                  </a>
                  <a
                    href={CONSULT_URL_CARMEL}
                    onClick={() => trackEvent('consult_click', { placement: 'side_carmel', location: 'carmel' })}
                    style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                    className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-80"
                  >
                    Carmel Consult
                  </a>
                </div>

                <div style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-4 text-[11px]">
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
                  &bull;{' '}
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
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}` }} className="py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>The RELUXE Injector Standard</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              What &ldquo;standard&rdquo; means at RELUXE
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
              This is what we hold ourselves to--every visit, every face, every injector.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <StandardCard title="Movement mapping first">
              We assess how your face moves in motion, not just how it looks at rest.
            </StandardCard>
            <StandardCard title="Dose with intention">
              Units are chosen based on your anatomy and goals--not a generic template.
            </StandardCard>
            <StandardCard title="Natural > frozen">
              We aim for a refreshed look with expression intact (unless you want a stronger hold).
            </StandardCard>
            <StandardCard title="Facial balance mindset">
              We consider the whole face--how each area affects lift, symmetry, and harmony.
            </StandardCard>
            <StandardCard title="Plan for longevity">
              We design cadence and dosing that reduces &ldquo;wore off too fast&rdquo; frustration.
            </StandardCard>
            <StandardCard title="Education without pressure">
              You&rsquo;ll understand your options clearly. Then you choose what feels right.
            </StandardCard>
          </div>

          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} className="mt-8">
            <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Why this aligns with our pricing
            </h3>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed">
              Our pricing model is designed to support the right plan--so expert recommendations don&rsquo;t feel like an upsell.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <a
                href={TOX_PRICING_URL}
                onClick={() => trackEvent('spoke_click', { placement: 'standard_pricing', target: TOX_PRICING_URL })}
                style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white }}
                className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-90"
              >
                See Tox Pricing Model
              </a>
              <a
                href={RESULTS_OVER_DEALS_URL}
                onClick={() => trackEvent('spoke_click', { placement: 'standard_results_over_deals', target: RESULTS_OVER_DEALS_URL })}
                style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-80"
              >
                Read Results Over Deals
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: What your consult looks like */}
      <section className="py-12 sm:py-14" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>What to expect</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              What happens in a RELUXE consult
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
              We keep it straightforward: movement, goals, plan. No pressure.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <StepCard step="Step 1" title="Assess movement" copy="We look at how your face moves--smile, squint, raise brows, talk." />
            <StepCard step="Step 2" title="Align on your look" copy="Soft + natural, stronger hold, event timing, maintenance cadence--your preference drives the plan." />
            <StepCard step="Step 3" title="Build the plan" copy="We recommend dosing and areas with clear reasoning, then you choose what feels right." />
          </div>

          <div style={{ borderRadius: '1.5rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, padding: '1.75rem' }} className="mt-8">
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="leading-relaxed">
              The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking? Call, text, or DM us and we&rsquo;re happy to help.
            </p>

            <div className="mt-5 grid sm:grid-cols-2 gap-2 max-w-2xl">
              <a
                href={CONSULT_URL_WESTFIELD}
                onClick={() => trackEvent('consult_click', { placement: 'expect_consult', location: 'westfield' })}
                style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white }}
                className="inline-flex items-center justify-center px-6 py-3 transition hover:opacity-90"
              >
                Book Westfield Consult
              </a>
              <a
                href={CONSULT_URL_CARMEL}
                onClick={() => trackEvent('consult_click', { placement: 'expect_consult', location: 'carmel' })}
                style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                className="inline-flex items-center justify-center px-6 py-3 transition hover:opacity-80"
              >
                Book Carmel Consult
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm" style={{ fontFamily: fonts.body, color: colors.body }}>
              <a
                href={smsHref}
                onClick={() => trackEvent('sms_click', { placement: 'expect_sms', phone: MARKETING_SMS })}
                className="underline"
              >
                Text us
              </a>
              <span>&bull;</span>
              <a
                href={callHref}
                onClick={() => trackEvent('call_click', { placement: 'expect_call', phone: PHONE_CALL })}
                className="underline"
              >
                Call {DISPLAY_PHONE}
              </a>
              <span>&bull;</span>
              <a
                href={IG_DM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_dm_click', { placement: 'expect_ig_dm' })}
                className="underline"
              >
                DM us
              </a>
              <span>&bull;</span>
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
      <section style={{ background: colors.ink, color: colors.white, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ borderRadius: '1.5rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Bottom line</p>
              <h2 style={{ fontFamily: fonts.display, fontWeight: typeScale.sectionHeading.weight }} className="mt-2 text-2xl sm:text-3xl tracking-tight">
                Technique is the{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>treatment.</span>
              </h2>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.85)' }} className="mt-4 leading-relaxed max-w-3xl">
                If you want results that feel natural, last longer, and are planned intentionally--start with a consult.
              </p>

              <div className="mt-6">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>

              <div style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-5 text-sm">
                Prefer help booking?{' '}
                <a
                  href={`sms:${MARKETING_SMS}?&body=${encodeURIComponent(`Hi RELUXE! I'd like help booking a ${CONSULT_NAME}.`)}`}
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
        </div>
      </section>
    </BetaLayout>
  )
}

InjectorStandardPage.getLayout = (page) => page

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

function Eyebrow({ children }) {
  return (
    <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>{children}</p>
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

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: gradients.primary, flexShrink: 0 }} />
      <span>{children}</span>
    </li>
  )
}

function SideCard({ children }) {
  return (
    <div className="lg:sticky lg:top-24">
      <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>{children}</div>
    </div>
  )
}

function StandardCard({ title, children }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Standard</p>
      <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight">{title}</h3>
      <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed">{children}</p>
    </div>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3">
        <div style={{ borderRadius: '0.75rem', background: gradients.primary, color: '#fff', fontFamily: fonts.body, fontWeight: 700, fontSize: '11px', letterSpacing: '-0.01em', height: '2.5rem', minWidth: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.75rem' }}>
          {step}
        </div>
        <h3 style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }} className="text-sm sm:text-base tracking-tight">{title}</h3>
      </div>
      <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed">{copy}</p>
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
