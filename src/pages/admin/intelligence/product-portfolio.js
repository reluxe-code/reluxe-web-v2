// src/pages/admin/intelligence/product-portfolio.js
// Customer Product Portfolio — product depth, Core 4, SPF, repurchases, overlaps.
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

const BUCKET_COLORS = {
  '0': '#ef4444', '1': '#f97316', '2': '#eab308', '3': '#a3e635',
  '4': '#22c55e', '5-10': '#059669', '10+': '#0d9488',
}
const BUCKET_BG = {
  '0': 'bg-red-100 text-red-700', '1': 'bg-orange-100 text-orange-700',
  '2': 'bg-yellow-100 text-yellow-700', '3': 'bg-lime-100 text-lime-700',
  '4': 'bg-green-100 text-green-700', '5-10': 'bg-emerald-100 text-emerald-700',
  '10+': 'bg-teal-100 text-teal-700',
}

const CATEGORY_BADGE = {
  cleanser: 'bg-blue-100 text-blue-700',
  vitamin_c: 'bg-orange-100 text-orange-700',
  retinol: 'bg-purple-100 text-purple-700',
  moisturizer: 'bg-emerald-100 text-emerald-700',
  spf: 'bg-yellow-100 text-yellow-700',
  secondary: 'bg-neutral-100 text-neutral-600',
}
const CATEGORY_LABELS = {
  cleanser: 'Cleanser', vitamin_c: 'Vitamin C', retinol: 'Retinol',
  moisturizer: 'Moisturizer', spf: 'SPF', secondary: 'Secondary',
}

const CORE4_DOTS = [
  { key: 'has_cleanser', label: 'C', color: 'blue', full: 'Cleanser' },
  { key: 'has_vitamin_c', label: 'V', color: 'orange', full: 'Vitamin C' },
  { key: 'has_retinol', label: 'R', color: 'purple', full: 'Retinol' },
  { key: 'has_moisturizer', label: 'M', color: 'emerald', full: 'Moisturizer' },
  { key: 'has_spf', label: 'S', color: 'yellow', full: 'SPF' },
]

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-amber-100 text-amber-700',
  churned: 'bg-red-100 text-red-700',
}

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    violet: 'border-l-violet-500', emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500', blue: 'border-l-blue-500',
    yellow: 'border-l-yellow-500', neutral: 'border-l-neutral-400',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

function computeReplenishment(product) {
  if (!product.last_purchased_at || !product.depletion_days) return null
  const lastDate = new Date(product.last_purchased_at)
  const exhaustionDate = new Date(lastDate.getTime() + product.depletion_days * 24 * 60 * 60 * 1000)
  const daysPast = Math.round((Date.now() - exhaustionDate.getTime()) / (1000 * 60 * 60 * 24))
  let status = 'active'
  if (daysPast > 30) status = 'churned'
  else if (daysPast > 0) status = 'overdue'
  return { exhaustionDate, daysPast, status }
}

