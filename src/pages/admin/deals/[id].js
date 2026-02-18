// src/pages/admin/deals/[id].js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import { supabase } from '@/lib/supabase'

function slugify(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EMPTY = { title: '', slug: '', subtitle: '', price: '', compare_at: '', tag: '', image: '', cta_url: '', cta_text: 'Learn more', start_date: '', end_date: '', locations: [], status: 'draft' }

export default function AdminDealEdit() {
  const router = useRouter()
  const { id } = router.query
  const isNew = id === 'new'
  const [deal, setDeal] = useState(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id || isNew) return
    supabase.from('deals').select('*').eq('id', id).limit(1).then(({ data }) => {
      if (data?.[0]) setDeal({ ...data[0], locations: data[0].locations || [] })
      setLoading(false)
    })
  }, [id, isNew])

  function update(field, value) {
    setDeal(prev => {
      const u = { ...prev, [field]: value }
      if (field === 'title' && (isNew || !prev.slug)) u.slug = slugify(value)
      return u
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = { ...deal, updated_at: new Date().toISOString() }
    delete payload.id
    delete payload.created_at

    let result
    if (isNew) result = await supabase.from('deals').insert(payload).select()
    else result = await supabase.from('deals').update(payload).eq('id', id).select()

    if (result.error) setMessage(`Error: ${result.error.message}`)
    else {
      setMessage('Saved!')
      if (isNew && result.data?.[0]?.id) router.replace(`/admin/deals/${result.data[0].id}`)
    }
    setSaving(false)
  }

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'New Deal' : 'Edit Deal'}</h1>
      <form onSubmit={handleSave} className="max-w-3xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={deal.title} onChange={e => update('title', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input type="text" value={deal.slug} onChange={e => update('slug', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle</label>
          <input type="text" value={deal.subtitle} onChange={e => update('subtitle', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <ImageUpload value={deal.image} onChange={url => update('image', url)} folder="deals" label="Deal Image" />
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Price</label><input type="text" value={deal.price || ''} onChange={e => update('price', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="$99" /></div>
          <div><label className="block text-sm font-medium mb-1">Compare At</label><input type="text" value={deal.compare_at || ''} onChange={e => update('compare_at', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="$149" /></div>
          <div><label className="block text-sm font-medium mb-1">Tag / Badge</label><input type="text" value={deal.tag || ''} onChange={e => update('tag', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="NEW" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">CTA URL</label><input type="text" value={deal.cta_url || ''} onChange={e => update('cta_url', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">CTA Text</label><input type="text" value={deal.cta_text} onChange={e => update('cta_text', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Start Date</label><input type="date" value={deal.start_date || ''} onChange={e => update('start_date', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" value={deal.end_date || ''} onChange={e => update('end_date', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Status</label><select value={deal.status} onChange={e => update('status', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></div>
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition">{saving ? 'Saving...' : 'Save'}</button>
          {message && <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{message}</span>}
        </div>
      </form>
    </AdminLayout>
  )
}
