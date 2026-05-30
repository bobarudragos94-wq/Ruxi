"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { invalidateRecall } from "@/lib/recall-query";
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

  // Recording a visit changes recall eligibility — refresh the cached list.
  invalidateRecall();

  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}?tab=interventions`);
}
