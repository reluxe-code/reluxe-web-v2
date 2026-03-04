// src/pages/reluxe-way/not-for-everyone.js
// The RELUXE Way — Not for Everyone (standalone spoke page)

/* eslint-disable @next/next/no-img-element */
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way/not-for-everyone'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`
const OG_IMAGE = `${SITE_URL}/images/og/new-default-1200x630.png`
const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'
const RESULTS_OVER_DEALS_URL = '/reluxe-way/results-over-deals'
const INJECTOR_STANDARD_URL = '/reluxe-way/injector-standard'
const YOUR_CONSULT_URL = '/reluxe-way/your-consult'
const WHY_PATIENTS_STAY_URL = '/reluxe-way/why-patients-stay'

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
    { '@type': 'WebPage', '@id': `${CANONICAL_URL}#webpage`, url: CANONICAL_URL, name: "RELUXE Isn't for Everyone | Who Thrives at RELUXE | Carmel & Westfield", description: "RELUXE isn't for everyone—and that's intentional. Learn who thrives at RELUXE (and who may not) in Carmel & Westfield, and why fit matters for results and trust.", isPartOf: { '@id': `${SITE_URL}#website` }, about: [{ '@type': 'Thing', name: 'premium med spa' }, { '@type': 'Thing', name: 'Carmel IN med spa' }, { '@type': 'Thing', name: 'Westfield IN med spa' }, { '@type': 'Thing', name: 'tox consult' }] },
    { '@type': 'BreadcrumbList', '@id': `${CANONICAL_URL}#breadcrumbs`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'The RELUXE Way', item: `${SITE_URL}${HUB_URL}` }, { '@type': 'ListItem', position: 3, name: 'Not for Everyone', item: CANONICAL_URL }] },
    { '@type': 'Organization', '@id': `${SITE_URL}#organization`, name: 'RELUXE Med Spa', url: SITE_URL, sameAs: [IG_URL] },
    { '@type': 'WebSite', '@id': `${SITE_URL}#website`, url: SITE_URL, name: 'RELUXE Med Spa', publisher: { '@id': `${SITE_URL}#organization` } },
  ] }
}

