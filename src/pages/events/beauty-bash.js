// pages/events/beauty-bash.js
import Head from 'next/head'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'

// ---- Galleries you can extend easily ---------------------------------------
const GALLERY_2025 = [
  { src: '/images/events/beauty-bash/2025/1.jpg', alt: 'Beauty Bash 2025 main stage', caption: 'Main stage demos • Carmel & Westfield community' },
  { src: '/images/events/beauty-bash/2025/2.jpg', alt: 'Live skincare demos', caption: 'Live skincare + device demos with our providers' },
  { src: '/images/events/beauty-bash/2025/3.jpg', alt: 'Guest stations and sampling', caption: 'Guest stations, sampling, and prizes' },
  { src: '/images/events/beauty-bash/2025/4.jpg', alt: 'Before-and-after wall', caption: 'Before & After inspiration wall' },
  { src: '/images/events/beauty-bash/2025/5.jpg', alt: 'Partner brands table', caption: 'Partner brands on-site (skincare & wellness)' },
  { src: '/images/events/beauty-bash/2025/6.jpg', alt: 'Photo moment', caption: 'Photo moment—bring a friend!' },
]

const GALLERY_2024 = [
  { src: '/images/events/beauty-bash/2024/1.jpg', alt: 'Beauty Bash 2024 crowd', caption: 'Standing-room crowd for skincare Q&A' },
  { src: '/images/events/beauty-bash/2024/2.jpg', alt: 'Hands-on experiences', caption: 'Hands-on experiences and product pairings' },
  { src: '/images/events/beauty-bash/2024/3.jpg', alt: 'Giveaway winners', caption: 'Giveaway winners throughout the night' },
  { src: '/images/events/beauty-bash/2024/4.jpg', alt: 'Partner demos', caption: 'Partner demos from top brands' },
  { src: '/images/events/beauty-bash/2024/5.jpg', alt: 'Treat stations', caption: 'Treat stations + exclusive event bundles' },
  { src: '/images/events/beauty-bash/2024/6.jpg', alt: 'Community vibes', caption: 'Great vibes, better glow' },
]

export default function BeautyBashPage() {
  // Simple JSON-LD for an event series page (no specific dates fabricated)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Beauty Bash | RELUXE Med Spa (Carmel & Westfield)',
    url: 'https://reluxemedspa.com/events/beauty-bash',
    description:
      'RELUXE Beauty Bash: our signature event with live demos, giveaways, and one-night-only bundles in Carmel & Westfield, IN.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beauty Bash 2025' },
        { '@type': 'ListItem', position: 2, name: 'Beauty Bash 2024' },
      ],
    },
  }

  return (
    <>
      <Head>
        <title>Beauty Bash | Carmel & Westfield, IN | RELUXE Med Spa</title>
        <meta
          name="description"
          content="RELUXE Beauty Bash: live demos, giveaways, bundles, and community. Explore 2024 & 2025 galleries and get updates for the next event."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events/beauty-bash" />
        <meta property="og:title" content="RELUXE Beauty Bash" />
        <meta property="og:description" content="Our signature event with live demos, prizes, and one-night-only savings." />
        <meta property="og:image" content="/images/events/beauty-bash/og-beauty-bash.jpg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <p className="text-[11px] tracking-widest uppercase text-white/60">RELUXE • Events</p>
              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">RELUXE Beauty Bash</h1>
              <p className="mt-4 text-neutral-300 text-lg">
                Our signature celebration of beauty, skincare, and community—featuring live demos, giveaways, and one-night-only bundles. Hosted in Carmel & Westfield, IN.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition">
                  Book a Consult
                </a>
                <a href="/join-texts" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition">
                  Get Event Updates
                </a>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/events/beauty-bash/hero.jpg" alt="Beauty Bash at RELUXE" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">What is the Beauty Bash?</h2>
            <p className="mt-3 text-neutral-700">
              A high-energy evening where we open the doors for demos, pro skincare coaching, and event-only savings. Meet our team, explore treatment pairings, and preview what’s next at RELUXE.
            </p>
            <ul className="mt-5 space-y-2 text-neutral-700">
              <li>• Live treatment & skincare demos</li>
              <li>• Exclusive bundles & giveaways</li>
              <li>• Partner brand pop-ups</li>
              <li>• Photo ops & community vibes</li>
            </ul>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-extrabold tracking-tight">Be First to Know</h3>
              <p className="mt-2 text-neutral-700">We release tickets, bundles, and schedules to our text list first.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="/join-texts" className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold text-white bg-neutral-900 hover:bg-black">Join Text List</a>
                <a href="/events" className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold ring-1 ring-neutral-300 hover:bg-neutral-50">See All Events</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2025 Gallery */}
      <YearGallery year="2025" items={GALLERY_2025} subtitle="Highlights from our most recent Beauty Bash" />

      {/* 2024 Gallery */}
      <YearGallery year="2024" items={GALLERY_2024} subtitle="Moments from last year’s event" />

      {/* CTA */}
      <section className="relative bg-neutral-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">See You at the Next Beauty Bash</h3>
          <p className="mt-3 text-neutral-700">Grab a friend and come glow with us—tickets and details drop to our text list first.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="/join-texts" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900 transition">
              Get Event Updates
            </a>
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ring-1 ring-neutral-300 hover:bg-neutral-50">
              Book a Consult
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

function YearGallery({ year, items = [], subtitle }) {
  return (
    <section id={year} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Beauty Bash {year}</h2>
        {subtitle && <p className="mt-3 text-neutral-600">{subtitle}</p>}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((img, i) => (
          <figure key={i} className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={img.src} alt={img.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <figcaption className="p-4 text-sm text-neutral-700">{img.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
