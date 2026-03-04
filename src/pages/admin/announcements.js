// src/pages/admin/announcements.js
// Admin page for managing announcement popups (exit-intent, on-load, specials)
import { useState, useEffect, useCallback } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import AdminLayout from '@/components/admin/AdminLayout'

const TRIGGERS = [
  { value: 'exit', label: 'Exit Intent', desc: 'Shows when cursor leaves the viewport' },
  { value: 'load', label: 'On Load', desc: 'Shows after a delay when page loads' },
  { value: 'both', label: 'Both', desc: 'Exit intent + on-load timer' },
]

const STYLES = [
  { value: 'gradient', label: 'Gradient', desc: 'Violet/fuchsia gradient background' },
  { value: 'dark', label: 'Dark', desc: 'Dark luxury feel' },
  { value: 'minimal', label: 'Minimal', desc: 'Clean white card' },
  { value: 'neon', label: 'Neon', desc: 'Black with neon purple text' },
]

const CTA_LINKS = [
  { value: '/start', label: 'Open Booking' },
  { value: '/services', label: 'Open Services' },
  { value: '/specials', label: 'Open Specials' },
  { value: '/team', label: 'Open Team' },
  { value: '__custom', label: 'Custom URL…' },
]

const BLANK = {
  title: '',
  body: '',
  cta_label: 'Learn More',
  cta_url: '/',
  dismiss_label: 'No thanks',
  style: 'gradient',
  image_url: '',
  trigger: 'exit',
  delay_ms: 3000,
  frequency_days: 7,
  include_routes: [],
  exclude_routes: [],
  active: false,
  start_date: '',
  end_date: '',
  priority: 0,
}

