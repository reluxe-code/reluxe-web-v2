// src/pages/admin/intelligence/monthly-snapshot.js
// Monthly P&L snapshot: revenue, appointments by category/service, tox units, COGS
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

function money(v) { return `$${Math.round(Number(v || 0)).toLocaleString()}` }

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

function buildMonthOptions() {
  const opts = []
  const now = new Date()
  for (let i = 0; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    opts.push({ value: val, label })
  }
  return opts
}

const MONTH_OPTIONS = buildMonthOptions()

export default function MonthlySnapshotPage() {
  const [month, setMonth] = useState(MONTH_OPTIONS[1]?.value || MONTH_OPTIONS[0]?.value)
  const [location, setLocation] = useState('total')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // COGS editor
  const [cogsOpen, setCogsOpen] = useState(false)
  const [cogsEdits, setCogsEdits] = useState({})
  const [cogsSaving, setCogsSaving] = useState(false)

  // Tox import
  const [importOpen, setImportOpen] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/intelligence/monthly-snapshot?month=${month}&location=${location}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [month, location])

  useEffect(() => { load() }, [load])

  const handleCogsSave = useCallback(async (serviceName, cents) => {
    setCogsSaving(true)
    try {
      const res = await adminFetch('/api/admin/cogs/mapping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_name: serviceName, cogs_cents: cents }),
      })
      if (!res.ok) throw new Error('Save failed')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setCogsSaving(false)
    }
  }, [load])

  const handleImport = useCallback(async () => {
    if (!csvText.trim()) return
    setImporting(true)
    setImportResult(null)
    try {
      const res = await adminFetch('/api/admin/tox/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Import failed')
      setImportResult(json)
      setCsvText('')
      await load()
    } catch (e) {
      setImportResult({ error: e.message })
    } finally {
      setImporting(false)
    }
  }, [csvText, load])

  const s = data?.summary || {}
  const monthLabel = MONTH_OPTIONS.find((o) => o.value === month)?.label || month

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monthly Snapshot</h1>
          <p className="text-sm text-neutral-500 mt-1">Monthly P&amp;L view with revenue, appointments, tox units, and COGS.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {MONTH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="total">Total</option>
            <option value="westfield">Westfield</option>
            <option value="carmel">Carmel</option>
          </select>
          <button onClick={load} disabled={loading} className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Revenue" value={money(s.total_revenue)} color="emerald" />
            <StatCard label="Service Revenue" value={money(s.service_revenue)} color="blue" />
            <StatCard label="Deferred Revenue" value={money(s.deferred_revenue)} color="violet"
              sub={s.deferred_revenue > 0 ? `GC ${money(s.deferred_gift_cards)} / Mem ${money(s.deferred_memberships)} / Pkg ${money(s.deferred_packages)}` : undefined} />
            <StatCard label="Product Revenue" value={money(s.product_revenue)} color="amber" />
            <StatCard label="Total Appointments" value={(s.total_appointments || 0).toLocaleString()} color="neutral" />
            <StatCard label="Tox Units Used" value={(s.tox_units_total || 0).toLocaleString()} color="rose"
              sub={s.tox_cost_total > 0 ? `COGS: ${money(s.tox_cost_total)}` : undefined} />
          </div>

          {/* Appointments by Category */}
          <div className="bg-white rounded-lg border mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Appointments by Category</h2>
              <p className="text-xs text-neutral-400 mt-0.5">{monthLabel} — completed services grouped by category</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-500 border-b">
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2 text-right">Services</th>
                    <th className="px-4 py-2 text-right">Revenue</th>
                    <th className="px-4 py-2 text-right">COGS</th>
                    <th className="px-4 py-2 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.by_category || []).map((c) => (
                    <tr key={c.slug} className="border-b hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium">{c.slug}</td>
                      <td className="px-4 py-3 text-right">{c.count}</td>
                      <td className="px-4 py-3 text-right">{money(c.revenue)}</td>
                      <td className="px-4 py-3 text-right text-neutral-500">{c.cogs > 0 ? money(c.cogs) : '-'}</td>
                      <td className="px-4 py-3 text-right">{c.cogs > 0 ? money(c.margin) : '-'}</td>
                    </tr>
                  ))}
                  {!(data.by_category?.length) && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No completed services this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Appointments by Service */}
          <div className="bg-white rounded-lg border mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Appointments by Service</h2>
              <p className="text-xs text-neutral-400 mt-0.5">{monthLabel} — top 50 services by revenue</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-500 border-b">
                    <th className="px-4 py-2">Service</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2 text-right">Count</th>
                    <th className="px-4 py-2 text-right">Revenue</th>
                    <th className="px-4 py-2 text-right">COGS</th>
                    <th className="px-4 py-2 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.by_service || []).map((s) => (
                    <tr key={s.service_name} className="border-b hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium">{s.service_name}</td>
                      <td className="px-4 py-3 text-neutral-500">{s.slug}</td>
                      <td className="px-4 py-3 text-right">{s.count}</td>
                      <td className="px-4 py-3 text-right">{money(s.revenue)}</td>
                      <td className="px-4 py-3 text-right text-neutral-500">{s.cogs > 0 ? money(s.cogs) : '-'}</td>
                      <td className="px-4 py-3 text-right">{s.cogs > 0 ? money(s.margin) : '-'}</td>
                    </tr>
                  ))}
                  {!(data.by_service?.length) && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No completed services this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tox Units by Brand */}
          <div className="bg-white rounded-lg border mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Tox Units by Brand</h2>
              <p className="text-xs text-neutral-400 mt-0.5">{monthLabel} — from Boulevard inventory adjustments</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-500 border-b">
                    <th className="px-4 py-2">Brand</th>
                    <th className="px-4 py-2 text-right">Units</th>
                    <th className="px-4 py-2 text-right">COGS</th>
                    <th className="px-4 py-2 text-right">Cost/Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.tox_by_brand || []).map((b) => (
                    <tr key={b.brand} className="border-b hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium">{b.brand}</td>
                      <td className="px-4 py-3 text-right">{b.units.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{money(b.cost)}</td>
                      <td className="px-4 py-3 text-right text-neutral-500">${b.cost_per_unit.toFixed(2)}</td>
                    </tr>
                  ))}
                  {!(data.tox_by_brand?.length) && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No tox unit data imported for this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* COGS Editor (collapsible) */}
          <div className="bg-white rounded-lg border mb-6">
            <button onClick={() => setCogsOpen(!cogsOpen)} className="w-full p-4 flex items-center justify-between text-left">
              <div>
                <h2 className="text-lg font-semibold">COGS Editor</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Set cost-of-goods per service name (cents). Used for margin calculations above.</p>
              </div>
              <span className="text-neutral-400 text-sm">{cogsOpen ? 'Hide' : 'Show'}</span>
            </button>
            {cogsOpen && (
              <div className="border-t px-4 py-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-neutral-500 border-b">
                        <th className="px-2 py-2">Service Name</th>
                        <th className="px-2 py-2 text-right">COGS (cents)</th>
                        <th className="px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.by_service || []).map((svc) => {
                        const currentCogs = cogsEdits[svc.service_name] ?? (svc.cogs > 0 ? Math.round(svc.cogs * 100) : '')
                        return (
                          <tr key={svc.service_name} className="border-b">
                            <td className="px-2 py-2 text-sm">{svc.service_name}</td>
                            <td className="px-2 py-2 text-right">
                              <input
                                type="number"
                                value={currentCogs}
                                onChange={(e) => setCogsEdits({ ...cogsEdits, [svc.service_name]: e.target.value })}
                                className="w-24 text-right text-sm border rounded px-2 py-1"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <button
                                onClick={() => handleCogsSave(svc.service_name, parseInt(cogsEdits[svc.service_name]) || 0)}
                                disabled={cogsSaving}
                                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                Save
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Tox Import (collapsible) */}
          <div className="bg-white rounded-lg border mb-6">
            <button onClick={() => setImportOpen(!importOpen)} className="w-full p-4 flex items-center justify-between text-left">
              <div>
                <h2 className="text-lg font-semibold">Import Tox Units</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Paste Boulevard inventory adjustment CSV (report 0052b011).</p>
              </div>
              <span className="text-neutral-400 text-sm">{importOpen ? 'Hide' : 'Show'}</span>
            </button>
            {importOpen && (
              <div className="border-t p-4 space-y-3">
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={8}
                  className="w-full text-xs font-mono border rounded-lg p-3"
                  placeholder="Paste CSV here..."
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleImport}
                    disabled={importing || !csvText.trim()}
                    className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : 'Import'}
                  </button>
                  {importResult && !importResult.error && (
                    <span className="text-sm text-emerald-600">Imported {importResult.imported}, skipped {importResult.skipped}</span>
                  )}
                  {importResult?.error && (
                    <span className="text-sm text-red-600">{importResult.error}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {loading && !data && <p className="text-sm text-neutral-500">Loading monthly snapshot...</p>}
    </AdminLayout>
  )
}

MonthlySnapshotPage.getLayout = (page) => page
