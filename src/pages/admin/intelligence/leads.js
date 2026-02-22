// src/pages/admin/intelligence/leads.js
// Lead management & campaign attribution dashboard.
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

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'booked', label: 'Booked' },
  { value: 'converted', label: 'New Patient' },
]

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  booked: 'bg-violet-100 text-violet-700',
  converted: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-neutral-100 text-neutral-500',
}

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  booked: 'Booked',
  converted: 'New Patient',
  lost: 'Lost',
}

const SOURCE_COLORS = {
  facebook: 'bg-blue-100 text-blue-700',
  instagram: 'bg-pink-100 text-pink-700',
  google: 'bg-red-100 text-red-700',
  tiktok: 'bg-neutral-800 text-white',
  walk_in: 'bg-emerald-100 text-emerald-700',
  website: 'bg-violet-100 text-violet-700',
  referral: 'bg-amber-100 text-amber-700',
  other: 'bg-neutral-100 text-neutral-600',
}

const SOURCE_BAR_COLORS = {
  facebook: 'bg-blue-500',
  instagram: 'bg-pink-500',
  google: 'bg-red-500',
  tiktok: 'bg-neutral-800',
  walk_in: 'bg-emerald-500',
  website: 'bg-violet-500',
  referral: 'bg-amber-500',
  other: 'bg-neutral-400',
}

