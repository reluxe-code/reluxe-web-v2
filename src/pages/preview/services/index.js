import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewLayout from '@/components/preview/PreviewLayout';
import { colors, fontPairings, typeScale, gradients } from '@/components/preview/tokens';

const categories = [
  { name: 'Injectables', count: 6, description: 'Botox, fillers, and everything that smooths, lifts, and defines.', gradient: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})` },
  { name: 'Laser Treatments', count: 4, description: 'Hair removal, skin resurfacing, and pigment correction.', gradient: `linear-gradient(135deg, ${colors.fuchsia}, ${colors.rose})` },
  { name: 'Skin Health', count: 5, description: 'Facials, peels, microneedling, and medical-grade skincare.', gradient: `linear-gradient(135deg, ${colors.rose}, ${colors.violet})` },
  { name: 'Body', count: 3, description: 'Contouring, tightening, and sculpting. No surgery required.', gradient: `linear-gradient(135deg, #5B21B6, ${colors.violet})` },
];

const services = [
  {
    name: 'Botox, Daxxify, Dysport, & Jeuveau',
    category: 'Injectables',
    locations: ['Carmel', 'Westfield'],
    price: 'From $10/unit',
    description: 'Look refreshed, not frozen. Smooths lines so you still look like you — just well-rested.',
    tags: ['Natural Results', 'Quick Treatment', 'Prevention'],
    idealFor: 'First-timers wanting subtle, natural improvement.',
    href: '/preview/services/botox',
    gradient: `linear-gradient(135deg, ${colors.violet}30, ${colors.fuchsia}15)`,
  },
  {
    name: 'Dermal Fillers',
    category: 'Injectables',
    locations: ['Carmel', 'Westfield'],
    price: 'From $650/syringe',
    description: 'Restore volume, define contours, and turn back the clock. Juvederm, Restylane, RHA & more.',
    tags: ['Volume Restore', 'Contouring', 'Anti-Aging'],
    idealFor: 'Anyone wanting to restore lost volume or enhance facial structure.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.fuchsia}25, ${colors.rose}12)`,
  },
  {
    name: 'Lip Filler',
    category: 'Injectables',
    locations: ['Carmel', 'Westfield'],
    price: 'From $650',
    description: 'Fuller, more defined lips that still look like yours. Our injectors are known for lip artistry.',
    tags: ['Lip Enhancement', 'Natural Shape', 'Popular'],
    idealFor: 'Patients wanting subtle to dramatic lip enhancement.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.rose}28, ${colors.violet}14)`,
  },
  {
    name: 'Morpheus8',
    category: 'Skin Health',
    locations: ['Carmel', 'Westfield'],
    price: 'From $800/session',
    description: 'RF microneedling that tightens skin, smooths texture, and stimulates collagen deep below the surface.',
    tags: ['Skin Tightening', 'Texture', 'Collagen Boost'],
    idealFor: 'Patients with skin laxity, acne scarring, or fine lines.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.rose}22, ${colors.violet}18)`,
  },
  {
    name: 'Laser Hair Removal',
    category: 'Laser Treatments',
    locations: ['Carmel', 'Westfield'],
    price: 'From $150/session',
    description: 'Permanent hair reduction with the Candela GentleMax Pro. Safe for all skin types.',
    tags: ['Permanent Results', 'All Skin Types', 'Full Body'],
    idealFor: 'Anyone tired of shaving, waxing, or ingrown hairs.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.violet}20, ${colors.rose}22)`,
  },
  {
    name: 'Chemical Peels',
    category: 'Skin Health',
    locations: ['Carmel', 'Westfield'],
    price: 'From $150',
    description: 'Resurface, brighten, and reveal fresh new skin. Multiple strengths from gentle to medical-grade.',
    tags: ['Brightening', 'Texture', 'Anti-Aging'],
    idealFor: 'Patients dealing with dullness, sun damage, or uneven tone.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.fuchsia}18, ${colors.violet}20)`,
  },
  {
    name: 'HydraFacial',
    category: 'Skin Health',
    locations: ['Carmel', 'Westfield'],
    price: 'From $199',
    description: 'The celebrity facial. Cleanse, extract, and hydrate in one session. Instant glow, zero downtime.',
    tags: ['Instant Glow', 'Zero Downtime', 'Hydration'],
    idealFor: 'Pre-event prep or anyone wanting an immediate refresh.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.violet}25, ${colors.fuchsia}12)`,
  },
  {
    name: 'IPL Photofacial',
    category: 'Laser Treatments',
    locations: ['Westfield'],
    price: 'From $300',
    description: 'Erase sun damage, broken capillaries, redness, and dark spots with intense pulsed light therapy.',
    tags: ['Sun Damage', 'Redness', 'Pigmentation'],
    idealFor: 'Patients with sun spots, rosacea, or visible broken capillaries.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.rose}20, ${colors.fuchsia}15)`,
  },
  {
    name: 'Body Contouring',
    category: 'Body',
    locations: ['Carmel', 'Westfield'],
    price: 'From $500/session',
    description: 'Sculpt stubborn areas that diet and exercise can\'t touch. Non-surgical fat reduction and toning.',
    tags: ['Non-Surgical', 'Fat Reduction', 'Sculpting'],
    idealFor: 'Patients close to goal weight with stubborn pockets of fat.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.fuchsia}22, ${colors.violet}16)`,
  },
  {
    name: 'Microneedling',
    category: 'Skin Health',
    locations: ['Carmel', 'Westfield'],
    price: 'From $300',
    description: 'Stimulate your skin\'s natural collagen production. Improves texture, scarring, and fine lines.',
    tags: ['Collagen Boost', 'Scarring', 'Anti-Aging'],
    idealFor: 'Patients wanting gradual, natural skin improvement.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.violet}18, ${colors.rose}20)`,
  },
  {
    name: 'Skin Tightening',
    category: 'Body',
    locations: ['Carmel'],
    price: 'From $400/session',
    description: 'Firm and lift sagging skin on the face, neck, or body. RF technology for deep collagen remodeling.',
    tags: ['Firming', 'RF Technology', 'Face & Body'],
    idealFor: 'Patients experiencing skin laxity from aging or weight loss.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.violet}18, ${colors.rose}20)`,
  },
  {
    name: 'IV Therapy',
    category: 'Body',
    locations: ['Carmel'],
    price: 'From $175',
    description: 'Vitamin infusions delivered directly to your bloodstream. Hydration, energy, immunity, and recovery.',
    tags: ['Hydration', 'Energy', 'Recovery'],
    idealFor: 'Pre/post event, athletes, or anyone needing a wellness boost.',
    href: '#',
    gradient: `linear-gradient(135deg, ${colors.fuchsia}15, ${colors.violet}22)`,
  },
];

