// /admin/settings — Site-wide feature toggles

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminFetch } from '@/lib/adminFetch'

export default function SettingsPage() {
  const [chatEnabled, setChatEnabled] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminFetch('/api/admin/chat-settings')
      .then(r => r.json())
      .then(d => setChatEnabled(d.enabled))
      .catch(() => setChatEnabled(true))
  }, [])

  async function toggleChat() {
    const next = !chatEnabled
    setSaving(true)
    try {
      const res = await adminFetch('/api/admin/chat-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      })
      const data = await res.json()
      if (data.ok) setChatEnabled(next)
    } catch {
      // revert on error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-4">AI Chat Concierge</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-700">
              Show chat widget on the public site
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Takes effect within 30 seconds. No redeploy needed.
            </p>
          </div>

          {chatEnabled === null ? (
            <div className="h-6 w-11 rounded-full bg-neutral-200 animate-pulse" />
          ) : (
            <button
              onClick={toggleChat}
              disabled={saving}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                chatEnabled ? 'bg-green-500' : 'bg-neutral-300'
              } ${saving ? 'opacity-50 cursor-wait' : ''}`}
              title={chatEnabled ? 'Active — click to disable' : 'Inactive — click to enable'}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  chatEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          )}
        </div>

        {chatEnabled === false && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            The chat widget is hidden from all visitors. Toggle it back on when ready.
          </p>
        )}
      </div>
    </div>
  )
}

SettingsPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>
