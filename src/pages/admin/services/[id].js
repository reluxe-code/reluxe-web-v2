// src/pages/admin/services/[id].js
// Admin service editor — metadata, content blocks, location overrides.

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import { adminFetch } from '@/lib/adminFetch'

/* ─── Helpers ────────────────────────────────────────────── */

function slugify(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const INPUT = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300'
const LABEL = 'block text-sm font-medium text-neutral-700 mb-1'
const BTN = 'bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50'
const BTN_DANGER = 'text-red-500 hover:underline text-xs'
const BTN_SECONDARY = 'border rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-50 transition-colors'

const BLOCK_TYPE_LABELS = {
  hero: 'Hero',
  quick_facts: 'Quick Facts',
  overview: 'Overview',
  benefits: 'Benefits',
  results_gallery: 'Results Gallery',
  how_it_works: 'How It Works',
  candidates: 'Good Candidates',
  pricing_matrix: 'Pricing Matrix',
  comparison: 'Comparison Table',
  faq: 'FAQ',
  testimonials: 'Testimonials',
  providers: 'Providers',
  prep_aftercare: 'Prep & Aftercare',
  flex_everything: 'Flex / Everything',
  cta: 'Call to Action',
}

const BLOCK_TYPES = Object.keys(BLOCK_TYPE_LABELS)

const ICON_OPTIONS = ['clock', 'sparkles', 'user', 'fire', 'calendar']

const EMPTY_FORM = {
  name: '',
  slug: '',
  tagline: '',
  hero_image: '',
  booking_slug: '',
  consult_slug: '',
  seo: { title: '', description: '', image: '' },
  status: 'draft',
  indexable: true,
  sort_order: 0,
}

const LOCATION_KEYS = [
  { key: 'westfield', label: 'Westfield' },
  { key: 'carmel', label: 'Carmel' },
]

const EMPTY_LOCATION = {
  available: true,
  description: '',
  differences: [],
  faqs: [],
  seo_title: '',
  seo_description: '',
  complementary: [],
  alternatives: [],
}

/* ─── Block Content Defaults ─────────────────────────────── */

function defaultContent(blockType) {
  switch (blockType) {
    case 'hero': return { tagline: '' }
    case 'quick_facts': return { facts: [] }
    case 'overview': return { p1: '', p2: '', whyReluxe: [] }
    case 'benefits': return { items: [] }
    case 'results_gallery': return { images: [] }
    case 'how_it_works': return { steps: [] }
    case 'candidates': return { goodFor: [], notIdealIf: [] }
    case 'pricing_matrix': return { subtitle: '', sections: [] }
    case 'comparison': return { columns: [], rows: [] }
    case 'faq': return { items: [] }
    case 'testimonials': return { source: 'db', items: [] }
    case 'providers': return { providers: [] }
    case 'prep_aftercare': return { prep: { title: '', points: [] }, after: { title: '', points: [] } }
    case 'flex_everything': return { intro: '', items: [] }
    case 'cta': return { heading: '', body: '', primaryLabel: 'Book Now', secondaryLabel: 'Free Consult', style: 'gradient', variant: 'book_service', buttonLabel: 'Free Consultation', providerSlug: '', options: [] }
    default: return {}
  }
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function AdminServiceEdit() {
  const router = useRouter()
  const { id } = router.query
  const isNew = id === 'new'

  const [form, setForm] = useState(EMPTY_FORM)
  const [categoryIds, setCategoryIds] = useState([])
  const [categories, setCategories] = useState([])
  const [blocks, setBlocks] = useState([])
  const [locations, setLocations] = useState({
    westfield: { ...EMPTY_LOCATION },
    carmel: { ...EMPTY_LOCATION },
  })
  const [locationTab, setLocationTab] = useState('westfield')

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [expandedBlocks, setExpandedBlocks] = useState({})
  const [addBlockOpen, setAddBlockOpen] = useState(false)

  /* ─── Data Loading ───────────────────────────────────── */

  const loadCategories = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/service-categories?action=list')
      const json = await res.json()
      setCategories(json.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }, [])

  const loadService = useCallback(async () => {
    if (!id || isNew) return
    setLoading(true)
    try {
      const res = await adminFetch(`/api/admin/services?action=detail&id=${id}`)
      const json = await res.json()

      if (json.service) {
        setForm({
          name: json.service.name || '',
          slug: json.service.slug || '',
          tagline: json.service.tagline || '',
          hero_image: json.service.hero_image || '',
          booking_slug: json.service.booking_slug || '',
          consult_slug: json.service.consult_slug || '',
          seo: json.service.seo || { title: '', description: '', image: '' },
          status: json.service.status || 'draft',
          indexable: json.service.indexable !== false,
          sort_order: json.service.sort_order || 0,
        })
      }

      setBlocks(json.blocks || [])
      setCategoryIds(json.categoryIds || [])

      // Map location overrides into keyed object
      const locs = { westfield: { ...EMPTY_LOCATION }, carmel: { ...EMPTY_LOCATION } }
      for (const loc of json.locationOverrides || []) {
        if (locs[loc.location_key]) {
          locs[loc.location_key] = {
            available: loc.available !== false,
            description: loc.description || '',
            differences: loc.differences || [],
            faqs: loc.faqs || [],
            seo_title: loc.seo_title || '',
            seo_description: loc.seo_description || '',
            complementary: loc.complementary || [],
            alternatives: loc.alternatives || [],
          }
        }
      }
      setLocations(locs)
    } catch (err) {
      console.error('Failed to load service:', err)
      setMessage('Error loading service')
    }
    setLoading(false)
  }, [id, isNew])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    if (id) loadService()
  }, [id, loadService])

  /* ─── Form Updates ───────────────────────────────────── */

  function updateForm(field, value) {
    setForm((prev) => {
      const u = { ...prev, [field]: value }
      if (field === 'name' && isNew) u.slug = slugify(value)
      return u
    })
  }

  function updateSeo(field, value) {
    setForm((prev) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }))
  }

  function toggleCategory(catId) {
    setCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    )
  }

  /* ─── Save All ───────────────────────────────────────── */

  async function handleSave() {
    setSaving(true)
    setMessage('')

    try {
      // 1. Save service metadata
      const svcPayload = {
        ...(isNew ? {} : { id }),
        slug: form.slug,
        name: form.name,
        tagline: form.tagline,
        hero_image: form.hero_image,
        booking_slug: form.booking_slug,
        consult_slug: form.consult_slug,
        seo: form.seo,
        status: form.status,
        indexable: form.indexable,
        sort_order: form.sort_order,
        categoryIds,
      }

      const svcRes = await adminFetch('/api/admin/services?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(svcPayload),
      })
      const svcJson = await svcRes.json()

      if (!svcJson.ok) {
        setMessage(`Error: ${svcJson.error || 'Failed to save service'}`)
        setSaving(false)
        return
      }

      const serviceId = svcJson.id

      // 2. Save all blocks
      for (const block of blocks) {
        // For CTA blocks, sync the variant from content.variant to block.variant
        const variant = block.block_type === 'cta'
          ? (block.content?.variant || block.variant)
          : block.variant
        await adminFetch('/api/admin/service-blocks?action=save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: block.id,
            service_id: serviceId,
            block_type: block.block_type,
            content: block.content,
            variant,
            enabled: block.enabled,
            sort_order: block.sort_order,
          }),
        })
      }

      // 3. Save location overrides
      for (const locKey of LOCATION_KEYS) {
        const loc = locations[locKey.key]
        await adminFetch('/api/admin/service-locations?action=save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            location_key: locKey.key,
            available: loc.available,
            description: loc.description,
            differences: loc.differences,
            faqs: loc.faqs,
            seo_title: loc.seo_title,
            seo_description: loc.seo_description,
            complementary: loc.complementary,
            alternatives: loc.alternatives,
          }),
        })
      }

      setMessage('Saved!')

      if (isNew) {
        router.replace(`/admin/services/${serviceId}`)
      } else {
        // Refresh blocks to get server-assigned IDs for any new blocks
        const blocksRes = await adminFetch(`/api/admin/service-blocks?action=list&serviceId=${serviceId}`)
        const blocksJson = await blocksRes.json()
        setBlocks(blocksJson.data || [])
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }

    setSaving(false)
  }

  /* ─── Block Actions ──────────────────────────────────── */

  async function addBlock(blockType) {
    if (isNew) {
      // For unsaved services, add locally
      setBlocks((prev) => [
        ...prev,
        {
          id: null,
          block_type: blockType,
          content: defaultContent(blockType),
          variant: null,
          enabled: true,
          sort_order: prev.length * 10,
        },
      ])
      setAddBlockOpen(false)
      return
    }

    try {
      const res = await adminFetch('/api/admin/service-blocks?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: id,
          block_type: blockType,
          content: defaultContent(blockType),
          enabled: true,
          sort_order: blocks.length * 10,
        }),
      })
      const json = await res.json()
      if (json.ok) {
        const listRes = await adminFetch(`/api/admin/service-blocks?action=list&serviceId=${id}`)
        const listJson = await listRes.json()
        setBlocks(listJson.data || [])
      }
    } catch (err) {
      console.error('Failed to add block:', err)
    }
    setAddBlockOpen(false)
  }

  async function deleteBlock(blockId, idx) {
    if (!confirm('Delete this block?')) return

    if (!blockId) {
      // Local-only block (not yet saved)
      setBlocks((prev) => prev.filter((_, i) => i !== idx))
      return
    }

    try {
      await adminFetch('/api/admin/service-blocks?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blockId }),
      })
      setBlocks((prev) => prev.filter((b) => b.id !== blockId))
    } catch (err) {
      console.error('Failed to delete block:', err)
    }
  }

  async function toggleBlock(blockId, idx) {
    const block = blocks[idx]
    const newEnabled = !block.enabled

    setBlocks((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, enabled: newEnabled } : b))
    )

    if (blockId) {
      try {
        await adminFetch('/api/admin/service-blocks?action=toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: blockId, enabled: newEnabled }),
        })
      } catch (err) {
        console.error('Failed to toggle block:', err)
      }
    }
  }

  async function moveBlock(idx, direction) {
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= blocks.length) return

    const updated = [...blocks]
    const temp = updated[idx]
    updated[idx] = updated[newIdx]
    updated[newIdx] = temp

    // Reassign sort_order
    const reordered = updated.map((b, i) => ({ ...b, sort_order: i * 10 }))
    setBlocks(reordered)

    // If both blocks have IDs, call reorder API
    const items = reordered.filter((b) => b.id).map((b) => ({ id: b.id, sort_order: b.sort_order }))
    if (items.length > 0 && !isNew) {
      try {
        await adminFetch('/api/admin/service-blocks?action=reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        })
      } catch (err) {
        console.error('Failed to reorder blocks:', err)
      }
    }
  }

  function updateBlockContent(idx, content) {
    setBlocks((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, content } : b))
    )
  }

  function toggleExpand(idx) {
    setExpandedBlocks((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  /* ─── Location Helpers ───────────────────────────────── */

  function updateLocation(key, field, value) {
    setLocations((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  /* ─── Render ─────────────────────────────────────────── */

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-neutral-500">Loading service...</p>
      </AdminLayout>
    )
  }

  const functionalCats = categories.filter((c) => c.type === 'functional')
  const creativeCats = categories.filter((c) => c.type === 'creative')
  const currentLoc = locations[locationTab] || EMPTY_LOCATION

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/services" className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-2xl font-bold">{isNew ? 'New Service' : form.name || 'Edit Service'}</h1>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && form.slug && (
            <a
              href={`/services/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View on site
            </a>
          )}
          <button onClick={handleSave} disabled={saving} className={BTN}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          {message && (
            <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
              {message}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl space-y-10">
        {/* ═══ Section A: Service Metadata ═══ */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Service Details</h2>
          <div className="bg-white border rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className={INPUT}
                  placeholder="e.g. Botox & Dysport"
                />
              </div>
              <div>
                <label className={LABEL}>Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateForm('slug', e.target.value)}
                  className={`${INPUT} font-mono`}
                  placeholder="botox-dysport"
                />
              </div>
            </div>

            <div>
              <label className={LABEL}>Tagline</label>
              <textarea
                value={form.tagline}
                onChange={(e) => updateForm('tagline', e.target.value)}
                rows={2}
                className={INPUT}
                placeholder="Brief description shown in hero area"
              />
            </div>

            <ImageUpload
              value={form.hero_image}
              onChange={(v) => setForm({ ...form, hero_image: v })}
              folder="services"
              label="Hero Image"
            />

            {/* Category Assignment */}
            <div>
              <label className={LABEL}>Categories</label>
              {functionalCats.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">Functional</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {functionalCats.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryIds.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="rounded border-neutral-300 text-violet-600 focus:ring-violet-300"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {creativeCats.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Creative</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {creativeCats.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryIds.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="rounded border-neutral-300 text-amber-600 focus:ring-amber-300"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Booking Slug</label>
                <input
                  type="text"
                  value={form.booking_slug}
                  onChange={(e) => updateForm('booking_slug', e.target.value)}
                  className={INPUT}
                  placeholder="Boulevard booking slug"
                />
              </div>
              <div>
                <label className={LABEL}>Consult Slug</label>
                <input
                  type="text"
                  value={form.consult_slug}
                  onChange={(e) => updateForm('consult_slug', e.target.value)}
                  className={INPUT}
                  placeholder="Consult booking slug"
                />
              </div>
            </div>

            {/* SEO Fields */}
            <div>
              <label className={LABEL}>SEO Title</label>
              <input
                type="text"
                value={form.seo.title || ''}
                onChange={(e) => updateSeo('title', e.target.value)}
                className={INPUT}
                placeholder="Page title for search engines"
              />
            </div>
            <div>
              <label className={LABEL}>SEO Description</label>
              <textarea
                value={form.seo.description || ''}
                onChange={(e) => updateSeo('description', e.target.value)}
                rows={2}
                className={INPUT}
                placeholder="Meta description for search engines"
              />
            </div>
            <div>
              <label className={LABEL}>SEO Image URL</label>
              <input
                type="text"
                value={form.seo.image || ''}
                onChange={(e) => updateSeo('image', e.target.value)}
                className={INPUT}
                placeholder="Open Graph image URL"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={LABEL}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateForm('status', e.target.value)}
                  className={INPUT}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className={LABEL}>Indexable</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.indexable}
                    onChange={(e) => updateForm('indexable', e.target.checked)}
                    className="rounded border-neutral-300 text-violet-600 focus:ring-violet-300"
                  />
                  <span className="text-sm">Allow search engine indexing</span>
                </label>
              </div>
              <div>
                <label className={LABEL}>Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => updateForm('sort_order', parseInt(e.target.value, 10) || 0)}
                  className={INPUT}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Section B: Content Blocks ═══ */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Content Blocks</h2>

          {blocks.length === 0 && (
            <p className="text-neutral-400 text-sm mb-3">No blocks yet. Add one below.</p>
          )}

          {blocks.map((block, idx) => (
            <div key={block.id || `new-${idx}`} className="bg-white border rounded-xl p-4 mb-3">
              {/* Block header row */}
              <div className="flex items-center gap-3">
                {/* Toggle enabled */}
                <input
                  type="checkbox"
                  checked={block.enabled}
                  onChange={() => toggleBlock(block.id, idx)}
                  className="rounded border-neutral-300 text-violet-600 focus:ring-violet-300"
                  title={block.enabled ? 'Enabled' : 'Disabled'}
                />

                {/* Type label */}
                <span className={`text-sm font-medium flex-1 ${block.enabled ? 'text-neutral-900' : 'text-neutral-400'}`}>
                  {BLOCK_TYPE_LABELS[block.block_type] || block.block_type}
                </span>

                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => moveBlock(idx, -1)}
                  disabled={idx === 0}
                  className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 p-1"
                  title="Move up"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => moveBlock(idx, 1)}
                  disabled={idx === blocks.length - 1}
                  className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 p-1"
                  title="Move down"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {/* Expand / Collapse */}
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="text-neutral-400 hover:text-neutral-700 p-1"
                  title={expandedBlocks[idx] ? 'Collapse' : 'Expand'}
                >
                  {expandedBlocks[idx] ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  )}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => deleteBlock(block.id, idx)}
                  className={BTN_DANGER}
                >
                  Delete
                </button>
              </div>

              {/* Block editor (expanded) */}
              {expandedBlocks[idx] && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <BlockEditor
                    blockType={block.block_type}
                    content={block.content || {}}
                    onChange={(c) => updateBlockContent(idx, c)}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add Block */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAddBlockOpen(!addBlockOpen)}
              className={BTN_SECONDARY}
            >
              + Add Block
            </button>
            {addBlockOpen && (
              <div className="absolute z-10 mt-1 bg-white border rounded-xl shadow-lg py-2 w-64 max-h-80 overflow-y-auto">
                {BLOCK_TYPES.map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => addBlock(bt)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors"
                  >
                    {BLOCK_TYPE_LABELS[bt]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══ Section C: Location Overrides ═══ */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Location Overrides</h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              {LOCATION_KEYS.map((loc) => (
                <button
                  key={loc.key}
                  type="button"
                  onClick={() => setLocationTab(loc.key)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    locationTab === loc.key
                      ? 'border-b-2 border-black text-black'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-5">
              {/* Available toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentLoc.available}
                  onChange={(e) => updateLocation(locationTab, 'available', e.target.checked)}
                  className="rounded border-neutral-300 text-violet-600 focus:ring-violet-300"
                />
                <span className="text-sm font-medium">Available at this location</span>
              </label>

              {/* Description */}
              <div>
                <label className={LABEL}>Description</label>
                <textarea
                  value={currentLoc.description}
                  onChange={(e) => updateLocation(locationTab, 'description', e.target.value)}
                  rows={3}
                  className={INPUT}
                  placeholder="Location-specific description"
                />
              </div>

              {/* FAQs Repeater */}
              <div>
                <label className={LABEL}>FAQs</label>
                {(currentLoc.faqs || []).map((faq, fi) => (
                  <div key={fi} className="border rounded-lg p-3 mb-2 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={faq.q || ''}
                          onChange={(e) => {
                            const updated = [...currentLoc.faqs]
                            updated[fi] = { ...updated[fi], q: e.target.value }
                            updateLocation(locationTab, 'faqs', updated)
                          }}
                          className={INPUT}
                          placeholder="Question"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = currentLoc.faqs.filter((_, i) => i !== fi)
                          updateLocation(locationTab, 'faqs', updated)
                        }}
                        className={BTN_DANGER}
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={faq.a || ''}
                      onChange={(e) => {
                        const updated = [...currentLoc.faqs]
                        updated[fi] = { ...updated[fi], a: e.target.value }
                        updateLocation(locationTab, 'faqs', updated)
                      }}
                      rows={2}
                      className={INPUT}
                      placeholder="Answer"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...(currentLoc.faqs || []), { q: '', a: '' }]
                    updateLocation(locationTab, 'faqs', updated)
                  }}
                  className={BTN_SECONDARY}
                >
                  + Add FAQ
                </button>
              </div>

              {/* SEO fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>SEO Title</label>
                  <input
                    type="text"
                    value={currentLoc.seo_title || ''}
                    onChange={(e) => updateLocation(locationTab, 'seo_title', e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>SEO Description</label>
                  <input
                    type="text"
                    value={currentLoc.seo_description || ''}
                    onChange={(e) => updateLocation(locationTab, 'seo_description', e.target.value)}
                    className={INPUT}
                  />
                </div>
              </div>

              {/* Complementary Services */}
              <div>
                <label className={LABEL}>Complementary Services</label>
                {(currentLoc.complementary || []).map((item, ci) => (
                  <div key={ci} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...currentLoc.complementary]
                        updated[ci] = e.target.value
                        updateLocation(locationTab, 'complementary', updated)
                      }}
                      className={`${INPUT} flex-1`}
                      placeholder="Service name or slug"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = currentLoc.complementary.filter((_, i) => i !== ci)
                        updateLocation(locationTab, 'complementary', updated)
                      }}
                      className={BTN_DANGER}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...(currentLoc.complementary || []), '']
                    updateLocation(locationTab, 'complementary', updated)
                  }}
                  className={BTN_SECONDARY}
                >
                  + Add
                </button>
              </div>

              {/* Alternatives */}
              <div>
                <label className={LABEL}>Alternatives</label>
                {(currentLoc.alternatives || []).map((item, ai) => (
                  <div key={ai} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...currentLoc.alternatives]
                        updated[ai] = e.target.value
                        updateLocation(locationTab, 'alternatives', updated)
                      }}
                      className={`${INPUT} flex-1`}
                      placeholder="Alternative service name or slug"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = currentLoc.alternatives.filter((_, i) => i !== ai)
                        updateLocation(locationTab, 'alternatives', updated)
                      }}
                      className={BTN_DANGER}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...(currentLoc.alternatives || []), '']
                    updateLocation(locationTab, 'alternatives', updated)
                  }}
                  className={BTN_SECONDARY}
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

/* ─── Block Editor Component ───────────────────────────── */

function BlockEditor({ blockType, content, onChange }) {
  function set(field, value) {
    onChange({ ...content, [field]: value })
  }

  switch (blockType) {
    case 'hero':
      return <HeroEditor content={content} onChange={onChange} set={set} />
    case 'quick_facts':
      return <QuickFactsEditor content={content} onChange={onChange} set={set} />
    case 'overview':
      return <OverviewEditor content={content} onChange={onChange} set={set} />
    case 'benefits':
      return <BenefitsEditor content={content} onChange={onChange} set={set} />
    case 'results_gallery':
      return <ResultsGalleryEditor content={content} onChange={onChange} set={set} />
    case 'how_it_works':
      return <HowItWorksEditor content={content} onChange={onChange} set={set} />
    case 'candidates':
      return <CandidatesEditor content={content} onChange={onChange} set={set} />
    case 'pricing_matrix':
      return <PricingMatrixEditor content={content} onChange={onChange} set={set} />
    case 'comparison':
      return <ComparisonEditor content={content} onChange={onChange} set={set} />
    case 'faq':
      return <FaqEditor content={content} onChange={onChange} set={set} />
    case 'testimonials':
      return <TestimonialsEditor content={content} onChange={onChange} set={set} />
    case 'providers':
      return <ProvidersEditor content={content} onChange={onChange} set={set} />
    case 'prep_aftercare':
      return <PrepAftercareEditor content={content} onChange={onChange} set={set} />
    case 'flex_everything':
      return <FlexEverythingEditor content={content} onChange={onChange} set={set} />
    case 'cta':
      return <CTAEditor content={content} onChange={onChange} set={set} />
    default:
      return (
        <div>
          <label className={LABEL}>Raw JSON</label>
          <textarea
            value={JSON.stringify(content, null, 2)}
            onChange={(e) => {
              try { onChange(JSON.parse(e.target.value)) } catch (_) { /* ignore parse errors while typing */ }
            }}
            rows={8}
            className={`${INPUT} font-mono`}
          />
        </div>
      )
  }
}

/* ─── Hero Editor ──────────────────────────────────────── */

function HeroEditor({ content, set }) {
  return (
    <div>
      <label className={LABEL}>Tagline</label>
      <textarea
        value={content.tagline || ''}
        onChange={(e) => set('tagline', e.target.value)}
        rows={2}
        className={INPUT}
        placeholder="Hero section tagline"
      />
    </div>
  )
}

/* ─── Quick Facts Editor ───────────────────────────────── */

function QuickFactsEditor({ content, onChange }) {
  const facts = content.facts || []

  function updateFact(idx, field, value) {
    const updated = [...facts]
    updated[idx] = { ...updated[idx], [field]: value }
    onChange({ ...content, facts: updated })
  }

  return (
    <div>
      <label className={LABEL}>Quick Facts</label>
      {facts.map((fact, fi) => (
        <div key={fi} className="grid grid-cols-[140px_1fr_1fr_auto] gap-2 mb-2 items-start">
          <select
            value={fact.icon || ''}
            onChange={(e) => updateFact(fi, 'icon', e.target.value)}
            className={INPUT}
          >
            <option value="">Icon...</option>
            {ICON_OPTIONS.map((ic) => (
              <option key={ic} value={ic}>{ic}</option>
            ))}
          </select>
          <input
            type="text"
            value={fact.label || ''}
            onChange={(e) => updateFact(fi, 'label', e.target.value)}
            className={INPUT}
            placeholder="Label"
          />
          <input
            type="text"
            value={fact.value || ''}
            onChange={(e) => updateFact(fi, 'value', e.target.value)}
            className={INPUT}
            placeholder="Value"
          />
          <button
            type="button"
            onClick={() => onChange({ ...content, facts: facts.filter((_, i) => i !== fi) })}
            className={BTN_DANGER}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, facts: [...facts, { icon: '', label: '', value: '' }] })}
        className={BTN_SECONDARY}
      >
        + Add Fact
      </button>
    </div>
  )
}

/* ─── Overview Editor ──────────────────────────────────── */

function OverviewEditor({ content, onChange, set }) {
  const whyReluxe = content.whyReluxe || []

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL}>Paragraph 1</label>
        <textarea
          value={content.p1 || ''}
          onChange={(e) => set('p1', e.target.value)}
          rows={3}
          className={INPUT}
        />
      </div>
      <div>
        <label className={LABEL}>Paragraph 2</label>
        <textarea
          value={content.p2 || ''}
          onChange={(e) => set('p2', e.target.value)}
          rows={3}
          className={INPUT}
        />
      </div>
      <div>
        <label className={LABEL}>Why RELUXE</label>
        {whyReluxe.map((item, wi) => (
          <div key={wi} className="border rounded-lg p-3 mb-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => {
                  const updated = [...whyReluxe]
                  updated[wi] = { ...updated[wi], title: e.target.value }
                  onChange({ ...content, whyReluxe: updated })
                }}
                className={`${INPUT} flex-1`}
                placeholder="Title"
              />
              <button
                type="button"
                onClick={() => onChange({ ...content, whyReluxe: whyReluxe.filter((_, i) => i !== wi) })}
                className={BTN_DANGER}
              >
                Remove
              </button>
            </div>
            <textarea
              value={item.body || ''}
              onChange={(e) => {
                const updated = [...whyReluxe]
                updated[wi] = { ...updated[wi], body: e.target.value }
                onChange({ ...content, whyReluxe: updated })
              }}
              rows={2}
              className={INPUT}
              placeholder="Body"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...content, whyReluxe: [...whyReluxe, { title: '', body: '' }] })}
          className={BTN_SECONDARY}
        >
          + Add Reason
        </button>
      </div>
    </div>
  )
}

/* ─── Benefits Editor ──────────────────────────────────── */

function BenefitsEditor({ content, onChange }) {
  const items = content.items || []

  return (
    <div>
      <label className={LABEL}>Benefits</label>
      {items.map((item, bi) => (
        <div key={bi} className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const updated = [...items]
              updated[bi] = e.target.value
              onChange({ ...content, items: updated })
            }}
            className={`${INPUT} flex-1`}
            placeholder="Benefit text"
          />
          <button
            type="button"
            onClick={() => onChange({ ...content, items: items.filter((_, i) => i !== bi) })}
            className={BTN_DANGER}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, items: [...items, ''] })}
        className={BTN_SECONDARY}
      >
        + Add Benefit
      </button>
    </div>
  )
}

/* ─── Results Gallery Editor ───────────────────────────── */

function ResultsGalleryEditor({ content, onChange }) {
  const images = content.images || []

  return (
    <div>
      <label className={LABEL}>Results Gallery Images</label>
      {images.map((img, ii) => (
        <div key={ii} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-start">
          <input
            type="text"
            value={img.src || ''}
            onChange={(e) => {
              const updated = [...images]
              updated[ii] = { ...updated[ii], src: e.target.value }
              onChange({ ...content, images: updated })
            }}
            className={INPUT}
            placeholder="Image URL"
          />
          <input
            type="text"
            value={img.alt || ''}
            onChange={(e) => {
              const updated = [...images]
              updated[ii] = { ...updated[ii], alt: e.target.value }
              onChange({ ...content, images: updated })
            }}
            className={INPUT}
            placeholder="Alt text"
          />
          <button
            type="button"
            onClick={() => onChange({ ...content, images: images.filter((_, i) => i !== ii) })}
            className={BTN_DANGER}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, images: [...images, { src: '', alt: '' }] })}
        className={BTN_SECONDARY}
      >
        + Add Image
      </button>
    </div>
  )
}

/* ─── How It Works Editor ──────────────────────────────── */

function HowItWorksEditor({ content, onChange }) {
  const steps = content.steps || []

  return (
    <div>
      <label className={LABEL}>Steps</label>
      {steps.map((step, si) => (
        <div key={si} className="border rounded-lg p-3 mb-2 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={step.title || ''}
              onChange={(e) => {
                const updated = [...steps]
                updated[si] = { ...updated[si], title: e.target.value }
                onChange({ ...content, steps: updated })
              }}
              className={`${INPUT} flex-1`}
              placeholder="Step title"
            />
            <button
              type="button"
              onClick={() => onChange({ ...content, steps: steps.filter((_, i) => i !== si) })}
              className={BTN_DANGER}
            >
              Remove
            </button>
          </div>
          <textarea
            value={step.body || ''}
            onChange={(e) => {
              const updated = [...steps]
              updated[si] = { ...updated[si], body: e.target.value }
              onChange({ ...content, steps: updated })
            }}
            rows={2}
            className={INPUT}
            placeholder="Step description"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, steps: [...steps, { title: '', body: '' }] })}
        className={BTN_SECONDARY}
      >
        + Add Step
      </button>
    </div>
  )
}

/* ─── Candidates Editor ────────────────────────────────── */

function CandidatesEditor({ content, onChange }) {
  const goodFor = content.goodFor || []
  const notIdealIf = content.notIdealIf || []

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className={LABEL}>Good For</label>
        {goodFor.map((item, gi) => (
          <div key={gi} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const updated = [...goodFor]
                updated[gi] = e.target.value
                onChange({ ...content, goodFor: updated })
              }}
              className={`${INPUT} flex-1`}
              placeholder="Good candidate description"
            />
            <button
              type="button"
              onClick={() => onChange({ ...content, goodFor: goodFor.filter((_, i) => i !== gi) })}
              className={BTN_DANGER}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...content, goodFor: [...goodFor, ''] })}
          className={BTN_SECONDARY}
        >
          + Add
        </button>
      </div>
      <div>
        <label className={LABEL}>Not Ideal If</label>
        {notIdealIf.map((item, ni) => (
          <div key={ni} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const updated = [...notIdealIf]
                updated[ni] = e.target.value
                onChange({ ...content, notIdealIf: updated })
              }}
              className={`${INPUT} flex-1`}
              placeholder="Not ideal description"
            />
            <button
              type="button"
              onClick={() => onChange({ ...content, notIdealIf: notIdealIf.filter((_, i) => i !== ni) })}
              className={BTN_DANGER}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...content, notIdealIf: [...notIdealIf, ''] })}
          className={BTN_SECONDARY}
        >
          + Add
        </button>
      </div>
    </div>
  )
}

/* ─── Pricing Matrix Editor ────────────────────────────── */

function PricingMatrixEditor({ content, onChange, set }) {
  const sections = content.sections || []

  function updateSection(si, field, value) {
    const updated = [...sections]
    updated[si] = { ...updated[si], [field]: value }
    onChange({ ...content, sections: updated })
  }

  function updateRow(si, ri, field, value) {
    const updated = [...sections]
    const rows = [...(updated[si].rows || [])]
    rows[ri] = { ...rows[ri], [field]: value }
    updated[si] = { ...updated[si], rows }
    onChange({ ...content, sections: updated })
  }

  function addRow(si) {
    const updated = [...sections]
    updated[si] = {
      ...updated[si],
      rows: [...(updated[si].rows || []), { label: '', subLabel: '', single: '', singleNote: '', membership: '', package: '', packageNote: '' }],
    }
    onChange({ ...content, sections: updated })
  }

  function removeRow(si, ri) {
    const updated = [...sections]
    updated[si] = {
      ...updated[si],
      rows: updated[si].rows.filter((_, i) => i !== ri),
    }
    onChange({ ...content, sections: updated })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL}>Subtitle</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => set('subtitle', e.target.value)}
          className={INPUT}
          placeholder="Pricing section subtitle"
        />
      </div>

      <label className={LABEL}>Pricing Sections</label>
      {sections.map((section, si) => (
        <div key={si} className="border rounded-lg p-4 mb-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) => updateSection(si, 'title', e.target.value)}
              className={`${INPUT} flex-1`}
              placeholder="Section title"
            />
            <button
              type="button"
              onClick={() => onChange({ ...content, sections: sections.filter((_, i) => i !== si) })}
              className={BTN_DANGER}
            >
              Remove Section
            </button>
          </div>
          <input
            type="text"
            value={section.note || ''}
            onChange={(e) => updateSection(si, 'note', e.target.value)}
            className={INPUT}
            placeholder="Section note"
          />

          {/* Rows */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-neutral-500 uppercase">Rows</span>
            {(section.rows || []).map((row, ri) => (
              <div key={ri} className="border rounded-lg p-3 space-y-2 bg-neutral-50">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={row.label || ''} onChange={(e) => updateRow(si, ri, 'label', e.target.value)} className={INPUT} placeholder="Label" />
                  <input type="text" value={row.subLabel || ''} onChange={(e) => updateRow(si, ri, 'subLabel', e.target.value)} className={INPUT} placeholder="Sub-label" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={row.single || ''} onChange={(e) => updateRow(si, ri, 'single', e.target.value)} className={INPUT} placeholder="Single price" />
                  <input type="text" value={row.singleNote || ''} onChange={(e) => updateRow(si, ri, 'singleNote', e.target.value)} className={INPUT} placeholder="Single note" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={row.membership || ''} onChange={(e) => updateRow(si, ri, 'membership', e.target.value)} className={INPUT} placeholder="Membership price" />
                  <div />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={row.package || ''} onChange={(e) => updateRow(si, ri, 'package', e.target.value)} className={INPUT} placeholder="Package price" />
                  <input type="text" value={row.packageNote || ''} onChange={(e) => updateRow(si, ri, 'packageNote', e.target.value)} className={INPUT} placeholder="Package note" />
                </div>
                <div className="text-right">
                  <button type="button" onClick={() => removeRow(si, ri)} className={BTN_DANGER}>Remove Row</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addRow(si)} className={BTN_SECONDARY}>+ Add Row</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={section.promo || ''} onChange={(e) => updateSection(si, 'promo', e.target.value)} className={INPUT} placeholder="Promo text" />
            <input type="text" value={section.ctaText || ''} onChange={(e) => updateSection(si, 'ctaText', e.target.value)} className={INPUT} placeholder="CTA text" />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, sections: [...sections, { title: '', note: '', rows: [], promo: '', ctaText: '' }] })}
        className={BTN_SECONDARY}
      >
        + Add Section
      </button>
    </div>
  )
}

/* ─── Comparison Editor ────────────────────────────────── */

function ComparisonEditor({ content, onChange }) {
  const columns = content.columns || []
  const rows = content.rows || []

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL}>Columns</label>
        {columns.map((col, ci) => (
          <div key={ci} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={col}
              onChange={(e) => {
                const updated = [...columns]
                updated[ci] = e.target.value
                onChange({ ...content, columns: updated })
              }}
              className={`${INPUT} flex-1`}
              placeholder="Column header"
            />
            <button
              type="button"
              onClick={() => {
                const updatedCols = columns.filter((_, i) => i !== ci)
                // Also remove the matching option from each row
                const updatedRows = rows.map((r) => ({
                  ...r,
                  options: (r.options || []).filter((_, i) => i !== ci),
                }))
                onChange({ ...content, columns: updatedCols, rows: updatedRows })
              }}
              className={BTN_DANGER}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const updatedCols = [...columns, '']
            // Add empty option to each row
            const updatedRows = rows.map((r) => ({
              ...r,
              options: [...(r.options || []), ''],
            }))
            onChange({ ...content, columns: updatedCols, rows: updatedRows })
          }}
          className={BTN_SECONDARY}
        >
          + Add Column
        </button>
      </div>

      <div>
        <label className={LABEL}>Rows</label>
        {rows.map((row, ri) => (
          <div key={ri} className="border rounded-lg p-3 mb-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={row.label || ''}
                onChange={(e) => {
                  const updated = [...rows]
                  updated[ri] = { ...updated[ri], label: e.target.value }
                  onChange({ ...content, rows: updated })
                }}
                className={`${INPUT} flex-1`}
                placeholder="Row label"
              />
              <button
                type="button"
                onClick={() => onChange({ ...content, rows: rows.filter((_, i) => i !== ri) })}
                className={BTN_DANGER}
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(row.options || []).map((opt, oi) => (
                <input
                  key={oi}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const updated = [...rows]
                    const options = [...(updated[ri].options || [])]
                    options[oi] = e.target.value
                    updated[ri] = { ...updated[ri], options }
                    onChange({ ...content, rows: updated })
                  }}
                  className={INPUT}
                  placeholder={columns[oi] || `Option ${oi + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const newOptions = columns.map(() => '')
            onChange({ ...content, rows: [...rows, { label: '', options: newOptions }] })
          }}
          className={BTN_SECONDARY}
        >
          + Add Row
        </button>
      </div>
    </div>
  )
}

/* ─── FAQ Editor ───────────────────────────────────────── */

function FaqEditor({ content, onChange }) {
  const items = content.items || []

  return (
    <div>
      <label className={LABEL}>FAQ Items</label>
      {items.map((item, fi) => (
        <div key={fi} className="border rounded-lg p-3 mb-2 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <textarea
                value={item.q || ''}
                onChange={(e) => {
                  const updated = [...items]
                  updated[fi] = { ...updated[fi], q: e.target.value }
                  onChange({ ...content, items: updated })
                }}
                rows={1}
                className={INPUT}
                placeholder="Question"
              />
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...content, items: items.filter((_, i) => i !== fi) })}
              className={BTN_DANGER}
            >
              Remove
            </button>
          </div>
          <textarea
            value={item.a || ''}
            onChange={(e) => {
              const updated = [...items]
              updated[fi] = { ...updated[fi], a: e.target.value }
              onChange({ ...content, items: updated })
            }}
            rows={3}
            className={INPUT}
            placeholder="Answer"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, items: [...items, { q: '', a: '' }] })}
        className={BTN_SECONDARY}
      >
        + Add FAQ
      </button>
    </div>
  )
}

