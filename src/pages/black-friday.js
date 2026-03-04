// pages/black-friday.js
// Archived Black Friday / Cyber Monday page
// Shows a friendly message and directs guests to current monthly deals.

import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function BlackFridayArchivePage() {
  return (
    <BetaLayout
      title="Black Friday & Cyber Monday"
      description="Our Black Friday & Cyber Monday event has ended. See the latest monthly deals and specials at RELUXE Med Spa."
      canonical="https://reluxemedspa.com/black-friday"
      noindex
    >
      <main>
        {/* HERO */}
        <section
          className="relative overflow-hidden"
          style={{
            backgroundColor: colors.ink,
            backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.2), transparent 60%)`,
          }}
        >
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <p style={{ fontFamily: fonts.body, ...typeScale.label, color: 'rgba(250,248,245,0.6)' }}>
              RELUXE &bull; Black Friday &amp; Cyber Monday
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
              Our Black Friday &amp; Cyber Monday{' '}
              <span
                style={{
                  background: gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Sale is Over
              </span>
            </h1>

            <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', color: 'rgba(250,248,245,0.8)', maxWidth: '42rem', marginTop: '1rem' }}>
              Thank you for an incredible Black Friday &amp; Cyber Week!{' '}
              <span style={{ fontWeight: 600 }}>
                The 2025 sale is now closed, and deals on this page are no longer active.
              </span>{' '}
              But the savings don&apos;t stop&mdash;check out our latest monthly specials, flash offers, and
              member perks anytime.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://reluxemedspa.com/deals/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9999px',
                  padding: '0.75rem 1.25rem',
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: '#fff',
                  background: gradients.primary,
                }}
              >
                View Current Monthly Deals &rarr;
              </a>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>

            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)', maxWidth: '28rem', marginTop: '1rem' }}>
              Bookmark this page and check back next year for our biggest Black Friday &amp; Cyber
              Monday savings of the year.
            </p>
          </div>
        </section>

        {/* SIMPLE BODY SECTION */}
        <section style={{ backgroundColor: colors.cream, color: colors.heading }}>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="rounded-2xl bg-white shadow-sm px-6 py-8 md:px-8 md:py-10" style={{ border: `1px solid ${colors.stone}` }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
                Looking for Deals Right Now?
              </h2>
              <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, marginTop: '0.75rem', lineHeight: 1.6 }}>
                Our Black Friday &amp; Cyber Monday promos run once a year, but we keep fresh
                offers rotating all year long&mdash;on injectables, facials, laser treatments, memberships,
                and more.
              </p>
              <ul className="mt-4 space-y-2" style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>
                <li>&bull; Monthly specials curated by our providers</li>
                <li>&bull; Occasional flash sales on select services</li>
                <li>&bull; Extra perks for RELUXE members</li>
              </ul>
              <div className="mt-6">
                <a
                  href="https://reluxemedspa.com/deals/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    padding: '0.5rem 1rem',
                    fontFamily: fonts.body,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#fff',
                    backgroundColor: colors.ink,
                  }}
                >
                  See Today&apos;s Deals &rarr;
                </a>
              </div>
            </div>

            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted, textAlign: 'center', lineHeight: 1.6, marginTop: '1.5rem' }}>
              Note: All Black Friday &amp; Cyber Monday 2025 offers have ended and cannot be
              extended or retroactively applied. For any questions about existing pre-purchased
              packages, please contact our front desk team.
            </p>
          </div>
        </section>
      </main>
    </BetaLayout>
  )
}

BlackFridayArchivePage.getLayout = (page) => page
