// src/pages/admin/testimonials.js
import { useEffect, useState, useRef, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Papa from 'papaparse'
import { parseCSVRow } from '@/lib/testimonialParser'

const SERVICE_OPTIONS = [
  { value: '', label: '(none)' },
  { value: 'tox', label: 'Tox (Botox/Dysport/Jeuveau)' },
  { value: 'filler', label: 'Filler' },
  { value: 'facial-balancing', label: 'Facial Balancing' },
  { value: 'morpheus8', label: 'Morpheus8' },
  { value: 'co2', label: 'CO\u2082' },
  { value: 'opus', label: 'Opus' },
  { value: 'sculptra', label: 'Sculptra' },
  { value: 'skinpen', label: 'SkinPen' },
  { value: 'ipl', label: 'IPL' },
  { value: 'clearlift', label: 'ClearLift' },
  { value: 'clearskin', label: 'ClearSkin' },
  { value: 'vascupen', label: 'VascuPen' },
  { value: 'laser-hair-removal', label: 'Laser Hair Removal' },
  { value: 'facials', label: 'Facials' },
  { value: 'glo2facial', label: 'Glo2Facial' },
  { value: 'hydrafacial', label: 'HydraFacial' },
  { value: 'peels', label: 'Peels' },
  { value: 'evolvex', label: 'EvolveX' },
  { value: 'massage', label: 'Massage' },
  { value: 'salt-sauna', label: 'Salt Sauna' },
  { value: 'skin-iq', label: 'Skin IQ' },
]

const EMPTY = {
  author_name: '', quote: '', rating: 5, staff_name: '', provider: '',
  location: 'westfield', service: '', featured: false, recommendable: true,
  review_date: '', status: 'published',
}

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm'
const btnPrimary = 'px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition'
const btnOutline = 'px-4 py-2 border rounded-lg text-sm'

// ─── Main component ──────────────────────────────────────────────
export default function AdminTestimonials() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Filters
  const [filterLocation, setFilterLocation] = useState('')
  const [filterProvider, setFilterProvider] = useState('')
  const [filterService, setFilterService] = useState('')
  const [filterRecommendable, setFilterRecommendable] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Bulk selection
  const [selected, setSelected] = useState(new Set())
  const [bulkAction, setBulkAction] = useState('')
  const [bulkValue, setBulkValue] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkMsg, setBulkMsg] = useState('')

  // CSV import
  const [csvRows, setCsvRows] = useState([])
  const [csvLocation, setCsvLocation] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef(null)

  // Provider management
  const [providers, setProviders] = useState([])
  const [providerAction, setProviderAction] = useState('')

  // Tab state
  const [tab, setTab] = useState('list') // 'list' | 'import' | 'providers'

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/testimonials?action=list')
      const json = await res.json()
      const data = json.data || []
      setItems(data)
      setSelected(new Set())
      // Derive unique providers
      const provMap = {}
      for (const t of data) {
        const p = t.provider || t.staff_name
        if (!p) continue
        if (!provMap[p]) provMap[p] = { name: p, total: 0, recommendable: 0 }
        provMap[p].total++
        if (t.recommendable) provMap[p].recommendable++
      }
      setProviders(Object.values(provMap).sort((a, b) => b.total - a.total))
    } catch (err) {
      console.error('Load error:', err)
    }
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/testimonials?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      const json = await res.json()
      if (json.error) setMessage(`Error: ${json.error}`)
      else { setMessage(editing.id ? 'Saved!' : 'Added!'); setEditing(null) }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setSaving(false)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this testimonial?')) return
    await fetch('/api/admin/testimonials?action=delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  // ─── Bulk actions ─────────────────────────────────────────────
  const toggleSelect = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelected(prev => {
      if (prev.size === filtered.length) return new Set()
      return new Set(filtered.map(t => t.id))
    })
  }, []) // filtered reference is fine since we use it in render

  async function handleBulkUpdate() {
    if (!bulkAction || selected.size === 0) return
    const ids = [...selected]

    if (bulkAction === 'delete') {
      if (!confirm(`Delete ${ids.length} testimonial(s)?`)) return
      setBulkBusy(true)
      setBulkMsg('')
      const res = await fetch('/api/admin/testimonials?action=bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const json = await res.json()
      setBulkMsg(json.error ? `Error: ${json.error}` : `Deleted ${json.deleted} reviews`)
      setBulkBusy(false)
      setBulkAction('')
      setBulkValue('')
      load()
      return
    }

    // For field updates, value is required
    if (!bulkValue && bulkValue !== false) {
      setBulkMsg('Select a value first')
      return
    }

    let value = bulkValue
    if (bulkAction === 'recommendable' || bulkAction === 'featured') {
      value = bulkValue === 'true'
    }

    const label = bulkAction === 'recommendable' ? (value ? 'Recommendable' : 'Not Recommendable')
      : bulkAction === 'featured' ? (value ? 'Featured' : 'Not Featured')
      : String(value)
    if (!confirm(`Set "${bulkAction}" to "${label}" on ${ids.length} record(s)?`)) return

    setBulkBusy(true)
    setBulkMsg('')
    const res = await fetch('/api/admin/testimonials?action=bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, field: bulkAction, value }),
    })
    const json = await res.json()
    setBulkMsg(json.error ? `Error: ${json.error}` : `Updated ${json.updated} reviews`)
    setBulkBusy(false)
    setBulkAction('')
    setBulkValue('')
    load()
  }

  // ─── CSV Import ──────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportResult(null)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data
          .map(row => parseCSVRow(row, csvLocation))
          .filter(Boolean)
        setCsvRows(parsed)
      },
    })
  }

  async function handleImport() {
    if (!csvRows.length) return
    setImporting(true)
    setImportResult(null)

    try {
      const res = await fetch('/api/admin/testimonials?action=import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: csvRows }),
      })
      const result = await res.json()
      if (result.error) {
        setImportResult({ imported: 0, skipped: 0, duplicates: 0, noComment: 0, errorMsg: result.error })
      } else {
        setImportResult({
          imported: result.imported,
          skipped: result.errors,
          duplicates: result.duplicates,
          noComment: result.noComment,
        })
      }
    } catch (err) {
      setImportResult({ imported: 0, skipped: 0, duplicates: 0, noComment: 0, errorMsg: err.message })
    }

    setImporting(false)
    setCsvRows([])
    if (fileRef.current) fileRef.current.value = ''
    load()
  }

  // ─── Provider management ────────────────────────────────────
  async function toggleProvider(name, activate) {
    setProviderAction(name)
    await fetch('/api/admin/testimonials?action=toggle-provider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, activate }),
    })
    setProviderAction('')
    load()
  }

  // ─── Filtered list ─────────────────────────────────────────
  const filtered = items.filter(t => {
    if (filterLocation && t.location !== filterLocation) return false
    if (filterProvider && (t.provider || t.staff_name) !== filterProvider) return false
    if (filterService && t.service !== filterService) return false
    if (filterRecommendable === 'yes' && !t.recommendable) return false
    if (filterRecommendable === 'no' && t.recommendable) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const searchable = `${t.author_name} ${t.quote} ${t.provider || ''} ${t.staff_name || ''}`.toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })

  // Value picker for bulk action
  function renderBulkValuePicker() {
    if (!bulkAction || bulkAction === 'delete') return null
    if (bulkAction === 'location') {
      return (
        <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">Choose...</option>
          <option value="westfield">Westfield</option>
          <option value="carmel">Carmel</option>
        </select>
      )
    }
    if (bulkAction === 'service') {
      return (
        <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
          {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    }
    if (bulkAction === 'provider') {
      return (
        <input type="text" value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder="Provider name" className="border rounded-lg px-3 py-1.5 text-sm w-36" />
      )
    }
    if (bulkAction === 'recommendable' || bulkAction === 'featured') {
      return (
        <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">Choose...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      )
    }
    if (bulkAction === 'status') {
      return (
        <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">Choose...</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      )
    }
    return null
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <div className="flex gap-2">
          <button onClick={() => setEditing({ ...EMPTY })} className={btnPrimary}>
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {[
          ['list', `Reviews (${items.length})`],
          ['import', 'CSV Import'],
          ['providers', 'Providers'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              tab === key ? 'border-black text-black' : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── Edit / Add form ─── */}
      {editing && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold mb-4">{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</h2>
          <form onSubmit={handleSave} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Author Name</label>
                <input type="text" value={editing.author_name} onChange={e => setEditing(p => ({ ...p, author_name: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Provider</label>
                <input type="text" value={editing.provider || ''} onChange={e => setEditing(p => ({ ...p, provider: e.target.value }))} placeholder="e.g., Hannah" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quote</label>
              <textarea value={editing.quote} onChange={e => setEditing(p => ({ ...p, quote: e.target.value }))} required rows={3} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                <input type="number" min={1} max={5} value={editing.rating} onChange={e => setEditing(p => ({ ...p, rating: parseInt(e.target.value) || 5 }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select value={editing.location || 'westfield'} onChange={e => setEditing(p => ({ ...p, location: e.target.value }))} className={inputCls}>
                  <option value="westfield">Westfield</option>
                  <option value="carmel">Carmel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Service</label>
                <select value={editing.service || ''} onChange={e => setEditing(p => ({ ...p, service: e.target.value }))} className={inputCls}>
                  {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Review Date</label>
                <input type="date" value={editing.review_date ? editing.review_date.split('T')[0] : ''} onChange={e => setEditing(p => ({ ...p, review_date: e.target.value ? new Date(e.target.value).toISOString() : null }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-end gap-4 pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing.featured} onChange={e => setEditing(p => ({ ...p, featured: e.target.checked }))} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.recommendable !== false} onChange={e => setEditing(p => ({ ...p, recommendable: e.target.checked }))} />
                  Recommendable
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className={`${btnPrimary} disabled:opacity-50`}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setEditing(null)} className={btnOutline}>Cancel</button>
              {message && <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{message}</span>}
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB: Reviews List ─── */}
      {tab === 'list' && (
        <>
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={inputCls}
            />
            <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className={inputCls}>
              <option value="">All Locations</option>
              <option value="westfield">Westfield</option>
              <option value="carmel">Carmel</option>
            </select>
            <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className={inputCls}>
              <option value="">All Providers</option>
              {providers.map(p => <option key={p.name} value={p.name}>{p.name} ({p.total})</option>)}
            </select>
            <select value={filterService} onChange={e => setFilterService(e.target.value)} className={inputCls}>
              <option value="">All Services</option>
              {SERVICE_OPTIONS.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filterRecommendable} onChange={e => setFilterRecommendable(e.target.value)} className={inputCls}>
              <option value="">All</option>
              <option value="yes">Recommendable</option>
              <option value="no">Not Recommendable</option>
            </select>
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-neutral-400">Showing {filtered.length} of {items.length} testimonials</p>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())} className="text-xs text-violet-600 hover:underline">
                Clear selection ({selected.size})
              </button>
            )}
          </div>

          {/* Bulk Action Bar */}
          {selected.size > 0 && (
            <div className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-xl flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-violet-800">{selected.size} selected</span>
              <select
                value={bulkAction}
                onChange={e => { setBulkAction(e.target.value); setBulkValue(''); setBulkMsg('') }}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">Bulk action...</option>
                <option value="location">Change Location</option>
                <option value="provider">Change Provider</option>
                <option value="service">Change Service</option>
                <option value="recommendable">Change Recommendable</option>
                <option value="featured">Change Featured</option>
                <option value="status">Change Status</option>
                <option value="delete">Delete Selected</option>
              </select>
              {renderBulkValuePicker()}
              <button
                onClick={handleBulkUpdate}
                disabled={bulkBusy || !bulkAction}
                className="px-4 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition disabled:opacity-50"
              >
                {bulkBusy ? 'Applying...' : 'Apply'}
              </button>
              {bulkMsg && (
                <span className={`text-sm ${bulkMsg.startsWith('Error') ? 'text-red-600' : 'text-emerald-700'}`}>{bulkMsg}</span>
              )}
            </div>
          )}

          {loading ? <p className="text-neutral-500">Loading...</p> : filtered.length === 0 ? <p className="text-neutral-500">No testimonials match filters.</p> : (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center gap-2 px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={() => {
                    if (selected.size === filtered.length) setSelected(new Set())
                    else setSelected(new Set(filtered.map(t => t.id)))
                  }}
                  className="h-4 w-4 rounded"
                />
                <span className="text-xs text-neutral-500">Select all {filtered.length} visible</span>
              </div>

              {filtered.map((t) => (
                <div key={t.id} className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${selected.has(t.id) ? 'ring-2 ring-violet-300 border-violet-300' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected.has(t.id)}
                    onChange={() => toggleSelect(t.id)}
                    className="mt-1 h-4 w-4 rounded shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">{t.author_name}</span>
                      <span className="text-yellow-500 text-sm">{'★'.repeat(t.rating || 5)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${t.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>{t.status}</span>
                      {t.featured && <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">Featured</span>}
                      {!t.recommendable && <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">Not Recommendable</span>}
                      {t.location && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">{t.location}</span>}
                      {t.service && <span className="px-2 py-0.5 rounded-full text-xs bg-violet-50 text-violet-600">{t.service}</span>}
                    </div>
                    <p className="text-sm text-neutral-600 italic line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex gap-3 mt-1 text-xs text-neutral-400">
                      {(t.provider || t.staff_name) && <span>Provider: {t.provider || t.staff_name}</span>}
                      {t.review_date && <span>{new Date(t.review_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditing({ ...t })} className="text-sm text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── TAB: CSV Import ─── */}
      {tab === 'import' && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-2">Import from CSV</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Upload your Appointment Ratings CSV export. Each CSV represents one location&apos;s reviews.
            <br />
            <strong>Safe to re-run:</strong> Duplicates (same author + quote) are automatically skipped. Existing reviews are never modified.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Location for this CSV <span className="text-red-500">*</span></label>
              <select value={csvLocation} onChange={e => { setCsvLocation(e.target.value); setCsvRows([]); setImportResult(null); if (fileRef.current) fileRef.current.value = '' }} className={`${inputCls} ${!csvLocation ? 'border-red-300' : ''}`}>
                <option value="" disabled>-- Select Location --</option>
                <option value="westfield">Westfield</option>
                <option value="carmel">Carmel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CSV File</label>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} disabled={!csvLocation} className={`text-sm ${!csvLocation ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </div>
          </div>

          {csvRows.length > 0 && (
            <>
              <div className="mb-4 p-3 bg-neutral-50 rounded-lg text-sm">
                <p><strong>{csvRows.length}</strong> rows parsed</p>
                <p className="text-neutral-500">
                  {csvRows.filter(r => r.recommendable).length} with comments (recommendable) &middot;{' '}
                  {csvRows.filter(r => !r.recommendable).length} without comments (stored, not shown on site)
                </p>
              </div>

              {/* Preview first 5 */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Preview (first 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="p-2 text-left border">Author</th>
                        <th className="p-2 text-left border">Rating</th>
                        <th className="p-2 text-left border">Service</th>
                        <th className="p-2 text-left border">Provider</th>
                        <th className="p-2 text-left border">Quote</th>
                        <th className="p-2 text-left border">Rec.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          <td className="p-2 border">{r.author_name}</td>
                          <td className="p-2 border">{r.rating}</td>
                          <td className="p-2 border">{r.service || '-'}</td>
                          <td className="p-2 border">{r.provider || '-'}</td>
                          <td className="p-2 border max-w-xs truncate">{r.quote}</td>
                          <td className="p-2 border">{r.recommendable ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={handleImport}
                disabled={importing}
                className={`${btnPrimary} disabled:opacity-50`}
              >
                {importing ? 'Importing...' : `Import ${csvRows.length} Reviews`}
              </button>
            </>
          )}

          {importResult && (
            <div className={`mt-4 p-4 rounded-lg text-sm border ${importResult.errorMsg ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className={`font-medium ${importResult.errorMsg ? 'text-red-800' : 'text-emerald-800'}`}>
                {importResult.errorMsg ? 'Import Failed' : 'Import Complete'}
              </p>
              {importResult.errorMsg ? (
                <p className="mt-1 text-red-700">{importResult.errorMsg}</p>
              ) : (
                <ul className="mt-1 text-emerald-700 space-y-0.5">
                  <li>{importResult.imported} new reviews imported</li>
                  <li>{importResult.duplicates} duplicates skipped (already exist)</li>
                  <li>{importResult.noComment} without comments (stored as not recommendable)</li>
                  {importResult.skipped > 0 && <li className="text-amber-700">{importResult.skipped} errors</li>}
                </ul>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h3 className="text-sm font-medium mb-1">Expected CSV Format</h3>
            <p className="text-xs text-neutral-500">
              Columns: <code>Rating Created On, Client, Service(s), Rating, Comment, Rating Reply, Rating Reply by Staff</code>
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Provider names and service types are automatically extracted from the Service(s) column.
              Reviews without comments are stored but marked as not recommendable.
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              <strong>Import is insert-only.</strong> Re-importing the same CSV will skip all existing reviews. No data is ever overwritten.
            </p>
          </div>
        </div>
      )}

      {/* ─── TAB: Provider Management ─── */}
      {tab === 'providers' && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-2">Manage Providers</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Deactivate a provider to hide all their reviews from the site. Reactivate to restore reviews that have comments and 4+ stars.
          </p>

          {providers.length === 0 ? (
            <p className="text-neutral-500 text-sm">No providers found.</p>
          ) : (
            <div className="space-y-2">
              {providers.map((p) => {
                const allHidden = p.recommendable === 0
                return (
                  <div key={p.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className="text-sm text-neutral-500 ml-2">
                        {p.recommendable} / {p.total} recommendable
                      </span>
                      {allHidden && <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">Deactivated</span>}
                    </div>
                    <button
                      onClick={() => toggleProvider(p.name, allHidden)}
                      disabled={providerAction === p.name}
                      className={`text-sm font-medium px-3 py-1 rounded-lg transition ${
                        allHidden
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      } disabled:opacity-50`}
                    >
                      {providerAction === p.name ? '...' : allHidden ? 'Reactivate' : 'Deactivate'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
