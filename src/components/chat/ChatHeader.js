// src/components/chat/ChatHeader.js
// Title bar with minimize/close controls

export default function ChatHeader({ onClose }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
        borderRadius: '16px 16px 0 0',
        color: '#FAF8F5',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Bot icon */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'rgba(250,248,245,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect x="4" y="8" width="16" height="12" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M9 13v2" />
            <path d="M15 13v2" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>RELUXE Assistant</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>AI-powered concierge</div>
        </div>
      </div>

      <button
        onClick={onClose}
        aria-label="Close chat"
        style={{
          background: 'none',
          border: 'none',
          color: '#FAF8F5',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(250,248,245,0.15)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
