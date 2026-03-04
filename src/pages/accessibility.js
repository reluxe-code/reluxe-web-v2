// pages/accessibility.js
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function AccessibilityPage() {
  const updated = 'August 26, 2025'
  return (
    <BetaLayout
      title="Accessibility Statement"
      description="Our commitment to digital accessibility and how to report access issues."
      canonical="https://www.reluxemedspa.com/accessibility"
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
            Accessibility
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
            Accessibility Statement
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
              RELUXE Med Spa is committed to providing a website that is accessible to the widest possible audience,
              regardless of technology or ability. We aim for substantial conformance with WCAG 2.1 AA standards.
            </p>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Measures We Take
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Semantic HTML, ARIA where appropriate, and keyboard navigation support.</li>
              <li>Alt text for meaningful images and sufficient color contrast.</li>
              <li>Continuous monitoring and iterative improvements.</li>
            </ul>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Feedback & Support
            </h3>
            <p className="mt-2">
              If you experience difficulty accessing content, email <a className="underline" href="mailto:hello@reluxemedspa.com">hello@reluxemedspa.com</a> or call (317) 763-1142.
              Please include the page URL and a description of the issue.
            </p>

            <div className="mt-8">
              <Link href="/legal" className="underline">Back to Legal Hub</Link>
            </div>
          </div>
        </div>
      </main>
    </BetaLayout>
  )
}

AccessibilityPage.getLayout = (page) => page
