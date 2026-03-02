// src/pages/admin/intelligence/sku-mapping.js
// SKU → Core 4 Mapping — classify products for regimen gap analysis.
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

const CATEGORIES = [
  { value: 'cleanser', label: 'Cleanser', color: 'bg-blue-100 text-blue-700' },
  { value: 'vitamin_c', label: 'Vitamin C', color: 'bg-orange-100 text-orange-700' },
  { value: 'retinol', label: 'Retinol', color: 'bg-purple-100 text-purple-700' },
  { value: 'moisturizer', label: 'Moisturizer', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'spf', label: 'SPF', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'secondary', label: 'Secondary', color: 'bg-neutral-100 text-neutral-600' },
  { value: 'excluded', label: 'Excluded', color: 'bg-red-100 text-red-600' },
]

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    violet: 'border-l-violet-500', emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500', neutral: 'border-l-neutral-400',
    blue: 'border-l-blue-500',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

function CategoryBadge({ category }) {
  const cat = CATEGORY_MAP[category]
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat?.color || 'bg-neutral-100 text-neutral-600'}`}>
      {cat?.label || category}
    </span>
  )
}

function ConfidenceBadge({ confidence }) {
  const colors = {
    manual: 'bg-violet-100 text-violet-700',
    high: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[confidence] || 'bg-neutral-100'}`}>
      {confidence}
    </span>
  )
}

