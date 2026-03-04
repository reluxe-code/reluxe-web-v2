// src/pages/reluxe-way/results-over-deals.js
// The RELUXE Way — Results Over Deals (standalone spoke page)

/* eslint-disable @next/next/no-img-element */
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way/results-over-deals'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`
const OG_IMAGE = `${SITE_URL}/images/og/new-default-1200x630.png`
const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'

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
    { '@type': 'WebPage', '@id': `${CANONICAL_URL}#webpage`, url: CANONICAL_URL, name: 'Results Over Deals | Botox, Jeuveau, Dysport & Daxxify Value | RELUXE (Carmel & Westfield)', description: 'Why the cheapest tox option often costs more over time. Learn how dosing, technique, and planning impact longevity, satisfaction, and trust at RELUXE in Carmel & Westfield.', isPartOf: { '@id': `${SITE_URL}#website` }, about: [{ '@type': 'Thing', name: 'Botox value' }, { '@type': 'Thing', name: 'Daxxify value' }, { '@type': 'Thing', name: 'Jeuveau value' }, { '@type': 'Thing', name: 'Dysport value' }, { '@type': 'Thing', name: 'tox dosing' }, { '@type': 'Thing', name: 'Carmel IN' }, { '@type': 'Thing', name: 'Westfield IN' }] },
    { '@type': 'BreadcrumbList', '@id': `${CANONICAL_URL}#breadcrumbs`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'The RELUXE Way', item: `${SITE_URL}${HUB_URL}` }, { '@type': 'ListItem', position: 3, name: 'Results Over Deals', item: CANONICAL_URL }] },
    { '@type': 'Organization', '@id': `${SITE_URL}#organization`, name: 'RELUXE Med Spa', url: SITE_URL, sameAs: [IG_URL] },
    { '@type': 'WebSite', '@id': `${SITE_URL}#website`, url: SITE_URL, name: 'RELUXE Med Spa', publisher: { '@id': `${SITE_URL}#organization` } },
  ] }
}

