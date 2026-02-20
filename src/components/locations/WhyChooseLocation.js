// src/components/locations/WhyChooseLocation.js

import { FiStar, FiHeart, FiMapPin, FiSun, FiClock, FiUsers } from 'react-icons/fi'

const CONTENT = {
  westfield: {
    badge: 'Flagship',
    headline: 'Why Westfield',
    sub: 'Our original location — every service, every device, under one roof.',
    points: [
      {
        icon: <FiStar className="h-5 w-5" />,
        title: 'Full Device Suite',
        text: 'Every laser, RF, and body-contouring device we own lives here — including EvolveX, CO₂, VascuPen, and HydraFacial.',
      },
      {
        icon: <FiHeart className="h-5 w-5" />,
        title: 'Massage & Salt Sauna',
        text: 'Therapeutic massage and infrared salt sauna sessions available to complement your aesthetics routine.',
      },
      {
        icon: <FiMapPin className="h-5 w-5" />,
        title: 'Easy Access off US-32',
        text: 'Right in the heart of Westfield near Grand Park and Birdies — convenient for the whole north-side corridor.',
      },
    ],
  },
  carmel: {
    badge: 'Newest Location',
    headline: 'Why Carmel',
    sub: 'Aesthetics meets wellness — our newer, intimate spa with House of Health.',
    points: [
      {
        icon: <FiSun className="h-5 w-5" />,
        title: 'Wellness-Forward',
        text: 'Pair your RELUXE treatments with House of Health offerings — IVs, hyperbaric, red light therapy — all under one roof.',
      },
      {
        icon: <FiClock className="h-5 w-5" />,
        title: 'Early Appointments',
        text: 'Select 8 AM time slots available — ideal for before-work treatments without rearranging your day.',
      },
      {
        icon: <FiUsers className="h-5 w-5" />,
        title: 'Intimate, Personal Care',
        text: 'A newer, boutique-feel space that means shorter waits and more one-on-one time with your provider.',
      },
    ],
  },
}

export default function WhyChooseLocation({ locationSlug = 'westfield' }) {
  const slug = String(locationSlug).toLowerCase()
  const c = CONTENT[slug] || CONTENT.westfield

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <span className="inline-block text-xs tracking-widest uppercase text-gray-500 mb-2">
            {c.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">{c.headline}</h2>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">{c.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {c.points.map((pt, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full bg-violet-100 text-violet-600 p-2.5">{pt.icon}</div>
                <h3 className="font-semibold text-lg">{pt.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{pt.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
