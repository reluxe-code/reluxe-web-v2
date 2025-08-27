import Head from 'next/head'
import HeaderTwo from '../components/header/header-2'

export default function SpaFinderPage() {
  return (
    <>
      <Head>
        <title>SpaFinder Gift Cards Accepted | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa proudly accepts SpaFinder gift cards in Carmel and Westfield. Use SpaFinder for facials, injectables, massage, and more."
        />
        <link rel="canonical" href="https://reluxemedspa.com/spafinder" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">SpaFinder Gift Cards</h1>
          <p className="mt-4 text-lg text-neutral-300">
            Yes—we proudly accept SpaFinder gift cards at RELUXE Med Spa in Carmel and Westfield.  
            Treat yourself or someone special to any of our services with ease.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <img
              src="/images/spafinder-card.jpg"
              alt="SpaFinder gift card accepted at RELUXE Med Spa"
              className="rounded-3xl border border-neutral-200 shadow-sm w-full object-cover"
            />
          </div>
          <div className="lg:col-span-6">
            <h2 className="text-2xl font-extrabold">How It Works</h2>
            <p className="mt-3 text-neutral-700">
              Simply bring your SpaFinder gift card to your appointment and we’ll apply it toward your total.
              You can use SpaFinder for <strong>any RELUXE service</strong>—from injectables and facials to massage and advanced laser treatments.
            </p>

            <h3 className="mt-6 text-xl font-bold">Why SpaFinder?</h3>
            <ul className="mt-3 space-y-2 text-neutral-700 list-disc pl-5">
              <li>One card, endless options—perfect for gifting self-care</li>
              <li>Accepted at RELUXE Carmel & Westfield locations</li>
              <li>Use for memberships, packages, or single treatments</li>
              <li>No extra fees—apply the full value directly to your visit</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-neutral-50 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold">Ready to Book with SpaFinder?</h2>
          <p className="mt-3 text-neutral-600">
            Whether it’s a gift or your own treat, RELUXE makes it easy to redeem SpaFinder for the services you love.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/book/"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
