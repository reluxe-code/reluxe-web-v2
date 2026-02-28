// src/pages/admin/intelligence/audit.js
// Site Audit dashboard — errors, 404s, login failures, booking fallbacks.
import { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

const EVENT_TYPES = [
  { value: 'all', label: 'All Events' },
  { value: 'error', label: 'JS Errors', color: '#EF4444' },
  { value: 'unhandled_rejection', label: 'Unhandled Rejections', color: '#F97316' },
  { value: '404', label: '404 Not Found', color: '#EAB308' },
  { value: 'login_failure', label: 'Login Failures', color: '#8B5CF6' },
  { value: 'booking_fallback', label: 'Booking Fallbacks', color: '#3B82F6' },
  { value: 'booking_error', label: 'Booking Errors', color: '#EC4899' },
]

const TIME_RANGES = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]

function getBadgeColor(type) {
  const found = EVENT_TYPES.find(t => t.value === type)
  return found?.color || '#6B7280'
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-2xl font-bold" style={{ color: color || '#111' }}>{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function AuditDashboard() {
  const [events, setEvents] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({})
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toggling, setToggling] = useState(false)

  // Filters
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeRange, setTimeRange] = useState('24h')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState(null)

  const searchTimeout = useRef(null)
  const refreshInterval = useRef(null)

  const loadData = useCallback(async (silent) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        since: timeRange,
        page: String(page),
        per_page: '50',
      })
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/audit/events?${params}`)
      if (!res.ok) {
        const text = await res.text()
        let msg = 'Failed to load'
        try { msg = JSON.parse(text).error || msg } catch {}
        throw new Error(msg)
      }
      const data = await res.json()
      setEvents(data.events)
      setTotal(data.total)
      setStats(data.stats || {})
      setEnabled(data.enabled)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, timeRange, search, page])

  useEffect(() => { loadData() }, [loadData])

  // Auto-refresh every 30s
  useEffect(() => {
    refreshInterval.current = setInterval(() => loadData(true), 30000)
    return () => clearInterval(refreshInterval.current)
  }, [loadData])

  // Debounced search
  const handleSearchChange = (val) => {
    setSearch(val)
    setPage(1)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => loadData(), 400)
  }

  const handleToggle = async () => {
    setToggling(true)
    try {
      const res = await fetch('/api/admin/audit/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      })
      if (!res.ok) throw new Error('Toggle failed')
      setEnabled(!enabled)
    } catch (e) {
      setError(e.message)
    } finally {
      setToggling(false)
    }
  }

  const totalEvents = Object.values(stats).reduce((a, b) => a + b, 0)
  const totalPages = Math.ceil(total / 50)

  return (
    <AdminLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Site Audit</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Client-side errors, 404s, login failures, and booking fallback usage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">Tracking</span>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded border text-neutral-600 hover:bg-neutral-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Total" value={totalEvents} />
        <StatCard label="JS Errors" value={stats.error || 0} color="#EF4444" />
        <StatCard label="404s" value={stats['404'] || 0} color="#EAB308" />
        <StatCard label="Login Failures" value={stats.login_failure || 0} color="#8B5CF6" />
        <StatCard label="Booking Fallbacks" value={stats.booking_fallback || 0} color="#3B82F6" />
        <StatCard label="Booking Errors" value={stats.booking_error || 0} color="#EC4899" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="text-sm border rounded px-3 py-1.5 bg-white"
        >
          {EVENT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={timeRange}
          onChange={(e) => { setTimeRange(e.target.value); setPage(1) }}
          className="text-sm border rounded px-3 py-1.5 bg-white"
        >
          {TIME_RANGES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="text-sm border rounded px-3 py-1.5 bg-white w-56"
        />

        <span className="text-xs text-neutral-400 ml-auto">
          {total} event{total !== 1 ? 's' : ''} found
          {enabled ? '' : ' (tracking paused)'}
        </span>
      </div>

      {/* Event table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-neutral-600">Time</th>
              <th className="text-left px-4 py-2 font-medium text-neutral-600">Type</th>
              <th className="text-left px-4 py-2 font-medium text-neutral-600">Message</th>
              <th className="text-left px-4 py-2 font-medium text-neutral-600 hidden lg:table-cell">URL</th>
              <th className="text-left px-4 py-2 font-medium text-neutral-600 hidden lg:table-cell">Device</th>
            </tr>
          </thead>
          <tbody>
            {loading && events.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">Loading...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No events found</td></tr>
            ) : events.map((evt) => (
              <tr
                key={evt.id}
                className="border-b hover:bg-neutral-50 cursor-pointer"
                onClick={() => setExpandedId(expandedId === evt.id ? null : evt.id)}
              >
                <td className="px-4 py-2 whitespace-nowrap text-neutral-500">{formatTime(evt.created_at)}</td>
                <td className="px-4 py-2">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: getBadgeColor(evt.event_type) }}
                  >
                    {evt.event_type}
                  </span>
                </td>
                <td className="px-4 py-2 max-w-xs truncate" title={evt.message}>{evt.message || '—'}</td>
                <td className="px-4 py-2 max-w-[200px] truncate text-neutral-400 hidden lg:table-cell" title={evt.url}>
                  {evt.url ? (() => { try { return new URL(evt.url).pathname } catch { return evt.url } })() : '—'}
                </td>
                <td className="px-4 py-2 text-neutral-400 hidden lg:table-cell">{evt.device_id?.slice(0, 8) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Expanded detail */}
        {expandedId && (() => {
          const evt = events.find(e => e.id === expandedId)
          if (!evt) return null
          return (
            <div className="border-t bg-neutral-50 px-6 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div><span className="font-semibold text-neutral-600">Full URL:</span> <span className="text-neutral-500 break-all">{evt.url}</span></div>
                <div><span className="font-semibold text-neutral-600">Device ID:</span> <span className="text-neutral-500">{evt.device_id}</span></div>
                <div><span className="font-semibold text-neutral-600">User Agent:</span> <span className="text-neutral-500 break-all">{evt.user_agent?.slice(0, 150)}</span></div>
                <div><span className="font-semibold text-neutral-600">Member ID:</span> <span className="text-neutral-500">{evt.member_id || 'anonymous'}</span></div>
              </div>
              {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                <div>
                  <span className="font-semibold text-neutral-600">Metadata:</span>
                  <pre className="mt-1 bg-white border rounded p-2 text-xs text-neutral-600 overflow-x-auto">
                    {JSON.stringify(evt.metadata, null, 2)}
                  </pre>
                </div>
              )}
              <div className="mt-2">
                <span className="font-semibold text-neutral-600">Full Message:</span>
                <p className="mt-0.5 text-neutral-500 whitespace-pre-wrap">{evt.message}</p>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-sm px-3 py-1.5 rounded border text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-sm px-3 py-1.5 rounded border text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </AdminLayout>
  )
}

AuditDashboard.getLayout = (page) => page
