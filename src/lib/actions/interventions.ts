"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { computeRecallDueDate, triggersRecall } from "@/lib/recall";
import { InterventionType } from "@prisma/client";

const schema = z.object({
  dentistId: z.string().min(1, "Selectați medicul"),
  date: z.string().min(1, "Data este obligatorie"),
  type: z.nativeEnum(InterventionType),
  teethOrArea: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  estimatedCost: z.string().optional().or(z.literal("")),
});

export type InterventionFormState = { error?: string; fieldErrors?: Record<string, string> };

export async function createIntervention(
  patientId: string,
  _prev: InterventionFormState,
  formData: FormData
): Promise<InterventionFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
    return { fieldErrors };
  }

  const date = new Date(parsed.data.date);
  const cost = parsed.data.estimatedCost ? parseFloat(parsed.data.estimatedCost) : null;

  const intervention = await prisma.intervention.create({
    data: {
      patientId,
      dentistId: parsed.data.dentistId,
      date,
      type: parsed.data.type,
      teethOrArea: parsed.data.teethOrArea || null,
      notes: parsed.data.notes || null,
      estimatedCost: cost,
    },
  });

  await logAudit({
    userId: user.id,
    action: "CREATE",
    entityType: "Intervention",
    entityId: intervention.id,
    metadata: { patientId, type: parsed.data.type },
  });

  // After Control or Detartraj, (re)schedule the 6-month recall.
  if (triggersRecall(parsed.data.type)) {
    const dueDate = computeRecallDueDate(date);
    const existing = await prisma.recallReminder.findFirst({
      where: { patientId, status: { in: ["PENDING", "SENT"] } },
      orderBy: { createdAt: "desc" },
    });
    if (existing) {
      await prisma.recallReminder.update({
        where: { id: existing.id },
        data: { dueDate, status: "PENDING" },
      });
    } else {
      await prisma.recallReminder.create({ data: { patientId, dueDate, status: "PENDING" } });
    }
  }

  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}?tab=interventions`);
}
