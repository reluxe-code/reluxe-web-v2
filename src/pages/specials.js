// src/pages/specials.js
import Head from 'next/head';
import useSWR from 'swr';
import HeaderTwo from '@/components/header/header-2';
import { getDealsSSR, getDealsClient } from '@/lib/deals';
import DealsGrid from '@/components/deals/DealsGrid';

const SITE = 'https://reluxemedspa.com';
const title = 'Quarterly Specials | RELUXE Med Spa';
const description =
  'Current specials and quarterly promotions at RELUXE Med Spa—limited-time offers on injectables, skin, laser, and more.';

const ogImage = `${SITE}/images/og/new-default-1200x630.png`;

// -------------------------------
// Page Feature Flags
// -------------------------------
const SHOW_Q1_EVENT = true;
const SHOW_MORE_PROMOTIONS = false;

// -------------------------------
// Booking routes
// -------------------------------
const BOOK_CONSULT = '/book/consult/';

function BookButtons({
  href = '/book/consult/',
  locations = ['westfield', 'carmel'],
  note,
}) {
  const showWestfield = locations.includes('westfield');
  const showCarmel = locations.includes('carmel');

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-3">
        {showWestfield ? (
          <a
            href={href}
            data-book-loc="westfield"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-black px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90 transition-opacity"
          >
            Book at Westfield
          </a>
        ) : null}

        {showCarmel ? (
          <a
            href={href}
            data-book-loc="carmel"
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            Book at Carmel
          </a>
        ) : null}
      </div>

      {note ? <p className="mt-3 text-xs text-neutral-500">{note}</p> : null}
    </div>
  );
}

// -------------------------------
// Tox Specials (2026)
// -------------------------------
const TOX_SPECIALS = [
  {
    id: 'tox-jeuveau',
    name: 'Jeuveau\u00AE',
    tagline: 'Best Value, Natural Results',
    bookHref: '/book/tox/',
    lines: [
      'Foundation: 20 Units for $200 (after $40 off w/Evolus Rewards)',
      'Additional Units (New Patients): $6/unit',
      'Additional Units (Returning Patients): $8/unit',
    ],
  },
  {
    id: 'tox-botox',
    name: 'Botox\u00AE',
    tagline: 'Premium, Proven Results',
    bookHref: '/book/tox/',
    lines: [
      'Foundation: 20 Units for $280',
      'Additional Units (New Patients): $9/unit',
      'Additional Units (Returning Patients): $10/unit',
    ],
  },
  {
    id: 'tox-dysport',
    name: 'Dysport\u00AE',
    tagline: 'Fast-Acting, Great Coverage',
    bookHref: '/book/tox/',
    lines: [
      'Foundation: 50 Units for $225',
      'Additional Units (New Patients): $3/unit',
      'Additional Units (Returning Patients): $3.50/unit',
    ],
  },
  {
    id: 'tox-daxxify',
    name: 'Daxxify\u00AE',
    tagline: 'Longest-Lasting, Premium Tox',
    bookHref: '/book/tox/',
    lines: [
      'Foundation: 40 Units for $280',
      'Additional Units (New Patients): $4/unit',
      'Additional Units (Returning Patients): $5/unit',
    ],
  },
];

