import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function SpaFinderPage() {
  return (
    <BetaLayout
      title="SpaFinder Gift Cards Accepted"
      description="RELUXE Med Spa proudly accepts SpaFinder gift cards in Carmel and Westfield. Use SpaFinder for facials, injectables, massage, and more."
      canonical="https://reluxemedspa.com/spafinder"
    >
      {/* Hero */}
      <section
        className="relative py-20 lg:py-28 px-4"
        style={{
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.15), transparent 60%)`,
          color: colors.white,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.hero.size,
              fontWeight: typeScale.hero.weight,
              lineHeight: typeScale.hero.lineHeight,
            }}
          >
            <span
              style={{
                background: gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SpaFinder
            </span>{' '}
            Gift Cards
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', color: 'rgba(250,248,245,0.7)', marginTop: '1rem' }}>
            Yes&mdash;we proudly accept SpaFinder gift cards at RELUXE Med Spa in Carmel and Westfield.
            Treat yourself or someone special to any of our services with ease.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <img
              src="/images/spafinder-card.jpg"
              alt="SpaFinder gift card accepted at RELUXE Med Spa"
              className="rounded-3xl w-full object-cover shadow-sm"
              style={{ border: `1px solid ${colors.stone}` }}
            />
          </div>
          <div className="lg:col-span-6">
            <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
              How It Works
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.75rem' }}>
              Simply bring your SpaFinder gift card to your appointment and we&apos;ll apply it toward your total.
              You can use SpaFinder for <strong>any RELUXE service</strong>&mdash;from injectables and facials to massage and advanced laser treatments.
            </p>

            <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, marginTop: '1.5rem' }}>
              Why SpaFinder?
            </h3>
            <ul className="mt-3 space-y-2 list-disc pl-5" style={{ fontFamily: fonts.body, color: colors.body }}>
              <li>One card, endless options&mdash;perfect for gifting self-care</li>
              <li>Accepted at RELUXE Carmel &amp; Westfield locations</li>
              <li>Use for memberships, packages, or single treatments</li>
              <li>No extra fees&mdash;apply the full value directly to your visit</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            Ready to Book with SpaFinder?
          </h2>
          <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.75rem' }}>
            Whether it&apos;s a gift or your own treat, RELUXE makes it easy to redeem SpaFinder for the services you love.
          </p>
          <div className="mt-8 flex justify-center">
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

SpaFinderPage.getLayout = (page) => page
