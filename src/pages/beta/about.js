import { motion } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { getServiceClient } from '@/lib/supabase';
import GravityBookButton from '@/components/beta/GravityBookButton';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const values = [
  { title: 'Personal', body: 'We recommend what\u2019s right for you \u2014 not everything we offer. Your plan is built around your goals, your skin, your timeline.', icon: 'user' },
  { title: 'Honest', body: 'Transparent pricing, straight talk, no pressure. We\u2019d rather earn your trust than \u201Cwin\u201D your booking.', icon: 'check' },
  { title: 'Elevated', body: 'World-class devices, advanced techniques, luxury spaces \u2014 and providers who actually care about the outcome.', icon: 'sparkle' },
];

const pillars = [
  { title: 'Results First', copy: 'Luxury means outcomes that boost your confidence. Natural, noticeable, never overdone.' },
  { title: 'Elevated Experience', copy: 'Expect the best \u2014 world-class tech, advanced techniques, and providers who raise the bar.' },
  { title: 'Smart Education', copy: 'We do the nerdy science so you don\u2019t have to \u2014 explaining simply, treating precisely, delivering results.' },
];

const highlights = [
  { title: 'Natural Results', copy: 'We focus on enhancing \u2014 not changing \u2014 your features. Results that look like you, only refreshed.' },
  { title: 'Expert Team', copy: 'Nurse practitioners, RNs, and aestheticians with advanced training in injectables, facials, and lasers.' },
  { title: 'Cutting-Edge Tech', copy: 'Morpheus8, Opus, EvolveX, Alma Harmony \u2014 world-class devices for transformative results.' },
  { title: 'Education-First', copy: 'We explain every option clearly so you feel confident, never pressured.' },
  { title: 'Luxury Experience', copy: 'Modern, welcoming spaces in Carmel and Westfield designed for comfort and confidence.' },
  { title: 'Community Roots', copy: 'Proudly serving patients across Carmel, Westfield, Zionsville, and North Indianapolis.' },
];

function Icon({ name }) {
  if (name === 'user') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if (name === 'check') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
}

