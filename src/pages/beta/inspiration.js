import { motion } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { articles } from '@/data/articles';
import GravityBookButton from '@/components/beta/GravityBookButton';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const categories = [
  { name: 'Skin Tips', color: colors.violet },
  { name: 'Treatment Guides', color: colors.fuchsia },
  { name: 'Glow-Up Ideas', color: colors.rose },
];

const skincareTips = [
  { tip: 'Apply SPF every single morning \u2014 even on cloudy days.', source: 'Dr. Protocols' },
  { tip: 'Retinol at night, vitamin C in the morning. Never mix them in the same routine.', source: 'Aesthetician-Approved' },
  { tip: 'Hydrate from the inside out \u2014 half your body weight in ounces of water daily.', source: 'Wellness Basics' },
  { tip: 'Don\u2019t pick. Seriously. Let your aesthetician handle extractions.', source: 'Golden Rule' },
];

export default function BetaInspiration() {
  const featured = articles[0];
  const grid = articles.slice(1);

  return (
    <BetaLayout title="Inspiration" description="Skincare tips, treatment guides, and glow-up ideas from the RELUXE Med Spa team.">
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30%', right: '-15%', width: '60%', height: '160%', background: `linear-gradient(180deg, ${colors.violet}12, ${colors.fuchsia}08, transparent)`, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Inspiration</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Your Skin.{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your Journey.</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '30rem', margin: '0 auto 2rem' }}>
                  Expert skincare tips, treatment deep-dives, and glow-up ideas from the RELUXE team.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map((cat) => (
                    <span key={cat.name} className="rounded-full px-4 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(250,248,245,0.7)', background: `${cat.color}20`, border: `1px solid ${cat.color}30` }}>{cat.name}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Featured Post */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.a
                href={`/beta/inspiration/${featured.slug}`}
                className="block rounded-3xl overflow-hidden relative group"
                style={{ background: featured.gradient, minHeight: 400, textDecoration: 'none' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                <div className="relative z-10 p-10 lg:p-16 flex flex-col justify-end" style={{ minHeight: 400 }}>
                  <span className="inline-block self-start rounded-full px-3 py-1 mb-4" style={{ background: 'rgba(255,255,255,0.15)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{featured.category}</span>
                  <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem', maxWidth: '36rem' }}>{featured.title}</h2>
                  <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '32rem', marginBottom: '1.5rem' }}>{featured.excerpt}</p>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-200 group-hover:gap-3" style={{ background: 'rgba(255,255,255,0.15)', fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#fff', backdropFilter: 'blur(8px)' }}>
                      Read Article
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{featured.readTime}</span>
                  </div>
                </div>
              </motion.a>
            </div>
          </section>

          {/* Articles Grid */}
          <section style={{ backgroundColor: colors.cream }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Latest Articles</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Deep Dives &amp; Quick Tips</h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grid.map((post, i) => (
                  <motion.a
                    key={post.slug}
                    href={`/beta/inspiration/${post.slug}`}
                    className="group rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, textDecoration: 'none' }}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="relative" style={{ height: 160, background: post.gradient }}>
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                      <div className="absolute top-4 left-4">
                        <span className="rounded-full px-2.5 py-1" style={{ background: 'rgba(255,255,255,0.2)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{post.category}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem', lineHeight: 1.3 }}>{post.title}</h3>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, lineHeight: 1.6, marginBottom: '1rem' }}>{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 transition-all duration-200 group-hover:gap-2" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet }}>
                          Read more
                          <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                        <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>{post.readTime}</span>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Tips */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Provider Wisdom</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Quick Skincare Tips</h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {skincareTips.map((item, i) => (
                  <motion.div key={i} className="rounded-2xl p-6 lg:p-8 flex items-start gap-4" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                    <div className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: `${colors.violet}10` }}>
                      <span style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 700, color: colors.violet }}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 500, color: colors.heading, lineHeight: 1.5, marginBottom: '0.5rem' }}>{item.tip}</p>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.source}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center relative">
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Stay in the Know</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white, marginBottom: '0.75rem' }}>Deals, Tips &amp; New Arrivals</h2>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: 'rgba(250,248,245,0.5)', maxWidth: '28rem', margin: '0 auto 2rem' }}>Be the first to know about new patient offers, seasonal deals, and skincare tips from our team.</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input type="email" placeholder="your@email.com" className="flex-1 rounded-full px-5 py-3.5 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.08)', color: colors.white }} />
                  <button className="rounded-full flex-shrink-0" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>Subscribe</button>
                </div>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.3)', marginTop: '0.75rem' }}>No spam. Unsubscribe anytime.</p>
              </motion.div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to Start Your Glow-Up?</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book a free consultation and let our experts build your custom plan.</p>
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

BetaInspiration.getLayout = (page) => page;
