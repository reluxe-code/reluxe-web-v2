// pages/shipping-policy.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function ShippingPolicyPage() {
  const updated = 'August 26, 2025'
  return (
    <>
      <Head>
        <title>Shipping Policy | RELUXE Med Spa</title>
        <meta name="description" content="Processing times, carriers, tracking, shipping fees, and lost/damaged parcels."/>
        <link rel="canonical" href="https://www.reluxemedspa.com/shipping-policy" />
      </Head>

      <HeaderTwo />

      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Store Policies</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">Shipping Policy</h1>
          <div className="mt-3 text-sm text-neutral-600"><strong>Last Updated:</strong> {updated}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
          <h3 className="text-2xl font-bold">Processing & Transit</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Orders typically process in 1–3 business days (Mon–Fri, excluding holidays).</li>
            <li>Carriers may include USPS, UPS, or FedEx; tracking details provided upon shipment.</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">Shipping Fees</h3>
          <p className="mt-2">Fees are calculated at checkout based on destination, weight, and carrier rates.</p>

          <h3 className="mt-8 text-2xl font-bold">Lost/Damaged Packages</h3>
          <p className="mt-2">Report within 7 days of delivery estimate. Include photos of damage for claims.</p>

          <div className="mt-8 space-x-4">
            <Link href="/return-policy" className="underline">Return Policy</Link>
            <Link href="/legal" className="underline">Back to Legal Hub</Link>
          </div>
        </div>
      </main>
    </>
  )
}
