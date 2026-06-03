-- ============================================================================
-- Date dummy pentru testarea meniului „Rechemat"
-- Inserează 10 pacienți cu ultima vizită acum 7-18 luni în urmă.
-- Idempotent — safe to run multiple times (ON CONFLICT DO NOTHING).
-- Lipsesc programări viitoare și reminder-uri recente → toți apar în Rechemat.
-- ============================================================================

BEGIN;

-- ---------- Pacienți dummy ----------
INSERT INTO "Patient" ("id","fullName","phone","email","dateOfBirth","assignedDentistId","medicalNotes","createdAt","updatedAt")
VALUES
  ('recall-p01','Andrei Ionescu','0722 111 001','andrei.ionescu@email.ro', '1985-03-12', 'seed-dentist-ruxi',   NULL, now(), now()),
  ('recall-p02','Maria Popescu', '0733 111 002','maria.popescu@email.ro',  '1990-07-24', 'seed-dentist-ruxi',   NULL, now(), now()),
  ('recall-p03','Bogdan Dumitrescu','0744 111 003','bogdan.d@email.ro',    '1978-11-05', 'seed-dentist-colega', NULL, now(), now()),
  ('recall-p04','Elena Constantin', '0755 111 004','elena.c@email.ro',     '1995-02-18', 'seed-dentist-colega', NULL, now(), now()),
  ('recall-p05','Mihai Gheorghe',   '0766 111 005','mihai.g@email.ro',     '1982-09-30', 'seed-dentist-ruxi',   NULL, now(), now()),
  ('recall-p06','Ioana Stan',       '0777 111 006','ioana.stan@email.ro',  '1998-04-14', 'seed-dentist-ruxi',   NULL, now(), now()),
  ('recall-p07','Cristian Popa',    '0788 111 007',NULL,                   '1975-06-22', 'seed-dentist-colega', NULL, now(), now()),
  ('recall-p08','Alina Munteanu',   '0799 111 008','alina.m@email.ro',     '2000-01-09', 'seed-dentist-colega', NULL, now(), now()),
  ('recall-p09','Radu Florescu',    '0711 111 009','radu.f@email.ro',      '1969-08-17', 'seed-dentist-ruxi',   NULL, now(), now()),
  ('recall-p10','Simona Draghici',  '0722 111 010','simona.d@email.ro',    '1993-12-03', 'seed-dentist-colega', NULL, now(), now())
ON CONFLICT ("id") DO NOTHING;

-- ---------- Programări în trecut (7–18 luni în urmă) — status COMPLETED ----------
-- Toate au startTime/endTime în trecut → nu apar ca „viitoare" → eligibili recall.

INSERT INTO "Appointment" ("id","patientId","dentistId","startTime","endTime","status","procedureType","notes","createdAt","updatedAt")
VALUES
  ('recall-a01','recall-p01','seed-dentist-ruxi',
    now() - INTERVAL '7 months',  now() - INTERVAL '7 months'  + INTERVAL '30 minutes', 'COMPLETED', 'CONTROL',       NULL, now(), now()),
  ('recall-a02','recall-p02','seed-dentist-ruxi',
    now() - INTERVAL '8 months',  now() - INTERVAL '8 months'  + INTERVAL '30 minutes', 'COMPLETED', 'DETARTRAJ',     NULL, now(), now()),
  ('recall-a03','recall-p03','seed-dentist-colega',
    now() - INTERVAL '9 months',  now() - INTERVAL '9 months'  + INTERVAL '30 minutes', 'COMPLETED', 'PLOMBA',        NULL, now(), now()),
  ('recall-a04','recall-p04','seed-dentist-colega',
    now() - INTERVAL '10 months', now() - INTERVAL '10 months' + INTERVAL '30 minutes', 'COMPLETED', 'CONTROL',       NULL, now(), now()),
  ('recall-a05','recall-p05','seed-dentist-ruxi',
    now() - INTERVAL '11 months', now() - INTERVAL '11 months' + INTERVAL '30 minutes', 'COMPLETED', 'EXTRACTIE',     NULL, now(), now()),
  ('recall-a06','recall-p06','seed-dentist-ruxi',
    now() - INTERVAL '12 months', now() - INTERVAL '12 months' + INTERVAL '30 minutes', 'COMPLETED', 'DETARTRAJ',     NULL, now(), now()),
  ('recall-a07','recall-p07','seed-dentist-colega',
    now() - INTERVAL '13 months', now() - INTERVAL '13 months' + INTERVAL '30 minutes', 'COMPLETED', 'TRATAMENT_CANAL',NULL,now(), now()),
  ('recall-a08','recall-p08','seed-dentist-colega',
    now() - INTERVAL '14 months', now() - INTERVAL '14 months' + INTERVAL '30 minutes', 'COMPLETED', 'PLOMBA',        NULL, now(), now()),
  ('recall-a09','recall-p09','seed-dentist-ruxi',
    now() - INTERVAL '16 months', now() - INTERVAL '16 months' + INTERVAL '30 minutes', 'COMPLETED', 'CONTROL',       NULL, now(), now()),
  ('recall-a10','recall-p10','seed-dentist-colega',
    now() - INTERVAL '18 months', now() - INTERVAL '18 months' + INTERVAL '30 minutes', 'COMPLETED', 'DETARTRAJ',     NULL, now(), now())
ON CONFLICT ("id") DO NOTHING;

COMMIT;
