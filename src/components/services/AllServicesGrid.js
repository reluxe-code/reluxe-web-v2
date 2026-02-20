// src/components/services/AllServicesGrid.js

import { useState } from 'react'
import Link from 'next/link'
import { serviceCategories } from '@/data/ServiceCategories'
import { isAvailableAtLocation } from '@/data/locationAvailability'
import {
  TAB_SLUGS, TAB_COLORS, SLUG_TO_TAB,
  getInfo, deduped, slugFromHref,
} from '@/data/serviceGridData'

function AllServiceCard({ item }) {
  const serviceSlug = slugFromHref(item.href)
  const info = getInfo(serviceSlug)
  const tab = SLUG_TO_TAB[serviceSlug] || 'General'
  const badgeColor = TAB_COLORS[tab] || 'bg-gray-100 text-gray-600'
  const atCarmel = isAvailableAtLocation(serviceSlug, 'carmel')

  return (
    <div className="group bg-white rounded-xl border border-gray-100 px-5 py-5 flex flex-col hover:shadow-lg hover:border-gray-200 transition-all duration-200">
      {/* Category badge */}
      <div className="mb-2">
        <span className={`inline-block text-[10px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${badgeColor}`}>
          {tab}
        </span>
      </div>

      {/* Service name */}
      <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">{item.title}</h3>

      {/* Location availability */}
      <div className="mb-3">
        {atCarmel ? (
          <span className="text-[10px] font-medium text-emerald-600">Carmel &amp; Westfield</span>
        ) : (
          <span className="text-[10px] font-medium text-amber-600">Westfield Only</span>
        )}
      </div>

      {/* Patient-focused description */}
      <p className="text-xs text-gray-600 leading-relaxed mb-3">{info.desc}</p>

      {/* Benefit pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {info.pills.map((pill) => (
          <span
            key={pill}
            className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100"
          >
            {pill}
          </span>
        ))}
      </div>

      {/* Ideal For callout */}
      <div className="border-l-2 border-violet-400 pl-2.5 py-1 mb-3 bg-violet-50/40 rounded-r-lg">
        <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide mb-0.5">Ideal For</p>
        <p className="text-[11px] text-gray-600 leading-snug">{info.bestFor}</p>
      </div>

      {/* Action buttons — per location */}
      <div className="mt-auto space-y-2">
        <div className="flex gap-2">
          {atCarmel && (
            <Link
              href={`/book/${serviceSlug}?loc=carmel`}
              className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition"
            >
              Book Carmel
            </Link>
          )}
          <Link
            href={`/book/${serviceSlug}?loc=westfield`}
            className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition"
          >
            Book Westfield
          </Link>
        </div>
        <Link
          href={`/services/${serviceSlug}`}
          className="inline-block text-[11px] font-semibold px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition"
        >
          Learn More
        </Link>
      </div>
    </div>
  )
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {tabs.map((tab) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}

export default function AllServicesGrid() {
  const unique = deduped(serviceCategories)
  const tabs = ['All', 'Injectables', 'Facials', 'Lasers', 'Wow Results', 'Massage']
  const [activeTab, setActiveTab] = useState('All')

  const filtered = activeTab === 'All'
    ? unique
    : unique.filter(item => {
        const s = slugFromHref(item.href)
        return (TAB_SLUGS[activeTab] || []).includes(s)
      })

  return (
    <section id="all-services" className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <span className="inline-block text-xs tracking-widest uppercase text-gray-500 mb-2">
            All Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            Browse Our{' '}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Full Menu
            </span>
          </h2>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            Every treatment offered across Westfield and Carmel. Filter by category to find what&apos;s right for you.
          </p>
        </div>

        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item, idx) => (
            <AllServiceCard key={idx} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