const pricingItems = [
  { name: 'Botox', price: '$12/unit', memberPrice: '$10/unit', description: 'Smooths fine lines & wrinkles. 20–40 units typical.', sessions: null },
  { name: 'Dysport', price: '$5/unit', memberPrice: '$4/unit', description: 'Fast-acting wrinkle relaxer. Natural spread for larger areas.', sessions: null },
  { name: 'Daxxify', price: '$14/unit', memberPrice: '$12/unit', description: 'Long-lasting neurotoxin. Results up to 6–9 months.', sessions: null },
  { name: 'Lip Filler', price: '$650', memberPrice: '$585', description: 'Natural-looking volume and definition. Hyaluronic acid fillers.', sessions: '1 syringe' },
  { name: 'Dermal Fillers', price: '$650/syringe', memberPrice: '$585/syringe', description: 'Cheeks, jawline, chin, under-eyes. Juvederm & Restylane.', sessions: '1–3 syringes typical' },
  { name: 'HydraFacial', price: '$199', memberPrice: '$169', description: 'Deep cleanse, extraction, and hydration. Instant glow.', sessions: null },
  { name: 'Chemical Peel', price: '$150', memberPrice: '$127', description: 'Resurface and brighten. Gentle to medical-grade options.', sessions: null },
  { name: 'Morpheus8', price: '$800', memberPrice: '$680', description: 'RF microneedling for tightening, texture, and collagen.', sessions: '3 sessions recommended' },
  { name: 'Laser Hair Removal', price: '$150+', memberPrice: '$127+', description: 'Permanent hair reduction. All skin types. Candela GentleMax Pro.', sessions: '6–8 sessions' },
  { name: 'Microneedling', price: '$300', memberPrice: '$255', description: 'Collagen stimulation for texture, scars, and fine lines.', sessions: '3 sessions recommended' },
  { name: 'Body Contouring', price: '$500', memberPrice: '$425', description: 'Non-surgical fat reduction and skin toning.', sessions: '4–6 sessions recommended' },
  { name: 'IV Therapy', price: '$175', memberPrice: '$149', description: 'Hydration, immunity, energy, and recovery drips.', sessions: null },
];

