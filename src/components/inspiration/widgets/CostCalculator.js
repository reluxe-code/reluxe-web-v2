import { useState, useMemo, useRef } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function CostCalculator({ config, articleSlug }) {
  const { title = 'Cost Calculator', items = [], membership_discount = 0.20, membership_cost_monthly, summary_text } = config || {}
  const [years, setYears] = useState(3)
  const tracked = useRef(false)

  const totals = useMemo(() => {
    let guestTotal = 0
    let memberTotal = 0

    items.forEach(item => {
      const freq = item.frequency || 'annual'
      let multiplier = years
      if (freq === 'monthly') multiplier = years * 12
      else if (freq === 'quarterly') multiplier = years * 4
      else if (freq === 'once') multiplier = 1
      else if (freq === '15months') multiplier = Math.floor((years * 12) / 15)

      const gCost = (item.guest_price || 0) * multiplier
      const mCost = item.member_price !== undefined
        ? item.member_price * multiplier
        : gCost * (1 - membership_discount)

      guestTotal += gCost
      memberTotal += mCost
    })

    if (membership_cost_monthly) {
      memberTotal += membership_cost_monthly * 12 * years
    }

    return { guest: Math.round(guestTotal), member: Math.round(memberTotal), savings: Math.round(guestTotal - memberTotal) }
  }, [items, years, membership_discount, membership_cost_monthly])

  const handleYearChange = (y) => {
    setYears(y)
    if (!tracked.current) {
      tracked.current = true
      trackWidgetEvent('calculator_use', 'CostCalculator', articleSlug, { title })
    }
    trackWidgetEvent('calculator_toggle', 'CostCalculator', articleSlug, { years: y })
  }

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      <h3 className="text-lg font-bold text-neutral-900 mb-4">{title}</h3>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm font-medium text-neutral-600">Time horizon:</label>
        <div className="flex gap-2">
          {[1, 3, 5, 10].map(y => (
            <button
              key={y}
              onClick={() => handleYearChange(y)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                years === y ? 'bg-violet-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {y} {y === 1 ? 'year' : 'years'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div>
              <span className="text-neutral-700">{item.label}</span>
              {item.note && <span className="ml-2 text-xs text-neutral-400">({item.note})</span>}
            </div>
            <span className="font-medium text-neutral-900">${item.guest_price?.toLocaleString()}<span className="text-xs text-neutral-400">/{item.frequency || 'yr'}</span></span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-neutral-50 p-4 text-center">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Guest Total</p>
          <p className="text-2xl font-bold text-neutral-900">${totals.guest.toLocaleString()}</p>
          <p className="text-xs text-neutral-400">over {years} {years === 1 ? 'year' : 'years'}</p>
        </div>
        <div className="rounded-xl bg-violet-50 p-4 text-center border border-violet-200">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">Member Total</p>
          <p className="text-2xl font-bold text-violet-700">${totals.member.toLocaleString()}</p>
          <p className="text-xs text-violet-400">over {years} {years === 1 ? 'year' : 'years'}</p>
        </div>
      </div>

      {totals.savings > 0 && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
          <p className="text-sm font-semibold text-green-700">You save ${totals.savings.toLocaleString()} as a member</p>
        </div>
      )}

      {summary_text && <p className="text-xs text-neutral-500 mt-3 text-center">{summary_text}</p>}
    </div>
  )
}
