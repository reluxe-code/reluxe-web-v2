// src/context/MemberContext.js
// Member identity context: auth session, profile data, loading state.
// Follows the same pattern as LocationContext.js.
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const Ctx = createContext({
  member: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: () => {},
  refreshProfile: () => {},
  // Drawer control
  drawerOpen: false,
  drawerTab: 'visits',
  openDrawer: () => {},
  closeDrawer: () => {},
  // Booking modal control
  bookingModalOpen: false,
  bookingLocationKey: null,
  openBookingModal: () => {},
  closeBookingModal: () => {},
})

export function MemberProvider({ children }) {
  const [member, setMember] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState('visits')
  const [rebookOpen, setRebookOpen] = useState(false)
  const [rebookData, setRebookData] = useState(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [bookingLocationKey, setBookingLocationKey] = useState(null)

  const fetchProfile = useCallback(async (accessToken) => {
    try {
      const res = await fetch('/api/member/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Profile fetch failed')
      const data = await res.json()
      setMember(data.member)
      setProfile({
        stats: data.stats,
        lastService: data.lastService,
        upcomingAppointment: data.upcomingAppointment,
        primaryProvider: data.primaryProvider,
        visits: data.visits || [],
        toxStatus: data.toxStatus || null,
        providers: data.providers || [],
        serviceCategories: data.serviceCategories || [],
        recommendations: data.recommendations || [],
        locationSplit: data.locationSplit || null,
        products: data.products || null,
      })
    } catch (e) {
      console.warn('[MemberContext] profile fetch error:', e.message)
      setMember(null)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        fetchProfile(session.access_token).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setMember(null)
        setProfile(null)
      }
      if (event === 'SIGNED_IN' && session?.access_token) {
        fetchProfile(session.access_token)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setMember(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      await fetchProfile(session.access_token)
    }
  }, [fetchProfile])

  const openDrawer = useCallback((tab = 'visits') => {
    setDrawerTab(tab)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  const openRebookModal = useCallback((data) => {
    setDrawerOpen(false) // close drawer so modal has full page
    setRebookData(data)
    setRebookOpen(true)
  }, [])

  const closeRebookModal = useCallback(() => {
    setRebookOpen(false)
    setRebookData(null)
  }, [])

  const openBookingModal = useCallback((locationKey) => {
    setDrawerOpen(false)
    setRebookOpen(false)
    setBookingLocationKey(locationKey)
    setBookingModalOpen(true)
  }, [])

  const closeBookingModal = useCallback(() => {
    setBookingModalOpen(false)
    setBookingLocationKey(null)
  }, [])

  const isAuthenticated = !!member

  return (
    <Ctx.Provider value={{ member, profile, isLoading, isAuthenticated, signOut, refreshProfile, drawerOpen, drawerTab, openDrawer, closeDrawer, rebookOpen, rebookData, openRebookModal, closeRebookModal, bookingModalOpen, bookingLocationKey, openBookingModal, closeBookingModal }}>
      {children}
    </Ctx.Provider>
  )
}

export const useMember = () => useContext(Ctx)
