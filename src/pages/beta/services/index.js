import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import ServiceCardGrid from '@/components/beta/ServiceCardGrid';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { getServicesList } from '@/data/servicesList';
import { getTestimonialsSSR } from '@/lib/testimonials';
import GravityBookButton from '@/components/beta/GravityBookButton';
import MemberPageWidget from '@/components/beta/MemberPageWidget';

/* ─── grain texture ─── */
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─── privacy helper ─── */
const privacyName = (n) => {
  if (!n) return 'Patient';
  return n.includes(' ') ? n.split(' ')[0] + ' ' + n.split(' ').pop()[0] + '.' : n;
};

/* ─── quiz data ─── */
const quizSteps = [
  {
    question: "What's your primary goal?",
    options: [
      { label: 'Smooth wrinkles & fine lines', icon: '✨', next: 1, tags: ['tox'] },
      { label: 'Add volume or contour', icon: '💎', next: 1, tags: ['filler'] },
      { label: 'Improve skin texture & tone', icon: '🔬', next: 1, tags: ['morpheus8', 'peels'] },
      { label: 'Remove unwanted hair', icon: '⚡', next: null, tags: ['laser-hair-removal'] },
      { label: 'Tighten or sculpt my body', icon: '💪', next: null, tags: ['evolvex'] },
    ],
  },
  {
    question: 'How much downtime can you handle?',
    options: [
      { label: 'Zero — back to life immediately', icon: '🏃', next: null, tags: ['tox', 'filler', 'clearlift', 'glo2facial'] },
      { label: 'A day or two is fine', icon: '📅', next: null, tags: ['skinpen', 'peels', 'ipl'] },
      { label: 'I want max results, whatever it takes', icon: '🔥', next: null, tags: ['morpheus8', 'co2'] },
    ],
  },
];

const quizResults = {
  tox: { title: 'Tox (Botox/Dysport)', slug: 'tox', desc: 'Smooths lines while keeping your natural expression.' },
  filler: { title: 'Dermal Fillers', slug: 'filler', desc: 'Restores volume and contours for a refreshed look.' },
  morpheus8: { title: 'Morpheus8', slug: 'morpheus8', desc: 'RF microneedling that rebuilds collagen from within.' },
  peels: { title: 'Chemical Peels', slug: 'peels', desc: 'Reveals fresh, smooth skin underneath.' },
  'laser-hair-removal': { title: 'Laser Hair Removal', slug: 'laser-hair-removal', desc: 'Permanent hair reduction. No more shaving.' },
  evolvex: { title: 'EvolveX Body', slug: 'evolvex', desc: 'RF body sculpting and skin tightening.' },
  clearlift: { title: 'ClearLift', slug: 'clearlift', desc: 'Zero-downtime laser with real results.' },
  glo2facial: { title: 'GLO2Facial', slug: 'glo2facial', desc: 'Instant glow with zero downtime.' },
  skinpen: { title: 'SkinPen', slug: 'skinpen', desc: 'Microneedling for smoother, more even skin.' },
  ipl: { title: 'IPL Photofacial', slug: 'ipl', desc: 'Clears sun spots, redness, and uneven tone.' },
  co2: { title: 'CO₂ Laser', slug: 'co2', desc: 'Gold standard for deep resurfacing.' },
};

