import { prisma } from "./prisma";
import { addDays } from "./date";
import type { WorkingSchedule } from "@prisma/client";

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string; // "HH:MM"
}

export interface SlotWithStatus extends TimeSlot {
  booked: boolean;
  appointmentId?: string;
  patientName?: string;
}

export interface DaySlots<T extends TimeSlot = TimeSlot> {
  date: Date;
  slots: T[];
}

function parseHHMM(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Pure slot generation for a day given its schedule (no DB access). */
function buildSlots(day: Date, schedule: Pick<WorkingSchedule, "startTime" | "endTime" | "slotDurationMinutes">): TimeSlot[] {
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

/** Generates all slots for a dentist on a given day, respecting the working schedule. */
export async function generateSlotsForDay(dentistId: string, day: Date): Promise<TimeSlot[]> {
  const dayOfWeek = day.getDay(); // 0=Sunday
  const schedule = await prisma.workingSchedule.findFirst({
    where: { dentistId, dayOfWeek, active: true },
  });
  if (!schedule) return [];
  return buildSlots(day, schedule);
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
    return !appointments.some((a) => slot.start < a.endTime && slot.end > a.startTime);
  });
}

/**
 * Loads schedules + appointments for a dentist for a whole week in just 2 queries,
 * then computes per-day slots in memory. Avoids per-day round-trips (much faster on
 * serverless where DB latency dominates).
 */
async function loadWeek(dentistId: string, weekStart: Date) {
  const days = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)); // Mon-Sat

  const weekStartDay = new Date(weekStart);
  weekStartDay.setHours(0, 0, 0, 0);
  const weekEnd = addDays(weekStart, 6);
  weekEnd.setHours(23, 59, 59, 999);

  const [schedules, appointments] = await Promise.all([
    prisma.workingSchedule.findMany({ where: { dentistId, active: true } }),
    prisma.appointment.findMany({
      where: { dentistId, startTime: { gte: weekStartDay, lte: weekEnd }, status: { not: "CANCELLED" } },
      include: { patient: { select: { fullName: true } } },
    }),
  ]);

  const byDow = new Map<number, (typeof schedules)[number]>();
  for (const s of schedules) byDow.set(s.dayOfWeek, s);

  return { days, byDow, appointments };
}

/** Weekly slots with booked status, for the internal calendar (2 DB queries total). */
export async function getWeekSlotsWithStatus(
  dentistId: string,
  weekStart: Date
): Promise<DaySlots<SlotWithStatus>[]> {
  const { days, byDow, appointments } = await loadWeek(dentistId, weekStart);

  return days.map((day) => {
    const schedule = byDow.get(day.getDay());
    if (!schedule) return { date: day, slots: [] };
    const slots = buildSlots(day, schedule).map((slot) => {
      const appt = appointments.find((a) => slot.start < a.endTime && slot.end > a.startTime);
      return { ...slot, booked: !!appt, appointmentId: appt?.id, patientName: appt?.patient.fullName };
    });
    return { date: day, slots };
  });
}

/** Weekly available (free, future) slots for the public booking flow (2 DB queries total). */
export async function getWeekAvailableSlots(
  dentistId: string,
  weekStart: Date
): Promise<DaySlots[]> {
  const { days, byDow, appointments } = await loadWeek(dentistId, weekStart);
  const now = new Date();

  return days.map((day) => {
    const schedule = byDow.get(day.getDay());
    if (!schedule) return { date: day, slots: [] };
    const slots = buildSlots(day, schedule).filter((slot) => {
      if (slot.start < now) return false;
      return !appointments.some((a) => slot.start < a.endTime && slot.end > a.startTime);
    });
    return { date: day, slots };
  });
}