// -------------------------------
// Q1 Specials Content (Jan\u2013Mar)
// -------------------------------
const Q1_SPECIALS = [
  {
    id: 'morpheus8-reset',
    badge: 'Best Seller',
    title: 'New Year Reset with Morpheus8',
    price: '$2,700 (10% off) \u2014 3 sessions',
    finePrint:
      'Use all 3 in 2026 & get 1 maintenance session FREE in 2027 (\u2248$1,000 value). Maintenance is typically ~12 months after your 3rd session.',
    why:
      'Targets skin laxity + texture for tighter, smoother, more lifted-looking skin\u2014one of our most popular results-driven treatments. We recommend a consultation to discuss.',
    bookHref: '/book/morpheus8/',
  },
  {
    id: 'co2-winter-reset',
    badge: 'Deep Results',
    title: 'Winter Reset with CO\u2082',
    price: '$2,160 (10% off)',
    finePrint:
      'Your choice of 4 resurfacing sessions OR 1 deep CO\u2082. Use all sessions in 2026 & get 1 maintenance RESURFACING session FREE in 2027.',
    why:
      'CO\u2082 resurfacing improves tone, texture, fine lines, and sun damage. Deep CO\u2082 is our most aggressive option for advanced resurfacing needs. We recommend a consultation to discuss.',
    bookHref: '/book/co2/',
    locations: ['westfield'],
    locationNote: 'CO\u2082 is available at our Westfield location only.',
  },
  {
    id: 'ipl-tone-texture',
    badge: 'Fan Favorite',
    title: 'Tone & Texture Reset with IPL',
    price: '$800 \u2014 3 IPL sessions',
    finePrint: 'Use by 7/31/26 & get a 4th session FREE to use before 12/31/26.',
    why:
      'Kick your red + brown spots with this popular treatment for visible discoloration and uneven tone.',
    bookHref: '/book/ipl/',
  },
  {
    id: 'glo2-kickstart',
    badge: 'Instant Glow',
    title: 'Kickstart Your Glow in 2026',
    price: 'RELUXE Glo2Facial \u2014 $195',
    finePrint: 'Buy 2 more for $300 total ($150 each).',
    why:
      'One of our most popular premium facials\u2014customized to your skin, fun + relaxing (yes, the bubbles), and delivers an instant glow.',
    bookHref: '/book/glo2facial/',
  },
  {
    id: 'laser-resolution',
    badge: 'Smooth Start',
    title: 'Resolution Ready \u2014 Kick Shaving in 2026 with Laser Hair Removal',
    price: '$99 \u2014 small or standard area (limit 1 session)',
    finePrint:
      'Buy any package and get 2 maintenance sessions FREE if you complete your treatment in 2026.',
    why:
      'Start the year by kicking shaving\u2014smooth skin with less irritation and long-term convenience.',
    bookHref: '/book/laser-hair-removal/',
  },
  {
    id: 'glp1-restore',
    badge: 'Signature Program',
    title: 'Lose the Weight, Not Your Face \u2014 Our GLP-1 RESTORE Protocol',
    price: '$4,800 \u2014 6 Foundations + set pricing for customizations',
    finePrint: 'Includes 1 bonus session FREE (\u2248$800 value).',
    why:
      'A curated protocol to help facial skin keep up with GLP-1 weight loss\u2014supporting firmness + facial balance through your journey. We recommend booking a consultation first to set your plan.',
    bookHref: '/book/consult/',
  },
  {
    id: 'membership-kickoff',
    badge: 'Best Value',
    title: 'New Year. New You. \u2014 Membership Kickoff',
    price: '$50 to start any membership this quarter',
    finePrint: 'Applies to $100, $200, and Massage memberships. 12-month membership commitment.',
    why:
      'The easiest way to stay consistent, keep pricing predictable, and stack perks all year.',
    bookHref: '/memberships',
  },
];

