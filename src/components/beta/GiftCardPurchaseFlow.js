// src/components/beta/GiftCardPurchaseFlow.js
// Cart-based multi-recipient gift card purchase flow.
// ADD_CARD → CART → CHECKOUT → PAYMENT → SUCCESS
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, gradients } from '@/components/preview/tokens'
import { useMember } from '@/context/MemberContext'

const IS_SANDBOX = typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '').startsWith('sandbox-')
const MIN_AMOUNT_CENTS = IS_SANDBOX ? 25 : 2500 // $0.25 in sandbox, $25 in production
const PRESET_AMOUNTS = [50, 100, 150, 250, 500]
const OCCASIONS = [
  { key: 'birthday', label: 'Birthday', icon: '🎂' },
  { key: 'valentines', label: "Valentine's", icon: '💝' },
  { key: 'mothers_day', label: "Mother's Day", icon: '🌸' },
  { key: 'thank_you', label: 'Thank You', icon: '🙏' },
  { key: 'anniversary', label: 'Anniversary', icon: '✨' },
  { key: 'just_because', label: 'Just Because', icon: '💜' },
]

// Format cents as dollars — $20 for whole, $0.20 for fractional
function fmtBonus(cents) {
  if (!cents) return '$0'
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`
}

const fadeVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

// ─── Shared styles ───

const inputBase = (fonts) => ({
  fontFamily: fonts.body,
  fontSize: '0.9375rem',
  color: colors.heading,
  background: colors.cream,
  border: `1.5px solid transparent`,
  borderRadius: 12,
  padding: '14px 16px',
  width: '100%',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
})

const inputFocus = {
  borderColor: colors.violet,
  boxShadow: `0 0 0 3px ${colors.violet}15, inset 0 1px 2px rgba(0,0,0,0.03)`,
}

const labelBase = (fonts) => ({
  fontFamily: fonts.body,
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: colors.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  display: 'block',
  marginBottom: 8,
})

const primaryBtn = (fonts, disabled) => ({
  fontFamily: fonts.body,
  fontSize: '0.9375rem',
  fontWeight: 600,
  color: '#fff',
  background: disabled ? colors.taupe : gradients.primary,
  border: 'none',
  borderRadius: 999,
  padding: '16px 32px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  width: '100%',
  opacity: disabled ? 0.5 : 1,
  transition: 'all 0.25s ease',
  letterSpacing: '0.02em',
  boxShadow: disabled ? 'none' : '0 4px 16px rgba(124,58,237,0.25)',
})

const secondaryBtn = (fonts) => ({
  fontFamily: fonts.body,
  fontSize: '0.875rem',
  fontWeight: 600,
  color: colors.violet,
  background: `${colors.violet}08`,
  border: `1.5px solid ${colors.violet}30`,
  borderRadius: 999,
  padding: '14px 24px',
  cursor: 'pointer',
  width: '100%',
  transition: 'all 0.2s ease',
})

const backBtn = (fonts) => ({
  fontFamily: fonts.body,
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: colors.muted,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 0',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  transition: 'color 0.2s',
})

// ─── Progress dots ───
function StepIndicator({ stepIndex, fonts }) {
  const steps = ['Add', 'Cart', 'Details', 'Pay']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 32 }}>
      {steps.map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: i <= stepIndex ? 28 : 8,
            height: 8,
            borderRadius: 4,
            background: i <= stepIndex ? gradients.primary : colors.stone,
            transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }} />
        </div>
      ))}
    </div>
  )
}

// ─── Helper: find best auto-applied promo for an amount ───
function findBonusForAmount(autoPromos, amountCents) {
  const results = autoPromos.map(p => {
    let bonusCents = 0
    if (p.promo_type === 'bonus_flat') {
      if (amountCents >= (p.min_purchase_cents || 0)) bonusCents = p.promo_value_cents || 0
    } else if (p.promo_type === 'bonus_tiered') {
      if (p.min_purchase_cents > 0) bonusCents = Math.floor(amountCents / p.min_purchase_cents) * (p.promo_value_cents || 0)
    } else if (p.promo_type === 'bonus_fixed') {
      // Legacy
      if (amountCents >= (p.min_purchase_cents || 0)) bonusCents = p.promo_value_cents || 0
    } else if (p.promo_type === 'bonus_percentage') {
      // Legacy
      if (amountCents >= (p.min_purchase_cents || 0)) bonusCents = Math.floor(amountCents * (parseFloat(p.promo_percentage) / 100))
    }
    if (!bonusCents) return null
    return { promoId: p.id, promoName: p.name, description: p.description, bonusCents, bonusRecipient: p.bonus_recipient }
  }).filter(Boolean)
  if (!results.length) return null
  return results.sort((a, b) => b.bonusCents - a.bonusCents)[0]
}

// ─── Input field ───
function Field({ fonts, label, value, onChange, error, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      {label && <label style={labelBase(fonts)}>{label}</label>}
      <input
        type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          ...inputBase(fonts),
          borderColor: error ? colors.rose : focused ? colors.violet : 'transparent',
          ...(focused && !error ? { boxShadow: `0 0 0 3px ${colors.violet}15, inset 0 1px 2px rgba(0,0,0,0.03)` } : {}),
        }}
      />
      {error && <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.rose, margin: '6px 0 0', fontWeight: 500 }}>{error}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// STEP 1: ADD_CARD — pick amount + recipient
// ═══════════════════════════════════════════════════════════════
function AddCardStep({ fonts, autoPromos, onAdd, onBack, editingItem }) {
  const [amount, setAmount] = useState(editingItem?.amountCents || 0)
  const [custom, setCustom] = useState(editingItem && !PRESET_AMOUNTS.includes(editingItem.amountCents / 100) ? String(editingItem.amountCents / 100) : '')
  const [name, setName] = useState(editingItem?.recipientName || '')
  const [email, setEmail] = useState(editingItem?.recipientEmail || '')
  const [message, setMessage] = useState(editingItem?.message || '')
  const [occasion, setOccasion] = useState(editingItem?.occasion || '')
  const [errors, setErrors] = useState({})
  const [msgFocused, setMsgFocused] = useState(false)

  const isCustom = !PRESET_AMOUNTS.includes(amount / 100) && amount > 0

  const selectPreset = (d) => { setCustom(''); setAmount(d * 100) }
  const handleCustom = (val) => {
    const cleaned = val.replace(/[^0-9.]/g, '')
    setCustom(cleaned)
    const parsed = parseFloat(cleaned)
    setAmount(parsed && parsed * 100 >= MIN_AMOUNT_CENTS ? Math.round(parsed * 100) : 0)
  }

  const bonus = findBonusForAmount(autoPromos, amount)

  const handleSubmit = () => {
    const e = {}
    if (amount < MIN_AMOUNT_CENTS) e.amount = IS_SANDBOX ? 'Minimum $0.25' : 'Minimum $25'
    if (!name.trim()) e.name = 'Required'
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required'
    setErrors(e)
    if (Object.keys(e).length) return
    onAdd({
      id: editingItem?.id || `gc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      amountCents: amount,
      recipientName: name.trim(),
      recipientEmail: email.trim().toLowerCase(),
      message: message.trim().slice(0, 200),
      occasion,
    })
  }

  return (
    <div>
      {onBack && (
        <button type="button" onClick={onBack} style={backBtn(fonts)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Cart
        </button>
      )}

      <div style={{ textAlign: 'center', marginBottom: 28, marginTop: onBack ? 12 : 0 }}>
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.75rem', fontWeight: 700, color: colors.heading, marginBottom: 6 }}>
          {editingItem ? 'Edit Gift Card' : 'Choose Your Gift'}
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted, margin: 0 }}>
          Select an amount and tell us who it's for
        </p>
      </div>

      {/* Amount grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {PRESET_AMOUNTS.map(d => {
          const selected = amount === d * 100 && !isCustom
          const promo = findBonusForAmount(autoPromos, d * 100)
          return (
            <motion.button
              key={d} type="button" onClick={() => selectPreset(d)}
              whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700,
                color: selected ? '#fff' : colors.heading,
                background: selected ? gradients.primary : colors.cream,
                border: `1.5px solid ${selected ? 'transparent' : 'transparent'}`,
                borderRadius: 14, padding: '18px 8px', cursor: 'pointer',
                transition: 'all 0.25s ease', position: 'relative',
                boxShadow: selected ? '0 4px 20px rgba(124,58,237,0.3)' : 'none',
              }}
            >
              ${d}
              {promo && (
                <span style={{
                  position: 'absolute', top: -10, right: -6,
                  fontFamily: fonts.body, fontSize: '0.5625rem', fontWeight: 700,
                  color: '#fff', background: gradients.primary,
                  padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                }}>
                  +{fmtBonus(promo.bonusCents)} bonus
                </span>
              )}
            </motion.button>
          )
        })}
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700,
            color: custom ? colors.heading : colors.taupe, pointerEvents: 'none', zIndex: 1,
          }}>$</span>
          <input
            type="text" inputMode="numeric" placeholder="Custom" value={custom}
            onChange={e => handleCustom(e.target.value)}
            style={{
              ...inputBase(fonts),
              fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700,
              textAlign: 'center', paddingLeft: '1.75rem', height: '100%',
              background: isCustom ? `${colors.violet}08` : colors.cream,
              borderColor: isCustom ? colors.violet : 'transparent',
            }}
          />
        </div>
      </div>
      {errors.amount && <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.rose, margin: '-4px 0 12px', fontWeight: 500 }}>{errors.amount}</p>}

      {/* Bonus banner */}
      <AnimatePresence>
        {bonus && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: `linear-gradient(135deg, ${colors.violet}10, ${colors.fuchsia}08)`,
              border: `1px solid ${colors.violet}20`,
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: '1.25rem' }}>🎁</span>
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet, margin: 0, lineHeight: 1.4 }}>
                {bonus.description || `Includes a ${fmtBonus(bonus.bonusCents)} bonus gift card!`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div style={{ height: 1, background: colors.stone, margin: '20px 0' }} />

      {/* Recipient */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <Field fonts={fonts} label="Recipient Name" value={name} onChange={setName} error={errors.name} placeholder="Their name" />
        <Field fonts={fonts} label="Recipient Email" value={email} onChange={setEmail} error={errors.email} placeholder="their@email.com" type="email" />
      </div>

      {/* Personal message */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelBase(fonts)}>Personal Message <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: colors.taupe }}>(optional)</span></label>
        <textarea
          value={message} onChange={e => setMessage(e.target.value.slice(0, 200))}
          placeholder="Write something thoughtful..."
          rows={2}
          onFocus={() => setMsgFocused(true)} onBlur={() => setMsgFocused(false)}
          style={{
            ...inputBase(fonts), resize: 'none',
            borderColor: msgFocused ? colors.violet : 'transparent',
            ...(msgFocused ? { boxShadow: `0 0 0 3px ${colors.violet}15, inset 0 1px 2px rgba(0,0,0,0.03)` } : {}),
          }}
        />
        <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: colors.taupe, textAlign: 'right', margin: '4px 0 0' }}>{message.length}/200</p>
      </div>

      {/* Occasion chips */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelBase(fonts)}>Occasion</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {OCCASIONS.map(o => {
            const sel = occasion === o.key
            return (
              <motion.button
                key={o.key} type="button" whileTap={{ scale: 0.95 }}
                onClick={() => setOccasion(sel ? '' : o.key)}
                style={{
                  fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600,
                  color: sel ? '#fff' : colors.body,
                  background: sel ? colors.violet : colors.cream,
                  border: 'none', borderRadius: 999,
                  padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 5,
                  boxShadow: sel ? '0 2px 8px rgba(124,58,237,0.25)' : 'none',
                }}
              >
                <span style={{ fontSize: '0.8125rem' }}>{o.icon}</span> {o.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      <motion.button
        type="button" onClick={handleSubmit} whileTap={{ scale: 0.98 }}
        style={primaryBtn(fonts, amount < MIN_AMOUNT_CENTS)}
      >
        {editingItem ? 'Save Changes' : `Add $${amount >= MIN_AMOUNT_CENTS ? (amount / 100) : '—'} Gift Card to Cart`}
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: CART — view all cards, add more, proceed
// ═══════════════════════════════════════════════════════════════
function CartStep({ fonts, items, autoPromos, onAddAnother, onEdit, onRemove, onContinue }) {
  const subtotal = items.reduce((s, i) => s + i.amountCents, 0)
  const totalBonus = items.reduce((s, i) => {
    const b = findBonusForAmount(autoPromos, i.amountCents)
    return s + (b?.bonusCents || 0)
  }, 0)

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.75rem', fontWeight: 700, color: colors.heading, marginBottom: 6 }}>
          Your Cart
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted, margin: 0 }}>
          {items.length} gift card{items.length > 1 ? 's' : ''} ready to send
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {items.map((item, idx) => {
          const bonus = findBonusForAmount(autoPromos, item.amountCents)
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                background: '#fff',
                border: `1px solid ${colors.stone}`,
                borderRadius: 16,
                padding: '16px 20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle gradient accent on left */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: gradients.primary, borderRadius: '16px 0 0 16px',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: fonts.display, fontSize: '1.625rem', fontWeight: 700, color: colors.heading }}>
                      ${item.amountCents / 100}
                    </span>
                    {bonus && (
                      <span style={{
                        fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700,
                        color: colors.violet, background: `${colors.violet}10`,
                        padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap',
                      }}>
                        +{fmtBonus(bonus.bonusCents)} bonus
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, margin: 0 }}>
                    To <strong style={{ fontWeight: 600 }}>{item.recipientName}</strong>
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted, margin: '2px 0 0' }}>
                    {item.recipientEmail}
                  </p>
                  {item.message && (
                    <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted, fontStyle: 'italic', margin: '6px 0 0', lineHeight: 1.4 }}>
                      &ldquo;{item.message}&rdquo;
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, marginLeft: 12, flexShrink: 0 }}>
                  <button type="button" onClick={() => onEdit(item.id)} style={{
                    fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet,
                    background: `${colors.violet}08`, border: 'none', borderRadius: 8,
                    padding: '6px 10px', cursor: 'pointer', transition: 'background 0.2s',
                  }}>Edit</button>
                  <button type="button" onClick={() => onRemove(item.id)} style={{
                    fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.rose,
                    background: `${colors.rose}08`, border: 'none', borderRadius: 8,
                    padding: '6px 10px', cursor: 'pointer', transition: 'background 0.2s',
                  }}>Remove</button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <button type="button" onClick={onAddAnother} style={{ ...secondaryBtn(fonts), marginBottom: 16 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', width: '100%' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Another Gift Card
        </span>
      </button>

      {/* Summary */}
      <div style={{ background: colors.cream, borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{items.length} gift card{items.length > 1 ? 's' : ''}</span>
          <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>${(subtotal / 100).toFixed(2)}</span>
        </div>
        {totalBonus > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.violet }}>Bonus cards included</span>
            <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 700, color: colors.violet }}>+{fmtBonus(totalBonus)} FREE</span>
          </div>
        )}
        <div style={{ borderTop: `1px solid ${colors.stone}`, paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
          <span style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>${(subtotal / 100).toFixed(2)}</span>
        </div>
      </div>

      <motion.button type="button" onClick={onContinue} whileTap={{ scale: 0.98 }} style={primaryBtn(fonts, false)}>
        Continue to Checkout
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: CHECKOUT — sender info, delivery, bonus choices
// ═══════════════════════════════════════════════════════════════
function CheckoutStep({ fonts, items, autoPromos, sender, setSender, delivery, setDelivery, bonusChoices, setBonusChoices, onContinue, onBack }) {
  const { member } = useMember()
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (member && !sender.name) {
      setSender(s => ({
        ...s,
        name: s.name || `${member.first_name || ''} ${member.last_name || ''}`.trim(),
        email: s.email || member.email || '',
      }))
    }
  }, [member]) // eslint-disable-line react-hooks/exhaustive-deps

  const itemsWithBonus = items.map(item => ({ item, bonus: findBonusForAmount(autoPromos, item.amountCents) })).filter(x => x.bonus)
  const subtotal = items.reduce((s, i) => s + i.amountCents, 0)

  const validate = () => {
    const e = {}
    if (!sender.name?.trim()) e.name = 'Required'
    if (!sender.email?.trim() || !/\S+@\S+\.\S+/.test(sender.email)) e.email = 'Valid email required'
    setErrors(e)
    return !Object.keys(e).length
  }

  return (
    <div>
      <button type="button" onClick={onBack} style={backBtn(fonts)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: 28, marginTop: 12 }}>
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.75rem', fontWeight: 700, color: colors.heading, marginBottom: 6 }}>
          Almost There
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted, margin: 0 }}>
          {items.length} gift card{items.length > 1 ? 's' : ''} &middot; ${(subtotal / 100).toFixed(2)}
        </p>
      </div>

      {/* Section: About You */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ ...labelBase(fonts), marginBottom: 12 }}>About You</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field fonts={fonts} value={sender.name} onChange={v => setSender(s => ({ ...s, name: v }))} error={errors.name} placeholder="Your name" />
          <Field fonts={fonts} value={sender.email} onChange={v => setSender(s => ({ ...s, email: v }))} error={errors.email} placeholder="your@email.com" type="email" />
        </div>
      </div>

      {/* Section: Delivery */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ ...labelBase(fonts), marginBottom: 12 }}>Delivery</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { key: 'now', label: 'Send Now', sub: 'Delivered instantly' },
            { key: 'scheduled', label: 'Schedule', sub: 'Pick a date' },
          ].map(opt => {
            const sel = delivery.type === opt.key
            return (
              <motion.button
                key={opt.key} type="button" whileTap={{ scale: 0.97 }}
                onClick={() => opt.key === 'now' ? setDelivery({ type: 'now', date: null }) : setDelivery({ type: 'scheduled', date: delivery.date || getTomorrow() })}
                style={{
                  fontFamily: fonts.body, textAlign: 'center',
                  color: sel ? '#fff' : colors.body,
                  background: sel ? colors.violet : colors.cream,
                  border: 'none', borderRadius: 12,
                  padding: '14px 12px', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: sel ? '0 2px 12px rgba(124,58,237,0.25)' : 'none',
                }}
              >
                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600 }}>{opt.label}</span>
                <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{opt.sub}</span>
              </motion.button>
            )
          })}
        </div>
        <AnimatePresence>
          {delivery.type === 'scheduled' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <input type="datetime-local" value={delivery.date || ''} min={getMinDatetime()} onChange={e => setDelivery({ type: 'scheduled', date: e.target.value })}
                style={{ ...inputBase(fonts), marginTop: 10, cursor: 'pointer' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section: Bonus choices */}
      <AnimatePresence>
        {itemsWithBonus.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
            <label style={{ ...labelBase(fonts), marginBottom: 12 }}>Bonus Gift Cards</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {itemsWithBonus.map(({ item, bonus }) => (
                <div key={item.id} style={{
                  background: `linear-gradient(135deg, ${colors.violet}06, ${colors.fuchsia}04)`,
                  border: `1px solid ${colors.violet}15`,
                  borderRadius: 14, padding: '14px 16px',
                }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, margin: '0 0 10px', lineHeight: 1.4 }}>
                    <strong style={{ color: colors.violet }}>{fmtBonus(bonus.bonusCents)} bonus</strong> from ${item.amountCents / 100} card to {item.recipientName}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { key: 'recipient', label: `Send to ${item.recipientName.split(' ')[0]}` },
                      { key: 'sender', label: 'Keep for myself' },
                    ].map(opt => {
                      const sel = (bonusChoices[item.id] || 'recipient') === opt.key
                      return (
                        <button
                          key={opt.key} type="button"
                          onClick={() => setBonusChoices(c => ({ ...c, [item.id]: opt.key }))}
                          style={{
                            fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600,
                            color: sel ? '#fff' : colors.body,
                            background: sel ? colors.violet : '#fff',
                            border: `1px solid ${sel ? colors.violet : colors.stone}`,
                            borderRadius: 8, padding: '10px 8px', cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >{opt.label}</button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button type="button" onClick={() => validate() && onContinue()} whileTap={{ scale: 0.98 }} style={primaryBtn(fonts, false)}>
        Proceed to Payment
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// STEP 4: PAYMENT — Square card form
// ═══════════════════════════════════════════════════════════════
function PaymentStep({ fonts, items, sender, delivery, autoPromos, bonusChoices, onSuccess, onBack }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cardReady, setCardReady] = useState(false)
  const cardRef = useRef(null)
  const paymentsRef = useRef(null)

  const subtotal = items.reduce((s, i) => s + i.amountCents, 0)

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
    const locId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
    if (!appId || !locId) { setError('Payment system not configured.'); return }
    if (cardRef.current) return

    let cancelled = false
    const init = async () => {
      if (!window.Square) {
        const existing = document.querySelector('script[src*="squarecdn.com"]')
        if (!existing) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = appId.startsWith('sandbox-')
              ? 'https://sandbox.web.squarecdn.com/v1/square.js'
              : 'https://web.squarecdn.com/v1/square.js'
            script.onload = resolve; script.onerror = reject
            document.head.appendChild(script)
          })
        } else {
          await new Promise(resolve => { if (window.Square) return resolve(); existing.addEventListener('load', resolve) })
        }
      }
      if (cancelled) return
      const payments = window.Square.payments(appId, locId)
      paymentsRef.current = payments
      const card = await payments.card()
      if (cancelled) { card.destroy(); return }
      await card.attach('#sq-card-container')
      cardRef.current = card
      if (!cancelled) setCardReady(true)
    }
    init().catch(e => { console.error('[gift-cards] Square init:', e); if (!cancelled) setError('Failed to load payment form. Please refresh.') })
    return () => { cancelled = true; if (cardRef.current) { cardRef.current.destroy(); cardRef.current = null } }
  }, [])

  const handlePay = async () => {
    if (!cardRef.current) return
    setLoading(true); setError(null)
    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK') throw new Error(result.errors?.[0]?.message || 'Card verification failed')

      // Meta CAPI dedup params
      const eventId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      let _fbp, _fbc;
      try {
        _fbp = document.cookie.match(/(?:^|; )_fbp=([^;]*)/)?.[1] || undefined;
        _fbc = document.cookie.match(/(?:^|; )_fbc=([^;]*)/)?.[1] || undefined;
      } catch {}

      const res = await fetch('/api/gift-cards/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          items: items.map(i => ({
            id: i.id,
            amountCents: i.amountCents,
            recipientName: i.recipientName,
            recipientEmail: i.recipientEmail,
            message: i.message || null,
            occasion: i.occasion || null,
          })),
          senderName: sender.name,
          senderEmail: sender.email,
          deliverAt: delivery.type === 'scheduled' ? delivery.date : null,
          bonusChoices,
          event_id: eventId,
          _fbp,
          _fbc,
        }),
      })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { throw new Error(text || `Server error (${res.status})`) }
      if (!res.ok) throw new Error(data.error || 'Payment failed')
      onSuccess(data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div>
      <button type="button" onClick={onBack} style={backBtn(fonts)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: 24, marginTop: 12 }}>
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.75rem', fontWeight: 700, color: colors.heading, marginBottom: 6 }}>Payment</h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted, margin: 0 }}>
          {items.length} gift card{items.length > 1 ? 's' : ''} &middot; <strong style={{ color: colors.heading, fontWeight: 700 }}>${(subtotal / 100).toFixed(2)}</strong>
        </p>
      </div>

      {/* Order summary mini */}
      <div style={{ background: colors.cream, borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 0',
            borderBottom: i < items.length - 1 ? `1px solid ${colors.stone}` : 'none',
          }}>
            <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body }}>
              ${item.amountCents / 100} → {item.recipientName}
            </span>
          </div>
        ))}
      </div>

      <div id="sq-card-container" style={{ minHeight: 100, marginBottom: 20, borderRadius: 12, overflow: 'hidden' }} />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 16 }}
          >
            <div style={{
              background: `${colors.rose}08`, border: `1px solid ${colors.rose}20`,
              borderRadius: 12, padding: '12px 16px',
            }}>
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.rose, margin: 0 }}>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button" onClick={handlePay} disabled={loading || !cardReady}
        whileTap={{ scale: 0.98 }}
        style={primaryBtn(fonts, loading || !cardReady)}
      >
        {loading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
            />
            Processing...
          </span>
        ) : (
          `Pay $${(subtotal / 100).toFixed(2)}`
        )}
      </motion.button>

      <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted, margin: 0 }}>Secure payment by Square</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// STEP 5: SUCCESS
