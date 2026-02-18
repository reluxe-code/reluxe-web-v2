// pages/api/spf-quiz.js
// Sends an email on every quiz completion (and lead update), using Brevo SMTP env vars.

import { getSmtpConfig, parseToList, escHtml, safeJson } from '@/lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  try {
    // Payload from your quiz page
    const {
      eventType,
      sessionId,
      page,
      submittedAt,
      leadChannel,
      consent,
      user,
      lead,
      persona,
      answers,
      recommendations,
      userAgent,
    } = req.body || {}

    const payloadLead = lead || {
      captured: Boolean(user?.email || user?.phone),
      source: 'unknown',
      channel: leadChannel || null,
      name: user?.name || null,
      email: user?.email || null,
      phone: user?.phone || null,
      smsConsent: Boolean(consent?.sms),
    }

    if (!persona?.id || !persona?.name || !answers) {
      return res.status(400).json({ ok: false, error: 'Missing persona/answers' })
    }

    const smtp = getSmtpConfig()
    if (!smtp || !smtp.to) {
      return res.status(500).json({
        ok: false,
        error: 'Missing SMTP env vars. Need SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_TO.',
      })
    }

    const toList = parseToList(smtp.to)

    const subject = `RELUXE SPF Quiz • ${eventType || 'quiz_event'} • ${persona.name}${sessionId ? ` • ${sessionId}` : ''}`

    const recLines = Array.isArray(recommendations)
      ? recommendations.map((p, i) => `${i + 1}. ${p?.name || p?.id} (${p?.format || ''}) — ${p?.url || ''}`).join('\n')
      : ''

    const textBody =
`SPF Quiz Event
==============
Event: ${eventType || ''}
Submitted: ${submittedAt || new Date().toISOString()}
Session: ${sessionId || ''}
Page: ${page || ''}

Persona
------
${persona.name} (${persona.id})

Lead
----
Captured: ${payloadLead?.captured ? 'true' : 'false'}
Source: ${payloadLead?.source || ''}
Channel: ${payloadLead?.channel || ''}
Name: ${payloadLead?.name || ''}
Email: ${payloadLead?.email || ''}
Phone: ${payloadLead?.phone || ''}
SMS Consent: ${payloadLead?.smsConsent ? 'true' : 'false'}

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
        <h2>SPF Quiz Event</h2>
        <p>
          <strong>Event:</strong> ${escHtml(eventType || '')}<br/>
          <strong>Submitted:</strong> ${escHtml(submittedAt || new Date().toISOString())}<br/>
          <strong>Session:</strong> ${escHtml(sessionId || '')}<br/>
          <strong>Page:</strong> ${escHtml(page || '')}
        </p>

        <h3>Persona</h3>
        <p><strong>${escHtml(persona.name)}</strong> <span style="color:#6b7280">(${escHtml(persona.id)})</span></p>

        <h3>Lead</h3>
        <ul>
          <li><strong>Captured:</strong> ${payloadLead?.captured ? 'true' : 'false'}</li>
          <li><strong>Source:</strong> ${escHtml(payloadLead?.source || '')}</li>
          <li><strong>Channel:</strong> ${escHtml(payloadLead?.channel || '')}</li>
          <li><strong>Name:</strong> ${escHtml(payloadLead?.name || '')}</li>
          <li><strong>Email:</strong> ${escHtml(payloadLead?.email || '')}</li>
          <li><strong>Phone:</strong> ${escHtml(payloadLead?.phone || '')}</li>
          <li><strong>SMS Consent:</strong> ${payloadLead?.smsConsent ? 'true' : 'false'}</li>
        </ul>

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

    await smtp.transporter.sendMail({
      from: smtp.from,
      to: toList,
      subject,
      text: textBody,
      html: htmlBody,
      replyTo: payloadLead?.email || undefined,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('SPF QUIZ API ERROR:', err)
    return res.status(500).json({ ok: false, error: 'Email send failed', detail: String(err?.message || err) })
  }
}
