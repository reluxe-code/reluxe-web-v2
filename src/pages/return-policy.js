// pages/return-policy.js

import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function ReturnPolicyPage() {
  const updated = 'August 26, 2025'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Product Return Policy | RELUXE Med Spa',
    url: 'https://www.reluxemedspa.com/return-policy',
    description:
      'RELUXE Med Spa skincare product return policy: timelines for opened/unopened items, defective products, allergy reactions, exchanges, refunds, non-returnable items, and how to start a return.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.reluxemedspa.com/' },
        { '@type': 'ListItem', position: 2, name: 'Product Return Policy', item: 'https://www.reluxemedspa.com/return-policy' },
      ],
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'RELUXE Med Spa',
      url: 'https://www.reluxemedspa.com/',
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+1-317-763-1142', email: 'help@reluxemedspa.com' },
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
        <title>Product Return Policy | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Learn how to return skincare products purchased from RELUXE Med Spa. See timelines for opened/unopened items, defective products, allergy reactions, refunds, exchanges, and non-returnables."
        />
        <link rel="canonical" href="https://www.reluxemedspa.com/return-policy" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      {/* Page Header */}
      <HeaderTwo />
      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Store Policies</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Skincare Product Return Policy
          </h1>
          <div className="mt-3 text-sm text-neutral-600">
            <span><strong>Last Updated:</strong> {updated}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar TOC */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white shadow-sm p-5">
              <h2 className="text-sm font-semibold text-neutral-900">On this page</h2>
              <nav className="mt-4 text-sm space-y-2">
                {[
                  ['#overview', 'Overview'],
                  ['#opened', '1) Opened Products'],
                  ['#unopened', '2) Unopened Products'],
                  ['#defective', '3) Defective or Damaged Items'],
                  ['#allergy', '4) Allergy Reactions'],
                  ['#how', 'How to Start a Return'],
                  ['#refunds', 'Refunds, Credits & Timing'],
                  ['#nonreturn', 'Non-Returnable Items'],
                  ['#gwp', 'Gifts, Bundles & Promotions'],
                  ['#shipping', 'Shipping Returns'],
                  ['#rights', 'Policy Rights'],
                  ['#contact', 'Contact Us'],
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
            </div>
          </aside>

          {/* Content */}
          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
              <p id="overview" className="mb-6">
                We stand behind the quality of our professional skincare. If something isn’t right, we’ll work with you to make it right.
                The following policy applies to <strong>skincare products</strong> purchased in-spa or online directly from RELUXE Med Spa.
              </p>

              <h3 id="opened" className="mt-8 text-2xl font-bold text-neutral-900">1) Opened Products</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><strong>Return window:</strong> within <strong>14 days</strong> of purchase.</li>
                <li><strong>Condition:</strong> original packaging and proof of purchase required.</li>
                <li><strong>Outcome:</strong> store credit or exchange.</li>
              </ul>

              <h3 id="unopened" className="mt-8 text-2xl font-bold text-neutral-900">2) Unopened Products</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><strong>Return window:</strong> within <strong>30 days</strong> of purchase.</li>
                <li><strong>Condition:</strong> factory-sealed, in resellable condition, with proof of purchase.</li>
                <li><strong>Outcome:</strong> full refund to original payment method, store credit, or exchange.</li>
              </ul>

              <h3 id="defective" className="mt-8 text-2xl font-bold text-neutral-900">3) Defective or Damaged Items</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Contact us immediately if an item arrives defective or damaged.</li>
                <li><strong>Return window:</strong> within <strong>30 days</strong> of purchase or within <strong>7 days of delivery</strong> for shipped orders.</li>
                <li><strong>Outcome:</strong> your choice of replacement, exchange, or full refund/store credit.</li>
                <li>For shipping damage, please include clear photos of the product, inner packaging, and shipping box.</li>
              </ul>

              <h3 id="allergy" className="mt-8 text-2xl font-bold text-neutral-900">4) Allergy Reactions</h3>
              <p className="mt-2">
                If you experience an adverse reaction, discontinue use and contact us. We’ll help troubleshoot and recommend alternatives.
                <strong> Within 14 days</strong> of purchase, returns due to documented sensitivity may be eligible for store credit or exchange.
                Photos and a brief description may be requested to assist product quality teams.
              </p>

              <h3 id="how" className="mt-8 text-2xl font-bold text-neutral-900">How to Start a Return</h3>
              <ol className="mt-2 list-decimal pl-6 space-y-1">
                <li>Email <a href="mailto:help@reluxemedspa.com" className="underline">help@reluxemedspa.com</a> or call <a href="tel:+13177631142" className="underline">(317) 763-1142</a>.</li>
                <li>Provide your order number (or date of purchase + name on appointment) and the reason for return.</li>
                <li>We’ll issue return instructions and, if applicable, a Return Authorization (RMA).</li>
                <li>Return the product in secure packaging. Keep your shipping receipt and tracking until your return is processed.</li>
              </ol>

              <h3 id="refunds" className="mt-8 text-2xl font-bold text-neutral-900">Refunds, Credits & Timing</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Refunds go to the original payment method. If unavailable, store credit will be issued.</li>
                <li>Once your return is received and inspected, we typically process within <strong>7 business days</strong>. Your bank or card issuer may take an additional <strong>3–10 business days</strong> to post the credit.</li>
                <li>Exchanges ship after we receive and inspect the return (or sooner at our discretion).</li>
              </ul>

              <h3 id="nonreturn" className="mt-8 text-2xl font-bold text-neutral-900">Non-Returnable Items</h3>
              <p className="mt-2">For health and safety, the following are <strong>final sale</strong> and not eligible for return:</p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Opened or used <em>tools/devices</em> (e.g., rollers, brushes) unless defective</li>
                <li>Products marked clearance, final sale, or promotional samples</li>
                <li>Gift cards and prepaid service credits</li>
                <li>Prescription products (if applicable) and items restricted by manufacturers</li>
              </ul>

              <h3 id="gwp" className="mt-8 text-2xl font-bold text-neutral-900">Gifts, Bundles & Promotions</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><strong>Gift with Purchase (GWP):</strong> If returning a qualifying purchase, please include the gift. If the gift is not returned, we may deduct the gift’s retail value from the refund.</li>
                <li><strong>Bundles/Sets:</strong> Must be returned in full to receive a full refund. Partial returns may be eligible for store credit at a prorated amount, less any promotional discount.</li>
                <li><strong>Rewards:</strong> Any rewards points or credits issued on a returned order may be adjusted or revoked.</li>
              </ul>

              <h3 id="shipping" className="mt-8 text-2xl font-bold text-neutral-900">Shipping Returns</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Unless an item is defective or we made an error, return shipping costs are the customer’s responsibility.</li>
                <li>Use a trackable method and adequate protective packaging.</li>
                <li>For verified defects or fulfillment errors, we will provide a prepaid label or reimburse reasonable return shipping.</li>
              </ul>

              <h3 id="rights" className="mt-8 text-2xl font-bold text-neutral-900">Policy Rights</h3>
              <p className="mt-2">
                We reserve the right to refuse a return that does not meet the criteria above (e.g., missing packaging, outside the return window,
                excessive wear, or suspected misuse). This policy may be updated periodically; the latest version will appear on this page.
              </p>

              <h3 id="contact" className="mt-8 text-2xl font-bold text-neutral-900">Contact Us</h3>
              <address className="not-italic mt-2 space-y-1">
                <div><strong>RELUXE Med Spa</strong></div>
                <div>514 E State Road 32, Westfield, IN 46074</div>
                <div>10485 N Pennsylvania St, Carmel, IN 46032</div>
                <div><a href="mailto:help@reluxemedspa.com" className="underline">help@reluxemedspa.com</a></div>
                <div><a href="tel:+13177631142" className="underline">(317) 763-1142</a></div>
              </address>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-neutral-900 shadow hover:opacity-95 transition"
                >
                  Start a return or exchange
                </Link>
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition"
                >
                  Read our Privacy Policy
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
