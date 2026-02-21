// src/components/admin/AdminLayout.js
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  {
    label: 'Intelligence',
    href: '/admin/intelligence',
    children: [
      { href: '/admin/intelligence', label: 'Overview' },
      { href: '/admin/intelligence/tox', label: 'Tox Engine' },
      { href: '/admin/intelligence/providers', label: 'Providers' },
      { href: '/admin/intelligence/patients', label: 'Patients' },
      { href: '/admin/intelligence/rebooking', label: 'Rebooking' },
      { href: '/admin/intelligence/actions', label: 'Actions' },
      { href: '/admin/intelligence/products', label: 'Products' },
      { href: '/admin/intelligence/daily-snapshot', label: 'Daily Snapshot' },
      { href: '/admin/intelligence/form-submissions', label: 'Form Submissions' },
      { href: '/admin/intelligence/booking-funnel', label: 'Booking Funnel' },
    ],
  },
  { href: '/admin/blog', label: 'Blog Posts' },
  { href: '/admin/deals', label: 'Deals' },
  { href: '/admin/staff', label: 'Staff' },
  { href: '/admin/treatment-bundles', label: 'Treatment Bundles' },
  { href: '/admin/provider-routing', label: 'Provider Routing' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/locations', label: 'Locations' },
  { href: '/admin/boulevard-sync', label: 'Boulevard Sync' },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/admin/login')
      } else {
        setUser(session.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/admin/login')
      else setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-neutral-700">
          <Link href="/admin" className="text-xl font-bold">
            RELUXE Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.children) {
              const isExpanded = router.pathname.startsWith(item.href)
              return (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-lg text-sm transition ${
                      isExpanded
                        ? 'bg-neutral-700 text-white font-medium'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                  {isExpanded && (
                    <div className="ml-3 mt-1 space-y-0.5 border-l border-neutral-700 pl-3">
                      {item.children.map((child) => {
                        const childActive = router.pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-2 py-1.5 rounded text-xs transition ${
                              childActive
                                ? 'text-white font-medium'
                                : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const active = router.pathname === item.href || (item.href !== '/admin' && router.pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? 'bg-neutral-700 text-white font-medium'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-neutral-700">
          <p className="text-xs text-neutral-500 mb-2 truncate">{user.email}</p>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-400 hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
