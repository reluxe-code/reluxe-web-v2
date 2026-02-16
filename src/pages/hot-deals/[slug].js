// src/pages/offers/[slug].js
import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { OFFERS, isActive, allowedAt } from '@/data/offers'
import Link from 'next/link'
import HeaderTwo from '@/components/header/header-2'

const LOCATIONS = {
  westfield: { id: 'cf34bcaa-6702-46c6-9f5f-43be8943cc58', label: 'Westfield' },
  carmel:    { id: '3ce18260-2e1f-4beb-8fcf-341bc85a682c', label: 'Carmel'    },
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
    paths: OFFERS.map(o => ({ params: { slug: o.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const offer = OFFERS.find(o => o.slug === params.slug) || null;
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

    const cfg = (window.bookingMap && slug) ? window.bookingMap[slug] : null;
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
    <>
      <Head>
        <title>{offer?.seo?.title || title} | RELUXE Med Spa Westfield & Carmel</title>
        {offer?.seo?.description && (
          <meta name="description" content={offer.seo.description} />
        )}
        {offer?.seo?.image && <meta property="og:image" content={offer.seo.image} />}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <HeaderTwo />

      {/* Hero / Above the fold */}
      <section className="relative bg-black text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 px-6 py-10">
          <div className="flex flex-col justify-center">
            {hero?.kicker && (
              <p className="text-xs uppercase tracking-wide text-white/70">
                {hero.kicker}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-semibold mt-1">
              {hero?.headline || title}
            </h1>
            {hero?.subhead && <p className="mt-3 text-white/90">{hero.subhead}</p>}
            {priceDisplay && <p className="mt-3 text-xl font-semibold">{priceDisplay}</p>}

            {/* Location selector (if both) */}
            {canPick ? (
              <div className="inline-flex mt-4 rounded-md border border-white/30 overflow-hidden">
                {['westfield', 'carmel'].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setLocationKey(k);
                      savePref(k);
                    }}
                    className={`px-3 py-2 text-sm ${
                      locationKey === k ? 'bg-white text-black' : 'bg-black text-white'
                    }`}
                  >
                    {LOCATIONS[k].label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/70">
                Available at:{' '}
                {(offer.locations || [])
                  .map((l) => l[0].toUpperCase() + l.slice(1))
                  .join(', ')}
              </p>
            )}

            <div className="mt-5">
              <button
                onClick={openBooking}
                disabled={!active}
                className={`inline-flex items-center rounded-md px-5 py-3 text-sm font-semibold transition
                  ${active ? 'bg-white text-black hover:bg-neutral-200' : 'bg-white/30 text-white/70 cursor-not-allowed'}`}
              >
                {active ? (hero?.ctaLabel || 'Book Now') : 'Offer Ended'}
              </button>
            </div>

            {/* Fine print peek on mobile */}
            <div className="mt-3 text-[11px] text-white/60 sm:hidden">
              {offer?.finePrint?.[0]}
            </div>
          </div>

          <div className="relative aspect-[4/3] md:aspect-[5/4] rounded-2xl overflow-hidden ring-1 ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImg}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Offer Overview */}
          {(offer.overview || offer.description) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-neutral-700">{offer.overview || offer.description}</p>
            </div>
          )}

          {/* Details */}
          {offer.details?.length ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">What’s included</h3>
              <ul className="list-disc pl-6 space-y-1">
                {offer.details.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Fine Print */}
          {offer.finePrint?.length ? (
            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-2">Fine Print</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600">
                {offer.finePrint.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Bottom CTA */}
          {active ? (
            <div className="flex items-center justify-center">
              <button
                onClick={openBooking}
                className="inline-flex items-center rounded-md bg-black text-white px-6 py-3 text-sm font-semibold hover:bg-neutral-800"
              >
                {hero?.ctaLabel || 'Book Now'}
              </button>
            </div>
          ) : (
            <div className="text-center text-neutral-500">
              This offer has ended. See our{' '}
              <Link href="/deals" className="underline">
                current deals
              </Link>
              .
            </div>
          )}
        </div>
      </section>
    </>
  );
}
