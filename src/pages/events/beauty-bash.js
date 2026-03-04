// pages/events/beauty-bash.js
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import EventInquiryForm from '@/components/events/EventInquiryForm'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

// ---- Galleries you can extend easily ---------------------------------------
const GALLERY_2025 = [
  { src: '/images/events/beauty-bash/2025/1.jpg', alt: 'Beauty Bash 2025 main stage', caption: 'Main stage demos - Carmel & Westfield community' },
  { src: '/images/events/beauty-bash/2025/2.jpg', alt: 'Live skincare demos', caption: 'Live skincare + device demos with our providers' },
  { src: '/images/events/beauty-bash/2025/3.jpg', alt: 'Guest stations and sampling', caption: 'Guest stations, sampling, and prizes' },
  { src: '/images/events/beauty-bash/2025/4.jpg', alt: 'Before-and-after wall', caption: 'Before & After inspiration wall' },
  { src: '/images/events/beauty-bash/2025/5.jpg', alt: 'Partner brands table', caption: 'Partner brands on-site (skincare & wellness)' },
  { src: '/images/events/beauty-bash/2025/6.jpg', alt: 'Photo moment', caption: 'Photo moment — bring a friend!' },
]

const GALLERY_2024 = [
  { src: '/images/events/beauty-bash/2024/1.jpg', alt: 'Beauty Bash 2024 crowd', caption: 'Standing-room crowd for skincare Q&A' },
  { src: '/images/events/beauty-bash/2024/2.jpg', alt: 'Hands-on experiences', caption: 'Hands-on experiences and product pairings' },
  { src: '/images/events/beauty-bash/2024/3.jpg', alt: 'Giveaway winners', caption: 'Giveaway winners throughout the night' },
  { src: '/images/events/beauty-bash/2024/4.jpg', alt: 'Partner demos', caption: 'Partner demos from top brands' },
  { src: '/images/events/beauty-bash/2024/5.jpg', alt: 'Treat stations', caption: 'Treat stations + exclusive event bundles' },
  { src: '/images/events/beauty-bash/2024/6.jpg', alt: 'Community vibes', caption: 'Great vibes, better glow' },
]

// Simple JSON-LD for an event series page (no specific dates fabricated)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Beauty Bash | RELUXE Med Spa (Carmel & Westfield)',
  url: 'https://reluxemedspa.com/events/beauty-bash',
  description:
    'RELUXE Beauty Bash: our signature event with live demos, giveaways, and one-night-only bundles in Carmel & Westfield, IN.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beauty Bash 2025' },
      { '@type': 'ListItem', position: 2, name: 'Beauty Bash 2024' },
    ],
  },
}

export default function BeautyBashPage() {
  return (
    <BetaLayout
      title="Beauty Bash | Carmel & Westfield, IN"
      description="RELUXE Beauty Bash: live demos, giveaways, bundles, and community. Explore 2024 & 2025 galleries and get updates for the next event."
      canonical="https://reluxemedspa.com/events/beauty-bash"
      ogImage="https://reluxemedspa.com/images/og/new-default-1200x630.png"
      structuredData={jsonLd}
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem 5rem' }}>
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
                RELUXE &middot; Events
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.5rem' }}>
                RELUXE{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Beauty Bash.
                </span>
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '36rem', marginTop: '1.5rem' }}>
                Our signature celebration of beauty, skincare, and community — featuring live demos, giveaways, and one-night-only bundles. Hosted in Carmel &amp; Westfield, IN.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <a href="/join-texts" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', padding: '0.75rem 1.5rem', fontWeight: 600, fontFamily: fonts.body, color: 'rgba(250,248,245,0.9)', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', textDecoration: 'none' }}>
                  Get Event Updates
                </a>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div style={{ position: 'relative', aspectRatio: '4/5', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src="/images/events/beauty-bash/hero.jpg" alt="Beauty Bash at RELUXE" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Inquiry */}
      <section style={{ background: `linear-gradient(to bottom, ${colors.ink}, ${colors.charcoal})`, padding: '4rem 0' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center', color: colors.white }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight }}>
            Interested in Hosting an Event?
          </h2>
          <p style={{ marginTop: '0.75rem', color: colors.muted, fontFamily: fonts.body }}>
            Tell us about your event and we&apos;ll help you plan something amazing.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <EventInquiryForm defaultEventType="Other" />
          </div>
        </div>
      </section>

      {/* About */}
      <section style={{ maxWidth: '72rem', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
              What is the Beauty Bash?
            </h2>
            <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body, lineHeight: 1.625 }}>
              A high-energy evening where we open the doors for demos, pro skincare coaching, and event-only savings. Meet our team, explore treatment pairings, and preview what&apos;s next at RELUXE.
            </p>
            <ul style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: colors.body, fontFamily: fonts.body }}>
              <li>&bull; Live treatment &amp; skincare demos</li>
              <li>&bull; Exclusive bundles &amp; giveaways</li>
              <li>&bull; Partner brand pop-ups</li>
              <li>&bull; Photo ops &amp; community vibes</li>
            </ul>
          </div>
          <div className="lg:col-span-5">
            <div style={{ borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>
                Be First to Know
              </h3>
              <p style={{ marginTop: '0.5rem', color: colors.body, fontFamily: fonts.body }}>
                We release tickets, bundles, and schedules to our text list first.
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <a href="/join-texts" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', padding: '0.625rem 1.25rem', fontWeight: 600, fontFamily: fonts.body, color: colors.white, background: colors.ink, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Join Text List
                </a>
                <a href="/events" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', padding: '0.625rem 1.25rem', fontWeight: 600, fontFamily: fonts.body, border: `1px solid ${colors.stone}`, color: colors.heading, textDecoration: 'none', fontSize: '0.875rem', background: 'transparent' }}>
                  See All Events
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2025 Gallery */}
      <YearGallery year="2025" items={GALLERY_2025} subtitle="Highlights from our most recent Beauty Bash" />

      {/* 2024 Gallery */}
      <YearGallery year="2024" items={GALLERY_2024} subtitle="Moments from last year's event" />

      {/* CTA */}
      <section style={{ backgroundColor: colors.cream, padding: '3.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            See You at the Next Beauty Bash
          </h3>
          <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>
            Grab a friend and come glow with us — tickets and details drop to our text list first.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <a href="/join-texts" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', padding: '0.75rem 1.5rem', fontWeight: 600, fontFamily: fonts.body, color: colors.white, background: gradients.primary, textDecoration: 'none' }}>
              Get Event Updates
            </a>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

BeautyBashPage.getLayout = (page) => page

// --- Components ---
function YearGallery({ year, items = [], subtitle }) {
  return (
    <section id={year} style={{ maxWidth: '80rem', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
          Beauty Bash {year}
        </h2>
        {subtitle && <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>{subtitle}</p>}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: '2.5rem' }}>
        {items.map((img, i) => (
          <figure key={i} style={{ overflow: 'hidden', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
              <img src={img.src} alt={img.alt} style={{ height: '100%', width: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
            </div>
            <figcaption style={{ padding: '1rem', fontSize: '0.875rem', color: colors.body, fontFamily: fonts.body }}>{img.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
