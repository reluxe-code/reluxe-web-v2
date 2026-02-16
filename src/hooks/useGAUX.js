// hooks/useGAUX.js
import { useEffect } from 'react'
import { gaEvent } from '@/lib/ga' // must expose gaEvent(name, params)

export function useGAUX() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const pagePath =
      (window.location?.pathname || '') + (window.location?.search || '')

    /* ---------------------------
       Scroll depth (25/50/75/100)
    ---------------------------- */
    const fired = new Set()
    const onScroll = () => {
      const h = document.documentElement
      const scrolled = h.scrollTop || document.body.scrollTop || 0
      const height = (h.scrollHeight - h.clientHeight) || 1
      const pct = Math.min(100, Math.round((scrolled / height) * 100))
      ;[25, 50, 75, 100].forEach((mark) => {
        if (pct >= mark && !fired.has(mark)) {
          fired.add(mark)
          gaEvent('scroll_depth', { depth_pct: mark, page_path: pagePath })
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    /* ---------------------------
       Idle detection (15s)
    ---------------------------- */
    let idleTimer = null
    const IDLE_MS = 15000
    const markIdle = () =>
      gaEvent('idle_detected', { idle_ms: IDLE_MS, page_path: pagePath })

    const resetIdle = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(markIdle, IDLE_MS)
    }

    ;['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach((evt) =>
      window.addEventListener(evt, resetIdle, { passive: true })
    )
    resetIdle()

    /* ---------------------------
       Clicks (+ simple rage clicks)
       Use data-ga / data-ga-section when available
    ---------------------------- */
    let lastClick = { t: 0, x: 0, y: 0, count: 0 }

    const onClick = (e) => {
      const el =
        (e.target && e.target.closest && e.target.closest('a,button,[role="button"]')) ||
        null
      if (!el) return

      const customName = el.getAttribute('data-ga') || null
      const section = el.getAttribute('data-ga-section') || undefined
      const click_id = el.id || el.getAttribute('data-ga-id') || undefined
      const click_text = (el.textContent || '').trim().slice(0, 100) || undefined
      const href = el.tagName === 'A' ? el.getAttribute('href') : undefined

      gaEvent(customName || 'ui_click', {
        click_id,
        click_text,
        href,
        section,
        page_path: pagePath,
      })

      // Rage-click heuristic: 3 clicks within 2s within 50px
      const now = performance.now()
      const dx = Math.abs((e.clientX || 0) - lastClick.x)
      const dy = Math.abs((e.clientY || 0) - lastClick.y)
      if (now - lastClick.t < 2000 && dx < 50 && dy < 50) {
        lastClick.count += 1
        if (lastClick.count === 3) {
          gaEvent('rage_clicks', {
            selector: click_id || click_text || '(unknown)',
            page_path: pagePath,
          })
        }
      } else {
        lastClick.count = 1
      }
      lastClick.t = now
      lastClick.x = e.clientX || 0
      lastClick.y = e.clientY || 0
    }

    document.addEventListener('click', onClick, true)

    /* ---------------------------
       Cleanup
    ---------------------------- */
    return () => {
      window.removeEventListener('scroll', onScroll)
      ;['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach((evt) =>
        window.removeEventListener(evt, resetIdle)
      )
      clearTimeout(idleTimer)
      document.removeEventListener('click', onClick, true)
    }
  }, [])
}
