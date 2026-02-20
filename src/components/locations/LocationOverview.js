// src/components/locations/LocationOverview.js

import { FiHeart, FiZap, FiMapPin, FiUsers, FiCheckCircle, FiSun, FiActivity } from 'react-icons/fi'

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
      eyebrow: 'Flagship Location',
      headline: 'The Full RELUXE Experience — Every Treatment, One Roof',
      sub:
        'Opened in 2023, our Westfield flagship has served thousands of patients with everything from quick tox touch-ups to full facial balancing plans, laser resurfacing, body contouring, massage, and infrared salt sauna. This is where every device, every modality, and every provider comes together.',
      highlights: [
        { icon: <FiZap className="h-5 w-5" />,   title: 'Complete Service Menu', text: 'Injectables, facials, IPL, laser hair removal, Morpheus8, CO₂ resurfacing, EvolveX body contouring, HydraFacial, massage, and infrared salt sauna — all under one roof.' },
        { icon: <FiMapPin className="h-5 w-5" />, title: 'Heart of Westfield',    text: 'Right on US-32 near Grand Park and Birdies — convenient for Westfield, Carmel, Fishers, Zionsville, and North Indianapolis.' },
        { icon: <FiUsers className="h-5 w-5" />,  title: 'Full Provider Team',     text: 'NP & RN injectors, licensed aestheticians, and massage therapists — our largest team with the most flexibility for scheduling.' },
      ],
      audience: 'Proudly serving Westfield, Carmel, Fishers, Zionsville, and North Indianapolis.'
    },
    carmel: {
      eyebrow: 'Newest Location',
      headline: 'Aesthetics Meets Wellness — Smarter Care in Carmel',
      sub:
        'Our Carmel location pairs core RELUXE aesthetics with the wellness-forward offerings of House of Health — think injectables and facials alongside IVs, hyperbaric, and red light therapy. It\'s a newer, intimate space designed for thoughtful, holistic care without the stuffy clinic feel.',
      highlights: [
        { icon: <FiZap className="h-5 w-5" />,      title: 'Core Aesthetic Services', text: 'Injectables (Botox®, Jeuveau®, fillers), Glo2Facial, SkinPen, Morpheus8, IPL, laser hair removal, peels, and more — delivered by experienced NP/RN injectors and licensed aestheticians.' },
        { icon: <FiActivity className="h-5 w-5" />,  title: 'Wellness Add-Ons',       text: 'Through House of Health: IV therapy, hyperbaric chambers, ozone, and red light therapy — complement your aesthetic treatments with recovery and wellness.' },
        { icon: <FiSun className="h-5 w-5" />,       title: 'Boutique Feel, Real Results', text: 'A newer, intimate space with early morning availability (8 AM slots) and more one-on-one time with your provider.' },
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
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition"
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
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
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
