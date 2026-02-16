// pages/legal.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function LegalHubPage() {
  const updated = 'August 26, 2025'

  const sections = [
    {
      title: 'Core Policies',
      items: [
        {
          name: 'Privacy Policy',
          href: '/privacy-policy',
          desc: 'How we collect, use, and protect your data, including PHI/HIPAA considerations.',
        },
        {
          name: 'Messaging Terms & Conditions',
          href: '/messaging-terms',
          desc: 'SMS/MMS consent, frequency, STOP/HELP keywords, quiet hours, carrier disclaimers.',
        },
        {
          name: 'Skincare Product Return Policy',
          href: '/return-policy',
          desc: 'Returns, exchanges, defects/damage, allergy reactions, non-returnables.',
        },
        {
          name: 'Terms of Service',
          href: '/terms',
          desc: 'Website/app use, disclaimers, liability limits, user responsibilities.',
        },
      ],
    },
    {
      title: 'Compliance & Notices',
      items: [
        {
          name: 'HIPAA Notice of Privacy Practices',
          href: '/hipaa-notice',
          desc: 'How Protected Health Information (PHI) may be used and disclosed.',
        },
        {
          name: 'Accessibility Statement (ADA)',
          href: '/accessibility',
          desc: 'Our commitment to accessible experiences and how to report barriers.',
        },
        {
          name: 'Cookie Policy',
          href: '/cookie-policy',
          desc: 'Details on cookies/pixels and how to manage preferences.',
        },
      ],
    },
    {
      title: 'Store & Membership',
      items: [
        {
          name: 'Membership Terms',
          href: '/membership-terms',
          desc: 'Billing cadence, credits/rollover, cancellation, and pauses.',
        },
        {
          name: 'Package & Voucher Policy',
          href: '/package-voucher-policy',
          desc: 'Validity window (24 months), scheduling guidance, and how package vouchers differ from gift cards.',
        },
        {
          name: 'Gift Card Terms',
          href: '/gift-card-terms',
          desc: 'Redemption, expiration (if any), and lost/stolen card policy.',
        },
        {
          name: 'Shipping Policy',
          href: '/shipping-policy',
          desc: 'Carriers, processing windows, tracking, and lost/damaged parcels.',
        },
      ],
    },
    {
      title: 'Events & Media',
      items: [
        {
          name: 'Event Terms (Beauty Bash & Open Houses)',
          href: '/event-terms',
          desc: 'RSVP rules, promotions, eligibility, and onsite policies.',
        },
        {
          name: 'Photo & Video Consent',
          href: '/media-consent',
          desc: 'Permissions for capturing and using content in marketing.',
        },
      ],
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Terms, Conditions, Policies & Legal | RELUXE Med Spa',
    url: 'https://www.reluxemedspa.com/legal',
    description:
      'Central legal hub for RELUXE Med Spa: Privacy, Messaging Terms, Return Policy, Terms of Service, HIPAA, Accessibility, Cookie Policy, and more.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.reluxemedspa.com/' },
        { '@type': 'ListItem', position: 2, name: 'Legal', item: 'https://www.reluxemedspa.com/legal' },
      ],
    },
  }

  return (
    <>
      <Head>
        <title>Terms, Conditions, Policies & Legal | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Explore RELUXE Med Spa’s legal hub: Privacy Policy, Messaging Terms, Return Policy, Terms of Service, HIPAA, Accessibility, Cookie Policy, and more."
        />
        <link rel="canonical" href="https://www.reluxemedspa.com/legal" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <HeaderTwo />

      {/* Page Header */}
      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Terms, Conditions, Policies & Legal
          </h1>
          <div className="mt-3 text-sm text-neutral-600">
            <span><strong>Last Updated:</strong> {updated}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Intro / Help */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white shadow-sm p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Need help?</h2>
              <p className="mt-2 text-sm text-neutral-700">
                Not sure which policy applies? Start with our{' '}
                <Link href="/privacy-policy" className="underline">Privacy Policy</Link> and{' '}
                <Link href="/return-policy" className="underline">Return Policy</Link>, or contact us.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div><a href="mailto:hello@reluxemedspa.com" className="underline">hello@reluxemedspa.com</a></div>
                <div><a href="tel:+13177631142" className="underline">(317) 763-1142</a></div>
              </div>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-neutral-900 shadow hover:opacity-95 transition"
                >
                  Contact RELUXE
                </Link>
              </div>
            </div>
          </aside>

          {/* Sections */}
          <section className="lg:col-span-8">
            {sections.map((section) => (
              <div key={section.title} className="mb-10">
                <h3 className="text-xl font-bold text-neutral-900">{section.title}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group rounded-2xl border border-neutral-200 bg-white shadow-sm p-5 hover:shadow-md transition"
                    >
                      <h4 className="text-base font-semibold text-neutral-900 group-hover:underline">
                        {item.name}
                      </h4>
                      <p className="mt-2 text-sm text-neutral-700">{item.desc}</p>
                      <div className="mt-4 text-sm font-medium text-neutral-900">
                        <span className="inline-flex items-center gap-1">
                          View details
                          <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 01-.023 1.418l-5 4.999a1 1 0 11-1.382-1.445L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
  )
}
