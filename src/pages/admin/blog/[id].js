// src/pages/admin/blog/[id].js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import { supabase } from '@/lib/supabase'

function slugify(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EMPTY_POST = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  category: '',
  status: 'draft',
  published_at: '',
}

export default function AdminBlogEdit() {
  const router = useRouter()
  const { id } = router.query
  const isNew = id === 'new'

  const [post, setPost] = useState(EMPTY_POST)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id || isNew) return
    async function load() {
      const { data } = await supabase.from('blog_posts').select('*').eq('id', id).limit(1)
      if (data?.[0]) {
        setPost({
          ...data[0],
          published_at: data[0].published_at ? data[0].published_at.slice(0, 16) : '',
        })
      }
      setLoading(false)
    }
    load()
  }, [id, isNew])

  function updateField(field, value) {
    setPost((prev) => {
      const updated = { ...prev, [field]: value }
      // Auto-generate slug from title
      if (field === 'title' && (isNew || !prev.slug)) {
        updated.slug = slugify(value)
      }
      return updated
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const payload = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image: post.featured_image || null,
      category: post.category || null,
      status: post.status,
      published_at: post.published_at ? new Date(post.published_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    let result
    if (isNew) {
      result = await supabase.from('blog_posts').insert(payload).select()
    } else {
      result = await supabase.from('blog_posts').update(payload).eq('id', id).select()
    }

    if (result.error) {
      setMessage(`Error: ${result.error.message}`)
    } else {
      setMessage('Saved!')
      if (isNew && result.data?.[0]?.id) {
        router.replace(`/admin/blog/${result.data[0].id}`)
      }
    }
    setSaving(false)
  }

  if (loading) {
    return <AdminLayout><p className="text-neutral-500">Loading...</p></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isNew ? 'New Blog Post' : 'Edit Blog Post'}</h1>
        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
          View on site
        </a>
      </div>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
          <input
            type="text"
            value={post.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
          <input
            type="text"
            value={post.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none font-mono"
          />
        </div>

        <ImageUpload
          value={post.featured_image}
          onChange={(url) => updateField('featured_image', url)}
          folder="blog"
          label="Featured Image"
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Excerpt</label>
          <textarea
            value={post.excerpt}
            onChange={(e) => updateField('excerpt', e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Content (HTML)</label>
          <textarea
            value={post.content}
            onChange={(e) => updateField('content', e.target.value)}
            rows={20}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <input
              type="text"
              value={post.category || ''}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <select
              value={post.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Publish Date</label>
            <input
              type="datetime-local"
              value={post.published_at}
              onChange={(e) => updateField('published_at', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {message && (
            <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </AdminLayout>
  )
}
