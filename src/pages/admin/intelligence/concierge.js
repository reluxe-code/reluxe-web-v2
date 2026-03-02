// src/pages/admin/intelligence/concierge.js
// Daily Concierge — Agentic Retention Engine CMS.
// Tabs: Queue (per-cohort), Templates (SMS editor), Projections (14-day forecast).
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'
import { useClientJit, jitDisplayName, jitContactInfo } from '@/hooks/useClientJit'

// ── Shared constants ──────────────────────────────────────────

const CAMPAIGNS = ['tox_journey', 'massage_journey', 'membership_voucher', 'aesthetic_winback', 'last_minute_gap', 'package_voucher']
const COHORT_CODES = { tox_journey: 'P1', massage_journey: 'P2', membership_voucher: 'P3', aesthetic_winback: 'P4', last_minute_gap: 'P5', package_voucher: 'P6' }
const SLUG_FROM_COHORT = { P1: 'tox_journey', P2: 'massage_journey', P3: 'membership_voucher', P4: 'aesthetic_winback', P5: 'last_minute_gap', P6: 'package_voucher' }

const CAMPAIGN_LABELS = {
  tox_journey: 'Tox Journey',
  membership_voucher: 'Membership Voucher',
  aesthetic_winback: 'Aesthetic Winback',
  last_minute_gap: 'Last-Minute Gap',
  package_voucher: 'Package Voucher',
  massage_journey: 'Massage Journey',
}
const CAMPAIGN_COLORS = {
  tox_journey: 'violet', membership_voucher: 'blue', aesthetic_winback: 'fuchsia', last_minute_gap: 'amber', package_voucher: 'teal', massage_journey: 'emerald',
}
const CAMPAIGN_BG = {
  tox_journey: 'bg-violet-50 border-violet-200',
  membership_voucher: 'bg-blue-50 border-blue-200',
  aesthetic_winback: 'bg-fuchsia-50 border-fuchsia-200',
  last_minute_gap: 'bg-amber-50 border-amber-200',
  package_voucher: 'bg-teal-50 border-teal-200',
  massage_journey: 'bg-emerald-50 border-emerald-200',
}
const CAMPAIGN_RING = {
  tox_journey: 'ring-violet-500', membership_voucher: 'ring-blue-500', aesthetic_winback: 'ring-fuchsia-500', last_minute_gap: 'ring-amber-500', package_voucher: 'ring-teal-500', massage_journey: 'ring-emerald-500',
}
const PLACEHOLDER_HELP = [
  { key: '{{first_name}}', desc: 'Patient first name' },
  { key: '{{provider_name}}', desc: 'Last provider' },
  { key: '{{service_name}}', desc: 'Service name' },
  { key: '{{days_overdue}}', desc: 'Days past due' },
  { key: '{{voucher_service}}', desc: 'Voucher service (P2/P5)' },
  { key: '{{sessions_remaining}}', desc: 'Unused sessions count (P5)' },
  { key: '{{voucher_expiry}}', desc: 'Expiry reminder text (P5)' },
  { key: '{{location_name}}', desc: 'Location' },
  { key: '{{booking_link}}', desc: 'Booking URL' },
  { key: '{{credit_reminder}}', desc: 'Auto credit note (if above threshold)' },
]
// Auto-appended footer (matches smsBuilder.js)
const SMS_FOOTER = '\n\n-RELUXE Med Spa\nReply or call (317) 763-1142 to book\nReply STOP to opt out'

/** Estimate SMS segments for a rendered message (GSM-7 assumed after sanitization). */
function estimateSegments(text) {
  const len = text.length
  if (len <= 160) return { segments: 1, length: len }
  return { segments: Math.ceil(len / 153), length: len }
}

const TABS = [
  { id: 'queue', label: 'Queue' },
  { id: 'templates', label: 'Templates' },
  { id: 'projections', label: 'Projections' },
]

// ── Badge components ──────────────────────────────────────────

function CohortBadge({ cohort }) {
  const s = { P1: 'bg-violet-100 text-violet-700', P2: 'bg-emerald-100 text-emerald-700', P3: 'bg-blue-100 text-blue-700', P4: 'bg-fuchsia-100 text-fuchsia-700', P5: 'bg-amber-100 text-amber-700', P6: 'bg-teal-100 text-teal-700' }
  const l = { P1: 'P1 · Tox', P2: 'P2 · Massage', P3: 'P3 · Voucher', P4: 'P4 · Winback', P5: 'P5 · Gap', P6: 'P6 · Package' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s[cohort] || 'bg-neutral-100 text-neutral-600'}`}>{l[cohort] || cohort}</span>
}

function StatusBadge({ status, flagReason }) {
  const s = { ready: 'bg-emerald-100 text-emerald-700', flagged: 'bg-red-100 text-red-700', approved: 'bg-blue-100 text-blue-700', sent: 'bg-neutral-100 text-neutral-600', expired: 'bg-neutral-100 text-neutral-400', skipped: 'bg-neutral-100 text-neutral-400' }
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s[status] || 'bg-neutral-100'}`}>{status}</span>
      {flagReason && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-600 font-mono">{flagReason}</span>}
    </span>
  )
}

// ── Main page component ───────────────────────────────────────

