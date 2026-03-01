// src/pages/admin/intelligence/sales-dna.js
// Provider Sales DNA Leaderboard — attachment rate, protocol adherence, portfolio variety.
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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

function MetricCell({ value, thresholds }) {
  const [green, amber] = thresholds
  const color = value >= green ? 'text-emerald-600' : value >= amber ? 'text-amber-600' : 'text-red-600'
  return <span className={`font-medium ${color}`}>{value}%</span>
}

export default function SalesDnaPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('revenue')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/intelligence/sales-dna')
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
  const sortFns = {
    revenue: (a, b) => b.total_retail_revenue - a.total_retail_revenue,
    attachment: (a, b) => b.attachment_rate_pct - a.attachment_rate_pct,
    adherence: (a, b) => b.protocol_adherence_pct - a.protocol_adherence_pct,
    variety: (a, b) => b.portfolio_variety_pct - a.portfolio_variety_pct,
  }
  providers = [...providers].sort(sortFns[sortBy] || sortFns.revenue)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Provider Sales DNA</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Retail performance leaderboard. Attachment rate, protocol adherence, and portfolio variety per provider.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Team Avg Attachment" value={`${summary.avg_attachment_rate}%`} sub="Appointments with retail sale" />
          <StatCard label="Team Avg Protocol Adherence" value={`${summary.avg_protocol_adherence}%`} sub="Clients at 4/4 Core Score" />
          <StatCard label="Team Avg Portfolio Variety" value={`${summary.avg_portfolio_variety}%`} sub="Unique SKUs / total lines" />
          <StatCard label="Total Retail Revenue" value={`$${summary.total_retail_revenue.toLocaleString()}`} sub={`${summary.total_providers} providers`} />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-neutral-500">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="revenue">Retail Revenue</option>
          <option value="attachment">Attachment Rate</option>
          <option value="adherence">Protocol Adherence</option>
          <option value="variety">Portfolio Variety</option>
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
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Attachment %</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Protocol %</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">SKUs</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Variety %</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Retail Revenue</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-neutral-600">Scorecard</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.provider_staff_id} className="border-b last:border-b-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.name}</p>
                      {p.title && <p className="text-xs text-neutral-400">{p.title}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">{p.total_appointments.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <MetricCell value={p.attachment_rate_pct} thresholds={[25, 10]} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MetricCell value={p.protocol_adherence_pct} thresholds={[30, 15]} />
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">{p.unique_skus_sold}</td>
                    <td className="px-4 py-3 text-right">
                      <MetricCell value={p.portfolio_variety_pct} thresholds={[40, 20]} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">${p.total_retail_revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/intelligence/provider-scorecard?id=${p.provider_staff_id}`}
                        className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-[10px] font-medium hover:bg-violet-200"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {providers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">No provider sales data found.</td>
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

SalesDnaPage.getLayout = (page) => page
