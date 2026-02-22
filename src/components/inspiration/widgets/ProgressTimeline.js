import { useState } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function ProgressTimeline({ config, articleSlug }) {
  const { title, steps = [] } = config || {}
  const [active, setActive] = useState(0)

  if (!steps.length) return null

  const handleStepClick = (i) => {
    setActive(i)
    trackWidgetEvent('timeline_step', 'ProgressTimeline', articleSlug, { title, step_index: i, step_title: steps[i]?.title })
  }

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      {title && <h3 className="text-lg font-bold text-neutral-900 mb-5">{title}</h3>}

      <div className="relative">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => handleStepClick(i)}
            className="relative flex items-start gap-4 w-full text-left group mb-0"
          >
            {/* Vertical line */}
            {i < steps.length - 1 && (
              <div className={`absolute left-[15px] top-[32px] w-0.5 h-full transition-colors ${
                i < active ? 'bg-violet-400' : 'bg-neutral-200'
              }`} />
            )}

            {/* Dot */}
            <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i === active
                ? 'bg-violet-600 text-white ring-4 ring-violet-100'
                : i < active
                  ? 'bg-violet-400 text-white'
                  : 'bg-neutral-200 text-neutral-500'
            }`}>
              {i + 1}
            </div>

            {/* Content */}
            <div className={`pb-6 transition-opacity ${i === active ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`}>
              <div className="flex items-center gap-2 mb-0.5">
                {step.day && <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">{step.day}</span>}
              </div>
              <h4 className="text-sm font-semibold text-neutral-900">{step.title}</h4>
              {i === active && step.text && (
                <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{step.text}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
