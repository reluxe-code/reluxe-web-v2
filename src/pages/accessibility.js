// pages/accessibility.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function AccessibilityPage() {
  const updated = 'August 26, 2025'
  return (
    <>
      <Head>
        <title>Accessibility Statement | RELUXE Med Spa</title>
        <meta name="description" content="Our commitment to digital accessibility and how to report access issues."/>
        <link rel="canonical" href="https://www.reluxemedspa.com/accessibility" />
      </Head>

      <HeaderTwo />

      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Accessibility</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">Accessibility Statement</h1>
          <div className="mt-3 text-sm text-neutral-600"><strong>Last Updated:</strong> {updated}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
          <p className="mb-6">
            RELUXE Med Spa is committed to providing a website that is accessible to the widest possible audience,
            regardless of technology or ability. We aim for substantial conformance with WCAG 2.1 AA standards.
          </p>

          <h3 className="mt-8 text-2xl font-bold">Measures We Take</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Semantic HTML, ARIA where appropriate, and keyboard navigation support.</li>
            <li>Alt text for meaningful images and sufficient color contrast.</li>
            <li>Continuous monitoring and iterative improvements.</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">Feedback & Support</h3>
          <p className="mt-2">
            If you experience difficulty accessing content, email <a className="underline" href="mailto:hello@reluxemedspa.com">hello@reluxemedspa.com</a> or call (317) 763-1142.
            Please include the page URL and a description of the issue.
          </p>

          <div className="mt-8">
            <Link href="/legal" className="underline">Back to Legal Hub</Link>
          </div>
        </div>
      </main>
    </>
  )
}
