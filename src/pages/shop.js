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
      </Head>
      <HeaderTwo />
      {/* 🔥 Static hero image full width, flush with header */}
      <section className="w-full">
        <img
          src="/images/page-banner/skincare-header.png" // 👈 Replace with your actual image path
          alt="Our Team"
          className="w-full h-[400px] object-cover"
        />
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
          <div className="bg-gray-100 rounded-xl p-6 shadow-lg text-center">
            <Image
              src="/images/shop/cs.png"
              alt="ColorScience"
              width={600}
              height={600}
              className="rounded-md mx-auto"
            />
            <h3 className="text-2xl font-semibold mt-4 mb-2">ColorScience</h3>
            <p className="text-gray-600 mb-4">Elevate your SPF and skin tone correction with ColorScience favorites.</p>
            <Link
              href="https://www.colorescience.com/reluxe-med-spa"
              target="_blank"
              className="inline-block bg-black text-white py-2 px-6 rounded-full font-semibold hover:bg-gray-800 transition">
              Buy Now
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
            <Image
              src="/images/payment/cherry.png"
              alt="Cherry Payment Plans"
              width={200}
              height={80}
              className="mx-auto"
            />
            <h3 className="text-xl font-semibold mt-4">Cherry Payment Plans</h3>
            <p className="text-gray-600 mt-2 mb-4">Split your treatments into monthly payments with 0% interest options.</p>
            <Link
              href="/shop/cherry"
              className="inline-block bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800 transition">
              Apply Now
            </Link>
          </div>

          {/* Spafinder */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Image
              src="/images/payment/spafinder.png"
              alt="Spafinder"
              width={200}
              height={80}
              className="mx-auto"
            />
            <h3 className="text-xl font-semibold mt-4">Spafinder Gift Cards</h3>
            <p className="text-gray-600 mt-2">Yes! We gladly accept Spafinder gift certificates.</p>
          </div>

          {/* RELUXE Gift Cards */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Image
              src="/images/payment/giftcard.png"
              alt="RELUXE Gift Card"
              width={200}
              height={80}
              className="mx-auto"
            />
            <h3 className="text-xl font-semibold mt-4">RELUXE Gift Cards</h3>
            <p className="text-gray-600 mt-2 mb-4">Give the gift of beauty. Purchase a digital RELUXE gift card instantly.</p>
            <Link
              href="/shop/gift-card"
              className="inline-block bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800 transition">
              Buy Gift Card
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
