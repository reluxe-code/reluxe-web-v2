// src/components/beta/RebookModal.js
// Quick rebook modal: quick-pick → date → time → confirm → booked.
// Reuses DateStrip and TimeGrid from existing booking flow.
// Shows smart date suggestions based on configurable service intervals.
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, gradients } from '@/components/preview/tokens'
import { useMember } from '@/context/MemberContext'
import { supabase } from '@/lib/supabase'
import { REBOOK_INTERVALS, formatInterval } from '@/data/rebook-intervals'
import DateStrip from '@/components/booking/DateStrip'
import TimeGrid from '@/components/booking/TimeGrid'

const LOCATION_LABELS = { westfield: 'Westfield', carmel: 'Carmel' }

function formatDateLong(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  // Handle both full ISO timestamps and bare HH:MM:SS strings
  const d = new Date(timeStr.includes('T') ? timeStr : `2026-01-01T${timeStr}`)
  if (isNaN(d.getTime())) return timeStr
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function RebookModal({ isOpen, onClose, onBooked, data, fonts }) {
  const { profile, refreshProfile, openBookingModal } = useMember()

  // Resolve Boulevard IDs from profile data
  const providerData = profile?.providers?.find(p => p.staffId === data?.providerStaffId)
    || profile?.visits?.flatMap(v => v.services).find(s => s?.provider?.staffId === data?.providerStaffId)?.provider
  const serviceItemId = providerData?.serviceMap?.[data?.serviceSlug]?.[data?.locationKey]
    || (providerData?.serviceMap && data?.serviceSlug && data?.locationKey
      ? providerData.serviceMap[data.serviceSlug]?.[data.locationKey]
      : null)
  const boulevardProviderId = providerData?.boulevardProviderId

  const [step, setStep] = useState('DATE') // DATE | TIME | CONFIRMING | BOOKED | ERROR
  const [quickPick, setQuickPick] = useState(null) // null | 'this_week' | 'recommended' | 'browse'
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [times, setTimes] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [loadingDates, setLoadingDates] = useState(true)
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  // ── Synchronous state reset when modal opens with new data ──
  // This replaces the useEffect-based reset to avoid a stale-state render frame.
  const [trackedData, setTrackedData] = useState(null)
  if (isOpen && data && data !== trackedData) {
    setTrackedData(data)
    setStep('DATE')
    setQuickPick(null)
    setAvailableDates([])
    setSelectedDate(null)
    setTimes([])
    setSelectedTime(null)
    setError(null)
    setConfirmation(null)
    setLoadingDates(true)
  }
  if (!isOpen && trackedData) {
    setTrackedData(null)
  }

  // ── Recommended date calculation ──
  const interval = data?.serviceSlug ? REBOOK_INTERVALS[data.serviceSlug] : null

  const recommendedDate = useMemo(() => {
    if (!data?.lastVisitDate || !interval) return null
    const lastDate = new Date(data.lastVisitDate)
    if (isNaN(lastDate.getTime())) return null
    const recDate = new Date(lastDate.getTime() + interval * 86400000)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (recDate < today) return today.toISOString().split('T')[0]
    return recDate.toISOString().split('T')[0]
  }, [data?.lastVisitDate, interval])

  // Find the closest available date to a target
  const findClosestAvailable = useCallback((targetDate) => {
    if (!availableDates.length || !targetDate) return null
    const target = new Date(targetDate + 'T12:00:00').getTime()
    let closest = availableDates[0]
    let minDiff = Infinity
    for (const d of availableDates) {
      const diff = Math.abs(new Date(d + 'T12:00:00').getTime() - target)
      if (diff < minDiff) { minDiff = diff; closest = d }
    }
    return closest
  }, [availableDates])

  // First available date this week (or next 7 days)
  const thisWeekDate = useMemo(() => {
    if (!availableDates.length) return null
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 7)
    const inWeek = availableDates.find(d => new Date(d + 'T12:00:00') <= cutoff)
    return inWeek || availableDates[0]
  }, [availableDates])

  // The actual recommended available date (closest to the calculated one)
  const recommendedAvailableDate = useMemo(() => {
    return recommendedDate ? findClosestAvailable(recommendedDate) : null
  }, [recommendedDate, findClosestAvailable])

  // Fetch available dates
  useEffect(() => {
    if (!isOpen || !serviceItemId || !data?.locationKey) return

    const today = new Date().toISOString().split('T')[0]
    const params = new URLSearchParams({
      locationKey: data.locationKey,
      serviceItemId,
      startDate: today,
    })
    if (boulevardProviderId) params.set('staffProviderId', boulevardProviderId)

    fetch(`/api/blvd/availability/dates?${params}`)
      .then(r => r.json())
      .then(dates => {
        setAvailableDates(Array.isArray(dates) ? dates : [])
        setLoadingDates(false)
      })
      .catch(() => {
        setAvailableDates([])
        setLoadingDates(false)
      })
  }, [isOpen, serviceItemId, boulevardProviderId, data?.locationKey])

  // Fetch times when date selected
  useEffect(() => {
    if (!selectedDate || !serviceItemId || !data?.locationKey) return
    setLoadingTimes(true)
    setTimes([])
    setSelectedTime(null)

    const params = new URLSearchParams({
      locationKey: data.locationKey,
      serviceItemId,
      date: selectedDate,
    })
    if (boulevardProviderId) params.set('staffProviderId', boulevardProviderId)

    fetch(`/api/blvd/availability/times?${params}`)
      .then(r => r.json())
      .then(t => {
        setTimes(Array.isArray(t) ? t : [])
        setLoadingTimes(false)
        setStep('TIME')
      })
      .catch(() => {
        setTimes([])
        setLoadingTimes(false)
      })
  }, [selectedDate, serviceItemId, boulevardProviderId, data?.locationKey])

  const handleSelectDate = useCallback((dateStr) => {
    setSelectedDate(dateStr)
    setSelectedTime(null)
  }, [])

  const handleSelectTime = useCallback((slot) => {
    setSelectedTime(slot)
  }, [])

  const handleQuickPick = useCallback((pick) => {
    setQuickPick(pick)
    if (pick === 'this_week' && thisWeekDate) {
      handleSelectDate(thisWeekDate)
    } else if (pick === 'recommended' && recommendedAvailableDate) {
      handleSelectDate(recommendedAvailableDate)
    }
    // 'browse' — no auto-select, just show DateStrip
  }, [thisWeekDate, recommendedAvailableDate, handleSelectDate])

  const handleConfirm = useCallback(async () => {
    if (!selectedDate || !selectedTime || !data) return
    setStep('CONFIRMING')
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/member/rebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          serviceSlug: data.serviceSlug,
          locationKey: data.locationKey,
          providerStaffId: data.providerStaffId,
          date: selectedDate,
          startTime: selectedTime.startTime,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Booking failed')

      setConfirmation(result.confirmation)
      setStep('BOOKED')
      refreshProfile()
      if (onBooked) onBooked(result)
    } catch (err) {
      setError(err.message)
      setStep('ERROR')
    }
  }, [selectedDate, selectedTime, data, refreshProfile, onBooked])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!data) return null

  const noServiceId = isOpen && !serviceItemId && !loadingDates
  const showQuickPicks = !noServiceId && step !== 'BOOKED' && !loadingDates && availableDates.length > 0
  const showDateStrip = !noServiceId && step !== 'BOOKED' && (quickPick === 'browse' || selectedDate)

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
              width: 'min(540px, 94vw)', maxHeight: '85vh',
              background: colors.ink, borderRadius: '1.25rem',
              border: `1px solid ${colors.violet}20`,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(250,248,245,0.06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white }}>Quick Rebook</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(250,248,245,0.5)' }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{data.serviceName}</p>
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.45)' }}>
                {data.providerName ? `w/ ${data.providerName} · ` : ''}{LOCATION_LABELS[data.locationKey] || data.locationKey || 'Any location'}
              </p>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              {/* No service ID fallback */}
              {noServiceId && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', marginBottom: 16 }}>
                    This service isn't available for quick rebook online.
                  </p>
                  <button
                    onClick={() => { onClose(); openBookingModal(data.locationKey || 'westfield') }}
                    style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 1.5rem', borderRadius: 999, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    Book via Full Flow →
                  </button>
                </div>
              )}

              {/* Loading dates */}
              {!noServiceId && loadingDates && step !== 'BOOKED' && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0' }}>
                  <div style={{ width: 24, height: 24, border: `2px solid ${colors.violet}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              )}

              {/* No dates available */}
              {!noServiceId && !loadingDates && availableDates.length === 0 && step !== 'BOOKED' && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', marginBottom: 16 }}>
                    No availability found for this service right now.
                  </p>
                  <button
                    onClick={() => { onClose(); openBookingModal(data.locationKey || 'westfield') }}
                    style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 1.5rem', borderRadius: 999, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    Try Full Booking →
                  </button>
                </div>
              )}

              {/* ── Quick-pick cards ── */}
              {showQuickPicks && (
                <div style={{ marginBottom: selectedDate ? 20 : 0 }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 10 }}>
                    When works for you?
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: recommendedAvailableDate ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
                    {/* This Week */}
                    {thisWeekDate && (
                      <button
                        onClick={() => handleQuickPick('this_week')}
                        style={{
                          padding: '0.875rem 0.5rem', borderRadius: '0.75rem', cursor: 'pointer',
                          textAlign: 'center', border: 'none',
                          background: quickPick === 'this_week' ? `${colors.violet}15` : 'rgba(250,248,245,0.03)',
                          outline: quickPick === 'this_week' ? `2px solid ${colors.violet}` : '1px solid rgba(250,248,245,0.08)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white, marginBottom: 2 }}>
                          This Week
                        </p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)' }}>
                          {formatDateShort(thisWeekDate)}
                        </p>
                      </button>
                    )}

                    {/* Recommended */}
                    {recommendedAvailableDate && (
                      <button
                        onClick={() => handleQuickPick('recommended')}
                        style={{
                          padding: '0.875rem 0.5rem', borderRadius: '0.75rem', cursor: 'pointer',
                          textAlign: 'center', border: 'none', position: 'relative',
                          background: quickPick === 'recommended'
                            ? `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}15)`
                            : `linear-gradient(135deg, ${colors.violet}08, ${colors.fuchsia}05)`,
                          outline: quickPick === 'recommended' ? `2px solid ${colors.violet}` : `1px solid ${colors.violet}25`,
                          transition: 'all 0.15s',
                        }}
                      >
                        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet, marginBottom: 2 }}>
                          Recommended
                        </p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)' }}>
                          {formatDateShort(recommendedAvailableDate)}
                        </p>
                        {interval && (
                          <p style={{ fontFamily: fonts.body, fontSize: '0.5625rem', color: 'rgba(250,248,245,0.3)', marginTop: 2 }}>
                            Every {formatInterval(interval)}
                          </p>
                        )}
                      </button>
                    )}

                    {/* I'll Pick */}
                    <button
                      onClick={() => handleQuickPick('browse')}
                      style={{
                        padding: '0.875rem 0.5rem', borderRadius: '0.75rem', cursor: 'pointer',
                        textAlign: 'center', border: 'none',
                        background: quickPick === 'browse' ? `${colors.violet}15` : 'rgba(250,248,245,0.03)',
                        outline: quickPick === 'browse' ? `2px solid ${colors.violet}` : '1px solid rgba(250,248,245,0.08)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white, marginBottom: 2 }}>
                        I'll Pick
                      </p>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)' }}>
                        Browse dates
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Date strip (shown when browsing or after quick-pick for fine-tuning) ── */}
              {showDateStrip && (
                <div>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 10 }}>
                    {quickPick === 'browse' ? 'Pick a Date' : 'Or pick a different date'}
                  </p>
                  <DateStrip
                    availableDates={availableDates}
                    selectedDate={selectedDate}
                    onSelect={(dateStr) => {
                      setQuickPick('browse')
                      handleSelectDate(dateStr)
                    }}
                    fonts={fonts}
                    days={60}
                  />
                </div>
              )}

              {/* Time grid */}
              {!noServiceId && selectedDate && step !== 'BOOKED' && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 10 }}>
                    Pick a Time — {formatDateLong(selectedDate)}
                  </p>
                  <TimeGrid
                    times={times}
                    selectedTimeId={selectedTime?.id}
                    onSelect={handleSelectTime}
                    loading={loadingTimes}
                    fonts={fonts}
                  />
                </div>
              )}

              {/* Error state */}
              {step === 'ERROR' && (
                <div style={{ marginTop: 16, padding: '1rem', borderRadius: '0.75rem', background: `${colors.rose}10`, border: `1px solid ${colors.rose}25` }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.rose, marginBottom: 8 }}>{error}</p>
                  <button
                    onClick={() => { setStep(selectedDate ? 'TIME' : 'DATE'); setError(null) }}
                    style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Try another time →
                  </button>
                </div>
              )}

              {/* Booked confirmation */}
              {step === 'BOOKED' && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#22c55e20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h3 style={{ fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700, color: colors.white, marginBottom: 8 }}>You&apos;re booked!</h3>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.white, fontWeight: 600, lineHeight: 1.5 }}>
                    {confirmation?.serviceName || data.serviceName}
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)', marginTop: 2 }}>
                    {data.providerName ? `w/ ${data.providerName} · ` : ''}{LOCATION_LABELS[data.locationKey] || data.locationKey}
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.white, fontWeight: 600, marginTop: 8 }}>
                    {formatDateLong(selectedDate)} at {selectedTime ? formatTime(selectedTime.startTime) : ''}
                  </p>
                  {confirmation?.serviceName && confirmation.serviceName !== data.serviceName && (
                    <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.rose, marginTop: 8, padding: '0.5rem 0.75rem', borderRadius: 8, background: `${colors.rose}10`, display: 'inline-block' }}>
                      Note: Booked as &ldquo;{confirmation.serviceName}&rdquo;
                    </p>
                  )}
                  <button
                    onClick={onClose}
                    style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2rem', borderRadius: 999, background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer', marginTop: 24, display: 'block', width: '100%' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Confirm button (sticky bottom) */}
            {selectedTime && !['CONFIRMING', 'BOOKED', 'ERROR'].includes(step) && (
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(250,248,245,0.06)', flexShrink: 0 }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', marginBottom: 8, textAlign: 'center' }}>
                  {data.serviceName}{data.providerName ? ` w/ ${data.providerName}` : ''}
                </p>
                <button
                  onClick={handleConfirm}
                  style={{
                    fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600,
                    width: '100%', padding: '0.875rem', borderRadius: 999,
                    background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer',
                  }}
                >
                  Confirm — {formatDateLong(selectedDate)} at {formatTime(selectedTime.startTime)}
                </button>
              </div>
            )}

            {/* Loading state during checkout */}
            {step === 'CONFIRMING' && (
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(250,248,245,0.06)', flexShrink: 0, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0.5rem 0' }}>
                  <div style={{ width: 20, height: 20, border: `2px solid ${colors.violet}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)' }}>Booking your appointment...</span>
                </div>
              </div>
            )}
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
