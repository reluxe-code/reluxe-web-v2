// src/pages/admin/gift-cards.js
// Gift Cards admin: dashboard stats, promotions CRUD, orders list
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

function StatCard({ label, value, sub, color }) {
  const borderColors = {
    emerald: 'border-l-emerald-500', violet: 'border-l-violet-500',
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

function fmt(cents) { return `$${(cents / 100).toFixed(2)}` }
function fmtWhole(cents) { return `$${Math.round(cents / 100).toLocaleString()}` }

const PROMO_TYPES = [
  { value: 'bonus_flat', label: 'Spend $X+, get $Y bonus', desc: 'Flat bonus at a spend threshold' },
  { value: 'bonus_tiered', label: 'Every $X spent, get $Y bonus', desc: 'Stacking bonus per tier' },
  { value: 'service_voucher', label: 'Spend $X+, get free service', desc: 'Service reward at threshold' },
]

const RECIPIENT_OPTIONS = [
  { value: 'recipient', label: 'Recipient' },
  { value: 'sender', label: 'Sender' },
  { value: 'choice', label: 'Buyer chooses' },
]

const STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-rose-100 text-rose-700',
  refunded: 'bg-neutral-100 text-neutral-600',
  sent: 'bg-emerald-100 text-emerald-700',
  scheduled: 'bg-blue-100 text-blue-700',
}

export default function GiftCardsAdmin() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [promoFormOpen, setPromoFormOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orderDetail, setOrderDetail] = useState(null)
  const [sendFormOpen, setSendFormOpen] = useState(false)
  const [sendForm, setSendForm] = useState({
    amountDollars: '', recipientName: '', recipientEmail: '',
    senderName: '', message: '', deliverAt: '', paymentNote: '',
  })
  const [sendLoading, setSendLoading] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  const [promoForm, setPromoForm] = useState({
    name: '', description: '', promo_code: '',
    promo_type: 'bonus_flat',
    threshold: '',       // $ — min spend (bonus_flat, service_voucher) or tier size (bonus_tiered)
    bonusAmount: '',     // $ — bonus gift card value
    serviceName: '',     // service_voucher only
    bonus_recipient: 'choice',
    starts_at: '', ends_at: '', max_claims: '', sort_order: 0,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/gift-cards/dashboard?days=${days}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [days])

  useEffect(() => { fetchData() }, [fetchData])

  const resetPromoForm = () => {
    setPromoForm({
      name: '', description: '', promo_code: '',
      promo_type: 'bonus_flat',
      threshold: '', bonusAmount: '', serviceName: '',
      bonus_recipient: 'choice',
      starts_at: '', ends_at: '', max_claims: '', sort_order: 0,
    })
    setEditingPromo(null)
  }

  const [promoError, setPromoError] = useState(null)

  const savePromo = async () => {
    setPromoError(null)
    const thresholdCents = Math.round(parseFloat(promoForm.threshold || 0) * 100)
    const bonusCents = Math.round(parseFloat(promoForm.bonusAmount || 0) * 100)

    if (!promoForm.name.trim()) { setPromoError('Promotion name is required'); return }
    if (!thresholdCents) { setPromoError('Threshold amount is required'); return }
    if (promoForm.promo_type !== 'service_voucher' && !bonusCents) { setPromoError('Bonus amount is required'); return }
    if (promoForm.promo_type === 'service_voucher' && !promoForm.serviceName?.trim()) { setPromoError('Service name is required'); return }

    const payload = {
      name: promoForm.name,
      description: promoForm.description || null,
      promo_code: promoForm.promo_code || null,
      promo_type: promoForm.promo_type,
      min_purchase_cents: thresholdCents,
      max_purchase_cents: null,
      promo_value_cents: promoForm.promo_type !== 'service_voucher' ? bonusCents : null,
      promo_percentage: null,
      badge_text: null,
      bonus_service_name: promoForm.promo_type === 'service_voucher' ? promoForm.serviceName : null,
      bonus_recipient: promoForm.promo_type !== 'service_voucher' ? promoForm.bonus_recipient : 'recipient',
      starts_at: promoForm.starts_at || new Date().toISOString(),
      ends_at: promoForm.ends_at || null,
      max_claims: promoForm.max_claims ? parseInt(promoForm.max_claims) : null,
      sort_order: parseInt(promoForm.sort_order) || 0,
    }

    if (editingPromo) payload.id = editingPromo.id

    try {
      const res = await fetch('/api/admin/gift-cards/promotions', {
        method: editingPromo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (res.ok) {
        setPromoFormOpen(false)
        resetPromoForm()
        fetchData()
      } else {
        setPromoError(json.error || `Save failed (${res.status})`)
      }
    } catch (err) {
      setPromoError(`Network error: ${err.message}`)
    }
  }

  const togglePromo = async (promo) => {
    try {
      const res = await fetch('/api/admin/gift-cards/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promo.id, is_active: !promo.is_active }),
      })
      const json = await res.json()
      if (!res.ok) alert(`Toggle failed: ${json.error || 'Unknown error'}`)
    } catch (err) {
      alert(`Toggle error: ${err.message}`)
    }
    fetchData()
  }

  const editPromo = (promo) => {
    setPromoForm({
      name: promo.name || '',
      description: promo.description || '',
      promo_code: promo.promo_code || '',
      promo_type: promo.promo_type || 'bonus_flat',
      threshold: promo.min_purchase_cents ? String(promo.min_purchase_cents / 100) : '',
      bonusAmount: promo.promo_value_cents ? String(promo.promo_value_cents / 100) : '',
      serviceName: promo.bonus_service_name || '',
      bonus_recipient: promo.bonus_recipient || 'choice',
      starts_at: promo.starts_at?.split('T')[0] || '',
      ends_at: promo.ends_at?.split('T')[0] || '',
      max_claims: promo.max_claims || '',
      sort_order: promo.sort_order || 0,
    })
    setEditingPromo(promo)
    setPromoFormOpen(true)
  }

  const loadOrderDetail = async (orderId) => {
    if (expandedOrder === orderId) { setExpandedOrder(null); return }
    setExpandedOrder(orderId)
    const res = await fetch(`/api/admin/gift-cards/orders?id=${orderId}`)
    const json = await res.json()
    setOrderDetail(json)
  }

  const adminAction = async (action, orderId, cardId, extra = {}) => {
    await fetch('/api/admin/gift-cards/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, orderId, cardId, ...extra }),
    })
    if (orderId) loadOrderDetail(orderId)
    fetchData()
  }

  const retryBlvdSync = async (orderId) => {
    try {
      const res = await fetch('/api/admin/gift-cards/retry-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const json = await res.json()
      if (json.ok) {
        alert('Boulevard sync successful!')
      } else {
        alert(`Sync failed: ${json.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert(`Sync error: ${err.message}`)
    }
    fetchData()
  }

  const resetSendForm = () => {
    setSendForm({ amountDollars: '', recipientName: '', recipientEmail: '', senderName: '', message: '', deliverAt: '', paymentNote: '' })
    setSendResult(null)
  }

  const handleSendGiftCard = async () => {
    if (!sendForm.amountDollars || !sendForm.recipientName || !sendForm.recipientEmail) {
      alert('Amount, recipient name, and email are required')
      return
    }
    setSendLoading(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/admin/gift-cards/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents: Math.round(parseFloat(sendForm.amountDollars) * 100),
          recipientName: sendForm.recipientName,
          recipientEmail: sendForm.recipientEmail,
          senderName: sendForm.senderName || 'RELUXE Med Spa',
          message: sendForm.message,
          deliverAt: sendForm.deliverAt || null,
          paymentNote: sendForm.paymentNote,
        }),
      })
      const json = await res.json()
      if (json.ok) {
        setSendResult({ success: true, code: json.code, blvdSynced: json.blvdSynced })
        fetchData()
      } else {
        setSendResult({ success: false, error: json.error })
      }
    } catch (err) {
      setSendResult({ success: false, error: err.message })
    } finally {
      setSendLoading(false)
    }
  }

  if (loading && !data) {
    return <AdminLayout><div className="p-8"><p className="text-neutral-500">Loading...</p></div></AdminLayout>
  }

  const stats = data?.stats || {}

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gift Cards</h1>
          <div className="flex items-center gap-3">
            <select value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="text-sm border rounded-lg px-3 py-1.5">
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
            <button onClick={fetchData} className="text-sm bg-neutral-100 px-3 py-1.5 rounded-lg hover:bg-neutral-200">Refresh</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label={`Revenue (${days}d)`} value={fmtWhole(stats.totalRevenue)} color="emerald" />
          <StatCard label={`Cards Sold (${days}d)`} value={stats.totalSold} color="violet" />
          <StatCard label="Outstanding Balance" value={fmtWhole(stats.outstandingBalance)} color="blue" />
          <StatCard label="Active Promos" value={stats.activePromos} color="amber" />
          <StatCard label="Pending Deliveries" value={stats.pendingDeliveries} color="rose" />
        </div>

        {/* Send Gift Card (In-Office) */}
        <div className="bg-white rounded-lg border mb-8">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Send Gift Card</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Create and send a gift card for in-office purchases</p>
            </div>
            <button
              onClick={() => { resetSendForm(); setSendFormOpen(!sendFormOpen) }}
              className="text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700"
            >
              {sendFormOpen ? 'Cancel' : '+ Send Gift Card'}
            </button>
          </div>

          {sendFormOpen && (
            <div className="p-4 bg-neutral-50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Amount ($) *</label>
                  <input
                    type="number" step="1" min="25" max="2000"
                    value={sendForm.amountDollars}
                    onChange={(e) => setSendForm({ ...sendForm, amountDollars: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2" placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Recipient Name *</label>
                  <input
                    value={sendForm.recipientName}
                    onChange={(e) => setSendForm({ ...sendForm, recipientName: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2" placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Recipient Email *</label>
                  <input
                    type="email" value={sendForm.recipientEmail}
                    onChange={(e) => setSendForm({ ...sendForm, recipientEmail: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2" placeholder="jane@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Sender Name</label>
                  <input
                    value={sendForm.senderName}
                    onChange={(e) => setSendForm({ ...sendForm, senderName: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2" placeholder="RELUXE Med Spa"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Schedule Delivery</label>
                  <input
                    type="datetime-local" value={sendForm.deliverAt}
                    onChange={(e) => setSendForm({ ...sendForm, deliverAt: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Internal Note</label>
                  <input
                    value={sendForm.paymentNote}
                    onChange={(e) => setSendForm({ ...sendForm, paymentNote: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2" placeholder="In-office cash purchase"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-neutral-500 block mb-1">Personal Message (optional)</label>
                <input
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2" placeholder="Enjoy your RELUXE gift card!"
                />
              </div>

              {sendResult && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${sendResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {sendResult.success ? (
                    <>
                      Gift card created! Code: <strong className="font-mono">{sendResult.code}</strong>
                      {sendResult.blvdSynced && <span className="ml-2 text-xs bg-emerald-100 px-1.5 py-0.5 rounded">BLVD Synced</span>}
                    </>
                  ) : (
                    <>Error: {sendResult.error}</>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSendGiftCard} disabled={sendLoading}
                  className="text-sm bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {sendLoading ? 'Creating...' : 'Create & Send Gift Card'}
                </button>
                {sendResult?.success && (
                  <button
                    onClick={resetSendForm}
                    className="text-sm bg-neutral-100 px-4 py-2 rounded-lg hover:bg-neutral-200"
                  >
                    Send Another
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Promotions */}
        <div className="bg-white rounded-lg border mb-8">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Promotions & Promo Codes</h2>
            <button
              onClick={() => { resetPromoForm(); setPromoFormOpen(!promoFormOpen) }}
              className="text-sm bg-violet-600 text-white px-4 py-1.5 rounded-lg hover:bg-violet-700"
            >
              {promoFormOpen ? 'Cancel' : '+ New Promotion'}
            </button>
          </div>

          {promoFormOpen && (
            <div className="p-4 border-b bg-neutral-50">
              {/* Row 1: Name + Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Promotion Name *</label>
                  <input value={promoForm.name} onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="Mother's Day Special" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Type *</label>
                  <select value={promoForm.promo_type} onChange={(e) => setPromoForm({ ...promoForm, promo_type: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2">
                    {PROMO_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <p className="text-xs text-neutral-400 mt-1">{PROMO_TYPES.find(t => t.value === promoForm.promo_type)?.desc}</p>
                </div>
              </div>

              {/* Row 2: Type-specific fields */}
              {promoForm.promo_type === 'bonus_flat' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Minimum Spend ($) *</label>
                    <input type="number" step="1" value={promoForm.threshold} onChange={(e) => setPromoForm({ ...promoForm, threshold: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="100" />
                    <p className="text-xs text-neutral-400 mt-1">Customer must spend at least this much</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Bonus Amount ($) *</label>
                    <input type="number" step="1" value={promoForm.bonusAmount} onChange={(e) => setPromoForm({ ...promoForm, bonusAmount: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="20" />
                    <p className="text-xs text-neutral-400 mt-1">Flat bonus regardless of amount</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Bonus Goes To</label>
                    <select value={promoForm.bonus_recipient} onChange={(e) => setPromoForm({ ...promoForm, bonus_recipient: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2">
                      {RECIPIENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {promoForm.promo_type === 'bonus_tiered' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Per Every ($) *</label>
                    <input type="number" step="1" value={promoForm.threshold} onChange={(e) => setPromoForm({ ...promoForm, threshold: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="100" />
                    <p className="text-xs text-neutral-400 mt-1">e.g. &ldquo;Every $100 spent&rdquo;</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Bonus Per Tier ($) *</label>
                    <input type="number" step="1" value={promoForm.bonusAmount} onChange={(e) => setPromoForm({ ...promoForm, bonusAmount: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="20" />
                    <p className="text-xs text-neutral-400 mt-1">$200 = $40, $150 = $20</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Bonus Goes To</label>
                    <select value={promoForm.bonus_recipient} onChange={(e) => setPromoForm({ ...promoForm, bonus_recipient: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2">
                      {RECIPIENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {promoForm.promo_type === 'service_voucher' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Minimum Spend ($) *</label>
                    <input type="number" step="1" value={promoForm.threshold} onChange={(e) => setPromoForm({ ...promoForm, threshold: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Free Service *</label>
                    <input value={promoForm.serviceName} onChange={(e) => setPromoForm({ ...promoForm, serviceName: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="Signature Facial" />
                  </div>
                </div>
              )}

              {/* Preview */}
              {promoForm.threshold && (
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 mb-3 text-sm text-violet-700">
                  <strong>Preview:</strong>{' '}
                  {promoForm.promo_type === 'bonus_flat' && `Spend $${promoForm.threshold}+, get a $${promoForm.bonusAmount || '?'} bonus gift card`}
                  {promoForm.promo_type === 'bonus_tiered' && `Every $${promoForm.threshold} spent → $${promoForm.bonusAmount || '?'} bonus (e.g. $${parseInt(promoForm.threshold) * 2} = $${parseInt(promoForm.bonusAmount || 0) * 2} bonus)`}
                  {promoForm.promo_type === 'service_voucher' && `Spend $${promoForm.threshold}+, get a free ${promoForm.serviceName || '...'}`}
                </div>
              )}

              {/* Row 3: Description + Promo Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Customer-Facing Description</label>
                  <input value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="Buy $100+, get $20 bonus gift card!" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Promo Code</label>
                  <input value={promoForm.promo_code} onChange={(e) => setPromoForm({ ...promoForm, promo_code: e.target.value.toUpperCase() })} className="w-full text-sm border rounded-lg px-3 py-2 uppercase" placeholder="Leave empty = auto-apply for everyone" />
                </div>
              </div>

              {/* Row 4: Dates + Limits */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Starts</label>
                  <input type="date" value={promoForm.starts_at} onChange={(e) => setPromoForm({ ...promoForm, starts_at: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Ends</label>
                  <input type="date" value={promoForm.ends_at} onChange={(e) => setPromoForm({ ...promoForm, ends_at: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Max Claims</label>
                  <input type="number" value={promoForm.max_claims} onChange={(e) => setPromoForm({ ...promoForm, max_claims: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="Unlimited" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">Sort Order</label>
                  <input type="number" value={promoForm.sort_order} onChange={(e) => setPromoForm({ ...promoForm, sort_order: e.target.value })} className="w-full text-sm border rounded-lg px-3 py-2" />
                </div>
              </div>

              {promoError && (
                <div className="mb-3 p-3 rounded-lg text-sm bg-rose-50 text-rose-700 border border-rose-200">
                  {promoError}
                </div>
              )}

              <button onClick={savePromo} className="text-sm bg-violet-600 text-white px-5 py-2 rounded-lg hover:bg-violet-700">
                {editingPromo ? 'Update Promotion' : 'Create Promotion'}
              </button>
            </div>
          )}

          {/* Promotions table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500 border-b">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Rule</th>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Dates</th>
                  <th className="px-4 py-2">Claims</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.promotions || []).map((p) => {
                  const ruleText = (() => {
                    if (p.promo_type === 'bonus_flat') return `Spend $${(p.min_purchase_cents||0)/100}+ → $${(p.promo_value_cents||0)/100} bonus`
                    if (p.promo_type === 'bonus_tiered') return `Every $${(p.min_purchase_cents||0)/100} → $${(p.promo_value_cents||0)/100} bonus`
                    if (p.promo_type === 'service_voucher') return `Spend $${(p.min_purchase_cents||0)/100}+ → free ${p.bonus_service_name || 'service'}`
                    // Legacy types
                    if (p.promo_type === 'bonus_fixed') return `Spend $${(p.min_purchase_cents||0)/100}+ → $${(p.promo_value_cents||0)/100} bonus`
                    if (p.promo_type === 'bonus_percentage') return `${p.promo_percentage}% bonus on $${(p.min_purchase_cents||0)/100}+`
                    return p.promo_type
                  })()
                  const dateRange = [
                    p.starts_at ? new Date(p.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
                    p.ends_at ? new Date(p.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'ongoing',
                  ].filter(Boolean).join(' – ')
                  return (
                  <tr key={p.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <span className="font-semibold">{p.name}</span>
                      {p.description && <p className="text-xs text-neutral-400 mt-0.5">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs">{ruleText}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.promo_code || <span className="text-neutral-400">auto</span>}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">{dateRange}</td>
                    <td className="px-4 py-3">{p.total_claimed}{p.max_claims ? ` / ${p.max_claims}` : ''}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => togglePromo(p)} className="text-xs text-blue-600 hover:underline">
                          {p.is_active ? 'Pause' : 'Activate'}
                        </button>
                        <button onClick={() => editPromo(p)} className="text-xs text-violet-600 hover:underline">Edit</button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
                {!(data?.promotions?.length) && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No promotions yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500 border-b">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Sender</th>
                  <th className="px-4 py-2">Recipient</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Promo</th>
                  <th className="px-4 py-2">Payment</th>
                  <th className="px-4 py-2">Delivery</th>
                  <th className="px-4 py-2">BLVD</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentOrders || []).map((o) => (
                  <>
                    <tr key={o.id} className="border-b hover:bg-neutral-50 cursor-pointer" onClick={() => loadOrderDetail(o.id)}>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">{o.sender_name}</td>
                      <td className="px-4 py-3">{o.recipient_name}</td>
                      <td className="px-4 py-3 font-semibold">
                        {fmt(o.amount_cents)}
                        {o.discount_cents > 0 && <span className="text-xs text-emerald-600 ml-1">(-{fmt(o.discount_cents)})</span>}
                        {o.bonus_amount_cents > 0 && <span className="text-xs text-violet-600 ml-1">(+{fmt(o.bonus_amount_cents)} bonus)</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{o.promo_code_used || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[o.payment_status] || ''}`}>{o.payment_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[o.delivery_status] || ''}`}>{o.delivery_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {o.blvd_synced ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700" title={o.blvd_gift_card_id || ''}>Synced</span>
                        ) : o.payment_status === 'paid' ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); retryBlvdSync(o.id) }}
                            className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 cursor-pointer"
                          >
                            Retry
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                    {expandedOrder === o.id && orderDetail && (
                      <tr key={`${o.id}-detail`}>
                        <td colSpan={8} className="bg-neutral-50 px-6 py-4">
                          <div className="flex gap-2 mb-3">
                            <button onClick={() => adminAction('resend_email', o.id)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Resend Email</button>
                            {!o.blvd_synced && o.payment_status === 'paid' && (
                              <button onClick={() => retryBlvdSync(o.id)} className="text-xs bg-violet-600 text-white px-3 py-1 rounded hover:bg-violet-700">Retry BLVD Sync</button>
                            )}
                          </div>
                          {(orderDetail.cards || []).map((card) => (
                            <div key={card.id} className="bg-white rounded-lg border p-3 mb-2">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="font-mono font-bold text-sm">{card.code}</span>
                                  {card.is_bonus && <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">Bonus</span>}
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[card.status] || 'bg-neutral-100'}`}>{card.status}</span>
                              </div>
                              <div className="flex gap-4 text-xs text-neutral-500">
                                <span>Original: {fmt(card.original_amount_cents)}</span>
                                <span>Remaining: <strong className="text-neutral-800">{fmt(card.remaining_amount_cents)}</strong></span>
                                <span>Expires: {new Date(card.expires_at).toLocaleDateString()}</span>
                                {card.claimed_at && <span className="text-emerald-600">Claimed {new Date(card.claimed_at).toLocaleDateString()}</span>}
                              </div>
                              {card.gift_card_transactions?.length > 0 && (
                                <div className="mt-2 text-xs">
                                  {card.gift_card_transactions.map((t) => (
                                    <div key={t.id} className="flex gap-3 py-1 border-t border-neutral-100">
                                      <span className="text-neutral-400 w-24">{new Date(t.created_at).toLocaleDateString()}</span>
                                      <span className="font-semibold w-20">{t.event_type}</span>
                                      <span className={t.amount_cents >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{t.amount_cents >= 0 ? '+' : ''}{fmt(t.amount_cents)}</span>
                                      <span className="text-neutral-400">→ {fmt(t.balance_after_cents)}</span>
                                      {t.admin_note && <span className="text-neutral-400 italic">{t.admin_note}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {card.status === 'active' && (
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => adminAction('cancel_card', o.id, card.id)} className="text-xs text-rose-600 hover:underline">Cancel Card</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {!(data?.recentOrders?.length) && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-400">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

GiftCardsAdmin.getLayout = (page) => page
