// src/pages/learn.js
// Educational hub interlinking services, conditions, FAQs & guides
// Builds topical authority for AEO — every section links to deeper content
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, typeScale } from '@/components/preview/tokens'
import GravityBookButton from '@/components/beta/GravityBookButton'

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

/* ─── Content data ─── */

const TREATMENT_CATEGORIES = [
  {
    title: 'Wrinkle Relaxers (Tox)',
    slug: 'tox',
    description: 'Botox, Dysport, Jeuveau & Daxxify smooth expression lines and prevent new wrinkles. Quick treatments with no downtime.',
    services: [
      { name: 'Botox', slug: 'botox' },
      { name: 'Dysport', slug: 'dysport' },
      { name: 'Jeuveau', slug: 'jeuveau' },
      { name: 'Daxxify', slug: 'daxxify' },
    ],
    icon: '💉',
    highlight: 'Most popular — 30 min, no downtime',
  },
  {
    title: 'Dermal Fillers',
    slug: 'filler',
    description: 'Restore volume, enhance contours, and smooth deep folds with hyaluronic acid fillers and biostimulators.',
    services: [
      { name: 'Juvéderm', slug: 'juvederm' },
      { name: 'RHA Collection', slug: 'rha' },
      { name: 'Restylane', slug: 'restylane' },
      { name: 'Versa', slug: 'versa' },
      { name: 'Sculptra', slug: 'sculptra' },
    ],
    icon: '✨',
    highlight: 'Instant volume — lasts 6-18 months',
  },
  {
    title: 'Skin Tightening & Resurfacing',
    slug: 'morpheus8',
    description: 'RF microneedling, plasma, and laser treatments that remodel collagen for firmer, smoother skin.',
    services: [
      { name: 'Morpheus8', slug: 'morpheus8' },
      { name: 'Opus Plasma', slug: 'opus' },
      { name: 'CO₂ Resurfacing', slug: 'co2' },
      { name: 'ClearLift', slug: 'clearlift' },
    ],
    icon: '🔬',
    highlight: 'Deep collagen remodeling',
  },
  {
    title: 'Laser & Light Therapy',
    slug: 'ipl',
    description: 'IPL, ClearSkin, and VascuPen target sun damage, redness, pigmentation, and vascular concerns.',
    services: [
      { name: 'IPL Photofacial', slug: 'ipl' },
      { name: 'ClearSkin', slug: 'clearskin' },
      { name: 'VascuPen', slug: 'vascupen' },
      { name: 'Laser Hair Removal', slug: 'laser-hair-removal' },
    ],
    icon: '💡',
    highlight: 'Targets pigment, redness & hair',
  },
  {
    title: 'Facials & Peels',
    slug: 'facials',
    description: 'Medical-grade facials and chemical peels for deep cleansing, hydration, and skin renewal.',
    services: [
      { name: 'HydraFacial', slug: 'hydrafacial' },
      { name: 'Glo2Facial', slug: 'glo2facial' },
      { name: 'Chemical Peels', slug: 'peels' },
      { name: 'SkinPen Microneedling', slug: 'skinpen' },
    ],
    icon: '🧖',
    highlight: 'Glow with zero downtime',
  },
  {
    title: 'Body & Wellness',
    slug: 'evolvex',
    description: 'Body contouring, massage therapy, and wellness treatments for total-body transformation.',
    services: [
      { name: 'EvolveX Body Contouring', slug: 'evolvex' },
      { name: 'Massage Therapy', slug: 'massage' },
      { name: 'Salt Sauna', slug: 'saltsauna' },
      { name: 'PRP Injections', slug: 'prp' },
    ],
    icon: '🧘',
    highlight: 'Shape, relax & recover',
  },
]

const CONDITIONS = [
  { slug: 'wrinkles-fine-lines', title: 'Wrinkles & Fine Lines', treatments: ['Botox', 'Dysport', 'Morpheus8', 'CO₂'] },
  { slug: 'volume-loss', title: 'Volume Loss', treatments: ['Filler', 'Sculptra', 'Facial Balancing'] },
  { slug: 'acne-scars', title: 'Acne & Acne Scars', treatments: ['SkinPen', 'Morpheus8', 'Chemical Peels'] },
  { slug: 'sun-damage', title: 'Sun Damage & Pigmentation', treatments: ['IPL', 'Chemical Peels', 'ClearLift'] },
  { slug: 'skin-texture', title: 'Uneven Skin Texture', treatments: ['HydraFacial', 'Glo2Facial', 'Peels'] },
  { slug: 'loose-skin', title: 'Loose or Sagging Skin', treatments: ['Morpheus8', 'Opus Plasma', 'EvolveX'] },
  { slug: 'under-eye', title: 'Under-Eye Hollows', treatments: ['Filler', 'PRP', 'ClearLift'] },
  { slug: 'double-chin', title: 'Double Chin', treatments: ['EvolveX', 'Morpheus8', 'Filler'] },
  { slug: 'unwanted-hair', title: 'Unwanted Hair', treatments: ['Laser Hair Removal'] },
  { slug: 'rosacea', title: 'Rosacea & Redness', treatments: ['IPL', 'ClearSkin', 'Facials'] },
  { slug: 'weight-loss-laxity-volume-loss', title: 'Post-Weight-Loss Changes', treatments: ['Sculptra', 'Morpheus8', 'Filler'] },
]

