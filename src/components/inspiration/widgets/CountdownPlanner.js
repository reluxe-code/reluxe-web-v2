import { useState, useMemo } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function CountdownPlanner({ config, articleSlug }) {
  const { title = 'Plan Your Timeline', milestones = [] } = config || {}
  const [eventDate, setEventDate] = useState('')

  const timeline = useMemo(() => {
    if (!eventDate || !milestones.length) return []
    const target = new Date(eventDate + 'T00:00:00')

    return milestones.map(m => {
      const d = new Date(target)
      d.setDate(d.getDate() + (m.weeks || 0) * 7)
      return {
        ...m,
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        isPast: d < new Date(),
      }
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [eventDate, milestones])

  const handleDateChange = (e) => {
    const val = e.target.value
    setEventDate(val)
    if (val) {
      trackWidgetEvent('countdown_set', 'CountdownPlanner', articleSlug, { title, event_date: val, milestones_count: milestones.length })
    }
  }

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-white p-6">
      <h3 className="text-lg font-bold text-neutral-900 mb-4">{title}</h3>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <label className="text-sm font-medium text-neutral-600">
          {milestones.some(m => m.weeks < 0) ? 'Event date:' : 'Start date:'}
        </label>
        <input
          type="date"
          value={eventDate}
          onChange={handleDateChange}
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
        />
      </div>

      {timeline.length > 0 ? (
        <div className="space-y-0">
          {timeline.map((m, i) => (
            <div key={i} className="relative flex items-start gap-4 pb-5">
              {i < timeline.length - 1 && (
                <div className="absolute left-[15px] top-[32px] w-0.5 h-full bg-neutral-200" />
              )}
              <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                m.isPast ? 'bg-green-500 text-white' : 'bg-violet-100 text-violet-600'
              }`}>
                {m.isPast ? '✓' : i + 1}
              </div>
              <div>
                <p className="text-xs font-semibold text-violet-600">{m.date}</p>
                <p className="text-sm font-semibold text-neutral-900">{m.label}</p>
                <p className="text-sm text-neutral-500">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-400 text-center py-4">
          {milestones.some(m => m.weeks < 0)
            ? 'Enter your event date above to see your custom timeline.'
            : 'Enter your start date above to see your treatment schedule.'}
        </p>
      )}
    </div>
  )
}
