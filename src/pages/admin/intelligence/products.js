import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      {sub ? <p className="text-xs text-neutral-400 mt-1">{sub}</p> : null}
    </div>
  )
}

function pctLabel(value) {
  const n = Number(value || 0)
  if (n > 0) return `+${n}%`
  return `${n}%`
}

function currency(value) {
  return `$${Math.round(Number(value || 0)).toLocaleString()}`
}

export default function ProductIntelligencePage() {
  const Layout = AdminLayout
  const RenderStatCard = StatCard
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [error, setError] = useState(null)

  const [provider, setProvider] = useState('all')
  const [months, setMonths] = useState('12')
  const [journeySku, setJourneySku] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ provider, months })
      if (journeySku) params.set('sku', journeySku)

      const res = await fetch(`/api/admin/intelligence/products?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load product intelligence')

      setData(json)
      if (!journeySku && json.journey?.sku_key) {
        setJourneySku(json.journey.sku_key)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [provider, months, journeySku])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSync = useCallback(async (mode = 'latest', fullRefresh = false) => {
    setSyncing(true)
    setError(null)
    setSyncResult(null)
    try {
      const res = await fetch('/api/admin/blvd-sync/product-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, fullRefresh }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Sync failed')
      setSyncResult(json)
      await loadData()
    } catch (e) {
      setError(e.message)
    } finally {
      setSyncing(false)
    }
  }, [loadData])

  const providers = data?.filters?.providers || []
  const summary = data?.summary
  const monthly = useMemo(() => data?.monthly || [], [data?.monthly])
  const skuForecasts = data?.sku_forecasts || []
  const productTrends = data?.product_trends
  const journey = data?.journey
  const limitations = data?.limitations || []

  const maxMonthlySales = useMemo(() => {
    return Math.max(1, ...monthly.map((m) => Number(m.sales || 0)))
  }, [monthly])

  if (!Layout || !RenderStatCard) return null

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Product Intelligence</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Retail skincare sales dashboard with provider filtering, demand forecasts, re-buy behavior, and journey cohorts.
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {syncResult ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Synced {syncResult.synced_rows || 0} rows from {syncResult.parsed_rows || 0} parsed lines.
          {(syncResult.dropped_duplicate_rows || 0) > 0 ? ` Dropped ${syncResult.dropped_duplicate_rows} duplicate rows in this batch.` : ''}
          {syncResult.sold_at_min && syncResult.sold_at_max ? ` Date range: ${new Date(syncResult.sold_at_min).toLocaleDateString()} to ${new Date(syncResult.sold_at_max).toLocaleDateString()}.` : ''}
          {syncResult.full_refresh ? ' Full refresh mode was used.' : ' Append mode was used (history preserved).'}
          {syncResult.summary_mode ? ' Report is in summary mode (no row-level date/provider/client columns), so some insights are limited.' : ''}
        </div>
      ) : null}

      {limitations.length > 0 ? (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {limitations.join(' ')}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Providers</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
          <option value="18">Last 18 months</option>
          <option value="24">Last 24 months</option>
        </select>

        <select
          value={journeySku}
          onChange={(e) => setJourneySku(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white min-w-[240px]"
        >
          <option value="">Journey SKU (auto)</option>
          {skuForecasts.map((row) => (
            <option key={row.sku_key} value={row.sku_key}>{row.product_name}</option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => handleSync('latest')}
            disabled={syncing}
            className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium hover:bg-neutral-300 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Products (Append)'}
          </button>
          <button
            onClick={() => {
              if (!window.confirm('This will clear existing synced product data and reload from the latest export. Continue?')) return
              handleSync('latest', true)
            }}
            disabled={syncing}
            className="px-4 py-2 bg-amber-100 text-amber-900 rounded-lg text-xs font-medium hover:bg-amber-200 disabled:opacity-50"
          >
            {syncing ? 'Resetting...' : 'Reset + Sync'}
          </button>
          <button
            onClick={() => handleSync('create')}
            disabled={syncing}
            className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {syncing ? 'Running...' : 'Run New Report Export'}
          </button>
        </div>
      </div>

      {summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-7">
          <RenderStatCard label="Product Sales" value={currency(summary.total_sales)} sub={`${summary.total_orders.toLocaleString()} orders`} />
          <RenderStatCard label="Sales Trend (MoM)" value={pctLabel(summary.mom_sales_trend_pct)} sub="month over month" />
          <RenderStatCard label="Units Sold" value={Math.round(summary.total_units).toLocaleString()} sub={`${pctLabel(summary.mom_units_trend_pct)} MoM`} />
          <RenderStatCard label="Avg Order Size" value={currency(summary.avg_order_size)} sub="per product order" />
          <RenderStatCard label="Re-buy Rate" value={`${summary.rebuy_rate_pct}%`} sub={`Cross-sell ${summary.cross_sell_rate_pct}%`} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-7">
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-semibold mb-3">Sales by Month</h2>
          <div className="space-y-2">
            {monthly.map((m) => {
              const width = `${Math.max(2, (Number(m.sales || 0) / maxMonthlySales) * 100)}%`
              return (
                <div key={m.month}>
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>{m.month}</span>
                    <span>{currency(m.sales)} · {Math.round(m.units)} units</span>
                  </div>
                  <div className="h-2 rounded bg-neutral-100 overflow-hidden">
                    <div className="h-full bg-black rounded" style={{ width }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-semibold mb-3">Product/Service Correspondence</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border rounded p-3">
              <p className="text-xl font-bold">{summary?.product_buyer_service_attach_rate_pct || 0}%</p>
              <p className="text-xs text-neutral-500">Product buyers with services</p>
            </div>
            <div className="border rounded p-3">
              <p className="text-xl font-bold">{summary?.service_to_product_conversion_pct || 0}%</p>
              <p className="text-xs text-neutral-500">Service clients buying product</p>
            </div>
          </div>
          <p className="text-xs font-medium text-neutral-700 mb-2">Top services among product buyers</p>
          <div className="space-y-1 max-h-52 overflow-auto">
            {(productTrends?.top_services_among_buyers || []).map((row) => (
              <div key={row.service_slug} className="flex items-center justify-between text-xs border rounded px-2 py-1.5">
                <span>{row.service_slug}</span>
                <span>{row.lines.toLocaleString()} visits</span>
              </div>
            ))}
            {!productTrends?.top_services_among_buyers?.length ? (
              <p className="text-xs text-neutral-500">No service linkage data yet.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-5 mb-7">
        <h2 className="font-semibold mb-3">Purchase Estimator (30/90 Days)</h2>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">SKU / Product</th>
                <th className="py-2 pr-3">Units 30d</th>
                <th className="py-2 pr-3">Units 90d</th>
                <th className="py-2 pr-3">Forecast 30d</th>
                <th className="py-2 pr-3">Forecast 90d</th>
                <th className="py-2 pr-3">Suggested 30d</th>
                <th className="py-2 pr-3">Suggested 90d</th>
                <th className="py-2 pr-3">Re-buy</th>
              </tr>
            </thead>
            <tbody>
              {skuForecasts.slice(0, 20).map((row) => (
                <tr key={row.sku_key} className="border-b last:border-b-0">
                  <td className="py-2 pr-3">
                    <p className="font-medium">{row.product_name}</p>
                    <p className="text-neutral-500">{row.sku || row.sku_key}</p>
                  </td>
                  <td className="py-2 pr-3">{Math.round(row.units_30d)}</td>
                  <td className="py-2 pr-3">{Math.round(row.units_90d)}</td>
                  <td className="py-2 pr-3">{row.forecast_30d}</td>
                  <td className="py-2 pr-3">{row.forecast_90d}</td>
                  <td className="py-2 pr-3 font-semibold">{row.suggested_order_30d}</td>
                  <td className="py-2 pr-3 font-semibold">{row.suggested_order_90d}</td>
                  <td className="py-2 pr-3">{row.repeat_rate_pct}%</td>
                </tr>
              ))}
              {!skuForecasts.length ? (
                <tr>
                  <td colSpan={8} className="py-4 text-neutral-500">No product sales yet. Run product sync to populate forecasting.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-5">
        <h2 className="font-semibold mb-1">Product Experience Journeys</h2>
        <p className="text-xs text-neutral-500 mb-4">
          AlphaRet-style lifecycle messaging cohorts by days since last purchase for the selected SKU.
        </p>

        {journey?.stages?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {journey.stages.map((stage) => (
              <div key={stage.key} className="border rounded-lg p-3">
                <p className="text-sm font-semibold">{stage.label}</p>
                <p className="text-2xl font-bold mt-1">{stage.eligible_count}</p>
                <p className="text-xs text-neutral-500 mt-1">{stage.message}</p>
                {stage.sample_clients?.length ? (
                  <div className="mt-2 space-y-1">
                    {stage.sample_clients.map((c) => (
                      <p key={`${stage.key}-${c.client_id}`} className="text-xs text-neutral-700">
                        {c.name} ({c.days_since}d)
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Pick a SKU with sales history to generate journey cohorts.</p>
        )}
      </div>

      {loading ? <p className="text-sm text-neutral-500 mt-4">Loading...</p> : null}
    </Layout>
  )
}
