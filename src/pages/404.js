// src/pages/404.js
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import HeaderTwo from '../components/header/header-2'

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Page Not Found • RELUXE</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="We couldn't find that page." />
      </Head>

      {/* Site header (same as other pages) */}
      <HeaderTwo />

      {/* Page body */}
      <main className="relative">
        {/* Top spacer so content isn't tight to header */}
        <div className="h-6 sm:h-8" />

        <section className="py-10 sm:py-14">
          <div className="custom-container container">
            <div className="mx-auto max-w-3xl text-center px-4">
              <p className="text-sm uppercase tracking-wider text-neutral-500">Error 404</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-semibold">
                We can’t find that page.
              </h1>
              <p className="mt-3 text-neutral-600">
                The link might be broken or the page may have moved. Try the buttons below or search for what you need.
              </p>

              {/* Quick actions */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/book"
                  className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white font-semibold hover:bg-neutral-900 transition"
                >
                  Book Now
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center rounded-md border px-4 py-2 font-medium hover:bg-gray-100 transition"
                >
                  Browse Services
                </Link>
                <Link
                  href="/deals"
                  className="inline-flex items-center rounded-md border px-4 py-2 font-medium hover:bg-gray-100 transition"
                >
                  Current Deals
                </Link>
                <Link
                  href="/memberships"
                  className="inline-flex items-center rounded-md border px-4 py-2 font-medium hover:bg-gray-100 transition"
                >
                  Memberships
                </Link>
              </div>

              {/* On-page search */}
              <form action="/search" method="GET" className="mt-8 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <input
                  name="q"
                  type="search"
                  inputMode="search"
                  placeholder="Search treatments, concerns…"
                  className="w-full rounded-md border px-4 py-3 text-base outline-none focus:ring-2 focus:ring-violet-500"
                  defaultValue={decodeURIComponent(router.asPath || '').replace(/^\/+/, '')}
                />
                <button
                  type="submit"
                  className="rounded-md bg-black px-6 py-3 text-white font-semibold hover:bg-neutral-900 transition"
                >
                  Search
                </button>
              </form>

              {/* Helpful links */}
              <div className="mt-10 grid sm:grid-cols-2 gap-4 text-left">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">Popular Destinations</h3>
                  <ul className="space-y-1">
                    <li><Link className="underline hover:no-underline" href="/locations/westfield">Westfield</Link></li>
                    <li><Link className="underline hover:no-underline" href="/locations/carmel">Carmel</Link></li>
                    <li><Link className="underline hover:no-underline" href="/services">All Services</Link></li>
                    <li><Link className="underline hover:no-underline" href="/conditions">What We Treat</Link></li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">Need a person?</h3>
                  <ul className="space-y-1">
                    <li><Link className="underline hover:no-underline" href="/team">Meet the Team</Link></li>
                    <li><Link className="underline hover:no-underline" href="/contact">Contact Us</Link></li>
                    <li><a className="underline hover:no-underline" href="tel:+13177631142">Call (317) 763-1142</a></li>
                    <li><a className="underline hover:no-underline" href="sms:+13177631142">Text (317) 763-1142</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom spacer to breathe above the global footer */}
        <div className="h-10" />
      </main>
    </>
  )
}
