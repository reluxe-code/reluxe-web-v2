import Link from 'next/link'
import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import EventInquiryForm from '@/components/events/EventInquiryForm'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function LocalIndyEventsPage() {
  return (
    <BetaLayout
      title="Zoobilation, Rev & Indy Event Prep | Carmel & Westfield"
      description="Indy's biggest nights deserve perfect prep. RELUXE helps Carmel & Westfield clients get camera-ready for Zoobilation, Rev, and other high-profile events."
      canonical="https://reluxemedspa.com/events/local-indy-events"
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.25), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
          <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
            RELUXE &middot; Local Events
          </p>
          <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.75rem' }}>
            Zoobilation, Rev &amp;{' '}
            <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Indy Event Prep.
            </span>
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginTop: '1.5rem' }}>
            Indy&apos;s premier events deserve a glow plan. We account for long hours, summer heat, and plenty of photos.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
            <a href="#timing" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', padding: '0.75rem 1.5rem', fontWeight: 600, fontFamily: fonts.body, color: 'rgba(250,248,245,0.9)', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', textDecoration: 'none' }}>
              See Timing Guide
            </a>
          </div>
        </div>
      </section>

      {/* Event Inquiry */}
      <section style={{ background: `linear-gradient(to bottom, ${colors.ink}, ${colors.charcoal})`, padding: '4rem 0' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center', color: colors.white }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight }}>
            Interested in Indy Event Prep?
          </h2>
          <p style={{ marginTop: '0.75rem', color: colors.muted, fontFamily: fonts.body }}>
            Tell us about your event and we&apos;ll create a custom plan.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <EventInquiryForm defaultEventType="Local Indy Event" />
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, textAlign: 'center' }}>
          Event Timing Guide
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: '2.5rem' }}>
          <TimingCard when="4-6 Weeks" items={['Tox session timed for event', 'Laser hair removal touch-ups', 'Microneedling for texture']} />
          <TimingCard when="2-3 Weeks" items={['HydraFacial / Glo2Facial', 'Body contour (EvolveX)', 'Gentle peel']} />
          <TimingCard when="5-7 Days" items={['Signature glow facial', 'Dermaplane', 'SPF-focused prep']} />
          <TimingCard when="Day Of" items={['Hydrate & rest', 'SPF + mineral touch-up', 'No new products']} />
        </div>
      </section>

      {/* Services */}
      <section style={{ backgroundColor: colors.cream, padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, textAlign: 'center' }}>
            Popular Indy Event Services
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: '2.5rem' }}>
            <ServiceCard title="Glow Facials" copy="HydraFacial + Glo2Facial to fight humidity and long nights." image="/images/treatments/glo2facial.jpg" href="/book/glo2facial/" />
            <ServiceCard title="Injectables" copy="Botox, Jeuveau, Dysport, Daxxify to refine expressions." image="/images/treatments/tox.jpg" href="/book/tox/" />
            <ServiceCard title="Body Contouring" copy="EvolveX tones & tightens for form-fitting outfits." image="/images/treatments/evolvex.jpg" href="/book/body/" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ maxWidth: '64rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h3 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, textAlign: 'center' }}>
          Indy Event FAQs
        </h3>
        <div style={{ marginTop: '1.5rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', overflow: 'hidden' }}>
          <FaqItem q="How do you prep for hot outdoor events?" a="We focus on hydration, SPF, and non-irritating treatments that hold up under heat and humidity." />
          <FaqItem q="What's the go-to facial before Zoobilation?" a="HydraFacial or Glo2Facial within 1 week is our top pick for radiant, no-downtime results." />
          <FaqItem q="Can groups book together for Rev?" a="Yes — ask us about group facial or tox sessions for friends attending big Indy events together." />
        </div>
      </section>
    </BetaLayout>
  )
}

LocalIndyEventsPage.getLayout = (page) => page

// --- Components ---
function TimingCard({ when, items }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontFamily: fonts.display, fontWeight: 700, color: colors.heading }}>{when}</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', marginTop: '0.5rem', fontSize: '0.875rem', color: colors.body, fontFamily: fonts.body, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </div>
  )
}

function ServiceCard({ title, copy, image, href }) {
  return (
    <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <img src={image} alt={title} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
      <div style={{ padding: '1.5rem' }}>
        <h4 style={{ fontFamily: fonts.display, fontWeight: 700, color: colors.heading }}>{title}</h4>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: colors.body, fontFamily: fonts.body }}>{copy}</p>
        <Link href={href} style={{ color: colors.violet, fontWeight: 600, fontFamily: fonts.body, textDecoration: 'none', marginTop: '0.75rem', display: 'inline-block' }}>Book Now &rarr;</Link>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} style={{ borderBottom: `1px solid ${colors.stone}` }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1rem 1.5rem', fontWeight: 600, fontFamily: fonts.body, color: colors.heading, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{q}</span>
        <svg style={{ height: '1.25rem', width: '1.25rem', color: colors.muted, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : '' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', color: colors.body, fontFamily: fonts.body }}>{a}</div>
    </details>
  )
}
