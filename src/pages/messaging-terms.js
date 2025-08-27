// pages/messaging-terms.js

import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function MessagingTermsPage() {
  const updated = 'August 26, 2025'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Messaging Terms & Conditions | RELUXE Med Spa',
    url: 'https://www.reluxemedspa.com/messaging-terms',
    description:
      'RELUXE Med Spa messaging terms for SMS/MMS marketing and informational alerts: opt-in/opt-out, HELP/STOP, message frequency, carrier disclaimer, data rates, and privacy.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.reluxemedspa.com/' },
        { '@type': 'ListItem', position: 2, name: 'Messaging Terms', item: 'https://www.reluxemedspa.com/messaging-terms' },
      ],
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'RELUXE Med Spa',
      url: 'https://www.reluxemedspa.com/',
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+1-317-763-1142', email: 'support@reluxemedspa.com' },
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
        <title>Messaging Terms & Conditions | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Read the RELUXE Med Spa SMS/MMS messaging terms: consent, message frequency, STOP/HELP, data rates, carrier disclaimer, quiet hours, and privacy details."
        />
        <link rel="canonical" href="https://www.reluxemedspa.com/messaging-terms" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      {/* Page Header */}
      <HeaderTwo />
      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Messaging Terms & Conditions
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
                  ['#program', 'Program Description'],
                  ['#consent', 'Consent & Enrollment'],
                  ['#frequency', 'Message Frequency'],
                  ['#fees', 'Fees & Carrier Disclaimer'],
                  ['#twoway', 'Two-Way Messaging'],
                  ['#quiet', 'Quiet Hours'],
                  ['#optout', 'Opt-Out (STOP)'],
                  ['#help', 'Help (HELP)'],
                  ['#number', 'Number Changes'],
                  ['#eligibility', 'Eligibility & Availability'],
                  ['#privacy', 'Privacy'],
                  ['#changes', 'Program & Terms Changes'],
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
              <p className="mb-6">
                These Messaging Terms & Conditions (the “Terms”) govern your participation in RELUXE Med Spa’s SMS/MMS
                messaging program (“Program”). By opting in, you agree to these Terms.
              </p>

              <h3 id="program" className="mt-8 text-2xl font-bold text-neutral-900">Program Description</h3>
              <p className="mt-2">
                The Program provides recurring automated <strong>marketing</strong> and <strong>informational</strong> text messages,
                including promotions, limited-time offers, appointment reminders/updates, scheduling links, and service alerts, sent to
                the mobile number you provide. Messages may be sent via an automatic telephone dialing system or other automated
                technologies. <em>Your consent to receive marketing messages is not a condition of purchase.</em>
              </p>

              <h3 id="consent" className="mt-8 text-2xl font-bold text-neutral-900">Consent & Enrollment</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>You may opt in by submitting your mobile number on our website, during checkout, in-person forms, or by texting a keyword (when offered).</li>
                <li>By opting in, you affirm that you are the subscriber or customary user of the number provided and authorize us to send messages to that number.</li>
                <li>We may send a one-time confirmation message to verify your enrollment.</li>
              </ul>

              <h3 id="frequency" className="mt-8 text-2xl font-bold text-neutral-900">Message Frequency</h3>
              <p className="mt-2">
                Message frequency varies. We typically send <strong>2–4 messages per month</strong>, though additional messages may be
                sent based on your interactions (e.g., booking, rescheduling, ongoing conversations). We may adjust frequency at any
                time to increase or decrease total messages. The sending number or short code used may change.
              </p>

              <h3 id="fees" className="mt-8 text-2xl font-bold text-neutral-900">Fees & Carrier Disclaimer</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><strong>Message & data rates may apply.</strong> If you have questions about your text or data plan, contact your wireless provider.</li>
                <li><strong>Carriers are not liable</strong> for delayed or undelivered messages.</li>
              </ul>

              <h3 id="twoway" className="mt-8 text-2xl font-bold text-neutral-900">Two-Way Messaging</h3>
              <p className="mt-2">
                The Program supports two-way messaging. You may reply to messages to ask questions or request appointments. Some replies
                may be handled by automated systems; others by our staff during business hours.
              </p>

              <h3 id="quiet" className="mt-8 text-2xl font-bold text-neutral-900">Quiet Hours</h3>
              <p className="mt-2">
                To respect your time, we observe quiet hours <strong>approximately 9:00 PM – 7:30 AM (local time)</strong> for outbound marketing messages.
                If you initiate a conversation during these hours, we may respond.
              </p>

              <h3 id="optout" className="mt-8 text-2xl font-bold text-neutral-900">Opt-Out (STOP)</h3>
              <p className="mt-2">
                You can cancel at any time by texting <strong>STOP</strong>. After you send STOP, we will confirm your opt-out and no further messages will be sent,
                unless you re-opt-in through one of our enrollment methods.
              </p>

              <h3 id="help" className="mt-8 text-2xl font-bold text-neutral-900">Help (HELP)</h3>
              <p className="mt-2">
                For help, text <strong>HELP</strong> and we will respond with instructions on how to unsubscribe and how to contact support. You may also email
                <a href="mailto:support@reluxemedspa.com" className="underline"> support@reluxemedspa.com</a>.
              </p>

              <h3 id="number" className="mt-8 text-2xl font-bold text-neutral-900">Number Changes & Transfers</h3>
              <p className="mt-2">
                If you change or transfer your mobile number, you agree to text <strong>STOP</strong> from the original number or notify us at
                <a href="mailto:support@reluxemedspa.com" className="underline"> support@reluxemedspa.com</a> so we can prevent messages to the old number.
                This is a condition of using the Program.
              </p>

              <h3 id="eligibility" className="mt-8 text-2xl font-bold text-neutral-900">Eligibility & Availability</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>The Program is intended for U.S. residents who are <strong>18 years or older</strong>.</li>
                <li>Program availability may vary by carrier and region. We may add or remove carriers or messaging routes as needed.</li>
              </ul>

              <h3 id="privacy" className="mt-8 text-2xl font-bold text-neutral-900">Privacy</h3>
              <p className="mt-2">
                For information on how we collect and use your data, please see our{' '}
                <Link href="/privacy-policy" className="underline">Privacy Policy</Link>. By enrolling, you acknowledge that messaging activity
                (timestamps, delivery, interactions) may be processed by our messaging partners to provide the Program.
              </p>

              <h3 id="changes" className="mt-8 text-2xl font-bold text-neutral-900">Program & Terms Changes</h3>
              <p className="mt-2">
                We may change or terminate the Program at any time. We may also update these Terms. Changes take effect immediately upon
                posting on this page. Your continued enrollment after changes constitutes acceptance.
              </p>

              <h3 id="contact" className="mt-8 text-2xl font-bold text-neutral-900">Contact Us</h3>
              <address className="not-italic mt-2 space-y-1">
                <div><strong>RELUXE Med Spa</strong></div>
                <div>514 E State Road 32, Westfield, IN 46074</div>
                <div>10485 N Pennsylvania St, Carmel, IN 46032</div>
                <div><a href="mailto:support@reluxemedspa.com" className="underline">support@reluxemedspa.com</a></div>
                <div><a href="tel:+13177631142" className="underline">(317) 763-1142</a></div>
              </address>

              <div className="mt-10">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-neutral-900 shadow hover:opacity-95 transition"
                >
                  Questions about messaging? Contact us
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