/* ─── Testimonials Editor ──────────────────────────────── */

function TestimonialsEditor({ content, onChange, set }) {
  const items = content.items || []

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL}>Source</label>
        <select
          value={content.source || 'db'}
          onChange={(e) => set('source', e.target.value)}
          className={INPUT}
        >
          <option value="db">Database (automatic)</option>
          <option value="manual">Manual entries</option>
        </select>
      </div>

      {content.source === 'manual' && (
        <div>
          <label className={LABEL}>Testimonials</label>
          {items.map((item, ti) => (
            <div key={ti} className="border rounded-lg p-3 mb-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-500">#{ti + 1}</span>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => onChange({ ...content, items: items.filter((_, i) => i !== ti) })}
                  className={BTN_DANGER}
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.author || ''}
                  onChange={(e) => {
                    const updated = [...items]
                    updated[ti] = { ...updated[ti], author: e.target.value }
                    onChange({ ...content, items: updated })
                  }}
                  className={INPUT}
                  placeholder="Author"
                />
                <input
                  type="text"
                  value={item.location || ''}
                  onChange={(e) => {
                    const updated = [...items]
                    updated[ti] = { ...updated[ti], location: e.target.value }
                    onChange({ ...content, items: updated })
                  }}
                  className={INPUT}
                  placeholder="Location"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.service || ''}
                  onChange={(e) => {
                    const updated = [...items]
                    updated[ti] = { ...updated[ti], service: e.target.value }
                    onChange({ ...content, items: updated })
                  }}
                  className={INPUT}
                  placeholder="Service"
                />
                <input
                  type="number"
                  value={item.rating ?? ''}
                  onChange={(e) => {
                    const updated = [...items]
                    updated[ti] = { ...updated[ti], rating: e.target.value ? Number(e.target.value) : '' }
                    onChange({ ...content, items: updated })
                  }}
                  className={INPUT}
                  placeholder="Rating (1-5)"
                  min="1"
                  max="5"
                />
              </div>
              <textarea
                value={item.text || ''}
                onChange={(e) => {
                  const updated = [...items]
                  updated[ti] = { ...updated[ti], text: e.target.value }
                  onChange({ ...content, items: updated })
                }}
                rows={3}
                className={INPUT}
                placeholder="Testimonial text"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...content, items: [...items, { author: '', location: '', service: '', rating: 5, text: '' }] })}
            className={BTN_SECONDARY}
          >
            + Add Testimonial
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Providers Editor ─────────────────────────────────── */

