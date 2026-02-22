import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function ReminderButton({ config, articleSlug }) {
  const {
    title = 'Set a Reminder',
    description = '',
    days_from_now = 90,
    event_title = 'RELUXE Treatment Reminder',
  } = config || {}

  const handleDownload = () => {
    trackWidgetEvent('reminder_download', 'ReminderButton', articleSlug, { title, days_from_now, event_title })

    const start = new Date()
    start.setDate(start.getDate() + days_from_now)
    start.setHours(9, 0, 0, 0)

    const end = new Date(start)
    end.setHours(10, 0, 0, 0)

    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RELUXE Med Spa//Reminder//EN',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${event_title}`,
      `DESCRIPTION:${description || `Time to book your next treatment at RELUXE Med Spa. Visit reluxemedspa.com/book`}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${event_title}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reluxe-reminder.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() + days_from_now)
  const dateStr = reminderDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="my-8 rounded-2xl border shadow-sm bg-gradient-to-br from-violet-50 to-white p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-neutral-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-500 mb-2">{description}</p>}
      <p className="text-xs text-neutral-400 mb-4">Reminder for: {dateStr}</p>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Add to Calendar
      </button>
    </div>
  )
}
