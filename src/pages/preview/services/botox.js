import { motion } from 'framer-motion';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PreviewLayout from '@/components/preview/PreviewLayout';
import { colors, fontPairings, typeScale, gradients } from '@/components/preview/tokens';

const quickFacts = [
  { label: 'Treatment Time', value: '15–30 min' },
  { label: 'Results In', value: '5–7 days' },
  { label: 'Lasts', value: '3–4 months' },
  { label: 'Downtime', value: 'None' },
];

const treatsAreas = [
  'Forehead Lines', 'Crow\'s Feet', 'Frown Lines (11s)', 'Brow Lift',
  'Bunny Lines', 'Lip Flip', 'Jawline Slimming', 'Gummy Smile',
];

const pricingOptions = [
  { name: 'Botox', brand: 'Allergan', price: '$12/unit', note: 'Most popular. 20–60 units typical.', highlighted: true },
  { name: 'Dysport', brand: 'Galderma', price: '$4/unit', note: 'Faster onset. 50–120 units typical.' },
  { name: 'Daxxify', brand: 'Revance', price: '$12/unit', note: 'Longest lasting. 6–9 months.' },
];

const faqs = [
  { q: 'Does Botox hurt?', a: 'Most patients describe it as a tiny pinch. The needles are ultra-fine, and treatments take just 15–30 minutes. We can also apply numbing cream if you\'re needle-shy.' },
  { q: 'How many units will I need?', a: 'It depends on the treatment area and your goals. Forehead lines typically need 10–20 units, frown lines 20–30 units, and crow\'s feet 12–24 units. Your provider will give you an exact number at your consult.' },
  { q: 'Can I get Botox on my lunch break?', a: 'Absolutely. Most appointments are done in 30 minutes or less with zero downtime. You can head right back to work.' },
  { q: 'What if I don\'t like the results?', a: 'Botox is temporary — results naturally wear off in 3–4 months. But in our experience, once you see how good you look, you\'ll want to keep it up.' },
  { q: 'When should I start getting Botox?', a: 'There\'s no "right" age. Many patients in their mid-20s start preventatively. Others begin in their 40s–50s. The best time is whenever you\'re ready.' },
];

const beforeAfterResults = [
  { area: 'Forehead Lines', provider: 'Shannon', gradient: `linear-gradient(135deg, ${colors.violet}25, ${colors.fuchsia}15)` },
  { area: 'Crow\'s Feet', provider: 'Alexis', gradient: `linear-gradient(135deg, ${colors.fuchsia}22, ${colors.rose}12)` },
  { area: 'Frown Lines', provider: 'Anna', gradient: `linear-gradient(135deg, ${colors.rose}20, ${colors.violet}15)` },
];

