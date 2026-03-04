// pages/shipping-policy.js
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function ShippingPolicyPage() {
  const updated = 'August 26, 2025'
  return (
    <BetaLayout
      title="Shipping Policy"
      description="Processing times, carriers, tracking, shipping fees, and lost/damaged parcels."
      canonical="https://www.reluxemedspa.com/shipping-policy"
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
            Store Policies
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
            Shipping Policy
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
            <h3 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Processing & Transit
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Orders typically process in 1-3 business days (Mon-Fri, excluding holidays).</li>
              <li>Carriers may include USPS, UPS, or FedEx; tracking details provided upon shipment.</li>
            </ul>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Shipping Fees
            </h3>
            <p className="mt-2">Fees are calculated at checkout based on destination, weight, and carrier rates.</p>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Lost/Damaged Packages
            </h3>
            <p className="mt-2">Report within 7 days of delivery estimate. Include photos of damage for claims.</p>

            <div className="mt-8 space-x-4">
              <Link href="/return-policy" className="underline">Return Policy</Link>
              <Link href="/legal" className="underline">Back to Legal Hub</Link>
            </div>
          </div>
        </div>
      </main>
    </BetaLayout>
  )
}

ShippingPolicyPage.getLayout = (page) => page
