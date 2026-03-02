// src/pages/admin/boulevard-sync.js
// Admin page: Boulevard Admin API connection test, backfill controls, sync monitoring.
import { useState, useCallback, useEffect, useRef, Fragment, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'
import { useClientJit, jitDisplayName, jitContactInfo } from '@/hooks/useClientJit'

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
  const [expandedLogId, setExpandedLogId] = useState(null)

  // Entity browser
  const [entityTab, setEntityTab] = useState('clients')
  const [entityData, setEntityData] = useState([])
  const [entityCount, setEntityCount] = useState(0)
  const [entityPage, setEntityPage] = useState(1)
  const [entityLoading, setEntityLoading] = useState(false)
  const [entitySearch, setEntitySearch] = useState('')
  const [entitySearchInput, setEntitySearchInput] = useState('')
  const [entityFilters, setEntityFilters] = useState({})
  const entitySearchTimer = useRef(null)

  // JIT client name resolution for clients tab
  const clientBoulevardIds = useMemo(() =>
    entityTab === 'clients' ? entityData.map(r => r.boulevard_id).filter(Boolean) : [],
    [entityTab, entityData]
  )
  const { clients: jitClients } = useClientJit(clientBoulevardIds)

  // Load sync logs + stats on mount
  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      const res = await adminFetch('/api/admin/blvd-sync/stats')
      const json = await res.json()
      setStats(json.stats)
      setDateRange(json.dateRange)
      setSyncLogs(json.syncLogs || [])
    } catch (e) {
      console.error('Failed to load dashboard stats:', e)
    }
  }

  // Entity browser: debounced search
  useEffect(() => {
    entitySearchTimer.current = setTimeout(() => setEntitySearch(entitySearchInput), 400)
    return () => clearTimeout(entitySearchTimer.current)
  }, [entitySearchInput])

  // Reset page on tab/filter/search change
  useEffect(() => { setEntityPage(1) }, [entityTab, entitySearch, entityFilters])

  const ENTITY_PAGE_SIZE = 25

  const loadEntityData = useCallback(async () => {
    setEntityLoading(true)
    try {
      const params = new URLSearchParams({ tab: entityTab, page: String(entityPage) })
      if (entitySearch) params.set('search', entitySearch)
      if (entityFilters.status) params.set('status', entityFilters.status)
      if (entityFilters.location) params.set('location', entityFilters.location)
      const res = await adminFetch(`/api/admin/blvd-sync/entities?${params}`)
      const json = await res.json()
      setEntityData(json.data || [])
      setEntityCount(json.count || 0)
    } catch (e) {
      console.error('Failed to load entities:', e)
      setEntityData([])
      setEntityCount(0)
    }
    setEntityLoading(false)
  }, [entityTab, entityPage, entitySearch, entityFilters])

  useEffect(() => { loadEntityData() }, [loadEntityData])

  // Test connection
  const handleTest = useCallback(async () => {
    setTesting(true)
    setConnectionResult(null)
    try {
      const res = await adminFetch('/api/admin/blvd-sync/discover')
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

        const res = await adminFetch('/api/admin/blvd-sync/backfill', {
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
      const res = await adminFetch('/api/admin/blvd-sync/incremental', { method: 'POST' })
      const text = await res.text()
      let json
      try {
        json = JSON.parse(text)
      } catch {
        // Function likely timed out — Vercel returns HTML
        setBackfillProgress({ status: 'error', error: 'Sync timed out. Check sync logs — the cron may have completed partially.' })
        return
      }
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
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.clients.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Clients</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.appointments.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Appointments</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.services.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Service Line Items</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.memberships.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Memberships</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold">{stats.packages.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Packages</p>
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
        <div className="bg-white rounded-xl border overflow-hidden mb-6">
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
                <th className="w-8 px-2 py-2" />
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Type</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Records</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Started</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Error</th>
              </tr>
            </thead>
            <tbody>
              {syncLogs.map((log) => {
                const isExpanded = expandedLogId === log.id
                const meta = log.metadata || {}
                const duration = log.completed_at && log.started_at
                  ? Math.round((new Date(log.completed_at) - new Date(log.started_at)) / 1000)
                  : null
                return (
                  <Fragment key={log.id}>
                    <tr
                      className="border-b hover:bg-neutral-50 cursor-pointer"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      <td className="px-2 py-2 text-neutral-400">
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
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
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-neutral-50/70 border-b">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            {duration != null && (
                              <div className="bg-white rounded-lg border p-2.5">
                                <p className="text-sm font-bold">{duration >= 60 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : `${duration}s`}</p>
                                <p className="text-[10px] text-neutral-500">Duration</p>
                              </div>
                            )}
                            <div className="bg-white rounded-lg border p-2.5">
                              <p className="text-sm font-bold">{log.records_processed || 0}</p>
                              <p className="text-[10px] text-neutral-500">Processed</p>
                            </div>
                            <div className="bg-white rounded-lg border p-2.5">
                              <p className="text-sm font-bold">{log.records_created || 0}</p>
                              <p className="text-[10px] text-neutral-500">Created</p>
                            </div>
                            {(log.records_updated > 0) && (
                              <div className="bg-white rounded-lg border p-2.5">
                                <p className="text-sm font-bold">{log.records_updated}</p>
                                <p className="text-[10px] text-neutral-500">Updated</p>
                              </div>
                            )}
                            {meta.memberships_synced > 0 && (
                              <div className="bg-white rounded-lg border p-2.5">
                                <p className="text-sm font-bold">{meta.memberships_synced}</p>
                                <p className="text-[10px] text-neutral-500">Memberships</p>
                              </div>
                            )}
                            {meta.packages_synced > 0 && (
                              <div className="bg-white rounded-lg border p-2.5">
                                <p className="text-sm font-bold">{meta.packages_synced}</p>
                                <p className="text-[10px] text-neutral-500">Packages</p>
                              </div>
                            )}
                            {meta.credits_updated > 0 && (
                              <div className="bg-white rounded-lg border p-2.5">
                                <p className="text-sm font-bold">{meta.credits_updated}</p>
                                <p className="text-[10px] text-neutral-500">Credits Updated</p>
                              </div>
                            )}
                            {meta.lifecycle_updated > 0 && (
                              <div className="bg-white rounded-lg border p-2.5">
                                <p className="text-sm font-bold">{meta.lifecycle_updated}</p>
                                <p className="text-[10px] text-neutral-500">Lifecycle Updated</p>
                              </div>
                            )}
                            {meta.referral_enrolled > 0 && (
                              <div className="bg-white rounded-lg border p-2.5">
                                <p className="text-sm font-bold">{meta.referral_enrolled}</p>
                                <p className="text-[10px] text-neutral-500">Referrals Enrolled</p>
                              </div>
                            )}
                          </div>
                          {meta.locations && (
                            <p className="text-xs text-neutral-500 mb-1">
                              <span className="font-medium text-neutral-600">Locations:</span> {Array.isArray(meta.locations) ? meta.locations.join(', ') : meta.locations}
                            </p>
                          )}
                          {log.error && (
                            <p className="text-xs text-red-600 mb-2 break-all">{log.error}</p>
                          )}
                          <details className="mt-2">
                            <summary className="text-[10px] text-neutral-400 cursor-pointer hover:text-neutral-600">Raw metadata</summary>
                            <pre className="mt-1 text-[10px] bg-white rounded border p-2 overflow-auto max-h-40 text-neutral-600">
                              {JSON.stringify(meta, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Entity browser */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 bg-neutral-50 border-b rounded-t-xl flex items-center justify-between">
          <div className="flex gap-1">
            {[
              { id: 'clients', label: 'Clients' },
              { id: 'appointments', label: 'Appointments' },
              { id: 'memberships', label: 'Memberships' },
              { id: 'packages', label: 'Packages' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setEntityTab(tab.id); setEntitySearchInput(''); setEntityFilters({}) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  entityTab === tab.id ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-neutral-400">{entityCount.toLocaleString()} total</span>
        </div>

        {/* Search / filters */}
        <div className="px-4 py-3 border-b flex flex-wrap gap-3">
          {entityTab === 'clients' && (
            <input
              type="text"
              value={entitySearchInput}
              onChange={(e) => setEntitySearchInput(e.target.value)}
              placeholder="Search name, email, or phone..."
              className="border rounded-lg px-3 py-2 text-sm bg-white w-72"
            />
          )}
          {entityTab === 'appointments' && (
            <>
              <select
                value={entityFilters.status || ''}
                onChange={(e) => setEntityFilters((f) => ({ ...f, status: e.target.value || undefined }))}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">All Statuses</option>
                {['BOOKED', 'CONFIRMED', 'ARRIVED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={entityFilters.location || ''}
                onChange={(e) => setEntityFilters((f) => ({ ...f, location: e.target.value || undefined }))}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">All Locations</option>
                <option value="westfield">Westfield</option>
                <option value="carmel">Carmel</option>
              </select>
            </>
          )}
          {entityTab === 'memberships' && (
            <select
              value={entityFilters.status || ''}
              onChange={(e) => setEntityFilters((f) => ({ ...f, status: e.target.value || undefined }))}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">All Statuses</option>
              {['ACTIVE', 'CANCELLED', 'PAST_DUE', 'PAUSED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          {entityTab === 'packages' && (
            <select
              value={entityFilters.status || ''}
              onChange={(e) => setEntityFilters((f) => ({ ...f, status: e.target.value || undefined }))}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">All Statuses</option>
              {['ACTIVE', 'EXPIRED', 'COMPLETED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>

        {entityLoading && !entityData.length ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b">
                  {entityTab === 'clients' && (
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Name</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Email</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Phone</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Visits</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Spend</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Credit</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Last Visit</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Synced</th>
                    </tr>
                  )}
                  {entityTab === 'appointments' && (
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Client</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Date</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Status</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Location</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Synced</th>
                    </tr>
                  )}
                  {entityTab === 'memberships' && (
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Client</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Membership</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Status</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Start</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Price/mo</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Vouchers</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Synced</th>
                    </tr>
                  )}
                  {entityTab === 'packages' && (
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Client</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Package</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Status</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Purchased</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Expires</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Vouchers</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Synced</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {entityTab === 'clients' && entityData.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                      <td className="px-4 py-2 font-medium">{jitDisplayName(jitClients[row.boulevard_id], null) || row.boulevard_id?.split(':').pop()?.slice(0, 8) || '—'}</td>
                      <td className="px-4 py-2 text-neutral-500 text-xs">{jitClients[row.boulevard_id]?.emailMasked || '—'}</td>
                      <td className="px-4 py-2 text-neutral-500 text-xs">{jitClients[row.boulevard_id]?.phoneMasked || '—'}</td>
                      <td className="px-4 py-2 text-right">{row.visit_count || 0}</td>
                      <td className="px-4 py-2 text-right">${Math.round(Number(row.total_spend || 0)).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">{row.account_credit > 0 ? `$${(row.account_credit / 100).toFixed(0)}` : '—'}</td>
                      <td className="px-4 py-2 text-xs text-neutral-500">{row.last_visit_at ? new Date(row.last_visit_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}</td>
                      <td className="px-4 py-2 text-xs text-neutral-400">{row.synced_at ? new Date(row.synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                    </tr>
                  ))}
                  {entityTab === 'appointments' && entityData.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                      <td className="px-4 py-2 font-medium">{row.blvd_clients?.boulevard_id?.split(':').pop()?.slice(0, 8) || '—'}</td>
                      <td className="px-4 py-2 text-xs">{row.start_at ? new Date(row.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          row.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          row.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>{row.status}</span>
                      </td>
                      <td className="px-4 py-2 text-xs text-neutral-500 capitalize">{row.location_key || '—'}</td>
                      <td className="px-4 py-2 text-xs text-neutral-400">{row.synced_at ? new Date(row.synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                    </tr>
                  ))}
                  {entityTab === 'memberships' && entityData.map((row) => {
                    const vouchers = Array.isArray(row.vouchers) ? row.vouchers : (typeof row.vouchers === 'string' ? (() => { try { return JSON.parse(row.vouchers) } catch { return [] } })() : [])
                    const voucherCount = vouchers.reduce((sum, v) => sum + (v.quantity || 0), 0)
                    return (
                      <tr key={row.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                        <td className="px-4 py-2 font-medium">{row.blvd_clients?.boulevard_id?.split(':').pop()?.slice(0, 8) || '—'}</td>
                        <td className="px-4 py-2 text-xs">{row.name}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                            row.status === 'CANCELLED' ? 'bg-neutral-100 text-neutral-500' :
                            row.status === 'PAST_DUE' ? 'bg-red-100 text-red-700' :
                            row.status === 'PAUSED' ? 'bg-amber-100 text-amber-700' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>{row.status}</span>
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-500">{row.start_on ? new Date(row.start_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}</td>
                        <td className="px-4 py-2 text-right text-xs">{row.unit_price ? `$${(row.unit_price / 100).toFixed(0)}` : '—'}</td>
                        <td className="px-4 py-2 text-right">
                          {voucherCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium" title={vouchers.map((v) => `${v.quantity}x ${v.services?.[0]?.name || 'voucher'}`).join(', ')}>
                              {voucherCount}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-400">{row.synced_at ? new Date(row.synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                      </tr>
                    )
                  })}
                  {entityTab === 'packages' && entityData.map((row) => {
                    const vouchers = Array.isArray(row.vouchers) ? row.vouchers : (typeof row.vouchers === 'string' ? (() => { try { return JSON.parse(row.vouchers) } catch { return [] } })() : [])
                    const voucherCount = vouchers.reduce((sum, v) => sum + (v.quantity || 0), 0)
                    const isExpired = row.expires_at && new Date(row.expires_at) < new Date()
                    return (
                      <tr key={row.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                        <td className="px-4 py-2 font-medium">{row.blvd_clients?.boulevard_id?.split(':').pop()?.slice(0, 8) || '—'}</td>
                        <td className="px-4 py-2 text-xs">{row.name}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                            row.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                            row.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>{row.status}</span>
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-500">{row.purchased_at ? new Date(row.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}</td>
                        <td className={`px-4 py-2 text-xs ${isExpired ? 'text-red-600 font-medium' : 'text-neutral-500'}`}>
                          {row.expires_at ? new Date(row.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {voucherCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 text-xs font-medium" title={vouchers.map((v) => `${v.quantity}x ${v.services?.[0]?.name || 'voucher'}`).join(', ')}>
                              {voucherCount}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-400">{row.synced_at ? new Date(row.synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                      </tr>
                    )
                  })}
                  {entityData.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-400 text-sm">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {entityCount > ENTITY_PAGE_SIZE && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Showing {(entityPage - 1) * ENTITY_PAGE_SIZE + 1}–{Math.min(entityPage * ENTITY_PAGE_SIZE, entityCount)} of {entityCount.toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setEntityPage((p) => Math.max(1, p - 1))} disabled={entityPage <= 1} className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50">Previous</button>
                  <button onClick={() => setEntityPage((p) => p + 1)} disabled={entityPage * ENTITY_PAGE_SIZE >= entityCount} className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-neutral-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

BoulevardSync.getLayout = (page) => page
