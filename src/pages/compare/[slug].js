// src/pages/compare/[slug].js
// Side-by-side treatment comparison pages for SEO
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, typeScale } from '@/components/preview/tokens'
import GravityBookButton from '@/components/beta/GravityBookButton'
import GoogleReviewBadge from '@/components/GoogleReviewBadge'
import { getComparison, getAllComparisonSlugs } from '@/data/comparisons'

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

function FaqAccordion({ faqs, fonts }) {
  const [openIdx, setOpenIdx] = useState(0)
  return (
    <div>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderBottom: '1px solid rgba(250,248,245,0.08)' }}>
          <button
            onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
            className="w-full flex items-start justify-between gap-4 py-5 text-left"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, color: colors.cream, lineHeight: 1.4 }}>
              {faq.q}
            </span>
            <span style={{ color: colors.violet, fontSize: '1.25rem', lineHeight: 1, transition: 'transform 0.2s', transform: openIdx === i ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0, marginTop: 2 }}>
              +
            </span>
          </button>
          {openIdx === i && (
            <div className="pb-5" style={{ marginTop: -4 }}>
              <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(250,248,245,0.6)' }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ComparisonPage({ comparison, slug }) {
  const c = comparison
  const pageUrl = `${baseUrl}/compare/${slug}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: c.category, item: `${baseUrl}${c.categoryLink}` },
          { '@type': 'ListItem', position: 3, name: c.title, item: pageUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: c.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
      {
        '@type': 'Article',
        headline: c.seoTitle.split(' |')[0],
        description: c.seoDescription,
        url: pageUrl,
        author: { '@type': 'Organization', name: 'RELUXE Med Spa', url: baseUrl },
        publisher: { '@type': 'Organization', name: 'RELUXE Med Spa', url: baseUrl },
      },
    ],
  }

  const tbl = c.comparisonTable

  return (
    <BetaLayout
      title={c.title}
      rawTitle={c.seoTitle}
      description={c.seoDescription}
      canonical={pageUrl}
      structuredData={structuredData}
    >
      {({ fonts }) => (
        <>
          {/* ── Hero ── */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '60%', height: '160%', background: `radial-gradient(ellipse, ${colors.violet}10, transparent 70%)`, pointerEvents: 'none' }} />
            <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28 relative text-center">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Treatment Comparison
                </p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  {c.title}
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.65, color: 'rgba(250,248,245,0.6)', maxWidth: '36rem', margin: '0 auto 2rem' }}>
                  {c.heroDescription}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <GravityBookButton label="Book Free Consult" fonts={fonts} />
                  <Link
                    href={c.categoryLink}
                    className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.8)', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}
                  >
                    View {c.category}
                  </Link>
                </div>
                <div className="mt-6">
                  <GoogleReviewBadge variant="inline" fonts={fonts} />
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── Intro ── */}
          <section className="relative" style={{ backgroundColor: '#0d0d14', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.3, pointerEvents: 'none' }} />
            <div className="max-w-4xl mx-auto px-6 py-16 lg:py-20 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.7, color: 'rgba(250,248,245,0.6)', marginBottom: '1rem' }}>{c.intro.p1}</p>
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.7, color: 'rgba(250,248,245,0.6)' }}>{c.intro.p2}</p>
              </FadeIn>
            </div>
          </section>

          {/* ── Comparison Table ── */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.4, pointerEvents: 'none' }} />
            <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.fuchsia, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Side-by-Side
                </p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, color: colors.white, marginBottom: '2rem' }}>
                  {tbl.headers[1]} vs. {tbl.headers[2]}
                </h2>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(250,248,245,0.08)' }}>
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {tbl.headers.map((h, i) => (
                          <th
                            key={i}
                            className={i === 0 ? 'text-left' : 'text-center'}
                            style={{
                              fontFamily: fonts.display,
                              fontSize: '0.9375rem',
                              fontWeight: 700,
                              color: i === 0 ? 'rgba(250,248,245,0.4)' : colors.white,
                              padding: '1rem 1.25rem',
                              borderBottom: '1px solid rgba(250,248,245,0.08)',
                              background: 'rgba(250,248,245,0.02)',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.rows.map((row, ri) => (
                        <tr key={ri}>
                          <td
                            style={{
                              fontFamily: fonts.body,
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'rgba(250,248,245,0.7)',
                              padding: '0.875rem 1.25rem',
                              borderBottom: '1px solid rgba(250,248,245,0.05)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.label}
                          </td>
                          {row.values.map((val, vi) => (
                            <td
                              key={vi}
                              className="text-center"
                              style={{
                                fontFamily: fonts.body,
                                fontSize: '0.875rem',
                                color: row.highlight === vi ? colors.fuchsia : 'rgba(250,248,245,0.5)',
                                fontWeight: row.highlight === vi ? 600 : 400,
                                padding: '0.875rem 1.25rem',
                                borderBottom: '1px solid rgba(250,248,245,0.05)',
                              }}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {c.unitNote && (
                  <p className="mt-4" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.35)', lineHeight: 1.5 }}>
                    {c.unitNote}
                  </p>
                )}
              </FadeIn>
            </div>
          </section>

          {/* ── Detail Sections ── */}
          <section className="relative" style={{ backgroundColor: '#0d0d14', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.3, pointerEvents: 'none' }} />
            <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28 relative">
              {c.sections.map((s, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className={i > 0 ? 'mt-12' : ''}>
                    <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, color: colors.white, marginBottom: '0.75rem' }}>
                      {s.heading}
                    </h2>
                    <p style={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.7, color: 'rgba(250,248,245,0.6)' }}>
                      {s.content}
                    </p>
                  </div>
                </FadeIn>
              ))}

              <FadeIn delay={0.2}>
                <div className="text-center mt-14">
                  <GravityBookButton label="Book Free Consultation" fonts={fonts} />
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── FAQs ── */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.4, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  FAQs
                </p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, color: colors.white, marginBottom: '2rem' }}>
                  {c.title} Questions
                </h2>
              </FadeIn>
              <FaqAccordion faqs={c.faqs} fonts={fonts} />
            </div>
          </section>

          {/* ── Bottom CTA ── */}
          <section className="relative" style={{ background: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})`, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.6, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 relative text-center">
              <FadeIn>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                  {c.ctaHeading}
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', maxWidth: '28rem', margin: '0 auto 2rem' }}>
                  {c.ctaBody}
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

export function getStaticPaths() {
  return {
    paths: getAllComparisonSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export function getStaticProps({ params }) {
  const comparison = getComparison(params.slug)
  if (!comparison) return { notFound: true }
  return { props: { comparison, slug: params.slug } }
}
