import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import EventInquiryForm from '@/components/events/EventInquiryForm'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function RedCarpetGalasPage() {
  return (
    <BetaLayout
      title="Red Carpet & Gala Prep | Carmel & Westfield"
      description="Carmel & Westfield gala and red carpet prep. Injectables, facials, dermaplane, and lasers timed perfectly for black-tie events."
      canonical="https://reluxemedspa.com/events/red-carpet-galas"
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
            RELUXE &bull; Events
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
            <span
              style={{
                background: gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Red Carpet
            </span>{' '}
            &amp; Gala Prep
          </h1>
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: '1.125rem',
              lineHeight: 1.7,
              color: colors.muted,
              marginTop: '1rem',
              maxWidth: '40rem',
            }}
          >
            Step into the spotlight with flawless skin and confidence. Perfect for galas, charity balls, and black-tie events.
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
            Interested in Gala Prep?
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
            <EventInquiryForm defaultEventType="Red Carpet / Gala" />
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
          Gala Timing Guide
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard when="6--8 Weeks" items={['Plan tox & filler for subtle refinement', 'Series of facials for clarity']} />
          <TimingCard when="3--4 Weeks" items={['Laser/IPL or Opus resurfacing', 'Body contour touch-ups']} />
          <TimingCard when="1--2 Weeks" items={['HydraFacial or Glo2Facial', 'Dermaplane + light peel']} />
          <TimingCard when="2--3 Days" items={['Hydration boost', 'Massage for relaxation']} />
        </div>
      </section>

      {/* Services */}
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
            Popular Gala Services
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard title="Injectables" copy="Smooth fine lines and refresh expressions with Botox\u00AE, Jeuveau\u00AE, Dysport\u00AE, Daxxify\u00AE." image="/images/treatments/tox.jpg" href="/book/tox/" />
            <ServiceCard title="Laser Refinement" copy="Opus Plasma\u00AE and ClearLift even tone & texture before your big night." image="/images/treatments/ipl.jpg" href="/book/laser/" />
            <ServiceCard title="Glow Facials" copy="HydraFacial\u00AE and Glo2Facial\u00AE deliver hydration and radiance that photographs beautifully." image="/images/treatments/glo2facial.jpg" href="/book/glo2facial/" />
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
          Gala Prep FAQs
        </h3>
        <div
          style={{
            marginTop: '1.5rem',
            border: `1px solid ${colors.stone}`,
            borderRadius: '1.5rem',
            backgroundColor: '#fff',
            overflow: 'hidden',
          }}
        >
          <FaqItem q="How far out should I do filler?" a="We recommend 6\u20138 weeks before so everything looks settled and natural." />
          <FaqItem q="What\u2019s the best week-of treatment?" a="HydraFacial or Glo2Facial + dermaplane is a no-downtime way to maximize glow." />
          <FaqItem q="Can you prep couples for a gala?" a="Yes\u2014we create joint timelines for partners attending the same event." />
        </div>
      </section>
    </BetaLayout>
  )
}

RedCarpetGalasPage.getLayout = (page) => page

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
      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', listStyleType: 'disc', fontSize: '0.875rem', color: colors.body, fontFamily: fonts.body }}>
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
    <details style={{ borderBottom: `1px solid ${colors.stone}` }}>
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
