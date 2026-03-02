// src/pages/admin/intelligence/replenishment.js
// Replenishment Radar — product depletion hot list.
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

const STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700 border-l-emerald-500',
  overdue: 'bg-amber-50 text-amber-700 border-l-amber-500',
  churned: 'bg-red-50 text-red-700 border-l-red-500',
}

const STATUS_BADGE = {
  active: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-amber-100 text-amber-700',
  churned: 'bg-red-100 text-red-700',
}

const CATEGORY_BADGE = {
  cleanser: 'bg-blue-100 text-blue-700',
  vitamin_c: 'bg-orange-100 text-orange-700',
  retinol: 'bg-purple-100 text-purple-700',
  moisturizer: 'bg-emerald-100 text-emerald-700',
  spf: 'bg-yellow-100 text-yellow-700',
  secondary: 'bg-neutral-100 text-neutral-600',
}

const CATEGORY_LABELS = { cleanser: 'Cleanser', vitamin_c: 'Vitamin C', retinol: 'Retinol', moisturizer: 'Moisturizer', spf: 'SPF', secondary: 'Secondary' }

function StatCard({ label, value, sub, color, onClick, active }) {
  const borderColors = {
    emerald: 'border-l-emerald-500', amber: 'border-l-amber-500', red: 'border-l-red-500',
  }
  const ringColors = {
    emerald: 'ring-emerald-500', amber: 'ring-amber-500', red: 'ring-red-500',
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

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ReplenishmentRadar() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ status, category, page: String(page), limit: '25' })
      const res = await adminFetch(`/api/admin/intelligence/replenishment?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [status, category, page])

  useEffect(() => { loadData() }, [loadData])

  function handleStatusFilter(s) {
    setStatus(status === s ? 'all' : s)
    setPage(1)
  }

  const summary = data?.summary
  const rows = data?.rows || []
  const pagination = data?.pagination

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Replenishment Radar</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Track product depletion by patient. Identify who needs a refill nudge before they churn.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Active" value={summary.active} color="emerald"
            sub="Within depletion window"
            onClick={() => handleStatusFilter('active')}
            active={status === 'active'}
          />
          <StatCard
            label="Overdue" value={summary.overdue} color="amber"
            sub="1–30 days past exhaustion"
            onClick={() => handleStatusFilter('overdue')}
            active={status === 'overdue'}
          />
          <StatCard
            label="Churned" value={summary.churned} color="red"
            sub="30+ days past exhaustion"
            onClick={() => handleStatusFilter('churned')}
            active={status === 'churned'}
          />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <label className="text-xs text-neutral-500">Category:</label>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Categories</option>
          <option value="cleanser">Cleanser</option>
          <option value="vitamin_c">Vitamin C</option>
          <option value="retinol">Retinol</option>
          <option value="moisturizer">Moisturizer</option>
          <option value="secondary">Secondary</option>
        </select>
        <button
          onClick={loadData}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading && !data ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Client</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Product</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Category</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Last Purchase</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Exhaustion Date</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Days Past</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={`${row.client_id}-${row.sku_key}-${i}`} className="border-b last:border-b-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs">{row.client_name || 'Unknown'}</p>
                      {row.client_phone && <p className="text-[10px] text-neutral-400">{row.client_phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">{row.product_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_BADGE[row.core4_category] || 'bg-neutral-100'}`}>
                        {CATEGORY_LABELS[row.core4_category] || row.core4_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">{fmtDate(row.last_purchase_at)}</td>
                    <td className="px-4 py-3 text-xs text-neutral-600">{fmtDate(row.predicted_exhaustion_date)}</td>
                    <td className="px-4 py-3 text-right text-xs">
                      <span className={`font-medium ${row.days_past_exhaustion > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {row.days_past_exhaustion > 0 ? `+${row.days_past_exhaustion}` : row.days_past_exhaustion}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_BADGE[row.replenishment_status] || 'bg-neutral-100'}`}>
                        {row.replenishment_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No data for current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-neutral-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border rounded-lg text-xs disabled:opacity-50 hover:bg-neutral-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 border rounded-lg text-xs disabled:opacity-50 hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

ReplenishmentRadar.getLayout = (page) => page
