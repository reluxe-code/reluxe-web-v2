// src/lib/chat/chatRateLimit.js
import { createRateLimiter } from '@/lib/rateLimit'

export const chatLimiters = {
  message:  createRateLimiter('chat-msg', 20, 60_000),        // 20/min per IP
  daily:    createRateLimiter('chat-daily', 200, 86_400_000), // 200/day per IP — hard ceiling on abuse
  session:  createRateLimiter('chat-session', 3, 3_600_000),  // 3 new sessions/hr per IP
  sms:      createRateLimiter('chat-sms', 3, 3_600_000),      // 3 SMS fallbacks/hr per IP
  toolCall: createRateLimiter('chat-tool', 8, 60_000),        // 8 tool calls/min per IP
}

// Per-session token budget — prevents runaway conversations from burning Anthropic credits
export const MAX_SESSION_TOKENS = 100_000
