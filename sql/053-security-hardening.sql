-- 053-security-hardening.sql
-- CRITICAL: Fix RLS policies that use USING(true) without TO service_role.
-- Without the TO clause, the anon key (exposed in browser) can read/write ALL rows.
-- This migration scopes all open policies to service_role only.

-- ============================================================
-- 1. PHI TABLES — Patient data (CRITICAL)
-- ============================================================

-- blvd_clients
DROP POLICY IF EXISTS "service_role_blvd_clients" ON blvd_clients;
CREATE POLICY "service_role_blvd_clients" ON blvd_clients FOR ALL TO service_role USING (true) WITH CHECK (true);

-- blvd_appointments
DROP POLICY IF EXISTS "service_role_blvd_appointments" ON blvd_appointments;
CREATE POLICY "service_role_blvd_appointments" ON blvd_appointments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- blvd_appointment_services
DROP POLICY IF EXISTS "service_role_blvd_appt_svcs" ON blvd_appointment_services;
CREATE POLICY "service_role_blvd_appt_svcs" ON blvd_appointment_services FOR ALL TO service_role USING (true) WITH CHECK (true);

-- blvd_sync_log
DROP POLICY IF EXISTS "service_role_blvd_sync_log" ON blvd_sync_log;
CREATE POLICY "service_role_blvd_sync_log" ON blvd_sync_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- tracking_tokens
DROP POLICY IF EXISTS "tt_service" ON tracking_tokens;
CREATE POLICY "tt_service" ON tracking_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 2. MEMBER / LEADS TABLES
-- ============================================================

-- leads
DROP POLICY IF EXISTS "leads_service" ON leads;
CREATE POLICY "leads_service" ON leads FOR ALL TO service_role USING (true) WITH CHECK (true);

-- lead_events
DROP POLICY IF EXISTS "lead_events_service" ON lead_events;
CREATE POLICY "lead_events_service" ON lead_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- blvd_memberships
DROP POLICY IF EXISTS "service_role_blvd_memberships" ON blvd_memberships;
CREATE POLICY "service_role_blvd_memberships" ON blvd_memberships FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 3. BOOKING / ANALYTICS TABLES
-- ============================================================

-- booking_sessions
DROP POLICY IF EXISTS "bs_service" ON booking_sessions;
DROP POLICY IF EXISTS "bs_anon_insert" ON booking_sessions;
CREATE POLICY "bs_service" ON booking_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "bs_anon_insert" ON booking_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "bs_anon_update" ON booking_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- booking_events (had RLS enabled but no policies)
DROP POLICY IF EXISTS "be_service" ON booking_events;
DROP POLICY IF EXISTS "be_anon_insert" ON booking_events;
CREATE POLICY "be_service" ON booking_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "be_anon_insert" ON booking_events FOR INSERT TO anon WITH CHECK (true);

-- experiment_sessions
DROP POLICY IF EXISTS "es_service" ON experiment_sessions;
DROP POLICY IF EXISTS "es_anon_insert" ON experiment_sessions;
DROP POLICY IF EXISTS "es_anon_update" ON experiment_sessions;
CREATE POLICY "es_service" ON experiment_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "es_anon_insert" ON experiment_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "es_anon_update" ON experiment_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- experiment_events
DROP POLICY IF EXISTS "ee_service" ON experiment_events;
DROP POLICY IF EXISTS "ee_anon_insert" ON experiment_events;
CREATE POLICY "ee_service" ON experiment_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "ee_anon_insert" ON experiment_events FOR INSERT TO anon WITH CHECK (true);

-- site_audit_events
DROP POLICY IF EXISTS "sae_service" ON site_audit_events;
DROP POLICY IF EXISTS "sae_anon_insert" ON site_audit_events;
CREATE POLICY "sae_service" ON site_audit_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "sae_anon_insert" ON site_audit_events FOR INSERT TO anon WITH CHECK (true);

-- widget_events (already properly restricted — skip)

-- ============================================================
-- 4. REFERRAL / MARKETING TABLES
-- ============================================================

-- referral_codes (had RLS enabled but no policies)
DROP POLICY IF EXISTS "rc_service" ON referral_codes;
CREATE POLICY "rc_service" ON referral_codes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "rc_anon_read" ON referral_codes FOR SELECT TO anon USING (true);

-- referrals
DROP POLICY IF EXISTS "ref_service" ON referrals;
CREATE POLICY "ref_service" ON referrals FOR ALL TO service_role USING (true) WITH CHECK (true);

-- referral_events (had RLS enabled but no policies)
DROP POLICY IF EXISTS "re_service" ON referral_events;
CREATE POLICY "re_service" ON referral_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "re_anon_insert" ON referral_events FOR INSERT TO anon WITH CHECK (true);

-- referral_shares (had RLS enabled but no policies)
DROP POLICY IF EXISTS "rs_service" ON referral_shares;
CREATE POLICY "rs_service" ON referral_shares FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "rs_anon_insert" ON referral_shares FOR INSERT TO anon WITH CHECK (true);