export default function SkuMappingPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [autoMapping, setAutoMapping] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(null)
  const [sortCol, setSortCol] = useState({ key: 'sale_count', dir: 'desc' })

  const loadData = useCallback(async (autoMap = false) => {
    if (autoMap) setAutoMapping(true)
    else setLoading(true)
    setError(null)
    try {
      const url = autoMap ? '/api/admin/intelligence/sku-mapping?auto_map=true' : '/api/admin/intelligence/sku-mapping'
      const res = await fetch(url)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setAutoMapping(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function saveRow(skuKey, category, secondary, depletionDays) {
    setSaving(skuKey)
    try {
      const res = await adminFetch('/api/admin/intelligence/sku-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku_key: skuKey, core4_category: category, core4_secondary: secondary || null, depletion_days: depletionDays }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      // Update local state
      setData((prev) => ({
        ...prev,
        rows: prev.rows.map((r) => r.sku_key === skuKey ? { ...r, core4_category: category, core4_secondary: secondary || null, depletion_days: depletionDays, confidence: 'manual', auto_mapped: false } : r),
      }))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(null)
    }
  }

  const summary = data?.summary
  let rows = data?.rows || []

  // Filter
  if (filter !== 'all') rows = rows.filter((r) => r.core4_category === filter)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter((r) =>
      (r.product_name || '').toLowerCase().includes(q) ||
      (r.brand || '').toLowerCase().includes(q) ||
      (r.sku_key || '').toLowerCase().includes(q)
    )
  }

  // Sort
  const { key: sk, dir: sd } = sortCol
  rows = [...rows].sort((a, b) => {
    let av = a[sk], bv = b[sk]
    if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase() }
    if (av == null) av = ''
    if (bv == null) bv = ''
    if (av < bv) return sd === 'asc' ? -1 : 1
    if (av > bv) return sd === 'asc' ? 1 : -1
    return 0
  })

  function toggleSort(key) {
    setSortCol((prev) => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'product_name' || key === 'brand' || key === 'core4_category' ? 'asc' : 'desc' })
  }

  function SortTh({ label, sortKey, align = 'left' }) {
    const active = sortCol.key === sortKey
    const arrow = active ? (sortCol.dir === 'asc' ? ' \u2191' : ' \u2193') : ''
    return (
      <th
        className={`text-${align} px-4 py-2 text-xs font-medium text-neutral-600 cursor-pointer select-none hover:text-black transition-colors whitespace-nowrap`}
        onClick={() => toggleSort(sortKey)}
      >
        {label}{arrow}
      </th>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">SKU Mapping</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Classify products into Core 4 categories for regimen gap analysis and replenishment tracking.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total SKUs" value={summary.total} color="neutral" />
          <StatCard label="Core 4 Mapped" value={summary.mapped} color="emerald" />
          <StatCard label="Low Confidence" value={summary.unmapped} color="amber" />
          <StatCard label="Auto-Mapped" value={summary.autoMapped} color="blue" />
          <StatCard label="Manually Set" value={summary.manualMapped} color="violet" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label} ({summary?.categoryBreakdown?.[c.value] || 0})</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white w-64"
        />
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={autoMapping}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {autoMapping ? 'Auto-Mapping...' : 'Auto-Map SKUs'}
          </button>
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading && !data ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <SortTh label="Product" sortKey="product_name" />
                  <SortTh label="Brand" sortKey="brand" />
                  <SortTh label="Sales" sortKey="sale_count" align="right" />
                  <SortTh label="Category" sortKey="core4_category" />
                  <SortTh label="Also" sortKey="core4_secondary" />
                  <SortTh label="Depletion" sortKey="depletion_days" align="right" />
                  <SortTh label="Confidence" sortKey="confidence" />
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <SkuRow key={row.sku_key} row={row} saving={saving} onSave={saveRow} />
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                      {data?.rows?.length ? 'No matches for current filter.' : 'No SKU data. Run Auto-Map to classify products.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function SkuRow({ row, saving, onSave }) {
  const [editing, setEditing] = useState(false)
  const [category, setCategory] = useState(row.core4_category)
  const [secondary, setSecondary] = useState(row.core4_secondary || '')
  const [depletion, setDepletion] = useState(row.depletion_days)

  function handleSave() {
    onSave(row.sku_key, category, secondary || null, parseInt(depletion, 10) || 90)
    setEditing(false)
  }

  function handleCancel() {
    setCategory(row.core4_category)
    setSecondary(row.core4_secondary || '')
    setDepletion(row.depletion_days)
    setEditing(false)
  }

  const isLowConfidence = row.confidence === 'low'

  return (
    <tr className={`border-b last:border-b-0 hover:bg-neutral-50 ${isLowConfidence ? 'bg-amber-50/50' : ''}`}>
      <td className="px-4 py-3">
        <p className="font-medium text-xs">{row.product_name || row.sku_key}</p>
        {row.sku_key !== row.product_name && (
          <p className="text-[10px] text-neutral-400 mt-0.5">{row.sku_key}</p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-600">{row.brand || '—'}</td>
      <td className="px-4 py-3 text-right text-xs text-neutral-600">{row.sale_count}</td>
      <td className="px-4 py-3">
        {editing ? (
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-2 py-1 text-xs">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        ) : (
          <CategoryBadge category={row.core4_category} />
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <select value={secondary} onChange={(e) => setSecondary(e.target.value)} className="border rounded px-2 py-1 text-xs">
            <option value="">None</option>
            {CATEGORIES.filter((c) => c.value !== 'excluded' && c.value !== 'secondary' && c.value !== category).map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        ) : (
          row.core4_secondary ? <CategoryBadge category={row.core4_secondary} /> : <span className="text-[10px] text-neutral-300">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <input type="number" value={depletion} onChange={(e) => setDepletion(e.target.value)} className="border rounded px-2 py-1 text-xs w-16 text-right" />
        ) : (
          <span className="text-xs text-neutral-600">{row.depletion_days}d</span>
        )}
      </td>
      <td className="px-4 py-3">
        <ConfidenceBadge confidence={row.confidence} />
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex gap-1">
            <button onClick={handleSave} disabled={saving === row.sku_key} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-medium hover:bg-emerald-700 disabled:opacity-50">
              {saving === row.sku_key ? '...' : 'Save'}
            </button>
            <button onClick={handleCancel} className="px-2 py-1 bg-neutral-200 rounded text-[10px] font-medium hover:bg-neutral-300">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="px-2 py-1 bg-neutral-100 rounded text-[10px] font-medium hover:bg-neutral-200">
            Edit
          </button>
        )}
      </td>
    </tr>
  )
}

SkuMappingPage.getLayout = (page) => page