export default function LeadsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(7)
  const [page, setPage] = useState(1)
  const [sourceFilter, setSourceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [campSort, setCampSort] = useState({ key: 'leads', dir: 'desc' })
  const [leadSort, setLeadSort] = useState({ key: null, dir: 'desc' })
  const [matching, setMatching] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [drawerLeadId, setDrawerLeadId] = useState(null)
  const [drawerData, setDrawerData] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ days: String(days), page: String(page), limit: '50' })
      if (sourceFilter) params.set('source', sourceFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (serviceFilter) params.set('service', serviceFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/intelligence/leads?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [days, page, sourceFilter, statusFilter, serviceFilter, search])

  useEffect(() => { loadData() }, [loadData])

  // Drawer detail fetch
  useEffect(() => {
    if (!drawerLeadId) { setDrawerData(null); return }
    let cancelled = false
    setDrawerLoading(true)
    fetch(`/api/admin/leads/${drawerLeadId}`)
      .then(r => r.json())
      .then(json => { if (!cancelled) setDrawerData(json) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setDrawerLoading(false) })
    return () => { cancelled = true }
  }, [drawerLeadId])

  // Client-side sort for campaign breakdown
  const sortedCampaigns = useMemo(() => {
    const rows = [...(data?.campaign_breakdown || [])]
    if (!campSort.key) return rows
    return rows.sort((a, b) => {
      let av = a[campSort.key], bv = b[campSort.key]
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase() }
      if (av < bv) return campSort.dir === 'asc' ? -1 : 1
      if (av > bv) return campSort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [data?.campaign_breakdown, campSort])

  // Client-side sort for leads
  const sortedLeads = useMemo(() => {
    const rows = [...(data?.leads?.data || [])]
    if (!leadSort.key) return rows
    return rows.sort((a, b) => {
      let av = a[leadSort.key], bv = b[leadSort.key]
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase() }
      if (av < bv) return leadSort.dir === 'asc' ? -1 : 1
      if (av > bv) return leadSort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [data?.leads?.data, leadSort])

  // Inline status update
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')
      setData(prev => ({
        ...prev,
        leads: {
          ...prev.leads,
          data: prev.leads.data.map(l => l.id === leadId ? { ...l, status: newStatus } : l),
        },
      }))
    } catch {
      loadData()
    }
  }

  // Run matching
  const handleMatch = async () => {
    setMatching(true)
    setMatchResult(null)
    try {
      const res = await fetch('/api/admin/leads/match', { method: 'POST' })
      const json = await res.json()
      setMatchResult(json.summary)
      loadData()
    } catch (err) {
      setMatchResult({ error: err.message })
    } finally {
      setMatching(false)
    }
  }

  // CSV export
  const exportCSV = useCallback(async () => {
    try {
      const params = new URLSearchParams({ days: String(days), limit: '10000' })
      if (sourceFilter) params.set('source', sourceFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (serviceFilter) params.set('service', serviceFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/intelligence/leads?${params}`)
      const json = await res.json()
      const rows = json.leads?.data || []
      if (!rows.length) return

      const headers = ['Name', 'Phone', 'Email', 'Source', 'Campaign', 'Service', 'Status', 'Lead Date', 'Booked', 'Appointment']
      const csvRows = rows.map(l => [
        `"${l.name}"`, l.phone || '', l.email || '', l.source,
        `"${l.campaign || ''}"`, l.service_interest || '', STATUS_LABELS[l.status] || l.status,
        l.source_created_at ? new Date(l.source_created_at).toLocaleDateString() : (l.created_at ? new Date(l.created_at).toLocaleDateString() : ''),
        l.booked_at ? new Date(l.booked_at).toLocaleDateString() : '',
        l.appointment_date ? new Date(l.appointment_date).toLocaleDateString() : '',
      ])
      const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${days === 'all' ? 'all' : days + 'd'}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ }
  }, [days, sourceFilter, statusFilter, serviceFilter, search])

  const totalPages = data ? Math.ceil((data.leads?.total || 0) / (data.leads?.page_size || 50)) : 0

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—'

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Lead Intelligence</h1>
            <p className="text-sm text-neutral-500 mt-1">Campaign attribution, conversion tracking & lead pipeline</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[7, 30, 90, 'all'].map(d => (
              <button
                key={d}
                onClick={() => { setDays(d); setPage(1) }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition ${
                  days === d ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {d === 'all' ? 'All' : `${d}d`}
              </button>
            ))}
            <button
              onClick={handleMatch}
              disabled={matching}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
            >
              {matching ? 'Matching...' : 'Run Matching'}
            </button>
            <button onClick={exportCSV} className="px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 transition">
              Export CSV
            </button>
            <button onClick={loadData} className="px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 transition">
              Refresh
            </button>
          </div>
        </div>

        {/* Match result toast */}
        {matchResult && (
          <div className={`rounded-lg p-4 mb-6 text-sm ${matchResult.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
            {matchResult.error
              ? `Matching error: ${matchResult.error}`
              : `Checked ${matchResult.total_checked} leads — ${matchResult.matched} matched (${matchResult.converted} new patients, ${matchResult.booked} booked)`
            }
            <button onClick={() => setMatchResult(null)} className="ml-3 underline text-xs">Dismiss</button>
          </div>
        )}

        {loading && !data && (
          <div className="text-center py-16 text-neutral-400">Loading lead data...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">Error: {error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <StatCard label="Total Leads" value={data.summary.total.toLocaleString()} sub={days === 'all' ? 'all time' : `in ${days} days`} color="violet" />
              <StatCard label="Booked" value={(data.summary.booked || 0).toLocaleString()} sub={`${data.summary.booking_rate || '0.0'}% of leads`} color="blue" />
              <StatCard label="New Patients" value={(data.summary.new_patients || 0).toLocaleString()} sub={`${data.summary.new_patient_rate || '0.0'}% of leads`} color="emerald" />
              <StatCard label="Booking Rate" value={`${data.summary.booking_rate || '0.0'}%`} sub={data.summary.avg_days_to_convert != null ? `avg ${data.summary.avg_days_to_convert}d to convert` : 'lead → booked'} color="amber" />
            </div>

            {/* Source breakdown bar */}
            {data.summary.by_source.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
                <h2 className="text-sm font-semibold text-neutral-700 mb-3">Lead Sources</h2>
                <div className="flex rounded-full overflow-hidden h-6 bg-neutral-100">
                  {data.summary.by_source.map(s => {
                    const pct = data.summary.total > 0 ? (s.count / data.summary.total) * 100 : 0
                    if (pct < 1) return null
                    return (
                      <div
                        key={s.source}
                        className={`${SOURCE_BAR_COLORS[s.source] || 'bg-neutral-400'} transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${s.source}: ${s.count} (${pct.toFixed(1)}%)`}
                      />
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  {data.summary.by_source.map(s => (
                    <div key={s.source} className="flex items-center gap-1.5 text-xs">
                      <div className={`w-2.5 h-2.5 rounded-full ${SOURCE_BAR_COLORS[s.source] || 'bg-neutral-400'}`} />
                      <span className="text-neutral-600 capitalize">{s.source.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-neutral-800">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pipeline: New → Booked → New Patient */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
              <h2 className="text-sm font-semibold text-neutral-700 mb-3">Pipeline</h2>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map(s => {
                  const count = data.summary.by_status[s.value] || 0
                  const pct = data.summary.total > 0 ? ((count / data.summary.total) * 100).toFixed(1) : '0.0'
                  return (
                    <button
                      key={s.value}
                      onClick={() => { setStatusFilter(statusFilter === s.value ? '' : s.value); setPage(1) }}
                      className={`text-center p-3 rounded-lg border transition ${statusFilter === s.value ? 'border-violet-400 bg-violet-50' : 'border-neutral-100 hover:border-neutral-200'}`}
                    >
                      <p className="text-lg font-bold text-neutral-800">{count}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{s.label}</p>
                      <p className="text-[10px] text-neutral-400">{pct}%</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Service interest breakdown */}
            {data.summary.by_service.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
                <h2 className="text-sm font-semibold text-neutral-700 mb-3">Service Interest Conversion</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {data.summary.by_service.map(s => (
                    <button
                      key={s.service}
                      onClick={() => { setServiceFilter(serviceFilter === s.service ? '' : s.service); setPage(1) }}
                      className={`text-center p-3 rounded-lg border transition ${serviceFilter === s.service ? 'border-violet-400 bg-violet-50' : 'border-neutral-100 hover:border-neutral-200'}`}
                    >
                      <p className="text-sm font-bold text-neutral-800 capitalize">{s.service}</p>
                      <p className="text-xs text-neutral-500">{s.total} leads</p>
                      <p className="text-xs font-semibold text-emerald-600">{s.rate}% converted</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="Search name, phone, campaign..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="px-3 py-1.5 text-xs border border-neutral-200 rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-violet-400"
              />
              <select
                value={sourceFilter}
                onChange={e => { setSourceFilter(e.target.value); setPage(1) }}
                className="px-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-400"
              >
                <option value="">All Sources</option>
                {(data.summary.by_source || []).map(s => (
                  <option key={s.source} value={s.source}>{s.source.replace(/_/g, ' ')} ({s.count})</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                className="px-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-400"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label} ({data.summary.by_status[s.value] || 0})</option>
                ))}
              </select>
              <select
                value={serviceFilter}
                onChange={e => { setServiceFilter(e.target.value); setPage(1) }}
                className="px-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-400"
              >
                <option value="">All Services</option>
                {(data.summary.by_service || []).map(s => (
                  <option key={s.service} value={s.service}>{s.service} ({s.total})</option>
                ))}
              </select>
              {(sourceFilter || statusFilter || serviceFilter || search) && (
                <button
                  onClick={() => { setSourceFilter(''); setStatusFilter(''); setServiceFilter(''); setSearchInput(''); setSearch(''); setPage(1) }}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* All Leads table */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-8 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-700">
                  All Leads
                  <span className="ml-2 text-xs font-normal text-neutral-400">
                    ({(data.leads?.total || 0).toLocaleString()} total)
                  </span>
                </h2>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-500">
                    <SortHeader label="Name" sortKey="name" currentSort={leadSort} onSort={(k, d) => setLeadSort({ key: k, dir: d })} />
                    <SortHeader label="Phone" sortKey="phone" currentSort={leadSort} onSort={(k, d) => setLeadSort({ key: k, dir: d })} />
                    <SortHeader label="Source" sortKey="source" currentSort={leadSort} onSort={(k, d) => setLeadSort({ key: k, dir: d })} />
                    <SortHeader label="Campaign" sortKey="campaign" currentSort={leadSort} onSort={(k, d) => setLeadSort({ key: k, dir: d })} />
                    <SortHeader label="Service" sortKey="service_interest" currentSort={leadSort} onSort={(k, d) => setLeadSort({ key: k, dir: d })} />
                    <th className="py-2 font-medium text-neutral-500">Status</th>
                    <SortHeader label="Lead Date" sortKey="source_created_at" currentSort={leadSort} onSort={(k, d) => setLeadSort({ key: k, dir: d })} />
                    <SortHeader label="Booked" sortKey="booked_at" currentSort={leadSort} onSort={(k, d) => setLeadSort({ key: k, dir: d })} />
                    <SortHeader label="Appt" sortKey="appointment_date" currentSort={leadSort} onSort={(k, d) => setLeadSort({ key: k, dir: d })} />
                  </tr>
                </thead>
                <tbody>
                  {sortedLeads.map(lead => (
                    <tr
                      key={lead.id}
                      className={`border-b border-neutral-50 cursor-pointer ${lead.status === 'converted' ? 'bg-emerald-50/60 hover:bg-emerald-50' : lead.status === 'booked' ? 'bg-violet-50/40 hover:bg-violet-50/60' : 'hover:bg-neutral-50'}`}
                      onClick={() => setDrawerLeadId(lead.id)}
                    >
                      <td className="py-2 font-medium text-neutral-800">{lead.name}</td>
                      <td className="py-2 text-neutral-600">{lead.phone || '—'}</td>
                      <td className="py-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${SOURCE_COLORS[lead.source] || SOURCE_COLORS.other}`}>
                          {lead.source.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2 text-neutral-600 max-w-[200px] truncate">{lead.campaign || '—'}</td>
                      <td className="py-2">
                        {lead.service_interest ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700 capitalize">{lead.service_interest}</span>
                        ) : <span className="text-neutral-400">—</span>}
                      </td>
                      <td className="py-2">
                        <select
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border-none cursor-pointer ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 text-neutral-400">
                        {fmtDate(lead.source_created_at || lead.created_at)}
                      </td>
                      <td className="py-2 text-neutral-400">
                        {fmtDate(lead.booked_at)}
                      </td>
                      <td className="py-2 text-neutral-400">
                        {fmtDate(lead.appointment_date)}
                      </td>
                    </tr>
                  ))}
                  {sortedLeads.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-neutral-400">
                        {loading ? 'Loading...' : 'No leads found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-400">
                    Page {data.leads.page} of {totalPages} &middot; {data.leads.total.toLocaleString()} leads
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1 text-xs rounded border border-neutral-200 text-neutral-600 disabled:opacity-40 hover:border-neutral-300"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1 text-xs rounded border border-neutral-200 text-neutral-600 disabled:opacity-40 hover:border-neutral-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Performance */}
            {sortedCampaigns.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-8 overflow-x-auto">
                <h2 className="text-sm font-semibold text-neutral-700 mb-4">Campaign Performance</h2>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-500">
                      <SortHeader label="Campaign" sortKey="campaign" currentSort={campSort} onSort={(k, d) => setCampSort({ key: k, dir: d })} />
                      <SortHeader label="Service" sortKey="service_interest" currentSort={campSort} onSort={(k, d) => setCampSort({ key: k, dir: d })} />
                      <SortHeader label="Leads" sortKey="leads" currentSort={campSort} onSort={(k, d) => setCampSort({ key: k, dir: d })} align="right" />
                      <SortHeader label="Booked" sortKey="booked" currentSort={campSort} onSort={(k, d) => setCampSort({ key: k, dir: d })} align="right" />
                      <SortHeader label="New Patients" sortKey="converted" currentSort={campSort} onSort={(k, d) => setCampSort({ key: k, dir: d })} align="right" />
                      <SortHeader label="Book %" sortKey="booking_rate" currentSort={campSort} onSort={(k, d) => setCampSort({ key: k, dir: d })} align="right" />
                      <SortHeader label="NP %" sortKey="new_patient_rate" currentSort={campSort} onSort={(k, d) => setCampSort({ key: k, dir: d })} align="right" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCampaigns.map((c, i) => (
                      <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50">
                        <td className="py-2 text-neutral-800 max-w-[220px] truncate">{c.campaign}</td>
                        <td className="py-2">
                          {c.service_interest ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700 capitalize">{c.service_interest}</span>
                          ) : <span className="text-neutral-400">—</span>}
                        </td>
                        <td className="py-2 text-right font-semibold text-neutral-800">{c.leads}</td>
                        <td className="py-2 text-right font-semibold text-violet-600">{c.booked || 0}</td>
                        <td className="py-2 text-right font-semibold text-emerald-600">{c.converted || 0}</td>
                        <td className="py-2 text-right text-neutral-600">{c.booking_rate || '0.0'}%</td>
                        <td className="py-2 text-right text-neutral-600">{c.new_patient_rate || '0.0'}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Lead Detail Drawer ── */}
      {drawerLeadId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setDrawerLeadId(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-neutral-200 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {drawerData?.lead?.name || 'Loading...'}
                </h3>
                {drawerData?.lead && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[drawerData.lead.status]}`}>
                    {STATUS_LABELS[drawerData.lead.status]}
                  </span>
                )}
              </div>
              <button
                onClick={() => setDrawerLeadId(null)}
                className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {drawerLoading ? (
              <div className="p-8 text-center text-neutral-400 text-sm">Loading lead details...</div>
            ) : drawerData ? (
              <div className="p-5 space-y-6">
                {/* Contact */}
                <div>
                  <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Contact</h4>
                  <div className="space-y-1.5 text-sm">
                    {drawerData.lead.phone && (
                      <p className="text-neutral-700">
                        <span className="inline-block w-14 text-neutral-400 text-xs">Phone</span>
                        <a href={`tel:${drawerData.lead.phone}`} className="text-violet-600 hover:underline">{drawerData.lead.phone}</a>
                      </p>
                    )}
                    {drawerData.lead.email && (
                      <p className="text-neutral-700">
                        <span className="inline-block w-14 text-neutral-400 text-xs">Email</span>
                        <a href={`mailto:${drawerData.lead.email}`} className="text-violet-600 hover:underline">{drawerData.lead.email}</a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Attribution */}
                <div>
                  <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Attribution</h4>
                  <div className="space-y-1.5 text-sm">
                    <p>
                      <span className="inline-block w-14 text-neutral-400 text-xs">Source</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${SOURCE_COLORS[drawerData.lead.source] || SOURCE_COLORS.other}`}>
                        {drawerData.lead.source}
                      </span>
                    </p>
                    {drawerData.lead.campaign && (
                      <p><span className="inline-block w-14 text-neutral-400 text-xs">Campaign</span><span className="text-neutral-700">{drawerData.lead.campaign}</span></p>
                    )}
                    {drawerData.lead.ad_name && (
                      <p><span className="inline-block w-14 text-neutral-400 text-xs">Form</span><span className="text-neutral-700">{drawerData.lead.ad_name}</span></p>
                    )}
                    {drawerData.lead.service_interest && (
                      <p><span className="inline-block w-14 text-neutral-400 text-xs">Service</span><span className="capitalize text-neutral-700">{drawerData.lead.service_interest}</span></p>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Timeline</h4>
                  <div className="space-y-1.5 text-sm">
                    <p>
                      <span className="inline-block w-20 text-neutral-400 text-xs">Lead Date</span>
                      <span className="text-neutral-700">{fmtDate(drawerData.lead.source_created_at || drawerData.lead.created_at)}</span>
                    </p>
                    {drawerData.lead.converted_at && (
                      <p>
                        <span className="inline-block w-20 text-neutral-400 text-xs">First Visit</span>
                        <span className="text-neutral-700">{fmtDate(drawerData.lead.converted_at)}</span>
                      </p>
                    )}
                    {drawerData.lead.days_to_convert != null && (
                      <p>
                        <span className="inline-block w-20 text-neutral-400 text-xs">Days to Book</span>
                        <span className="font-semibold text-emerald-600">{drawerData.lead.days_to_convert}d</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {drawerData.lead.notes && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Notes</h4>
                    <p className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3">{drawerData.lead.notes}</p>
                  </div>
                )}

                {/* Boulevard Client */}
                {drawerData.client && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Boulevard Client</h4>
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase">LTV</p>
                          <p className="text-xl font-bold text-neutral-800">${Number(drawerData.client.total_spend || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase">Visits</p>
                          <p className="text-xl font-bold text-neutral-800">{drawerData.client.visit_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase">First Visit</p>
                          <p className="text-sm font-medium text-neutral-700">{fmtDate(drawerData.client.first_visit_at)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase">Last Visit</p>
                          <p className="text-sm font-medium text-neutral-700">{fmtDate(drawerData.client.last_visit_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointments */}
                {drawerData.appointments?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Appointments ({drawerData.appointments.length})
                    </h4>
                    <div className="space-y-2">
                      {drawerData.appointments.map(appt => (
                        <div key={appt.id} className="bg-neutral-50 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-neutral-800">
                              {fmtDate(appt.start_at)}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              appt.status === 'completed' || appt.status === 'final' ? 'bg-emerald-100 text-emerald-700' :
                              appt.status === 'cancelled' || appt.status === 'no_show' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                          {appt.services?.length > 0 && (
                            <div className="text-xs text-neutral-500 space-y-0.5">
                              {appt.services.map((s, i) => (
                                <p key={i}>{s.service_name}{s.price ? ` · $${Number(s.price).toLocaleString()}` : ''}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity log */}
                {drawerData.events?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Activity Log</h4>
                    <div className="space-y-1.5">
                      {drawerData.events.map((e, i) => (
                        <div key={i} className="text-xs text-neutral-500 flex items-center gap-2">
                          <span className="text-neutral-300 shrink-0">{fmtDate(e.created_at)}</span>
                          <span>{e.event_type}: {e.old_value || '—'} → {e.new_value || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </>
      )}
    </AdminLayout>
  )
}
