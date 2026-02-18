import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../components/header/header-2'

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About RELUXE Med Spa | Luxury Aesthetics in Carmel & Westfield, IN</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel and Westfield is redefining luxury in aesthetics. Fun, fresh, bold — with expert injectors, advanced tech, and natural results you'll love."
        />
        <link rel="canonical" href="https://reluxemedspa.com/about" />
        <meta property="og:title" content="About RELUXE Med Spa | Luxury Aesthetics in Carmel & Westfield, IN" />
        <meta property="og:description" content="RELUXE Med Spa in Carmel and Westfield is redefining luxury in aesthetics. Fun, fresh, bold — with expert injectors, advanced tech, and natural results you'll love." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/about" />
        <meta property="og:image" content="https://reluxemedspa.com/images/about/hero-team.jpg" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About RELUXE Med Spa | Luxury Aesthetics in Carmel & Westfield, IN" />
        <meta name="twitter:description" content="RELUXE Med Spa in Carmel and Westfield is redefining luxury in aesthetics. Fun, fresh, bold — with expert injectors, advanced tech, and natural results you'll love." />
        <meta name="twitter:image" content="https://reluxemedspa.com/images/about/hero-team.jpg" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(70%_70%_at_50%_0%,rgba(168,85,247,0.25),transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left: Text */}
            <div className="lg:col-span-7 text-left">
                <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE • About Us</p>
                <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
                Redefining Luxury in Aesthetics
                </h1>
                <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
                Fun. Fresh. Bold. At RELUXE, luxury isn’t about being stuffy—it’s about results.  
                How you look. How you feel. That’s our focus across Carmel & Westfield.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                <a
                    href="/book/"
                    className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
                >
                    Book Now
                </a>
                <a
                    href="/services"
                    className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition"
                >
                    Explore Services
                </a>
                </div>
            </div>

            {/* Right: Image */}
            <div className="lg:col-span-5">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img
                    src="/images/about/hero-team.jpg"
                    alt="RELUXE Med Spa Carmel and Westfield team"
                    className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-xs text-neutral-200">The RELUXE team, redefining what luxury means in aesthetics.</p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </section>


      {/* Our Story */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <img
              src="/images/about/reluxe-team.jpg"
              alt="RELUXE Med Spa team"
              className="rounded-3xl border border-neutral-200 shadow-sm w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold">Our Story</h2>
            <p className="mt-4 text-neutral-700">
              Founded in Westfield and expanded to Carmel, RELUXE Med Spa was built by family with one vision:
              to create a luxury med spa experience that’s approachable, modern, and results-driven.
            </p>
            <p className="mt-4 text-neutral-700">
              Our team brings together nurse injectors, aestheticians, and specialists using the
              latest technology and advanced techniques to deliver natural outcomes you’ll love.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
        <section className="relative bg-neutral-50 py-20 overflow-hidden">
        {/* Subtle gradient background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(139,92,246,0.08),transparent_70%)]" />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            The RELUXE Philosophy
            </h2>
            <p className="mt-4 text-lg text-neutral-700 max-w-3xl mx-auto leading-relaxed">
            We’re <span className="font-semibold">Redefining Luxury</span>. 
            Not stuffy or tired—<span className="italic">fun, fresh, bold</span>.  
            Luxury is about <strong>results</strong> and how they make you feel.
            </p>

            {/* Pillars */}
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
            <PhilosophyPillar
                title="Results First"
                copy="Luxury means outcomes that boost your confidence. Natural, noticeable, never overdone."
                icon="✨"
            />
            <PhilosophyPillar
                title="Elevated Experience"
                copy="Expect the best—world-class tech, advanced techniques, and providers who raise the bar."
                icon="🌟"
            />
            <PhilosophyPillar
                title="Smart Education"
                copy="We do the nerdy science so you don’t have to—explaining simply, treating precisely, delivering results."
                icon="📚"
            />
            </div>

            {/* Closing Callout */}
            <div className="mt-16 max-w-3xl mx-auto">
            <blockquote className="relative rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
                <p className="text-xl md:text-2xl font-semibold text-neutral-900">
                “Let us show you what luxury really means. <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Experience the RELUXE difference</span>.”
                </p>
            </blockquote>
            </div>
        </div>
        </section>


      {/* Values / Highlights */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center">What Sets Us Apart</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ValueCard title="Natural Results" copy="We focus on enhancing—not changing—your features. Results that look like you, only refreshed." />
          <ValueCard title="Expert Team" copy="Nurse practitioners, RNs, and aestheticians with advanced training in injectables, facials, and lasers." />
          <ValueCard title="Cutting-Edge Tech" copy="Morpheus8, Opus, EvolveX, Alma Harmony—world-class devices for transformative results." />
          <ValueCard title="Education-First" copy="We explain every option clearly so you feel confident, never pressured." />
          <ValueCard title="Luxury Experience" copy="Modern, welcoming spaces in Carmel and Westfield designed for comfort and confidence." />
          <ValueCard title="Community Roots" copy="Proudly serving patients across Carmel, Westfield, Zionsville, and North Indianapolis." />
        </div>
      </section>

      {/* Links to Locations & Team */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/locations" className="group rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img src="/images/about/locations.jpg" alt="RELUXE Carmel and Westfield locations" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold">Our Locations</h3>
              <p className="mt-2 text-neutral-600">Two convenient destinations—Carmel & Westfield—same RELUXE difference.</p>
              <p className="mt-3 text-violet-600 font-semibold">Explore Locations →</p>
            </div>
          </Link>

          <Link href="/team" className="group rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img src="/images/about/team.jpg" alt="RELUXE Med Spa providers and staff" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold">Meet Our Team</h3>
              <p className="mt-2 text-neutral-600">Skilled providers and staff who bring expertise and care to every visit.</p>
              <p className="mt-3 text-violet-600 font-semibold">Meet the Team →</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold">Discover the RELUXE Difference</h2>
          <p className="mt-3 text-neutral-200">
            From Botox and fillers to facials, massage, and laser treatments—RELUXE is redefining what luxury means in aesthetics.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a href="/book/" className="px-6 py-3 rounded-2xl font-semibold text-white bg-white/20 ring-1 ring-white/30 hover:bg-white/30 transition">
              Book Now
            </a>
            <a href="/services" className="px-6 py-3 rounded-2xl font-semibold text-white bg-black/40 ring-1 ring-white/20 hover:bg-black/50 transition">
              Explore Services
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

// --- Components ---
function ValueCard({ title, copy }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-bold">{title}</h4>
      <p className="mt-2 text-neutral-700">{copy}</p>
    </div>
  )
}

function PhilosophyPillar({ title, copy, icon }) {
  return (
    <div className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h4 className="text-lg font-bold">{title}</h4>
      </div>
      <p className="mt-3 text-neutral-700">{copy}</p>
    </div>
  )
}

