// src/pages/admin/deals/index.js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function AdminDealsList() {
  const router = useRouter()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDeals() }, [])
  useEffect(() => { if (router.query.new === '1') router.replace('/admin/deals/new') }, [router])

  async function loadDeals() {
    setLoading(true)
    const { data } = await supabase.from('deals').select('id, slug, title, status, start_date, end_date').order('created_at', { ascending: false })
    setDeals(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this deal?')) return
    await supabase.from('deals').delete().eq('id', id)
    loadDeals()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Deals & Specials</h1>
        <Link href="/admin/deals/new" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition">New Deal</Link>
      </div>
      {loading ? <p className="text-neutral-500">Loading...</p> : deals.length === 0 ? <p className="text-neutral-500">No deals yet.</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Dates</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3"><Link href={`/admin/deals/${d.id}`} className="font-medium hover:underline">{d.title}</Link></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>{d.status}</span></td>
                  <td className="px-4 py-3 text-neutral-500">{d.start_date || '—'} to {d.end_date || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/deals/${d.id}`} className="text-blue-600 hover:underline mr-3">Edit</Link>
                    <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:underline">Delete</button>
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
