// src/pages/memberships.js
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '@/components/header/header-2'
import { Disclosure } from '@headlessui/react'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const SITE_URL = 'https://reluxemedspa.com'
const PAGE_URL = `${SITE_URL}/memberships`
const OG_IMAGE = `${SITE_URL}/images/og/memberships-og.jpg` // update if needed

// -------------------------------
// Promo Feature Flag
// -------------------------------
// If you prefer manual control, set this true in January.
const FORCE_JANUARY_PROMO = true

// -------------------------------
// Membership Data (from your images)
// -------------------------------
const plans = [
  {
    key: '100',
    title: 'VIP $100 Membership',
    price: 100,
    priceDisplay: '$100 / month',
    januaryStartPrice: 50,
    voucherLabel: '1 voucher per month (choose 1 service)',
    voucherIncludes: ['60-minute Massage', 'Signature Facial', '10 units Choice Tox', 'Lip Flip'],
    href: '/buy/essential',
    bestFor: 'Perfect if you want consistent self-care + flexible savings each month.',
  },
  {
    key: '200',
    title: 'VIP $200 Membership',
    price: 200,
    priceDisplay: '$200 / month',
    januaryStartPrice: 50,
    voucherLabel: '1 voucher per month (choose 1 service)',
    voucherIncludes: ['Glo2Facial', 'Hydrafacial', 'Facial + Massage', '120-minute Massage', '20 units Choice Tox'],
    href: '/buy/elite',
    bestFor: 'Best for bigger monthly value—premium facials, longer massage, or more tox units.',
  },
]

const additionalBenefits = [
  { title: '10% off', desc: 'Single service*' },
  { title: '10% off', desc: 'Packages*' },
  { title: '15% off', desc: 'All products*' },
  { title: 'Member pricing', desc: 'Per-unit tox' },
  { title: 'FREE', desc: 'Monthly sauna' },
  { title: '$50 off', desc: 'All filler' },
]

const faqs = [
  {
    q: 'Is there a commitment?',
    a: `We recommend a 12-month commitment for best results and best value, but you can cancel anytime with 30 days notice.`,
  },
  {
    q: 'Do vouchers expire?',
    a: `Vouchers never expire while your membership is active. If you cancel, you have 90 days to use any unused vouchers. After 90 days, unused vouchers are forfeited.`,
  },
  {
    q: 'Can I share my voucher?',
    a: `Yes—vouchers can be shared (for example, with a family member).`,
  },
  {
    q: 'How does tox work with membership?',
    a: `You always get the best (member) per-unit pricing on tox. You can also use your monthly vouchers for “Choice Tox” units (10 units on the $100 membership, 20 units on the $200 membership). Many clients bank those vouchers and apply them toward their quarterly tox appointment.`,
  },
  {
    q: 'Are the “Additional Benefits” different between $100 and $200?',
    a: `No—both memberships include the same VIP benefits and discounts. The only difference is what your monthly voucher can be used for.`,
  },
  {
    q: 'What about the January $50 start promo?',
    a: `In January, memberships start at $50 for your first month and renew at the regular monthly price in month 2. If you received a promotional first month (free or discounted), you must complete at least 3 payments. If you cancel before 3 payments, we may charge the promotional balance.`,
  },
]

// -------------------------------
// SEO
// -------------------------------
const TITLE = 'Med Spa Memberships in Carmel & Westfield | RELUXE Med Spa'
const DESCRIPTION =
  'RELUXE Med Spa memberships in Carmel & Westfield, Indiana. Choose a $100 or $200 VIP membership, get a monthly voucher you can use on your favorite services, and unlock member-only pricing and perks.'
const KEYWORDS =
  'med spa membership, tox membership, Botox membership, facial membership, massage membership, Carmel med spa, Westfield med spa, RELUXE memberships'

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Memberships', item: PAGE_URL },
  ],
}

function buildOfferCatalogJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'RELUXE Med Spa VIP Memberships',
    url: PAGE_URL,
    itemListElement: plans.map((p, idx) => ({
      '@type': 'Offer',
      name: p.title,
      price: p.price,
      priceCurrency: 'USD',
      category: 'Membership',
      url: `${SITE_URL}${p.href}`,
      position: idx + 1,
      availability: 'https://schema.org/InStock',
      eligibleRegion: [
        { '@type': 'City', name: 'Carmel, IN' },
        { '@type': 'City', name: 'Westfield, IN' },
      ],
      seller: {
        '@type': 'LocalBusiness',
        name: 'RELUXE Med Spa',
        address: [
          { '@type': 'PostalAddress', addressLocality: 'Westfield', addressRegion: 'IN' },
          { '@type': 'PostalAddress', addressLocality: 'Carmel', addressRegion: 'IN' },
        ],
      },
    })),
  }
}

