// src/components/booking/BookingFlowModal.js
// Full booking experience modal — login-aware, location-locked.
// Auth users see: their providers, rebook shortcuts, all services.
// Anon users see: service categories, treatment bundles, provider browse.
import { useReducer, useEffect, useCallback, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, gradients } from '@/components/preview/tokens'
import { useMember } from '@/context/MemberContext'
import DateStrip from './DateStrip'
import TimeGrid from './TimeGrid'
import ClientInfoForm from './ClientInfoForm'
import { SLUG_TITLES } from '@/data/treatmentBundles'
import { useBookingAnalytics } from '@/hooks/useBookingAnalytics'

const LOCATION_INFO = {
  westfield: { name: 'RELUXE Westfield', label: 'Westfield', address: '514 E State Road 32' },
  carmel: { name: 'RELUXE Carmel', label: 'Carmel', address: '10485 N Pennsylvania St' },
}

// ─── Helpers ───

function formatTime(startTime) {
  if (!startTime) return ''
  try { return new Date(startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
  catch { return startTime }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try { return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }
  catch { return dateStr }
}

function formatDuration(minutes) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function daysAgo(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  return `${diff}d ago`
}

function normalizeMoneyValue(v) {
  if (v == null) return null
  if (typeof v === 'number' && Number.isFinite(v)) return v >= 1000 ? v / 100 : v
  if (typeof v === 'string') {
    const n = Number(String(v).replace(/[^\d.-]/g, ''))
    if (!Number.isFinite(n)) return null
    return String(v).includes('.') ? n : (n >= 1000 ? n / 100 : n)
  }
  if (typeof v === 'object') {
    const raw = v.amount ?? v.value ?? v.cents ?? v.centAmount ?? null
    if (raw == null) return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    if (v.cents != null || v.centAmount != null) return n / 100
    return n >= 1000 ? n / 100 : n
  }
  return null
}

function formatCurrency(n) {
  if (n == null || !Number.isFinite(n)) return null
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function isConsultationLike(name, categoryName) {
  const text = `${name || ''} ${categoryName || ''}`.toLowerCase()
  return /consult/.test(text) || /not sure where to start|get started|reveal/.test(text)
}

function formatPriceRange(price, name, categoryName) {
  if (!price) return null
  const min = normalizeMoneyValue(price.min)
  const max = normalizeMoneyValue(price.max)
  const consultation = isConsultationLike(name, categoryName)
  if (min == null && max == null) return null
  if ((min ?? 0) === 0 && (max ?? 0) === 0) return consultation ? 'FREE' : 'Varies'
  if (min != null && max != null) {
    if (Math.abs(min - max) < 0.01) return formatCurrency(min)
    return `${formatCurrency(min)}–${formatCurrency(max)}`
  }
  if (min === 0) return consultation ? 'FREE' : 'Varies'
  if (min != null) return `${formatCurrency(min)}+`
  if (max === 0) return consultation ? 'FREE' : 'Varies'
  return `Up to ${formatCurrency(max)}`
}

// ─── Reducer ───

const initialState = {
  step: 'HOME',
  history: [],
  selectedProvider: null,
  selectedService: null,
  selectedCategory: null,
  selectedBundle: null,
  selectedOptions: [],
  selectedDate: null,
  selectedTime: null,
  cartData: null,
  anonTab: 'treat',
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, step: action.step, history: [...state.history, state.step], ...(action.payload || {}) }
    case 'BACK': {
      const prev = state.history.at(-1) || 'HOME'
      const clean = {}
      // Clean state when going back
      if (state.step === 'DATE_TIME') { clean.selectedDate = null; clean.selectedTime = null; clean.cartData = null; clean.error = null }
      if (state.step === 'CHECKOUT') { clean.cartData = null; clean.selectedTime = null }
      if (state.step === 'OPTIONS') { clean.selectedOptions = [] }
      if (state.step === 'CATEGORY_ITEMS') { clean.selectedCategory = null }
      if (state.step === 'BUNDLE_ITEMS') { clean.selectedBundle = null }
      if (state.step === 'PROVIDER_SERVICES') { clean.selectedProvider = null }
      return { ...state, ...clean, step: prev, history: state.history.slice(0, -1) }
    }
    case 'SELECT_PROVIDER':
      return { ...state, selectedProvider: action.provider }
    case 'SELECT_SERVICE':
      return { ...state, selectedService: action.service, selectedDate: null, selectedTime: null, cartData: null, error: null }
    case 'SELECT_OPTIONS':
      return { ...state, selectedOptions: action.options }
    case 'SELECT_DATE':
      return { ...state, selectedDate: action.date, selectedTime: null, cartData: null, error: null }
    case 'SELECT_TIME':
      return { ...state, selectedTime: action.time }
    case 'SET_CART':
      return { ...state, cartData: action.data }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'SET_ANON_TAB':
      return { ...state, anonTab: action.tab }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

// ─── Main Component ───

export default function BookingFlowModal({ isOpen, onClose, locationKey, fonts }) {
  const { member, profile, isAuthenticated, openDrawer, refreshProfile, openBookingModal } = useMember()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { step, history, selectedProvider, selectedService, selectedCategory, selectedBundle, selectedOptions, selectedDate, selectedTime, cartData, anonTab, error } = state

  // ── Booking analytics ──
  const { trackServiceSelect, trackProviderSelect, trackDateSelect, trackTimeSelect, trackContactProvided } = useBookingAnalytics({
    flowType: 'modal', step, isActive: isOpen, locationKey,
    selectedProvider, selectedService, selectedCategory, selectedBundle,
    selectedDate, selectedTime, memberId: member?.id || null,
  })

  // ── Data fetching state ──
  const [menuData, setMenuData] = useState(null)
  const [menuLoading, setMenuLoading] = useState(false)
  const [providerMenuData, setProviderMenuData] = useState(null)
  const [providerMenuLoading, setProviderMenuLoading] = useState(false)
  const [providers, setProviders] = useState(null)
  const [providersLoading, setProvidersLoading] = useState(false)
  const [serviceInfo, setServiceInfo] = useState(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [availableDates, setAvailableDates] = useState([])
  const [datesLoading, setDatesLoading] = useState(false)
  const [availableTimes, setAvailableTimes] = useState([])
  const [timesLoading, setTimesLoading] = useState(false)
  const [reserving, setReserving] = useState(false)

  const [featuredBundles, setFeaturedBundles] = useState(null)
  const [bundlesLoading, setBundlesLoading] = useState(false)

  const menuFetchedRef = useRef(null)
  const bundlesFetchedRef = useRef(false)
  const prevLocationRef = useRef(null)

  // ── Reset when modal opens/closes or location changes ──
  const [trackedOpen, setTrackedOpen] = useState(false)
  const [trackedLocation, setTrackedLocation] = useState(null)

  const resetLocationData = () => {
    dispatch({ type: 'RESET' })
    setMenuData(null)
    setProviderMenuData(null)
    setProviders(null)
    setServiceInfo(null)
    setAvailableDates([])
    setAvailableTimes([])
    menuFetchedRef.current = null
    prevLocationRef.current = null
    // Note: featuredBundles are global (not location-specific), so we keep them
  }

  const resetAll = () => {
    resetLocationData()
    setFeaturedBundles(null)
    bundlesFetchedRef.current = false
  }

  if (isOpen && !trackedOpen) {
    setTrackedOpen(true)
    setTrackedLocation(locationKey)
    resetAll()
  }
  if (isOpen && locationKey && locationKey !== trackedLocation) {
    setTrackedLocation(locationKey)
    resetLocationData() // keep bundles, just refetch location-specific data
  }
  if (!isOpen && trackedOpen) {
    setTrackedOpen(false)
    setTrackedLocation(null)
  }

  const otherLocation = locationKey === 'westfield' ? 'carmel' : 'westfield'
  const switchLocation = useCallback(() => {
    openBookingModal(otherLocation)
  }, [openBookingModal, otherLocation])

  // ── Fetch location service menu (for anon services tab) ──
  useEffect(() => {
    if (!isOpen || !locationKey) return
    if (menuFetchedRef.current === locationKey) return
    menuFetchedRef.current = locationKey
    setMenuLoading(true)
    fetch(`/api/blvd/services/menu?locationKey=${locationKey}`)
      .then(r => r.json())
      .then(data => { setMenuData(data); setMenuLoading(false) })
      .catch(() => { setMenuData({ categories: [] }); setMenuLoading(false) })
  }, [isOpen, locationKey])

  // ── Fetch featured bundles from site_config ──
  useEffect(() => {
    if (!isOpen || bundlesFetchedRef.current) return
    bundlesFetchedRef.current = true
    setBundlesLoading(true)
    fetch('/api/blvd/bundles?featured=true')
      .then(r => r.json())
      .then(data => { setFeaturedBundles(Array.isArray(data) ? data : []); setBundlesLoading(false) })
      .catch(() => { setFeaturedBundles([]); setBundlesLoading(false) })
  }, [isOpen])

  // ── Fetch providers at location (for anon providers tab) ──
  useEffect(() => {
    if (!isOpen || !locationKey || providers || providersLoading) return
    if (anonTab !== 'providers' && step !== 'HOME') return
    // Only fetch on demand (when providers tab is active) or when needed
  }, [isOpen, locationKey, anonTab, providers, providersLoading, step])

  const fetchProviders = useCallback(() => {
    if (providers || providersLoading) return
    setProvidersLoading(true)
    fetch(`/api/blvd/providers/at-location?locationKey=${locationKey}`)
      .then(r => r.json())
      .then(data => { setProviders(data); setProvidersLoading(false) })
      .catch(() => { setProviders([]); setProvidersLoading(false) })
  }, [locationKey, providers, providersLoading])

  // ── Fetch provider-specific menu ──
  const fetchProviderMenu = useCallback((provider) => {
    if (!provider?.boulevardProviderId || !locationKey) return
    setProviderMenuLoading(true)
    setProviderMenuData(null)
    fetch(`/api/blvd/services/menu?locationKey=${locationKey}&staffProviderId=${encodeURIComponent(provider.boulevardProviderId)}`)
      .then(r => r.json())
      .then(data => { setProviderMenuData(data); setProviderMenuLoading(false) })
      .catch(() => { setProviderMenuData({ categories: [] }); setProviderMenuLoading(false) })
  }, [locationKey])

  // ── Fetch service options when service is selected ──
  useEffect(() => {
    if (!selectedService?.id || !locationKey) return
    setOptionsLoading(true)
    setServiceInfo(null)
    const params = new URLSearchParams({ locationKey, serviceItemId: selectedService.id })
    if (selectedProvider?.boulevardProviderId) params.set('staffProviderId', selectedProvider.boulevardProviderId)
    fetch(`/api/blvd/services/options?${params}`)
      .then(r => r.json())
      .then(data => { setServiceInfo(data); setOptionsLoading(false) })
      .catch(() => { setServiceInfo(null); setOptionsLoading(false) })
  }, [selectedService?.id, locationKey, selectedProvider?.boulevardProviderId])

  // Auto-advance past OPTIONS if service has no option groups
  useEffect(() => {
    if (step !== 'OPTIONS' || optionsLoading || !serviceInfo) return
    const groups = (serviceInfo.optionGroups || []).filter(g => g.options?.length > 0)
    if (groups.length === 0) {
      dispatch({ type: 'NAVIGATE', step: 'DATE_TIME' })
    }
  }, [step, optionsLoading, serviceInfo])

  // ── Fetch available dates ──
  useEffect(() => {
    if (step !== 'DATE_TIME' || !selectedService?.id || !locationKey) return
    setDatesLoading(true)
    setAvailableDates([])
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 183 * 86400000).toISOString().split('T')[0]
    const params = new URLSearchParams({ locationKey, serviceItemId: selectedService.id, startDate: today, endDate })
    if (selectedProvider?.boulevardProviderId) params.set('staffProviderId', selectedProvider.boulevardProviderId)
    fetch(`/api/blvd/availability/dates?${params}`)
      .then(r => r.json())
      .then(dates => { setAvailableDates(Array.isArray(dates) ? dates : []); setDatesLoading(false) })
      .catch(() => { setAvailableDates([]); setDatesLoading(false) })
  }, [step, selectedService?.id, locationKey, selectedProvider?.boulevardProviderId])

  // Auto-select first date
  useEffect(() => {
    if (step === 'DATE_TIME' && !selectedDate && availableDates.length > 0) {
      dispatch({ type: 'SELECT_DATE', date: availableDates[0] })
    }
  }, [step, selectedDate, availableDates])

  // ── Fetch available times ──
  useEffect(() => {
    if (!selectedDate || !selectedService?.id || !locationKey) return
    setTimesLoading(true)
    setAvailableTimes([])
    const params = new URLSearchParams({ locationKey, serviceItemId: selectedService.id, date: selectedDate })
    if (selectedProvider?.boulevardProviderId) params.set('staffProviderId', selectedProvider.boulevardProviderId)
    fetch(`/api/blvd/availability/times?${params}`)
      .then(r => r.json())
      .then(times => { setAvailableTimes(Array.isArray(times) ? times : []); setTimesLoading(false) })
      .catch(() => { setAvailableTimes([]); setTimesLoading(false) })
  }, [selectedDate, selectedService?.id, locationKey, selectedProvider?.boulevardProviderId])

  // ── Reserve time slot (create cart) ──
  const handleSelectTime = useCallback(async (slot) => {
    dispatch({ type: 'SELECT_TIME', time: slot })
    dispatch({ type: 'SET_ERROR', error: null })
    setReserving(true)
    trackTimeSelect(slot)
    try {
      const body = {
        locationKey,
        serviceItemId: selectedService.id,
        staffProviderId: selectedProvider?.boulevardProviderId || undefined,
        date: selectedDate,
        startTime: slot.startTime,
        selectedOptionIds: selectedOptions.map(o => o.id),
      }
      const res = await fetch('/api/blvd/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reserve')
      dispatch({ type: 'SET_CART', data })
      dispatch({ type: 'NAVIGATE', step: 'CHECKOUT' })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message })
      dispatch({ type: 'SELECT_TIME', time: null })
    } finally {
      setReserving(false)
    }
  }, [locationKey, selectedService, selectedProvider, selectedDate, selectedOptions, trackTimeSelect])

  // ── Navigation helpers ──
  const goBack = useCallback(() => {
    if (history.length === 0) { onClose(); return }
    dispatch({ type: 'BACK' })
  }, [history, onClose])

  const handleExpired = useCallback(() => {
    dispatch({ type: 'SET_CART', data: null })
    dispatch({ type: 'SELECT_TIME', time: null })
    dispatch({ type: 'NAVIGATE', step: 'DATE_TIME' })
    dispatch({ type: 'SET_ERROR', error: 'Your reservation expired. Please select a new time.' })
  }, [])

  const handleBookingSuccess = useCallback(() => {
    dispatch({ type: 'NAVIGATE', step: 'BOOKED' })
    refreshProfile()
  }, [refreshProfile])

  // ── Rebook shortcuts (for auth users) ──
  const recentServices = useMemo(() => {
    if (!profile?.visits?.length) return []
    const seen = new Map()
    for (const visit of profile.visits) {
      for (const svc of visit.services || []) {
        if (!svc.slug || seen.has(svc.slug)) continue
        seen.set(svc.slug, {
          slug: svc.slug,
          name: svc.name,
          category: svc.category,
          provider: svc.provider,
          date: visit.date,
          location: visit.location,
        })
        if (seen.size >= 5) break
      }
      if (seen.size >= 5) break
    }
    return [...seen.values()]
  }, [profile?.visits])

  // ── Handle rebook shortcut ──
  const handleRebook = useCallback((svc) => {
    const provider = svc.provider
    // Resolve service item ID from provider's service map
    const serviceItemId = provider?.serviceMap?.[svc.slug]?.[locationKey]
      || (profile?.providers?.find(p => p.staffId === provider?.staffId)?.serviceMap?.[svc.slug]?.[locationKey])
    if (!serviceItemId) {
      // Fall back to categories view
      dispatch({ type: 'NAVIGATE', step: 'CATEGORIES' })
      return
    }
    dispatch({ type: 'SELECT_PROVIDER', provider: provider ? {
      name: provider.name,
      slug: provider.slug,
      staffId: provider.staffId,
      boulevardProviderId: provider.boulevardProviderId,
      image: provider.image,
    } : null })
    dispatch({ type: 'SELECT_SERVICE', service: { id: serviceItemId, name: svc.name, slug: svc.slug } })
    dispatch({ type: 'NAVIGATE', step: 'DATE_TIME' })
    trackServiceSelect({ name: svc.name, id: serviceItemId })
  }, [locationKey, profile?.providers, trackServiceSelect])

  // ── Handle provider selection ──
  const handleSelectProvider = useCallback((provider) => {
    dispatch({ type: 'SELECT_PROVIDER', provider })
    dispatch({ type: 'NAVIGATE', step: 'PROVIDER_SERVICES' })
    fetchProviderMenu(provider)
    trackProviderSelect(provider)
  }, [fetchProviderMenu, trackProviderSelect])

  // ── Handle category selection ──
  const handleSelectCategory = useCallback((cat) => {
    if (cat.items.length === 1) {
      const item = cat.items[0]
      dispatch({ type: 'SELECT_SERVICE', service: { id: item.id, name: item.name, categoryName: cat.name } })
      dispatch({ type: 'NAVIGATE', step: 'OPTIONS' })
    } else {
      dispatch({ type: 'NAVIGATE', step: 'CATEGORY_ITEMS', payload: { selectedCategory: cat } })
    }
  }, [])

  // ── Handle service item selection ──
  const handleSelectServiceItem = useCallback((item, categoryName) => {
    dispatch({ type: 'SELECT_SERVICE', service: { id: item.id, name: item.name, categoryName } })
    dispatch({ type: 'NAVIGATE', step: 'OPTIONS' })
    trackServiceSelect({ name: item.name, id: item.id, categoryName })
  }, [trackServiceSelect])

  // ── Handle bundle selection ──
  const handleSelectBundle = useCallback((bundle) => {
    dispatch({ type: 'NAVIGATE', step: 'BUNDLE_ITEMS', payload: { selectedBundle: bundle } })
  }, [])

  // ── Handle bundle item selection ──
  const handleSelectBundleItem = useCallback((item) => {
    // Try to resolve service item ID from the location menu
    const serviceItemId = item.catalogId || findMenuItemId(menuData, item.label || SLUG_TITLES[item.slug])
    if (serviceItemId) {
      const serviceName = item.label || SLUG_TITLES[item.slug] || item.slug
      dispatch({ type: 'SELECT_SERVICE', service: { id: serviceItemId, name: serviceName, slug: item.slug } })
      dispatch({ type: 'NAVIGATE', step: 'OPTIONS' })
      trackServiceSelect({ name: serviceName, id: serviceItemId })
    }
  }, [menuData, trackServiceSelect])

  // ── Handle option toggle ──
  const handleToggleOption = useCallback((group, option) => {
    dispatch({ type: 'SELECT_OPTIONS', options: toggleOption(selectedOptions, group, option) })
  }, [selectedOptions])

  // ── Close on Escape ──
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const locInfo = locationKey ? LOCATION_INFO[locationKey] : null
  const canGoBack = step !== 'HOME'
  const duration = serviceInfo?.duration?.staffDuration || serviceInfo?.duration?.max || serviceInfo?.duration?.min || null

  // Treatment bundles filtered by location availability
  const locationBundles = useMemo(() => {
    if (!menuData?.categories?.length || !featuredBundles?.length) return []
    const menuItemNames = new Set()
    for (const cat of menuData.categories) {
      for (const item of cat.items || []) {
        menuItemNames.add((item.name || '').toLowerCase())
      }
    }
    return featuredBundles
      .map(b => ({
        ...b,
        availableItems: (b.items || []).filter(item => {
          if (item.catalogId) return true // catalog-picked items are always available
          const label = (item.label || SLUG_TITLES[item.slug] || '').toLowerCase()
          return menuItemNames.has(label)
        }),
      }))
      .filter(b => b.availableItems.length > 0)
  }, [menuData, featuredBundles])

  // ─── Render ───

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal centering wrapper */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 61, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                width: 'min(560px, 94vw)', maxHeight: '90vh',
                background: colors.ink, borderRadius: '1.25rem',
                border: `1px solid ${colors.violet}20`,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden', pointerEvents: 'auto',
              }}
            >
              {/* ── Header ── */}
              <div style={{ flexShrink: 0 }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {canGoBack && (
                      <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(250,248,245,0.5)', display: 'flex' }}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    )}
                    <h3 style={{ fontFamily: fonts?.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white, margin: 0 }}>
                      {step === 'BOOKED' ? 'Confirmed' : 'Book Now'}
                    </h3>
                  </div>
                  <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(250,248,245,0.5)' }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>

                {/* Location bar */}
                {locInfo && (
                  <div style={{
                    margin: '0.625rem 1.25rem 0', padding: '0.5rem 0.75rem', borderRadius: 10,
                    background: `linear-gradient(135deg, ${colors.violet}08, ${colors.fuchsia}05)`,
                    border: `1px solid ${colors.violet}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <div>
                        <span style={{ fontFamily: fonts?.body, fontSize: '0.75rem', fontWeight: 600, color: colors.white }}>
                          {locInfo.name}
                        </span>
                        <span style={{ fontFamily: fonts?.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.4)', marginLeft: 6 }}>
                          {locInfo.address}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={switchLocation}
                      style={{
                        fontFamily: fonts?.body, fontSize: '0.625rem', fontWeight: 600,
                        color: colors.violet, background: 'none', border: 'none',
                        cursor: 'pointer', whiteSpace: 'nowrap', padding: '0.25rem 0',
                      }}
                    >
                      Switch to {LOCATION_INFO[otherLocation]?.label || otherLocation}
                    </button>
                  </div>
                )}

                <div style={{ borderBottom: '1px solid rgba(250,248,245,0.06)', marginTop: '0.625rem' }} />

                {/* Selection pills */}
                {step !== 'HOME' && step !== 'BOOKED' && (selectedService || selectedProvider) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {selectedProvider && (
                      <span style={pillStyle(fonts)}>
                        {selectedProvider.name}
                      </span>
                    )}
                    {selectedService && (
                      <span style={pillStyle(fonts)}>
                        {selectedService.name}{duration ? ` · ${formatDuration(duration)}` : ''}
                      </span>
                    )}
                    {selectedDate && step === 'CHECKOUT' && (
                      <span style={pillStyle(fonts)}>{formatDate(selectedDate)}</span>
                    )}
                    {selectedTime && step === 'CHECKOUT' && (
                      <span style={pillStyle(fonts)}>{formatTime(selectedTime.startTime)}</span>
                    )}
                  </div>
                )}
              </div>

              {/* ── Step Content ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
                <AnimatePresence mode="wait">
                  {/* ── HOME ── */}
                  {step === 'HOME' && (
                    <motion.div key="home" {...stepAnim}>
                      {isAuthenticated && profile ? (
                        <AuthHome
                          member={member}
                          profile={profile}
                          recentServices={recentServices}
                          fonts={fonts}
                          locationKey={locationKey}
                          onSelectProvider={handleSelectProvider}
                          onRebook={handleRebook}
                          onBrowseAll={() => dispatch({ type: 'NAVIGATE', step: 'CATEGORIES' })}
                          onOpenDrawer={() => { onClose(); openDrawer('visits') }}
                        />
                      ) : (
                        <AnonHome
                          tab={anonTab}
                          onTabChange={(tab) => {
                            dispatch({ type: 'SET_ANON_TAB', tab })
                            if (tab === 'providers' && !providers) fetchProviders()
                          }}
                          menuData={menuData}
                          menuLoading={menuLoading}
                          locationBundles={locationBundles}
                          providers={providers}
                          providersLoading={providersLoading}
                          fonts={fonts}
                          onSelectCategory={handleSelectCategory}
                          onSelectBundle={handleSelectBundle}
                          onSelectProvider={handleSelectProvider}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* ── PROVIDER_SERVICES ── */}
                  {step === 'PROVIDER_SERVICES' && (
                    <motion.div key="provider-svc" {...stepAnim}>
                      <p style={{ ...sectionLabel(fonts), marginBottom: 4 }}>
                        Book with {selectedProvider?.name?.split(/\s/)[0]}
                      </p>
                      {providerMenuLoading ? <LoadingSkeleton count={4} /> : (
                        <CategoryList
                          categories={providerMenuData?.categories || []}
                          fonts={fonts}
                          onSelectCategory={handleSelectCategory}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* ── CATEGORIES ── */}
                  {step === 'CATEGORIES' && (
                    <motion.div key="categories" {...stepAnim}>
                      <p style={sectionLabel(fonts)}>All Services</p>
                      {menuLoading ? <LoadingSkeleton count={5} /> : (
                        <CategoryList
                          categories={menuData?.categories || []}
                          fonts={fonts}
                          onSelectCategory={handleSelectCategory}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* ── CATEGORY_ITEMS ── */}
                  {step === 'CATEGORY_ITEMS' && selectedCategory && (
                    <motion.div key="cat-items" {...stepAnim}>
                      <p style={sectionLabel(fonts)}>{selectedCategory.name}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedCategory.items.map(item => (
                          <ServiceItemCard
                            key={item.id}
                            item={item}
                            fonts={fonts}
                            categoryName={selectedCategory.name}
                            onClick={() => handleSelectServiceItem(item, selectedCategory.name)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ── BUNDLE_ITEMS ── */}
                  {step === 'BUNDLE_ITEMS' && selectedBundle && (
                    <motion.div key="bundle-items" {...stepAnim}>
                      <p style={{ ...sectionLabel(fonts), marginBottom: 2 }}>{selectedBundle.title}</p>
                      {selectedBundle.description && (
                        <p style={{ fontFamily: fonts?.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', marginBottom: 12 }}>
                          {selectedBundle.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(selectedBundle.availableItems || selectedBundle.items || []).map((item, i) => {
                          const itemName = item.label || SLUG_TITLES[item.slug] || item.slug
                          const menuItem = findMenuItem(menuData, itemName)
                          const priceLabel = menuItem ? formatPriceRange(menuItem.price, menuItem.name) : null
                          return (
                            <button
                              key={item.catalogId || item.slug || i}
                              onClick={() => handleSelectBundleItem(item)}
                              style={cardButton(fonts)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <span style={{ fontWeight: 600, color: colors.white }}>{itemName}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                  {priceLabel && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: priceLabel === 'FREE' ? '#22c55e' : colors.violet, whiteSpace: 'nowrap' }}>
                                      {priceLabel}
                                    </span>
                                  )}
                                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="rgba(250,248,245,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 5 13 10 8 15" /></svg>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ── OPTIONS ── */}
                  {step === 'OPTIONS' && (
                    <motion.div key="options" {...stepAnim}>
                      {optionsLoading ? <LoadingSkeleton count={3} /> : (
                        <OptionsStep
                          optionGroups={(serviceInfo?.optionGroups || []).filter(g => g.options?.length > 0)}
                          selectedOptions={selectedOptions}
                          onToggleOption={handleToggleOption}
                          onContinue={() => dispatch({ type: 'NAVIGATE', step: 'DATE_TIME' })}
                          onSkip={() => {
                            dispatch({ type: 'SELECT_OPTIONS', options: [] })
                            dispatch({ type: 'NAVIGATE', step: 'DATE_TIME' })
                          }}
                          fonts={fonts}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* ── DATE_TIME ── */}
                  {step === 'DATE_TIME' && (
                    <motion.div key="date-time" {...stepAnim}>
                      <p style={sectionLabel(fonts)}>Pick a Date</p>
                      {datesLoading ? (
                        <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
                          {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} style={{ width: 64, height: 72, borderRadius: 12, background: 'rgba(250,248,245,0.04)', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                          ))}
                        </div>
                      ) : availableDates.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                          <p style={{ fontFamily: fonts?.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)' }}>No availability found.</p>
                          <button onClick={goBack} style={{ ...ctaButton(fonts), marginTop: 16, width: 'auto', padding: '0.625rem 1.5rem' }}>
                            Try another service
                          </button>
                        </div>
                      ) : (
                        <DateStrip
                          availableDates={availableDates}
                          selectedDate={selectedDate}
                          onSelect={(d) => { dispatch({ type: 'SELECT_DATE', date: d }); trackDateSelect(d) }}
                          fonts={fonts}
                        />
                      )}

                      {/* Time slots */}
                      <AnimatePresence mode="wait">
                        {selectedDate && (
                          <motion.div
                            key={`times-${selectedDate}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ paddingTop: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                                <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white }}>
                                  {formatDate(selectedDate)} — Pick a time
                                </p>
                                {duration && (
                                  <span style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>
                                    {formatDuration(duration)}
                                  </span>
                                )}
                              </div>
                              {error && (
                                <div style={{ borderRadius: 12, padding: '0.75rem', marginBottom: 12, background: `${colors.rose}10`, border: `1px solid ${colors.rose}25` }}>
                                  <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: colors.rose }}>{error}</p>
                                </div>
                              )}
                              <TimeGrid
                                times={availableTimes}
                                selectedTimeId={selectedTime?.id}
                                onSelect={handleSelectTime}
                                loading={timesLoading || reserving}
                                fonts={fonts}
                                duration={duration}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* ── CHECKOUT ── */}
                  {step === 'CHECKOUT' && cartData && (
                    <motion.div key="checkout" {...stepAnim}>
                      <ClientInfoForm
                        cartId={cartData.cartId}
                        expiresAt={cartData.expiresAt}
                        summary={cartData.summary || {
                          serviceName: selectedService?.name,
                          staffName: selectedProvider?.name,
                          location: locationKey,
                          date: selectedDate,
                          startTime: selectedTime?.startTime,
                          duration,
                        }}
                        fonts={fonts}
                        onSuccess={handleBookingSuccess}
                        onExpired={handleExpired}
                        onBack={() => {
                          dispatch({ type: 'SET_CART', data: null })
                          dispatch({ type: 'SELECT_TIME', time: null })
                          dispatch({ type: 'BACK' })
                        }}
                      />
                    </motion.div>
                  )}

                  {/* ── BOOKED ── */}
                  {step === 'BOOKED' && (
                    <motion.div key="booked" {...stepAnim}>
                      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#22c55e20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <h3 style={{ fontFamily: fonts?.display, fontSize: '1.375rem', fontWeight: 700, color: colors.white, marginBottom: 8 }}>You&apos;re booked!</h3>
                        <p style={{ fontFamily: fonts?.body, fontSize: '0.9375rem', color: 'rgba(250,248,245,0.6)', lineHeight: 1.5 }}>
                          {selectedService?.name}{selectedProvider?.name ? ` w/ ${selectedProvider.name}` : ''}
                        </p>
                        {selectedDate && (
                          <p style={{ fontFamily: fonts?.body, fontSize: '0.9375rem', color: colors.white, fontWeight: 600, marginTop: 4 }}>
                            {formatDate(selectedDate)}{selectedTime ? ` at ${formatTime(selectedTime.startTime)}` : ''}
                          </p>
                        )}
                        <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', marginTop: 4 }}>
                          {locInfo?.label || locationKey}
                        </p>
                        <button onClick={onClose} style={{ ...ctaButton(fonts), marginTop: 24, width: 'auto', padding: '0.875rem 2rem' }}>
                          Done
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Inline Sub-Components ───

function AuthHome({ member, profile, recentServices, fonts, locationKey, onSelectProvider, onRebook, onBrowseAll, onOpenDrawer }) {
  const firstName = member?.first_name || 'there'
  const providerList = (profile?.providers || []).slice(0, 3)

  return (
    <div>
      <p style={{ fontFamily: fonts?.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white, marginBottom: 16 }}>
        Hey, {firstName}
      </p>

      {/* Your Providers */}
      {providerList.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={sectionLabel(fonts)}>Your Providers</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {providerList.map(p => (
              <button
                key={p.staffId}
                onClick={() => onSelectProvider({
                  name: p.name,
                  slug: p.slug,
                  staffId: p.staffId,
                  boulevardProviderId: p.boulevardProviderId,
                  boulevardServiceMap: p.serviceMap,
                  image: p.image,
                })}
                style={rowButton(fonts)}
              >
                {p.image ? (
                  <img src={p.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>{(p.name || '?')[0]}</span>
                  </div>
                )}
                <span style={{ fontWeight: 600, color: colors.white, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: '0.6875rem', color: 'rgba(250,248,245,0.35)', flexShrink: 0 }}>
                  {p.visit_count} visit{p.visit_count !== 1 ? 's' : ''}
                </span>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="rgba(250,248,245,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="8 5 13 10 8 15" /></svg>
              </button>
            ))}
            {/* Open to any provider */}
            <button onClick={() => onBrowseAll()} style={rowButton(fonts)}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(250,248,245,0.06)', border: '1px dashed rgba(250,248,245,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="rgba(250,248,245,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6v8M6 10h8" /></svg>
              </div>
              <span style={{ fontWeight: 600, color: 'rgba(250,248,245,0.5)', flex: 1 }}>Open to any provider</span>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="rgba(250,248,245,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="8 5 13 10 8 15" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Rebook a Service */}
      {recentServices.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={sectionLabel(fonts)}>Rebook a Service</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentServices.map(svc => (
              <button
                key={svc.slug}
                onClick={() => onRebook(svc)}
                style={cardButton(fonts)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontWeight: 600, color: colors.white, display: 'block' }}>{svc.name}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)' }}>
                      {svc.provider?.name ? `w/ ${svc.provider.name} · ` : ''}{daysAgo(svc.date)}
                    </span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="rgba(250,248,245,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 5 13 10 8 15" /></svg>
                </div>
              </button>
            ))}
            {profile?.visits?.length > 5 && (
              <button
                onClick={onOpenDrawer}
                style={{ fontFamily: fonts?.body, fontSize: '0.75rem', fontWeight: 600, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0', textAlign: 'center' }}
              >
                View all history →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Browse All */}
      <button onClick={onBrowseAll} style={{ ...ctaButton(fonts), width: '100%' }}>
        Browse All Services
      </button>
    </div>
  )
}

function AnonHome({ tab, onTabChange, menuData, menuLoading, locationBundles, providers, providersLoading, fonts, onSelectCategory, onSelectBundle, onSelectProvider }) {
  const [showAllBundles, setShowAllBundles] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  const VISIBLE_BUNDLES = 4

  return (
    <div>
      {/* Pill toggle — 2 tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(250,248,245,0.04)', borderRadius: 999, padding: 3 }}>
        {[
          { key: 'treat', label: 'What to Treat' },
          { key: 'providers', label: 'Providers' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            style={{
              flex: 1, padding: '0.5rem 0.75rem', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: fonts?.body, fontSize: '0.75rem', fontWeight: 600,
              background: tab === t.key ? colors.violet : 'transparent',
              color: tab === t.key ? '#fff' : 'rgba(250,248,245,0.5)',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* What to Treat tab — bundles + all services */}
      {tab === 'treat' && (
        <div>
          {/* Treatment bundles — 2x2 grid */}
          {locationBundles.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={sectionLabel(fonts)}>Where to Start</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(showAllBundles ? locationBundles : locationBundles.slice(0, VISIBLE_BUNDLES)).map(bundle => (
                  <button
                    key={bundle.id}
                    onClick={() => onSelectBundle(bundle)}
                    style={{
                      ...cardButton(fonts),
                      flexDirection: 'column', alignItems: 'flex-start',
                      padding: '0.875rem 0.875rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: colors.white, display: 'block', fontSize: '0.8125rem', lineHeight: 1.3 }}>{bundle.title}</span>
                    {bundle.description && (
                      <span style={{ fontSize: '0.625rem', color: 'rgba(250,248,245,0.4)', display: 'block', marginTop: 4, lineHeight: 1.35 }}>
                        {bundle.description}
                      </span>
                    )}
                    <span style={{ fontSize: '0.5625rem', color: colors.violet, marginTop: 6 }}>
                      {(bundle.availableItems || bundle.items).length} option{(bundle.availableItems || bundle.items).length !== 1 ? 's' : ''} →
                    </span>
                  </button>
                ))}
              </div>
              {locationBundles.length > VISIBLE_BUNDLES && !showAllBundles && (
                <button
                  onClick={() => setShowAllBundles(true)}
                  style={{ fontFamily: fonts?.body, fontSize: '0.75rem', fontWeight: 600, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0', textAlign: 'center', width: '100%' }}
                >
                  See {locationBundles.length - VISIBLE_BUNDLES} more →
                </button>
              )}
            </div>
          )}

          {/* All Services — collapsible */}
          <div>
            <button
              onClick={() => setShowCategories(!showCategories)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                padding: '0.875rem 1.125rem', borderRadius: 14, cursor: 'pointer',
                fontFamily: fonts?.body, fontSize: '0.8125rem',
                background: `linear-gradient(135deg, ${colors.violet}10, ${colors.fuchsia}08)`,
                border: `1px solid ${colors.violet}30`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: gradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, color: colors.white, display: 'block' }}>Browse All Services</span>
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)', display: 'block', marginTop: 2 }}>
                    Or choose your own from our full menu
                  </span>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={colors.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showCategories ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
              >
                <polyline points="5 8 10 13 15 8" />
              </svg>
            </button>
            {showCategories && (
              <div style={{ marginTop: 8 }}>
                {menuLoading ? <LoadingSkeleton count={5} /> : (
                  <CategoryList
                    categories={menuData?.categories || []}
                    fonts={fonts}
                    onSelectCategory={onSelectCategory}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Providers tab */}
      {tab === 'providers' && (
        providersLoading ? <LoadingSkeleton count={4} /> : (
          <ProviderList providers={providers || []} fonts={fonts} onSelectProvider={onSelectProvider} />
        )
      )}
    </div>
  )
}

function CategoryList({ categories, fonts, onSelectCategory }) {
  if (!categories?.length) {
    return (
      <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', textAlign: 'center', padding: '2rem 0' }}>
        No services found.
      </p>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {categories.map(cat => (
        <button
          key={cat.id || cat.name}
          onClick={() => onSelectCategory(cat)}
          style={cardButton(fonts)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontWeight: 600, color: colors.white }}>{cat.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {cat.items?.length === 1 && (() => {
                const label = formatPriceRange(cat.items[0].price, cat.items[0].name, cat.name)
                return label ? (
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: label === 'FREE' ? '#22c55e' : colors.violet }}>
                    {label}
                  </span>
                ) : null
              })()}
              {cat.items?.length > 1 && (
                <span style={{ fontSize: '0.625rem', color: 'rgba(250,248,245,0.35)' }}>
                  {cat.items.length} options
                </span>
              )}
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="rgba(250,248,245,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 5 13 10 8 15" /></svg>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function ServiceItemCard({ item, fonts, onClick, categoryName }) {
  const priceLabel = formatPriceRange(item.price, item.name, categoryName)
  return (
    <button onClick={onClick} style={cardButton(fonts)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 600, color: colors.white, display: 'block' }}>{item.name}</span>
          {item.description && (
            <span style={{ fontSize: '0.6875rem', color: 'rgba(250,248,245,0.35)', display: 'block', marginTop: 2, lineHeight: 1.3 }}>
              {item.description.length > 80 ? item.description.slice(0, 80) + '...' : item.description}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {priceLabel && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: priceLabel === 'FREE' ? '#22c55e' : colors.violet, whiteSpace: 'nowrap' }}>
              {priceLabel}
            </span>
          )}
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="rgba(250,248,245,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 5 13 10 8 15" /></svg>
        </div>
      </div>
    </button>
  )
}

function ProviderList({ providers, fonts, onSelectProvider }) {
  if (!providers?.length) {
    return (
      <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', textAlign: 'center', padding: '2rem 0' }}>
        No providers found at this location.
      </p>
    )
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {providers.map(p => (
        <button
          key={p.staffId || p.slug}
          onClick={() => onSelectProvider({
            name: p.name,
            slug: p.slug,
            staffId: p.staffId,
            boulevardProviderId: p.boulevardProviderId,
            boulevardServiceMap: p.boulevardServiceMap,
            image: p.image,
          })}
          style={{
            ...cardButton(fonts),
            flexDirection: 'column', alignItems: 'center',
            padding: '1rem 0.75rem', textAlign: 'center',
          }}
        >
          {p.image ? (
            <img src={p.image} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{(p.name || '?')[0]}</span>
            </div>
          )}
          <span style={{ fontWeight: 600, color: colors.white, display: 'block', fontSize: '0.8125rem' }}>{p.name}</span>
          {(p.title || p.role) && (
            <span style={{ fontSize: '0.625rem', color: 'rgba(250,248,245,0.4)', marginTop: 2 }}>{p.title || p.role}</span>
          )}
        </button>
      ))}
    </div>
  )
}

function OptionsStep({ optionGroups, selectedOptions, onToggleOption, onContinue, onSkip, fonts }) {
  if (!optionGroups?.length) return null

  const hasRequired = optionGroups.some(g => (g.minLimit || 0) >= 1)
  const allRequiredMet = optionGroups.every(g => {
    const min = g.minLimit || 0
    if (min < 1) return true
    const count = (g.options || []).filter(o => selectedOptions.some(s => s.id === o.id)).length
    return count >= min
  })

  return (
    <div>
      {optionGroups.map(group => {
        const isRadio = group.maxLimit === 1
        const isRequired = (group.minLimit || 0) >= 1
        return (
          <div key={group.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white, margin: 0 }}>
                {group.name}
              </p>
              {group.maxLimit && (
                <span style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: isRequired ? colors.violet : 'rgba(250,248,245,0.4)' }}>
                  {isRadio ? 'choose 1' : `up to ${group.maxLimit}`}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.options.map(opt => {
                const isSelected = selectedOptions.some(o => o.id === opt.id)
                return (
                  <button
                    key={opt.id}
                    onClick={() => onToggleOption(group, opt)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '0.75rem', borderRadius: 12, cursor: 'pointer',
                      border: isSelected ? `1.5px solid ${colors.violet}` : '1px solid rgba(250,248,245,0.08)',
                      background: isSelected ? `${colors.violet}10` : 'rgba(250,248,245,0.03)',
                      fontFamily: fonts?.body, fontSize: '0.8125rem', textAlign: 'left', width: '100%',
                    }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: isRadio ? '50%' : 4, flexShrink: 0, marginTop: 1,
                      border: isSelected ? `2px solid ${colors.violet}` : '1.5px solid rgba(250,248,245,0.2)',
                      background: isSelected ? colors.violet : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: colors.white }}>{opt.name}</span>
                      {opt.description && <p style={{ fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', margin: '2px 0 0', lineHeight: 1.35 }}>{opt.description}</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {!hasRequired && (
          <button onClick={onSkip} style={{
            fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, padding: '0.75rem 1.25rem',
            borderRadius: 999, color: 'rgba(250,248,245,0.6)', background: 'rgba(250,248,245,0.06)',
            border: '1px solid rgba(250,248,245,0.1)', cursor: 'pointer',
          }}>
            Skip
          </button>
        )}
        <button
          onClick={onContinue}
          disabled={hasRequired && !allRequiredMet}
          style={{
            ...ctaButton(fonts), flex: 1,
            opacity: (hasRequired && !allRequiredMet) ? 0.5 : 1,
            cursor: (hasRequired && !allRequiredMet) ? 'not-allowed' : 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: 52, borderRadius: 12, background: 'rgba(250,248,245,0.04)', animation: 'pulse 1.5s infinite' }} />
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
    </div>
  )
}

// ─── Shared Styles ───

const stepAnim = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
  transition: { duration: 0.2 },
}

function pillStyle(fonts) {
  return {
    fontFamily: fonts?.body, fontSize: '0.625rem', fontWeight: 600,
    color: colors.violet, background: `${colors.violet}10`,
    border: `1px solid ${colors.violet}25`, borderRadius: 999,
    padding: '0.25rem 0.625rem', display: 'inline-block',
  }
}

function sectionLabel(fonts) {
  return {
    fontFamily: fonts?.body, fontSize: '0.6875rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'rgba(250,248,245,0.35)', marginBottom: 10, margin: 0,
    marginBottom: 10,
  }
}

function cardButton(fonts) {
  return {
    display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left',
    padding: '0.875rem 1rem', borderRadius: 12, cursor: 'pointer',
    fontFamily: fonts?.body, fontSize: '0.8125rem',
    background: 'rgba(250,248,245,0.03)',
    border: '1px solid rgba(250,248,245,0.08)',
    transition: 'all 0.15s',
  }
}

function rowButton(fonts) {
  return {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
    padding: '0.5rem 0.625rem', borderRadius: 8, cursor: 'pointer',
    fontFamily: fonts?.body, fontSize: '0.8125rem',
    background: 'transparent', border: 'none',
    transition: 'background 0.15s',
  }
}

function ctaButton(fonts) {
  return {
    fontFamily: fonts?.body, fontSize: '0.875rem', fontWeight: 600,
    padding: '0.75rem 2rem', borderRadius: 999,
    background: gradients.primary, color: '#fff',
    border: 'none', cursor: 'pointer',
  }
}

// ─── Utilities ───

function toggleOption(prev, group, option) {
  const isRadio = group.maxLimit === 1
  const isSelected = prev.some(o => o.id === option.id)
  if (isRadio) {
    const withoutGroup = prev.filter(o => !group.options.some(go => go.id === o.id))
    return isSelected ? withoutGroup : [...withoutGroup, option]
  }
  if (isSelected) return prev.filter(o => o.id !== option.id)
  if (group.maxLimit) {
    const count = prev.filter(o => group.options.some(go => go.id === o.id)).length
    if (count >= group.maxLimit) return prev
  }
  return [...prev, option]
}

function findMenuItemId(menuData, name) {
  if (!menuData?.categories || !name) return null
  const lower = name.toLowerCase()
  for (const cat of menuData.categories) {
    for (const item of cat.items || []) {
      if ((item.name || '').toLowerCase() === lower) return item.id
    }
  }
  return null
}

function findMenuItem(menuData, name) {
  if (!menuData?.categories || !name) return null
  const lower = name.toLowerCase()
  for (const cat of menuData.categories) {
    for (const item of cat.items || []) {
      if ((item.name || '').toLowerCase() === lower) return item
    }
  }
  return null
}
