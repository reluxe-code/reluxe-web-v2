import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { getServiceClient } from '@/lib/supabase';
import { toWPStaffShape } from '@/lib/staff-helpers';
import { getTestimonialsSSR } from '@/lib/testimonials';
import GravityBookButton from '@/components/beta/GravityBookButton';
import ProviderAvailabilityPicker from '@/components/booking/ProviderAvailabilityPicker';
import ScarcityBadge from '@/components/booking/ScarcityBadge';
import { getBundlesForProvider } from '@/data/treatmentBundles';
import { categorizeProvider } from '@/lib/provider-roles';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const privacyName = (n) => {
  if (!n) return 'Patient';
  return n.includes(' ') ? n.split(' ')[0] + ' ' + n.split(' ').pop()[0] + '.' : n;
};

/* ─── specialty → service slug mapping ─── */
const SPECIALTY_MAP = [
  { key: /tox|botox|jeuveau|xeomin|dysport/i, title: 'Tox', slug: 'tox' },
  { key: /filler|lip|facial balanc/i, title: 'Dermal Fillers', slug: 'filler' },
  { key: /sculptra/i, title: 'Sculptra', slug: 'sculptra' },
  { key: /morpheus/i, title: 'Morpheus8', slug: 'morpheus8' },
  { key: /skinpen|microneed/i, title: 'Microneedling', slug: 'microneedling' },
  { key: /ipl|photofacial/i, title: 'IPL Photofacial', slug: 'ipl' },
  { key: /laser hair/i, title: 'Laser Hair Removal', slug: 'laser-hair-removal' },
  { key: /hydrafacial/i, title: 'HydraFacial', slug: 'hydrafacial' },
  { key: /glo2/i, title: 'Glo2Facial', slug: 'glo2facial' },
  { key: /facial|peel/i, title: 'Facials & Peels', slug: 'facials' },
  { key: /massage/i, title: 'Massage', slug: 'massage' },
];

function specialtyToServices(specialties = []) {
  const seen = new Set();
  const items = [];
  specialties.forEach(sObj => {
    const name = (sObj?.specialty || '').trim();
    if (!name) return;
    const match = SPECIALTY_MAP.find(m => m.key.test(name));
    if (match && !seen.has(match.slug)) {
      seen.add(match.slug);
      items.push(match);
    }
  });
  return items;
}

