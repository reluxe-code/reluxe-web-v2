// components/WhatsIncluded.js
import { useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

const TIERS = [
  {
    key: 'standard',
    label: 'Standard VIP',
    inclusions: [
      '1 Standard Service Credit',
      '10% Off All Services',
      '10% Off Packages',
      '15% Off Products',
      '$10/unit Botox & Jeuveau',
      '$4/unit Dysport',
      '$50 off syringes of filler'
    ]
  },
  {
    key: 'premium',
    label: 'Premium VIP',
    inclusions: [
      '1 Premium Service Credit',
      '20 Units of Jeuveau',
      '20 Units of Botox',
      '50 Units of Dysport',
      '$10/unit Additional Neurotoxin',
      'RELUXE Hydrafacial',
      'RELUXE Glo2Facial',
      '120-Minute Massage',
      'Custom Chemical Peel',
      'IV Session (Coming Soon)',
      '1 Premium = 2 Standard Credits',
      'All Standard Tier Perks'
    ]
  }
]

export default function WhatsIncluded() {
  const [active, setActive] = useState('standard')
  const tier = TIERS.find(t => t.key === active)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">What’s Included</h2>

        {/* Toggle Buttons */}
         <div className="inline-flex bg-gray-200 rounded-full p-1 mb-12 overflow-hidden">
           {TIERS.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`
                px-6 py-2 rounded-full transition
                ${active === t.key
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-600 hover:text-black'}
              `}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Inclusion List */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {tier.inclusions.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1"/>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
