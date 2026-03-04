import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const HOH_CONTACT = '#services-hoh'

export default function HouseOfHealthPage() {
  return (
    <BetaLayout
      title="RELUXE x House of Health | Whole-Self Aesthetics & Wellness in Carmel & Westfield"
      description="RELUXE Med Spa partners with House of Health to deliver whole-self care—skin, body, energy, and confidence. Integrative wellness meets modern aesthetics."
      canonical="https://reluxemedspa.com/partners/house-of-health"
    >
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18), transparent 60%)`,
          color: colors.white,
        }}
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-18 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.muted }}>
                RELUXE Partnerships
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
                RELUXE &times;{' '}
                <span
                  style={{
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  House of Health
                </span>
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', color: 'rgba(250,248,245,0.7)', marginTop: '1rem', maxWidth: '42rem' }}>
                Beauty is better with balance. Together with <span style={{ fontWeight: 600 }}>House of Health</span>, we
                pair modern aesthetics with integrative wellness&mdash;addressing skin, stress, energy, hormones, and
                recovery&mdash;so results look great and last.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 items-center">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a
                  href={HOH_CONTACT}
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
                  Explore House of Health
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2" style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)' }}>Whole-self care</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)' }}>Integrative wellness</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.1)' }}>Provider-led plans</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl" style={{ border: '1px solid rgba(250,248,245,0.1)' }}>
                <img
                  src="/images/partners/hoh/House%20of%20Health-22.jpg"
                  alt="RELUXE x House of Health partnership"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.7)' }}>Aesthetics + wellness, thoughtfully combined.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We're Partnering */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Why This Collaboration Works
          </h2>
          <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '1rem' }}>
            Skin tells a story&mdash;from stress and sleep to nutrition and hormones. Our partnership blends RELUXE&apos;s
            precision aesthetics with House of Health&apos;s integrative approach for results that look natural and feel
            sustainable.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Pillar title="Inside + Outside">
            We treat the canvas and the chemistry&mdash;combining skin treatments with lifestyle-driven wellness plans.
          </Pillar>
          <Pillar title="Personalized Plans">
            Collaborative consults lead to step-by-step roadmaps tailored to your goals, schedule, and budget.
          </Pillar>
          <Pillar title="Sustainable Results">
            When the root causes are addressed, your glow lasts longer&mdash;and maintenance gets easier.
          </Pillar>
        </div>
      </section>

      {/* Services: RELUXE + House of Health */}
      <section id="services" className="relative py-16" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h3 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
              What We Do&mdash;Together
            </h3>
            <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.75rem' }}>
              Pair best-in-class skin treatments with integrative wellness support.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* RELUXE side */}
            <ServiceCard
              title="Injectables"
              subtitle="Botox\u00AE &bull; Dysport\u00AE &bull; Daxxify\u00AE &bull; Fillers"
              copy="Subtle, balanced enhancements for lines, lips, cheeks, and jawline."
              image="/images/partners/hoh/House%20of%20Health-27.jpg"
              href="/services/injectables"
            />
            <ServiceCard
              title="Advanced Skin"
              subtitle="Morpheus8 &bull; Opus Plasma &bull; ClearLift &bull; SkinPen\u00AE"
              copy="Tighten, resurface, and refine tone and texture for lasting skin health."
              image="/images/partners/hoh/House%20of%20Health-26.jpg"
              href="/services/laser"
            />
            <ServiceCard
              title="Facials & LHR"
              subtitle="HydraFacial\u00AE &bull; Glo2Facial\u2122 &bull; Laser Hair Removal"
              copy="Monthly maintenance for clarity, glow, and smooth confidence."
              image="/images/partners/hoh/House%20of%20Health-24.jpg"
              href="/services"
            />

            {/* House of Health side */}
            <ServiceCard
              id="services-hoh"
              title="Nutrition & Coaching"
              subtitle="Habits &bull; Metabolism &bull; Gut Support"
              copy="Personalized guidance to fuel skin health, energy, and recovery."
              image="/images/partners/hoh/House%20of%20Health-64.jpg"
              href={HOH_CONTACT}
            />
            <ServiceCard
              title="Functional Testing"
              subtitle="Targeted Labs &bull; Data-Driven Care"
              copy="Identify imbalances that impact skin, stress, sleep, and mood."
              image="/images/partners/hoh/House%20of%20Health-26.jpg"
              href={HOH_CONTACT}
            />
            <ServiceCard
              title="Recovery & Balance"
              subtitle="Stress &bull; Sleep &bull; Movement"
              copy="Simple, sustainable routines that help your results last longer."
              image="/images/partners/hoh/House%20of%20Health-24.jpg"
              href={HOH_CONTACT}
            />
          </div>

          <div className="mt-10 text-center">
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* Signature Collab Programs */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h3 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Signature Programs
          </h3>
          <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.75rem' }}>
            Curated pathways that blend skin + wellness for noticeable, lasting change.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CollabCard
            title="Total Glow"
            copy="HydraFacial or Glo2Facial + tailored skincare; paired with nutrition and hydration strategy."
            bullets={['Monthly facials', 'At-home protocol', 'Energy & hydration focus']}
          />
          <CollabCard
            title="Skin & Wellness Reset"
            copy="Opus or Morpheus8 series with recovery, sleep, and stress coaching for collagen-friendly habits."
            bullets={['3\u20134 treatment series', 'Recovery roadmap', 'Sustainable maintenance']}
          />
          <CollabCard
            title="Acne: Inside-Out"
            copy="Clarity facials + medical-grade skincare supported by nutrition and habit coaching."
            bullets={['Pore & oil control', 'Trigger mapping', 'Long-term skin plan']}
          />
        </div>

        <div className="mt-10 text-center">
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-6xl px-4">
          <h3 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading, textAlign: 'center' }}>
            How It Works
          </h3>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Step num="01" title="Consults">
              Meet with RELUXE and House of Health&mdash;together we map goals, timelines, and budgets.
            </Step>
            <Step num="02" title="Plan">
              We combine treatments and wellness supports into a step-by-step schedule.
            </Step>
            <Step num="03" title="Treat">
              Precision services at RELUXE + practical wellness guidance you can actually follow.
            </Step>
            <Step num="04" title="Maintain">
              Simple check-ins, smart skincare, and sustainable habits keep results going.
            </Step>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <h4 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading, textAlign: 'center' }}>
          Partnership FAQs
        </h4>
        <div className="mt-8 divide-y rounded-3xl bg-white" style={{ border: `1px solid ${colors.stone}` }}>
          <FaqItem
            q="Can I book combined appointments?"
            a="Yes\u2014start with a RELUXE consult and we\u2019ll coordinate an aligned plan with House of Health. Some visits are same-day; others are sequenced for best outcomes."
          />
          <FaqItem
            q="Do I need lab work?"
            a="Not always. Functional testing is optional and considered when it may clarify root causes impacting skin, energy, or recovery."
          />
          <FaqItem
            q="Is this medical care?"
            a="RELUXE provides aesthetic services. House of Health provides wellness services. We collaborate to support your goals, and will refer to medical care when appropriate."
          />
          <FaqItem
            q="How does billing work?"
            a="Services are billed by each provider separately. We outline costs up front and help you sequence appointments efficiently."
          />
        </div>
        <div className="mt-8 text-center">
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl p-[1px]" style={{ background: gradients.primary }}>
            <div className="rounded-3xl px-8 py-12 text-center" style={{ backgroundColor: colors.ink }}>
              <h5 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.white }}>
                Whole-Self Care. Real-World Results.
              </h5>
              <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: 'rgba(250,248,245,0.7)', marginTop: '0.75rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
                When aesthetics and wellness align, you feel it&mdash;in your skin, your energy, your confidence. Let&apos;s build
                your plan together.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a
                  href={HOH_CONTACT}
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
                  Explore House of Health
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

HouseOfHealthPage.getLayout = (page) => page

/* --- Components --- */
function Pillar({ title, children }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
      <h4 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
      <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.5rem' }}>{children}</p>
    </div>
  )
}

function ServiceCard({ title, subtitle, copy, image, href, id }) {
  return (
    <div id={id} className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]" style={{ border: `1px solid ${colors.stone}` }}>
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-6">
        <h4 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
        {subtitle && <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted, marginTop: '0.25rem' }} dangerouslySetInnerHTML={{ __html: subtitle }} />}
        <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.75rem' }}>{copy}</p>
        <div className="mt-5 flex items-center justify-between">
          <Link href={href} style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.violet }}>Learn More &rarr;</Link>
        </div>
      </div>
    </div>
  )
}

function CollabCard({ title, copy, bullets = [] }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
      <h4 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
      <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.5rem' }}>{copy}</p>
      {bullets.length > 0 && (
        <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, color: colors.body }}>
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: colors.violet }} /> {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Step({ num, title, children }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
      <div className="flex items-center gap-3">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: gradients.subtle, border: `1px solid ${colors.violet}25`, fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 700 }}
        >
          {num}
        </span>
        <h5 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.heading }}>{title}</h5>
      </div>
      <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.75rem' }}>{children}</p>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between" style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading }}>
        <span>{q}</span>
        <svg className="h-5 w-5 transition-transform group-open:rotate-180" style={{ color: colors.muted }} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/>
        </svg>
      </summary>
      <div className="px-6 pb-5" style={{ fontFamily: fonts.body, color: colors.body }}>{a}</div>
    </details>
  )
}