export default function ProductPortfolioPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bucket, setBucket] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('products_desc')
  const [page, setPage] = useState(1)

  // Drawer state
  const [drawerClientId, setDrawerClientId] = useState(null)
  const [drawerData, setDrawerData] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ sort, page: String(page), limit: '50' })
      if (bucket !== 'all') params.set('bucket', bucket)
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/admin/intelligence/product-portfolio?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [bucket, search, sort, page])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { setPage(1) }, [bucket, search, sort])

  // Drawer
  const openDrawer = useCallback(async (clientId) => {
    if (!clientId) return
    setDrawerClientId(clientId)
    setDrawerLoading(true)
    setDrawerData(null)
    try {
      const res = await fetch(`/api/admin/intelligence/patient-detail?client_id=${clientId}&window_days=all`)
      const text = await res.text()
      let json
      try { json = JSON.parse(text) } catch { throw new Error('Invalid response') }
      if (!res.ok) throw new Error(json.error || 'Failed')
      setDrawerData(json)
    } catch (e) {
      alert(`Failed to load: ${e.message}`)
      setDrawerClientId(null)
    } finally {
      setDrawerLoading(false)
    }
  }, [])

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

  const summary = data?.summary
  const distribution = data?.distribution || []
  const pagination = data?.pagination || {}
  const rows = data?.rows || []
  const maxDist = Math.max(...distribution.map((d) => d.count), 1)

  // Compute replenishment for drawer products
  const drawerProducts = (drawerData?.products_purchased || []).map((p) => ({
    ...p,
    replenishment: computeReplenishment(p),
  }))
  const trackedProducts = drawerProducts.filter((p) =>
    p.core4_category && p.core4_category !== 'secondary' && p.core4_category !== 'excluded'
  )

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Product Portfolio</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Per-customer product depth: unique products, Core 4, SPF, repurchases, and category overlaps.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Product Buyers" value={summary.total} color="blue" />
          <StatCard label="Avg Products / Client" value={summary.avg_products} color="violet" />
          <StatCard label="Repurchase Rate" value={`${summary.repurchase_pct}%`} color="emerald" sub={`${summary.with_repurchases} clients re-bought`} />
          <StatCard label="SPF Adoption" value={`${summary.spf_pct}%`} color="yellow" sub={`${summary.with_spf} own SPF`} />
        </div>
      )}

      {/* Distribution */}
      {distribution.length > 0 && (
        <div className="bg-white rounded-xl border p-5 mb-6">
          <h2 className="text-sm font-semibold mb-4">Product Count Distribution</h2>
          <div className="space-y-2">
            {distribution.map((d) => (
              <button
                key={d.bucket}
                onClick={() => setBucket(bucket === d.bucket ? 'all' : d.bucket)}
                className={`w-full flex items-center gap-3 rounded-lg px-2 py-1 transition-colors ${bucket === d.bucket ? 'bg-neutral-100' : 'hover:bg-neutral-50'}`}
              >
                <span className={`w-10 h-7 rounded flex items-center justify-center text-xs font-bold ${BUCKET_BG[d.bucket]}`}>
                  {d.bucket}
                </span>
                <div className="flex-1">
                  <div className="w-full bg-neutral-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 flex items-center px-2"
                      style={{ width: `${Math.max((d.count / maxDist) * 100, 2)}%`, backgroundColor: BUCKET_COLORS[d.bucket] }}
                    >
                      {d.count > 0 && <span className="text-[10px] font-bold text-white">{d.count}</span>}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-neutral-500 w-12 text-right">{d.pct}%</span>
              </button>
            ))}
          </div>
          {bucket !== 'all' && (
            <button onClick={() => setBucket('all')} className="mt-3 text-xs text-violet-600 hover:underline">
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white w-64"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="products_desc">Most Products</option>
          <option value="products_asc">Fewest Products</option>
          <option value="spend_desc">Highest Spend</option>
          <option value="core4_desc">Best Core 4</option>
          <option value="repurchases_desc">Most Repurchases</option>
          <option value="name_asc">Name A-Z</option>
        </select>
        <button
          onClick={loadData}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600">Patient</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-neutral-600">Products</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-neutral-600">Core 4</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-neutral-600">SPF</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-neutral-600">Repurchases</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-neutral-600">Overlaps</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-neutral-600">Spend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.client_id}
                  className="border-b last:border-b-0 hover:bg-neutral-50 cursor-pointer"
                  onClick={() => openDrawer(row.client_id)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{row.name}</p>
                    <p className="text-[10px] text-neutral-400">{row.email || row.phone || ''}</p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${BUCKET_BG[row.product_bucket]}`}>
                      {row.unique_products}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        row.core4_score === 4 ? 'bg-emerald-100 text-emerald-700' :
                        row.core4_score >= 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {row.core4_score}/4
                      </span>
                      <div className="flex gap-0.5 ml-1">
                        {CORE4_DOTS.slice(0, 4).map((d) => (
                          <span
                            key={d.key}
                            className={`w-3 h-3 rounded-full ${
                              row[d.key] ? `bg-${d.color}-500` : 'bg-neutral-200'
                            }`}
                            title={d.full}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {row.has_spf ? (
                      <span className="inline-flex items-center gap-0.5">
                        <span className="w-4 h-4 rounded-full bg-yellow-400 inline-block" />
                        {row.spf_count > 1 && (
                          <span className="text-[10px] font-bold text-yellow-700">x{row.spf_count}</span>
                        )}
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-neutral-200 inline-block" />
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {row.repurchases > 0 ? (
                      <span className="text-xs font-medium text-emerald-600">{row.repurchases} SKU{row.repurchases !== 1 ? 's' : ''}</span>
                    ) : (
                      <span className="text-xs text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {row.overlapping_categories.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {row.overlapping_categories.map((cat) => (
                          <span key={cat} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_BADGE[cat] || 'bg-neutral-100 text-neutral-600'}`}>
                            {CATEGORY_LABELS[cat] || cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${row.total_spend.toLocaleString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-400 text-sm">
                    {search || bucket !== 'all' ? 'No clients match filters.' : 'No product data found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-neutral-50">
            <p className="text-xs text-neutral-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border rounded text-xs disabled:opacity-40 hover:bg-white"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1 border rounded text-xs disabled:opacity-40 hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ Product Drawer ══ */}
      {drawerClientId && (
        <div className="fixed inset-0 z-40" onClick={closeDrawer}>
          <div className="absolute inset-0 bg-black/35" />
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl border-l flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold">{drawerData?.client?.name || 'Loading...'}</h2>
                {drawerData?.client && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {drawerData.client.email}{drawerData.client.phone ? ` · ${drawerData.client.phone}` : ''}
                  </p>
                )}
                {drawerData?.core4 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      drawerData.core4.score === 4 ? 'bg-emerald-100 text-emerald-700' :
                      drawerData.core4.score >= 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Core 4: {drawerData.core4.score}/4
                    </span>
                    <div className="flex gap-1">
                      {CORE4_DOTS.map((d) => (
                        <div
                          key={d.key}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                            drawerData.core4[d.key]
                              ? `bg-${d.color}-500 text-white`
                              : 'bg-neutral-200 text-neutral-400'
                          }`}
                          title={d.full}
                        >
                          {d.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={closeDrawer} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none p-1">
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {drawerLoading && (
                <div className="py-12 text-center text-neutral-400 text-sm">Loading product data...</div>
              )}

              {drawerData && !drawerLoading && (
                <>
                  {/* ── Replenishment Status ── */}
                  {trackedProducts.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold mb-3">Replenishment Status</h3>
                      <div className="space-y-2">
                        {trackedProducts
                          .filter((p) => p.replenishment)
                          .sort((a, b) => {
                            const order = { overdue: 0, active: 1, churned: 2 }
                            return (order[a.replenishment.status] ?? 3) - (order[b.replenishment.status] ?? 3)
                          })
                          .map((p) => {
                            const r = p.replenishment
                            const exhaustLabel = r.exhaustionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            return (
                              <div key={p.sku_key} className={`border-l-4 rounded-lg px-3 py-2 flex items-center justify-between ${
                                r.status === 'active' ? 'border-l-emerald-500 bg-emerald-50/50' :
                                r.status === 'overdue' ? 'border-l-amber-500 bg-amber-50/50' :
                                'border-l-red-500 bg-red-50/50'
                              }`}>
                                <div>
                                  <p className="text-xs font-medium">{p.product_name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_BADGE[p.core4_category] || 'bg-neutral-100 text-neutral-600'}`}>
                                      {CATEGORY_LABELS[p.core4_category] || p.core4_category}
                                    </span>
                                    <span className="text-[10px] text-neutral-500">
                                      Last: {new Date(p.last_purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[r.status]}`}>
                                    {r.status === 'active' ? `${Math.abs(r.daysPast)}d left` :
                                     r.status === 'overdue' ? `${r.daysPast}d overdue` :
                                     `${r.daysPast}d past`}
                                  </span>
                                  <p className="text-[10px] text-neutral-400 mt-0.5">{exhaustLabel}</p>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </section>
                  )}

                  {/* ── Product Inventory ── */}
                  <section>
                    <h3 className="text-sm font-semibold mb-3">
                      Product Inventory
                      <span className="text-neutral-400 font-normal ml-2">({drawerProducts.length} products)</span>
                    </h3>
                    <div className="space-y-1.5 max-h-72 overflow-auto">
                      {drawerProducts
                        .sort((a, b) => b.purchase_count - a.purchase_count)
                        .map((p) => (
                          <div key={p.sku_key} className="border rounded-lg px-3 py-2 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-medium truncate">{p.product_name || p.sku_key}</p>
                                {p.core4_category && p.core4_category !== 'secondary' && p.core4_category !== 'excluded' && (
                                  <span className={`px-1 py-0.5 rounded text-[9px] font-medium shrink-0 ${CATEGORY_BADGE[p.core4_category] || ''}`}>
                                    {CATEGORY_LABELS[p.core4_category] || p.core4_category}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                Last: {new Date(p.last_purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-xs font-medium">
                                {p.purchase_count}x
                                {p.purchase_count >= 2 && <span className="text-emerald-600 ml-1">↻</span>}
                              </p>
                              <p className="text-[10px] text-neutral-500">${p.spend.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      {drawerProducts.length === 0 && (
                        <p className="text-xs text-neutral-500">No product purchases found.</p>
                      )}
                    </div>
                  </section>

                  {/* ── Purchase Timeline ── */}
                  <section>
                    <h3 className="text-sm font-semibold mb-3">Purchase Timeline</h3>
                    <div className="space-y-0 max-h-96 overflow-auto">
                      {(drawerData.product_timeline || []).map((entry, i) => {
                        const prevDate = i > 0 ? (drawerData.product_timeline || [])[i - 1]?.date : null
                        const thisMonth = new Date(entry.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        const prevMonth = prevDate ? new Date(prevDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null
                        const showHeader = thisMonth !== prevMonth

                        return (
                          <div key={`${entry.sku_key}-${entry.date}-${i}`}>
                            {showHeader && (
                              <div className="sticky top-0 bg-neutral-50 px-3 py-1.5 -mx-1 mb-1 mt-2 first:mt-0">
                                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{thisMonth}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-3 px-3 py-1.5 hover:bg-neutral-50 rounded">
                              <span className="text-[10px] text-neutral-400 w-12 shrink-0">
                                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                                <span className="text-xs truncate">{entry.product_name}</span>
                                {entry.core4_category && entry.core4_category !== 'secondary' && entry.core4_category !== 'excluded' && (
                                  <span className={`px-1 py-0.5 rounded text-[8px] font-medium shrink-0 ${CATEGORY_BADGE[entry.core4_category] || ''}`}>
                                    {CATEGORY_LABELS[entry.core4_category] || entry.core4_category}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-neutral-500 shrink-0">${entry.net_sales}</span>
                            </div>
                          </div>
                        )
                      })}
                      {(!drawerData.product_timeline || drawerData.product_timeline.length === 0) && (
                        <p className="text-xs text-neutral-500">No purchase history found.</p>
                      )}
                    </div>
                  </section>

                  {/* ── Summary ── */}
                  {drawerData.insight_summary && (
                    <section className="border-t pt-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold">${drawerData.insight_summary.product_spend?.toLocaleString()}</p>
                          <p className="text-[10px] text-neutral-500">Total Product Spend</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{drawerData.insight_summary.product_units}</p>
                          <p className="text-[10px] text-neutral-500">Units Purchased</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">${drawerData.insight_summary.appointment_revenue?.toLocaleString()}</p>
                          <p className="text-[10px] text-neutral-500">Service Revenue</p>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </AdminLayout>
  )
}

ProductPortfolioPage.getLayout = (page) => page
