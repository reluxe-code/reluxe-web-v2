// src/pages/admin/blog/index.js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function AdminBlogList() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('id, slug, title, status, published_at, updated_at')
      .order('updated_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    loadPosts()
  }

  // Auto-redirect to new post form if ?new=1
  useEffect(() => {
    if (router.query.new === '1') router.replace('/admin/blog/new')
  }, [router])

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition"
        >
          New Post
        </Link>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-neutral-500">No posts yet.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blog/${p.id}`} className="font-medium hover:underline">
                      {p.title || 'Untitled'}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/blog/${p.id}`} className="text-blue-600 hover:underline mr-3">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">
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
