import { useCallback, useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function money(v) {
  return `$${Math.round(Number(v || 0)).toLocaleString()}`
}

function pct(v) {
  const n = Number(v || 0)
  return `${n > 0 ? '+' : ''}${n}%`
}

function SnapshotBlock({ title, row }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <p className="text-neutral-500">Service Revenue</p><p className="text-right font-medium">{money(row.service_revenue)}</p>
        <p className="text-neutral-500">Deferred Revenue</p><p className="text-right font-medium">{money(row.deferred_revenue)}</p>
        <p className="text-neutral-500">Product Sales</p><p className="text-right font-medium">{money(row.product_sales)}</p>
        <p className="text-neutral-500">Bookings</p><p className="text-right font-medium">{row.bookings.toLocaleString()}</p>
        <p className="text-neutral-500">Cancellations</p><p className="text-right font-medium">{row.cancellations.toLocaleString()}</p>
        <p className="text-neutral-500">Cancelled to Rescheduled (2w)</p><p className="text-right font-medium">{row.cancellations_rescheduled_2w.toLocaleString()} ({row.cancellation_reschedule_rate_pct}%)</p>
      </div>
    </div>
  )
}

export default function DailySnapshotPage() {
  const Layout = AdminLayout
  const RenderSnapshotBlock = SnapshotBlock
  const [location, setLocation] = useState('total')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/intelligence/daily-snapshot?location=${location}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load daily snapshot')
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => {
    load()
  }, [load])

  const handleSyncAndRefresh = useCallback(async () => {
    setSyncing(true)
    setSyncStatus(null)
    setError(null)

    let incremental = null
    let products = null
    let incrementalErr = null
    let productsErr = null

    try {
      const res = await fetch('/api/admin/blvd-sync/incremental', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Appointment sync failed')
      incremental = json
    } catch (e) {
      incrementalErr = e.message
    }

    try {
      const res = await fetch('/api/admin/blvd-sync/product-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'latest' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Product sync failed')
      products = json
    } catch (e) {
      productsErr = e.message
    }

    await load()

    if (incrementalErr || productsErr) {
      setSyncStatus({
        ok: false,
        message: `Partial sync: ${incrementalErr ? `appointments failed (${incrementalErr})` : `appointments updated (${incremental?.processed || 0} checked)`}; ${productsErr ? `products failed (${productsErr})` : `products synced (${products?.synced_rows || 0} rows)`}.`,
      })
    } else {
      setSyncStatus({
        ok: true,
        message: `Synced latest data: appointments processed ${incremental?.processed || 0}, product rows synced ${products?.synced_rows || 0}.`,
      })
    }

    setSyncing(false)
  }, [load])

  const current = data?.metrics?.[location]
  if (!Layout || !RenderSnapshotBlock) return null

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Snapshot</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Owner daily scorecard for service/product revenue, bookings, cancellations, and rescheduling.
          </p>
        </div>
        <div className="flex gap-2">
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="total">Total</option>
            <option value="westfield">Westfield Only</option>
            <option value="carmel">Carmel Only</option>
          </select>
          <button
            onClick={handleSyncAndRefresh}
            disabled={loading || syncing}
            className="px-4 py-2 border rounded-lg text-xs font-medium bg-white hover:bg-neutral-50 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Latest Data'}
          </button>
          <button onClick={load} disabled={loading} className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {syncStatus ? (
        <div className={`mb-5 rounded-lg border p-4 text-sm ${syncStatus.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          {syncStatus.message}
        </div>
      ) : null}

      {data?.notes?.deferred_revenue_note ? (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {data.notes.deferred_revenue_note}
        </div>
      ) : null}

      {data?.generated_at ? (
        <p className="text-xs text-neutral-500 mb-4">
          Snapshot generated: {new Date(data.generated_at).toLocaleString()}
        </p>
      ) : null}

      {current && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
            <RenderSnapshotBlock title="Today" row={current.today} />
            <RenderSnapshotBlock title="This Week" row={current.week} />
            <RenderSnapshotBlock title="This Month" row={current.month} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-neutral-500">Week Pace vs Last Week</p>
              <p className="text-3xl font-bold mt-1">{pct(current.pace.week_vs_last_week_pct)}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {money(current.pace.week_service_revenue)} vs {money(current.pace.previous_week_service_revenue)}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-neutral-500">Month Pace vs Prior Month-to-Date</p>
              <p className="text-3xl font-bold mt-1">{pct(current.pace.month_vs_last_month_to_date_pct)}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {money(current.pace.month_service_revenue)} vs {money(current.pace.previous_month_to_date_service_revenue)}
              </p>
            </div>
          </div>
        </>
      )}

      {loading && !data ? (
        <p className="text-sm text-neutral-500">Loading snapshot...</p>
      ) : null}
    </Layout>
  )
}
