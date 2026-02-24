// src/pages/admin/intelligence/experiments.js
// Real-time experiment dashboard for "This or That" campaign.
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function StatCard({ value, label, accent = 'violet' }) {
  const borderColors = {
    violet: 'border-l-violet-500',
    emerald: 'border-l-emerald-500',
    rose: 'border-l-rose-500',
    amber: 'border-l-amber-500',
    blue: 'border-l-blue-500',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[accent] || borderColors.violet} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
    </div>
  )
}

function GoalBar({ label, current, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-neutral-500">{current} / {target} ({pct}%)</span>
      </div>
      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #7C3AED, #C026D3)',
          }}
        />
      </div>
    </div>
  )
}

function FunnelRow({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-32 text-xs text-neutral-600 text-right truncate">{label}</div>
      <div className="flex-1 h-6 bg-neutral-50 rounded overflow-hidden relative">
        <div
          className="h-full rounded"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #7C3AED, #C026D3)',
            minWidth: count > 0 ? 4 : 0,
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {count} ({pct}%)
        </span>
      </div>
    </div>
  )
}

export default function ExperimentsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ from: dateFrom, to: dateTo })
      const res = await fetch(`/api/admin/intelligence/experiments?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 30s
  useEffect(() => {
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [load])

  const s = data?.summary || {}
  const funnel = data?.funnel || {}
  const funnelTotal = funnel.view || 1

  function formatDuration(ms) {
    if (!ms) return '—'
    const secs = Math.round(ms / 1000)
    if (secs < 60) return `${secs}s`
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Experiments</h1>
            <p className="text-sm text-neutral-500 mt-1">
              This or That campaign — real-time performance tracker
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            />
            <span className="text-neutral-400">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            />
            <button
              onClick={load}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? '...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading && !data && (
        <p className="text-center text-neutral-400 py-12">Loading experiment data...</p>
      )}

      {data && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <StatCard value={s.total} label="Total Sessions" accent="violet" />
            <StatCard value={`${s.completed} (${s.completionRate}%)`} label="Quiz Completions" accent="blue" />
            <StatCard value={`${s.booked} (${s.bookingRate}%)`} label="Bookings" accent="emerald" />
            <StatCard value={s.membershipClicked} label="Membership Clicks" accent="amber" />
            <StatCard value={s.heavyResponders} label="Heavy Responders" accent="rose" />
            <StatCard value={formatDuration(s.avgDurationMs)} label="Avg Duration" accent="violet" />
          </div>

          {/* Goals */}
          <div className="bg-white rounded-lg border p-5 mb-8">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Campaign Goals</h2>
            <GoalBar label="Bookings" current={data.goals.bookings.current} target={data.goals.bookings.target} />
            <GoalBar label="Membership Clicks" current={data.goals.memberships.current} target={data.goals.memberships.target} />
            <GoalBar label="Laser Hair Starts" current={data.goals.laserStarts.current} target={data.goals.laserStarts.target} />
          </div>

          {/* Funnel */}
          <div className="bg-white rounded-lg border p-5 mb-8">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Live Funnel</h2>
            <FunnelRow label="Page View" count={funnel.view} total={funnelTotal} />
            <FunnelRow label="Tap Start" count={funnel.start} total={funnelTotal} />
            <FunnelRow label="Swipes (total)" count={funnel.swipes} total={funnel.swipes || 1} />
            <FunnelRow label="Results Shown" count={funnel.results} total={funnelTotal} />
            <FunnelRow label="Book CTA Tap" count={funnel.bookingStart} total={funnelTotal} />
            <FunnelRow label="Booking Complete" count={funnel.bookingComplete} total={funnelTotal} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Persona distribution */}
            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Persona Distribution</h2>
              {Object.entries(data.personas || {}).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
                const pct = data.summary.completed > 0 ? Math.round((count / data.summary.completed) * 100) : 0
                return (
                  <div key={name} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{name}</span>
                      <span className="text-neutral-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {Object.keys(data.personas || {}).length === 0 && (
                <p className="text-sm text-neutral-400">No completions yet.</p>
              )}
            </div>

            {/* Service breakdown */}
            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Service Breakdown</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-neutral-500">
                    <th className="text-left py-2">Service</th>
                    <th className="text-right py-2">Recommended</th>
                    <th className="text-right py-2">Booked</th>
                    <th className="text-right py-2">Conv %</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys({ ...data.services.recommended, ...data.services.booked })
                    .sort((a, b) => (data.services.recommended[b] || 0) - (data.services.recommended[a] || 0))
                    .map(slug => {
                      const rec = data.services.recommended[slug] || 0
                      const bk = data.services.booked[slug] || 0
                      const conv = rec > 0 ? Math.round((bk / rec) * 100) : 0
                      return (
                        <tr key={slug} className="border-b border-neutral-50">
                          <td className="py-2 font-medium">{slug}</td>
                          <td className="py-2 text-right">{rec}</td>
                          <td className="py-2 text-right">{bk}</td>
                          <td className="py-2 text-right">{conv}%</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
              {Object.keys(data.services.recommended || {}).length === 0 && (
                <p className="text-sm text-neutral-400 mt-2">No data yet.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Location split */}
            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Location Split</h2>
              {Object.entries(data.locations || {}).length > 0 ? (
                <div className="flex gap-4">
                  {Object.entries(data.locations).map(([loc, count]) => (
                    <div key={loc} className="flex-1 bg-neutral-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-neutral-500 mt-1 capitalize">{loc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400">No bookings yet.</p>
              )}
            </div>

            {/* UTM Sources */}
            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Traffic Sources</h2>
              {Object.entries(data.utmSources || {}).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
                <div key={src} className="flex justify-between text-sm py-1.5 border-b border-neutral-50">
                  <span>{src}</span>
                  <span className="text-neutral-500">{count}</span>
                </div>
              ))}
              {Object.keys(data.utmSources || {}).length === 0 && (
                <p className="text-sm text-neutral-400">No data yet.</p>
              )}
            </div>
          </div>

          {/* Abandon phase breakdown */}
          {Object.keys(data.abandonPhases || {}).length > 0 && (
            <div className="bg-white rounded-lg border p-5 mb-8">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Abandon Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.abandonPhases).sort((a, b) => b[1] - a[1]).map(([phase, count]) => (
                  <div key={phase} className="bg-rose-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-rose-700">{count}</p>
                    <p className="text-xs text-rose-500 mt-0.5">{phase.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent sessions */}
          <div className="bg-white rounded-lg border p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Recent Sessions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-neutral-500">
                    <th className="text-left py-2 pr-4">Time</th>
                    <th className="text-left py-2 pr-4">Persona</th>
                    <th className="text-left py-2 pr-4">Outcome</th>
                    <th className="text-left py-2 pr-4">Service</th>
                    <th className="text-left py-2 pr-4">Location</th>
                    <th className="text-right py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recent || []).map(s => (
                    <tr key={s.session_id} className="border-b border-neutral-50 hover:bg-neutral-50">
                      <td className="py-2 pr-4 text-xs text-neutral-500 whitespace-nowrap">
                        {new Date(s.started_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">{s.persona_name || '—'}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.outcome === 'booked' ? 'bg-emerald-50 text-emerald-700' :
                          s.outcome === 'completed_quiz' ? 'bg-blue-50 text-blue-700' :
                          s.outcome === 'abandoned' ? 'bg-rose-50 text-rose-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {s.outcome || 'in_progress'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-neutral-600">{s.booking_service || '—'}</td>
                      <td className="py-2 pr-4 text-neutral-600 capitalize">{s.booking_location || '—'}</td>
                      <td className="py-2 text-right text-neutral-500">{formatDuration(s.duration_ms)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(data.recent || []).length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-6">No sessions yet. Share the link and watch them roll in.</p>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
