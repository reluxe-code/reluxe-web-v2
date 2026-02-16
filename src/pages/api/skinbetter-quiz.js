// pages/api/skinbetter-quiz.js
// Skinbetter Quiz → email results to hello@reluxemedspa.com (every completion)

import nodemailer from 'nodemailer'

function safeJson(obj) {
  try { return JSON.stringify(obj, null, 2) } catch (_) { return String(obj) }
}

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

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({
      ok: false,
      error: 'Missing SMTP env vars. Need SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (optional SMTP_FROM).',
    })
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  const to = (toEmail && String(toEmail).trim()) || 'hello@reluxemedspa.com'
  const from = SMTP_FROM || SMTP_USER
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
        <strong>Event:</strong> ${eventType || ''}<br/>
        <strong>Submitted:</strong> ${submittedAt || new Date().toISOString()}<br/>
        <strong>Session:</strong> ${sessionId || ''}<br/>
        <strong>Page:</strong> ${page || ''}
      </p>

      <h3>Persona</h3>
      <p><strong>${persona.name}</strong> <span style="color:#6b7280">(${persona.id})</span></p>

      <h3>Lead</h3>
      <pre style="background:#f9fafb; border:1px solid #e5e7eb; padding:12px; border-radius:12px; overflow:auto;">${leadBlock}</pre>

      <h3>Recommendations</h3>
      ${
        Array.isArray(recommendations) && recommendations.length
          ? `<ol>${recommendations.map((p) => `
              <li style="margin-bottom:10px;">
                <strong>${p?.name || p?.id}</strong><br/>
                <span style="color:#6b7280">${p?.format || ''}</span><br/>
                <a href="${p?.url || '#'}" target="_blank" rel="noreferrer">${p?.url || ''}</a>
              </li>
            `).join('')}</ol>`
          : '<p>(none)</p>'
      }

      <h3>Answers (raw)</h3>
      <pre style="background:#f9fafb; border:1px solid #e5e7eb; padding:12px; border-radius:12px; overflow:auto;">${safeJson(answers)}</pre>

      <h3>User Agent</h3>
      <pre style="background:#f9fafb; border:1px solid #e5e7eb; padding:12px; border-radius:12px; overflow:auto;">${userAgent || ''}</pre>
    </div>
  `

  try {
    await transporter.sendMail({
      from,
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
