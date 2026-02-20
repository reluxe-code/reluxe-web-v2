// src/pages/services/[slug]/[city].js
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronDown } from 'react-icons/fi';
import HeaderTwo from '@/components/header/header-2';
import { getServicesList } from '@/data/servicesList';
import { LOCATION_KEYS, getLocation } from '@/data/locations';
import { getLocationContent } from '@/data/locationContent';
import { NOT_IN_CARMEL, CARMEL_ALTERNATIVES } from '@/data/locationAvailability';
import TestimonialWidget from '@/components/testimonials/TestimonialWidget';
import { getTestimonialsSSR } from '@/lib/testimonials';

/** small helper to add/update a single query param on a (likely relative) href */
function addQuery(href = '/', key, val) {
  const [path, q = ''] = String(href).split('?');
  const sp = new URLSearchParams(q);
  sp.set(key, val);
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function getStaticPaths() {
  let services = [];
  try { services = await getServicesList(); } catch { services = []; }

  const paths = [];
  for (const s of (services || [])) {
    if (!s?.slug) continue;
    for (const city of LOCATION_KEYS) {
      paths.push({ params: { slug: s.slug, city } });
    }
  }
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const slug = params?.slug || '';
  const cityKey = params?.city || '';

  if (!slug || !cityKey || !LOCATION_KEYS.includes(cityKey)) {
    return { notFound: true };
  }

  let service = null;
  try {
    const mod = await import(`@/data/services/${slug}.js`);
    service = mod?.default || null;
  } catch {}
  if (!service) {
    try {
      const all = await getServicesList();
      service = (all || []).find(s => s.slug === slug) || null;
    } catch {}
  }
  if (!service) return { notFound: true };

  const loc = getLocation(cityKey);
  const locationContent = getLocationContent({ service, cityKey });

  const testimonials = await getTestimonialsSSR({ service: slug, location: cityKey, limit: 15 });

  return {
    props: { service, cityKey, loc, locationContent, testimonials },
    revalidate: 60 * 60,
  };
}

export default function ServiceLocationPage({ service, cityKey, loc, locationContent, testimonials = [] }) {
  const slugKey = String(service?.slug || '').toLowerCase();
  const isCarmel = cityKey === 'carmel';
  const isWestfield = cityKey === 'westfield';

  const unavailableInCarmel = isCarmel && NOT_IN_CARMEL.has(slugKey);
  const isAvailableHere = isWestfield ? true : !unavailableInCarmel;

  // Build location-aware booking/consult URLs (override via ?loc=…)
  const bookingBase = service?.bookingLink || `/book/${service.slug}`;
  const consultBase = service?.consultLink || '/book/consult';
  const targetCityForCTA = isAvailableHere ? cityKey : 'westfield';

  const bookingHref = addQuery(bookingBase, 'loc', targetCityForCTA);
  const consultHref = addQuery(consultBase, 'loc', targetCityForCTA);

  const title = `${service.name} in ${loc.city}, ${loc.state} | RELUXE Med Spa`;
  const desc =
    locationContent?.description ||
    `${service.name} in ${loc.city}, ${loc.state} at RELUXE Med Spa. Modern care, local convenience.`;

  const hero =
    service?.images?.locationHero ||
    service?.heroImage ||
    service?.gallery?.[0]?.src ||
    '/images/page-banner/skincare-header.png';

  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://reluxemedspa.com'}/services/${service.slug}/${cityKey}`;

  // Alternatives for Carmel-unavailable services
  const alternatives = isCarmel && !isAvailableHere
    ? (CARMEL_ALTERNATIVES[slugKey] || [])
    : [];

  // FAQ schema for location-specific FAQs
  const faqSchema = locationContent?.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: locationContent.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://reluxemedspa.com'}${hero}`} />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://reluxemedspa.com'}${hero}`} />
        {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      </Head>

      <HeaderTwo />

      {/* HERO */}
      <header className="relative h-72 md:h-[360px] bg-cover bg-center" style={{ backgroundImage: `url('${hero}')` }}>
        <div className="absolute inset-0 bg-black/55 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow">
            {service.name} in {loc.city}
          </h1>
          <p className="mt-3 text-gray-200 max-w-2xl">{desc}</p>
          <div className="mt-6 flex gap-3">
            {isAvailableHere ? (
              <Link
                href={bookingHref}
                data-book-loc={targetCityForCTA}
                className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold py-2 px-5 rounded-full shadow hover:bg-gray-100 transition"
              >
                Book {service.name}
              </Link>
            ) : (
              <Link
                href={`/services/${service.slug}/westfield`}
                className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold py-2 px-5 rounded-full shadow hover:bg-gray-100 transition"
              >
                View Westfield Availability
              </Link>
            )}
            <Link
              href={consultHref}
              data-book-loc={targetCityForCTA}
              className="inline-flex items-center gap-2 bg-reluxe-primary text-white font-semibold py-2 px-5 rounded-full shadow hover:opacity-90 transition"
            >
              Free Consult
            </Link>
          </div>
        </div>
      </header>

      {/* AVAILABILITY / NOTICE */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          {!isAvailableHere ? (
            <div className="rounded-2xl border p-6 bg-amber-50 border-amber-200">
              <h2 className="text-xl font-bold mb-2">Not Available in {loc.city}</h2>
              <p className="text-neutral-800">
                {service.name} is not currently offered at our {loc.city} location. We do provide it at our Westfield flagship.
              </p>

              {/* Alternative service suggestions */}
              {alternatives.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-neutral-700 mb-2">Similar services available in {loc.city}:</p>
                  <div className="flex flex-wrap gap-2">
                    {alternatives.map((alt, i) => (
                      <Link
                        key={i}
                        href={`/services/${alt.slug}/carmel`}
                        className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-4 py-1.5 text-sm font-medium hover:bg-amber-100 transition"
                      >
                        {alt.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/services/${service.slug}/westfield`} className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition">
                  {service.name} at Westfield
                </Link>
                <Link href={addQuery(bookingBase, 'loc', 'westfield')} data-book-loc="westfield" className="inline-flex items-center gap-2 border border-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition">
                  Book at Westfield
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-[2fr,1fr] gap-6 items-start">
              <div className="rounded-2xl border shadow-sm bg-white p-6">
                <h2 className="text-2xl font-bold mb-3">{service.name} — {loc.label}</h2>
                <p className="text-neutral-700">{locationContent?.description}</p>

                {!!locationContent?.differences?.length && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">What&apos;s unique about {loc.city}</h3>
                    <ul className="list-disc ml-5 space-y-1">
                      {locationContent.differences.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {!!locationContent?.localSeoBullets?.length && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Local notes</h3>
                    <ul className="list-disc ml-5 space-y-1">
                      {locationContent.localSeoBullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* INFO CARD */}
              <aside className="rounded-2xl border shadow-sm bg-gray-50 p-6">
                <div className="text-sm uppercase tracking-wide text-neutral-500">Location</div>
                <h3 className="text-lg font-bold mb-3">{loc.label}</h3>
                {loc.address && <p className="mb-2">{loc.address}</p>}
                {loc.phone && <p className="mb-2">Call/Text: <a className="underline" href={`tel:${loc.phone.replace(/\D/g,'')}`}>{loc.phone}</a></p>}
                {loc.mapUrl && (
                  <a href={loc.mapUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm underline">
                    View on Google Maps
                  </a>
                )}
                {loc.hoursNote && <p className="mt-3 text-sm text-neutral-600">{loc.hoursNote}</p>}
              </aside>
            </div>
          )}
        </div>
      </section>

      {/* COMPLEMENTARY SERVICES */}
      {!!locationContent?.complementary?.length && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Great together with {service.name}</h2>
            <div className="flex flex-wrap gap-3">
              {locationContent.complementary.map((c, i) => {
                const safeHref = addQuery(c.href || '#', 'loc', targetCityForCTA);
                const needsOverrideAttr = /^\/book(\/|$)/.test(safeHref);
                return (
                  <Link
                    key={i}
                    href={safeHref}
                    {...(needsOverrideAttr ? { 'data-book-loc': targetCityForCTA } : {})}
                    className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm hover:bg-gray-100 transition"
                  >
                    <span className="font-medium">{c.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <TestimonialWidget
          testimonials={testimonials}
          serviceName={service.name}
          heading={`${service.name} Reviews in ${loc.city || cityKey}`}
          subheading={`Real patient reviews from our ${loc.city || cityKey} location.`}
        />
      )}

      {/* LOCATION-SPECIFIC FAQs */}
      {!!locationContent?.faqs?.length && (
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">
              FAQs — {service.name} in {loc.city}
            </h2>
            <div className="space-y-3">
              {locationContent.faqs.map((faq, i) => (
                <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
                  <summary className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-violet-50 transition-colors">
                    <span className="font-medium text-gray-800 group-open:text-violet-600">
                      {faq.q}
                    </span>
                    <FiChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-open:rotate-180 group-open:text-violet-600 shrink-0 ml-3" />
                  </summary>
                  <div className="p-4 text-gray-700 bg-white">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CROSS-LINK TO OTHER CITY */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="font-semibold">Looking for {service.name} in the other city?</div>
            <div className="flex gap-3">
              {['westfield','carmel'].filter(k => k !== cityKey).map(k => (
                <Link key={k} className="rounded-full px-4 py-2 border hover:bg-gray-50" href={`/services/${service.slug}/${k}`}>
                  {k === 'westfield' ? 'Westfield page' : 'Carmel page'}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
