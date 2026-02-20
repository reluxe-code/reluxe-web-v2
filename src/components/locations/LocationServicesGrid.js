// src/components/locations/LocationServicesGrid.js

import { useState } from 'react'
import Link from 'next/link'
import { serviceCategories } from '@/data/ServiceCategories'
import { isAvailableAtLocation } from '@/data/locationAvailability'
import {
  TAB_SLUGS, FEATURED_PICKS, TAB_COLORS, SLUG_TO_TAB,
  getInfo, deduped, slugFromHref,
} from '@/data/serviceGridData'

function ServiceCard({ item, locationSlug, muted }) {
  const serviceSlug = slugFromHref(item.href)
  const info = getInfo(serviceSlug)
  const tab = SLUG_TO_TAB[serviceSlug] || 'Featured'
  const badgeColor = TAB_COLORS[tab] || 'bg-gray-100 text-gray-600'
  const targetCity = muted ? 'westfield' : locationSlug

  return (
    <div className={`group bg-white rounded-xl border border-gray-100 px-4 py-4 flex flex-col hover:shadow-lg hover:border-gray-200 transition-all duration-200 ${muted ? 'opacity-70 hover:opacity-100' : ''}`}>
      {/* Category badge */}
      <div className="mb-3">
        <span className={`inline-block text-[10px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${badgeColor}`}>
          {tab}
        </span>
      </div>

      {/* Service name */}
      <h3 className="text-base font-bold text-gray-900 leading-snug mb-1.5">{item.title}</h3>

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

      {/* Best For callout */}
      <div className="border-l-2 border-violet-400 pl-2.5 py-1 mb-3 bg-violet-50/40 rounded-r-lg">
        <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide mb-0.5">Ideal For</p>
        <p className="text-[11px] text-gray-600 leading-snug">{info.bestFor}</p>
      </div>

      {/* Action buttons */}
      <div className="mt-auto flex gap-2">
        <Link
          href={`/book/${serviceSlug}?loc=${targetCity}`}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition"
        >
          Book Now
        </Link>
        <Link
          href={`/services/${serviceSlug}/${targetCity}`}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition"
        >
          Learn More
        </Link>
      </div>
    </div>
  )
}

/* ── Tab bar ── */
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

export default function LocationServicesGrid({ locationSlug = 'westfield' }) {
  const slug = String(locationSlug).toLowerCase()
  const unique = deduped(serviceCategories)

  // All services available at this location
  const available = unique.filter(item =>
    isAvailableAtLocation(slugFromHref(item.href), slug)
  )

  // Build tab list — hide Massage on Carmel since it's not available there
  const allTabs = ['Featured', 'Injectables', 'Facials', 'Lasers', 'Wow Results', 'Massage']
  const tabs = allTabs.filter(tab => {
    if (tab === 'Featured') return true
    const tabSlugs = TAB_SLUGS[tab] || []
    return tabSlugs.some(s => available.find(item => slugFromHref(item.href) === s))
  })

  const [activeTab, setActiveTab] = useState('Featured')

  // Filter cards by active tab
  const filtered = activeTab === 'Featured'
    ? available.filter(item => {
        const s = slugFromHref(item.href)
        return Object.values(FEATURED_PICKS).includes(s)
      })
    : available.filter(item => {
        const s = slugFromHref(item.href)
        return (TAB_SLUGS[activeTab] || []).includes(s)
      })

  // Count Westfield-only services for the Carmel callout
  const westfieldOnlyCount = slug === 'carmel'
    ? unique.filter(item => !isAvailableAtLocation(slugFromHref(item.href), slug)).length
    : 0

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <span className="inline-block text-xs tracking-widest uppercase text-gray-500 mb-2">
            {slug === 'carmel' ? 'Carmel' : 'Westfield'} Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            Services Available at{' '}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {slug === 'carmel' ? 'Carmel' : 'Westfield'}
            </span>
          </h2>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            Every treatment below is offered at our {slug === 'carmel' ? 'Carmel' : 'Westfield'} location.
          </p>
        </div>

        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item, idx) => (
            <ServiceCard key={idx} item={item} locationSlug={slug} />
          ))}
        </div>

      </div>
    </section>
  )
}