function BotoxPage({ fontKey, fonts }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      {/* Hero */}
      <section
        className="relative"
        style={{ backgroundColor: colors.ink, paddingTop: 120, overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '-10%',
            width: '50%',
            height: '80%',
            background: `radial-gradient(ellipse, ${colors.violet}10, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <div className="max-w-7xl mx-auto px-6 pb-16 lg:pb-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6">
                <a href="/preview/services" style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', textDecoration: 'none' }}>
                  Services
                </a>
                <span style={{ color: 'rgba(250,248,245,0.2)', fontSize: '0.75rem' }}>/</span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.6)' }}>Injectables</span>
              </div>

              <p
                style={{
                  fontFamily: fonts.body,
                  ...typeScale.label,
                  color: colors.violet,
                  marginBottom: '1rem',
                }}
              >
                Wrinkle Prevention & Treatment
              </p>
              <h1
                style={{
                  fontFamily: fonts.display,
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  fontWeight: 700,
                  lineHeight: 1.05,
                  color: colors.white,
                  marginBottom: '1.25rem',
                }}
              >
                Botox
              </h1>
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                  lineHeight: 1.7,
                  color: 'rgba(250,248,245,0.55)',
                  maxWidth: '28rem',
                  marginBottom: '2rem',
                }}
              >
                The world&rsquo;s most popular cosmetic treatment. Smooth wrinkles, prevent new ones, and look like the best version of yourself — in under 30 minutes.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  className="rounded-full"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    padding: '0.875rem 2.25rem',
                    background: gradients.primary,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Book Botox
                </button>
                <button
                  className="rounded-full"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    padding: '0.875rem 2.25rem',
                    background: 'transparent',
                    color: 'rgba(250,248,245,0.7)',
                    border: '1.5px solid rgba(250,248,245,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  Free Consult
                </button>
              </div>
            </motion.div>

            {/* Quick facts */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              {quickFacts.map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: 'rgba(250,248,245,0.04)',
                    border: '1px solid rgba(250,248,245,0.06)',
                  }}
                >
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(250,248,245,0.35)', marginBottom: '0.375rem' }}>
                    {f.label}
                  </p>
                  <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white }}>
                    {f.value}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* What It Treats */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>
              Treatment Areas
            </p>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
              What Botox Can Do
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {treatsAreas.map((area, i) => (
              <motion.div
                key={area}
                className="rounded-xl px-5 py-4 text-center"
                style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <span style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>
                  {area}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Real Results</p>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
              See the Difference
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {beforeAfterResults.map((result, i) => (
              <motion.div
                key={result.area}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${colors.stone}`, backgroundColor: '#fff' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="grid grid-cols-2">
                  <div className="relative" style={{ height: 200, background: `${colors.taupe}40` }}>
                    <span className="absolute top-3 left-3 rounded-full px-2.5 py-1" style={{ background: 'rgba(0,0,0,0.5)', fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Before</span>
                  </div>
                  <div className="relative" style={{ height: 200, background: result.gradient }}>
                    <span className="absolute top-3 left-3 rounded-full px-2.5 py-1" style={{ background: 'rgba(0,0,0,0.5)', fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>After</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>{result.area}</h3>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>Provider: {result.provider}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Transparent Pricing</p>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
              Simple. No Surprises.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricingOptions.map((opt, i) => (
              <motion.div
                key={opt.name}
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: opt.highlighted ? colors.ink : colors.cream,
                  border: opt.highlighted ? 'none' : `1px solid ${colors.stone}`,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                {opt.highlighted && <div className="mb-4" style={{ height: 3, background: gradients.primary, borderRadius: 2 }} />}
                <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: opt.highlighted ? colors.white : colors.heading, marginBottom: '0.25rem' }}>{opt.name}</p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: opt.highlighted ? 'rgba(250,248,245,0.4)' : colors.muted, marginBottom: '1rem' }}>{opt.brand}</p>
                <p style={{ fontFamily: fonts.display, fontSize: '1.75rem', fontWeight: 700, color: opt.highlighted ? colors.white : colors.violet, marginBottom: '0.75rem' }}>{opt.price}</p>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: opt.highlighted ? 'rgba(250,248,245,0.6)' : colors.body, lineHeight: 1.5 }}>{opt.note}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-6" style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.muted }}>
            Luxe Members save up to 20%. Exact pricing determined at your consultation.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
              Botox FAQ
            </h2>
          </motion.div>

          <div className="border-t" style={{ borderColor: colors.stone }}>
            {faqs.map((faq, i) => (
              <div key={i} className="border-b" style={{ borderColor: colors.stone }}>
                <button
                  className="w-full text-left py-5 flex items-center justify-between gap-4"
                  style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  <span style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600, color: openFaq === i ? colors.violet : colors.heading, transition: 'color 0.2s' }}>{faq.q}</span>
                  <motion.span style={{ fontSize: '1.25rem', color: colors.muted, flexShrink: 0 }} animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }}>+</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                      <p className="pb-5" style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body, maxWidth: '40rem' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to Try Botox?</h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book online in 60 seconds. Free consultations for first-timers.</p>
          <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.5rem', backgroundColor: colors.ink, color: '#fff', border: 'none', cursor: 'pointer' }}>Book Botox Now</button>
        </div>
      </section>
    </>
  );
}

export default function BotoxPageWrapper() {
  return (
    <PreviewLayout title="Botox">
      {({ fontKey, fonts }) => <BotoxPage fontKey={fontKey} fonts={fonts} />}
    </PreviewLayout>
  );
}

BotoxPageWrapper.getLayout = (page) => page;