export default function ResultsOverDealsPage() {
  const smsBody = encodeURIComponent(`Hi RELUXE! I'd love to learn more about your approach. Can you help?`)
  const smsHref = `sms:${MARKETING_SMS}?&body=${smsBody}`
  const callHref = `tel:${PHONE_CALL}`
  const pageTitle = 'Results Over Deals | Why the Cheapest Tox Often Costs More | RELUXE (Carmel & Westfield)'
  const pageDescription = 'Why the cheapest tox option often costs more over time. Learn how dosing, technique, and planning impact longevity, satisfaction, and trust at RELUXE in Carmel & Westfield.'

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
              Results Over{' '}<span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Deals.</span>
            </h1>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.7)', marginTop: '1.5rem' }}>
              Because how it looks <em>and</em> how long it lasts matter more than the sticker price.
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(0.875rem, 1.2vw, 1rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', marginTop: '1rem' }}>
              We've seen it hundreds of times: patients chasing a deal—only to be disappointed when results fade too quickly,
              look uneven, or don't match expectations. At RELUXE, we optimize for <strong>outcomes, longevity, and trust</strong>.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start">
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
              <a href={TOX_PRICING_URL} onClick={() => trackEvent('spoke_click', { placement: 'hero_secondary_pricing', target: TOX_PRICING_URL })} style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}>View Transparent Tox Pricing</a>
              <a href={IG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_click', { placement: 'hero_instagram' })} style={{ fontFamily: fonts.body, fontWeight: 600, color: 'rgba(250,248,245,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}>See Our Work (@reluxemedspa)</a>
            </div>
            <div style={{ marginTop: '2rem', borderRadius: '1rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '1.25rem' }}>
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="Built for results" value="Correct dose wins" />
                <MiniStat label="Built for trust" value="No pressure" />
                <MiniStat label="Built for longevity" value="Plan over time" />
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)', fontFamily: fonts.body }}>Education only. Treatment plan and dosing are customized by your injector. Results vary.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Why deals fail</Eyebrow>
            <SectionH2>Why "cheap tox" isn't actually cheap</SectionH2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>Most deals are designed to win bookings—not deliver lasting results. They often rely on one (or more) of the following:</p>
          </div>
          <div className="mt-7 grid md:grid-cols-2 gap-4 sm:gap-6">
            <ListCard title="Lower dosing to keep prices down">Under-dosing can make the first visit look cheaper—but often reduces longevity and satisfaction.</ListCard>
            <ListCard title="Rushed appointments to protect margins">Speed isn't a strategy. Mapping movement and customizing dosing takes attention and time.</ListCard>
            <ListCard title="Inconsistent pricing that changes monthly">Rotating promos create uncertainty—and make it hard to trust what's "normal."</ListCard>
            <ListCard title="Pressure to upsell after you're in the chair">Low entry prices can become "surprises" when you're told you need more—after you've arrived.</ListCard>
          </div>
          <div style={{ marginTop: '2rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem' }}>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6 }}>That cycle isn't accidental. It's what happens when pricing is built around <strong>transactions</strong> instead of <strong>relationships</strong>.</p>
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}`, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>What drives great results</Eyebrow>
            <SectionH2>Results come from three things—every time</SectionH2>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <Pillar title="Correct Dosing" copy="Duration, symmetry, and satisfaction start with the right number of units—not the lowest number." />
            <Pillar title="Expert Technique" copy="Same product. Different injector. Completely different outcome." />
            <Pillar title="Long-Term Planning" copy="The best results compound over time when your injector knows your face, movement, and preferences." />
          </div>
          <div style={{ marginTop: '2rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.375rem', color: colors.heading }}>The RELUXE approach</h3>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>At RELUXE, pricing is designed to support all three—not fight against them. We optimize for how long you love your result, not how fast we can discount your booking.</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 items-start">
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
              <a href={TOX_PRICING_URL} onClick={() => trackEvent('spoke_click', { placement: 'pillars_secondary_pricing', target: TOX_PRICING_URL })} style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading, padding: '0.75rem 1.25rem', borderRadius: '9999px', border: `1px solid ${colors.stone}`, textDecoration: 'none' }}>See Pricing Model</a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Dosing */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>Why dosing matters</Eyebrow>
              <SectionH2>Under-dosing is the most expensive mistake in aesthetics</SectionH2>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>We understand why under-dosing happens: patients want to stay within a budget, and providers want to advertise a low entry price.</p>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>But here's what we see in practice:</p>
              <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
                <Bullet>Under-dosed tox wears off faster.</Bullet>
                <Bullet>Patients return sooner—or feel let down.</Bullet>
                <Bullet>Trust erodes, even if the injector "did nothing wrong."</Bullet>
              </ul>
              <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1.25rem' }}>That's why RELUXE pricing removes the penalty for choosing the right plan. We don't want you to feel financially punished for saying "yes" to expert guidance.</p>
            </div>
            <div className="lg:col-span-5">
              <SideCard>
                <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading }}>The short version</h3>
                <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>The goal isn't "the fewest units." The goal is the right dose—so you love the result and the duration.</p>
                <div className="mt-5"><GravityBookButton fontKey={FONT_KEY} size="hero" /></div>
                <div style={{ marginTop: '1rem', fontSize: '0.6875rem', color: colors.muted, fontFamily: fonts.body }}>
                  Prefer to message us?{' '}
                  <a href={IG_DM_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_dm_click', { placement: 'dose_side_ig_dm' })} className="underline">Instagram DM</a>{' '}&middot;{' '}
                  <a href={FB_MSG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('facebook_message_click', { placement: 'dose_side_fb_msg' })} className="underline">Facebook message</a>
                </div>
              </SideCard>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Contrast */}
      <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}`, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>The RELUXE difference</Eyebrow>
            <SectionH2>Why we don't compete on deals</SectionH2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>RELUXE isn't built for everyone—and that's intentional. We're not trying to be the cheapest option in town or the spa with a different promo every month.</p>
          </div>
          <div className="mt-7">
            <ContrastCard
              leftTitle="We're not built for..."
              leftItems={['The cheapest option in town', 'Rotating promos and flash discounts', 'Rushed appointments', 'Minimum dosing regardless of outcome']}
              rightTitle="We are built for..."
              rightItems={['Predictable, transparent pricing', 'Results that last', 'Expert injectors and thoughtful technique', 'Long-term relationships, not transactions']}
            />
          </div>
          <div style={{ marginTop: '2rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.375rem', color: colors.heading }}>Bottom line</h3>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>Our patients don't stay because of deals. They stay because they consistently love their results.</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Example */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Real-world example</Eyebrow>
            <SectionH2>Same face. Same tox. Different outcome.</SectionH2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem' }}>Two patients receive the same neurotoxin. The difference is the plan—and whether pricing supports the right decision.</p>
          </div>
          <div className="mt-8 grid md:grid-cols-2 gap-4 sm:gap-6">
            <ExampleCard title="Patient A (deal-driven)" items={['Chooses the lowest-priced option', 'Receives minimal dosing', 'Needs a touch-up sooner than expected', 'Feels uncertain and keeps shopping around']} />
            <ExampleCard title="Patient B (results-driven)" items={['Trusts an experienced injector', 'Receives the correct dose from the start', 'Enjoys longer-lasting, more balanced results', 'Builds consistency over time']} highlight />
          </div>
          <div style={{ marginTop: '2rem', borderRadius: '1.5rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, padding: '1.75rem' }}>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6 }}>Patient B often spends <strong>less over time</strong>, even if the first visit costs more. That's the difference between <strong>cheap</strong> and <strong>valuable</strong>.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Connection to pricing */}
      <section style={{ background: colors.ink, color: colors.white, padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow dark>How this connects</Eyebrow>
              <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, marginTop: '0.5rem' }}>Pricing should support great decisions—not block them</h2>
              <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.6)', lineHeight: 1.6, marginTop: '1rem' }}>That's why RELUXE pricing is structured to protect the quality of care and remove friction on the plan that delivers the best outcome.</p>
              <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.6)' }}>
                <Bullet dark>Protect the experience with a foundation dose.</Bullet>
                <Bullet dark>Encourage correct dosing with Right Dosing pricing.</Bullet>
                <Bullet dark>Remove pressure and guesswork from decision-making.</Bullet>
                <Bullet dark>Reward trust and consistency over time.</Bullet>
              </ul>
            </div>
            <div className="lg:col-span-5">
              <div style={{ borderRadius: '1.5rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '1.75rem' }}>
                <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem' }}>Want the full breakdown?</h3>
                <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.6)', lineHeight: 1.6, marginTop: '0.75rem' }}>See the exact foundation doses and add-on pricing for Botox, Daxxify, Jeuveau, and Dysport.</p>
                <div className="mt-5 flex flex-col gap-2">
                  <a href={TOX_PRICING_URL} onClick={() => trackEvent('spoke_click', { placement: 'dark_pricing_primary', target: TOX_PRICING_URL })} style={{ fontFamily: fonts.body, fontWeight: 600, background: gradients.primary, color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '9999px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    View Transparent Tox Pricing <Arrow />
                  </a>
                  <GravityBookButton fontKey={FONT_KEY} size="hero" />
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.6875rem', color: 'rgba(250,248,245,0.35)', fontFamily: fonts.body }}>
                  Prefer help booking?{' '}
                  <a href={smsHref} onClick={() => trackEvent('sms_click', { placement: 'dark_pricing_sms', phone: MARKETING_SMS })} className="underline">Text us</a>{' '}or{' '}
                  <a href={callHref} onClick={() => trackEvent('call_click', { placement: 'dark_pricing_call', phone: PHONE_CALL })} className="underline">call {DISPLAY_PHONE}</a>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '2.5rem' }}>
            <p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>Ready to choose results?</p>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>Start with a consult.</h2>
            <p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '1rem', maxWidth: '48rem' }}>The best place to start is a consult with one of our amazing nurse injectors. We'll talk through your goals, timeline, and preferences—and build a plan that delivers results you'll love.</p>
            <div className="mt-6"><GravityBookButton fontKey={FONT_KEY} size="hero" /></div>
            <div className="mt-5 flex flex-wrap items-center gap-2" style={{ fontSize: '0.875rem', color: colors.muted, fontFamily: fonts.body }}>
              <a href={smsHref} onClick={() => trackEvent('sms_click', { placement: 'final_sms', phone: MARKETING_SMS })} className="underline">Text us</a><span>&middot;</span>
              <a href={callHref} onClick={() => trackEvent('call_click', { placement: 'final_call', phone: PHONE_CALL })} className="underline">Call {DISPLAY_PHONE}</a><span>&middot;</span>
              <a href={IG_DM_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_dm_click', { placement: 'final_ig_dm' })} className="underline">DM us</a><span>&middot;</span>
              <a href={IG_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('instagram_click', { placement: 'final_instagram' })} className="underline">@reluxemedspa</a>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

ResultsOverDealsPage.getLayout = (page) => page

/* Components */
function Eyebrow({ children, dark }) { return <p style={{ ...typeScale.label, color: dark ? 'rgba(250,248,245,0.4)' : colors.muted, fontFamily: fonts.body }}>{children}</p> }
function SectionH2({ children }) { return <h2 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: typeScale.sectionHeading.size, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginTop: '0.5rem' }}>{children}</h2> }
function MiniStat({ label, value }) { return (<div style={{ borderRadius: '0.75rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', padding: '0.75rem' }}><p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>{label}</p><p style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: '0.875rem', color: colors.white, marginTop: '0.25rem' }}>{value}</p></div>) }
function Bullet({ children, dark }) { return (<li className="flex items-start gap-2"><span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: dark ? 'rgba(124,58,237,0.6)' : colors.violet, flexShrink: 0 }} /><span>{children}</span></li>) }
function ListCard({ title, children }) { return (<div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><p style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: '0.9375rem', color: colors.heading }}>{title}</p><p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, marginTop: '0.5rem' }}>{children}</p></div>) }
function Pillar({ title, copy }) { return (<div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><p style={{ ...typeScale.label, color: colors.muted, fontFamily: fonts.body }}>Pillar</p><h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading, marginTop: '0.5rem' }}>{title}</h3><p style={{ fontFamily: fonts.body, color: colors.body, lineHeight: 1.6, marginTop: '0.75rem' }}>{copy}</p></div>) }
function SideCard({ children }) { return (<div className="lg:sticky lg:top-24"><div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>{children}</div></div>) }
function ContrastCard({ leftTitle, leftItems, rightTitle, rightItems }) {
  return (<div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, background: '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <div className="grid md:grid-cols-2 gap-6">
      <div style={{ borderRadius: '0.75rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, padding: '1.25rem' }}>
        <p style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: '0.9375rem', color: colors.heading }}>{leftTitle}</p>
        <ul className="mt-3 space-y-2" style={{ fontSize: '0.875rem', color: colors.body, fontFamily: fonts.body }}>
          {leftItems.map((x, i) => (<li key={i} className="flex items-start gap-2"><span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.muted, flexShrink: 0 }} /><span>{x}</span></li>))}
        </ul>
      </div>
      <div style={{ borderRadius: '0.75rem', backgroundColor: 'rgba(124,58,237,0.04)', border: `1px solid rgba(124,58,237,0.15)`, padding: '1.25rem' }}>
        <p style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: '0.9375rem', color: colors.heading }}>{rightTitle}</p>
        <ul className="mt-3 space-y-2" style={{ fontSize: '0.875rem', color: colors.body, fontFamily: fonts.body }}>
          {rightItems.map((x, i) => (<li key={i} className="flex items-start gap-2"><span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.violet, flexShrink: 0 }} /><span>{x}</span></li>))}
        </ul>
      </div>
    </div>
  </div>)
}
function ExampleCard({ title, items, highlight }) {
  return (<div style={{ borderRadius: '1.5rem', border: `1px solid ${highlight ? 'rgba(124,58,237,0.2)' : colors.stone}`, background: highlight ? 'rgba(124,58,237,0.03)' : '#fff', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <h3 style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', color: colors.heading }}>{title}</h3>
    <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
      {items.map((x, i) => (<li key={i} className="flex items-start gap-2"><span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: highlight ? colors.violet : colors.muted, flexShrink: 0 }} /><span>{x}</span></li>))}
    </ul>
  </div>)
}
function Arrow() { return (<svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" /></svg>) }
