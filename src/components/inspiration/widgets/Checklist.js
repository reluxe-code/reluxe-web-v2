import { useState } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function Checklist({ config, articleSlug }) {
  const { title, items = [] } = config || {}
  const [checked, setChecked] = useState({})

  const toggle = (i, itemText, itemType) => {
    const nowChecked = !checked[i]
    setChecked(prev => ({ ...prev, [i]: nowChecked }))
    trackWidgetEvent('checklist_toggle', 'Checklist', articleSlug, {
      title,
      item: itemText,
      type: itemType || 'generic',
      checked: nowChecked,
    })
  }

  if (!items.length) return null

  const dos = items.filter(item => item.type === 'do')
  const donts = items.filter(item => item.type === 'dont')
  const generic = items.filter(item => !item.type || (item.type !== 'do' && item.type !== 'dont'))

  const renderItem = (item, i) => {
    const isDont = item.type === 'dont'
    const isChecked = checked[i]

    return (
      <button
        key={i}
        onClick={() => toggle(i, item.text, item.type)}
        className={`flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all ${
          isChecked
            ? isDont ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            : 'bg-white border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <div className={`flex-shrink-0 w-5 h-5 rounded mt-0.5 border-2 flex items-center justify-center transition-colors ${
          isChecked
            ? isDont ? 'bg-red-500 border-red-500' : 'bg-green-500 border-green-500'
            : 'border-neutral-300'
        }`}>
          {isChecked && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className={`text-sm ${isChecked ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
          {isDont && <span className="font-semibold text-red-500 mr-1">DON&apos;T:</span>}
          {item.text}
        </span>
      </button>
    )
  }

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      {title && <h3 className="text-lg font-bold text-neutral-900 mb-4">{title}</h3>}

      {dos.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Do&apos;s</p>
          <div className="space-y-2">{dos.map((item, i) => renderItem(item, `do-${i}`))}</div>
        </div>
      )}

      {donts.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Don&apos;ts</p>
          <div className="space-y-2">{donts.map((item, i) => renderItem(item, `dont-${i}`))}</div>
        </div>
      )}

      {generic.length > 0 && (
        <div className="space-y-2">{generic.map((item, i) => renderItem(item, `gen-${i}`))}</div>
      )}

      <p className="text-xs text-neutral-400 mt-3 text-center">Tap to check off items</p>
    </div>
  )
}
