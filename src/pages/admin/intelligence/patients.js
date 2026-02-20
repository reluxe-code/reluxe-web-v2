// src/pages/admin/intelligence/patients.js
// Patient Intelligence — LTV buckets, visit patterns, at-risk detection.
import { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function LtvBadge({ bucket }) {
  const colors = {
    vip: 'bg-violet-100 text-violet-700',
    high: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-neutral-100 text-neutral-600',
  }
  const labels = { vip: 'VIP ($5k+)', high: 'High ($2k+)', medium: 'Medium ($500+)', low: 'Low' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[bucket] || 'bg-neutral-100 text-neutral-600'}`}>
      {labels[bucket] || bucket}
    </span>
  )
}

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    violet: 'border-l-violet-500', emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500', neutral: 'border-l-neutral-400',
    red: 'border-l-red-500', blue: 'border-l-blue-500',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function PatientsReport() {
  const Layout = AdminLayout
  const RenderLtvBadge = LtvBadge
  const RenderStatCard = StatCard
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ltvFilter, setLtvFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('spend_desc')
  const [windowDays, setWindowDays] = useState('365')
  const [page, setPage] = useState(1)

  // Debounce search
  const timer = useRef(null)
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer.current)
  }, [searchInput])

  const [exporting, setExporting] = useState(false)
  const [drawerClientId, setDrawerClientId] = useState(null)
  const [drawerData, setDrawerData] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50', sort })
      if (ltvFilter) params.set('ltv', ltvFilter)
      if (search) params.set('search', search)
      params.set('window_days', windowDays)
      const res = await fetch(`/api/admin/intelligence/patients?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
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
      const headers = ['Name', 'Email', 'Phone', 'LTV Bucket', 'Total Visits', 'Total Spend', 'First Visit', 'Last Visit', 'Days Since', 'Locations']
      const rows = patients.map((p) => [
        p.name, p.email || '', p.phone || '', p.ltv_bucket, p.total_visits,
        p.total_spend, p.first_visit ? new Date(p.first_visit).toLocaleDateString() : '',
        p.last_visit ? new Date(p.last_visit).toLocaleDateString() : '',
        p.days_since_last_visit ?? '', p.locations_visited,
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

  const openDrawer = useCallback(async (clientId) => {
    setDrawerClientId(clientId)
    setDrawerLoading(true)
    setDrawerData(null)
    try {
      const params = new URLSearchParams({ client_id: clientId, window_days: windowDays })
      const res = await fetch(`/api/admin/intelligence/patient-detail?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load patient details')
      setDrawerData(await res.json())
    } catch (e) {
      alert(`Failed to load patient details: ${e.message}`)
    } finally {
      setDrawerLoading(false)
    }
  }, [windowDays])

  const closeDrawer = useCallback(() => {
    setDrawerClientId(null)
    setDrawerData(null)
    setDrawerLoading(false)
  }, [])

  if (!Layout || !RenderLtvBadge || !RenderStatCard) return null

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Patient Intelligence</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Lifetime value segmentation, visit patterns, and at-risk patient detection.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <RenderStatCard label="Total Clients" value={summary.total_clients.toLocaleString()} sub={`$${summary.total_revenue.toLocaleString()} total revenue`} color="blue" />
          <RenderStatCard label="VIP ($5k+)" value={summary.vip.toLocaleString()} color="violet" />
          <RenderStatCard label="High ($2k+)" value={summary.high.toLocaleString()} color="emerald" />
          <RenderStatCard label="At-Risk High Value" value={summary.at_risk.toLocaleString()} sub="$1k+ spend, 90+ days absent" color="red" />
        </div>
      )}

      {/* LTV distribution bar */}
      {summary && summary.total_clients > 0 && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <p className="text-xs font-medium text-neutral-500 mb-2">LTV Distribution</p>
          <div className="flex h-6 rounded-full overflow-hidden">
            {[
              { key: 'vip', color: 'bg-violet-500', count: summary.vip },
              { key: 'high', color: 'bg-emerald-500', count: summary.high },
              { key: 'medium', color: 'bg-amber-400', count: summary.medium },
              { key: 'low', color: 'bg-neutral-300', count: summary.low },
            ].map(({ key, color, count }) => {
              const pct = Math.round((count / summary.total_clients) * 100)
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
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, email, phone..."
          className="border rounded-lg px-3 py-2 text-sm bg-white w-64"
        />
        <select value={ltvFilter} onChange={(e) => setLtvFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All LTV Buckets</option>
          <option value="vip">VIP ($5k+)</option>
          <option value="high">High ($2k+)</option>
          <option value="medium">Medium ($500+)</option>
          <option value="low">Low</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
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
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Patient</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">LTV</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Visits</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Spend</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Avg Interval</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">First Visit</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Last Visit</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Days Since</th>
                  </tr>
                </thead>
                <tbody>
                  {(patients?.data || []).map((p) => (
                    <tr
                      key={p.client_id}
                      className="border-b last:border-b-0 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => openDrawer(p.client_id)}
                    >
                      <td className="px-4 py-2">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.email || p.phone || ''}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openDrawer(p.client_id)
                          }}
                          className="text-[11px] text-violet-600 hover:text-violet-800 mt-1"
                        >
                          View details
                        </button>
                      </td>
                      <td className="px-4 py-2"><RenderLtvBadge bucket={p.ltv_bucket} /></td>
                      <td className="px-4 py-2 text-right text-neutral-600">{p.total_visits}</td>
                      <td className="px-4 py-2 text-right font-medium">${p.total_spend.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-neutral-600">{p.avg_days_between ? `${p.avg_days_between}d` : '—'}</td>
                      <td className="px-4 py-2 text-neutral-600 text-xs">{p.first_visit ? new Date(p.first_visit).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2 text-neutral-600 text-xs">{p.last_visit ? new Date(p.last_visit).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`font-medium ${
                          p.days_since_last_visit > 180 ? 'text-red-600' :
                          p.days_since_last_visit > 90 ? 'text-orange-600' :
                          p.days_since_last_visit > 30 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {p.days_since_last_visit ?? '—'}d
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!patients?.data || patients.data.length === 0) && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-400">No patients found.</td></tr>
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

      {drawerClientId && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/35" onClick={closeDrawer} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl border-l flex flex-col">
            <div className="px-5 py-4 border-b flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {drawerData?.client?.name || 'Patient details'}
                </h2>
                {drawerData?.client && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {drawerData.client.email || drawerData.client.phone || 'No contact info'}
                  </p>
                )}
              </div>
              <button onClick={closeDrawer} className="text-sm text-neutral-500 hover:text-neutral-800">
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {drawerLoading && (
                <p className="text-sm text-neutral-500">Loading patient details...</p>
              )}

              {!drawerLoading && drawerData?.client && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">${drawerData.client.total_spend.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">Lifetime spend</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">{drawerData.client.total_visits}</p>
                      <p className="text-xs text-neutral-500">Total visits</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">{drawerData.client.days_since_last_visit ?? '—'}d</p>
                      <p className="text-xs text-neutral-500">Since last visit</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">${drawerData.insight_summary?.product_spend?.toLocaleString?.() || 0}</p>
                      <p className="text-xs text-neutral-500">Product spend</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">{drawerData.insight_summary?.providers_seen || 0}</p>
                      <p className="text-xs text-neutral-500">Providers seen</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">{drawerData.insight_summary?.upcoming_appointments || 0}</p>
                      <p className="text-xs text-neutral-500">Upcoming appointments</p>
                    </div>
                  </div>

                  {drawerData.upcoming_appointments?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold mb-2">Upcoming Appointments</h3>
                      <div className="space-y-2">
                        {drawerData.upcoming_appointments.map((appt) => (
                          <div key={appt.id} className="border rounded px-3 py-2 text-xs flex justify-between">
                            <span>{new Date(appt.start_at).toLocaleString()}</span>
                            <span className="text-neutral-500">{appt.location_key || '—'} · {appt.status}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

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

                  <section>
                    <h3 className="text-sm font-semibold mb-2">Appointment History</h3>
                    <div className="space-y-2 max-h-96 overflow-auto">
                      {(drawerData.appointment_history || []).slice(0, 60).map((appt) => (
                        <div key={appt.appointment_id} className="border rounded px-3 py-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{new Date(appt.date).toLocaleString()}</span>
                            <span className="text-neutral-500">{appt.location || '—'} · ${appt.total.toLocaleString()}</span>
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
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </Layout>
  )
}
