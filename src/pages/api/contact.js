// src/pages/api/contact.js
import { z } from 'zod';
import { getSmtpConfig, escHtml } from '@/lib/email';

// -------- Validation (no captcha) --------
const schema = z.object({
  location: z.string().optional(),
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email'),
  phone: z
    .string()
    .optional()
    .transform(v => (v || '').trim())
    .refine(v => !v || /^[0-9+()\-.\s]{7,20}$/.test(v), 'Please enter a valid phone'),
  message: z.string().min(10, 'Please add a bit more detail'),
});

// --- Airtable helper (exactly your columns) ---
async function saveToAirtable({ name, email, phone, message, location, meta }) {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE = 'Contacts' } = process.env;
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) return; // silently skip if not configured

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`;

  // Fields must match your table column names exactly
  const fields = {
    'Name': name,
    'Email': email,
    'Phone': phone || '',
    'Message': message,
    'Location': location || '',
    'Page URL': meta?.url || '',
    // Tip: In Airtable, make "Submitted At" a "Created time" field or a Date field.
    // If it's a normal Date field and you want us to set it, uncomment the line below:
    // 'Submitted At': new Date().toISOString(),
  };

  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [{ fields }] }),
  });
}

// --- Email via SMTP (optional) ---
async function sendEmail({ name, email, phone, message, location, meta }) {
  const smtp = getSmtpConfig();
  if (!smtp) return;

  const subject = `New website contact${location ? ` — ${location}` : ''}: ${name}`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6">
      <h2 style="margin:0 0 12px">New Contact Submission</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
        <tr><td><b>Name</b></td><td>${escHtml(name)}</td></tr>
        <tr><td><b>Email</b></td><td>${escHtml(email)}</td></tr>
        <tr><td><b>Phone</b></td><td>${escHtml(phone || '')}</td></tr>
        <tr><td><b>Location</b></td><td>${escHtml(location || '')}</td></tr>
        <tr><td valign="top"><b>Message</b></td><td>${escHtml(message).replace(/\n/g, '<br/>')}</td></tr>
      </table>
      <hr style="margin:16px 0;border:none;border-top:1px solid #eee" />
      <div style="color:#666;font-size:12px">
        <div><b>Page:</b> ${escHtml(meta?.url || '')}</div>
        <div><b>IP:</b> ${escHtml(meta?.ip || '')}</div>
        <div><b>UA:</b> ${escHtml(meta?.ua || '')}</div>
        <div><b>Time:</b> ${new Date().toLocaleString()}</div>
      </div>
    </div>
  `;

  await smtp.transporter.sendMail({
    from: smtp.from,
    to: smtp.to,
    replyTo: email,
    subject,
    html,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const json = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ ok: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { name, email, phone, message, location } = parsed.data;

    const ip = (
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      ''
    ).toString().split(',')[0].trim();

    const meta = { url: req.headers.referer || '', ip, ua: req.headers['user-agent'] || '' };

    // Save first so we never lose the lead:
    await saveToAirtable({ name, email, phone, message, location, meta }).catch(() => {});

    // Then email (best effort):
    await sendEmail({ name, email, phone, message, location, meta }).catch(() => {});

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact API error', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