export default function DailyConcierge() {
  const [activeTab, setActiveTab] = useState('queue')

  // Engine
  const [engineEnabled, setEngineEnabled] = useState(null)
  const [enablingEngine, setEnablingEngine] = useState(false)

  // Dashboard
  const [dashboard, setDashboard] = useState(null)

  // Queue — per cohort
  const [selectedCohort, setSelectedCohort] = useState('P1')
  const [queue, setQueue] = useState(null)
  const [queueLoading, setQueueLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ready')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('priority_asc')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Drawer
  const [drawerEntryId, setDrawerEntryId] = useState(null)
  const [drawerData, setDrawerData] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [testSendPhone, setTestSendPhone] = useState('')
  const [testSending, setTestSending] = useState(false)
  const [drawerView, setDrawerView] = useState('message') // 'message' | 'profile'
  const [profileData, setProfileData] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Action states
  const [generating, setGenerating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [sending, setSending] = useState(false)

  // Templates
  const [campaigns, setCampaigns] = useState([])
  const [templateDrafts, setTemplateDrafts] = useState({})
  const [templateSaving, setTemplateSaving] = useState(false)
  const [templateDirty, setTemplateDirty] = useState(false)

  // Credit threshold (in dollars, stored in engine config as cents)
  const [creditThreshold, setCreditThreshold] = useState(0)

  // Unavailable providers
  const [unavailableProviders, setUnavailableProviders] = useState([])
  const [staffList, setStaffList] = useState([])

  // Projections
  const [projectionOffset, setProjectionOffset] = useState(0)
  const [projection, setProjection] = useState(null)
  const [projectionLoading, setProjectionLoading] = useState(false)
  const [expandedProjCohort, setExpandedProjCohort] = useState(null)

  // JIT client name resolution
  const boulevardIds = useMemo(() => (queue?.queue || []).map(e => e.boulevard_id).filter(Boolean), [queue?.queue])
  const { clients: jitClients } = useClientJit(boulevardIds)

  const searchTimer = useRef(null)
  useEffect(() => {
    searchTimer.current = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(searchTimer.current)
  }, [searchInput])

  // Reset queue page when filters or cohort change
  useEffect(() => { setPage(1) }, [selectedCohort, statusFilter, search, sort])

  // ── Config ──────────────────────────────────────────────

  const loadConfig = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/concierge/config')
      if (!res.ok) return
      const data = await res.json()
      setEngineEnabled(!!data.engine?.enabled)
      setCreditThreshold(Math.round(Number(data.engine?.credit_reminder_threshold || 0) / 100))
      setUnavailableProviders(data.engine?.unavailable_providers || [])
      setStaffList(data.staff || [])
      if (data.campaigns?.length) {
        setCampaigns(data.campaigns)
        const drafts = {}
        for (const c of data.campaigns) {
          drafts[c.campaign_slug] = {
            variant_a_template: c.variant_a_template || '',
            variant_b_template: c.variant_b_template || '',
            unavailable_template: c.unavailable_template || '',
            ab_split: c.ab_split ?? 0.5,
            active: c.active ?? true,
          }
        }
        setTemplateDrafts(drafts)
        setTemplateDirty(false)
      }
    } catch (e) {
      console.error('Config load error:', e)
    }
  }, [])

  const handleEnableEngine = useCallback(async () => {
    setEnablingEngine(true)
    try {
      const cfgRes = await adminFetch('/api/admin/concierge/config')
      const cfgData = await cfgRes.json()
      const res = await adminFetch('/api/admin/concierge/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine: { ...(cfgData.engine || {}), enabled: true } }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setEngineEnabled(true)
    } catch (e) {
      alert('Failed to enable engine: ' + e.message)
    } finally {
      setEnablingEngine(false)
    }
  }, [])

  useEffect(() => { loadConfig() }, [loadConfig])

  // ── Dashboard ─────────────────────────────────────────────

  const loadDashboard = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/concierge/dashboard')
      if (!res.ok) return
      setDashboard(await res.json())
    } catch (e) {
      console.error('Dashboard error:', e)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  // ── Queue ─────────────────────────────────────────────────

  const loadQueue = useCallback(async () => {
    setQueueLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        cohort: selectedCohort,
        page: String(page),
        limit: '50',
        sort,
      })
      if (search) params.set('search', search)
      const res = await adminFetch(`/api/admin/concierge/queue?${params}`)
      if (!res.ok) throw new Error((await res.json()).error)
      setQueue(await res.json())
      setSelectedIds(new Set())
    } catch (e) {
      setError(e.message)
    } finally {
      setQueueLoading(false)
    }
  }, [selectedCohort, statusFilter, search, sort, page])

  useEffect(() => { loadQueue() }, [loadQueue])

  // ── Drawer ──────────────────────────────────────────────

  const openDrawer = useCallback(async (entryId) => {
    setDrawerEntryId(entryId)
    setDrawerLoading(true)
    setDrawerData(null)
    setTestSendPhone('')
    setDrawerView('message')
    setProfileData(null)
    try {
      const res = await adminFetch(`/api/admin/concierge/detail?id=${entryId}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load')
      setDrawerData(await res.json())
    } catch (e) {
      console.error('Drawer error:', e)
    } finally {
      setDrawerLoading(false)
    }
  }, [])

  const closeDrawer = useCallback(() => { setDrawerEntryId(null); setDrawerData(null); setProfileData(null); setDrawerView('message') }, [])

  const openProfile = useCallback(async (clientId) => {
    if (!clientId) return
    setDrawerView('profile')
    setProfileLoading(true)
    setProfileData(null)
    try {
      const res = await adminFetch(`/api/admin/intelligence/patient-detail?client_id=${clientId}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load profile')
      setProfileData(await res.json())
    } catch (e) {
      console.error('Profile error:', e)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  // ── Queue Actions (per-cohort) ────────────────────────────

  const cohortSlug = SLUG_FROM_COHORT[selectedCohort]

  const handleGenerate = useCallback(async () => {
    if (!confirm(`Generate queue for ${CAMPAIGN_LABELS[cohortSlug]}? This will expire old ready entries for this cohort.`)) return
    setGenerating(true)
    try {
      const res = await adminFetch('/api/admin/concierge/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohorts: [cohortSlug] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const s = data.summary[cohortSlug] || {}
      alert(`${CAMPAIGN_LABELS[cohortSlug]}: ${s.ready || 0} ready, ${s.flagged || 0} flagged`)
      loadDashboard()
      loadQueue()
    } catch (e) {
      alert('Generate failed: ' + e.message)
    } finally {
      setGenerating(false)
    }
  }, [cohortSlug, loadDashboard, loadQueue])

  const handleBulkAction = useCallback(async (action) => {
    const ids = Array.from(selectedIds)
    if (!ids.length) return alert('No entries selected')
    const label = action === 'approve' ? 'Approve' : 'Skip'
    if (!confirm(`${label} ${ids.length} entries?`)) return
    setApproving(true)
    try {
      const res = await adminFetch('/api/admin/concierge/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      loadQueue()
      loadDashboard()
    } catch (e) {
      alert(`${label} failed: ` + e.message)
    } finally {
      setApproving(false)
    }
  }, [selectedIds, loadQueue, loadDashboard])

  const handleApproveAll = useCallback(async () => {
    if (!confirm(`Approve ALL ready ${CAMPAIGN_LABELS[cohortSlug]} entries?`)) return
    setApproving(true)
    try {
      const res1 = await adminFetch(`/api/admin/concierge/queue?status=ready&cohort=${selectedCohort}&limit=1000`)
      const allReady = await res1.json()
      const ids = (allReady.queue || []).map((q) => q.id)
      if (!ids.length) { setApproving(false); return alert('No ready entries') }
      const res2 = await adminFetch('/api/admin/concierge/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: 'approve' }),
      })
      const data = await res2.json()
      if (!res2.ok) throw new Error(data.error)
      alert(`Approved ${data.updated} entries`)
      loadQueue()
      loadDashboard()
    } catch (e) {
      alert('Approve all failed: ' + e.message)
    } finally {
      setApproving(false)
    }
  }, [cohortSlug, selectedCohort, loadQueue, loadDashboard])

  const handleSendApproved = useCallback(async () => {
    if (!confirm(`Send ALL approved ${CAMPAIGN_LABELS[cohortSlug]} messages?`)) return
    setSending(true)
    try {
      // Get approved IDs for this cohort only
      const res1 = await adminFetch(`/api/admin/concierge/queue?status=approved&cohort=${selectedCohort}&limit=1000`)
      const approved = await res1.json()
      const ids = (approved.queue || []).map((q) => q.id)
      if (!ids.length) { setSending(false); return alert('No approved entries to send') }

      const res = await adminFetch('/api/admin/concierge/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert(`Sent: ${data.sent}, Failed: ${data.failed}`)
      loadQueue()
      loadDashboard()
    } catch (e) {
      alert('Send failed: ' + e.message)
    } finally {
      setSending(false)
    }
  }, [cohortSlug, selectedCohort, loadQueue, loadDashboard])

  // ── Test Send ─────────────────────────────────────────────

  const handleTestSend = useCallback(async (queueId, phone) => {
    if (!phone) return alert('Enter a phone number')
    setTestSending(true)
    try {
      const res = await adminFetch('/api/admin/concierge/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_id: queueId, phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert(`Test SMS sent to ${phone}`)
    } catch (e) {
      alert('Test send failed: ' + e.message)
    } finally {
      setTestSending(false)
    }
  }, [])

  // ── Selection ─────────────────────────────────────────────

  const toggleSelect = (id) => {
    setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }
  const toggleSelectAll = () => {
    if (!queue?.queue?.length) return
    const allIds = queue.queue.map((q) => q.id)
    setSelectedIds(allIds.every((id) => selectedIds.has(id)) ? new Set() : new Set(allIds))
  }

  // ── Template Actions ──────────────────────────────────────

  const updateDraft = (slug, field, value) => {
    setTemplateDrafts((prev) => ({ ...prev, [slug]: { ...prev[slug], [field]: value } }))
    setTemplateDirty(true)
  }

  const handleSaveTemplates = useCallback(async () => {
    setTemplateSaving(true)
    try {
      // First read current engine config to merge with threshold update
      const cfgRes = await adminFetch('/api/admin/concierge/config')
      const cfgData = await cfgRes.json()

      const campaignUpdates = Object.entries(templateDrafts).map(([slug, d]) => ({
        campaign_slug: slug, variant_a_template: d.variant_a_template,
        variant_b_template: d.variant_b_template || null,
        unavailable_template: d.unavailable_template || null,
        ab_split: d.ab_split, active: d.active,
      }))
      const res = await adminFetch('/api/admin/concierge/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaigns: campaignUpdates,
          engine: { ...(cfgData.engine || {}), credit_reminder_threshold: creditThreshold * 100, unavailable_providers: unavailableProviders },
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setTemplateDirty(false)
      alert('Templates saved. Next generation will use updated templates.')
    } catch (e) {
      alert('Save failed: ' + e.message)
    } finally {
      setTemplateSaving(false)
    }
  }, [templateDrafts, creditThreshold, unavailableProviders])

  // ── Projection Actions ────────────────────────────────────

  const handleGenerateProjection = useCallback(async () => {
    setProjectionLoading(true)
    setProjection(null)
    setExpandedProjCohort(null)
    try {
      const res = await adminFetch(`/api/admin/concierge/projection?offset=${projectionOffset}`)
      if (!res.ok) throw new Error((await res.json()).error)
      setProjection(await res.json())
    } catch (e) {
      alert('Projection failed: ' + e.message)
    } finally {
      setProjectionLoading(false)
    }
  }, [projectionOffset])

  const navigateProjection = (delta) => {
    setProjectionOffset((p) => Math.max(0, Math.min(14, p + delta)))
    setProjection(null)
    setExpandedProjCohort(null)
  }

  const projDate = new Date(Date.now() + projectionOffset * 86400000)
  const projDateLabel = projDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  // ── Render ──────────────────────────────────────────────────

  const readyCount = (slug) => dashboard?.ready_counts?.[slug] || 0
  const flaggedCount = (slug) => dashboard?.flagged_counts?.[slug] || 0
  const approvedCount = (slug) => dashboard?.approved_counts?.[slug] || 0

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Daily Concierge</h1>
        <p className="text-sm text-neutral-500 mt-1">Behavior-triggered patient outreach. Edit templates, preview projections, then generate and send.</p>
      </div>

      {engineEnabled === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">Concierge Engine is disabled</p>
            <p className="text-xs text-amber-600 mt-0.5">Enable it to start generating and sending outreach queues.</p>
          </div>
          <button onClick={handleEnableEngine} disabled={enablingEngine} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50">
            {enablingEngine ? 'Enabling...' : 'Enable Engine'}
          </button>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 border-b">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
            {tab.label}
            {tab.id === 'templates' && templateDirty && <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500 inline-block" />}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"><p className="text-sm text-red-700">{error}</p></div>}

      {/* ════════════════ QUEUE TAB ════════════════ */}
      {activeTab === 'queue' && (
        <>
          {/* Cohort selector cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {CAMPAIGNS.map((slug) => {
              const code = COHORT_CODES[slug]
              const isActive = selectedCohort === code
              const ready = readyCount(slug)
              const flagged = flaggedCount(slug)
              const approved = approvedCount(slug)
              return (
                <button
                  key={slug}
                  onClick={() => { setSelectedCohort(code); setStatusFilter('ready'); setPage(1) }}
                  className={`text-left rounded-xl border-2 p-5 transition hover:shadow-md ${
                    isActive ? `${CAMPAIGN_BG[slug]} ring-2 ${CAMPAIGN_RING[slug]}` : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{code}</p>
                  <p className="text-lg font-bold mt-1">{CAMPAIGN_LABELS[slug]}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-emerald-600 font-medium">{ready} ready</span>
                    <span className="text-blue-600 font-medium">{approved} approved</span>
                    <span className="text-red-500">{flagged} flagged</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* RPM for selected cohort */}
          {dashboard?.rpm?.[cohortSlug] && (
            <div className="bg-white border rounded-lg p-4 mb-6 flex items-center gap-6">
              <div>
                <p className="text-xs text-neutral-500">RPM (30d)</p>
                <p className="text-xl font-bold">${dashboard.rpm[cohortSlug].rpm}</p>
              </div>
              <div className="text-xs text-neutral-400 space-y-0.5">
                <p>{dashboard.rpm[cohortSlug].messages_sent} sent · {dashboard.rpm[cohortSlug].conversions} booked · {dashboard.rpm[cohortSlug].conversion_rate}% CVR</p>
                {dashboard.rpm[cohortSlug].variants && Object.keys(dashboard.rpm[cohortSlug].variants).length > 1 && (
                  <div className="flex gap-4">
                    {Object.entries(dashboard.rpm[cohortSlug].variants).map(([v, d]) => (
                      <span key={v}>Variant {v}: ${d.rpm} RPM · {d.conversion_rate}% CVR</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Per-cohort action buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button onClick={handleGenerate} disabled={generating} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
              {generating ? 'Generating...' : `Generate ${CAMPAIGN_LABELS[cohortSlug]}`}
            </button>
            <button onClick={handleApproveAll} disabled={approving || readyCount(cohortSlug) === 0} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
              {approving ? 'Approving...' : 'Approve All'}
            </button>
            <button onClick={handleSendApproved} disabled={sending || approvedCount(cohortSlug) === 0} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Approved'}
            </button>
            {dashboard?.last_batch && (
              <span className="self-center text-xs text-neutral-400 ml-auto">
                Last batch: {new Date(dashboard.last_batch.created_at).toLocaleString()}
              </span>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="ready">Ready</option>
              <option value="flagged">Flagged</option>
              <option value="approved">Approved</option>
              <option value="sent">Sent</option>
              <option value="skipped">Skipped</option>
            </select>
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search provider, phone..." className="border rounded-lg px-3 py-2 text-sm bg-white w-56" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="priority_asc">Test Records First</option>
              <option value="days_desc">Most Overdue</option>
              <option value="created_desc">Newest First</option>
            </select>
            {selectedIds.size > 0 && statusFilter === 'ready' && (
              <div className="ml-auto flex gap-2">
                <button onClick={() => handleBulkAction('approve')} disabled={approving} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium">Approve {selectedIds.size}</button>
                <button onClick={() => handleBulkAction('skip')} disabled={approving} className="px-3 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium">Skip {selectedIds.size}</button>
              </div>
            )}
          </div>

          {/* Queue table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b">
              <h2 className="text-sm font-semibold">{CAMPAIGN_LABELS[cohortSlug]} Queue{queue && <span className="text-neutral-400 font-normal ml-2">({queue.total} total)</span>}</h2>
            </div>
            {queueLoading && !queue ? (
              <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b">
                      <tr>
                        {statusFilter === 'ready' && (
                          <th className="w-10 px-4 py-2">
                            <input type="checkbox" checked={queue?.queue?.length > 0 && queue.queue.every((q) => selectedIds.has(q.id))} onChange={toggleSelectAll} className="rounded" />
                          </th>
                        )}
                        <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Patient</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Last Provider</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Recency</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Variant</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(queue?.queue || []).map((entry) => (
                        <tr
                          key={entry.id}
                          onClick={() => openDrawer(entry.id)}
                          className={`border-b last:border-b-0 hover:bg-neutral-50 cursor-pointer ${entry.is_test ? 'bg-amber-50/50' : ''}`}
                        >
                          {statusFilter === 'ready' && (
                            <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" checked={selectedIds.has(entry.id)} onChange={() => toggleSelect(entry.id)} className="rounded" />
                            </td>
                          )}
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {entry.is_test && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-200 text-amber-800 font-bold">TEST</span>}
                              <div>
                                <p className="font-medium">{jitDisplayName(jitClients[entry.boulevard_id], entry.client_name)}</p>
                                <p className="text-xs text-neutral-400">{jitContactInfo(jitClients[entry.boulevard_id], entry.client_email, entry.phone) || entry.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-neutral-600">{entry.provider_name || '\u2014'}</td>
                          <td className="px-4 py-2 text-right">
                            <span className={`font-medium ${
                              (entry.days_overdue || 0) > 60 ? 'text-red-600' :
                              (entry.days_overdue || 0) > 30 ? 'text-orange-600' :
                              (entry.days_overdue || 0) > 14 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>{entry.days_overdue != null ? `${entry.days_overdue}d` : '\u2014'}</span>
                          </td>
                          <td className="px-4 py-2 text-neutral-600 text-xs font-mono">{entry.variant}</td>
                          <td className="px-4 py-2"><StatusBadge status={entry.status} flagReason={entry.flag_reason} /></td>
                        </tr>
                      ))}
                      {(!queue?.queue || queue.queue.length === 0) && (
                        <tr><td colSpan={statusFilter === 'ready' ? 6 : 5} className="px-4 py-8 text-center text-neutral-400">No entries. Click Generate to compute candidates.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {queue && queue.total > queue.page_size && (
                  <div className="px-4 py-3 border-t flex items-center justify-between">
                    <p className="text-xs text-neutral-500">Page {queue.page} of {Math.ceil(queue.total / queue.page_size)}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded text-xs disabled:opacity-30">Prev</button>
                      <button onClick={() => setPage((p) => p + 1)} disabled={page * queue.page_size >= queue.total} className="px-3 py-1 border rounded text-xs disabled:opacity-30">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ════════════════ TEMPLATES TAB ════════════════ */}
      {activeTab === 'templates' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold">SMS Templates</h2>
              <p className="text-sm text-neutral-500 mt-0.5">Edit templates below. Saved templates are used on the next queue generation.</p>
            </div>
            <button onClick={handleSaveTemplates} disabled={templateSaving || !templateDirty} className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-40">
              {templateSaving ? 'Saving...' : 'Save All Templates'}
            </button>
          </div>

          <div className="bg-neutral-50 border rounded-lg p-4 mb-6">
            <p className="text-xs font-semibold text-neutral-600 mb-2">Available Placeholders</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {PLACEHOLDER_HELP.map((p) => (
                <span key={p.key} className="text-xs text-neutral-500">
                  <code className="bg-white px-1.5 py-0.5 rounded border text-[11px] font-mono text-violet-700">{p.key}</code>
                  <span className="ml-1">{p.desc}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Credit reminder threshold */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-800">Account Credit Reminder</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  When a patient has account credit at or above this threshold, <code className="bg-white px-1 py-0.5 rounded border text-[11px] font-mono text-violet-700">{'{{credit_reminder}}'}</code> will render as
                  &quot;Remember, you have $XX in account credit available!&quot;. Set to $0 to disable.
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-emerald-700 font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={creditThreshold}
                  onChange={(e) => { setCreditThreshold(Math.max(0, parseInt(e.target.value) || 0)); setTemplateDirty(true) }}
                  className="w-24 border rounded-lg px-3 py-2 text-sm bg-white text-right"
                />
              </div>
            </div>
          </div>

          {/* Unavailable providers */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-amber-800 mb-1">Unavailable Providers</p>
            <p className="text-xs text-amber-600 mb-3">
              Patients whose last provider is checked below will receive a generic message (no provider name) and a booking link without provider pre-selection.
            </p>
            {staffList.length === 0 ? (
              <p className="text-xs text-amber-500 italic">Loading providers...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {staffList.map((s) => (
                  <label key={s.slug} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${unavailableProviders.includes(s.slug) ? 'bg-amber-200 border-amber-400 text-amber-900 font-medium' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>
                    <input
                      type="checkbox"
                      checked={unavailableProviders.includes(s.slug)}
                      onChange={(e) => {
                        setUnavailableProviders((prev) => e.target.checked ? [...prev, s.slug] : prev.filter((p) => p !== s.slug))
                        setTemplateDirty(true)
                      }}
                      className="rounded text-amber-600"
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {CAMPAIGNS.map((slug) => {
              const draft = templateDrafts[slug]
              if (!draft) return null
              const campaign = campaigns.find((c) => c.campaign_slug === slug)
              return (
                <div key={slug} className={`rounded-xl border p-6 ${CAMPAIGN_BG[slug] || 'bg-white'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold">{CAMPAIGN_LABELS[slug]}</h3>
                      <CohortBadge cohort={campaign?.cohort || COHORT_CODES[slug]} />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={draft.active} onChange={(e) => updateDraft(slug, 'active', e.target.checked)} className="rounded" /> Active
                    </label>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Variant A (Primary)</label>
                      <textarea value={draft.variant_a_template} onChange={(e) => updateDraft(slug, 'variant_a_template', e.target.value)} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm bg-white resize-y focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none" placeholder="Enter SMS template..." />
                      <p className="text-[11px] text-neutral-400 mt-1">{(draft.variant_a_template || '').length} chars</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Variant B (A/B Test)</label>
                      <textarea value={draft.variant_b_template} onChange={(e) => updateDraft(slug, 'variant_b_template', e.target.value)} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm bg-white resize-y focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none" placeholder="Leave empty to disable A/B testing..." />
                      <p className="text-[11px] text-neutral-400 mt-1">{draft.variant_b_template ? `${draft.variant_b_template.length} chars` : 'No B variant'}</p>
                    </div>
                  </div>
                  {draft.variant_b_template && (
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-xs font-medium text-neutral-600">A/B Split:</label>
                      <input type="range" min="0.1" max="0.9" step="0.1" value={draft.ab_split} onChange={(e) => updateDraft(slug, 'ab_split', parseFloat(e.target.value))} className="w-40" />
                      <span className="text-xs text-neutral-600 font-mono">A: {Math.round(draft.ab_split * 100)}% / B: {Math.round((1 - draft.ab_split) * 100)}%</span>
                    </div>
                  )}
                  {/* Unavailable provider template */}
                  {unavailableProviders.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-amber-700 mb-1.5">Provider Unavailable Template</label>
                      <textarea value={draft.unavailable_template} onChange={(e) => updateDraft(slug, 'unavailable_template', e.target.value)} rows={3} className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-amber-50 resize-y focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none" placeholder="Generic message when provider is unavailable (no {{provider_name}})..." />
                      <p className="text-[11px] text-amber-500 mt-1">{draft.unavailable_template ? `${draft.unavailable_template.length} chars` : 'No unavailable template — will fall back to Variant A'}</p>
                    </div>
                  )}
                  {/* Previews */}
                  {(() => {
                    const renderPreview = (label, tpl) => {
                      const body = ((tpl || 'No template set')
                        .replace(/\{\{first_name\}\}/g, 'Sarah')
                        .replace(/\{\{provider_name\}\}/g, 'Dr. Smith')
                        .replace(/\{\{service_name\}\}/g, 'HydraFacial')
                        .replace(/\{\{days_overdue\}\}/g, '15')
                        .replace(/\{\{voucher_service\}\}/g, 'Monthly Facial')
                        .replace(/\{\{location_name\}\}/g, 'Westfield')
                        .replace(/\{\{booking_link\}\}/g, 'reluxe.com/c/abc123')
                        .replace(/\{\{credit_reminder\}\}/g, creditThreshold > 0 ? 'Remember, you have $150 in account credit available! ' : '')
                        .replace(/\n{3,}/g, '\n\n').trim()) + SMS_FOOTER
                      const est = estimateSegments(body)
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-semibold text-neutral-600">{label}</p>
                            <span className={`text-xs font-mono ${est.segments <= 2 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {est.length} chars / {est.segments} SMS segment{est.segments !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="bg-neutral-900 text-white rounded-2xl p-4 text-sm leading-relaxed max-w-md">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-700">
                              <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-[10px] font-bold">R</div>
                              <span className="text-xs text-neutral-400">RELUXE Med Spa</span>
                            </div>
                            <p className="whitespace-pre-wrap text-xs">{body}</p>
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div className={`mt-4 grid gap-4 ${unavailableProviders.length > 0 && draft.unavailable_template ? 'grid-cols-1 lg:grid-cols-2' : ''}`}>
                        {renderPreview('Preview (Variant A)', draft.variant_a_template)}
                        {unavailableProviders.length > 0 && draft.unavailable_template && renderPreview('Preview (Unavailable)', draft.unavailable_template)}
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>

          {templateDirty && (
            <div className="sticky bottom-0 bg-white border-t mt-6 -mx-8 px-8 py-4 flex items-center justify-between">
              <p className="text-sm text-amber-700 font-medium">Unsaved template changes</p>
              <button onClick={handleSaveTemplates} disabled={templateSaving} className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
                {templateSaving ? 'Saving...' : 'Save All Templates'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ════════════════ PROJECTIONS TAB ════════════════ */}
      {activeTab === 'projections' && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-bold">14-Day Volume Projection</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Navigate to a future date and generate a projection to see estimated volumes per cohort.</p>
          </div>

          <div className="bg-white border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => navigateProjection(-1)} disabled={projectionOffset <= 0} className="p-2 border rounded-lg hover:bg-neutral-50 disabled:opacity-30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="text-center min-w-[200px]">
                <p className="text-2xl font-bold">{projDateLabel}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{projectionOffset === 0 ? 'Today' : `${projectionOffset} day${projectionOffset !== 1 ? 's' : ''} from now`}</p>
              </div>
              <button onClick={() => navigateProjection(1)} disabled={projectionOffset >= 14} className="p-2 border rounded-lg hover:bg-neutral-50 disabled:opacity-30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              {Array.from({ length: 15 }, (_, i) => (
                <button key={i} onClick={() => { setProjectionOffset(i); setProjection(null); setExpandedProjCohort(null) }}
                  className={`w-2.5 h-2.5 rounded-full transition ${i === projectionOffset ? 'bg-black scale-125' : 'bg-neutral-200 hover:bg-neutral-400'}`}
                  title={new Date(Date.now() + i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              ))}
            </div>
            <div className="text-center mt-5">
              <button onClick={handleGenerateProjection} disabled={projectionLoading} className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
                {projectionLoading ? 'Computing...' : 'Generate Projection'}
              </button>
            </div>
          </div>

          {projection && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {CAMPAIGNS.map((slug) => {
                  const cohort = projection.cohorts[slug]
                  if (!cohort) return null
                  return (
                    <div key={slug} onClick={() => setExpandedProjCohort(expandedProjCohort === slug ? null : slug)}
                      className={`rounded-xl border p-5 cursor-pointer transition hover:shadow-md ${CAMPAIGN_BG[slug] || 'bg-white'}`}>
                      <p className="text-3xl font-bold">{cohort.count}</p>
                      <p className="text-sm font-medium mt-1">{CAMPAIGN_LABELS[slug]}</p>
                      {cohort.note && <p className="text-xs text-neutral-500 mt-1 italic">{cohort.note}</p>}
                      {cohort.count > 0 && <p className="text-xs text-neutral-400 mt-2">Click to {expandedProjCohort === slug ? 'collapse' : 'view patients'}</p>}
                    </div>
                  )
                })}
              </div>
              <div className="bg-white border rounded-lg p-4 mb-6 flex items-center justify-between">
                <span className="text-sm font-medium">Total projected candidates</span>
                <span className="text-2xl font-bold">{projection.total}</span>
              </div>

              {expandedProjCohort && projection.cohorts[expandedProjCohort]?.patients?.length > 0 && (
                <div className="bg-white rounded-xl border overflow-hidden mb-6">
                  <div className="px-4 py-3 bg-neutral-50 border-b">
                    <h3 className="text-sm font-semibold">{CAMPAIGN_LABELS[expandedProjCohort]} Patients ({projection.cohorts[expandedProjCohort].count})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Patient</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Phone</th>
                          {expandedProjCohort === 'tox_journey' && <>
                            <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Days Overdue</th>
                            <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Cycle</th>
                            <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Provider</th>
                          </>}
                          {expandedProjCohort === 'membership_voucher' && <>
                            <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Days Since Visit</th>
                            <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Voucher</th>
                            <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Membership</th>
                          </>}
                          {expandedProjCohort === 'aesthetic_winback' && <>
                            <th className="text-right px-4 py-2 text-xs font-medium text-neutral-600">Days Since Facial</th>
                            <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Service</th>
                            <th className="text-left px-4 py-2 text-xs font-medium text-neutral-600">Provider</th>
                          </>}
                        </tr>
                      </thead>
                      <tbody>
                        {projection.cohorts[expandedProjCohort].patients.slice(0, 100).map((p, i) => (
                          <tr key={p.client_id || i} className="border-b last:border-b-0">
                            <td className="px-4 py-2 font-medium">{p.name}</td>
                            <td className="px-4 py-2 text-neutral-500 text-xs">{p.phone}</td>
                            {expandedProjCohort === 'tox_journey' && <>
                              <td className="px-4 py-2 text-right"><span className={`font-medium ${p.days_overdue > 60 ? 'text-red-600' : p.days_overdue > 30 ? 'text-orange-600' : 'text-amber-600'}`}>{p.days_overdue}d</span></td>
                              <td className="px-4 py-2 text-right text-neutral-500">{p.cycle}d</td>
                              <td className="px-4 py-2 text-neutral-600">{p.provider_name || '\u2014'}</td>
                            </>}
                            {expandedProjCohort === 'membership_voucher' && <>
                              <td className="px-4 py-2 text-right text-neutral-600">{p.days_since_visit != null ? `${p.days_since_visit}d` : '\u2014'}</td>
                              <td className="px-4 py-2 text-neutral-600 text-xs">{p.voucher_name}</td>
                              <td className="px-4 py-2 text-neutral-500 text-xs">{p.membership}</td>
                            </>}
                            {expandedProjCohort === 'aesthetic_winback' && <>
                              <td className="px-4 py-2 text-right text-neutral-600">{p.days_since_facial}d</td>
                              <td className="px-4 py-2 text-neutral-600 text-xs">{p.service_name}</td>
                              <td className="px-4 py-2 text-neutral-600">{p.provider_name || '\u2014'}</td>
                            </>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {projection.cohorts[expandedProjCohort].patients.length > 100 && (
                    <div className="px-4 py-3 border-t text-center"><p className="text-xs text-neutral-400">Showing first 100 of {projection.cohorts[expandedProjCohort].patients.length}</p></div>
                  )}
                </div>
              )}
            </>
          )}
          {projectionLoading && <div className="text-center py-12 text-neutral-400"><p className="text-sm">Computing projection for {projDateLabel}...</p></div>}
        </>
      )}

      {/* ════════════════ SLIDE-OVER DRAWER ════════════════ */}
      {drawerEntryId && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeDrawer} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              {drawerView === 'profile' ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setDrawerView('message')} className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <h2 className="text-lg font-bold">Patient Profile</h2>
                </div>
              ) : (
                <h2 className="text-lg font-bold">Message Preview</h2>
              )}
              <button onClick={closeDrawer} className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {drawerLoading ? (
              <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
            ) : drawerData && drawerView === 'message' ? (
              <div className="p-6 space-y-6">
                <div>
                  <button
                    onClick={() => drawerData.entry.client_id && openProfile(drawerData.entry.client_id)}
                    className={`text-xl font-bold ${drawerData.entry.client_id ? 'text-violet-700 hover:text-violet-900 hover:underline cursor-pointer' : 'text-black cursor-default'}`}
                  >
                    {jitDisplayName(jitClients[drawerData.client?.boulevard_id], drawerData.client?.name) || 'Unknown'}
                  </button>
                  <div className="mt-1 space-y-0.5">
                    {(jitClients[drawerData.client?.boulevard_id]?.emailMasked || drawerData.client?.email) && <p className="text-sm text-neutral-500">{jitClients[drawerData.client?.boulevard_id]?.emailMasked || drawerData.client?.email}</p>}
                    {(jitClients[drawerData.client?.boulevard_id]?.phoneMasked || drawerData.client?.phone) && <p className="text-sm text-neutral-500">{jitClients[drawerData.client?.boulevard_id]?.phoneMasked || drawerData.client?.phone}</p>}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <CohortBadge cohort={drawerData.entry.cohort} />
                    <StatusBadge status={drawerData.entry.status} flagReason={drawerData.entry.flag_reason} />
                    {drawerData.entry.client_id && (
                      <button onClick={() => openProfile(drawerData.entry.client_id)} className="text-xs text-violet-600 hover:text-violet-800 underline">View Full Profile</button>
                    )}
                  </div>
                </div>

                {drawerData.client && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-lg font-bold">{drawerData.client.visit_count || 0}</p>
                      <p className="text-xs text-neutral-500">Visits</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-lg font-bold">${Math.round(Number(drawerData.client.total_spend || 0)).toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">Total Spend</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-lg font-bold">{drawerData.entry.days_overdue != null ? `${drawerData.entry.days_overdue}d` : '\u2014'}</p>
                      <p className="text-xs text-neutral-500">Days Overdue</p>
                    </div>
                  </div>
                )}

                {/* Account Credit callout */}
                {drawerData.client?.account_credit > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                    <span className="text-lg font-bold text-emerald-700">${(drawerData.client.account_credit / 100).toFixed(0)}</span>
                    <span className="text-xs text-emerald-600">Account credit available</span>
                  </div>
                )}

                {/* SMS Preview */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">SMS Preview</h4>
                  <div className="bg-neutral-900 text-white rounded-2xl p-4 text-sm leading-relaxed">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-700">
                      <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-xs font-bold">R</div>
                      <span className="text-xs text-neutral-400">RELUXE Med Spa</span>
                      <span className="text-xs text-neutral-500 ml-auto">{drawerData.entry.variant}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{drawerData.entry.sms_body}</p>
                  </div>
                </div>

                {/* Previous Messages Sent */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-neutral-50 border-b flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Previous Messages Sent</h4>
                    <span className="text-xs text-neutral-400">{drawerData.touch_history?.length || 0} total</span>
                  </div>
                  {drawerData.touch_history?.length > 0 ? (
                    <div className="divide-y max-h-52 overflow-y-auto">
                      {drawerData.touch_history.map((touch) => (
                        <div key={touch.id} className="px-4 py-2.5 hover:bg-neutral-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${touch.status === 'booked' ? 'bg-emerald-500' : touch.clicked_at ? 'bg-blue-500' : 'bg-neutral-300'}`} />
                              <span className="text-xs font-medium">{CAMPAIGN_LABELS[touch.campaign_slug] || touch.campaign_slug}</span>
                              {touch.variant && <span className="text-[10px] text-neutral-400 font-mono">({touch.variant})</span>}
                            </div>
                            <span className="text-xs text-neutral-400">{new Date(touch.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{touch.sms_body}</p>
                          {(touch.clicked_at || touch.booked_at) && (
                            <div className="flex gap-3 mt-1">
                              {touch.clicked_at && <span className="text-[10px] text-blue-600">Clicked {new Date(touch.clicked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                              {touch.booked_at && <span className="text-[10px] text-emerald-600">Booked {new Date(touch.booked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-4 text-center text-xs text-neutral-400">No previous messages sent to this patient</div>
                  )}
                </div>

                {/* Test Send */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">Test Send</h4>
                  <p className="text-xs text-amber-600 mb-3">Send this exact SMS to any phone for testing. Won&apos;t affect stats.</p>
                  <div className="flex gap-2">
                    <input type="tel" value={testSendPhone} onChange={(e) => setTestSendPhone(e.target.value)} placeholder="Phone number..." className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white" />
                    <button onClick={() => handleTestSend(drawerData.entry.id, testSendPhone)} disabled={testSending || !testSendPhone} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50">
                      {testSending ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>
                </div>

                {/* Logic Trace */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Logic Trace</h4>
                  <ul className="space-y-1.5">
                    {(drawerData.entry.logic_trace || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Approve/Skip */}
                {drawerData.entry.status === 'ready' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button onClick={async () => {
                      await adminFetch('/api/admin/concierge/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [drawerData.entry.id], action: 'approve' }) })
                      closeDrawer(); loadQueue(); loadDashboard()
                    }} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Approve</button>
                    <button onClick={async () => {
                      await adminFetch('/api/admin/concierge/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [drawerData.entry.id], action: 'skip' }) })
                      closeDrawer(); loadQueue(); loadDashboard()
                    }} className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300">Skip</button>
                  </div>
                )}
              </div>

            ) : drawerView === 'profile' ? (
              <div className="p-6 space-y-6">
                {profileLoading ? (
                  <div className="py-12 text-center text-neutral-400 text-sm">Loading patient profile...</div>
                ) : profileData ? (
                  <>
                    {/* Profile Header */}
                    <div>
                      <h3 className="text-xl font-bold">{jitDisplayName(jitClients[profileData.client?.boulevard_id], profileData.client?.name) || 'Unknown'}</h3>
                      <div className="mt-1 space-y-0.5">
                        {(profileData.client?.email || jitClients[profileData.client?.boulevard_id]?.emailMasked) && <p className="text-sm text-neutral-500">{jitClients[profileData.client?.boulevard_id]?.emailMasked || profileData.client?.email}</p>}
                        {(profileData.client?.phone || jitClients[profileData.client?.boulevard_id]?.phoneMasked) && <p className="text-sm text-neutral-500">{jitClients[profileData.client?.boulevard_id]?.phoneMasked || profileData.client?.phone}</p>}
                      </div>
                      {profileData.client?.ltv_bucket && (
                        <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          profileData.client.ltv_bucket === 'vip' ? 'bg-violet-100 text-violet-700' :
                          profileData.client.ltv_bucket === 'high' ? 'bg-emerald-100 text-emerald-700' :
                          profileData.client.ltv_bucket === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>{profileData.client.ltv_bucket.toUpperCase()} LTV</span>
                      )}
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-lg font-bold">{profileData.client?.total_visits || 0}</p>
                        <p className="text-xs text-neutral-500">Total Visits</p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-lg font-bold">${Math.round(Number(profileData.client?.total_spend || 0)).toLocaleString()}</p>
                        <p className="text-xs text-neutral-500">Total Spend</p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-lg font-bold">{profileData.client?.days_since_last_visit ?? '\u2014'}d</p>
                        <p className="text-xs text-neutral-500">Since Last Visit</p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-lg font-bold">{profileData.client?.avg_days_between_visits || '\u2014'}d</p>
                        <p className="text-xs text-neutral-500">Avg Between Visits</p>
                      </div>
                    </div>

                    {/* Account Credit */}
                    {(profileData.client?.account_credit > 0 || profileData.client?.creditFormatted) && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-emerald-700">Account Credit</p>
                            <p className="text-2xl font-bold text-emerald-800">{profileData.client.creditFormatted || `$${(profileData.client.account_credit / 100).toFixed(0)}`}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Memberships */}
                    {profileData.activeMembership && (
                      <div className="border rounded-lg p-4">
                        <h4 className="text-sm font-semibold mb-2">Active Membership</h4>
                        <p className="font-medium">{profileData.activeMembership.name}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Since {new Date(profileData.activeMembership.start_on || profileData.activeMembership.startOn).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {profileData.activeMembership.unit_price ? ` · $${(profileData.activeMembership.unit_price / 100).toFixed(0)}/mo` : ''}
                        </p>
                        {profileData.activeMembership.vouchers?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {profileData.activeMembership.vouchers.map((v, i) => (
                              <div key={i} className="flex items-center justify-between text-xs bg-blue-50 rounded px-2 py-1">
                                <span className="text-blue-700">{v.services?.[0]?.name || 'Voucher'}</span>
                                <span className="font-bold text-blue-800">{v.quantity} remaining</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Providers Seen */}
                    {profileData.providers_seen?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Providers Seen</h4>
                        <div className="space-y-1.5">
                          {profileData.providers_seen.map((prov) => (
                            <div key={prov.provider_staff_id || prov.provider_name} className="flex items-center justify-between border rounded-lg px-3 py-2">
                              <div>
                                <p className="text-sm font-medium">{prov.provider_name}</p>
                                <p className="text-xs text-neutral-400">{prov.visits} visits · ${Math.round(Number(prov.revenue || 0)).toLocaleString()}</p>
                              </div>
                              <p className="text-xs text-neutral-500">{prov.last_seen ? new Date(prov.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Appointment History */}
                    {profileData.appointment_history?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Appointment History ({profileData.appointment_history.length})</h4>
                        <div className="space-y-1.5 max-h-80 overflow-y-auto">
                          {profileData.appointment_history.map((appt) => (
                            <div key={appt.appointment_id} className="border rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                <span className="text-xs font-medium">${Math.round(Number(appt.total || 0))}</span>
                              </div>
                              <div className="mt-1 space-y-0.5">
                                {(appt.services || []).map((svc, i) => (
                                  <p key={i} className="text-xs text-neutral-500">{svc.name}{svc.price ? ` · $${Math.round(Number(svc.price))}` : ''}</p>
                                ))}
                              </div>
                              <p className="text-[10px] text-neutral-400 mt-1 capitalize">{appt.location}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products Purchased */}
                    {profileData.products_purchased?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Products Purchased</h4>
                        <div className="space-y-1">
                          {profileData.products_purchased.slice(0, 10).map((prod) => (
                            <div key={prod.sku_key || prod.product_name} className="flex items-center justify-between text-xs border rounded px-3 py-1.5">
                              <span className="text-neutral-700">{prod.product_name}</span>
                              <span className="text-neutral-500">{prod.qty} units · ${Math.round(Number(prod.spend || 0))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center text-neutral-400 text-sm">Failed to load profile.</div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-400 text-sm">Failed to load entry data.</div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}

DailyConcierge.getLayout = (page) => page
