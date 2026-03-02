// src/pages/admin/intelligence/content-engagement.js
// Content & Widget Engagement Dashboard
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    violet: 'border-l-violet-500', emerald: 'border-l-emerald-500',
    rose: 'border-l-rose-500', blue: 'border-l-blue-500',
    amber: 'border-l-amber-500', neutral: 'border-l-neutral-400',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

const WIDGET_LABELS = {
  BeforeAfterSlider: 'Before/After Slider',
  CostCalculator: 'Cost Calculator',
  QuizAssessment: 'Quiz',
  ComparisonTable: 'Comparison Table',
  ProgressTimeline: 'Progress Timeline',
  Checklist: 'Checklist',
  TreatmentPicker: 'Treatment Picker',
  CountdownPlanner: 'Countdown Planner',
  PriceToggle: 'Price Toggle',
  DecayChart: 'Decay Chart',
  DayGallery: 'Day Gallery',
  HotspotDiagram: 'Hotspot Diagram',
  SyringeVisualizer: 'Syringe Visualizer',
  BookingCta: 'Booking CTA',
  InterestSave: 'Save/Heart',
  ReminderButton: 'Calendar Reminder',
}

const EVENT_LABELS = {
  slider_interact: 'Slider Dragged',
  calculator_use: 'Calculator Opened',
  calculator_toggle: 'Calculator Toggled',
  quiz_answer: 'Quiz Answer',
  quiz_complete: 'Quiz Complete',
  quiz_retake: 'Quiz Retake',
  table_view: 'Table Viewed',
  timeline_step: 'Timeline Step',
  checklist_toggle: 'Checklist Toggle',
  treatment_pick: 'Treatment Selected',
  countdown_set: 'Countdown Set',
  price_toggle_use: 'Price Toggle Opened',
  price_toggle: 'Price Toggled',
  chart_view: 'Chart Viewed',
  gallery_day: 'Gallery Day',
  hotspot_click: 'Hotspot Click',
  syringe_area: 'Syringe Area',
  booking_cta_click: 'Booking CTA Click',
  interest_save: 'Article Saved',
  interest_unsave: 'Article Unsaved',
  reminder_download: 'Reminder Downloaded',
}

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch { return iso }
}

