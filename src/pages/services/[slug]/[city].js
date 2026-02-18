// src/pages/services/[slug]/[city].js
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import HeaderTwo from '@/components/header/header-2';
import { getServicesList } from '@/data/servicesList';
import { LOCATION_KEYS, getLocation } from '@/data/locations';
import { getLocationContent } from '@/data/locationContent';

/** Services that are NOT available in Carmel (Westfield has everything) */
const NOT_IN_CARMEL = new Set([
  'hydrafacial',
  'evolvex',
  'vascupen',
  'clearskin',
  'co2',
  'salt-sauna',
  'massage',
]);

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

  return {
    props: { service, cityKey, loc, locationContent },
    revalidate: 60 * 60,
  };
}

export default function ServiceLocationPage({ service, cityKey, loc, locationContent }) {
  const slugKey = String(service?.slug || '').toLowerCase();
  const isCarmel = cityKey === 'carmel';
  const isWestfield = cityKey === 'westfield';

  const unavailableInCarmel = isCarmel && NOT_IN_CARMEL.has(slugKey);
  const isAvailableHere = isWestfield ? true : !unavailableInCarmel;

  // Build location-aware booking/consult URLs (override via ?loc=…)
  const bookingBase = service?.bookingLink || `/book/${service.slug}`;
  const consultBase = service?.consultLink || '/book/consult';
  const targetCityForCTA = isAvailableHere ? cityKey : 'westfield';

  // 👇 use the key "loc" so it’s picked up by the interceptor
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
                // 👇 ensure click-time override even if URL changes later
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
              <h2 className="text-xl font-bold mb-2">Heads up</h2>
              <p className="text-neutral-800">
                {service.name} is not currently offered in {loc.city}. We do provide it at our Westfield location.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/services/${service.slug}/westfield`} className="underline">Westfield page</Link>
                <Link href={addQuery(bookingBase, 'loc', 'westfield')} data-book-loc="westfield" className="underline">
                  Book at Westfield
                </Link>
                <Link href={addQuery(consultBase, 'loc', 'westfield')} data-book-loc="westfield" className="underline">
                  Consult (Westfield)
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-[2fr,1fr] gap-6 items-start">
              <div className="rounded-3xl border shadow-sm bg-white p-6">
                <h2 className="text-2xl font-bold mb-3">{service.name} — {loc.label}</h2>
                <p className="text-neutral-700">{locationContent?.description}</p>

                {!!locationContent?.differences?.length && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">What’s unique about {loc.city}</h3>
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
              <aside className="rounded-3xl border shadow-sm bg-gray-50 p-6">
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
                // 👇 ensure any provided link also carries ?loc=<city>
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
