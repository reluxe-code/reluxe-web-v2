// src/pages/specials.js
import useSWR from 'swr';
import BetaLayout from '@/components/beta/BetaLayout';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import { getDealsSSR, getDealsClient } from '@/lib/deals';
import DealsGrid from '@/components/deals/DealsGrid';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const SITE = 'https://reluxemedspa.com';

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
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {showWestfield ? (
          <a
            href={href}
            data-book-loc="westfield"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              background: gradients.primary,
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontFamily: fonts.body,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: '#fff',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            Book at Westfield
          </a>
        ) : null}

        {showCarmel ? (
          <a
            href={href}
            data-book-loc="carmel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              border: `1px solid ${colors.taupe}`,
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontFamily: fonts.body,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: colors.heading,
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
          >
            Book at Carmel
          </a>
        ) : null}
      </div>

      {note ? (
        <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontFamily: fonts.body, color: colors.muted }}>
          {note}
        </p>
      ) : null}
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
// Q1 Specials Content (Jan-Mar)
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

  const specialsTitle = SHOW_Q1_EVENT
    ? 'Q1 2026 Specials'
    : 'Quarterly Specials';

  const specialsDescription = SHOW_Q1_EVENT
    ? "Q1 2026 specials at RELUXE Med Spa\u2014skin resets, tox specials, and membership kickoff in Carmel & Westfield. Book a consultation to build your plan."
    : 'Current specials and quarterly promotions at RELUXE Med Spa\u2014limited-time offers on injectables, skin, laser, and more.';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: itemList,
  };

  return (
    <BetaLayout
      title={specialsTitle}
      description={specialsDescription}
      canonical={`${SITE}/specials`}
      structuredData={structuredData}
    >
      {SHOW_Q1_EVENT ? (
        <>
          {/* Hero */}
          <section
            className="relative"
            style={{
              backgroundColor: colors.ink,
              overflow: 'hidden',
            }}
          >
            {/* Grain overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: grain,
                backgroundRepeat: 'repeat',
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            />
            {/* Radial gradient glow */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.25,
                background: `radial-gradient(60% 60% at 50% 0%, ${colors.violet}40, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />

            <div
              className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
              style={{ paddingTop: '5rem', paddingBottom: '5rem' }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '9999px',
                  background: 'rgba(250,248,245,0.1)',
                  padding: '0.25rem 0.75rem',
                  fontFamily: fonts.body,
                  ...typeScale.label,
                  color: 'rgba(250,248,245,0.7)',
                }}
              >
                <span
                  style={{
                    height: 6,
                    width: 6,
                    borderRadius: '50%',
                    backgroundColor: colors.violet,
                    animation: 'pulse 2s infinite',
                  }}
                />
                <span>Q1 2026 Specials</span>
              </div>

              <h1
                style={{
                  marginTop: '1.25rem',
                  fontFamily: fonts.display,
                  fontSize: typeScale.hero.size,
                  fontWeight: typeScale.hero.weight,
                  lineHeight: typeScale.hero.lineHeight,
                  color: colors.white,
                }}
              >
                New Year.{' '}
                <span
                  style={{
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  New You.
                </span>
              </h1>

              <p
                style={{
                  marginTop: '1rem',
                  maxWidth: '42rem',
                  fontFamily: fonts.body,
                  fontSize: '1.125rem',
                  lineHeight: 1.6,
                  color: 'rgba(250,248,245,0.55)',
                }}
              >
                Start off 2026 right! We&apos;ve built our Q1 specials to help you hit your
                resolutions &amp; have the best skin of your life. Want to know where to start?
                Book a consult!
              </p>

              <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href="#specials"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    padding: '0.75rem 1.5rem',
                    fontFamily: fonts.body,
                    fontWeight: 600,
                    color: '#fff',
                    background: gradients.primary,
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                  }}
                >
                  See Q1 Specials
                </a>

                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>

              <p
                style={{
                  marginTop: '1.5rem',
                  fontFamily: fonts.body,
                  fontSize: '0.875rem',
                  color: 'rgba(250,248,245,0.4)',
                }}
              >
                Serving <strong>Westfield</strong>, <strong>Carmel</strong>, Zionsville &amp; North Indianapolis.
              </p>
            </div>
          </section>

          <main
            id="specials"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            style={{ paddingTop: '4rem', paddingBottom: '4rem' }}
          >
            {/* Tox Specials */}
            <section id="tox-specials">
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '9999px',
                    background: gradients.primary,
                    padding: '0.375rem 1rem',
                    fontFamily: fonts.body,
                    ...typeScale.label,
                    color: '#fff',
                  }}
                >
                  2026 Tox Pricing
                </div>
                <h2
                  style={{
                    marginTop: '1rem',
                    fontFamily: fonts.display,
                    fontSize: typeScale.sectionHeading.size,
                    fontWeight: typeScale.sectionHeading.weight,
                    lineHeight: typeScale.sectionHeading.lineHeight,
                    color: colors.heading,
                  }}
                >
                  Tox Specials
                </h2>
                <p
                  style={{
                    marginTop: '0.75rem',
                    fontFamily: fonts.body,
                    fontSize: typeScale.body.size,
                    lineHeight: typeScale.body.lineHeight,
                    color: colors.body,
                    maxWidth: '48rem',
                  }}
                >
                  Simple foundation pricing + the best rates on additional units so you can get to the
                  right dose (and add new areas) without feeling punished for needing more.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {TOX_SPECIALS.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      borderRadius: '1.5rem',
                      border: `1px solid ${colors.taupe}`,
                      backgroundColor: '#fff',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: fonts.display,
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: colors.heading,
                      }}
                    >
                      {t.name}{' '}
                      <span
                        style={{
                          fontFamily: fonts.body,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: colors.muted,
                        }}
                      >
                        &mdash; {t.tagline}
                      </span>
                    </h3>

                    <ul style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {t.lines.map((line, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            gap: '0.625rem',
                            fontFamily: fonts.body,
                            fontSize: '0.875rem',
                            color: colors.body,
                            listStyle: 'none',
                          }}
                        >
                          <span
                            style={{
                              marginTop: '0.35rem',
                              height: 6,
                              width: 6,
                              flexShrink: 0,
                              borderRadius: '50%',
                              backgroundColor: colors.violet,
                            }}
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>

                    <BookButtons href={t.bookHref || '/book/tox/'} />
                  </div>
                ))}
              </div>

              <p
                style={{
                  marginTop: '1.5rem',
                  fontFamily: fonts.body,
                  fontSize: '0.875rem',
                  color: colors.body,
                }}
              >
                Not sure which tox is best for you? No problem &mdash; your injector will help you decide at your appointment.
              </p>
            </section>

            {/* Q1 Specials Grid */}
            <section style={{ marginTop: '4rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '9999px',
                    background: gradients.primary,
                    padding: '0.375rem 1rem',
                    fontFamily: fonts.body,
                    ...typeScale.label,
                    color: '#fff',
                  }}
                >
                  Q1 Specials (Jan&ndash;Mar)
                </div>
                <h2
                  style={{
                    marginTop: '1rem',
                    fontFamily: fonts.display,
                    fontSize: typeScale.sectionHeading.size,
                    fontWeight: typeScale.sectionHeading.weight,
                    lineHeight: typeScale.sectionHeading.lineHeight,
                    color: colors.heading,
                  }}
                >
                  Skin Resets + Membership Kickoff
                </h2>
                <p
                  style={{
                    marginTop: '0.75rem',
                    fontFamily: fonts.body,
                    fontSize: typeScale.body.size,
                    lineHeight: typeScale.body.lineHeight,
                    color: colors.body,
                    maxWidth: '48rem',
                  }}
                >
                  Q1 is when we get aggressive&mdash;commit to a plan, get better results, and earn maintenance bonuses when you complete your plan in 2026.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {Q1_SPECIALS.map((d) => (
                  <div
                    key={d.id}
                    id={`special-${d.id}`}
                    style={{
                      borderRadius: '1.5rem',
                      border: `1px solid ${colors.taupe}`,
                      backgroundColor: '#fff',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    {d.badge ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          borderRadius: '9999px',
                          background: gradients.primary,
                          padding: '0.25rem 0.75rem',
                          fontFamily: fonts.body,
                          ...typeScale.label,
                          color: '#fff',
                        }}
                      >
                        {d.badge}
                      </div>
                    ) : null}

                    <h3
                      style={{
                        marginTop: '0.75rem',
                        fontFamily: fonts.display,
                        fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                        fontWeight: 700,
                        color: colors.heading,
                      }}
                    >
                      {d.title}
                    </h3>

                    <p
                      style={{
                        marginTop: '0.75rem',
                        fontFamily: fonts.body,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: colors.heading,
                      }}
                    >
                      {d.price}
                    </p>

                    {d.finePrint ? (
                      <p
                        style={{
                          marginTop: '0.5rem',
                          fontFamily: fonts.body,
                          fontSize: '0.875rem',
                          color: colors.body,
                        }}
                      >
                        {d.finePrint}
                      </p>
                    ) : null}

                    {d.why ? (
                      <p
                        style={{
                          marginTop: '1rem',
                          fontFamily: fonts.body,
                          fontSize: '0.875rem',
                          color: colors.body,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: colors.heading }}>Why it works:</span> {d.why}
                      </p>
                    ) : null}

                    <BookButtons
                      href={d.bookHref || BOOK_CONSULT}
                      locations={d.locations || ['westfield', 'carmel']}
                      note={d.locationNote}
                    />

                    <p
                      style={{
                        marginTop: '1rem',
                        fontFamily: fonts.body,
                        fontSize: '0.75rem',
                        color: colors.muted,
                      }}
                    >
                      Limited-time Q1 special. Terms apply.
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Optional: WP Deals Grid */}
            {SHOW_MORE_PROMOTIONS ? (
              <section style={{ marginTop: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <h2
                    style={{
                      fontFamily: fonts.display,
                      fontSize: typeScale.subhead.size,
                      fontWeight: typeScale.subhead.weight,
                      color: colors.heading,
                    }}
                  >
                    More Specials
                  </h2>
                  <p
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.875rem',
                      color: colors.body,
                    }}
                  >
                    Additional specials from our live promotions feed
                  </p>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <DealsGrid deals={data || []} />
                </div>
              </section>
            ) : null}
          </main>
        </>
      ) : (
        <>
          {/* Default Specials Page */}
          <section
            className="relative"
            style={{
              backgroundColor: colors.ink,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: grain,
                backgroundRepeat: 'repeat',
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.25,
                background: `radial-gradient(60% 60% at 50% 0%, ${colors.violet}40, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
            <div
              className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
              style={{ paddingTop: '5rem', paddingBottom: '7rem' }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '9999px',
                  background: 'rgba(250,248,245,0.1)',
                  padding: '0.25rem 0.75rem',
                  fontFamily: fonts.body,
                  ...typeScale.label,
                  color: 'rgba(250,248,245,0.7)',
                }}
              >
                <span
                  style={{
                    height: 6,
                    width: 6,
                    borderRadius: '50%',
                    backgroundColor: colors.violet,
                    animation: 'pulse 2s infinite',
                  }}
                />
                <span>Current Specials</span>
              </div>
              <h1
                style={{
                  marginTop: '1.25rem',
                  fontFamily: fonts.display,
                  fontSize: typeScale.hero.size,
                  fontWeight: typeScale.hero.weight,
                  lineHeight: typeScale.hero.lineHeight,
                  color: colors.white,
                }}
              >
                Specials
              </h1>
              <p
                style={{
                  marginTop: '1rem',
                  maxWidth: '42rem',
                  fontFamily: fonts.body,
                  fontSize: '1.125rem',
                  lineHeight: 1.6,
                  color: 'rgba(250,248,245,0.55)',
                }}
              >
                Fresh specials curated by our team. These are limited-time&mdash;book while they last.
              </p>
            </div>
          </section>

          <main
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            style={{ paddingTop: '4rem', paddingBottom: '4rem' }}
          >
            <DealsGrid deals={data || []} />
          </main>
        </>
      )}
    </BetaLayout>
  );
}

SpecialsPage.getLayout = (page) => page;

export async function getStaticProps() {
  const initial = await getDealsSSR().catch(() => []);
  return { props: { initial } };
}
