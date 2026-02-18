// pages/black-friday.js
// Archived Black Friday / Cyber Monday page
// Shows a friendly message and directs guests to current monthly deals.

import Head from 'next/head'
import HeaderTwo from '../components/header/header-2'

export default function BlackFridayArchivePage() {
  return (
    <>
      <Head>
        <title>Black Friday & Cyber Monday | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Our Black Friday & Cyber Monday event has ended. See the latest monthly deals and specials at RELUXE Med Spa."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://reluxemedspa.com/black-friday" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Black Friday & Cyber Monday | RELUXE Med Spa"
        />
        <meta
          property="og:description"
          content="Our Black Friday & Cyber Monday sale is over for this year. Click through to see current monthly deals and specials."
        />
        <meta
          property="og:image"
          content="https://reluxemedspa.com/images/promo/bf-flash.png"
        />
        <meta
          property="og:image:secure_url"
          content="https://reluxemedspa.com/images/promo/bf-flash.png"
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1080" />
        <meta property="og:image:height" content="1080" />
        <meta property="og:url" content="https://reluxemedspa.com/black-friday" />
        <meta property="og:type" content="website" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Black Friday & Cyber Monday | RELUXE Med Spa"
        />
        <meta
          name="twitter:description"
          content="Our big Black Friday & Cyber Monday sale is over for this year. Tap to see the current monthly deals at RELUXE."
        />
        <meta
          name="twitter:image"
          content="https://reluxemedspa.com/images/promo/bf-flash.png"
        />
      </Head>

      <HeaderTwo />

      <main className="min-h-screen bg-neutral-950 text-white">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <p className="text-[11px] tracking-widest uppercase text-white/60 font-semibold">
              RELUXE • Black Friday &amp; Cyber Monday
            </p>

            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Our Black Friday &amp; Cyber Monday Sale is Over 🎉
            </h1>

            <p className="mt-4 text-base md:text-lg text-white/80 max-w-2xl">
              Thank you for an incredible Black Friday &amp; Cyber Week!{' '}
              <span className="font-semibold">
                The 2025 sale is now closed, and deals on this page are no longer active.
              </span>{' '}
              But the savings don’t stop—check out our latest monthly specials, flash offers, and
              member perks anytime.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://reluxemedspa.com/deals/"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
              >
                View Current Monthly Deals →
              </a>
              <a
                href="/book"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm md:text-base font-semibold text-white/90 ring-1 ring-white/20 hover:ring-white/40 hover:bg-white/5 transition"
              >
                Book an Appointment
              </a>
            </div>

            <p className="mt-4 text-[12px] text-white/50 max-w-md">
              Bookmark this page and check back next year for our biggest Black Friday &amp; Cyber
              Monday savings of the year.
            </p>
          </div>
        </section>

        {/* SIMPLE BODY SECTION */}
        <section className="bg-neutral-50 text-neutral-900">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="rounded-2xl bg-white border border-neutral-200 shadow-sm px-6 py-8 md:px-8 md:py-10">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                Looking for Deals Right Now?
              </h2>
              <p className="mt-3 text-sm md:text-base text-neutral-700 leading-relaxed">
                Our Black Friday &amp; Cyber Monday promos run once a year, but we keep fresh
                offers rotating all year long—on injectables, facials, laser treatments, memberships,
                and more.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li>• Monthly specials curated by our providers</li>
                <li>• Occasional flash sales on select services</li>
                <li>• Extra perks for RELUXE members</li>
              </ul>
              <div className="mt-6">
                <a
                  href="https://reluxemedspa.com/deals/"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-black transition"
                >
                  See Today&apos;s Deals →
                </a>
              </div>
            </div>

            <p className="mt-6 text-[11px] text-neutral-500 text-center leading-relaxed">
              Note: All Black Friday &amp; Cyber Monday 2025 offers have ended and cannot be
              extended or retroactively applied. For any questions about existing pre-purchased
              packages, please contact our front desk team.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
