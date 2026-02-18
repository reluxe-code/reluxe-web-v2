// src/pages/admin/locations/[slug].js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import { supabase } from '@/lib/supabase'

export default function AdminLocationEdit() {
  const router = useRouter()
  const { slug } = router.query
  const [loc, setLoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!slug) return
    supabase.from('locations').select('*').eq('slug', slug).limit(1).then(({ data }) => {
      if (data?.[0]) setLoc(data[0])
      setLoading(false)
    })
  }, [slug])

  function update(field, value) {
    setLoc(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = { ...loc, updated_at: new Date().toISOString() }
    delete payload.created_at
    const { error } = await supabase.from('locations').update(payload).eq('id', loc.id)
    if (error) setMessage(`Error: ${error.message}`)
    else setMessage('Saved!')
    setSaving(false)
  }

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>
  if (!loc) return <AdminLayout><p>Location not found.</p></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit: {loc.name}</h1>
        <Link href={`/locations/${loc.slug}`} target="_blank" className="text-sm text-blue-600 hover:underline">View on site</Link>
      </div>
      <form onSubmit={handleSave} className="max-w-3xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={loc.name} onChange={e => update('name', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Slug</label><input type="text" value={loc.slug} readOnly className="w-full border rounded-lg px-3 py-2 text-sm bg-neutral-50 font-mono" /></div>
        </div>
        <ImageUpload value={loc.featured_image || ''} onChange={url => update('featured_image', url)} folder="locations" label="Featured Image" />
        <div><label className="block text-sm font-medium mb-1">Full Address</label><input type="text" value={loc.full_address || ''} onChange={e => update('full_address', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">City</label><input type="text" value={loc.city || ''} onChange={e => update('city', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">State</label><input type="text" value={loc.state || ''} onChange={e => update('state', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">ZIP</label><input type="text" value={loc.zip || ''} onChange={e => update('zip', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Phone</label><input type="text" value={loc.phone || ''} onChange={e => update('phone', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="text" value={loc.email || ''} onChange={e => update('email', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Latitude</label><input type="number" step="any" value={loc.lat || ''} onChange={e => update('lat', parseFloat(e.target.value) || null)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Longitude</label><input type="number" step="any" value={loc.lng || ''} onChange={e => update('lng', parseFloat(e.target.value) || null)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Directions from 465</label><textarea value={loc.directions_465 || ''} onChange={e => update('directions_465', e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Directions from South</label><textarea value={loc.directions_south || ''} onChange={e => update('directions_south', e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Directions from North</label><textarea value={loc.directions_north || ''} onChange={e => update('directions_north', e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div>
          <label className="block text-sm font-medium mb-1">Hours (JSON)</label>
          <textarea value={JSON.stringify(loc.hours || {}, null, 2)} onChange={e => { try { update('hours', JSON.parse(e.target.value)) } catch {} }} rows={8} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition">{saving ? 'Saving...' : 'Save'}</button>
          {message && <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{message}</span>}
        </div>
      </form>
    </AdminLayout>
  )
}
