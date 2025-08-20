// src/pages/before-after.js
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

export default function Results() {
  const [filter, setFilter] = useState('All');

  const filteredRecords = beforeAfterRecords.filter((record) => {
    const category = SERVICE_CATEGORIES.includes(record.service)
      ? record.service
      : 'Other';
    return filter === 'All' || category === filter;
  });

  return (
    <>
      <Head>
        <title>Our Results: Before & After | RELUXE Med Spa</title>
        <meta
          name="description"
          content="See our transformative before & after cases at RELUXE Med Spa."
        />
      </Head>

      <HeaderTwo />

      <section className="w-full">
        <img
          src="/images/page-banner/skincare-header.png"
          alt="Our Results"
          className="w-full h-[200px] object-cover"
        />
      </section>

      <main className="container mx-auto p-6 pt-10">
        <h1 className="text-4xl font-bold mb-8 text-center">See Our Amazing Results: Treatments Before & After</h1>
        <p className="text-center text-gray-700 mb-8 px-40">
          At RELUXE Med Spa, our expert providers deliver exceptional results across
          a range of treatments. Explore before & after cases by service to find
          your perfect transformation.
        </p>
        </main>

      <section className="container mx-auto">
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
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <Image
                src={record.beforeafterImage}
                alt={`${record.service} result`}
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
      </section>
    </>
  );
}
