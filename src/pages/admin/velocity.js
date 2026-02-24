// src/pages/admin/velocity.js
// Velocity Rewards admin dashboard
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

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

function StatusBadge({ active }) {
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
      {active ? 'Active' : 'Paused'}
    </span>
  )
}

const EVENT_COLORS = {
  earn: 'text-emerald-600', earn_package: 'text-emerald-600',
  import: 'text-blue-600', promo: 'text-violet-600',
  expire: 'text-rose-500', clawback: 'text-amber-600',
  reactivate: 'text-violet-600', manual_adjust: 'text-blue-500',
  freeze: 'text-sky-500', unfreeze: 'text-sky-500',
}

const EVENT_LABELS = {
  earn: 'Earned', earn_package: 'Package Earn', import: 'Imported',
  promo: 'Promotion', expire: 'Expired', clawback: 'Clawback',
  reactivate: 'Reactivated', manual_adjust: 'Manual', freeze: 'Frozen', unfreeze: 'Unfrozen',
}

function fmt(cents) { return `$${(cents / 100).toFixed(2)}` }

export default function VelocityAdmin() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [configOpen, setConfigOpen] = useState(false)
  const [promoFormOpen, setPromoFormOpen] = useState(false)
  const [multiplierFormOpen, setMultiplierFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importResults, setImportResults] = useState(null)
  const [runningCron, setRunningCron] = useState(false)

  // Config form state
  const [editConfig, setEditConfig] = useState({ earn_rate: 0.01, expiry_days: 90, excluded_service_slugs: '' })

  // Promo form state
  const [promoForm, setPromoForm] = useState({ name: '', description: '', amount_cents: 1000, trigger_type: 'bulk', expiry_days: 90 })

  // Multiplier form state
  const [multForm, setMultForm] = useState({ service_slug: '', multiplier: 2.0, label: '', ends_at: '' })

  // Member drawer
  const [selectedMember, setSelectedMember] = useState(null)
  const [memberDetail, setMemberDetail] = useState(null)
  const [actionForm, setActionForm] = useState({ action: '', amount: '', note: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/velocity/dashboard?days=${days}`)
    const json = await res.json()
    setData(json)
    if (json.config?.[0]) {
      const c = json.config.find((c) => !c.location_key) || json.config[0]
      setEditConfig({ earn_rate: c.earn_rate, expiry_days: c.expiry_days, excluded_service_slugs: (c.excluded_service_slugs || []).join(', ') })
    }
    setLoading(false)
  }, [days])

  useEffect(() => { fetchData() }, [fetchData])

  const fetchMemberDetail = async (memberId) => {
    setSelectedMember(memberId)
    const res = await fetch(`/api/admin/velocity/member/${memberId}`)
    setMemberDetail(await res.json())
  }

  const saveConfig = async () => {
    await fetch('/api/admin/velocity/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        earn_rate: parseFloat(editConfig.earn_rate),
        expiry_days: parseInt(editConfig.expiry_days),
        excluded_service_slugs: editConfig.excluded_service_slugs.split(',').map((s) => s.trim()).filter(Boolean),
      }),
    })
    fetchData()
  }

  const toggleProgram = async () => {
    const currentConfig = data?.config?.find((c) => !c.location_key)
    await fetch('/api/admin/velocity/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentConfig?.is_active }),
    })
    fetchData()
  }

  const runCron = async () => {
    setRunningCron(true)
    await fetch('/api/cron/process-velocity-rewards', { method: 'POST' })
    setRunningCron(false)
    fetchData()
  }

  const createPromo = async () => {
    await fetch('/api/admin/velocity/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promoForm),
    })
    setPromoFormOpen(false)
    fetchData()
  }

  const runPromo = async (promoId, dryRun = true) => {
    const res = await fetch('/api/admin/velocity/promotions/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promotionId: promoId, targetFilter: 'non_loyalty', dryRun, pushActive: false }),
    })
    const result = await res.json()
    if (dryRun) {
      alert(`Dry run: Would grant ${fmt(result.totalCents)} to ${result.targetCount} members`)
    } else {
      alert(`Done: Granted to ${result.granted} members`)
      fetchData()
    }
  }

  const createMultiplier = async () => {
    await fetch('/api/admin/velocity/multipliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...multForm, ends_at: multForm.ends_at || null }),
    })
    setMultiplierFormOpen(false)
    fetchData()
  }

  const deleteMultiplier = async (id) => {
    await fetch('/api/admin/velocity/multipliers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  const handleImport = async (csvText, dryRun = true) => {
    const res = await fetch('/api/admin/velocity/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvData: csvText, dryRun, pushActive: false }),
    })
    setImportResults(await res.json())
  }

  const adminAction = async () => {
    if (!selectedMember || !actionForm.action) return
    await fetch(`/api/admin/velocity/member/${selectedMember}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: actionForm.action,
        amount_cents: parseInt(actionForm.amount) || 0,
        note: actionForm.note,
      }),
    })
    setActionForm({ action: '', amount: '', note: '' })
    fetchMemberDetail(selectedMember)
    fetchData()
  }

  if (loading && !data) return <AdminLayout><div className="p-8 text-neutral-400">Loading...</div></AdminLayout>

  const stats = data?.stats || {}
  const globalConfig = data?.config?.find((c) => !c.location_key)
  const isActive = globalConfig?.is_active !== false

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Velocity Rewards</h1>
            <StatusBadge active={isActive} />
          </div>
          <div className="flex items-center gap-2">
            <select value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="border rounded px-2 py-1 text-sm">
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>All time</option>
            </select>
            <button onClick={toggleProgram} className={`px-3 py-1.5 text-sm font-medium rounded ${isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
              {isActive ? 'Pause' : 'Resume'}
            </button>
            <button onClick={runCron} disabled={runningCron} className="px-3 py-1.5 text-sm font-medium rounded bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-50">
              {runningCron ? 'Running...' : 'Run Now'}
            </button>
            <button onClick={() => setImportOpen(!importOpen)} className="px-3 py-1.5 text-sm font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
              Import CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Active Balance" value={fmt(stats.totalActiveBalance || 0)} color="emerald" />
          <StatCard label={`Earned (${days}d)`} value={fmt(stats.totalEarnedPeriod || 0)} color="violet" />
          <StatCard label={`Expired (${days}d)`} value={fmt(stats.totalExpiredPeriod || 0)} color="rose" />
          <StatCard label="Members Enrolled" value={(stats.enrolledCount || 0).toLocaleString()} color="blue" />
          <StatCard label="Expiring (7d)" value={fmt(stats.upcomingExpiryTotal || 0)} sub={`${stats.upcomingExpiryMembers || 0} members`} color="amber" />
        </div>

        {/* Import CSV Panel */}
        {importOpen && (
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Import Boulevard Loyalty CSV</h3>
            <textarea
              className="w-full h-32 border rounded p-2 text-xs font-mono"
              placeholder="Paste CSV content here..."
              id="csvInput"
            />
            <div className="flex gap-2">
              <button onClick={() => handleImport(document.getElementById('csvInput').value, true)} className="px-3 py-1.5 text-sm font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
                Preview (Dry Run)
              </button>
              <button onClick={() => { if (confirm('Execute import? This will create ledger entries.')) handleImport(document.getElementById('csvInput').value, false) }} className="px-3 py-1.5 text-sm font-medium rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                Execute Import
              </button>
            </div>
            {importResults && (
              <div className="text-xs bg-neutral-50 rounded p-3 space-y-1">
                <p><strong>Mode:</strong> {importResults.dryRun ? 'Dry Run' : 'Executed'}</p>
                <p><strong>Total CSV rows:</strong> {importResults.total}</p>
                <p><strong>Matched:</strong> {importResults.matched} | Unmatched: {importResults.unmatched} | Skipped (existing): {importResults.skippedExisting}</p>
                <p><strong>Imported:</strong> {importResults.imported} | Total value: {fmt(importResults.totalCents || 0)}</p>
                {importResults.pushed > 0 && <p><strong>Pushed to BLVD:</strong> {importResults.pushed} ({fmt(importResults.pushedCents || 0)})</p>}
              </div>
            )}
          </div>
        )}

        {/* Config Panel */}
        <div className="bg-white border rounded-lg">
          <button onClick={() => setConfigOpen(!configOpen)} className="w-full text-left p-4 font-semibold flex justify-between items-center hover:bg-neutral-50">
            <span>Configuration</span>
            <span className="text-neutral-400">{configOpen ? '▲' : '▼'}</span>
          </button>
          {configOpen && (
            <div className="px-4 pb-4 space-y-3 border-t">
              <div className="grid grid-cols-3 gap-4 pt-3">
                <div>
                  <label className="text-xs text-neutral-500">Earn Rate (per $1)</label>
                  <input type="number" step="0.001" value={editConfig.earn_rate} onChange={(e) => setEditConfig({ ...editConfig, earn_rate: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Expiry Days</label>
                  <input type="number" value={editConfig.expiry_days} onChange={(e) => setEditConfig({ ...editConfig, expiry_days: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Excluded Service Slugs (comma-separated)</label>
                  <input type="text" value={editConfig.excluded_service_slugs} onChange={(e) => setEditConfig({ ...editConfig, excluded_service_slugs: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" placeholder="iv-therapy, salt-sauna" />
                </div>
              </div>
              <button onClick={saveConfig} className="px-4 py-1.5 text-sm font-medium rounded bg-violet-600 text-white hover:bg-violet-700">Save</button>
            </div>
          )}
        </div>

        {/* Service Multipliers */}
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Service Multipliers</h3>
            <button onClick={() => setMultiplierFormOpen(!multiplierFormOpen)} className="px-3 py-1 text-xs font-medium rounded bg-violet-100 text-violet-700 hover:bg-violet-200">
              + Add Multiplier
            </button>
          </div>
          {multiplierFormOpen && (
            <div className="grid grid-cols-4 gap-2 bg-neutral-50 rounded p-3">
              <input placeholder="Service slug" value={multForm.service_slug} onChange={(e) => setMultForm({ ...multForm, service_slug: e.target.value })} className="border rounded px-2 py-1 text-sm" />
              <input type="number" step="0.1" placeholder="Multiplier" value={multForm.multiplier} onChange={(e) => setMultForm({ ...multForm, multiplier: e.target.value })} className="border rounded px-2 py-1 text-sm" />
              <input placeholder="Label" value={multForm.label} onChange={(e) => setMultForm({ ...multForm, label: e.target.value })} className="border rounded px-2 py-1 text-sm" />
              <button onClick={createMultiplier} className="px-3 py-1 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700">Create</button>
            </div>
          )}
          {data?.config?.[0] && (() => {
            const { data: mults } = { data: [] }
            // Multipliers come from the config endpoint
            return null
          })()}
          <table className="w-full text-sm">
            <thead><tr className="text-left text-neutral-500 text-xs">
              <th className="py-1">Service</th><th>Multiplier</th><th>Label</th><th>Dates</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {(data?.config?.[0]?.multipliers || []).length === 0 && (
                <tr><td colSpan={6} className="py-3 text-center text-neutral-400 text-xs">No multipliers configured</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Promotions */}
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Promotions</h3>
            <button onClick={() => setPromoFormOpen(!promoFormOpen)} className="px-3 py-1 text-xs font-medium rounded bg-violet-100 text-violet-700 hover:bg-violet-200">
              + Create Promotion
            </button>
          </div>
          {promoFormOpen && (
            <div className="grid grid-cols-2 gap-2 bg-neutral-50 rounded p-3">
              <input placeholder="Name" value={promoForm.name} onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })} className="border rounded px-2 py-1 text-sm" />
              <input placeholder="Description (shown to member)" value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} className="border rounded px-2 py-1 text-sm" />
              <div className="flex gap-2">
                <input type="number" placeholder="Amount (cents)" value={promoForm.amount_cents} onChange={(e) => setPromoForm({ ...promoForm, amount_cents: parseInt(e.target.value) })} className="border rounded px-2 py-1 text-sm flex-1" />
                <select value={promoForm.trigger_type} onChange={(e) => setPromoForm({ ...promoForm, trigger_type: e.target.value })} className="border rounded px-2 py-1 text-sm">
                  <option value="bulk">Bulk</option>
                  <option value="app_download">App Download</option>
                  <option value="first_login">First Login</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input type="number" placeholder="Expiry days" value={promoForm.expiry_days} onChange={(e) => setPromoForm({ ...promoForm, expiry_days: parseInt(e.target.value) })} className="border rounded px-2 py-1 text-sm flex-1" />
                <button onClick={createPromo} className="px-3 py-1 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700">Create</button>
              </div>
            </div>
          )}
          <table className="w-full text-sm">
            <thead><tr className="text-left text-neutral-500 text-xs">
              <th className="py-1">Name</th><th>Amount</th><th>Trigger</th><th>Claims</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {(data?.promotions || []).map((p) => (
                <tr key={p.id} className="border-t hover:bg-neutral-50">
                  <td className="py-2">{p.name}</td>
                  <td>{fmt(p.amount_cents)}</td>
                  <td className="text-neutral-500">{p.trigger_type}</td>
                  <td>{p.total_claimed}</td>
                  <td><StatusBadge active={p.is_active} /></td>
                  <td className="text-right">
                    {p.trigger_type === 'bulk' && p.is_active && (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => runPromo(p.id, true)} className="text-xs text-blue-600 hover:underline">Preview</button>
                        <button onClick={() => { if (confirm('Run this promotion?')) runPromo(p.id, false) }} className="text-xs text-emerald-600 hover:underline">Run</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!(data?.promotions?.length) && (
                <tr><td colSpan={6} className="py-3 text-center text-neutral-400 text-xs">No promotions created</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Recent Activity</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-neutral-500 text-xs">
              <th className="py-1">Date</th><th>Member</th><th>Event</th><th className="text-right">Amount</th><th className="text-right">Balance</th><th>Service</th><th>Note</th>
            </tr></thead>
            <tbody>
              {(data?.recentLedger || []).map((l) => (
                <tr key={l.id} className="border-t hover:bg-neutral-50 cursor-pointer" onClick={() => fetchMemberDetail(l.member_id)}>
                  <td className="py-1.5 text-xs text-neutral-500">{new Date(l.created_at).toLocaleDateString()}</td>
                  <td className="text-xs">{l.members?.first_name} {l.members?.last_name}</td>
                  <td className={`text-xs font-medium ${EVENT_COLORS[l.event_type] || ''}`}>{EVENT_LABELS[l.event_type] || l.event_type}</td>
                  <td className={`text-right text-xs font-semibold ${l.amount_cents >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{l.amount_cents >= 0 ? '+' : ''}{fmt(l.amount_cents)}</td>
                  <td className="text-right text-xs text-neutral-500">{fmt(l.balance_after_cents)}</td>
                  <td className="text-xs text-neutral-500 max-w-[150px] truncate">{l.service_name || '-'}</td>
                  <td className="text-xs text-neutral-400 max-w-[150px] truncate">{l.admin_note || '-'}</td>
                </tr>
              ))}
              {!(data?.recentLedger?.length) && (
                <tr><td colSpan={7} className="py-6 text-center text-neutral-400 text-xs">No activity yet</td></tr>
              )}
            </tbody>
          </table>
          {data?.ledgerTotal > 50 && <p className="text-xs text-neutral-400">Showing 50 of {data.ledgerTotal}</p>}
        </div>

        {/* Top Earners */}
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Top Earners</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-neutral-500 text-xs">
              <th className="py-1">Member</th><th className="text-right">Active Balance</th><th className="text-right">Lifetime Earned</th><th>Next Expiry</th><th>Booking</th><th></th>
            </tr></thead>
            <tbody>
              {(data?.topEarners || []).map((e) => (
                <tr key={e.member_id} className="border-t hover:bg-neutral-50 cursor-pointer" onClick={() => fetchMemberDetail(e.member_id)}>
                  <td className="py-1.5">
                    <p className="text-sm font-medium">{e.members?.first_name} {e.members?.last_name}</p>
                    <p className="text-xs text-neutral-400">{e.members?.phone}</p>
                  </td>
                  <td className="text-right font-semibold text-emerald-600">{fmt(e.active_balance_cents)}</td>
                  <td className="text-right text-neutral-600">{fmt(e.total_earned_cents)}</td>
                  <td className="text-xs text-neutral-500">{e.next_expiry_at ? new Date(e.next_expiry_at).toLocaleDateString() : '-'}</td>
                  <td>{e.has_active_booking ? <span className="text-xs text-emerald-600">Frozen</span> : <span className="text-xs text-neutral-400">-</span>}</td>
                  <td className="text-right"><button className="text-xs text-violet-600 hover:underline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Member Detail Drawer */}
        {selectedMember && memberDetail && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedMember(null)}>
            <div className="bg-black/20 absolute inset-0" />
            <div className="relative bg-white w-full max-w-lg shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                  <h3 className="font-semibold">{memberDetail.member?.first_name} {memberDetail.member?.last_name}</h3>
                  <p className="text-xs text-neutral-400">{memberDetail.member?.phone} • {memberDetail.member?.email}</p>
                </div>
                <button onClick={() => setSelectedMember(null)} className="text-neutral-400 hover:text-neutral-600 text-xl">×</button>
              </div>

              {/* Balance summary */}
              {memberDetail.balance && (
                <div className="p-4 border-b grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{fmt(memberDetail.balance.active_balance_cents)}</p>
                    <p className="text-xs text-neutral-400">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{fmt(memberDetail.balance.total_earned_cents)}</p>
                    <p className="text-xs text-neutral-400">Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-rose-500">{fmt(memberDetail.balance.total_expired_cents)}</p>
                    <p className="text-xs text-neutral-400">Expired</p>
                  </div>
                </div>
              )}

              {/* Admin actions */}
              <div className="p-4 border-b space-y-2">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase">Admin Actions</h4>
                <div className="flex gap-2">
                  <select value={actionForm.action} onChange={(e) => setActionForm({ ...actionForm, action: e.target.value })} className="border rounded px-2 py-1 text-sm flex-1">
                    <option value="">Select action...</option>
                    <option value="reactivate">Reactivate Expired</option>
                    <option value="clawback">Clawback</option>
                    <option value="manual_adjust">Manual Adjust</option>
                  </select>
                  <input type="number" placeholder="Cents" value={actionForm.amount} onChange={(e) => setActionForm({ ...actionForm, amount: e.target.value })} className="border rounded px-2 py-1 text-sm w-24" />
                </div>
                <input placeholder="Note" value={actionForm.note} onChange={(e) => setActionForm({ ...actionForm, note: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" />
                <button onClick={adminAction} disabled={!actionForm.action || !actionForm.amount} className="px-3 py-1 text-sm font-medium rounded bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
                  Execute
                </button>
              </div>

              {/* Ledger */}
              <div className="p-4 space-y-1">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Transaction History</h4>
                {(memberDetail.ledger || []).map((l) => (
                  <div key={l.id} className="flex justify-between items-center py-1.5 border-b border-neutral-100">
                    <div>
                      <p className={`text-xs font-medium ${EVENT_COLORS[l.event_type] || ''}`}>{EVENT_LABELS[l.event_type] || l.event_type}</p>
                      <p className="text-[10px] text-neutral-400">{new Date(l.created_at).toLocaleString()} {l.service_name ? `• ${l.service_name}` : ''}</p>
                      {l.admin_note && <p className="text-[10px] text-neutral-400 italic">{l.admin_note}</p>}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${l.amount_cents >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {l.amount_cents >= 0 ? '+' : ''}{fmt(l.amount_cents)}
                      </p>
                      {l.expires_at && !l.expired_at && (
                        <p className="text-[10px] text-neutral-400">
                          {l.is_frozen ? 'Frozen' : `Exp ${new Date(l.expires_at).toLocaleDateString()}`}
                        </p>
                      )}
                      {l.blvd_pushed && <p className="text-[10px] text-blue-400">Pushed</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
