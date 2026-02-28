// src/pages/admin/products/brands.js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

const EMPTY = {
  slug: '', name: '', tagline: '', description: '', logo_url: '', hero_image: '',
  affiliate_url: '', purchase_type: 'in_clinic', website: '', sort_order: 0, active: true,
}

export default function AdminBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // brand id or 'new'
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { loadBrands() }, [])

  async function loadBrands() {
    setLoading(true)
    const { data } = await supabase.from('brands').select('*').order('sort_order')
    setBrands(data || [])
    setLoading(false)
  }

  function startEdit(brand) {
    setEditing(brand.id)
    setForm({ ...brand })
    setMessage('')
  }

  function startNew() {
    setEditing('new')
    setForm({ ...EMPTY })
    setMessage('')
  }

  function cancel() {
    setEditing(null)
    setForm(EMPTY)
    setMessage('')
  }

  function update(field, value) {
    setForm(prev => {
      const u = { ...prev, [field]: value }
      if (field === 'name' && (editing === 'new' || !prev.slug)) {
        u.slug = (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }
      return u
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = { ...form, updated_at: new Date().toISOString() }
    delete payload.id
    delete payload.created_at

    let result
    if (editing === 'new') {
      result = await supabase.from('brands').insert(payload).select()
    } else {
      result = await supabase.from('brands').update(payload).eq('id', editing).select()
    }

    if (result.error) {
      setMessage(`Error: ${result.error.message}`)
    } else {
      setMessage('Saved!')
      setEditing(null)
      loadBrands()
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this brand? All its products will also be deleted.')) return
    await supabase.from('brands').delete().eq('id', id)
    loadBrands()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
        <div className="flex gap-2">
          <Link href="/admin/products" className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
            ← Products
          </Link>
          <button onClick={startNew} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition">
            New Brand
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-white rounded-xl border p-6 mb-6 max-w-3xl space-y-4">
          <h2 className="text-lg font-semibold">{editing === 'new' ? 'New Brand' : 'Edit Brand'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={e => update('slug', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input type="text" value={form.tagline || ''} onChange={e => update('tagline', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description || ''} onChange={e => update('description', e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input type="text" value={form.logo_url || ''} onChange={e => update('logo_url', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hero Image URL</label>
              <input type="text" value={form.hero_image || ''} onChange={e => update('hero_image', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Type</label>
              <select value={form.purchase_type} onChange={e => update('purchase_type', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="in_clinic">In-Clinic Only</option>
                <option value="affiliate">Affiliate</option>
                <option value="direct">Direct</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Affiliate URL</label>
              <input type="text" value={form.affiliate_url || ''} onChange={e => update('affiliate_url', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input type="text" value={form.website || ''} onChange={e => update('website', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => update('sort_order', parseInt(e.target.value) || 0)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end gap-3 pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={e => update('active', e.target.checked)} className="rounded" />
                Active
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={cancel} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700">Cancel</button>
            {message && <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{message}</span>}
          </div>
        </form>
      )}

      {/* Brand list */}
      {loading ? <p className="text-neutral-500">Loading...</p> : brands.length === 0 ? (
        <p className="text-neutral-500">No brands yet.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Brand</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-center px-4 py-3 font-medium">Order</th>
                <th className="text-center px-4 py-3 font-medium">Active</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-neutral-400">{b.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      b.purchase_type === 'affiliate' ? 'bg-blue-100 text-blue-700' :
                      b.purchase_type === 'direct' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>{b.purchase_type}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-neutral-500">{b.sort_order}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${b.active ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(b)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}

AdminBrands.getLayout = (page) => page
