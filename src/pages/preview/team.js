import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewLayout from '@/components/preview/PreviewLayout';
import { colors, fontPairings, typeScale, gradients } from '@/components/preview/tokens';

const providers = [
  { name: 'Shannon', role: 'Owner & Lead Injector', specialty: 'Lip Artistry, Botox, Full-Face Rejuvenation', quote: 'Your face, your rules. I just make it happen.', initials: 'S', bio: 'RELUXE founder with 8+ years in aesthetics. Known for natural results and an obsessive eye for symmetry.' },
  { name: 'Dr. Kim', role: 'Medical Director', specialty: 'Medical Oversight, Advanced Treatments', quote: 'Safety first. Stunning results second.', initials: 'K', bio: 'Board-certified physician overseeing all treatment protocols and ensuring the highest standard of care.' },
  { name: 'Alexis', role: 'Injector', specialty: 'Lip Filler, Cheek Contouring, Jawline', quote: 'Lips are my love language.', initials: 'A', bio: 'Filler specialist with a cult following. Patients drive hours for her lip work.' },
  { name: 'Hannah', role: 'Lead Aesthetician', specialty: 'Facials, Peels, Skin Analysis', quote: 'Clear skin isn\'t luck — it\'s a plan.', initials: 'H', bio: 'Licensed aesthetician passionate about building custom skincare regimens that actually work.' },
  { name: 'Carlee', role: 'Laser Specialist', specialty: 'Laser Hair Removal, IPL, Skin Resurfacing', quote: 'Smooth skin, zero razors. You\'re welcome.', initials: 'C', bio: 'Certified laser technician with expertise on Candela GentleMax Pro for all skin types.' },
  { name: 'Anna', role: 'Injector', specialty: 'Botox, Preventative Aging, Natural Results', quote: 'Natural results that make people wonder.', initials: 'AN', bio: 'Subtle enhancement specialist. Her patients look refreshed, not "done."' },
  { name: 'Jane', role: 'Aesthetician', specialty: 'HydraFacial, Dermaplaning, Chemical Peels', quote: 'Every facial is a mini vacation.', initials: 'J', bio: 'Creates the kind of glow that makes strangers ask what your secret is.' },
  { name: 'Taylor', role: 'Patient Coordinator', specialty: 'Booking, Treatment Plans, Membership', quote: 'I find you the perfect appointment. Every time.', initials: 'T', bio: 'The friendly voice behind the phone. She\'ll help you navigate services and scheduling.' },
];

const values = [
  { title: 'Premium Only', detail: 'We use only FDA-approved, premium products. No knockoffs, no shortcuts.' },
  { title: 'Ongoing Training', detail: 'Every provider completes advanced certifications annually. We stay ahead of the curve.' },
  { title: 'Collaborative Care', detail: 'Our team works together on complex treatment plans. Multiple perspectives, better outcomes.' },
];

const matcherQuestions = [
  {
    question: 'What are you looking for?',
    options: [
      { label: 'Botox or wrinkle treatment', match: ['Shannon', 'Anna', 'Alexis'] },
      { label: 'Lip or facial filler', match: ['Shannon', 'Alexis'] },
      { label: 'Facials or skin treatments', match: ['Hannah', 'Jane'] },
      { label: 'Laser hair removal', match: ['Carlee'] },
      { label: 'I\'m not sure yet', match: ['Taylor'] },
    ],
  },
];

const reviews = [
  { name: 'Jessica R.', provider: 'Shannon', rating: 5, text: 'Shannon is an artist. My lips look absolutely perfect — natural but noticeably fuller. I get compliments constantly.' },
  { name: 'Amanda L.', provider: 'Alexis', rating: 5, text: 'Alexis did my cheek filler and I can\'t stop looking in the mirror. She completely understood the look I wanted.' },
  { name: 'Michelle K.', provider: 'Hannah', rating: 5, text: 'Best facial I\'ve ever had. Hannah analyzed my skin and customized everything. My texture has completely transformed.' },
  { name: 'Sarah T.', provider: 'Carlee', rating: 5, text: 'Laser hair removal with Carlee is painless and effective. I\'m 4 sessions in and already seeing incredible results.' },
  { name: 'Lauren B.', provider: 'Anna', rating: 5, text: 'Anna\'s Botox is so natural. My coworkers keep saying I look well-rested and refreshed. Exactly what I wanted.' },
  { name: 'Courtney M.', provider: 'Shannon', rating: 5, text: 'I was nervous about my first time getting injectables. Shannon made me feel so comfortable and the results are stunning.' },
];

