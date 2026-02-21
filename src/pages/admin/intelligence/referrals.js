// src/pages/admin/intelligence/referrals.js
// Admin referral program intelligence dashboard.
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    violet: 'border-l-violet-500', emerald: 'border-l-emerald-500',
    rose: 'border-l-rose-500', blue: 'border-l-blue-500',
    neutral: 'border-l-neutral-400', amber: 'border-l-amber-500',
  }
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${borderColors[color] || 'border-l-neutral-400'} p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

function FunnelBar({ step, count, pct, maxCount }) {
  const width = maxCount > 0 ? Math.max((count / maxCount) * 100, 2) : 0
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-24 text-xs font-medium text-neutral-600 truncate">{step}</div>
      <div className="flex-1 relative">
        <div className="h-6 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
      <div className="w-16 text-right text-xs font-semibold text-neutral-700">{count.toLocaleString()}</div>
      <div className="w-12 text-right text-xs text-neutral-500">{pct}%</div>
    </div>
  )
}

const TIER_COLORS = {
  member: 'bg-neutral-100 text-neutral-600',
  advocate: 'bg-emerald-100 text-emerald-800',
  ambassador: 'bg-violet-100 text-violet-800',
  vip_ambassador: 'bg-amber-100 text-amber-800',
}

const STATUS_COLORS = {
  clicked: 'bg-neutral-100 text-neutral-600',
  booked: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  credited: 'bg-violet-100 text-violet-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-neutral-100 text-neutral-500',
  fraud_rejected: 'bg-red-200 text-red-800',
}

