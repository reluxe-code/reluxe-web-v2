// src/pages/memberships.js
import { useState } from 'react'
import HeaderTwo from '@/components/header/header-2'
import Image from 'next/image'
import Link from 'next/link'
import { Tab } from '@headlessui/react'
import { CheckCircleIcon, CalendarIcon, GiftIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import WhatsIncluded from '@/components/WhatsIncluded'

const premierPlans = [
  {
    title: 'Essential Membership',
    price: '$100/mo',
    features: [
      'One $125 credit toward any service',
      '10% off à la carte',
      'Priority booking',
      'Member-only specials',
    ],
    href: '/buy/essential',
  },
  {
    title: 'Elite Membership',
    price: '$200/mo',
    features: [
      'Two $150 credits toward any service',
      '15% off à la carte',
      'Quarterly complimentary facial',
      'VIP event access',
    ],
    href: '/buy/elite',
  },
]

const timelineSteps = [
  {
    icon: <CalendarIcon className="w-6 h-6 text-reluxe-primary" />,
    title: 'Month 1',
    text: 'Use your first service credit',
  },
  {
    icon: <CalendarIcon className="w-6 h-6 text-reluxe-primary" />,
    title: 'Month 3',
    text: 'Quarterly facial (Elite only)',
  },
  {
    icon: <GiftIcon className="w-6 h-6 text-reluxe-primary" />,
    title: 'Birthday',
    text: 'Enjoy a birthday bonus credit',
  },
  {
    icon: <UserGroupIcon className="w-6 h-6 text-reluxe-primary" />,
    title: 'Referral',
    text: 'Earn credits when friends join',
  },
]

export default function MembershipsPage() {
  const [openTab, setOpenTab] = useState(0)

  return (
    <div className="bg-gray-50 min-h-screen">
      <HeaderTwo />
      {/* Hero */}
      <section
        className="relative h-80 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/page-banner/memberships-header.png')` }}
      >
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Memberships & Packages</h1>
          <p className="mt-2 text-lg text-gray-200 max-w-2xl">
            Join a premier plan for exclusive savings, priority booking, and VIP perks.
          </p>
        </div>
      </section>
      <main className="py-16 px-4 max-w-7xl mx-auto space-y-24">

        {/* Premier Plans */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Premier Memberships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {premierPlans.map(plan => (
              <div key={plan.title} className="bg-white rounded-xl shadow-lg p-8 flex flex-col">
                <h3 className="text-2xl font-semibold">{plan.title}</h3>
                <p className="mt-1 text-xl text-reluxe-primary font-bold">{plan.price}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-reluxe-primary mt-1" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="mt-6 inline-block bg-reluxe-primary hover:bg-reluxe-primary-dark text-white font-semibold py-3 px-6 rounded-full text-center">
                  Start {plan.title}

                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* What’s Included (Tabs) */}
        <WhatsIncluded />

        {/* Final CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save?</h2>
          <p className="mb-6 text-gray-700 max-w-xl mx-auto">
            Start your membership today and unlock best-in-class savings on every visit.
          </p>
          <Link
            href="/buy-membership"
            className="inline-block bg-reluxe-primary hover:bg-reluxe-primary-dark text-black font-semibold py-4 px-8 rounded-full shadow-lg">
            
              Start Your Membership
            
          </Link>
        </section>
      </main>
    </div>
  );
}
