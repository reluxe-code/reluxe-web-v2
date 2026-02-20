// src/pages/admin/boulevard-sync.js
// Admin page: Boulevard Admin API connection test, backfill controls, sync monitoring.
import { useState, useCallback, useEffect, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

function StatusBadge({ status }) {
  const colors = {
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-neutral-100 text-neutral-600'}`}>
      {status}
    </span>
  )
}

export default function BoulevardSync() {
  // Connection test state
  const [testing, setTesting] = useState(false)
  const [connectionResult, setConnectionResult] = useState(null)

  // Backfill state
  const [backfilling, setBackfilling] = useState(false)
  const [backfillProgress, setBackfillProgress] = useState(null)

  // Sync log
  const [syncLogs, setSyncLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [dateRange, setDateRange] = useState(null)

  // Load sync logs + stats on mount
  useEffect(() => { loadSyncLogs(); loadStats(); loadDateRange() }, [])

  async function loadSyncLogs() {
    const { data } = await supabase
      .from('blvd_sync_log')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20)
    setSyncLogs(data || [])
  }

  async function loadStats() {
    const [appts, clients, services] = await Promise.all([
      supabase.from('blvd_appointments').select('id', { count: 'exact', head: true }),
      supabase.from('blvd_clients').select('id', { count: 'exact', head: true }),
      supabase.from('blvd_appointment_services').select('id', { count: 'exact', head: true }),
    ])
    setStats({
      appointments: appts.count || 0,
      clients: clients.count || 0,
      services: services.count || 0,
    })
  }

  async function loadDateRange() {
    const [earliest, latest] = await Promise.all([
      supabase
        .from('blvd_appointments')
        .select('start_at')
        .order('start_at', { ascending: true })
        .limit(1)
        .single(),
      supabase
        .from('blvd_appointments')
        .select('start_at')
        .order('start_at', { ascending: false })
        .limit(1)
        .single(),
    ])
    setDateRange({
      earliest: earliest.data?.start_at || null,
      latest: latest.data?.start_at || null,
    })
  }

  // Test connection
  const handleTest = useCallback(async () => {
    setTesting(true)
    setConnectionResult(null)
    try {
      const res = await fetch('/api/admin/blvd-sync/discover')
      const json = await res.json()
      setConnectionResult(json)
    } catch (e) {
      setConnectionResult({ connected: false, error: e.message })
    } finally {
      setTesting(false)
    }
  }, [])

  // Run backfill (full or resume)
  const backfillRef = useRef(false)
  const runBackfill = useCallback(async (opts = {}) => {
    if (backfillRef.current) return
    backfillRef.current = true
    setBackfilling(true)

    let cursor = opts.cursor || null
    let syncLogId = opts.syncLogId || null
    let locationIndex = opts.locationIndex || 0
    let totalProcessed = 0
    let totalCreated = 0
    let pageNum = 0
    const stopBeforeDate = opts.stopBeforeDate || null

    try {
      while (true) {
        pageNum++
        setBackfillProgress({
          page: pageNum,
          processed: totalProcessed,
          created: totalCreated,
          status: 'fetching',
          locationIndex,
        })

        const res = await fetch('/api/admin/blvd-sync/backfill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cursor, syncLogId, locationIndex, stopBeforeDate }),
        })

        let json
        try {
          json = await res.json()
        } catch {
          // API returned non-JSON (HTML error page)
          setBackfillProgress((prev) => ({
            ...prev,
            status: 'error',
            error: `Server returned non-JSON (status ${res.status}). Boulevard may be rate-limiting. Wait a few minutes and resume.`,
          }))
          break
        }

        if (!res.ok) {
          setBackfillProgress((prev) => ({ ...prev, status: 'error', error: json.error }))
          break
        }

        syncLogId = json.syncLogId
        totalProcessed += json.processed || 0
        totalCreated += json.created || 0
        cursor = json.nextCursor
        locationIndex = json.locationIndex ?? locationIndex

        setBackfillProgress({
          page: pageNum,
          processed: totalProcessed,
          created: totalCreated,
          status: json.done ? 'done' : 'fetching',
          locationName: json.locationName,
          locationIndex,
          oldestSeen: json.oldestSeen,
          syncLogId,
        })

        if (json.done) break
      }
    } catch (e) {
      setBackfillProgress((prev) => ({
        ...prev,
        status: 'error',
        error: e.message,
      }))
    } finally {
      backfillRef.current = false
      setBackfilling(false)
      loadSyncLogs()
      loadStats()
      loadDateRange()
    }
  }, [])

  // Resume from last failed sync
  const handleResume = useCallback(async () => {
    const lastFailed = syncLogs.find((l) => l.status === 'failed' && l.sync_type === 'backfill')
    if (!lastFailed) return
    const meta = lastFailed.metadata || {}
    runBackfill({
      cursor: lastFailed.cursor || null,
      syncLogId: null, // create new log entry
      locationIndex: meta.locationIndex || 0,
      stopBeforeDate: meta.stopBeforeDate || null,
    })
  }, [syncLogs, runBackfill])

  // Backfill gap (from 12/1/2023 target)
  const handleBackfillGap = useCallback(() => {
    runBackfill({ stopBeforeDate: '2023-12-01' })
  }, [runBackfill])

  // Manual incremental sync
  const handleIncrementalSync = useCallback(async () => {
    setBackfilling(true)
    setBackfillProgress({ status: 'running incremental sync...' })
    try {
      const res = await fetch('/api/admin/blvd-sync/incremental', { method: 'POST' })
      const json = await res.json()
      setBackfillProgress({
        processed: json.processed,
        created: json.created,
        status: res.ok ? 'done' : 'error',
        error: json.error,
      })
    } catch (e) {
      setBackfillProgress({ status: 'error', error: e.message })
    } finally {
      setBackfilling(false)
      loadSyncLogs()
      loadStats()
      loadDateRange()
    }
  }, [])

  const lastFailed = syncLogs.find((l) => l.status === 'failed' && l.sync_type === 'backfill')
  const hasGap = dateRange?.earliest && new Date(dateRange.earliest) > new Date('2023-12-01')

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Boulevard Data Sync</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Sync appointment data from Boulevard. Auto-sync runs every 15 min during business hours, every 2h off-hours.
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.appointments.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Appointments</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.clients.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Clients</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.services.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Service Line Items</p>
          </div>
        </div>
      )}

      {/* Date range */}
      {dateRange && (dateRange.earliest || dateRange.latest) && (
        <div className="bg-white rounded-lg border p-4 mb-6 flex items-center gap-6">
          <div>
            <p className="text-xs text-neutral-500">Earliest Record</p>
            <p className="text-sm font-medium">
              {dateRange.earliest ? new Date(dateRange.earliest).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div className="h-6 w-px bg-neutral-200" />
          <div>
            <p className="text-xs text-neutral-500">Latest Record</p>
            <p className="text-sm font-medium">
              {dateRange.latest ? new Date(dateRange.latest).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
          {hasGap && (
            <>
              <div className="h-6 w-px bg-neutral-200" />
              <p className="text-xs text-amber-600 font-medium">
                Gap: records before {new Date(dateRange.earliest).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} are missing
              </p>
            </>
          )}
        </div>
      )}

      {/* Connection test */}
      <div className="bg-white rounded-xl border mb-6">
        <div className="px-4 py-3 border-b bg-neutral-50 flex items-center justify-between rounded-t-xl">
          <h2 className="text-sm font-semibold">1. Test Connection</h2>
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Admin API'}
          </button>
        </div>
        <div className="p-4">
          {connectionResult ? (
            connectionResult.connected ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">Connected</span>
                  <span className="text-xs text-neutral-500">
                    &mdash; {connectionResult.business?.name}
                  </span>
                </div>
                {connectionResult.queries?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">
                      Available queries ({connectionResult.queries.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {connectionResult.queries.slice(0, 30).map((q) => (
                        <span
                          key={q.name}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            ['appointments', 'clients', 'staff'].includes(q.name)
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-50 text-neutral-500 border'
                          }`}
                        >
                          {q.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <details className="mt-3">
                  <summary className="text-xs text-neutral-400 cursor-pointer">Raw response</summary>
                  <pre className="mt-2 text-[10px] bg-neutral-50 rounded p-2 overflow-auto max-h-48">
                    {JSON.stringify(connectionResult, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-700">Not connected</span>
                </div>
                <p className="text-xs text-red-600 font-mono break-all">
                  {connectionResult.error}
                </p>
                {connectionResult.url && (
                  <p className="text-[10px] text-neutral-400 mt-1">Endpoint: {connectionResult.url}</p>
                )}
              </div>
            )
          ) : (
            <p className="text-sm text-neutral-400">
              Click &quot;Test Admin API&quot; to verify your credentials.
            </p>
          )}
        </div>
      </div>

      {/* Sync controls */}
      <div className="bg-white rounded-xl border mb-6">
        <div className="px-4 py-3 border-b bg-neutral-50 flex items-center justify-between rounded-t-xl">
          <h2 className="text-sm font-semibold">2. Sync Data</h2>
          <div className="flex gap-2">
            <button
              onClick={handleIncrementalSync}
              disabled={backfilling}
              className="px-4 py-1.5 bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-300 disabled:opacity-50"
            >
              Sync Now
            </button>
            {lastFailed && (
              <button
                onClick={handleResume}
                disabled={backfilling}
                className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                Resume Failed Backfill
              </button>
            )}
            {hasGap && (
              <button
                onClick={handleBackfillGap}
                disabled={backfilling}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                Backfill to Dec 2023
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          {backfillProgress ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                {backfillProgress.status === 'done' ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ) : backfillProgress.status === 'error' ? (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
                <span className="text-sm font-medium">
                  {backfillProgress.status === 'done'
                    ? 'Sync complete'
                    : backfillProgress.status === 'error'
                      ? 'Sync failed'
                      : `Syncing${backfillProgress.locationName ? ` ${backfillProgress.locationName}` : ''} — page ${backfillProgress.page || ''}...`}
                </span>
              </div>
              {(backfillProgress.processed > 0 || backfillProgress.created > 0) && (
                <p className="text-xs text-neutral-500">
                  Processed: {backfillProgress.processed} | Created: {backfillProgress.created}
                  {backfillProgress.oldestSeen && ` | Oldest: ${backfillProgress.oldestSeen}`}
                </p>
              )}
              {backfillProgress.error && (
                <p className="text-xs text-red-600 mt-1 font-mono">{backfillProgress.error}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">
              &quot;Sync Now&quot; fetches recent changes. Backfill pulls historical data with throttling to avoid rate limits.
            </p>
          )}
        </div>
      </div>

      {/* Sync log */}
      {syncLogs.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl flex items-center justify-between">
            <h2 className="text-sm font-semibold">Sync History</h2>
            <button
              onClick={() => { loadSyncLogs(); loadStats(); loadDateRange() }}
              className="text-xs text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Type</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Records</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Started</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Error</th>
              </tr>
            </thead>
            <tbody>
              {syncLogs.map((log) => (
                <tr key={log.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-2 font-medium text-xs">{log.sync_type}</td>
                  <td className="px-4 py-2"><StatusBadge status={log.status} /></td>
                  <td className="px-4 py-2 text-xs text-neutral-500">
                    {log.records_processed || 0} processed, {log.records_created || 0} created
                  </td>
                  <td className="px-4 py-2 text-xs text-neutral-500">
                    {new Date(log.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-xs text-red-500 max-w-[200px] truncate">
                    {log.error || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
