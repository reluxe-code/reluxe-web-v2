// src/pages/admin/staff/[id].js
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import { supabase } from '@/lib/supabase'
import { SLUG_TITLES } from '@/data/treatmentBundles'
import CatalogServicePicker from '@/components/admin/CatalogServicePicker'

function slugify(t) { return (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

const EMPTY = {
  name: '', slug: '', title: '', bio: '', featured_image: '', transparent_bg: '',
  booking_url: '', fun_fact: '', video_intro: '', role: '',
  locations: [], specialties: [], credentials: [], availability: [], social_profiles: [],
  sort_order: 0, status: 'published',
}
const LOCATION_OPTIONS = [
  { key: 'westfield', label: 'Westfield' },
  { key: 'carmel', label: 'Carmel' },
]

function normalizeLocationKeys(input = []) {
  return [...new Set(
    (Array.isArray(input) ? input : [])
      .map((loc) => {
        if (typeof loc === 'string') return loc.toLowerCase()
        return String(loc?.slug || loc?.title || loc?.name || '').toLowerCase()
      })
      .map((raw) => {
        if (raw.includes('westfield')) return 'westfield'
        if (raw.includes('carmel')) return 'carmel'
        return null
      })
      .filter(Boolean)
  )]
}

export default function AdminStaffEdit() {
  const router = useRouter()
  const { id } = router.query
  const isNew = id === 'new'
  const [staff, setStaff] = useState(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Simple text helpers for JSONB arrays
  const [specialtiesText, setSpecialtiesText] = useState('')
  const [credentialsText, setCredentialsText] = useState('')
  const [locationKeys, setLocationKeys] = useState([])

  // Treatment bundle override
  // 'global' = null (use global defaults), 'disabled' = [], 'custom' = [{...}]
  const [bundleMode, setBundleMode] = useState('global')
  const [customBundles, setCustomBundles] = useState([])
  const [globalBundles, setGlobalBundles] = useState([])

  const fetchGlobalBundles = useCallback(async () => {
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'treatment_bundles')
      .limit(1)
      .single()
    if (data?.value) setGlobalBundles(data.value)
  }, [])

  useEffect(() => { fetchGlobalBundles() }, [fetchGlobalBundles])

  useEffect(() => {
    if (!id || isNew) return
    supabase.from('staff').select('*').eq('id', id).limit(1).then(({ data }) => {
      if (data?.[0]) {
        setStaff(data[0])
        setSpecialtiesText((data[0].specialties || []).map(s => s.specialty).join('\n'))
        setCredentialsText((data[0].credentials || []).map(c => c.credentialItem).join('\n'))
        setLocationKeys(normalizeLocationKeys(data[0].locations || []))
        // Initialize bundle override state
        const tb = data[0].treatment_bundles
        if (tb === null || tb === undefined) {
          setBundleMode('global')
        } else if (Array.isArray(tb) && tb.length === 0) {
          setBundleMode('disabled')
        } else if (Array.isArray(tb)) {
          setBundleMode('custom')
          setCustomBundles(tb)
        }
      }
      setLoading(false)
    })
  }, [id, isNew])

  function update(field, value) {
    setStaff(prev => {
      const u = { ...prev, [field]: value }
      if (field === 'name' && (isNew || !prev.slug)) u.slug = slugify(value.split(' ')[0])
      return u
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // Compute treatment_bundles from mode
    let treatmentBundlesValue = null
    if (bundleMode === 'disabled') treatmentBundlesValue = []
    else if (bundleMode === 'custom') treatmentBundlesValue = customBundles

    const normalizedLocations = locationKeys.map((key) => ({
      slug: key,
      title: key === 'westfield' ? 'Westfield' : 'Carmel',
    }))

    const payload = {
      ...staff,
      locations: normalizedLocations,
      specialties: specialtiesText.split('\n').filter(Boolean).map(s => ({ specialty: s.trim() })),
      credentials: credentialsText.split('\n').filter(Boolean).map(c => ({ credentialItem: c.trim() })),
      treatment_bundles: treatmentBundlesValue,
      updated_at: new Date().toISOString(),
    }
    delete payload.id
    delete payload.created_at

    let result
    if (isNew) result = await supabase.from('staff').insert(payload).select()
    else result = await supabase.from('staff').update(payload).eq('id', id).select()

    if (result.error) {
      setMessage(`Error: ${result.error.message}`)
    } else {
      const savedId = isNew ? result.data?.[0]?.id : id
      // Force-save locations through server route (service role) to avoid client-side policy drift.
      const locRes = await fetch('/api/admin/staff/update-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: savedId, locations: normalizedLocations }),
      })
      const locJson = await locRes.json()
      if (!locRes.ok) {
        setMessage(`Error: locations update failed (${locJson.error || 'unknown'})`)
        setSaving(false)
        return
      }

      // Re-read row so UI always reflects what actually persisted.
      const { data: savedRows } = await supabase.from('staff').select('*').eq('id', savedId).limit(1)
      if (savedRows?.[0]) {
        setStaff(savedRows[0])
        setLocationKeys(normalizeLocationKeys(savedRows[0].locations || []))
        const persisted = normalizeLocationKeys(savedRows[0].locations || [])
          .map((k) => (k === 'westfield' ? 'Westfield' : 'Carmel'))
          .join(', ')
        setMessage(`Saved! Locations: ${persisted || 'none'}`)
      } else {
        setMessage('Saved!')
      }
      if (isNew && result.data?.[0]?.id) router.replace(`/admin/staff/${result.data[0].id}`)
    }
    setSaving(false)
  }

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'New Staff Member' : `Edit: ${staff.name}`}</h1>
      <form onSubmit={handleSave} className="max-w-3xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={staff.name} onChange={e => update('name', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Slug</label><input type="text" value={staff.slug} onChange={e => update('slug', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm font-mono" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Title / Position</label><input type="text" value={staff.title || ''} onChange={e => update('title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nurse Practitioner" /></div>
          <div><label className="block text-sm font-medium mb-1">Role</label><input type="text" value={staff.role || ''} onChange={e => update('role', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Injector" /></div>
        </div>
        <ImageUpload value={staff.featured_image} onChange={url => update('featured_image', url)} folder="staff" label="Featured Image" />
        <ImageUpload value={staff.transparent_bg} onChange={url => update('transparent_bg', url)} folder="staff" label="Transparent Background" />
        <div>
          <label className="block text-sm font-medium mb-1">Bio (HTML)</label>
          <textarea value={staff.bio || ''} onChange={e => update('bio', e.target.value)} rows={8} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Booking URL</label><input type="text" value={staff.booking_url || ''} onChange={e => update('booking_url', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Video Intro URL</label><input type="text" value={staff.video_intro || ''} onChange={e => update('video_intro', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Fun Fact</label><input type="text" value={staff.fun_fact || ''} onChange={e => update('fun_fact', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div>
          <label className="block text-sm font-medium mb-1">Locations</label>
          <div className="flex gap-4">
            {LOCATION_OPTIONS.map((loc) => (
              <label key={loc.key} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={locationKeys.includes(loc.key)}
                  onChange={(e) => {
                    setLocationKeys((prev) => {
                      if (e.target.checked) return [...new Set([...prev, loc.key])]
                      return prev.filter((k) => k !== loc.key)
                    })
                  }}
                  className="accent-violet-600"
                />
                <span className="text-sm">{loc.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Controls which location(s) this provider appears under in booking.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Specialties (one per line)</label><textarea value={specialtiesText} onChange={e => setSpecialtiesText(e.target.value)} rows={5} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Botox&#10;Filler&#10;Morpheus8" /></div>
          <div><label className="block text-sm font-medium mb-1">Credentials (one per line)</label><textarea value={credentialsText} onChange={e => setCredentialsText(e.target.value)} rows={5} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="BSN&#10;RN&#10;NP" /></div>
        </div>
        {/* ─── Treatment Bundles Override ─── */}
        <div className="border rounded-xl p-4 bg-neutral-50">
          <label className="block text-sm font-semibold mb-2">Treatment Bundles</label>
          <p className="text-xs text-neutral-500 mb-3">Controls how services are grouped on the booking picker. <a href="/admin/treatment-bundles" className="text-violet-600 hover:underline">Manage global bundles</a></p>
          <div className="flex gap-3 mb-3">
            {[
              { value: 'global', label: 'Use Global Defaults' },
              { value: 'disabled', label: 'Disabled (All Services only)' },
              { value: 'custom', label: 'Custom Bundles' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="bundleMode"
                  value={opt.value}
                  checked={bundleMode === opt.value}
                  onChange={() => {
                    setBundleMode(opt.value)
                    if (opt.value === 'custom' && customBundles.length === 0) {
                      // Pre-populate custom bundles from global defaults, normalizing legacy format
                      setCustomBundles(globalBundles.map(b => ({
                        ...b,
                        items: b.items || (b.slugs || []).map(s => ({ slug: s, label: SLUG_TITLES[s] || s })),
                      })))
                    }
                  }}
                  className="accent-violet-600"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>

          {bundleMode === 'global' && globalBundles.length > 0 && (
            <div className="text-xs text-neutral-500">
              Will show: {globalBundles.map(b => b.title).join(', ')}
            </div>
          )}

          {bundleMode === 'custom' && (
            <div className="space-y-3 mt-2">
              {customBundles.map((bundle, idx) => (
                <div key={idx} className="bg-white border rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={bundle.title}
                        onChange={e => {
                          const updated = [...customBundles]
                          updated[idx] = { ...updated[idx], title: e.target.value }
                          if (!updated[idx].id) updated[idx].id = slugify(e.target.value)
                          setCustomBundles(updated)
                        }}
                        placeholder="Bundle title"
                        className="border rounded px-2 py-1 text-sm"
                      />
                      <input
                        type="text"
                        value={bundle.description || ''}
                        onChange={e => {
                          const updated = [...customBundles]
                          updated[idx] = { ...updated[idx], description: e.target.value }
                          setCustomBundles(updated)
                        }}
                        placeholder="Description"
                        className="border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomBundles(customBundles.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 text-sm mt-1"
                    >
                      &times;
                    </button>
                  </div>
                  {/* Items: label + catalog ID rows */}
                  <div className="space-y-1.5 pl-1">
                    {(bundle.items || []).map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2 bg-neutral-50 rounded px-2 py-1">
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.label}
                            onChange={e => {
                              const updated = [...customBundles]
                              const items = [...(updated[idx].items || [])]
                              items[itemIdx] = { ...items[itemIdx], label: e.target.value }
                              updated[idx] = { ...updated[idx], items }
                              setCustomBundles(updated)
                            }}
                            placeholder="Display name"
                            className="w-full border rounded px-1.5 py-1 text-xs"
                          />
                          {item.catalogId && (
                            <p className="text-[9px] text-neutral-400 mt-0.5 truncate font-mono">{item.catalogId}</p>
                          )}
                          {item.slug && !item.catalogId && (
                            <p className="text-[9px] text-neutral-400 mt-0.5">slug: {item.slug}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...customBundles]
                            updated[idx] = { ...updated[idx], items: (updated[idx].items || []).filter((_, i) => i !== itemIdx) }
                            setCustomBundles(updated)
                          }}
                          className="text-red-300 hover:text-red-500 text-xs shrink-0"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <CatalogServicePicker
                      onSelect={(catalogItem) => {
                        const updated = [...customBundles]
                        updated[idx] = {
                          ...updated[idx],
                          items: [...(updated[idx].items || []), {
                            catalogId: catalogItem.catalogId,
                            slug: '',
                            label: catalogItem.label,
                          }],
                        }
                        setCustomBundles(updated)
                      }}
                      placeholder="Search services to add..."
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCustomBundles([...customBundles, { id: '', title: '', description: '', items: [], sort_order: customBundles.length }])}
                className="text-sm text-violet-600 hover:text-violet-800 font-medium"
              >
                + Add Custom Bundle
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Sort Order</label><input type="number" value={staff.sort_order} onChange={e => update('sort_order', parseInt(e.target.value) || 0)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Status</label><select value={staff.status} onChange={e => update('status', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm"><option value="published">Published</option><option value="draft">Draft</option></select></div>
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition">{saving ? 'Saving...' : 'Save'}</button>
          {message && <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{message}</span>}
        </div>
      </form>
    </AdminLayout>
  )
}
