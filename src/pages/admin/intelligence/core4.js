// src/pages/admin/intelligence/core4.js
// Core 4 Regimen Dashboard — score distribution, adoption rates, gap opportunities.
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

const SCORE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#059669']
const SCORE_BG = ['bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-green-100 text-green-700', 'bg-emerald-100 text-emerald-700']
const CATEGORY_COLORS = {
  cleanser: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100' },
  vitamin_c: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100' },
  retinol: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-100' },
  moisturizer: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100' },
  spf: { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100' },
}
const CATEGORY_LABELS = { cleanser: 'Cleanser', vitamin_c: 'Vitamin C', retinol: 'Retinol', moisturizer: 'Moisturizer', spf: 'SPF' }

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    violet: 'border-l-violet-500', emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500', red: 'border-l-red-500',
    blue: 'border-l-blue-500', neutral: 'border-l-neutral-400',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Core4Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [provider, setProvider] = useState('all')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = provider !== 'all'
        ? `/api/admin/intelligence/core4?provider=${provider}`
        : '/api/admin/intelligence/core4'
      const res = await fetch(url)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [provider])

  useEffect(() => { loadData() }, [loadData])

  const summary = data?.summary
  const distribution = data?.distribution || []
  const adoption = data?.adoption || {}
  const gaps = data?.gaps || []
  const maxDist = Math.max(...distribution.map((d) => d.count), 1)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Core 4 Regimen</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Every patient needs 4 pillars: Cleanser, Vitamin C, Retinol, Moisturizer. Track adoption gaps and coach providers.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Avg Core 4 Score" value={summary.avg_score} color="violet" sub={`of 4.0 possible`} />
          <StatCard label="Clients at 4/4" value={summary.clients_at_4} color="emerald" sub={summary.total > 0 ? `${Math.round((summary.clients_at_4 / summary.total) * 100)}% of buyers` : ''} />
          <StatCard label="Biggest Gap" value={summary.biggest_gap} color="red" sub="Most missing category" />
          <StatCard label="Product Buyers Tracked" value={summary.total} color="blue" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <label className="text-xs text-neutral-500">Provider:</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Providers</option>
          {(data?.providers || []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={loadData}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold mb-4">Score Distribution</h2>
            <div className="space-y-3">
              {distribution.map((d) => (
                <div key={d.score} className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${SCORE_BG[d.score]}`}>
                    {d.score}
                  </span>
                  <div className="flex-1">
                    <div className="w-full bg-neutral-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 flex items-center px-2"
                        style={{ width: `${Math.max((d.count / maxDist) * 100, 2)}%`, backgroundColor: SCORE_COLORS[d.score] }}
                      >
                        {d.count > 0 && <span className="text-[10px] font-bold text-white">{d.count}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500 w-12 text-right">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Adoption */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold mb-4">Category Adoption</h2>
            <div className="space-y-4">
              {Object.entries(adoption).map(([key, val]) => {
                const colors = CATEGORY_COLORS[key]
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{CATEGORY_LABELS[key]}</span>
                      <span className="text-xs text-neutral-500">{val.count} clients ({val.pct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
                        style={{ width: `${Math.max(val.pct, 1)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Gap Opportunities */}
          <div className="bg-white rounded-xl border p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold mb-4">Gap Opportunities</h2>
            <p className="text-xs text-neutral-500 mb-4">Which missing category would move the most clients up a score?</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Missing Category</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Clients Without</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">% of Buyers</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Opportunity</th>
                  </tr>
                </thead>
                <tbody>
                  {gaps.map((g) => (
                    <tr key={g.category} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[g.category]?.light} ${CATEGORY_COLORS[g.category]?.text}`}>
                          {g.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{g.missing}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">{g.pct}%</td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-neutral-100 rounded-full h-2 max-w-[200px]">
                          <div
                            className={`h-full rounded-full ${CATEGORY_COLORS[g.category]?.bg}`}
                            style={{ width: `${g.pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

Core4Dashboard.getLayout = (page) => page
