// src/pages/admin/services/categories.js
// Admin category manager — CRUD for functional and creative service categories.

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import { adminFetch } from '@/lib/adminFetch'

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300'
const labelCls = 'block text-sm font-medium text-neutral-700 mb-1'

const EMPTY = {
  id: null,
  name: '',
  slug: '',
  type: 'functional',
  hero_image: '',
  description: '',
  seo_title: '',
  seo_description: '',
  parent_id: null,
  sort_order: 0,
  active: true,
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminServiceCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = list view, object = form
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/service-categories?action=list')
      const json = await res.json()
      setCategories(json.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
    setLoading(false)
  }

  function handleNew() {
    setEditing({ ...EMPTY })
  }

  function handleEdit(cat) {
    setEditing({ ...cat })
  }

  function handleCancel() {
    setEditing(null)
  }

  async function handleSave() {
    if (!editing.name || !editing.slug || !editing.type) {
      alert('Name, slug, and type are required.')
      return
    }
    setSaving(true)
    try {
      const res = await adminFetch('/api/admin/service-categories?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      const json = await res.json()
      if (json.error) {
        alert('Error: ' + json.error)
      } else {
        setEditing(null)
        load()
      }
    } catch (err) {
      alert('Failed to save: ' + err.message)
    }
    setSaving(false)
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete category "${name}"? Services will be unlinked from this category.`)) return
    try {
      await adminFetch('/api/admin/service-categories?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      load()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const functional = categories.filter((c) => c.type === 'functional')
  const creative = categories.filter((c) => c.type === 'creative')

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Service Categories</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Functional categories match BLVD. Creative categories are marketing funnels.
          </p>
        </div>
        {!editing && (
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800"
          >
            + New Category
          </button>
        )}
      </div>

      {/* Editor form */}
      {editing && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing.id ? 'Edit Category' : 'New Category'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Name</label>
              <input
                type="text"
                className={inputCls}
                value={editing.name}
                onChange={(e) => {
                  const name = e.target.value
                  const updates = { name }
                  if (!editing.id) updates.slug = slugify(name)
                  setEditing({ ...editing, ...updates })
                }}
                placeholder="e.g. Wedding Prep"
              />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input
                type="text"
                className={inputCls}
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="e.g. wedding-prep"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Type</label>
              <select
                className={inputCls}
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })}
              >
                <option value="functional">Functional (BLVD Sync)</option>
                <option value="creative">Creative (Marketing)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input
                type="number"
                className={inputCls}
                value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelCls}>Description</label>
            <textarea
              className={inputCls}
              rows={3}
              value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Category description for the landing page"
            />
          </div>

          <div className="mb-4">
            <ImageUpload
              value={editing.hero_image}
              onChange={(v) => setEditing({ ...editing, hero_image: v })}
              folder="service-categories"
              label="Hero Image"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>SEO Title</label>
              <input
                type="text"
                className={inputCls}
                value={editing.seo_title || ''}
                onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>SEO Description</label>
              <input
                type="text"
                className={inputCls}
                value={editing.seo_description || ''}
                onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              />
              Active (visible on public site)
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Category'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category tables */}
      {loading ? (
        <p className="text-neutral-500">Loading categories...</p>
      ) : (
        <>
          {/* Functional */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-violet-500" />
              Functional Categories
              <span className="text-sm font-normal text-neutral-500">({functional.length})</span>
            </h2>
            {functional.length === 0 ? (
              <p className="text-neutral-500 text-sm">No functional categories yet.</p>
            ) : (
              <CategoryTable
                items={functional}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>

          {/* Creative */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              Creative Categories
              <span className="text-sm font-normal text-neutral-500">({creative.length})</span>
            </h2>
            {creative.length === 0 ? (
              <p className="text-neutral-500 text-sm">No creative categories yet. Create one to build marketing funnels.</p>
            ) : (
              <CategoryTable
                items={creative}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}

function CategoryTable({ items, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Slug</th>
            <th className="text-left px-4 py-3 font-medium">Order</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((cat) => (
            <tr key={cat.id} className="border-b last:border-b-0 hover:bg-neutral-50">
              <td className="px-4 py-3 font-medium">{cat.name}</td>
              <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{cat.slug}</td>
              <td className="px-4 py-3 text-neutral-500">{cat.sort_order}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                  {cat.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button onClick={() => onEdit(cat)} className="text-blue-600 hover:underline mr-3 text-xs">
                  Edit
                </button>
                <button onClick={() => onDelete(cat.id, cat.name)} className="text-red-500 hover:underline text-xs">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

AdminServiceCategories.getLayout = (page) => page
