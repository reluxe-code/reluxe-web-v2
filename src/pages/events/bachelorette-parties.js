import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import EventInquiryForm from '@/components/events/EventInquiryForm'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function BachelorettePartiesPage() {
  return (
    <BetaLayout
      title="Bachelorette Parties | Carmel & Westfield"
      description="RELUXE hosts bachelorette party spa packages in Carmel & Westfield. Group facials, tox parties, glow sessions, and private events."
      canonical="https://reluxemedspa.com/events/bachelorette-parties"
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
              Bachelorette
            </span>{' '}
            Party Packages
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
            Celebrate in style with private spa experiences. Perfect for bridesmaids, friends, and unforgettable nights.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
            <a
              href="#options"
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
              See Options
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
            Plan Your Bachelorette Party
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
            <EventInquiryForm defaultEventType="Bachelorette Party" />
          </div>
        </div>
      </section>

      {/* Options */}
      <section
        id="options"
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
          Party Options
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard title="Group Facials" copy="Signature facials, Glo2, or HydraFacials for the whole group." image="/images/treatments/hydrafacial.jpg" href="/book/facials/" />
          <ServiceCard title="Tox Parties" copy="Botox\u00AE, Jeuveau\u00AE, Dysport\u00AE mini sessions in a fun, private setting." image="/images/treatments/tox.jpg" href="/book/tox/" />
          <ServiceCard title="Massage Add-ons" copy="Relax before the big night with group massage packages." image="/images/treatments/massage.jpg" href="/book/massage/" />
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
          Bachelorette Party FAQs
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
          <FaqItem q="Can you host private parties?" a="Yes\u2014we host private events at both Carmel and Westfield with customized services." />
          <FaqItem q="Do you offer group discounts?" a="Yes, group bundles and packages are available for parties." />
          <FaqItem q="What\u2019s the most popular option?" a="Glow facials + tox mini-sessions are our most requested party combo." />
        </div>
      </section>
    </BetaLayout>
  )
}

BachelorettePartiesPage.getLayout = (page) => page

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
