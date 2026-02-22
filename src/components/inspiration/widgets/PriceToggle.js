import { useState, useRef } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function PriceToggle({ config, articleSlug }) {
  const { title = 'Member vs Guest Pricing', services = [], member_label = 'Member', guest_label = 'Guest' } = config || {}
  const [isMember, setIsMember] = useState(true)
  const tracked = useRef(false)

  if (!services.length) return null

  const handleToggle = () => {
    const next = !isMember
    setIsMember(next)
    if (!tracked.current) {
      tracked.current = true
      trackWidgetEvent('price_toggle_use', 'PriceToggle', articleSlug, { title })
    }
    trackWidgetEvent('price_toggle', 'PriceToggle', articleSlug, { showing: next ? 'member' : 'guest' })
  }

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      {title && <h3 className="text-lg font-bold text-neutral-900 mb-4">{title}</h3>}

      <div className="flex items-center justify-center gap-3 mb-6">
        <span className={`text-sm font-medium ${!isMember ? 'text-neutral-800' : 'text-neutral-400'}`}>{guest_label}</span>
        <button
          onClick={handleToggle}
          className={`relative w-14 h-7 rounded-full transition-colors ${isMember ? 'bg-violet-600' : 'bg-neutral-300'}`}
          aria-label="Toggle pricing"
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${isMember ? 'translate-x-7' : 'translate-x-0.5'}`} />
        </button>
        <span className={`text-sm font-medium ${isMember ? 'text-violet-700' : 'text-neutral-400'}`}>{member_label}</span>
      </div>

      <div className="space-y-3">
        {services.map((svc, i) => {
          const price = isMember ? (svc.member_price ?? svc.guest_price) : svc.guest_price
          const savings = svc.guest_price - (svc.member_price ?? svc.guest_price)

          return (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <span className="text-sm font-medium text-neutral-800">{svc.name}</span>
                {svc.note && isMember && <span className="ml-2 text-xs text-violet-500">({svc.note})</span>}
              </div>
              <div className="text-right">
                <span className={`text-base font-bold ${isMember ? 'text-violet-700' : 'text-neutral-800'}`}>
                  {price === 0 ? 'Included' : `$${price}`}
                </span>
                {isMember && savings > 0 && (
                  <span className="ml-2 text-xs text-green-600 font-medium">Save ${savings}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
