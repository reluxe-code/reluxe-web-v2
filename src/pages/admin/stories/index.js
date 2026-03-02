import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function AdminStoriesList() {
  const router = useRouter()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('stories')
      .select('id, slug, person_name, title, status, featured, hero_image, person_image, updated_at')
      .order('sort_order')
      .order('created_at', { ascending: false })
    setStories(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this story?')) return
    await supabase.from('stories').delete().eq('id', id)
    load()
  }

  async function toggleFeatured(id, current) {
    await supabase.from('stories').update({ featured: !current }).eq('id', id)
    load()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Patient Stories</h1>
        <Link
          href="/admin/stories/new"
          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition"
        >
          New Story
        </Link>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg font-medium mb-2">No stories yet</p>
          <p className="text-sm">Create your first patient spotlight to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Story</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Featured</th>
                <th className="text-left px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((s) => (
                <tr key={s.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {(s.person_image || s.hero_image) && (
                        <img
                          src={s.person_image || s.hero_image}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      )}
                      <div>
                        <Link href={`/admin/stories/${s.id}`} className="font-medium hover:underline">
                          {s.person_name}
                        </Link>
                        <p className="text-xs text-neutral-400">{s.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFeatured(s.id, s.featured)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                        s.featured ? 'bg-violet-100 text-violet-700' : 'bg-neutral-100 text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      {s.featured ? 'Featured' : 'Off'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {s.updated_at ? new Date(s.updated_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/stories/${s.id}`} className="text-blue-600 hover:underline mr-3">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
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

AdminStoriesList.getLayout = (page) => page