export default function MembershipsPage() {
  const [isJanuaryPromo, setIsJanuaryPromo] = useState(FORCE_JANUARY_PROMO)

  useEffect(() => {
    if (FORCE_JANUARY_PROMO) return
    const now = new Date()
    setIsJanuaryPromo(now.getMonth() === 0) // January = 0
  }, [])

  const offerCatalogJsonLd = useMemo(() => buildOfferCatalogJsonLd(), [])

  return (
    <div className="bg-white min-h-screen">
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content={KEYWORDS} />
        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:alt" content="RELUXE Med Spa Memberships" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        <meta name="geo.region" content="US-IN" />
        <meta name="geo.placename" content="Carmel, Westfield" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogJsonLd) }}
        />
      </Head>

      <HeaderTwo />

      {/* HERO */}
      <header className="relative bg-[url('/images/page-banner/memberships-header.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            RELUXE VIP Memberships
            <span className="block text-white/90">Westfield & Carmel</span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Pick your monthly voucher. Unlock VIP discounts. Always get your best pricing on tox.
          </p>

          {/* Overview panel – popup style (matches Services page) */}
          <div className="relative mt-8 mx-auto max-w-5xl">
            {/* soft glow accents */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-600/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="overflow-hidden rounded-3xl bg-neutral-950/90 text-white ring-1 ring-white/10 shadow-2xl backdrop-blur-md">
              {/* header line (small) */}
              <div className="px-6 pt-7 md:px-8">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-white/60">
                  MEMBERSHIP OVERVIEW
                </p>
              </div>

              {/* body */}
              <div className="px-6 pb-7 pt-3 md:px-8">
                {isJanuaryPromo && (
                  <div className="mb-5 rounded-2xl bg-white/10 ring-1 ring-white/15 p-4 text-left">
                    <p className="font-extrabold text-white">
                      January Special: Start for <span className="text-white">$50</span>
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      All memberships start at <span className="font-semibold">$50</span> in January and renew at regular
                      price in month 2. Promotional start requires <span className="font-semibold">3 payments</span>.
                    </p>
                  </div>
                )}

                <p className="text-base md:text-lg leading-relaxed text-white/80">
                  RELUXE VIP Memberships make it easy to stay consistent with your glow.
                  Each month you receive <strong>1 voucher</strong> you can use toward the services you
                  love—massage, facials, and even <strong>Choice Tox units</strong>.
                  Plus, you’ll always get our <strong>best member pricing</strong> on tox and VIP savings across services,
                  packages, products, and filler.
                </p>

                {/* highlight chips */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm">
                  <span className="px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/25">
                    Bank vouchers
                  </span>
                  <span className="px-3 py-1 rounded-full bg-sky-400/15 text-sky-200 ring-1 ring-sky-400/25">
                    Best tox pricing
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/25">
                    VIP discounts
                  </span>
                  <span className="px-3 py-1 rounded-full bg-fuchsia-400/15 text-fuchsia-200 ring-1 ring-fuchsia-400/25">
                    Westfield + Carmel
                  </span>
                </div>

                {/* actions */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="#plans"
                    className="inline-flex items-center justify-center rounded-2xl
                              bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500
                              px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20
                              transition hover:brightness-[1.05] active:scale-[.99]"
                  >
                    View Membership Options
                  </Link>

                  <Link
                    href="/book/consult/"
                    className="inline-flex items-center justify-center rounded-2xl
                              bg-white/10 px-6 py-4 text-sm font-semibold text-white
                              ring-1 ring-white/15 hover:bg-white/15"
                  >
                    Not sure? Book a Consult
                  </Link>
                </div>

                {/* optional tiny helper line */}
                <div className="mt-4 text-xs text-white/60">
                  Tip: Many members bank their Choice Tox vouchers and apply them toward quarterly tox visits.
                </div>
              </div>

              {/* bottom accent bar */}
              <div className="h-[4px] w-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 opacity-70" />
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 py-14 md:py-18 space-y-16">
        {/* QUICK VALUE STRIP */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="font-bold text-lg">Choose your service</p>
            <p className="text-gray-700 mt-1">
              Each month you receive <span className="font-semibold">1 voucher</span> for your choice of included
              services.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="font-bold text-lg">Best pricing always</p>
            <p className="text-gray-700 mt-1">
              VIP members get <span className="font-semibold">member pricing</span> on tox + exclusive discounts on
              services and products.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="font-bold text-lg">Bank it when life gets busy</p>
            <p className="text-gray-700 mt-1">
              Vouchers never expire with an active membership (and you have 90 days after canceling).
            </p>
          </div>
        </section>

        {/* PLANS */}
        <section id="plans">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold">Pick your monthly membership</h2>
            <p className="mt-3 text-gray-700">
              Same VIP benefits for both memberships—your voucher options are what change.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div key={plan.key} className="rounded-3xl border border-gray-200 bg-white shadow-sm p-7 md:p-8 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold">{plan.title}</h3>
                    <p className="mt-1 text-gray-700">{plan.bestFor}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-reluxe-primary">
                      {isJanuaryPromo ? `$${plan.januaryStartPrice}` : `$${plan.price}`}
                      <span className="text-base font-semibold text-gray-700"> / mo</span>
                    </div>
                    {isJanuaryPromo ? (
                      <p className="text-sm text-gray-600 mt-1">
                        Then <span className="font-semibold">{plan.priceDisplay}</span> in month 2
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{plan.priceDisplay}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-5">
                  <p className="font-bold">{plan.voucherLabel}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vouchers can be shared and banked for later use.
                  </p>

                  <ul className="mt-4 space-y-2">
                    {plan.voucherIncludes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-reluxe-primary mt-0.5" />
                        <span className="text-gray-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={plan.href}
                    className="inline-flex justify-center items-center rounded-full bg-reluxe-primary hover:bg-reluxe-primary-dark px-6 py-3 font-semibold text-white"
                  >
                    {isJanuaryPromo ? 'Start for $50' : 'Start Membership'}
                  </Link>
                  <Link
                    href="#faq"
                    className="inline-flex justify-center items-center rounded-full border border-gray-300 hover:bg-gray-50 px-6 py-3 font-semibold text-gray-900"
                  >
                    Read FAQs
                  </Link>
                </div>

                {isJanuaryPromo && (
                  <p className="mt-4 text-xs text-gray-500">
                    Promotional first month requires 3 payments. Early cancellation may result in a promotional balance charge.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ADDITIONAL BENEFITS */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold">VIP Benefits (included with both)</h2>
              <p className="mt-2 text-gray-700">
                As a VIP member, you get additional benefits & the best price on everything.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="h-5 w-5" />
              Perks apply while membership is active.
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-5">
            {additionalBenefits.map((b) => (
              <div key={b.title + b.desc} className="rounded-2xl border border-gray-200 p-6 text-center">
                <div className="text-3xl md:text-4xl font-extrabold">{b.title}</div>
                <div className="mt-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">{b.desc}</div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-gray-500">
            *Discounts apply to eligible services/products. Cannot be combined with other offers unless explicitly stated.
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold">Membership FAQs</h2>
            <p className="mt-3 text-gray-700">
              Quick answers to the most common questions about VIP membership at RELUXE.
            </p>
          </div>

          <div className="mt-10 max-w-3xl mx-auto divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-white overflow-hidden">
            {faqs.map((item) => (
              <Disclosure key={item.q}>
                {({ open }) => (
                  <div className="p-6">
                    <Disclosure.Button className="w-full flex items-center justify-between gap-4 text-left">
                      <span className="text-lg font-bold text-gray-900">{item.q}</span>
                      <ChevronDownIcon
                        className={`h-6 w-6 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="mt-3 text-gray-700 leading-relaxed">
                      {item.a}
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="rounded-3xl bg-gray-50 border border-gray-200 p-8 md:p-10 text-center">
          <h2 className="text-3xl font-extrabold">Ready to join VIP?</h2>
          <p className="mt-3 text-gray-700 max-w-2xl mx-auto">
            Start today and enjoy member pricing, VIP perks, and a monthly voucher you can use on the services you love most.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/buy-membership"
              className="inline-flex justify-center items-center rounded-full bg-reluxe-primary hover:bg-reluxe-primary-dark px-8 py-4 font-semibold text-white"
            >
              Start Your Membership
            </Link>
            <Link
              href="/consultations"
              className="inline-flex justify-center items-center rounded-full border border-gray-300 hover:bg-white px-8 py-4 font-semibold text-gray-900"
            >
              Not sure? Book a Consult
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Questions? Call <a className="font-semibold underline" href="tel:3177631142">317-763-1142</a> or reply to any text from us.
          </p>
        </section>
      </main>
    </div>
  )
}
