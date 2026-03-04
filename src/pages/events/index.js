// pages/events/index.js
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import EventInquiryForm from '@/components/events/EventInquiryForm'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function EventsHubPage() {
  const cards = [
    { name: 'Wedding Prep', href: '/wedding', desc: 'Carmel & Westfield wedding skincare timelines, injectables, lasers, and packages for brides, grooms, and parties.', image: '/images/events/wedding.jpg', cta: 'Plan Wedding Glow' },
    { name: 'Proms & Formals', href: '/events/proms-formals', desc: 'Prom, homecoming, and formals. Gentle facials, dermaplane, hydration, and acne management for photo-ready skin.', image: '/images/events/prom.jpg', cta: 'Prep for Prom' },
    { name: 'Red Carpet & Galas', href: '/events/red-carpet-galas', desc: 'Black-tie, galas, and red-carpet nights. Smooth, glow, and refine with no-downtime treatments.', image: '/images/events/gala.jpg', cta: 'Own the Spotlight' },
    { name: 'Local Indy Events', href: '/events/local-indy-events', desc: "Zoobilation, Rev, and Indy's biggest events. Glow plans that account for summer heat and long nights.", image: '/images/events/redcarpet.jpg', cta: "Plan for Indy's Big Nights" },
    { name: 'Bachelorette Parties', href: '/events/bachelorette-parties', desc: 'Private group facials, tox parties, and pre-night-out glow packages for bridesmaids and friends.', image: '/images/events/bachelorette.jpg', cta: 'Book a Party' },
    { name: 'Graduation Prep', href: '/events/graduation-prep', desc: 'High school & college grads: acne management, facials, and subtle glow for photos and ceremonies.', image: '/images/events/graduation.jpg', cta: 'Get Graduation Ready' },
    { name: 'Photoshoot Prep', href: '/events/photoshoot-prep', desc: 'Headshots, engagement photos, branding shoots. Camera-friendly facials and injectables timed perfectly.', image: '/images/events/photoshoot.jpg', cta: 'Prep for Photos' },
    { name: 'Holiday & NYE Prep', href: '/events/holiday-prep', desc: "Office parties, family photos, and New Year's Eve celebrations. Stress-free skin plans to keep you glowing.", image: '/images/events/holiday.jpg', cta: 'Plan Holiday Glow' },
    { name: 'Pageant & Performance', href: '/events/pageant-performance', desc: 'Dance, cheer, theater, bodybuilding. Tailored glow + tone plans for stage confidence.', image: '/images/events/pag.jpg', cta: 'Prep for Stage' },
    { name: 'Corporate & Speaking', href: '/events/corporate-prep', desc: 'Conference-ready skin: injectables, facials, and stress resets to look sharp under bright lights.', image: '/images/events/corporate.jpg', cta: 'Prep for Corporate' },
    { name: 'Fitness & Competition Prep', href: '/events/fitness-prep', desc: 'EvolveX body contouring, laser hair, and skin tightening to highlight physique & confidence.', image: '/images/events/fitness.jpg', cta: 'Prep for Fitness' },
  ]

  return (
    <BetaLayout
      title="Events & Special Occasion Prep"
      description="Discover RELUXE event prep: weddings, prom, red carpet, Zoobilation, Rev, holidays, graduations, photoshoots, pageants, corporate events, and fitness competitions."
      canonical="https://reluxemedspa.com/events"
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
                RELUXE &middot; Events
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.75rem' }}>
                Event &amp; Special{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Occasion Prep.
                </span>
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginTop: '1.5rem' }}>
                Look your best for Carmel &amp; Westfield&apos;s most memorable events &mdash; weddings, prom, galas, holidays, graduations, and more.
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Weddings', 'Prom', 'Galas', 'Holidays', 'Graduations', 'Photoshoots'].map(tag => (
                  <span key={tag} style={{
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontFamily: fonts.body,
                    backgroundColor: 'rgba(250,248,245,0.05)', border: '1px solid rgba(250,248,245,0.08)', color: 'rgba(250,248,245,0.4)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
                Serving <strong style={{ color: 'rgba(250,248,245,0.6)' }}>Carmel</strong>, <strong style={{ color: 'rgba(250,248,245,0.6)' }}>Westfield</strong>, Zionsville, and North Indianapolis.
              </p>
            </div>

            <div className="lg:col-span-5">
              <EventInquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.name}
              href={card.href}
              className="group"
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                overflow: 'hidden', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`,
                backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.3s',
              }}
              className="hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]"
              >
                <div style={{ aspectRatio: '4/3', width: '100%', overflow: 'hidden' }}>
                  <img src={card.image} alt={card.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{card.name}</h2>
                  <p style={{ marginTop: '0.5rem', color: colors.body, fontFamily: fonts.body }}>{card.desc}</p>
                  <div style={{
                    marginTop: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '9999px', padding: '0.5rem 1rem',
                    fontSize: '0.875rem', fontWeight: 600, fontFamily: fonts.body,
                    color: '#fff', background: gradients.primary,
                  }}>
                    {card.cta}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </BetaLayout>
  )
}

EventsHubPage.getLayout = (page) => page
