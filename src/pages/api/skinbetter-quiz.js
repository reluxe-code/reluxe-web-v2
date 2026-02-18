// pages/api/skinbetter-quiz.js
// Skinbetter Quiz → email results to hello@reluxemedspa.com (every completion)

import { getSmtpConfig, escHtml, safeJson } from '@/lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const {
    eventType,
    toEmail,
    sessionId,
    page,
    submittedAt,
    lead,
    persona,
    recommendations,
    answers,
    userAgent,
  } = req.body || {}

  if (!persona?.id || !persona?.name || !answers) {
    return res.status(400).json({ ok: false, error: 'Missing persona/answers' })
  }

  const smtp = getSmtpConfig()
  if (!smtp) {
    return res.status(500).json({
      ok: false,
      error: 'Missing SMTP env vars. Need SMTP_HOST, SMTP_USER, SMTP_PASS.',
    })
  }

  const to = (toEmail && String(toEmail).trim()) || 'hello@reluxemedspa.com'
  const subject = `RELUXE Skinbetter Quiz • ${eventType || 'event'} • ${persona.name} • ${sessionId || ''}`

  const recLines = Array.isArray(recommendations)
    ? recommendations.map((p, i) => `${i + 1}. ${p?.name || p?.id} (${p?.format || ''}) — ${p?.url || ''}`).join('\n')
    : ''

  const leadBlock =
`Lead
----
Captured: ${lead?.captured ? 'true' : 'false'}
Source: ${lead?.source || ''}
Channel: ${lead?.channel || ''}
Name: ${lead?.name || ''}
Email: ${lead?.email || ''}
Phone: ${lead?.phone || ''}
SMS Consent: ${lead?.smsConsent ? 'true' : 'false'}`

  const textBody =
`Skinbetter Quiz Event
=====================
Event: ${eventType || ''}
Submitted: ${submittedAt || new Date().toISOString()}
Session: ${sessionId || ''}
Page: ${page || ''}

Persona
------
${persona.name} (${persona.id})

${leadBlock}

Recommendations
---------------
${recLines || '(none)'}

Answers (raw)
-------------
${safeJson(answers)}

User Agent
----------
${userAgent || ''}`

  const htmlBody = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; line-height: 1.45;">
      <h2>Skinbetter Quiz Event</h2>
      <p>
        <strong>Event:</strong> ${escHtml(eventType || '')}<br/>
        <strong>Submitted:</strong> ${escHtml(submittedAt || new Date().toISOString())}<br/>
        <strong>Session:</strong> ${escHtml(sessionId || '')}<br/>
        <strong>Page:</strong> ${escHtml(page || '')}
      </p>

      <h3>Persona</h3>
      <p><strong>${escHtml(persona.name)}</strong> <span style="color:#6b7280">(${escHtml(persona.id)})</span></p>

      <h3>Lead</h3>
      <pre style="background:#f9fafb; border:1px solid #e5e7eb; padding:12px; border-radius:12px; overflow:auto;">${escHtml(leadBlock)}</pre>

      <h3>Recommendations</h3>
      ${
        Array.isArray(recommendations) && recommendations.length
          ? `<ol>${recommendations.map((p) => `
              <li style="margin-bottom:10px;">
                <strong>${escHtml(p?.name || p?.id)}</strong><br/>
                <span style="color:#6b7280">${escHtml(p?.format || '')}</span><br/>
                <a href="${escHtml(p?.url || '#')}" target="_blank" rel="noreferrer">${escHtml(p?.url || '')}</a>
              </li>
            `).join('')}</ol>`
          : '<p>(none)</p>'
      }

      <h3>Answers (raw)</h3>
      <pre style="background:#f9fafb; border:1px solid #e5e7eb; padding:12px; border-radius:12px; overflow:auto;">${escHtml(safeJson(answers))}</pre>

      <h3>User Agent</h3>
      <pre style="background:#f9fafb; border:1px solid #e5e7eb; padding:12px; border-radius:12px; overflow:auto;">${escHtml(userAgent || '')}</pre>
    </div>
  `

  try {
    await smtp.transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      text: textBody,
      html: htmlBody,
      replyTo: lead?.email || undefined,
    })
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) })
  }
}
