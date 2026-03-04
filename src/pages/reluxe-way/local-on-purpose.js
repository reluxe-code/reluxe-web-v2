// src/pages/reluxe-way/local-on-purpose.js
// The RELUXE Way — Local. Family-Owned. On Purpose. (standalone spoke page)

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
const PAGE_PATH = '/reluxe-way/local-on-purpose'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/og/new-default-1200x630.png`

const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'
const WHY_PATIENTS_STAY_URL = '/reluxe-way/why-patients-stay'

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
        name: 'Local. Family-Owned. On Purpose. | RELUXE (Carmel & Westfield)',
        description:
          'Why RELUXE is intentionally local and family-owned \u2014 and how independence shapes pricing, planning, and long-term care in Carmel & Westfield.',
        isPartOf: { '@id': `${SITE_URL}#website` },
        about: [
          { '@type': 'Thing', name: 'family owned med spa' },
          { '@type': 'Thing', name: 'Carmel IN med spa' },
          { '@type': 'Thing', name: 'Westfield IN med spa' },
          { '@type': 'Thing', name: 'patient experience' },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${CANONICAL_URL}#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'The RELUXE Way', item: `${SITE_URL}${HUB_URL}` },
          { '@type': 'ListItem', position: 3, name: 'Local On Purpose', item: CANONICAL_URL },
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

export default function LocalOnPurposePage() {
  const smsBody = encodeURIComponent(`Hi RELUXE! I'd love to book a ${CONSULT_NAME}. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const pageTitle =
    'Local. Family-Owned. On Purpose. | RELUXE (Carmel & Westfield)'
  const pageDescription =
    'Why RELUXE is intentionally local and family-owned \u2014 and how independence shapes pricing, planning, and long-term care in Carmel & Westfield.'

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
              Local. Family-Owned.{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>On Purpose.</span>
            </h1>

            <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.85)' }} className="mt-4 text-base sm:text-lg leading-relaxed">
              RELUXE is built for long-term trust--not short-term volume. Independence changes how we price, plan, and care.
            </p>

            <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-3 text-sm sm:text-base leading-relaxed">
              We&rsquo;re not a chain. We&rsquo;re not backed by a corporate playbook. We&rsquo;re part of this community--and our name is attached to every decision we make.
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
                href={WHY_PATIENTS_STAY_URL}
                trackName="spoke_click"
                trackParams={{ placement: 'hero_secondary_why_stay', target: WHY_PATIENTS_STAY_URL }}
              >
                Why Patients Stay
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
                <MiniStat label="How we think" value="Long-term trust" />
                <MiniStat label="How we price" value="Transparent + fair" />
                <MiniStat label="How we care" value="Relationship-first" />
              </div>
              <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-3 text-[12px]">
                Education only. Treatment plan and dosing are customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Why independence matters */}
      <section className="py-12 sm:py-14" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Why it matters</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Independence changes everything.
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
              Here&rsquo;s what being local and family-owned changes--for you as the patient.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <ReasonCard title="We answer to patients">
              Not a corporate office. Not a quota. Not a sales target. Your satisfaction is the scorecard.
            </ReasonCard>
            <ReasonCard title="We play the long game">
              We optimize for outcomes and relationships that last--not a one-time transaction.
            </ReasonCard>
            <ReasonCard title="We protect quality">
              We don&rsquo;t cut corners on products or process to hit a corporate margin target.
            </ReasonCard>
            <ReasonCard title="We stay accountable">
              Our community is our reputation. We care deeply about doing things the right way.
            </ReasonCard>
          </div>

          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem' }} className="mt-8">
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="leading-relaxed">
              When your med spa is local, the relationship isn&rsquo;t optional. It&rsquo;s the point.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: How it impacts pricing */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}` }} className="py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>How it impacts pricing</Eyebrow>
              <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                We price with the relationship in mind.
              </h2>
              <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
                We don&rsquo;t believe patients should have to chase deals or wonder if they&rsquo;re being bait-and-switched.
                We built pricing that rewards the right plan and supports great outcomes.
              </p>

              <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
                <Bullet>Transparent foundation pricing protects quality.</Bullet>
                <Bullet>Right Dosing pricing makes it easier to say yes to the best plan.</Bullet>
                <Bullet>No pressure, no surprises, no gimmicks.</Bullet>
                <Bullet>We care more about lifetime trust than short-term margin.</Bullet>
              </ul>

              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <a
                  href={TOX_PRICING_URL}
                  onClick={() => trackEvent('spoke_click', { placement: 'pricing_link', target: TOX_PRICING_URL })}
                  style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white }}
                  className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-90"
                >
                  See Transparent Tox Pricing
                </a>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>
            </div>

            <div className="lg:col-span-5">
              <SideCard>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Straight talk</p>
                <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight">
                  We&rsquo;d rather earn your trust than &ldquo;win&rdquo; your booking.
                </h3>
                <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed">
                  The goal is a plan you love--and a place you stay. That&rsquo;s what independence lets us build.
                </p>

                <div className="mt-5 grid sm:grid-cols-2 gap-2">
                  <a
                    href={CONSULT_URL_WESTFIELD}
                    onClick={() => trackEvent('consult_click', { placement: 'side_consult', location: 'westfield' })}
                    style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white }}
                    className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-90"
                  >
                    Westfield Consult
                  </a>
                  <a
                    href={CONSULT_URL_CARMEL}
                    onClick={() => trackEvent('consult_click', { placement: 'side_consult', location: 'carmel' })}
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

      {/* SECTION 3: Community + continuity */}
      <section className="py-12 sm:py-14" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Community + continuity</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Patients become regulars. Regulars become community.
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
              Over time, your injector learns your face, your movement, your preferences, and your cadence.
              That&rsquo;s how results get better--and how the experience gets easier.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <StandardCard title="You feel known">
              We remember what you love (and what you don&rsquo;t). That makes decision-making easier every visit.
            </StandardCard>
            <StandardCard title="Plans get smarter">
              Consistency helps us refine dosing and timing so you love your results longer.
            </StandardCard>
            <StandardCard title="Trust compounds">
              Patients don&rsquo;t want a new injector every time. They want a relationship with someone who gets them.
            </StandardCard>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: colors.ink, color: colors.white, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ borderRadius: '1.5rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Ready when you are</p>
              <h2 style={{ fontFamily: fonts.display, fontWeight: typeScale.sectionHeading.weight }} className="mt-2 text-2xl sm:text-3xl tracking-tight">
                Start with a{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>consult.</span>
              </h2>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.85)' }} className="mt-4 leading-relaxed max-w-3xl">
                The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking? Call, text, or DM us and we&rsquo;re happy to help.
              </p>

              <div className="mt-6">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm" style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }}>
                <a
                  href={smsHref}
                  onClick={() => trackEvent('sms_click', { placement: 'final_sms', phone: MARKETING_SMS })}
                  className="underline"
                >
                  Text us
                </a>
                <span>&bull;</span>
                <a
                  href={callHref}
                  onClick={() => trackEvent('call_click', { placement: 'final_call', phone: PHONE_CALL })}
                  className="underline"
                >
                  Call {DISPLAY_PHONE}
                </a>
                <span>&bull;</span>
                <a
                  href={IG_DM_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('instagram_dm_click', { placement: 'final_ig_dm' })}
                  className="underline"
                >
                  DM us
                </a>
                <span>&bull;</span>
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('instagram_click', { placement: 'final_instagram' })}
                  className="underline"
                >
                  @reluxemedspa
                </a>
                <span>&bull;</span>
                <a
                  href={FB_MSG_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('facebook_message_click', { placement: 'final_fb_msg' })}
                  className="underline"
                >
                  Message us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

LocalOnPurposePage.getLayout = (page) => page

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

function ReasonCard({ title, children }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Why</p>
      <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight">{title}</h3>
      <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed">{children}</p>
    </div>
  )
}

function StandardCard({ title, children }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>RELUXE</p>
      <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight">{title}</h3>
      <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed">{children}</p>
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
