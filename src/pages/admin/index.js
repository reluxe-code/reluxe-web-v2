// src/pages/admin/index.js
// Admin Dashboard — revenue pulse, patient health, marketing queue, quick actions.
import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

function StatCard({ label, value, sub, color, href }) {
  const borderColors = {
    emerald: 'border-l-emerald-500',
    violet: 'border-l-violet-500',
    blue: 'border-l-blue-500',
    amber: 'border-l-amber-500',
    fuchsia: 'border-l-fuchsia-500',
    rose: 'border-l-rose-500',
    red: 'border-l-red-500',
    neutral: 'border-l-neutral-400',
  }
  const inner = (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4 ${href ? 'hover:shadow-md transition' : ''}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

function TrendBadge({ pct }) {
  if (pct == null || pct === 0) return null
  const isUp = pct > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
      {isUp ? '+' : ''}{pct}%
    </span>
  )
}

function SectionHeader({ title, href, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-neutral-700">{title}</h2>
      {href && (
        <Link href={href} className="text-xs text-violet-600 hover:text-violet-700 font-medium">
          {linkLabel || 'View all'}
        </Link>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [snapshot, setSnapshot] = useState(null)
  const [tox, setTox] = useState(null)
  const [concierge, setConcierge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('total')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [snapRes, toxRes, conciergeRes] = await Promise.allSettled([
        fetch(`/api/admin/intelligence/daily-snapshot?location=${location}`).then((r) => r.json()),
        fetch('/api/admin/intelligence/tox?location=all&limit=1').then((r) => r.json()),
        fetch('/api/admin/concierge/dashboard').then((r) => r.json()),
      ])

      if (snapRes.status === 'fulfilled') setSnapshot(snapRes.value)
      if (toxRes.status === 'fulfilled') setTox(toxRes.value)
      if (conciergeRes.status === 'fulfilled') setConcierge(conciergeRes.value)
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => { loadData() }, [loadData])

  const m = snapshot?.metrics?.[location]
  const summary = tox?.summary

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="total">All Locations</option>
            <option value="westfield">Westfield</option>
            <option value="carmel">Carmel</option>
          </select>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Revenue Pulse ──────────────────────────────────── */}
      <SectionHeader title="Revenue Pulse" href="/admin/intelligence/daily-snapshot" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Today"
          value={m ? `$${(m.today.service_revenue + m.today.product_sales).toLocaleString()}` : '—'}
          sub={m ? `$${m.today.service_revenue.toLocaleString()} services · $${m.today.product_sales.toLocaleString()} retail` : ''}
          color="emerald"
          href="/admin/intelligence/daily-snapshot"
        />
        <StatCard
          label="This Week"
          value={m ? `$${(m.week.service_revenue + m.week.product_sales).toLocaleString()}` : '—'}
          sub={m?.pace ? <span>vs last week <TrendBadge pct={m.pace.week_vs_last_week_pct} /></span> : ''}
          color="blue"
          href="/admin/intelligence/daily-snapshot"
        />
        <StatCard
          label="This Month"
          value={m ? `$${(m.month.service_revenue + m.month.product_sales).toLocaleString()}` : '—'}
          sub={m?.pace ? <span>vs last month <TrendBadge pct={m.pace.month_vs_last_month_to_date_pct} /></span> : ''}
          color="violet"
          href="/admin/intelligence/daily-snapshot"
        />
        <StatCard
          label="Bookings Today"
          value={m ? m.today.bookings.toLocaleString() : '—'}
          sub={m ? `${m.today.cancellations} cancellations` : ''}
          color={m?.today?.cancellations > 3 ? 'amber' : 'emerald'}
          href="/admin/intelligence/bookings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── Tox Patient Health ─────────────────────────────── */}
        <div>
          <SectionHeader title="Tox Patient Health" href="/admin/intelligence/tox" />
          <div className="bg-white rounded-xl border p-5">
            {summary ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{summary.on_schedule.toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">On Schedule</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{summary.due.toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">Due</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{summary.overdue.toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">Overdue</p>
                  </div>
                </div>
                {/* Retention bar */}
                <div className="h-3 rounded-full bg-neutral-100 overflow-hidden flex">
                  {summary.total_tox_patients > 0 && (
                    <>
                      <div className="bg-emerald-500 h-full" style={{ width: `${summary.on_schedule_pct}%` }} />
                      <div className="bg-amber-400 h-full" style={{ width: `${summary.due_pct}%` }} />
                      <div className="bg-orange-500 h-full" style={{ width: `${summary.overdue_pct}%` }} />
                      <div className="bg-rose-500 h-full" style={{ width: `${summary.probably_lost_pct}%` }} />
                      <div className="bg-red-500 h-full" style={{ width: `${summary.lost_pct}%` }} />
                    </>
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-neutral-400">{summary.total_tox_patients.toLocaleString()} patients</span>
                  <span className="text-[10px] text-neutral-400">${Math.round(summary.total_tox_revenue).toLocaleString()} lifetime</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">Loading tox data...</p>
            )}
          </div>
        </div>

        {/* ── Marketing Concierge ────────────────────────────── */}
        <div>
          <SectionHeader title="Daily Concierge" href="/admin/intelligence/concierge" linkLabel="Open queue" />
          <div className="bg-white rounded-xl border p-5">
            {concierge ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-2xl font-bold">
                      {Object.values(concierge.ready_counts || {}).reduce((a, b) => a + b, 0)}
                    </p>
                    <p className="text-xs text-neutral-500">Ready to Send</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${concierge.overall_rpm || 0}</p>
                    <p className="text-xs text-neutral-500">RPM (30d)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { slug: 'tox_journey', label: 'Tox Journey', color: 'bg-violet-500' },
                    { slug: 'membership_voucher', label: 'Membership Voucher', color: 'bg-blue-500' },
                    { slug: 'aesthetic_winback', label: 'Aesthetic Winback', color: 'bg-fuchsia-500' },
                    { slug: 'last_minute_gap', label: 'Last-Minute Gap', color: 'bg-amber-500' },
                    { slug: 'package_voucher', label: 'Package Voucher', color: 'bg-teal-500' },
                  ].map(({ slug, label, color }) => {
                    const ready = concierge.ready_counts?.[slug] || 0
                    const flagged = concierge.flagged_counts?.[slug] || 0
                    return (
                      <div key={slug} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${color}`} />
                          <span className="text-neutral-600">{label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {ready > 0 && <span className="text-xs font-medium text-emerald-600">{ready} ready</span>}
                          {flagged > 0 && <span className="text-xs text-neutral-400">{flagged} flagged</span>}
                          {ready === 0 && flagged === 0 && <span className="text-xs text-neutral-300">—</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {concierge.total_sent_30d > 0 && (
                  <div className="mt-3 pt-3 border-t text-xs text-neutral-400">
                    {concierge.total_sent_30d} sent · ${Math.round(concierge.total_revenue_30d)} revenue (30d)
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">Loading concierge data...</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Top Providers This Week ──────────────────────────── */}
      {m?.details?.week?.service_revenue_breakdown?.by_provider?.length > 0 && (
        <div className="mb-8">
          <SectionHeader title="Top Providers This Week" href="/admin/intelligence/providers" />
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Provider</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Revenue</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Services</th>
                </tr>
              </thead>
              <tbody>
                {m.details.week.service_revenue_breakdown.by_provider.slice(0, 5).map((p) => (
                  <tr key={p.provider_staff_id || p.provider_name} className="border-b last:border-b-0">
                    <td className="px-4 py-2 font-medium">{p.provider_name}</td>
                    <td className="px-4 py-2 text-right text-neutral-600">${p.revenue.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-neutral-600">{p.services}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Top Services This Week ───────────────────────────── */}
      {m?.details?.week?.service_revenue_breakdown?.top_services?.length > 0 && (
        <div className="mb-8">
          <SectionHeader title="Top Services This Week" href="/admin/intelligence/bookings" />
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Service</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Revenue</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Count</th>
                </tr>
              </thead>
              <tbody>
                {m.details.week.service_revenue_breakdown.top_services.slice(0, 5).map((s) => (
                  <tr key={s.service_name} className="border-b last:border-b-0">
                    <td className="px-4 py-2 font-medium">{s.service_name}</td>
                    <td className="px-4 py-2 text-right text-neutral-600">${s.revenue.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-neutral-600">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent Cancellations ─────────────────────────────── */}
      {m?.details?.today?.cancellation_report?.recent_events?.length > 0 && (
        <div className="mb-8">
          <SectionHeader title="Today's Cancellations" />
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Patient</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Service</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Provider</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Location</th>
                </tr>
              </thead>
              <tbody>
                {m.details.today.cancellation_report.recent_events.slice(0, 5).map((e, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-2">{e.client_name}</td>
                    <td className="px-4 py-2 text-neutral-600">{e.service_name}</td>
                    <td className="px-4 py-2 text-neutral-600">{e.provider_name}</td>
                    <td className="px-4 py-2 text-neutral-600 capitalize">{e.location_key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Quick Actions ────────────────────────────────────── */}
      <SectionHeader title="Quick Actions" />
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/intelligence/concierge" className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition">
          Open Concierge
        </Link>
        <Link href="/admin/intelligence/daily-snapshot" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition">
          Full Snapshot
        </Link>
        <Link href="/admin/blog?new=1" className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300 transition">
          New Blog Post
        </Link>
        <Link href="/admin/deals?new=1" className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300 transition">
          New Deal
        </Link>
        <Link href="/admin/boulevard-sync" className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300 transition">
          Boulevard Sync
        </Link>
      </div>
    </AdminLayout>
  )
}

AdminDashboard.getLayout = (page) => page
