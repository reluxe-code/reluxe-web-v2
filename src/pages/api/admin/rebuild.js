// src/pages/api/admin/rebuild.js
// Triggers a Vercel deploy hook to rebuild the site after content changes

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK
  if (!hookUrl) return res.status(500).json({ error: 'VERCEL_DEPLOY_HOOK not configured' })

  try {
    const response = await fetch(hookUrl, { method: 'POST' })
    if (!response.ok) throw new Error(`Deploy hook returned ${response.status}`)
    const data = await response.json()
    return res.status(200).json({ ok: true, job: data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
