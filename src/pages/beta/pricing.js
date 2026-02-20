import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { servicesData, packagesData } from '@/data/Pricing';
import GravityBookButton from '@/components/beta/GravityBookButton';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const NAME_TO_SLUG = [
  ['facial balancing', 'facialbalancing'], ['daxx', 'daxxify'], ['botox', 'botox'],
  ['dysport', 'dysport'], ['jeuveau', 'jeuveau'], ['tox', 'tox'],
  ['filler', 'filler'], ['juved', 'juvederm'], ['rha', 'rha'],
  ['restyl', 'restylane'], ['sculp', 'sculptra'], ['hydra', 'hydrafacial'],
  ['glo2', 'glo2facial'], ['skinpen', 'skinpen'], ['morpheus', 'morpheus8'],
  ['ipl', 'ipl'], ['laser hair', 'laser-hair-removal'], ['laser', 'lasers'],
  ['clearlift', 'clearlift'], ['clearskin', 'clearskin'], ['opus', 'opus'],
  ['prp', 'prp'], ['massage', 'massage'], ['salt sauna', 'saltsauna'],
  ['co2', 'co2'], ['evolvex', 'evolvex'], ['evolve', 'evolvex'],
  ['facial', 'facials'], ['peel', 'peels'],
];

function guessSlug(label) {
  const s = (label || '').toLowerCase().trim();
  for (const [needle, slug] of NAME_TO_SLUG) if (s.includes(needle)) return slug;
  return '';
}

function CategoryCard({ group, fonts, index }) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.06 }}
    >
      <div style={{ height: '2px', background: gradients.primary }} />
      <div className="p-5 lg:p-6">
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading, marginBottom: '1rem' }}>{group.title}</h3>
        <div className="space-y-0">
          {group.items.map((item, i) => {
            const slug = guessSlug(item.name);
            const inner = (
              <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: i < group.items.length - 1 ? `1px solid ${colors.cream}` : 'none' }}>
                <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.heading }}>{item.name}</span>
                <span className="shrink-0" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>{item.price}</span>
              </div>
            );
            return slug ? (
              <a key={item.name} href={`/beta/services/${slug}`} className="block hover:bg-stone/30 rounded-lg px-2 -mx-2 transition-colors" style={{ textDecoration: 'none' }}>{inner}</a>
            ) : (
              <div key={item.name} className="px-2 -mx-2">{inner}</div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function BetaPricing() {
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = useMemo(() => ['all', ...servicesData.map((g) => g.title)], []);

  const filteredGroups = useMemo(() => {
    if (activeCategory === 'all') return servicesData;
    return servicesData.filter((g) => g.title === activeCategory);
  }, [activeCategory]);

  return (
    <BetaLayout title="Services & Pricing" description="Transparent pricing for Botox, fillers, facials, laser treatments, body contouring & memberships at RELUXE Med Spa.">
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Services &amp; Pricing</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Transparent Pricing.{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>No Pressure.</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '32rem', margin: '0 auto' }}>
                  We keep things simple with clear starting prices and guided customization &mdash; so you know what to expect.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Category filters */}
          <section style={{ backgroundColor: '#fff', borderBottom: `1px solid ${colors.stone}`, position: 'sticky', top: 0, zIndex: 30 }}>
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="rounded-full shrink-0 transition-colors duration-200"
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      padding: '0.5rem 1.25rem',
                      background: activeCategory === cat ? gradients.primary : 'transparent',
                      color: activeCategory === cat ? '#fff' : colors.body,
                      border: activeCategory === cat ? 'none' : `1px solid ${colors.stone}`,
                      cursor: 'pointer',
                    }}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Grid */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGroups.map((group, i) => (
                  <CategoryCard key={group.title} group={group} fonts={fonts} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* Packages */}
          {packagesData?.length > 0 && (
            <section style={{ backgroundColor: colors.cream }}>
              <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
                <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Save More</p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Featured Packages</h2>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packagesData.map((pkg, i) => (
                    <motion.div key={pkg.name} className="rounded-2xl p-6 lg:p-8" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                      <span className="inline-block rounded-full px-3 py-1 mb-4" style={{ background: `${colors.violet}10`, fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 700, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{pkg.price}</span>
                      <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>{pkg.name}</h3>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body }}>{pkg.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Membership Teaser */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div className="rounded-2xl overflow-hidden relative" style={{ background: gradients.primary, minHeight: 300 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                  <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-between h-full" style={{ minHeight: 300 }}>
                    <div>
                      <span className="inline-block rounded-full px-3 py-1.5 mb-4" style={{ background: 'rgba(255,255,255,0.15)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>VIP Membership</span>
                      <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Save 15% on Everything</h3>
                      <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '22rem' }}>Monthly treatments, exclusive perks, priority booking, and member-only pricing starting at $100/month.</p>
                    </div>
                    <a href="/beta/memberships" className="rounded-full self-start mt-6" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: '#fff', color: colors.ink, textDecoration: 'none', display: 'inline-block' }}>Learn About Membership</a>
                  </div>
                </motion.div>

                <motion.div className="rounded-2xl p-8 lg:p-10 flex flex-col justify-center" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <span className="inline-block rounded-full px-3 py-1.5 mb-4 self-start" style={{ background: `${colors.violet}10`, fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Flexible Financing</span>
                  <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>0% APR Available</h3>
                  <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: colors.body, lineHeight: 1.6, marginBottom: '1.5rem' }}>Flexible financing through Cherry. Plans starting at 0% APR so you can get the treatments you want on your timeline.</p>
                  <a href="https://pay.withcherry.com/reluxe-med-spa" target="_blank" rel="noopener noreferrer" className="rounded-full self-start" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: gradients.primary, color: '#fff', textDecoration: 'none', display: 'inline-block' }}>Check Your Rate</a>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Questions About Pricing?</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book a free consultation. We&apos;ll build a custom plan with exact pricing &mdash; no surprises.</p>
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

BetaPricing.getLayout = (page) => page;
