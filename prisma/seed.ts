import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function at(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function monthsFromNow(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

async function main() {
  console.log("🌱 Seeding (idempotent)...");

  // Users — upsert by unique email.
  const passwordHash = await bcrypt.hash("parola123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cabinet.ro" },
    update: { name: "Admin Cabinet", role: "ADMIN" },
    create: { name: "Admin Cabinet", email: "admin@cabinet.ro", passwordHash, role: "ADMIN" },
  });
  await prisma.user.upsert({
    where: { email: "staff@cabinet.ro" },
    update: { name: "Recepție", role: "STAFF" },
    create: { name: "Recepție", email: "staff@cabinet.ro", passwordHash, role: "STAFF" },
  });

  // Dentists — upsert by unique email.
  const ruxi = await prisma.dentist.upsert({
    where: { email: "ruxi@cabinet.ro" },
    update: { name: "Ruxi", color: "#005dac", active: true },
    create: { name: "Ruxi", email: "ruxi@cabinet.ro", color: "#005dac", active: true },
  });
  const colega = await prisma.dentist.upsert({
    where: { email: "colega@cabinet.ro" },
    update: { name: "Colega", color: "#006e1c", active: true },
    create: { name: "Colega", email: "colega@cabinet.ro", color: "#006e1c", active: true },
  });

  // Working schedules. Ruxi: Mon(1) Tue(2) Wed(3). Colega: Thu(4) Fri(5) Sat(6).
  // No natural unique key -> replace this controlled set deterministically.
  const scheduleDentistIds = [ruxi.id, colega.id];
  await prisma.workingSchedule.deleteMany({ where: { dentistId: { in: scheduleDentistIds } } });
  const mk = (dentistId: string, dayOfWeek: number) => ({
    dentistId, dayOfWeek, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30, active: true,
  });
  await prisma.workingSchedule.createMany({
    data: [
      mk(ruxi.id, 1), mk(ruxi.id, 2), mk(ruxi.id, 3),
      mk(colega.id, 4), mk(colega.id, 5), mk(colega.id, 6),
    ],
  });

  // Patients — upsert by deterministic id (phone has no unique constraint).
  const maria = await prisma.patient.upsert({
    where: { id: "seed-patient-maria" },
    update: {},
    create: {
      id: "seed-patient-maria",
      fullName: "Ionescu Maria", phone: "+40722123456", email: "maria@example.ro",
      dateOfBirth: new Date("1988-04-12"), assignedDentistId: ruxi.id,
      medicalNotes: "Pacient anxios, preferă programări dimineața.", allergies: "Penicilină",
    },
  });
  const andrei = await prisma.patient.upsert({
    where: { id: "seed-patient-andrei" },
    update: {},
    create: {
      id: "seed-patient-andrei",
      fullName: "Popescu Andrei", phone: "+40733654321", email: "andrei@example.ro",
      dateOfBirth: new Date("1995-09-30"), assignedDentistId: ruxi.id,
    },
  });
  const elena = await prisma.patient.upsert({
    where: { id: "seed-patient-elena" },
    update: {},
    create: {
      id: "seed-patient-elena",
      fullName: "Dumitrescu Elena", phone: "+40744111222", email: "elena@example.ro",
      dateOfBirth: new Date("1979-01-22"), assignedDentistId: colega.id, allergies: "Latex",
    },
  });
  const vlad = await prisma.patient.upsert({
    where: { id: "seed-patient-vlad" },
    update: {},
    create: {
      id: "seed-patient-vlad",
      fullName: "Georgescu Vlad", phone: "+40755333444",
      dateOfBirth: new Date("2001-07-08"), assignedDentistId: colega.id,
    },
  });

  // Interventions — deterministic ids.
  const interventions = [
    { id: "seed-int-1", patientId: maria.id, dentistId: ruxi.id, date: at(-180, 10), type: "CONTROL" as const, teethOrArea: "General", notes: "Control de rutină.", estimatedCost: 150 },
    { id: "seed-int-2", patientId: maria.id, dentistId: ruxi.id, date: at(-60, 11), type: "PLOMBA" as const, teethOrArea: "16", notes: "Carie ocluzală.", estimatedCost: 350 },
    { id: "seed-int-3", patientId: andrei.id, dentistId: ruxi.id, date: at(-30, 9, 30), type: "DETARTRAJ" as const, teethOrArea: "General", estimatedCost: 200 },
    { id: "seed-int-4", patientId: elena.id, dentistId: colega.id, date: at(-90, 14), type: "EXTRACTIE" as const, teethOrArea: "38", notes: "Molar de minte.", estimatedCost: 500 },
  ];
  for (const i of interventions) {
    await prisma.intervention.upsert({ where: { id: i.id }, update: {}, create: i });
  }

  // Appointments — deterministic ids.
  const appointments = [
    { id: "seed-appt-1", patientId: maria.id, dentistId: ruxi.id, startTime: at(0, 10), endTime: at(0, 10, 30), status: "CONFIRMED" as const, procedureType: "Control" },
    { id: "seed-appt-2", patientId: andrei.id, dentistId: ruxi.id, startTime: at(0, 11), endTime: at(0, 11, 30), status: "SCHEDULED" as const, procedureType: "Detartraj" },
    { id: "seed-appt-3", patientId: elena.id, dentistId: colega.id, startTime: at(2, 9, 30), endTime: at(2, 10), status: "SCHEDULED" as const, procedureType: "Control" },
    { id: "seed-appt-4", patientId: vlad.id, dentistId: colega.id, startTime: at(3, 15), endTime: at(3, 15, 30), status: "CONFIRMED" as const, procedureType: "Plombă" },
  ];
  for (const a of appointments) {
    await prisma.appointment.upsert({ where: { id: a.id }, update: { startTime: a.startTime, endTime: a.endTime }, create: a });
  }

  // Recall reminders — deterministic ids.
  const reminders = [
    { id: "seed-rem-1", patientId: maria.id, dueDate: monthsFromNow(0), status: "PENDING" as const },
    { id: "seed-rem-2", patientId: andrei.id, dueDate: monthsFromNow(5), status: "PENDING" as const },
    { id: "seed-rem-3", patientId: elena.id, dueDate: at(-5, 9), status: "SENT" as const, lastSentAt: at(-5, 9) },
  ];
  for (const r of reminders) {
    await prisma.recallReminder.upsert({ where: { id: r.id }, update: { dueDate: r.dueDate }, create: r });
  }

  await prisma.auditLog.create({
    data: { userId: admin.id, action: "SEED", entityType: "System", metadata: { note: "Demo data seeded" } },
  });

  console.log("✅ Seed complete.");
  console.log("   Login: admin@cabinet.ro / parola123  (ADMIN)");
  console.log("   Login: staff@cabinet.ro / parola123  (STAFF)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
