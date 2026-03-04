import Link from 'next/link'
import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import EventInquiryForm from '@/components/events/EventInquiryForm'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function PageantPerformancePage() {
  return (
    <BetaLayout
      title="Pageant & Performance Prep | Carmel & Westfield"
      description="Stage-ready glow for pageants, dance, cheer, theater, and bodybuilding in Carmel & Westfield. Smart timing for injectables, facials, lasers, and body treatments."
      canonical="https://reluxemedspa.com/events/pageant-performance"
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
                RELUXE &middot; Pageant &amp; Performance
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.75rem' }}>
                Stage-Ready Skin &amp;{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Confidence.
                </span>
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginTop: '1.5rem' }}>
                From pageant stage to theater lights and competition day, we&apos;ll build a plan for a smooth, vibrant, camera- and stage-ready look &mdash; without derailing training or rehearsals.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a
                  href="#timing"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '9999px', padding: '0.75rem 1.5rem',
                    fontWeight: 600, fontFamily: fonts.body,
                    color: 'rgba(250,248,245,0.9)', border: '1px solid rgba(250,248,245,0.15)',
                    textDecoration: 'none', fontSize: '0.9375rem',
                  }}
                >
                  Timing Guide
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div style={{ position: 'relative', aspectRatio: '4/5', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(250,248,245,0.1)' }}>
                <img src="/images/treatments/pageant.jpg" alt="Pageant & performance prep Carmel Westfield" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.7)', fontFamily: fonts.body }}>Images represent service categories available at RELUXE.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Local SEO */}
          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
            Serving <strong style={{ color: 'rgba(250,248,245,0.6)' }}>Carmel</strong>, <strong style={{ color: 'rgba(250,248,245,0.6)' }}>Westfield</strong>, Zionsville, and North Indianapolis.
          </p>
        </div>
      </section>

      {/* Event Inquiry */}
      <section style={{ background: `linear-gradient(to bottom, ${colors.ink}, #111)`, padding: '4rem 0' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center', color: colors.white }}>
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.white }}>
            Interested in Stage Prep?
          </h2>
          <p style={{ marginTop: '0.75rem', color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>Tell us about your event and we&apos;ll create a custom plan.</p>
          <div style={{ marginTop: '2rem' }}>
            <EventInquiryForm defaultEventType="Pageant / Performance" />
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Stage-Ready Timing Guide
          </h2>
          <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>
            Planned around rehearsal, practice, and show day &mdash; no surprises, just polish.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: '2.5rem' }}>
          <TimingCard
            when="6-8 Weeks Out"
            items={[
              'Neurotoxins to refine expressions (Botox, Dysport, Jeuveau, Daxxify)',
              'Filler (if needed) for symmetry and balance',
              'Start SkinPen or laser series (if runway allows)',
            ]}
          />
          <TimingCard
            when="3-4 Weeks Out"
            items={[
              'HydraFacial / Glo2Facial for clarity & hydration',
              'EvolveX body contouring session for tone',
              'Refine product routine (no big changes later)',
            ]}
          />
          <TimingCard
            when="7-10 Days Out"
            items={[
              'Dermaplane + light peel (camera-friendly)',
              'LED light therapy for calm, even skin',
              'Hydrinity hydration boost for lit-from-within look',
            ]}
          />
          <TimingCard
            when="48-72 Hours Out"
            items={[
              'Keep skincare simple; avoid sensitizers',
              'Hydration, rest, and a calm routine',
              'Pack stage kit: blot papers, mineral powder, balm',
            ]}
          />
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ backgroundColor: colors.cream, padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
              Performance-Perfect Services
            </h2>
            <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>Photogenic, stage-smart, and scheduled around your program.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: '2.5rem' }}>
            <ServiceCard title="Injectables" subtitle="Neurotoxins" copy="Refine lines and keep expressions natural under bright lights." image="/images/treatments/injectables.jpg" href="/book/tox/" />
            <ServiceCard title="HydraFacial / Glo2Facial" subtitle="Radiant clarity" copy="Reliable, no-downtime glow that reads beautifully on camera." image="/images/treatments/facials.jpg" href="/book/facials/" />
            <ServiceCard title="Dermaplane + Light Peel" subtitle="Makeup grip" copy="Smoother canvas for stage makeup and close-up photos." image="/images/treatments/dermaplane.jpg" href="/book/facials/" />
            <ServiceCard title="SkinPen Microneedling" subtitle="Texture & pores" copy="For longer timelines -- build collagen for refined texture." image="/images/treatments/skinpen.jpg" href="/book/microneedling/" />
            <ServiceCard title="Laser & RF" subtitle="Opus - ClearLift - IPL" copy="Even tone and light resurfacing -- timed to your program." image="/images/treatments/laser.jpg" href="/book/laser/" />
            <ServiceCard title="EvolveX Body Contouring" subtitle="Tone & tighten" copy="Target midsection or limbs to complement stagewear." image="/images/treatments/body.jpg" href="/book/body/" />
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" style={{ maxWidth: '64rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h4 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading, textAlign: 'center' }}>
          Pageant &amp; Performance FAQs
        </h4>
        <div style={{ marginTop: '2rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', overflow: 'hidden' }}>
          <FaqItem q="I have a show in two weeks -- what's safest?" a="Stick with no-downtime facials, dermaplane, and hydration boosts. Avoid aggressive resurfacing or new actives." />
          <FaqItem q="Can you work around rehearsals and practices?" a="Yes, we'll schedule treatments on off-days and build buffers before stage time." />
          <FaqItem q="Do you help bodybuilding competitors?" a="Absolutely -- EvolveX for tone, laser hair removal planning, and skin-finishing tips for stage day." />
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>
    </BetaLayout>
  )
}

// --- Components ---
function TimingCard({ when, items }) {
  return (
    <div style={{
      overflow: 'hidden', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`,
      backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.3s',
    }}
    className="hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]"
    >
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{when}</h3>
        <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: colors.body, fontFamily: fonts.body }}>
          {items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  )
}

function ServiceCard({ title, subtitle, copy, image, href }) {
  return (
    <div style={{
      overflow: 'hidden', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`,
      backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.3s',
    }}
    className="group hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]"
    >
      <div style={{ aspectRatio: '4/3', width: '100%', overflow: 'hidden' }}>
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h4 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
        {subtitle && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: colors.muted, fontFamily: fonts.body }}>{subtitle}</p>}
        <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>{copy}</p>
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href={href} style={{ color: colors.violet, fontWeight: 600, fontFamily: fonts.body, textDecoration: 'none' }}>Book Now &rarr;</a>
          <div style={{ height: '2rem', width: '2rem', borderRadius: '0.75rem', background: gradients.subtle, border: `1px solid rgba(124,58,237,0.15)` }} />
        </div>
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
        <svg style={{ height: '1.25rem', width: '1.25rem', color: colors.muted, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', color: colors.body, fontFamily: fonts.body }}>{a}</div>
    </details>
  )
}

PageantPerformancePage.getLayout = (page) => page
