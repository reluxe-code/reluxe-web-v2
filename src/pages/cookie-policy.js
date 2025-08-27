// pages/cookie-policy.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function CookiePolicyPage() {
  const updated = 'August 26, 2025'
  return (
    <>
      <Head>
        <title>Cookie Policy | RELUXE Med Spa</title>
        <meta name="description" content="Details on cookies, pixels, analytics, and how to manage your preferences."/>
        <link rel="canonical" href="https://www.reluxemedspa.com/cookie-policy" />
      </Head>

      <HeaderTwo />

      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">Cookie Policy</h1>
          <div className="mt-3 text-sm text-neutral-600"><strong>Last Updated:</strong> {updated}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
          <p className="mb-6">
            We use cookies and similar technologies (pixels, tags, local storage) to operate our site, analyze traffic,
            and deliver relevant advertising.
          </p>

          <h3 className="mt-8 text-2xl font-bold">Types of Cookies</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Essential:</strong> Required to operate the site and enable basic functions.</li>
            <li><strong>Analytics:</strong> Understand usage and improve performance (e.g., Google Analytics).</li>
            <li><strong>Advertising:</strong> Deliver relevant ads and measure effectiveness (e.g., Meta Pixel).</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">Your Choices</h3>
          <p className="mt-2">
            You can manage cookies via browser settings. Blocking some cookies may impact site functionality.
            To opt out of certain analytics/ads, use tools provided by those services.
          </p>

          <div className="mt-8">
            <Link href="/privacy-policy" className="underline">Read our Privacy Policy</Link>
          </div>
        </div>
      </main>
    </>
  )
}
