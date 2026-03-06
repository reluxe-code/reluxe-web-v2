// src/pages/admin/intelligence/injector-dashboard.js
// Injector Performance Dashboard — scorecard, book health, patient retention.
import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

// ─── Color-coded metric helper ───────────────────────────
function MetricCell({ value, format = 'pct', thresholds, invert = false }) {
  if (value == null) return <span className="text-neutral-300">—</span>
  const [green, amber] = thresholds
  let color
  if (invert) {
    // Lower is better (e.g. interval)
    color = value <= green ? 'text-emerald-600' : value <= amber ? 'text-amber-600' : 'text-red-600'
  } else {
    color = value >= green ? 'text-emerald-600' : value >= amber ? 'text-amber-600' : 'text-red-600'
  }
  const display = format === 'pct' ? `${value}%`
    : format === 'dollar' ? `$${value.toLocaleString()}`
    : format === 'days' ? `${value}d`
    : String(value)
  return <span className={`font-medium ${color}`}>{display}</span>
}

function TrendArrow({ direction, goodDirection = 'up' }) {
  if (!direction) return null
  if (direction === 'stable') return <span className="text-neutral-400 text-[10px] ml-1">→</span>
  const isGood = direction === goodDirection
  const color = isGood ? 'text-emerald-500' : 'text-red-500'
  const arrow = direction === 'up' ? '↑' : '↓'
  return <span className={`${color} text-[10px] font-bold ml-1`}>{arrow}</span>
}

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
    violet: 'border-l-violet-500',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

