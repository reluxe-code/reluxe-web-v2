import { useState, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import ServiceProviderPicker from '@/components/booking/ServiceProviderPicker';
import ScarcityBadge from '@/components/booking/ScarcityBadge';
import { useMember } from '@/context/MemberContext';
import { useLocationPref } from '@/context/LocationContext';
import { SERVICE_CONSULT_MAP } from '@/data/serviceBookingMap';
import { getServicesList } from '@/data/servicesList';
import { getServiceClient } from '@/lib/supabase';
import { transformCmsToServiceObject } from '@/lib/cmsTransform';

/* ─── Boulevard slug mapping ─── */
// Maps service page slugs to the boulevard_service_map keys used on staff rows.
// Any slug not listed here is checked as-is against the map keys.
const PAGE_TO_BOULEVARD_SLUGS = {
  botox: ['tox'], dysport: ['tox'], jeuveau: ['tox'], daxxify: ['tox'],
  juvederm: ['filler'], restylane: ['filler'], rha: ['filler'], versa: ['filler'], dissolving: ['filler'],
  micropeels: ['peels'],
  injectables: ['tox', 'filler', 'facial-balancing', 'sculptra'],
  men: ['tox', 'filler', 'facials', 'massage', 'morpheus8', 'skinpen'],
  laserhair: ['laser-hair-removal'],
  saltsauna: ['salt-sauna'],
  skiniq: ['skin-iq'],
  consultations: ['consultations', 'consult'],
};

function getBoulevardSlugs(pageSlug) {
  if (PAGE_TO_BOULEVARD_SLUGS[pageSlug]) return PAGE_TO_BOULEVARD_SLUGS[pageSlug];
  return [pageSlug];
}

/* ─── SSG ─── */
const USE_CMS = process.env.NEXT_PUBLIC_USE_SERVICE_CMS === 'true';

export async function getStaticPaths() {
  if (USE_CMS) {
    // Load paths from CMS
    try {
      const sb = getServiceClient();
      const { data } = await sb
        .from('cms_services')
        .select('slug')
        .eq('status', 'published');
      const paths = (data || []).map((s) => ({ params: { slug: s.slug } }));
      return { paths, fallback: 'blocking' };
    } catch {}
  }

  // File-based paths (original)
  let services = [];
  try { services = await getServicesList(); } catch { services = []; }
  const paths = (Array.isArray(services) ? services : [])
    .map((s) => (s?.slug ? { params: { slug: s.slug } } : null))
    .filter(Boolean);
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const slug = params?.slug || '';
  if (!slug) return { notFound: true };

  let service = null;

  if (USE_CMS) {
    // CMS data source
    try {
      const sb = getServiceClient();
      const { data: svc } = await sb
        .from('cms_services')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (svc) {
        const { data: blocks } = await sb
          .from('cms_service_blocks')
          .select('*')
          .eq('service_id', svc.id)
          .eq('enabled', true)
          .order('sort_order', { ascending: true });

        service = transformCmsToServiceObject(svc, blocks || []);
      }
    } catch {}
  }

  // File-based fallback (original chain)
  if (!service) {
    try {
      const mod = await import(`@/data/services/${slug}.js`);
      service = mod?.default || null;
    } catch {}
  }

  if (!service) {
    try {
      const services = await getServicesList();
      service = services.find((s) => s?.slug === slug) || null;
    } catch {}
  }

  if (!service) {
    try {
      const { getDefaultService } = await import('@/data/servicesDefault');
      service = getDefaultService(slug);
    } catch {}
  }

  if (!service) return { notFound: true };

  // Fetch staff filtered to providers who offer this service
  let staff = [];
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from('staff')
      .select('name, title, featured_image, specialties, slug, boulevard_service_map')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    const blvdSlugs = getBoulevardSlugs(slug);
    staff = (data || [])
      .filter((p) => {
        const map = p.boulevard_service_map || {};
        return blvdSlugs.some((s) => s in map);
      })
      .map((p) => ({
        name: p.name,
        title: p.title || '',
        headshotUrl: p.featured_image || null,
        specialties: Array.isArray(p.specialties)
          ? p.specialties.map((s) => (typeof s === 'string' ? s : s.specialty || s.name || ''))
          : [],
        href: `/team/${p.slug}`,
      }));
  } catch {}

  // Fetch testimonials from Supabase (prefer service-matched)
  let testimonials = [];
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from('testimonials')
      .select('id, author_name, quote, rating, service, location, provider')
      .eq('status', 'published')
      .order('rating', { ascending: false })
      .limit(50);

    const all = data || [];
    const sName = (service?.name || '').toLowerCase();
    const sSlug = slug.toLowerCase();

    // Match testimonials relevant to this service
    const matched = all.filter((t) => {
      if (!t.service) return false;
      const ts = t.service.toLowerCase();
      return ts === sName || ts === sSlug || ts.includes(sSlug) || sName.includes(ts);
    });

    testimonials = matched.length >= 3 ? matched : all;
  } catch {}

  return { props: { service, testimonials, staff }, revalidate: 3600 };
}

