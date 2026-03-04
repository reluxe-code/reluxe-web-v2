// pages/hipaa-notice.js
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function HIPAANoticePage() {
  const updated = 'August 26, 2025'
  const jsonLd = {'@context':'https://schema.org','@type':'WebPage',name:'HIPAA Notice of Privacy Practices | RELUXE Med Spa',url:'https://www.reluxemedspa.com/hipaa-notice'}
  return (
    <BetaLayout
      title="HIPAA Notice of Privacy Practices"
      description="How RELUXE Med Spa may use and disclose your Protected Health Information (PHI) and how you can access it."
      canonical="https://www.reluxemedspa.com/hipaa-notice"
      structuredData={jsonLd}
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
            Compliance
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
            HIPAA Notice of Privacy Practices
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
              This Notice describes how medical information about you may be used and disclosed and how you can get access to this information.
            </p>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Our Duties
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Maintain the privacy of your Protected Health Information (PHI).</li>
              <li>Provide this Notice and abide by its terms.</li>
              <li>Notify you following a breach of unsecured PHI when required.</li>
            </ul>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Permitted Uses & Disclosures
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Treatment:</strong> To coordinate your care among providers.</li>
              <li><strong>Payment:</strong> To bill and collect payment for services.</li>
              <li><strong>Healthcare Operations:</strong> Quality assessment, training, audits, and compliance.</li>
            </ul>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Other Uses & Disclosures
            </h3>
            <p className="mt-2">We may disclose PHI as required by law, for public health and safety, to avert serious threats, or with your written authorization.</p>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Your Rights
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access and obtain a copy of your PHI.</li>
              <li>Request restrictions or confidential communications.</li>
              <li>Request amendments and obtain an accounting of disclosures.</li>
              <li>File a complaint without fear of retaliation.</li>
            </ul>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Contact
            </h3>
            <p className="mt-2">To exercise rights or ask questions, contact <a className="underline" href="mailto:hello@reluxemedspa.com">hello@reluxemedspa.com</a> or (317) 763-1142.</p>

            <div className="mt-8">
              <Link href="/legal" className="underline">Back to Legal Hub</Link>
            </div>
          </div>
        </div>
      </main>
    </BetaLayout>
  )
}

HIPAANoticePage.getLayout = (page) => page
