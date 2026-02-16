// src/pages/reluxe-way/results-over-deals.js
// The RELUXE Way — Results Over Deals (standalone spoke page)

/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

/** =========================
 *  EDIT THESE CONSTANTS
 *  ========================= */
const SITE_URL = 'https://reluxemedspa.com'
const PAGE_PATH = '/reluxe-way/results-over-deals'
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`

const OG_IMAGE = `${SITE_URL}/images/reluxe-way/results-over-deals-og.jpg` // ✅ create (1200x630)
const OG_IMAGE_SQUARE = `${SITE_URL}/images/reluxe-way/results-over-deals-og-square.jpg` // optional (1080x1080)

const HUB_URL = '/reluxe-way'
const TOX_PRICING_URL = '/reluxe-way/tox-pricing'

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

  // GTM / dataLayer
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
        name: 'Results Over Deals | Botox, Jeuveau, Dysport & Daxxify Value | RELUXE (Carmel & Westfield)',
        description:
          'Why the cheapest tox option often costs more over time. Learn how dosing, technique, and planning impact longevity, satisfaction, and trust at RELUXE in Carmel & Westfield.',
        isPartOf: { '@id': `${SITE_URL}#website` },
        about: [
          { '@type': 'Thing', name: 'Botox value' },
          { '@type': 'Thing', name: 'Daxxify value' },
          { '@type': 'Thing', name: 'Jeuveau value' },
          { '@type': 'Thing', name: 'Dysport value' },
          { '@type': 'Thing', name: 'tox dosing' },
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
          { '@type': 'ListItem', position: 3, name: 'Results Over Deals', item: CANONICAL_URL },
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

export default function ResultsOverDealsPage() {
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
    'Results Over Deals | Why the Cheapest Tox Often Costs More | RELUXE (Carmel & Westfield)'
  const pageDescription =
    'Why the cheapest tox option often costs more over time. Learn how dosing, technique, and planning impact longevity, satisfaction, and trust at RELUXE in Carmel & Westfield.'

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
        <meta property="og:title" content="Results Over Deals — The RELUXE Way" />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Results Over Deals — The RELUXE Way (Carmel & Westfield)" />
        <meta property="og:image" content={OG_IMAGE_SQUARE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Results Over Deals — The RELUXE Way" />
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
              Results Over Deals.
            </h1>

            <p className="mt-4 text-neutral-200 text-base sm:text-lg leading-relaxed">
              Because how it looks <em>and</em> how long it lasts matter more than the sticker price.
            </p>

            <p className="mt-3 text-neutral-300 text-sm sm:text-base leading-relaxed">
              We’ve seen it hundreds of times: patients chasing a deal—only to be disappointed when results fade too quickly,
              look uneven, or don’t match expectations. At RELUXE, we optimize for <strong>outcomes, longevity, and trust</strong>.
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
                View Transparent Tox Pricing
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

            <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <MiniStat label="Built for results" value="Correct dose wins" />
                <MiniStat label="Built for trust" value="No pressure" />
                <MiniStat label="Built for longevity" value="Plan over time" />
              </div>
              <p className="mt-3 text-[12px] text-neutral-400">
                Education only. Treatment plan and dosing are customized by your injector. Results vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Why deals fail</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Why “cheap tox” isn’t actually cheap
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              Most deals are designed to win bookings—not deliver lasting results. They often rely on one (or more) of the following:
            </p>
          </div>

          <div className="mt-7 grid md:grid-cols-2 gap-4 sm:gap-6">
            <ListCard title="Lower dosing to keep prices down">
              Under-dosing can make the first visit look cheaper—but often reduces longevity and satisfaction.
            </ListCard>
            <ListCard title="Rushed appointments to protect margins">
              Speed isn’t a strategy. Mapping movement and customizing dosing takes attention and time.
            </ListCard>
            <ListCard title="Inconsistent pricing that changes monthly">
              Rotating promos create uncertainty—and make it hard to trust what’s “normal.”
            </ListCard>
            <ListCard title="Pressure to upsell after you’re in the chair">
              Low entry prices can become “surprises” when you’re told you need more—after you’ve arrived.
            </ListCard>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
            <p className="text-neutral-800 leading-relaxed">
              That cycle isn’t accidental. It’s what happens when pricing is built around <strong>transactions</strong> instead of <strong>relationships</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="bg-neutral-50 border-y border-neutral-200 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>What drives great results</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Results come from three things—every time
            </h2>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            <Pillar
              title="Correct Dosing"
              copy="Duration, symmetry, and satisfaction start with the right number of units—not the lowest number."
            />
            <Pillar
              title="Expert Technique"
              copy="Same product. Different injector. Completely different outcome."
            />
            <Pillar
              title="Long-Term Planning"
              copy="The best results compound over time when your injector knows your face, movement, and preferences."
            />
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
              The RELUXE approach
            </h3>
            <p className="mt-3 text-neutral-700 leading-relaxed">
              At RELUXE, pricing is designed to support all three—not fight against them. We optimize for how long you love your result, not how fast we can discount your booking.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <a
                href={CONSULT_URL}
                onClick={() => trackEvent('consult_click', { placement: 'pillars_primary_consult', location: 'any' })}
                className='inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition w-full sm:w-auto'
              >
                Book a Consult
              </a>
              <a
                href={TOX_PRICING_URL}
                onClick={() => trackEvent('spoke_click', { placement: 'pillars_secondary_pricing', target: TOX_PRICING_URL })}
                className='inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-neutral-50 transition w-full sm:w-auto'
              >
                See Pricing Model
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow>Why dosing matters</Eyebrow>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Under-dosing is the most expensive mistake in aesthetics
              </h2>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                We understand why under-dosing happens: patients want to stay within a budget, and providers want to advertise a low entry price.
              </p>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                But here’s what we see in practice:
              </p>

              <ul className="mt-4 space-y-2 text-neutral-700">
                <Bullet>Under-dosed tox wears off faster.</Bullet>
                <Bullet>Patients return sooner—or feel let down.</Bullet>
                <Bullet>Trust erodes, even if the injector “did nothing wrong.”</Bullet>
              </ul>

              <p className="mt-5 text-neutral-700 leading-relaxed">
                That’s why RELUXE pricing removes the penalty for choosing the right plan. We don’t want you to feel financially punished for saying “yes” to expert guidance.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7 shadow-sm">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">
                  The short version
                </h3>
                <p className="mt-3 text-neutral-700 leading-relaxed">
                  The goal isn’t “the fewest units.” The goal is the right dose—so you love the result and the duration.
                </p>

                <div className="mt-5 grid sm:grid-cols-2 gap-2">
                  <a
                    href={CONSULT_URL_WESTFIELD}
                    onClick={() => trackEvent('consult_click', { placement: 'dose_side_westfield', location: 'westfield' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
                  >
                    Westfield Consult
                  </a>
                  <a
                    href={CONSULT_URL_CARMEL}
                    onClick={() => trackEvent('consult_click', { placement: 'dose_side_carmel', location: 'carmel' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
                  >
                    Carmel Consult
                  </a>
                </div>

                <div className="mt-4 text-[11px] text-neutral-500">
                  Prefer to message us?{' '}
                  <a
                    href={IG_DM_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('instagram_dm_click', { placement: 'dose_side_ig_dm' })}
                    className="underline"
                  >
                    Instagram DM
                  </a>{' '}
                  •{' '}
                  <a
                    href={FB_MSG_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('facebook_message_click', { placement: 'dose_side_fb_msg' })}
                    className="underline"
                  >
                    Facebook message
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 */}
      <section className="bg-neutral-50 border-y border-neutral-200 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>The RELUXE difference</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Why we don’t compete on deals
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              RELUXE isn’t built for everyone—and that’s intentional. We’re not trying to be the cheapest option in town or the spa with a different promo every month.
            </p>
          </div>

          <div className="mt-7 grid md:grid-cols-2 gap-4 sm:gap-6">
            <ContrastCard
              leftTitle="We’re not built for…"
              leftItems={[
                'The cheapest option in town',
                'Rotating promos and flash discounts',
                'Rushed appointments',
                'Minimum dosing regardless of outcome',
              ]}
              rightTitle="We are built for…"
              rightItems={[
                'Predictable, transparent pricing',
                'Results that last',
                'Expert injectors and thoughtful technique',
                'Long-term relationships, not transactions',
              ]}
            />
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">Bottom line</h3>
            <p className="mt-3 text-neutral-700 leading-relaxed">
              Our patients don’t stay because of deals. They stay because they consistently love their results.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Example */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Real-world example</Eyebrow>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Same face. Same tox. Different outcome.
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              Two patients receive the same neurotoxin. The difference is the plan—and whether pricing supports the right decision.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4 sm:gap-6">
            <ExampleCard
              title="Patient A (deal-driven)"
              items={[
                'Chooses the lowest-priced option',
                'Receives minimal dosing',
                'Needs a touch-up sooner than expected',
                'Feels uncertain and keeps shopping around',
              ]}
            />
            <ExampleCard
              title="Patient B (results-driven)"
              items={[
                'Trusts an experienced injector',
                'Receives the correct dose from the start',
                'Enjoys longer-lasting, more balanced results',
                'Builds consistency over time',
              ]}
              highlight
            />
          </div>

          <div className="mt-8 rounded-3xl bg-neutral-50 border border-neutral-200 p-6 sm:p-7">
            <p className="text-neutral-800 leading-relaxed">
              Patient B often spends <strong>less over time</strong>, even if the first visit costs more. That’s the difference between <strong>cheap</strong> and <strong>valuable</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Connection to pricing */}
      <section className="bg-neutral-950 text-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Eyebrow dark>How this connects</Eyebrow>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Pricing should support great decisions—not block them
              </h2>
              <p className="mt-4 text-neutral-200 leading-relaxed">
                That’s why RELUXE pricing is structured to protect the quality of care and remove friction on the plan that delivers the best outcome.
              </p>
              <ul className="mt-4 space-y-2 text-neutral-200">
                <Bullet dark>Protect the experience with a foundation dose.</Bullet>
                <Bullet dark>Encourage correct dosing with Right Dosing pricing.</Bullet>
                <Bullet dark>Remove pressure and guesswork from decision-making.</Bullet>
                <Bullet dark>Reward trust and consistency over time.</Bullet>
              </ul>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6 sm:p-7">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">Want the full breakdown?</h3>
                <p className="mt-3 text-neutral-200 leading-relaxed">
                  See the exact foundation doses and add-on pricing for Botox®, Daxxify®, Jeuveau®, and Dysport®.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={TOX_PRICING_URL}
                    onClick={() => trackEvent('spoke_click', { placement: 'dark_pricing_primary', target: TOX_PRICING_URL })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-gradient-to-r from-emerald-500 to-black hover:from-emerald-400 hover:to-neutral-900 transition"
                  >
                    View Transparent Tox Pricing
                    <Arrow />
                  </a>
                  <a
                    href={CONSULT_URL}
                    onClick={() => trackEvent('consult_click', { placement: 'dark_pricing_secondary_consult', location: 'any' })}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold ring-1 ring-white/15 hover:bg-white/10 transition"
                  >
                    Book a Consult
                  </a>
                </div>

                <div className="mt-4 text-[11px] text-neutral-400">
                  Prefer help booking?{' '}
                  <a
                    href={`sms:${MARKETING_SMS}?&body=${encodeURIComponent(`Hi RELUXE! I’d like help booking a ${CONSULT_NAME}.`)}`}
                    onClick={() => trackEvent('sms_click', { placement: 'dark_pricing_sms', phone: MARKETING_SMS })}
                    className="underline"
                  >
                    Text us
                  </a>{' '}
                  or{' '}
                  <a
                    href={`tel:${PHONE_CALL}`}
                    onClick={() => trackEvent('call_click', { placement: 'dark_pricing_call', phone: PHONE_CALL })}
                    className="underline"
                  >
                    call {DISPLAY_PHONE}
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-7 sm:p-10">
            <p className="text-[11px] tracking-widest uppercase text-neutral-500">Ready to choose results?</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Start with a consult.
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed max-w-3xl">
              The best place to start is a consult with one of our amazing nurse injectors. We’ll talk through your goals,
              timeline, and preferences—and build a plan that delivers results you’ll love.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-2 max-w-2xl">
              <a
                href={CONSULT_URL_WESTFIELD}
                onClick={() => trackEvent('consult_click', { placement: 'final_consult', location: 'westfield' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition"
              >
                Book Westfield Consult
              </a>
              <a
                href={CONSULT_URL_CARMEL}
                onClick={() => trackEvent('consult_click', { placement: 'final_consult', location: 'carmel' })}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ring-1 ring-neutral-200 hover:bg-white transition"
              >
                Book Carmel Consult
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
              <a
                href={smsHref}
                onClick={() => trackEvent('sms_click', { placement: 'final_sms', phone: MARKETING_SMS })}
                className="underline"
              >
                Text us
              </a>
              <span>•</span>
              <a
                href={callHref}
                onClick={() => trackEvent('call_click', { placement: 'final_call', phone: PHONE_CALL })}
                className="underline"
              >
                Call {DISPLAY_PHONE}
              </a>
              <span>•</span>
              <a
                href={IG_DM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_dm_click', { placement: 'final_ig_dm' })}
                className="underline"
              >
                DM us
              </a>
              <span>•</span>
              <a
                href={IG_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('instagram_click', { placement: 'final_instagram' })}
                className="underline"
              >
                @reluxemedspa
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY CTA */}
      {showSticky && (
        <StickyCTA title="Book a Consult" subtitle={CONSULT_NAME} href={CONSULT_URL} />
      )}
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

function Eyebrow({ children, dark }) {
  return (
    <p className={`text-[11px] tracking-widest uppercase ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>
      {children}
    </p>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-black/20 ring-1 ring-white/10 p-3">
      <p className="text-[11px] tracking-widest uppercase text-neutral-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function Bullet({ children, dark }) {
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-2 h-2 w-2 rounded-full ${dark ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
      <span>{children}</span>
    </li>
  )
}

function ListCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
      <p className="mt-2 text-sm text-neutral-600">{children}</p>
    </div>
  )
}

function Pillar({ title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
      <p className="text-[11px] tracking-widest uppercase text-neutral-500">Pillar</p>
      <h3 className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">{title}</h3>
      <p className="mt-3 text-neutral-700 leading-relaxed">{copy}</p>
    </div>
  )
}

function ContrastCard({ leftTitle, leftItems, rightTitle, rightItems }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm md:col-span-2">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 p-5">
          <p className="text-sm font-semibold text-neutral-900">{leftTitle}</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            {leftItems.map((x, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-neutral-400" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-5">
          <p className="text-sm font-semibold text-neutral-900">{rightTitle}</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-800">
            {rightItems.map((x, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ExampleCard({ title, items, highlight }) {
  return (
    <div className={`rounded-3xl border p-6 sm:p-7 shadow-sm ${highlight ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-white'}`}>
      <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900">{title}</h3>
      <ul className="mt-4 space-y-2 text-neutral-800">
        {items.map((x, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-2 h-2 w-2 rounded-full ${highlight ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
            <span>{x}</span>
          </li>
        ))}
      </ul>
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
