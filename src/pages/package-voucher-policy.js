// src/pages/package-voucher-policy.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function PackageVoucherPolicyPage() {
  const updated = 'January 1, 2026'
  const effective = 'January 1, 2026'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Package & Voucher Policy | RELUXE Med Spa',
    url: 'https://www.reluxemedspa.com/package-voucher-policy',
    description:
      'RELUXE Med Spa package and voucher validity, scheduling guidance, expiration policy (24 months), and how packages differ from gift cards.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.reluxemedspa.com/' },
        { '@type': 'ListItem', position: 2, name: 'Legal', item: 'https://www.reluxemedspa.com/legal' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Package & Voucher Policy',
          item: 'https://www.reluxemedspa.com/package-voucher-policy',
        },
      ],
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'RELUXE Med Spa',
      url: 'https://www.reluxemedspa.com/',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: '+1-317-763-1142',
          email: 'hello@reluxemedspa.com',
        },
      ],
      address: [
        {
          '@type': 'PostalAddress',
          streetAddress: '514 E State Road 32',
          addressLocality: 'Westfield',
          addressRegion: 'IN',
          postalCode: '46074',
          addressCountry: 'US',
        },
        {
          '@type': 'PostalAddress',
          streetAddress: '10485 N Pennsylvania St',
          addressLocality: 'Carmel',
          addressRegion: 'IN',
          postalCode: '46032',
          addressCountry: 'US',
        },
      ],
    },
  }

  return (
    <>
      <Head>
        <title>Package & Voucher Policy | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Learn how RELUXE Med Spa packages and service vouchers work, including validity (24 months), scheduling guidance, and how packages differ from gift cards."
        />
        <link rel="canonical" href="https://www.reluxemedspa.com/package-voucher-policy" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <HeaderTwo />

      {/* Page Header */}
      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Package & Voucher Policy
          </h1>
          <div className="mt-3 text-sm text-neutral-600">
            <span className="mr-4">
              <strong>Effective:</strong> {effective}
            </span>
            <span>
              <strong>Last Updated:</strong> {updated}
            </span>
          </div>
          <p className="mt-4 text-sm text-neutral-700 max-w-3xl">
            This policy explains how service packages and vouchers work at RELUXE Med Spa, including
            validity windows, scheduling expectations, and how packages differ from gift cards.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / TOC */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white shadow-sm p-5">
              <h2 className="text-sm font-semibold text-neutral-900">On this page</h2>
              <nav className="mt-4 text-sm space-y-2">
                {[
                  ['#intro', 'Introduction'],
                  ['#definitions', '1. Definitions'],
                  ['#validity', '2. Validity & Expiration (24 Months)'],
                  ['#scheduling', '3. Scheduling & Treatment Planning'],
                  ['#value', '4. No Cash Value / Non-Refundable'],
                  ['#transfers', '5. Transfers & Sharing'],
                  ['#pricing', '6. Pricing Changes'],
                  ['#transition', '7. Transition for Existing Packages'],
                  ['#giftcards', '8. Gift Cards vs Packages'],
                  ['#exceptions', '9. Medical Holds & Exceptions'],
                  ['#contact', '10. Contact Us'],
                ].map(([href, label]) => (
                  <div key={href}>
                    <a
                      href={href}
                      className="text-neutral-700 hover:text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-500"
                    >
                      {label}
                    </a>
                  </div>
                ))}
              </nav>

              <div className="mt-6 text-xs text-neutral-600">
                Looking for gift card rules? See{' '}
                <Link href="/gift-card-terms" className="underline">
                  Gift Card Terms
                </Link>
                .
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
              <p id="intro" className="mb-6">
                RELUXE Med Spa offers service packages and vouchers to help patients plan care
                thoughtfully and stay consistent with treatment recommendations. To provide clarity
                and consistency, we standardize how packages and vouchers are used.
              </p>

              <h3 id="definitions" className="mt-10 text-2xl font-bold text-neutral-900">
                1. Definitions
              </h3>
              <ul className="mt-3 list-disc pl-6 space-y-2">
                <li>
                  <strong>Package / Service Voucher:</strong> A prepaid set of services or sessions
                  intended to be redeemed for specific RELUXE treatments.
                </li>
                <li>
                  <strong>Gift Card:</strong> A dollar-value card or code that can be applied toward
                  services or products (see Section 8).
                </li>
                <li>
                  <strong>Purchase Date:</strong> The date the package or voucher was purchased or
                  issued.
                </li>
              </ul>

              <h3 id="validity" className="mt-10 text-2xl font-bold text-neutral-900">
                2. Validity & Expiration (24 Months)
              </h3>
              <p className="mt-3">
                <strong>
                  All service packages and vouchers are valid for 24 months from the purchase date.
                </strong>{' '}
                This timeframe provides flexibility while encouraging timely care for best results.
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2">
                <li>Unused services expire after 24 months and cannot be redeemed.</li>
                <li>Expired packages are not eligible for refund or cash value.</li>
                <li>
                  If you are unsure of your expiration date, our team can help confirm your balance
                  and timeline.
                </li>
              </ul>

              <h3 id="scheduling" className="mt-10 text-2xl font-bold text-neutral-900">
                3. Scheduling & Treatment Planning
              </h3>
              <p className="mt-3">
                Many aesthetic treatments are most effective when completed on a recommended cadence.
                We encourage patients to schedule in advance, especially for multi-session plans.
              </p>

              <h3 id="value" className="mt-10 text-2xl font-bold text-neutral-900">
                4. No Cash Value / Non-Refundable
              </h3>
              <p className="mt-3">
                Unless required by law or explicitly stated at the time of purchase, packages and
                vouchers:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2">
                <li>Have no cash value</li>
                <li>Are non-refundable</li>
                <li>May not be applied to past services</li>
              </ul>

              <h3 id="transfers" className="mt-10 text-2xl font-bold text-neutral-900">
                5. Transfers & Sharing
              </h3>
              <p className="mt-3">
                For safety and medical record integrity, some services must be used by the original
                purchaser. Any approved transfers must be authorized by RELUXE in advance.
              </p>

              <h3 id="pricing" className="mt-10 text-2xl font-bold text-neutral-900">
                6. Pricing Changes
              </h3>
              <p className="mt-3">
                Packages lock in the services included at the time of purchase. Future pricing
                changes do not affect valid packages within their expiration period.
              </p>

              <h3 id="transition" className="mt-10 text-2xl font-bold text-neutral-900">
                7. Transition for Existing Packages
              </h3>
              <p className="mt-3">
                Packages purchased prior to the effective date of this policy (1/1/26) is subject to a
                generous transition period of 24 months from 1/1/26.
              </p>

              <h3 id="giftcards" className="mt-10 text-2xl font-bold text-neutral-900">
                8. Gift Cards vs Packages
              </h3>
              <ul className="mt-3 list-disc pl-6 space-y-2">
                <li>
                  <strong>Dollar-value gift cards</strong> are valid for{' '}
                  <strong>5 years from purchase</strong>, in accordance with federal law.
                </li>
                <li>
                  <strong>Service packages and vouchers</strong> are valid for{' '}
                  <strong>24 months from purchase</strong>.
                </li>
              </ul>

              <h3 id="exceptions" className="mt-10 text-2xl font-bold text-neutral-900">
                9. Medical Holds & Exceptions
              </h3>
              <p className="mt-3">
                In limited cases, extensions may be considered for documented medical reasons that
                prevent timely treatment. Extensions are not guaranteed and are evaluated case by
                case.
              </p>

              <h3 id="contact" className="mt-10 text-2xl font-bold text-neutral-900">
                10. Contact Us
              </h3>
              <address className="not-italic mt-3 space-y-1">
                <div>
                  <strong>RELUXE Med Spa</strong>
                </div>
                <div>514 E State Road 32, Westfield, IN 46074</div>
                <div>10485 N Pennsylvania St, Carmel, IN 46032</div>
                <div>
                  <a href="mailto:hello@reluxemedspa.com" className="underline">
                    hello@reluxemedspa.com
                  </a>
                </div>
                <div>
                  <a href="tel:+13177631142" className="underline">
                    (317) 763-1142
                  </a>
                </div>
              </address>

              <div className="mt-10 flex gap-3">
                <Link
                  href="/legal"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold border border-neutral-200 bg-white shadow-sm hover:shadow transition"
                >
                  Back to Legal Hub
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-neutral-900 shadow hover:opacity-95 transition"
                >
                  Contact RELUXE
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
