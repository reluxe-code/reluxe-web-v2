// pages/cookie-policy.js
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function CookiePolicyPage() {
  const updated = 'August 26, 2025'
  return (
    <BetaLayout
      title="Cookie Policy"
      description="Details on cookies, pixels, analytics, and how to manage your preferences."
      canonical="https://www.reluxemedspa.com/cookie-policy"
    >
      {/* Hero */}
      <header
        style={{
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%)`,
          backgroundSize: 'cover',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p
            style={{
              fontFamily: fonts.body,
              ...typeScale.label,
              color: colors.muted,
            }}
          >
            Legal
          </p>
          <h1
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.white,
              marginTop: '0.5rem',
            }}
          >
            Cookie Policy
          </h1>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.caption.size,
              color: colors.muted,
              marginTop: '0.75rem',
            }}
          >
            <strong>Last Updated:</strong> {updated}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div
            className="shadow-sm p-6 sm:p-10 leading-relaxed"
            style={{
              borderRadius: '9999px',
              border: `1px solid ${colors.stone}`,
              backgroundColor: '#fff',
              fontFamily: fonts.body,
              color: colors.body,
            }}
          >
            <p className="mb-6">
              We use cookies and similar technologies (pixels, tags, local storage) to operate our site, analyze traffic,
              and deliver relevant advertising.
            </p>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Types of Cookies
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Essential:</strong> Required to operate the site and enable basic functions.</li>
              <li><strong>Analytics:</strong> Understand usage and improve performance (e.g., Google Analytics).</li>
              <li><strong>Advertising:</strong> Deliver relevant ads and measure effectiveness (e.g., Meta Pixel).</li>
            </ul>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Your Choices
            </h3>
            <p className="mt-2">
              You can manage cookies via browser settings. Blocking some cookies may impact site functionality.
              To opt out of certain analytics/ads, use tools provided by those services.
            </p>

            <div className="mt-8">
              <Link href="/privacy-policy" className="underline">Read our Privacy Policy</Link>
            </div>
          </div>
        </div>
      </main>
    </BetaLayout>
  )
}

CookiePolicyPage.getLayout = (page) => page