const COMMON_QUESTIONS = [
  { q: 'What is the best anti-aging treatment?', a: 'It depends on your concern. Tox (Botox, Dysport) smooths expression lines. Fillers restore lost volume. Morpheus8 tightens and retexturizes. Most patients benefit from a combination — start with a free consultation.', links: [{ label: 'Tox', href: '/services/tox' }, { label: 'Filler', href: '/services/filler' }, { label: 'Morpheus8', href: '/services/morpheus8' }] },
  { q: 'How much does Botox cost?', a: 'At RELUXE, Botox starts at $280 for 20 units ($14/unit). VIP Members pay $10/unit. Most patients use 20-60 units depending on areas treated. We give exact pricing during your free consult.', links: [{ label: 'Botox', href: '/services/botox' }, { label: 'Tox Pricing', href: '/services/tox' }] },
  { q: 'What is the best facial for my skin type?', a: 'HydraFacial is great for hydration and all skin types. Glo2Facial adds oxygenation for dull skin. Chemical peels address texture and tone. Our team matches the right facial to your goals.', links: [{ label: 'HydraFacial', href: '/services/hydrafacial' }, { label: 'Glo2Facial', href: '/services/glo2facial' }, { label: 'Peels', href: '/services/peels' }] },
  { q: 'Does Morpheus8 hurt?', a: 'We apply topical numbing for 30-45 minutes before treatment. Most patients rate it 4-5 out of 10. Expect 2-4 days of redness afterward. Results peak at 12 weeks as collagen rebuilds.', links: [{ label: 'Morpheus8 Details', href: '/services/morpheus8' }] },
  { q: 'Which filler lasts the longest?', a: 'Sculptra lasts 2+ years by stimulating your own collagen. HA fillers (Juvéderm, RHA, Restylane) last 6-18 months depending on area and product. Lip fillers typically last 6-9 months.', links: [{ label: 'Sculptra', href: '/services/sculptra' }, { label: 'Filler Guide', href: '/services/filler' }] },
  { q: 'What is the difference between Botox and Dysport?', a: 'Both relax muscles to smooth wrinkles. Dysport spreads slightly more (good for large areas like foreheads) and may kick in 1-2 days faster. Botox is the gold standard with the most data. Results and duration are very similar.', links: [{ label: 'Botox', href: '/services/botox' }, { label: 'Dysport', href: '/services/dysport' }, { label: 'Compare All Tox', href: '/services/tox' }] },
  { q: 'Can I get Botox and filler on the same day?', a: 'Yes — many patients do both in one visit. We typically inject tox first, then filler. Your provider will plan the best combination for your goals and timeline.', links: [{ label: 'Injectables Overview', href: '/services/injectables' }] },
  { q: 'How do I get rid of acne scars?', a: 'SkinPen microneedling, Morpheus8 RF microneedling, and chemical peels all help. SkinPen is gentler with less downtime. Morpheus8 delivers deeper remodeling for stubborn scarring. A series of 3 treatments is typical.', links: [{ label: 'SkinPen', href: '/services/skinpen' }, { label: 'Morpheus8', href: '/services/morpheus8' }, { label: 'Acne Scars Guide', href: '/conditions/acne-scars' }] },
]

const GUIDES = [
  { title: 'First-Time Patient Guide', description: 'What to expect at your first visit, how consults work, and what to bring.', href: '/book/consult', cta: 'Book Free Consult' },
  { title: 'Injectable Comparison Guide', description: 'Botox vs. Dysport vs. Jeuveau vs. Daxxify — which tox is right for you?', href: '/services/tox', cta: 'Compare Tox Brands' },
  { title: 'Filler Brand Guide', description: 'Juvéderm, RHA, Restylane, Versa & Sculptra — learn what each treats best.', href: '/services/filler', cta: 'Explore Fillers' },
  { title: 'Skin Tightening Options', description: 'Morpheus8 vs. Opus vs. CO₂ — understand the differences in downtime, results, and cost.', href: '/services/morpheus8', cta: 'Compare Options' },
  { title: 'Membership & Pricing', description: 'How VIP Membership saves 10-15% on every visit, plus exclusive perks.', href: '/pricing', cta: 'See Pricing' },
  { title: 'Results & Before/After', description: 'Real patient transformations across every treatment category.', href: '/results', cta: 'View Results' },
]

