// src/pages/admin/conversations/index.js
// Bird Conversations inbox — view SMS threads, reply to clients.
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'
import { adminFetch } from '@/lib/adminFetch'
import { useClientJit, jitDisplayName } from '@/hooks/useClientJit'

function formatPhone(phone) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function formatCurrency(cents) {
  if (!cents) return '$0'
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('open')
  const [stats, setStats] = useState({ open_count: 0, total_unread: 0 })
  const [syncing, setSyncing] = useState(false)
  const messagesEndRef = useRef(null)

  // JIT client name resolution
  const boulevardIds = useMemo(() => {
    const fromList = conversations.map(c => c.boulevard_id).filter(Boolean)
    const fromThread = thread?.client?.boulevard_id ? [thread.client.boulevard_id] : []
    return [...new Set([...fromList, ...fromThread])]
  }, [conversations, thread?.client?.boulevard_id])
  const { clients: jitClients } = useClientJit(boulevardIds)

  const loadConversations = useCallback(async () => {
    try {
      const res = await adminFetch(`/api/admin/conversations?status=${filter}`)
      const data = await res.json()
      if (data.ok) {
        setConversations(data.conversations)
        setStats({ open_count: data.open_count, total_unread: data.total_unread })
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  async function syncFromBird() {
    setSyncing(true)
    try {
      const res = await adminFetch('/api/admin/conversations/sync', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        const s = data.synced
        const parts = []
        if (s.conversations > 0) parts.push(`${s.conversations} new conversations`)
        if (s.messages > 0) parts.push(`${s.messages} new messages`)
        if (parts.length > 0) alert(`Synced: ${parts.join(', ')}`)
        loadConversations()
        if (selectedId) loadThread(selectedId)
      } else {
        alert(`Sync failed: ${data.error}`)
      }
    } catch (err) {
      alert(`Sync error: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  // Poll for new messages every 15 seconds
  useEffect(() => {
    const interval = setInterval(loadConversations, 15000)
    return () => clearInterval(interval)
  }, [loadConversations])

  async function loadThread(conversationId) {
    setSelectedId(conversationId)
    setThreadLoading(true)
    setReplyText('')

    try {
      const res = await adminFetch(`/api/admin/conversations/${conversationId}`)
      const data = await res.json()
      if (data.ok) {
        setThread(data)
        // Update unread count locally
        setConversations(prev =>
          prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c)
        )
      }
    } catch (err) {
      console.error('Failed to load thread:', err)
    } finally {
      setThreadLoading(false)
    }
  }

  // Auto-scroll to bottom when thread loads or new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages])

  async function handleReply(e) {
    e.preventDefault()
    if (!replyText.trim() || sending) return

    setSending(true)
    try {
      const res = await adminFetch('/api/admin/conversations/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selectedId, body: replyText.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setReplyText('')
        // Reload thread to show the new message
        loadThread(selectedId)
        loadConversations()
      } else {
        alert(`Failed to send: ${data.error}`)
      }
    } catch (err) {
      alert(`Send error: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  async function handleAction(conversationId, action) {
    try {
      await adminFetch('/api/admin/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: conversationId, action }),
      })
      loadConversations()
      if (conversationId === selectedId && (action === 'close' || action === 'archive')) {
        setSelectedId(null)
        setThread(null)
      }
    } catch (err) {
      console.error('Action failed:', err)
    }
  }

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar: Conversation List */}
        <div className="w-96 border-r border-neutral-200 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-semibold">Conversations</h1>
              <div className="flex items-center gap-2">
                {stats.total_unread > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {stats.total_unread} unread
                  </span>
                )}
                <button
                  onClick={syncFromBird}
                  disabled={syncing}
                  title="Sync conversations from Bird API"
                  className="px-2 py-1 rounded-md text-xs font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                >
                  {syncing ? 'Syncing...' : 'Sync'}
                </button>
                <button
                  onClick={() => { loadConversations(); if (selectedId) loadThread(selectedId) }}
                  title="Fetch latest messages"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex gap-1">
              {['open', 'closed', 'all'].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setLoading(true) }}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    filter === f
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'open' && stats.open_count > 0 ? ` (${stats.open_count})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-neutral-400 text-sm">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-neutral-400 text-sm">No conversations</div>
            ) : (
              conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => loadThread(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                    selectedId === c.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-sm text-neutral-900 truncate">
                      {jitDisplayName(jitClients[c.boulevard_id], c.client_name) || formatPhone(c.phone)}
                    </span>
                    <span className="text-xs text-neutral-400 whitespace-nowrap ml-2">
                      {timeAgo(c.last_message_at)}
                    </span>
                  </div>
                  {c.client_name && (
                    <div className="text-xs text-neutral-400 mb-0.5">{formatPhone(c.phone)}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-neutral-500 truncate flex-1">
                      {c.last_direction === 'outbound' && (
                        <span className="text-neutral-400">You: </span>
                      )}
                      {c.last_message_preview || 'No messages'}
                    </p>
                    {c.unread_count > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main: Thread View */}
        <div className="flex-1 flex flex-col bg-neutral-50">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
              Select a conversation to view messages
            </div>
          ) : threadLoading ? (
            <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
              Loading thread...
            </div>
          ) : thread ? (
            <>
              {/* Thread header */}
              <div className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-neutral-900">
                    {jitDisplayName(jitClients[thread.client?.boulevard_id || thread.conversation.boulevard_id], thread.conversation.client_name) || formatPhone(thread.conversation.phone)}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span>{formatPhone(thread.conversation.phone)}</span>
                    {thread.client && (
                      <>
                        <span>{thread.client.visit_count} visits</span>
                        <span>${Number(thread.client.total_spend || 0).toLocaleString()} spent</span>
                        {thread.client.account_credit > 0 && (
                          <span className="text-green-600">{formatCurrency(thread.client.account_credit)} credit</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {thread.conversation.status === 'open' ? (
                    <button
                      onClick={() => handleAction(selectedId, 'close')}
                      className="text-xs px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(selectedId, 'reopen')}
                      className="text-xs px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(selectedId, 'archive')}
                    className="text-xs px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {/* Show concierge campaign context if available */}
                {thread.recent_touches?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="text-xs font-medium text-amber-700 mb-1">Recent Campaign Messages</div>
                    {thread.recent_touches.slice(0, 3).map(t => (
                      <div key={t.id} className="text-xs text-amber-600 mt-1">
                        <span className="font-medium">{t.campaign_slug}</span>
                        <span className="text-amber-400 mx-1">{t.variant}</span>
                        <span className="text-amber-400">{formatDate(t.sent_at)}</span>
                        <span className={`ml-1 ${t.status === 'booked' ? 'text-green-600 font-medium' : ''}`}>
                          ({t.status})
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {thread.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        msg.direction === 'outbound'
                          ? msg.sender_type === 'admin'
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-800 text-white'
                          : 'bg-white border border-neutral-200 text-neutral-900'
                      }`}
                    >
                      {/* Campaign badge for system messages */}
                      {msg.sender_type === 'system' && msg.campaign_slug && (
                        <div className={`text-[10px] font-medium mb-1 ${
                          msg.direction === 'outbound' ? 'text-neutral-400' : 'text-neutral-400'
                        }`}>
                          Concierge: {msg.campaign_slug}
                        </div>
                      )}
                      {msg.sender_type === 'admin' && (
                        <div className="text-[10px] font-medium mb-1 text-blue-200">
                          {msg.sender_name || 'Admin'}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                      <div className={`text-[10px] mt-1 ${
                        msg.direction === 'outbound' ? 'text-neutral-400' : 'text-neutral-400'
                      }`}>
                        {formatDate(msg.sent_at)}
                        {msg.status === 'delivered' && ' \u2713'}
                        {msg.status === 'read' && ' \u2713\u2713'}
                        {msg.status === 'failed' && ' \u2717 Failed'}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="bg-white border-t border-neutral-200 px-6 py-3">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Replies are sent as SMS via Bird to {formatPhone(thread.conversation.phone)}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  )
}

ConversationsPage.getLayout = (page) => page
