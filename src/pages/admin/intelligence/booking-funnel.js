// src/pages/admin/intelligence/booking-funnel.js
// Booking funnel analytics dashboard — conversion, abandons, trends.
import { useState, useEffect, useCallback, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function SortHeader({ label, sortKey, currentSort, onSort, align = 'left' }) {
  const active = currentSort.key === sortKey
  const arrow = active ? (currentSort.dir === 'asc' ? ' ↑' : ' ↓') : ''
  return (
    <th
      className={`text-${align} py-2 font-medium cursor-pointer select-none hover:text-neutral-800 transition-colors ${active ? 'text-neutral-900' : 'text-neutral-500'}`}
      onClick={() => onSort(sortKey, active && currentSort.dir === 'asc' ? 'desc' : 'asc')}
    >
      {label}{arrow}
    </th>
  )
}

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    violet: 'border-l-violet-500', emerald: 'border-l-emerald-500',
    rose: 'border-l-rose-500', blue: 'border-l-blue-500',
    neutral: 'border-l-neutral-400', amber: 'border-l-amber-500',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

function FunnelBar({ step, count, pct, maxCount, dropOff }) {
  const width = maxCount > 0 ? Math.max((count / maxCount) * 100, 2) : 0
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-28 text-xs font-medium text-neutral-600 truncate" title={step}>{step}</div>
      <div className="flex-1 relative">
        <div className="h-6 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
      <div className="w-16 text-right text-xs font-semibold text-neutral-700">{count.toLocaleString()}</div>
      <div className="w-14 text-right text-xs text-neutral-500">{pct}%</div>
      {dropOff > 0 ? (
        <div className="w-14 text-right text-xs text-rose-500">↓{dropOff}%</div>
      ) : (
        <div className="w-14" />
      )}
    </div>
  )
}

function formatDuration(ms) {
  if (!ms) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const remaining = s % 60
  return remaining > 0 ? `${m}m ${remaining}s` : `${m}m`
}

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch { return iso }
}