const quizQuestions = [
  {
    question: 'What\'s your primary goal?',
    options: [
      { label: 'Smooth wrinkles & fine lines', result: ['Botox', 'Dysport', 'Daxxify'] },
      { label: 'Add volume or contour my face', result: ['Dermal Fillers', 'Lip Filler'] },
      { label: 'Improve skin texture & tone', result: ['Morpheus8', 'Chemical Peel', 'HydraFacial'] },
      { label: 'Remove unwanted hair', result: ['Laser Hair Removal'] },
      { label: 'Tighten or sculpt my body', result: ['Body Contouring', 'Skin Tightening'] },
    ],
  },
];

function ServiceCard({ svc, fonts, index }) {
  return (
    <motion.div
      className="group rounded-2xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${colors.stone}`,
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div style={{ height: 4, background: svc.gradient }} />
      <div className="p-6 flex flex-col flex-1">
        <span
          className="inline-block self-start rounded-full px-3 py-1 mb-4"
          style={{
            fontFamily: fonts.body,
            fontSize: '0.625rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: colors.violet,
            background: `${colors.violet}0a`,
            border: `1px solid ${colors.violet}18`,
          }}
        >
          {svc.category}
        </span>
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.1875rem', fontWeight: 600, color: colors.heading, lineHeight: 1.3, marginBottom: '0.375rem' }}>
          {svc.name}
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.violet, marginBottom: '0.75rem' }}>
          {svc.locations.join(' & ')}
        </p>
        <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: 1.6, color: colors.body, marginBottom: '1rem' }}>
          {svc.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {svc.tags.map((tag) => (
            <span key={tag} className="rounded-full px-2.5 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.heading, backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
              {tag}
            </span>
          ))}
        </div>
        <div className="rounded-lg px-4 py-3 mb-5" style={{ borderLeft: `3px solid ${colors.violet}`, backgroundColor: `${colors.violet}06` }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.violet, marginBottom: '0.25rem' }}>
            Ideal For
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>
            {svc.idealFor}
          </p>
        </div>
        <div className="mt-auto" />
        <div className="flex flex-wrap gap-2 mb-3">
          {svc.locations.map((loc) => (
            <button
              key={loc}
              className="rounded-full transition-all duration-200 hover:shadow-[0_0_16px_rgba(124,58,237,0.2)]"
              style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 1.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Book {loc}
            </button>
          ))}
        </div>
        <a
          href={svc.href}
          className="inline-flex items-center gap-1.5 transition-all duration-200 group-hover:gap-2.5"
          style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, textDecoration: 'none', padding: '0.375rem 0', borderTop: `1px solid ${colors.stone}`, marginTop: '0.5rem', paddingTop: '0.75rem' }}
        >
          Learn More
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </div>
    </motion.div>
  );
}

