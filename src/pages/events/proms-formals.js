import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import EventInquiryForm from '@/components/events/EventInquiryForm'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function PromsFormalsPage() {
  return (
    <BetaLayout
      title="Prom & Formal Prep | Carmel & Westfield"
      description="Prom and formal prep in Carmel & Westfield. Gentle facials, dermaplane, acne management, and glow treatments timed for the big night."
      canonical="https://reluxemedspa.com/events/proms-formals"
    >
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: colors.ink,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18), transparent 60%), ${grain}`,
          }}
        />
        <div
          style={{
            position: 'relative',
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '5rem 1rem 5rem',
          }}
          className="sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: typeScale.label.size,
                  fontWeight: typeScale.label.weight,
                  letterSpacing: typeScale.label.letterSpacing,
                  textTransform: typeScale.label.textTransform,
                  lineHeight: typeScale.label.lineHeight,
                  color: colors.muted,
                }}
              >
                RELUXE &bull; Prom &amp; Formals
              </p>
              <h1
                style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.hero.size,
                  fontWeight: typeScale.hero.weight,
                  lineHeight: typeScale.hero.lineHeight,
                  color: colors.white,
                  marginTop: '0.75rem',
                }}
              >
                Prom &amp; Formal Prep in{' '}
                <span
                  style={{
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Carmel &amp; Westfield
                </span>
              </h1>
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: '1.125rem',
                  lineHeight: 1.7,
                  color: colors.muted,
                  marginTop: '1rem',
                }}
              >
                Look flawless for prom, homecoming, or your next formal. Our providers create safe, age-appropriate glow
                plans that work with your skin type and event date.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a
                  href="#timing"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    padding: '0.75rem 1.5rem',
                    fontFamily: fonts.body,
                    fontWeight: 600,
                    color: 'rgba(250,248,245,0.9)',
                    border: '1px solid rgba(250,248,245,0.15)',
                    textDecoration: 'none',
                  }}
                >
                  See Timing Guide
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '4/5',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(250,248,245,0.1)',
                }}
              >
                <img
                  src="/images/events/prom.jpg"
                  alt="Prom facial prep Carmel Westfield"
                  style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Inquiry */}
      <section
        style={{
          background: `linear-gradient(to bottom, ${colors.ink}, #111)`,
          padding: '4rem 0',
        }}
      >
        <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.white,
            }}
          >
            Interested in Prom &amp; Formal Prep?
          </h2>
          <p
            style={{
              fontFamily: fonts.body,
              color: colors.muted,
              marginTop: '0.75rem',
            }}
          >
            Tell us about your event and we&apos;ll create a custom plan.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <EventInquiryForm defaultEventType="Prom / Formal" />
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section
        id="timing"
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '4rem 1rem',
        }}
        className="sm:px-6 lg:px-8"
      >
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: typeScale.sectionHeading.size,
            fontWeight: typeScale.sectionHeading.weight,
            lineHeight: typeScale.sectionHeading.lineHeight,
            color: colors.heading,
            textAlign: 'center',
          }}
        >
          Prom &amp; Formal Timing Guide
        </h2>
        <p
          style={{
            fontFamily: fonts.body,
            color: colors.body,
            textAlign: 'center',
            marginTop: '0.75rem',
          }}
        >
          Simple steps for clear, glowing skin that photographs beautifully.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard when="4--6 Weeks Before" items={['Consult & skin check', 'Begin gentle facials', 'Start acne plan if needed']} />
          <TimingCard when="2--3 Weeks Before" items={['HydraFacial\u00AE or Glo2Facial\u00AE', 'Dermaplane for smooth makeup', 'Gentle peel if skin tolerates']} />
          <TimingCard when="1 Week Before" items={['Signature facial + hydration boost', 'Hydrinity serums for radiance']} />
          <TimingCard when="Day Of" items={['Gentle cleanse + hydrate', 'No new products', 'Optional ice roller for de-puff']} />
        </div>
      </section>

      {/* Popular Services */}
      <section style={{ backgroundColor: colors.cream, padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.heading,
              textAlign: 'center',
            }}
          >
            Popular Prom Services
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard title="HydraFacial\u00AE" copy="Hydration, clarity, and a glow that lasts through prom night." image="/images/treatments/hydrafacial.jpg" href="/book/facials/" />
            <ServiceCard title="Dermaplane" copy="Removes peach fuzz and smooths texture for makeup perfection." image="/images/treatments/dermaplane.jpg" href="/book/facials/" />
            <ServiceCard title="SkinPen\u00AE Microneedling" copy="Great for acne scars and texture\u2014plan 4+ weeks ahead." image="/images/treatments/skinpen.jpg" href="/book/microneedling/" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section
        style={{
          maxWidth: '64rem',
          margin: '0 auto',
          padding: '4rem 1rem',
        }}
        className="sm:px-6 lg:px-8"
      >
        <h3
          style={{
            fontFamily: fonts.display,
            fontSize: typeScale.sectionHeading.size,
            fontWeight: typeScale.sectionHeading.weight,
            lineHeight: typeScale.sectionHeading.lineHeight,
            color: colors.heading,
            textAlign: 'center',
          }}
        >
          Prom &amp; Formal FAQs
        </h3>
        <div
          style={{
            marginTop: '2rem',
            border: `1px solid ${colors.stone}`,
            borderRadius: '1.5rem',
            backgroundColor: '#fff',
            overflow: 'hidden',
          }}
        >
          <FaqItem q="How far out should I plan prom facials?" a="We recommend starting 4\u20136 weeks out for best results. HydraFacial or Glo2 can be done closer to the date." />
          <FaqItem q="Can you help with acne before prom?" a="Yes\u2014our providers can create a treatment plan with facials, products, and light treatments to calm breakouts." />
          <FaqItem q="What\u2019s safe the week of prom?" a="Stick with gentle facials, dermaplane, hydration boosts. Avoid anything with downtime or peeling skin." />
        </div>
      </section>
    </BetaLayout>
  )
}