function FillBar({ pct }) {
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="w-full bg-neutral-100 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

// ─── Expanded provider detail ────────────────────────────
function ProviderDetail({ provider }) {
  const p = provider
  const months = p.monthly || []
  const recentMonths = months.slice(-6)

  return (
    <tr>
      <td colSpan={10} className="bg-neutral-50 px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Book Health */}
          <div className="bg-white rounded-lg border p-4">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Forward Book (90d)</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Booked Hours</span>
                <span className="font-medium">{p.forward_hours}h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Forward Revenue</span>
                <span className="font-medium">${p.forward_revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fill Rate</span>
                <MetricCell value={p.fill_rate} thresholds={[70, 50]} />
              </div>
              <FillBar pct={p.fill_rate} />
            </div>
          </div>

          {/* Patient Health */}
          <div className="bg-white rounded-lg border p-4">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Patient Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Patients</span>
                <span className="font-medium">{p.patients}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>On Schedule</span>
                <MetricCell value={p.on_schedule_pct} thresholds={[50, 35]} />
              </div>
              <div className="flex justify-between text-sm">
                <span>Visits/Patient/Yr</span>
                <MetricCell value={p.visits_per_patient_year} format="num" thresholds={[3.5, 2.5]} />
              </div>
              <div className="flex justify-between text-sm">
                <span>Overdue + Lost</span>
                <span className={`font-medium ${p.overdue > 10 ? 'text-red-600' : 'text-neutral-700'}`}>{p.overdue}</span>
              </div>
            </div>
          </div>

          {/* Advanced */}
          <div className="bg-white rounded-lg border p-4">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Advanced</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tox LTV</span>
                <MetricCell value={p.tox_ltv} format="dollar" thresholds={[1500, 1000]} />
              </div>
              <div className="flex justify-between text-sm">
                <span>1st-Yr Retention (4mo)</span>
                {p.retention_4mo != null ? (
                  <span>
                    <MetricCell value={p.retention_4mo} thresholds={[70, 50]} />
                    <span className="text-[10px] text-neutral-400 ml-1">n={p.retention_4mo_cohort}</span>
                  </span>
                ) : (
                  <span className="text-neutral-300">—</span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span>Interval Velocity</span>
                {p.velocity != null ? (
                  <span className={`font-medium ${p.velocity > 0 ? 'text-emerald-600' : p.velocity < 0 ? 'text-red-600' : 'text-neutral-500'}`}>
                    {p.velocity > 0 ? '+' : ''}{p.velocity} d/mo
                  </span>
                ) : (
                  <span className="text-neutral-300">—</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend Table */}
        {recentMonths.length > 0 && (
          <div className="bg-white rounded-lg border p-4">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Monthly Trends</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-neutral-500">
                    <th className="text-left py-1.5 pr-3">Month</th>
                    <th className="text-right py-1.5 px-2">Visits</th>
                    <th className="text-right py-1.5 px-2">Patients</th>
                    <th className="text-right py-1.5 px-2">Avg Interval</th>
                    <th className="text-right py-1.5 px-2">Rebook %</th>
                    <th className="text-right py-1.5 pl-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMonths.map((m, i) => {
                    const prev = i > 0 ? recentMonths[i - 1] : null
                    const intDelta = prev?.avg_interval && m.avg_interval
                      ? m.avg_interval - prev.avg_interval
                      : null
                    const rbDelta = prev?.rebook_pct != null && m.rebook_pct != null
                      ? m.rebook_pct - prev.rebook_pct
                      : null
                    return (
                      <tr key={m.month} className="border-b border-neutral-100">
                        <td className="py-1.5 pr-3 font-medium">{m.month}</td>
                        <td className="text-right py-1.5 px-2">{m.appts}</td>
                        <td className="text-right py-1.5 px-2">{m.patients}</td>
                        <td className="text-right py-1.5 px-2">
                          {m.avg_interval != null ? (
                            <span>
                              <MetricCell value={m.avg_interval} format="days" thresholds={[95, 110]} invert />
                              {intDelta != null && (
                                <span className={`ml-1 text-[10px] ${intDelta < 0 ? 'text-emerald-500' : intDelta > 0 ? 'text-red-500' : 'text-neutral-400'}`}>
                                  {intDelta > 0 ? '+' : ''}{intDelta}
                                </span>
                              )}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="text-right py-1.5 px-2">
                          {m.rebook_pct != null ? (
                            <span>
                              <MetricCell value={m.rebook_pct} thresholds={[70, 50]} />
                              {rbDelta != null && (
                                <span className={`ml-1 text-[10px] ${rbDelta > 0 ? 'text-emerald-500' : rbDelta < 0 ? 'text-red-500' : 'text-neutral-400'}`}>
                                  {rbDelta > 0 ? '+' : ''}{rbDelta}
                                </span>
                              )}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="text-right py-1.5 pl-2">${m.revenue.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </td>
    </tr>
  )
}

// ─── Main Page ───────────────────────────────────────────
export default function InjectorDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [sortBy, setSortBy] = useState('visits')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/intelligence/injector-dashboard?location=${location}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => { loadData() }, [loadData])

  const exec = data?.executive || {}
  const bookHealth = data?.book_health || {}
  let providers = data?.providers || []

  // Client-side sort
  const sortFns = {
    visits: (a, b) => (b.tox_visits_30d || 0) - (a.tox_visits_30d || 0),
    interval: (a, b) => (a.avg_interval || 999) - (b.avg_interval || 999),
    rebook: (a, b) => (b.rebook_rate || 0) - (a.rebook_rate || 0),
    rev_hr: (a, b) => (b.rev_per_hour || 0) - (a.rev_per_hour || 0),
    filler: (a, b) => (b.filler_attach_pct || 0) - (a.filler_attach_pct || 0),
    retail: (a, b) => (b.retail_attach_pct || 0) - (a.retail_attach_pct || 0),
  }
  providers = [...providers].sort(sortFns[sortBy] || sortFns.visits)

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Injector Performance</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Provider scorecard, book health &amp; patient retention</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Locations</option>
              <option value="westfield">Westfield</option>
              <option value="carmel">Carmel</option>
            </select>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          label="Tox Visits (30d)"
          value={exec.tox_visits_30d ?? '—'}
          color="violet"
        />
        <StatCard
          label="Avg Interval"
          value={exec.avg_interval ? `${exec.avg_interval}d` : '—'}
          sub={exec.avg_interval ? (exec.avg_interval <= 95 ? 'On target' : 'Above 95d target') : null}
          color={exec.avg_interval && exec.avg_interval <= 95 ? 'emerald' : 'amber'}
        />
        <StatCard
          label="Rebook Rate"
          value={exec.rebook_rate != null ? `${exec.rebook_rate}%` : '—'}
          color={exec.rebook_rate >= 70 ? 'emerald' : exec.rebook_rate >= 50 ? 'amber' : 'red'}
        />
        <StatCard
          label="On Schedule %"
          value={exec.on_schedule_pct != null ? `${exec.on_schedule_pct}%` : '—'}
          color={exec.on_schedule_pct >= 50 ? 'emerald' : exec.on_schedule_pct >= 35 ? 'amber' : 'red'}
        />
        <StatCard
          label="Active Patients"
          value={exec.active_patients?.toLocaleString() ?? '—'}
          color="blue"
        />
        <StatCard
          label="Overdue"
          value={exec.overdue_count ?? '—'}
          sub="Overdue + Probably Lost"
          color={exec.overdue_count > 50 ? 'red' : 'amber'}
        />
      </div>

      {/* Book Health Summary */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Team Forward Book (90d)</h3>
          <span className="text-xs text-neutral-500">
            {bookHealth.forward_hours || 0}h booked / {bookHealth.available_hours || 0}h available
          </span>
        </div>
        <FillBar pct={bookHealth.fill_rate || 0} />
        <div className="flex gap-6 mt-2 text-xs text-neutral-500">
          <span>Fill Rate: <MetricCell value={bookHealth.fill_rate || 0} thresholds={[70, 50]} /></span>
          <span>Forward Revenue: <span className="font-medium text-neutral-700">${(bookHealth.forward_revenue || 0).toLocaleString()}</span></span>
        </div>
      </div>

      {/* Injector Scorecard Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b text-neutral-500 text-xs">
                <th className="text-left py-3 px-4">Provider</th>
                <SortHeader label="Tox/30d" field="visits" sortBy={sortBy} setSortBy={setSortBy} />
                <SortHeader label="Avg Interval" field="interval" sortBy={sortBy} setSortBy={setSortBy} />
                <SortHeader label="Rebook %" field="rebook" sortBy={sortBy} setSortBy={setSortBy} />
                <SortHeader label="Rev/Hr" field="rev_hr" sortBy={sortBy} setSortBy={setSortBy} />
                <th className="text-right py-3 px-3">Avg Rev/Visit</th>
                <SortHeader label="Filler %" field="filler" sortBy={sortBy} setSortBy={setSortBy} />
                <SortHeader label="Retail %" field="retail" sortBy={sortBy} setSortBy={setSortBy} />
                <th className="text-right py-3 px-3">Visits/Pt/Yr</th>
                <th className="text-right py-3 px-4">Fill Rate</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <React.Fragment key={p.staff_id}>
                  <tr
                    className={`border-b hover:bg-neutral-50 cursor-pointer transition ${expanded === p.staff_id ? 'bg-neutral-50' : ''}`}
                    onClick={() => setExpanded(expanded === p.staff_id ? null : p.staff_id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${expanded === p.staff_id ? 'bg-blue-500' : 'bg-neutral-300'}`} />
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          {p.title && <p className="text-[10px] text-neutral-400">{p.title}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3">
                      <MetricCell value={p.tox_visits_30d} format="num" thresholds={[40, 25]} />
                    </td>
                    <td className="text-right py-3 px-3">
                      <MetricCell value={p.avg_interval} format="days" thresholds={[95, 110]} invert />
                    </td>
                    <td className="text-right py-3 px-3">
                      <MetricCell value={p.rebook_rate} thresholds={[70, 50]} />
                    </td>
                    <td className="text-right py-3 px-3">
                      <MetricCell value={p.rev_per_hour} format="dollar" thresholds={[300, 200]} />
                    </td>
                    <td className="text-right py-3 px-3">
                      {p.avg_rev_per_visit != null ? `$${p.avg_rev_per_visit}` : <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="text-right py-3 px-3">
                      <MetricCell value={p.filler_attach_pct} thresholds={[35, 20]} />
                    </td>
                    <td className="text-right py-3 px-3">
                      <MetricCell value={p.retail_attach_pct} thresholds={[25, 15]} />
                    </td>
                    <td className="text-right py-3 px-3">
                      <MetricCell value={p.visits_per_patient_year} format="num" thresholds={[3.5, 2.5]} />
                    </td>
                    <td className="text-right py-3 px-4">
                      <MetricCell value={p.fill_rate} thresholds={[70, 50]} />
                    </td>
                  </tr>
                  {expanded === p.staff_id && <ProviderDetail provider={p} />}
                </React.Fragment>
              ))}
              {providers.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-neutral-400">
                    No provider data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center py-16">
          <p className="text-neutral-400">Loading dashboard...</p>
        </div>
      )}
    </AdminLayout>
  )
}

function SortHeader({ label, field, sortBy, setSortBy }) {
  const active = sortBy === field
  return (
    <th
      className={`text-right py-3 px-3 cursor-pointer select-none hover:text-neutral-700 ${active ? 'text-neutral-900 font-semibold' : ''}`}
      onClick={() => setSortBy(field)}
    >
      {label}
      {active && <span className="ml-0.5">▾</span>}
    </th>
  )
}

InjectorDashboardPage.getLayout = (page) => page
