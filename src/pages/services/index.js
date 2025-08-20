// src/pages/services/index.js
import Head from 'next/head'
import HeaderTwo from '@/components/header/header-2'
import { serviceCategories } from '@/data/ServiceCategories'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { servicesData } from '@/data/servicePricing'   // <-- updated path

// ---- helpers for price display ----
const fmtUSD = (n) => {
  const x = Number(n);
  if (Number.isNaN(x)) return '—';
  // Show cents for small/decimal prices like 4.5 => $4.50, otherwise $1,400
  return x < 10 && x % 1 !== 0 ? `$${x.toFixed(2)}` : `$${x.toLocaleString()}`;
};
const displayPrice = (s) => {
  if (s.priceMin && s.priceMax) {
    return `${fmtUSD(s.priceMin)}–${fmtUSD(s.priceMax)}${s.unit ? `/${s.unit}` : ''}`
  }
  if (typeof s.price === 'number') {
    return `${fmtUSD(s.price)}${s.unit ? `/${s.unit}` : ''}`
  }
  return 'Varies'
}

// ---- optional Service + Offer JSON-LD for a few flagship items ----
const buildServiceOfferSchema = (items = []) => {
  if (!Array.isArray(items) || !items.length) return null
  const graph = items.slice(0, 8).map((s) => {
    const node = {
      '@type': 'Service',
      name: s.name,
      provider: { '@type': 'MedicalBusiness', name: 'RELUXE Med Spa' },
      url: `https://reluxemedspa.com/services/${s.slug}`
    }
    if (s.priceMin && s.priceMax) {
      node.offers = {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: s.priceMin,
        highPrice: s.priceMax
      }
    } else if (typeof s.price === 'number') {
      node.offers = {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: s.price
      }
    }
    return node
  })
  return { '@context': 'https://schema.org', '@graph': graph }
}

