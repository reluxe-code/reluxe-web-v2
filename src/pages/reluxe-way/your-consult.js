// src/pages/reluxe-way/your-consult.js
// The RELUXE Way — Your Consultation (standalone spoke page)

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
const PAGE_PATH = '/reluxe-way/your-consult'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/og/new-default-1200x630.png`

const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'
const RESULTS_OVER_DEALS_URL = '/reluxe-way/results-over-deals'
const INJECTOR_STANDARD_URL = '/reluxe-way/injector-standard'
const CHOOSING_TOX_URL = '/reluxe-way/choosing-your-tox'

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
  const payload = { ...params, page_path: window.location?.pathname || '', page_url: window.location?.href || '' }
  if (typeof window.fbq === 'function') { try { window.fbq('trackCustom', eventName, payload) } catch (_) {} }
  if (typeof window.gtag === 'function') { try { window.gtag('event', eventName, payload) } catch (_) {} }
  if (Array.isArray(window.dataLayer)) { window.dataLayer.push({ event: eventName, ...payload }) }
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
        description: 'What to expect during your RELUXE consult: movement mapping, goals, plan, and transparent guidance—so you can book with confidence in Carmel & Westfield.',
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
      { '@type': 'Organization', '@id': `${SITE_URL}#organization`, name: 'RELUXE Med Spa', url: SITE_URL, sameAs: [IG_URL] },
      { '@type': 'WebSite', '@id': `${SITE_URL}#website`, url: SITE_URL, name: 'RELUXE Med Spa', publisher: { '@id': `${SITE_URL}#organization` } },
    ],
  }
}

