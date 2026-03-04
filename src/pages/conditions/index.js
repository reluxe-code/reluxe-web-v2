// src/pages/conditions/index.js
// Conditions hub — BetaLayout + structured data
import Link from 'next/link'
import { motion } from 'framer-motion'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, typeScale } from '@/components/preview/tokens'
import GravityBookButton from '@/components/beta/GravityBookButton'
import GoogleReviewBadge from '@/components/GoogleReviewBadge'
import { getAllConditions } from '@/data/conditions'

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`
const baseUrl = 'https://reluxemedspa.com'

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

export default function ConditionsPage({ conditions }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'What We Treat at RELUXE Med Spa',
        itemListElement: conditions.map((c, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${baseUrl}/conditions/${c.slug}`,
          name: c.title,
        })),
      },
    ],
  }

  return (
    <BetaLayout
      title="What We Treat | Conditions We Treat"
      rawTitle="What We Treat | Conditions We Treat | RELUXE Med Spa Carmel & Westfield"
      description="RELUXE Med Spa treats wrinkles, fine lines, acne scars, sun damage, sagging skin, and more in Carmel & Westfield. Explore what we treat and the treatments that work."
      canonical={`${baseUrl}/conditions`}
      structuredData={structuredData}
    >
      {({ fontKey, fonts }) => (
        <>
          {/* ── Hero ── */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '60%', height: '160%', background: `radial-gradient(ellipse, ${colors.violet}10, transparent 70%)`, pointerEvents: 'none' }} />

            <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 relative text-center">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  RELUXE &middot; Conditions
                </p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  What We Treat
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.65, color: 'rgba(250,248,245,0.6)', maxWidth: '36rem', margin: '0 auto 2rem' }}>
                  Patients come to RELUXE with concerns like wrinkles, acne scars, sun damage, and more.
                  Our Carmel & Westfield teams create treatment plans that deliver natural results you'll love.
                </p>
                <GravityBookButton label="Book Free Consult" fonts={fonts} />
                <div className="mt-6">
                  <GoogleReviewBadge variant="inline" fonts={fonts} />
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── Conditions Grid ── */}
          <section className="relative" style={{ backgroundColor: '#0d0d14', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.3, pointerEvents: 'none' }} />

            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {conditions.map((c, i) => (
                  <FadeIn key={c.slug} delay={i * 0.04}>
                    <Link
                      href={`/conditions/${c.slug}`}
                      className="group block rounded-2xl overflow-hidden h-full transition-all hover:scale-[1.015]"
                      style={{
                        background: 'rgba(250,248,245,0.03)',
                        border: '1px solid rgba(250,248,245,0.07)',
                        textDecoration: 'none',
                      }}
                    >
                      {c.heroImage && (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={c.heroImage}
                            alt={c.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white, marginBottom: '0.5rem' }}>
                          {c.title}
                        </h3>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', marginBottom: '1rem' }}>
                          {c.heroDescription}
                        </p>
                        <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.fuchsia }}>
                          Explore Treatments →
                        </span>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>

          {/* ── Bottom CTA ── */}
          <section className="relative" style={{ background: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})`, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.6, pointerEvents: 'none' }} />

            <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 relative text-center">
              <FadeIn>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                  Not Sure Where to Start?
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', maxWidth: '28rem', margin: '0 auto 2rem' }}>
                  Book a free consultation and our team will recommend the right treatments for your goals.
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

export function getStaticProps() {
  const allConditions = getAllConditions()
  const conditions = allConditions.map((c) => ({
    slug: c.slug,
    title: c.title,
    heroDescription: c.heroDescription,
    heroImage: c.heroImage || null,
  }))

  return { props: { conditions } }
}
