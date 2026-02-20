import { useState } from 'react';
import { motion } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { beforeAfterRecords } from '@/data/beforeAfterData';
import GravityBookButton from '@/components/beta/GravityBookButton';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const FILTER_TABS = ['All', 'Injectables', 'Lasers', 'Facials'];
const FREE_PREVIEW_COUNT = 4;

function ResultCard({ record, fonts, index }) {
  const beforeSrc = record.beforeImage || record.beforeafterImage;
  const afterSrc = record.afterImage || record.beforeafterImage;

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
    >
      {/* Before / After image split */}
      <div className="relative flex" style={{ aspectRatio: '16/9' }}>
        {/* Before side */}
        <div className="relative w-1/2 overflow-hidden" style={{ backgroundColor: colors.cream }}>
          {beforeSrc && (
            <img
              src={beforeSrc}
              alt={`${record.service} before`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <span
            className="absolute top-3 left-3 rounded-full px-3 py-1"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.625rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: colors.heading,
              backgroundColor: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(4px)',
            }}
          >
            Before
          </span>
        </div>

        {/* After side */}
        <div className="relative w-1/2 overflow-hidden" style={{ backgroundColor: colors.cream }}>
          {afterSrc && (
            <img
              src={afterSrc}
              alt={`${record.service} after`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {/* Gradient overlay on after side */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(192,38,211,0.3))',
              pointerEvents: 'none',
            }}
          />
          <span
            className="absolute top-3 left-3 rounded-full px-3 py-1"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.625rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#fff',
              background: gradients.primary,
            }}
          >
            After
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-5 lg:p-6">
        {/* Title row: service name + provider badge */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, lineHeight: 1.3 }}>
            {record.service}
          </h3>
          <span
            className="shrink-0 rounded-full px-2.5 py-1"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.625rem',
              fontWeight: 600,
              color: colors.violet,
              background: `${colors.violet}10`,
              border: `1px solid ${colors.violet}20`,
              whiteSpace: 'nowrap',
            }}
          >
            {record.provider}{record.providerTitle ? `, ${record.providerTitle}` : ''}
          </span>
        </div>

        {/* Treatment area */}
        {record.treatmentArea && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, marginBottom: '0.75rem' }}>
            {record.treatmentArea}
          </p>
        )}

        {/* Description */}
        <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body }}>
          {record.description}
        </p>

        {/* Testimonial */}
        {record.testimonial && (
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.stone}` }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontStyle: 'italic', color: colors.body, lineHeight: 1.5 }}>
              &ldquo;{record.testimonial}&rdquo;
            </p>
            {record.clientName && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted, marginTop: '0.25rem' }}>
                &mdash; {record.clientName}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function BetaResults() {
  const [filter, setFilter] = useState('All');
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredRecords = beforeAfterRecords.filter((record) => {
    if (filter === 'All') return true;
    return record.category === filter;
  });

  const visibleRecords = unlocked ? filteredRecords : filteredRecords.slice(0, FREE_PREVIEW_COUNT);
  const gatedCount = filteredRecords.length - FREE_PREVIEW_COUNT;

  async function handleUnlock(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', email, phone: '', message: 'Before/after gallery unlock request', location: 'results-page', pageUrl: '/beta/results' }),
      });
    } catch {
      // still unlock even if API fails
    }
    setUnlocked(true);
    setSubmitting(false);
  }

  return (
    <BetaLayout title="Before & After Results" description="See real before & after results from Botox, filler, Morpheus8, SkinPen, and laser treatments at RELUXE Med Spa.">
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Results Gallery</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  See Our{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real Results</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '30rem', margin: '0 auto' }}>
                  Real patients. Real providers. Real results &mdash; no filters, no BS.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Category Filters */}
          <section style={{ backgroundColor: '#fff', borderBottom: `1px solid ${colors.stone}` }}>
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {FILTER_TABS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className="rounded-full transition-colors duration-200"
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      padding: '0.5rem 1.25rem',
                      background: filter === cat ? gradients.primary : 'transparent',
                      color: filter === cat ? '#fff' : colors.body,
                      border: filter === cat ? 'none' : `1px solid ${colors.stone}`,
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section heading */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 pt-16 lg:pt-20">
              <motion.div className="text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Real Results</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.5rem' }}>
                  See the Difference
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.6, color: colors.body, maxWidth: '28rem', margin: '0 auto' }}>
                  Real patients. Real providers. Real results &mdash; no filters, no BS.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Results Grid — 2 columns */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
              {visibleRecords.length === 0 ? (
                <div className="text-center py-20">
                  <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: colors.muted }}>No results in this category yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {visibleRecords.map((record, i) => (
                    <ResultCard key={record.id} record={record} fonts={fonts} index={i} />
                  ))}
                </div>
              )}

              {/* Email gate for remaining results */}
              {!unlocked && gatedCount > 0 && (
                <motion.div className="mt-12 mx-auto max-w-xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>See {gatedCount} more result{gatedCount !== 1 ? 's' : ''}</h3>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, marginBottom: '1.25rem' }}>Enter your email to unlock our full before &amp; after gallery.</p>
                    <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="flex-1 rounded-full px-5 py-3 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: '#fff', border: `1px solid ${colors.stone}`, color: colors.heading }} />
                      <button type="submit" disabled={submitting} className="rounded-full shrink-0" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.75rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                        {submitting ? 'Unlocking...' : 'Unlock All'}
                      </button>
                    </form>
                    <p className="mt-3" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>No spam. We&apos;ll only send relevant skincare tips and offers.</p>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready for Your Transformation?</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book a free consultation and let our experts build your custom treatment plan.</p>
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

BetaResults.getLayout = (page) => page;
