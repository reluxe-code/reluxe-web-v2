// src/components/admin/AdminLayout.js
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { adminFetch } from '@/lib/adminFetch'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  {
    label: 'Intelligence',
    href: '/admin/intelligence',
    children: [
      { href: '/admin/intelligence', label: 'Overview' },
      { href: '/admin/intelligence/daily-snapshot', label: 'Daily Snapshot' },
      { href: '/admin/intelligence/monthly-snapshot', label: 'Monthly Snapshot' },
      { href: '/admin/intelligence/tox', label: 'Tox Engine' },
      { href: '/admin/intelligence/providers', label: 'Providers' },
      { href: '/admin/intelligence/provider-scorecard', label: 'Provider Scorecard' },
      { href: '/admin/intelligence/patients', label: 'Patients' },
      { href: '/admin/intelligence/customers', label: 'Customers' },
      { href: '/admin/intelligence/bookings', label: 'Bookings' },
      { href: '/admin/intelligence/booking-funnel', label: 'Booking Funnel' },
      { href: '/admin/intelligence/rebooking', label: 'Rebooking' },
      { href: '/admin/intelligence/products', label: 'Products' },
      { href: '/admin/intelligence/core4', label: 'Core 4 Regimen' },
      { href: '/admin/intelligence/replenishment', label: 'Replenishment Radar' },
      { href: '/admin/intelligence/sales-dna', label: 'Sales DNA' },
      { href: '/admin/intelligence/sku-mapping', label: 'SKU Mapping' },
      { href: '/admin/intelligence/product-portfolio', label: 'Product Portfolio' },
      { href: '/admin/intelligence/referrals', label: 'Referrals' },
      { href: '/admin/intelligence/leads', label: 'Leads' },
      { href: '/admin/intelligence/content-engagement', label: 'Content Engagement' },
      { href: '/admin/intelligence/experiments', label: 'Experiments' },
    ],
  },
  {
    label: 'Marketing',
    children: [
      { href: '/admin/intelligence/concierge', label: 'Daily Concierge' },
      { href: '/admin/conversations', label: 'Conversations', notify: 'conversations' },
      { href: '/admin/intelligence/social-engine', label: 'Social Engine' },
    ],
  },
  {
    label: 'Content',
    children: [
      { href: '/admin/services', label: 'Services' },
      { href: '/admin/services/categories', label: 'Service Categories' },
      { href: '/admin/blog', label: 'Blog Posts' },
      { href: '/admin/stories', label: 'Patient Stories' },
      { href: '/admin/deals', label: 'Deals' },
      { href: '/admin/treatment-bundles', label: 'Treatment Bundles' },
      { href: '/admin/testimonials', label: 'Testimonials' },
      { href: '/admin/locations', label: 'Locations' },
    ],
  },
  {
    label: 'Programs',
    children: [
      { href: '/admin/memberships', label: 'Memberships & Credits' },
      { href: '/admin/velocity', label: 'Velocity Rewards' },
      { href: '/admin/gift-cards', label: 'Gift Cards' },
      { href: '/admin/packages', label: 'Packages' },
    ],
  },
  {
    label: 'Operations',
    children: [
      { href: '/admin/staff', label: 'Staff' },
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/provider-routing', label: 'Provider Routing' },
      { href: '/admin/boulevard-sync', label: 'Boulevard Sync' },
      { href: '/admin/intelligence/form-submissions', label: 'Form Submissions' },
      { href: '/admin/intelligence/actions', label: 'Actions' },
      { href: '/admin/intelligence/audit', label: 'Site Audit' },
      { href: '/admin/settings', label: 'Settings' },
    ],
  },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState({ conversations: { unread_threads: 0, unread_messages: 0 }, total_badge: 0 })

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/notifications')
      const data = await res.json()
      if (data.ok) setNotifications(data)
    } catch (_) { /* silent */ }
  }, [])

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/admin/login')
        setLoading(false)
        return
      }

      // Verify admin email whitelist server-side
      try {
        const res = await adminFetch('/api/admin/auth/check')
        if (!res.ok) {
          await supabase.auth.signOut()
          router.replace('/admin/login')
          setLoading(false)
          return
        }
      } catch (_) {
        router.replace('/admin/login')
        setLoading(false)
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/admin/login')
      else setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Poll notifications every 30 seconds
  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user, fetchNotifications])

  // Idle session timeout — auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!user) return
    const IDLE_TIMEOUT = 30 * 60 * 1000
    let timer = setTimeout(doLogout, IDLE_TIMEOUT)

    function resetTimer() {
      clearTimeout(timer)
      timer = setTimeout(doLogout, IDLE_TIMEOUT)
    }

    async function doLogout() {
      await supabase.auth.signOut()
      router.replace('/admin/login')
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [user, router])

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

  const unreadMessages = notifications.conversations.unread_messages

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-xl font-bold">
              RELUXE Admin
            </Link>
            {unreadMessages > 0 && (
              <Link
                href="/admin/conversations"
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                title={`${unreadMessages} unread message${unreadMessages !== 1 ? 's' : ''}`}
              >
                <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              </Link>
            )}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            if (item.children) {
              const childPaths = item.children.map((c) => c.href)
              const isExpanded = (item.href && router.pathname.startsWith(item.href)) || childPaths.some((p) => router.pathname === p || router.pathname.startsWith(p + '/'))
              const sectionHref = item.href || item.children[0]?.href
              const HeaderTag = item.href ? Link : 'button'
              const headerProps = item.href ? { href: item.href } : { type: 'button' }

              // Check if any child in this section has notifications
              const sectionHasNotify = item.children.some((c) => c.notify && unreadMessages > 0)

              return (
                <div key={item.label}>
                  <HeaderTag
                    {...headerProps}
                    onClick={!item.href ? () => router.push(sectionHref) : undefined}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      isExpanded
                        ? 'bg-neutral-700 text-white font-medium'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      {item.label}
                      {!isExpanded && sectionHasNotify && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </span>
                  </HeaderTag>
                  {isExpanded && (
                    <div className="ml-3 mt-1 space-y-0.5 border-l border-neutral-700 pl-3">
                      {item.children.map((child) => {
                        const childActive = router.pathname === child.href
                        const childBadge = child.notify === 'conversations' ? unreadMessages : 0
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition ${
                              childActive
                                ? 'text-white font-medium'
                                : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            <span>{child.label}</span>
                            {childBadge > 0 && (
                              <span className="bg-blue-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 flex-shrink-0">
                                {childBadge > 99 ? '99+' : childBadge}
                              </span>
                            )}
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
