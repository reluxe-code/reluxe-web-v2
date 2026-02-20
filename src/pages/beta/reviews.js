import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { getTestimonialsSSR } from '@/lib/testimonials';
import GravityBookButton from '@/components/beta/GravityBookButton';

const SERVICE_LABELS = {
  tox: 'Tox', filler: 'Filler', 'facial-balancing': 'Facial Balancing',
  morpheus8: 'Morpheus8', co2: 'CO\u2082', opus: 'Opus', sculptra: 'Sculptra',
  skinpen: 'SkinPen', ipl: 'IPL', clearlift: 'ClearLift', clearskin: 'ClearSkin',
  vascupen: 'VascuPen', 'laser-hair-removal': 'Laser Hair Removal',
  facials: 'Facials', glo2facial: 'Glo2Facial', hydrafacial: 'HydraFacial',
  peels: 'Peels', evolvex: 'EvolveX', massage: 'Massage',
  'salt-sauna': 'Salt Sauna', 'skin-iq': 'Skin IQ',
};

function privacyName(name) {
  if (!name) return 'RELUXE Patient';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function ReviewCard({ t, fonts, index }) {
  const [expanded, setExpanded] = useState(false);
  const serviceLabel = SERVICE_LABELS[t.service] || '';
  const quote = t.quote || '';
  const needsTruncate = quote.length > 200;
  const displayQuote = needsTruncate && !expanded ? quote.slice(0, 200).trimEnd() + '...' : quote;

  return (
    <motion.div
      className="rounded-2xl p-6 lg:p-8 flex flex-col"
      style={{ backgroundColor: colors.cream, borderLeft: `3px solid ${colors.violet}` }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.06 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {serviceLabel && (
            <span className="inline-block rounded-full px-2.5 py-1 shrink-0" style={{ background: `${colors.violet}12`, fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{serviceLabel}</span>
          )}
          {t.provider && (
            <span className="truncate" style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>with {t.provider}</span>
          )}
        </div>
        <div className="flex gap-0.5 shrink-0">
          {[...Array(t.rating || 5)].map((_, j) => (
            <svg key={j} width="14" height="14" viewBox="0 0 16 16" fill={colors.violet}><path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z" /></svg>
          ))}
        </div>
      </div>

      {/* Quote */}
      <p className="flex-1 mb-4" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, lineHeight: 1.625 }}>
        &ldquo;{displayQuote}&rdquo;
        {needsTruncate && (
          <button type="button" onClick={() => setExpanded((e) => !e)} className="ml-1" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {expanded ? 'less' : 'more'}
          </button>
        )}
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid ${colors.stone}` }}>
        <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 36, height: 36, backgroundColor: colors.stone, color: colors.muted, fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600 }}>{t.author_name?.charAt(0) || '?'}</div>
        <div>
          <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>{privacyName(t.author_name)}</p>
          {t.location && <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>{t.location === 'carmel' ? 'Carmel' : 'Westfield'}</p>}
        </div>
      </div>
    </motion.div>
  );
}

export default function BetaReviews({ testimonials = [] }) {
  const [filterLocation, setFilterLocation] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterService, setFilterService] = useState('');
  const [showCount, setShowCount] = useState(24);

  const { providers, services } = useMemo(() => {
    const provSet = new Set();
    const svcSet = new Set();
    for (const t of testimonials) {
      if (t.provider) provSet.add(t.provider);
      if (t.service) svcSet.add(t.service);
    }
    return { providers: [...provSet].sort(), services: [...svcSet].sort() };
  }, [testimonials]);

  const filtered = useMemo(() => {
    return testimonials.filter((t) => {
      if (filterLocation && t.location !== filterLocation) return false;
      if (filterProvider && t.provider !== filterProvider) return false;
      if (filterService && t.service !== filterService) return false;
      return true;
    });
  }, [testimonials, filterLocation, filterProvider, filterService]);

  const visible = filtered.slice(0, showCount);
  const hasMore = showCount < filtered.length;

  return (
    <BetaLayout title="Patient Reviews" description={`Read ${testimonials.length}+ real patient reviews from RELUXE Med Spa in Westfield and Carmel, Indiana.`}>
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Patient Reviews</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  What Our Patients{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Really Say</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '28rem', margin: '0 auto' }}>
                  {testimonials.length} five-star reviews from real patients. Zero bought. Zero filtered.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Stats bar */}
          <section style={{ backgroundColor: colors.ink, paddingBottom: '2rem' }}>
            <div className="max-w-4xl mx-auto px-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '5.0', label: 'Star Average' },
                  { value: `${testimonials.length}+`, label: 'Total Reviews' },
                  { value: '100%', label: 'Real Patients' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} className="text-center rounded-xl py-4" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)' }} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                    <p style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.white }}>{stat.value}</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Filters + Reviews */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center mb-10">
                <select value={filterLocation} onChange={(e) => { setFilterLocation(e.target.value); setShowCount(24); }} className="rounded-full px-4 py-2.5 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.875rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, color: colors.heading }}>
                  <option value="">All Locations</option>
                  <option value="westfield">Westfield</option>
                  <option value="carmel">Carmel</option>
                </select>
                <select value={filterProvider} onChange={(e) => { setFilterProvider(e.target.value); setShowCount(24); }} className="rounded-full px-4 py-2.5 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.875rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, color: colors.heading }}>
                  <option value="">All Providers</option>
                  {providers.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={filterService} onChange={(e) => { setFilterService(e.target.value); setShowCount(24); }} className="rounded-full px-4 py-2.5 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.875rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, color: colors.heading }}>
                  <option value="">All Services</option>
                  {services.map((s) => <option key={s} value={s}>{SERVICE_LABELS[s] || s}</option>)}
                </select>
                {(filterLocation || filterProvider || filterService) && (
                  <button onClick={() => { setFilterLocation(''); setFilterProvider(''); setFilterService(''); setShowCount(24); }} style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear Filters</button>
                )}
                <span className="ml-auto" style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>{filtered.length} reviews</span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {visible.map((t, i) => (
                  <ReviewCard key={t.id} t={t} fonts={fonts} index={i} />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button onClick={() => setShowCount((c) => c + 24)} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.5rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Load More ({filtered.length - showCount} remaining)
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to See What All the Hype Is About?</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book a free consultation and join the 5-star club.</p>
              <div className="flex justify-center">
                <GravityBookButton fontKey={fontKey} size="hero" />
              </div>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  );
}

export async function getStaticProps() {
  const testimonials = await getTestimonialsSSR({ limit: 500 });
  return { props: { testimonials }, revalidate: 3600 };
}

BetaReviews.getLayout = (page) => page;
