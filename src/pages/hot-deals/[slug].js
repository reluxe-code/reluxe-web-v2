// src/pages/hot-deals/[slug].js
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BetaLayout from '@/components/beta/BetaLayout';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import { OFFERS, isActive, allowedAt } from '@/data/offers';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const LOCATIONS = {
  westfield: { id: 'cf34bcaa-6702-46c6-9f5f-43be8943cc58', label: 'Westfield' },
  carmel: { id: '3ce18260-2e1f-4beb-8fcf-341bc85a682c', label: 'Carmel' },
};

// --- Inline, SSR-safe replacement for useLocationPref ---
function useLocationPref() {
  const [locationKey, setLocationKey] = useState('westfield');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const v = window.localStorage.getItem('reluxe:location');
      if (v && (v === 'westfield' || v === 'carmel')) setLocationKey(v);
    } catch {}
  }, []);

  const save = (v) => {
    setLocationKey(v);
    if (typeof window === 'undefined') return;
    try {
      if (v) window.localStorage.setItem('reluxe:location', v);
      else window.localStorage.removeItem('reluxe:location');
    } catch {}
  };

  return { locationKey, setLocationKey: save };
}

export async function getStaticPaths() {
  return {
    paths: OFFERS.map((o) => ({ params: { slug: o.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const offer = OFFERS.find((o) => o.slug === params.slug) || null;
  if (!offer) return { notFound: true };
  return { props: { offer }, revalidate: 300 };
}

export default function OfferPage({ offer }) {
  const now = new Date();
  const active = isActive(offer, now);

  // location preference (client only)
  const { locationKey: pref, setLocationKey: savePref } = useLocationPref();
  const [locationKey, setLocationKey] = useState('westfield');

  useEffect(() => {
    if (pref && allowedAt(offer, pref)) setLocationKey(pref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pref]);

  const canPick = (offer.locations || []).includes('both');
  const locationId = LOCATIONS[locationKey]?.id;

  const priceDisplay =
    offer?.price?.display ||
    (offer?.price?.amount ? `$${offer.price.amount}` : '');

  // JSON-LD for SEO
  const jsonLd = useMemo(() => {
    if (offer?.price?.amount) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Offer',
        name: offer.title,
        price: offer.price.amount,
        priceCurrency: offer.price.currency || 'USD',
        availabilityStarts: offer?.schedule?.start || undefined,
        availabilityEnds: offer?.schedule?.end || undefined,
        url: `https://reluxemedspa.com/offers/${offer.slug}`,
      };
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: offer.title,
      description: offer?.seo?.description || offer.overview,
      url: `https://reluxemedspa.com/offers/${offer.slug}`,
    };
  }, [offer]);

  function openBooking() {
    // Prefer direct BLVD widget with location override
    const slug = offer?.hero?.bookSlug || '';
    const bookUrl = offer?.hero?.bookUrl || '';
    const selectedAllowed = allowedAt(offer, locationKey);

    // analytics (best-effort)
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'offer_cta_click',
        offer_slug: offer.slug,
        location: locationKey,
      });
    } catch {}

    if (!active) {
      window.location.href = '/contact';
      return;
    }

    if (!selectedAllowed) {
      alert('This offer is not available at that location.');
      return;
    }

    if (bookUrl) {
      window.location.href = bookUrl;
      return;
    }

    const cfg = window.bookingMap && slug ? window.bookingMap[slug] : null;
    const params = { locationId, visitType: 'SELF_VISIT' };
    if (cfg?.path) params.path = cfg.path;

    if (window.blvd?.openBookingWidget) {
      window.blvd.openBookingWidget({ urlParams: params });
      return;
    }

    window.location.href = slug ? `/book/${slug}` : '/book';
  }

  const hero = offer?.hero || {};
  const heroImg =
    hero.image || offer?.image || '/images/page-banner/skincare-header.png';
  const title = offer?.title || hero?.headline || 'Special Offer';

  return (
    <BetaLayout
      title={offer?.seo?.title || title}
      description={offer?.seo?.description || offer.overview || ''}
      canonical={`https://reluxemedspa.com/hot-deals/${offer.slug}`}
      structuredData={jsonLd}
    >
      {/* Hero / Above the fold */}
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
            opacity: 0.2,
            background: `radial-gradient(60% 60% at 50% 0%, ${colors.violet}40, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-6 px-6"
          style={{ paddingTop: '3rem', paddingBottom: '3rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {hero?.kicker && (
              <p
                style={{
                  fontFamily: fonts.body,
                  ...typeScale.label,
                  color: 'rgba(250,248,245,0.5)',
                }}
              >
                {hero.kicker}
              </p>
            )}
            <h1
              style={{
                fontFamily: fonts.display,
                fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
                fontWeight: 600,
                color: colors.white,
                marginTop: hero?.kicker ? '0.25rem' : 0,
              }}
            >
              {hero?.headline || title}
            </h1>
            {hero?.subhead && (
              <p
                style={{
                  marginTop: '0.75rem',
                  fontFamily: fonts.body,
                  fontSize: typeScale.body.size,
                  lineHeight: typeScale.body.lineHeight,
                  color: 'rgba(250,248,245,0.75)',
                }}
              >
                {hero.subhead}
              </p>
            )}
            {priceDisplay && (
              <p
                style={{
                  marginTop: '0.75rem',
                  fontFamily: fonts.display,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: colors.white,
                }}
              >
                {priceDisplay}
              </p>
            )}

            {/* Location selector (if both) */}
            {canPick ? (
              <div
                style={{
                  display: 'inline-flex',
                  marginTop: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(250,248,245,0.2)',
                  overflow: 'hidden',
                }}
              >
                {['westfield', 'carmel'].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setLocationKey(k);
                      savePref(k);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontFamily: fonts.body,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: locationKey === k ? '#fff' : 'transparent',
                      color: locationKey === k ? colors.ink : '#fff',
                      transition: 'background-color 0.2s, color 0.2s',
                    }}
                  >
                    {LOCATIONS[k].label}
                  </button>
                ))}
              </div>
            ) : (
              <p
                style={{
                  marginTop: '0.75rem',
                  fontFamily: fonts.body,
                  fontSize: '0.75rem',
                  color: 'rgba(250,248,245,0.5)',
                }}
              >
                Available at:{' '}
                {(offer.locations || [])
                  .map((l) => l[0].toUpperCase() + l.slice(1))
                  .join(', ')}
              </p>
            )}

            <div style={{ marginTop: '1.25rem' }}>
              <button
                onClick={openBooking}
                disabled={!active}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  padding: '0.75rem 1.5rem',
                  fontFamily: fonts.body,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: active ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s',
                  ...(active
                    ? { background: gradients.primary, color: '#fff' }
                    : { backgroundColor: 'rgba(250,248,245,0.2)', color: 'rgba(250,248,245,0.5)' }),
                }}
              >
                {active ? (hero?.ctaLabel || 'Book Now') : 'Offer Ended'}
              </button>
            </div>

            {/* Fine print peek on mobile */}
            <div className="sm:hidden" style={{ marginTop: '0.75rem', fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)' }}>
              {offer?.finePrint?.[0]}
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              aspectRatio: '4/3',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '1px solid rgba(250,248,245,0.08)',
            }}
            className="md:aspect-[5/4]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImg}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <section style={{ backgroundColor: colors.cream }}>
        <div
          className="max-w-5xl mx-auto px-6"
          style={{ paddingTop: '3rem', paddingBottom: '3rem' }}
        >
          {/* Offer Overview */}
          {(offer.overview || offer.description) && (
            <div style={{ marginBottom: '2rem' }}>
              <h2
                style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.subhead.size,
                  fontWeight: 600,
                  color: colors.heading,
                  marginBottom: '0.5rem',
                }}
              >
                Overview
              </h2>
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: typeScale.body.size,
                  lineHeight: typeScale.body.lineHeight,
                  color: colors.body,
                }}
              >
                {offer.overview || offer.description}
              </p>
            </div>
          )}

          {/* Details */}
          {offer.details?.length ? (
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontFamily: fonts.display,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: colors.heading,
                  marginBottom: '0.5rem',
                }}
              >
                What&apos;s included
              </h3>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {offer.details.map((li, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: fonts.body,
                      fontSize: typeScale.body.size,
                      lineHeight: typeScale.body.lineHeight,
                      color: colors.body,
                    }}
                  >
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Fine Print */}
          {offer.finePrint?.length ? (
            <div style={{ marginBottom: '2.5rem' }}>
              <h3
                style={{
                  fontFamily: fonts.display,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: colors.heading,
                  marginBottom: '0.5rem',
                }}
              >
                Fine Print
              </h3>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {offer.finePrint.map((li, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: fonts.body,
                      fontSize: typeScale.caption.size,
                      lineHeight: typeScale.caption.lineHeight,
                      color: colors.muted,
                    }}
                  >
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Bottom CTA */}
          {active ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                onClick={openBooking}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  background: gradients.primary,
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  fontFamily: fonts.body,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                {hero?.ctaLabel || 'Book Now'}
              </button>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                color: colors.muted,
              }}
            >
              This offer has ended. See our{' '}
              <Link
                href="/hot-deals"
                style={{ textDecoration: 'underline', color: colors.violet }}
              >
                current deals
              </Link>
              .
            </div>
          )}
        </div>
      </section>
    </BetaLayout>
  );
}

OfferPage.getLayout = (page) => page;
