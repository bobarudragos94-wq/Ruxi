-- Migration: add Patient.address (postal/home address shown in patient details).
-- Run once in the Supabase SQL Editor. Idempotent.
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "address" TEXT;
