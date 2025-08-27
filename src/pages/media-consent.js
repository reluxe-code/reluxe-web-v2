// pages/media-consent.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function MediaConsentPage() {
  const updated = 'August 26, 2025'
  return (
    <>
      <Head>
        <title>Photo & Video Consent | RELUXE Med Spa</title>
        <meta name="description" content="How RELUXE may capture and use photos/videos for educational or marketing purposes and your choices."/>
        <link rel="canonical" href="https://www.reluxemedspa.com/media-consent" />
      </Head>

      <HeaderTwo />

      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Events & Media</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">Photo & Video Consent</h1>
          <div className="mt-3 text-sm text-neutral-600"><strong>Last Updated:</strong> {updated}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
          <p className="mb-6">
            With your consent, RELUXE may capture photos/videos for educational, testimonial, and marketing purposes.
          </p>

          <h3 className="mt-8 text-2xl font-bold">Your Choices</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Consent is optional and can be withdrawn at any time for future uses.</li>
            <li>We avoid identifying information unless expressly authorized by you.</li>
            <li>Request removal of content where feasible by contacting us.</li>
          </ul>

          <div className="mt-8">
            <Link href="/legal" className="underline">Back to Legal Hub</Link>
          </div>
        </div>
      </main>
    </>
  )
}
