// pages/hipaa-notice.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function HIPAANoticePage() {
  const updated = 'August 26, 2025'
  const jsonLd = {'@context':'https://schema.org','@type':'WebPage',name:'HIPAA Notice of Privacy Practices | RELUXE Med Spa',url:'https://www.reluxemedspa.com/hipaa-notice'}
  return (
    <>
      <Head>
        <title>HIPAA Notice of Privacy Practices | RELUXE Med Spa</title>
        <meta name="description" content="How RELUXE Med Spa may use and disclose your Protected Health Information (PHI) and how you can access it."/>
        <link rel="canonical" href="https://www.reluxemedspa.com/hipaa-notice" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
      </Head>

      <HeaderTwo />

      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Compliance</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">HIPAA Notice of Privacy Practices</h1>
          <div className="mt-3 text-sm text-neutral-600"><strong>Last Updated:</strong> {updated}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
          <p className="mb-6">
            This Notice describes how medical information about you may be used and disclosed and how you can get access to this information.
          </p>

          <h3 className="mt-8 text-2xl font-bold">Our Duties</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Maintain the privacy of your Protected Health Information (PHI).</li>
            <li>Provide this Notice and abide by its terms.</li>
            <li>Notify you following a breach of unsecured PHI when required.</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">Permitted Uses & Disclosures</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Treatment:</strong> To coordinate your care among providers.</li>
            <li><strong>Payment:</strong> To bill and collect payment for services.</li>
            <li><strong>Healthcare Operations:</strong> Quality assessment, training, audits, and compliance.</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">Other Uses & Disclosures</h3>
          <p className="mt-2">We may disclose PHI as required by law, for public health and safety, to avert serious threats, or with your written authorization.</p>

          <h3 className="mt-8 text-2xl font-bold">Your Rights</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access and obtain a copy of your PHI.</li>
            <li>Request restrictions or confidential communications.</li>
            <li>Request amendments and obtain an accounting of disclosures.</li>
            <li>File a complaint without fear of retaliation.</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">Contact</h3>
          <p className="mt-2">To exercise rights or ask questions, contact <a className="underline" href="mailto:hello@reluxemedspa.com">hello@reluxemedspa.com</a> or (317) 763-1142.</p>

          <div className="mt-8">
            <Link href="/legal" className="underline">Back to Legal Hub</Link>
          </div>
        </div>
      </main>
    </>
  )
}
