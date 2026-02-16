// src/pages/deals.jsx
import Head from 'next/head';
import useSWR from 'swr';
import HeaderTwo from '@/components/header/header-2';
import { getDealsSSR, getDealsClient } from '@/lib/deals';
import DealsGrid from '@/components/deals/DealsGrid';

const SITE = 'https://reluxemedspa.com';
const title = 'Monthly Promotions | RELUXE Med Spa';
const description =
  'Current promotions and monthly specials at RELUXE Med Spa—limited-time offers on injectables, skin, laser, and more.';

// Social preview image
const ogImage = `${SITE}/images/promo/deals.png`;

// -------------------------------
// Page Feature Flags
// -------------------------------
const SHOW_Q1_EVENT = true; // Q1 Event page layout (your custom specials)
const SHOW_MORE_PROMOTIONS = false; // Toggle WP “More Promotions” grid on/off

// -------------------------------
// Booking routes (your site)
// -------------------------------
const BOOK_CONSULT = '/book/consult/';

// Helper: location-aware book links with required data-book-loc attr
function BookButtons({
  href = '/book/consult/',
  locations = ['westfield', 'carmel'], // default: show both
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
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-neutral-900"
          >
            Book at Westfield
          </a>
        ) : null}

        {showCarmel ? (
          <a
            href={href}
            data-book-loc="carmel"
            className="inline-flex items-center justify-center rounded-full border border-black px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-black hover:bg-black hover:text-white"
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
// Each should route to /book/tox/
// -------------------------------
const TOX_SPECIALS = [
  {
    id: 'tox-jeuveau',
    name: 'Jeuveau®',
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
    name: 'Botox®',
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
    name: 'Dysport®',
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
    name: 'Daxxify®',
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
// Q1 Specials Content (Jan–Mar)
// - No "Ask a Question" buttons
// - Each has bookHref: /book/[service]/
// -------------------------------
const Q1_DEALS = [
  {
    id: 'morpheus8-reset',
    badge: 'Best Seller',
    title: 'New Year Reset with Morpheus8',
    price: '$2,700 (10% off) — 3 sessions',
    finePrint:
      'Use all 3 in 2026 & get 1 maintenance session FREE in 2027 (≈$1,000 value). Maintenance is typically ~12 months after your 3rd session.',
    why:
      'Targets skin laxity + texture for tighter, smoother, more lifted-looking skin—one of our most popular results-driven treatments. We recommend a consultation to discuss.',
    bookHref: '/book/morpheus8/',
  },
  {
    id: 'co2-winter-reset',
    badge: 'Deep Results',
    title: 'Winter Reset with CO₂',
    price: '$2,160 (10% off)',
    finePrint:
      'Your choice of 4 resurfacing sessions OR 1 deep CO₂. Use all sessions in 2026 & get 1 maintenance RESURFACING session FREE in 2027.',
    why:
      'CO₂ resurfacing improves tone, texture, fine lines, and sun damage. Deep CO₂ is our most aggressive option for advanced resurfacing needs. We recommend a consultation to discuss.',
    bookHref: '/book/co2/',

    // ✅ Westfield only
    locations: ['westfield'],
    locationNote: 'CO₂ is available at our Westfield location only.',
  },
  {
    id: 'ipl-tone-texture',
    badge: 'Fan Favorite',
    title: 'Tone & Texture Reset with IPL',
    price: '$800 — 3 IPL sessions',
    finePrint: 'Use by 7/31/26 & get a 4th session FREE to use before 12/31/26.',
    why:
      'Kick your red + brown spots with this popular treatment for visible discoloration and uneven tone.',
    bookHref: '/book/ipl/',
  },
  {
    id: 'glo2-kickstart',
    badge: 'Instant Glow',
    title: 'Kickstart Your Glow in 2026',
    price: 'RELUXE Glo2Facial — $195',
    finePrint: 'Buy 2 more for $300 total ($150 each).',
    why:
      'One of our most popular premium facials—customized to your skin, fun + relaxing (yes, the bubbles), and delivers an instant glow.',
    bookHref: '/book/glo2facial/',
  },
  {
    id: 'laser-resolution',
    badge: 'Smooth Start',
    title: 'Resolution Ready — Kick Shaving in 2026 with Laser Hair Removal',
    price: '$99 — small or standard area (limit 1 session)',
    finePrint:
      'Buy any package and get 2 maintenance sessions FREE if you complete your treatment in 2026.',
    why:
      'Start the year by kicking shaving—smooth skin with less irritation and long-term convenience.',
    bookHref: '/book/laser-hair-removal/',
  },
  {
    id: 'glp1-restore',
    badge: 'Signature Program',
    title: 'Lose the Weight, Not Your Face — Our GLP-1 RESTORE Protocol',
    price: '$4,800 — 6 Foundations + set pricing for customizations',
    finePrint: 'Includes 1 bonus session FREE (≈$800 value).',
    why:
      'A curated protocol to help facial skin keep up with GLP-1 weight loss—supporting firmness + facial balance through your journey. We recommend booking a consultation first to set your plan.',
    bookHref: '/book/consult/',
  },
  {
    id: 'membership-kickoff',
    badge: 'Best Value',
    title: 'New Year. New You. — Membership Kickoff',
    price: '$50 to start any membership in January',
    finePrint: 'Applies to $100, $200, and Massage memberships. 12-month membership commitment.',
    why:
      'The easiest way to stay consistent, keep pricing predictable, and stack perks all year.',
    bookHref: '/memberships',
  },
];

export default function DealsPage({ initial }) {
  const { data } = useSWR(
    'deals',
    () => getDealsClient(),
    {
      fallbackData: initial,
      revalidateOnFocus: false,
    }
  );

  // JSON-LD ItemList for promos (SEO) – generated from WP deals (still useful)
  const itemList = (data || []).map((d, i) => {
    const name =
      d?.acf?.headline ||
      d?.acf?.title ||
      d?.title?.rendered?.replace(/<[^>]+>/g, '') ||
      'Promotion';
    const url = d?.acf?.cta_url || `${SITE}/deals#deal-${d?.id ?? i}`;
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
            ? 'New Year. New You. | RELUXE Med Spa Westfield, Carmel, Indianapolis, IN'
            : `${title} | RELUXE Med Spa Westfield, Carmel, Indianapolis, IN`}
        </title>

        <meta
          name="description"
          content={
            SHOW_Q1_EVENT
              ? "Start off 2026 right with RELUXE promotions—Q1 skin resets, tox specials, and membership kickoff. Book a consultation to build your plan."
              : description
          }
        />

        {/* Canonical */}
        <link rel="canonical" href={`${SITE}/deals`} />

        {/* Social preview */}
        <meta key="ogimage" property="og:image" content={ogImage} />
        <meta key="ogimage:secure" property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="RELUXE Med Spa Promotions and Specials"
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={SHOW_Q1_EVENT ? 'New Year. New You. | RELUXE Med Spa' : title}
        />
        <meta
          property="og:description"
          content={
            SHOW_Q1_EVENT
              ? "Start off 2026 right—Q1 resets + tox specials built to help you hit your resolutions and get the best skin of your life."
              : description
          }
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/deals`} />
        <meta property="og:site_name" content="RELUXE Med Spa" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={SHOW_Q1_EVENT ? 'New Year. New You. | RELUXE Med Spa' : title}
        />
        <meta
          name="twitter:description"
          content={
            SHOW_Q1_EVENT
              ? "Q1 resets + tox specials—built to help you hit your resolutions and get the best skin of your life."
              : description
          }
        />
        <meta name="twitter:image" content={ogImage} />
        <meta
          name="twitter:image:alt"
          content="RELUXE Med Spa Promotions and Specials"
        />

        {/* ItemList of WP offers (SEO) */}
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
          <section className="bg-black text-white">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-wider">
                <span>✨</span>
                <span className="uppercase">2026 Promotions</span>
              </div>

              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
                New Year. New You.
              </h1>

              <p className="mt-3 max-w-2xl text-neutral-300">
                Start off 2026 right! We&apos;ve built our 2026 promotions to help you hit your
                resolutions &amp; have the best skin of your life. Want to know where to start?
                Book a consult!
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#deals"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black hover:bg-neutral-200"
                >
                  See our 2026 New Year Deals
                </a>

                <a
                  href={BOOK_CONSULT}
                  data-book-loc="westfield"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-white hover:text-black"
                >
                  Book a Consult — Westfield
                </a>

                <a
                  href={BOOK_CONSULT}
                  data-book-loc="carmel"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-white hover:text-black"
                >
                  Book a Consult — Carmel
                </a>
              </div>

              <p className="mt-4 text-xs text-neutral-400">
                Locations: Westfield &amp; Carmel, IN
              </p>
            </div>
          </section>

          <main
            id="deals"
            className="mx-auto max-w-6xl px-6 py-10 md:py-14 space-y-10"
          >
            {/* Tox Specials */}
            <section
              id="tox-specials"
              className="overflow-hidden rounded-3xl border border-neutral-200 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    🎁 New 2026 Pricing &amp; Deals
                  </div>
                  <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
                    Tox Specials
                  </h2>
                  <p className="mt-2 text-sm text-neutral-700 max-w-3xl">
                    Simple foundation pricing + the best rates on additional units so you can get to the
                    right dose (and add new areas) without feeling punished for needing more.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {TOX_SPECIALS.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-5"
                  >
                    <h3 className="text-lg font-bold tracking-tight">
                      {t.name}{' '}
                      <span className="text-sm font-semibold text-neutral-600">
                        — {t.tagline}
                      </span>
                    </h3>

                    <ul className="mt-3 space-y-2 text-sm text-neutral-800">
                      {t.lines.map((line, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-lg leading-5">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>

                    <BookButtons href={t.bookHref || '/book/tox/'} />
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm text-neutral-700">
                Not sure which tox is best for you? No problem — your injector will help you decide at your appointment.
              </p>
            </section>

            {/* Q1 Deals Grid */}
            <section>
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                  <div className="inline-flex rounded-full bg-black/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Q1 Specials (Jan–Mar)
                  </div>
                  <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
                    Skin Resets + Membership Kickoff
                  </h2>
                  <p className="mt-2 text-sm text-neutral-700 max-w-3xl">
                    Q1 is when we get aggressive—commit to a plan, get better results, and earn maintenance bonuses when you complete your plan in 2026.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {Q1_DEALS.map((d) => (
                  <div
                    key={d.id}
                    id={`deal-${d.id}`}
                    className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur"
                  >
                    {d.badge ? (
                      <div className="inline-flex rounded-full bg-black/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        {d.badge}
                      </div>
                    ) : null}

                    <h3 className="mt-3 text-xl md:text-2xl font-bold tracking-tight">
                      {d.title}
                    </h3>

                    <p className="mt-3 text-lg font-semibold">{d.price}</p>

                    {d.finePrint ? (
                      <p className="mt-2 text-sm text-neutral-700">{d.finePrint}</p>
                    ) : null}

                    {d.why ? (
                      <p className="mt-4 text-sm text-neutral-700">
                        <span className="font-semibold">Why it works:</span> {d.why}
                      </p>
                    ) : null}

                    {/* ✅ Westfield-only support (CO2) */}
                    <BookButtons
                      href={d.bookHref || BOOK_CONSULT}
                      locations={d.locations || ['westfield', 'carmel']}
                      note={d.locationNote}
                    />

                    <p className="mt-4 text-xs text-neutral-500">
                      Limited-time Q1 special. Terms apply.
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Optional: WP Deals Grid */}
            {SHOW_MORE_PROMOTIONS ? (
              <section className="pt-2">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold tracking-tight">More Promotions</h2>
                  <p className="text-sm text-neutral-600">
                    Additional monthly specials (from our live promotions feed)
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
          {/* Default Deals Page */}
          <section className="bg-black text-white">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-wider">
                <span>🔥</span>
                <span className="uppercase">Monthly Specials</span>
              </div>
              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
                Promotions
              </h1>
              <p className="mt-3 max-w-2xl text-neutral-300">
                Fresh specials curated by our team. These are limited-time—book while they’re hot.
              </p>
            </div>
          </section>

          <main className="mx-auto max-w-6xl px-6 py-10 md:py-14">
            <DealsGrid deals={data || []} />
          </main>
        </>
      )}
    </>
  );
}

// Revalidate every ~10 minutes
export async function getStaticProps() {
  const initial = await getDealsSSR().catch(() => []);
  return { props: { initial } };
}
