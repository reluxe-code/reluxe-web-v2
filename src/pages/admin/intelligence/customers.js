// src/pages/admin/intelligence/customers.js
// Admin Customer Lookup — search, profile drawer, paper referral enrollment.
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function SortHeader({ label, sortKey, currentSort, onSort, align = 'left' }) {
  const active = currentSort.key === sortKey
  const arrow = active ? (currentSort.dir === 'asc' ? ' ↑' : ' ↓') : ''
  return (
    <th
      className={`text-${align} px-4 py-2 text-xs font-medium cursor-pointer select-none hover:text-neutral-800 transition-colors ${active ? 'text-neutral-900' : 'text-neutral-600'}`}
      onClick={() => onSort(sortKey, active && currentSort.dir === 'asc' ? 'desc' : 'asc')}
    >
      {label}{arrow}
    </th>
  )
}

const TIER_COLORS = {
  member: 'bg-neutral-100 text-neutral-600',
  advocate: 'bg-emerald-100 text-emerald-700',
  ambassador: 'bg-violet-100 text-violet-700',
  vip_ambassador: 'bg-amber-100 text-amber-700',
}

const TIER_LABELS = {
  member: 'Member',
  advocate: 'Advocate',
  ambassador: 'Ambassador',
  vip_ambassador: 'VIP Ambassador',
}

const STATUS_COLORS = {
  clicked: 'bg-neutral-100 text-neutral-600',
  booked: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  credited: 'bg-violet-100 text-violet-700',
  cancelled: 'bg-red-100 text-red-600',
  expired: 'bg-neutral-100 text-neutral-400',
}