function ProviderCard({ provider, fonts, index }) {
  const gradientColors = [
    `linear-gradient(180deg, ${colors.violet}25, ${colors.violet}06)`,
    `linear-gradient(180deg, ${colors.fuchsia}22, ${colors.fuchsia}05)`,
    `linear-gradient(180deg, ${colors.rose}20, ${colors.rose}04)`,
    `linear-gradient(180deg, ${colors.violet}18, ${colors.fuchsia}06)`,
  ];

  return (
    <motion.div
      className="group rounded-2xl overflow-hidden cursor-pointer"
      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
    >
      <div className="relative" style={{ height: 320, background: gradientColors[index % 4], overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(250,248,245,0.1)', marginBottom: 6, flexShrink: 0 }} />
          <div style={{ width: '70%', height: 90, borderRadius: '50% 50% 0 0', background: 'rgba(250,248,245,0.06)', flexShrink: 0 }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 80, background: 'linear-gradient(to top, #fff, transparent)' }} />
        <div
          className="absolute top-4 right-4 rounded-xl px-4 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxWidth: 180 }}
        >
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.heading, lineHeight: 1.4, fontStyle: 'italic' }}>
            &ldquo;{provider.quote}&rdquo;
          </p>
        </div>
      </div>
      <div className="p-5">
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.125rem' }}>{provider.name}</h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.violet, fontWeight: 500, marginBottom: '0.75rem' }}>{provider.role}</p>
        <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5, marginBottom: '0.75rem' }}>{provider.bio}</p>
        <div className="flex flex-wrap gap-1.5">
          {provider.specialty.split(', ').map((s) => (
            <span key={s} className="rounded-full px-2.5 py-1" style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 500, color: colors.violet, background: `${colors.violet}08`, border: `1px solid ${colors.violet}15` }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ProviderMatcher({ fonts }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (opt) => {
    setSelected(opt);
    setShowResult(true);
  };

  const matchedProviders = selected ? providers.filter((p) => selected.match.includes(p.name)) : [];

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
                  onClick={() => handleSelect(opt)}
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
                {matchedProviders.map((p) => (
                  <div key={p.name} className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.1)' }}>
                    <div className="flex items-center justify-center rounded-full mx-auto mb-3" style={{ width: 56, height: 56, background: `${colors.violet}20` }}>
                      <span style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.violet }}>{p.initials}</span>
                    </div>
                    <h4 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.white, marginBottom: '0.125rem' }}>{p.name}</h4>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.violet, fontWeight: 500, marginBottom: '0.5rem' }}>{p.role}</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)', fontStyle: 'italic' }}>&ldquo;{p.quote}&rdquo;</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Book With {matchedProviders[0]?.name}
                </button>
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

