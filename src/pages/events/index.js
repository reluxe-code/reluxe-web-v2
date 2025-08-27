// pages/events/index.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'

export default function EventsHubPage() {
  const updated = 'August 26, 2025'

  const cards = [
    {
      name: 'Wedding Prep',
      href: '/wedding',
      desc: 'Carmel & Westfield wedding skincare timelines, injectables, lasers, and packages for brides, grooms, and parties.',
      image: '/images/events/wedding.jpg',
      cta: 'Plan Wedding Glow',
    },
    {
      name: 'Proms & Formals',
      href: '/events/proms-formals',
      desc: 'Prom, homecoming, and formals. Gentle facials, dermaplane, hydration, and acne management for photo-ready skin.',
      image: '/images/events/prom.jpg',
      cta: 'Prep for Prom',
    },
    {
      name: 'Red Carpet & Galas',
      href: '/events/red-carpet-galas',
      desc: 'Black-tie, galas, and red-carpet nights. Smooth, glow, and refine with no-downtime treatments.',
      image: '/images/events/gala.jpg',
      cta: 'Own the Spotlight',
    },
    {
      name: 'Local Indy Events',
      href: '/events/local-indy-events',
      desc: 'Zoobilation, Rev, and Indy’s biggest events. Glow plans that account for summer heat and long nights.',
      image: '/images/events/redcarpet.jpg',
      cta: 'Plan for Indy’s Big Nights',
    },
    {
      name: 'Bachelorette Parties',
      href: '/events/bachelorette-parties',
      desc: 'Private group facials, tox parties, and pre-night-out glow packages for bridesmaids and friends.',
      image: '/images/events/bachelorette.jpg',
      cta: 'Book a Party',
    },
    {
      name: 'Graduation Prep',
      href: '/events/graduation-prep',
      desc: 'High school & college grads: acne management, facials, and subtle glow for photos and ceremonies.',
      image: '/images/events/graduation.jpg',
      cta: 'Get Graduation Ready',
    },
    {
      name: 'Photoshoot Prep',
      href: '/events/photoshoot-prep',
      desc: 'Headshots, engagement photos, branding shoots. Camera-friendly facials and injectables timed perfectly.',
      image: '/images/events/photoshoot.jpg',
      cta: 'Prep for Photos',
    },
    {
      name: 'Holiday & NYE Prep',
      href: '/events/holiday-prep',
      desc: 'Office parties, family photos, and New Year’s Eve celebrations. Stress-free skin plans to keep you glowing.',
      image: '/images/events/holiday.jpg',
      cta: 'Plan Holiday Glow',
    },
    {
      name: 'Pageant & Performance',
      href: '/events/pageant-performance',
      desc: 'Dance, cheer, theater, bodybuilding. Tailored glow + tone plans for stage confidence.',
      image: '/images/events/pag.jpg',
      cta: 'Prep for Stage',
    },
    {
      name: 'Corporate & Speaking',
      href: '/events/corporate-prep',
      desc: 'Conference-ready skin: injectables, facials, and stress resets to look sharp under bright lights.',
      image: '/images/events/corporate.jpg',
      cta: 'Prep for Corporate',
    },
    {
      name: 'Fitness & Competition Prep',
      href: '/events/fitness-prep',
      desc: 'EvolveX body contouring, laser hair, and skin tightening to highlight physique & confidence.',
      image: '/images/events/fitness.jpg',
      cta: 'Prep for Fitness',
    },
  ]

  return (
    <>
      <Head>
        <title>Events & Special Occasion Prep | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Discover RELUXE event prep: weddings, prom, red carpet, Zoobilation, Rev, holidays, graduations, photoshoots, pageants, corporate events, and fitness competitions."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events" />
      </Head>

      <HeaderTwo />

      {/* Header */}
      <header className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">Event & Wedding Prep</h1>
          <p className="mt-3 text-neutral-700 max-w-3xl mx-auto">
            Look your best for Carmel & Westfield’s most memorable events—weddings, prom, Zoobilation, galas, holidays, graduations, and more.
          </p>
        </div>
      </header>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.name}
              href={card.href}
              className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img src={card.image} alt={card.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold tracking-tight">{card.name}</h2>
                <p className="mt-2 text-neutral-700">{card.desc}</p>
                <div className="mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-neutral-900 shadow hover:opacity-95 transition">
                  {card.cta}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
