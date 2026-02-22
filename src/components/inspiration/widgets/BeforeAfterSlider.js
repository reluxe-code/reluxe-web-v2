import { useState, useRef } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function BeforeAfterSlider({ config, articleSlug }) {
  const [position, setPosition] = useState(50)
  const { before_image, after_image, before_label = 'Before', after_label = 'After' } = config || {}
  const tracked = useRef(false)

  const onInteract = () => {
    if (!tracked.current) {
      tracked.current = true
      trackWidgetEvent('slider_interact', 'BeforeAfterSlider', articleSlug, { before_label, after_label })
    }
  }

  if (!before_image || !after_image) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-8 text-center">
        <p className="text-sm text-violet-600 font-medium">Before & After Coming Soon</p>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl overflow-hidden border shadow-sm">
      <div
        className="relative select-none"
        style={{ aspectRatio: '16/10' }}
        onMouseMove={(e) => {
          if (e.buttons !== 1) return
          onInteract()
          const rect = e.currentTarget.getBoundingClientRect()
          setPosition(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)))
        }}
        onTouchMove={(e) => {
          onInteract()
          const rect = e.currentTarget.getBoundingClientRect()
          const touch = e.touches[0]
          setPosition(Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100)))
        }}
      >
        <img src={after_image} alt={after_label} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img src={before_image} alt={before_label} className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: '100%' }} />
        </div>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-col-resize"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L3 10L7 16M13 4L17 10L13 16" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">{before_label}</span>
        <span className="absolute bottom-3 right-3 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">{after_label}</span>
      </div>
    </div>
  )
}
