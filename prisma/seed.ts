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
  console.log("🌱 Seeding...");

  // Clean (dev only)
  await prisma.reminderLog.deleteMany();
  await prisma.recallReminder.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.workingSchedule.deleteMany();
  await prisma.dentist.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const passwordHash = await bcrypt.hash("parola123", 10);
  const admin = await prisma.user.create({
    data: { name: "Admin Cabinet", email: "admin@cabinet.ro", passwordHash, role: "ADMIN" },
  });
  await prisma.user.create({
    data: { name: "Recepție", email: "staff@cabinet.ro", passwordHash, role: "STAFF" },
  });

  // Dentists
  const ruxi = await prisma.dentist.create({
    data: { name: "Ruxi", email: "ruxi@cabinet.ro", color: "#005dac", active: true },
  });
  const colega = await prisma.dentist.create({
    data: { name: "Colega", email: "colega@cabinet.ro", color: "#006e1c", active: true },
  });

  // Working schedules. Ruxi: Mon(1) Tue(2) Wed(3). Colega: Thu(4) Fri(5) Sat(6).
  const mk = (dentistId: string, dayOfWeek: number) => ({
    dentistId, dayOfWeek, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30, active: true,
  });
  await prisma.workingSchedule.createMany({
    data: [
      mk(ruxi.id, 1), mk(ruxi.id, 2), mk(ruxi.id, 3),
      mk(colega.id, 4), mk(colega.id, 5), mk(colega.id, 6),
    ],
  });

  // Patients
  const maria = await prisma.patient.create({
    data: {
      fullName: "Ionescu Maria", phone: "+40722123456", email: "maria@example.ro",
      dateOfBirth: new Date("1988-04-12"), assignedDentistId: ruxi.id,
      medicalNotes: "Pacient anxios, preferă programări dimineața.", allergies: "Penicilină",
    },
  });
  const andrei = await prisma.patient.create({
    data: {
      fullName: "Popescu Andrei", phone: "+40733654321", email: "andrei@example.ro",
      dateOfBirth: new Date("1995-09-30"), assignedDentistId: ruxi.id,
    },
  });
  const elena = await prisma.patient.create({
    data: {
      fullName: "Dumitrescu Elena", phone: "+40744111222", email: "elena@example.ro",
      dateOfBirth: new Date("1979-01-22"), assignedDentistId: colega.id,
      allergies: "Latex",
    },
  });
  const vlad = await prisma.patient.create({
    data: {
      fullName: "Georgescu Vlad", phone: "+40755333444",
      dateOfBirth: new Date("2001-07-08"), assignedDentistId: colega.id,
    },
  });

  // Interventions
  await prisma.intervention.createMany({
    data: [
      { patientId: maria.id, dentistId: ruxi.id, date: at(-180, 10), type: "CONTROL", teethOrArea: "General", notes: "Control de rutină.", estimatedCost: 150 },
      { patientId: maria.id, dentistId: ruxi.id, date: at(-60, 11), type: "PLOMBA", teethOrArea: "16", notes: "Carie ocluzală.", estimatedCost: 350 },
      { patientId: andrei.id, dentistId: ruxi.id, date: at(-30, 9, 30), type: "DETARTRAJ", teethOrArea: "General", estimatedCost: 200 },
      { patientId: elena.id, dentistId: colega.id, date: at(-90, 14), type: "EXTRACTIE", teethOrArea: "38", notes: "Molar de minte.", estimatedCost: 500 },
    ],
  });

  // Appointments (upcoming + today)
  await prisma.appointment.createMany({
    data: [
      { patientId: maria.id, dentistId: ruxi.id, startTime: at(0, 10), endTime: at(0, 10, 30), status: "CONFIRMED", procedureType: "Control" },
      { patientId: andrei.id, dentistId: ruxi.id, startTime: at(0, 11), endTime: at(0, 11, 30), status: "SCHEDULED", procedureType: "Detartraj" },
      { patientId: elena.id, dentistId: colega.id, startTime: at(2, 9, 30), endTime: at(2, 10), status: "SCHEDULED", procedureType: "Control" },
      { patientId: vlad.id, dentistId: colega.id, startTime: at(3, 15), endTime: at(3, 15, 30), status: "CONFIRMED", procedureType: "Plombă" },
    ],
  });

  // Recall reminders
  await prisma.recallReminder.createMany({
    data: [
      { patientId: maria.id, dueDate: monthsFromNow(0), status: "PENDING" },
      { patientId: andrei.id, dueDate: monthsFromNow(5), status: "PENDING" },
      { patientId: elena.id, dueDate: at(-5, 9), status: "SENT", lastSentAt: at(-5, 9) },
    ],
  });

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
