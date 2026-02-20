import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { getServiceClient } from '@/lib/supabase';
import { toWPStaffShape } from '@/lib/staff-helpers';
import { getTestimonialsSSR } from '@/lib/testimonials';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { categorizeProvider } from '@/lib/provider-roles';

/* ─── grain texture ─── */
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─── category helpers ─── */
const lower = (v) => (v ?? '').toString().toLowerCase().trim();

function deriveSubtitle(staff) {
  const candidates = [
    staff?.staffFields?.staffTitle,
    staff?.staffFields?.stafftitle,
    staff?.staffFields?.role,
    staff?.staff_title,
    staff?.staffTitle,
    staff?.role,
  ];
  for (const v of candidates) {
    if (v && String(v).trim()) return String(v).trim();
  }
  return '';
}

// Use shared categorizeProvider utility
const pickCategory = categorizeProvider;

/* ─── matcher quiz ─── */
const matcherQuestions = [
  {
    question: 'What are you looking for?',
    options: [
      { label: 'Botox or wrinkle treatment', categoryMatch: 'Injectors' },
      { label: 'Lip or facial filler', categoryMatch: 'Injectors' },
      { label: 'Facials or skin treatments', categoryMatch: 'Aestheticians' },
      { label: 'Laser hair removal', categoryMatch: 'Aestheticians' },
      { label: 'Massage', categoryMatch: 'Massage Therapists' },
      { label: "I'm not sure yet", categoryMatch: null },
    ],
  },
];

const values = [
  { title: 'Premium Only', detail: 'We use only FDA-approved, premium products. No knockoffs, no shortcuts.' },
  { title: 'Ongoing Training', detail: 'Every provider completes advanced certifications annually. We stay ahead of the curve.' },
  { title: 'Collaborative Care', detail: 'Our team works together on complex treatment plans. Multiple perspectives, better outcomes.' },
];

/* ─── components ─── */

