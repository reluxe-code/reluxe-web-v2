// pages/shop.js
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import HeaderTwo from '@/components/header/header-2'

export default function ShopPage() {
  return (
    <>
      <Head>
        <title>Shop Skincare & Payments | RELUXE Med Spa</title>
        <meta name="description" content="Shop professional skincare from RELUXE Med Spa. Browse medical-grade products, make payments, and manage your account. Serving Westfield & Carmel, IN." />
        <link rel="canonical" href="https://reluxemedspa.com/shop" />
      </Head>
      <HeaderTwo />
      {/* 🔥 Static hero image full width, flush with header */}
      <section className="w-full">
        <img
          src="/images/page-banner/skincare-header.png"
          alt="Shop Professional Skincare"
          className="w-full h-[400px] object-cover"
        />
      </section>

      {/* Colorescience Anniversary Sale Banner */}
      <section className="py-10 px-6" style={{ background: 'linear-gradient(135deg, #FDF6F0 0%, #FFF5EE 50%, #FDF6F0 100%)' }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#CF7155' }}>Limited Time</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#CF7155', fontStyle: 'italic', fontFamily: 'Playfair Display, serif' }}>Colorescience Anniversary Sale</h2>
            <p className="mt-2 text-gray-600">20% off sitewide &mdash; no exclusions. Free shipping on all orders. March 5&ndash;22.</p>
          </div>
          <Link
            href="https://colorescience.com/reluxe-med-spa"
            target="_blank"
            className="inline-block text-white py-3 px-8 rounded-full font-semibold text-center whitespace-nowrap hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg, #CF7155, #B85A40)' }}>
            Shop the Sale &rarr;
          </Link>
        </div>
      </section>

      {/* Skincare Shopping Section */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Buy Professional Skincare</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* SkinBetter */}
          <div className="bg-gray-100 rounded-xl p-6 shadow-lg text-center">
            <Image
              src="/images/shop/skinbetter.jpeg"
              alt="SkinBetter Science"
              width={600}
              height={600}
              className="rounded-md mx-auto"
            />
            <h3 className="text-2xl font-semibold mt-4 mb-2">SkinBetter Science</h3>
            <p className="text-gray-600 mb-4">Shop SkinBetter directly with RELUXE — results-driven skincare backed by science.</p>
            <Link
              href="https://skinbetter.pro/reluxemedspa"
              target="_blank"
              className="inline-block bg-black text-white py-2 px-6 rounded-full font-semibold hover:bg-gray-800 transition">
              Buy Now
            </Link>
          </div>

          {/* ColorScience */}
          <div className="bg-gray-100 rounded-xl p-6 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #CF7155, #B85A40)' }}>20% OFF</div>
            <Image
              src="/images/shop/cs.png"
              alt="Colorescience"
              width={600}
              height={600}
              className="rounded-md mx-auto"
            />
            <h3 className="text-2xl font-semibold mt-4 mb-2">Colorescience</h3>
            <p className="text-gray-600 mb-4">Anniversary Sale: 20% off sitewide + free shipping. No exclusions. March 5–22.</p>
            <Link
              href="https://colorescience.com/reluxe-med-spa"
              target="_blank"
              className="inline-block text-white py-2 px-6 rounded-full font-semibold hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #CF7155, #B85A40)' }}>
              Shop the Sale
            </Link>
          </div>
        </div>
      </section>
      {/* Ways to Pay */}
      <section className="py-20 px-6 bg-azure text-gray-900">
        <h2 className="text-3xl font-bold text-center mb-12">Ways to Pay at RELUXE</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Cherry */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <h3 className="text-xl font-semibold mt-4">Cherry Payment Plans</h3>
            <p className="text-gray-600 mt-2 mb-4">Split your treatments into monthly payments with 0% interest options.</p>
            <Link
              href="https://pay.withcherry.com/reluxe-med-spa?utm_source=practice&utm_medium=website&m=20441"
              className="inline-block bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800 transition">
              Apply Now
            </Link>
          </div>

          {/* Spafinder */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <h3 className="text-xl font-semibold mt-4">Spafinder Gift Cards</h3>
            <p className="text-gray-600 mt-2">Yes! We gladly accept Spafinder gift certificates.</p>
          </div>

          {/* RELUXE Gift Cards */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <h3 className="text-xl font-semibold mt-4">RELUXE Gift Cards</h3>
            <p className="text-gray-600 mt-2 mb-4">Give the gift of beauty. Purchase a digital RELUXE gift card instantly.</p>
            <Link
              href="https://blvd.me/reluxemedspa/gift-cards"
              className="inline-block bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800 transition">
              Buy Gift Card
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
