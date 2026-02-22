import { useState } from 'react'
import Link from 'next/link'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function TreatmentPicker({ config, articleSlug }) {
  const { title = 'Which Treatment Is Right for You?', options = [] } = config || {}
  const [selected, setSelected] = useState(null)

  if (!options.length) return null

  const handleSelect = (i) => {
    setSelected(i)
    trackWidgetEvent('treatment_pick', 'TreatmentPicker', articleSlug, {
      title,
      selected_label: options[i]?.label,
      recommendation: options[i]?.title,
    })
  }

  const active = selected !== null ? options[selected] : null

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      <h3 className="text-lg font-bold text-neutral-900 mb-4">{title}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
              selected === i
                ? 'border-violet-500 bg-violet-50'
                : 'border-neutral-200 hover:border-violet-300'
            }`}
          >
            <span className="text-sm font-medium text-neutral-800">{opt.label}</span>
          </button>
        ))}
      </div>

      {active && (
        <div className="rounded-xl bg-violet-50 border border-violet-200 p-5 animate-in fade-in">
          <h4 className="text-base font-bold text-violet-800 mb-1">{active.title}</h4>
          <p className="text-sm text-neutral-600 mb-3">{active.text}</p>
          {active.cta_href && (
            <Link
              href={active.cta_href}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Learn More
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
