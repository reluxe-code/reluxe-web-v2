// src/pages/reluxe-way/why-patients-stay.js
// The RELUXE Way — Why Patients Stay (standalone spoke page)

/* eslint-disable @next/next/no-img-element */
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way/why-patients-stay'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`
const OG_IMAGE = `${SITE_URL}/images/og/new-default-1200x630.png`

const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'
const RESULTS_OVER_DEALS_URL = '/reluxe-way/results-over-deals'
const INJECTOR_STANDARD_URL = '/reluxe-way/injector-standard'
const CHOOSING_TOX_URL = '/reluxe-way/choosing-your-tox'
const YOUR_CONSULT_URL = '/reluxe-way/your-consult'

const MARKETING_SMS = '3173609000'
const PHONE_CALL = '3177631142'
const DISPLAY_PHONE = '317-763-1142'
const IG_URL = 'https://instagram.com/reluxemedspa'
const IG_DM_URL = 'https://ig.me/m/reluxemedspa'
const FB_MSG_URL = 'https://m.me/reluxemedspa'

function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  const payload = { ...params, page_path: window.location?.pathname || '', page_url: window.location?.href || '' }
  if (typeof window.fbq === 'function') { try { window.fbq('trackCustom', eventName, payload) } catch (_) {} }
  if (typeof window.gtag === 'function') { try { window.gtag('event', eventName, payload) } catch (_) {} }
  if (Array.isArray(window.dataLayer)) { window.dataLayer.push({ event: eventName, ...payload }) }
}

function getSchema() {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${CANONICAL_URL}#webpage`, url: CANONICAL_URL, name: 'Why Patients Stay | The RELUXE Way | Carmel & Westfield', description: 'Why patients return to RELUXE: consistency, predictability, expert planning, and transparent pricing. Learn what makes RELUXE different in Carmel & Westfield.', isPartOf: { '@id': `${SITE_URL}#website` }, about: [{ '@type': 'Thing', name: 'med spa Carmel IN' }, { '@type': 'Thing', name: 'med spa Westfield IN' }, { '@type': 'Thing', name: 'tox maintenance' }, { '@type': 'Thing', name: 'injector consistency' }] },
    { '@type': 'BreadcrumbList', '@id': `${CANONICAL_URL}#breadcrumbs`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'The RELUXE Way', item: `${SITE_URL}${HUB_URL}` }, { '@type': 'ListItem', position: 3, name: 'Why Patients Stay', item: CANONICAL_URL }] },
    { '@type': 'Organization', '@id': `${SITE_URL}#organization`, name: 'RELUXE Med Spa', url: SITE_URL, sameAs: [IG_URL] },
    { '@type': 'WebSite', '@id': `${SITE_URL}#website`, url: SITE_URL, name: 'RELUXE Med Spa', publisher: { '@id': `${SITE_URL}#organization` } },
  ] }
}

