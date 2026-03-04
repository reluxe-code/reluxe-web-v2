// pages/legal.js
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

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
    <BetaLayout
      title="Terms, Conditions, Policies & Legal"
      description="Explore RELUXE Med Spa's legal hub: Privacy Policy, Messaging Terms, Return Policy, Terms of Service, HIPAA, Accessibility, Cookie Policy, and more."
      canonical="https://www.reluxemedspa.com/legal"
      structuredData={jsonLd}
    >
      {/* Hero */}
      <header
        style={{
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%)`,
          backgroundSize: 'cover',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p
            style={{
              fontFamily: fonts.body,
              ...typeScale.label,
              color: colors.muted,
            }}
          >
            Legal
          </p>
          <h1
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.white,
              marginTop: '0.5rem',
            }}
          >
            Terms, Conditions, Policies & Legal
          </h1>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.caption.size,
              color: colors.muted,
              marginTop: '0.75rem',
            }}
          >
            <span><strong>Last Updated:</strong> {updated}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Intro / Help */}
            <aside className="lg:col-span-4">
              <div
                className="sticky top-24 shadow-sm p-6"
                style={{
                  borderRadius: '9999px',
                  border: `1px solid ${colors.stone}`,
                  backgroundColor: '#fff',
                }}
              >
                <h2
                  style={{
                    fontFamily: fonts.display,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: colors.heading,
                  }}
                >
                  Need help?
                </h2>
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: typeScale.caption.size,
                    color: colors.body,
                    marginTop: '0.5rem',
                  }}
                >
                  Not sure which policy applies? Start with our{' '}
                  <Link href="/privacy-policy" className="underline">Privacy Policy</Link> and{' '}
                  <Link href="/return-policy" className="underline">Return Policy</Link>, or contact us.
                </p>
                <div
                  className="mt-4 space-y-2"
                  style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size }}
                >
                  <div><a href="mailto:hello@reluxemedspa.com" className="underline">hello@reluxemedspa.com</a></div>
                  <div><a href="tel:+13177631142" className="underline">(317) 763-1142</a></div>
                </div>
                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-95 transition"
                    style={{
                      borderRadius: '9999px',
                      background: gradients.primary,
                      fontFamily: fonts.body,
                    }}
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
                  <h3
                    style={{
                      fontFamily: fonts.display,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: colors.heading,
                    }}
                  >
                    {section.title}
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="group shadow-sm p-5 hover:shadow-md transition"
                        style={{
                          borderRadius: '9999px',
                          border: `1px solid ${colors.stone}`,
                          backgroundColor: '#fff',
                          display: 'block',
                        }}
                      >
                        <h4
                          className="group-hover:underline"
                          style={{
                            fontFamily: fonts.display,
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: colors.heading,
                          }}
                        >
                          {item.name}
                        </h4>
                        <p
                          style={{
                            fontFamily: fonts.body,
                            fontSize: typeScale.caption.size,
                            color: colors.body,
                            marginTop: '0.5rem',
                          }}
                        >
                          {item.desc}
                        </p>
                        <div
                          style={{
                            fontFamily: fonts.body,
                            fontSize: typeScale.caption.size,
                            fontWeight: 500,
                            color: colors.heading,
                            marginTop: '1rem',
                          }}
                        >
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
        </div>
      </main>
    </BetaLayout>
  )
}

LegalHubPage.getLayout = (page) => page