function ReviewCarousel({ fonts }) {
  const [active, setActive] = useState(0);
  const visibleReviews = 3;

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
          <div className="flex gap-2">
            <button
              onClick={() => setActive(Math.max(0, active - 1))}
              className="flex items-center justify-center rounded-full transition-colors duration-200"
              style={{ width: 40, height: 40, backgroundColor: active === 0 ? colors.stone : '#fff', border: `1px solid ${colors.stone}`, cursor: active === 0 ? 'default' : 'pointer', opacity: active === 0 ? 0.5 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke={colors.heading} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              onClick={() => setActive(Math.min(reviews.length - visibleReviews, active + 1))}
              className="flex items-center justify-center rounded-full transition-colors duration-200"
              style={{ width: 40, height: 40, backgroundColor: active >= reviews.length - visibleReviews ? colors.stone : '#fff', border: `1px solid ${colors.stone}`, cursor: active >= reviews.length - visibleReviews ? 'default' : 'pointer', opacity: active >= reviews.length - visibleReviews ? 0.5 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke={colors.heading} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.slice(active, active + visibleReviews).map((review, i) => (
            <motion.div
              key={review.name + active}
              className="rounded-2xl p-6"
              style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(review.rating)].map((_, j) => (
                  <span key={j} style={{ color: colors.violet, fontSize: '0.875rem' }}>★</span>
                ))}
              </div>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${colors.stone}` }}>
                <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: `${colors.violet}10` }}>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet }}>{review.name.charAt(0)}</span>
                </div>
                <div>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>{review.name}</p>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>Patient of {review.provider}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamPage({ fontKey, fonts }) {
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
              12+ expert providers across two locations. Every one of them hand-picked, rigorously trained, and genuinely passionate about what they do.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Provider Spotlight */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Photo placeholder */}
              <div className="rounded-3xl overflow-hidden" style={{ aspectRatio: '3/4', background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}12)`, position: 'relative', maxHeight: 520 }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
                <div className="absolute top-4 left-4 rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured Provider</span>
                </div>
              </div>

              {/* Info */}
              <div>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Meet Shannon</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: colors.heading, lineHeight: 1.1, marginBottom: '0.75rem' }}>
                  Owner &amp; Lead Injector
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.7, color: colors.body, marginBottom: '1.5rem' }}>
                  Shannon founded RELUXE with a simple belief: luxury aesthetics shouldn&rsquo;t mean impersonal. With 8+ years in aesthetics and thousands of faces treated, she&rsquo;s built a practice where artistry meets genuine care.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Lip Artistry', 'Full-Face Rejuvenation', 'Botox Specialist', 'Business Owner'].map((tag) => (
                    <span key={tag} className="rounded-full px-3 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: colors.violet, background: `${colors.violet}08`, border: `1px solid ${colors.violet}15` }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <blockquote className="rounded-xl px-5 py-4 mb-6" style={{ borderLeft: `3px solid ${colors.violet}`, backgroundColor: colors.cream }}>
                  <p style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 500, color: colors.heading, lineHeight: 1.4, fontStyle: 'italic' }}>
                    &ldquo;I treat every patient like I&rsquo;d treat my best friend. Honest advice, expert technique, and results that make you feel like the best version of yourself.&rdquo;
                  </p>
                </blockquote>

                <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Book With Shannon
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Provider Grid */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div className="mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.5rem' }}>
              The Full Team
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body }}>
              Every provider is hand-picked and advanced-certified.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {providers.map((p, i) => (
              <ProviderCard key={p.name} provider={p} fonts={fonts} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Provider Matcher */}
      <ProviderMatcher fonts={fonts} />

      {/* Patient Reviews Carousel */}
      <ReviewCarousel fonts={fonts} />

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
                <motion.div
                  key={v.title}
                  className="rounded-xl p-6"
                  style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, marginBottom: '0.375rem' }}>{v.title}</h3>
                  <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>{v.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture — Free Consultation */}
      <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
              Not Sure Who to See?
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(250,248,245,0.55)', marginBottom: '2rem', maxWidth: '28rem', margin: '0 auto 2rem' }}>
              Book a free consultation and we&rsquo;ll match you with the perfect provider. Tell us a little about yourself.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-3">
              <input
                type="text"
                placeholder="Your name"
                className="flex-1 rounded-full px-5 py-3.5 outline-none"
                style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
              />
              <input
                type="tel"
                placeholder="Phone number"
                className="flex-1 rounded-full px-5 py-3.5 outline-none"
                style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
              />
            </div>
            <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.5rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
              Request Free Consultation
            </button>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.25)', marginTop: '1rem' }}>We&rsquo;ll text you within 1 business hour.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Find Your Provider</h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book a free consultation and we&rsquo;ll match you with the perfect provider for your goals.</p>
          <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.5rem', backgroundColor: colors.ink, color: '#fff', border: 'none', cursor: 'pointer' }}>Book Free Consult</button>
        </div>
      </section>
    </>
  );
}

export default function TeamPageWrapper() {
  return (
    <PreviewLayout title="Team">
      {({ fontKey, fonts }) => <TeamPage fontKey={fontKey} fonts={fonts} />}
    </PreviewLayout>
  );
}

TeamPageWrapper.getLayout = (page) => page;
