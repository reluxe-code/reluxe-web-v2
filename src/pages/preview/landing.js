import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { fontPairings, colors, typeScale, gradients } from '@/components/preview/tokens';

const FONT_KEYS = ['bold', 'dramatic', 'modern'];

const benefits = [
  { title: 'Expert Injectors Only', detail: 'Every provider is hand-picked and advanced-certified. No newbies practicing on your face.' },
  { title: 'Premium Products', detail: 'Authentic Allergan Botox, Galderma fillers, and FDA-approved everything. No knockoffs.' },
  { title: 'Luxury Private Suites', detail: 'No curtain dividers. Just you, your provider, and a beautiful private space.' },
  { title: 'Zero Pressure', detail: 'We don\'t upsell. We build a plan around your goals and your budget. Period.' },
];

const socialProof = [
  { stat: '500+', label: '5-Star Reviews' },
  { stat: '15k+', label: 'Treatments Done' },
  { stat: '4.9', label: 'Average Rating' },
];

const beforeAfters = [
  { area: 'Forehead Lines', gradient: `linear-gradient(135deg, ${colors.violet}25, ${colors.fuchsia}15)` },
  { area: 'Crow\'s Feet', gradient: `linear-gradient(135deg, ${colors.fuchsia}22, ${colors.rose}12)` },
];

const faqs = [
  { q: 'Does Botox hurt?', a: 'Most patients describe it as a tiny pinch. We use ultra-fine needles and the whole treatment takes about 10 minutes. Many of our patients say it\'s easier than getting blood drawn.' },
  { q: 'How long does it last?', a: 'Botox typically lasts 3–4 months. With regular treatments, some patients find their results last even longer as the muscles become trained to relax.' },
  { q: 'When will I see results?', a: 'You\'ll start to notice smoothing within 3–5 days, with full results visible at 2 weeks. It\'s a gradual, natural-looking improvement.' },
  { q: 'Is this offer really $10/unit?', a: 'Yes! New patients get Botox at $10/unit (regular price is $12/unit). No hidden fees, no minimum purchase. Just great Botox at an introductory rate.' },
  { q: 'What if I\'ve never had Botox before?', a: 'Perfect — this offer is designed for you. Your injector will do a full consultation, explain everything, and only recommend what makes sense for your goals. Zero pressure.' },
];

const trustLogos = ['Allergan', 'Galderma', 'Revance', 'RealSelf Top Doc', 'BBB A+'];

function CountdownTimer({ fonts }) {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 32, seconds: 47 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-center gap-3">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="rounded-lg flex items-center justify-center" style={{ width: 56, height: 56, backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.1)' }}>
            <span style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.white }}>
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <span style={{ fontFamily: fonts.body, fontSize: '0.6rem', fontWeight: 600, color: 'rgba(250,248,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, display: 'block' }}>{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function FAQSection({ fonts }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.5rem' }}>
            Common Questions
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body }}>
            Real answers. No BS.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600, color: colors.heading }}>{faq.q}</span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontSize: '1.25rem', color: colors.violet, flexShrink: 0, marginLeft: 16 }}
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.6 }}>{faq.a}</p>
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

