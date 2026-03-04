// src/components/chat/ChatMessages.js
// Scrollable message list with auto-scroll on new messages

import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import ChatBubble from './ChatBubble'

const PRIVACY_NOTICE = 'This chat is AI-powered. Messages are not stored. If I need your phone number for booking or follow-up, it\'s used only for that purpose and never saved.'

export default function ChatMessages({ messages, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 0',
        backgroundColor: '#FFFFFF',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Privacy notice — always visible at top */}
      <div
        style={{
          margin: '0 16px 8px',
          padding: '8px 12px',
          borderRadius: 12,
          backgroundColor: '#FAF8F5',
          border: '1px solid #E0D9CF',
          fontSize: 12,
          color: '#8A8580',
          lineHeight: 1.5,
        }}
      >
        {PRIVACY_NOTICE}
      </div>

      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '2px 16px' }}>
          <div
            style={{
              padding: '10px 18px',
              borderRadius: '16px 16px 16px 4px',
              backgroundColor: '#F0ECE6',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <span className="chat-typing-dot" style={{ animationDelay: '0ms' }} />
            <span className="chat-typing-dot" style={{ animationDelay: '150ms' }} />
            <span className="chat-typing-dot" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
