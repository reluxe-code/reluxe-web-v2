// src/pages/admin/intelligence/tox-yearly.js
// Tox Yearly Report — rolled-up annual view with quarterly breakdown, YoY, provider leaderboard.
import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    orange: 'border-l-orange-500',
    rose: 'border-l-rose-500',
    red: 'border-l-red-500',
    violet: 'border-l-violet-500',
    blue: 'border-l-blue-500',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

function YoYBadge({ pct }) {
  if (pct == null) return <span className="text-neutral-300 text-xs">—</span>
  const isPositive = pct > 0
  const isZero = pct === 0
  const color = isZero ? 'text-neutral-400' : isPositive ? 'text-emerald-600' : 'text-red-600'
  const bg = isZero ? 'bg-neutral-50' : isPositive ? 'bg-emerald-50' : 'bg-red-50'
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${color} ${bg}`}>
      {isPositive ? '↑' : isZero ? '→' : '↓'}{Math.abs(pct)}%
    </span>
  )
}

// Simple bar chart rendered as divs
function MiniBar({ data, maxVal, color = 'bg-violet-500' }) {
  if (!maxVal) return null
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className={`${color} rounded-t opacity-80 hover:opacity-100 transition-opacity`}
          style={{ width: `${100 / data.length - 1}%`, height: `${Math.max(4, (v / maxVal) * 100)}%` }}
          title={`$${v.toLocaleString()}`}
        />
      ))}
    </div>
  )
}

export default function ToxYearlyReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [location, setLocation] = useState('all')
  const [expandedProvider, setExpandedProvider] = useState(null)
  const [showMonthly, setShowMonthly] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ year: String(year), location })
      const res = await adminFetch(`/api/admin/intelligence/tox-yearly?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [year, location])

  useEffect(() => { loadData() }, [loadData])

  const s = data?.summary
  const yoy = data?.yoy

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">Tox Yearly Report</h1>
          <a
            href="/admin/intelligence/tox"
            className="text-xs text-violet-600 hover:text-violet-800 font-medium"
          >
            View Monthly Report &rarr;
          </a>
        </div>
        <p className="text-sm text-neutral-500">
          Rolled-up annual metrics with quarterly trends, year-over-year comparisons, and provider performance.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {data?.available_years?.length > 0 && (
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="border rounded-lg px-3 py-2 text-sm bg-white font-medium"
          >
            {data.available_years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Locations</option>
          <option value="westfield">Westfield</option>
          <option value="carmel">Carmel</option>
        </select>

        <div className="ml-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="p-12 text-center text-neutral-400 text-sm">Loading yearly report...</div>
      ) : data ? (
        <>
          {/* Annual Summary Cards */}
          {s && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
                <StatCard
                  label="Total Appointments"
                  value={s.total_appointments.toLocaleString()}
                  sub={yoy?.appt_change_pct != null ? `${yoy.appt_change_pct > 0 ? '+' : ''}${yoy.appt_change_pct}% vs ${yoy.prev_year}` : null}
                  color="violet"
                />
                <StatCard
                  label="Total Revenue"
                  value={`$${s.total_revenue.toLocaleString()}`}
                  sub={yoy?.revenue_change_pct != null ? `${yoy.revenue_change_pct > 0 ? '+' : ''}${yoy.revenue_change_pct}% vs ${yoy.prev_year}` : null}
                  color="emerald"
                />
                <StatCard
                  label="COGS"
                  value={`$${s.total_cogs.toLocaleString()}`}
                  sub={yoy?.cogs_change_pct != null ? `${yoy.cogs_change_pct > 0 ? '+' : ''}${yoy.cogs_change_pct}% vs ${yoy.prev_year}` : null}
                  color="red"
                />
                <StatCard
                  label="Gross Margin"
                  value={`$${s.gross_margin.toLocaleString()}`}
                  sub={`${s.margin_pct}% margin`}
                  color="emerald"
                />
                <StatCard
                  label="Units Used"
                  value={s.total_units.toLocaleString()}
                  sub={`$${s.cost_per_unit}/unit avg`}
                  color="orange"
                />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                <StatCard
                  label="Unique Clients"
                  value={s.unique_clients.toLocaleString()}
                  sub={yoy?.client_change_pct != null ? `${yoy.client_change_pct > 0 ? '+' : ''}${yoy.client_change_pct}% vs ${yoy.prev_year}` : null}
                  color="blue"
                />
                <StatCard
                  label="New Clients"
                  value={s.new_clients.toLocaleString()}
                  sub={`${s.returning_clients.toLocaleString()} returning`}
                  color="amber"
                />
                <StatCard
                  label="Avg Revenue / Appt"
                  value={`$${s.avg_revenue_per_appt.toLocaleString()}`}
                  color="violet"
                />
                <StatCard
                  label="Avg Revenue / Client"
                  value={`$${s.avg_revenue_per_client.toLocaleString()}`}
                  color="emerald"
                />
                <StatCard
                  label="Retention Rate"
                  value={s.unique_clients > 0 ? `${Math.round((s.returning_clients / s.unique_clients) * 100)}%` : '—'}
                  sub="Returning / Total"
                  color="blue"
                />
              </div>
            </>
          )}

          {/* YoY Comparison Bar */}
          {yoy && yoy.prev_appointments > 0 && (
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl border border-violet-200 p-4 mb-6">
              <p className="text-sm font-semibold text-violet-800 mb-3">Year-over-Year: {year} vs {yoy.prev_year}</p>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Revenue</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">${s.total_revenue.toLocaleString()}</span>
                    <span className="text-xs text-neutral-400">vs ${yoy.prev_revenue.toLocaleString()}</span>
                    <YoYBadge pct={yoy.revenue_change_pct} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">COGS</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">${s.total_cogs.toLocaleString()}</span>
                    <span className="text-xs text-neutral-400">vs ${yoy.prev_cogs.toLocaleString()}</span>
                    <YoYBadge pct={yoy.cogs_change_pct != null ? -yoy.cogs_change_pct : null} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Gross Margin</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">${s.gross_margin.toLocaleString()}</span>
                    <span className="text-xs text-neutral-400">vs ${yoy.prev_margin.toLocaleString()}</span>
                    <YoYBadge pct={yoy.margin_change_pct} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Appointments</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{s.total_appointments.toLocaleString()}</span>
                    <span className="text-xs text-neutral-400">vs {yoy.prev_appointments.toLocaleString()}</span>
                    <YoYBadge pct={yoy.appt_change_pct} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Units Used</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{s.total_units.toLocaleString()}</span>
                    <span className="text-xs text-neutral-400">vs {yoy.prev_units.toLocaleString()}</span>
                    <YoYBadge pct={yoy.units_change_pct} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Quarterly Breakdown */}
            {data.quarters?.length > 0 && (
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl">
                  <h2 className="text-sm font-semibold">Quarterly Breakdown</h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Quarter</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Revenue</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">COGS</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Margin</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Units</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Appts</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">YoY Rev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.quarters.map((q) => (
                      <tr key={q.quarter} className="border-b last:border-b-0 hover:bg-neutral-50">
                        <td className="px-4 py-2 font-medium">{q.label}</td>
                        <td className="px-4 py-2 text-right text-neutral-600">${q.revenue.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-red-600">${q.cogs.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">
                          <span className={`font-medium ${q.margin_pct >= 70 ? 'text-emerald-600' : q.margin_pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                            ${q.margin.toLocaleString()} <span className="text-[10px] text-neutral-400">({q.margin_pct}%)</span>
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-neutral-600">{q.units.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-neutral-600">{q.appointments.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right"><YoYBadge pct={q.revenue_change_pct} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tox Type Breakdown with COGS */}
            {data.tox_types?.length > 0 && (
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl">
                  <h2 className="text-sm font-semibold">Tox Type P&L — {year}</h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Brand</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Revenue</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">COGS</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Margin</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Units</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">$/Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tox_types.map((t) => {
                      const marginPct = t.revenue > 0 ? Math.round(((t.revenue - t.cogs) / t.revenue) * 100) : 0
                      return (
                        <tr key={t.name} className="border-b last:border-b-0 hover:bg-neutral-50">
                          <td className="px-4 py-2 font-medium">{t.name}</td>
                          <td className="px-4 py-2 text-right text-neutral-600">${t.revenue.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-red-600">{t.cogs > 0 ? `$${t.cogs.toLocaleString()}` : '—'}</td>
                          <td className="px-4 py-2 text-right">
                            {t.cogs > 0 ? (
                              <span className={`font-medium ${marginPct >= 70 ? 'text-emerald-600' : marginPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                ${t.margin.toLocaleString()} <span className="text-[10px] text-neutral-400">({marginPct}%)</span>
                              </span>
                            ) : <span className="text-neutral-400">—</span>}
                          </td>
                          <td className="px-4 py-2 text-right text-neutral-600">{t.units > 0 ? t.units.toLocaleString() : '—'}</td>
                          <td className="px-4 py-2 text-right text-neutral-600">{t.cost_per_unit > 0 ? `$${t.cost_per_unit.toFixed(2)}` : '—'}</td>
                        </tr>
                      )
                    })}
                    {/* Totals row */}
                    {data.tox_types.length > 1 && (
                      <tr className="bg-neutral-50 font-medium">
                        <td className="px-4 py-2">Total</td>
                        <td className="px-4 py-2 text-right">${data.tox_types.reduce((s, t) => s + t.revenue, 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-red-600">${data.tox_types.reduce((s, t) => s + t.cogs, 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-emerald-600">${data.tox_types.reduce((s, t) => s + t.margin, 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{data.tox_types.reduce((s, t) => s + t.units, 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-neutral-400">—</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* COGS by Brand (unit economics) */}
          {data.cogs_by_brand?.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-4 mb-6">
              <p className="text-sm font-semibold text-red-800 mb-3">COGS by Brand — {year}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {data.cogs_by_brand.map((b) => (
                  <div key={b.brand} className="bg-white rounded-lg border p-3">
                    <p className="text-xs text-neutral-400 mb-1">{b.brand}</p>
                    <p className="text-lg font-bold text-red-700">${b.cost.toLocaleString()}</p>
                    <div className="flex justify-between text-xs text-neutral-500 mt-1">
                      <span>{b.units.toLocaleString()} units</span>
                      <span className="font-medium">${b.cost_per_unit.toFixed(2)}/unit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Breakdown (collapsible) */}
          {data.months?.length > 0 && (
            <div className="bg-white rounded-xl border overflow-hidden mb-6">
              <button
                onClick={() => setShowMonthly(!showMonthly)}
                className="w-full px-4 py-3 bg-neutral-50 border-b rounded-t-xl flex items-center justify-between hover:bg-neutral-100 transition-colors"
              >
                <h2 className="text-sm font-semibold">Monthly Breakdown — {year}</h2>
                <span className={`text-neutral-400 text-xs transition-transform ${showMonthly ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showMonthly && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Month</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Revenue</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">COGS</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Margin</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Units</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Appts</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Clients</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Prev Rev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.months.map((m) => {
                        const marginPct = m.revenue > 0 ? Math.round(((m.revenue - m.cogs) / m.revenue) * 100) : 0
                        return (
                          <tr key={m.month} className="border-b last:border-b-0 hover:bg-neutral-50">
                            <td className="px-4 py-2 font-medium">{m.label}</td>
                            <td className="px-4 py-2 text-right text-neutral-600">${m.revenue.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right text-red-600">{m.cogs > 0 ? `$${m.cogs.toLocaleString()}` : '—'}</td>
                            <td className="px-4 py-2 text-right">
                              {m.cogs > 0 ? (
                                <span className={`font-medium ${marginPct >= 70 ? 'text-emerald-600' : marginPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                  ${m.margin.toLocaleString()} <span className="text-[10px] text-neutral-400">({marginPct}%)</span>
                                </span>
                              ) : <span className="text-neutral-400">${m.revenue.toLocaleString()}</span>}
                            </td>
                            <td className="px-4 py-2 text-right text-neutral-600">{m.units > 0 ? m.units.toLocaleString() : '—'}</td>
                            <td className="px-4 py-2 text-right text-neutral-600">{m.appointments}</td>
                            <td className="px-4 py-2 text-right text-neutral-600">{m.unique_clients}</td>
                            <td className="px-4 py-2 text-right text-neutral-400">{m.prev_revenue > 0 ? `$${m.prev_revenue.toLocaleString()}` : '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Provider Leaderboard */}
          {data.provider_leaderboard?.length > 0 && (
            <div className="bg-white rounded-xl border overflow-hidden mb-6">
              <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl">
                <h2 className="text-sm font-semibold">Provider Performance — {year}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead className="bg-neutral-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Provider</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Appts</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Clients</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Revenue</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Rev/Appt</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Rebook %</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Avg Interval</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Visits/Client</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.provider_leaderboard.map((p) => {
                      const isExpanded = expandedProvider === p.staff_id
                      return (
                        <React.Fragment key={p.staff_id}>
                          <tr
                            className="border-b hover:bg-neutral-50 cursor-pointer"
                            onClick={() => setExpandedProvider(isExpanded ? null : p.staff_id)}
                          >
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                <div>
                                  <p className="font-medium">{p.name}</p>
                                  {p.title && <p className="text-xs text-neutral-400">{p.title}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right text-neutral-600">{p.appointments}</td>
                            <td className="px-4 py-2 text-right text-neutral-600">{p.unique_clients}</td>
                            <td className="px-4 py-2 text-right font-medium">${p.total_revenue.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right text-neutral-600">${p.avg_revenue_per_appt}</td>
                            <td className="px-4 py-2 text-right">
                              {p.rebook_rate != null ? (
                                <span className={`font-medium ${p.rebook_rate >= 70 ? 'text-emerald-600' : p.rebook_rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                  {p.rebook_rate}%
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {p.avg_interval_days != null ? (
                                <span className={`font-medium ${p.avg_interval_days <= 95 ? 'text-emerald-600' : p.avg_interval_days <= 110 ? 'text-amber-600' : 'text-red-600'}`}>
                                  {p.avg_interval_days}d
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {p.visits_per_client != null ? (
                                <span className={`font-medium ${p.visits_per_client >= 3.5 ? 'text-emerald-600' : p.visits_per_client >= 2.5 ? 'text-amber-600' : 'text-red-600'}`}>
                                  {p.visits_per_client}
                                </span>
                              ) : '—'}
                            </td>
                          </tr>
                          {/* Expandable: Quarterly breakdown per provider */}
                          {isExpanded && p.quarterly && (
                            <tr>
                              <td colSpan={8} className="bg-neutral-50 px-4 py-3 border-b">
                                <p className="text-xs font-semibold text-neutral-500 mb-2">Quarterly Breakdown</p>
                                <div className="grid grid-cols-4 gap-3">
                                  {p.quarterly.map((q) => (
                                    <div key={q.quarter} className="bg-white rounded-lg border p-3 text-center">
                                      <p className="text-xs text-neutral-400 mb-1">Q{q.quarter}</p>
                                      <p className="text-lg font-bold">${q.revenue.toLocaleString()}</p>
                                      <p className="text-xs text-neutral-500">{q.appointments} appts</p>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Current Segment Health (real-time snapshot) */}
          {data.current_segments && (
            <div className="bg-white rounded-xl border overflow-hidden mb-6">
              <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl">
                <h2 className="text-sm font-semibold">Current Patient Segment Health</h2>
                <p className="text-[10px] text-neutral-400 mt-0.5">Real-time snapshot — not year-specific</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <StatCard label="Total Tox Patients" value={data.current_segments.total.toLocaleString()} color="violet" />
                  <StatCard label="On Schedule" value={data.current_segments.on_schedule.toLocaleString()} sub={`${data.current_segments.on_schedule_pct}%`} color="emerald" />
                  <StatCard label="Due" value={data.current_segments.due.toLocaleString()} sub={`${data.current_segments.due_pct}%`} color="amber" />
                  <StatCard label="Overdue" value={data.current_segments.overdue.toLocaleString()} sub={`${data.current_segments.overdue_pct}%`} color="orange" />
                  <StatCard label="Probably Lost" value={data.current_segments.probably_lost.toLocaleString()} sub={`${data.current_segments.probably_lost_pct}%`} color="rose" />
                  <StatCard label="Lost" value={data.current_segments.lost.toLocaleString()} sub={`${data.current_segments.lost_pct}%`} color="red" />
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </AdminLayout>
  )
}

ToxYearlyReport.getLayout = (page) => page