/* ─── scrolling ticker ─── */
function TreatmentTicker({ fonts }) {
  const treatments = ['Botox', 'Lip Filler', 'Morpheus8', 'Laser Hair Removal', 'HydraFacial', 'Chemical Peels', 'IPL', 'Sculptra', 'ClearLift', 'EvolveX', 'SkinPen', 'CO₂ Laser', 'Massage', 'GLO2Facial'];
  const doubled = [...treatments, ...treatments];

  return (
    <div className="overflow-hidden" style={{ borderTop: `1px solid rgba(250,248,245,0.08)`, borderBottom: `1px solid rgba(250,248,245,0.08)` }}>
      <motion.div
        className="flex gap-8 py-4 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-3 shrink-0">
            <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)' }}>{t}</span>
            <span style={{ color: colors.violet, fontSize: '0.5rem' }}>●</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── quiz component ─── */
function TreatmentQuiz({ fonts, fontKey }) {
  const [step, setStep] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState('');
  const [captured, setCaptured] = useState(false);

  function handleOption(opt) {
    const newTags = [...selectedTags, ...opt.tags];
    setSelectedTags(newTags);
    if (opt.next !== null) {
      setStep(opt.next);
    } else {
      setShowResults(true);
    }
  }

  function reset() {
    setStep(0);
    setSelectedTags([]);
    setShowResults(false);
  }

  async function handleCapture(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', email, phone: '', message: `Quiz results: ${selectedTags.join(', ')}`, location: 'services-quiz', pageUrl: '/beta/services' }),
      });
    } catch {}
    setCaptured(true);
  }

  // Deduplicate and get top results
  const resultSlugs = [...new Set(selectedTags)].slice(0, 3);
  const results = resultSlugs.map((t) => quizResults[t]).filter(Boolean);

  return (
    <section id="quiz" style={{ backgroundColor: colors.ink, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '10%', right: 0, width: '50%', height: '80%', background: `radial-gradient(ellipse at right, ${colors.violet}08, transparent 70%)`, pointerEvents: 'none' }} />

      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28 relative">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-5" style={{ background: `${colors.violet}15`, border: `1px solid ${colors.violet}30` }}>
            <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>60-Second Quiz</span>
          </div>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white, marginBottom: '0.75rem' }}>
            Not Sure Where to Start?
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(250,248,245,0.45)', maxWidth: '26rem', margin: '0 auto' }}>
            Answer a couple quick questions and we&rsquo;ll match you with your perfect treatment.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key={`step-${step}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
              {/* Progress */}
              <div className="flex justify-center gap-2 mb-8">
                {quizSteps.map((_, i) => (
                  <div key={i} className="rounded-full" style={{ width: i <= step ? 32 : 8, height: 8, background: i <= step ? gradients.primary : 'rgba(250,248,245,0.1)', transition: 'all 0.3s' }} />
                ))}
              </div>

              <h3 className="text-center mb-6" style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.white }}>
                {quizSteps[step].question}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quizSteps[step].options.map((opt, i) => (
                  <motion.button
                    key={opt.label}
                    className="rounded-xl text-left p-5 transition-all duration-200 flex items-center gap-3"
                    style={{ backgroundColor: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.08)', cursor: 'pointer' }}
                    whileHover={{ backgroundColor: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)' }}
                    onClick={() => handleOption(opt)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{opt.icon}</span>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 500, color: colors.white }}>{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-6">
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.white, marginBottom: '0.5rem' }}>
                  Your Perfect Match{results.length > 1 ? 'es' : ''}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                {results.map((r, i) => (
                  <motion.a
                    key={r.slug}
                    href={`/beta/services/${r.slug}`}
                    className="rounded-2xl p-5 text-center group"
                    style={{ background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.1)', textDecoration: 'none' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ backgroundColor: 'rgba(124,58,237,0.12)', borderColor: 'rgba(124,58,237,0.3)', y: -4 }}
                  >
                    <h4 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.white, marginBottom: '0.375rem' }}>{r.title}</h4>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)', lineHeight: 1.5, marginBottom: '0.75rem' }}>{r.desc}</p>
                    <span className="inline-flex items-center gap-1 transition-all duration-200 group-hover:gap-2" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet }}>
                      Learn More
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </motion.a>
                ))}
              </div>

              {/* Email capture on results */}
              {!captured ? (
                <motion.div className="max-w-md mx-auto text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.4)', marginBottom: '0.75rem' }}>
                    Want a custom plan based on your results? Drop your email.
                  </p>
                  <form onSubmit={handleCapture} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 rounded-full px-5 py-3 outline-none"
                      style={{ fontFamily: fonts.body, fontSize: '0.875rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.1)', color: colors.white }}
                    />
                    <button type="submit" className="rounded-full shrink-0" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 1.5rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Send
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.p className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.violet }}>
                  We&rsquo;ll be in touch with your personalized plan.
                </motion.p>
              )}

              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <GravityBookButton fontKey={fontKey} size="hero" />
                <button className="rounded-full" onClick={reset} style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: 'transparent', color: 'rgba(250,248,245,0.5)', border: '1px solid rgba(250,248,245,0.12)', cursor: 'pointer' }}>
                  Retake Quiz
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── page ─── */

function ServicesPage({ fontKey, fonts, services, testimonials }) {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: colors.ink }}>
        {/* Background accents */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '80%', background: `radial-gradient(ellipse at center, ${colors.violet}12, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50%', height: '60%', background: `radial-gradient(ellipse at center, ${colors.fuchsia}08, transparent 65%)`, pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-6 relative" style={{ paddingTop: 'clamp(7rem, 12vw, 10rem)', paddingBottom: 'clamp(4rem, 8vw, 6rem)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1.25rem' }}>
                Our Treatments
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, color: colors.white, marginBottom: '1.25rem' }}>
                Expert Treatments.<br />
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Real Results.
                </span>
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginBottom: '2rem' }}>
                40+ FDA-approved treatments delivered by NPs, PAs, and licensed aestheticians. No assembly lines, no upselling &mdash; just honest expert care.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <GravityBookButton fontKey={fontKey} size="hero" />
                <a
                  href="#treatments"
                  className="rounded-full transition-all duration-200 hover:bg-white/5"
                  style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2rem', color: 'rgba(250,248,245,0.6)', border: '1.5px solid rgba(250,248,245,0.12)', textDecoration: 'none', display: 'inline-block' }}
                >
                  Browse Treatments
                </a>
              </div>

              {/* Trust stat strip */}
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {[
                  { value: '40+', label: 'Treatments' },
                  { value: '5.0', label: 'Google Rating' },
                  { value: '2', label: 'Locations' },
                  { value: '6+', label: 'Years Experience' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white }}>{stat.value}</span>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)' }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Member widget (right column — hidden when logged out) */}
            <motion.div className="relative" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
              <MemberPageWidget variant="services" fonts={fonts} />
            </motion.div>
          </div>
        </div>

        {/* Treatment ticker */}
        <TreatmentTicker fonts={fonts} />
      </section>

      {/* ═══ SERVICE CARD GRID ═══ */}
      <div id="treatments">
        <ServiceCardGrid
          services={services}
          fonts={fonts}
          label="Our Treatments"
          heading="Find Your Perfect Treatment"
        />
      </div>

      {/* ═══ SOCIAL PROOF STRIP ═══ */}
      {testimonials.length > 0 && (
        <section style={{ backgroundColor: '#fff', borderTop: `1px solid ${colors.stone}`, borderBottom: `1px solid ${colors.stone}` }}>
          <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Left: rating */}
              <motion.div className="shrink-0" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: colors.violet, fontSize: '1.125rem' }}>★</span>
                  ))}
                </div>
                <p style={{ fontFamily: fonts.display, fontSize: '1.75rem', fontWeight: 700, color: colors.heading }}>
                  5.0 <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 400, color: colors.muted }}>from {testimonials.length}+ reviews</span>
                </p>
              </motion.div>

              {/* Right: scrolling testimonials */}
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {testimonials.slice(0, 6).map((t, i) => (
                    <motion.div
                      key={t.id || i}
                      className="rounded-xl p-4 shrink-0"
                      style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, minWidth: 280, maxWidth: 320 }}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                    >
                      <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, lineHeight: 1.5, fontStyle: 'italic', marginBottom: '0.5rem' }}>
                        &ldquo;{(t.quote || '').length > 120 ? t.quote.slice(0, 120) + '...' : t.quote}&rdquo;
                      </p>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.muted }}>
                        {privacyName(t.author_name)}
                        {t.service && <span style={{ color: colors.violet }}> &middot; {t.service}</span>}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ QUIZ / LEAD CAPTURE ═══ */}
      <TreatmentQuiz fonts={fonts} fontKey={fontKey} />

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>How It Works</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '1rem' }}>
                From Consult to Confidence in 4 Steps
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.6, color: colors.body, maxWidth: '28rem', marginBottom: '2rem' }}>
                No awkward sales pitches. No assembly-line vibes. Just a genuine consultation with an expert who actually listens.
              </p>
              <GravityBookButton fontKey={fontKey} size="hero" />
            </motion.div>

            <div className="space-y-4">
              {[
                { step: '01', title: 'Free Consultation', detail: 'We learn your goals, assess your anatomy, and discuss all options. Zero pressure to book anything.', accent: colors.violet },
                { step: '02', title: 'Custom Plan', detail: 'Your provider builds a treatment plan around your goals, timeline, and budget \u2014 not a one-size-fits-all menu.', accent: colors.fuchsia },
                { step: '03', title: 'Treatment', detail: 'Relax in a private suite while your provider works. Most treatments take 15\u201345 minutes.', accent: colors.rose },
                { step: '04', title: 'Aftercare + Follow-Up', detail: 'Clear instructions, direct text access to your provider, and a follow-up already on the calendar.', accent: colors.violet },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  className="rounded-xl p-5 flex gap-4"
                  style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 44, height: 44, background: `${s.accent}10`, fontFamily: fonts.display, fontSize: '0.875rem', fontWeight: 700, color: s.accent }}
                  >
                    {s.step}
                  </span>
                  <div>
                    <h4 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>{s.title}</h4>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, lineHeight: 1.5 }}>{s.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Ready to Get Started?
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
              Book a free consultation. We&rsquo;ll build a custom plan around your goals.
            </p>
            <div className="flex justify-center">
              <GravityBookButton fontKey={fontKey} size="hero" />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ─── wrapper + data fetching ─── */

export default function BetaServicesIndex({ services, testimonials }) {
  return (
    <BetaLayout title="Services" description="Browse all treatments at RELUXE Med Spa. Botox, fillers, laser hair removal, facials, and more. Transparent pricing and expert providers.">
      {({ fontKey, fonts }) => <ServicesPage fontKey={fontKey} fonts={fonts} services={services} testimonials={testimonials} />}
    </BetaLayout>
  );
}

export async function getStaticProps() {
  let services = [];
  try {
    const allServices = await getServicesList();
    services = allServices.map((s) => ({
      slug: s.slug,
      name: s.name,
      tagline: s.tagline || '',
      indexable: s.indexable !== false,
    }));
  } catch (e) {
    console.warn('Beta services: could not load services list', e.message);
  }

  let testimonials = [];
  try {
    testimonials = await getTestimonialsSSR({ limit: 50 });
  } catch {}

  return {
    props: { services, testimonials },
    revalidate: 3600,
  };
}

BetaServicesIndex.getLayout = (page) => page;