export default function ReferralsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(30)
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/intelligence/referrals?days=${days}&page=${page}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [days, page])

  useEffect(() => { fetchData() }, [fetchData])

  const exportCSV = () => {
    if (!data?.referrals?.length) return
    const headers = ['Code', 'Status', 'Referee', 'Channel', 'Reward', 'Location', 'Clicked', 'Booked', 'Completed', 'Credited']
    const rows = data.referrals.map(r => [
      r.code, r.status, r.referee, r.channel, `$${r.reward}`, r.location,
      r.clickedAt ? new Date(r.clickedAt).toLocaleDateString() : '',
      r.bookedAt ? new Date(r.bookedAt).toLocaleDateString() : '',
      r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '',
      r.creditedAt ? new Date(r.creditedAt).toLocaleDateString() : '',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `referrals-${days}d.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Referral Program</h1>
            <p className="text-sm text-neutral-500 mt-1">Give $25, Get $25 — referral funnel & analytics</p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => { setDays(d); setPage(1) }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition ${
                  days === d ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {d}d
              </button>
            ))}
            <button onClick={fetchData} className="px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 transition">
              Refresh
            </button>
          </div>
        </div>

        {loading && !data && (
          <div className="text-center py-16 text-neutral-400">Loading referral data...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">Error: {error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              <StatCard label="Total Referrals" value={data.summary.periodTotal.toLocaleString()} sub={`in ${days} days`} color="violet" />
              <StatCard label="Conversion Rate" value={`${data.summary.conversionRate}%`} sub="click → credit" color="emerald" />
              <StatCard label="Credits Issued" value={`$${data.summary.creditsIssued.toLocaleString()}`} sub={`in ${days} days`} color="blue" />
              <StatCard label="Total Earned (All Time)" value={`$${data.summary.totalEarned.toLocaleString()}`} sub={`${data.summary.totalCompleted} credited`} color="amber" />
              <StatCard label="Active Referrers" value={data.summary.activeReferrers} sub={`of ${data.summary.totalReferrers} total`} color="neutral" />
            </div>

            {/* Fraud / self-ref alerts */}
            {(data.summary.selfReferrals > 0 || data.summary.fraudFlagged > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                <span className="text-amber-500 text-lg">&#9888;</span>
                <div className="text-sm text-amber-800">
                  {data.summary.selfReferrals > 0 && <p>{data.summary.selfReferrals} self-referral{data.summary.selfReferrals !== 1 ? 's' : ''} blocked</p>}
                  {data.summary.fraudFlagged > 0 && <p>{data.summary.fraudFlagged} referral{data.summary.fraudFlagged !== 1 ? 's' : ''} flagged for review</p>}
                </div>
              </div>
            )}

            {/* Funnel + Channel side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Funnel */}
              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h2 className="text-sm font-semibold text-neutral-700 mb-4">Conversion Funnel</h2>
                {['clicked', 'booked', 'completed', 'credited'].map(step => {
                  const count = data.funnel[step] || 0
                  const pct = data.funnel.clicked > 0
                    ? ((count / data.funnel.clicked) * 100).toFixed(1)
                    : '0.0'
                  return (
                    <FunnelBar
                      key={step}
                      step={step.charAt(0).toUpperCase() + step.slice(1)}
                      count={count}
                      pct={pct}
                      maxCount={data.funnel.clicked || 1}
                    />
                  )
                })}
                {(data.funnel.cancelled > 0 || data.funnel.expired > 0) && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex gap-4 text-xs text-neutral-500">
                    {data.funnel.cancelled > 0 && <span>Cancelled: {data.funnel.cancelled}</span>}
                    {data.funnel.expired > 0 && <span>Expired: {data.funnel.expired}</span>}
                  </div>
                )}
              </div>

              {/* Channel breakdown */}
              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h2 className="text-sm font-semibold text-neutral-700 mb-4">Share Channels</h2>
                {data.channelBreakdown.length === 0 ? (
                  <p className="text-sm text-neutral-400 py-4 text-center">No shares recorded yet</p>
                ) : (
                  <div className="space-y-2">
                    {data.channelBreakdown.map(ch => {
                      const maxCh = data.channelBreakdown[0]?.count || 1
                      return (
                        <div key={ch.channel} className="flex items-center gap-3">
                          <div className="w-24 text-xs font-medium text-neutral-600 capitalize">{ch.channel.replace(/_/g, ' ')}</div>
                          <div className="flex-1">
                            <div className="h-5 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-400 rounded-full"
                                style={{ width: `${Math.max((ch.count / maxCh) * 100, 4)}%` }}
                              />
                            </div>
                          </div>
                          <div className="w-10 text-right text-xs font-semibold text-neutral-700">{ch.count}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Top referrers */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-8 overflow-x-auto">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Top Referrers</h2>
              {data.topReferrers.length === 0 ? (
                <p className="text-sm text-neutral-400 py-4 text-center">No referrers with activity yet</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-500">
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-left py-2 font-medium">Code</th>
                      <th className="text-center py-2 font-medium">Tier</th>
                      <th className="text-right py-2 font-medium">Shares</th>
                      <th className="text-right py-2 font-medium">Clicks</th>
                      <th className="text-right py-2 font-medium">Booked</th>
                      <th className="text-right py-2 font-medium">Completed</th>
                      <th className="text-right py-2 font-medium">Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topReferrers.map((r, i) => (
                      <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50">
                        <td className="py-2 font-medium text-neutral-800">{r.name}</td>
                        <td className="py-2 font-mono text-neutral-500">{r.code}</td>
                        <td className="py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${TIER_COLORS[r.tier] || TIER_COLORS.member}`}>
                            {r.tier.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2 text-right text-neutral-600">{r.shares}</td>
                        <td className="py-2 text-right text-neutral-600">{r.clicks}</td>
                        <td className="py-2 text-right text-neutral-600">{r.booked}</td>
                        <td className="py-2 text-right font-semibold text-neutral-800">{r.completed}</td>
                        <td className="py-2 text-right font-semibold text-emerald-700">${r.earned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pending credits */}
            {data.pendingCredits.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8">
                <h2 className="text-sm font-semibold text-amber-800 mb-3">
                  Pending Credits ({data.pendingCredits.length})
                </h2>
                <p className="text-xs text-amber-700 mb-3">Referrals awaiting appointment completion before referrer credit is issued.</p>
                <div className="space-y-2">
                  {data.pendingCredits.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs bg-white/60 rounded p-2">
                      <span className="text-neutral-700">
                        {p.referee_phone ? `***-***-${p.referee_phone.slice(-4)}` : p.referee_email || 'Unknown'}
                      </span>
                      <span className="text-neutral-500">
                        {p.location_key || '-'}
                      </span>
                      <span className="text-neutral-400">
                        Booked {p.booked_at ? new Date(p.booked_at).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All referrals table */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-700">
                  All Referrals
                  <span className="ml-2 text-xs font-normal text-neutral-400">
                    ({data.pagination.total} total)
                  </span>
                </h2>
                <button
                  onClick={exportCSV}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 transition"
                >
                  Export CSV
                </button>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-500">
                    <th className="text-left py-2 font-medium">Code</th>
                    <th className="text-center py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Referee</th>
                    <th className="text-left py-2 font-medium">Channel</th>
                    <th className="text-right py-2 font-medium">Reward</th>
                    <th className="text-left py-2 font-medium">Location</th>
                    <th className="text-left py-2 font-medium">Clicked</th>
                    <th className="text-left py-2 font-medium">Booked</th>
                    <th className="text-left py-2 font-medium">Credited</th>
                    <th className="text-center py-2 font-medium">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                      <td className="py-2 font-mono text-neutral-500">{r.code}</td>
                      <td className="py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[r.status] || STATUS_COLORS.clicked}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 text-neutral-700">{r.referee}</td>
                      <td className="py-2 text-neutral-500 capitalize">{r.channel.replace(/_/g, ' ')}</td>
                      <td className="py-2 text-right text-neutral-700">${r.reward}</td>
                      <td className="py-2 text-neutral-500 capitalize">{r.location}</td>
                      <td className="py-2 text-neutral-400">{r.clickedAt ? new Date(r.clickedAt).toLocaleDateString() : '-'}</td>
                      <td className="py-2 text-neutral-400">{r.bookedAt ? new Date(r.bookedAt).toLocaleDateString() : '-'}</td>
                      <td className="py-2 text-neutral-400">{r.creditedAt ? new Date(r.creditedAt).toLocaleDateString() : '-'}</td>
                      <td className="py-2 text-center">
                        {r.selfReferral && <span className="text-red-500" title="Self-referral">S</span>}
                        {r.fraudFlags?.length > 0 && <span className="text-amber-500 ml-1" title={r.fraudFlags.join(', ')}>F</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-400">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1 text-xs rounded border border-neutral-200 text-neutral-600 disabled:opacity-40 hover:border-neutral-300"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page >= data.pagination.totalPages}
                      className="px-3 py-1 text-xs rounded border border-neutral-200 text-neutral-600 disabled:opacity-40 hover:border-neutral-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
