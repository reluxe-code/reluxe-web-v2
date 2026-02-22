// src/pages/admin/memberships.js
// Admin dashboard for Boulevard memberships + account credits with profile drawer.
import { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

const STATUS_COLORS = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-neutral-100 text-neutral-500',
  PAST_DUE: 'bg-red-50 text-red-700',
  PAUSED: 'bg-amber-50 text-amber-700',
}

function SortHeader({ label, sortKey, currentSort, onSort, align = 'left' }) {
  const active = currentSort.key === sortKey
  const arrow = active ? (currentSort.dir === 'asc' ? ' ↑' : ' ↓') : ''
  return (
    <th
      className={`text-${align} px-4 py-2 text-xs font-medium text-neutral-600 cursor-pointer select-none hover:text-black transition-colors`}
      onClick={() => onSort(sortKey, active && currentSort.dir === 'asc' ? 'desc' : 'asc')}
    >
      {label}{arrow}
    </th>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-neutral-100 text-neutral-600'}`}>
      {status}
    </span>
  )
}

function StatCard({ label, value, sub, color = 'violet', onClick, active }) {
  const borderColors = {
    violet: 'border-l-violet-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
    neutral: 'border-l-neutral-400',
  }
  const ringColors = {
    violet: 'ring-violet-500',
    emerald: 'ring-emerald-500',
    amber: 'ring-amber-500',
    red: 'ring-red-500',
    blue: 'ring-blue-500',
    neutral: 'ring-neutral-400',
  }
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-l-4 ${borderColors[color]} p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${active ? `ring-2 ${ringColors[color]} shadow-md` : ''}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function MembershipsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('memberships')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [syncing, setSyncing] = useState(false)
  const timerRef = useRef(null)

  // Sort state
  const [mSort, setMSort] = useState({ key: null, dir: 'asc' })
  const [cSort, setCSort] = useState({ key: 'account_credit', dir: 'desc' })

  // Drawer state
  const [drawerClientId, setDrawerClientId] = useState(null)
  const [drawerData, setDrawerData] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), status: statusFilter })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/memberships?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => { loadData() }, [loadData])

  const handleSearchInput = (val) => {
    setSearchInput(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { setSearch(val); setPage(1) }, 400)
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/blvd-sync/incremental', { method: 'POST' })
      const result = await res.json()
      if (result.ok) {
        alert(`Sync complete: ${result.membershipsSynced || 0} memberships, ${result.creditsUpdated || 0} credits updated`)
        loadData()
      } else {
        alert('Sync failed: ' + (result.error || 'unknown'))
      }
    } catch (e) {
      alert('Sync error: ' + e.message)
    } finally {
      setSyncing(false)
    }
  }

  const openDrawer = useCallback(async (clientId) => {
    if (!clientId) return
    setDrawerClientId(clientId)
    setDrawerLoading(true)
    setDrawerData(null)
    try {
      const res = await fetch(`/api/admin/membership-detail?client_id=${clientId}`)
      const text = await res.text()
      let json
      try { json = JSON.parse(text) } catch { throw new Error('Invalid response from server') }
      if (!res.ok) throw new Error(json.error || 'Failed')
      setDrawerData(json)
    } catch (e) {
      alert(`Failed to load profile: ${e.message}`)
      setDrawerClientId(null)
    } finally {
      setDrawerLoading(false)
    }
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerClientId(null)
    setDrawerData(null)
  }, [])

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerClientId) return
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerClientId, closeDrawer])

  const s = data?.summary || {}

  const sortRows = (rows, { key, dir }) => {
    if (!key) return rows
    return [...rows].sort((a, b) => {
      let av, bv
      if (key === '_voucher_count') {
        av = (a.vouchers || []).flatMap(v => v.services || []).length
        bv = (b.vouchers || []).flatMap(v => v.services || []).length
      } else if (key.startsWith('client.')) {
        av = (a.client || {})[key.slice(7)]
        bv = (b.client || {})[key.slice(7)]
      } else {
        av = a[key]
        bv = b[key]
      }
      // Handle name sort by extracting display name
      if (key === 'client.name') {
        av = av || `${(a.client || {}).first_name || ''} ${(a.client || {}).last_name || ''}`.trim()
        bv = bv || `${(b.client || {}).first_name || ''} ${(b.client || {}).last_name || ''}`.trim()
      }
      if (key === 'name_display') {
        av = a.name || `${a.first_name || ''} ${a.last_name || ''}`.trim()
        bv = b.name || `${b.first_name || ''} ${b.last_name || ''}`.trim()
      }
      // Nulls last
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      // String vs number
      if (typeof av === 'string' && typeof bv === 'string') {
        return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return dir === 'asc' ? av - bv : bv - av
    })
  }

  const memberships = sortRows(data?.memberships || [], mSort)
  const credits = sortRows(data?.clientsWithCredit || [], cSort)

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Memberships & Credits</h1>
            <p className="text-sm text-neutral-500 mt-1">Boulevard membership sync + account credit balances</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard label="Active" value={s.active || 0} color="emerald" active={tab === 'memberships' && statusFilter === 'ACTIVE'} onClick={() => { setTab('memberships'); setStatusFilter(f => f === 'ACTIVE' ? 'all' : 'ACTIVE'); setPage(1) }} />
          <StatCard label="Past Due" value={s.pastDue || 0} color="red" active={tab === 'memberships' && statusFilter === 'PAST_DUE'} onClick={() => { setTab('memberships'); setStatusFilter(f => f === 'PAST_DUE' ? 'all' : 'PAST_DUE'); setPage(1) }} />
          <StatCard label="Paused" value={s.paused || 0} color="amber" active={tab === 'memberships' && statusFilter === 'PAUSED'} onClick={() => { setTab('memberships'); setStatusFilter(f => f === 'PAUSED' ? 'all' : 'PAUSED'); setPage(1) }} />
          <StatCard label="Cancelled" value={s.cancelled || 0} color="neutral" active={tab === 'memberships' && statusFilter === 'CANCELLED'} onClick={() => { setTab('memberships'); setStatusFilter(f => f === 'CANCELLED' ? 'all' : 'CANCELLED'); setPage(1) }} />
          <StatCard label="Monthly MRR" value={s.mrrFormatted || '$0'} color="violet" />
          <StatCard label="Credits Outstanding" value={s.creditsOutstandingFormatted || '$0'} sub={`${s.clientsWithCredit || 0} clients`} color="blue" active={tab === 'credits'} onClick={() => { setTab('credits'); setPage(1) }} />
        </div>

        {/* Tab toggle + search */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
            <button onClick={() => { setTab('memberships'); setPage(1) }} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'memberships' ? 'bg-white shadow text-black' : 'text-neutral-500 hover:text-black'}`}>Memberships</button>
            <button onClick={() => { setTab('credits'); setPage(1) }} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'credits' ? 'bg-white shadow text-black' : 'text-neutral-500 hover:text-black'}`}>Account Credits</button>
          </div>
          <div className="flex items-center gap-3">
            {tab === 'memberships' && (
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm">
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PAST_DUE">Past Due</option>
                <option value="PAUSED">Paused</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            )}
            <input type="text" value={searchInput} onChange={(e) => handleSearchInput(e.target.value)} placeholder="Search name, email, phone..." className="border rounded-lg px-3 py-2 text-sm w-64" />
          </div>
        </div>

        {/* ───── Memberships table ───── */}
        {tab === 'memberships' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b">
                  <tr>
                    <SortHeader label="Client" sortKey="client.name" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} />
                    <SortHeader label="Plan" sortKey="name" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} />
                    <SortHeader label="Status" sortKey="status" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} />
                    <SortHeader label="Price" sortKey="unit_price" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} />
                    <SortHeader label="Started" sortKey="start_on" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} />
                    <SortHeader label="Next Charge" sortKey="next_charge_date" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} />
                    <SortHeader label="Term" sortKey="term_number" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} />
                    <SortHeader label="Location" sortKey="location_key" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} />
                    <SortHeader label="Credit" sortKey="client.account_credit" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} align="right" />
                    <SortHeader label="Vouchers" sortKey="_voucher_count" currentSort={mSort} onSort={(key, dir) => setMSort({ key, dir })} />
                  </tr>
                </thead>
                <tbody>
                  {loading && !memberships.length ? (
                    <tr><td colSpan={10} className="px-4 py-8 text-center text-neutral-400">Loading...</td></tr>
                  ) : memberships.length === 0 ? (
                    <tr><td colSpan={10} className="px-4 py-8 text-center text-neutral-400">No memberships found</td></tr>
                  ) : memberships.map((m) => {
                    const client = m.client || {}
                    const clientId = client.id
                    const vouchers = m.vouchers || []
                    const voucherServices = vouchers.flatMap(v => (v.services || []).map(svc => typeof svc === 'string' ? svc : svc.name))
                    return (
                      <tr key={m.id} className="border-b last:border-b-0 hover:bg-neutral-50 cursor-pointer" onClick={() => openDrawer(clientId)}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim() || '—'}</p>
                          <p className="text-xs text-neutral-400">{client.email || client.phone || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[200px]"><p className="truncate" title={m.name}>{m.name}</p></td>
                        <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                        <td className="px-4 py-3">${(m.unit_price / 100).toFixed(0)}/mo</td>
                        <td className="px-4 py-3 text-xs text-neutral-500">{m.start_on}</td>
                        <td className="px-4 py-3 text-xs text-neutral-500">{m.status === 'CANCELLED' ? <span className="text-neutral-400">—</span> : m.next_charge_date || '—'}</td>
                        <td className="px-4 py-3 text-center">{m.term_number}</td>
                        <td className="px-4 py-3 text-xs capitalize">{m.location_key || '—'}</td>
                        <td className="px-4 py-3 text-right">{client.account_credit > 0 ? <span className="text-emerald-600 font-medium">${(client.account_credit / 100).toFixed(2)}</span> : '—'}</td>
                        <td className="px-4 py-3 text-center">{voucherServices.length > 0 ? <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded text-xs">{voucherServices.length}</span> : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {(data?.totalMemberships || 0) > 50 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <span className="text-xs text-neutral-500">Page {page} · {data.totalMemberships} total</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded text-sm disabled:opacity-30 hover:bg-neutral-50">Prev</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= (data?.totalMemberships || 0)} className="px-3 py-1 border rounded text-sm disabled:opacity-30 hover:bg-neutral-50">Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ───── Credits table ───── */}
        {tab === 'credits' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl">
              <h2 className="text-sm font-semibold">Clients with Account Credit</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Balances synced from Boulevard (store credit, referral rewards, etc.)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b">
                  <tr>
                    <SortHeader label="Client" sortKey="name_display" currentSort={cSort} onSort={(key, dir) => setCSort({ key, dir })} />
                    <SortHeader label="Email" sortKey="email" currentSort={cSort} onSort={(key, dir) => setCSort({ key, dir })} />
                    <SortHeader label="Phone" sortKey="phone" currentSort={cSort} onSort={(key, dir) => setCSort({ key, dir })} />
                    <SortHeader label="Credit Balance" sortKey="account_credit" currentSort={cSort} onSort={(key, dir) => setCSort({ key, dir })} align="right" />
                    <SortHeader label="Visits" sortKey="visit_count" currentSort={cSort} onSort={(key, dir) => setCSort({ key, dir })} align="right" />
                    <SortHeader label="Total Spend" sortKey="total_spend" currentSort={cSort} onSort={(key, dir) => setCSort({ key, dir })} align="right" />
                    <SortHeader label="Last Synced" sortKey="account_credit_updated_at" currentSort={cSort} onSort={(key, dir) => setCSort({ key, dir })} />
                  </tr>
                </thead>
                <tbody>
                  {loading && !credits.length ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">Loading...</td></tr>
                  ) : credits.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No clients with credit balance</td></tr>
                  ) : credits.map((c) => (
                    <tr key={c.id} className="border-b last:border-b-0 hover:bg-neutral-50 cursor-pointer" onClick={() => openDrawer(c.id)}>
                      <td className="px-4 py-3 font-medium">{c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || '—'}</td>
                      <td className="px-4 py-3 text-neutral-500">{c.email || '—'}</td>
                      <td className="px-4 py-3 text-neutral-500">{c.phone || '—'}</td>
                      <td className="px-4 py-3 text-right"><span className="text-emerald-600 font-semibold">{c.creditFormatted}</span></td>
                      <td className="px-4 py-3 text-right">{c.visit_count || 0}</td>
                      <td className="px-4 py-3 text-right">${parseFloat(c.total_spend || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-neutral-400">{c.account_credit_updated_at ? new Date(c.account_credit_updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ───── Profile Drawer ───── */}
      {drawerClientId && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/35" onClick={closeDrawer} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl border-l flex flex-col">
            {/* Drawer header */}
            <div className="px-5 py-4 border-b flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold">
                  {drawerData?.client?.name || drawerData?.client?.first_name
                    ? `${drawerData.client.first_name || ''} ${drawerData.client.last_name || ''}`.trim()
                    : 'Client Profile'}
                </h2>
                {drawerData?.client && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {drawerData.client.email || drawerData.client.phone || ''}
                    {drawerData.member && <span className="ml-2 text-violet-600 font-medium">RELUXE Member</span>}
                  </p>
                )}
              </div>
              <button onClick={closeDrawer} className="text-sm text-neutral-500 hover:text-neutral-800">Close</button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {drawerLoading && <p className="text-sm text-neutral-500">Loading profile...</p>}

              {!drawerLoading && drawerData?.client && (
                <>
                  {/* ── Top stats ── */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold text-emerald-600">{drawerData.client.creditFormatted}</p>
                      <p className="text-xs text-neutral-500">Account Credit</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">{drawerData.client.visit_count || 0}</p>
                      <p className="text-xs text-neutral-500">Total Visits</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">${(drawerData.client.total_spend || 0).toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">Lifetime Spend</p>
                    </div>
                    {drawerData.referralStats && (
                      <div className="border rounded-lg p-3">
                        <p className="text-xl font-bold">${drawerData.referralStats.totalEarned}</p>
                        <p className="text-xs text-neutral-500">Referral Earnings</p>
                      </div>
                    )}
                  </div>

                  {/* ── Memberships ── */}
                  <section>
                    <h3 className="text-sm font-semibold mb-3">Memberships</h3>
                    {drawerData.memberships.length > 0 ? (
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
                                  <p className="text-xs font-medium text-neutral-500 mb-2">Included Services</p>
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
                    ) : (
                      <p className="text-sm text-neutral-400">No memberships found for this client.</p>
                    )}
                  </section>

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

                  {/* ── Recent visits ── */}
                  <section>
                    <h3 className="text-sm font-semibold mb-2">
                      Recent Visits
                      <span className="text-neutral-400 font-normal ml-1">({drawerData.recentVisits.length})</span>
                    </h3>
                    {drawerData.recentVisits.length > 0 ? (
                      <div className="space-y-2">
                        {drawerData.recentVisits.map((v, i) => (
                          <div key={i} className="border rounded px-3 py-2 text-xs flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{v.services.map(s => s.name).join(', ') || 'Visit'}</p>
                              <p className="text-neutral-400 mt-0.5 capitalize">{v.location || '—'}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-neutral-500">{new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              {v.services.some(s => s.price) && (
                                <p className="font-medium">${v.services.reduce((s, svc) => s + (svc.price || 0), 0).toFixed(0)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400">No completed visits.</p>
                    )}
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
                      {drawerData.client.first_visit_at && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">First Visit</span>
                          <span>{new Date(drawerData.client.first_visit_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      {drawerData.client.last_visit_at && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Last Visit</span>
                          <span>{new Date(drawerData.client.last_visit_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Boulevard ID</span>
                        <span className="font-mono text-xs text-neutral-400">{drawerData.client.boulevard_id?.split(':').pop()?.slice(0, 8) || '—'}</span>
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