/* ─── Component ─── */

function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ExpandableFAQ({ item, fonts, isOpen, onToggle }) {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(250,248,245,0.08)',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, color: colors.cream, lineHeight: 1.4 }}>
          {item.q}
        </span>
        <span
          style={{
            color: colors.violet,
            fontSize: '1.25rem',
            lineHeight: 1,
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          +
        </span>
      </button>
      {isOpen && (
        <div className="pb-5" style={{ marginTop: -4 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(250,248,245,0.6)', marginBottom: item.links?.length ? 12 : 0 }}>
            {item.a}
          </p>
          {item.links?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                  style={{
                    background: `${colors.violet}18`,
                    color: colors.violet,
                    border: `1px solid ${colors.violet}30`,
                    textDecoration: 'none',
                    fontFamily: fonts.body,
                  }}
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LearnPage() {
  const [openFaq, setOpenFaq] = useState(0)
  const [conditionFilter, setConditionFilter] = useState(null)

  const filteredConditions = useMemo(() => {
    if (!conditionFilter) return CONDITIONS
    return CONDITIONS.filter((c) => c.title.toLowerCase().includes(conditionFilter.toLowerCase()))
  }, [conditionFilter])

  const baseUrl = 'https://reluxemedspa.com'

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Learn — RELUXE Med Spa Treatment & Skincare Education',
        url: `${baseUrl}/learn`,
        description: 'Your complete guide to med spa treatments, conditions, and skincare — from Botox and fillers to lasers and facials. Expert answers from the RELUXE team.',
        isPartOf: { '@type': 'WebSite', name: 'RELUXE Med Spa', url: baseUrl },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Learn', item: `${baseUrl}/learn` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: COMMON_QUESTIONS.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
  }

  return (
    <BetaLayout
      title="Treatment & Skincare Education"
      description="Your complete guide to med spa treatments, conditions, and skincare. Expert answers on Botox, fillers, Morpheus8, facials, and more from the RELUXE team in Westfield & Carmel, IN."
      canonical={`${baseUrl}/learn`}
      structuredData={structuredData}
    >
      {({ fontKey, fonts }) => (
        <>
          {/* ── Hero ── */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '60%', height: '160%', background: `radial-gradient(ellipse, ${colors.violet}10, transparent 70%)`, pointerEvents: 'none' }} />

            <div className="max-w-5xl mx-auto px-6 py-24 lg:py-36 relative text-center">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Learn
                </p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Your Guide to{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Better Skin
                  </span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.65, color: 'rgba(250,248,245,0.55)', maxWidth: '36rem', margin: '0 auto' }}>
                  Treatments, conditions, and honest answers — everything you need to make confident decisions about your skin.
                </p>
              </FadeIn>

              {/* Quick jump links */}
              <FadeIn delay={0.15}>
                <div className="flex flex-wrap gap-2 justify-center mt-8">
                  {[
                    { label: 'Treatments', href: '#treatments' },
                    { label: 'Conditions', href: '#conditions' },
                    { label: 'FAQs', href: '#faqs' },
                    { label: 'Guides', href: '#guides' },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="rounded-full px-5 py-2 text-sm font-medium transition-all hover:scale-[1.04]"
                      style={{
                        fontFamily: fonts.body,
                        background: 'rgba(250,248,245,0.06)',
                        color: 'rgba(250,248,245,0.7)',
                        border: '1px solid rgba(250,248,245,0.1)',
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── Treatment Categories ── */}
          <section id="treatments" className="relative" style={{ backgroundColor: '#0d0d14', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.3, pointerEvents: 'none' }} />

            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Treatments
                </p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
                  Explore by Category
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginBottom: '2.5rem' }}>
                  Every treatment at RELUXE, grouped by what it does best.
                </p>
              </FadeIn>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {TREATMENT_CATEGORIES.map((cat, i) => (
                  <FadeIn key={cat.slug} delay={i * 0.06}>
                    <div
                      className="rounded-2xl p-6 h-full flex flex-col transition-transform hover:scale-[1.015]"
                      style={{
                        background: 'rgba(250,248,245,0.03)',
                        border: '1px solid rgba(250,248,245,0.07)',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                        <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white, margin: 0 }}>
                          {cat.title}
                        </h3>
                      </div>

                      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', marginBottom: '1rem', flex: 1 }}>
                        {cat.description}
                      </p>

                      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {cat.highlight}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {cat.services.map((svc) => (
                          <Link
                            key={svc.slug}
                            href={`/services/${svc.slug}`}
                            className="rounded-full px-3 py-1 text-xs transition-colors hover:bg-white/10"
                            style={{
                              fontFamily: fonts.body,
                              fontWeight: 500,
                              color: 'rgba(250,248,245,0.65)',
                              background: 'rgba(250,248,245,0.06)',
                              textDecoration: 'none',
                            }}
                          >
                            {svc.name}
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={`/services/${cat.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80"
                        style={{ fontFamily: fonts.body, color: colors.violet, textDecoration: 'none' }}
                      >
                        Learn more <span style={{ fontSize: '0.875rem' }}>→</span>
                      </Link>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>

          {/* ── Conditions ── */}
          <section id="conditions" className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.4, pointerEvents: 'none' }} />

            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.fuchsia, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Conditions
                </p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
                  What Are You Treating?
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginBottom: '2.5rem' }}>
                  Start with your concern — we&apos;ll show you the best path forward.
                </p>
              </FadeIn>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredConditions.map((cond, i) => (
                  <FadeIn key={cond.slug} delay={i * 0.04}>
                    <Link
                      href={`/conditions/${cond.slug}`}
                      className="block rounded-xl p-5 transition-all hover:scale-[1.02]"
                      style={{
                        background: 'rgba(250,248,245,0.03)',
                        border: '1px solid rgba(250,248,245,0.07)',
                        textDecoration: 'none',
                      }}
                    >
                      <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 700, color: colors.white, marginBottom: '0.5rem' }}>
                        {cond.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {cond.treatments.map((t) => (
                          <span
                            key={t}
                            className="rounded-full px-2.5 py-0.5 text-xs"
                            style={{
                              fontFamily: fonts.body,
                              fontWeight: 500,
                              color: 'rgba(250,248,245,0.55)',
                              background: `${colors.fuchsia}12`,
                              border: `1px solid ${colors.fuchsia}20`,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.2}>
                <div className="text-center mt-10">
                  <Link
                    href="/conditions"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ fontFamily: fonts.body, color: colors.fuchsia, textDecoration: 'none' }}
                  >
                    View all conditions <span>→</span>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── Common Questions ── */}
          <section id="faqs" className="relative" style={{ backgroundColor: '#0d0d14', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.3, pointerEvents: 'none' }} />

            <div className="max-w-3xl mx-auto px-6 py-24 lg:py-32 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Common Questions
                </p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, color: colors.white, marginBottom: '2rem' }}>
                  Honest Answers
                </h2>
              </FadeIn>

              <div>
                {COMMON_QUESTIONS.map((faq, i) => (
                  <ExpandableFAQ
                    key={i}
                    item={faq}
                    fonts={fonts}
                    isOpen={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── Guides & Resources ── */}
          <section id="guides" className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.4, pointerEvents: 'none' }} />

            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.rose, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Guides
                </p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
                  Quick-Start Guides
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginBottom: '2.5rem' }}>
                  Jump straight to what matters.
                </p>
              </FadeIn>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {GUIDES.map((guide, i) => (
                  <FadeIn key={guide.href} delay={i * 0.06}>
                    <Link
                      href={guide.href}
                      className="block rounded-2xl p-6 h-full transition-all hover:scale-[1.02]"
                      style={{
                        background: 'rgba(250,248,245,0.03)',
                        border: '1px solid rgba(250,248,245,0.07)',
                        textDecoration: 'none',
                      }}
                    >
                      <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white, marginBottom: '0.5rem' }}>
                        {guide.title}
                      </h3>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', marginBottom: '1rem' }}>
                        {guide.description}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 text-sm font-semibold"
                        style={{ fontFamily: fonts.body, color: colors.rose }}
                      >
                        {guide.cta} <span>→</span>
                      </span>
                    </Link>
                  </FadeIn>
                ))}
              </div>

              {/* Cross-link to Inspiration */}
              <FadeIn delay={0.2}>
                <div className="text-center mt-12">
                  <Link
                    href="/inspiration"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.03]"
                    style={{
                      fontFamily: fonts.body,
                      background: 'rgba(250,248,245,0.06)',
                      color: 'rgba(250,248,245,0.7)',
                      border: '1px solid rgba(250,248,245,0.1)',
                      textDecoration: 'none',
                    }}
                  >
                    Read our latest articles on Inspiration →
                  </Link>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── Bottom CTA ── */}
          <section className="relative" style={{ background: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})`, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.6, pointerEvents: 'none' }} />

            <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 relative text-center">
              <FadeIn>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                  Ready to Get Started?
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', maxWidth: '28rem', margin: '0 auto 2rem' }}>
                  Book a free consultation and let our team build a plan that fits your goals, timeline, and budget.
                </p>
                <GravityBookButton label="Book Free Consult" fonts={fonts} />
              </FadeIn>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  )
}
