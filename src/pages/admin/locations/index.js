// src/pages/admin/locations/index.js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function AdminLocationsList() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLocations() }, [])

  async function loadLocations() {
    setLoading(true)
    const { data } = await supabase.from('locations').select('id, slug, name, city, state, phone').order('name')
    setLocations(data || [])
    setLoading(false)
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Locations</h1>
      </div>
      {loading ? <p className="text-neutral-500">Loading...</p> : locations.length === 0 ? <p className="text-neutral-500">No locations yet.</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">City</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3"><Link href={`/admin/locations/${loc.slug}`} className="font-medium hover:underline">{loc.name}</Link></td>
                  <td className="px-4 py-3 text-neutral-500">{loc.city}, {loc.state}</td>
                  <td className="px-4 py-3 text-neutral-500">{loc.phone || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/locations/${loc.slug}`} className="text-blue-600 hover:underline mr-3">Edit</Link>
                    <Link href={`/locations/${loc.slug}`} target="_blank" className="text-neutral-500 hover:underline">View</Link>
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
