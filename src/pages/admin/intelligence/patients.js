// src/pages/admin/intelligence/patients.js
// Patient Intelligence — LTV, visits, credit, memberships, vouchers, referrals.
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

const STATUS_COLORS = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-neutral-100 text-neutral-500',
  PAST_DUE: 'bg-red-50 text-red-700',
  PAUSED: 'bg-amber-50 text-amber-700',
}

function SortHeader({ label, sortKey, currentSort, onSort, align = 'left' }) {
  const active = currentSort.key === sortKey
  const arrow = active ? (currentSort.dir === 'asc' ? ' \u2191' : ' \u2193') : ''
  return (
    <th
      className={`text-${align} px-4 py-2 text-xs font-medium text-neutral-600 cursor-pointer select-none hover:text-black transition-colors whitespace-nowrap`}
      onClick={() => onSort(sortKey, active && currentSort.dir === 'asc' ? 'desc' : 'asc')}
    >
      {label}{arrow}
    </th>
  )
}

function LtvBadge({ bucket }) {
  const colors = {
    vip: 'bg-violet-100 text-violet-700',
    high: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-neutral-100 text-neutral-600',
  }
  const labels = { vip: 'VIP', high: 'High', medium: 'Med', low: 'Low' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[bucket] || 'bg-neutral-100 text-neutral-600'}`}>
      {labels[bucket] || bucket}
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-neutral-100 text-neutral-600'}`}>
      {status}
    </span>
  )
}

