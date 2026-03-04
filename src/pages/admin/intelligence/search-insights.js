// src/pages/admin/intelligence/search-insights.js
// Search Insights Dashboard
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

function SortHeader({ label, field, sortBy, sortDir, onSort }) {
  const active = sortBy === field
  return (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 cursor-pointer hover:text-neutral-800 select-none"
      onClick={() => onSort(field)}
    >
      {label}
      {active && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  )
}

export default function SearchInsightsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [tab, setTab] = useState('top') // top | zero | clicked | recent
  const [sortBy, setSortBy] = useState('count')
  const [sortDir, setSortDir] = useState('desc')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch(`/api/admin/intelligence/search-insights?days=${days}`)
      const json = await res.json()
      if (json.ok) setData(json)
    } catch {}
    setLoading(false)
  }, [days])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const sortRows = (rows, key) => {
    return [...rows].sort((a, b) => {
      const av = a[key] ?? 0, bv = b[key] ?? 0
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-500 animate-pulse">Loading search insights...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-neutral-500">
        <p>No search data available yet. Searches will appear here once users start searching.</p>
      </div>
    )
  }

  const { summary, dailyVolume, topQueries, zeroResultList, topClicked, recent, sourceBreakdown } = data
  const maxDaily = Math.max(...dailyVolume.map(d => d.count), 1)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Search Insights</h1>
          <p className="text-sm text-neutral-500 mt-1">Understand what your visitors are looking for</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                days === d ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard label="Total Searches" value={summary.totalSearches.toLocaleString()} color="violet" />
        <StatCard label="Unique Searchers" value={summary.uniqueDevices.toLocaleString()} color="blue" />
        <StatCard label="Click-Through Rate" value={`${summary.clickRate}%`} sub={`${summary.totalClicks} clicks`} color="emerald" />
        <StatCard label="Zero-Result Rate" value={`${summary.zeroResultRate}%`} sub={`${summary.zeroResultQueries} queries`} color="rose" />
        <StatCard label="Avg Results/Query" value={summary.avgResults} color="amber" />
      </div>

      {/* Source breakdown */}
      {sourceBreakdown && Object.keys(sourceBreakdown).length > 0 && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Search Sources</h3>
          <div className="flex gap-4">
            {Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
              <div key={src} className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 capitalize">{src.replace(/_/g, ' ')}</span>
                <span className="text-sm font-bold text-neutral-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily volume chart */}
      {dailyVolume.length > 0 && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4">Search Volume</h3>
          <div className="flex items-end gap-1" style={{ height: 120 }}>
            {dailyVolume.map(d => (
              <div
                key={d.date}
                className="flex-1 group relative"
                style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
              >
                <div
                  className="rounded-t"
                  style={{
                    height: `${(d.count / maxDaily) * 100}%`,
                    minHeight: d.count > 0 ? 4 : 0,
                    background: 'linear-gradient(180deg, #7C3AED, #C026D3)',
                    transition: 'height 0.3s',
                  }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-neutral-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10">
                  {d.date}: {d.count}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-neutral-400">
            <span>{dailyVolume[0]?.date}</span>
            <span>{dailyVolume[dailyVolume.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 mb-4 border-b">
        {[
          { key: 'top', label: 'Top Queries', count: topQueries.length },
          { key: 'zero', label: 'Zero Results', count: zeroResultList.length },
          { key: 'clicked', label: 'Top Clicked', count: topClicked.length },
          { key: 'recent', label: 'Recent', count: recent.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSortBy('count'); setSortDir('desc') }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              tab === t.key
                ? 'border-violet-500 text-violet-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-[10px] bg-neutral-100 rounded-full px-1.5 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Top Queries table */}
      {tab === 'top' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <SortHeader label="Query" field="query" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Count" field="count" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Avg Results" field="avgResults" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="CTR" field="clickRate" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Top Result</th>
              </tr>
            </thead>
            <tbody>
              {sortRows(topQueries, sortBy).map((q, i) => (
                <tr key={i} className="border-t hover:bg-neutral-50">
                  <td className="px-3 py-2.5 font-medium text-neutral-800">{q.query}</td>
                  <td className="px-3 py-2.5 text-neutral-600">{q.count}</td>
                  <td className="px-3 py-2.5 text-neutral-600">{q.avgResults}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      q.clickRate >= 50 ? 'bg-emerald-100 text-emerald-700' :
                      q.clickRate >= 20 ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {q.clickRate}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-neutral-500 max-w-xs truncate">
                    {q.topClicked ? (
                      <a href={q.topClicked.url} className="text-violet-600 hover:underline" target="_blank" rel="noopener">
                        {q.topClicked.title}
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              {topQueries.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-neutral-400">No queries yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Zero-Result Queries table */}
      {tab === 'zero' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-4 py-3 bg-rose-50 border-b border-rose-100">
            <p className="text-xs text-rose-700 font-medium">
              Content gaps — these queries found nothing. Consider creating content for frequently searched terms.
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <SortHeader label="Query" field="query" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Times Searched" field="count" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Last Searched</th>
              </tr>
            </thead>
            <tbody>
              {sortRows(zeroResultList, sortBy).map((z, i) => (
                <tr key={i} className="border-t hover:bg-neutral-50">
                  <td className="px-3 py-2.5 font-medium text-neutral-800">{z.query}</td>
                  <td className="px-3 py-2.5">
                    <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {z.count}x
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-neutral-500">
                    {new Date(z.lastSearched).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {zeroResultList.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-8 text-center text-neutral-400">No zero-result queries</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Clicked Results table */}
      {tab === 'clicked' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Page</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Type</th>
                <SortHeader label="Clicks" field="clickCount" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Avg Position" field="avgPosition" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sortRows(topClicked, sortBy).map((c, i) => (
                <tr key={i} className="border-t hover:bg-neutral-50">
                  <td className="px-3 py-2.5">
                    <a href={c.url} className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener">
                      {c.title || c.url}
                    </a>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{c.url}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600">
                      {c.type || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-neutral-700">{c.clickCount}</td>
                  <td className="px-3 py-2.5 text-neutral-600">{c.avgPosition != null ? `#${c.avgPosition + 1}` : '—'}</td>
                </tr>
              ))}
              {topClicked.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-neutral-400">No clicks yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Searches feed */}
      {tab === 'recent' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Query</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Results</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Clicked?</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Source</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Page</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Time</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i} className="border-t hover:bg-neutral-50">
                  <td className="px-3 py-2.5 font-medium text-neutral-800">{r.query}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.resultCount === 0 ? 'bg-rose-100 text-rose-700' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {r.resultCount}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {r.hadClick ? (
                      <span className="text-emerald-600 text-xs font-semibold">Yes</span>
                    ) : (
                      <span className="text-neutral-400 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-neutral-500 capitalize">{(r.source || 'overlay').replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2.5 text-xs text-neutral-400 max-w-[120px] truncate">{r.pagePath || '/'}</td>
                  <td className="px-3 py-2.5 text-xs text-neutral-400">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-neutral-400">No recent searches</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

SearchInsightsPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>
