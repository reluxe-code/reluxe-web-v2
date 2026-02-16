// components/home-page/RotatingCTABlock.js
import { useEffect, useState } from 'react'

const ctas = [
  {
    title: 'Become a Member',
    benefits: [
      'Save on every treatment',
      'Free monthly facials or massages',
      'Exclusive member perks & priority booking',
    ],
    buttonLabel: 'View Memberships',
    buttonLink: '/memberships',
  },
  {
    title: 'Book a Skin Consultation',
    benefits: [
      'Complimentary 3D skin analysis',
      'Get a personalized treatment plan',
      '15% off skincare the day of your consult',
    ],
    buttonLabel: 'Book Now',
    buttonLink: '/book/consult',
  },
  {
    title: 'Refer a Friend',
    benefits: [
      '$25 for you, $25 for them',
      'Unlimited referrals',
      'Earn exclusive rewards & gifts',
    ],
    buttonLabel: 'Refer Now',
    buttonLink: '#',
  },
]

export default function RotatingCTABlock() {
  const [cta, setCta] = useState(null)

  useEffect(() => {
    const random = Math.floor(Math.random() * ctas.length)
    setCta(ctas[random])
  }, [])

  if (!cta) return null

  return (
    <section className="bg-black text-white py-20">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">{cta.title}</h2>
        <ul className="mb-8 space-y-2 text-lg">
          {cta.benefits.map((benefit, i) => (
            <li key={i}>✅ {benefit}</li>
          ))}
        </ul>
        <a
          href={cta.buttonLink}
          className="inline-block bg-white text-black px-6 py-3 font-semibold rounded hover:bg-gray-100 transition"
        >
          {cta.buttonLabel}
        </a>
      </div>
    </section>
  )
}