export default function WhyPatientsStayPage() {
  const smsBody = encodeURIComponent(`Hi RELUXE! I'd love to learn more about your approach. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`

  const pageTitle = 'Why Patients Stay | Consistency Is the Real Luxury | RELUXE (Carmel & Westfield)'
  const pageDescription = 'Why patients return to RELUXE: consistency, predictability, expert planning, and transparent pricing. Learn what makes RELUXE different in Carmel & Westfield.'

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
              <a href={HUB_URL} onClick={() => trackEvent('hub_click', { placement: 'hero_breadcrumb' })} style={{ ...typeScale.label, color: colors.violet, fontFamily: fonts.body, textDecoration: 'none' }}>Back to the hub &rarr;</a>
            </div>
            <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, marginTop: '0.75rem' }}>
              Consistency is the real{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>luxury.</span>
            </h1>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.7)', marginTop: '1.5rem' }}>
              Patients don't stay because of a deal. They stay because they consistently love their results—and feel known here.
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', marginTop: '1rem' }}>
              Here's what we see after hundreds of repeat visits: predictable outcomes, transparent pricing, and expert long-term planning are what make patients stop shopping around.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start">
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
              <a href={YOUR_CONSULT_URL} onClick={() => trackEvent('spoke_click', { placement: 'hero_secondary_your_consult', target: YOUR_CONSULT_URL })} style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}>What to Expect</a>
              <a href={IG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_click', { placement: 'hero_instagram' })} style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}>See Our Work (@reluxemedspa)</a>
            </div>
            <div style={{ marginTop: '2rem', borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '1.25rem' }}>
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="Why patients stay" value="Predictable results" />
                <MiniStat label="How we get there" value="Plans over time" />
                <MiniStat label="What it feels like" value="Straightforward + trusted" />
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)', fontFamily: fonts.body }}>Education only. Treatment plan and dosing are customized by your injector. Results vary.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: The real reasons */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>The pattern we see</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>The real reasons patients return</h2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>These aren't marketing buzzwords. These are the reasons people stop shopping around after RELUXE.</p>
          </div>
          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <ReasonCard title="Predictability">They know what their results will look like because the plan is consistent and intentional.</ReasonCard>
            <ReasonCard title="Transparency">Pricing feels straightforward. No surprises. No "gotcha" upsells in the chair.</ReasonCard>
            <ReasonCard title="Feeling known">Patients feel remembered—preferences, movement patterns, and what they love (and don't).</ReasonCard>
            <ReasonCard title="Long-term planning">Results improve over time as the injector learns the face. This is where "best results" come from.</ReasonCard>
          </div>
          <div style={{ marginTop: '2rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem' }}>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6 }}>When those four things are true, patients stop asking "who's cheapest?" and start asking "when am I due again?"</p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Consistency framework */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}`, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>Consistency framework</Eyebrow>
              <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>Why results compound over time</h2>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>The first visit is important. But the best outcomes happen when there's continuity and a plan.</p>
              <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
                <Bullet>Your injector learns your movement patterns.</Bullet>
                <Bullet>Your dosing becomes more precise each visit.</Bullet>
                <Bullet>Cadence becomes predictable (and easier to plan around events).</Bullet>
                <Bullet>Facial balance improves because decisions are made holistically.</Bullet>
              </ul>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1.25rem' }}>This is why "deal-hopping" rarely produces the best results. You're constantly starting over with someone new.</p>
            </div>
            <div className="lg:col-span-5">
              <SideCard>
                <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>Best next step</p>
                <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>Start with a consult</h3>
                <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>The best place to start is a consult with one of our amazing nurse injectors. We'll build a plan you can feel confident in.</p>
                <div className="mt-5"><GravityBookButton fontKey={FONT_KEY} size="hero" /></div>
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

      {/* SECTION 3: What RELUXE does differently */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>The RELUXE difference</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>Why it feels easier here</h2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>We intentionally remove the things that make aesthetics feel stressful: confusing pricing, pressure, and uncertainty.</p>
          </div>
          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <StandardCard title="Transparent pricing">You should know what the foundation is, and what add-on units cost, before you decide.</StandardCard>
            <StandardCard title="Expert injector planning">It's not just "tox." It's decisions about balance, expression, and longevity.</StandardCard>
            <StandardCard title="Clear next steps">Patients love knowing exactly when to come back—and what to expect next time.</StandardCard>
            <StandardCard title="No bait & switch">We don't lure with low pricing then surprise you once you're in the chair.</StandardCard>
            <StandardCard title="Education without pressure">You'll understand your options clearly. Then you choose what feels right.</StandardCard>
            <StandardCard title="A relationship, not a transaction">The more we know your face, the better your results get over time.</StandardCard>
          </div>
        </div>
      </section>

      {/* SECTION 4: Helpful reads */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}`, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Explore more</Eyebrow>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>Keep going down the RELUXE Way</h2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>Each page stands alone. Together they explain why patients choose RELUXE—and why they stay.</p>
          </div>
          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <LinkCard href={TOX_PRICING_URL} title="Transparent Tox Pricing" copy="Foundation + Right Dosing pricing." />
            <LinkCard href={RESULTS_OVER_DEALS_URL} title="Results Over Deals" copy="Why cheaper often costs more over time." />
            <LinkCard href={INJECTOR_STANDARD_URL} title="Injector Standard" copy="Why technique matters more than the vial." />
            <LinkCard href={CHOOSING_TOX_URL} title="Choosing Your Tox" copy="Botox vs Jeuveau vs Dysport vs Daxxify." />
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
              <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, marginTop: '0.5rem' }}>Start with a{' '}<span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>consult.</span></h2>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.6)', lineHeight: 1.6, marginTop: '1rem', maxWidth: '48rem' }}>The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking? Call, text, or DM us and we're happy to help.</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start"><GravityBookButton fontKey={FONT_KEY} size="hero" /></div>
              <div className="mt-5 flex flex-wrap items-center gap-2" style={{ fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', fontFamily: fonts.body }}>
                <a href={smsHref} onClick={() => trackEvent('sms_click', { placement: 'final_sms', phone: MARKETING_SMS })} className="underline">Text us</a><span>&middot;</span>
                <a href={callHref} onClick={() => trackEvent('call_click', { placement: 'final_call', phone: PHONE_CALL })} className="underline">Call {DISPLAY_PHONE}</a><span>&middot;</span>
                <a href={IG_DM_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_dm_click', { placement: 'final_ig_dm' })} className="underline">DM us</a><span>&middot;</span>
                <a href={IG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_click', { placement: 'final_instagram' })} className="underline">@reluxemedspa</a><span>&middot;</span>
                <a href={FB_MSG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('facebook_message_click', { placement: 'final_fb_msg' })} className="underline">Message us</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

WhyPatientsStayPage.getLayout = (page) => page

/* Components */
function Eyebrow({ children }) { return <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>{children}</p> }
function MiniStat({ label, value }) {
  return (<div style={{ borderRadius: '0.75rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '0.75rem' }}>
    <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>{label}</p>
    <p style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.875rem', color: colors.white, marginTop: '0.25rem' }}>{value}</p>
  </div>)
}
function Bullet({ children }) {
  return (<li className="flex items-start gap-2"><span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.violet, flexShrink: 0 }} /><span>{children}</span></li>)
}
function SideCard({ children }) {
  return (<div className="lg:sticky lg:top-24"><div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>{children}</div></div>)
}
function ReasonCard({ title, children }) {
  return (<div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>Reason</p>
    <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>{title}</h3>
    <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>{children}</p>
  </div>)
}
function StandardCard({ title, children }) {
  return (<div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>RELUXE</p>
    <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>{title}</h3>
    <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>{children}</p>
  </div>)
}
function LinkCard({ href, title, copy }) {
  return (<a href={href} onClick={() => trackEvent('spoke_click', { placement: 'explore_more', target: href, title })} className="group" style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}>
    <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>Read</p>
    <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>{title}</h3>
    <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>{copy}</p>
    <p style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.875rem', color: colors.violet, marginTop: '1rem' }}>Explore <span style={{ marginLeft: '0.25rem' }}>&rarr;</span></p>
  </a>)
}
