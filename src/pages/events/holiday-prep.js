import Link from 'next/link'
import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import EventInquiryForm from '@/components/events/EventInquiryForm'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function HolidayPrepPage() {
  return (
    <BetaLayout
      title="Holiday Party & NYE Glow | Carmel & Westfield"
      description="Holiday party & NYE prep in Carmel & Westfield. Tox/filler timing, HydraFacial, dermaplane, peels, body contouring, and stress-relief massage for camera-ready glow."
      canonical="https://reluxemedspa.com/events/holiday-prep"
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
                RELUXE &middot; Holiday &amp; NYE
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.75rem' }}>
                Holiday Party &amp; NYE{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Glow.
                </span>
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginTop: '1.5rem' }}>
                Office parties, family photos, New Year&apos;s Eve &mdash; get a radiant, makeup-ready finish with treatments timed
                to avoid downtime. We&apos;ll map the perfect plan to your calendar.
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
                {['Photo-friendly glow', 'Downtime-aware', 'Makeup-ready finish'].map(tag => (
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
                <img src="/images/treatments/holiday.jpg" alt="Holiday & NYE glow Carmel Westfield" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
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
            Interested in Holiday Prep?
          </h2>
          <p style={{ marginTop: '0.75rem', color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>Tell us about your event and we&apos;ll create a custom plan.</p>
          <div style={{ marginTop: '2rem' }}>
            <EventInquiryForm defaultEventType="Holiday / NYE" />
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Stress-Free Holiday Timing
          </h2>
          <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>
            We&apos;ll personalize recommendations to your event schedule. Here&apos;s a proven framework that keeps skin calm and luminous.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: '2.5rem' }}>
          <TimingCard
            when="4-6 Weeks Out"
            items={[
              'Plan neurotoxins (Botox, Dysport, Jeuveau, Daxxify) to settle naturally',
              'Consider filler balance (lips/cheeks/chin/jawline) ahead of photo season',
              'Begin/continue series: SkinPen or laser if runway allows',
            ]}
          />
          <TimingCard
            when="2-3 Weeks Out"
            items={[
              'HydraFacial or Glo2Facial for clarity & hydration',
              'Light peel (case-by-case) for bright tone',
              'EvolveX body contouring session (tone/tighten)',
            ]}
          />
          <TimingCard
            when="3-5 Days Out"
            items={[
              'Dermaplane + Signature facial for a smooth, makeup-ready canvas',
              'Hydrinity hydration boost for lit-from-within glow',
              'LED light therapy for calm, even skin',
            ]}
          />
          <TimingCard
            when="Day Of / Night Of"
            items={[
              'Keep skincare simple -- cleanse, moisturize, SPF (day) / balm (night)',
              'Avoid new actives or harsh exfoliation',
              'Pack touch-ups: mineral SPF, blot papers, lip balm',
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
              High-Impact Holiday Services
            </h2>
            <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>Glowy skin, smooth texture, and stress-relief -- all timed to your events.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: '2.5rem' }}>
            <ServiceCard
              title="HydraFacial / Glo2Facial"
              subtitle="No-downtime glow"
              copy="Fast clarity and hydration that makeup loves -- ideal 1-2 weeks before your party."
              image="/images/treatments/facials.jpg"
              href="/book/facials/"
            />
            <ServiceCard
              title="Injectables"
              subtitle="Botox - Dysport - Daxxify - Jeuveau"
              copy="Refine lines while keeping expressions natural -- plan 3-4+ weeks out."
              image="/images/treatments/injectables.jpg"
              href="/book/tox/"
            />
            <ServiceCard
              title="Dermaplane + Light Peel"
              subtitle="Makeup-ready finish"
              copy="Sweep away dullness and peach fuzz for a smooth, even canvas -- time ~3-5 days out."
              image="/images/treatments/dermaplane.jpg"
              href="/book/facials/"
            />
            <ServiceCard
              title="SkinPen Microneedling"
              subtitle="Texture & pores"
              copy="If you've got runway, refine texture and scars -- consider a series 4-6+ weeks before."
              image="/images/treatments/skinpen.jpg"
              href="/book/microneedling/"
            />
            <ServiceCard
              title="Laser & RF"
              subtitle="Opus - ClearLift - IPL"
              copy="Tone, tighten, and refine with appropriate healing windows around events."
              image="/images/treatments/laser.jpg"
              href="/book/laser/"
            />
            <ServiceCard
              title="Massage Therapy"
              subtitle="Stress relief"
              copy="Loosen tightness and reset your nervous system so you glow from the inside out."
              image="/images/treatments/massage.jpg"
              href="/book/massage/"
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
          Holiday &amp; NYE FAQs
        </h4>
        <div style={{ marginTop: '2rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', overflow: 'hidden' }}>
          <FaqItem
            q="How soon before a holiday party should I book injectables?"
            a="Plan neurotoxins ~3-4 weeks before so results are settled and natural. Filler timing depends on the area -- book a consult early for a smart schedule."
          />
          <FaqItem
            q="What's safe last-minute?"
            a="Dermaplane + signature facial + hydration boost is our go-to within 3-5 days. Avoid aggressive peels or new active skincare."
          />
          <FaqItem
            q="Do you offer gift cards or group options?"
            a="Yes -- digital gift cards and small-group glow sessions are popular for teams, families, and friends."
          />
          <FaqItem
            q="I'm prone to redness -- how do we avoid irritation?"
            a="We'll tailor gentle, non-sensitizing treatments and recommend redness-calming skincare with a simple week-of routine."
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
                Ready for Holiday Photos &amp; NYE?
              </h5>
              <p style={{ marginTop: '0.75rem', color: 'rgba(250,248,245,0.5)', fontFamily: fonts.body, maxWidth: '42rem', margin: '0.75rem auto 0' }}>
                Carmel &amp; Westfield&apos;s trusted med spa for festive, photo-ready glow with smart, stress-free timing.
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

HolidayPrepPage.getLayout = (page) => page
