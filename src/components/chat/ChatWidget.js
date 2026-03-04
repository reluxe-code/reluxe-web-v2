// src/components/chat/ChatWidget.js
// Floating action button + expandable chat panel.
// Root component — mounted via dynamic import in _app.js.

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I'm RELUXE's AI assistant. I can help you with services, pricing, and booking appointments. I'm not a medical professional \u2014 for personalized treatment advice, our providers are happy to help during a consultation.\n\nWhat can I help you with? Try one of the suggestions below, or just type your question!",
}

const STARTER_PROMPTS = [
  'Book a massage this Friday',
  'Botox appointment next week',
  'What facials do you offer?',
  'Book a free consultation',
]

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 min

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [enabled, setEnabled] = useState(null) // null = loading, true/false = resolved
  const lastActivityRef = useRef(Date.now())
  const router = useRouter()

  // Check if chat is enabled (runtime toggle from admin)
  useEffect(() => {
    fetch('/api/chat/status')
      .then(r => r.json())
      .then(d => setEnabled(d.enabled !== false))
      .catch(() => setEnabled(true)) // fail open
  }, [])

  // Listen for toggle event from MobileStickyFooter chat button
  useEffect(() => {
    const handler = () => { setIsOpen(prev => !prev); checkTimeout() }
    window.addEventListener('reluxe:toggle-chat', handler)
    return () => window.removeEventListener('reluxe:toggle-chat', handler)
  }, [])

  // Reset session after 30min inactivity
  const checkTimeout = useCallback(() => {
    if (Date.now() - lastActivityRef.current > SESSION_TIMEOUT_MS) {
      setSessionId(null)
      setMessages([WELCOME_MESSAGE])
      setError(null)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(checkTimeout, 60_000)
    return () => clearInterval(interval)
  }, [isOpen, checkTimeout])

  // Determine location from URL context
  const getLocationKey = useCallback(() => {
    const path = router.asPath.toLowerCase()
    if (path.includes('westfield')) return 'westfield'
    if (path.includes('carmel')) return 'carmel'
    return null
  }, [router.asPath])

  const sendMessage = useCallback(
    async (text) => {
      lastActivityRef.current = Date.now()
      setError(null)

      const userMessage = { role: 'user', content: text }
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setIsLoading(true)

      try {
        // Build messages array for API (exclude the initial welcome since it's client-only)
        const apiMessages = updatedMessages
          .filter((m) => m !== WELCOME_MESSAGE)
          .map((m) => ({ role: m.role, content: m.content }))

        // If this is the first user message, include the welcome as assistant context
        if (!sessionId) {
          apiMessages.unshift({ role: 'assistant', content: WELCOME_MESSAGE.content })
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messages: apiMessages,
            locationKey: getLocationKey(),
            referrerPath: router.asPath,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Something went wrong.')
          return
        }

        if (data.sessionId) setSessionId(data.sessionId)

        if (data.message?.content) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.message.content },
          ])
        }
      } catch {
        setError('Network error. Please check your connection and try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [messages, sessionId, getLocationKey, router.asPath]
  )

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev)
    checkTimeout()
  }, [checkTimeout])

  // Don't render on admin pages or if disabled via admin toggle
  if (router.asPath.startsWith('/admin')) return null
  if (!enabled) return null

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="chat-panel"
            style={{
              position: 'fixed',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <ChatHeader onClose={toggleChat} />
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              starters={messages.length <= 1 && !isLoading ? STARTER_PROMPTS : null}
              onStarterClick={sendMessage}
            />

            {/* Error bar */}
            {error && (
              <div
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FEF2F2',
                  borderTop: '1px solid #FECACA',
                  color: '#991B1B',
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}

            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB (Floating Action Button) — desktop only, mobile uses footer bar */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={toggleChat}
            aria-label="Open chat"
            className="chat-fab hidden lg:flex"
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 100,
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
              color: '#FAF8F5',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
