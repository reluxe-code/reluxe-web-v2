-- 031: Add client identity columns to experiment_sessions for booking attribution
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS blvd_client_id TEXT;

-- Also add Reveal Board fields that may be stored via PATCH
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS filter_locations TEXT;
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS filter_services JSONB;
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS filter_when TEXT;
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS filter_time_of_day TEXT;
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS filter_provider TEXT;
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS board_tile_count INT;
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS bird_subscriber_id TEXT;