// ═══════════════════════════════════════════════════════════════
function SuccessStep({ fonts, result, onReset }) {
  const cards = result?.cards || []
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </motion.div>

      <h3 style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: colors.heading, marginBottom: 8 }}>
        {cards.length > 1 ? `${cards.length} Gift Cards Sent!` : 'Gift Card Sent!'}
      </h3>
      <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, marginBottom: 32, lineHeight: 1.5 }}>
        {cards.length === 1
          ? 'Your gift card is on its way via email.'
          : `All ${cards.length} gift cards are being delivered.`
        }
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, textAlign: 'left' }}>
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            style={{
              background: colors.ink, borderRadius: 16, padding: '20px 24px',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Gradient corner accent */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `linear-gradient(225deg, ${colors.violet}25, transparent)`, borderRadius: '0 16px 0 0' }} />

            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 2px' }}>RELUXE Gift Card</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
              <div>
                <p style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: '#fff', margin: '4px 0 8px', lineHeight: 1 }}>${(c.amount / 100).toFixed(0)}</p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)', margin: 0 }}>To {c.recipientName}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.35)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Code</p>
                <p style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.04em', color: '#fff', margin: 0 }}>{c.code}</p>
              </div>
            </div>
            {c.bonus && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(250,248,245,0.08)' }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.violet, fontWeight: 600, margin: 0 }}>
                  {c.bonus.addedToCard
                    ? `🎁 Includes ${fmtBonus(c.bonus.amount)} bonus`
                    : `🎁 +${fmtBonus(c.bonus.amount)} bonus card · ${c.bonus.code}`
                  }
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.button
        type="button" onClick={onReset} whileTap={{ scale: 0.98 }}
        style={{ ...primaryBtn(fonts, false), maxWidth: 300, margin: '0 auto', display: 'block' }}
      >
        Send More Gift Cards
      </motion.button>
    </div>
  )
}

