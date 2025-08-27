// pages/privacy-policy.js

import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function PrivacyPolicyPage() {
  const updated = 'August 26, 2025'
  const effective = 'May 4, 2024'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy | RELUXE Med Spa',
    url: 'https://www.reluxemedspa.com/privacy-policy',
    description:
      'How RELUXE Med Spa collects, uses, and protects your information, including SMS/email marketing, PHI, cookies, and your privacy rights.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.reluxemedspa.com/' },
        { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: 'https://www.reluxemedspa.com/privacy-policy' },
      ],
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'RELUXE Med Spa',
      url: 'https://www.reluxemedspa.com/',
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+1-317-763-1142', email: 'hello@reluxemedspa.com' },
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
        <title>Privacy Policy | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Learn how RELUXE Med Spa collects, uses, and protects your information, including PHI, cookies, SMS/email marketing, and your privacy rights."
        />
        <link rel="canonical" href="https://www.reluxemedspa.com/privacy-policy" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      {/* Page Header */}
      <HeaderTwo />
      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Privacy Policy
          </h1>
          <div className="mt-3 text-sm text-neutral-600">
            <span className="mr-4"><strong>Effective:</strong> {effective}</span>
            <span><strong>Last Updated:</strong> {updated}</span>
          </div>
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
                  ['#info', '1. Information We Collect'],
                  ['#use', '2. How We Use Your Information'],
                  ['#sharing', '3. Information Sharing'],
                  ['#cookies', '4. Cookies & Tracking'],
                  ['#marketing', '5. Marketing Communications'],
                  ['#payments', '6. Payment Information'],
                  ['#retention', '7. Data Retention'],
                  ['#security', '8. Security'],
                  ['#children', '9. Children’s Privacy'],
                  ['#international', '10. International Visitors'],
                  ['#rights', '11. Your Rights'],
                  ['#links', '12. Links to Other Websites'],
                  ['#changes', '13. Changes to this Policy'],
                  ['#contact', '14. Contact Us'],
                ].map(([href, label]) => (
                  <div key={href}>
                    <a href={href} className="text-neutral-700 hover:text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-500">
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
              <p id="intro" className="mb-6">
                Thank you for visiting RELUXE Med Spa’s website. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information. By using our website, services, or communication
                channels, you agree to this Privacy Policy.
              </p>

              <h3 id="info" className="mt-10 text-2xl font-bold text-neutral-900">1. Information We Collect</h3>
              <h4 className="mt-4 font-semibold">1.1 Personal Information</h4>
              <p className="mt-2">
                We may collect your name, email, phone number, date of birth, billing details, and other
                information you provide when booking services, filling out forms, subscribing to communications,
                or contacting us.
              </p>
              <h4 className="mt-4 font-semibold">1.2 Health Information</h4>
              <p className="mt-2">
                As a med spa, we may collect health-related information relevant to your treatments. This
                information may qualify as Protected Health Information (PHI). RELUXE Med Spa follows applicable
                privacy laws, including HIPAA where required, to safeguard this data.
              </p>
              <h4 className="mt-4 font-semibold">1.3 Non-Personal Information</h4>
              <p className="mt-2">
                We may automatically collect IP address, browser, operating system, device data, and usage
                patterns through cookies, pixels, and similar technologies.
              </p>

              <h3 id="use" className="mt-10 text-2xl font-bold text-neutral-900">2. How We Use Your Information</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Provide, personalize, and improve services</li>
                <li>Schedule and manage appointments</li>
                <li>Send confirmations, reminders, and promotional offers</li>
                <li>Analyze usage and website performance</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>

              <h3 id="sharing" className="mt-10 text-2xl font-bold text-neutral-900">3. Information Sharing</h3>
              <p className="mt-2">
                We do not sell your personal information. We may share information with trusted service
                providers (e.g., booking, payments, analytics, marketing platforms), to comply with legal
                obligations, protect our rights, or with your explicit consent.
              </p>

              <h3 id="cookies" className="mt-10 text-2xl font-bold text-neutral-900">4. Cookies & Tracking Technologies</h3>
              <p className="mt-2">
                We use cookies, pixels, and similar technologies (e.g., Google Analytics, Meta Pixel) to
                improve user experience, analyze traffic, and deliver relevant ads. You can adjust browser
                settings to disable cookies, but some features may not function properly.
              </p>

              <h3 id="marketing" className="mt-10 text-2xl font-bold text-neutral-900">5. Marketing Communications (Email & SMS)</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><span className="font-semibold">Consent:</span> By providing your email or phone number, you consent to receive communications from us.</li>
                <li><span className="font-semibold">Content:</span> Promotions, reminders, updates, and service information.</li>
                <li><span className="font-semibold">Frequency:</span> Typically 2–4 messages per month unless you initiate a conversation.</li>
                <li><span className="font-semibold">Message & Data Rates:</span> May apply.</li>
                <li><span className="font-semibold">Opting Out:</span> Unsubscribe via email link or reply STOP to SMS at any time.</li>
                <li><span className="font-semibold">Two-Way:</span> You may reply to ask questions or request appointments.</li>
                <li><span className="font-semibold">Quiet Hours:</span> Typically 9:00 PM–7:30 AM local time; we don’t send marketing during these hours unless you message us.</li>
                <li><span className="font-semibold">Carrier Disclaimer:</span> Carriers are not liable for delayed or undelivered messages.</li>
              </ul>

              <h3 id="payments" className="mt-10 text-2xl font-bold text-neutral-900">6. Payment Information</h3>
              <p className="mt-2">
                We do not store payment card details. Transactions are processed securely by third-party
                processors (e.g., Boulevard, Cherry) that maintain their own privacy and security practices.
              </p>

              <h3 id="retention" className="mt-10 text-2xl font-bold text-neutral-900">7. Data Retention</h3>
              <p className="mt-2">
                We retain personal information only as long as necessary to provide services, meet legal,
                tax, or regulatory obligations, resolve disputes, and enforce agreements. You may request
                deletion at any time (see Section 11).
              </p>

              <h3 id="security" className="mt-10 text-2xl font-bold text-neutral-900">8. Security</h3>
              <p className="mt-2">
                We use SSL encryption and reasonable administrative, technical, and physical safeguards to
                protect your information. No method of transmission or storage is 100% secure.
              </p>

              <h3 id="children" className="mt-10 text-2xl font-bold text-neutral-900">9. Children’s Privacy</h3>
              <p className="mt-2">
                Our website and services are intended for individuals 18 years and older. We do not knowingly
                collect personal information from children under 13. If we learn that we have collected such
                information, we will promptly delete it.
              </p>

              <h3 id="international" className="mt-10 text-2xl font-bold text-neutral-900">10. International Visitors</h3>
              <p className="mt-2">
                Our services are intended for U.S. residents. If you access our website from outside the U.S.,
                your information will be transferred to and processed in the United States.
              </p>

              <h3 id="rights" className="mt-10 text-2xl font-bold text-neutral-900">11. Your Rights</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Access, correct, or delete your personal information</li>
                <li>Request a copy of your data</li>
                <li>Withdraw consent for marketing communications</li>
                <li>File a complaint with a regulatory authority, where applicable</li>
              </ul>

              <h3 id="links" className="mt-10 text-2xl font-bold text-neutral-900">12. Links to Other Websites</h3>
              <p className="mt-2">
                Our website may contain links to third-party sites. We are not responsible for their privacy
                practices and encourage you to review their policies.
              </p>

              <h3 id="changes" className="mt-10 text-2xl font-bold text-neutral-900">13. Changes to this Policy</h3>
              <p className="mt-2">
                We may update this Privacy Policy from time to time. Updates will be posted here with a revised
                effective date. Significant changes may also be communicated via email.
              </p>

              <h3 id="contact" className="mt-10 text-2xl font-bold text-neutral-900">14. Contact Us</h3>
              <address className="not-italic mt-2 space-y-1">
                <div><strong>RELUXE Med Spa</strong></div>
                <div>514 E State Road 32, Westfield, IN 46074</div>
                <div>10485 N Pennsylvania St, Carmel, IN 46280</div>
                <div><a href="mailto:hello@reluxemedspa.com" className="underline">hello@reluxemedspa.com</a></div>
                <div><a href="tel:+13177631142" className="underline">(317) 763-1142</a></div>
              </address>

              <div className="mt-10">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-neutral-900 shadow hover:opacity-95 transition"
                >
                  Have a privacy question? Contact us
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
