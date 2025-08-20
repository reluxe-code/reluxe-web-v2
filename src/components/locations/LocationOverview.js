// src/components/locations/LocationOverview.js

import { FiHeart, FiZap, FiMapPin, FiUsers, FiCheckCircle } from 'react-icons/fi'

export default function LocationOverview({ id = 'overview', locationSlug = '', title = '', phone }) {
  const slug = String(locationSlug).toLowerCase()

  const common = {
    familyOwned: 'Family-owned & local. We live here too—no faceless corporation.',
    promise: 'Education & safety first, with honest plans and natural-looking results.',
    ctas: [
      { href: '/services', label: 'Explore Services', primary: true },
      { href: `/team?location=${slug}`, label: 'Meet the Team' },
      { href: phone ? `tel:${phone}` : '#', label: 'Call Us' },
    ]
  }

  const copy = {
    westfield: {
      eyebrow: 'RELUXE Westfield',
      headline: 'Our Flagship Westfield Location on State Road 32',
      sub:
        'Opened in 2023, our Westfield flagship has served thousands of happy patients—quick tox touch-ups, glow-up skin plans, facial balancing, and more.',
      highlights: [
        { icon: <FiZap className="h-5 w-5" />,   title: 'What We’re Known For', text: 'Injectables (Botox®, Jeuveau®, fillers), facials, IPL, laser hair removal, collagen-stimulating treatments, body contouring, and massage.' },
        { icon: <FiMapPin className="h-5 w-5" />, title: 'Easy to Find',          text: 'Right on US-32 in the heart of Westfield—next to favorites like Birdies.' },
        { icon: <FiUsers className="h-5 w-5" />,  title: 'Trusted Team',           text: 'NP & RN injectors, licensed aestheticians, and massage therapists.' },
      ],
      audience: 'Proudly serving Westfield, Carmel, Fishers, Zionsville, and North Indianapolis.'
    },
    carmel: {
      eyebrow: 'RELUXE Carmel',
      headline: 'Aesthetics, Elevated',
      sub:
        'Our newest studio in Carmel pairs RELUXE results with wellness-forward options through our collaboration with House of Health—perfect for recovery and skin health.',
      highlights: [
        { icon: <FiZap className="h-5 w-5" />,   title: 'Core RELUXE Services',   text: 'Injectables, facials, lasers, body contouring—delivered by our NP/RN injectors and licensed aestheticians.' },
        { icon: <FiHeart className="h-5 w-5" />, title: 'Wellness Add-Ons',       text: 'Ask about IV therapy, hyperbaric, ozone, and red light therapy available through our partners.' },
        { icon: <FiUsers className="h-5 w-5" />, title: 'One Roof, Smarter Care', text: 'Plans that align aesthetics and wellness—thoughtful, holistic care without the stuffy clinic feel.' },
      ],
      audience: 'Serving Carmel, North Indianapolis, Fishers, Zionsville, and nearby neighborhoods.'
    }
  }

  const c = slug === 'carmel' ? copy.carmel : copy.westfield

  return (
    <section id={id} className="relative overflow-hidden">
      {/* subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-azure/50 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="mb-6">
          <span className="inline-block text-xs tracking-widest uppercase text-gray-500">{c.eyebrow}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">{c.headline}</h2>
          <p className="text-lg text-gray-600 mt-3 max-w-3xl">{c.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {c.highlights.map((h, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full bg-azure/70 p-2">{h.icon}</div>
                <h3 className="font-semibold">{h.title}</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{h.text}</p>
            </div>
          ))}
        </div>

        {/* The RELUXE Way */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <FiCheckCircle className="h-5 w-5 text-reluxeGold" />
            <p className="font-semibold">The RELUXE Way</p>
          </div>
          <p className="text-gray-600">{common.familyOwned}</p>
          <p className="text-gray-600">{common.promise}</p>
          <p className="text-gray-600 mt-2">{c.audience}</p>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            {common.ctas.map((cta, idx) => (
              <a
                key={idx}
                href={cta.href}
                className={[
                  'px-5 py-2 rounded-md text-sm font-semibold',
                  cta.primary
                    ? 'bg-black text-white hover:opacity-90'
                    : 'border border-black text-black hover:bg-black hover:text-white transition-colors'
                ].join(' ')}
              >
                {cta.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
