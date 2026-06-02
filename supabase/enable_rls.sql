-- ============================================================================
-- Erident — lock down the public Supabase API (fixes "RLS disabled in public").
--
-- The app talks to Postgres ONLY via Prisma using the `postgres` role (through
-- the pooler), which BYPASSES Row-Level Security. It never uses the Supabase
-- anon/public REST API. So we can safely:
--   1. Enable RLS on every table in the public schema (no policies => the
--      anon/authenticated API roles can read/write NOTHING), and
--   2. Revoke table privileges from those public API roles as defense in depth.
--
-- This does NOT affect the Next.js app (Prisma keeps full access).
-- Idempotent: safe to run multiple times. Paste into Supabase SQL Editor → Run.
-- ============================================================================

-- 1) Enable RLS on all current tables in the public schema.
--    No FORCE: the table owner / `postgres` (BYPASSRLS) role keeps full access,
--    so Prisma is unaffected; the anon/authenticated API roles get nothing.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END $$;

-- 2) Revoke all access from the public REST API roles (anon + authenticated).
--    No policies + no grants => the public API cannot touch any table.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- 3) Make sure future tables created by Prisma are also locked by default.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
