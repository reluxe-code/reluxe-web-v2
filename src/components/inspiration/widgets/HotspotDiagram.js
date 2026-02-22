import { useState } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function HotspotDiagram({ config, articleSlug }) {
  const { title, diagram_type = 'face', hotspots = [] } = config || {}
  const [active, setActive] = useState(null)

  if (!hotspots.length) return null

  const handleSpotClick = (i) => {
    const next = active === i ? null : i
    setActive(next)
    if (next !== null) {
      trackWidgetEvent('hotspot_click', 'HotspotDiagram', articleSlug, { title, zone: hotspots[i]?.label, zone_index: i })
    }
  }

  const activeSpot = active !== null ? hotspots[active] : null

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      {title && <h3 className="text-lg font-bold text-neutral-900 mb-4">{title}</h3>}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Diagram */}
        <div className="relative w-full md:w-1/2 aspect-[3/4] bg-gradient-to-b from-violet-50 to-white rounded-xl overflow-hidden">
          {/* Simple face/body outline */}
          <svg viewBox="0 0 200 280" className="w-full h-full" fill="none" stroke="#d4d4d8" strokeWidth="1.5">
            {diagram_type === 'face' ? (
              <>
                <ellipse cx="100" cy="120" rx="65" ry="80" />
                <ellipse cx="100" cy="100" rx="50" ry="60" fill="none" stroke="#e5e5e5" />
                <path d="M75 105 Q100 130 125 105" strokeWidth="1" />
                <circle cx="80" cy="95" r="4" /><circle cx="120" cy="95" r="4" />
                <path d="M90 115 Q100 120 110 115" strokeWidth="1" />
              </>
            ) : (
              <>
                <ellipse cx="100" cy="40" rx="25" ry="30" />
                <path d="M75 65 L60 140 L80 140 L85 200 L115 200 L120 140 L140 140 L125 65" />
                <path d="M85 200 L75 270 M115 200 L125 270" strokeWidth="2" />
              </>
            )}
          </svg>

          {/* Hotspot dots */}
          {hotspots.map((spot, i) => (
            <button
              key={i}
              onClick={() => handleSpotClick(i)}
              className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all ${
                active === i
                  ? 'bg-violet-600 text-white scale-125 ring-4 ring-violet-200'
                  : 'bg-white border-2 border-violet-400 text-violet-600 hover:bg-violet-50'
              }`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              aria-label={spot.label}
            >
              <span className="text-[10px] font-bold">{i + 1}</span>
            </button>
          ))}
        </div>

        {/* Info panel */}
        <div className="flex-1">
          {activeSpot ? (
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-5">
              <h4 className="text-base font-bold text-violet-800 mb-2">{activeSpot.label}</h4>
              <p className="text-sm text-neutral-600 mb-3">{activeSpot.text}</p>
              {activeSpot.volume && (
                <p className="text-xs font-semibold text-violet-600">{activeSpot.volume}</p>
              )}
              {activeSpot.treatments?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activeSpot.treatments.map(t => (
                    <span key={t} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-neutral-50 p-5 text-center">
              <p className="text-sm text-neutral-400">Tap a numbered zone to learn more</p>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {hotspots.map((spot, i) => (
              <button
                key={i}
                onClick={() => handleSpotClick(i)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  active === i ? 'bg-violet-100 text-violet-800 font-medium' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span className="font-semibold mr-2">{i + 1}.</span> {spot.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
