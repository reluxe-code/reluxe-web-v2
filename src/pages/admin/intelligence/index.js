// src/pages/admin/intelligence/index.js
// Intelligence Overview — landing page for the Revenue Intelligence section.
// Phase 6 will add full revenue dashboard; for now, quick links + summary stats.
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

function QuickLink({ href, title, description, stat, badge }) {
  return (
    <Link href={href} className="block bg-white rounded-xl border p-5 hover:shadow-md transition group">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm group-hover:text-violet-600 transition">{title}</h3>
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
            {badge}
          </span>
        )}
      </div>
      {stat && (
        <p className="text-2xl font-bold mt-3">{stat}</p>
      )}
    </Link>
  )
}

export default function IntelligenceOverview() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const [clients, appts, toxAppts] = await Promise.all([
      supabase.from('blvd_clients').select('id', { count: 'exact', head: true }),
      supabase.from('blvd_appointments').select('id', { count: 'exact', head: true }).in('status', ['completed', 'final']),
      supabase.from('blvd_appointment_services').select('id', { count: 'exact', head: true }).eq('service_slug', 'tox'),
    ])
    setStats({
      clients: clients.count || 0,
      completedAppts: appts.count || 0,
      toxServices: toxAppts.count || 0,
    })
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Revenue Intelligence</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Actionable insights from your appointment data. Every metric answers: what do I do with this?
        </p>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.clients.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Total Clients</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.completedAppts.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Completed Appointments</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.toxServices.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Tox Treatments</p>
          </div>
        </div>
      )}

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickLink
          href="/admin/intelligence/tox"
          title="Tox Engine"
          description="Track tox patient health — on-schedule, due, overdue, lost. Provider retention leaderboard."
          badge="Live"
        />
        <QuickLink
          href="/admin/intelligence/providers"
          title="Providers"
          description="Revenue per hour, rebooking rates, retention metrics, service mix by provider."
          badge="Live"
        />
        <QuickLink
          href="/admin/intelligence/patients"
          title="Patients"
          description="LTV buckets, at-risk detection, date windows, and full patient detail drawer with appointments, providers, and products."
          badge="Live"
        />
        <QuickLink
          href="/admin/intelligence/rebooking"
          title="Rebooking"
          description="Who left without rebooking? Identify gaps and trigger follow-ups."
          badge="Live"
        />
        <QuickLink
          href="/admin/intelligence/actions"
          title="Actions"
          description="The money page. All actionable segments with export + Bird SMS campaign triggers."
          badge="Live"
        />
        <QuickLink
          href="/admin/intelligence/products"
          title="Products"
          description="Skincare product sales, monthly trends, provider performance, demand forecasting, and journey cohorts."
          badge="New"
        />
        <QuickLink
          href="/admin/intelligence/daily-snapshot"
          title="Daily Snapshot"
          description="Westfield/Carmel/Total daily scorecard for service revenue, deferred revenue, product sales, bookings, cancellations, and 2-week reschedules."
          badge="Live"
        />
        <QuickLink
          href="/admin/intelligence/form-submissions"
          title="Form Submissions"
          description="Review approved capture submissions with secure image previews and extracted treatment snippets."
          badge="Live"
        />
        <QuickLink
          href="/admin/intelligence/booking-funnel"
          title="Booking Funnel"
          description="Conversion funnel, abandon breakdown, daily trends, and re-engagement opportunities from online booking flows."
          badge="New"
        />
        <QuickLink
          href="/admin/intelligence/referrals"
          title="Referrals"
          description="Give $25, Get $25 referral program. Funnel, top referrers, channel breakdown, pending credits, and fraud alerts."
          badge="New"
        />
      </div>
    </AdminLayout>
  )
}
