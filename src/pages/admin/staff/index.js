// src/pages/admin/staff/index.js
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

function SortHeader({ label, sortKey, currentSort, onSort, align = 'left' }) {
  const active = currentSort.key === sortKey
  const arrow = active ? (currentSort.dir === 'asc' ? ' ↑' : ' ↓') : ''
  return (
    <th
      className={`text-${align} px-4 py-3 font-medium cursor-pointer select-none hover:text-neutral-800 transition-colors ${active ? 'text-neutral-900' : ''}`}
      onClick={() => onSort(sortKey, active && currentSort.dir === 'asc' ? 'desc' : 'asc')}
    >
      {label}{arrow}
    </th>
  )
}

export default function AdminStaffList() {
  const router = useRouter()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [colSort, setColSort] = useState({ key: null, dir: 'asc' })

  const sortedStaff = useMemo(() => {
    const rows = [...staff]
    if (!colSort.key) return rows
    return rows.sort((a, b) => {
      let av = a[colSort.key], bv = b[colSort.key]
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase() }
      if (av < bv) return colSort.dir === 'asc' ? -1 : 1
      if (av > bv) return colSort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [staff, colSort])

  useEffect(() => { loadStaff() }, [])
  useEffect(() => { if (router.query.new === '1') router.replace('/admin/staff/new') }, [router])

  async function loadStaff() {
    setLoading(true)
    const { data } = await supabase.from('staff').select('id, slug, name, title, status, featured_image').order('sort_order').order('name')
    setStaff(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this staff member?')) return
    await supabase.from('staff').delete().eq('id', id)
    loadStaff()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Staff Members</h1>
        <Link href="/admin/staff/new" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition">New Staff</Link>
      </div>
      {loading ? <p className="text-neutral-500">Loading...</p> : staff.length === 0 ? <p className="text-neutral-500">No staff yet.</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b"><tr>
              <SortHeader label="Name" sortKey="name" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} />
              <SortHeader label="Title" sortKey="title" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} />
              <SortHeader label="Status" sortKey="status" currentSort={colSort} onSort={(k, d) => setColSort({ key: k, dir: d })} />
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {sortedStaff.map((s) => (
                <tr key={s.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {s.featured_image && <img src={s.featured_image} alt="" className="w-8 h-8 rounded-full object-cover" />}
                    <Link href={`/admin/staff/${s.id}`} className="font-medium hover:underline">{s.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{s.title || '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>{s.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/staff/${s.id}`} className="text-blue-600 hover:underline mr-3">Edit</Link>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline">Delete</button>
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
