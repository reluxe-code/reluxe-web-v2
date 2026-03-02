// src/pages/admin/intelligence/provider-scorecard.js
// Provider Scorecard — printable combined service + retail + Core 4 metrics.
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

const SCORE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#059669']
const SCORE_BG = ['bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-green-100 text-green-700', 'bg-emerald-100 text-emerald-700']

const slugLabels = {
  tox: 'Tox', filler: 'Filler', facials: 'Facials', 'laser-hair-removal': 'Laser Hair',
  ipl: 'IPL', 'iv-therapy': 'IV Therapy', prp: 'PRP', 'salt-sauna': 'Salt/Sauna',
  microneedling: 'Microneedling', peel: 'Peel',
}

function MetricBox({ label, value, sub, good }) {
  return (
    <div className="border rounded-lg p-3">
      <p className={`text-xl font-bold ${good === true ? 'text-emerald-600' : good === false ? 'text-red-600' : ''}`}>{value}</p>
      <p className="text-[10px] text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-neutral-400">{sub}</p>}
    </div>
  )
}

export default function ProviderScorecardPage() {
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/intelligence/provider-scorecard?provider_id=${id}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  if (!id) return <AdminLayout><p className="p-8 text-neutral-400">No provider ID specified.</p></AdminLayout>

  const provider = data?.provider
  const svc = data?.service_metrics || {}
  const retail = data?.retail_metrics || {}
  const core4 = data?.core4 || {}
  const monthly = data?.monthly || []
  const maxMonthly = Math.max(...monthly.map((m) => m.service_revenue + m.retail_revenue), 1)

  return (
    <AdminLayout>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          nav, header, .no-print, button { display: none !important; }
          .print-break { page-break-before: always; }
          body { font-size: 11px; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{provider?.name || 'Provider Scorecard'}</h1>
            {provider?.title && <p className="text-sm text-neutral-500">{provider.title}</p>}
            <p className="text-xs text-neutral-400 mt-1">Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="no-print flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800"
            >
              Print Scorecard
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-neutral-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading && !data ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
        ) : data && (
          <div className="space-y-6">
            {/* Service Metrics */}
            <section className="bg-white rounded-xl border p-5">
              <h2 className="text-sm font-semibold mb-4 text-violet-700">Service Performance</h2>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                <MetricBox label="Revenue" value={`$${svc.total_revenue?.toLocaleString()}`} />
                <MetricBox label="Rev/Hr" value={`$${svc.revenue_per_hour?.toLocaleString()}`} />
                <MetricBox label="Rebooking %" value={`${svc.rebooking_rate_pct}%`} good={svc.rebooking_rate_pct >= 50} />
                <MetricBox label="Cancel %" value={`${svc.cancellation_rate_pct}%`} good={svc.cancellation_rate_pct <= 10} />
                <MetricBox label="Appointments" value={svc.total_appointments?.toLocaleString()} />
                <MetricBox label="Unique Clients" value={svc.unique_clients?.toLocaleString()} />
              </div>
              {svc.top_services?.length > 0 && (
                <div className="mt-3 flex gap-1.5 flex-wrap">
                  <span className="text-[10px] text-neutral-400">Top Services:</span>
                  {svc.top_services.map((slug) => (
                    <span key={slug} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px]">
                      {slugLabels[slug] || slug}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Retail Metrics */}
            <section className="bg-white rounded-xl border p-5">
              <h2 className="text-sm font-semibold mb-4 text-violet-700">Retail Performance</h2>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <MetricBox label="Attachment Rate" value={`${retail.attachment_rate_pct}%`} sub="Appts with retail sale" good={retail.attachment_rate_pct >= 25} />
                <MetricBox label="Retail Revenue" value={`$${retail.total_retail_revenue?.toLocaleString()}`} />
                <MetricBox label="SKUs Sold" value={retail.unique_skus_sold} />
                <MetricBox label="Portfolio Variety" value={`${retail.portfolio_variety_pct}%`} sub="Unique SKUs / lines" />
                <MetricBox label="Retail Clients" value={retail.retail_clients} />
              </div>
            </section>

            {/* Core 4 */}
            <section className="bg-white rounded-xl border p-5">
              <h2 className="text-sm font-semibold mb-4 text-violet-700">Core 4 Protocol Adherence</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <MetricBox label="Protocol Adherence" value={`${core4.protocol_adherence_pct}%`} sub="Clients at 4/4" good={core4.protocol_adherence_pct >= 30} />
                <MetricBox label="Clients at 4/4" value={core4.clients_at_4 || 0} />
                <MetricBox label="Product Clients" value={core4.total_clients || 0} />
              </div>

              {/* Score Distribution Bar */}
              {core4.total_clients > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Core 4 Score Distribution</p>
                  <div className="space-y-2">
                    {(core4.distribution || []).map((d) => {
                      const maxCount = Math.max(...(core4.distribution || []).map((x) => x.count), 1)
                      return (
                        <div key={d.score} className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${SCORE_BG[d.score]}`}>
                            {d.score}
                          </span>
                          <div className="flex-1 bg-neutral-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.max((d.count / maxCount) * 100, 2)}%`, backgroundColor: SCORE_COLORS[d.score] }}
                            />
                          </div>
                          <span className="text-[10px] text-neutral-500 w-16 text-right">{d.count} ({d.pct}%)</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Monthly Trend */}
            <section className="bg-white rounded-xl border p-5 print-break">
              <h2 className="text-sm font-semibold mb-4 text-violet-700">Monthly Trend (12 Months)</h2>
              <div className="space-y-1.5">
                {monthly.map((m) => {
                  const total = m.service_revenue + m.retail_revenue
                  const svcPct = total > 0 ? (m.service_revenue / maxMonthly) * 100 : 0
                  const retPct = total > 0 ? (m.retail_revenue / maxMonthly) * 100 : 0
                  return (
                    <div key={m.month} className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500 w-16">{m.month}</span>
                      <div className="flex-1 flex h-5 gap-0.5">
                        {svcPct > 0 && (
                          <div className="bg-violet-400 rounded-sm h-full" style={{ width: `${svcPct}%` }} title={`Service: $${m.service_revenue.toLocaleString()}`} />
                        )}
                        {retPct > 0 && (
                          <div className="bg-emerald-400 rounded-sm h-full" style={{ width: `${retPct}%` }} title={`Retail: $${m.retail_revenue.toLocaleString()}`} />
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500 w-20 text-right">${total.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4 mt-3 text-[10px] text-neutral-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-400 inline-block" /> Service</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" /> Retail</span>
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

ProviderScorecardPage.getLayout = (page) => page
