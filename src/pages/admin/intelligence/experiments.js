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

const EXPERIMENTS = [
  { id: 'thisorthat_v1', label: 'This or That' },
  { id: 'reveal_v1', label: 'Reveal Board' },
]

// Human-readable event labels + icons
const EVENT_META = {
  reveal_page_view:       { label: 'Opened page',         icon: '👁' },
  reveal_filter_submit:   { label: 'Submitted filters',   icon: '🔍' },
  reveal_board_loaded:    { label: 'Board loaded',        icon: '📋' },
  reveal_tile_tap:        { label: 'Tapped a tile',       icon: '👆' },
  reveal_slot_taken:      { label: 'Slot already taken',  icon: '⚠️' },
  reveal_booking_start:   { label: 'Started booking',     icon: '🛒' },
  reveal_booking_complete:{ label: 'Completed booking',   icon: '✅' },
  reveal_show_more:       { label: 'Tapped Show More',    icon: '➕' },
  reveal_alternative_tap: { label: 'Tapped alternative',  icon: '🔄' },
  experiment_view:        { label: 'Viewed page',         icon: '👁' },
  experiment_start:       { label: 'Started quiz',        icon: '▶️' },
  experiment_swipe:       { label: 'Swiped',              icon: '👆' },
  experiment_results_view:{ label: 'Viewed results',      icon: '📊' },
  experiment_booking_start:    { label: 'Started booking', icon: '🛒' },
  experiment_booking_complete: { label: 'Completed booking', icon: '✅' },
}

function formatMetadata(meta) {
  if (!meta || typeof meta !== 'object') return null
  const parts = []
  if (meta.locations) parts.push(`Location: ${Array.isArray(meta.locations) ? meta.locations.join(', ') : meta.locations}`)
  if (meta.location) parts.push(`Location: ${meta.location}`)
  if (meta.services) parts.push(`Services: ${Array.isArray(meta.services) ? meta.services.join(', ') : meta.services}`)
  if (meta.service) parts.push(`Service: ${meta.service}`)
  if (meta.provider && meta.provider !== 'any') parts.push(`Provider: ${meta.provider}`)
  if (meta.timeOfDay && meta.timeOfDay !== 'any') parts.push(`Time: ${meta.timeOfDay}`)
  if (meta.date) parts.push(`Date: ${meta.date}`)
  if (meta.time) parts.push(`Time: ${meta.time}`)
  if (meta.position !== undefined) parts.push(`Position: #${meta.position + 1}`)
  if (meta.tileCount) parts.push(`${meta.tileCount} tiles`)
  if (meta.loadTimeMs) parts.push(`${meta.loadTimeMs}ms load`)
  if (meta.tilesShown) parts.push(`${meta.tilesShown} tiles shown`)
  if (meta.alternativeIndex !== undefined) parts.push(`Alt #${meta.alternativeIndex + 1}`)
  if (meta.appointmentId) parts.push(`Appt: ${meta.appointmentId}`)
  if (meta.utm_source) parts.push(`Source: ${meta.utm_source}`)
  if (meta.utm_campaign) parts.push(`Campaign: ${meta.utm_campaign}`)
  return parts.length > 0 ? parts : null
}

