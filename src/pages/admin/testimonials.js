// src/pages/admin/testimonials.js
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

const EMPTY = { author_name: '', quote: '', rating: 5, staff_name: '', status: 'published' }

export default function AdminTestimonials() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null or item object
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = { ...editing }
    const isNew = !payload.id

    if (isNew) {
      delete payload.id
      const { error } = await supabase.from('testimonials').insert(payload)
      if (error) setMessage(`Error: ${error.message}`)
      else { setMessage('Added!'); setEditing(null) }
    } else {
      const id = payload.id
      delete payload.id
      delete payload.created_at
      const { error } = await supabase.from('testimonials').update(payload).eq('id', id)
      if (error) setMessage(`Error: ${error.message}`)
      else { setMessage('Saved!'); setEditing(null) }
    }
    setSaving(false)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this testimonial?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    load()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <button onClick={() => setEditing({ ...EMPTY })} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition">
          Add Testimonial
        </button>
      </div>

      {/* Edit / Add form */}
      {editing && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold mb-4">{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</h2>
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Author Name</label><input type="text" value={editing.author_name} onChange={e => setEditing(p => ({ ...p, author_name: e.target.value }))} required className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Staff Name (optional)</label><input type="text" value={editing.staff_name || ''} onChange={e => setEditing(p => ({ ...p, staff_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Quote</label><textarea value={editing.quote} onChange={e => setEditing(p => ({ ...p, quote: e.target.value }))} required rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Rating (1-5)</label><input type="number" min={1} max={5} value={editing.rating} onChange={e => setEditing(p => ({ ...p, rating: parseInt(e.target.value) || 5 }))} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Status</label><select value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm"><option value="published">Published</option><option value="draft">Draft</option></select></div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              {message && <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{message}</span>}
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-neutral-500">Loading...</p> : items.length === 0 ? <p className="text-neutral-500">No testimonials yet.</p> : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{t.author_name}</span>
                  <span className="text-yellow-500 text-sm">{'★'.repeat(t.rating || 5)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${t.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>{t.status}</span>
                </div>
                <p className="text-sm text-neutral-600 italic line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                {t.staff_name && <p className="text-xs text-neutral-400 mt-1">Provider: {t.staff_name}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditing({ ...t })} className="text-sm text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="text-sm text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
