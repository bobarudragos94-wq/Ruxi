"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { generateSlotsForDay } from "@/lib/slots";
import { invalidateRecall } from "@/lib/recall-query";

const schema = z.object({
  patientId: z.string().min(1, "Selectați pacientul"),
  dentistId: z.string().min(1),
  startTime: z.string().min(1),
  procedureType: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type AppointmentFormState = { error?: string; ok?: boolean };

/** Internal staff creates an appointment from the calendar. */
export async function createAppointment(
  _prev: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  const user = await requireUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Date invalide" };

  const start = new Date(parsed.data.startTime);
  if (isNaN(start.getTime())) return { error: "Interval invalid" };

  // Rule: no appointments in the past.
  if (start < new Date()) return { error: "Nu se pot crea programări în trecut" };

  // Determine slot end from the dentist's schedule.
  const slots = await generateSlotsForDay(parsed.data.dentistId, start);
  const slot = slots.find((s) => s.start.getTime() === start.getTime());
  const end = slot ? slot.end : new Date(start.getTime() + 30 * 60_000);

  // Guard against double-booking.
  const clash = await prisma.appointment.findFirst({
    where: {
      dentistId: parsed.data.dentistId,
      status: { not: "CANCELLED" },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });
  if (clash) return { error: "Intervalul este deja ocupat" };

  const appt = await prisma.appointment.create({
    data: {
      patientId: parsed.data.patientId,
      dentistId: parsed.data.dentistId,
      startTime: start,
      endTime: end,
      status: "SCHEDULED",
      procedureType: parsed.data.procedureType || null,
      notes: parsed.data.notes || null,
    },
  });

  // A booked future appointment removes the patient from the recall list.
  invalidateRecall();

  await logAudit({ userId: user.id, action: "CREATE", entityType: "Appointment", entityId: appt.id });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function cancelAppointment(id: string): Promise<void> {
  const user = await requireUser();
  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  await logAudit({ userId: user.id, action: "CANCEL", entityType: "Appointment", entityId: id });
  // Cancelling may make the patient recall-eligible again.
  invalidateRecall();
  revalidatePath("/calendar");
}