function ProvidersEditor({ content, onChange }) {
  const providers = content.providers || []

  function updateProvider(pi, field, value) {
    const updated = [...providers]
    updated[pi] = { ...updated[pi], [field]: value }
    onChange({ ...content, providers: updated })
  }

  return (
    <div>
      <label className={LABEL}>Providers</label>
      {providers.map((prov, pi) => (
        <div key={pi} className="border rounded-lg p-4 mb-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">Provider #{pi + 1}</span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => onChange({ ...content, providers: providers.filter((_, i) => i !== pi) })}
              className={BTN_DANGER}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={prov.name || ''} onChange={(e) => updateProvider(pi, 'name', e.target.value)} className={INPUT} placeholder="Name" />
            <input type="text" value={prov.title || ''} onChange={(e) => updateProvider(pi, 'title', e.target.value)} className={INPUT} placeholder="Title" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={prov.headshotUrl || ''} onChange={(e) => updateProvider(pi, 'headshotUrl', e.target.value)} className={INPUT} placeholder="Headshot URL" />
            <input type="text" value={prov.href || ''} onChange={(e) => updateProvider(pi, 'href', e.target.value)} className={INPUT} placeholder="Profile link" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={prov.instagram || ''} onChange={(e) => updateProvider(pi, 'instagram', e.target.value)} className={INPUT} placeholder="Instagram handle" />
            <input type="text" value={prov.specialties || ''} onChange={(e) => updateProvider(pi, 'specialties', e.target.value)} className={INPUT} placeholder="Specialties (comma-separated)" />
          </div>
          <textarea
            value={prov.bio || ''}
            onChange={(e) => updateProvider(pi, 'bio', e.target.value)}
            rows={3}
            className={INPUT}
            placeholder="Bio"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, providers: [...providers, { name: '', title: '', headshotUrl: '', bio: '', href: '', instagram: '', specialties: '' }] })}
        className={BTN_SECONDARY}
      >
        + Add Provider
      </button>
    </div>
  )
}