export default function ServiceCategoriesPage() {
  // -------- JSON-LD SCHEMA (catalog + faq + breadcrumbs) --------
  const offerCatalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://reluxemedspa.com#org',
    name: 'RELUXE Med Spa',
    url: 'https://reluxemedspa.com',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'RELUXE Services',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Injectables',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Botox' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Jeuveau' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Daxxify' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dysport' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dermal Fillers' } }
          ]
        },
        {
          '@type': 'OfferCatalog',
          name: 'Facials & Skin Health',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SkinPen Microneedling' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'HydraFacial' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Chemical Peels' } }
          ]
        },
        {
          '@type': 'OfferCatalog',
          name: 'Lasers & RF',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Laser Hair Removal' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'IPL Photofacial' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Morpheus8 RF Microneedling' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Opus Plasma' } }
          ]
        },
        {
          '@type': 'OfferCatalog',
          name: 'Massage',
          itemListElement: [{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Therapeutic Massage' } }]
        }
      ]
    }
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I choose between Botox and Jeuveau?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Both are neuromodulators used to soften expression lines. Choice depends on goals and treatment plan—our injectors will recommend the best option during your consult.'
        }
      },
      {
        '@type': 'Question',
        name: 'What’s the downtime for SkinPen microneedling?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most patients are pink for 24–48 hours with light flaking. Makeup is typically fine the next day; always follow your provider’s aftercare.'
        }
      },
      {
        '@type': 'Question',
        name: 'How many laser hair removal sessions will I need?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A series is typical—many see results within 6–8 sessions depending on area, hair, and skin type.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do you serve both Westfield and Carmel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes—RELUXE operates in Westfield and Carmel, serving Zionsville, Fishers, and North Indianapolis.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do you offer memberships or financing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes—ask about RELUXE memberships and Cherry financing to spread out payments for your treatment plan.'
        }
      }
    ]
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reluxemedspa.com/' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://reluxemedspa.com/services' }
    ]
  }

  const serviceOfferSchema = buildServiceOfferSchema(servicesData)

  const subNav = [
    { label: 'Categories', href: '#categories' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Med Spa Services & Pricing | Botox, Facials, Lasers | RELUXE Westfield & Carmel</title>
        <meta
          name="description"
          content="Explore RELUXE Med Spa services and pricing in Westfield & Carmel: Botox & Jeuveau, facials, microneedling, laser hair removal, IPL, and skin tightening. Book online."
        />
        <link rel="canonical" href="https://reluxemedspa.com/services" />
        <meta property="og:title" content="RELUXE Med Spa Services & Pricing — Westfield & Carmel" />
        <meta property="og:description" content="Botox, facials, lasers, microneedling & more. Browse categories and view pricing." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/services" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        {serviceOfferSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceOfferSchema) }} />
        )}
      </Head>

      <HeaderTwo />

      {/* HERO */}
      <header className="relative bg-[url('/images/hero/team.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Med Spa Services in Westfield & Carmel
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Botox® & Jeuveau® · Facials & SkinPen® · Laser Hair Removal · IPL Photofacial · Skin Tightening
          </p>

          {/* Overview panel – popup style */}
            <div className="relative mt-8 mx-auto max-w-5xl">
              {/* soft glow accents */}
              <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-600/25 blur-3xl" />
              <div className="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="overflow-hidden rounded-3xl bg-neutral-950/90 text-white ring-1 ring-white/10 shadow-2xl backdrop-blur-md">
                {/* header line (small) */}
                <div className="px-6 pt-7 md:px-8">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-white/60">
                    SERVICES OVERVIEW
                  </p>
                </div>

                {/* body */}
                <div className="px-6 pb-7 pt-3 md:px-8">
                  <p className="text-base md:text-lg leading-relaxed text-white/80">
                    Discover RELUXE Med Spa’s full menu of results-driven treatments in
                    <strong> Westfield</strong> and <strong> Carmel</strong>. From
                    confidence-boosting injectables to glow-building facials, microneedling,
                    and advanced laser &amp; RF, our licensed team designs plans that look
                    natural and feel authentically you. Explore categories below, preview
                    pricing, or book a consult to build your personalized routine.
                  </p>

                  {/* location chips */}
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm">
                    <span className="px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/25">
                      Westfield
                    </span>
                    <span className="px-3 py-1 rounded-full bg-sky-400/15 text-sky-200 ring-1 ring-sky-400/25">
                      Carmel
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/25">
                      Zionsville
                    </span>
                    <span className="px-3 py-1 rounded-full bg-fuchsia-400/15 text-fuchsia-200 ring-1 ring-fuchsia-400/25">
                      North Indy
                    </span>
                  </div>

                  {/* actions */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/book/consult/"
                      className="inline-flex items-center justify-center rounded-2xl
                                bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500
                                px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20
                                transition hover:brightness-[1.05] active:scale-[.99]"
                    >
                      Book a Consult
                    </Link>

                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center rounded-2xl
                                bg-white/10 px-6 py-4 text-sm font-semibold text-white
                                ring-1 ring-white/15 hover:bg-white/15"
                    >
                      View Full Pricing
                    </Link>
                  </div>
                </div>

                {/* bottom accent bar */}
                <div className="h-[4px] w-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 opacity-70" />
              </div>
            </div>

        </div>
      </header>

      <main id="main" className="py-12 px-4 max-w-7xl mx-auto">
        {/* Category grid */}
        <section id="categories" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="sr-only">Service Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {serviceCategories.map((cat) => (
              <Link href={cat.href} key={cat.title} className="group block space-y-4" aria-label={`View ${cat.title} services`}>
                <div
                  className={`relative w-full pt-[100%] overflow-hidden rounded-lg shadow-lg transition-transform group-hover:scale-[1.02] ${
                    cat.featured ? 'ring-2 ring-reluxe-primary' : 'ring-1 ring-gray-200'
                  }`}
                >
                  {cat.featured && (
                    <span className="absolute top-2 left-2 bg-reluxe-primary text-white text-xs px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  <Image
                    src={cat.image}
                    alt={`${cat.title} in Westfield & Carmel - RELUXE Med Spa`}
                    layout="fill"
                    objectFit="cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800 group-hover:text-reluxe-primary transition">
                    {cat.title}
                  </h3>
                  <CalendarIcon className="w-6 h-6 text-reluxe-primary" aria-hidden="true" />
                </div>
                {cat.teaser && <p className="text-sm text-neutral-600">{cat.teaser}</p>}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-right">
            <Link href="/pricing" className="text-sm text-neutral-700 hover:text-black underline underline-offset-4">
              View full pricing →
            </Link>
          </div>
        </section>

        {/* Pricing preview */}
        <section id="pricing" className="mt-16">
          <h2 className="text-2xl font-semibold text-neutral-900">Popular Pricing</h2>
          <p className="mt-2 text-neutral-700">
            A few favorites — see full menu for complete pricing and packages.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(servicesData) ? servicesData.slice(0, 9) : []).map((s, i) => (
              <div key={i} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-neutral-900">{s.name}</div>
                    {s.description && (
                      <div className="text-xs text-neutral-600 mt-1">{s.description}</div>
                    )}
                    {s.note && <div className="text-[11px] text-neutral-500 mt-1">{s.note}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-neutral-900 font-semibold text-center">{displayPrice(s)}</div>
                    {typeof s.memberPrice === 'number' && (
                      <div className="mt-1 inline-flex flex-col items-end rounded-md px-2 py-1 bg-emerald-50 text-emerald-700 leading-tight">
                        <div className="text-xs text-center">
                          <span className="font-semibold">
                            Member:<br />
                            {fmtUSD(s.memberPrice)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/pricing" className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800">
              View Full Pricing
            </Link>
            <Link href="/memberships" className="rounded-lg bg-white ring-1 ring-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">
              Membership & Financing
            </Link>
          </div>
        </section>

        {/* Local intent / service area */}
        <section className="mt-16 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-neutral-900">Serving Westfield, Carmel & Nearby</h2>
          <p className="mt-2 text-neutral-700">
            Book at the location that works best for you—our team serves <strong>Westfield</strong>, <strong>Carmel</strong>, and surrounding areas like <strong>Zionsville</strong>, <strong>Fishers</strong>, and <strong>North Indianapolis</strong>.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/locations/westfield" className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800">Westfield Location</Link>
            <Link href="/locations/carmel" className="rounded-lg bg-white ring-1 ring-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">Carmel Location</Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-16">
          <h2 className="text-2xl font-semibold text-neutral-900">Services FAQ</h2>
          <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <dt className="font-medium text-neutral-900">How do I choose between Botox and Jeuveau?</dt>
              <dd className="mt-2 text-neutral-700">Both soften expression lines; your injector will recommend the right option during your consult based on your goals.</dd>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <dt className="font-medium text-neutral-900">What’s the downtime for SkinPen microneedling?</dt>
              <dd className="mt-2 text-neutral-700">Most patients are pink for 24–48 hours with light flaking; makeup is typically fine the next day.</dd>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <dt className="font-medium text-neutral-900">How many laser hair removal sessions will I need?</dt>
              <dd className="mt-2 text-neutral-700">A series is typical—many see results within 6–8 sessions depending on area, hair, and skin type.</dd>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <dt className="font-medium text-neutral-900">Do you serve both Westfield and Carmel?</dt>
              <dd className="mt-2 text-neutral-700">Yes—book at either location; we also serve Zionsville, Fishers, and North Indy.</dd>
            </div>
          </dl>
        </section>

        {/* Final CTA */}
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-neutral-900">Ready to start?</h2>
          <p className="mt-2 text-neutral-700">Schedule a consultation and we’ll build a treatment plan tailored to you.</p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/book" className="inline-flex items-center justify-center rounded-xl bg-black text-white px-5 py-3 font-semibold hover:bg-neutral-800">
              Book Now
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-xl bg-white text-black px-5 py-3 font-semibold ring-1 ring-black/10 hover:bg-neutral-50">
              View Full Pricing
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
