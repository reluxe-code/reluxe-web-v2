// src/pages/results.js
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { beforeAfterRecords } from '@/data/beforeAfterData';
import HeaderTwo from '../components/header/header-2';

const SERVICE_CATEGORIES = [
  'All',
  'Botox',
  'Filler',
  'ClearLift',
  'Morpheus8',
  'Skinpen',
  'Other',
];

const FREE_PREVIEW_COUNT = 3;

export default function Results() {
  const [filter, setFilter] = useState('All');
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredRecords = beforeAfterRecords.filter((record) => {
    const category = SERVICE_CATEGORIES.includes(record.service)
      ? record.service
      : 'Other';
    return filter === 'All' || category === filter;
  });

  const visibleRecords = unlocked
    ? filteredRecords
    : filteredRecords.slice(0, FREE_PREVIEW_COUNT);
  const gatedCount = filteredRecords.length - FREE_PREVIEW_COUNT;

  async function handleUnlock(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          email,
          phone: '',
          message: 'Before/after gallery unlock request',
          location: 'results-page',
          pageUrl: '/results',
        }),
      });
    } catch {
      // still unlock even if API fails
    }
    setUnlocked(true);
    setSubmitting(false);
  }

  return (
    <>
      <Head>
        <title>Before & After Results | Botox, Filler, Morpheus8 | RELUXE Med Spa</title>
        <meta
          name="description"
          content="See real before & after results from Botox, filler, Morpheus8, SkinPen, and laser treatments at RELUXE Med Spa in Westfield & Carmel, Indiana."
        />
        <link rel="canonical" href="https://reluxemedspa.com/results" />
        <meta property="og:title" content="Before & After Results | RELUXE Med Spa" />
        <meta property="og:description" content="Real patient transformations from our expert providers in Westfield & Carmel, IN." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/results" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reluxemedspa.com' },
                { '@type': 'ListItem', position: 2, name: 'Before & After Results', item: 'https://reluxemedspa.com/results' },
              ],
            }),
          }}
        />
      </Head>

      <HeaderTwo />

      <section className="w-full">
        <img
          src="/images/page-banner/skincare-header.png"
          alt="Before and after treatment results at RELUXE Med Spa"
          className="w-full h-[200px] object-cover"
        />
      </section>

      <main className="container mx-auto p-6 pt-10">
        <h1 className="text-4xl font-bold mb-8 text-center">See Our Results: Before & After</h1>
        <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
          At RELUXE Med Spa, our expert providers deliver exceptional results across
          a range of treatments. Explore before & after cases by service to find
          your perfect transformation.
        </p>
      </main>

      <section className="container mx-auto pb-16">
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${filter === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visibleRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <Image
                src={record.beforeafterImage}
                alt={`${record.service} before and after result at RELUXE Med Spa`}
                width={400}
                height={300}
                className="w-full h-[200px] object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-1">{record.service}</h2>
                <p className="text-gray-600 text-sm mb-2">
                  {record.date} by {record.provider}
                </p>
                <p className="text-gray-800 mb-4">{record.description}</p>

                {record.caseStudyUrl && (
                  <Link
                    href={record.caseStudyUrl}
                    className="inline-block text-black font-medium hover:underline"
                  >
                    See the Transformation
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Email capture gate for remaining results */}
        {!unlocked && gatedCount > 0 && (
          <div className="mt-10 mx-auto max-w-xl text-center">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8">
              <h3 className="text-2xl font-bold">
                See {gatedCount} more result{gatedCount !== 1 ? 's' : ''}
              </h3>
              <p className="mt-2 text-gray-600">
                Enter your email to unlock our full before & after gallery.
              </p>
              <form onSubmit={handleUnlock} className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-black text-white px-6 py-3 text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Unlocking...' : 'Unlock All Results'}
                </button>
              </form>
              <p className="mt-3 text-xs text-gray-500">
                No spam. We'll only send you relevant skincare tips and offers.
              </p>
            </div>
          </div>
        )}

        {/* Booking CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/book/consult"
            className="inline-flex items-center gap-2 rounded-full bg-black text-white px-8 py-4 font-semibold hover:bg-neutral-800 transition"
          >
            Book Your Free Consultation
          </Link>
        </div>
      </section>
    </>
  );
}
