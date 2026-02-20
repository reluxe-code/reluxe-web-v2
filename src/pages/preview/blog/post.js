import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewLayout from '@/components/preview/PreviewLayout';
import { colors, fontPairings, typeScale, gradients } from '@/components/preview/tokens';

const relatedPosts = [
  { title: 'The Only Skincare Routine You Actually Need', category: 'Skin Health', readTime: '4 min', gradient: `linear-gradient(135deg, ${colors.fuchsia}20, ${colors.rose}12)` },
  { title: 'Morpheus8: What to Expect Before, During & After', category: 'Treatments', readTime: '6 min', gradient: `linear-gradient(135deg, ${colors.rose}18, ${colors.violet}12)` },
  { title: 'How to Make Your Botox Last Longer', category: 'Injectables', readTime: '3 min', gradient: `linear-gradient(135deg, ${colors.violet}22, ${colors.fuchsia}14)` },
];

function BlogPostPage({ fontKey, fonts }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      {/* Article Header */}
      <section className="relative" style={{ backgroundColor: colors.ink, paddingTop: 120 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: `radial-gradient(ellipse at top left, ${colors.violet}08, transparent 60%)`, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 pb-12 relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-full px-3 py-1" style={{ background: `${colors.violet}20`, fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Injectables</span>
              <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)' }}>5 min read</span>
            </div>
            <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1, color: colors.white, marginBottom: '1.5rem' }}>
              Botox vs. Dysport vs. Daxxify: Which Tox Is Right for You?
            </h1>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.7, color: 'rgba(250,248,245,0.55)', marginBottom: '2rem', maxWidth: '36rem' }}>
              A no-BS breakdown of the three most popular neurotoxins — what they do differently, and how to pick the right one for your goals.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: `${colors.violet}20` }}>
                <span style={{ fontFamily: fonts.display, fontSize: '0.875rem', fontWeight: 600, color: colors.violet }}>S</span>
              </div>
              <div>
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>Shannon</p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>Owner &amp; Lead Injector &middot; Feb 12, 2026</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image Placeholder */}
      <div className="max-w-4xl mx-auto px-6" style={{ marginTop: -1 }}>
        <div className="rounded-2xl overflow-hidden" style={{ height: 'clamp(250px, 35vw, 450px)', background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}12, ${colors.rose}08)`, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'rgba(250,248,245,0.15)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <section style={{ backgroundColor: '#fff' }}>
        <article className="max-w-3xl mx-auto px-6 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.8, color: colors.body }}
          >
            <p className="mb-6" style={{ fontSize: '1.1875rem', color: colors.heading, fontWeight: 500 }}>
              You&rsquo;ve decided you want to try a neurotoxin. Smart move. But now you&rsquo;re staring at three options — Botox, Dysport, and Daxxify — and wondering what the actual difference is. We get it. Here&rsquo;s the real breakdown.
            </p>

            <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 600, color: colors.heading, marginTop: '2.5rem', marginBottom: '1rem' }}>
              First: They All Do the Same Basic Thing
            </h2>
            <p className="mb-4">
              All three are FDA-approved neurotoxins (botulinum toxin type A) that temporarily relax the muscles responsible for wrinkles. Same concept, different formulations. Think of it like three different luxury car brands — they&rsquo;ll all get you there, but the ride is a little different.
            </p>

            <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 600, color: colors.heading, marginTop: '2.5rem', marginBottom: '1rem' }}>
              Botox: The OG
            </h2>
            <p className="mb-4">
              Botox by Allergan is the most well-known and extensively studied neurotoxin on the market. It&rsquo;s been FDA-approved for cosmetic use since 2002 and has decades of safety data behind it.
            </p>
            <ul className="mb-6 space-y-2" style={{ paddingLeft: '1.25rem' }}>
              <li><strong style={{ color: colors.heading }}>Onset:</strong> 5–7 days</li>
              <li><strong style={{ color: colors.heading }}>Duration:</strong> 3–4 months</li>
              <li><strong style={{ color: colors.heading }}>Best for:</strong> Precise, targeted treatment. Great for crow&rsquo;s feet and smaller areas.</li>
              <li><strong style={{ color: colors.heading }}>Price:</strong> From $12/unit at RELUXE</li>
            </ul>

            {/* Pull quote */}
            <blockquote className="my-10 py-8 px-8 rounded-2xl" style={{ background: colors.cream, borderLeft: `4px solid ${colors.violet}` }}>
              <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.heading, lineHeight: 1.4, fontStyle: 'italic', marginBottom: '0.75rem' }}>
                &ldquo;If you&rsquo;re a first-timer, Botox is a great starting point. It&rsquo;s predictable, well-studied, and the results speak for themselves.&rdquo;
              </p>
              <cite style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.violet, fontWeight: 600, fontStyle: 'normal' }}>— Shannon, Lead Injector at RELUXE</cite>
            </blockquote>

            {/* Inline Newsletter Signup */}
            <div className="my-10 rounded-2xl p-6 lg:p-8" style={{ background: `linear-gradient(135deg, ${colors.violet}08, ${colors.fuchsia}04)`, border: `1px solid ${colors.violet}15` }}>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>
                    Get Tips Like This in Your Inbox
                  </h3>
                  <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body }}>
                    Weekly skincare tips, treatment guides, and exclusive offers.
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 sm:w-48 rounded-full px-4 py-2.5 outline-none"
                    style={{ fontFamily: fonts.body, fontSize: '0.8125rem', backgroundColor: '#fff', border: `1px solid ${colors.stone}`, color: colors.heading }}
                  />
                  <button className="rounded-full flex-shrink-0" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, padding: '0.625rem 1.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 600, color: colors.heading, marginTop: '2.5rem', marginBottom: '1rem' }}>
              Dysport: The Fast One
            </h2>
            <p className="mb-4">
              Dysport by Galderma is known for its faster onset and more natural spread pattern. Many patients say it feels &ldquo;lighter&rdquo; and allows for more natural facial expressions, especially across the forehead.
            </p>

            <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 600, color: colors.heading, marginTop: '2.5rem', marginBottom: '1rem' }}>
              Daxxify: The Newcomer
            </h2>
            <p className="mb-4">
              Daxxify by Revance is the newest player and the first neurotoxin that can last 6–9 months. Yes, you read that right. Fewer appointments, longer results. It&rsquo;s quickly becoming a favorite among patients who want low-maintenance beauty.
            </p>

            {/* Interactive Treatment CTA */}
            <div className="my-10 rounded-2xl overflow-hidden" style={{ background: gradients.primary, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
              <div className="relative p-6 lg:p-8 text-center">
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  Ready to Try Tox?
                </h3>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem' }}>
                  New patients get $10/unit Botox. Book your free consultation.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', backgroundColor: '#fff', color: colors.ink, border: 'none', cursor: 'pointer' }}>
                    Book Free Consult
                  </button>
                  <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', backgroundColor: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                    View Pricing
                  </button>
                </div>
              </div>
            </div>

            <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 600, color: colors.heading, marginTop: '2.5rem', marginBottom: '1rem' }}>
              So Which One Should You Pick?
            </h2>
            <p className="mb-6">
              Honestly? Your provider should help you decide. The best neurotoxin for you depends on your anatomy, goals, and lifestyle. At RELUXE, we carry all three and your injector will recommend the best option based on your consultation.
            </p>
            <p>
              The important thing is that you&rsquo;re in expert hands — not which brand is in the syringe.
            </p>
          </motion.div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-12 pt-8" style={{ borderTop: `1px solid ${colors.stone}` }}>
            {['Botox', 'Dysport', 'Daxxify', 'Injectables', 'Anti-Aging'].map((tag) => (
              <span key={tag} className="rounded-full px-3 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.body, backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>{tag}</span>
            ))}
          </div>

          {/* Share Section */}
          <div className="mt-8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderTop: `1px solid ${colors.stone}` }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>Share this article</p>
            <div className="flex gap-2">
              {[
                { label: 'Facebook', icon: 'f' },
                { label: 'Instagram', icon: 'ig' },
                { label: 'Copy Link', icon: '🔗' },
              ].map((social) => (
                <button
                  key={social.label}
                  className="flex items-center justify-center rounded-full transition-colors duration-200"
                  style={{ width: 40, height: 40, backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, cursor: 'pointer', fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.heading }}
                  title={social.label}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Author bio */}
          <div className="mt-12 rounded-2xl p-6 flex items-start gap-5" style={{ backgroundColor: colors.cream }}>
            <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 56, height: 56, backgroundColor: `${colors.violet}15` }}>
              <span style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.violet }}>S</span>
            </div>
            <div>
              <p style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>Shannon</p>
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.violet, fontWeight: 500, marginBottom: '0.5rem' }}>Owner &amp; Lead Injector</p>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>
                RELUXE founder with 8+ years in aesthetics. Known for natural results, lip artistry, and an obsessive eye for facial symmetry.
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Content Upgrade — Free Guide Download */}
      <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="inline-block rounded-full px-3 py-1.5 mb-4" style={{ background: `${colors.violet}20`, fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Free Guide
              </span>
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
                The First-Timer&rsquo;s Guide to Injectables
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(250,248,245,0.55)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Everything you need to know before your first Botox or filler appointment — what to expect, how to prep, aftercare tips, and honest answers to the questions you&rsquo;re too nervous to ask.
              </p>
              <ul className="space-y-2 mb-6">
                {['What each treatment actually does', 'How to choose the right provider', 'Pre & post-care checklists', 'Real cost breakdowns'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill={`${colors.violet}30`} /><path d="M5 8L7 10L11 6" stroke={colors.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.7)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <AnimatePresence mode="wait">
                {!showGuide ? (
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl p-6 lg:p-8" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.1)' }}>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.white, marginBottom: '1rem' }}>
                      Get the Free Guide
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="First name"
                        className="w-full rounded-lg px-4 py-3 outline-none"
                        style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        className="w-full rounded-lg px-4 py-3 outline-none"
                        style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
                      />
                      <button
                        onClick={() => setShowGuide(true)}
                        className="w-full rounded-lg"
                        style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        Send Me the Guide
                      </button>
                    </div>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.25)', marginTop: '0.75rem', textAlign: 'center' }}>Free. No spam. Unsubscribe anytime.</p>
                  </motion.div>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.1)' }}>
                    <div className="text-4xl mb-4">✨</div>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.white, marginBottom: '0.5rem' }}>
                      Check Your Inbox!
                    </h3>
                    <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: 'rgba(250,248,245,0.5)', marginBottom: '1.5rem' }}>
                      Your guide is on its way. In the meantime...
                    </p>
                    <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Book a Free Consult
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div className="mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Keep Reading</h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {relatedPosts.map((post, i) => (
              <motion.a
                key={post.title}
                href="#"
                className="group block rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, textDecoration: 'none' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="relative" style={{ height: 180, background: post.gradient, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
                  <div className="absolute top-4 left-4 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{post.category}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, lineHeight: 1.35, marginBottom: '0.5rem' }}>{post.title}</h3>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>{post.readTime}</span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA — Book a Consult */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            Ready to Try It?
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
            Book a free consultation and your injector will help you choose the right tox for your goals.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: '#fff', color: colors.ink, border: 'none', cursor: 'pointer' }}>
              Book Free Consult
            </button>
            <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              View All Services
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function BlogPostWrapper() {
  return (
    <PreviewLayout title="Blog Post">
      {({ fontKey, fonts }) => <BlogPostPage fontKey={fontKey} fonts={fonts} />}
    </PreviewLayout>
  );
}

BlogPostWrapper.getLayout = (page) => page;