function Field({ label, children, hint }) {
  return (
    <label className="block mb-4">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
      {hint && <span className="text-xs text-neutral-400 ml-2">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Input({ value, onChange, ...props }) {
  return (
    <input
      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-violet-400"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function AnnouncementEditor({ item, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...BLANK, ...item })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const selectedTrigger = TRIGGERS.find((t) => t.value === form.trigger)
  const selectedStyle = STYLES.find((s) => s.value === form.style)

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm">
      <h3 className="text-lg font-bold text-neutral-800 mb-6">
        {item?.id ? 'Edit Announcement' : 'New Announcement'}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Content */}
        <div>
          <Field label="Title">
            <Input value={form.title} onChange={(v) => set('title', v)} placeholder="Spring Sale — 20% Off Tox" />
          </Field>

          <Field label="Body">
            <textarea
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-violet-400 resize-y"
              rows={3}
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder="Book this week and save 20% on all tox treatments. Limited availability."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA Button Text">
              <Input value={form.cta_label} onChange={(v) => set('cta_label', v)} />
            </Field>
            <Field label="CTA Link">
              <Select
                value={CTA_LINKS.some((l) => l.value === form.cta_url) ? form.cta_url : '__custom'}
                onChange={(v) => { if (v !== '__custom') set('cta_url', v) }}
                options={CTA_LINKS}
              />
              {!CTA_LINKS.some((l) => l.value === form.cta_url) && (
                <Input
                  value={form.cta_url}
                  onChange={(v) => set('cta_url', v)}
                  placeholder="/your-page"
                  className="mt-2"
                />
              )}
            </Field>
          </div>

          <Field label="Dismiss Text">
            <Input value={form.dismiss_label} onChange={(v) => set('dismiss_label', v)} />
          </Field>

          <Field label="Image URL" hint="optional — shown above content">
            <Input value={form.image_url} onChange={(v) => set('image_url', v)} placeholder="https://..." />
          </Field>
        </div>

        {/* Right column: Behaviour */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Trigger">
              <Select value={form.trigger} onChange={(v) => set('trigger', v)} options={TRIGGERS} />
              <p className="text-xs text-neutral-400 mt-1">{selectedTrigger?.desc}</p>
            </Field>
            <Field label="Style">
              <Select value={form.style} onChange={(v) => set('style', v)} options={STYLES} />
              <p className="text-xs text-neutral-400 mt-1">{selectedStyle?.desc}</p>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Load Delay" hint="ms">
              <Input
                type="number"
                value={form.delay_ms}
                onChange={(v) => set('delay_ms', Number(v))}
                min={0}
                step={500}
              />
            </Field>
            <Field label="Show Again After" hint="days">
              <Input
                type="number"
                value={form.frequency_days}
                onChange={(v) => set('frequency_days', Number(v))}
                min={1}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" hint="optional">
              <Input type="date" value={form.start_date || ''} onChange={(v) => set('start_date', v || null)} />
            </Field>
            <Field label="End Date" hint="optional">
              <Input type="date" value={form.end_date || ''} onChange={(v) => set('end_date', v || null)} />
            </Field>
          </div>

          <Field label="Priority" hint="higher = shown first">
            <Input type="number" value={form.priority} onChange={(v) => set('priority', Number(v))} />
          </Field>

          <Field label="Include Routes" hint="comma-separated, e.g. /,/services/*">
            <Input
              value={(form.include_routes || []).join(', ')}
              onChange={(v) => set('include_routes', v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [])}
              placeholder="Leave empty = all pages"
            />
          </Field>

          <Field label="Exclude Routes" hint="comma-separated">
            <Input
              value={(form.exclude_routes || []).join(', ')}
              onChange={(v) => set('exclude_routes', v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [])}
              placeholder="/admin/*, /profile/*"
            />
          </Field>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 rounded-xl overflow-hidden border border-neutral-200">
        <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Preview</span>
        </div>
        <div className="flex items-center justify-center p-8 bg-neutral-100">
          <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg" style={{ background: { gradient: 'linear-gradient(135deg, #7C3AED, #C026D3)', dark: 'linear-gradient(180deg, #0a0a0a, #1a1a2e)', minimal: '#fff', neon: '#000' }[form.style] || '#fff' }}>
            {form.image_url && (
              <img src={form.image_url} alt="" className="w-full h-24 object-cover" />
            )}
            <div className="p-6 text-center">
              <h4 className="text-lg font-bold mb-2" style={{ color: { gradient: '#fff', dark: '#faf8f5', minimal: '#111', neon: '#c084fc' }[form.style] }}>
                {form.title || 'Announcement Title'}
              </h4>
              <p className="text-sm mb-4" style={{ color: { gradient: 'rgba(255,255,255,0.8)', dark: 'rgba(250,248,245,0.6)', minimal: '#6b7280', neon: 'rgba(250,248,245,0.5)' }[form.style] }}>
                {form.body || 'Announcement body text'}
              </p>
              <div className="rounded-lg px-4 py-2 text-sm font-semibold inline-block" style={{ background: { gradient: '#fff', dark: 'linear-gradient(135deg,#7C3AED,#C026D3)', minimal: '#111', neon: 'linear-gradient(135deg,#7C3AED,#C026D3)' }[form.style], color: { gradient: '#7C3AED', dark: '#fff', minimal: '#fff', neon: '#fff' }[form.style] }}>
                {form.cta_label || 'CTA'}
              </div>
              <p className="mt-2 text-xs" style={{ color: { gradient: 'rgba(255,255,255,0.5)', dark: 'rgba(250,248,245,0.3)', minimal: '#9ca3af', neon: 'rgba(250,248,245,0.3)' }[form.style] }}>
                {form.dismiss_label || 'No thanks'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : item?.id ? 'Update' : 'Create'}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function AnnouncementRow({ item, onEdit, onToggle, onDelete }) {
  const triggerLabel = TRIGGERS.find((t) => t.value === item.trigger)?.label || item.trigger
  const styleLabel = STYLES.find((s) => s.value === item.style)?.label || item.style

  return (
    <div className={`flex items-center gap-4 rounded-xl border px-5 py-4 mb-3 transition-colors ${item.active ? 'border-green-200 bg-green-50/30' : 'border-neutral-200 bg-white'}`}>
      {/* Toggle */}
      <button
        onClick={() => onToggle(item.id, !item.active)}
        className={`relative h-6 w-11 rounded-full transition-colors ${item.active ? 'bg-green-500' : 'bg-neutral-300'}`}
        title={item.active ? 'Active — click to disable' : 'Inactive — click to enable'}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${item.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800 truncate">{item.title || '(untitled)'}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">{triggerLabel}</span>
          <span className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{styleLabel}</span>
          <span className="text-xs text-neutral-400">every {item.frequency_days}d</span>
          {item.start_date && <span className="text-xs text-neutral-400">from {item.start_date}</span>}
          {item.end_date && <span className="text-xs text-neutral-400">until {item.end_date}</span>}
          {item.include_routes?.length > 0 && (
            <span className="text-xs text-neutral-400">routes: {item.include_routes.join(', ')}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        <button onClick={() => onEdit(item)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50">Edit</button>
        <button onClick={() => onDelete(item.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
      </div>
    </div>
  )
}

export default function AnnouncementsAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null) // null = list view, {} = new, {id:...} = edit

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/announcements')
      const data = await res.json()
      setItems(data.announcements || [])
    } catch (err) {
      console.error('Failed to load announcements', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const res = await adminFetch('/api/admin/announcements?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      setEditing(null)
      await load()
    } catch (err) {
      alert('Failed to save: ' + err.message)
    }
    setSaving(false)
  }

  const handleToggle = async (id, active) => {
    try {
      await adminFetch('/api/admin/announcements?action=toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active }),
      })
      await load()
    } catch (err) {
      alert('Failed to toggle: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await adminFetch('/api/admin/announcements?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await load()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Announcements & Popups</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage exit-intent popups, on-load announcements, and special promotions.</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing({})}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              + New Announcement
            </button>
          )}
        </div>

        {/* Editor */}
        {editing !== null && (
          <AnnouncementEditor
            item={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-neutral-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-neutral-200">
            <p className="text-neutral-500 mb-2">No announcements yet</p>
            <button
              onClick={() => setEditing({})}
              className="text-sm text-violet-600 font-semibold hover:underline"
            >
              Create your first announcement
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {items.length} announcement{items.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-green-600">
                ({items.filter((i) => i.active).length} active)
              </span>
            </div>
            {items.map((item) => (
              <AnnouncementRow
                key={item.id}
                item={item}
                onEdit={setEditing}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Help text */}
        <div className="mt-12 rounded-xl bg-white border border-neutral-200 p-6">
          <h3 className="text-sm font-bold text-neutral-700 mb-3">How it works</h3>
          <ul className="space-y-2 text-sm text-neutral-500">
            <li><strong>Exit Intent</strong> — popup appears when the user moves their cursor to leave the page (desktop only)</li>
            <li><strong>On Load</strong> — popup appears after a configurable delay when the page loads</li>
            <li><strong>Both</strong> — triggers on whichever happens first</li>
            <li><strong>Frequency</strong> — after dismissing, the popup won&apos;t show again for the configured number of days</li>
            <li><strong>Route Targeting</strong> — limit to specific pages (e.g., <code>/</code> for homepage only, <code>/services/*</code> for all service pages)</li>
            <li><strong>Scheduling</strong> — set start/end dates for time-limited promotions</li>
            <li><strong>Priority</strong> — if multiple announcements are active, the highest priority one shows first</li>
          </ul>
        </div>
    </div>
  )
}

AnnouncementsAdmin.getLayout = (page) => <AdminLayout>{page}</AdminLayout>
