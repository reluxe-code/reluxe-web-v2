// src/components/chat/ChatBubble.js
// Individual message bubble — user (right) or assistant (left)

import { motion } from 'framer-motion'

export default function ChatBubble({ role, content }) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: '2px 16px',
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          minWidth: 0,
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: 14,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          overflow: 'hidden',
          ...(isUser
            ? {
                background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
                color: '#FAF8F5',
              }
            : {
                backgroundColor: '#F0ECE6',
                color: '#1A1A1A',
              }),
        }}
      >
        {content}
      </div>
    </motion.div>
  )
}
