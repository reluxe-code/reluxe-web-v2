// src/pages/admin/services/index.js
// Admin service list — shows all CMS services with status, categories, and actions.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

const STATUS_BADGE = {
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-neutral-100 text-neutral-600',
}

const CAT_COLORS = {
  functional: 'bg-violet-100 text-violet-700',
  creative: 'bg-amber-50 text-amber-700',
}

export default function AdminServicesList() {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/services?action=list')
      const json = await res.json()
      setServices(json.data || [])
    } catch (err) {
      console.error('Failed to load services:', err)
    }
    setLoading(false)
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This will remove all blocks and location overrides.`)) return
    try {
      await adminFetch('/api/admin/services?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      load()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  async function handleDuplicate(id) {
    try {
      const res = await adminFetch('/api/admin/services?action=duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.id) {
        router.push(`/admin/services/${json.id}`)
      } else {
        load()
      }
    } catch (err) {
      alert('Failed to duplicate: ' + err.message)
    }
  }

  const filtered = services.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name?.toLowerCase().includes(q) || s.slug?.toLowerCase().includes(q)
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-neutral-500 mt-1">{services.length} services in CMS</p>
        </div>
        <Link
          href="/admin/services/new"
          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          + New Service
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading services...</p>
      ) : filtered.length === 0 ? (
        <p className="text-neutral-500">{search ? 'No services match your search.' : 'No services yet.'}</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Service</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Categories</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((svc) => (
                <tr key={svc.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/services/${svc.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {svc.name}
                    </Link>
                    {svc.hero_image && (
                      <span className="ml-2 text-neutral-400 text-xs" title="Has hero image">
                        <svg className="inline w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">/services/{svc.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[svc.status] || STATUS_BADGE.draft}`}>
                      {svc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(svc.categories || []).map((cat) => (
                        <span
                          key={cat.id}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${CAT_COLORS[cat.type] || CAT_COLORS.functional}`}
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/services/${svc.id}`}
                      className="text-blue-600 hover:underline mr-3 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDuplicate(svc.id)}
                      className="text-neutral-500 hover:underline mr-3 text-xs"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(svc.id, svc.name)}
                      className="text-red-500 hover:underline text-xs"
                    >
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

AdminServicesList.getLayout = (page) => page