/* ─── Prep & Aftercare Editor ──────────────────────────── */

function PrepAftercareEditor({ content, onChange }) {
  const prep = content.prep || { title: '', points: [] }
  const after = content.after || { title: '', points: [] }

  function updateSection(section, field, value) {
    onChange({
      ...content,
      [section]: { ...content[section] || {}, [field]: value },
    })
  }

  function updatePoint(section, pi, value) {
    const current = content[section] || { title: '', points: [] }
    const points = [...(current.points || [])]
    points[pi] = value
    onChange({
      ...content,
      [section]: { ...current, points },
    })
  }

  function addPoint(section) {
    const current = content[section] || { title: '', points: [] }
    onChange({
      ...content,
      [section]: { ...current, points: [...(current.points || []), ''] },
    })
  }

  function removePoint(section, pi) {
    const current = content[section] || { title: '', points: [] }
    onChange({
      ...content,
      [section]: { ...current, points: current.points.filter((_, i) => i !== pi) },
    })
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Prep */}
      <div>
        <label className={LABEL}>Prep Title</label>
        <input
          type="text"
          value={prep.title || ''}
          onChange={(e) => updateSection('prep', 'title', e.target.value)}
          className={INPUT}
          placeholder="Preparation"
        />
        <div className="mt-3">
          <span className="text-xs font-medium text-neutral-500 uppercase">Points</span>
          {(prep.points || []).map((pt, pi) => (
            <div key={pi} className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={pt}
                onChange={(e) => updatePoint('prep', pi, e.target.value)}
                className={`${INPUT} flex-1`}
                placeholder="Prep instruction"
              />
              <button type="button" onClick={() => removePoint('prep', pi)} className={BTN_DANGER}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addPoint('prep')} className={`${BTN_SECONDARY} mt-2`}>
            + Add Point
          </button>
        </div>
      </div>

      {/* Aftercare */}
      <div>
        <label className={LABEL}>Aftercare Title</label>
        <input
          type="text"
          value={after.title || ''}
          onChange={(e) => updateSection('after', 'title', e.target.value)}
          className={INPUT}
          placeholder="Aftercare"
        />
        <div className="mt-3">
          <span className="text-xs font-medium text-neutral-500 uppercase">Points</span>
          {(after.points || []).map((pt, pi) => (
            <div key={pi} className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={pt}
                onChange={(e) => updatePoint('after', pi, e.target.value)}
                className={`${INPUT} flex-1`}
                placeholder="Aftercare instruction"
              />
              <button type="button" onClick={() => removePoint('after', pi)} className={BTN_DANGER}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addPoint('after')} className={`${BTN_SECONDARY} mt-2`}>
            + Add Point
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Flex Everything Editor ───────────────────────────── */

function FlexEverythingEditor({ content, onChange, set }) {
  const items = content.items || []

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL}>Intro</label>
        <textarea
          value={content.intro || ''}
          onChange={(e) => set('intro', e.target.value)}
          rows={3}
          className={INPUT}
          placeholder="Introduction text"
        />
      </div>
      <div>
        <label className={LABEL}>Items</label>
        {items.map((item, ii) => (
          <div key={ii} className="border rounded-lg p-3 mb-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.heading || ''}
                onChange={(e) => {
                  const updated = [...items]
                  updated[ii] = { ...updated[ii], heading: e.target.value }
                  onChange({ ...content, items: updated })
                }}
                className={`${INPUT} flex-1`}
                placeholder="Heading"
              />
              <button
                type="button"
                onClick={() => onChange({ ...content, items: items.filter((_, i) => i !== ii) })}
                className={BTN_DANGER}
              >
                Remove
              </button>
            </div>
            <textarea
              value={item.body || ''}
              onChange={(e) => {
                const updated = [...items]
                updated[ii] = { ...updated[ii], body: e.target.value }
                onChange({ ...content, items: updated })
              }}
              rows={2}
              className={INPUT}
              placeholder="Body text"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...content, items: [...items, { heading: '', body: '' }] })}
          className={BTN_SECONDARY}
        >
          + Add Item
        </button>
      </div>
    </div>
  )
}

/* ─── CTA Editor ──────────────────────────────────────── */

const CTA_VARIANTS = [
  { value: 'book_service', label: 'Book Service — Two buttons (Book + Consult)' },
  { value: 'book_consult', label: 'Book Consult — Softer consultation CTA' },
  { value: 'book_provider', label: 'Book Provider — Highlights a specific provider' },
  { value: 'decision_helper', label: 'Decision Helper — Guide options linking to services' },
]

const CTA_STYLES = [
  { value: 'gradient', label: 'Gradient (full-width, bold)' },
  { value: 'card', label: 'Card (centered, bordered)' },
  { value: 'minimal', label: 'Minimal (inline bar)' },
]

function CTAEditor({ content, onChange, set }) {
  const variant = content.variant || 'book_service'
  const options = content.options || []

  return (
    <div className="space-y-4">
      {/* Variant selector */}
      <div>
        <label className={LABEL}>CTA Variant</label>
        <select
          value={variant}
          onChange={(e) => set('variant', e.target.value)}
          className={INPUT}
        >
          {CTA_VARIANTS.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Common fields */}
      <div>
        <label className={LABEL}>Heading</label>
        <input
          type="text"
          value={content.heading || ''}
          onChange={(e) => set('heading', e.target.value)}
          className={INPUT}
          placeholder={variant === 'decision_helper' ? 'Which treatment is right for you?' : 'Ready to get started?'}
        />
      </div>
      <div>
        <label className={LABEL}>Body</label>
        <textarea
          value={content.body || ''}
          onChange={(e) => set('body', e.target.value)}
          rows={2}
          className={INPUT}
          placeholder="Supporting text below the heading"
        />
      </div>

      {/* book_service fields */}
      {variant === 'book_service' && (
        <>
          <div>
            <label className={LABEL}>Style</label>
            <select value={content.style || 'gradient'} onChange={(e) => set('style', e.target.value)} className={INPUT}>
              {CTA_STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Primary Button Label</label>
              <input type="text" value={content.primaryLabel || ''} onChange={(e) => set('primaryLabel', e.target.value)} className={INPUT} placeholder="Book Now" />
            </div>
            <div>
              <label className={LABEL}>Secondary Button Label</label>
              <input type="text" value={content.secondaryLabel || ''} onChange={(e) => set('secondaryLabel', e.target.value)} className={INPUT} placeholder="Free Consult" />
            </div>
          </div>
        </>
      )}

      {/* book_consult fields */}
      {variant === 'book_consult' && (
        <>
          <div>
            <label className={LABEL}>Style</label>
            <select value={content.style || 'card'} onChange={(e) => set('style', e.target.value)} className={INPUT}>
              {CTA_STYLES.slice(0, 2).map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Button Label</label>
            <input type="text" value={content.buttonLabel || ''} onChange={(e) => set('buttonLabel', e.target.value)} className={INPUT} placeholder="Free Consultation" />
          </div>
        </>
      )}

      {/* book_provider fields */}
      {variant === 'book_provider' && (
        <>
          <div>
            <label className={LABEL}>Provider Slug</label>
            <input type="text" value={content.providerSlug || ''} onChange={(e) => set('providerSlug', e.target.value)} className={INPUT} placeholder="e.g., hannah-rn" />
            <p className="text-xs text-neutral-400 mt-1">Staff member slug from the team page (e.g., &quot;hannah-rn&quot;)</p>
          </div>
          <div>
            <label className={LABEL}>Button Label</label>
            <input type="text" value={content.buttonLabel || ''} onChange={(e) => set('buttonLabel', e.target.value)} className={INPUT} placeholder="Book with Hannah" />
          </div>
        </>
      )}

      {/* decision_helper fields */}
      {variant === 'decision_helper' && (
        <div>
          <label className={LABEL}>Options</label>
          {options.map((opt, oi) => (
            <div key={oi} className="border rounded-lg p-3 mb-2 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt.label || ''}
                  onChange={(e) => {
                    const updated = [...options]
                    updated[oi] = { ...updated[oi], label: e.target.value }
                    onChange({ ...content, options: updated })
                  }}
                  className={`${INPUT} flex-1`}
                  placeholder="Option label (e.g., Fine lines & wrinkles)"
                />
                <button
                  type="button"
                  onClick={() => onChange({ ...content, options: options.filter((_, i) => i !== oi) })}
                  className={BTN_DANGER}
                >
                  Remove
                </button>
              </div>
              <textarea
                value={opt.description || ''}
                onChange={(e) => {
                  const updated = [...options]
                  updated[oi] = { ...updated[oi], description: e.target.value }
                  onChange({ ...content, options: updated })
                }}
                rows={2}
                className={INPUT}
                placeholder="Short description of this option"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={opt.serviceSlug || ''}
                  onChange={(e) => {
                    const updated = [...options]
                    updated[oi] = { ...updated[oi], serviceSlug: e.target.value }
                    onChange({ ...content, options: updated })
                  }}
                  className={INPUT}
                  placeholder="Service slug (e.g., morpheus8)"
                />
                <input
                  type="text"
                  value={opt.serviceLabel || ''}
                  onChange={(e) => {
                    const updated = [...options]
                    updated[oi] = { ...updated[oi], serviceLabel: e.target.value }
                    onChange({ ...content, options: updated })
                  }}
                  className={INPUT}
                  placeholder="Link label (e.g., Learn about Morpheus8)"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...content, options: [...options, { label: '', description: '', serviceSlug: '', serviceLabel: '' }] })}
            className={BTN_SECONDARY}
          >
            + Add Option
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Layout Export ────────────────────────────────────── */

AdminServiceEdit.getLayout = (page) => page