export default function BetaAbout({ staff }) {
  return (
    <BetaLayout title="About RELUXE" description="RELUXE Med Spa in Carmel and Westfield is redefining luxury in aesthetics. Fun, fresh, bold \u2014 with expert injectors, advanced tech, and natural results you\u2019ll love.">
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30%', right: '-15%', width: '60%', height: '160%', background: `linear-gradient(180deg, ${colors.violet}12, ${colors.fuchsia}08, transparent)`, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1.5rem' }}>About Us</p>
                  <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1.5rem' }}>
                    Redefining Luxury{' '}
                    <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in Aesthetics.</span>
                  </h1>
                  <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.7, color: 'rgba(250,248,245,0.6)', maxWidth: '28rem', marginBottom: '2rem' }}>
                    Fun. Fresh. Bold. At RELUXE, luxury isn&apos;t about being stuffy &mdash; it&apos;s about results. How you look. How you feel. That&apos;s our focus across Carmel &amp; Westfield.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <GravityBookButton fontKey={fontKey} size="hero" />
                    <a href="/beta/services" className="rounded-full flex items-center gap-2" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', color: 'rgba(250,248,245,0.7)', border: '1.5px solid rgba(250,248,245,0.2)', textDecoration: 'none' }}>Explore Services</a>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
                  <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '4/5', background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}15, ${colors.rose}10)` }}>
                    <img src="/images/about/hero-team.jpg" alt="RELUXE Med Spa team" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none', opacity: 0.03 }} />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Our Story */}
          <section style={{ backgroundColor: colors.cream, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '50%', height: '140%', background: `linear-gradient(180deg, ${colors.violet}06, ${colors.fuchsia}04, transparent)`, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                  <p className="mb-4" style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet }}>Our Story</p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08, color: colors.heading, marginBottom: '1.5rem' }}>
                    Built by Family.{' '}
                    <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Driven by Results.</span>
                  </h2>
                  <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.7, color: colors.body, marginBottom: '1.25rem' }}>
                    RELUXE started with a simple idea: what if a med spa actually put you first? Not upsells. Not volume. Not a corporate playbook. Just expert providers, honest advice, and results you can see.
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.7, color: colors.body, marginBottom: '2rem' }}>
                    We opened in Westfield in 2023 and expanded to Carmel because the demand was real &mdash; people were tired of cookie-cutter clinics. We&rsquo;re family-founded, locally owned, and our name is on every decision we make. That changes everything.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {[
                      { left: 'Results', right: 'Deals', symbol: '>' },
                      { left: 'Trust', right: 'Margin', symbol: '>' },
                      { left: 'Education', right: 'Pressure', symbol: '>' },
                    ].map((pill) => (
                      <span key={pill.left} className="inline-flex items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.heading }}>
                        <span style={{ fontWeight: 700 }}>{pill.left}</span>
                        <span style={{ color: colors.violet, fontWeight: 700 }}>{pill.symbol}</span>
                        <span style={{ color: colors.muted }}>{pill.right}</span>
                      </span>
                    ))}
                  </div>
                </motion.div>
                <motion.div className="space-y-4" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
                  {values.map((card, i) => (
                    <motion.div key={card.title} className="rounded-2xl p-6 lg:p-8" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: `${colors.violet}10` }}>
                          <Icon name={card.icon} />
                        </div>
                        <div>
                          <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, marginBottom: '0.375rem' }}>{card.title}</h3>
                          <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body }}>{card.body}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          {/* Philosophy */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>The RELUXE Philosophy</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.75rem' }}>Redefining What Luxury Means</h2>
                <p className="max-w-2xl mx-auto" style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body }}>
                  Not stuffy or tired &mdash; fun, fresh, bold. Luxury is about results and how they make you feel.
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pillars.map((pillar, i) => (
                  <motion.div key={pillar.title} className="rounded-2xl p-8" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <div className="flex items-center justify-center rounded-xl mb-5" style={{ width: 48, height: 48, background: `${colors.violet}10` }}>
                      <span style={{ fontSize: '1.25rem', color: colors.violet, fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>{pillar.title}</h3>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body }}>{pillar.copy}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* What Sets Us Apart */}
          <section style={{ backgroundColor: colors.cream }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>What Sets Us Apart</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>The RELUXE Difference</h2>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {highlights.map((h, i) => (
                  <motion.div key={h.title} className="rounded-2xl p-6 lg:p-8" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>{h.title}</h3>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body }}>{h.copy}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Meet the Team teaser */}
          {staff?.length > 0 && (
            <section style={{ backgroundColor: '#fff' }}>
              <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
                <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Our Team</p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.75rem' }}>The People Behind the Glow</h2>
                  <p className="max-w-md mx-auto" style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body }}>Skilled providers and staff who bring expertise and care to every visit.</p>
                </motion.div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {staff.slice(0, 8).map((member, i) => (
                    <motion.a key={member.slug} href={`/beta/team/${member.slug}`} className="group block rounded-2xl overflow-hidden" style={{ textDecoration: 'none', backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                        {(member.transparent_bg || member.featured_image) ? (
                          <img src={member.transparent_bg || member.featured_image} alt={member.name} className="transition-transform duration-500 group-hover:scale-105" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.violet}15, ${colors.fuchsia}10)` }}>
                            <span style={{ fontSize: '2rem', color: colors.violet, fontWeight: 700, fontFamily: fonts.display }}>{member.name?.[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 text-center">
                        <p style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600, color: colors.heading }}>{member.name}</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.violet, fontWeight: 500 }}>{member.title || member.role}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
                <motion.div className="text-center mt-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <a href="/beta/team" className="rounded-full inline-flex items-center" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.violet, border: `1.5px solid ${colors.violet}`, padding: '0.625rem 1.75rem', textDecoration: 'none' }}>Meet All Providers &rarr;</a>
                </motion.div>
              </div>
            </section>
          )}

          {/* Locations CTA */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: 'rgba(250,248,245,0.4)', marginBottom: '1rem' }}>Two Locations</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white }}>Come Find Us</h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'Westfield', tagline: 'The Original', address: '514 E State Road 32, Westfield, IN 46074', gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6, #1E1B4B)' },
                  { name: 'Carmel', tagline: 'The Expansion', address: '10485 N Pennsylvania St, Carmel, IN 46280', gradient: 'linear-gradient(135deg, #C026D3, #9333EA, #5B21B6)' },
                ].map((loc, i) => (
                  <motion.a key={loc.name} href={`/beta/locations/${loc.name.toLowerCase()}`} className="group relative rounded-2xl overflow-hidden block" style={{ minHeight: 260, textDecoration: 'none' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: loc.gradient }} />
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: grain.replace('0.04', '1'), backgroundSize: '128px 128px' }} />
                    <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-between h-full" style={{ minHeight: 260 }}>
                      <span className="inline-block self-start rounded-full px-4 py-1.5 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.12)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>{loc.tagline}</span>
                      <div>
                        <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{loc.name}</h3>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(255,255,255,0.65)', marginBottom: '1rem' }}>{loc.address}</p>
                        <span className="inline-flex items-center gap-2 transition-all duration-200 group-hover:gap-3" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                          Visit Location
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Discover the RELUXE Difference</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>From Botox and fillers to facials, massage, and laser treatments &mdash; experience what luxury really means.</p>
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
  let staff = [];
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from('staff')
      .select('id, slug, name, title, role, featured_image, transparent_bg')
      .eq('status', 'published')
      .order('sort_order')
      .order('name')
      .limit(8);
    staff = data || [];
  } catch (e) {
    console.warn('Beta about: could not fetch staff', e.message);
  }
  return { props: { staff }, revalidate: 3600 };
}

BetaAbout.getLayout = (page) => page;
