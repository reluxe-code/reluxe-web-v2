// src/pages/team/index.js

import { gql } from '@apollo/client'
import client from '@/lib/apollo'
import Head from 'next/head'
import HeaderTwo from '@/components/header/header-2'
import StaffCard from '@/components/team/StaffCard'
import { GET_STAFF_LIST } from '@/lib/queries/getStaffList'

// --- Helpers ---------------------------------------------------------------

/**
 * Decide which category a staff member belongs to based SOLELY on staff_title.
 * Case-insensitive, trimmed, and resilient to minor wording differences.
 */
function pickCategory(staff) {
  const titleField = String(staff?.staff_title || '').toLowerCase().trim()

  // Injectors
  if (
    titleField.includes('injector') ||
    titleField.includes('nurse injector') ||
    titleField.includes('np') ||
    titleField.includes('nurse practitioner') ||
    titleField.includes('rn') ||
    titleField.includes('pa')
  ) {
    return 'Injectors'
  }

  // Aestheticians
  if (
    titleField.includes('aesthetician') ||
    titleField.includes('esthetician') ||
    titleField.includes('lead aesthetician') ||
    titleField.includes('medical aesthetician')
  ) {
    return 'Aestheticians'
  }

  // Support Staff (front-desk, ops, leadership, etc.)
  if (
    titleField.includes('front desk') ||
    titleField.includes('coordinator') ||
    titleField.includes('support') ||
    titleField.includes('manager') ||
    titleField.includes('director') ||
    titleField.includes('admin') ||
    titleField.includes('assistant') ||
    titleField.includes('executive') ||
    titleField.includes('director') ||
    titleField.includes('patient') ||
    titleField.includes('concierge')
  ) {
    return 'Support Staff'
  }

  // Fallback
  return 'Other Providers'
}

/**
 * Group staff into buckets and sort each bucket by display name.
 */
function groupStaff(staffList = []) {
  const groups = {
    Injectors: [],
    Aestheticians: [],
    'Support Staff': [],
    'Other Providers': [],
  }

  staffList.forEach((s) => {
    const cat = pickCategory(s)
    groups[cat].push(s)
  })

  const byName = (a, b) =>
    (a?.name || a?.title || a?.slug || '').localeCompare(
      b?.name || b?.title || b?.slug || ''
    )

  Object.keys(groups).forEach((k) => groups[k].sort(byName))
  return groups
}

// --- SSG -------------------------------------------------------------------

export async function getStaticProps() {
  const { data } = await client.query({
    query: GET_STAFF_LIST,
  })

  return {
    props: {
      staffList: data?.staffs?.nodes || [],
    },
    revalidate: 60,
  }
}

// --- Page ------------------------------------------------------------------

export default function TeamPage({ staffList }) {
  const groups = groupStaff(staffList)

  const orderedSections = [
    { key: 'Injectors', label: 'Injectors' },
    { key: 'Aestheticians', label: 'Aestheticians' },
    { key: 'Support Staff', label: 'Support Staff' },
    { key: 'Other Providers', label: 'Other Providers' },
  ]

  const totalCount = staffList?.length || 0

  return (
    <>
      <Head>
        <title>Meet the Experts Behind RELUXE</title>
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="w-full">
        <img
          src="/images/team/team-header.png"
          alt="Our Team"
          className="w-full h-[400px] object-cover"
        />
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Meet the Experts Behind RELUXE</h1>
            <p className="text-lg text-gray-600">
              Every treatment starts with the right provider.
            </p>
          </div>
          <div className="text-sm text-gray-500">{totalCount} total</div>
        </div>

        {/* Category chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {orderedSections.map((sec) => {
            const count = groups[sec.key]?.length || 0
            return (
              <a
                key={sec.key}
                href={`#${sec.key.replace(/\s+/g, '-').toLowerCase()}`}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
              >
                <span>{sec.label}</span>
                <span className="text-gray-500">({count})</span>
              </a>
            )
          })}
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-12">
          {orderedSections.map(({ key, label }) => {
            const items = groups[key] || []
            if (!items.length) return null
            return (
              <section id={key.replace(/\s+/g, '-').toLowerCase()} key={key}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{label}</h2>
                  <span className="text-sm text-gray-500">{items.length}</span>
                </div>
                <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
                  {items.map((staff) => (
                    <StaffCard key={staff.slug} staff={staff} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </section>
    </>
  )
}
