// pages/membership-terms.js
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function MembershipTermsPage() {
  const updated = 'August 26, 2025'
  return (
    <BetaLayout
      title="Membership Terms"
      description="Membership billing cadence, credits/rollover, cancellation, pauses, and other terms."
      canonical="https://www.reluxemedspa.com/membership-terms"
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
            Store & Membership
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
            Membership Terms
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
              Summary
            </h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Memberships bill monthly on a recurring basis until canceled.</li>
              <li>Credits may be used toward eligible services; non-transferable and have no cash value.</li>
              <li>Rollover: Unused credits may roll as long as you have a current membership or for 90 days after cancellation unless otherwise stated in your plan.</li>
              <li>Cancellation: Provide at least one full billing cycle notice; prorations are not guaranteed.</li>
              <li>Pauses: One pause (1-2 months) permitted per 12 months, subject to approval.</li>
              <li>Discounts cannot be combined unless explicitly stated.</li>
            </ul>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Billing & Payment
            </h3>
            <p className="mt-2">You authorize recurring charges to your payment method on file. Failed payments may suspend benefits.</p>

            <h3 className="mt-8" style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>
              Changes to Membership
            </h3>
            <p className="mt-2">We may modify or discontinue membership benefits with prior notice by email or on this page.</p>

            <div className="mt-8 space-x-4">
              <Link href="/privacy-policy" className="underline">Privacy Policy</Link>
              <Link href="/return-policy" className="underline">Return Policy</Link>
            </div>
          </div>
        </div>
      </main>
    </BetaLayout>
  )
}

MembershipTermsPage.getLayout = (page) => page
