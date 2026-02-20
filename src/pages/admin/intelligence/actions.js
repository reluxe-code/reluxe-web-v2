// src/pages/admin/intelligence/actions.js
// Actions — all actionable patient segments with drilldown and export.
import { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

const segmentColors = {
  emerald: 'border-l-emerald-500 bg-emerald-50',
  amber: 'border-l-amber-500 bg-amber-50',
  orange: 'border-l-orange-500 bg-orange-50',
  rose: 'border-l-rose-500 bg-rose-50',
  red: 'border-l-red-500 bg-red-50',
  blue: 'border-l-blue-500 bg-blue-50',
}

export default function ActionsReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSegment, setActiveSegment] = useState(null)
  const [drillData, setDrillData] = useState(null)
  const [drillLoading, setDrillLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  const timer = useRef(null)
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer.current)
  }, [searchInput])

  // Load segment overview
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/intelligence/actions')
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Load drilldown when segment changes
  const loadDrilldown = useCallback(async () => {
    if (!activeSegment) { setDrillData(null); return }
    setDrillLoading(true)
    try {
      const params = new URLSearchParams({ segment: activeSegment, page: String(page), limit: '50' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/intelligence/actions?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      const json = await res.json()
      setDrillData(json.patients)
    } catch (e) {
      console.error('Drilldown error:', e)
    } finally {
      setDrillLoading(false)
    }
  }, [activeSegment, search, page])

  useEffect(() => { loadDrilldown() }, [loadDrilldown])
  useEffect(() => { setPage(1) }, [activeSegment, search])

  const handleExport = useCallback(async () => {
    if (!activeSegment) return
    setExporting(true)
    try {
      const params = new URLSearchParams({ segment: activeSegment, limit: '10000' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/intelligence/actions?${params}`)
      const json = await res.json()
      const patients = json.patients?.data || []
      const headers = ['Name', 'Email', 'Phone', 'Total Spend', 'Visits', 'Last Visit', 'Detail', 'Days']
      const rows = patients.map((p) => [
        p.name, p.email || '', p.phone || '', p.total_spend, p.visit_count,
        p.last_visit ? new Date(p.last_visit).toLocaleDateString() : '',
        p.segment_detail || '', p.days_value ?? '',
      ])
      const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeSegment}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Export failed: ' + e.message)
    } finally {
      setExporting(false)
    }
  }, [activeSegment, search])

  const segments = data?.segments || []
  const actionable = segments.filter((s) => s.count > 0 && !s.key.includes('on_schedule'))
  const totalActionable = actionable.reduce((s, seg) => s + seg.count, 0)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Actions</h1>
        <p className="text-sm text-neutral-500 mt-1">
          All actionable patient segments in one place. Click a segment to drill down, then export for campaigns.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{totalActionable.toLocaleString()}</p>
              <p className="text-sm text-neutral-500">patients need attention across {actionable.length} segments</p>
            </div>
            <button onClick={loadData} disabled={loading} className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50">
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      )}

      {/* Segment cards */}
      {loading && !data ? (
        <div className="p-8 text-center text-neutral-400 text-sm">Loading segments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {segments.map((seg) => (
            <div
              key={seg.key}
              onClick={() => setActiveSegment(activeSegment === seg.key ? null : seg.key)}
              className={`rounded-lg border border-l-4 p-4 cursor-pointer transition ${segmentColors[seg.color] || 'border-l-neutral-400 bg-white'} ${
                activeSegment === seg.key ? 'ring-2 ring-violet-400 shadow-md' : 'hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{seg.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{seg.description}</p>
                </div>
                <p className="text-2xl font-bold ml-4">{seg.count.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drilldown table */}
      {activeSegment && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {segments.find((s) => s.key === activeSegment)?.label || activeSegment}
              {drillData && <span className="text-neutral-400 font-normal ml-2">({drillData.total.toLocaleString()} patients)</span>}
            </h2>
            <div className="flex gap-2">
              <button onClick={handleExport} disabled={exporting} className="px-3 py-1.5 bg-neutral-200 text-neutral-700 rounded text-xs font-medium hover:bg-neutral-300 disabled:opacity-50">
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email, phone..."
              className="border rounded-lg px-3 py-2 text-sm bg-white w-64"
            />
          </div>

          {drillLoading ? (
            <div className="p-8 text-center text-neutral-400 text-sm">Loading patients...</div>
          ) : drillData ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Patient</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Spend</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Visits</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Last Visit</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Detail</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(drillData.data || []).map((p) => (
                      <tr key={p.client_id} className="border-b last:border-b-0 hover:bg-neutral-50">
                        <td className="px-4 py-2">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-neutral-400">{p.email || p.phone || ''}</p>
                        </td>
                        <td className="px-4 py-2 text-right font-medium">${p.total_spend.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-neutral-600">{p.visit_count}</td>
                        <td className="px-4 py-2 text-neutral-600 text-xs">{p.last_visit ? new Date(p.last_visit).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-2 text-neutral-600 text-xs">{p.segment_detail || '—'}</td>
                        <td className="px-4 py-2 text-right">
                          {p.days_value != null ? (
                            <span className={`font-medium ${p.days_value > 90 ? 'text-red-600' : p.days_value > 30 ? 'text-amber-600' : 'text-neutral-600'}`}>
                              {p.days_value}d
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                    {drillData.data?.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No patients in this segment.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {drillData.total > drillData.page_size && (
                <div className="px-4 py-3 border-t flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    Showing {(drillData.page - 1) * drillData.page_size + 1}–{Math.min(drillData.page * drillData.page_size, drillData.total)} of {drillData.total}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50">Previous</button>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page * drillData.page_size >= drillData.total} className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50">Next</button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </AdminLayout>
  )
}