export default function NotForEveryonePage() {
  const smsBody = encodeURIComponent(`Hi RELUXE! I'd love to learn more. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`
  const pageTitle = "RELUXE Isn't for Everyone | Who Thrives Here | RELUXE (Carmel & Westfield)"
  const pageDescription = "RELUXE isn't for everyone—and that's intentional. Learn who thrives at RELUXE (and who may not) in Carmel & Westfield, and why fit matters for results and trust."

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
              RELUXE isn't for{' '}<span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>everyone.</span>
            </h1>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.7)', marginTop: '1.5rem' }}>And that's intentional—because fit matters when you're trusting someone with your face.</p>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', marginTop: '1rem' }}>If you're looking for the cheapest option or the fastest possible appointment, we may not be the right fit. If you value results, trust, and expert guidance—you'll love it here.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start">
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
              <a href={WHY_PATIENTS_STAY_URL} onClick={() => trackEvent('spoke_click', { placement: 'hero_secondary_why_stay', target: WHY_PATIENTS_STAY_URL })} style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}>Why Patients Stay</a>
              <a href={IG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_click', { placement: 'hero_instagram' })} style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}>See Our Work (@reluxemedspa)</a>
            </div>
            <div style={{ marginTop: '2rem', borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '1.25rem' }}>
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="What we optimize for" value="Outcomes" />
                <MiniStat label="How we operate" value="No pressure" />
                <MiniStat label="Who thrives here" value="Results-driven" />
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)', fontFamily: fonts.body }}>Education only. Treatment plan and dosing are customized by your injector. Results vary.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Who we are for */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6">
              <Eyebrow>RELUXE is right for you if...</Eyebrow>
              <SectionH2>You value trust, clarity, and results.</SectionH2>
              <div className="mt-6 space-y-3">
                <FitItem ok title="You want a natural look">Refreshed—not overdone. You still want to look like you.</FitItem>
                <FitItem ok title="You want expert guidance">You want an injector who explains options clearly and recommends what's best for your face.</FitItem>
                <FitItem ok title="You want consistency">You don't want to hop around. You want a plan that gets better over time.</FitItem>
                <FitItem ok title="You appreciate transparency">Pricing and decisions should feel straightforward—no surprises, no pressure.</FitItem>
              </div>
            </div>
            <div className="lg:col-span-6">
              <Eyebrow>RELUXE may not be right for you if...</Eyebrow>
              <SectionH2>You're only chasing the lowest price.</SectionH2>
              <div className="mt-6 space-y-3">
                <FitItem title="You want the cheapest option—always">If "lowest price" is the #1 priority, you'll likely find lower pricing elsewhere.</FitItem>
                <FitItem title="You want the minimum dose regardless of outcome">We won't under-dose just to hit a number. We recommend what we believe will work best.</FitItem>
                <FitItem title="You want the fastest possible appointment">Great results require movement mapping and intentional planning. We won't rush that.</FitItem>
                <FitItem title="You prefer rotating promos over consistency">We're built for long-term trust, not monthly gimmicks.</FitItem>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '2.5rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem' }}>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6 }}>This isn't about judgment. It's about fit. The right patients get the best results—and the best experience.</p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Why fit matters */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}`, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>Why fit matters</Eyebrow>
              <SectionH2>Fit leads to better outcomes.</SectionH2>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>When patients want the same thing we optimize for—natural results, longevity, expert planning—everything feels easier:</p>
              <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
                <Bullet>Recommendations don't feel like upsells.</Bullet>
                <Bullet>Pricing feels predictable, not stressful.</Bullet>
                <Bullet>Results improve over time as we learn your face.</Bullet>
                <Bullet>Patients stay—because it works.</Bullet>
              </ul>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1.25rem' }}>Want to see how our philosophy shows up in practice? Start with pricing or our consult experience.</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-2 items-start">
                <a href={TOX_PRICING_URL} onClick={() => trackEvent('spoke_click', { placement: 'fit_pricing', target: TOX_PRICING_URL })} style={{ fontFamily: fonts.body, fontWeight: 600, background: colors.ink, color: colors.white, padding: '0.75rem 1.25rem', borderRadius: '9999px', textDecoration: 'none' }}>Transparent Tox Pricing</a>
                <a href={YOUR_CONSULT_URL} onClick={() => trackEvent('spoke_click', { placement: 'fit_consult_page', target: YOUR_CONSULT_URL })} style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading, padding: '0.75rem 1.25rem', borderRadius: '9999px', border: `1px solid ${colors.stone}`, textDecoration: 'none' }}>What to Expect</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <SideCard>
                <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>Best next step</p>
                <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>Start with a consult.</h3>
                <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>The best place to start is a consult with one of our amazing nurse injectors. We'll build a plan you can feel confident in.</p>
                <div className="mt-5"><GravityBookButton fontKey={FONT_KEY} size="hero" /></div>
                <div style={{ marginTop: '1rem', fontSize: '0.6875rem', color: colors.muted, fontFamily: fonts.body }}>
                  Prefer to message us?{' '}
                  <a href={IG_DM_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_dm_click', { placement: 'side_ig_dm' })} className="underline">Instagram DM</a>{' '}&middot;{' '}
                  <a href={FB_MSG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('facebook_message_click', { placement: 'side_fb_msg' })} className="underline">Facebook message</a>
                </div>
              </SideCard>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Helpful reads */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Explore</Eyebrow>
            <SectionH2>The pages that explain our philosophy</SectionH2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>If you're the type who likes to understand how decisions get made, these are for you.</p>
          </div>
          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <LinkCard href={TOX_PRICING_URL} title="Transparent Pricing" copy="Foundation + Right Dosing pricing." />
            <LinkCard href={RESULTS_OVER_DEALS_URL} title="Results Over Deals" copy="Why cheaper often costs more over time." />
            <LinkCard href={INJECTOR_STANDARD_URL} title="Injector Standard" copy="Why technique matters more than the vial." />
            <LinkCard href={WHY_PATIENTS_STAY_URL} title="Why Patients Stay" copy="Consistency is the real luxury." />
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
              <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, marginTop: '0.5rem' }}>If you're results-driven, you'll{' '}<span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>love it here.</span></h2>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.6)', lineHeight: 1.6, marginTop: '1rem', maxWidth: '48rem' }}>The best place to start is a consult with one of our amazing nurse injectors. Have a question before you come or want help booking? Call, text, or DM us and we're happy to help.</p>
              <div className="mt-6"><GravityBookButton fontKey={FONT_KEY} size="hero" /></div>
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

NotForEveryonePage.getLayout = (page) => page

/* Components */
function Eyebrow({ children }) { return <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>{children}</p> }
function SectionH2({ children }) { return <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>{children}</h2> }
function MiniStat({ label, value }) { return (<div style={{ borderRadius: '0.75rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '0.75rem' }}><p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>{label}</p><p style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.875rem', color: colors.white, marginTop: '0.25rem' }}>{value}</p></div>) }
function Bullet({ children }) { return (<li className="flex items-start gap-2"><span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.violet, flexShrink: 0 }} /><span>{children}</span></li>) }
function SideCard({ children }) { return (<div className="lg:sticky lg:top-24"><div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>{children}</div></div>) }
function FitItem({ title, children, ok }) {
  return (<div style={{ borderRadius: '1.5rem', border: `1px solid ${ok ? 'rgba(124,58,237,0.2)' : colors.stone}`, background: ok ? 'rgba(124,58,237,0.03)' : '#fff', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <div className="flex items-start gap-3">
      <div style={{ height: 40, width: 40, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ok ? colors.violet : colors.ink, color: ok ? '#fff' : '#fff', flexShrink: 0 }}>
        {ok ? (<svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 011.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z" clipRule="evenodd" /></svg>)
        : (<svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>)}
      </div>
      <div>
        <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1rem', color: colors.heading }}>{title}</h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, lineHeight: 1.6, marginTop: '0.5rem' }}>{children}</p>
      </div>
    </div>
  </div>)
}
function LinkCard({ href, title, copy }) {
  return (<a href={href} onClick={() => trackEvent('spoke_click', { placement: 'explore', target: href, title })} className="group" style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}>
    <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>Read</p>
    <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>{title}</h3>
    <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>{copy}</p>
    <p style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.875rem', color: colors.violet, marginTop: '1rem' }}>Explore <span style={{ marginLeft: '0.25rem' }}>&rarr;</span></p>
  </a>)
}
