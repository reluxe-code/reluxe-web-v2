// src/pages/admin/intelligence/providers.js
// Provider Performance — revenue, rebooking, cancellations, service mix.
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

const slugLabels = {
  tox: 'Tox', filler: 'Filler', facials: 'Facials', 'laser-hair-removal': 'Laser Hair',
  ipl: 'IPL', 'iv-therapy': 'IV Therapy', prp: 'PRP', 'salt-sauna': 'Salt/Sauna',
  microneedling: 'Microneedling', peel: 'Peel',
}

export default function ProvidersReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('revenue')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/intelligence/providers')
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const summary = data?.summary
  let providers = data?.providers || []

  // Client-side sort
  if (sortBy === 'revenue') providers = [...providers].sort((a, b) => b.total_revenue - a.total_revenue)
  else if (sortBy === 'rebooking') providers = [...providers].sort((a, b) => b.rebooking_rate_pct - a.rebooking_rate_pct)
  else if (sortBy === 'clients') providers = [...providers].sort((a, b) => b.unique_clients - a.unique_clients)
  else if (sortBy === 'rpm') providers = [...providers].sort((a, b) => b.revenue_per_hour - a.revenue_per_hour)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Provider Performance</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Revenue, rebooking rates, and service mix per provider. Identify top performers and coaching opportunities.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Active Providers" value={summary.total_providers} />
          <StatCard label="Total Revenue" value={`$${summary.total_revenue.toLocaleString()}`} />
          <StatCard label="Last 30 Days" value={`$${summary.revenue_last_30d.toLocaleString()}`} />
          <StatCard label="Avg Rebooking Rate" value={`${summary.avg_rebooking_rate}%`} />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-neutral-500">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="revenue">Total Revenue</option>
          <option value="rpm">Revenue / Hour</option>
          <option value="rebooking">Rebooking Rate</option>
          <option value="clients">Unique Clients</option>
        </select>
        <button
          onClick={loadData}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading && !data ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Provider</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Appts</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Clients</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Revenue</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Rev/Hr</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Last 30d</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Rebook %</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Cancel %</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Top Services</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.staff_id} className="border-b last:border-b-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.name}</p>
                      {p.title && <p className="text-xs text-neutral-400">{p.title}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">{p.total_appointments.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">{p.unique_clients.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">${p.total_revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">${p.revenue_per_hour.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">${p.revenue_last_30d.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${p.rebooking_rate_pct >= 60 ? 'text-emerald-600' : p.rebooking_rate_pct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {p.rebooking_rate_pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`${p.cancellation_rate_pct <= 5 ? 'text-emerald-600' : p.cancellation_rate_pct <= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                        {p.cancellation_rate_pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(p.top_services || []).map((slug) => (
                          <span key={slug} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px]">
                            {slugLabels[slug] || slug}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {providers.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-neutral-400">No provider data found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
