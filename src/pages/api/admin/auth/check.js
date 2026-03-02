// src/pages/api/admin/auth/check.js
// Lightweight endpoint: checks if current session belongs to an admin.
import { requireAdmin } from '@/lib/adminAuth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { user, error } = await requireAdmin(req)

  if (error) {
    return res.status(401).json({ ok: false, error })
  }

  return res.json({ ok: true, email: user.email })
}