-- marketing_touches
DROP POLICY IF EXISTS "mt_service" ON marketing_touches;
CREATE POLICY "mt_service" ON marketing_touches FOR ALL TO service_role USING (true) WITH CHECK (true);

-- concierge_queue
DROP POLICY IF EXISTS "cq_service" ON concierge_queue;
CREATE POLICY "cq_service" ON concierge_queue FOR ALL TO service_role USING (true) WITH CHECK (true);

-- concierge_links
DROP POLICY IF EXISTS "cl_service" ON concierge_links;
CREATE POLICY "cl_service" ON concierge_links FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Anon needs to read links for redirect resolution
CREATE POLICY "cl_anon_read" ON concierge_links FOR SELECT TO anon USING (true);

-- concierge_campaigns
DROP POLICY IF EXISTS "cc_service" ON concierge_campaigns;
CREATE POLICY "cc_service" ON concierge_campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);

-- social_campaigns
DROP POLICY IF EXISTS "sc_service" ON social_campaigns;
CREATE POLICY "sc_service" ON social_campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 5. ENGAGEMENT / BIRD TABLES
-- ============================================================

-- bird_engagement_events
DROP POLICY IF EXISTS "bee_service" ON bird_engagement_events;
CREATE POLICY "bee_service" ON bird_engagement_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- client_channel_status
DROP POLICY IF EXISTS "ccs_service" ON client_channel_status;
CREATE POLICY "ccs_service" ON client_channel_status FOR ALL TO service_role USING (true) WITH CHECK (true);

-- client_engagement_scores
DROP POLICY IF EXISTS "ces_service" ON client_engagement_scores;
CREATE POLICY "ces_service" ON client_engagement_scores FOR ALL TO service_role USING (true) WITH CHECK (true);

-- bird_webhook_log
DROP POLICY IF EXISTS "bwl_service" ON bird_webhook_log;
CREATE POLICY "bwl_service" ON bird_webhook_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- bird_conversations
DROP POLICY IF EXISTS bc_service ON bird_conversations;
CREATE POLICY "bc_service" ON bird_conversations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- bird_messages
DROP POLICY IF EXISTS bm_service ON bird_messages;
CREATE POLICY "bm_service" ON bird_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 6. PRODUCT / VELOCITY / CONFIG TABLES
-- ============================================================

-- blvd_product_catalog
DROP POLICY IF EXISTS "bpc_service" ON blvd_product_catalog;
CREATE POLICY "bpc_service" ON blvd_product_catalog FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "bpc_anon_read" ON blvd_product_catalog FOR SELECT TO anon USING (active = true);

-- blvd_product_sales
DROP POLICY IF EXISTS "bps_service" ON blvd_product_sales;
CREATE POLICY "bps_service" ON blvd_product_sales FOR ALL TO service_role USING (true) WITH CHECK (true);

-- velocity_config
DROP POLICY IF EXISTS "vc_service" ON velocity_config;
CREATE POLICY "vc_service" ON velocity_config FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "vc_anon_read" ON velocity_config FOR SELECT TO anon USING (true);

-- velocity_service_multipliers
DROP POLICY IF EXISTS "vsm_service" ON velocity_service_multipliers;
CREATE POLICY "vsm_service" ON velocity_service_multipliers FOR ALL TO service_role USING (true) WITH CHECK (true);

-- velocity_promotions
DROP POLICY IF EXISTS "vp_service" ON velocity_promotions;
CREATE POLICY "vp_service" ON velocity_promotions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "vp_anon_read" ON velocity_promotions FOR SELECT TO anon USING (is_active = true);

-- velocity_processed_appointments
DROP POLICY IF EXISTS "vpa_service" ON velocity_processed_appointments;
CREATE POLICY "vpa_service" ON velocity_processed_appointments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- rie_sku_core4_map
DROP POLICY IF EXISTS "rsc_service" ON rie_sku_core4_map;
CREATE POLICY "rsc_service" ON rie_sku_core4_map FOR ALL TO service_role USING (true) WITH CHECK (true);

-- site_config
DROP POLICY IF EXISTS "sc_service_all" ON site_config;
DROP POLICY IF EXISTS "site_config_read" ON site_config;
CREATE POLICY "sc_service_all" ON site_config FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "sc_anon_read" ON site_config FOR SELECT TO anon USING (true);

-- ============================================================
-- 7. TABLES MISSING RLS ENTIRELY — Enable it
-- ============================================================

-- bird_sync_log
ALTER TABLE IF EXISTS bird_sync_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bsl_service" ON bird_sync_log;
CREATE POLICY "bsl_service" ON bird_sync_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- blvd_packages
ALTER TABLE IF EXISTS blvd_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bp_service" ON blvd_packages;
CREATE POLICY "bp_service" ON blvd_packages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- blvd_package_catalog
ALTER TABLE IF EXISTS blvd_package_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bpcat_service" ON blvd_package_catalog;
CREATE POLICY "bpcat_service" ON blvd_package_catalog FOR ALL TO service_role USING (true) WITH CHECK (true);