export default function BookingFunnelDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(30)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [flowType, setFlowType] = useState('')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  const [abSort, setAbSort] = useState({ key: null, dir: 'desc' })
  const [sesSort, setSesSort] = useState({ key: null, dir: 'desc' })

  const today = new Date().toISOString().slice(0, 10)

  const selectPreset = (d) => { setDays(d); setStartDate(''); setEndDate('') }
  const selectToday = () => { setStartDate(today); setEndDate(today); setDays(null) }
  const selectDateRange = (start, end) => { setStartDate(start); setEndDate(end); setDays(null) }

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (startDate) {
        params.set('start_date', startDate)
        if (endDate) params.set('end_date', endDate)
      } else {
        params.set('days', String(days || 30))
      }
      if (flowType) params.set('flow_type', flowType)
      if (location) params.set('location', location)
      const res = await fetch(`/api/admin/intelligence/booking-funnel?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [days, startDate, endDate, flowType, location, page])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { setPage(1) }, [days, startDate, endDate, flowType, location])

  const summary = data?.summary
  const funnel = data?.funnel || []
  const abandons = data?.abandons || []
  const trends = data?.trends || []
  const sessions = data?.sessions
  const maxFunnelCount = funnel.length > 0 ? funnel[0].count : 0

  const sortedAbandons = useMemo(() => {
    const rows = [...abandons]
    if (!abSort.key) return rows
    return rows.sort((a, b) => {
      let av = a[abSort.key], bv = b[abSort.key]
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase() }
      if (av < bv) return abSort.dir === 'asc' ? -1 : 1
      if (av > bv) return abSort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [abandons, abSort])

  const sortedSessions = useMemo(() => {
    const rows = [...(sessions?.data || [])]
    if (!sesSort.key) return rows
    return rows.sort((a, b) => {
      let av = a[sesSort.key], bv = b[sesSort.key]
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase() }
      if (av < bv) return sesSort.dir === 'asc' ? -1 : 1
      if (av > bv) return sesSort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [sessions?.data, sesSort])

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Booking Funnel</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Track where users start, progress, and drop off in the booking flow. Identify high-abandon steps and conversion patterns.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={selectToday}
          className={`px-3 py-1.5 text-xs rounded-full border transition ${startDate === today && endDate === today ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-neutral-600 border-neutral-200 hover:border-violet-300'}`}
        >
          Today
        </button>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => selectPreset(d)}
            className={`px-3 py-1.5 text-xs rounded-full border transition ${days === d && !startDate ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-neutral-600 border-neutral-200 hover:border-violet-300'}`}
          >
            {d}d
          </button>
        ))}
        <span className="text-xs text-neutral-400 mx-1">|</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => selectDateRange(e.target.value, endDate || e.target.value)}
          className="px-2 py-1.5 text-xs rounded-full border border-neutral-200 bg-white text-neutral-600"
        />
        <span className="text-xs text-neutral-400">to</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => selectDateRange(startDate, e.target.value)}
          className="px-2 py-1.5 text-xs rounded-full border border-neutral-200 bg-white text-neutral-600"
        />
        <select
          value={flowType}
          onChange={(e) => setFlowType(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 bg-white text-neutral-600"
        >
          <option value="">All Flows</option>
          <option value="modal">Modal</option>
          <option value="provider_picker">Provider Picker</option>
        </select>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 bg-white text-neutral-600"
        >
          <option value="">All Locations</option>
          <option value="westfield">Westfield</option>
          <option value="carmel">Carmel</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading && !data && (
        <div className="text-center py-20 text-neutral-400 text-sm">Loading funnel data...</div>
      )}

      {summary && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <StatCard label="Total Sessions" value={summary.total.toLocaleString()} color="violet" />
            <StatCard label="Completed" value={summary.completed.toLocaleString()} color="emerald" />
            <StatCard label="Abandoned" value={summary.abandoned.toLocaleString()} color="rose" />
            <StatCard label="Completion Rate" value={`${summary.completion_rate}%`} color="blue" />
            <StatCard label="Avg Time to Book" value={formatDuration(summary.avg_duration_ms)} color="neutral" />
          </div>

          {/* Flow Type Breakdown */}
          {data?.by_flow_type && Object.keys(data.by_flow_type).length > 1 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-neutral-700 mb-3">By Flow Type</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(data.by_flow_type).map(([ft, stats]) => (
                  <div key={ft} className="bg-white rounded-lg border p-3">
                    <p className="text-xs font-medium text-neutral-500 mb-1">{ft === 'modal' ? 'Modal' : 'Provider Picker'}</p>
                    <p className="text-lg font-bold">{stats.total}</p>
                    <p className="text-xs text-neutral-400">
                      {stats.completed} completed · {stats.abandoned} abandoned ·{' '}
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% rate
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Funnel */}
          {funnel.length > 0 && (
            <div className="bg-white rounded-lg border p-5 mb-8">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Conversion Funnel</h2>
              <div className="flex items-center gap-3 pb-2 mb-2 border-b text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
                <div className="w-28">Step</div>
                <div className="flex-1" />
                <div className="w-16 text-right">Count</div>
                <div className="w-14 text-right">% of Total</div>
                <div className="w-14 text-right">Drop-off</div>
              </div>
              {funnel.map((f) => (
                <FunnelBar key={f.step} step={f.step} count={f.count} pct={f.pct} maxCount={maxFunnelCount} dropOff={f.drop_off_pct} />
              ))}
            </div>
          )}

          {/* Abandon Breakdown */}
          {abandons.length > 0 && (
            <div className="bg-white rounded-lg border p-5 mb-8">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Abandon Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-neutral-500">
                      <SortHeader label="Step" sortKey="step" currentSort={abSort} onSort={(k, d) => setAbSort({ key: k, dir: d })} />
                      <SortHeader label="Count" sortKey="count" currentSort={abSort} onSort={(k, d) => setAbSort({ key: k, dir: d })} align="right" />
                      <SortHeader label="% of Abandons" sortKey="pct" currentSort={abSort} onSort={(k, d) => setAbSort({ key: k, dir: d })} align="right" />
                      <SortHeader label="Top Service" sortKey="top_service" currentSort={abSort} onSort={(k, d) => setAbSort({ key: k, dir: d })} />
                      <SortHeader label="Avg Time" sortKey="avg_time_ms" currentSort={abSort} onSort={(k, d) => setAbSort({ key: k, dir: d })} align="right" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAbandons.map((a) => (
                      <tr key={a.step} className="border-b border-neutral-50 hover:bg-neutral-50">
                        <td className="py-2 font-medium text-neutral-700">{a.step}</td>
                        <td className="py-2 text-right">{a.count}</td>
                        <td className="py-2 text-right text-rose-600">{a.pct}%</td>
                        <td className="py-2 pl-4 text-neutral-500 truncate max-w-[200px]">{a.top_service || '—'}</td>
                        <td className="py-2 text-right text-neutral-500">{formatDuration(a.avg_time_ms)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trends */}
          {trends.length > 1 && (
            <div className="bg-white rounded-lg border p-5 mb-8">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Daily Trends</h2>
              <div className="flex items-end gap-0.5 h-32">
                {trends.map((t) => {
                  const maxSessions = Math.max(...trends.map((x) => x.sessions), 1)
                  const height = (t.sessions / maxSessions) * 100
                  const completedHeight = t.sessions > 0 ? (t.completed / t.sessions) * height : 0
                  return (
                    <div key={t.date} className="flex-1 flex flex-col items-stretch justify-end h-full group relative">
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                        {t.date}: {t.sessions}s / {t.completed}c / {t.abandoned}a
                      </div>
                      <div className="rounded-t bg-neutral-200" style={{ height: `${height - completedHeight}%`, minHeight: t.sessions > 0 ? '2px' : 0 }} />
                      <div className="bg-violet-500 rounded-b" style={{ height: `${completedHeight}%`, minHeight: t.completed > 0 ? '2px' : 0 }} />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-neutral-400">
                <span>{trends[0]?.date}</span>
                <span className="flex items-center gap-3">
                  <span className="inline-block w-2 h-2 bg-neutral-200 rounded-sm" /> Sessions
                  <span className="inline-block w-2 h-2 bg-violet-500 rounded-sm" /> Completed
                </span>
                <span>{trends[trends.length - 1]?.date}</span>
              </div>
            </div>
          )}

          {/* Recent Abandoned Sessions */}
          {sessions?.data?.length > 0 && (
            <div className="bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-700">Recent Abandoned Sessions</h2>
                <span className="text-xs text-neutral-400">{sessions.total} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-neutral-500">
                      <SortHeader label="Time" sortKey="started_at" currentSort={sesSort} onSort={(k, d) => setSesSort({ key: k, dir: d })} />
                      <SortHeader label="Flow" sortKey="flow_type" currentSort={sesSort} onSort={(k, d) => setSesSort({ key: k, dir: d })} />
                      <SortHeader label="Abandon Step" sortKey="abandon_step" currentSort={sesSort} onSort={(k, d) => setSesSort({ key: k, dir: d })} />
                      <SortHeader label="Service" sortKey="service_name" currentSort={sesSort} onSort={(k, d) => setSesSort({ key: k, dir: d })} />
                      <SortHeader label="Provider" sortKey="provider_name" currentSort={sesSort} onSort={(k, d) => setSesSort({ key: k, dir: d })} />
                      <SortHeader label="Location" sortKey="location_key" currentSort={sesSort} onSort={(k, d) => setSesSort({ key: k, dir: d })} />
                      <SortHeader label="Duration" sortKey="duration_ms" currentSort={sesSort} onSort={(k, d) => setSesSort({ key: k, dir: d })} align="right" />
                      <th className="text-left py-2 font-medium text-neutral-500">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSessions.map((s) => (
                      <tr key={s.session_id} className="border-b border-neutral-50 hover:bg-neutral-50">
                        <td className="py-2 text-neutral-600 whitespace-nowrap">{formatTime(s.started_at)}</td>
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${s.flow_type === 'modal' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {s.flow_type === 'modal' ? 'Modal' : 'Picker'}
                          </span>
                        </td>
                        <td className="py-2 font-medium text-rose-600">{s.abandon_step || '—'}</td>
                        <td className="py-2 text-neutral-600 truncate max-w-[140px]">{s.service_name || '—'}</td>
                        <td className="py-2 text-neutral-600 truncate max-w-[120px]">{s.provider_name || '—'}</td>
                        <td className="py-2 text-neutral-500">{s.location_key || '—'}</td>
                        <td className="py-2 text-right text-neutral-500">{formatDuration(s.duration_ms)}</td>
                        <td className="py-2">
                          {(s.contact_phone || s.contact_email) ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">Re-engage</span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {sessions.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 text-xs rounded border disabled:opacity-30"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1 text-xs text-neutral-500">
                    {page} / {sessions.pages}
                  </span>
                  <button
                    disabled={page >= sessions.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 text-xs rounded border disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {summary.total === 0 && (
            <div className="text-center py-20">
              <p className="text-neutral-400 text-sm">No booking sessions recorded yet.</p>
              <p className="text-neutral-300 text-xs mt-1">Sessions will appear here once users interact with the booking flow.</p>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}
