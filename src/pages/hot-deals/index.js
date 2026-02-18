// src/pages/offers/index.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '@/components/header/header-2'
import { OFFERS, isActive } from '@/data/offers'

// Build-time filter + serialization (avoid leaking functions/dates)
export async function getStaticProps() {
  const now = new Date()
  let live = []
  try {
    const all = Array.isArray(OFFERS) ? OFFERS : []
    live = all
      .filter(o => {
        try { return isActive(o, now) } catch { return false }
      })
      .map(o => ({
        slug: o.slug || '',
        title: o.title || '',
        shortTitle: o.shortTitle || '',
        overview: o.overview || '',
        locations: Array.isArray(o.locations) ? o.locations : [],
        hero: {
          image: o?.hero?.image || o?.image || '/images/page-banner/skincare-header.png',
          headline: o?.hero?.headline || o.title || '',
          subhead: o?.hero?.subhead || '',
        },
      }))
      .filter(o => o.slug) // only routable
  } catch (e) {
    // swallow errors so build doesn't crash hard; page renders "no offers"
    live = []
  }

  return {
    props: { live },
    revalidate: 300, // refresh list periodically
  }
}

export default function OffersIndex({ live = [] }) {
  return (
    <>
      <Head>
        <title>Med Spa Offers & Specials | RELUXE Med Spa Westfield & Carmel, IN</title>
        <meta name="description" content="Current offers and specials at RELUXE Med Spa. Save on Botox, facials, laser treatments, body contouring & more in Carmel and Westfield, Indiana." />
        <link rel="canonical" href="https://reluxemedspa.com/hot-deals" />
        <meta property="og:title" content="Offers & Specials | RELUXE Med Spa" />
        <meta property="og:description" content="Limited-time offers on Botox, facials, laser treatments & more at RELUXE in Carmel & Westfield." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/hot-deals" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Offers & Specials | RELUXE Med Spa" />
        <meta name="twitter:description" content="Current offers and specials on Botox, facials, laser treatments & more in Carmel & Westfield." />
      </Head>

      <HeaderTwo />

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-semibold mb-6">Current Offers</h1>

          {live.length === 0 ? (
            <div className="rounded-xl border p-6 text-neutral-600">
              No active offers right now. Check back soon, or see our{' '}
              <Link href="/services" className="underline">services</Link>.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {live.map(o => (
                <Link
                  key={o.slug}
                  href={`/hot-deals/${o.slug}`}
                  className="group rounded-xl border overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-[4/3] bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={o.hero.image}
                      alt={o.title || 'Offer'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-neutral-500">
                      {o.shortTitle || o.title}
                    </div>
                    <div className="text-neutral-900 font-semibold">
                      {o.hero.headline || o.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