function TierBadge({ tier }) {
  if (!tier) return <span className="text-xs text-neutral-400">—</span>
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[tier] || TIER_COLORS.member}`}>
      {TIER_LABELS[tier] || tier}
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

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [colSort, setColSort] = useState({ key: null, dir: 'desc' })

  // Drawer state
  const [drawerClientId, setDrawerClientId] = useState(null)
  const [drawerData, setDrawerData] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)

  // Enrollment state
  const [showEnroll, setShowEnroll] = useState(false)
  const [enrollForm, setEnrollForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [enrolling, setEnrolling] = useState(false)
  const [enrollResult, setEnrollResult] = useState(null)
  const [enrollError, setEnrollError] = useState(null)

  // Debounce search
  const timer = useRef(null)
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer.current)
  }, [searchInput])

  const loadData = useCallback(async () => {
    if (!search) { setData(null); return }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ search, page: String(page), limit: '50' })
      const res = await fetch(`/api/admin/intelligence/customer-lookup?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { setPage(1) }, [search])

  const openDrawer = useCallback(async (clientId) => {
    setDrawerClientId(clientId)
    setDrawerLoading(true)
    setDrawerData(null)
    try {
      const res = await fetch(`/api/admin/intelligence/customer-detail?client_id=${clientId}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setDrawerData(await res.json())
    } catch (e) {
      alert(`Failed to load customer: ${e.message}`)
    } finally {
      setDrawerLoading(false)
    }
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerClientId(null)
    setDrawerData(null)
    setDrawerLoading(false)
  }, [])

  const copyCode = useCallback((code) => {
    navigator.clipboard.writeText(`https://reluxemedspa.com/referral/${code}`)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }, [])

  const handleEnroll = useCallback(async (e) => {
    e.preventDefault()
    setEnrolling(true)
    setEnrollError(null)
    setEnrollResult(null)
    try {
      const res = await fetch('/api/admin/referral/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollForm),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to enroll')
      setEnrollResult(json)
      setEnrollForm({ firstName: '', lastName: '', phone: '' })
    } catch (e) {
      setEnrollError(e.message)
    } finally {
      setEnrolling(false)
    }
  }, [enrollForm])

  const customers = data?.customers || []

  const sortedCustomers = useMemo(() => {
    const rows = [...customers]
    if (!colSort.key) return rows
    return rows.sort((a, b) => {
      let av = a[colSort.key], bv = b[colSort.key]
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase() }
      if (av < bv) return colSort.dir === 'asc' ? -1 : 1
      if (av > bv) return colSort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [customers, colSort])

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customer Lookup</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Search customers by name or phone. View referral activity and enroll paper referrals.
        </p>
      </div>

      {/* Enrollment card */}
      <div className="bg-white rounded-xl border mb-6">
        <button
          onClick={() => { setShowEnroll(!showEnroll); setEnrollResult(null); setEnrollError(null) }}
          className="w-full px-5 py-4 flex items-center justify-between text-left"
        >
          <div>
            <p className="text-sm font-semibold">Enroll Paper Referral</p>
            <p className="text-xs text-neutral-500">Enter name & phone from a paper referral card</p>
          </div>
          <span className="text-neutral-400 text-lg">{showEnroll ? '−' : '+'}</span>
        </button>

        {showEnroll && (
          <div className="px-5 pb-5 border-t pt-4">
            <form onSubmit={handleEnroll} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">First Name *</label>
                <input
                  type="text"
                  value={enrollForm.firstName}
                  onChange={(e) => setEnrollForm({ ...enrollForm, firstName: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-40"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Last Name</label>
                <input
                  type="text"
                  value={enrollForm.lastName}
                  onChange={(e) => setEnrollForm({ ...enrollForm, lastName: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-40"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={enrollForm.phone}
                  onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                  placeholder="(317) 555-1234"
                  className="border rounded-lg px-3 py-2 text-sm w-44"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={enrolling}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll'}
              </button>
            </form>

            {enrollError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{enrollError}</p>
              </div>
            )}

            {enrollResult && (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm font-medium text-emerald-800">
                  {enrollResult.alreadyEnrolled ? 'Already enrolled!' : 'Enrolled successfully!'}
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-neutral-500">Name:</span> {enrollResult.memberName}</p>
                  <p><span className="text-neutral-500">Code:</span> <span className="font-mono font-medium">{enrollResult.code}</span></p>
                  <p><span className="text-neutral-500">URL:</span> <span className="font-mono text-xs">{enrollResult.referralUrl}</span></p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(enrollResult.referralUrl); }}
                    className="px-3 py-1.5 bg-white border rounded-lg text-xs font-medium hover:bg-neutral-50"
                  >
                    Copy Link
                  </button>
                  <a
                    href={enrollResult.smsLink}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 inline-block"
                  >
                    Send SMS
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="border rounded-lg px-3 py-2 text-sm bg-white w-80"
        />
        {loading && <span className="text-xs text-neutral-400 self-center">Searching...</span>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results table */}
      {data && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl">
            <h2 className="text-sm font-semibold">
              Results
              <span className="text-neutral-400 font-normal ml-2">({data.total.toLocaleString()} found)</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <SortHeader label="Customer" sortKey="name" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} />
                  <SortHeader label="Visits" sortKey="total_visits" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} align="right" />
                  <SortHeader label="Spend" sortKey="total_spend" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} align="right" />
                  <SortHeader label="LTV" sortKey="ltv_bucket" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} />
                  <SortHeader label="Referral" sortKey="referral_tier" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} />
                  <SortHeader label="Completed" sortKey="total_referrals_completed" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} align="right" />
                  <SortHeader label="Earned" sortKey="total_earned" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} align="right" />
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.map((c) => (
                  <tr
                    key={c.client_id}
                    className="border-b last:border-b-0 hover:bg-neutral-50 cursor-pointer"
                    onClick={() => openDrawer(c.client_id)}
                  >
                    <td className="px-4 py-2">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-neutral-400">{c.phone || c.email || ''}</p>
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-600">{c.total_visits}</td>
                    <td className="px-4 py-2 text-right font-medium">${c.total_spend.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.ltv_bucket === 'vip' ? 'bg-violet-100 text-violet-700' :
                        c.ltv_bucket === 'high' ? 'bg-emerald-100 text-emerald-700' :
                        c.ltv_bucket === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {c.ltv_bucket?.toUpperCase() || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {c.has_referral_code ? <TierBadge tier={c.referral_tier} /> : <span className="text-xs text-neutral-400">Not enrolled</span>}
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-600">{c.total_referrals_completed || '—'}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {c.total_earned > 0 ? `$${c.total_earned.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                      {search ? 'No customers found.' : 'Type a name or phone to search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.total > data.pageSize && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50">Previous</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * data.pageSize >= data.total} className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile drawer */}
      {drawerClientId && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/35" onClick={closeDrawer} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl border-l flex flex-col">
            <div className="px-5 py-4 border-b flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {drawerData?.client?.name || 'Customer details'}
                </h2>
                {drawerData?.client && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {drawerData.client.phone || drawerData.client.email || 'No contact info'}
                    {drawerData.member ? ' · RELUXE Member' : ''}
                  </p>
                )}
              </div>
              <button onClick={closeDrawer} className="text-sm text-neutral-500 hover:text-neutral-800">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {drawerLoading && <p className="text-sm text-neutral-500">Loading customer details...</p>}

              {!drawerLoading && drawerData?.client && (
                <>
                  {/* Stat cards */}
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
                      <p className="text-xl font-bold">{drawerData.stats.total_completed}</p>
                      <p className="text-xs text-neutral-500">Referrals completed</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xl font-bold">${drawerData.stats.total_earned.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">Total earned</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <TierBadge tier={drawerData.stats.tier} />
                      <p className="text-xs text-neutral-500 mt-1">Referral tier</p>
                    </div>
                  </div>

                  {/* Referral codes */}
                  <section>
                    <h3 className="text-sm font-semibold mb-2">Referral Codes</h3>
                    {drawerData.referralCodes.length > 0 ? (
                      <div className="space-y-2">
                        {drawerData.referralCodes.map((c) => (
                          <div key={c.id} className="border rounded px-3 py-2 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-mono font-medium">{c.code}</span>
                              {c.isPrimary && <span className="ml-2 text-neutral-400">Primary</span>}
                              <span className="ml-3 text-neutral-400">
                                {c.completed} completed · ${c.earned} earned
                              </span>
                            </div>
                            <button
                              onClick={() => copyCode(c.code)}
                              className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-xs"
                            >
                              {copiedCode === c.code ? 'Copied!' : 'Copy Link'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">No referral codes — customer is not enrolled in the referral program.</p>
                    )}

                    {/* Phone as code info */}
                    {drawerData.client.phone && drawerData.member && (
                      <p className="text-xs text-neutral-400 mt-2">
                        Phone number also works as a referral code: <span className="font-mono">{drawerData.client.phone}</span>
                      </p>
                    )}

                    {/* SMS button */}
                    {drawerData.referralCodes.length > 0 && drawerData.client.phone && (
                      <div className="mt-2">
                        <a
                          href={`sms:${drawerData.client.phone}?body=${encodeURIComponent(
                            `Here's your RELUXE referral link! Share it with friends and you both get $25: https://reluxemedspa.com/referral/${drawerData.referralCodes[0].code}`
                          )}`}
                          className="inline-block px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                        >
                          Send Referral Link via SMS
                        </a>
                      </div>
                    )}
                  </section>

                  {/* Outbound referrals — people they've referred */}
                  <section>
                    <h3 className="text-sm font-semibold mb-2">
                      People They&apos;ve Referred
                      <span className="text-neutral-400 font-normal ml-1">({drawerData.outboundReferrals.length})</span>
                    </h3>
                    {drawerData.outboundReferrals.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {drawerData.outboundReferrals.map((r) => (
                          <div key={r.id} className="border rounded px-3 py-2 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-medium">{r.referee}</span>
                              <span className="ml-2 text-neutral-400">{r.location}</span>
                              {r.selfReferral && <span className="ml-2 text-orange-500">Self-referral</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={r.status} />
                              <span className="text-neutral-500">
                                {r.creditedAt ? new Date(r.creditedAt).toLocaleDateString() :
                                 r.completedAt ? new Date(r.completedAt).toLocaleDateString() :
                                 r.bookedAt ? new Date(r.bookedAt).toLocaleDateString() :
                                 r.clickedAt ? new Date(r.clickedAt).toLocaleDateString() : '—'}
                              </span>
                              <span className="font-medium">${r.reward}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">No outbound referrals.</p>
                    )}
                  </section>

                  {/* Inbound referrals — who referred them */}
                  <section>
                    <h3 className="text-sm font-semibold mb-2">
                      Referred By
                      <span className="text-neutral-400 font-normal ml-1">({drawerData.inboundReferrals.length})</span>
                    </h3>
                    {drawerData.inboundReferrals.length > 0 ? (
                      <div className="space-y-2">
                        {drawerData.inboundReferrals.map((r) => (
                          <div key={r.id} className="border rounded px-3 py-2 text-xs flex justify-between items-center">
                            <span className="font-medium">{r.referrerName}</span>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={r.status} />
                              <span className="text-neutral-500">
                                {r.completedAt ? new Date(r.completedAt).toLocaleDateString() :
                                 r.bookedAt ? new Date(r.bookedAt).toLocaleDateString() : '—'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">Not referred by anyone.</p>
                    )}
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
