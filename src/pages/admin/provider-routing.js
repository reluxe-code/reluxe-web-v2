// src/pages/admin/provider-routing.js
// Admin UI for managing provider routing/weighting rules (stored in site_config).
import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

const SERVICE_OPTIONS = [
  { slug: 'tox', label: 'Tox' },
  { slug: 'filler', label: 'Dermal Fillers' },
  { slug: 'sculptra', label: 'Sculptra' },
  { slug: 'morpheus8', label: 'Morpheus8' },
  { slug: 'microneedling', label: 'Microneedling' },
  { slug: 'ipl', label: 'IPL Photofacial' },
  { slug: 'laser-hair-removal', label: 'Laser Hair Removal' },
  { slug: 'hydrafacial', label: 'HydraFacial' },
  { slug: 'glo2facial', label: 'Glo2Facial' },
  { slug: 'facials', label: 'Facials & Peels' },
  { slug: 'massage', label: 'Massage' },
]

const LOCATION_OPTIONS = [
  { key: 'westfield', label: 'Westfield' },
  { key: 'carmel', label: 'Carmel' },
]

const EMPTY_RULE = {
  id: '',
  providerSlug: '',
  serviceSlug: '',
  locationKey: '',
  weight: 50,
  active: true,
  notes: '',
}

export default function AdminProviderRouting() {
  const [config, setConfig] = useState({ enabled: true, rules: [] })
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null) // index or 'new'
  const [form, setForm] = useState(EMPTY_RULE)

  const fetchConfig = useCallback(async () => {
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'provider_routing')
      .limit(1)
      .single()

    if (data?.value) {
      setConfig(data.value)
    }
    setLoading(false)
  }, [])

  const fetchStaff = useCallback(async () => {
    const { data } = await supabase
      .from('staff')
      .select('id, name, slug, title, boulevard_service_map, locations')
      .eq('status', 'published')
      .order('name')
    setStaffList(data || [])
  }, [])

  useEffect(() => {
    fetchConfig()
    fetchStaff()
  }, [fetchConfig, fetchStaff])

  async function saveConfig(updated) {
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('site_config')
      .upsert({ key: 'provider_routing', value: updated, updated_at: new Date().toISOString() })
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setConfig(updated)
      setMessage('Saved!')
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  function toggleEnabled() {
    saveConfig({ ...config, enabled: !config.enabled })
  }

  function startEdit(idx) {
    setEditing(idx)
    setForm({ ...config.rules[idx] })
  }

  function startNew() {
    setEditing('new')
    setForm({ ...EMPTY_RULE, id: `rule-${Date.now()}` })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(EMPTY_RULE)
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSaveRule() {
    if (!form.providerSlug) {
      setMessage('Error: Provider is required.')
      return
    }
    const rule = {
      ...form,
      weight: Number(form.weight) || 50,
      serviceSlug: form.serviceSlug || null,
      locationKey: form.locationKey || null,
    }

    let updatedRules
    if (editing === 'new') {
      updatedRules = [...config.rules, rule]
    } else {
      updatedRules = config.rules.map((r, i) => (i === editing ? rule : r))
    }
    await saveConfig({ ...config, rules: updatedRules })
    setEditing(null)
    setForm(EMPTY_RULE)
  }

  async function handleDelete(idx) {
    if (!confirm(`Delete this routing rule?`)) return
    const updatedRules = config.rules.filter((_, i) => i !== idx)
    await saveConfig({ ...config, rules: updatedRules })
  }

  function toggleRuleActive(idx) {
    const updatedRules = config.rules.map((r, i) =>
      i === idx ? { ...r, active: !r.active } : r
    )
    saveConfig({ ...config, rules: updatedRules })
  }

  // Build weight summary grouped by service+location
  const weightSummary = (() => {
    const groups = new Map()
    const activeRules = config.rules.filter((r) => r.active !== false)

    // Collect unique service+location combos
    activeRules.forEach((r) => {
      const key = `${r.serviceSlug || 'all'}:${r.locationKey || 'all'}`
      if (!groups.has(key)) {
        groups.set(key, {
          serviceSlug: r.serviceSlug,
          locationKey: r.locationKey,
          providers: new Map(),
        })
      }
    })

    // For each group, collect provider weights
    groups.forEach((group) => {
      activeRules.forEach((r) => {
        // Rule matches this group if it's specific to this combo or is broader
        const serviceMatch = !r.serviceSlug || r.serviceSlug === group.serviceSlug
        const locationMatch = !r.locationKey || r.locationKey === group.locationKey
        if (!serviceMatch || !locationMatch) return

        const existing = group.providers.get(r.providerSlug)
        const specificity = (r.serviceSlug ? 2 : 0) + (r.locationKey ? 1 : 0)
        if (!existing || specificity > existing.specificity) {
          const staff = staffList.find((s) => s.slug === r.providerSlug)
          group.providers.set(r.providerSlug, {
            name: staff?.name || r.providerSlug,
            weight: r.weight,
            specificity,
          })
        }
      })
    })

    return [...groups.entries()].map(([key, group]) => ({
      key,
      serviceSlug: group.serviceSlug,
      locationKey: group.locationKey,
      providers: [...group.providers.values()],
    }))
  })()

  function getProviderName(slug) {
    return staffList.find((s) => s.slug === slug)?.name || slug
  }

  function getServiceLabel(slug) {
    return SERVICE_OPTIONS.find((s) => s.slug === slug)?.label || slug || 'All Services'
  }

  function getLocationLabel(key) {
    return LOCATION_OPTIONS.find((l) => l.key === key)?.label || key || 'All Locations'
  }

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-neutral-500">Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Provider Routing</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Control how &ldquo;First Available&rdquo; assigns providers. Default is equal weight (50) for everyone.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <span className={`text-sm font-medium ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </span>
            )}
            <button
              onClick={startNew}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition"
            >
              + Add Rule
            </button>
          </div>
        </div>

        {/* Global toggle */}
        <div className="mb-6 p-4 bg-white border border-neutral-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-800">Routing Enabled</p>
            <p className="text-xs text-neutral-500">When off, all providers get equal weight (50/50).</p>
          </div>
          <button
            onClick={toggleEnabled}
            className={`relative w-12 h-6 rounded-full transition-colors ${config.enabled ? 'bg-violet-600' : 'bg-neutral-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.enabled ? 'translate-x-6' : ''}`}
            />
          </button>
        </div>

        {/* Edit/New form */}
        {editing !== null && (
          <div className="mb-6 p-5 bg-white border border-violet-200 rounded-xl shadow-sm">
            <h2 className="text-base font-bold text-neutral-800 mb-4">
              {editing === 'new' ? 'New Rule' : 'Edit Rule'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Provider */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Provider *</label>
                <select
                  value={form.providerSlug}
                  onChange={(e) => updateForm('providerSlug', e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select provider...</option>
                  {staffList.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>
              {/* Service */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Service (optional)</label>
                <select
                  value={form.serviceSlug || ''}
                  onChange={(e) => updateForm('serviceSlug', e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Services</option>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.label}</option>
                  ))}
                </select>
              </div>
              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Location (optional)</label>
                <select
                  value={form.locationKey || ''}
                  onChange={(e) => updateForm('locationKey', e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Locations</option>
                  {LOCATION_OPTIONS.map((l) => (
                    <option key={l.key} value={l.key}>{l.label}</option>
                  ))}
                </select>
              </div>
              {/* Weight */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Weight: {form.weight}
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={form.weight}
                  onChange={(e) => updateForm('weight', Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
                <p className="text-xs text-neutral-400 mt-0.5">50 = baseline. Higher = more likely to be selected.</p>
              </div>
              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  placeholder="Why does this rule exist?"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveRule}
                disabled={saving}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Rule'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-lg text-sm hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Rules list */}
        {config.rules.length === 0 ? (
          <div className="p-8 text-center bg-white border border-neutral-200 rounded-xl">
            <p className="text-sm text-neutral-500">
              No routing rules yet. All providers get equal weight by default.
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Add a rule to promote specific providers for certain services or locations.
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-8">
            {config.rules.map((rule, idx) => (
              <div
                key={rule.id || idx}
                className={`flex items-center gap-4 p-4 bg-white border rounded-xl transition ${
                  rule.active !== false ? 'border-neutral-200' : 'border-neutral-100 opacity-50'
                }`}
              >
                {/* Active toggle */}
                <button
                  onClick={() => toggleRuleActive(idx)}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                    rule.active !== false ? 'bg-violet-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      rule.active !== false ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800">
                    {getProviderName(rule.providerSlug)}
                    <span className="font-normal text-neutral-500">
                      {' · '}{getServiceLabel(rule.serviceSlug)}{' · '}{getLocationLabel(rule.locationKey)}
                    </span>
                  </p>
                  {rule.notes && (
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">{rule.notes}</p>
                  )}
                </div>
                {/* Weight bar */}
                <div className="flex items-center gap-2 flex-shrink-0" style={{ width: 120 }}>
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${rule.weight}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-neutral-600 w-8 text-right">{rule.weight}</span>
                </div>
                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(idx)}
                    className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-800 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="px-2 py-1 text-xs text-red-400 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weight summary */}
        {weightSummary.length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-bold text-neutral-800 mb-3">Effective Weight Summary</h2>
            <div className="space-y-3">
              {weightSummary.map((group) => {
                const totalWeight = group.providers.reduce((sum, p) => sum + p.weight, 0) + 50 // +50 for unweighted providers
                return (
                  <div key={group.key} className="p-4 bg-white border border-neutral-200 rounded-xl">
                    <p className="text-xs font-semibold text-neutral-500 mb-2">
                      {getServiceLabel(group.serviceSlug)} at {getLocationLabel(group.locationKey)}
                    </p>
                    <div className="space-y-1.5">
                      {group.providers.map((p) => {
                        const pct = Math.round((p.weight / totalWeight) * 100)
                        return (
                          <div key={p.name} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-neutral-700 w-28 truncate">{p.name}</span>
                            <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-neutral-600 w-12 text-right">
                              {p.weight} ({pct}%)
                            </span>
                          </div>
                        )
                      })}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-neutral-400 w-28 truncate italic">Others</span>
                        <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-300 rounded-full"
                            style={{ width: `${Math.round((50 / totalWeight) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-neutral-400 w-12 text-right">
                          50 ({Math.round((50 / totalWeight) * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
