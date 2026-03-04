// src/pages/reluxe-way/choosing-your-tox.js
// The RELUXE Way — Choosing Your Tox (standalone spoke page)

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
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
const PAGE_PATH = '/reluxe-way/choosing-your-tox'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/og/new-default-1200x630.png`

const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'
const INJECTOR_STANDARD_URL = '/reluxe-way/injector-standard'

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
        name: 'Choosing Your Tox | Botox, Jeuveau, Dysport, Daxxify | RELUXE (Carmel & Westfield)',
        description:
          'Botox\u00AE, Jeuveau\u00AE, Dysport\u00AE, or Daxxify\u00AE? Learn the differences, when each shines, and how RELUXE helps you choose based on your face and goals in Carmel & Westfield.',
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
  const smsBody = encodeURIComponent(`Hi RELUXE! I'd love to book a ${CONSULT_NAME}. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const pageTitle =
    'Choosing Your Tox | Botox vs Jeuveau vs Dysport vs Daxxify | RELUXE (Carmel & Westfield)'
  const pageDescription =
    'Botox, Jeuveau, Dysport, or Daxxify? Learn the differences, when each shines, and how RELUXE helps you choose based on your face and goals in Carmel & Westfield.'

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
              There&rsquo;s no &ldquo;best&rdquo; tox--only the{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>right one.</span>
            </h1>

            <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.85)' }} className="mt-4 text-base sm:text-lg leading-relaxed">
              Botox&reg;, Jeuveau&reg;, Dysport&reg;, and Daxxify&reg; each have a role. We choose based on your movement, anatomy, goals, and timeline.
            </p>

            <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }} className="mt-3 text-sm sm:text-base leading-relaxed">
              The fastest way to choose is a consult. We&rsquo;ll map your movement, talk through your preferences (soft vs strong hold),
              and recommend the best fit--without pressure.
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

            <div style={{ borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }} className="mt-5 p-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="Decision factors" value="Movement + goals" />
                <MiniStat label="Your preference" value="Soft vs strong hold" />
                <MiniStat label="Your timeline" value="Events + maintenance" />
              </div>
              <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-3 text-[12px]">
                Education only. Your plan is customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK GUIDE */}
      <section className="py-12 sm:py-14" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Quick guide</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              How we choose your tox at RELUXE
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
              People often ask, &ldquo;Which tox is best?&rdquo; Our answer: it depends on your facial movement, your goals, and your ideal cadence.
              Here&rsquo;s the exact decision framework we use.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <StepCard step="Step 1" title="Map movement" copy="We look at how your face moves in motion--not just lines at rest." />
            <StepCard step="Step 2" title="Clarify your goal" copy="Soft + natural, stronger hold, lift feel, or longevity-first." />
            <StepCard step="Step 3" title="Match tox to you" copy="We choose based on fit--then adjust over time as we learn your face." />
          </div>

          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem' }} className="mt-8">
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="leading-relaxed">
              Want the fastest answer? Book a consult. We&rsquo;ll recommend the best fit, explain why, and tailor the plan to your preferences.
            </p>
            <div className="mt-5 grid sm:grid-cols-2 gap-2 max-w-2xl">
              <a
                href={CONSULT_URL_WESTFIELD}
                onClick={() => trackEvent('consult_click', { placement: 'quick_guide_consult', location: 'westfield' })}
                style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white }}
                className="inline-flex items-center justify-center px-6 py-3 transition hover:opacity-90"
              >
                Book Westfield Consult
              </a>
              <a
                href={CONSULT_URL_CARMEL}
                onClick={() => trackEvent('consult_click', { placement: 'quick_guide_consult', location: 'carmel' })}
                style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                className="inline-flex items-center justify-center px-6 py-3 transition hover:opacity-80"
              >
                Book Carmel Consult
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON CARDS */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}` }} className="py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Compare</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              What each tox is great for
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-4 leading-relaxed">
              These are general tendencies--not hard rules. Your injector will guide final selection based on your anatomy and goals.
            </p>
          </div>

          <div className="mt-8 grid lg:grid-cols-2 gap-4 sm:gap-6">
            <ToxCard
              name="Botox\u00AE"
              vibe="Proven + predictable"
              bestFor={[
                'Patients who want a very established option',
                'Predictable holds and cadence planning',
                'Great for consistent maintenance',
              ]}
              notes={[
                'Excellent "baseline" choice for many faces',
                'We tailor dosing to your desired movement',
              ]}
            />
            <ToxCard
              name="Jeuveau\u00AE"
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
              name="Dysport\u00AE"
              vibe="Great coverage + fast feel for many patients"
              bestFor={[
                'Patients who like how it "settles" across larger areas',
                'Those who want a fast-feeling onset (varies)',
                'Forehead-style areas for many faces (injector dependent)',
              ]}
              notes={[
                'Units are not 1:1 with Botox--your injector will translate dosing correctly',
              ]}
            />
            <ToxCard
              name="Daxxify\u00AE"
              vibe="Longevity-first, premium option"
              bestFor={[
                'Patients who prioritize longer time between visits',
                'Those who want a stronger, longer hold (fit-dependent)',
                'Planning around travel, schedules, or life events',
              ]}
              notes={[
                'Longevity varies--your injector will help set expectations',
              ]}
            />
          </div>

          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} className="mt-8">
            <h3 style={{ fontFamily: fonts.display, color: colors.heading }} className="text-xl sm:text-2xl font-extrabold tracking-tight">
              The &ldquo;right tox&rdquo; can change over time
            </h3>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed">
              As we learn your face and your preferences, we may adjust dose, areas, or even the tox itself. That&rsquo;s not inconsistency--it&rsquo;s personalization.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
              <a
                href={TOX_PRICING_URL}
                onClick={() => trackEvent('spoke_click', { placement: 'compare_secondary_pricing', target: TOX_PRICING_URL })}
                style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                className="inline-flex items-center justify-center px-5 py-3 transition hover:opacity-80"
              >
                See Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-14" style={{ background: '#fff' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
            Choosing Your Tox -- FAQ
          </h2>

          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff' }} className="mt-7">
            <FaqItem
              q="Can I switch tox brands later?"
              a="Yes. Many patients try one option and later switch based on how they like the feel, look, or cadence. We guide you based on results and preferences."
            />
            <FaqItem
              q='Is one tox always "stronger" than the others?'
              a='Not necessarily. "Strength" depends on dose, placement, and your anatomy. Your injector will choose the best fit and tailor dosing to your goals.'
            />
            <FaqItem
              q="How do I choose if I'm new to tox?"
              a="Start with a consult. We'll map your movement, learn your preferences, and recommend the best option to begin with--then adjust as we learn your face."
            />
            <FaqItem
              q="Does pricing differ between toxins?"
              a="Yes. Each has its own pricing structure. See our transparent pricing model to compare foundation doses and add-on unit pricing."
            />
          </div>

          <div className="mt-8 text-center">
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
            <p style={{ fontFamily: fonts.body, color: colors.muted }} className="mt-2 text-xs">
              Dosing and treatment plan are customized by your injector. Results vary.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}` }} className="py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '2rem 2.5rem' }}>
            <h2 style={{ fontFamily: fonts.display, color: colors.heading }} className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Want a human answer?
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-3 leading-relaxed max-w-3xl">
              The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking? Call, text, or DM us and we&rsquo;re happy to help.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-2 max-w-2xl">
              <a
                href={CONSULT_URL_WESTFIELD}
                onClick={() => trackEvent('consult_click', { placement: 'contact_consult', location: 'westfield' })}
                style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white }}
                className="inline-flex items-center justify-center px-6 py-3 transition hover:opacity-90"
              >
                Book Westfield Consult
              </a>
              <a
                href={CONSULT_URL_CARMEL}
                onClick={() => trackEvent('consult_click', { placement: 'contact_consult', location: 'carmel' })}
                style={{ borderRadius: '9999px', fontFamily: fonts.body, fontWeight: 600, border: `1px solid ${colors.stone}` }}
                className="inline-flex items-center justify-center px-6 py-3 transition hover:opacity-80"
              >
                Book Carmel Consult
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm" style={{ fontFamily: fonts.body, color: colors.body }}>
              <a
                href={smsHref}
                onClick={() => trackEvent('sms_click', { placement: 'contact_sms', phone: MARKETING_SMS })}
                className="underline"
              >
                Text us
              </a>
              <span>&bull;</span>
              <a
                href={callHref}
                onClick={() => trackEvent('call_click', { placement: 'contact_call', phone: PHONE_CALL })}
                className="underline"
              >
                Call {DISPLAY_PHONE}
              </a>
              <span>&bull;</span>
              <a
                href={IG_DM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_dm_click', { placement: 'contact_ig_dm' })}
                className="underline"
              >
                DM us
              </a>
              <span>&bull;</span>
              <a
                href={IG_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_click', { placement: 'contact_instagram' })}
                className="underline"
              >
                @reluxemedspa
              </a>
              <span>&bull;</span>
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
    </BetaLayout>
  )
}

