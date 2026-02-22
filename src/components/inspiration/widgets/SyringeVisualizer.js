import { useState } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function SyringeVisualizer({ config, articleSlug }) {
  const { title, areas = [], unit = 'mL' } = config || {}
  const [active, setActive] = useState(null)

  if (!areas.length) return null

  const maxVol = Math.max(...areas.map(a => a.volume || 0), 2)
  const totalVol = areas.reduce((sum, a) => sum + (a.volume || 0), 0)

  const handleAreaClick = (i) => {
    const next = active === i ? null : i
    setActive(next)
    if (next !== null) {
      trackWidgetEvent('syringe_area', 'SyringeVisualizer', articleSlug, { title, area: areas[i]?.label, volume: areas[i]?.volume })
    }
  }

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      {title && <h3 className="text-lg font-bold text-neutral-900 mb-4">{title}</h3>}

      <div className="space-y-3 mb-6">
        {areas.map((area, i) => {
          const pct = ((area.volume || 0) / maxVol) * 100
          return (
            <button
              key={i}
              onClick={() => handleAreaClick(i)}
              className={`w-full text-left rounded-xl p-3 border-2 transition-all ${
                active === i ? 'border-violet-500 bg-violet-50' : 'border-transparent hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-neutral-800">{area.label}</span>
                <span className="text-sm font-bold text-violet-700">{area.volume} {unit}</span>
              </div>
              {/* Syringe bar */}
              <div className="relative h-6 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-400 to-violet-600 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
                {/* Syringe markings */}
                {[0.25, 0.5, 0.75].map(mark => (
                  <div
                    key={mark}
                    className="absolute top-0 bottom-0 w-px bg-white/40"
                    style={{ left: `${mark * 100}%` }}
                  />
                ))}
              </div>
              {active === i && area.description && (
                <p className="text-xs text-neutral-500 mt-2">{area.description}</p>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-violet-50 border border-violet-200">
        <span className="text-sm font-medium text-violet-700">
          {config?.total_label || 'Total Volume'}
        </span>
        <span className="text-lg font-bold text-violet-800">{totalVol} {unit}</span>
      </div>
    </div>
  )
}
