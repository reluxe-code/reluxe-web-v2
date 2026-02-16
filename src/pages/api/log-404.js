// Minimal logger that works on Vercel out of the box.
// Logs to server logs and (optionally) forwards to Slack / a DB.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { path, referrer, ua, ts } = req.body || {};
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '';

  const entry = {
    kind: '404',
    path: typeof path === 'string' ? path : '',
    referrer: typeof referrer === 'string' ? referrer : '',
    ua: typeof ua === 'string' ? ua : '',
    ip,
    ts: ts || Date.now(),
  };

  // 1) Always log to Vercel function logs (viewable in dashboard):
  console.log('[404]', JSON.stringify(entry));

  // 2) Optional: forward to Slack (set SLACK_WEBHOOK_URL in env)
  try {
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `404: ${entry.path}\nReferrer: ${entry.referrer || '—'}\nUA: ${entry.ua || '—'}\nIP: ${entry.ip}\nTime: ${new Date(entry.ts).toISOString()}`,
        }),
      });
    }
  } catch (e) {
    // don’t fail the request
  }

  // 3) Optional: write to a DB (e.g., Supabase / Planetscale / Vercel KV)
  // await db.insert(entry)

  return res.status(204).end();
}
