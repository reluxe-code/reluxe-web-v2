// src/pages/services/[slug]/[city].js
import Link from 'next/link';
import { FiChevronDown } from 'react-icons/fi';
import BetaLayout from '@/components/beta/BetaLayout';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import { getServicesList } from '@/data/servicesList';
import { LOCATION_KEYS, getLocation } from '@/data/locations';
import { getLocationContent } from '@/data/locationContent';
import { NOT_IN_CARMEL, CARMEL_ALTERNATIVES } from '@/data/locationAvailability';
import TestimonialWidget from '@/components/testimonials/TestimonialWidget';
import { getTestimonialsSSR } from '@/lib/testimonials';
import { getServiceClient } from '@/lib/supabase';
import { transformCmsToServiceObject } from '@/lib/cmsTransform';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/** small helper to add/update a single query param on a (likely relative) href */
function addQuery(href = '/', key, val) {
  const [path, q = ''] = String(href).split('?');
  const sp = new URLSearchParams(q);
  sp.set(key, val);
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

const USE_CMS = process.env.NEXT_PUBLIC_USE_SERVICE_CMS === 'true';

export async function getStaticPaths() {
  if (USE_CMS) {
    try {
      const sb = getServiceClient();
      const { data: svcs } = await sb
        .from('cms_services')
        .select('slug')
        .eq('enabled', true);
      const paths = [];
      for (const s of svcs || []) {
        for (const city of LOCATION_KEYS) {
          paths.push({ params: { slug: s.slug, city } });
        }
      }
      return { paths, fallback: 'blocking' };
    } catch {}
  }

  const all = await getServicesList();
  const paths = [];
  for (const s of all) {
    for (const city of LOCATION_KEYS) {
      paths.push({ params: { slug: s.slug, city } });
    }
  }
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { slug, city } = params;
  const cityKey = String(city).toLowerCase();
  if (!LOCATION_KEYS.includes(cityKey)) return { notFound: true };

  let service = null;
  let locationContent = null;
  let cmsOverride = null;

  if (USE_CMS) {
    try {
      const sb = getServiceClient();
      const { data: svc } = await sb
        .from('cms_services')
        .select('*')
        .eq('slug', slug)
        .eq('enabled', true)
        .maybeSingle();

      if (svc) {
        const { data: blocks } = await sb
          .from('cms_service_blocks')
          .select('*')
          .eq('service_id', svc.id)
          .eq('enabled', true)
          .order('sort_order', { ascending: true });

        service = transformCmsToServiceObject(svc, blocks || []);

        // Fetch CMS location override
        const { data: override } = await sb
          .from('cms_location_overrides')
          .select('*')
          .eq('service_id', svc.id)
          .eq('location_key', cityKey)
          .maybeSingle();

        if (override) {
          cmsOverride = override;
          locationContent = {
            description: override.description,
            differences: override.differences || [],
            faqs: override.faqs || [],
            complementary: (override.complementary || []).map(c => ({
              href: `/services/${c.slug}`,
              label: c.label,
            })),
          };
        }
      }
    } catch {}
  }

  // File-based fallback
  if (!service) {
    try {
      const mod = await import(`@/data/services/${slug}.js`);
      service = mod?.default || null;
    } catch {}
  }
  if (!service) {
    try {
      const all = await getServicesList();
      service = (all || []).find(s => s.slug === slug) || null;
    } catch {}
  }
  if (!service) return { notFound: true };

  const loc = getLocation(cityKey);
  if (!locationContent) {
    locationContent = getLocationContent({ service, cityKey });
  }

  const testimonials = await getTestimonialsSSR({ service: slug, location: cityKey, limit: 15 });

  return {
    props: {
      service,
      cityKey,
      loc,
      locationContent,
      testimonials,
      cmsOverride: cmsOverride || null,
    },
    revalidate: 60 * 60,
  };
}

export default function ServiceLocationPage({ service, cityKey, loc, locationContent, testimonials = [], cmsOverride }) {
  const slugKey = String(service?.slug || '').toLowerCase();
  const isCarmel = cityKey === 'carmel';
  const isWestfield = cityKey === 'westfield';

  // Use CMS override for availability if available, otherwise fall back to file-based check
  const unavailableInCarmel = cmsOverride
    ? (isCarmel && cmsOverride.available === false)
    : (isCarmel && NOT_IN_CARMEL.has(slugKey));
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

  // Alternatives for unavailable services — use CMS override first, then fall back
  const alternatives = isCarmel && !isAvailableHere
    ? (cmsOverride?.alternatives?.length ? cmsOverride.alternatives : (CARMEL_ALTERNATIVES[slugKey] || []))
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
    <BetaLayout
      title={`${service.name} in ${loc.city}, ${loc.state}`}
      description={desc}
      canonical={canonical}
      structuredData={faqSchema}
    >
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        {hero && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
            <img src={hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, color: colors.white }}>
            {service.name} in{' '}
            <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {loc.city}
            </span>
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '40rem', margin: '1.5rem auto 0' }}>
            {desc}
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isAvailableHere ? (
              <Link
                href={bookingHref}
                data-book-loc={targetCityForCTA}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  borderRadius: '9999px', padding: '0.75rem 1.5rem',
                  fontFamily: fonts.body, fontWeight: 600, fontSize: '0.9375rem',
                  color: '#fff', background: gradients.primary, textDecoration: 'none',
                }}
              >
                Book {service.name}
              </Link>
            ) : (
              <Link
                href={`/services/${service.slug}/westfield`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  borderRadius: '9999px', padding: '0.75rem 1.5rem',
                  fontFamily: fonts.body, fontWeight: 600, fontSize: '0.9375rem',
                  color: '#fff', background: gradients.primary, textDecoration: 'none',
                }}
              >
                View Westfield Availability
              </Link>
            )}
            <Link
              href={consultHref}
              data-book-loc={targetCityForCTA}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                borderRadius: '9999px', padding: '0.75rem 1.5rem',
                fontFamily: fonts.body, fontWeight: 600, fontSize: '0.9375rem',
                color: 'rgba(250,248,245,0.8)', border: '1px solid rgba(250,248,245,0.12)',
                textDecoration: 'none',
              }}
            >
              Free Consult
            </Link>
          </div>
        </div>
      </section>

      {/* AVAILABILITY / NOTICE */}
      <section style={{ padding: '3rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          {!isAvailableHere ? (
            <div style={{ borderRadius: '1rem', padding: '1.5rem', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>Not Available in {loc.city}</h2>
              <p style={{ color: colors.body, fontFamily: fonts.body }}>
                {service.name} is not currently offered at our {loc.city} location. We do provide it at our Westfield flagship.
              </p>

              {alternatives.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontWeight: 600, color: colors.body, fontFamily: fonts.body, marginBottom: '0.5rem' }}>Similar services available in {loc.city}:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {alternatives.map((alt, i) => (
                      <Link
                        key={i}
                        href={`/services/${alt.slug}/carmel`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          borderRadius: '9999px', border: '1px solid rgba(245,158,11,0.3)', backgroundColor: '#fff',
                          padding: '0.375rem 1rem', fontSize: '0.875rem', fontWeight: 500, fontFamily: fonts.body,
                          color: colors.heading, textDecoration: 'none',
                        }}
                      >
                        {alt.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link
                  href={`/services/${service.slug}/westfield`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    borderRadius: '9999px', padding: '0.5rem 1.25rem',
                    fontSize: '0.875rem', fontWeight: 600, fontFamily: fonts.body,
                    color: '#fff', backgroundColor: colors.ink, textDecoration: 'none',
                  }}
                >
                  {service.name} at Westfield
                </Link>
                <Link
                  href={addQuery(bookingBase, 'loc', 'westfield')}
                  data-book-loc="westfield"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    borderRadius: '9999px', padding: '0.5rem 1.25rem',
                    fontSize: '0.875rem', fontWeight: 600, fontFamily: fonts.body,
                    color: colors.heading, border: `1px solid ${colors.ink}`, textDecoration: 'none',
                  }}
                >
                  Book at Westfield
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-[2fr,1fr] gap-6 items-start">
              <div style={{ borderRadius: '1rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading, marginBottom: '0.75rem' }}>
                  {service.name} — {loc.label}
                </h2>
                <p style={{ color: colors.body, fontFamily: fonts.body, lineHeight: 1.625 }}>{locationContent?.description}</p>

                {!!locationContent?.differences?.length && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>What&apos;s unique about {loc.city}</h3>
                    <ul style={{ listStyleType: 'disc', marginLeft: '1.25rem' }}>
                      {locationContent.differences.map((d, i) => <li key={i} style={{ color: colors.body, fontFamily: fonts.body, marginBottom: '0.25rem' }}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {!!locationContent?.localSeoBullets?.length && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>Local notes</h3>
                    <ul style={{ listStyleType: 'disc', marginLeft: '1.25rem' }}>
                      {locationContent.localSeoBullets.map((b, i) => <li key={i} style={{ color: colors.body, fontFamily: fonts.body, marginBottom: '0.25rem' }}>{b}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* INFO CARD */}
              <aside style={{ borderRadius: '1rem', border: `1px solid ${colors.stone}`, backgroundColor: colors.cream, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, fontFamily: fonts.body }}>Location</div>
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading, marginBottom: '0.75rem' }}>{loc.label}</h3>
                {loc.address && <p style={{ fontFamily: fonts.body, color: colors.body, marginBottom: '0.5rem' }}>{loc.address}</p>}
                {loc.phone && <p style={{ fontFamily: fonts.body, color: colors.body, marginBottom: '0.5rem' }}>Call/Text: <a style={{ textDecoration: 'underline', color: colors.violet }} href={`tel:${loc.phone.replace(/\D/g,'')}`}>{loc.phone}</a></p>}
                {loc.mapUrl && (
                  <a href={loc.mapUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.875rem', textDecoration: 'underline', color: colors.violet, fontFamily: fonts.body }}>
                    View on Google Maps
                  </a>
                )}
                {loc.hoursNote && <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: colors.muted, fontFamily: fonts.body }}>{loc.hoursNote}</p>}
              </aside>
            </div>
          )}
        </div>
      </section>

      {/* COMPLEMENTARY SERVICES */}
      {!!locationContent?.complementary?.length && (
        <section style={{ padding: '3rem 0', backgroundColor: colors.cream }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading, marginBottom: '1rem' }}>Great together with {service.name}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {locationContent.complementary.map((c, i) => {
                const safeHref = addQuery(c.href || '#', 'loc', targetCityForCTA);
                const needsOverrideAttr = /^\/book(\/|$)/.test(safeHref);
                return (
                  <Link
                    key={i}
                    href={safeHref}
                    {...(needsOverrideAttr ? { 'data-book-loc': targetCityForCTA } : {})}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      borderRadius: '9999px', border: `1px solid ${colors.stone}`, backgroundColor: '#fff',
                      padding: '0.5rem 1rem', fontFamily: fonts.body, fontWeight: 500,
                      color: colors.heading, textDecoration: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    {c.label}
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
        <section style={{ padding: '3rem 0' }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading, marginBottom: '1rem' }}>
              FAQs — {service.name} in {loc.city}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {locationContent.faqs.map((faq, i) => (
                <details key={i} className="group" style={{ borderRadius: '0.75rem', border: `1px solid ${colors.stone}`, overflow: 'hidden' }}>
                  <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: colors.cream, cursor: 'pointer', fontFamily: fonts.body }}>
                    <span style={{ fontWeight: 500, color: colors.heading }}>{faq.q}</span>
                    <FiChevronDown className="h-5 w-5 transition-transform duration-200 group-open:rotate-180 shrink-0 ml-3" style={{ color: colors.muted }} />
                  </summary>
                  <div style={{ padding: '1rem', color: colors.body, fontFamily: fonts.body, backgroundColor: '#fff', lineHeight: 1.625 }}>{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CROSS-LINK TO OTHER CITY */}
      <section style={{ padding: '3rem 0' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{
            borderRadius: '1rem', border: `1px solid ${colors.stone}`, padding: '1.25rem',
            backgroundColor: '#fff', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          }}>
            <span style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading }}>Looking for {service.name} in the other city?</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['westfield','carmel'].filter(k => k !== cityKey).map(k => (
                <Link
                  key={k}
                  href={`/services/${service.slug}/${k}`}
                  style={{
                    borderRadius: '9999px', padding: '0.5rem 1rem',
                    border: `1px solid ${colors.taupe}`, fontFamily: fonts.body, fontWeight: 500,
                    color: colors.heading, textDecoration: 'none', fontSize: '0.875rem',
                  }}
                >
                  {k === 'westfield' ? 'Westfield page' : 'Carmel page'}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  );
}

ServiceLocationPage.getLayout = (page) => page;
