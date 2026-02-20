// src/pages/admin/intelligence/tox.js
// Tox Intelligence Engine — segment health, provider retention, patient list.
import { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function SegmentBadge({ segment }) {
  const colors = {
    on_schedule: 'bg-emerald-100 text-emerald-700',
    due: 'bg-amber-100 text-amber-700',
    overdue: 'bg-orange-100 text-orange-700',
    probably_lost: 'bg-rose-100 text-rose-700',
    lost: 'bg-red-100 text-red-700',
  }
  const labels = {
    on_schedule: 'On Schedule',
    due: 'Due',
    overdue: 'Overdue',
    probably_lost: 'Probably Lost',
    lost: 'Lost',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[segment] || 'bg-neutral-100 text-neutral-600'}`}>
      {labels[segment] || segment}
    </span>
  )
}

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    orange: 'border-l-orange-500',
    rose: 'border-l-rose-500',
    red: 'border-l-red-500',
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

export default function ToxEngine() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [location, setLocation] = useState('all')
  const [segmentFilter, setSegmentFilter] = useState('')
  const [providerFilter, setProviderFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [toxType, setToxType] = useState('')
  const [minVisits, setMinVisits] = useState('')
  const [sort, setSort] = useState('days_desc')
  const [page, setPage] = useState(1)

  // Debounce search input
  const searchTimer = useRef(null)
  useEffect(() => {
    searchTimer.current = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(searchTimer.current)
  }, [searchInput])

  // Patient detail drawer
  const [drawerClientId, setDrawerClientId] = useState(null)
  const [drawerData, setDrawerData] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  const openDrawer = useCallback(async (clientId) => {
    setDrawerClientId(clientId)
    setDrawerLoading(true)
    setDrawerData(null)
    try {
      const res = await fetch(`/api/admin/intelligence/tox-patient?client_id=${clientId}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setDrawerData(await res.json())
    } catch (e) {
      console.error('Drawer fetch error:', e)
    } finally {
      setDrawerLoading(false)
    }
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerClientId(null)
    setDrawerData(null)
  }, [])

  // Export state
  const [exporting, setExporting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ location, page: String(page), limit: '50', sort })
      if (segmentFilter) params.set('segment', segmentFilter)
      if (providerFilter) params.set('provider', providerFilter)
      if (search) params.set('search', search)
      if (toxType) params.set('tox_type', toxType)
      if (minVisits) params.set('min_visits', minVisits)
      const res = await fetch(`/api/admin/intelligence/tox?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [location, segmentFilter, providerFilter, search, toxType, minVisits, sort, page])

  useEffect(() => { loadData() }, [loadData])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [location, segmentFilter, providerFilter, search, toxType, minVisits, sort])

  // CSV export
  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      // Fetch all patients for current filter (no pagination)
      const params = new URLSearchParams({ location, limit: '10000', sort })
      if (segmentFilter) params.set('segment', segmentFilter)
      if (providerFilter) params.set('provider', providerFilter)
      if (search) params.set('search', search)
      if (toxType) params.set('tox_type', toxType)
      if (minVisits) params.set('min_visits', minVisits)
      const res = await fetch(`/api/admin/intelligence/tox?${params}`)
      const json = await res.json()
      const patients = json.patients?.data || []

      const headers = ['Name', 'Email', 'Phone', 'Segment', 'Last Tox Visit', 'Days Since', 'Tox Type', 'Visits', 'Total Spend', 'Provider', 'Location']
      const rows = patients.map((p) => [
        p.name,
        p.email || '',
        p.phone || '',
        p.tox_segment,
        p.last_tox_visit ? new Date(p.last_tox_visit).toLocaleDateString() : '',
        p.days_since_last_tox ?? '',
        p.primary_tox_type || '',
        p.tox_visits || 0,
        p.total_tox_spend || 0,
        p.provider_name || '',
        p.location || '',
      ])

      const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tox-patients-${segmentFilter || 'all'}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Export failed: ' + e.message)
    } finally {
      setExporting(false)
    }
  }, [location, segmentFilter, providerFilter, search, toxType, minVisits, sort])

  const summary = data?.summary
  const patients = data?.patients

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tox Intelligence Engine</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Track tox patient health, retention, and provider performance. Segment patients by schedule status.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters — row 1: location, segment, provider, actions */}
      <div className="flex flex-wrap gap-3 mb-3">
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Locations</option>
          <option value="westfield">Westfield</option>
          <option value="carmel">Carmel</option>
        </select>

        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All Segments</option>
          <option value="on_schedule">On Schedule</option>
          <option value="due">Due</option>
          <option value="overdue">Overdue</option>
          <option value="probably_lost">Probably Lost</option>
          <option value="lost">Lost</option>
        </select>

        {data?.provider_leaderboard?.length > 0 && (
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All Providers</option>
            {data.provider_leaderboard.map((p) => (
              <option key={p.staff_id} value={p.staff_id}>{p.name}</option>
            ))}
          </select>
        )}

        <div className="ml-auto flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-300 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters — row 2: search, tox type, min visits, sort */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, email, phone..."
          className="border rounded-lg px-3 py-2 text-sm bg-white w-64"
        />

        <select
          value={toxType}
          onChange={(e) => setToxType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All Tox Types</option>
          <option value="Botox">Botox</option>
          <option value="Dysport">Dysport</option>
          <option value="Jeuveau">Jeuveau</option>
          <option value="Daxxify">Daxxify</option>
          <option value="Xeomin">Xeomin</option>
        </select>

        <select
          value={minVisits}
          onChange={(e) => setMinVisits(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Any Visits</option>
          <option value="2">2+ visits</option>
          <option value="3">3+ visits</option>
          <option value="5">5+ visits</option>
          <option value="10">10+ visits</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="days_desc">Most Overdue First</option>
          <option value="days_asc">Most Recent First</option>
          <option value="spend_desc">Highest Spend</option>
          <option value="visits_desc">Most Visits</option>
          <option value="name_asc">Name A-Z</option>
        </select>

        {(search || toxType || minVisits || segmentFilter || providerFilter) && (
          <button
            onClick={() => { setSearchInput(''); setSearch(''); setToxType(''); setMinVisits(''); setSegmentFilter(''); setProviderFilter(''); setSort('days_desc') }}
            className="px-3 py-2 text-xs text-neutral-500 hover:text-neutral-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Segment stat cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            label="Total Tox Patients"
            value={summary.total_tox_patients.toLocaleString()}
            sub={`$${Math.round(summary.total_tox_revenue).toLocaleString()} total revenue`}
            color="violet"
          />
          <StatCard
            label="On Schedule"
            value={summary.on_schedule.toLocaleString()}
            sub={`${summary.on_schedule_pct}% of patients`}
            color="emerald"
          />
          <StatCard
            label="Due (91-120 days)"
            value={summary.due.toLocaleString()}
            sub={`${summary.due_pct}% of patients`}
            color="amber"
          />
          <StatCard
            label="Overdue (121-180d)"
            value={summary.overdue.toLocaleString()}
            sub={`${summary.overdue_pct}% of patients`}
            color="orange"
          />
          <StatCard
            label="Probably Lost (181-365d)"
            value={(summary.probably_lost || 0).toLocaleString()}
            sub={`${summary.probably_lost_pct || 0}% of patients`}
            color="rose"
          />
          <StatCard
            label="Lost (365+ days)"
            value={summary.lost.toLocaleString()}
            sub={`${summary.lost_pct}% of patients`}
            color="red"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tox Type Breakdown */}
        {data?.tox_types?.length > 0 && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl">
              <h2 className="text-sm font-semibold">Tox Type Breakdown</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Type</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Bookings</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Revenue</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Clients</th>
                </tr>
              </thead>
              <tbody>
                {data.tox_types.map((t) => (
                  <tr key={t.name} className="border-b last:border-b-0 hover:bg-neutral-50">
                    <td className="px-4 py-2 font-medium">{t.name}</td>
                    <td className="px-4 py-2 text-right text-neutral-600">{t.bookings.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-neutral-600">${t.revenue.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-neutral-600">{t.unique_clients.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Provider Retention Leaderboard */}
        {data?.provider_leaderboard?.length > 0 && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl">
              <h2 className="text-sm font-semibold">Provider Tox Retention</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Provider</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Patients</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">On-Schedule %</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Avg Interval</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.provider_leaderboard.map((p) => (
                  <tr key={p.staff_id} className="border-b last:border-b-0 hover:bg-neutral-50">
                    <td className="px-4 py-2">
                      <p className="font-medium">{p.name}</p>
                      {p.title && <p className="text-xs text-neutral-400">{p.title}</p>}
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-600">{p.patients}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`font-medium ${p.retention_pct >= 60 ? 'text-emerald-600' : p.retention_pct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {p.retention_pct}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-600">
                      {p.avg_interval_days ? `${p.avg_interval_days}d` : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-600">${p.total_revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Tox Patients
            {patients && <span className="text-neutral-400 font-normal ml-2">({patients.total.toLocaleString()} total)</span>}
          </h2>
        </div>
        {loading && !data ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Patient</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Segment</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Days Since</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Tox Type</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Visits</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Spend</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Provider</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {(patients?.data || []).map((p) => (
                    <tr key={p.client_id} onClick={() => openDrawer(p.client_id)} className="border-b last:border-b-0 hover:bg-neutral-50 cursor-pointer">
                      <td className="px-4 py-2">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.email || p.phone || ''}</p>
                      </td>
                      <td className="px-4 py-2"><SegmentBadge segment={p.tox_segment} /></td>
                      <td className="px-4 py-2 text-right">
                        <span className={`font-medium ${
                          p.days_since_last_tox > 365 ? 'text-red-600' :
                          p.days_since_last_tox > 180 ? 'text-rose-600' :
                          p.days_since_last_tox > 120 ? 'text-orange-600' :
                          p.days_since_last_tox > 90 ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                          {p.days_since_last_tox ?? '—'}d
                        </span>
                      </td>
                      <td className="px-4 py-2 text-neutral-600">
                        {p.primary_tox_type || '—'}
                        {p.tox_switching && (
                          <span className="ml-1 text-[10px] bg-violet-100 text-violet-600 px-1 py-0.5 rounded">switched</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-neutral-600">{p.tox_visits}</td>
                      <td className="px-4 py-2 text-right text-neutral-600">${Math.round(p.total_tox_spend).toLocaleString()}</td>
                      <td className="px-4 py-2 text-neutral-600">{p.provider_name || '—'}</td>
                      <td className="px-4 py-2 text-neutral-600 capitalize">{p.location || '—'}</td>
                    </tr>
                  ))}
                  {(!patients?.data || patients.data.length === 0) && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                        No tox patients found. Make sure appointment data has been synced.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {patients && patients.total > patients.page_size && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Showing {(patients.page - 1) * patients.page_size + 1}–{Math.min(patients.page * patients.page_size, patients.total)} of {patients.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * patients.page_size >= patients.total}
                    className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Patient Detail Drawer */}
      {drawerClientId && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeDrawer} />
          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">Patient Detail</h2>
              <button onClick={closeDrawer} className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {drawerLoading ? (
              <div className="p-8 text-center text-neutral-400 text-sm">Loading patient data...</div>
            ) : drawerData ? (
              <div className="p-6 space-y-6">
                {/* Patient info */}
                <div>
                  <h3 className="text-xl font-bold">{drawerData.client.name}</h3>
                  <div className="mt-1 space-y-0.5">
                    {drawerData.client.email && <p className="text-sm text-neutral-500">{drawerData.client.email}</p>}
                    {drawerData.client.phone && <p className="text-sm text-neutral-500">{drawerData.client.phone}</p>}
                  </div>
                  <div className="mt-2">
                    <SegmentBadge segment={drawerData.client.tox_segment} />
                  </div>
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-lg font-bold">{drawerData.client.tox_visits}</p>
                    <p className="text-xs text-neutral-500">Tox Visits</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-lg font-bold">${Math.round(drawerData.client.total_tox_spend).toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">Total Spend</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-lg font-bold">{drawerData.client.days_since_last_tox}d</p>
                    <p className="text-xs text-neutral-500">Since Last Visit</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-lg font-bold">{drawerData.client.avg_interval_days ? `${drawerData.client.avg_interval_days}d` : '—'}</p>
                    <p className="text-xs text-neutral-500">Avg Interval</p>
                  </div>
                </div>

                {/* Tox details */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {drawerData.client.primary_tox_type && (
                    <span className="px-2 py-1 bg-violet-50 text-violet-700 rounded-full">Primary: {drawerData.client.primary_tox_type}</span>
                  )}
                  {drawerData.client.last_tox_type && drawerData.client.last_tox_type !== drawerData.client.primary_tox_type && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Last: {drawerData.client.last_tox_type}</span>
                  )}
                  {drawerData.client.tox_switching && (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full">Brand Switcher</span>
                  )}
                  {drawerData.client.provider_name && (
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">Provider: {drawerData.client.provider_name}</span>
                  )}
                  {drawerData.client.location && (
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full capitalize">{drawerData.client.location}</span>
                  )}
                </div>

                {/* Appointment history */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Appointment History ({drawerData.appointments.length})</h4>
                  {drawerData.appointments.length === 0 ? (
                    <p className="text-sm text-neutral-400">No tox appointments found.</p>
                  ) : (
                    <div className="space-y-2">
                      {drawerData.appointments.map((appt) => (
                        <div key={appt.appointment_id} className={`border rounded-lg p-3 ${appt.is_follow_up ? 'bg-neutral-50 border-dashed' : 'bg-white'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">
                                {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              {appt.is_follow_up && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 text-neutral-500 rounded">Follow-up</span>
                              )}
                              {appt.tox_type && !appt.is_follow_up && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded">{appt.tox_type}</span>
                              )}
                            </div>
                            <p className="text-sm font-semibold">${Math.round(appt.total_revenue).toLocaleString()}</p>
                          </div>
                          {/* Service details */}
                          <div className="mt-1.5 space-y-0.5">
                            {appt.services.map((svc, i) => (
                              <div key={i} className="flex items-center justify-between text-xs text-neutral-500">
                                <span className={svc.is_container ? 'italic text-neutral-400' : ''}>
                                  {svc.is_container ? '(container) ' : ''}{svc.name}
                                </span>
                                <span>${svc.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-1 capitalize">{appt.location}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-400 text-sm">Failed to load patient data.</div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}
