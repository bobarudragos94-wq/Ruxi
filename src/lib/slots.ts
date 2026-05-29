import { prisma } from "./prisma";

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string; // "HH:MM"
}

function parseHHMM(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Generates all slots for a dentist on a given day, respecting the working schedule. */
export async function generateSlotsForDay(dentistId: string, day: Date): Promise<TimeSlot[]> {
  const dayOfWeek = day.getDay(); // 0=Sunday
  const schedule = await prisma.workingSchedule.findFirst({
    where: { dentistId, dayOfWeek, active: true },
  });
  if (!schedule) return [];

  const slots: TimeSlot[] = [];
  const dayStart = parseHHMM(day, schedule.startTime);
  const dayEnd = parseHHMM(day, schedule.endTime);
  const duration = schedule.slotDurationMinutes;

  let cursor = new Date(dayStart);
  while (cursor < dayEnd) {
    const end = new Date(cursor.getTime() + duration * 60_000);
    if (end > dayEnd) break;
    const hh = String(cursor.getHours()).padStart(2, "0");
    const mm = String(cursor.getMinutes()).padStart(2, "0");
    slots.push({ start: new Date(cursor), end, label: `${hh}:${mm}` });
    cursor = end;
  }
  return slots;
}

/** Returns only the slots that are not already booked (excludes cancelled appointments). */
export async function getAvailableSlots(dentistId: string, day: Date): Promise<TimeSlot[]> {
  const slots = await generateSlotsForDay(dentistId, day);
  if (slots.length === 0) return [];

  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      dentistId,
      startTime: { gte: dayStart, lte: dayEnd },
      status: { not: "CANCELLED" },
    },
    select: { startTime: true, endTime: true },
  });

  const now = new Date();
  return slots.filter((slot) => {
    if (slot.start < now) return false; // no past slots
    const overlaps = appointments.some(
      (a) => slot.start < a.endTime && slot.end > a.startTime
    );
    return !overlaps;
  });
}

/** Returns slots with a booked flag, for the internal calendar view. */
export async function getSlotsWithStatus(
  dentistId: string,
  day: Date
): Promise<(TimeSlot & { booked: boolean; appointmentId?: string; patientName?: string })[]> {
  const slots = await generateSlotsForDay(dentistId, day);
  if (slots.length === 0) return [];

  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      dentistId,
      startTime: { gte: dayStart, lte: dayEnd },
      status: { not: "CANCELLED" },
    },
    include: { patient: { select: { fullName: true } } },
  });

  return slots.map((slot) => {
    const appt = appointments.find(
      (a) => slot.start < a.endTime && slot.end > a.startTime
    );
    return {
      ...slot,
      booked: !!appt,
      appointmentId: appt?.id,
      patientName: appt?.patient.fullName,
    };
  });
}