ChoosingYourToxPage.getLayout = (page) => page

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

function ToxCard({ name, vibe, bestFor, notes, highlight }) {
  return (
    <div style={{
      borderRadius: '1.5rem',
      border: `1px solid ${highlight ? colors.violet || '#7C3AED' : colors.stone}`,
      background: highlight ? 'rgba(124,58,237,0.04)' : '#fff',
      padding: '1.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 style={{ fontFamily: fonts.display, fontWeight: 800, color: colors.heading }} className="text-xl sm:text-2xl tracking-tight">{name}</h3>
          <p style={{ fontFamily: fonts.body, color: colors.body }} className="mt-1 text-sm">{vibe}</p>
        </div>
        {highlight ? (
          <span style={{ borderRadius: '9999px', background: 'rgba(124,58,237,0.1)', fontFamily: fonts.body, fontWeight: 600, color: '#7C3AED' }} className="inline-flex items-center px-3 py-1 text-xs">
            RELUXE Favorite
          </span>
        ) : (
          <span style={{ borderRadius: '9999px', backgroundColor: colors.cream, fontFamily: fonts.body, fontWeight: 600, color: colors.body }} className="inline-flex items-center px-3 py-1 text-xs">
            Option
          </span>
        )}
      </div>

      <div className="mt-5">
        <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Best for</p>
        <ul className="mt-3 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
          {bestFor.map((x, i) => (
            <li key={i} className="flex items-start gap-2">
              <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: highlight ? gradients.primary : colors.muted, flexShrink: 0 }} />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <p style={{ fontFamily: fonts.body, fontSize: typeScale.label.size, letterSpacing: typeScale.label.tracking, textTransform: 'uppercase', color: colors.muted }}>Notes</p>
        <ul className="mt-3 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
          {notes.map((x, i) => (
            <li key={i} className="flex items-start gap-2">
              <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: highlight ? 'rgba(124,58,237,0.5)' : colors.taupe, flexShrink: 0 }} />
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
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group" style={{ borderBottom: `1px solid ${colors.stone}` }}>
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 flex items-center justify-between" style={{ fontFamily: fonts.body, fontWeight: 600 }}>
        <span style={{ color: colors.heading }} className="text-sm sm:text-base">{q}</span>
        <svg className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: colors.muted }} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.188l3.71-3.957a.75.75 0 1 1 1.08 1.04l-4.24 4.52a.75.75 0 0 1-1.08 0L5.25 8.27a.75.75 0 0 1-.02-1.06Z" clipRule="evenodd" />
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
