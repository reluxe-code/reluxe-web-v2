-- 075-chat-booking-state.sql
-- Add server-managed booking state machine to chat sessions.
-- This JSONB column tracks the full booking flow (step, provider, cart, etc.)
-- so the LLM no longer manages sequential tool-call state.

ALTER TABLE chat_sessions
  ADD COLUMN IF NOT EXISTS booking_state JSONB DEFAULT NULL;

COMMENT ON COLUMN chat_sessions.booking_state IS
  'Server-side booking state machine. NULL = no active booking. Contains step, IDs, availability cache.';
