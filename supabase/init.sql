-- ============================================================================
-- Cabinet Stomatologic — Supabase Postgres init script
-- Matches prisma/schema.prisma exactly (table/column names, enums, indexes, FKs)
-- Idempotent: safe to run multiple times. Paste into Supabase SQL Editor and Run.
-- Demo password for both users: parola123
-- ============================================================================

BEGIN;

-- ---------- Enums ----------
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'DENTIST', 'STAFF');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InterventionType" AS ENUM ('CONTROL', 'DETARTRAJ', 'PLOMBA', 'EXTRACTIE', 'TRATAMENT_CANAL', 'ALTCEVA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'CONFIRMED', 'BOOKED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Tables ----------
CREATE TABLE IF NOT EXISTS "User" (
  "id"           TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "email"        TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role"         "Role" NOT NULL DEFAULT 'STAFF',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Dentist" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "email"     TEXT,
  "color"     TEXT NOT NULL DEFAULT '#005dac',
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Dentist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Patient" (
  "id"                TEXT NOT NULL,
  "fullName"          TEXT NOT NULL,
  "phone"             TEXT NOT NULL,
  "email"             TEXT,
  "dateOfBirth"       TIMESTAMP(3),
  "assignedDentistId" TEXT,
  "medicalNotes"      TEXT,
  "allergies"         TEXT,
  "isNew"             BOOLEAN NOT NULL DEFAULT false,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Intervention" (
  "id"            TEXT NOT NULL,
  "patientId"     TEXT NOT NULL,
  "dentistId"     TEXT NOT NULL,
  "date"          TIMESTAMP(3) NOT NULL,
  "type"          "InterventionType" NOT NULL,
  "teethOrArea"   TEXT,
  "notes"         TEXT,
  "estimatedCost" DECIMAL(10,2),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Appointment" (
  "id"            TEXT NOT NULL,
  "patientId"     TEXT NOT NULL,
  "dentistId"     TEXT NOT NULL,
  "startTime"     TIMESTAMP(3) NOT NULL,
  "endTime"       TIMESTAMP(3) NOT NULL,
  "status"        "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
  "procedureType" TEXT,
  "notes"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RecallReminder" (
  "id"         TEXT NOT NULL,
  "patientId"  TEXT NOT NULL,
  "dueDate"    TIMESTAMP(3) NOT NULL,
  "status"     "ReminderStatus" NOT NULL DEFAULT 'PENDING',
  "lastSentAt" TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecallReminder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReminderLog" (
  "id"                TEXT NOT NULL,
  "patientId"         TEXT NOT NULL,
  "reminderId"        TEXT,
  "emailTo"           TEXT NOT NULL,
  "status"            TEXT NOT NULL,
  "providerMessageId" TEXT,
  "sentAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "errorMessage"      TEXT,
  CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT,
  "action"     TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId"   TEXT,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WorkingSchedule" (
  "id"                  TEXT NOT NULL,
  "dentistId"           TEXT NOT NULL,
  "dayOfWeek"           INTEGER NOT NULL,
  "startTime"           TEXT NOT NULL,
  "endTime"             TEXT NOT NULL,
  "slotDurationMinutes" INTEGER NOT NULL DEFAULT 30,
  "active"              BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "WorkingSchedule_pkey" PRIMARY KEY ("id")
);

-- ---------- Unique indexes ----------
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Dentist_email_key" ON "Dentist"("email");

-- ---------- Secondary indexes ----------
CREATE INDEX IF NOT EXISTS "Patient_phone_idx" ON "Patient"("phone");
CREATE INDEX IF NOT EXISTS "Patient_fullName_idx" ON "Patient"("fullName");
CREATE INDEX IF NOT EXISTS "Intervention_patientId_idx" ON "Intervention"("patientId");
CREATE INDEX IF NOT EXISTS "Appointment_dentistId_startTime_idx" ON "Appointment"("dentistId", "startTime");
CREATE INDEX IF NOT EXISTS "RecallReminder_dueDate_idx" ON "RecallReminder"("dueDate");
CREATE INDEX IF NOT EXISTS "WorkingSchedule_dentistId_idx" ON "WorkingSchedule"("dentistId");

-- ---------- Foreign keys (added only if missing) ----------
DO $$ BEGIN
  ALTER TABLE "Patient" ADD CONSTRAINT "Patient_assignedDentistId_fkey"
    FOREIGN KEY ("assignedDentistId") REFERENCES "Dentist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_dentistId_fkey"
    FOREIGN KEY ("dentistId") REFERENCES "Dentist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_dentistId_fkey"
    FOREIGN KEY ("dentistId") REFERENCES "Dentist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "RecallReminder" ADD CONSTRAINT "RecallReminder_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_reminderId_fkey"
    FOREIGN KEY ("reminderId") REFERENCES "RecallReminder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "WorkingSchedule" ADD CONSTRAINT "WorkingSchedule_dentistId_fkey"
    FOREIGN KEY ("dentistId") REFERENCES "Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- Seed / demo data (idempotent via ON CONFLICT). No real patient data.
-- bcrypt hash below = "parola123".
-- ============================================================================

-- Users
INSERT INTO "User" ("id","name","email","passwordHash","role","createdAt","updatedAt") VALUES
  ('seed-user-admin','Admin Cabinet','admin@cabinet.ro','$2b$10$TrTp0BDvTDgiQsnd1rdnjuk6tHYtsh6iMdC0fJrp/YMK7ffCu9Y8e','ADMIN', now(), now()),
  ('seed-user-staff','Recepție','staff@cabinet.ro','$2b$10$TrTp0BDvTDgiQsnd1rdnjuk6tHYtsh6iMdC0fJrp/YMK7ffCu9Y8e','STAFF', now(), now())
ON CONFLICT ("email") DO NOTHING;

-- Dentists
INSERT INTO "Dentist" ("id","name","email","color","active","createdAt","updatedAt") VALUES
  ('seed-dentist-ruxi','Ruxi','ruxi@cabinet.ro','#005dac', true, now(), now()),
  ('seed-dentist-colega','Colega','colega@cabinet.ro','#006e1c', true, now(), now())
ON CONFLICT ("email") DO NOTHING;

-- Working schedules: Ruxi Mon(1)-Wed(3), Colega Thu(4)-Sat(6), 09:00-17:00, 30 min
INSERT INTO "WorkingSchedule" ("id","dentistId","dayOfWeek","startTime","endTime","slotDurationMinutes","active") VALUES
  ('seed-ws-ruxi-1','seed-dentist-ruxi',1,'09:00','17:00',30,true),
  ('seed-ws-ruxi-2','seed-dentist-ruxi',2,'09:00','17:00',30,true),
  ('seed-ws-ruxi-3','seed-dentist-ruxi',3,'09:00','17:00',30,true),
  ('seed-ws-colega-4','seed-dentist-colega',4,'09:00','17:00',30,true),
  ('seed-ws-colega-5','seed-dentist-colega',5,'09:00','17:00',30,true),
  ('seed-ws-colega-6','seed-dentist-colega',6,'09:00','17:00',30,true)
ON CONFLICT ("id") DO NOTHING;

-- Patients (fake demo data)
INSERT INTO "Patient" ("id","fullName","phone","email","dateOfBirth","assignedDentistId","medicalNotes","allergies","createdAt","updatedAt") VALUES
  ('seed-patient-maria','Ionescu Maria','+40722123456','maria@example.ro', TIMESTAMP '1988-04-12', 'seed-dentist-ruxi','Pacient anxios, preferă programări dimineața.','Penicilină', now(), now()),
  ('seed-patient-andrei','Popescu Andrei','+40733654321','andrei@example.ro', TIMESTAMP '1995-09-30', 'seed-dentist-ruxi', NULL, NULL, now(), now()),
  ('seed-patient-elena','Dumitrescu Elena','+40744111222','elena@example.ro', TIMESTAMP '1979-01-22', 'seed-dentist-colega', NULL, 'Latex', now(), now()),
  ('seed-patient-vlad','Georgescu Vlad','+40755333444', NULL, TIMESTAMP '2001-07-08', 'seed-dentist-colega', NULL, NULL, now(), now())
ON CONFLICT ("id") DO NOTHING;

-- Interventions
INSERT INTO "Intervention" ("id","patientId","dentistId","date","type","teethOrArea","notes","estimatedCost","createdAt","updatedAt") VALUES
  ('seed-int-1','seed-patient-maria','seed-dentist-ruxi', date_trunc('day', now()) - interval '180 days' + interval '10 hours', 'CONTROL','General','Control de rutină.', 150, now(), now()),
  ('seed-int-2','seed-patient-maria','seed-dentist-ruxi', date_trunc('day', now()) - interval '60 days' + interval '11 hours', 'PLOMBA','16','Carie ocluzală.', 350, now(), now()),
  ('seed-int-3','seed-patient-andrei','seed-dentist-ruxi', date_trunc('day', now()) - interval '30 days' + interval '9 hours 30 minutes', 'DETARTRAJ','General', NULL, 200, now(), now()),
  ('seed-int-4','seed-patient-elena','seed-dentist-colega', date_trunc('day', now()) - interval '90 days' + interval '14 hours', 'EXTRACTIE','38','Molar de minte.', 500, now(), now())
ON CONFLICT ("id") DO NOTHING;

-- Appointments
INSERT INTO "Appointment" ("id","patientId","dentistId","startTime","endTime","status","procedureType","notes","createdAt","updatedAt") VALUES
  ('seed-appt-1','seed-patient-maria','seed-dentist-ruxi', date_trunc('day', now()) + interval '10 hours', date_trunc('day', now()) + interval '10 hours 30 minutes', 'CONFIRMED','Control', NULL, now(), now()),
  ('seed-appt-2','seed-patient-andrei','seed-dentist-ruxi', date_trunc('day', now()) + interval '11 hours', date_trunc('day', now()) + interval '11 hours 30 minutes', 'SCHEDULED','Detartraj', NULL, now(), now()),
  ('seed-appt-3','seed-patient-elena','seed-dentist-colega', date_trunc('day', now()) + interval '2 days' + interval '9 hours 30 minutes', date_trunc('day', now()) + interval '2 days' + interval '10 hours', 'SCHEDULED','Control', NULL, now(), now()),
  ('seed-appt-4','seed-patient-vlad','seed-dentist-colega', date_trunc('day', now()) + interval '3 days' + interval '15 hours', date_trunc('day', now()) + interval '3 days' + interval '15 hours 30 minutes', 'CONFIRMED','Plombă', NULL, now(), now())
ON CONFLICT ("id") DO NOTHING;

-- Recall reminders
INSERT INTO "RecallReminder" ("id","patientId","dueDate","status","lastSentAt","createdAt","updatedAt") VALUES
  ('seed-rem-1','seed-patient-maria', now(), 'PENDING', NULL, now(), now()),
  ('seed-rem-2','seed-patient-andrei', now() + interval '5 months', 'PENDING', NULL, now(), now()),
  ('seed-rem-3','seed-patient-elena', date_trunc('day', now()) - interval '5 days' + interval '9 hours', 'SENT', date_trunc('day', now()) - interval '5 days' + interval '9 hours', now(), now())
ON CONFLICT ("id") DO NOTHING;

COMMIT;
