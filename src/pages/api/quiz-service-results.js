// src/pages/api/quiz-service-results.js
// Sends an email on every quiz completion (and lead update), using SMTP env vars.
// Matches behavior/style of /pages/api/spf-quiz.js
// ✅ Adds attribution capture to email (UTMs, click IDs, first landing URL, referrer, device, duration, UA)

import { getSmtpConfig, parseToList, escHtml, safeJson } from '@/lib/email'

function maybeLink(url) {
  const u = String(url || '')
  if (!u) return ''
  const safe = escHtml(u)
  return `<a href="${safe}" target="_blank" rel="noreferrer">${safe}</a>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  try {
    const body = req.body || {}
    const {
      // event-ish fields
      eventType,            // new style
      type,                 // old style
      sessionId,
      page,
      submittedAt,          // new style
      submitted_at,         // old style
      completed_at,         // old style

      // lead-ish fields
      leadChannel,
      consent,
      user,
      lead,

      // quiz-specific
      persona,              // could be object OR string in older payloads
      personaTitle,
      answers,
      recommendedService,
      recommendedServiceKey,
      recommendations,      // optional array (newer style)
      userAgent,

      // ✅ attribution + timing
      attribution,
      startedAt,
      durationSeconds,
      coupon,
    } = body

    // Normalize event + timestamp
    const finalEventType = eventType || type || 'quiz_event'
    const ts = completed_at || submitted_at || submittedAt || new Date().toISOString()

    // Normalize persona
    const personaObj =
      (persona && typeof persona === 'object')
        ? persona
        : { id: String(persona || ''), name: String(personaTitle || persona || '') }

    // Required fields
    if (!personaObj?.id && !personaObj?.name) {
      // allow personaTitle-only
      if (!personaTitle) return res.status(400).json({ ok: false, error: 'Missing persona' })
    }
    if (!answers) {
      return res.status(400).json({ ok: false, error: 'Missing answers' })
    }
    if (!recommendedServiceKey && !recommendedService && !(Array.isArray(recommendations) && recommendations.length)) {
      return res.status(400).json({ ok: false, error: 'Missing recommended service' })
    }

    // Normalize lead payload
    const payloadLead = lead || {
      captured: Boolean(user?.email || user?.phone),
      source: 'unknown',
      channel: leadChannel || null,
      name: user?.name || null,
      email: user?.email || null,
      phone: user?.phone || null,
      smsConsent: Boolean(consent?.sms),
    }

    const smtp = getSmtpConfig()
    if (!smtp || !smtp.to) {
      return res.status(500).json({
        ok: false,
        error: 'Missing SMTP env vars. Need SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_TO.',
      })
    }

    const toList = parseToList(smtp.to)

    const recLines = Array.isArray(recommendations) && recommendations.length
      ? recommendations
          .map((p, i) => `${i + 1}. ${p?.name || p?.id} (${p?.format || ''}) — ${p?.url || ''}`)
          .join('\n')
      : `${recommendedService || ''} (${recommendedServiceKey || ''})`

    const personaName = personaObj?.name || personaTitle || ''
    const personaId = personaObj?.id || ''

    // Attribution display helpers
    const a = attribution || {}
    const utm = a?.utm || {}
    const click = a?.clickIds || {}
    const device = a?.device || {}
    const cookies = a?.cookies || {}

    const subject =
      `RELUXE Service Quiz • ${finalEventType} • ${personaName}` +
      `${recommendedService || recommendedServiceKey ? ` → ${recommendedService || recommendedServiceKey}` : ''}` +
      `${sessionId ? ` • ${sessionId}` : ''}`

    const textBody =
`Service Quiz Event
==================
Event: ${finalEventType}
Timestamp: ${ts}
Session: ${sessionId || ''}
Page: ${page || ''}

Attribution
-----------
URL: ${a?.url || page || ''}
First Landing URL: ${a?.firstLandingUrl || ''}
Referrer: ${a?.referrer || ''}

UTM
---
utm_source: ${utm?.source || ''}
utm_medium: ${utm?.medium || ''}
utm_campaign: ${utm?.campaign || ''}
utm_content: ${utm?.content || ''}
utm_term: ${utm?.term || ''}

Click IDs
---------
fbclid: ${click?.fbclid || ''}
gclid: ${click?.gclid || ''}
wbraid: ${click?.wbraid || ''}
gbraid: ${click?.gbraid || ''}
ttclid: ${click?.ttclid || ''}

Meta cookies
------------
_fbc: ${cookies?.fbc || ''}
_fbp: ${cookies?.fbp || ''}

Device
------
Viewport: ${device?.viewport?.w || ''}x${device?.viewport?.h || ''}
Language: ${device?.language || ''}
Timezone: ${device?.timezone || ''}
User Agent: ${userAgent || ''}

Timing
------
Started: ${startedAt || ''}
Duration (sec): ${durationSeconds ?? ''}

Coupon
------
${coupon?.code ? `Code: ${coupon.code}` : ''}
${coupon?.value ? `Value: ${coupon.value}` : ''}

Persona
------
${personaName} ${personaId ? `(${personaId})` : ''}

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
`

    const htmlBody = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; line-height: 1.45;">
        <h2>Service Quiz Event</h2>
        <p>
          <strong>Event:</strong> ${escHtml(finalEventType)}<br/>
          <strong>Timestamp:</strong> ${escHtml(ts)}<br/>
          <strong>Session:</strong> ${escHtml(sessionId || '')}<br/>
          <strong>Page:</strong> ${escHtml(page || '')}
        </p>

        <h3>Attribution</h3>
        <ul>
          <li><strong>URL:</strong> ${a?.url ? maybeLink(a.url) : escHtml(page || '')}</li>
          <li><strong>First Landing URL:</strong> ${a?.firstLandingUrl ? maybeLink(a.firstLandingUrl) : ''}</li>
          <li><strong>Referrer:</strong> <span style="color:#6b7280">${escHtml(a?.referrer || '')}</span></li>
          <li><strong>utm_source:</strong> ${escHtml(utm?.source || '')}</li>
          <li><strong>utm_medium:</strong> ${escHtml(utm?.medium || '')}</li>
          <li><strong>utm_campaign:</strong> ${escHtml(utm?.campaign || '')}</li>
          <li><strong>utm_content:</strong> ${escHtml(utm?.content || '')}</li>
          <li><strong>utm_term:</strong> ${escHtml(utm?.term || '')}</li>
          <li><strong>fbclid:</strong> ${escHtml(click?.fbclid || '')}</li>
          <li><strong>gclid:</strong> ${escHtml(click?.gclid || '')}</li>
          <li><strong>wbraid:</strong> ${escHtml(click?.wbraid || '')}</li>
          <li><strong>gbraid:</strong> ${escHtml(click?.gbraid || '')}</li>
          <li><strong>ttclid:</strong> ${escHtml(click?.ttclid || '')}</li>
          <li><strong>_fbc:</strong> ${escHtml(cookies?.fbc || '')}</li>
          <li><strong>_fbp:</strong> ${escHtml(cookies?.fbp || '')}</li>
          <li><strong>Viewport:</strong> ${escHtml(device?.viewport?.w || '')}×${escHtml(device?.viewport?.h || '')}</li>
          <li><strong>Language:</strong> ${escHtml(device?.language || '')}</li>
          <li><strong>Timezone:</strong> ${escHtml(device?.timezone || '')}</li>
          <li><strong>User Agent:</strong> <span style="color:#6b7280">${escHtml(userAgent || '')}</span></li>
          <li><strong>Started:</strong> ${escHtml(startedAt || '')}</li>
          <li><strong>Duration (sec):</strong> ${escHtml(durationSeconds ?? '')}</li>
        </ul>

        <h3>Persona</h3>
        <p><strong>${escHtml(personaName)}</strong> ${personaId ? `<span style="color:#6b7280">(${escHtml(personaId)})</span>` : ''}</p>

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

        <h3>Coupon</h3>
        <p>
          <strong>Code:</strong> ${escHtml(coupon?.code || '')}<br/>
          <strong>Value:</strong> ${escHtml(coupon?.value || '')}
        </p>

        <h3>Recommendations</h3>
        ${
          Array.isArray(recommendations) && recommendations.length
            ? `<ol>${recommendations.map((p) => `
                <li style="margin-bottom:10px;">
                  <strong>${escHtml(p?.name || p?.id)}</strong><br/>
                  <span style="color:#6b7280">${escHtml(p?.format || '')}</span><br/>
                  ${p?.url ? maybeLink(p.url) : ''}
                </li>
              `).join('')}</ol>`
            : `<p><strong>${escHtml(recommendedService || '')}</strong> <span style="color:#6b7280">(${escHtml(recommendedServiceKey || '')})</span></p>`
        }

        <h3>Answers (raw)</h3>
        <pre style="background:#f9fafb; border:1px solid #e5e7eb; padding:12px; border-radius:12px; overflow:auto;">${escHtml(safeJson(answers))}</pre>
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
    console.error('SERVICE QUIZ API ERROR:', err)
    return res.status(500).json({
      ok: false,
      error: 'Email send failed',
      detail: String(err?.message || err),
    })
  }
}
