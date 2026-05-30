-- Migration: add Patient.isNew (flags patients registered via public online booking).
-- Run once in the Supabase SQL Editor. Idempotent.
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "isNew" BOOLEAN NOT NULL DEFAULT false;
