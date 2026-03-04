import Link from 'next/link'
import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import EventInquiryForm from '@/components/events/EventInquiryForm'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function PhotoshootPrepPage() {
  return (
    <BetaLayout
      title="Photoshoot & Headshot Prep | Carmel & Westfield"
      description="Carmel & Westfield photoshoot and headshot prep. Tox/filler timing, HydraFacial, dermaplane, light peels, and camera-ready skincare for portraits, branding, and engagement photos."
      canonical="https://reluxemedspa.com/events/photoshoot-prep"
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
                RELUXE &middot; Photoshoot &amp; Headshots
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.75rem' }}>
                Photoshoot &amp; Headshot{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Prep.
                </span>
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginTop: '1.5rem' }}>
                Be camera-ready for headshots, branding sessions, content shoots, or engagement photos. We&apos;ll time
                treatments to avoid downtime and create a smooth, even, natural-looking glow.
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
                  See Timing Guide
                </a>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Photo-friendly treatments', 'Downtime-aware planning', 'Makeup-ready finish'].map(tag => (
                  <span key={tag} style={{
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontFamily: fonts.body,
                    backgroundColor: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.08)', color: 'rgba(250,248,245,0.4)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div style={{ position: 'relative', aspectRatio: '4/5', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(250,248,245,0.1)' }}>
                <img src="/images/treatments/photoshoot.jpg" alt="Carmel Westfield headshot & photoshoot prep" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
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
            Interested in Photoshoot Prep?
          </h2>
          <p style={{ marginTop: '0.75rem', color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>Tell us about your shoot and we&apos;ll create a custom plan.</p>
          <div style={{ marginTop: '2rem' }}>
            <EventInquiryForm defaultEventType="Photoshoot" />
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Camera-Ready Timing Guide
          </h2>
          <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>
            We&apos;ll tailor this to your shoot date, goals, and skin type. Here&apos;s a proven framework that avoids last-minute surprises.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: '2.5rem' }}>
          <TimingCard
            when="4-6 Weeks Out"
            items={[
              'Plan neurotoxins (Botox, Dysport, Jeuveau, Daxxify) so they settle naturally',
              'Consider filler balance (lips/cheeks/chin/jawline) if needed',
              'Start SkinPen microneedling for texture (if timeline permits)',
            ]}
          />
          <TimingCard
            when="2-3 Weeks Out"
            items={[
              'HydraFacial or Glo2Facial for clarity + hydration',
              'Light peel (case-by-case) to brighten tone',
              'Refine skincare routine -- no big product changes later',
            ]}
          />
          <TimingCard
            when="5-7 Days Out"
            items={[
              'Dermaplane for a smooth, makeup-friendly canvas',
              'Signature facial + Hydrinity hydration boost',
              'LED light therapy for calm, even skin',
            ]}
          />
          <TimingCard
            when="1-2 Days Out"
            items={[
              'Keep it gentle: cleanse, moisturize, SPF',
              'Avoid new actives and harsh exfoliation',
              'Rest, hydrate, and prep a small touch-up kit',
            ]}
          />
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" style={{ backgroundColor: colors.cream, padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
              High-Impact, Photo-Friendly Services
            </h2>
            <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>Glow, smoothness, and balance -- without downtime surprises.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: '2.5rem' }}>
            <ServiceCard
              title="Injectables"
              subtitle="Botox - Dysport - Daxxify - Jeuveau"
              copy="Refine lines and expressions for close-ups. Planned 3-4+ weeks out to settle naturally."
              image="/images/treatments/injectables.jpg"
              href="/book/tox/"
            />
            <ServiceCard
              title="Dermal Filler"
              subtitle="Lips - Cheeks - Chin - Jawline"
              copy="Subtle contour and symmetry that reads beautifully on camera. Schedule far enough ahead to perfect."
              image="/images/wedding/filler.jpg"
              href="/book/filler/"
            />
            <ServiceCard
              title="HydraFacial / Glo2Facial"
              subtitle="No-downtime glow"
              copy="Fast clarity and hydration that makeup loves -- ideal 1-2 weeks before your shoot."
              image="/images/treatments/facials.jpg"
              href="/book/facials/"
            />
            <ServiceCard
              title="Dermaplane + Light Peel"
              subtitle="Makeup-ready canvas"
              copy="Sweeps away peach fuzz and dullness for smooth, even application. Time ~5-7 days out."
              image="/images/treatments/dermaplane.jpg"
              href="/book/facials/"
            />
            <ServiceCard
              title="SkinPen Microneedling"
              subtitle="Texture & pores"
              copy="For those with more runway -- refines texture and scars. Plan 4-6+ weeks and consider a series."
              image="/images/treatments/skinpen.jpg"
              href="/book/microneedling/"
            />
            <ServiceCard
              title="Laser & RF"
              subtitle="Opus - ClearLift - IPL"
              copy="Tone and refine with appropriate healing windows. We'll advise based on date and goals."
              image="/images/treatments/laser.jpg"
              href="/book/laser/"
            />
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" style={{ maxWidth: '64rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h4 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading, textAlign: 'center' }}>
          Photoshoot Prep FAQs
        </h4>
        <div style={{ marginTop: '2rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', overflow: 'hidden' }}>
          <FaqItem
            q="When should I schedule injectables before a photoshoot?"
            a="Plan neurotoxins about 3-4 weeks out so results are smooth and natural by shoot day. Filler timing varies by area; we'll map it to your date."
          />
          <FaqItem
            q="What's safe the week of my shoot?"
            a="Stick with dermaplane, signature facial, and hydration boosts. Avoid aggressive peels, new actives, or anything with visible flaking."
          />
          <FaqItem
            q="Do you help with corporate headshots or team days?"
            a="Yes! We can coordinate timelines for teams and provide simple, camera-friendly skincare guidance for consistent results."
          />
          <FaqItem
            q="I'm acne-prone -- how do we prevent a flare right before?"
            a="We build a gentle routine early, use non-comedogenic products, and time facials to decongest without irritation."
          />
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
          <div style={{ borderRadius: '1.5rem', background: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia}, ${colors.charcoal})`, padding: '1px' }}>
            <div style={{ borderRadius: '1.5rem', backgroundColor: colors.ink, padding: '3rem 2rem', textAlign: 'center' }}>
              <h5 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.white }}>
                Ready for Your Close-Up?
              </h5>
              <p style={{ marginTop: '0.75rem', color: 'rgba(250,248,245,0.5)', fontFamily: fonts.body, maxWidth: '42rem', margin: '0.75rem auto 0' }}>
                Carmel &amp; Westfield&apos;s trusted med spa for photo-friendly glow that reads beautifully on camera.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a href="#services" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '9999px', padding: '0.75rem 1.5rem',
                  fontWeight: 600, fontFamily: fonts.body, fontSize: '0.9375rem',
                  color: colors.white, backgroundColor: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(250,248,245,0.1)', textDecoration: 'none',
                }}>
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

PhotoshootPrepPage.getLayout = (page) => page
