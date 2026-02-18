// src/pages/admin/staff/[id].js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import { supabase } from '@/lib/supabase'

function slugify(t) { return (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

const EMPTY = {
  name: '', slug: '', title: '', bio: '', featured_image: '', transparent_bg: '',
  booking_url: '', fun_fact: '', video_intro: '', role: '',
  locations: [], specialties: [], credentials: [], availability: [], social_profiles: [],
  sort_order: 0, status: 'published',
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

  useEffect(() => {
    if (!id || isNew) return
    supabase.from('staff').select('*').eq('id', id).limit(1).then(({ data }) => {
      if (data?.[0]) {
        setStaff(data[0])
        setSpecialtiesText((data[0].specialties || []).map(s => s.specialty).join('\n'))
        setCredentialsText((data[0].credentials || []).map(c => c.credentialItem).join('\n'))
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

    const payload = {
      ...staff,
      specialties: specialtiesText.split('\n').filter(Boolean).map(s => ({ specialty: s.trim() })),
      credentials: credentialsText.split('\n').filter(Boolean).map(c => ({ credentialItem: c.trim() })),
      updated_at: new Date().toISOString(),
    }
    delete payload.id
    delete payload.created_at

    let result
    if (isNew) result = await supabase.from('staff').insert(payload).select()
    else result = await supabase.from('staff').update(payload).eq('id', id).select()

    if (result.error) setMessage(`Error: ${result.error.message}`)
    else {
      setMessage('Saved!')
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
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Specialties (one per line)</label><textarea value={specialtiesText} onChange={e => setSpecialtiesText(e.target.value)} rows={5} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Botox&#10;Filler&#10;Morpheus8" /></div>
          <div><label className="block text-sm font-medium mb-1">Credentials (one per line)</label><textarea value={credentialsText} onChange={e => setCredentialsText(e.target.value)} rows={5} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="BSN&#10;RN&#10;NP" /></div>
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