function ProviderCard({ provider, fonts, index }) {
  const subtitle = deriveSubtitle(provider);
  const category = pickCategory(provider);
  const imgUrl = provider?.featuredImage?.node?.sourceUrl || provider?.featuredImage?.sourceUrl;
  const specialties = (provider?.staffFields?.specialties || []).map(s => s?.specialty || s).filter(Boolean);
  const locations = (provider?.staffFields?.location || []).map(l => l?.title || l?.slug || '').filter(Boolean);
  const slug = provider?.slug;

  const catColors = {
    Injectors: colors.violet,
    Aestheticians: colors.fuchsia,
    'Massage Therapists': '#059669',
    'Support Staff': colors.rose,
  };
  const accent = catColors[category] || colors.violet;

  return (
    <motion.a
      href={`/beta/team/${slug}`}
      className="group rounded-2xl overflow-hidden flex flex-col"
      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, textDecoration: 'none' }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
    >
      {/* Photo or gradient placeholder */}
      <div className="relative" style={{ height: 320, overflow: 'hidden' }}>
        {imgUrl ? (
          <>
            <img src={imgUrl} alt={provider.name || provider.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} className="transition-transform duration-500 group-hover:scale-105" />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, #fff, transparent)' }} />
          </>
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${accent}25, ${accent}06)` }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center rounded-full" style={{ width: 80, height: 80, background: `${accent}15` }}>
                <span style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: accent }}>{(provider.name || provider.title || '?')[0]}</span>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, #fff, transparent)' }} />
          </>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.125rem' }}>
          {provider.name || provider.title}
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: accent, fontWeight: 500, marginBottom: '0.5rem' }}>
          {subtitle}
        </p>
        {locations.length > 0 && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 500, color: colors.muted, marginBottom: '0.75rem' }}>
            {locations.join(' & ')}
          </p>
        )}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {specialties.slice(0, 4).map((s) => (
              <span key={s} className="rounded-full px-2.5 py-1" style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 500, color: accent, background: `${accent}08`, border: `1px solid ${accent}15` }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.a>
  );
}

function ProviderMatcher({ fonts, staffList }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const matchedProviders = selected
    ? selected.categoryMatch
      ? staffList.filter((p) => pickCategory(p) === selected.categoryMatch).slice(0, 6)
      : staffList.slice(0, 3)
    : [];

  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: '60%', background: `radial-gradient(ellipse, ${colors.fuchsia}06, transparent 70%)`, pointerEvents: 'none' }} />
      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28 relative">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Find Your Match</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white, marginBottom: '0.75rem' }}>
            Who Should I See?
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: 'rgba(250,248,245,0.5)', maxWidth: '28rem', margin: '0 auto' }}>
            Tell us what you&rsquo;re looking for and we&rsquo;ll match you with the right provider.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div key="q" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {matcherQuestions[0].options.map((opt, i) => (
                <motion.button
                  key={opt.label}
                  className="rounded-xl text-left p-5 transition-all duration-200"
                  style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.1)', cursor: 'pointer', fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 500, color: colors.white }}
                  whileHover={{ backgroundColor: 'rgba(124,58,237,0.12)', borderColor: 'rgba(124,58,237,0.3)' }}
                  onClick={() => { setSelected(opt); setShowResult(true); }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {opt.label}
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="r" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                {matchedProviders.map((p) => {
                  const imgUrl = p?.featuredImage?.node?.sourceUrl;
                  const name = p.name || p.title;
                  return (
                    <a key={p.slug} href={`/beta/team/${p.slug}`} className="rounded-xl p-5 text-center transition-all duration-200 hover:border-violet-500/30" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.1)', textDecoration: 'none' }}>
                      <div className="flex items-center justify-center rounded-full mx-auto mb-3 overflow-hidden" style={{ width: 56, height: 56, background: `${colors.violet}20` }}>
                        {imgUrl ? (
                          <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.violet }}>{(name || '?')[0]}</span>
                        )}
                      </div>
                      <h4 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.white, marginBottom: '0.125rem' }}>{name}</h4>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.violet, fontWeight: 500 }}>{deriveSubtitle(p)}</p>
                    </a>
                  );
                })}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <GravityBookButton fontKey="bold" size="hero" />
                <button className="rounded-full" onClick={() => { setShowResult(false); setSelected(null); }} style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: 'transparent', color: 'rgba(250,248,245,0.6)', border: '1px solid rgba(250,248,245,0.15)', cursor: 'pointer' }}>
                  Start Over
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ReviewCarousel({ fonts, reviews }) {
  const [active, setActive] = useState(0);
  const visibleReviews = 3;
  if (!reviews.length) return null;

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Patient Love</p>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
              What They&rsquo;re Saying
            </h2>
          </div>
          {reviews.length > visibleReviews && (
            <div className="flex gap-2">
              <button onClick={() => setActive(Math.max(0, active - 1))} className="flex items-center justify-center rounded-full transition-colors duration-200" style={{ width: 40, height: 40, backgroundColor: active === 0 ? colors.stone : '#fff', border: `1px solid ${colors.stone}`, cursor: active === 0 ? 'default' : 'pointer', opacity: active === 0 ? 0.5 : 1 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke={colors.heading} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button onClick={() => setActive(Math.min(reviews.length - visibleReviews, active + 1))} className="flex items-center justify-center rounded-full transition-colors duration-200" style={{ width: 40, height: 40, backgroundColor: active >= reviews.length - visibleReviews ? colors.stone : '#fff', border: `1px solid ${colors.stone}`, cursor: active >= reviews.length - visibleReviews ? 'default' : 'pointer', opacity: active >= reviews.length - visibleReviews ? 0.5 : 1 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke={colors.heading} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.slice(active, active + visibleReviews).map((review, i) => (
            <motion.div key={review.id || i + active} className="rounded-2xl p-6" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}>
              <div className="flex gap-0.5 mb-3">
                {[...Array(review.rating || 5)].map((_, j) => (
                  <span key={j} style={{ color: colors.violet, fontSize: '0.875rem' }}>★</span>
                ))}
              </div>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
                &ldquo;{review.body || review.text}&rdquo;
              </p>
              <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${colors.stone}` }}>
                <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: `${colors.violet}10` }}>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet }}>{(review.author_name || review.author || review.name || '?')[0]}</span>
                </div>
                <div>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>{(() => { const n = review.author_name || review.author || review.name || 'Patient'; return n.includes(' ') ? n.split(' ')[0] + ' ' + n.split(' ').pop()[0] + '.' : n; })()}</p>
                  {review.provider && <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>Patient of {review.provider}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── page ─── */

function TeamPage({ fontKey, fonts, staffList, testimonials }) {
  const categories = ['Injectors', 'Aestheticians', 'Massage Therapists', 'Support Staff'];
  const grouped = {};
  categories.forEach(c => { grouped[c] = []; });
  staffList.forEach(s => {
    const cat = pickCategory(s);
    if (grouped[cat]) grouped[cat].push(s);
    else grouped['Support Staff'].push(s);
  });
  const nonEmpty = categories.filter(c => grouped[c].length > 0);

  // Featured provider = first injector (usually the owner)
  const featured = grouped.Injectors?.[0];
  const featuredImg = featured?.featuredImage?.node?.sourceUrl;
  const featuredSubtitle = deriveSubtitle(featured);
  const featuredSpecialties = (featured?.staffFields?.specialties || []).map(s => s?.specialty || s).filter(Boolean);
  const featuredBio = featured?.staffFields?.staffBio || '';

  return (
    <>
      {/* Hero */}
      <section className="relative" style={{ backgroundColor: colors.ink, paddingTop: 120 }}>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40%', height: '60%', background: `radial-gradient(ellipse at bottom right, ${colors.fuchsia}08, transparent 70%)`, pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-6 pb-16 lg:pb-24 relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Our Team</p>
            <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, color: colors.white, marginBottom: '1rem', maxWidth: '30rem' }}>
              The People Behind{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>the Glow</span>
            </h1>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.7, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem' }}>
              {staffList.length}+ expert providers across two locations. Every one of them hand-picked, rigorously trained, and genuinely passionate about what they do.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Provider Spotlight */}
      {featured && (
        <section style={{ backgroundColor: '#fff' }}>
          <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className="rounded-3xl overflow-hidden" style={{ aspectRatio: '3/4', position: 'relative', maxHeight: 520, background: featuredImg ? undefined : `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}12)` }}>
                  {featuredImg ? (
                    <img src={featuredImg} alt={featured.name || featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                  )}
                  <div className="absolute top-4 left-4 rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured Provider</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Meet {(featured.name || featured.title || '').split(/\s/)[0]}</p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: colors.heading, lineHeight: 1.1, marginBottom: '0.75rem' }}>
                    {featuredSubtitle}
                  </h2>
                  {featuredBio && (
                    <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.7, color: colors.body, marginBottom: '1.5rem' }}>
                      {featuredBio.length > 300 ? featuredBio.slice(0, 300) + '...' : featuredBio}
                    </p>
                  )}
                  {featuredSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredSpecialties.slice(0, 6).map((tag) => (
                        <span key={tag} className="rounded-full px-3 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.violet, background: `${colors.violet}08`, border: `1px solid ${colors.violet}15` }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <GravityBookButton fontKey={fontKey} size="hero" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Provider Grid by Category */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          {nonEmpty.map((category) => (
            <div key={category} className="mb-16 last:mb-0">
              <motion.div className="mb-8" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="flex items-center gap-3 mb-2">
                  <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
                    {category}
                  </h2>
                  <span className="rounded-full px-3 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, background: `${colors.violet}10` }}>
                    {grouped[category].length}
                  </span>
                </div>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {grouped[category].map((p, i) => (
                  <ProviderCard key={p.slug || i} provider={p} fonts={fonts} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Provider Matcher Quiz */}
      <ProviderMatcher fonts={fonts} staffList={staffList} />

      {/* Patient Reviews */}
      <ReviewCarousel fonts={fonts} reviews={testimonials} />

      {/* Why Our Team */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>The RELUXE Difference</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '1rem' }}>
                Not Your Average Med Spa Team
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body, maxWidth: '28rem' }}>
                We don&rsquo;t hire based on resumes alone. Every RELUXE provider goes through hands-on mentorship, advanced certification, and ongoing training. Because your face deserves the best.
              </p>
            </motion.div>
            <div className="space-y-5">
              {values.map((v, i) => (
                <motion.div key={v.title} className="rounded-xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                  <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, marginBottom: '0.375rem' }}>{v.title}</h3>
                  <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>{v.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Find Your Provider</h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book a free consultation and we&rsquo;ll match you with the perfect provider for your goals.</p>
          <div className="flex justify-center">
            <GravityBookButton fontKey={fontKey} size="hero" />
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── wrapper + data fetching ─── */

export default function BetaTeamIndex({ staffList, testimonials }) {
  return (
    <BetaLayout title="Our Team" description="Meet the expert providers at RELUXE Med Spa. Injectors, aestheticians, and wellness professionals across Westfield and Carmel.">
      {({ fontKey, fonts }) => <TeamPage fontKey={fontKey} fonts={fonts} staffList={staffList} testimonials={testimonials} />}
    </BetaLayout>
  );
}

export async function getStaticProps() {
  const sb = getServiceClient();
  const { data } = await sb
    .from('staff')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')
    .order('name');

  const staffList = (data || []).map(toWPStaffShape);
  const testimonials = await getTestimonialsSSR({ limit: 20 });

  return {
    props: { staffList, testimonials },
    revalidate: 3600,
  };
}

BetaTeamIndex.getLayout = (page) => page;
