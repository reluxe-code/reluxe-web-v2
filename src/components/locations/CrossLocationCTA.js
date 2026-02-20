// src/components/locations/CrossLocationCTA.js

import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

const OTHER = {
  westfield: {
    key: 'carmel',
    name: 'RELUXE Med Spa Carmel',
    badge: 'Newest Location',
    address: '10485 N Pennsylvania St, Carmel, IN 46280',
    phone: '(317) 763-1142',
    note: 'Aesthetics + Wellness with House of Health',
    href: '/locations/carmel',
  },
  carmel: {
    key: 'westfield',
    name: 'RELUXE Med Spa Westfield',
    badge: 'Flagship',
    address: '514 E State Road 32, Westfield, IN 46074',
    phone: '(317) 763-1142',
    note: 'Full-service flagship — every device, every treatment',
    href: '/locations/westfield',
  },
}

export default function CrossLocationCTA({ locationSlug = 'westfield' }) {
  const slug = String(locationSlug).toLowerCase()
  const other = OTHER[slug]
  if (!other) return null

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-block text-[10px] tracking-widest uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-2">
                {other.badge}
              </span>
              <h3 className="text-xl font-bold">{other.name}</h3>
              <p className="text-gray-600 mt-1">{other.address}</p>
              <p className="text-gray-500 text-sm mt-0.5">{other.note}</p>
              {other.phone && (
                <p className="text-sm text-gray-600 mt-2">
                  <a href={`tel:${other.phone.replace(/\D/g, '')}`} className="underline">{other.phone}</a>
                </p>
              )}
            </div>
            <Link
              href={other.href}
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shrink-0"
            >
              Explore {other.key === 'westfield' ? 'Westfield' : 'Carmel'}
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