export default function YourConsultPage() {
  const smsBody = encodeURIComponent(`Hi RELUXE! I'd love to learn more about consultations. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const pageTitle = 'Your Consultation | What to Expect at RELUXE | Carmel & Westfield'
  const pageDescription = 'What to expect during your RELUXE consult: movement mapping, goals, plan, and transparent guidance—so you can book with confidence in Carmel & Westfield.'

  return (
    <BetaLayout title={pageTitle} description={pageDescription} canonical={CANONICAL_URL} ogImage={OG_IMAGE} structuredData={getSchema()}>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative' }} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-5xl" style={{ color: colors.white }}>
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>The RELUXE Way</span>
              <span style={{ color: 'rgba(250,248,245,0.2)' }}>&middot;</span>
              <span style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>Carmel & Westfield</span>
              <span style={{ color: 'rgba(250,248,245,0.2)' }}>&middot;</span>
              <a href={HUB_URL} onClick={() => trackEvent('hub_click', { placement: 'hero_breadcrumb' })} style={{ ...typeScale.label, color: colors.violet, fontFamily: fonts.body, textDecoration: 'none' }}>
                Back to the hub &rarr;
              </a>
            </div>

            <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, marginTop: '0.75rem' }}>
              You're not a{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>template.</span>
            </h1>

            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.7)', marginTop: '1.5rem' }}>
              A RELUXE consult is simple: movement, goals, plan. No pressure—just clarity.
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', marginTop: '1rem' }}>
              If you're new to tox (or just want a better experience), this is the best place to start. We'll map your movement,
              align on your desired look, and recommend a plan you can feel confident saying yes to.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start">
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
              <a href={TOX_PRICING_URL} onClick={() => trackEvent('spoke_click', { placement: 'hero_secondary_pricing', target: TOX_PRICING_URL })} style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}>
                See Pricing
              </a>
              <a href={IG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_click', { placement: 'hero_instagram' })} style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}>
                See Our Work (@reluxemedspa)
              </a>
            </div>

            <div style={{ marginTop: '2rem', borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '1.25rem' }}>
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="What we do" value="Movement mapping" />
                <MiniStat label="What you get" value="Clear plan" />
                <MiniStat label="What you avoid" value="Pressure + surprises" />
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)', fontFamily: fonts.body }}>
                Education only. Treatment plan and dosing are customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: What happens */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>What to expect</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>
              What happens in a RELUXE consult
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>
              We keep it straightforward. We assess movement, align on your goal, then build an intentional plan.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <StepCard step="Step 1" title="Assess movement" copy="We look at how your face moves—smile, squint, raise brows, talk. This is where great plans start." />
            <StepCard step="Step 2" title="Align on your look" copy="Soft + natural, stronger hold, event timing, maintenance cadence—your preference drives the plan." />
            <StepCard step="Step 3" title="Build the plan" copy="We recommend areas + dosing with clear reasoning, then you choose what feels right." />
          </div>

          <div style={{ marginTop: '2rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem' }}>
            <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.375rem', color: colors.heading }}>
              What makes it different
            </h3>
            <div className="mt-4 grid md:grid-cols-2 gap-4 sm:gap-6">
              <ListCard title="Education first">You'll understand what we're recommending and why—without feeling rushed or pressured.</ListCard>
              <ListCard title="Customization, not templates">We don't inject from a chart. We tailor to your anatomy, movement, and goals.</ListCard>
              <ListCard title="Planning over time">Your plan gets smarter as we learn your face. Consistency is the real luxury.</ListCard>
              <ListCard title="No surprise pricing">Transparent pricing means you know the foundation and what add-ons cost before you decide.</ListCard>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: What we recommend */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}`, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>How we recommend</Eyebrow>
              <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>
                We recommend the plan that produces the best outcome
              </h2>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>
                Sometimes that means adding an area you've never treated. Sometimes it means slightly more dosing than you've had before.
                Sometimes it means switching toxins based on your anatomy and preferences.
              </p>
              <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
                <Bullet>We listen to your goals first.</Bullet>
                <Bullet>We explain options clearly.</Bullet>
                <Bullet>We recommend what we believe will make you happiest.</Bullet>
                <Bullet>You choose what feels right—no pressure.</Bullet>
              </ul>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1.25rem' }}>
                This is why our philosophy ties directly into our pricing model: it should be easy to say "yes" to the right plan.
              </p>
            </div>

            <div className="lg:col-span-5">
              <SideCard>
                <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>Best place to start</p>
                <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>
                  Getting Started with RELUXE
                </h3>
                <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>
                  Not sure what you need? Book a consult—we'll guide you into the right plan quickly and confidently.
                </p>
                <div className="mt-5">
                  <GravityBookButton fontKey={FONT_KEY} size="hero" />
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.6875rem', color: colors.muted, fontFamily: fonts.body }}>
                  Prefer to message us?{' '}
                  <a href={IG_DM_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_dm_click', { placement: 'side_ig_dm' })} className="underline">Instagram DM</a>{' '}
                  &middot;{' '}
                  <a href={FB_MSG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('facebook_message_click', { placement: 'side_fb_msg' })} className="underline">Facebook message</a>
                </div>
              </SideCard>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Helpful related links */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Helpful reads</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>
              If you're the "I want to understand it" type...
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>
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
      <section style={{ background: colors.ink, color: colors.white, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ borderRadius: '1.5rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
            <div style={{ position: 'relative' }}>
              <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>Ready when you are</p>
              <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, marginTop: '0.5rem' }}>
                Book a consult. Get a plan you'll{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>love.</span>
              </h2>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.6)', lineHeight: 1.6, marginTop: '1rem', maxWidth: '48rem' }}>
                The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking? Call, text, or DM us and we're happy to help.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2" style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', fontFamily: fonts.body }}>
                <a href={smsHref} onClick={() => trackEvent('sms_click', { placement: 'final_sms', phone: MARKETING_SMS })} className="underline">Text us</a>
                <span>&middot;</span>
                <a href={callHref} onClick={() => trackEvent('call_click', { placement: 'final_call', phone: PHONE_CALL })} className="underline">Call {DISPLAY_PHONE}</a>
                <span>&middot;</span>
                <a href={IG_DM_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_dm_click', { placement: 'final_ig_dm' })} className="underline">DM us</a>
                <span>&middot;</span>
                <a href={IG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_click', { placement: 'final_instagram' })} className="underline">@reluxemedspa</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

YourConsultPage.getLayout = (page) => page

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

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.violet, flexShrink: 0 }} />
      <span>{children}</span>
    </li>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3">
        <div style={{ height: 40, minWidth: 88, padding: '0 0.75rem', borderRadius: '0.75rem', background: gradients.primary, color: '#fff', fontFamily: fonts.body, fontWeight: 700, fontSize: '0.6875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {step}
        </div>
        <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1rem', color: colors.heading }}>{title}</h3>
      </div>
      <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>{copy}</p>
    </div>
  )
}

function ListCard({ title, children }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: '0.9375rem', color: colors.heading }}>{title}</p>
      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, marginTop: '0.5rem' }}>{children}</p>
    </div>
  )
}

function SideCard({ children }) {
  return (
    <div className="lg:sticky lg:top-24">
      <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>{children}</div>
    </div>
  )
}

function LinkCard({ href, title, copy }) {
  return (
    <a
      href={href}
      onClick={() => trackEvent('spoke_click', { placement: 'helpful_reads', target: href, title })}
      className="group"
      style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}
    >
      <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>Read</p>
      <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>{title}</h3>
      <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>{copy}</p>
      <p style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.875rem', color: colors.violet, marginTop: '1rem' }}>
        Explore <span style={{ marginLeft: '0.25rem' }}>&rarr;</span>
      </p>
    </a>
  )
}
