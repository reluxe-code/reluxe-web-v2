// pages/affiliations.js
import Head from 'next/head'
import HeaderTwo from '../components/header/header-2'

export default function AffiliationsPage() {
  const updated = 'August 26, 2025'

  const categories = [
    {
      title: 'Injectables & Fillers',
      desc: 'We partner with the world’s most trusted pharmaceutical companies for neurotoxins and dermal fillers.',
      brands: [
        { name: 'Allergan', products: 'Botox®, Juvederm®' },
        { name: 'Galderma', products: 'Restylane®, Dysport®, Sculptra®' },
        { name: 'Evolus', products: 'Jeuveau®' },
        { name: 'Revance', products: 'Daxxify®, RHA® Collection' },
        { name: 'Revanesse', products: 'Versa®' },
      ],
    },
    {
      title: 'Devices & Lasers',
      desc: 'Our advanced platforms deliver industry-leading results in skin tightening, body contouring, and resurfacing.',
      brands: [
        { name: 'InMode', products: 'EvolveX, Morpheus8, Triton®, Solaria CO₂' },
        { name: 'Alma', products: 'Harmony XL Pro, Opus Plasma®' },
        { name: 'SkinPen', products: 'Microneedling — FDA-cleared device' },
      ],
    },
    {
      title: 'Professional Skincare',
      desc: 'We carry medical-grade skincare lines proven through science, research, and clinical results.',
      brands: [
        { name: 'Skinbetter Science', products: 'Award-winning anti-aging skincare' },
        { name: 'Colorescience', products: 'Mineral sunscreens & corrective skincare' },
        { name: 'SkinCeuticals', products: 'Antioxidants, corrective serums, peels' },
        { name: 'Universkin', products: 'Customizable prescriptive skincare' },
        { name: 'Hydrinity', products: 'Hydration-focused repair & recovery formulas' },
      ],
    },
  ]

  return (
    <>
      <Head>
        <title>Professional Affiliations | RELUXE Med Spa</title>
        <meta
          name="description"
          content="RELUXE Med Spa proudly partners with trusted medical and skincare brands including Allergan, Galderma, Evolus, InMode, Alma, Skinbetter Science, and more."
        />
        <link rel="canonical" href="https://www.reluxemedspa.com/affiliations" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Professional Affiliations
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-neutral-700">
            At RELUXE Med Spa, we only use trusted products, devices, and skincare lines from
            globally recognized brands. Our affiliations ensure patients receive the safest,
            most effective, and clinically proven treatments available.
          </p>
          <div className="mt-3 text-sm text-neutral-600"><strong>Last Updated:</strong> {updated}</div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {categories.map((cat) => (
          <section key={cat.title}>
            <h2 className="text-2xl font-bold text-neutral-900">{cat.title}</h2>
            <p className="mt-2 text-neutral-700">{cat.desc}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cat.brands.map((brand) => (
                <div
                  key={brand.name}
                  className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 hover:shadow-md transition"
                >
                  {/* Placeholder logo area — replace with brand logos if available */}
                  <div className="h-12 flex items-center justify-center text-neutral-400 border-b border-neutral-100 mb-4">
                    <span className="text-lg font-semibold">{brand.name}</span>
                  </div>
                  <p className="text-sm text-neutral-700">{brand.products}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  )
}
