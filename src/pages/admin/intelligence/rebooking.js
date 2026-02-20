// src/pages/admin/intelligence/rebooking.js
// Rebooking Gaps — clients who completed recently but have no future appointment.
import { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function TimeframeBadge({ detail }) {
  const colors = {
    '48h': 'bg-red-100 text-red-700',
    '7d': 'bg-orange-100 text-orange-700',
    '14d': 'bg-amber-100 text-amber-700',
    '14d+': 'bg-neutral-100 text-neutral-600',
  }
  const labels = { '48h': 'Within 48h', '7d': 'Within 7d', '14d': 'Within 14d', '14d+': '14d+' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[detail] || 'bg-neutral-100 text-neutral-600'}`}>
      {labels[detail] || detail}
    </span>
  )
}

function StatCard({ label, value, sub, color, active, onClick }) {
  const borderColors = {
    red: 'border-l-red-500', orange: 'border-l-orange-500',
    amber: 'border-l-amber-500', neutral: 'border-l-neutral-400',
    violet: 'border-l-violet-500',
  }
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4 cursor-pointer transition ${active ? 'ring-2 ring-violet-400 shadow-sm' : 'hover:shadow-sm'}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function RebookingReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeframe, setTimeframe] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  const timer = useRef(null)
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer.current)
  }, [searchInput])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' })
      if (timeframe !== 'all') params.set('timeframe', timeframe)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/intelligence/rebooking?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [timeframe, search, page])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { setPage(1) }, [timeframe, search])

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ limit: '10000' })
      if (timeframe !== 'all') params.set('timeframe', timeframe)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/intelligence/rebooking?${params}`)
      const json = await res.json()
      const patients = json.patients?.data || []
      const headers = ['Name', 'Email', 'Phone', 'Timeframe', 'Days Since', 'Last Visit', 'Last Service', 'Location']
      const rows = patients.map((p) => [
        p.name, p.email || '', p.phone || '', p.timeframe || '',
        p.days_since ?? '', p.last_visit ? new Date(p.last_visit).toLocaleDateString() : '',
        p.last_service || '', p.location || '',
      ])
      const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rebooking-gaps-${timeframe}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Export failed: ' + e.message)
    } finally {
      setExporting(false)
    }
  }, [timeframe, search])

  const summary = data?.summary
  const patients = data?.patients

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Rebooking Gaps</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Clients who completed an appointment recently but don't have a future appointment scheduled. These are your immediate follow-up opportunities.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Clickable stat cards act as timeframe filters */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total No Rebook" value={summary.total} color="violet" active={timeframe === 'all'} onClick={() => setTimeframe('all')} />
          <StatCard label="Within 48 Hours" value={summary.within_48h} sub="Highest urgency" color="red" active={timeframe === '48h'} onClick={() => setTimeframe('48h')} />
          <StatCard label="Within 7 Days" value={summary.within_7d} sub="Still warm" color="orange" active={timeframe === '7d'} onClick={() => setTimeframe('7d')} />
          <StatCard label="Within 14 Days" value={summary.within_14d} sub="Send a reminder" color="amber" active={timeframe === '14d'} onClick={() => setTimeframe('14d')} />
          <StatCard label="14+ Days" value={summary.over_14d} sub="Getting cold" color="neutral" active={timeframe === '14d+'} onClick={() => setTimeframe('14d+')} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, email, phone..."
          className="border rounded-lg px-3 py-2 text-sm bg-white w-64"
        />
        <div className="ml-auto flex gap-2">
          <button onClick={handleExport} disabled={exporting || loading} className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-300 disabled:opacity-50">
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button onClick={loadData} disabled={loading} className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Patient table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl">
          <h2 className="text-sm font-semibold">
            No Rebook
            {patients && <span className="text-neutral-400 font-normal ml-2">({patients.total.toLocaleString()} clients)</span>}
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
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Urgency</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Days Ago</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Last Visit</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Last Service</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {(patients?.data || []).map((p) => (
                    <tr key={p.client_id} className="border-b last:border-b-0 hover:bg-neutral-50">
                      <td className="px-4 py-2">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.email || p.phone || ''}</p>
                      </td>
                      <td className="px-4 py-2"><TimeframeBadge detail={p.timeframe} /></td>
                      <td className="px-4 py-2 text-right">
                        <span className={`font-medium ${p.days_since <= 2 ? 'text-red-600' : p.days_since <= 7 ? 'text-orange-600' : 'text-amber-600'}`}>
                          {p.days_since}d
                        </span>
                      </td>
                      <td className="px-4 py-2 text-neutral-600 text-xs">
                        {p.last_visit ? new Date(p.last_visit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-2 text-neutral-600 text-xs truncate max-w-[200px]" title={p.last_service}>
                        {p.last_service || '—'}
                      </td>
                      <td className="px-4 py-2 text-neutral-600 capitalize">{p.location || '—'}</td>
                    </tr>
                  ))}
                  {(!patients?.data || patients.data.length === 0) && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No rebooking gaps found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {patients && patients.total > patients.page_size && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Showing {(patients.page - 1) * patients.page_size + 1}–{Math.min(patients.page * patients.page_size, patients.total)} of {patients.total}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50">Previous</button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page * patients.page_size >= patients.total} className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
