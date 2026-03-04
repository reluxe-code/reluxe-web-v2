// pages/media-consent.js
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function MediaConsentPage() {
  const updated = 'August 26, 2025'
  return (
    <BetaLayout
      title="Photo & Video Consent"
      description="How RELUXE may capture and use photos/videos for educational or marketing purposes and your choices."
      canonical="https://www.reluxemedspa.com/media-consent"
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
            Events & Media
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
            Photo & Video Consent
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
              With your consent, RELUXE may capture photos/videos for educational, testimonial, and marketing purposes.
            </p>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Your Choices
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Consent is optional and can be withdrawn at any time for future uses.</li>
              <li>We avoid identifying information unless expressly authorized by you.</li>
              <li>Request removal of content where feasible by contacting us.</li>
            </ul>

            <div className="mt-8">
              <Link href="/legal" className="underline">Back to Legal Hub</Link>
            </div>
          </div>
        </div>
      </main>
    </BetaLayout>
  )
}

MediaConsentPage.getLayout = (page) => page
