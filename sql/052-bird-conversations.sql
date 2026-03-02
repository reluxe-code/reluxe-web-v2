-- 052-bird-conversations.sql
-- Bird Conversations: local inbox for SMS threads with clients.
-- Links inbound replies to original concierge messages.

-- ============================================================
-- 1. bird_conversations — one thread per phone number
-- ============================================================
CREATE TABLE IF NOT EXISTS bird_conversations (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bird_conversation_id TEXT UNIQUE,
  client_id         UUID REFERENCES blvd_clients(id),
  phone             TEXT NOT NULL,
  client_name       TEXT,
  -- Conversation state
  status            TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'archived')),
  unread_count      INT NOT NULL DEFAULT 0,
  last_message_at   TIMESTAMPTZ,
  last_message_preview TEXT,
  last_direction    TEXT CHECK (last_direction IN ('inbound', 'outbound')),
  -- Metadata
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bc_phone ON bird_conversations(phone);
CREATE INDEX IF NOT EXISTS idx_bc_client ON bird_conversations(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bc_status ON bird_conversations(status);
CREATE INDEX IF NOT EXISTS idx_bc_last_msg ON bird_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_bc_unread ON bird_conversations(unread_count) WHERE unread_count > 0;

ALTER TABLE bird_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bc_service ON bird_conversations;
CREATE POLICY bc_service ON bird_conversations FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 2. bird_messages — individual messages in a conversation
-- ============================================================
CREATE TABLE IF NOT EXISTS bird_messages (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id   UUID NOT NULL REFERENCES bird_conversations(id),
  bird_message_id   TEXT,
  direction         TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body              TEXT,
  -- Link to concierge campaign message that triggered this thread
  marketing_touch_id UUID,
  campaign_slug     TEXT,
  -- Delivery status
  status            TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'delivered', 'failed', 'read')),
  -- Sender context
  sender_type       TEXT NOT NULL DEFAULT 'client'
    CHECK (sender_type IN ('client', 'system', 'admin')),
  sender_name       TEXT,
  -- Timestamps
  sent_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at      TIMESTAMPTZ,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bm_conversation ON bird_messages(conversation_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_bm_bird_msg ON bird_messages(bird_message_id) WHERE bird_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bm_touch ON bird_messages(marketing_touch_id) WHERE marketing_touch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bm_direction ON bird_messages(direction, sent_at DESC);

ALTER TABLE bird_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bm_service ON bird_messages;
CREATE POLICY bm_service ON bird_messages FOR ALL
  USING (true) WITH CHECK (true);