PromsFormalsPage.getLayout = (page) => page

// --- Components ---
function TimingCard({ when, items }) {
  return (
    <div
      style={{
        borderRadius: '1.5rem',
        border: `1px solid ${colors.stone}`,
        backgroundColor: '#fff',
        padding: '1.5rem',
      }}
    >
      <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>
        {when}
      </h3>
      <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem', listStyleType: 'disc', color: colors.body, fontFamily: fonts.body }} className="space-y-1">
        {items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </div>
  )
}

function ServiceCard({ title, copy, image, href }) {
  return (
    <div
      style={{
        borderRadius: '1.5rem',
        border: `1px solid ${colors.stone}`,
        backgroundColor: '#fff',
        overflow: 'hidden',
      }}
    >
      <img src={image} alt={title} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
      <div style={{ padding: '1.5rem' }}>
        <h4 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>
          {title}
        </h4>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: colors.body, fontFamily: fonts.body }}>
          {copy}
        </p>
        <Link
          href={href}
          style={{
            display: 'inline-block',
            marginTop: '0.75rem',
            fontFamily: fonts.body,
            fontWeight: 600,
            color: colors.violet,
            textDecoration: 'none',
          }}
        >
          Book Now &rarr;
        </Link>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details
      style={{ borderBottom: `1px solid ${colors.stone}` }}
    >
      <summary
        style={{
          cursor: 'pointer',
          padding: '1rem 1.5rem',
          fontFamily: fonts.body,
          fontWeight: 600,
          color: colors.heading,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {q}
        <span style={{ color: colors.muted }}>+</span>
      </summary>
      <div style={{ padding: '0 1.5rem 1rem', fontFamily: fonts.body, color: colors.body }}>
        {a}
      </div>
    </details>
  )
}
