// pages/event-terms.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function EventTermsPage() {
  const updated = 'August 26, 2025'
  return (
    <>
      <Head>
        <title>Event Terms | RELUXE Med Spa</title>
        <meta name="description" content="RSVP rules, promotions, eligibility, and onsite policies for RELUXE events."/>
        <link rel="canonical" href="https://www.reluxemedspa.com/event-terms" />
      </Head>

      <HeaderTwo />

      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Events & Media</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">Event Terms</h1>
          <div className="mt-3 text-sm text-neutral-600"><strong>Last Updated:</strong> {updated}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
          <ul className="list-disc pl-6 space-y-1">
            <li>RSVPs may be required; capacity is limited and subject to change.</li>
            <li>Promotions/discounts may be event-only and have blackout dates or limits.</li>
            <li>Eligibility: 18+; valid ID may be required for certain services or purchases.</li>
            <li>We reserve the right to refuse service for safety or policy violations.</li>
          </ul>

          <div className="mt-8">
            <Link href="/legal" className="underline">Back to Legal Hub</Link>
          </div>
        </div>
      </main>
    </>
  )
}
