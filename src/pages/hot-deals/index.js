// src/pages/hot-deals/index.js
import Link from 'next/link';
import BetaLayout from '@/components/beta/BetaLayout';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import { OFFERS, isActive } from '@/data/offers';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

// Build-time filter + serialization (avoid leaking functions/dates)
export async function getStaticProps() {
  const now = new Date();
  let live = [];
  try {
    const all = Array.isArray(OFFERS) ? OFFERS : [];
    live = all
      .filter((o) => {
        try {
          return isActive(o, now);
        } catch {
          return false;
        }
      })
      .map((o) => ({
        slug: o.slug || '',
        title: o.title || '',
        shortTitle: o.shortTitle || '',
        overview: o.overview || '',
        locations: Array.isArray(o.locations) ? o.locations : [],
        hero: {
          image: o?.hero?.image || o?.image || '/images/page-banner/skincare-header.png',
          headline: o?.hero?.headline || o.title || '',
          subhead: o?.hero?.subhead || '',
        },
      }))
      .filter((o) => o.slug); // only routable
  } catch (e) {
    // swallow errors so build doesn't crash hard; page renders "no offers"
    live = [];
  }

  return {
    props: { live },
    revalidate: 300, // refresh list periodically
  };
}

export default function OffersIndex({ live = [] }) {
  return (
    <BetaLayout
      title="Med Spa Offers & Specials"
      description="Current offers and specials at RELUXE Med Spa. Save on Botox, facials, laser treatments, body contouring & more in Carmel and Westfield, Indiana."
      canonical="https://reluxemedspa.com/hot-deals"
    >
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
          className="relative mx-auto max-w-6xl px-6"
          style={{ paddingTop: '5rem', paddingBottom: '5rem' }}
        >
          <p
            style={{
              fontFamily: fonts.body,
              ...typeScale.label,
              color: colors.violet,
              marginBottom: '1rem',
            }}
          >
            Limited-Time Offers
          </p>
          <h1
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.hero.size,
              fontWeight: typeScale.hero.weight,
              lineHeight: typeScale.hero.lineHeight,
              color: colors.white,
            }}
          >
            Current{' '}
            <span
              style={{
                background: gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Offers
            </span>
          </h1>
          <p
            style={{
              marginTop: '1rem',
              maxWidth: '36rem',
              fontFamily: fonts.body,
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: 'rgba(250,248,245,0.55)',
            }}
          >
            Save on Botox, facials, laser treatments, body contouring &amp; more at our Carmel and Westfield locations.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section style={{ backgroundColor: colors.cream }}>
        <div
          className="max-w-6xl mx-auto px-6"
          style={{ paddingTop: '3rem', paddingBottom: '4rem' }}
        >
          {live.length === 0 ? (
            <div
              style={{
                borderRadius: '1rem',
                border: `1px solid ${colors.taupe}`,
                padding: '1.5rem',
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                color: colors.body,
              }}
            >
              No active offers right now. Check back soon, or see our{' '}
              <Link
                href="/services"
                style={{ textDecoration: 'underline', color: colors.violet }}
              >
                services
              </Link>
              .
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {live.map((o) => (
                <Link
                  key={o.slug}
                  href={`/hot-deals/${o.slug}`}
                  style={{
                    display: 'block',
                    borderRadius: '1rem',
                    border: `1px solid ${colors.taupe}`,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    transition: 'box-shadow 0.2s',
                    backgroundColor: '#fff',
                  }}
                  className="group hover:shadow-lg"
                >
                  <div style={{ aspectRatio: '4/3', backgroundColor: colors.stone }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={o.hero.image}
                      alt={o.title || 'Offer'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div
                      style={{
                        fontFamily: fonts.body,
                        fontSize: typeScale.caption.size,
                        color: colors.muted,
                      }}
                    >
                      {o.shortTitle || o.title}
                    </div>
                    <div
                      style={{
                        fontFamily: fonts.display,
                        fontWeight: 600,
                        color: colors.heading,
                        marginTop: '0.125rem',
                      }}
                    >
                      {o.hero.headline || o.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </BetaLayout>
  );
}

OffersIndex.getLayout = (page) => page;
