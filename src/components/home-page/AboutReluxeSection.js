
// src/components/home-page/AboutReluxe.js and import it.
import Link from 'next/link'

// --- About section component ---
function AboutReluxeSection() {
  return (
    <section id="about-reluxe" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      {/* Outer surface */}
      <div className="rounded-3xl border border-neutral-200 bg-white/70 shadow-sm backdrop-blur">
        <div className="grid grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: Story + value cards */}
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              About Reluxe
            </p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
              A med spa built on <span className="underline decoration-2 decoration-fuchsia-500 underline-offset-4">results, education,</span> and real relationships
            </h2>

            <p className="mt-4 text-neutral-700 leading-relaxed">
              We started RELUXE to bring boutique, personalized aesthetics to our communities of Westfield & Carmel without the
              “chain” feel. Our team pairs expert injectors, skilled aestheticans, advanced lasers, and honest guidance to help
              you look refreshed and feel confident. You’ll get clear treatment plans, transparent pricing,
              and a friendly team that remembers your goals.
            </p>

            {/* Quick facts / subtle badges */}
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Family-founded, not a chain', 'Two locations: Westfield & Carmel'],
                ['Education-first consults', 'Personalized, phased plans'],
              ].map((pair, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg aria-hidden="true" className="mt-1 h-5 w-5 flex-none" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" className="text-neutral-300" />
                    <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" className="text-fuchsia-600" />
                  </svg>
                  <div className="grid gap-1 text-sm text-neutral-700">
                    <span>{pair[0]}</span>
                    <span>{pair[1]}</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-white font-semibold
                           bg-gradient-to-r from-fuchsia-600 to-black"
              >
                Explore Services
              </Link>
              <Link
                href="/team"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold
                           text-neutral-900 border border-neutral-300 bg-white hover:bg-neutral-50"
              >
                Meet Our Team
              </Link>
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              Proudly serving Westfield, Carmel, North Indianapolis, Fishers, and Zionsville.
            </p>
          </div>

          {/* RIGHT: The RELUXE Difference panel */}
          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
              <p className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                The Reluxe Difference
              </p>
              <div className="mt-3 text-2xl font-extrabold text-neutral-900">Personal. Honest. Elevated.</div>

              <ul className="mt-6 space-y-4">
                {[
                  'We recommend what’s right for you, not everything we offer.',
                  'Subtle, natural outcomes with safety as the non-negotiable.',
                  'Clear next steps after every visit. No guesswork.',
                  'Options for every stage: quick refreshers to total skin plans.',
                  'Easy booking, transparent pricing, and memberships that make sense.',
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 h-5 w-5 text-fuchsia-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.39 4.84L20 8.27l-3.8 3.7.9 5.25L12 15.9 6.9 17.22l.9-5.25L4 8.27l5.61-1.43L12 2z" />
                    </svg>
                    <span className="text-sm text-neutral-800">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default AboutReluxeSection;