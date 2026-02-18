// src/pages/admin/index.js
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const SECTIONS = [
  { key: 'blog_posts', label: 'Blog Posts', href: '/admin/blog', color: 'bg-blue-500' },
  { key: 'deals', label: 'Deals', href: '/admin/deals', color: 'bg-emerald-500' },
  { key: 'staff', label: 'Staff', href: '/admin/staff', color: 'bg-violet-500' },
  { key: 'testimonials', label: 'Testimonials', href: '/admin/testimonials', color: 'bg-amber-500' },
  { key: 'locations', label: 'Locations', href: '/admin/locations', color: 'bg-rose-500' },
]

export default function AdminDashboard() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    async function loadCounts() {
      const results = {}
      for (const s of SECTIONS) {
        const { count } = await supabase.from(s.key).select('*', { count: 'exact', head: true })
        results[s.key] = count || 0
      }
      setCounts(results)
    }
    loadCounts()
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            className="block bg-white rounded-xl border shadow-sm hover:shadow-md transition p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${s.color} flex items-center justify-center text-white font-bold text-lg`}>
                {counts[s.key] ?? '—'}
              </div>
              <div>
                <h2 className="font-semibold text-lg">{s.label}</h2>
                <p className="text-sm text-neutral-500">{counts[s.key] ?? '...'} total</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-6 bg-white rounded-xl border">
        <h2 className="font-semibold text-lg mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/blog?new=1" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition">
            New Blog Post
          </Link>
          <Link href="/admin/deals?new=1" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition">
            New Deal
          </Link>
          <Link href="/admin/staff?new=1" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition">
            New Staff Member
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}