export default function ContentEngagementDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(30)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tab, setTab] = useState('overview')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (startDate) {
        params.set('start_date', startDate)
        if (endDate) params.set('end_date', endDate)
      } else {
        params.set('days', days)
      }

      const res = await adminFetch(`/api/admin/intelligence/content-engagement?${params}`)
      if (!res.ok) throw new Error(await res.text())
      setData(await res.json())
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [days, startDate, endDate])

  useEffect(() => { loadData() }, [loadData])

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content Engagement</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Track how visitors interact with inspiration article widgets — quizzes, calculators, sliders, and more.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => { setDays(d); setStartDate(''); setEndDate('') }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !startDate && days === d ? 'bg-violet-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>or</span>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-2 py-1 border rounded text-xs" />
          <span>—</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-2 py-1 border rounded text-xs" />
        </div>
      </div>

      {loading && <p className="text-sm text-neutral-400 py-8 text-center">Loading...</p>}
      {error && <p className="text-sm text-red-500 py-8 text-center">{error}</p>}

      {data && !loading && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Events" value={data.summary.total_events.toLocaleString()} color="violet" />
            <StatCard label="Unique Visitors" value={data.summary.unique_visitors.toLocaleString()} color="blue" />
            <StatCard label="Articles Engaged" value={data.summary.articles_with_engagement} color="emerald" />
            <StatCard label="Widget Types Used" value={data.summary.widgets_used} color="amber" />
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 mb-6 border-b">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'articles', label: 'By Article' },
              { key: 'quizzes', label: 'Quiz Results' },
              { key: 'recent', label: 'Recent Events' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview: Widget breakdown + trends */}
          {tab === 'overview' && (
            <div className="space-y-8">
              {/* Widget usage bars */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-sm font-semibold text-neutral-700 mb-4">Widget Engagement</h3>
                <div className="space-y-3">
                  {data.widget_breakdown.map(w => {
                    const maxCount = data.widget_breakdown[0]?.total || 1
                    const pct = Math.max((w.total / maxCount) * 100, 2)
                    return (
                      <div key={w.widget} className="flex items-center gap-3">
                        <div className="w-40 text-xs font-medium text-neutral-600 truncate" title={w.widget}>
                          {WIDGET_LABELS[w.widget] || w.widget}
                        </div>
                        <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-14 text-right text-xs font-semibold text-neutral-700">{w.total}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top events */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-sm font-semibold text-neutral-700 mb-4">Top Event Types</h3>
                <div className="space-y-2">
                  {data.top_events.slice(0, 15).map(e => (
                    <div key={e.event} className="flex items-center justify-between py-1 border-b last:border-0">
                      <span className="text-sm text-neutral-700">{EVENT_LABELS[e.event] || e.event}</span>
                      <span className="text-sm font-semibold text-neutral-900">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily trends */}
              {data.trends.length > 1 && (
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-4">Daily Trends</h3>
                  <div className="overflow-x-auto">
                    <div className="flex items-end gap-1 min-w-[400px]" style={{ height: 120 }}>
                      {data.trends.map(d => {
                        const maxEvents = Math.max(...data.trends.map(t => t.events), 1)
                        const h = Math.max((d.events / maxEvents) * 100, 2)
                        return (
                          <div key={d.date} className="flex-1 group relative" title={`${d.date}: ${d.events} events, ${d.visitors} visitors`}>
                            <div
                              className="w-full bg-violet-400 rounded-t transition-all group-hover:bg-violet-600"
                              style={{ height: `${h}%` }}
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                              {d.date}: {d.events} events
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-neutral-400">
                      <span>{data.trends[0]?.date}</span>
                      <span>{data.trends[data.trends.length - 1]?.date}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Articles tab */}
          {tab === 'articles' && (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-neutral-50 text-left">
                    <th className="px-4 py-3 font-semibold text-neutral-600">Article</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600 text-right">Events</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600 text-right">Visitors</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600 text-right">Widgets Used</th>
                  </tr>
                </thead>
                <tbody>
                  {data.article_breakdown.map(a => (
                    <tr key={a.article_slug} className="border-b last:border-0 hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-800">{a.article_slug}</td>
                      <td className="px-4 py-3 text-right font-semibold">{a.total_events}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">{a.unique_visitors}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">{a.unique_widgets}</td>
                    </tr>
                  ))}
                  {!data.article_breakdown.length && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No article engagement yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Quiz results tab */}
          {tab === 'quizzes' && (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-neutral-50 text-left">
                    <th className="px-4 py-3 font-semibold text-neutral-600">Quiz</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Article</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Result</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600 text-right">Score</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600 text-right">When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.quiz_results.map((q, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-700">{q.quiz_title || '—'}</td>
                      <td className="px-4 py-3 text-neutral-600">{q.article_slug}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                          {q.result_title || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{q.total_score ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-neutral-400 text-xs">{formatTime(q.created_at)}</td>
                    </tr>
                  ))}
                  {!data.quiz_results.length && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No quiz completions yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent events tab */}
          {tab === 'recent' && (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-neutral-50 text-left">
                    <th className="px-4 py-3 font-semibold text-neutral-600">Time</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Event</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Widget</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Article</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((e, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">{formatTime(e.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-neutral-700">{EVENT_LABELS[e.event_name] || e.event_name}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600">{WIDGET_LABELS[e.widget_type] || e.widget_type}</td>
                      <td className="px-4 py-3 text-xs text-neutral-600">{e.article_slug}</td>
                      <td className="px-4 py-3 text-xs text-neutral-400 max-w-[200px] truncate">
                        {e.metadata && Object.keys(e.metadata).length > 0
                          ? Object.entries(e.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                  {!data.recent.length && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No events yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}

ContentEngagementDashboard.getLayout = (page) => page
