-- 064-data-retention.sql
-- Phase 7D: Data retention TTL policies.
-- Creates a function that can be called by the weekly cron job.

CREATE OR REPLACE FUNCTION enforce_data_retention()
RETURNS TABLE(table_name TEXT, rows_deleted BIGINT) AS $$
DECLARE
  _deleted BIGINT;
BEGIN
  -- marketing_touches: 24 months
  DELETE FROM marketing_touches WHERE created_at < now() - interval '24 months';
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  table_name := 'marketing_touches'; rows_deleted := _deleted; RETURN NEXT;

  -- booking_sessions: 12 months
  DELETE FROM booking_sessions WHERE created_at < now() - interval '12 months';
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  table_name := 'booking_sessions'; rows_deleted := _deleted; RETURN NEXT;

  -- concierge_queue: 30 days
  DELETE FROM concierge_queue WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  table_name := 'concierge_queue'; rows_deleted := _deleted; RETURN NEXT;

  -- site_audit_events: 12 months
  DELETE FROM site_audit_events WHERE created_at < now() - interval '12 months';
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  table_name := 'site_audit_events'; rows_deleted := _deleted; RETURN NEXT;

  -- bird_webhook_log: 6 months
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE information_schema.tables.table_name = 'bird_webhook_log') THEN
    DELETE FROM bird_webhook_log WHERE created_at < now() - interval '6 months';
    GET DIAGNOSTICS _deleted = ROW_COUNT;
    table_name := 'bird_webhook_log'; rows_deleted := _deleted; RETURN NEXT;
  END IF;

  -- admin_access_logs: 24 months
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE information_schema.tables.table_name = 'admin_access_logs') THEN
    DELETE FROM admin_access_logs WHERE created_at < now() - interval '24 months';
    GET DIAGNOSTICS _deleted = ROW_COUNT;
    table_name := 'admin_access_logs'; rows_deleted := _deleted; RETURN NEXT;
  END IF;

  -- experiment_events: 6 months
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE information_schema.tables.table_name = 'experiment_events') THEN
    DELETE FROM experiment_events WHERE created_at < now() - interval '6 months';
    GET DIAGNOSTICS _deleted = ROW_COUNT;
    table_name := 'experiment_events'; rows_deleted := _deleted; RETURN NEXT;
  END IF;

  -- widget_events: 6 months
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE information_schema.tables.table_name = 'widget_events') THEN
    DELETE FROM widget_events WHERE created_at < now() - interval '6 months';
    GET DIAGNOSTICS _deleted = ROW_COUNT;
    table_name := 'widget_events'; rows_deleted := _deleted; RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
