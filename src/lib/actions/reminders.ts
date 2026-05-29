"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getEmailProvider, buildRecallEmail } from "@/lib/email";

export type ReminderActionState = { ok?: boolean; error?: string };

/** Sends (mock) a recall reminder email and logs the result. */
export async function sendReminder(reminderId: string): Promise<ReminderActionState> {
  const user = await requireUser();

  const reminder = await prisma.recallReminder.findUnique({
    where: { id: reminderId },
    include: { patient: true },
  });
  if (!reminder) return { error: "Reminder inexistent" };
  if (!reminder.patient.email) return { error: "Pacientul nu are email" };

  const bookingLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/book`;
  const { subject, body } = buildRecallEmail(bookingLink);

  const provider = getEmailProvider();
  const result = await provider.send({ to: reminder.patient.email, subject, body });

  await prisma.reminderLog.create({
    data: {
      patientId: reminder.patientId,
      reminderId: reminder.id,
      emailTo: reminder.patient.email,
      status: result.ok ? "SENT" : "FAILED",
      providerMessageId: result.providerMessageId,
      errorMessage: result.error,
    },
  });

  if (result.ok) {
    await prisma.recallReminder.update({
      where: { id: reminder.id },
      data: { status: "SENT", lastSentAt: new Date() },
    });
  }

  await logAudit({
    userId: user.id,
    action: "SEND_REMINDER",
    entityType: "RecallReminder",
    entityId: reminder.id,
    metadata: { to: reminder.patient.email, ok: result.ok },
  });

  revalidatePath("/reminders");
  return result.ok ? { ok: true } : { error: result.error || "Trimitere eșuată" };
}