export default function LandingPage() {
  const router = useRouter();
  const fontKey = FONT_KEYS.includes(router.query.font) ? router.query.font : 'bold';
  const fonts = fontPairings[fontKey];

  return (
    <>
      <Head>
        <title>New Patient Botox Offer — RELUXE Med Spa</title>
        <meta name="robots" content="noindex, nofollow" />
        {Object.values(fontPairings).map((fp) => (
          <link key={fp.name} rel="stylesheet" href={fp.googleUrl} />
        ))}
      </Head>

      <div style={{ backgroundColor: '#fff' }}>
        {/* Prototype toolbar */}
        <div className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ backgroundColor: 'rgba(26,26,26,0.92)', borderColor: 'rgba(250,248,245,0.08)' }}>
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <a href="/preview/home" className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(250,248,245,0.5)', fontFamily: fonts.body, textDecoration: 'none' }}>&larr; Home Prototype</a>
              <span style={{ color: 'rgba(250,248,245,0.15)' }}>|</span>
              <span className="text-sm font-medium" style={{ color: colors.white, fontFamily: fonts.body }}>Landing Page Prototype</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>Font:</span>
              {FONT_KEYS.map((key) => (
                <button key={key} onClick={() => router.push({ query: { font: key } }, undefined, { shallow: true })} className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200" style={{ fontFamily: fontPairings[key].body, backgroundColor: fontKey === key ? colors.violet : 'rgba(250,248,245,0.08)', color: fontKey === key ? '#fff' : 'rgba(250,248,245,0.5)', border: 'none', cursor: 'pointer' }}>
                  {fontPairings[key].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simplified Nav */}
        <nav className="fixed top-0 left-0 right-0 z-40" style={{ backgroundColor: 'rgba(26,26,26,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(250,248,245,0.06)' }}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
            <span style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.white, letterSpacing: '0.06em' }}>RELUXE</span>
            <button className="rounded-full" style={{ background: gradients.primary, color: '#fff', padding: '0.5rem 1.5rem', fontSize: '0.8125rem', fontFamily: fonts.body, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Claim This Offer</button>
          </div>
        </nav>

        {/* HERO — Offer focused */}
        <section className="relative" style={{ backgroundColor: colors.ink, paddingTop: 140, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '45%', height: '80%', background: `radial-gradient(ellipse, ${colors.violet}10, transparent 65%)`, pointerEvents: 'none' }} />
          <div className="max-w-7xl mx-auto px-6 pb-20 lg:pb-28 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" style={{ background: `${colors.violet}15`, border: `1px solid ${colors.violet}30` }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.violet, animation: 'pulse 2s infinite' }} />
                  <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Limited Time Offer</span>
                </div>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, color: colors.white, marginBottom: '1.25rem' }}>
                  New Patient Botox:{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>$10/Unit</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.7, color: 'rgba(250,248,245,0.55)', maxWidth: '28rem', marginBottom: '2rem' }}>
                  First time at RELUXE? Try Botox at our special introductory rate. Expert injectors, premium product, zero pressure.
                </p>
                <button className="rounded-full mb-4" style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, padding: '1rem 2.5rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Claim $10/Unit Botox &rarr;
                </button>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.3)' }}>New patients only. Limited availability.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
                <div className="rounded-3xl overflow-hidden" style={{ aspectRatio: '4/5', background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}12)`, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'rgba(250,248,245,0.15)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Countdown Urgency Strip */}
        <section style={{ backgroundColor: colors.ink, borderTop: '1px solid rgba(250,248,245,0.06)' }}>
          <div className="max-w-4xl mx-auto px-6 py-8">
            <motion.div className="text-center" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                Offer Ends In
              </p>
              <CountdownTimer fonts={fonts} />
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.3)', marginTop: '0.75rem' }}>Only 12 spots remaining at this rate</p>
            </motion.div>
          </div>
        </section>

        {/* Social proof strip */}
        <section style={{ backgroundColor: '#fff', borderBottom: `1px solid ${colors.stone}` }}>
          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="grid grid-cols-3 gap-8 text-center">
              {socialProof.map((s) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <p style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: colors.heading, marginBottom: '0.25rem' }}>{s.stat}</p>
                  <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.muted }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ backgroundColor: '#fff' }}>
          <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
            <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.75rem' }}>Why RELUXE?</h2>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, maxWidth: '28rem', margin: '0 auto' }}>This isn&rsquo;t a Groupon special at a strip mall med spa. This is the real deal.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {benefits.map((b, i) => (
                <motion.div key={b.title} className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                  <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>{b.title}</h3>
                  <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>{b.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Before & After */}
        <section style={{ backgroundColor: colors.cream }}>
          <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Real Results</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {beforeAfters.map((r, i) => (
                <motion.div key={r.area} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.stone}`, backgroundColor: '#fff' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <div className="grid grid-cols-2">
                    <div style={{ height: 180, background: `${colors.taupe}40`, position: 'relative' }}>
                      <span className="absolute top-3 left-3 rounded-full px-2.5 py-1" style={{ background: 'rgba(0,0,0,0.5)', fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Before</span>
                    </div>
                    <div style={{ height: 180, background: r.gradient, position: 'relative' }}>
                      <span className="absolute top-3 left-3 rounded-full px-2.5 py-1" style={{ background: 'rgba(0,0,0,0.5)', fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>After</span>
                    </div>
                  </div>
                  <div className="p-5 text-center">
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600, color: colors.heading }}>{r.area}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section style={{ backgroundColor: '#fff' }}>
          <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: colors.violet, fontSize: '1.25rem' }}>★</span>
                ))}
              </div>
              <blockquote style={{ fontFamily: fonts.display, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 600, color: colors.heading, lineHeight: 1.4, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                &ldquo;Honestly the best experience I&rsquo;ve ever had at a med spa. My injector was so thorough and the results are incredible. Already booked my next appointment.&rdquo;
              </blockquote>
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.violet, fontWeight: 600 }}>Ashley M.</p>
              <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>Botox Patient &middot; Westfield</p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <FAQSection fonts={fonts} />

        {/* Trust / Certifications */}
        <section style={{ backgroundColor: '#fff' }}>
          <div className="max-w-4xl mx-auto px-6 py-16">
            <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.muted, marginBottom: '1.5rem' }}>Trusted &amp; Certified</p>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-4">
              {trustLogos.map((logo, i) => (
                <motion.div
                  key={logo}
                  className="rounded-lg px-5 py-3"
                  style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <span style={{ fontFamily: fonts.display, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>{logo}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Capture Form */}
        <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
          <div className="max-w-xl mx-auto px-6 py-20 lg:py-28 relative">
            <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
                Claim Your $10/Unit Rate
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(250,248,245,0.55)', marginBottom: '2rem' }}>
                Fill out the form and we&rsquo;ll text you a link to book your appointment at the special rate.
              </p>
              <div className="rounded-2xl p-6 lg:p-8 text-left" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.1)' }}>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="First name"
                      className="flex-1 rounded-lg px-4 py-3.5 outline-none"
                      style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      className="flex-1 rounded-lg px-4 py-3.5 outline-none"
                      style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full rounded-lg px-4 py-3.5 outline-none"
                    style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="w-full rounded-lg px-4 py-3.5 outline-none"
                    style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: colors.white }}
                  />
                  <select
                    className="w-full rounded-lg px-4 py-3.5 outline-none appearance-none"
                    style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.12)', color: 'rgba(250,248,245,0.5)' }}
                  >
                    <option value="">Preferred location</option>
                    <option value="westfield">Westfield</option>
                    <option value="carmel">Carmel</option>
                  </select>
                  <button className="w-full rounded-lg" style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, padding: '1rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Claim $10/Unit Botox
                  </button>
                </div>
                <p className="text-center" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.25)', marginTop: '0.75rem' }}>
                  By submitting, you agree to receive text messages. Msg &amp; data rates may apply.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ background: gradients.primary, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
          <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center relative">
            <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              $10/Unit Botox
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>New patients only. Limited spots available.</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Westfield &amp; Carmel locations.</p>
            <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, padding: '1rem 3rem', backgroundColor: '#fff', color: colors.ink, border: 'none', cursor: 'pointer' }}>
              Claim This Offer
            </button>
          </div>
        </section>

        {/* Minimal footer */}
        <footer style={{ backgroundColor: colors.ink }}>
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
            <span style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white, letterSpacing: '0.06em' }}>RELUXE</span>
            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.3)' }}>&copy; 2026 RELUXE Med Spa. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

LandingPage.getLayout = (page) => page;