// ─── Helpers ───
function getTomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  return toLocalDatetime(d)
}
function getMinDatetime() {
  const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0)
  return toLocalDatetime(d)
}
function toLocalDatetime(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function GiftCardPurchaseFlow({ fonts, initialAmount }) {
  const [step, setStep] = useState('ADD_CARD')
  const [items, setItems] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [sender, setSender] = useState({ name: '', email: '' })
  const [delivery, setDelivery] = useState({ type: 'now', date: null })
  const [bonusChoices, setBonusChoices] = useState({})
  const [autoPromos, setAutoPromos] = useState([])
  const [result, setResult] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    fetch('/api/gift-cards/promotions').then(r => r.json()).then(d => setAutoPromos(d.autoApplied || [])).catch(() => {})
  }, [])

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const goToStep = (s) => { setStep(s); scrollToTop() }

  const stepIndex = { ADD_CARD: 0, CART: 1, CHECKOUT: 2, PAYMENT: 3, SUCCESS: 4 }[step] || 0

  const handleAddCard = (card) => {
    if (editingId) {
      setItems(prev => prev.map(i => i.id === editingId ? card : i))
      setEditingId(null)
    } else {
      setItems(prev => [...prev, card])
    }
    goToStep('CART')
  }

  const handleEdit = (id) => { setEditingId(id); goToStep('ADD_CARD') }
  const handleRemove = (id) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      if (next.length === 0) goToStep('ADD_CARD')
      return next
    })
    setBonusChoices(c => { const next = { ...c }; delete next[id]; return next })
  }

  const reset = () => {
    setStep('ADD_CARD'); setItems([]); setEditingId(null)
    setSender({ name: '', email: '' }); setDelivery({ type: 'now', date: null })
    setBonusChoices({}); setResult(null); scrollToTop()
  }

  return (
    <div ref={containerRef} style={{ maxWidth: 520, margin: '0 auto', minHeight: 400 }}>
      {step !== 'SUCCESS' && <StepIndicator stepIndex={Math.min(stepIndex, 3)} fonts={fonts} />}

      <AnimatePresence mode="wait">
        <motion.div key={step + (editingId || '')} variants={fadeVariants} initial="initial" animate="animate" exit="exit">
          {step === 'ADD_CARD' && (
            <AddCardStep
              fonts={fonts} autoPromos={autoPromos}
              onAdd={handleAddCard}
              onBack={items.length > 0 ? () => { setEditingId(null); goToStep('CART') } : null}
              editingItem={editingId ? items.find(i => i.id === editingId) : null}
            />
          )}
          {step === 'CART' && (
            <CartStep
              fonts={fonts} items={items} autoPromos={autoPromos}
              onAddAnother={() => { setEditingId(null); goToStep('ADD_CARD') }}
              onEdit={handleEdit} onRemove={handleRemove}
              onContinue={() => goToStep('CHECKOUT')}
            />
          )}
          {step === 'CHECKOUT' && (
            <CheckoutStep
              fonts={fonts} items={items} autoPromos={autoPromos}
              sender={sender} setSender={setSender}
              delivery={delivery} setDelivery={setDelivery}
              bonusChoices={bonusChoices} setBonusChoices={setBonusChoices}
              onContinue={() => goToStep('PAYMENT')}
              onBack={() => goToStep('CART')}
            />
          )}
          {step === 'PAYMENT' && (
            <PaymentStep
              fonts={fonts} items={items} sender={sender} delivery={delivery}
              autoPromos={autoPromos} bonusChoices={bonusChoices}
              onSuccess={data => {
                setResult(data); goToStep('SUCCESS')
                if (typeof window !== 'undefined' && window.reluxeTrack) {
                  window.reluxeTrack('gift_card_purchase', {
                    order_id: data.orderId,
                    amount_cents: data.charged,
                    num_cards: data.cards?.length || 1,
                    currency: 'USD',
                  })
                }
              }}
              onBack={() => goToStep('CHECKOUT')}
            />
          )}
          {step === 'SUCCESS' && (
            <SuccessStep fonts={fonts} result={result} onReset={reset} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