function SessionDrawer({ sessionId, onClose, formatDuration }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    fetch(`/api/admin/intelligence/session-events?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [sessionId])

  const session = data?.session
  const events = data?.events || []

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold">Session Detail</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">&times;</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-neutral-400">Loading...</div>
        ) : !session ? (
          <div className="flex-1 flex items-center justify-center text-neutral-400">Session not found</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            {/* Session summary */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs text-neutral-500">Started</p>
                <p className="text-sm font-medium">{new Date(session.started_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs text-neutral-500">Duration</p>
                <p className="text-sm font-medium">{formatDuration(session.duration_ms)}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs text-neutral-500">Outcome</p>
                <p className={`text-sm font-medium ${
                  session.outcome === 'booked' ? 'text-emerald-700' :
                  session.outcome === 'abandoned' ? 'text-rose-600' :
                  'text-neutral-700'
                }`}>{session.outcome || 'in_progress'}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs text-neutral-500">Source</p>
                <p className="text-sm font-medium">{session.utm_source || 'direct'}{session.utm_campaign ? ` / ${session.utm_campaign}` : ''}</p>
              </div>
            </div>

            {/* Client info */}
            {(session.client_name || session.client_email || session.contact_phone) && (
              <div className="bg-violet-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-violet-500 font-medium mb-1">Client</p>
                {session.client_name && <p className="text-sm font-semibold text-violet-900">{session.client_name}</p>}
                {session.client_email && <p className="text-sm text-violet-700">{session.client_email}</p>}
                {session.contact_phone && <p className="text-sm text-violet-700">{session.contact_phone}</p>}
                {session.blvd_client_id && <p className="text-xs text-violet-400 mt-1">BLVD: {session.blvd_client_id}</p>}
              </div>
            )}

            {/* Booking info */}
            {session.booking_service && (
              <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-emerald-500 font-medium mb-1">Booking</p>
                <p className="text-sm font-semibold text-emerald-900 capitalize">{session.booking_service}</p>
                {session.booking_location && <p className="text-sm text-emerald-700 capitalize">{session.booking_location}</p>}
                {session.booking_provider && <p className="text-sm text-emerald-700">{session.booking_provider}</p>}
                {session.appointment_id && <p className="text-xs text-emerald-400 mt-1">Appt: {session.appointment_id}</p>}
              </div>
            )}

            {/* Event timeline */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">Journey Timeline ({events.length} events)</h4>
              {events.length === 0 ? (
                <p className="text-sm text-neutral-400">No events recorded for this session.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-neutral-200">
                  {events.map((evt, i) => {
                    const meta = EVENT_META[evt.event_name] || { label: evt.event_name, icon: '·' }
                    const details = formatMetadata(evt.metadata)
                    const time = new Date(evt.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
                    return (
                      <div key={evt.id || i} className="relative mb-4 last:mb-0">
                        {/* Dot on timeline */}
                        <div className="absolute -left-[calc(0.75rem+1px)] top-1 w-4 h-4 rounded-full bg-white border-2 border-violet-400 flex items-center justify-center text-[8px]">
                          {meta.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-800">{meta.label}</span>
                            <span className="text-[10px] text-neutral-400">{time}</span>
                          </div>
                          {details && (
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              {details.map((d, j) => (
                                <span key={j} className="inline-block bg-neutral-100 text-neutral-600 text-[11px] px-1.5 py-0.5 rounded">
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Raw session ID */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-[10px] text-neutral-400 break-all">Session: {session.session_id}</p>
              {session.device_id && <p className="text-[10px] text-neutral-400 break-all">Device: {session.device_id}</p>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function ExperimentsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [experimentId, setExperimentId] = useState('reveal_v1')
  const [drawerSessionId, setDrawerSessionId] = useState(null)
  const [sortKey, setSortKey] = useState('started_at')
  const [sortDir, setSortDir] = useState('desc')
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
      const params = new URLSearchParams({ from: dateFrom, to: dateTo, experiment_id: experimentId })
      const res = await fetch(`/api/admin/intelligence/experiments?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, experimentId])

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

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sortArrow = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const sortedRecent = [...(data?.recent || [])].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey]
    if (av == null) av = ''
    if (bv == null) bv = ''
    if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
    const as = String(av), bs = String(bv)
    return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
  })

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Experiments</h1>
            <div className="flex items-center gap-2 mt-2">
              {EXPERIMENTS.map(exp => (
                <button
                  key={exp.id}
                  onClick={() => setExperimentId(exp.id)}
                  className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${
                    experimentId === exp.id
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-violet-300'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
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
            {data.isReveal ? (
              <>
                <StatCard value={`${s.booked} (${s.bookingRate}%)`} label="Bookings" accent="emerald" />
                <StatCard value={data.funnel?.tileTap || 0} label="Tile Taps" accent="blue" />
                <StatCard value={data.funnel?.boardLoaded || 0} label="Boards Shown" accent="amber" />
                <StatCard value={data.revealExtras?.slotsTaken || 0} label="Slots Taken" accent="rose" />
                <StatCard value={formatDuration(s.avgDurationMs)} label="Avg Duration" accent="violet" />
              </>
            ) : (
              <>
                <StatCard value={`${s.completed} (${s.completionRate}%)`} label="Quiz Completions" accent="blue" />
                <StatCard value={`${s.booked} (${s.bookingRate}%)`} label="Bookings" accent="emerald" />
                <StatCard value={s.membershipClicked} label="Membership Clicks" accent="amber" />
                <StatCard value={s.heavyResponders} label="Heavy Responders" accent="rose" />
                <StatCard value={formatDuration(s.avgDurationMs)} label="Avg Duration" accent="violet" />
              </>
            )}
          </div>

          {/* Goals */}
          <div className="bg-white rounded-lg border p-5 mb-8">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Campaign Goals</h2>
            {data.isReveal ? (
              <>
                <GoalBar label="Bookings" current={data.goals.bookings.current} target={data.goals.bookings.target} />
                <GoalBar label="Tile Taps" current={data.goals.tileTaps.current} target={data.goals.tileTaps.target} />
                <GoalBar label="Board Views" current={data.goals.boardViews.current} target={data.goals.boardViews.target} />
              </>
            ) : (
              <>
                <GoalBar label="Bookings" current={data.goals.bookings.current} target={data.goals.bookings.target} />
                <GoalBar label="Membership Clicks" current={data.goals.memberships.current} target={data.goals.memberships.target} />
                <GoalBar label="Laser Hair Starts" current={data.goals.laserStarts.current} target={data.goals.laserStarts.target} />
              </>
            )}
          </div>

          {/* Funnel */}
          <div className="bg-white rounded-lg border p-5 mb-8">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Live Funnel</h2>
            {data.isReveal ? (
              <>
                <FunnelRow label="Page View" count={funnel.pageView} total={funnel.pageView || 1} />
                <FunnelRow label="Filter Submit" count={funnel.filterSubmit} total={funnel.pageView || 1} />
                <FunnelRow label="Board Loaded" count={funnel.boardLoaded} total={funnel.pageView || 1} />
                <FunnelRow label="Tile Tap" count={funnel.tileTap} total={funnel.pageView || 1} />
                <FunnelRow label="Booking Start" count={funnel.bookingStart} total={funnel.pageView || 1} />
                <FunnelRow label="Booking Complete" count={funnel.bookingComplete} total={funnel.pageView || 1} />
              </>
            ) : (
              <>
                <FunnelRow label="Page View" count={funnel.view} total={funnelTotal} />
                <FunnelRow label="Tap Start" count={funnel.start} total={funnelTotal} />
                <FunnelRow label="Swipes (total)" count={funnel.swipes} total={funnel.swipes || 1} />
                <FunnelRow label="Results Shown" count={funnel.results} total={funnelTotal} />
                <FunnelRow label="Book CTA Tap" count={funnel.bookingStart} total={funnelTotal} />
                <FunnelRow label="Booking Complete" count={funnel.bookingComplete} total={funnelTotal} />
              </>
            )}
          </div>

          <div className={`grid grid-cols-1 ${data.isReveal ? '' : 'lg:grid-cols-2'} gap-8 mb-8`}>
            {/* Persona distribution (This or That only) */}
            {!data.isReveal && (
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
            )}

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
                    <th className="text-left py-2 pr-4 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('started_at')}>Time{sortArrow('started_at')}</th>
                    {!data.isReveal && <th className="text-left py-2 pr-4 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('persona_name')}>Persona{sortArrow('persona_name')}</th>}
                    <th className="text-left py-2 pr-4 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('client_name')}>Client{sortArrow('client_name')}</th>
                    <th className="text-left py-2 pr-4 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('outcome')}>Outcome{sortArrow('outcome')}</th>
                    <th className="text-center py-2 pr-4 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('event_count')}>Steps{sortArrow('event_count')}</th>
                    <th className="text-left py-2 pr-4 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('last_event')}>Last Step{sortArrow('last_event')}</th>
                    <th className="text-left py-2 pr-4 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('booking_service')}>Service{sortArrow('booking_service')}</th>
                    <th className="text-left py-2 pr-4 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('booking_location')}>Location{sortArrow('booking_location')}</th>
                    {data.isReveal && <th className="text-left py-2 pr-4 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('utm_source')}>Source{sortArrow('utm_source')}</th>}
                    <th className="text-right py-2 cursor-pointer select-none hover:text-violet-600" onClick={() => toggleSort('duration_ms')}>Duration{sortArrow('duration_ms')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecent.map(s => (
                    <tr key={s.session_id} className="border-b border-neutral-50 hover:bg-violet-50 cursor-pointer transition-colors" onClick={() => setDrawerSessionId(s.session_id)}>
                      <td className="py-2 pr-4 text-xs text-neutral-500 whitespace-nowrap">
                        {new Date(s.started_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </td>
                      {!data.isReveal && <td className="py-2 pr-4 whitespace-nowrap">{s.persona_name || '—'}</td>}
                      <td className="py-2 pr-4">
                        {s.client_name ? (
                          <div>
                            <p className="text-sm font-medium text-neutral-800">{s.client_name}</p>
                            {s.contact_phone && <p className="text-xs text-neutral-400">{s.contact_phone}</p>}
                          </div>
                        ) : s.contact_phone ? (
                          <span className="text-xs text-neutral-500">{s.contact_phone}</span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
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
                      <td className="py-2 pr-4 text-center">
                        <span className={`inline-block min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          s.event_count >= 5 ? 'bg-violet-100 text-violet-700' :
                          s.event_count >= 2 ? 'bg-neutral-100 text-neutral-600' :
                          'bg-neutral-50 text-neutral-400'
                        }`}>
                          {s.event_count}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-neutral-500 whitespace-nowrap">
                        {s.last_event ? (EVENT_META[s.last_event]?.label || s.last_event.replace(/_/g, ' ')) : '—'}
                      </td>
                      <td className="py-2 pr-4 text-neutral-600">{s.booking_service || '—'}</td>
                      <td className="py-2 pr-4 text-neutral-600 capitalize">{s.booking_location || '—'}</td>
                      {data.isReveal && <td className="py-2 pr-4 text-neutral-500 text-xs">{s.utm_source || 'direct'}</td>}
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

      {/* Session detail drawer */}
      {drawerSessionId && (
        <SessionDrawer
          sessionId={drawerSessionId}
          onClose={() => setDrawerSessionId(null)}
          formatDuration={formatDuration}
        />
      )}
    </AdminLayout>
  )
}
