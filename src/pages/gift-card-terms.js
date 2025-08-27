// pages/gift-card-terms.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function GiftCardTermsPage() {
  const updated = 'August 26, 2025'
  return (
    <>
      <Head>
        <title>Gift Card Terms | RELUXE Med Spa</title>
        <meta name="description" content="Gift card redemption, expiration, and lost/stolen card policies."/>
        <link rel="canonical" href="https://www.reluxemedspa.com/gift-card-terms" />
      </Head>

      <HeaderTwo />

      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Store Policies</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">Gift Card Terms</h1>
          <div className="mt-3 text-sm text-neutral-600"><strong>Last Updated:</strong> {updated}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
          <ul className="list-disc pl-6 space-y-1">
            <li>Redeemable for products and services at RELUXE Med Spa; not redeemable for cash (except as required by law).</li>
            <li>No expiration dates or inactivity fees unless required by state law disclosures.</li>
            <li>Please treat gift cards like cash; lost or stolen cards may not be replaced.</li>
            <li>Cards are non-transferable and non-refundable; resale is prohibited.</li>
            <li>Balances may be checked at our front desk or by contacting us.</li>
          </ul>

          <div className="mt-8">
            <Link href="/legal" className="underline">Back to Legal Hub</Link>
          </div>
        </div>
      </main>
    </>
  )
}