function StatCard({ label, value, sub, color, onClick, active }) {
  const borderColors = {
    violet: 'border-l-violet-500', emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500', neutral: 'border-l-neutral-400',
    red: 'border-l-red-500', blue: 'border-l-blue-500',
  }
  const ringColors = {
    violet: 'ring-violet-500', emerald: 'ring-emerald-500',
    amber: 'ring-amber-500', neutral: 'ring-neutral-400',
    red: 'ring-red-500', blue: 'ring-blue-500',
  }
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${active ? `ring-2 ${ringColors[color]} shadow-md` : ''}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function PatientsReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ltvFilter, setLtvFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('spend_desc')
  const [windowDays, setWindowDays] = useState('365')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  // Client-side sort for columns not in API sort
  const [colSort, setColSort] = useState({ key: null, dir: 'asc' })

  // Drawer state
  const [drawerClientId, setDrawerClientId] = useState(null)
  const [drawerData, setDrawerData] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  const timer = useRef(null)
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer.current)
  }, [searchInput])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50', sort })
      if (ltvFilter) params.set('ltv', ltvFilter)
      if (search) params.set('search', search)
      params.set('window_days', windowDays)
      const res = await fetch(`/api/admin/intelligence/patients?${params}`)
      const text = await res.text()
      let json
      try { json = JSON.parse(text) } catch { throw new Error('Invalid response from server') }
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [ltvFilter, search, sort, page, windowDays])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { setPage(1) }, [ltvFilter, search, sort, windowDays])

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ limit: '10000', sort })
      if (ltvFilter) params.set('ltv', ltvFilter)
      if (search) params.set('search', search)
      params.set('window_days', windowDays)
      const res = await fetch(`/api/admin/intelligence/patients?${params}`)
      const json = await res.json()
      const patients = json.patients?.data || []
      const headers = ['Name', 'Email', 'Phone', 'LTV', 'Visits', 'Spend', 'Credit', 'Membership', 'Vouchers', 'First Visit', 'Last Visit', 'Days Since']
      const rows = patients.map((p) => [
        p.name, p.email || '', p.phone || '', p.ltv_bucket, p.total_visits,
        p.total_spend, p.account_credit ? (p.account_credit / 100).toFixed(2) : '0',
        p.membership_name || '', p.voucher_count || 0,
        p.first_visit ? new Date(p.first_visit).toLocaleDateString() : '',
        p.last_visit ? new Date(p.last_visit).toLocaleDateString() : '',
        p.days_since_last_visit ?? '',
      ])
      const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `patients-${ltvFilter || 'all'}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Export failed: ' + e.message)
    } finally {
      setExporting(false)
    }
  }, [ltvFilter, search, sort, windowDays])

  const summary = data?.summary
  const patients = data?.patients

  // Client-side sort on the page data
  const sortedPatients = useMemo(() => {
    const rows = patients?.data || []
    if (!colSort.key) return rows
    return [...rows].sort((a, b) => {
      let av = a[colSort.key]
      let bv = b[colSort.key]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string' && typeof bv === 'string') {
        return colSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return colSort.dir === 'asc' ? av - bv : bv - av
    })
  }, [patients?.data, colSort])

  const openDrawer = useCallback(async (clientId) => {
    if (!clientId) return
    setDrawerClientId(clientId)
    setDrawerLoading(true)
    setDrawerData(null)
    try {
      const params = new URLSearchParams({ client_id: clientId, window_days: windowDays })
      const res = await fetch(`/api/admin/intelligence/patient-detail?${params}`)
      const text = await res.text()
      let json
      try { json = JSON.parse(text) } catch { throw new Error('Invalid response from server') }
      if (!res.ok) throw new Error(json.error || 'Failed')
      setDrawerData(json)
    } catch (e) {
      alert(`Failed to load patient details: ${e.message}`)
      setDrawerClientId(null)
    } finally {
      setDrawerLoading(false)
    }
  }, [windowDays])

  const closeDrawer = useCallback(() => {
    setDrawerClientId(null)
    setDrawerData(null)
  }, [])

  useEffect(() => {
    if (!drawerClientId) return
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerClientId, closeDrawer])

  const onColSort = (key, dir) => setColSort({ key, dir })

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Patient Intelligence</h1>
          <p className="text-sm text-neutral-500 mt-1">
            LTV segmentation, visit patterns, memberships, credits, and referrals.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Clients" value={summary.total_clients.toLocaleString()} sub={`${summary.with_visits.toLocaleString()} with visits · ${summary.no_visits.toLocaleString()} never visited`} color="blue" />
            <StatCard label="VIP ($5k+)" value={summary.vip.toLocaleString()} color="violet" active={ltvFilter === 'vip'} onClick={() => setLtvFilter(ltvFilter === 'vip' ? '' : 'vip')} />
            <StatCard label="High ($2k+)" value={summary.high.toLocaleString()} color="emerald" active={ltvFilter === 'high'} onClick={() => setLtvFilter(ltvFilter === 'high' ? '' : 'high')} />
            <StatCard label="At-Risk High Value" value={summary.at_risk.toLocaleString()} sub="$1k+ spend, 90+ days absent" color="red" />
          </div>
        )}

        {/* LTV distribution bar */}
        {summary && summary.with_visits > 0 && (
          <div className="bg-white rounded-lg border p-4 mb-6">
            <p className="text-xs font-medium text-neutral-500 mb-2">LTV Distribution <span className="text-neutral-400">({summary.with_visits.toLocaleString()} clients with visits)</span></p>
            <div className="flex h-6 rounded-full overflow-hidden">
              {[
                { key: 'vip', color: 'bg-violet-500', count: summary.vip },
                { key: 'high', color: 'bg-emerald-500', count: summary.high },
                { key: 'medium', color: 'bg-amber-400', count: summary.medium },
                { key: 'low', color: 'bg-neutral-300', count: summary.low },
              ].map(({ key, color, count }) => {
                const pct = Math.round((count / summary.with_visits) * 100)
                if (pct === 0) return null
                return (
                  <div
                    key={key}
                    className={`${color} flex items-center justify-center text-[10px] font-medium text-white cursor-pointer hover:opacity-80 transition`}
                    style={{ width: `${pct}%` }}
                    onClick={() => setLtvFilter(ltvFilter === key ? '' : key)}
                    title={`${key.toUpperCase()}: ${count} (${pct}%)`}
                  >
                    {pct >= 8 ? `${pct}%` : ''}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-2 text-[10px] text-neutral-500">
              <span>VIP: {summary.vip}</span>
              <span>High: {summary.high}</span>
              <span>Medium: {summary.medium}</span>
              <span>Low: {summary.low}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, email, phone..." className="border rounded-lg px-3 py-2 text-sm bg-white w-64" />
          <select value={ltvFilter} onChange={(e) => setLtvFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All LTV Buckets</option>
            <option value="vip">VIP ($5k+)</option>
            <option value="high">High ($2k+)</option>
            <option value="medium">Medium ($500+)</option>
            <option value="low">Low</option>
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setColSort({ key: null, dir: 'asc' }) }} className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="spend_desc">Highest Spend</option>
            <option value="visits_desc">Most Visits</option>
            <option value="recent">Most Recent</option>
            <option value="oldest">Most Absent</option>
            <option value="name_asc">Name A-Z</option>
          </select>
          <select value={windowDays} onChange={(e) => setWindowDays(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 365 days</option>
            <option value="all">All Time</option>
          </select>
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
              Patients
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
                      <SortHeader label="Patient" sortKey="name" currentSort={colSort} onSort={onColSort} />
                      <SortHeader label="LTV" sortKey="ltv_bucket" currentSort={colSort} onSort={onColSort} />
                      <SortHeader label="Visits" sortKey="total_visits" currentSort={colSort} onSort={onColSort} align="right" />
                      <SortHeader label="Spend" sortKey="total_spend" currentSort={colSort} onSort={onColSort} align="right" />
                      <SortHeader label="Credit" sortKey="account_credit" currentSort={colSort} onSort={onColSort} align="right" />
                      <SortHeader label="Membership" sortKey="membership_name" currentSort={colSort} onSort={onColSort} />
                      <SortHeader label="Vouchers" sortKey="voucher_count" currentSort={colSort} onSort={onColSort} align="right" />
                      <SortHeader label="Last Visit" sortKey="last_visit" currentSort={colSort} onSort={onColSort} />
                      <SortHeader label="Days Since" sortKey="days_since_last_visit" currentSort={colSort} onSort={onColSort} align="right" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPatients.map((p) => (
                      <tr key={p.client_id} className="border-b last:border-b-0 hover:bg-neutral-50 cursor-pointer" onClick={() => openDrawer(p.client_id)}>
                        <td className="px-4 py-2">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-neutral-400">{p.email || p.phone || ''}</p>
                        </td>
                        <td className="px-4 py-2"><LtvBadge bucket={p.ltv_bucket} /></td>
                        <td className="px-4 py-2 text-right text-neutral-600">{p.total_visits}</td>
                        <td className="px-4 py-2 text-right font-medium">${p.total_spend.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">
                          {p.account_credit > 0
                            ? <span className="text-emerald-600 font-medium">${(p.account_credit / 100).toFixed(2)}</span>
                            : <span className="text-neutral-300">{'\u2014'}</span>}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {p.membership_name
                            ? <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded text-[10px]">{p.membership_name.length > 30 ? p.membership_name.slice(0, 28) + '...' : p.membership_name}</span>
                            : <span className="text-neutral-300">{'\u2014'}</span>}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {p.voucher_count > 0
                            ? <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded text-xs">{p.voucher_count}</span>
                            : <span className="text-neutral-300">{'\u2014'}</span>}
                        </td>
                        <td className="px-4 py-2 text-neutral-600 text-xs">{p.last_visit ? new Date(p.last_visit).toLocaleDateString() : '\u2014'}</td>
                        <td className="px-4 py-2 text-right">
                          <span className={`font-medium ${
                            p.days_since_last_visit > 180 ? 'text-red-600' :
                            p.days_since_last_visit > 90 ? 'text-orange-600' :
                            p.days_since_last_visit > 30 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {p.days_since_last_visit ?? '\u2014'}d
                          </span>
                        </td>
                      </tr>
                    ))}
                    {sortedPatients.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-neutral-400">No patients found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {patients && patients.total > patients.page_size && (
                <div className="px-4 py-3 border-t flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    Showing {(patients.page - 1) * patients.page_size + 1}{'\u2013'}{Math.min(patients.page * patients.page_size, patients.total)} of {patients.total}
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
      </div>

      {/* ───── Patient Profile Drawer ───── */}
      {drawerClientId && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/35" onClick={closeDrawer} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl border-l flex flex-col">
            <div className="px-5 py-4 border-b flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold">
                  {drawerData?.client?.name || 'Patient details'}
                </h2>
                {drawerData?.client && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {drawerData.client.email || drawerData.client.phone || 'No contact info'}
                    {drawerData.member && <span className="ml-2 text-violet-600 font-medium">RELUXE Member</span>}
                  </p>
                )}
              </div>
              <button onClick={closeDrawer} className="text-sm text-neutral-500 hover:text-neutral-800">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {drawerLoading && <p className="text-sm text-neutral-500">Loading patient details...</p>}

              {!drawerLoading && drawerData?.client && (
                <>
                  {/* ── Top stats ── */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">${drawerData.client.total_spend.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">Lifetime Spend</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">{drawerData.client.total_visits}</p>
                      <p className="text-xs text-neutral-500">Total Visits</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold text-emerald-600">{drawerData.client.creditFormatted || '$0.00'}</p>
                      <p className="text-xs text-neutral-500">Account Credit</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">{drawerData.client.days_since_last_visit ?? '\u2014'}d</p>
                      <p className="text-xs text-neutral-500">Since Last Visit</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">${drawerData.insight_summary?.product_spend?.toLocaleString?.() || 0}</p>
                      <p className="text-xs text-neutral-500">Product Spend</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">{drawerData.insight_summary?.providers_seen || 0}</p>
                      <p className="text-xs text-neutral-500">Providers Seen</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">{drawerData.insight_summary?.upcoming_appointments || 0}</p>
                      <p className="text-xs text-neutral-500">Upcoming Appts</p>
                    </div>
                    {drawerData.referralStats && (
                      <div className="border rounded-lg p-3">
                        <p className="text-xl font-bold">${drawerData.referralStats.totalEarned}</p>
                        <p className="text-xs text-neutral-500">Referral Earnings</p>
                      </div>
                    )}
                  </div>

                  {/* ── Memberships ── */}
                  {(drawerData.memberships || []).length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold mb-3">Memberships</h3>
                      <div className="space-y-3">
                        {drawerData.memberships.map((m) => {
                          const vouchers = m.vouchers || []
                          const allServices = vouchers.flatMap(v => (v.services || []).map(svc => typeof svc === 'string' ? svc : svc.name))
                          return (
                            <div key={m.id} className={`border rounded-lg p-4 ${m.status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50/30' : m.status === 'PAST_DUE' ? 'border-red-200 bg-red-50/30' : m.status === 'PAUSED' ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                              <div className="flex items-center justify-between mb-2">
                                <StatusBadge status={m.status} />
                                <span className="text-sm font-semibold">${(m.unit_price / 100).toFixed(0)}/mo</span>
                              </div>
                              <p className="text-sm font-medium mb-1">{m.name}</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-500 mt-2">
                                <p>Started: <span className="text-neutral-700">{m.start_on}</span></p>
                                <p>Term: <span className="text-neutral-700">#{m.term_number}</span></p>
                                {m.next_charge_date && m.status !== 'CANCELLED' && (
                                  <p>Next charge: <span className="text-neutral-700">{m.next_charge_date}</span></p>
                                )}
                                {m.cancel_on && <p>Cancels: <span className="text-red-600">{m.cancel_on}</span></p>}
                                {m.unpause_on && <p>Resumes: <span className="text-amber-600">{m.unpause_on}</span></p>}
                                {m.location_key && <p>Location: <span className="text-neutral-700 capitalize">{m.location_key}</span></p>}
                              </div>
                              {allServices.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs font-medium text-neutral-500 mb-2">Included Services (Vouchers)</p>
                                  <div className="flex flex-wrap gap-1">
                                    {allServices.map((svc, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-xs">{svc.replace(/Membership Voucher /g, '')}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )}

                  {/* ── Referral info ── */}
                  {drawerData.referralStats && (
                    <section>
                      <h3 className="text-sm font-semibold mb-2">Referral Program</h3>
                      <div className="border rounded-lg p-3 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Tier</span>
                          <span className="capitalize font-medium">{drawerData.referralStats.tier?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Referrals Completed</span>
                          <span className="font-medium">{drawerData.referralStats.totalCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Total Earned</span>
                          <span className="font-medium">${drawerData.referralStats.totalEarned}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Codes</span>
                          <span className="font-mono text-xs">{drawerData.referralStats.codes.join(', ')}</span>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* ── Upcoming ── */}
                  {drawerData.upcoming_appointments?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold mb-2">Upcoming Appointments</h3>
                      <div className="space-y-2">
                        {drawerData.upcoming_appointments.map((appt) => (
                          <div key={appt.id} className="border rounded px-3 py-2 text-xs flex justify-between">
                            <span>{new Date(appt.start_at).toLocaleString()}</span>
                            <span className="text-neutral-500">{appt.location_key || '\u2014'} · {appt.status}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* ── Providers ── */}
                  <section>
                    <h3 className="text-sm font-semibold mb-2">Providers Seen</h3>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {(drawerData.providers_seen || []).map((provider) => (
                        <div key={provider.provider_staff_id} className="border rounded px-3 py-2 text-xs flex justify-between">
                          <span>
                            <span className="font-medium">{provider.provider_name}</span>
                            {provider.provider_title ? ` · ${provider.provider_title}` : ''}
                          </span>
                          <span className="text-neutral-500">
                            ${provider.revenue.toLocaleString()} · {provider.services} services
                          </span>
                        </div>
                      ))}
                      {(!drawerData.providers_seen || drawerData.providers_seen.length === 0) && (
                        <p className="text-xs text-neutral-500">No provider history found.</p>
                      )}
                    </div>
                  </section>

                  {/* ── Products ── */}
                  <section>
                    <h3 className="text-sm font-semibold mb-2">Products Purchased</h3>
                    <div className="space-y-2 max-h-56 overflow-auto">
                      {(drawerData.products_purchased || []).slice(0, 30).map((product) => (
                        <div key={product.sku_key} className="border rounded px-3 py-2 text-xs flex justify-between">
                          <span className="font-medium">{product.product_name || product.sku_key}</span>
                          <span className="text-neutral-500">
                            {product.qty} units · ${product.spend.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {(!drawerData.products_purchased || drawerData.products_purchased.length === 0) && (
                        <p className="text-xs text-neutral-500">No product purchases linked to this client.</p>
                      )}
                    </div>
                  </section>

                  {/* ── Appointment History ── */}
                  <section>
                    <h3 className="text-sm font-semibold mb-2">Appointment History</h3>
                    <div className="space-y-2 max-h-96 overflow-auto">
                      {(drawerData.appointment_history || []).slice(0, 60).map((appt) => (
                        <div key={appt.appointment_id} className="border rounded px-3 py-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{new Date(appt.date).toLocaleString()}</span>
                            <span className="text-neutral-500">{appt.location || '\u2014'} · ${appt.total.toLocaleString()}</span>
                          </div>
                          {appt.providers?.length > 0 && (
                            <p className="text-[11px] text-neutral-500 mt-1">Providers: {appt.providers.join(', ')}</p>
                          )}
                          {appt.services?.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {appt.services.slice(0, 8).map((svc, idx) => (
                                <span key={`${appt.appointment_id}-${idx}`} className="px-1.5 py-0.5 rounded bg-neutral-100 text-[10px]">
                                  {svc.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {(!drawerData.appointment_history || drawerData.appointment_history.length === 0) && (
                        <p className="text-xs text-neutral-500">No appointment history found.</p>
                      )}
                    </div>
                  </section>

                  {/* ── Contact info ── */}
                  <section>
                    <h3 className="text-sm font-semibold mb-2">Contact Info</h3>
                    <div className="border rounded-lg p-3 text-sm space-y-1">
                      {drawerData.client.email && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Email</span>
                          <span>{drawerData.client.email}</span>
                        </div>
                      )}
                      {drawerData.client.phone && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Phone</span>
                          <span>{drawerData.client.phone}</span>
                        </div>
                      )}
                      {drawerData.client.first_visit && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">First Visit</span>
                          <span>{new Date(drawerData.client.first_visit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      {drawerData.client.last_visit && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Last Visit</span>
                          <span>{new Date(drawerData.client.last_visit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-neutral-500">LTV Bucket</span>
                        <LtvBadge bucket={drawerData.client.ltv_bucket} />
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </AdminLayout>
  )
}
