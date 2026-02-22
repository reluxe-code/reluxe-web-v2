import { useMemo, useRef, useEffect } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function DecayChart({ config, articleSlug }) {
  const {
    title = 'Treatment Effectiveness Over Time',
    treatment = '',
    peak_weeks = 2,
    duration_weeks = 16,
    retreatment_week = 12,
    labels = {},
  } = config || {}
  const tracked = useRef(false)

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true
      trackWidgetEvent('chart_view', 'DecayChart', articleSlug, { title, treatment, duration_weeks, retreatment_week })
    }
  }, [title, treatment, duration_weeks, retreatment_week, articleSlug])

  const points = useMemo(() => {
    const pts = []
    const total = duration_weeks + 2
    for (let w = 0; w <= total; w++) {
      let pct
      if (w <= peak_weeks) {
        pct = (w / peak_weeks) * 100
      } else {
        const decay = (w - peak_weeks) / (duration_weeks - peak_weeks)
        pct = Math.max(0, 100 * (1 - decay * decay))
      }
      pts.push({ week: w, pct: Math.round(pct) })
    }
    return pts
  }, [peak_weeks, duration_weeks])

  const width = 600
  const height = 200
  const padX = 40
  const padY = 20
  const chartW = width - padX * 2
  const chartH = height - padY * 2

  const pathD = points.map((p, i) => {
    const x = padX + (p.week / (duration_weeks + 2)) * chartW
    const y = padY + chartH - (p.pct / 100) * chartH
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  const retreatX = padX + (retreatment_week / (duration_weeks + 2)) * chartW

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      {title && <h3 className="text-lg font-bold text-neutral-900 mb-1">{title}</h3>}
      {treatment && <p className="text-xs text-neutral-400 mb-4">{treatment}</p>}

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-full" style={{ minWidth: 400 }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(pct => {
            const y = padY + chartH - (pct / 100) * chartH
            return (
              <g key={pct}>
                <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                <text x={padX - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#999">{pct}%</text>
              </g>
            )
          })}

          {/* Retreatment marker */}
          <line x1={retreatX} y1={padY} x2={retreatX} y2={padY + chartH} stroke="#7C3AED" strokeWidth="1" strokeDasharray="4 4" />
          <text x={retreatX} y={padY + chartH + 24} textAnchor="middle" fontSize="10" fill="#7C3AED" fontWeight="600">
            {labels.gone || `Rebook Week ${retreatment_week}`}
          </text>

          {/* Area fill */}
          <path
            d={`${pathD} L ${padX + ((duration_weeks + 2) / (duration_weeks + 2)) * chartW} ${padY + chartH} L ${padX} ${padY + chartH} Z`}
            fill="url(#decayGrad)"
            opacity="0.15"
          />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Peak dot */}
          <circle
            cx={padX + (peak_weeks / (duration_weeks + 2)) * chartW}
            cy={padY}
            r="5"
            fill="#7C3AED"
          />
          <text
            x={padX + (peak_weeks / (duration_weeks + 2)) * chartW}
            y={padY - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#7C3AED"
            fontWeight="600"
          >
            {labels.peak || 'Peak'}
          </text>

          {/* X-axis labels */}
          {[0, Math.round(duration_weeks / 4), Math.round(duration_weeks / 2), Math.round(duration_weeks * 3 / 4), duration_weeks].map(w => (
            <text key={w} x={padX + (w / (duration_weeks + 2)) * chartW} y={padY + chartH + 14} textAnchor="middle" fontSize="10" fill="#999">
              W{w}
            </text>
          ))}

          <defs>
            <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
