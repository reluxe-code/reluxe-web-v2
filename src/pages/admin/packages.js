// src/pages/admin/packages.js
// Package sales dashboard: stats, recent purchases, expiring soon, catalog
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    emerald: 'border-l-emerald-500', violet: 'border-l-violet-500',
    rose: 'border-l-rose-500', blue: 'border-l-blue-500',
    amber: 'border-l-amber-500', neutral: 'border-l-neutral-400',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

function fmtWhole(cents) { return `$${Math.round(cents / 100).toLocaleString()}` }

const STATUS_COLORS = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-neutral-100 text-neutral-500',
  REDEEMED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

export default function PackagesAdmin() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(30)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/packages/dashboard?days=${days}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => { fetchData() }, [fetchData])

  const stats = data?.stats || {}

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Packages</h1>
          <p className="text-sm text-neutral-500 mt-1">Package sales, utilization, and expiry tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
          <button onClick={fetchData} disabled={loading} className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label={`Revenue (${days}d)`} value={fmtWhole(stats.revenue)} color="emerald" />
            <StatCard label={`Sold (${days}d)`} value={stats.totalSold} color="violet" />
            <StatCard label="Active Packages" value={stats.activePackages} color="blue" />
            <StatCard label="Sessions Remaining" value={stats.sessionsRemaining} color="amber" />
            <StatCard label="Expiring ≤90d" value={stats.expiringSoon} color="rose" />
          </div>

          {/* Recent Purchases */}
          <div className="bg-white rounded-lg border mb-8">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Purchases</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Last 50 package purchases</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-500 border-b">
                    <th className="px-4 py-2">Client</th>
                    <th className="px-4 py-2">Package</th>
                    <th className="px-4 py-2">Purchased</th>
                    <th className="px-4 py-2">Expires</th>
                    <th className="px-4 py-2 text-right">Sessions Left</th>
                    <th className="px-4 py-2">Location</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recentPackages || []).map((p) => (
                    <tr key={p.id} className="border-b hover:bg-neutral-50">
                      <td className="px-4 py-3">{p.client_name}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-neutral-500">{p.purchased_at ? new Date(p.purchased_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-neutral-500">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-right">{p.sessions_remaining}</td>
                      <td className="px-4 py-3 text-neutral-500">{p.location_key || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[p.status] || 'bg-neutral-100 text-neutral-500'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!(data.recentPackages?.length) && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No packages imported yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white rounded-lg border mb-8">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Expiring Soon</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Active packages expiring within 90 days</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-500 border-b">
                    <th className="px-4 py-2">Client</th>
                    <th className="px-4 py-2">Package</th>
                    <th className="px-4 py-2">Expires</th>
                    <th className="px-4 py-2 text-right">Sessions Left</th>
                    <th className="px-4 py-2">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.expiringSoon || []).map((p) => (
                    <tr key={p.id} className="border-b hover:bg-neutral-50">
                      <td className="px-4 py-3">{p.client_name}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-neutral-500">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-right">{p.sessions_remaining}</td>
                      <td className="px-4 py-3 text-neutral-500">{p.location_key || '-'}</td>
                    </tr>
                  ))}
                  {!(data.expiringSoon?.length) && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No packages expiring in the next 90 days.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Package Catalog */}
          <div className="bg-white rounded-lg border mb-8">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Package Catalog</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Boulevard package templates synced from catalog</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-500 border-b">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Sessions</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.catalog || []).map((c) => (
                    <tr key={c.id} className="border-b hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-right">{c.unit_price ? fmtWhole(c.unit_price) : '-'}</td>
                      <td className="px-4 py-3 text-right">{c.voucher_count || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                          {c.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!(data.catalog?.length) && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No catalog entries synced yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {loading && !data && (
        <p className="text-sm text-neutral-500">Loading packages...</p>
      )}
    </AdminLayout>
  )
}

PackagesAdmin.getLayout = (page) => page
