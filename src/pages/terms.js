// pages/terms.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function TermsOfServicePage() {
  const updated = 'August 26, 2025'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service | RELUXE Med Spa',
    url: 'https://www.reluxemedspa.com/terms',
    description:
      'Terms of Service for RELUXE Med Spa: use of website, disclaimers, pricing accuracy, promotions, liability, and customer responsibilities.',
  }

  return (
    <>
      <Head>
        <title>Terms of Service | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Comprehensive Terms of Service for RELUXE Med Spa: website use, disclaimers, pricing accuracy, promotions, liability limits, and customer responsibilities."
        />
        <link rel="canonical" href="https://www.reluxemedspa.com/terms" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <HeaderTwo />

      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Terms of Service
          </h1>
          <div className="mt-3 text-sm text-neutral-600">
            <strong>Last Updated:</strong> {updated}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-10 leading-relaxed text-neutral-800">
          <p className="mb-6">
            These Terms of Service (“Terms”) govern your access to and use of the RELUXE Med Spa website, digital
            platforms, and online content (collectively, the “Site”). By accessing or using the Site, you agree to these Terms. 
            If you do not agree, please discontinue use.
          </p>

          <h3 className="mt-8 text-2xl font-bold">1. Use of the Site</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>You must be at least 18 years of age to use this Site.</li>
            <li>You agree to use the Site only for lawful purposes and in accordance with these Terms.</li>
            <li>You agree not to interfere with or disrupt the Site, attempt to gain unauthorized access, or use automated tools (e.g., bots, scrapers) without permission.</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">2. Accuracy of Information & Pricing Disclaimer</h3>
          <p className="mt-2">
            While we strive for accuracy, RELUXE Med Spa does not warrant that the Site content is complete, accurate, or up to date. 
            Information—including service descriptions, pricing, promotions, packages, and availability—may be inaccurate, incomplete, or outdated.
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Pricing & Promotions:</strong> Subject to change without notice. Online prices may differ from in-spa pricing.</li>
            <li><strong>No Guarantee of Availability:</strong> Services, products, or promotions may be limited, discontinued, or expired.</li>
            <li><strong>Right to Correct Errors:</strong> We reserve the right to correct errors and to refuse, cancel, or adjust orders or bookings made based on incorrect information—even after submission.</li>
            <li><strong>Customer Responsibility:</strong> You are responsible for confirming current pricing and offers directly with RELUXE before purchase.</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">3. Medical Disclaimer</h3>
          <p className="mt-2">
            Information on this Site is provided for general educational and promotional purposes only and is not intended as medical advice.
            Individual results vary, and no treatment outcomes are guaranteed. Always consult with a licensed RELUXE provider regarding your suitability for services.
          </p>

          <h3 className="mt-8 text-2xl font-bold">4. Promotions & Offers</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>All promotions, deals, and packages are limited-time offers and subject to change or withdrawal without notice.</li>
            <li>Promotions cannot be combined unless explicitly stated.</li>
            <li>RELUXE reserves the right to set eligibility requirements for promotional pricing or event offers.</li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">5. Packages, Vouchers & Gift Cards</h3>
          <p className="mt-2">
            RELUXE may offer prepaid service packages, promotional vouchers, memberships, and gift cards.
            Additional terms may apply depending on the product or offer.
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Packages & Service Vouchers:</strong> Packages and service vouchers are governed by our{' '}
              <Link href="/package-voucher-policy" className="underline">
                Package &amp; Voucher Policy
              </Link>
              , which outlines validity periods, expiration, and usage rules.
            </li>
            <li>
              <strong>Gift Cards:</strong> Gift cards are governed by our{' '}
              <Link href="/gift-card-terms" className="underline">
                Gift Card Terms
              </Link>
              .
            </li>
            <li>
              <strong>Memberships:</strong> Membership billing, credits, rollover, and cancellation are governed by our{' '}
              <Link href="/membership-terms" className="underline">
                Membership Terms
              </Link>
              .
            </li>
          </ul>

          <h3 className="mt-8 text-2xl font-bold">6. Electronic Communications</h3>
          <p className="mt-2">
            By using the Site or contacting us electronically, you consent to receive communications from RELUXE Med Spa electronically
            (via email, SMS, or website notices). You agree that such communications satisfy legal requirements for written communications.
          </p>

          <h3 className="mt-8 text-2xl font-bold">7. Third-Party Links & Services</h3>
          <p className="mt-2">
            The Site may contain links to third-party sites or integrate with booking, payment, or analytics services.
            RELUXE is not responsible for third-party content, practices, or policies. Use of such services is at your own risk.
          </p>

          <h3 className="mt-8 text-2xl font-bold">8. Intellectual Property</h3>
          <p className="mt-2">
            All trademarks, logos, graphics, and content on the Site are the property of RELUXE Med Spa or its licensors.
            You may not copy, reproduce, modify, or distribute materials without prior written consent.
          </p>

          <h3 className="mt-8 text-2xl font-bold">9. Termination of Access</h3>
          <p className="mt-2">
            RELUXE reserves the right to suspend or terminate your access to the Site at our discretion, without notice,
            for conduct that violates these Terms or is otherwise harmful.
          </p>

          <h3 className="mt-8 text-2xl font-bold">10. Limitation of Liability</h3>
          <p className="mt-2">
            To the fullest extent permitted by law, RELUXE Med Spa, its affiliates, and providers are not liable for any indirect,
            incidental, consequential, special, or punitive damages arising out of your use of the Site or services—even if advised of the possibility.
            Our liability is limited to the amount you paid for the service or product giving rise to the claim.
          </p>

          <h3 className="mt-8 text-2xl font-bold">11. Indemnification</h3>
          <p className="mt-2">
            You agree to defend, indemnify, and hold harmless RELUXE Med Spa, its owners, employees, and affiliates from and against any claims,
            damages, liabilities, costs, or expenses (including attorneys’ fees) arising out of your use of the Site, your breach of these Terms,
            or your violation of any law or rights of a third party.
          </p>

          <h3 className="mt-8 text-2xl font-bold">12. Governing Law & Dispute Resolution</h3>
          <p className="mt-2">
            These Terms are governed by the laws of the State of Indiana, without regard to conflict of law principles.
            Any disputes shall be resolved in the state or federal courts located in Hamilton County, Indiana.
          </p>
          <p className="mt-2">
            At RELUXE’s discretion, disputes may also be subject to binding arbitration under the rules of the American Arbitration Association.
          </p>

          <h3 className="mt-8 text-2xl font-bold">13. Changes to Terms</h3>
          <p className="mt-2">
            We may update these Terms periodically. Updates will be effective immediately upon posting.
            Your continued use of the Site constitutes acceptance of the revised Terms.
          </p>

          <h3 className="mt-8 text-2xl font-bold">14. Contact Us</h3>
          <address className="not-italic mt-2 space-y-1">
            <div><strong>RELUXE Med Spa</strong></div>
            <div>514 E State Road 32, Westfield, IN 46074</div>
            <div>10485 N Pennsylvania St, Carmel, IN 46032</div>
            <div><a href="mailto:hello@reluxemedspa.com" className="underline">hello@reluxemedspa.com</a></div>
            <div><a href="tel:+13177631142" className="underline">(317) 763-1142</a></div>
          </address>

          <div className="mt-8">
            <Link href="/legal" className="underline">Back to Legal Hub</Link>
          </div>
        </div>
      </main>
    </>
  )
}
