import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import FinanceEstimator from '@/components/finance/FinanceEstimator'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const APPLY_URL = 'https://withcherry.com/patient/apply/?partner_id=reluxemedspa'

export default function CherryFinancingPage() {
  return (
    <BetaLayout
      title="Cherry Med Spa Financing | Carmel & Westfield"
      description="RELUXE Med Spa offers flexible payment plans with Cherry Financing in Carmel & Westfield. Split Botox, fillers, facials, laser, and memberships into monthly payments—no hard credit check."
      canonical="https://reluxemedspa.com/cherry-financing"
    >
      {/* Hero */}
      <section
        className="relative py-20 lg:py-28"
        style={{
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.15), transparent 60%)`,
          color: colors.white,
        }}
      >
        <div className="max-w-5xl mx-auto text-center px-4">
          <h1
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.hero.size,
              fontWeight: typeScale.hero.weight,
              lineHeight: typeScale.hero.lineHeight,
            }}
          >
            <span
              style={{
                background: gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Cherry Financing
            </span>{' '}
            at RELUXE Med Spa
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', color: 'rgba(250,248,245,0.7)', marginTop: '1rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
            Get the treatments you want&mdash;Botox, fillers, facials, laser hair removal, and more&mdash;without waiting.
            Cherry lets you split payments into easy monthly plans, with <strong>no hard credit check</strong>.
          </p>
          <div className="mt-8 flex justify-center gap-3 items-center">
            <a
              href={APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontFamily: fonts.body,
                fontWeight: 600,
                color: '#fff',
                background: gradients.primary,
              }}
            >
              Apply Now with Cherry
            </a>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      <div className="mt-8">
        <FinanceEstimator
          mode="estimator"
          imageSide="left"
          imageSrc="/images/finance/cherry.png"
          qrSrc="/images/finance/qr-apply.png"
          services={[
            { label: '30 Units of Jeuveau', price: 360 },
            { label: 'FDA Dosage - Full Face Tox', price: 896 },
            { label: 'Skinpen Package (4)', price: 1400 },
            { label: 'Unlimited Laser Hair', price: 2500 },
            { label: 'Morpheus8 Package (3)', price: 3000 },
          ]}
        />
      </div>

      {/* How It Works */}
      <section className="py-16" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading, textAlign: 'center' }}>
            How Cherry Financing Works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StepCard
              num="1"
              title="Apply in Seconds"
              copy="Fill out a quick application online or in our office. Approval is fast—with no hard credit check."
            />
            <StepCard
              num="2"
              title="Choose Your Plan"
              copy="Select from flexible payment options that fit your budget. Break payments into manageable monthly installments."
            />
            <StepCard
              num="3"
              title="Get Treated Today"
              copy="Enjoy Botox, fillers, facials, laser, or body contouring now—and pay later over time."
            />
          </div>
          <div className="mt-10 text-center">
            <a
              href={APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontFamily: fonts.body,
                fontWeight: 600,
                color: '#fff',
                background: gradients.primary,
              }}
            >
              Apply with Cherry
            </a>
          </div>
        </div>
      </section>

      {/* Example Payment Scenarios */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading, textAlign: 'center' }}>
          See What&apos;s Possible with Cherry
        </h2>
        <p style={{ fontFamily: fonts.body, color: colors.body, textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', marginTop: '0.75rem' }}>
          With Cherry, your self-care plan becomes affordable and stress-free. Here are some examples:
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ExampleCard
            title="Botox\u00AE or Jeuveau\u00AE"
            copy="Average treatment $360\u2013$575. With Cherry, split into 3 monthly payments of around $120\u2013$190."
          />
          <ExampleCard
            title="Filler Packages"
            copy="Full-face balancing or lips ($600\u2013$1,200). Finance with Cherry in 6\u201312 payments as low as $55/month."
          />
          <ExampleCard
            title="Laser Hair Removal"
            copy="Unlimited laser hair removal packages start at $500. Apply Cherry to pay as low as $45/month."
          />
          <ExampleCard
            title="Morpheus8 or EvolveX"
            copy="Transformative series ($1,500+). Use Cherry to spread cost into manageable payments."
          />
          <ExampleCard
            title="Facials & Memberships"
            copy="Monthly memberships, HydraFacial\u00AE, or Glo2Facial\u00AE. Finance a year of glowing skin affordably."
          />
          <ExampleCard
            title="Wedding or Event Prep"
            copy="Bundle tox, facials, and laser ahead of your big day\u2014pay monthly with Cherry."
          />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Why Patients Love Cherry
          </h2>
          <ul className="mt-6 space-y-3 text-left max-w-2xl mx-auto list-disc pl-5" style={{ fontFamily: fonts.body, color: colors.body }}>
            <li>No hard credit check&mdash;applying won&apos;t impact your credit score</li>
            <li>High approval rates, even for first-time patients</li>
            <li>Choose from flexible plans that fit your lifestyle</li>
            <li>Quick and easy&mdash;apply in minutes, use instantly</li>
            <li>Make self-care a priority without stressing about payment upfront</li>
          </ul>
          <div className="mt-10">
            <a
              href={APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontFamily: fonts.body,
                fontWeight: 600,
                color: '#fff',
                background: gradients.primary,
              }}
            >
              Apply Now
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 px-4" style={{ background: gradients.primary }}>
        <div className="max-w-4xl mx-auto text-center" style={{ color: colors.white }}>
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading }}>
            Make Your Dream Treatments Affordable
          </h2>
          <p style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.8)', marginTop: '0.75rem' }}>
            From Botox and filler to facials, body contouring, and laser&mdash;RELUXE and Cherry make it easy to invest in yourself now and pay later.
          </p>
          <div className="mt-8 flex justify-center gap-3 items-center">
            <a
              href={APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontFamily: fonts.body,
                fontWeight: 600,
                color: colors.white,
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              Apply Now
            </a>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

CherryFinancingPage.getLayout = (page) => page

// --- Components ---
function StepCard({ num, title, copy }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm text-center" style={{ border: `1px solid ${colors.stone}` }}>
      <div
        className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-white"
        style={{ background: gradients.primary, fontFamily: fonts.display, fontWeight: 700, fontSize: '1.125rem' }}
      >
        {num}
      </div>
      <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, marginTop: '1rem' }}>{title}</h3>
      <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.5rem' }}>{copy}</p>
    </div>
  )
}

function ExampleCard({ title, copy }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
      <h4 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
      <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.5rem' }}>{copy}</p>
    </div>
  )
}
