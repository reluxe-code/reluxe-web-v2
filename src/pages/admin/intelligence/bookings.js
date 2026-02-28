// src/pages/admin/intelligence/bookings.js
// Bookings Intelligence — unified view of online + in-office bookings with detail drawer.
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

// ─── Source badge colors ───
const SOURCE_COLORS = {
  'Today Widget': { bg: '#DBEAFE', text: '#1D4ED8' },
  'Reveal Board': { bg: '#F3E8FF', text: '#7C3AED' },
  'Service Page': { bg: '#D1FAE5', text: '#047857' },
  'Provider Page': { bg: '#FEF3C7', text: '#B45309' },
  'Location Page': { bg: '#E0E7FF', text: '#4338CA' },
  'Homepage': { bg: '#F1F5F9', text: '#475569' },
  'Start Flow': { bg: '#FCE7F3', text: '#BE185D' },
  'In-Office': { bg: '#FED7AA', text: '#C2410C' },
  'Other': { bg: '#F3F4F6', text: '#6B7280' },
  'Unknown': { bg: '#F3F4F6', text: '#6B7280' },
}

function SourceBadge({ source }) {
  const c = SOURCE_COLORS[source] || SOURCE_COLORS.Other
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap" style={{ backgroundColor: c.bg, color: c.text }}>
      {source}
    </span>
  )
}

function TypeBadge({ type }) {
  return type === 'online'
    ? <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-600">Online</span>
    : <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-700">In-Office</span>
}

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    violet: 'border-l-violet-500', emerald: 'border-l-emerald-500',
    blue: 'border-l-blue-500', amber: 'border-l-amber-500',
    neutral: 'border-l-neutral-400', rose: 'border-l-rose-500',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

function SortHeader({ label, sortKey, currentSort, onSort, align = 'left' }) {
  const active = currentSort.key === sortKey
  const arrow = active ? (currentSort.dir === 'asc' ? ' ↑' : ' ↓') : ''
  return (
    <th
      className={`text-${align} py-2 px-3 font-medium cursor-pointer select-none hover:text-neutral-800 transition-colors text-xs ${active ? 'text-neutral-900' : 'text-neutral-500'}`}
      onClick={() => onSort(sortKey, active && currentSort.dir === 'asc' ? 'desc' : 'asc')}
    >
      {label}{arrow}
    </th>
  )
}

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch { return iso }
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return iso }
}

function formatDuration(ms) {
  if (!ms) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const remaining = s % 60
  return remaining > 0 ? `${m}m ${remaining}s` : `${m}m`
}

function formatCurrency(val) {
  if (!val && val !== 0) return '—'
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ─── Detail Drawer ───

function DetailDrawer({ booking, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!booking) return
    setLoading(true)
    const params = booking.type === 'online'
      ? `session_id=${booking.session_id}`
      : `appointment_id=${booking.blvd_appointment_id}`

    fetch(`/api/admin/intelligence/booking-detail?${params}`)
      .then(r => r.json())
      .then(data => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [booking])

  if (!booking) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <TypeBadge type={booking.type} />
            <SourceBadge source={booking.source} />
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-lg">&times;</button>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="text-neutral-400 text-sm text-center py-10">Loading details...</p>
          ) : detail?.type === 'online' ? (
            <OnlineDetail detail={detail} booking={booking} />
          ) : detail?.type === 'in_office' ? (
            <InOfficeDetail detail={detail} />
          ) : (
            <p className="text-neutral-400 text-sm text-center py-10">Could not load details.</p>
          )}
        </div>
      </div>
    </>
  )
}

