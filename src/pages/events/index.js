// pages/events/index.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import EventInquiryForm from '@/components/events/EventInquiryForm'

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
        <meta property="og:title" content="Event & Special Occasion Prep | RELUXE Med Spa" />
        <meta property="og:description" content="Look your best for weddings, prom, galas, holidays, graduations & more at RELUXE in Carmel & Westfield." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/events" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Event & Occasion Prep | RELUXE Med Spa" />
        <meta name="twitter:description" content="Wedding, prom, gala, and event prep treatments in Carmel & Westfield, IN." />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-white">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <p className="text-xs tracking-widest uppercase text-neutral-400">
                RELUXE &bull; Events
              </p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
                Event &amp; Special Occasion Prep
              </h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed max-w-xl">
                Look your best for Carmel &amp; Westfield&apos;s most memorable events&mdash;weddings, prom, galas, holidays, graduations, and more.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-400">
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Weddings</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Prom</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Galas</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Holidays</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Graduations</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Photoshoots</span>
              </div>
              <div className="mt-6 text-sm text-neutral-400">
                Serving <strong className="text-neutral-300">Carmel</strong>, <strong className="text-neutral-300">Westfield</strong>, Zionsville, and North Indianapolis.
              </div>
            </div>

            <div className="lg:col-span-5">
              <EventInquiryForm />
            </div>
          </div>
        </div>
      </section>

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
