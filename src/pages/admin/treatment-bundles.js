// src/pages/admin/treatment-bundles.js
import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import CatalogServicePicker from '@/components/admin/CatalogServicePicker'
import { supabase } from '@/lib/supabase'
import { SLUG_TITLES } from '@/data/treatmentBundles'
import { categorizeProvider, roleMatches } from '@/lib/provider-roles'

const ROLE_OPTIONS = ['Injector', 'Aesthetician', 'Massage Therapist']

function slugify(t) {
  return (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** Normalize legacy slugs[] format to items[{slug,label}] */
function normalizeBundle(b) {
  if (b.items) return b
  return { ...b, items: (b.slugs || []).map(s => ({ slug: s, label: SLUG_TITLES[s] || s })) }
}

const EMPTY_BUNDLE = { id: '', title: '', description: '', items: [], roles: [], sort_order: 0 }

export default function AdminTreatmentBundles() {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null) // index or 'new'
  const [form, setForm] = useState(EMPTY_BUNDLE)
  const [syncing, setSyncing] = useState(false)

  // Staff data for "Provider Coverage" view
  const [staffList, setStaffList] = useState([])

  const fetchBundles = useCallback(async () => {
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'treatment_bundles')
      .limit(1)
      .single()

    if (data?.value) {
      const normalized = data.value.map(normalizeBundle)
      const sorted = [...normalized].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))
      setBundles(sorted)
    }
    setLoading(false)
  }, [])

  const fetchStaff = useCallback(async () => {
    const { data } = await supabase
      .from('staff')
      .select('id, name, slug, title, role, boulevard_service_map, treatment_bundles, locations')
      .eq('status', 'published')
      .order('name')
    setStaffList(data || [])
  }, [])

  useEffect(() => {
    fetchBundles()
    fetchStaff()
  }, [fetchBundles, fetchStaff])

  async function handleSyncCatalog() {
    setSyncing(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/blvd-catalog-sync', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setMessage(`Synced ${data.synced} services (Westfield: ${data.locations?.westfield || 0}, Carmel: ${data.locations?.carmel || 0})`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setSyncing(false)
    setTimeout(() => setMessage(''), 5000)
  }

  async function saveBundles(updated) {
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('site_config')
      .upsert({ key: 'treatment_bundles', value: updated, updated_at: new Date().toISOString() })
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setBundles(updated)
      setMessage('Saved!')
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  function startEdit(idx) {
    setEditing(idx)
    setForm({ ...bundles[idx], items: [...bundles[idx].items], roles: bundles[idx].roles || [] })
  }

  function startNew() {
    setEditing('new')
    setForm({ ...EMPTY_BUNDLE, items: [], roles: [], sort_order: bundles.length })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(EMPTY_BUNDLE)
  }

  function updateForm(field, value) {
    setForm(prev => {
      const u = { ...prev, [field]: value }
      if (field === 'title' && (editing === 'new' || !prev.id)) {
        u.id = slugify(value)
      }
      return u
    })
  }

  function addCatalogItem(catalogItem) {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, {
        catalogId: catalogItem.catalogId,
        slug: '',
        label: catalogItem.label,
      }],
    }))
  }

  function removeItem(idx) {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  function updateItem(idx, field, value) {
    setForm(prev => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], [field]: value }
      return { ...prev, items }
    })
  }

  function toggleRole(role) {
    setForm(prev => {
      const roles = prev.roles || []
      if (roles.includes(role)) {
        return { ...prev, roles: roles.filter(r => r !== role) }
      }
      return { ...prev, roles: [...roles, role] }
    })
  }

  async function handleSaveBundle() {
    const validItems = form.items.filter(i => i.catalogId || i.slug)
    if (!form.title || validItems.length === 0) {
      setMessage('Error: Title and at least one service are required.')
      return
    }
    const bundle = {
      ...form,
      items: validItems,
      id: form.id || slugify(form.title),
      roles: form.roles?.length > 0 ? form.roles : [],
    }
    // Remove legacy slugs field if present
    delete bundle.slugs
    let updated
    if (editing === 'new') {
      updated = [...bundles, bundle]
    } else {
      updated = bundles.map((b, i) => (i === editing ? bundle : b))
    }
    await saveBundles(updated)
    setEditing(null)
    setForm(EMPTY_BUNDLE)
  }

  async function handleDelete(idx) {
    if (!confirm(`Delete "${bundles[idx].title}"?`)) return
    const updated = bundles.filter((_, i) => i !== idx)
      .map((b, i) => ({ ...b, sort_order: i }))
    await saveBundles(updated)
  }

  async function handleMove(idx, dir) {
    const to = idx + dir
    if (to < 0 || to >= bundles.length) return
    const updated = [...bundles]
    ;[updated[idx], updated[to]] = [updated[to], updated[idx]]
    const reordered = updated.map((b, i) => ({ ...b, sort_order: i }))
    await saveBundles(reordered)
  }

  // Check which providers qualify for a bundle
  function getProvidersForBundle(bundle) {
    const bundleItems = (bundle.items || [])
    return staffList.filter(staff => {
      const map = staff.boulevard_service_map || {}
      if (Array.isArray(staff.treatment_bundles) && staff.treatment_bundles.length === 0) return false
      // Role check
      if (bundle.roles?.length > 0) {
        const category = categorizeProvider(staff)
        if (!bundle.roles.some(r => roleMatches(category, r))) return false
      }
      const hasCatalogOnlyItems = bundleItems.some((item) => item.catalogId && !item.slug)
      if (hasCatalogOnlyItems) {
        // Catalog-based services may not map to slug keys on staff records.
        // If role matches and provider has any mapped services, treat as potentially covered.
        return Object.keys(map).length > 0
      }
      return bundleItems.some((item) => {
        if (item.slug) {
          const locMap = map[item.slug]
          if (locMap && Object.keys(locMap).length > 0) return true
        }
        if (item.catalogId) {
          return Object.values(map).some((locMap) => Object.values(locMap || {}).includes(item.catalogId))
        }
        return false
      })
    })
  }

  function getOverrideLabel(staff) {
    if (staff.treatment_bundles === null || staff.treatment_bundles === undefined) return null
    if (Array.isArray(staff.treatment_bundles) && staff.treatment_bundles.length === 0) return 'Disabled'
    if (Array.isArray(staff.treatment_bundles)) return 'Custom'
    return null
  }

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Treatment Bundles</h1>
          <div className="flex gap-2">
            <button
              onClick={handleSyncCatalog}
              disabled={syncing}
              className="px-4 py-2 border text-sm rounded-lg font-medium hover:bg-neutral-50 disabled:opacity-50 transition"
            >
              {syncing ? 'Syncing...' : 'Sync Catalog'}
            </button>
            <button
              onClick={startNew}
              disabled={editing !== null}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
            >
              + Add Bundle
            </button>
          </div>
        </div>
        <p className="text-sm text-neutral-500 mb-6">
          Treatment bundles organize services by patient concern. Patients pick a bundle, then choose a specific Boulevard service within it.
          Click &ldquo;Sync Catalog&rdquo; to pull the latest services from Boulevard.
        </p>

        {message && (
          <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {message}
          </div>
        )}

        {/* ─── Bundle List ─── */}
        <div className="space-y-3 mb-10">
          {bundles.map((bundle, idx) => (
            <div key={bundle.id || idx} className="bg-white border rounded-xl p-4">
              {editing === idx ? (
                <BundleForm
                  form={form}
                  onUpdate={updateForm}
                  onAddCatalogItem={addCatalogItem}
                  onRemoveItem={removeItem}
                  onUpdateItem={updateItem}
                  onToggleRole={toggleRole}
                  onSave={handleSaveBundle}
                  onCancel={cancelEdit}
                  saving={saving}
                />
              ) : (
                <div className="flex items-start gap-4">
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    <button onClick={() => handleMove(idx, -1)} disabled={idx === 0 || saving} className="text-neutral-400 hover:text-black disabled:opacity-20 transition text-xs">&#9650;</button>
                    <button onClick={() => handleMove(idx, 1)} disabled={idx === bundles.length - 1 || saving} className="text-neutral-400 hover:text-black disabled:opacity-20 transition text-xs">&#9660;</button>
                  </div>

                  {/* Bundle info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{bundle.title}</h3>
                      <span className="text-xs text-neutral-400 font-mono">{bundle.id}</span>
                      {bundle.roles?.length > 0 && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                          {bundle.roles.join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 mb-2">{bundle.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(bundle.items || []).map((item, i) => (
                        <span key={item.catalogId || item.slug || i} className="bg-violet-50 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {item.label}
                        </span>
                      ))}
                    </div>
                    {/* Provider coverage */}
                    <div className="text-xs text-neutral-400">
                      {getProvidersForBundle(bundle).length} provider{getProvidersForBundle(bundle).length !== 1 ? 's' : ''}: {' '}
                      {getProvidersForBundle(bundle).map(s => s.name?.split(' ')[0]).join(', ') || 'none'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEdit(idx)} disabled={editing !== null} className="text-sm text-neutral-500 hover:text-black disabled:opacity-50 transition">Edit</button>
                    <button onClick={() => handleDelete(idx)} disabled={saving} className="text-sm text-red-400 hover:text-red-600 disabled:opacity-50 transition">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {bundles.length === 0 && (
            <div className="text-center py-12 text-neutral-400 text-sm">
              No bundles configured. Click &ldquo;+ Add Bundle&rdquo; to create one.
            </div>
          )}
        </div>

        {/* New bundle form */}
        {editing === 'new' && (
          <div className="bg-white border-2 border-black rounded-xl p-4 mb-10">
            <h3 className="font-semibold text-sm mb-3">New Bundle</h3>
            <BundleForm
              form={form}
              onUpdate={updateForm}
              onAddCatalogItem={addCatalogItem}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
              onToggleRole={toggleRole}
              onSave={handleSaveBundle}
              onCancel={cancelEdit}
              saving={saving}
            />
          </div>
        )}

        {/* ─── Provider Overview ─── */}
        <h2 className="text-lg font-bold mb-4">Provider Status</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Shows which providers use the global bundle defaults vs custom overrides. Edit overrides on each provider&rsquo;s staff page.
        </p>
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b">
                <th className="text-left px-4 py-2.5 font-medium">Provider</th>
                <th className="text-left px-4 py-2.5 font-medium">Role</th>
                <th className="text-left px-4 py-2.5 font-medium">Bundle Config</th>
                <th className="text-left px-4 py-2.5 font-medium">Matching Bundles</th>
                <th className="text-right px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(staff => {
                const override = getOverrideLabel(staff)
                const category = categorizeProvider(staff)
                const map = staff.boulevard_service_map || {}
                const providerSlugs = Object.keys(map).filter(slug => {
                  const locMap = map[slug]
                  return locMap && Object.keys(locMap).length > 0
                })
                const matchingBundles = bundles.filter(b => {
                  // Check slug match
                  const hasSlug = (b.items || []).some(item => providerSlugs.includes(item.slug))
                  if (!hasSlug) return false
                  // Check role match
                  if (b.roles?.length > 0) {
                    return b.roles.some(r => roleMatches(category, r))
                  }
                  return true
                })
                return (
                  <tr key={staff.id} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-medium">{staff.name}</td>
                    <td className="px-4 py-2.5 text-neutral-500 text-xs">{category}</td>
                    <td className="px-4 py-2.5">
                      {override === 'Disabled' && (
                        <span className="bg-neutral-100 text-neutral-500 text-xs font-medium px-2 py-0.5 rounded-full">Disabled</span>
                      )}
                      {override === 'Custom' && (
                        <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">Custom ({staff.treatment_bundles.length})</span>
                      )}
                      {!override && (
                        <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-0.5 rounded-full">Global Defaults</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500">
                      {matchingBundles.length > 0
                        ? matchingBundles.map(b => b.title).join(', ')
                        : <span className="text-neutral-300">No matches</span>
                      }
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <a href={`/admin/staff/${staff.id}`} className="text-violet-600 hover:text-violet-800 text-xs font-medium">
                        Edit
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

/* ─── Reusable Bundle Edit Form ─── */
function BundleForm({ form, onUpdate, onAddCatalogItem, onRemoveItem, onUpdateItem, onToggleRole, onSave, onCancel, saving }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => onUpdate('title', e.target.value)}
            placeholder="e.g. Relaxing Glow"
            className="w-full border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">ID (auto)</label>
          <input
            type="text"
            value={form.id}
            onChange={e => onUpdate('id', e.target.value)}
            className="w-full border rounded-lg px-3 py-1.5 text-sm font-mono text-neutral-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={e => onUpdate('description', e.target.value)}
          placeholder="Short patient-facing description"
          className="w-full border rounded-lg px-3 py-1.5 text-sm"
        />
      </div>

      {/* Role filtering */}
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Show for provider types</label>
        <div className="flex gap-3">
          {ROLE_OPTIONS.map(role => (
            <label key={role} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={(form.roles || []).includes(role)}
                onChange={() => onToggleRole(role)}
                className="accent-violet-600"
              />
              <span className="text-sm">{role}</span>
            </label>
          ))}
        </div>
        <p className="text-[10px] text-neutral-400 mt-1">Leave all unchecked to show for all provider types.</p>
      </div>

      {/* Services */}
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Services</label>
        <div className="space-y-2">
          {(form.items || []).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-neutral-50 rounded-lg px-2 py-1.5">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={item.label}
                  onChange={e => onUpdateItem(idx, 'label', e.target.value)}
                  placeholder="Display name"
                  className="w-full border rounded px-2 py-1 text-sm bg-white"
                />
                {item.catalogId && (
                  <p className="text-[10px] text-neutral-400 mt-0.5 truncate font-mono px-1">{item.catalogId}</p>
                )}
                {item.slug && !item.catalogId && (
                  <p className="text-[10px] text-neutral-400 mt-0.5 px-1">slug: {item.slug}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveItem(idx)}
                className="text-red-400 hover:text-red-600 text-sm px-1 shrink-0"
              >
                &times;
              </button>
            </div>
          ))}

          {/* Search to add new service */}
          <div className="pt-1">
            <CatalogServicePicker
              onSelect={onAddCatalogItem}
              placeholder="Search Boulevard services to add..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-1.5 bg-black text-white text-sm rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 text-sm text-neutral-500 hover:text-black transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