function OnlineDetail({ detail, booking }) {
  const { session, journey, source, events } = detail

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Booking Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-neutral-500">Service:</span> <span className="font-medium">{session.service_name || '—'}</span></div>
          <div><span className="text-neutral-500">Provider:</span> <span className="font-medium">{session.provider_name || '—'}</span></div>
          <div><span className="text-neutral-500">Location:</span> <span className="font-medium capitalize">{session.location_key || '—'}</span></div>
          <div><span className="text-neutral-500">Duration:</span> <span className="font-medium">{formatDuration(session.duration_ms)}</span></div>
          <div><span className="text-neutral-500">Booked At:</span> <span className="font-medium">{formatTime(session.completed_at)}</span></div>
          <div><span className="text-neutral-500">Flow:</span> <span className="font-medium">{session.flow_type === 'modal' ? 'Booking Modal' : 'Provider Picker'}</span></div>
        </div>
      </div>

      {/* Source */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Source</h3>
        <div className="flex items-center gap-2 text-xs">
          <SourceBadge source={source} />
          <span className="text-neutral-500">{session.page_path}</span>
        </div>
        {(session.utm_source || session.utm_medium || session.utm_campaign) && (
          <div className="mt-2 text-xs text-neutral-500">
            {session.utm_source && <span className="mr-3">src: <span className="font-medium">{session.utm_source}</span></span>}
            {session.utm_medium && <span className="mr-3">med: <span className="font-medium">{session.utm_medium}</span></span>}
            {session.utm_campaign && <span>camp: <span className="font-medium">{session.utm_campaign}</span></span>}
          </div>
        )}
      </div>

      {/* Contact */}
      {(session.contact_phone || session.contact_email) && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Contact</h3>
          <div className="text-xs text-neutral-600">
            {session.contact_phone && <div>{session.contact_phone}</div>}
            {session.contact_email && <div>{session.contact_email}</div>}
          </div>
        </div>
      )}

      {/* Step Journey */}
      {journey && journey.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Booking Journey</h3>
          <div className="relative pl-5">
            {journey.map((j, i) => {
              const isLast = i === journey.length - 1
              const isLongest = j.step === detail.longest_step && j.time_on_step > 0
              const isBooked = j.step === 'BOOKED'
              return (
                <div key={i} className="relative pb-4">
                  {/* Vertical line */}
                  {!isLast && (
                    <div className="absolute left-[-13px] top-3 bottom-0 w-px bg-neutral-200" />
                  )}
                  {/* Dot */}
                  <div className={`absolute left-[-17px] top-1 w-[9px] h-[9px] rounded-full border-2 ${isBooked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-violet-400'}`} />
                  {/* Content */}
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-semibold ${isBooked ? 'text-emerald-600' : 'text-neutral-700'}`}>
                      {j.step}
                      {isBooked && ' ✓'}
                    </span>
                    {j.time_on_step > 0 && (
                      <span className={`text-[10px] ${isLongest ? 'text-amber-600 font-semibold' : 'text-neutral-400'}`}>
                        {formatDuration(j.time_on_step)}
                        {isLongest && ' ← longest'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {new Date(j.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Event Log */}
      {events && events.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Event Log ({events.length})</h3>
          <div className="max-h-60 overflow-y-auto border rounded">
            <table className="w-full text-[10px]">
              <thead className="bg-neutral-50 sticky top-0">
                <tr>
                  <th className="text-left px-2 py-1 font-medium text-neutral-500">Time</th>
                  <th className="text-left px-2 py-1 font-medium text-neutral-500">Event</th>
                  <th className="text-left px-2 py-1 font-medium text-neutral-500">Step</th>
                  <th className="text-left px-2 py-1 font-medium text-neutral-500">Detail</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => {
                  const meta = e.metadata || {}
                  const detail = meta.service_name || meta.provider_name || meta.date || ''
                  return (
                    <tr key={i} className="border-t border-neutral-50">
                      <td className="px-2 py-1 text-neutral-400 whitespace-nowrap">
                        {new Date(e.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-2 py-1 font-medium text-neutral-700">{e.event_name}</td>
                      <td className="px-2 py-1 text-neutral-500">{e.step}</td>
                      <td className="px-2 py-1 text-neutral-400 truncate max-w-[120px]" title={detail}>{detail || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tracking */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Tracking</h3>
        <div className="text-[10px] text-neutral-400 space-y-0.5">
          <div>Session: {session.session_id}</div>
          <div>Device: {session.device_id || '—'}</div>
          {session.member_id && <div>Member: {session.member_id}</div>}
        </div>
      </div>
    </div>
  )
}

function InOfficeDetail({ detail }) {
  const { appointment, services, client, providers, total_price } = detail

  const providerMap = new Map()
  for (const p of providers || []) providerMap.set(p.id, p)

  return (
    <div className="space-y-6">
      {/* Client */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Client</h3>
        <div className="text-xs space-y-1">
          <div className="font-medium text-neutral-700">{client?.name || [client?.first_name, client?.last_name].filter(Boolean).join(' ') || 'Unknown'}</div>
          {client?.email && <div className="text-neutral-500">{client.email}</div>}
          {client?.phone && <div className="text-neutral-500">{client.phone}</div>}
          {client?.visit_count > 0 && <div className="text-neutral-400">{client.visit_count} total visits · {formatCurrency(client.total_spend)} lifetime</div>}
        </div>
      </div>

      {/* Appointment */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Appointment</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-neutral-500">Date:</span> <span className="font-medium">{formatDate(appointment.start_at)}</span></div>
          <div><span className="text-neutral-500">Time:</span> <span className="font-medium">{new Date(appointment.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span></div>
          <div><span className="text-neutral-500">Location:</span> <span className="font-medium capitalize">{appointment.location_key || '—'}</span></div>
          <div><span className="text-neutral-500">Status:</span> <span className="font-medium capitalize">{appointment.status}</span></div>
          <div><span className="text-neutral-500">Duration:</span> <span className="font-medium">{appointment.duration_minutes ? `${appointment.duration_minutes}min` : '—'}</span></div>
          <div><span className="text-neutral-500">Total:</span> <span className="font-medium">{formatCurrency(total_price)}</span></div>
        </div>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Services ({services.length})</h3>
          <div className="space-y-2">
            {services.map((s, i) => {
              const prov = s.provider_staff_id ? providerMap.get(s.provider_staff_id) : null
              return (
                <div key={i} className="border rounded p-3 text-xs">
                  <div className="font-medium text-neutral-700">{s.service_name}</div>
                  <div className="flex gap-4 mt-1 text-neutral-500">
                    {prov && <span>Provider: {prov.name}</span>}
                    {s.duration_minutes && <span>{s.duration_minutes}min</span>}
                    {s.price && <span>{formatCurrency(s.price)}</span>}
                  </div>
                  {s.service_slug && <div className="text-[10px] text-neutral-400 mt-0.5">Slug: {s.service_slug}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {appointment.notes && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Notes</h3>
          <p className="text-xs text-neutral-600 whitespace-pre-wrap">{appointment.notes}</p>
        </div>
      )}

      {/* Tracking */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Tracking</h3>
        <div className="text-[10px] text-neutral-400 space-y-0.5">
          <div>Boulevard ID: {appointment.boulevard_id}</div>
          {appointment.cancellation_reason && <div className="text-rose-500">Cancellation: {appointment.cancellation_reason}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───

export default function BookingsIntelligence() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Filters
  const [since, setSince] = useState('30d')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ key: null, dir: 'desc' })

  const searchTimeout = useRef(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        since,
        source: sourceFilter,
        page: String(page),
        per_page: '50',
      })
      if (locationFilter) params.set('location', locationFilter)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/intelligence/bookings?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [since, sourceFilter, locationFilter, search, page])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { setPage(1) }, [since, sourceFilter, locationFilter])

  const handleSearchChange = (val) => {
    setSearch(val)
    setPage(1)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => loadData(), 400)
  }

  const stats = data?.stats
  const bookings = data?.bookings || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 50)

  // Client-side sort
  const sortedBookings = useMemo(() => {
    const rows = [...bookings]
    if (!sort.key) return rows
    return rows.sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key]
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase() }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [bookings, sort])

  // Source breakdown for the bar chart
  const sourceEntries = stats?.by_source
    ? Object.entries(stats.by_source).sort((a, b) => b[1] - a[1])
    : []
  const maxSourceCount = sourceEntries.length > 0 ? sourceEntries[0][1] : 0

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          All bookings — online and in-office — with source tracking, step journeys, and client details.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['24h', '7d', '30d', '90d'].map(d => (
          <button
            key={d}
            onClick={() => setSince(d)}
            className={`px-3 py-1.5 text-xs rounded-full border transition ${since === d ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-neutral-600 border-neutral-200 hover:border-violet-300'}`}
          >
            {d}
          </button>
        ))}
        <span className="text-xs text-neutral-400 mx-1">|</span>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 bg-white text-neutral-600"
        >
          <option value="all">All Sources</option>
          <option value="online">Online Only</option>
          <option value="in_office">In-Office Only</option>
        </select>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 bg-white text-neutral-600"
        >
          <option value="">All Locations</option>
          <option value="westfield">Westfield</option>
          <option value="carmel">Carmel</option>
        </select>
        <input
          type="text"
          placeholder="Search service, provider, client..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 bg-white text-neutral-600 w-56"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading && !data && (
        <div className="text-center py-20 text-neutral-400 text-sm">Loading bookings...</div>
      )}

      {stats && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <StatCard label="Total Bookings" value={stats.total_bookings.toLocaleString()} color="violet" />
            <StatCard label="Online" value={stats.online.toLocaleString()} color="blue" />
            <StatCard label="In-Office" value={stats.in_office.toLocaleString()} color="amber" />
            <StatCard
              label="Top Source"
              value={sourceEntries[0]?.[0] || '—'}
              sub={sourceEntries[0] ? `${sourceEntries[0][1]} bookings` : undefined}
              color="emerald"
            />
            <StatCard
              label="Top Service"
              value={stats.top_services[0]?.name || '—'}
              sub={stats.top_services[0] ? `${stats.top_services[0].count} bookings` : undefined}
              color="rose"
            />
          </div>

          {/* Source Breakdown */}
          {sourceEntries.length > 1 && (
            <div className="bg-white rounded-lg border p-5 mb-8">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Booking Sources</h2>
              <div className="space-y-2">
                {sourceEntries.map(([src, count]) => {
                  const pct = maxSourceCount > 0 ? Math.max((count / maxSourceCount) * 100, 3) : 0
                  const c = SOURCE_COLORS[src] || SOURCE_COLORS.Other
                  return (
                    <div key={src} className="flex items-center gap-3">
                      <div className="w-28 text-xs font-medium text-neutral-600 truncate">{src}</div>
                      <div className="flex-1 relative">
                        <div className="h-5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.text + '20', borderLeft: `3px solid ${c.text}` }} />
                        </div>
                      </div>
                      <div className="w-12 text-right text-xs font-semibold text-neutral-700">{count}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h2 className="text-sm font-semibold text-neutral-700">All Bookings</h2>
              <span className="text-xs text-neutral-400">{total} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-neutral-50">
                    <SortHeader label="Booked" sortKey="booked_at" currentSort={sort} onSort={(k, d) => setSort({ key: k, dir: d })} />
                    <th className="text-left py-2 px-3 font-medium text-xs text-neutral-500">Type</th>
                    <SortHeader label="Service" sortKey="service" currentSort={sort} onSort={(k, d) => setSort({ key: k, dir: d })} />
                    <SortHeader label="Provider" sortKey="provider" currentSort={sort} onSort={(k, d) => setSort({ key: k, dir: d })} />
                    <SortHeader label="Location" sortKey="location" currentSort={sort} onSort={(k, d) => setSort({ key: k, dir: d })} />
                    <th className="text-left py-2 px-3 font-medium text-xs text-neutral-500">Source</th>
                    <SortHeader label="Client" sortKey="client_name" currentSort={sort} onSort={(k, d) => setSort({ key: k, dir: d })} />
                    <SortHeader label="Duration" sortKey="duration_ms" currentSort={sort} onSort={(k, d) => setSort({ key: k, dir: d })} align="right" />
                  </tr>
                </thead>
                <tbody>
                  {sortedBookings.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-10 text-center text-neutral-400">No bookings found</td></tr>
                  ) : sortedBookings.map(b => (
                    <tr
                      key={b.id}
                      className="border-b border-neutral-50 hover:bg-violet-50/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedBooking(b)}
                    >
                      <td className="py-2 px-3 text-neutral-600 whitespace-nowrap">{formatTime(b.booked_at)}</td>
                      <td className="py-2 px-3"><TypeBadge type={b.type} /></td>
                      <td className="py-2 px-3 text-neutral-700 font-medium truncate max-w-[160px]">{b.service || '—'}</td>
                      <td className="py-2 px-3 text-neutral-600 truncate max-w-[120px]">{b.provider || '—'}</td>
                      <td className="py-2 px-3 text-neutral-500 capitalize">{b.location || '—'}</td>
                      <td className="py-2 px-3"><SourceBadge source={b.source} /></td>
                      <td className="py-2 px-3 text-neutral-500 truncate max-w-[120px]">{b.client_name || '—'}</td>
                      <td className="py-2 px-3 text-right text-neutral-500">{b.type === 'online' ? formatDuration(b.duration_ms) : (b.duration_ms ? `${b.duration_ms / 60000}min` : '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 py-3 border-t">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 text-xs rounded border disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-xs text-neutral-500">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 text-xs rounded border disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail Drawer */}
      {selectedBooking && (
        <DetailDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </AdminLayout>
  )
}

BookingsIntelligence.getLayout = (page) => page