function TreatmentQuiz({ fonts }) {
  const [selected, setSelected] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (option) => {
    setSelected(option);
    setShowResults(true);
  };

  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20%', right: 0, width: '40%', height: '60%', background: `radial-gradient(ellipse at right, ${colors.violet}08, transparent 70%)`, pointerEvents: 'none' }} />
      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28 relative">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Not Sure Where to Start?</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white, marginBottom: '0.75rem' }}>
            Find Your Treatment
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: 'rgba(250,248,245,0.5)', maxWidth: '28rem', margin: '0 auto' }}>
            Answer one question and we&rsquo;ll point you in the right direction.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key="question" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
              <h3 className="text-center mb-6" style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.white }}>
                {quizQuestions[0].question}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quizQuestions[0].options.map((opt, i) => (
                  <motion.button
                    key={opt.label}
                    className="rounded-xl text-left p-5 transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(250,248,245,0.04)',
                      border: '1px solid rgba(250,248,245,0.1)',
                      cursor: 'pointer',
                      fontFamily: fonts.body,
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: colors.white,
                    }}
                    whileHover={{ backgroundColor: 'rgba(124,58,237,0.12)', borderColor: 'rgba(124,58,237,0.3)' }}
                    onClick={() => handleSelect(opt)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-8">
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.white, marginBottom: '0.5rem' }}>
                  We Recommend
                </h3>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: 'rgba(250,248,245,0.5)' }}>
                  Based on your goal, these treatments are your best match.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {selected.result.map((r) => (
                  <span key={r} className="rounded-full px-5 py-2.5" style={{ background: `${colors.violet}20`, border: `1px solid ${colors.violet}40`, fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.violet }}>
                    {r}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Book a Free Consult
                </button>
                <button className="rounded-full" onClick={() => { setShowResults(false); setSelected(null); }} style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: 'transparent', color: 'rgba(250,248,245,0.6)', border: '1px solid rgba(250,248,245,0.15)', cursor: 'pointer' }}>
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ServicesPage({ fontKey, fonts }) {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-end" style={{ backgroundColor: colors.ink, minHeight: '50vh', paddingTop: 120 }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '60%', height: '50%', background: `radial-gradient(ellipse at bottom left, ${colors.violet}10, transparent 70%)`, pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-6 pb-16 lg:pb-24 w-full relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Our Services</p>
            <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, color: colors.white, marginBottom: '1rem', maxWidth: '36rem' }}>
              Pick Your{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Power Move</span>
            </h1>
            <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.7, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem' }}>
              From wrinkle prevention to full-body contouring — every treatment is delivered by experts using only premium, FDA-approved products.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Cards */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{ minHeight: 200 }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: cat.gradient }} />
                <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
                <div className="relative z-10 p-6 flex flex-col justify-end h-full" style={{ minHeight: 200 }}>
                  <span className="inline-block mb-2 rounded-full px-3 py-1 self-start" style={{ background: 'rgba(255,255,255,0.15)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff' }}>
                    {cat.count} Treatments
                  </span>
                  <h3 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.375rem' }}>{cat.name}</h3>
                  <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{cat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Pricing Grid */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div className="mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Transparent Pricing</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.5rem' }}>
                  Popular Treatments
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, maxWidth: '32rem' }}>
                  No hidden fees. No surprise charges. Members save 15% on everything.
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: `${colors.violet}10`, border: `1px solid ${colors.violet}20` }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet }}>Member Price</span>
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingItems.map((item, i) => (
              <motion.div
                key={item.name}
                className="rounded-xl p-5 group cursor-pointer transition-all duration-200"
                style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading }}>{item.name}</h3>
                  <span style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 700, color: colors.heading, whiteSpace: 'nowrap' }}>{item.price}</span>
                </div>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#15803d' }}>Member: {item.memberPrice}</span>
                  </span>
                  {item.sessions && (
                    <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.muted }}>{item.sessions}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="flex flex-wrap justify-center gap-3 mt-10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
              View Full Pricing
            </button>
            <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: 'transparent', color: colors.violet, border: `1.5px solid ${colors.violet}`, cursor: 'pointer' }}>
              Membership &amp; Financing
            </button>
          </motion.div>
        </div>
      </section>

      {/* Interactive Treatment Quiz */}
      <TreatmentQuiz fonts={fonts} />

      {/* All Services Grid — Rich Cards */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div className="mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.75rem' }}>
              All Treatments
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, maxWidth: '32rem' }}>
              Browse everything we offer. Each card includes location availability, what it&rsquo;s best for, and quick booking.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, i) => (
              <ServiceCard key={svc.name} svc={svc} fonts={fonts} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Before You Visit — What to Expect */}
      <section style={{ backgroundColor: colors.cream }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>First Time?</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '1rem' }}>
                What to Expect at Your First Visit
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body, maxWidth: '28rem', marginBottom: '2rem' }}>
                No awkward sales pitches. No assembly-line vibes. Just a genuine consultation with an expert who actually listens to what you want.
              </p>
              <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                Book Your First Visit
              </button>
            </motion.div>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Consultation', detail: 'We learn your goals, assess your anatomy, and discuss all options. No pressure to book anything.' },
                { step: '02', title: 'Custom Plan', detail: 'Your provider builds a treatment plan around your goals, timeline, and budget.' },
                { step: '03', title: 'Treatment', detail: 'Relax in a private suite while your provider works. Most treatments take 15–45 minutes.' },
                { step: '04', title: 'Aftercare', detail: 'Clear instructions, direct text access to your provider, and a follow-up already scheduled.' },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  className="rounded-xl p-5 flex gap-4"
                  style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: `${colors.violet}10`, fontFamily: fonts.display, fontSize: '0.875rem', fontWeight: 700, color: colors.violet }}>
                    {s.step}
                  </span>
                  <div>
                    <h4 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>{s.title}</h4>
                    <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>{s.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture — New Patient Offer */}
      <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" style={{ background: `${colors.violet}15`, border: `1px solid ${colors.violet}30` }}>
              <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.08em' }}>New Patient Exclusive</span>
            </div>
            <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
              Get 15% Off Your First Treatment
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(250,248,245,0.55)', marginBottom: '2rem', maxWidth: '28rem', margin: '0 auto 2rem' }}>
              Drop your email and we&rsquo;ll send you an exclusive offer — plus early access to seasonal deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-full px-5 py-3.5 outline-none"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.9375rem',
                  backgroundColor: 'rgba(250,248,245,0.06)',
                  border: '1px solid rgba(250,248,245,0.12)',
                  color: colors.white,
                }}
              />
              <button className="rounded-full flex-shrink-0" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                Send My Offer
              </button>
            </div>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.25)', marginTop: '1rem' }}>No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* Financing & Membership Callout */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Membership Card */}
            <motion.div
              className="rounded-2xl overflow-hidden relative"
              style={{ background: gradients.primary, minHeight: 320 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
              <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-between h-full" style={{ minHeight: 320 }}>
                <div>
                  <span className="inline-block rounded-full px-3 py-1.5 mb-4" style={{ background: 'rgba(255,255,255,0.15)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    VIP Membership
                  </span>
                  <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                    Save 15% on Everything
                  </h3>
                  <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '22rem', marginBottom: '1rem' }}>
                    Monthly treatments, exclusive perks, priority booking, and member-only pricing starting at $99/month.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {['15% off all treatments', 'Priority booking', 'Monthly treatment credit', 'Exclusive member events'].map((perk) => (
                      <li key={perk} className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.2)" /><path d="M5 8L7 10L11 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="rounded-full self-start" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', backgroundColor: '#fff', color: colors.ink, border: 'none', cursor: 'pointer' }}>
                  Learn About Membership
                </button>
              </div>
            </motion.div>

            {/* Financing Card */}
            <motion.div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, minHeight: 320 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="p-8 lg:p-10 flex flex-col justify-between h-full" style={{ minHeight: 320 }}>
                <div>
                  <span className="inline-block rounded-full px-3 py-1.5 mb-4" style={{ background: `${colors.violet}10`, fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Flexible Financing
                  </span>
                  <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: colors.heading, marginBottom: '0.75rem' }}>
                    0% APR Available
                  </h3>
                  <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: colors.body, lineHeight: 1.6, maxWidth: '22rem', marginBottom: '1.5rem' }}>
                    Don&rsquo;t let cost hold you back. We offer interest-free financing through Cherry and CareCredit. Apply in 60 seconds.
                  </p>
                  <div className="flex items-center gap-4 mb-6">
                    {['Cherry', 'CareCredit'].map((provider) => (
                      <div key={provider} className="rounded-lg px-4 py-2.5" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}>
                        <span style={{ fontFamily: fonts.display, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>{provider}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="rounded-full self-start" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Check Your Rate
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: gradients.primary, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center relative">
          <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            Not Sure Where to Start?
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
            Book a free consultation. We&rsquo;ll build a custom plan around your goals.
          </p>
          <button className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2.5rem', backgroundColor: colors.ink, color: '#fff', border: 'none', cursor: 'pointer' }}>
            Book Free Consult
          </button>
        </div>
      </section>
    </>
  );
}

export default function ServicesPageWrapper() {
  return (
    <PreviewLayout title="Services">
      {({ fontKey, fonts }) => <ServicesPage fontKey={fontKey} fonts={fonts} />}
    </PreviewLayout>
  );
}

ServicesPageWrapper.getLayout = (page) => page;