export default function SpecialsPage({ initial }) {
  const { data } = useSWR(
    'deals',
    () => getDealsClient(),
    {
      fallbackData: initial,
      revalidateOnFocus: false,
    }
  );

  const itemList = (data || []).map((d, i) => {
    const name =
      d?.acf?.headline ||
      d?.acf?.title ||
      d?.title?.rendered?.replace(/<[^>]+>/g, '') ||
      'Promotion';
    const url = d?.acf?.cta_url || `${SITE}/specials#special-${d?.id ?? i}`;
    const price = d?.acf?.price || undefined;

    return {
      '@type': 'ListItem',
      position: i + 1,
      url,
      item: {
        '@type': 'Offer',
        name,
        url,
        price: price ?? undefined,
        availability: 'https://schema.org/InStoreOnly',
        priceCurrency: 'USD',
      },
    };
  });

  return (
    <>
      <Head>
        <title>
          {SHOW_Q1_EVENT
            ? 'Q1 2026 Specials | RELUXE Med Spa Westfield, Carmel, Indianapolis, IN'
            : `${title} | RELUXE Med Spa Westfield, Carmel, Indianapolis, IN`}
        </title>

        <meta
          name="description"
          content={
            SHOW_Q1_EVENT
              ? "Q1 2026 specials at RELUXE Med Spa\u2014skin resets, tox specials, and membership kickoff in Carmel & Westfield. Book a consultation to build your plan."
              : description
          }
        />

        <link rel="canonical" href={`${SITE}/specials`} />

        <meta key="ogimage" property="og:image" content={ogImage} />
        <meta key="ogimage:secure" property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="RELUXE Med Spa Specials" />

        <meta
          property="og:title"
          content={SHOW_Q1_EVENT ? 'Q1 2026 Specials | RELUXE Med Spa' : title}
        />
        <meta
          property="og:description"
          content={
            SHOW_Q1_EVENT
              ? "Q1 skin resets + tox specials\u2014built to help you hit your resolutions and get the best skin of your life."
              : description
          }
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/specials`} />
        <meta property="og:site_name" content="RELUXE Med Spa" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={SHOW_Q1_EVENT ? 'Q1 2026 Specials | RELUXE Med Spa' : title}
        />
        <meta
          name="twitter:description"
          content={
            SHOW_Q1_EVENT
              ? "Q1 skin resets + tox specials at RELUXE Med Spa in Carmel & Westfield."
              : description
          }
        />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="RELUXE Med Spa Specials" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: itemList,
            }),
          }}
        />
      </Head>

      <HeaderTwo />

      {SHOW_Q1_EVENT ? (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-widest uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span>Q1 2026 Specials</span>
              </div>

              <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight">
                New Year. New You.
              </h1>

              <p className="mt-4 max-w-2xl text-neutral-300 text-lg leading-relaxed">
                Start off 2026 right! We&apos;ve built our Q1 specials to help you hit your
                resolutions &amp; have the best skin of your life. Want to know where to start?
                Book a consult!
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#specials"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black"
                >
                  See Q1 Specials
                </a>

                <a
                  href={BOOK_CONSULT}
                  data-book-loc="westfield"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:bg-white/5 transition-colors"
                >
                  Book a Consult &mdash; Westfield
                </a>

                <a
                  href={BOOK_CONSULT}
                  data-book-loc="carmel"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:bg-white/5 transition-colors"
                >
                  Book a Consult &mdash; Carmel
                </a>
              </div>

              <p className="mt-6 text-sm text-neutral-400">
                Serving <strong>Westfield</strong>, <strong>Carmel</strong>, Zionsville &amp; North Indianapolis.
              </p>
            </div>
          </section>

          <main
            id="specials"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16"
          >
            {/* Tox Specials */}
            <section id="tox-specials">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-black px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                  2026 Tox Pricing
                </div>
                <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
                  Tox Specials
                </h2>
                <p className="mt-3 text-neutral-600 max-w-3xl">
                  Simple foundation pricing + the best rates on additional units so you can get to the
                  right dose (and add new areas) without feeling punished for needing more.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {TOX_SPECIALS.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-bold tracking-tight">
                      {t.name}{' '}
                      <span className="text-sm font-semibold text-neutral-500">
                        &mdash; {t.tagline}
                      </span>
                    </h3>

                    <ul className="mt-4 space-y-2.5 text-sm text-neutral-700">
                      {t.lines.map((line, idx) => (
                        <li key={idx} className="flex gap-2.5">
                          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>

                    <BookButtons href={t.bookHref || '/book/tox/'} />
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-neutral-600">
                Not sure which tox is best for you? No problem &mdash; your injector will help you decide at your appointment.
              </p>
            </section>

            {/* Q1 Specials Grid */}
            <section>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-black px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                  Q1 Specials (Jan&ndash;Mar)
                </div>
                <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
                  Skin Resets + Membership Kickoff
                </h2>
                <p className="mt-3 text-neutral-600 max-w-3xl">
                  Q1 is when we get aggressive&mdash;commit to a plan, get better results, and earn maintenance bonuses when you complete your plan in 2026.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {Q1_SPECIALS.map((d) => (
                  <div
                    key={d.id}
                    id={`special-${d.id}`}
                    className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {d.badge ? (
                      <div className="inline-flex rounded-full bg-gradient-to-r from-violet-600 to-black px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                        {d.badge}
                      </div>
                    ) : null}

                    <h3 className="mt-3 text-xl md:text-2xl font-bold tracking-tight">
                      {d.title}
                    </h3>

                    <p className="mt-3 text-lg font-semibold">{d.price}</p>

                    {d.finePrint ? (
                      <p className="mt-2 text-sm text-neutral-600">{d.finePrint}</p>
                    ) : null}

                    {d.why ? (
                      <p className="mt-4 text-sm text-neutral-600">
                        <span className="font-semibold text-neutral-800">Why it works:</span> {d.why}
                      </p>
                    ) : null}

                    <BookButtons
                      href={d.bookHref || BOOK_CONSULT}
                      locations={d.locations || ['westfield', 'carmel']}
                      note={d.locationNote}
                    />

                    <p className="mt-4 text-xs text-neutral-400">
                      Limited-time Q1 special. Terms apply.
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Optional: WP Deals Grid */}
            {SHOW_MORE_PROMOTIONS ? (
              <section>
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold tracking-tight">More Specials</h2>
                  <p className="text-sm text-neutral-600">
                    Additional specials from our live promotions feed
                  </p>
                </div>

                <div className="mt-6">
                  <DealsGrid deals={data || []} />
                </div>
              </section>
            ) : null}
          </main>
        </>
      ) : (
        <>
          {/* Default Specials Page */}
          <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-widest uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span>Current Specials</span>
              </div>
              <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight">
                Specials
              </h1>
              <p className="mt-4 max-w-2xl text-neutral-300 text-lg">
                Fresh specials curated by our team. These are limited-time&mdash;book while they last.
              </p>
            </div>
          </section>

          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <DealsGrid deals={data || []} />
          </main>
        </>
      )}
    </>
  );
}

export async function getStaticProps() {
  const initial = await getDealsSSR().catch(() => []);
  return { props: { initial } };
}
