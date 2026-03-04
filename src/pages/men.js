// pages/men.js
import Image from 'next/image'
import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import SeoJsonLd from '../components/SeoJsonLd'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function MenPage() {
  return (
    <BetaLayout
      title="Men's Med Spa Services in Carmel & Westfield, IN"
      description="Men's Botox, facials, laser hair removal & massage at RELUXE Med Spa in Carmel & Westfield, IN. Discreet, natural results. Book your low-pressure consultation today."
      canonical="https://reluxemedspa.com/men"
      structuredData={[
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reluxemedspa.com' },
            { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://reluxemedspa.com/services' },
            { '@type': 'ListItem', position: 3, name: "Men's Services", item: 'https://reluxemedspa.com/men' },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: "Will I look 'done' after injectables?", acceptedAnswer: { '@type': 'Answer', text: 'No. Our approach is conservative and anatomy-aware. Expect subtle softening that keeps your expressions natural.' } },
            { '@type': 'Question', name: 'What facial is best for men?', acceptedAnswer: { '@type': 'Answer', text: 'HydraFacial or Glo2Facial are great monthly resets—deep cleanse, exfoliation, and hydration tailored to your skin.' } },
            { '@type': 'Question', name: 'Does laser hair removal hurt?', acceptedAnswer: { '@type': 'Answer', text: 'Most describe it as quick snaps with manageable discomfort. Back, chest, and neck are popular for long-term convenience.' } },
            { '@type': 'Question', name: "I'm new—where do I start?", acceptedAnswer: { '@type': 'Answer', text: "Book a low-pressure consult. We'll review goals, map a plan, and start with basics that deliver noticeable wins." } },
          ],
        },
      ]}
    >
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.15), transparent 60%)`,
        }}
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7" style={{ color: colors.white }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.muted }}>
                RELUXE &bull; Men&apos;s Services
              </p>
              <h1
                style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.hero.size,
                  fontWeight: typeScale.hero.weight,
                  lineHeight: typeScale.hero.lineHeight,
                  marginTop: '0.75rem',
                }}
              >
                Look Sharp.{' '}
                <span
                  style={{
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Feel Confident.
                </span>{' '}
                Age Gracefully.
              </h1>
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: typeScale.body.size,
                  lineHeight: typeScale.body.lineHeight,
                  color: 'rgba(250,248,245,0.7)',
                  marginTop: '1rem',
                  maxWidth: '36rem',
                }}
              >
                Taking care of yourself is so 2025. At RELUXE, men get discreet, natural results that keep you looking like you—only refreshed. Your secret weapon? <strong>Healthy skin</strong>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 items-center">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a
                  href="#services"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    padding: '0.75rem 1.5rem',
                    fontFamily: fonts.body,
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'rgba(250,248,245,0.9)',
                    border: '1px solid rgba(250,248,245,0.15)',
                  }}
                >
                  Explore Services
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2" style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)' }}>Subtle, natural results</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)' }}>Provider-led plans</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)' }}>Low-pressure consults</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl" style={{ border: '1px solid rgba(250,248,245,0.1)' }}>
                <Image src="/images/men/facial2.jpg" alt="Men's med spa facial services at RELUXE in Westfield and Carmel, Indiana" fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 40vw" />
                <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.7)' }}>Photos represent service categories available at RELUXE.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Popular for Men at RELUXE
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, marginTop: '0.75rem' }}>
            Our most requested treatments for natural, discreet upgrades—tailored to men&apos;s skin and goals.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ServiceCard
            title="Injectables"
            subtitle="Botox &bull; Dysport &bull; Daxxify &bull; Jeuveau"
            copy="Soften forehead lines and crow's feet without looking frozen. Fast, subtle, confidence-boosting."
            image="/images/men/tox2.jpg"
            href="/book/tox/"
          />
          <ServiceCard
            title="Facials"
            subtitle="Glo2Facial &bull; HydraFacial &bull; Signature"
            copy="Deep clean, exfoliate, and rehydrate. The post-gym, post-travel reset your skin deserves."
            image="/images/men/facial.jpg"
            href="/book/facials/"
          />
          <ServiceCard
            title="Laser Hair Removal"
            subtitle="Back &bull; Chest &bull; Neck"
            copy="Ditch razor burn and upkeep. Smooth, long-term results where you want them most."
            image="/images/men/lhr.jpg"
            href="/book/laser-hair-removal/"
          />
          <ServiceCard
            title="Massage Therapy"
            subtitle="Recovery &bull; Stress Relief"
            copy="Therapeutic modalities to loosen tightness, improve mobility, and lower stress."
            image="/images/men/massage.jpg"
            href="/book/massage/"
          />
        </div>

        <div className="mt-10 text-center">
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Transformation / Social Proof */}
      <section className="relative py-16" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
                  Discreet, Natural Transformations
                </h3>
                <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.75rem' }}>
                  Our best transformations for men look like you—just more rested, sharper, and younger. We plan conservatively, treat precisely, and keep it low-key.
                </p>
                <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: colors.violet }} /> Subtle, never overdone</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: colors.violet }} /> Tailored to men&apos;s skin &amp; structure</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: colors.violet }} /> Provider-led treatment plans</li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3 items-center">
                  <GravityBookButton fontKey={FONT_KEY} size="hero" />
                  <a
                    href="#faq"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '9999px',
                      padding: '0.75rem 1.5rem',
                      fontFamily: fonts.body,
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      color: colors.heading,
                      border: `1px solid ${colors.stone}`,
                    }}
                  >
                    Common Questions
                  </a>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative grid grid-cols-2 gap-4">
                <div className="relative aspect-square rounded-2xl shadow-sm overflow-hidden" style={{ border: `1px solid ${colors.stone}` }}>
                  <Image src="/images/men/tox.jpg" alt="Men's Botox and injectable results at RELUXE Med Spa" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                </div>
                <div className="relative aspect-square rounded-2xl shadow-sm overflow-hidden" style={{ border: `1px solid ${colors.stone}` }}>
                  <Image src="/images/men/face.jpg" alt="HydraFacial and Glo2Facial for men at RELUXE" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                </div>
                <div className="relative aspect-square rounded-2xl shadow-sm overflow-hidden" style={{ border: `1px solid ${colors.stone}` }}>
                  <Image src="/images/men/lhr.jpg" alt="Laser hair removal for men - back, chest, neck at RELUXE" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                </div>
                <div className="relative aspect-square rounded-2xl shadow-sm overflow-hidden" style={{ border: `1px solid ${colors.stone}` }}>
                  <Image src="/images/men/massage.jpg" alt="Massage therapy for men at RELUXE Med Spa" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Pillars */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h3 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Why Men Choose RELUXE
          </h3>
          <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, marginTop: '0.75rem' }}>
            Because confidence looks good on you.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Pillar title="Confidence, Upgraded" copy="Show up sharper in every room—boardroom, gym, and date night—with results that look like you, only better." />
          <Pillar title="Future-Proof Your Skin" copy="Proactive care slows visible aging. Build a routine that works as hard as you do." />
          <Pillar title="Low-Pressure, High-Expertise" copy="We educate first, recommend second, and only treat when it serves your goals." />
        </div>
        <div className="mt-10 text-center">
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-16" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h4 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading, textAlign: 'center' }}>
            Men&apos;s FAQs
          </h4>
          <div className="mt-8 divide-y rounded-3xl bg-white" style={{ border: `1px solid ${colors.stone}` }}>
            <FaqItem q="Will I look 'done' after injectables?" a="No. Our approach is conservative and anatomy-aware. Expect subtle softening that keeps your expressions natural." />
            <FaqItem q="What facial is best for men?" a="HydraFacial or Glo2Facial are great monthly resets—deep cleanse, exfoliation, and hydration tailored to your skin." />
            <FaqItem q="Does laser hair removal hurt?" a="Most describe it as quick snaps with manageable discomfort. Back, chest, and neck are popular for long-term convenience." />
            <FaqItem q="I'm new—where do I start?" a="Book a low-pressure consult. We'll review goals, map a plan, and start with basics that deliver noticeable wins." />
          </div>
          <div className="mt-8 text-center">
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl p-[1px]" style={{ background: gradients.primary }}>
            <div className="rounded-3xl px-8 py-12 text-center" style={{ backgroundColor: colors.ink }}>
              <h5 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.white }}>
                Ready to Look Sharp &amp; Feel Your Best?
              </h5>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: 'rgba(250,248,245,0.7)', marginTop: '0.75rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
                Your personal plan might include Botox/Jeuveau, Glo2/HydraFacial, signature facials, laser hair removal, and massage—tailored to you.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a
                  href="#services"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    padding: '0.75rem 1.5rem',
                    fontFamily: fonts.body,
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: colors.white,
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(250,248,245,0.1)',
                  }}
                >
                  See Men&apos;s Services
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

MenPage.getLayout = (page) => page

// --- Components ---
function ServiceCard({ title, subtitle, copy, image, href }) {
  return (
    <div className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]" style={{ border: `1px solid ${colors.stone}` }}>
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image src={image} alt={`${title} for men at RELUXE Med Spa`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
      </div>
      <div className="p-6">
        <h4 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
        {subtitle && <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted, marginTop: '0.25rem' }} dangerouslySetInnerHTML={{ __html: subtitle }} />}
        <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.75rem' }}>{copy}</p>
        <div className="mt-5 flex items-center justify-between">
          <a href={href} style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.violet }}>Book Now &rarr;</a>
        </div>
      </div>
    </div>
  )
}

function Pillar({ title, copy }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
      <h4 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
      <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.5rem' }}>{copy}</p>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between" style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading }}>
        <span>{q}</span>
        <svg className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: colors.muted }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
      </summary>
      <div className="px-6 pb-5" style={{ fontFamily: fonts.body, color: colors.body }}>{a}</div>
    </details>
  )
}
