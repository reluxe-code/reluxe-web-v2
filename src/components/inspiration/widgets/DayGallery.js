import { useState } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function DayGallery({ config, articleSlug }) {
  const { title = 'Healing Timeline', days = [] } = config || {}
  const [active, setActive] = useState(0)

  if (!days.length) return null

  const current = days[active]

  const handleDayClick = (i) => {
    setActive(i)
    trackWidgetEvent('gallery_day', 'DayGallery', articleSlug, { title, day_index: i, day_label: days[i]?.label || `Day ${days[i]?.day}` })
  }

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      {title && <h3 className="text-lg font-bold text-neutral-900 mb-4">{title}</h3>}

      {/* Day pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => handleDayClick(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              active === i
                ? 'bg-violet-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {d.label || `Day ${d.day}`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl bg-neutral-50 p-5">
        {current.image ? (
          <img src={current.image} alt={current.label} className="w-full h-48 object-cover rounded-lg mb-3" />
        ) : (
          <div className="w-full h-32 rounded-lg bg-gradient-to-br from-violet-100 to-fuchsia-50 flex items-center justify-center mb-3">
            <div className="text-center">
              <span className="text-3xl font-bold text-violet-300">{current.label || `Day ${current.day}`}</span>
            </div>
          </div>
        )}
        <h4 className="text-sm font-semibold text-neutral-900 mb-1">{current.label || `Day ${current.day}`}</h4>
        <p className="text-sm text-neutral-600 leading-relaxed">{current.text}</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mt-4">
        {days.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= active ? 'bg-violet-500' : 'bg-neutral-200'}`} />
        ))}
      </div>
    </div>
  )
}
