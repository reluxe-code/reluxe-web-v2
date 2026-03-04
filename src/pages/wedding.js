// pages/wedding.js
import Link from 'next/link'
import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function WeddingPrepPage() {
  return (
    <BetaLayout
      title="Wedding Prep in Carmel & Westfield"
      description="Plan your bridal & groom wedding prep in Carmel and Westfield with RELUXE Med Spa. Timeline, injectables, facials, laser hair removal, microneedling, body contouring—everything for camera-ready skin."
      canonical="https://reluxemedspa.com/wedding"
    >
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18), transparent 60%)`,
        }}
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7" style={{ color: colors.white }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.muted }}>
                RELUXE &bull; Wedding Prep
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
                Carmel &amp; Westfield{' '}
                <span
                  style={{
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Wedding Prep
                </span>
                —Glow for the Big Day
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
                From proposal to portraits, RELUXE crafts a personalized timeline so you look luminous and camera-ready.
                Designed for <strong>brides</strong>, <strong>grooms</strong>, and the <strong>wedding party</strong>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 items-center">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a
                  href="#timeline"
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
                  See the Timeline
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2" style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)' }}>Provider-led plans</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)' }}>Natural, photo-ready results</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)' }}>Bridal &amp; groom packages</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl" style={{ border: `1px solid rgba(250,248,245,0.1)` }}>
                <img src="/images/events/wedding.jpg" alt="RELUXE Wedding Prep—bridal glow" className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.7)' }}>Images represent service categories available at RELUXE.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local SEO kicker */}
      <section style={{ backgroundColor: colors.cream, borderBottom: `1px solid ${colors.stone}` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center" style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>
          Serving <strong>Carmel</strong>, <strong>Westfield</strong>, Zionsville, Fishers, Indy, and North Indianapolis couples.
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Your Wedding Prep Timeline
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, marginTop: '0.75rem' }}>
            We personalize every step to your date, goals, and skin. Here's a proven structure to stay stress-free.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimelineCard
            when="6+ Months"
            items={[
              'Consultation & custom plan',
              'Laser hair removal series (face, underarms, bikini, legs)',
              'SkinPen\u00AE microneedling for texture/acne scars',
              'Begin medical-grade skincare (Skinbetter, SkinCeuticals, Universkin)',
            ]}
          />
          <TimelineCard
            when="3\u20134 Months"
            items={[
              'Neurotoxins: Botox\u00AE, Dysport\u00AE, Jeuveau\u00AE, Daxxify\u00AE',
              'Filler for lips/cheeks/chin/jawline (as needed)',
              'EvolveX body contouring (tone, tighten)',
              'Glow-building facials: Glo2Facial\u00AE, HydraFacial\u00AE',
            ]}
          />
          <TimelineCard
            when="1\u20132 Months"
            items={[
              'Opus Plasma\u00AE, ClearLift, or IPL for refinement',
              'Final filler tweaks (if needed)',
              'Spruce up brows & lashes; maintain skincare',
              'Massage therapy for stress relief',
            ]}
          />
          <TimelineCard
            when="Final 2\u20133 Weeks"
            items={[
              'Signature facial + dermaplane',
              'Hydrinity hydration boost',
              'Subtle tox touch-ups (timed for photos)',
              'Recovery buffers before events',
            ]}
          />
        </div>

        <div className="mt-10 text-center">
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="relative py-16" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
              Popular Wedding Prep Services
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, marginTop: '0.75rem' }}>
              Everything you need for radiant, confident, photo-ready skin.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="Injectables"
              subtitle="Botox &bull; Dysport &bull; Daxxify &bull; Jeuveau"
              copy="Soften lines and refine contours while keeping expression natural. Perfectly timed for portraits."
              image="/images/treatments/tox.jpg"
              href="/book/tox/"
            />
            <ServiceCard
              title="Dermal Filler"
              subtitle="Lips &bull; Cheeks &bull; Chin &bull; Jawline"
              copy="Balance features and add subtle definition for close-ups and video."
              image="/images/treatments/filler.jpg"
              href="/book/filler/"
            />
            <ServiceCard
              title="Facials & Peels"
              subtitle="HydraFacial &bull; Glo2Facial &bull; Signature"
              copy="Consistent glow care for clarity and radiance without downtime."
              image="/images/treatments/glo2facial.jpg"
              href="/book/facials/"
            />
            <ServiceCard
              title="Microneedling"
              subtitle="SkinPen\u00AE"
              copy="Refine texture, minimize pores, and boost collagen over time."
              image="/images/treatments/skinpen.jpg"
              href="/book/microneedling/"
            />
            <ServiceCard
              title="Laser & RF"
              subtitle="Opus &bull; ClearLift &bull; IPL &bull; Morpheus8"
              copy="Tighten, resurface, and even tone for makeup-ready skin."
              image="/images/treatments/ipl.jpg"
              href="/book/laser/"
            />
            <ServiceCard
              title="Body Contouring"
              subtitle="EvolveX"
              copy="Tone and tighten targeted areas with a short, strategic series."
              image="/images/treatments/evolvex.jpg"
              href="/book/body/"
            />
          </div>

          <div className="mt-10 text-center">
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* Packages / Parties */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <h3 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
                Wedding Party Packages
              </h3>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body, marginTop: '0.75rem' }}>
                Make it a glow-up together. Bridal parties, groomsmen, moms—enjoy curated packages and private event options in
                our Carmel &amp; Westfield locations.
              </p>
              <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
                <li>Group facials &amp; dermaplane bundles</li>
                <li>Tox parties (minimums apply)</li>
                <li>Pre-event &ldquo;Red Carpet&rdquo; glow sessions</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <Link
                  href="/contact"
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
                  Ask About Packages
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl" style={{ border: `1px solid ${colors.stone}` }}>
                <img src="/images/events/bridal-party.jpg" alt="Bridal party skincare packages" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="relative py-16" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h4 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading, textAlign: 'center' }}>
            Wedding Prep FAQs
          </h4>
          <div className="mt-8 divide-y rounded-3xl bg-white" style={{ border: `1px solid ${colors.stone}`, divideColor: colors.stone }}>
            <FaqItem q="When should I start wedding prep?" a="We recommend starting 6+ months out for best results, with a focused push 3\u20134 months before. We can still help on tighter timelines\u2014book a consult and we'll prioritize high-impact treatments." />
            <FaqItem q="How close to the wedding can I get injectables?" a="Most brides and grooms plan tox 3\u20134 weeks prior so results settle before photos. Filler timing depends on the area; we'll advise based on your goals and date." />
            <FaqItem q="Can we book treatments for the whole wedding party?" a="Yes\u2014ask about bridal party bundles, tox parties, and same-day glow facials. We can host private events at Carmel or Westfield." />
            <FaqItem q="What if I have sensitive skin?" a="We'll tailor a gentle regimen, leverage Skinbetter/Colorescience/Hydrinity, and plan test-drives so there are no surprises close to the big day." />
          </div>
          <div className="mt-8 text-center">
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* Final CTA banner */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl p-[1px]" style={{ background: gradients.primary }}>
            <div className="rounded-3xl px-8 py-12 text-center" style={{ backgroundColor: colors.ink }}>
              <h5 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.white }}>
                Ready for Your Wedding Glow?
              </h5>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: 'rgba(250,248,245,0.7)', marginTop: '0.75rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
                Carmel &amp; Westfield's trusted med spa for natural, photo-ready results\u2014planned around your date.
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
                  Explore Services
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

WeddingPrepPage.getLayout = (page) => page

// --- Components ---
function TimelineCard({ when, items }) {
  return (
    <div className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]" style={{ border: `1px solid ${colors.stone}` }}>
      <div className="p-6">
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{when}</h3>
        <ul className="mt-3 list-disc pl-6 space-y-1" style={{ fontFamily: fonts.body, color: colors.body }}>
          {items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  )
}

function ServiceCard({ title, subtitle, copy, image, href }) {
  return (
    <div className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]" style={{ border: `1px solid ${colors.stone}` }}>
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
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
