// src/components/promo/AnnouncementModal.js
// Admin-driven announcement popup system
// Supports: exit-intent, on-load, both | frequency capping | route targeting | scheduling
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'

/* ─── localStorage helpers ─── */
const storageKey = (slug) => `reluxe_ann_${slug}`

function getDismissedAt(slug) {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    if (!raw) return 0
    return Number(JSON.parse(raw).expiresAt || 0)
  } catch {
    return 0
  }
}

function setDismissed(slug, days) {
  try {
    localStorage.setItem(
      storageKey(slug),
      JSON.stringify({ expiresAt: Date.now() + days * 86400000 })
    )
  } catch {}
}

function routeMatches(pathname, patterns) {
  if (!patterns?.length) return true
  return patterns.some((p) => {
    if (p.endsWith('/*')) {
      const base = p.replace(/\/\*$/, '')
      return pathname === base || pathname.startsWith(`${base}/`)
    }
    return pathname === p
  })
}

/* ─── style presets ─── */
const STYLES = {
  gradient: {
    bg: 'linear-gradient(135deg, #7C3AED, #C026D3)',
    textColor: '#fff',
    bodyColor: 'rgba(255,255,255,0.85)',
    ctaBg: '#fff',
    ctaColor: '#7C3AED',
    dismissColor: 'rgba(255,255,255,0.6)',
  },
  dark: {
    bg: 'linear-gradient(180deg, #0a0a0a, #1a1a2e)',
    textColor: '#faf8f5',
    bodyColor: 'rgba(250,248,245,0.7)',
    ctaBg: 'linear-gradient(135deg, #7C3AED, #C026D3)',
    ctaColor: '#fff',
    dismissColor: 'rgba(250,248,245,0.4)',
  },
  minimal: {
    bg: '#ffffff',
    textColor: '#111827',
    bodyColor: '#6b7280',
    ctaBg: '#111827',
    ctaColor: '#fff',
    dismissColor: '#9ca3af',
  },
  neon: {
    bg: '#000000',
    textColor: '#c084fc',
    bodyColor: 'rgba(250,248,245,0.6)',
    ctaBg: 'linear-gradient(135deg, #7C3AED, #C026D3)',
    ctaColor: '#fff',
    dismissColor: 'rgba(250,248,245,0.35)',
  },
}

export default function AnnouncementModal() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState([])
  const [activeAnn, setActiveAnn] = useState(null)
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const exitFiredRef = useRef(false)
  const loadTimerRef = useRef(null)

  // Fetch active announcements once on mount
  useEffect(() => {
    setMounted(true)
    fetch('/api/announcements/active')
      .then((r) => r.json())
      .then((data) => setAnnouncements(data.announcements || []))
      .catch(() => {})
  }, [])

  // Find the best announcement to show for the current route
  const candidate = useMemo(() => {
    if (!mounted || !announcements.length) return null
    const pathname = router?.pathname || '/'

    for (const ann of announcements) {
      // Route targeting
      if (ann.exclude_routes?.length && routeMatches(pathname, ann.exclude_routes)) continue
      if (ann.include_routes?.length && !routeMatches(pathname, ann.include_routes)) continue

      // Frequency check
      const expiresAt = getDismissedAt(ann.slug)
      if (Date.now() < expiresAt) continue

      return ann
    }
    return null
  }, [mounted, announcements, router?.pathname])

  // Open handler
  const openModal = useCallback(() => {
    if (!candidate || visible) return
    setActiveAnn(candidate)
    setVisible(true)
  }, [candidate, visible])

  // Close handler
  const closeModal = useCallback(() => {
    if (activeAnn) {
      setDismissed(activeAnn.slug, activeAnn.frequency_days || 7)
    }
    setVisible(false)
    setActiveAnn(null)
  }, [activeAnn])

  // Exit-intent listener
  useEffect(() => {
    if (!candidate) return
    if (candidate.trigger !== 'exit' && candidate.trigger !== 'both') return

    exitFiredRef.current = false
    const onMouseLeave = (e) => {
      if (exitFiredRef.current) return
      if (e.clientY <= 0) {
        exitFiredRef.current = true
        openModal()
      }
    }
    document.addEventListener('mouseleave', onMouseLeave)
    return () => document.removeEventListener('mouseleave', onMouseLeave)
  }, [candidate, openModal])

  // On-load timer
  useEffect(() => {
    if (!candidate) return
    if (candidate.trigger !== 'load' && candidate.trigger !== 'both') return

    const delay = Math.max(0, candidate.delay_ms || 3000)
    loadTimerRef.current = setTimeout(() => {
      openModal()
    }, delay)

    return () => clearTimeout(loadTimerRef.current)
  }, [candidate, openModal])

  // Body scroll lock
  useEffect(() => {
    if (!mounted) return
    document.body.style.overflow = visible ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [visible, mounted])

  // Escape key
  useEffect(() => {
    if (!visible) return
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, closeModal])

  if (!visible || !activeAnn) return null

  const s = STYLES[activeAnn.style] || STYLES.gradient

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ann-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ animation: 'annFadeIn 0.25s ease-out' }}
    >
      <style jsx global>{`
        @keyframes annFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes annSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Overlay */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: s.bg,
          animation: 'annSlideUp 0.3s ease-out',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close announcement"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full transition-colors"
          style={{
            backgroundColor: activeAnn.style === 'minimal' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
            color: activeAnn.style === 'minimal' ? '#9ca3af' : 'rgba(255,255,255,0.7)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Optional image */}
        {activeAnn.image_url && (
          <div className="w-full" style={{ maxHeight: 200, overflow: 'hidden' }}>
            <img
              src={activeAnn.image_url}
              alt=""
              className="w-full h-full object-cover"
              style={{ maxHeight: 200 }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8 text-center">
          <h2
            id="ann-title"
            className="text-2xl font-bold mb-3"
            style={{ color: s.textColor }}
          >
            {activeAnn.title}
          </h2>

          {activeAnn.body && (
            <p
              className="text-base mb-6 max-w-sm mx-auto"
              style={{ color: s.bodyColor, lineHeight: 1.6 }}
            >
              {activeAnn.body}
            </p>
          )}

          {/* CTA */}
          <a
            href={activeAnn.cta_url || '/'}
            className="inline-flex items-center justify-center w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: s.ctaBg,
              color: s.ctaColor,
              textDecoration: 'none',
            }}
            onClick={closeModal}
          >
            {activeAnn.cta_label || 'Learn More'}
          </a>

          {/* Dismiss */}
          <button
            type="button"
            className="mt-3 block w-full text-center text-xs transition-opacity hover:opacity-80"
            style={{ color: s.dismissColor, background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={closeModal}
          >
            {activeAnn.dismiss_label || 'No thanks'}
          </button>
        </div>
      </div>
    </div>
  )
}
