import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import EventInquiryForm from '@/components/events/EventInquiryForm'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function GraduationPrepPage() {
  return (
    <BetaLayout
      title="Graduation Prep | Carmel & Westfield"
      description="Graduation prep facials and skincare in Carmel & Westfield. Acne solutions, dermaplane, HydraFacial\u00AE, and glow treatments for grads."
      canonical="https://reluxemedspa.com/events/graduation-prep"
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
          className="lg:py-28"
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
              Graduation
            </span>{' '}
            Prep
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
            Caps, gowns, and cameras -- look your best with RELUXE&apos;s acne-friendly, graduation-ready glow plans.
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
            Interested in Graduation Prep?
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
            <EventInquiryForm defaultEventType="Graduation" />
          </div>
        </div>
      </section>

      {/* Timing */}
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
          Graduation Glow Timeline
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard when="4--6 Weeks" items={['Consult & skin review', 'Start acne facials if needed', 'Microneedling for scars (if time allows)']} />
          <TimingCard when="2--3 Weeks" items={['HydraFacial\u00AE or Glo2Facial\u00AE', 'Dermaplane for smoother skin']} />
          <TimingCard when="1 Week" items={['Signature facial + hydration boost', 'Product guidance for home care']} />
          <TimingCard when="Day Of" items={['Keep it simple\u2014cleanse & moisturize', 'SPF for outdoor ceremonies']} />
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
            Graduation Favorites
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard title="HydraFacial\u00AE" copy="Brightens, clears, and hydrates for graduation photos." image="/images/treatments/facials.jpg" href="/book/facials/" />
            <ServiceCard title="Dermaplane" copy="Creates a flawless canvas for makeup & photos." image="/images/treatments/dermaplane.jpg" href="/book/facials/" />
            <ServiceCard title="SkinPen\u00AE" copy="For those starting early\u2014smooth acne scars & refine skin." image="/images/treatments/skinpen.jpg" href="/book/microneedling/" />
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
          Graduation FAQs
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
          <FaqItem q="Can you help with acne before graduation?" a="Yes\u2014we\u2019ll create a custom plan with facials and medical-grade skincare for clear skin." />
          <FaqItem q="What\u2019s safe if my graduation is in one week?" a="Stick with no-downtime facials like HydraFacial or dermaplane + hydration." />
          <FaqItem q="Do you prep both high school and college grads?" a="Yes\u2014plans are age-appropriate and tailored for each client." />
        </div>
      </section>
    </BetaLayout>
  )
}

GraduationPrepPage.getLayout = (page) => page

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
      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', listStyleType: 'disc', fontFamily: fonts.body, color: colors.body }}>
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
