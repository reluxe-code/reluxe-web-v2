// /templates/OfferLandingPage.jsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function Countdown({ endDate }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!endDate) return;
    const target = new Date(endDate).getTime();
    const iv = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        clearInterval(iv);
        setLabel('⏰ Offer expired');
      } else {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setLabel(`⏳ Expires in ${d}d ${h}h ${m}m`);
      }
    }, 60000);
    return () => clearInterval(iv);
  }, [endDate]);
  return <p className="text-red-600 font-semibold">{label}</p>;
}

export default function OfferLandingPage({ offer }) {
  const now = Date.now();
  const startOk = !offer.startDate || now >= new Date(offer.startDate).getTime();
  const endOk   = !offer.endDate   || now <= new Date(offer.endDate).getTime();

  if (!startOk) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">This offer isn’t live yet—check back soon!</p>
      </div>
    );
  }
  if (!endOk) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Sorry, this offer has ended.</p>
      </div>
    );
  }

  return (
    <main className="font-sans">
      {/* —— Hero / Above the fold —— */}
      <section
        className="relative flex items-center justify-center text-center text-white"
        style={{ height: '75vh' }}
      >
        <Image
          src={offer.imageUrl}
          alt={offer.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{offer.title}</h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl mb-6 whitespace-pre-line">
            {offer.description}
          </p>
          {offer.endDate && <Countdown endDate={offer.endDate} />}
          <Link href={offer.ctaUrl} legacyBehavior>
            <a className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition mt-4">
              {offer.ctaText}
            </a>
          </Link>
        </div>
      </section>

      {/* —— Features / Benefits —— */}
      {offer.features?.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold">What You Get</h2>
          </div>
          <ul className="max-w-2xl mx-auto grid gap-6 md:grid-cols-2">
            {offer.features.map((f, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="text-green-500 text-xl mt-1">✔️</span>
                <span className="text-lg">{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* —— Repeat CTA —— */}
      <section className="py-12 text-center">
        <Link href={offer.ctaUrl} legacyBehavior>
          <a className="inline-block bg-secondary hover:bg-secondary-dark text-white font-semibold py-3 px-10 rounded-lg transition">
            {offer.ctaText}
          </a>
        </Link>
      </section>
    </main>
  );
}
