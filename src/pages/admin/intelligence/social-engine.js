// src/pages/admin/intelligence/social-engine.js
// Social Availability Engine — convert calendar gaps into IG Story campaigns.
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

const TABS = [
  { id: 'create', label: 'Create Campaign' },
  { id: 'active', label: 'Active' },
  { id: 'history', label: 'History' },
]

const STYLES = [
  { id: 'rose', label: 'Rose', desc: 'Pink-to-purple gradient accents', color: '#ec4899' },
  { id: 'gold', label: 'Gold', desc: 'Warm amber-gold accents', color: '#f59e0b' },
  { id: 'frost', label: 'Frost', desc: 'Cool teal-to-blue accents', color: '#06b6d4' },
  { id: 'clean', label: 'Clean', desc: 'White cards, dark text', color: '#e5e5e5' },
]

const STATUS_BADGE = {
  draft: 'bg-neutral-100 text-neutral-600',
  active: 'bg-emerald-50 text-emerald-700',
  sold_out: 'bg-amber-50 text-amber-700',
  expired: 'bg-neutral-100 text-neutral-400',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function SocialEnginePage() {
  const [tab, setTab] = useState('create')

  // ── Provider data ──
  const [providers, setProviders] = useState([])
  const [providersLoading, setProvidersLoading] = useState(true)

  // ── Step wizard state ──
  const [step, setStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsReason, setSlotsReason] = useState(null)
  const [selectedSlots, setSelectedSlots] = useState([])
  const [keyword, setKeyword] = useState('GLOW')
  const [style, setStyle] = useState('rose')
  const [caption, setCaption] = useState('')
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const [customBgUrl, setCustomBgUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  // ── Generation state ──
  const [generating, setGenerating] = useState(false)
  const [campaign, setCampaign] = useState(null)
  const [genError, setGenError] = useState(null)

  // ── Activation state ──
  const [activating, setActivating] = useState(false)
  const [activated, setActivated] = useState(false)
  const [notifying, setNotifying] = useState(false)
  const [notified, setNotified] = useState(false)
  const [providerPhone, setProviderPhone] = useState('')

  // ── Campaign lists ──
  const [campaigns, setCampaigns] = useState([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)

  // ── Load providers ──
  useEffect(() => {
    adminFetch('/api/admin/social-engine/providers')
      .then(r => r.json())
      .then(data => { setProviders(Array.isArray(data) ? data : []); setProvidersLoading(false) })
      .catch(() => setProvidersLoading(false))
  }, [])

  // ── Load campaigns ──
  const loadCampaigns = useCallback(() => {
    setCampaignsLoading(true)
    adminFetch('/api/admin/social-engine/campaigns?limit=50')
      .then(r => r.json())
      .then(d => { setCampaigns(d.campaigns || []); setCampaignsLoading(false) })
      .catch(() => setCampaignsLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'active' || tab === 'history') loadCampaigns()
  }, [tab, loadCampaigns])

  // ── Derived data ──
  const providerLocations = selectedProvider?.locations || []
  const providerServices = selectedProvider?.services || {}
  const availableServices = selectedLocation
    ? Object.entries(providerServices)
        .filter(([, v]) => v.locations?.includes(selectedLocation))
        .map(([slug, v]) => ({ slug, name: v.name }))
    : []

  const serviceName = providerServices[selectedService]?.name || selectedService

  // ── Load availability ──
  const loadSlots = useCallback(async () => {
    if (!selectedProvider || !selectedLocation || !selectedService || !selectedDate) return
    setSlotsLoading(true)
    setSlots([])
    setSlotsReason(null)
    try {
      const params = new URLSearchParams({
        providerSlug: selectedProvider.slug,
        locationKey: selectedLocation,
        serviceSlug: selectedService,
        date: selectedDate,
        debug: '1',
      })
      const res = await adminFetch(`/api/admin/social-engine/availability?${params}`)
      const data = await res.json()
      setSlots(data.slots || [])
      if (data.slots?.length === 0 && data.reason) {
        setSlotsReason(data)
      }
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }, [selectedProvider, selectedLocation, selectedService, selectedDate])

  useEffect(() => {
    if (step === 4) loadSlots()
  }, [step, selectedDate, loadSlots])

  // ── Slot toggle ──
  function toggleSlot(slot) {
    setSelectedSlots(prev => {
      const exists = prev.find(s => s.id === slot.id)
      if (exists) return prev.filter(s => s.id !== slot.id)
      if (prev.length >= 4) return prev
      return [...prev, { ...slot, date: selectedDate }]
    })
  }

  // ── Generate ──
  async function handleGenerate() {
    setGenerating(true)
    setGenError(null)
    setCampaign(null)
    try {
      const res = await adminFetch('/api/admin/social-engine/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerSlug: selectedProvider.slug,
          providerName: selectedProvider.name,
          locationKey: selectedLocation,
          serviceSlug: selectedService,
          serviceName,
          timeSlots: selectedSlots,
          keyword: keyword.toUpperCase(),
          style,
          caption: caption || undefined,
          backgroundUrl: backgroundUrl || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setCampaign(data.campaign)
      setStep(7)
    } catch (err) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  // ── Activate ──
  async function handleActivate() {
    if (!campaign) return
    setActivating(true)
    try {
      const res = await adminFetch('/api/admin/social-engine/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCampaign(data.campaign)
      setActivated(true)
    } catch (err) {
      setGenError(err.message)
    } finally {
      setActivating(false)
    }
  }

  // ── Notify provider ──
  async function handleNotifyProvider() {
    if (!campaign || !providerPhone) return
    setNotifying(true)
    try {
      await adminFetch('/api/admin/social-engine/notify-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, phone: providerPhone }),
      })
      setNotified(true)
    } catch {}
    setNotifying(false)
  }

  // ── Update campaign status ──
  async function updateCampaignStatus(id, status) {
    await adminFetch('/api/admin/social-engine/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    loadCampaigns()
  }

  // ── Reset wizard ──
  function resetWizard() {
    setStep(1)
    setSelectedProvider(null)
    setSelectedLocation('')
    setSelectedService('')
    setSelectedDate(new Date().toISOString().slice(0, 10))
    setSlots([])
    setSelectedSlots([])
    setKeyword('GLOW')
    setStyle('rose')
    setCaption('')
    setBackgroundUrl('')
    setCustomBgUrl('')
    setCampaign(null)
    setGenError(null)
    setActivated(false)
    setNotified(false)
  }

  // ── Copy to clipboard ──
  function copyText(text) {
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  // ── Tomorrow helper ──
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)
  const todayStr = new Date().toISOString().slice(0, 10)

  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const pastCampaigns = campaigns.filter(c => c.status !== 'active')

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Social Engine</h1>
        <p className="text-sm text-neutral-500 mt-1">Turn open slots into IG Story campaigns with instant DM booking</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-rose-500 text-rose-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {t.label}
            {t.id === 'active' && activeCampaigns.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                {activeCampaigns.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* CREATE TAB                                                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      {tab === 'create' && (
        <div>
          {/* Progress bar */}
          <div className="flex items-center gap-1 mb-8">
            {[1, 2, 3, 4, 5, 6, 7].map(s => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s < step ? 'bg-rose-500 text-white' :
                  s === step ? 'bg-rose-600 text-white ring-2 ring-rose-300' :
                  'bg-neutral-100 text-neutral-400'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 7 && <div className={`w-8 h-0.5 ${s < step ? 'bg-rose-400' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Select Provider ── */}
          {step === 1 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Select Provider</h2>
              {providersLoading ? (
                <p className="text-neutral-400">Loading providers...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {providers.map(p => (
                    <button
                      key={p.slug}
                      onClick={() => {
                        setSelectedProvider(p)
                        setSelectedLocation(p.locations.length === 1 ? p.locations[0] : '')
                        setSelectedService('')
                        if (p.image) setBackgroundUrl(p.image)
                        setStep(p.locations.length === 1 ? 3 : 2)
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-rose-300 hover:bg-rose-50 transition-colors text-left"
                    >
                      {p.image && (
                        <img src={p.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Select Location ── */}
          {step === 2 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Select Location</h2>
              <p className="text-sm text-neutral-500 mb-4">for {selectedProvider?.name}</p>
              <div className="flex gap-3">
                {providerLocations.map(loc => (
                  <button
                    key={loc}
                    onClick={() => { setSelectedLocation(loc); setSelectedService(''); setStep(3) }}
                    className="flex-1 p-4 rounded-lg border hover:border-rose-300 hover:bg-rose-50 transition-colors text-center"
                  >
                    <p className="font-medium capitalize">{loc}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-4 text-sm text-neutral-500 hover:text-neutral-700">
                ← Back
              </button>
            </div>
          )}

          {/* ── Step 3: Select Service ── */}
          {step === 3 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Select Service</h2>
              <p className="text-sm text-neutral-500 mb-4">
                {selectedProvider?.name} at <span className="capitalize">{selectedLocation}</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableServices.map(svc => (
                  <button
                    key={svc.slug}
                    onClick={() => { setSelectedService(svc.slug); setStep(4) }}
                    className="p-3 rounded-lg border hover:border-rose-300 hover:bg-rose-50 transition-colors text-left"
                  >
                    <p className="text-sm font-medium">{svc.name}</p>
                    <p className="text-xs text-neutral-400">{svc.slug}</p>
                  </button>
                ))}
              </div>
              {availableServices.length === 0 && (
                <p className="text-neutral-400 text-sm">No services mapped for this provider at this location.</p>
              )}
              <button onClick={() => setStep(selectedProvider?.locations?.length === 1 ? 1 : 2)} className="mt-4 text-sm text-neutral-500 hover:text-neutral-700">
                ← Back
              </button>
            </div>
          )}

          {/* ── Step 4: View & Select Slots ── */}
          {step === 4 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-2">Available Slots</h2>
              <p className="text-sm text-neutral-500 mb-4">
                {selectedProvider?.name} · {serviceName} · <span className="capitalize">{selectedLocation}</span>
              </p>

              {/* Date tabs */}
              <div className="flex gap-2 mb-4">
                {[todayStr, tomorrowStr].map(d => (
                  <button
                    key={d}
                    onClick={() => { setSelectedDate(d); setSelectedSlots([]) }}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                      selectedDate === d
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-rose-300'
                    }`}
                  >
                    {d === todayStr ? 'Today' : 'Tomorrow'}
                  </button>
                ))}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => { setSelectedDate(e.target.value); setSelectedSlots([]) }}
                  className="border rounded-lg px-3 py-1 text-sm ml-2"
                />
              </div>

              {slotsLoading ? (
                <p className="text-neutral-400 py-8 text-center">Loading availability from Boulevard...</p>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-neutral-400">No open slots for this date.</p>
                  {slotsReason?.reason === 'staff_mismatch' && (
                    <div className="mt-3 mx-auto max-w-md p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs">
                      <p className="font-semibold text-amber-800 mb-1">Staff Variant Mismatch</p>
                      <p className="text-amber-700 mb-2">{slotsReason.detail}</p>
                      {slotsReason.variants?.length > 0 && (
                        <div>
                          <p className="text-amber-600 font-medium">Available staff for this service:</p>
                          <ul className="mt-1 space-y-0.5">
                            {slotsReason.variants.map((v, i) => (
                              <li key={i} className="text-amber-700 font-mono">{v.staffName} ({v.staffId})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {slotsReason.variants?.length === 0 && (
                        <p className="text-amber-600 italic">No staff variants returned for this service item.</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs text-neutral-500 mb-3">Select 1–4 slots to promote ({selectedSlots.length}/4 selected)</p>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {slots.map(slot => {
                      const isSelected = selectedSlots.some(s => s.id === slot.id)
                      return (
                        <button
                          key={slot.id}
                          onClick={() => toggleSlot(slot)}
                          disabled={!isSelected && selectedSlots.length >= 4}
                          className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-rose-500 text-white border-rose-500'
                              : selectedSlots.length >= 4
                                ? 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed'
                                : 'hover:border-rose-300 hover:bg-rose-50'
                          }`}
                        >
                          {slot.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between mt-6">
                <button onClick={() => setStep(3)} className="text-sm text-neutral-500 hover:text-neutral-700">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={selectedSlots.length === 0}
                  className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Configure ── */}
          {step === 5 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Configure Campaign</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-5">
                  {/* Background image */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Background Image</label>

                    {/* Current preview */}
                    {backgroundUrl && (
                      <div className="mb-3 relative rounded-lg overflow-hidden border" style={{ width: 160, height: 284 }}>
                        <img src={backgroundUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setBackgroundUrl('')}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/70"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {/* Provider image as default */}
                    {!backgroundUrl && selectedProvider?.image && (
                      <button
                        onClick={() => setBackgroundUrl(selectedProvider.image)}
                        className="mb-3 flex items-center gap-3 p-2 rounded-lg border border-dashed border-neutral-300 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                      >
                        <img src={selectedProvider.image} alt="" className="w-10 h-10 rounded object-cover" />
                        <span className="text-sm text-neutral-600">Use provider photo</span>
                      </button>
                    )}

                    {/* Custom URL input */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customBgUrl}
                        onChange={e => setCustomBgUrl(e.target.value)}
                        placeholder="Paste image URL..."
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => { if (customBgUrl) { setBackgroundUrl(customBgUrl); setCustomBgUrl('') } }}
                        disabled={!customBgUrl}
                        className="px-3 py-2 text-sm font-medium bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
                      >
                        Use
                      </button>
                    </div>

                    {/* Upload */}
                    <label className="mt-2 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-neutral-300 hover:border-rose-300 hover:bg-rose-50 cursor-pointer transition-colors">
                      <span className="text-sm text-neutral-500">{uploading ? 'Uploading...' : 'Upload image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploading(true)
                          try {
                            const form = new FormData()
                            form.append('file', file)
                            form.append('path', `social-engine/bg-${Date.now()}.${file.name.split('.').pop()}`)
                            const res = await adminFetch('/api/admin/social-engine/upload-bg', { method: 'POST', body: form })
                            const data = await res.json()
                            if (data.url) setBackgroundUrl(data.url)
                          } catch {}
                          setUploading(false)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>

                  {/* Keyword */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">ManyChat Keyword</label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={e => setKeyword(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                      placeholder="GLOW"
                    />
                    <p className="text-xs text-neutral-400 mt-1">Followers comment this word to get the DM</p>
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Suggested Caption (optional)</label>
                    <textarea
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder={`Last-minute availability with ${selectedProvider?.name}! Comment "${keyword}" to book...`}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-5">
                  {/* Style picker */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Card Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {STYLES.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setStyle(s.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                            style === s.id ? 'border-rose-400 bg-rose-50' : 'hover:border-neutral-300'
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full border-2"
                            style={{
                              backgroundColor: s.color,
                              borderColor: style === s.id ? '#e11d48' : 'transparent',
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium">{s.label}</p>
                            <p className="text-xs text-neutral-400">{s.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campaign summary */}
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-neutral-700 mb-2">Campaign Summary</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-neutral-500">Provider:</span> {selectedProvider?.name}</p>
                      <p><span className="text-neutral-500">Service:</span> {serviceName}</p>
                      <p><span className="text-neutral-500">Location:</span> <span className="capitalize">{selectedLocation}</span></p>
                      <p><span className="text-neutral-500">Slots:</span> {selectedSlots.map(s => s.label).join(', ')}</p>
                      <p><span className="text-neutral-500">Date:</span> {selectedDate}</p>
                      <p><span className="text-neutral-500">Keyword:</span> <span className="font-mono font-bold">{keyword}</span></p>
                      <p><span className="text-neutral-500">Style:</span> {STYLES.find(s => s.id === style)?.label}</p>
                      <p><span className="text-neutral-500">Background:</span> {backgroundUrl ? 'Custom image' : 'Dark fallback'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button onClick={() => setStep(4)} className="text-sm text-neutral-500 hover:text-neutral-700">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  disabled={!keyword}
                  className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                  Next: Generate Image →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 6: Generate ── */}
          {step === 6 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Generate Story Image</h2>

              {!campaign && !generating && (
                <div className="text-center py-8">
                  <p className="text-sm text-neutral-500 mb-4">
                    Generate a branded 9:16 Instagram Story with your time slots overlaid on the background image.
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Generate Story Image
                  </button>
                </div>
              )}

              {generating && (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4" />
                  <p className="text-neutral-500">Generating story image...</p>
                  <p className="text-xs text-neutral-400 mt-1">This should take a few seconds</p>
                </div>
              )}

              {genError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800 mb-4">
                  {genError}
                  <button
                    onClick={handleGenerate}
                    className="block mt-2 text-rose-600 underline hover:text-rose-800"
                  >
                    Try again
                  </button>
                </div>
              )}

              {campaign && (
                <div className="flex flex-col items-center">
                  {/* Image preview */}
                  {campaign.image_url && (
                    <div className="relative mb-4 rounded-xl overflow-hidden shadow-lg" style={{ width: 270, height: 480 }}>
                      <img
                        src={campaign.image_url}
                        alt="Story preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 mb-4">Preview (scaled from 1080×1920)</p>

                  <button
                    onClick={() => { setCampaign(null); setGenError(null); handleGenerate() }}
                    className="text-sm text-rose-600 hover:text-rose-800 mb-4"
                  >
                    Regenerate
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <button onClick={() => { setStep(5); setCampaign(null); setGenError(null) }} className="text-sm text-neutral-500 hover:text-neutral-700">
                  ← Back
                </button>
                {campaign && (
                  <button
                    onClick={() => setStep(7)}
                    className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
                    Next: Review & Activate →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step 7: Activate ── */}
          {step === 7 && campaign && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">
                {activated ? 'Campaign Activated!' : 'Review & Activate'}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: image preview */}
                <div className="flex justify-center">
                  {campaign.image_url && (
                    <div className="rounded-xl overflow-hidden shadow-lg" style={{ width: 270, height: 480 }}>
                      <img src={campaign.image_url} alt="Story" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Right: details + actions */}
                <div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Provider</span>
                      <span className="font-medium">{campaign.provider_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Service</span>
                      <span className="font-medium">{campaign.service_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Location</span>
                      <span className="font-medium capitalize">{campaign.location_key}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Slots</span>
                      <span className="font-medium">
                        {(campaign.time_slots || []).map(s => s.label || s.startTime).join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Keyword</span>
                      <span className="font-mono font-bold text-rose-600">{campaign.keyword}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>

                  {!activated ? (
                    <button
                      onClick={handleActivate}
                      disabled={activating}
                      className="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {activating ? 'Activating...' : 'Activate → Push to ManyChat'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                        Campaign is live! ManyChat field updated.
                      </div>

                      {/* Copy Package */}
                      <h3 className="text-sm font-semibold text-neutral-700 mt-4">Copy Package</h3>

                      <div className="flex gap-2">
                        <a
                          href={campaign.image_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 text-center text-sm font-medium border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          Download Image
                        </a>
                        <button
                          onClick={() => copyText(campaign.booking_url)}
                          className="flex-1 py-2 text-sm font-medium border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          Copy Booking URL
                        </button>
                      </div>

                      <button
                        onClick={() => copyText(campaign.caption)}
                        className="w-full py-2 text-sm font-medium border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        Copy Caption
                      </button>

                      {campaign.caption && (
                        <div className="p-3 bg-neutral-50 rounded-lg text-sm text-neutral-600">
                          {campaign.caption}
                        </div>
                      )}

                      {/* SMS to provider */}
                      <div className="border border-blue-100 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium mb-2">SMS Copy Package to Provider</p>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            value={providerPhone}
                            onChange={e => setProviderPhone(e.target.value)}
                            placeholder="Provider phone (e.g. 3171234567)"
                            className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                            disabled={notified}
                          />
                          <button
                            onClick={handleNotifyProvider}
                            disabled={notifying || notified || !providerPhone}
                            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {notified ? 'Sent!' : notifying ? '...' : 'Send SMS'}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={resetWizard}
                        className="w-full py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 mt-2"
                      >
                        Create Another Campaign
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {!activated && (
                <button onClick={() => setStep(6)} className="mt-4 text-sm text-neutral-500 hover:text-neutral-700">
                  ← Back
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ACTIVE TAB                                                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      {tab === 'active' && (
        <div>
          {campaignsLoading && <p className="text-neutral-400 text-center py-8">Loading...</p>}

          {!campaignsLoading && activeCampaigns.length === 0 && (
            <div className="text-center py-12 text-neutral-400">
              <p className="text-lg mb-2">No active campaigns</p>
              <button onClick={() => setTab('create')} className="text-rose-600 hover:text-rose-800 text-sm">
                Create one →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCampaigns.map(c => (
              <div key={c.id} className="bg-white rounded-lg border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">{c.provider_name}</p>
                    <p className="text-xs text-neutral-500">{c.service_name} · <span className="capitalize">{c.location_key}</span></p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status]}`}>
                    {c.status}
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  {(c.time_slots || []).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-xs font-medium">
                      {s.label || s.startTime}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                  <span>Keyword: <span className="font-mono font-bold text-rose-600">{c.keyword}</span></span>
                  <span>Created: {formatDate(c.created_at)}</span>
                  {c.manychat_synced && <span className="text-emerald-600">ManyChat synced</span>}
                  {c.sms_sent && <span className="text-blue-600">SMS sent</span>}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateCampaignStatus(c.id, 'sold_out')}
                    className="px-3 py-1.5 text-xs font-medium border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50"
                  >
                    Mark Sold Out
                  </button>
                  <button
                    onClick={() => updateCampaignStatus(c.id, 'expired')}
                    className="px-3 py-1.5 text-xs font-medium border border-neutral-200 text-neutral-500 rounded-lg hover:bg-neutral-50"
                  >
                    Expire
                  </button>
                  <a
                    href={c.image_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-medium border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => copyText(c.booking_url)}
                    className="px-3 py-1.5 text-xs font-medium border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* HISTORY TAB                                                 */}
      {/* ════════════════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Campaign History</h2>
          {campaignsLoading && <p className="text-neutral-400 text-center py-8">Loading...</p>}

          {!campaignsLoading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-neutral-500">
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-left py-2 pr-4">Provider</th>
                    <th className="text-left py-2 pr-4">Service</th>
                    <th className="text-left py-2 pr-4">Slots</th>
                    <th className="text-left py-2 pr-4">Keyword</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-center py-2 pr-4">Clicks</th>
                    <th className="text-center py-2">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                      <td className="py-2 pr-4 text-xs text-neutral-500 whitespace-nowrap">{formatDate(c.created_at)}</td>
                      <td className="py-2 pr-4 font-medium">{c.provider_name}</td>
                      <td className="py-2 pr-4 text-neutral-600">{c.service_name}</td>
                      <td className="py-2 pr-4">
                        {(c.time_slots || []).map(s => s.label || s.startTime).join(', ')}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-rose-600">{c.keyword}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-center">{c.stats?.clicks || 0}</td>
                      <td className="py-2 text-center">{c.stats?.bookings || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {campaigns.length === 0 && (
                <p className="text-neutral-400 text-center py-6">No campaigns yet.</p>
              )}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

SocialEnginePage.getLayout = (page) => page
