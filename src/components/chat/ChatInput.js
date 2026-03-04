// src/components/chat/ChatInput.js
// Text input + send button

import { useState, useRef, useEffect } from 'react'

const MAX_CHARS = 800

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  // Refocus input when it becomes enabled (after bot responds)
  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    // Keep focus on input after send
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderTop: '1px solid #E0D9CF',
        backgroundColor: '#FFFFFF',
        borderRadius: '0 0 16px 16px',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        maxLength={MAX_CHARS}
        placeholder={disabled ? 'Waiting for response...' : 'Type a message...'}
        disabled={disabled}
        autoComplete="off"
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: 24,
          border: '1px solid #E0D9CF',
          backgroundColor: '#FAF8F5',
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.15s',
          color: '#1A1A1A',
        }}
        onFocus={e => (e.target.style.borderColor = '#7C3AED')}
        onBlur={e => (e.target.style.borderColor = '#E0D9CF')}
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background:
            disabled || !value.trim()
              ? '#E0D9CF'
              : 'linear-gradient(135deg, #7C3AED, #C026D3)',
          color: '#FAF8F5',
          cursor: disabled || !value.trim() ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </form>
  )
}
