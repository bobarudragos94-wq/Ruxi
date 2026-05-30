"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getEmailProvider, buildRecallEmail } from "@/lib/email";
import { invalidateRecall } from "@/lib/recall-query";

export type ReminderActionState = { ok?: boolean; error?: string };

/**
 * Sends (mock) a recall email to a patient and logs it. Recall eligibility is
 * derived from visit history, so we work by patientId (no RecallReminder row
 * required). The ReminderLog row records the send and suppresses re-nagging.
 */
export async function sendReminder(patientId: string): Promise<ReminderActionState> {
  const user = await requireUser();

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { error: "Pacient inexistent" };
  if (!patient.email) return { error: "Pacientul nu are email" };

  const bookingLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/book`;
  const { subject, body } = buildRecallEmail(bookingLink);

  const provider = getEmailProvider();
  const result = await provider.send({ to: patient.email, subject, body });

  await prisma.reminderLog.create({
    data: {
      patientId: patient.id,
      emailTo: patient.email,
      status: result.ok ? "SENT" : "FAILED",
      providerMessageId: result.providerMessageId,
      errorMessage: result.error,
    },
  });

  await logAudit({
    userId: user.id,
    action: "SEND_REMINDER",
    entityType: "Patient",
    entityId: patient.id,
    metadata: { to: patient.email, ok: result.ok },
  });

  if (result.ok) invalidateRecall(); // patient drops off the due list
  return result.ok ? { ok: true } : { error: result.error || "Trimitere eșuată" };
}
