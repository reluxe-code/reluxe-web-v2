// pages/membership-terms.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function MembershipTermsPage() {
  const updated = 'August 26, 2025'
  return (
    <>
      <Head>
        <title>Membership Terms | RELUXE Med Spa</title>
        <meta name="description" content="Membership billing cadence, credits/rollover, cancellation, pauses, and other terms."/>
        <link rel="canonical" href="https://www.reluxemedspa.com/membership-terms" />
      </Head>

      <HeaderTwo />

      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Store & Membership</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">Membership Terms</h1>
          <div className="mt-3 text-sm text-neutral-600"><strong>Last Updated:</strong> {updated}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
          <h3 className="text-2xl font-bold">Summary</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Memberships bill monthly on a recurring basis until canceled.</li>
            <li>Credits may be used toward eligible services; non-transferable and have no cash value.</li>
            <li>Rollover: Unused credits may roll as long as you have a current membership or for 90 days after cancellation unless otherwise stated in your plan.</li>
            <li>Cancellation: Provide at least one full billing cycle notice; prorations are not guaranteed.</li>
            <li>Pauses: One pause (1–2 months) permitted per 12 months, subject to approval.</li>
            <li>Discounts cannot be combined unless explicitly stated.</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">Billing & Payment</h3>
          <p className="mt-2">You authorize recurring charges to your payment method on file. Failed payments may suspend benefits.</p>

          <h3 className="mt-8 text-2xl font-bold">Changes to Membership</h3>
          <p className="mt-2">We may modify or discontinue membership benefits with prior notice by email or on this page.</p>

          <div className="mt-8 space-x-4">
            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>
            <Link href="/return-policy" className="underline">Return Policy</Link>
          </div>
        </div>
      </main>
    </>
  )
}