/* ─── page ─── */
function ProviderDetailPage({ fontKey, fonts, person, testimonials }) {
  const router = useRouter();
  const { service: qService, category: qCategory, date: qDate } = router.query;
  const f = person?.staffFields || {};
  const name = person?.name || person?.title || '';
  const firstName = name.split(/\s/)[0];
  const role = f?.staffTitle || f?.stafftitle || f?.role || '';
  const bio = f?.staffBio || '';
  const funFact = f?.stafffunfact || null;
  const bookingUrl = f?.staffbookingurl || null;

  const transparentBgUrl = f?.transparentbg?.sourceUrl || f?.transparentbg?.mediaItemUrl || null;
  const featuredUrl = person?.featuredImage?.node?.sourceUrl || null;
  const heroImg = transparentBgUrl || featuredUrl;

  const specialties = f?.specialties || [];
  const credentials = f?.credentials || [];
  const availability = f?.availability || [];
  const locations = (f?.location || []);
  const locationNames = locations.map(l => l?.title || l?.slug || '').filter(Boolean);

  const brandItems = specialtyToServices(specialties);
  const locFlags = {};
  locations.forEach(l => {
    const s = String(l?.slug || l?.title || '').toLowerCase();
    if (s.includes('carmel')) locFlags.carmel = true;
    if (s.includes('westfield')) locFlags.westfield = true;
  });

  // Boulevard booking data
  const boulevardProviderId = person?.boulevardProviderId || null;
  const boulevardServiceMap = person?.boulevardServiceMap || {};
  const pickerLocations = [];
  if (locFlags.westfield) pickerLocations.push({ key: 'westfield', label: 'Westfield' });
  if (locFlags.carmel) pickerLocations.push({ key: 'carmel', label: 'Carmel' });

  const hasPicker = brandItems.length > 0 && boulevardProviderId;

  // Treatment bundles: filter global defaults by this provider's capabilities + role
  const providerRole = categorizeProvider(person);
  const treatmentBundles = boulevardProviderId
    ? getBundlesForProvider(
        boulevardServiceMap,
        pickerLocations.length === 1 ? pickerLocations[0].key : 'any',
        pickerLocations,
        person?.treatmentBundles ?? null,
        person?._globalBundles ?? null,
        providerRole
      )
    : [];

  return (
    <>
      {/* ─── Compact Hero ─── */}
      <section className="relative" style={{ backgroundColor: colors.ink, paddingTop: 80, paddingBottom: 0 }}>
        <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '45%', height: '80%', background: `radial-gradient(ellipse, ${colors.violet}10, transparent 65%)`, pointerEvents: 'none' }} />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-end">
            {/* Text — compact */}
            <motion.div className="lg:col-span-3 pb-8 lg:pb-10" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <a href="/beta/team" className="inline-flex items-center gap-1.5 mb-3 transition-colors duration-200" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(250,248,245,0.4)', textDecoration: 'none' }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                All Team
              </a>
              <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.1, color: colors.white, marginBottom: '0.375rem' }}>
                {name}
              </h1>
              {role && (
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 500, color: colors.violet, marginBottom: '0.5rem' }}>{role}</p>
              )}
              {locationNames.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {locationNames.map(l => (
                    <span key={l} className="rounded-full px-2.5 py-0.5" style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 500, color: 'rgba(250,248,245,0.6)', background: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.1)' }}>{l}</span>
                  ))}
                </div>
              )}
              {!hasPicker && (
                <div className="flex flex-wrap items-center gap-3">
                  <GravityBookButton fontKey={fontKey} size="hero" />
                </div>
              )}
            </motion.div>

            {/* Hero image — right side, compact */}
            {heroImg && (
              <motion.div className="lg:col-span-2 hidden lg:block" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <div className="rounded-t-2xl overflow-hidden" style={{ maxHeight: 320 }}>
                  <img src={heroImg} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Featured Booking Picker ─── */}
      {hasPicker && (
        <section style={{ backgroundColor: colors.cream }}>
          <div className="max-w-6xl mx-auto px-6 py-8 lg:py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              {/* Picker + sidebar grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main picker — takes 2/3 on desktop, full on mobile */}
                <div className="lg:col-span-2">
                  <ProviderAvailabilityPicker
                    providerName={name}
                    boulevardProviderId={boulevardProviderId}
                    specialties={brandItems}
                    locations={pickerLocations}
                    boulevardServiceMap={boulevardServiceMap}
                    fontKey={fontKey}
                    fonts={fonts}
                    initialService={qService}
                    initialCategory={qCategory}
                    initialDate={qDate}
                    treatmentBundles={treatmentBundles}
                  />
                </div>

                {/* Right column — specialties + scarcity */}
                <div className="space-y-3">
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.25rem' }}>
                    {firstName}&rsquo;s Services
                  </p>
                  {brandItems.map((item, i) => (
                    <motion.a
                      key={item.slug}
                      href={`/beta/services/${item.slug}`}
                      className="flex items-center justify-between rounded-xl p-4 group transition-all duration-200"
                      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, textDecoration: 'none' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
                      whileHover={{ y: -2 }}
                    >
                      <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>
                        {item.title}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
                        <path d="M6 12L10 8L6 4" stroke={colors.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.a>
                  ))}

                  {boulevardProviderId && pickerLocations[0] && (
                    <motion.div
                      className="rounded-xl p-4"
                      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <ScarcityBadge
                        locationKey={pickerLocations[0].key}
                        staffProviderId={boulevardProviderId}
                        variant="sidebar"
                        fonts={fonts}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Mobile Image (below picker on mobile) ─── */}
      {heroImg && (
        <div className="lg:hidden" style={{ backgroundColor: '#fff' }}>
          <div className="max-w-sm mx-auto px-6 py-6">
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <img src={heroImg} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Bio + Details ─── */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Bio */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>About</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, color: colors.heading, marginBottom: '1rem' }}>
                  Meet {firstName}
                </h2>
                {bio && (
                  <div style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body }} dangerouslySetInnerHTML={{ __html: bio }} />
                )}
                {funFact && (
                  <div className="mt-6 rounded-xl p-5" style={{ borderLeft: `3px solid ${colors.violet}`, backgroundColor: colors.cream }}>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>Fun Fact</p>
                    <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>{funFact}</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {specialties.length > 0 && (
                <motion.div className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                  <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Specialties</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {specialties.map((s, i) => (
                      <span key={i} className="rounded-full px-2.5 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.violet, background: `${colors.violet}08`, border: `1px solid ${colors.violet}15` }}>
                        {s?.specialty || s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {credentials.length > 0 && (
                <motion.div className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.06 }}>
                  <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Credentials</h3>
                  <ul className="space-y-1.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {credentials.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginTop: 2, flexShrink: 0 }}><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke={colors.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body }}>{c?.credentialItem || c}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {availability.length > 0 && (
                <motion.div className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.12 }}>
                  <h3 style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.muted, marginBottom: '0.75rem' }}>Availability</h3>
                  {availability.filter(a => a?.day && a?.hours).map((a, i) => (
                    <div key={i} className="flex justify-between mb-1.5">
                      <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body }}>{a.day}</span>
                      <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.heading }}>{a.hours}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      {testimonials.length > 0 && (
        <section style={{ backgroundColor: colors.cream }}>
          <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
            <motion.div className="mb-8" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Patient Love</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, color: colors.heading }}>
                What Patients Say About {firstName}
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.slice(0, 6).map((t, i) => (
                <motion.div key={t.id || i} className="rounded-2xl p-6" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t.rating || 5)].map((_, j) => (
                      <span key={j} style={{ color: colors.violet, fontSize: '0.875rem' }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
                    &ldquo;{(t.quote || '').length > 200 ? t.quote.slice(0, 200) + '...' : t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${colors.stone}` }}>
                    <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: `${colors.violet}10` }}>
                      <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet }}>{(t.author_name || '?')[0]}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>{privacyName(t.author_name)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Intro */}
      {f?.videoIntro && (
        <section style={{ backgroundColor: '#fff' }}>
          <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
            <motion.div className="mb-6" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, color: colors.heading }}>Meet {firstName}</h2>
            </motion.div>
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <iframe src={f.videoIntro} title={`Video intro by ${name}`} frameBorder="0" allowFullScreen style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-12 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
            Ready to See {firstName}?
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
            Book your appointment and experience the RELUXE difference.
          </p>
          <div className="flex justify-center">
            <GravityBookButton fontKey={fontKey} size="hero" />
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── wrapper + data ─── */

export default function BetaTeamSlug({ person, testimonials }) {
  const name = person?.name || person?.title || 'Provider';
  const role = person?.staffFields?.staffTitle || person?.staffFields?.stafftitle || person?.staffFields?.role || '';
  return (
    <BetaLayout
      title={`${name}${role ? `, ${role}` : ''}`}
      description={`Meet ${name} at RELUXE Med Spa. ${role ? role + '. ' : ''}Book your appointment today.`}
    >
      {({ fontKey, fonts }) => (
        <ProviderDetailPage fontKey={fontKey} fonts={fonts} person={person} testimonials={testimonials} />
      )}
    </BetaLayout>
  );
}

export async function getStaticPaths() {
  const sb = getServiceClient();
  const { data } = await sb.from('staff').select('slug').eq('status', 'published');
  const paths = (data || []).filter(s => s?.slug).map(s => ({ params: { slug: s.slug } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const sb = getServiceClient();
  const { data } = await sb
    .from('staff')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .limit(1);

  const row = data?.[0];
  if (!row) return { notFound: true };

  const person = toWPStaffShape(row);

  // Fetch global treatment bundles from site_config (falls back to hardcoded defaults)
  const { data: configRow } = await sb
    .from('site_config')
    .select('value')
    .eq('key', 'treatment_bundles')
    .limit(1)
    .single();
  if (configRow?.value) {
    person._globalBundles = configRow.value;
  }

  const firstName = (row.name || '').split(/\s/)[0];
  const testimonials = firstName ? await getTestimonialsSSR({ provider: firstName, limit: 15 }) : [];

  return {
    props: { person, testimonials },
    revalidate: 300,
  };
}

BetaTeamSlug.getLayout = (page) => page;
