// POST /api/chat — AI Chat Concierge endpoint
// Handles conversation with Claude Haiku, server-side tool execution, session metadata logging.
// NO message content is persisted. Phone numbers are transient (pass-through only).

import Anthropic from '@anthropic-ai/sdk'
import { getClientIp, applyRateLimit } from '@/lib/rateLimit'
import { chatLimiters, MAX_SESSION_TOKENS } from '@/lib/chat/chatRateLimit'
import { buildSystemPrompt } from '@/lib/chat/chatSystemPrompt'
import { TOOL_DEFINITIONS, executeTool } from '@/lib/chat/chatTools'
import { getServiceClient } from '@/lib/supabase'
import { safeLog, safeError } from '@/lib/logSanitizer'
import { createHmac } from 'crypto'

// Allow up to 60s for tool-heavy booking flows (requires Vercel Pro)
export const config = { maxDuration: 60 }

const CHAT_ENABLED = process.env.CHAT_ENABLED !== 'false'
const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 768
const MAX_MESSAGES = 50
const MAX_TOOL_ROUNDS = 5
const SLIDING_WINDOW = 20 // Send last N messages to Claude
const MAX_MESSAGE_CHARS = 800 // Per-message content length cap

let anthropic = null
function getAnthropicClient() {
  if (!anthropic) {
    anthropic = new Anthropic() // Uses ANTHROPIC_API_KEY env var
  }
  return anthropic
}

function hashIp(ip) {
  const salt = process.env.PATIENT_DATA_SALT
  if (!salt || !ip) return null
  return createHmac('sha256', salt).update(ip).digest('hex')
}

function generateSessionToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = 'cht_'
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export default async function handler(req, res) {
  if (!CHAT_ENABLED) {
    return res.status(503).json({ error: 'Chat is currently unavailable.' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Runtime toggle — check site_config
  try {
    const sb = getServiceClient()
    const { data } = await sb
      .from('site_config')
      .select('value')
      .eq('key', 'chat_enabled')
      .single()
    if (data?.value?.enabled === false) {
      return res.status(503).json({ error: 'Chat is currently unavailable.' })
    }
  } catch {
    // If we can't check, continue (fail open for env-var gated route)
  }

  const ip = getClientIp(req)

  // Rate limit: messages per minute + daily cap
  if (applyRateLimit(req, res, chatLimiters.message, ip)) return
  if (applyRateLimit(req, res, chatLimiters.daily, ip)) return

  const { sessionId, messages, locationKey, referrerPath } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required.' })
  }

  // Enforce max messages per session
  if (messages.length > MAX_MESSAGES) {
    return res.status(400).json({
      error: 'This conversation has reached its limit. Please start a new chat.',
      maxMessages: MAX_MESSAGES,
    })
  }

  // Validate message content size — block oversized payloads before they hit Anthropic
  for (const msg of messages) {
    if (typeof msg.content !== 'string' || msg.content.length > MAX_MESSAGE_CHARS) {
      return res.status(400).json({ error: 'Message too long. Please keep messages under 800 characters.' })
    }
    if (!['user', 'assistant'].includes(msg.role)) {
      return res.status(400).json({ error: 'Invalid message format.' })
    }
  }

  try {
    const client = getAnthropicClient()
    const supabase = getServiceClient()

    // ── Session management ──
    let currentSessionId = sessionId
    let isNewSession = false

    if (!currentSessionId) {
      // Rate limit: new sessions per hour
      const sessionLimit = chatLimiters.session(ip)
      if (!sessionLimit.allowed) {
        return res.status(429).json({
          error: 'Too many chat sessions. Please try again later.',
          retryAfterMs: sessionLimit.retryAfterMs,
        })
      }

      currentSessionId = generateSessionToken()
      isNewSession = true

      const { error: insertErr } = await supabase
        .from('chat_sessions')
        .insert({
          session_token: currentSessionId,
          ip_hash: hashIp(ip),
          user_agent: (req.headers['user-agent'] || '').slice(0, 512),
          location_key: locationKey || null,
          referrer_path: (referrerPath || '').slice(0, 512),
        })

      if (insertErr) {
        safeError('[chat] session insert', insertErr.message)
        // Non-fatal — continue without session tracking
      }
    }

    // ── Per-session token budget — block runaway conversations ──
    if (currentSessionId && !isNewSession) {
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('total_input_tokens, total_output_tokens')
        .eq('session_token', currentSessionId)
        .single()

      if (session) {
        const spent = (session.total_input_tokens || 0) + (session.total_output_tokens || 0)
        if (spent >= MAX_SESSION_TOKENS) {
          return res.status(429).json({
            error: 'This conversation has used its budget. Please start a new chat or call (317) 763-1142.',
          })
        }
      }
    }

    // ── Build prompt + call Claude ──
    const systemPrompt = buildSystemPrompt()

    // Sliding window: send only the last N messages
    const conversationMessages = messages.slice(-SLIDING_WINDOW).map(m => ({
      role: m.role,
      content: m.content,
    }))

    let response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: conversationMessages,
      tools: TOOL_DEFINITIONS,
    })

    // ── Tool-use loop (max 3 rounds) ──
    let toolRound = 0
    const toolNames = []
    let totalInputTokens = response.usage?.input_tokens || 0
    let totalOutputTokens = response.usage?.output_tokens || 0

    while (response.stop_reason === 'tool_use' && toolRound < MAX_TOOL_ROUNDS) {
      toolRound++

      // Rate limit: tool calls per minute
      const toolLimit = chatLimiters.toolCall(ip)
      if (!toolLimit.allowed) {
        safeLog('[chat] tool rate limit hit', { ip: hashIp(ip), round: toolRound })
        break
      }

      // Extract tool use blocks and execute in parallel
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
      toolUseBlocks.forEach(t => {
        safeLog('[chat] tool call', { tool: t.name, round: toolRound })
        toolNames.push(t.name)
      })

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolUse) => {
          try {
            const result = await executeTool(toolUse.name, toolUse.input)
            return {
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            }
          } catch (err) {
            safeError('[chat] tool error', { tool: toolUse.name, error: err.message })
            return {
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: 'An error occurred. Please try again.' }),
              is_error: true,
            }
          }
        })
      )

      // Continue conversation with tool results
      response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [
          ...conversationMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults },
        ],
        tools: TOOL_DEFINITIONS,
      })

      totalInputTokens += response.usage?.input_tokens || 0
      totalOutputTokens += response.usage?.output_tokens || 0
    }

    // ── Extract final text response ──
    const textBlocks = response.content.filter(b => b.type === 'text')
    const assistantMessage = textBlocks.map(b => b.text).join('\n')

    // Log any unprocessed tool_use blocks after max rounds
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        safeLog('[chat] unprocessed tool_use after max rounds', { tool: block.name })
      }
    }

    // ── Update session metadata ──
    const messageCount = messages.length + 1 // +1 for the new assistant response

    // Determine outcome based on tool usage
    let outcome = 'active'
    if (toolNames.includes('verify_code_and_checkout')) outcome = 'booking_completed'
    else if (toolNames.includes('create_cart')) outcome = 'booking_started'
    else if (toolNames.includes('request_sms_followup')) outcome = 'sms_fallback'

    const updateData = {
      message_count: messageCount,
      total_input_tokens: totalInputTokens,
      total_output_tokens: totalOutputTokens,
      last_message_at: new Date().toISOString(),
    }

    if (toolNames.length > 0) {
      // Append tool names (not args) to the existing array
      updateData.tool_calls = toolNames.map(t => ({ tool: t, ts: Date.now() }))
    }

    if (outcome !== 'active') {
      updateData.outcome = outcome
    }

    const { error: updateErr } = await supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('session_token', currentSessionId)

    if (updateErr) {
      safeError('[chat] session update', updateErr.message)
      // Non-fatal
    }

    // ── Response ──
    return res.status(200).json({
      sessionId: currentSessionId,
      message: {
        role: 'assistant',
        content: assistantMessage,
      },
      meta: {
        messageCount,
        maxMessages: MAX_MESSAGES,
        isNewSession,
      },
    })
  } catch (err) {
    safeError('[chat] handler error', err.message)

    // Anthropic-specific errors
    if (err.status === 429) {
      return res.status(429).json({
        error: 'Our AI assistant is busy right now. Please try again in a moment.',
        retryAfterMs: 5000,
      })
    }

    if (err.status === 529) {
      return res.status(503).json({
        error: 'Our AI assistant is temporarily unavailable. Please try again shortly.',
      })
    }

    return res.status(500).json({
      error: 'Something went wrong. Please try again or call (317) 763-1142.',
    })
  }
}
