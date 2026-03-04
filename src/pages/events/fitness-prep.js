import Link from 'next/link'
import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import EventInquiryForm from '@/components/events/EventInquiryForm'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function FitnessPrepPage() {
  return (
    <BetaLayout
      title="Fitness & Competition Prep | Carmel & Westfield"
      description="Fitness competition and photoshoot prep in Carmel & Westfield. EvolveX body contouring, laser hair removal, and skin-finish plans that showcase your hard work."
      canonical="https://reluxemedspa.com/events/fitness-prep"
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.25), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
                RELUXE &middot; Fitness &amp; Competition
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.75rem' }}>
                Showcase Your{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Hard Work.
                </span>
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginTop: '1.5rem' }}>
                Dial in muscle tone, smooth skin, and a clean finish for stage, photos, or race day. Built around your
                training blocks and peak week.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a href="#timing" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', padding: '0.75rem 1.5rem', fontWeight: 600, fontFamily: fonts.body, color: 'rgba(250,248,245,0.9)', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', textDecoration: 'none' }}>
                  Timing Guide
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div style={{ position: 'relative', aspectRatio: '4/5', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src="/images/treatments/fitness.jpg" alt="Fitness competition prep Carmel Westfield" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,245,0.6)', fontFamily: fonts.body }}>Images represent service categories available at RELUXE.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Local SEO */}
          <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: colors.muted, fontFamily: fonts.body }}>
            Serving <strong>Carmel</strong>, <strong>Westfield</strong>, Zionsville, and North Indianapolis.
          </div>
        </div>
      </section>

      {/* Event Inquiry */}
      <section style={{ background: `linear-gradient(to bottom, ${colors.ink}, ${colors.charcoal})`, padding: '4rem 0' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center', color: colors.white }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight }}>
            Interested in Fitness Prep?
          </h2>
          <p style={{ marginTop: '0.75rem', color: colors.muted, fontFamily: fonts.body }}>
            Tell us about your competition and we&apos;ll create a custom plan.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <EventInquiryForm defaultEventType="Fitness / Competition" />
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Competition Timing Guide
          </h2>
          <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>
            Integrates with your training, nutrition, and peak week — no surprises.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: '2.5rem' }}>
          <TimingCard
            when="8-12 Weeks Out"
            items={[
              'EvolveX series for tone & tightening (1-2x/week schedules)',
              'Plan laser hair removal areas (bikini, legs, arms, back)',
              'Start SkinPen or light laser for texture if needed',
            ]}
          />
          <TimingCard
            when="4-6 Weeks Out"
            items={[
              'Adjust EvolveX focus to stubborn zones',
              'HydraFacial or Glo2Facial to refine clarity',
              'Finalize product routine — no major changes later',
            ]}
          />
          <TimingCard
            when="1-2 Weeks Out"
            items={[
              'Dermaplane + gentle polish for smooth, even skin',
              'Hydrinity hydration so skin looks healthy under stage tan',
              'Massage for recovery (avoid deep work right before)',
            ]}
          />
          <TimingCard
            when="Peak Week / Final Days"
            items={[
              'Keep skincare simple — avoid actives/new products',
              'Hydration + rest; pack a simple touch-up kit',
              'Coordinate with tan/makeup guidelines for your federation',
            ]}
          />
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ backgroundColor: colors.cream, padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
              Competition-Focused Services
            </h2>
            <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>
              Show definition, smooth the surface, and feel confident in every pose.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: '2.5rem' }}>
            <ServiceCard title="EvolveX Body Contouring" subtitle="Tone & tighten" copy="Target abs, glutes, thighs, or arms with a series that complements training." image="/images/treatments/body.jpg" href="/book/body/" />
            <ServiceCard title="Laser Hair Removal" subtitle="Stage-ready finish" copy="Plan areas in advance for clean lines and low-maintenance grooming." image="/images/men/lhr.jpg" href="/book/laser-hair-removal/" />
            <ServiceCard title="HydraFacial / Glo2Facial" subtitle="Clarity under lights" copy="Reduce dullness and enhance clarity so definition reads cleanly." image="/images/treatments/facials.jpg" href="/book/facials/" />
            <ServiceCard title="Dermaplane + Polish" subtitle="Smooth canvas" copy="Even, soft texture that pairs well with tan and stage makeup." image="/images/treatments/dermaplane.jpg" href="/book/facials/" />
            <ServiceCard title="SkinPen Microneedling" subtitle="Texture & scars" copy="If you have runway, refine texture and scars before the big day." image="/images/treatments/skinpen.jpg" href="/book/microneedling/" />
            <ServiceCard title="Massage Therapy" subtitle="Recovery & reset" copy="Support mobility and decrease stress as you peak." image="/images/treatments/massage.jpg" href="/book/massage/" />
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" style={{ maxWidth: '64rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h4 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, textAlign: 'center' }}>
          Fitness Prep FAQs
        </h4>
        <div style={{ marginTop: '2rem', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', overflow: 'hidden' }}>
          <FaqItem q="How do treatments fit with my training schedule?" a="We'll coordinate around heavy training blocks and deload weeks, keeping recovery in mind." />
          <FaqItem q="When should I stop trying new products?" a="At least 2-3 weeks before your event — stick with a simple, proven routine." />
          <FaqItem q="Can I do laser hair removal close to show day?" a="We'll plan sessions well ahead; avoid last-minute treatments that could irritate skin before tan." />
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>
    </BetaLayout>
  )
}

FitnessPrepPage.getLayout = (page) => page

// --- Components ---
function TimingCard({ when, items }) {
  return (
    <div style={{ overflow: 'hidden', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
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
    <div style={{ overflow: 'hidden', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ aspectRatio: '4/3', width: '100%', overflow: 'hidden' }}>
        <img src={image} alt={title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h4 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
        {subtitle && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: colors.muted, fontFamily: fonts.body }}>{subtitle}</p>}
        <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>{copy}</p>
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={href} style={{ color: colors.violet, fontWeight: 600, fontFamily: fonts.body, textDecoration: 'none' }}>Book Now &rarr;</Link>
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
        <svg style={{ height: '1.25rem', width: '1.25rem', color: colors.muted, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : '' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', color: colors.body, fontFamily: fonts.body }}>{a}</div>
    </details>
  )
}