/* ─── helpers ─── */
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─── block components ─── */

function HeroBlock({ s, fonts, onBook, onConsult, locationKey }) {
  return (
    <section className="relative" style={{ backgroundColor: colors.ink, paddingTop: 80, paddingBottom: 0 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: `radial-gradient(ellipse at right, ${colors.violet}0c, transparent 70%)`, pointerEvents: 'none' }} />
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ paddingTop: 24, paddingBottom: 32 }}>
          {/* Breadcrumb */}
          <a href="/services" className="inline-flex items-center gap-1.5 mb-3 transition-colors duration-200" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)', textDecoration: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            All Services
          </a>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="max-w-2xl">
              <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.1, color: colors.white, marginBottom: '0.5rem' }}>
                {s.name}
              </h1>
              {s.tagline && (
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.45)', maxWidth: '32rem' }}>
                  {s.tagline}
                </p>
              )}
            </div>

            <div className="shrink-0 pb-1">
              <div className="flex flex-wrap gap-2">
                <button onClick={onBook} className="rounded-full transition-shadow duration-200 hover:shadow-[0_0_24px_rgba(124,58,237,0.3)]" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.75rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Book Now
                </button>
                <button onClick={onConsult} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.75rem', color: 'rgba(250,248,245,0.55)', background: 'transparent', border: '1.5px solid rgba(250,248,245,0.12)', cursor: 'pointer' }}>
                  Free Consult
                </button>
              </div>
              <div className="mt-2">
                <ScarcityBadge locationKey={locationKey || 'westfield'} variant="inline" fonts={fonts} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function QuickFactsBlock({ facts, fonts }) {
  if (!facts?.length) return null;
  return (
    <section style={{ backgroundColor: '#fff', borderBottom: `1px solid ${colors.stone}` }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {facts.map((fact, i) => (
            <motion.div
              key={i}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5"
              style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted }}>{fact.label}</span>
              <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>{fact.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OverviewBlock({ s, fonts }) {
  if (!s.overview?.p1 && !s.overview?.p2 && !s.whyReluxe?.length) return null;
  const why = Array.isArray(s.whyReluxe) ? s.whyReluxe.slice(0, 6) : [];

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Overview text */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>About This Treatment</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '1.5rem' }}>
                {s.name}
              </h2>
              {s.overview?.p1 && (
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: 1.7, color: colors.body, marginBottom: '1rem' }}>
                  {s.overview.p1}
                </p>
              )}
              {s.overview?.p2 && (
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: 1.7, color: colors.body }}>
                  {s.overview.p2}
                </p>
              )}
            </motion.div>
          </div>

          {/* Why RELUXE sidebar */}
          {why.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem' }}>Why Choose</p>
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.heading, marginBottom: '1rem' }}>RELUXE</h3>
                <div className="space-y-4">
                  {why.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: `${colors.violet}15`, marginTop: 2 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 8L7 11L12 5" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      <div>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>{item.title}</p>
                        {item.body && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, lineHeight: 1.5, marginTop: '0.125rem' }}>{item.body}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function ResultsBlock({ results, s, fonts }) {
  if (!results?.length) return null;
  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Real Results</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Before &amp; After
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.slice(0, 6).map((img, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ aspectRatio: '1', position: 'relative', border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <img src={img.src} alt={img.alt || `Result ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksBlock({ steps, fonts }) {
  if (!steps?.length) return null;
  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 relative">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>The Process</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white }}>
            How It Works
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <span className="inline-flex items-center justify-center rounded-full mb-4" style={{ width: 48, height: 48, background: `${colors.violet}20`, fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.violet }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.white, marginBottom: '0.5rem' }}>
                {step.title || `Step ${i + 1}`}
              </h3>
              {step.body && (
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: 'rgba(250,248,245,0.5)', lineHeight: 1.6 }}>
                  {step.body}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CandidatesBlock({ candidates, fonts }) {
  if (!candidates?.good?.length && !candidates?.notIdeal?.length) return null;
  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Is It Right for You?</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Good Candidates
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidates.good?.length > 0 && (
            <motion.div className="rounded-2xl p-6" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: '#166534', marginBottom: '1rem' }}>Great For</h3>
              <div className="flex flex-wrap gap-2">
                {candidates.good.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5" style={{ backgroundColor: '#dcfce7', fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: '#15803d' }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
          {candidates.notIdeal?.length > 0 && (
            <motion.div className="rounded-2xl p-6" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: '#92400e', marginBottom: '1rem' }}>Not Ideal If</h3>
              <div className="flex flex-wrap gap-2">
                {candidates.notIdeal.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5" style={{ backgroundColor: '#fef3c7', fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: '#92400e' }}>
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function PricingMatrixBlock({ matrix, s, fonts, onBook }) {
  if (!matrix?.sections?.length) return null;

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Transparent Pricing</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.5rem' }}>
            Simple, Honest Pricing
          </h2>
          {matrix.subtitle && (
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body }}>{matrix.subtitle}</p>
          )}
        </motion.div>

        <div className="space-y-8">
          {matrix.sections.map((sec, idx) => {
            const rows = Array.isArray(sec.rows) ? sec.rows : [];
            const hasSingle = rows.some((r) => r.single);
            const hasMember = rows.some((r) => r.membership || r.member);

            return (
              <motion.div
                key={idx}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Section header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderBottom: `1px solid ${colors.stone}` }}>
                  <div>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.heading }}>{sec.title || 'Pricing'}</h3>
                    {sec.note && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, marginTop: '0.25rem' }}>{sec.note}</p>}
                  </div>
                  {sec.membershipCallout && (
                    <span className="inline-flex items-center rounded-full px-3 py-1.5" style={{ background: gradients.primary, fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff' }}>
                      {sec.membershipCallout}
                    </span>
                  )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.cream }}>
                        <th style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, padding: '0.75rem 1.25rem', textAlign: 'left' }}>Treatment</th>
                        {hasSingle && <th style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, padding: '0.75rem 1.25rem', textAlign: 'right' }}>{sec?.headers?.single || 'Price'}</th>}
                        {hasMember && <th style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, padding: '0.75rem 1.25rem', textAlign: 'right' }}>{sec?.headers?.member || 'Member'}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${colors.stone}` }}>
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>{r.label}</span>
                            {r.subLabel && <span style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted, marginTop: '0.125rem' }}>{r.subLabel}</span>}
                          </td>
                          {hasSingle && (
                            <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                              <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 500, color: colors.heading }}>{r.single || '-'}</span>
                              {r.singleNote && <span style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted, marginTop: '0.125rem' }}>{r.singleNote}</span>}
                            </td>
                          )}
                          {hasMember && (
                            <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
                                <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#15803d' }}>{r.membership || r.member || '-'}</span>
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                {(sec.promo || sec.ctaText) && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5" style={{ borderTop: `1px solid ${colors.stone}`, backgroundColor: colors.cream }}>
                    {sec.promo && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body }}>{sec.promo}</p>}
                    {sec.ctaText && (
                      <button onClick={onBook} className="rounded-full flex-shrink-0" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.75rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                        {sec.ctaText}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ComparisonBlock({ comparison, fonts }) {
  if (!comparison?.columns?.length || !comparison?.rows?.length) return null;

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Compare Options</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Which One Is Right for You?
          </h2>
        </motion.div>
        <motion.div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ backgroundColor: colors.cream }}>
                  <th style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, padding: '0.75rem 1.25rem', textAlign: 'left' }} />
                  {comparison.columns.map((col, i) => (
                    <th key={i} style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading, padding: '0.75rem 1rem', textAlign: 'center' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${colors.stone}` }}>
                    <td style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading, padding: '0.875rem 1.25rem' }}>{row.label}</td>
                    {row.options.map((opt, j) => (
                      <td key={j} style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, padding: '0.875rem 1rem', textAlign: 'center' }}>{opt.value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FAQBlock({ faq, s, fonts }) {
  const [openIndex, setOpenIndex] = useState(null);
  if (!faq?.length) return null;

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>FAQ</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Common Questions About {s.name}
          </h2>
        </motion.div>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <motion.div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <button
                className="w-full text-left p-5 flex items-center justify-between gap-4"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>{item.q}</span>
                <motion.svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none"
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M5 8L10 13L15 8" stroke={colors.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-5 pb-5">
                      <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.6 }}>{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsBlock({ testimonials, s, fonts }) {
  if (!testimonials?.length) return null;

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Real Reviews</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            What Our Patients Say
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.slice(0, 6).map((t, i) => {
            const rawName = t.author_name || t.author || 'Patient';
            const name = rawName.includes(' ') ? rawName.split(' ')[0] + ' ' + rawName.split(' ').pop()[0] + '.' : rawName;
            const text = t.quote || t.text || '';
            const rating = t.rating || 5;

            return (
              <motion.div
                key={i}
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(rating)].map((_, j) => (
                    <span key={j} style={{ color: colors.violet, fontSize: '0.875rem' }}>&#9733;</span>
                  ))}
                </div>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
                  &ldquo;{text.length > 200 ? text.slice(0, 200) + '...' : text}&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${colors.stone}` }}>
                  <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: `${colors.violet}10` }}>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet }}>{name.charAt(0)}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>{name}</p>
                    {(t.service || t.location) && (
                      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>{t.service}{t.location ? ` \u2022 ${t.location}` : ''}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProvidersBlock({ providers, s, fonts }) {
  if (!providers?.length) return null;

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Expert Team</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Your {s.name} Providers
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map((p, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden group"
              style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              {/* Headshot */}
              <div style={{ height: 240, overflow: 'hidden', position: 'relative' }}>
                {p.headshotUrl ? (
                  <img src={p.headshotUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}12)` }} />
                )}
              </div>
              <div className="p-5">
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, marginBottom: '0.125rem' }}>{p.name}</h3>
                {p.title && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.violet, marginBottom: '0.5rem' }}>{p.title}</p>}
                {p.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.specialties.map((sp, j) => (
                      <span key={j} className="rounded-full px-2.5 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.heading, backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                        {sp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrepAftercareBlock({ prepAftercare, fonts }) {
  if (!prepAftercare?.prep?.points?.length && !prepAftercare?.after?.points?.length) return null;

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Your Guide</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Prep &amp; Aftercare
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[prepAftercare.prep, prepAftercare.after].filter(Boolean).map((col, idx) => (
            <motion.div
              key={idx}
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.heading, marginBottom: '1rem' }}>{col.title}</h3>
              <ul className="space-y-2.5">
                {col.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill={idx === 0 ? `${colors.violet}15` : '#dcfce7'} />
                      <path d="M5 8L7 10L11 6" stroke={idx === 0 ? colors.violet : '#15803d'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>{pt}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── page ─── */
function ServiceDetailPage({ fontKey, fonts, service, testimonials, staff }) {
  const s = service || {};
  const { openBookingModal } = useMember()
  const { locationKey: prefLoc } = useLocationPref()
  const loc = prefLoc || 'all'
  const handleBook = () => openBookingModal(loc, s.slug)
  const consultSlug = SERVICE_CONSULT_MAP[s.slug] || 'consult'
  const handleConsult = () => openBookingModal(loc, consultSlug)
  const results = Array.isArray(s.resultsGallery) ? s.resultsGallery : [];
  const faq = Array.isArray(s.faq) ? s.faq : [];
  const providers = Array.isArray(staff) && staff.length > 0 ? staff : (Array.isArray(s.providers) ? s.providers : []);

  // Merge DB testimonials with service-level testimonials
  const allTestimonials = testimonials?.length ? testimonials : (Array.isArray(s.testimonials) ? s.testimonials : []);

  return (
    <>
      <HeroBlock s={s} fonts={fonts} onBook={handleBook} onConsult={handleConsult} locationKey={prefLoc || 'westfield'} />
      <QuickFactsBlock facts={s.quickFacts} fonts={fonts} />
      <OverviewBlock s={s} fonts={fonts} />
      <ResultsBlock results={results} s={s} fonts={fonts} />
      <HowItWorksBlock steps={s.howItWorks} fonts={fonts} />
      <CandidatesBlock candidates={s.candidates} fonts={fonts} />
      <PricingMatrixBlock matrix={s.pricingMatrix} s={s} fonts={fonts} onBook={handleBook} />
      {s.comparison && <ComparisonBlock comparison={s.comparison} fonts={fonts} />}
      <TestimonialsBlock testimonials={allTestimonials} s={s} fonts={fonts} />
      <ProvidersBlock providers={providers} s={s} fonts={fonts} />

      {/* Real-time Provider Availability (requires Boulevard IDs) */}
      <ServiceProviderPicker
        serviceSlug={s.slug}
        locationKey={prefLoc || 'westfield'}
        fonts={fonts}
        label="Book by Provider"
        heading={`Available ${s.name} Providers`}
      />

      <FAQBlock faq={faq} s={s} fonts={fonts} />
      <PrepAftercareBlock prepAftercare={s.prepAftercare} fonts={fonts} />

      {/* Bottom CTA */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            Ready for {s.name}?
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
            Book a free consultation. No pressure, just expert advice.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={handleBook} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: '#fff', color: colors.ink, border: 'none', cursor: 'pointer' }}>
              Book Now
            </button>
            <button onClick={handleConsult} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              Free Consult
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <ScarcityBadge locationKey={prefLoc || 'westfield'} variant="inline" fonts={fonts} />
          </div>
        </div>
      </section>
    </>
  );
}

export default function BetaServiceDetail({ service, testimonials, staff }) {
  const s = service || {};
  const slug = s.slug || '';
  const serviceName = s.name || 'Service';
  const seoTitle = s.seo?.title || `${serviceName} in Westfield & Carmel, IN | RELUXE Med Spa`;
  const seoDesc = s.seo?.description || s.tagline || `Learn about ${serviceName} at RELUXE Med Spa in Westfield & Carmel, IN. Expert providers, transparent pricing. Book your free consultation.`;
  const canonical = `https://reluxemedspa.com/services/${slug}`;

  const faqItems = Array.isArray(s.faq) ? s.faq.slice(0, 12) : [];
  const singlePrice = parseFloat(String(s.pricing?.single || '').replace(/[^0-9.]/g, '')) || undefined;

  // Build HowTo schema from howItWorks steps
  const howToSteps = Array.isArray(s.howItWorks) ? s.howItWorks : [];
  const howToSchema = howToSteps.length > 0 ? [{
    '@type': 'HowTo',
    name: `How ${serviceName} Works at RELUXE Med Spa`,
    description: `Step-by-step guide to getting ${serviceName} at RELUXE Med Spa in Westfield and Carmel, Indiana.`,
    totalTime: s.quickFacts?.find(f => f.label === 'Treatment Time')?.value ? `PT${parseInt(s.quickFacts.find(f => f.label === 'Treatment Time').value) || 30}M` : undefined,
    step: howToSteps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title || `Step ${i + 1}`,
      text: step.body || '',
    })),
  }] : [];

  // Build HowTo schema from prep/aftercare instructions
  const prep = s.prepAftercare?.prep;
  const after = s.prepAftercare?.after;
  const prepSchema = (prep?.points?.length || after?.points?.length) ? [{
    '@type': 'HowTo',
    name: `${serviceName} Prep & Aftercare Guide`,
    description: `How to prepare for and recover from ${serviceName} at RELUXE Med Spa.`,
    step: [
      ...(prep?.points || []).map((pt, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: `Prep: ${pt.split('.')[0] || pt}`,
        text: pt,
      })),
      ...(after?.points || []).map((pt, i) => ({
        '@type': 'HowToStep',
        position: (prep?.points?.length || 0) + i + 1,
        name: `Aftercare: ${pt.split('.')[0] || pt}`,
        text: pt,
      })),
    ],
  }] : [];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: serviceName,
        serviceType: serviceName,
        description: seoDesc,
        provider: {
          '@type': 'MedicalBusiness',
          name: 'RELUXE Med Spa',
          '@id': 'https://reluxemedspa.com#org',
          areaServed: ['Westfield IN', 'Carmel IN', 'Fishers IN', 'Zionsville IN', 'Indianapolis IN'],
        },
        ...(singlePrice ? { offers: { '@type': 'Offer', priceCurrency: 'USD', price: singlePrice, url: canonical } } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reluxemedspa.com' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://reluxemedspa.com/services' },
          { '@type': 'ListItem', position: 3, name: serviceName, item: canonical },
        ],
      },
      ...(faqItems.length > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }] : []),
      ...howToSchema,
      ...prepSchema,
    ],
  };

  return (
    <BetaLayout
      title={seoTitle}
      description={seoDesc}
      canonical={canonical}
      structuredData={structuredData}
    >
      {({ fontKey, fonts }) => (
        <ServiceDetailPage fontKey={fontKey} fonts={fonts} service={service} testimonials={testimonials} staff={staff} />
      )}
    </BetaLayout>
  );
}

BetaServiceDetail.getLayout = (page) => page;
