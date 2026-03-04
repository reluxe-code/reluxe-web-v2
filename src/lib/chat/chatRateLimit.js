// src/lib/chat/chatRateLimit.js
import { createRateLimiter } from '@/lib/rateLimit'

export const chatLimiters = {
  message:  createRateLimiter('chat-msg', 20, 60_000),        // 20/min per IP
  session:  createRateLimiter('chat-session', 3, 3_600_000),  // 3 new sessions/hr per IP
  sms:      createRateLimiter('chat-sms', 3, 3_600_000),      // 3 SMS fallbacks/hr per IP
  toolCall: createRateLimiter('chat-tool', 8, 60_000),        // 8 tool calls/min per IP
}
