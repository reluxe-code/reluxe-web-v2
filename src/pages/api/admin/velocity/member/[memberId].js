// Admin API: Velocity member detail + admin actions (reactivate, clawback, manual_adjust)
import { getServiceClient } from '@/lib/supabase'
import { getCurrentBalance, updateBalanceCache, pushCreditToBlvd, clawbackFromBlvd, formatCents } from '@/lib/velocity'

export default async function handler(req, res) {
  const { memberId } = req.query
  if (!memberId) return res.status(400).json({ error: 'memberId required' })

  const db = getServiceClient()

  if (req.method === 'GET') {
    const [{ data: ledger }, { data: balance }, { data: member }] = await Promise.all([
      db.from('velocity_ledger').select('*').eq('member_id', memberId).order('created_at', { ascending: false }).limit(100),
      db.from('velocity_balances').select('*').eq('member_id', memberId).maybeSingle(),
      db.from('members').select('first_name, last_name, phone, email, blvd_client_id').eq('id', memberId).maybeSingle(),
    ])
    return res.json({ ledger: ledger || [], balance, member })
  }

  if (req.method === 'POST') {
    const { action, amount_cents, note, ledger_entry_id, admin_email } = req.body
    if (!action) return res.status(400).json({ error: 'action required' })

    const currentBalance = await getCurrentBalance(db, memberId)

    // Get BLVD client info for push
    const { data: member } = await db.from('members').select('blvd_client_id').eq('id', memberId).maybeSingle()
    let boulevardId = null
    let locationKey = 'westfield'
    if (member?.blvd_client_id) {
      const { data: blvdClient } = await db.from('blvd_clients').select('boulevard_id').eq('id', member.blvd_client_id).maybeSingle()
      boulevardId = blvdClient?.boulevard_id
    }

    if (action === 'reactivate') {
      const cents = amount_cents || 0
      if (cents <= 0) return res.status(400).json({ error: 'amount_cents required' })

      await db.from('velocity_ledger').insert({
        member_id: memberId,
        blvd_client_id: member?.blvd_client_id,
        event_type: 'reactivate',
        amount_cents: cents,
        balance_after_cents: currentBalance + cents,
        expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
        admin_note: note || 'Admin reactivated expired credit',
        admin_user_email: admin_email,
        blvd_pushed: false,
      })

      // Push to BLVD
      if (boulevardId) {
        try {
          await pushCreditToBlvd(boulevardId, cents, `Velocity Rewards - credit reactivated (${formatCents(cents)})`, locationKey)
          // Mark pushed - get last inserted
          const { data: last } = await db.from('velocity_ledger').select('id').eq('member_id', memberId).eq('event_type', 'reactivate').order('created_at', { ascending: false }).limit(1)
          if (last?.[0]) await db.from('velocity_ledger').update({ blvd_pushed: true }).eq('id', last[0].id)
        } catch (err) {
          console.error('[velocity/admin] Reactivate push failed:', err.message)
        }
      }

      await updateBalanceCache(db, memberId)
      return res.json({ ok: true, action: 'reactivate', amount: cents, newBalance: currentBalance + cents })
    }

    if (action === 'clawback') {
      const cents = amount_cents || 0
      if (cents <= 0) return res.status(400).json({ error: 'amount_cents required' })

      await db.from('velocity_ledger').insert({
        member_id: memberId,
        blvd_client_id: member?.blvd_client_id,
        event_type: 'clawback',
        amount_cents: -cents,
        balance_after_cents: Math.max(0, currentBalance - cents),
        admin_note: note || 'Admin clawback',
        admin_user_email: admin_email,
      })

      if (boulevardId) {
        try {
          await clawbackFromBlvd(boulevardId, cents, `Velocity Rewards - admin clawback`, locationKey)
        } catch (err) {
          console.error('[velocity/admin] Clawback from BLVD failed:', err.message)
        }
      }

      await updateBalanceCache(db, memberId)
      return res.json({ ok: true, action: 'clawback', amount: cents, newBalance: Math.max(0, currentBalance - cents) })
    }

    if (action === 'manual_adjust') {
      const cents = amount_cents || 0
      if (cents === 0) return res.status(400).json({ error: 'amount_cents required (positive to add, negative to remove)' })

      await db.from('velocity_ledger').insert({
        member_id: memberId,
        blvd_client_id: member?.blvd_client_id,
        event_type: 'manual_adjust',
        amount_cents: cents,
        balance_after_cents: Math.max(0, currentBalance + cents),
        expires_at: cents > 0 ? new Date(Date.now() + 90 * 86400000).toISOString() : null,
        admin_note: note || 'Manual adjustment',
        admin_user_email: admin_email,
        blvd_pushed: false,
      })

      // Push/clawback from BLVD
      if (boulevardId) {
        try {
          if (cents > 0) {
            await pushCreditToBlvd(boulevardId, cents, `Velocity Rewards - manual adjustment`, locationKey)
          } else {
            await clawbackFromBlvd(boulevardId, Math.abs(cents), `Velocity Rewards - manual adjustment`, locationKey)
          }
          const { data: last } = await db.from('velocity_ledger').select('id').eq('member_id', memberId).eq('event_type', 'manual_adjust').order('created_at', { ascending: false }).limit(1)
          if (last?.[0]) await db.from('velocity_ledger').update({ blvd_pushed: true }).eq('id', last[0].id)
        } catch (err) {
          console.error('[velocity/admin] Manual adjust BLVD push failed:', err.message)
        }
      }

      await updateBalanceCache(db, memberId)
      return res.json({ ok: true, action: 'manual_adjust', amount: cents, newBalance: Math.max(0, currentBalance + cents) })
    }

    return res.status(400).json({ error: `Unknown action: ${action}` })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
