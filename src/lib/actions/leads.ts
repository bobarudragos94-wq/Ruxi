"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

/** Marks an online-registered new patient as reviewed (clears the dashboard alert). */
export async function dismissNewPatient(patientId: string): Promise<{ ok: boolean }> {
  const user = await requireUser();
  await prisma.patient.update({ where: { id: patientId }, data: { isNew: false } });
  await logAudit({ userId: user.id, action: "REVIEW_NEW_PATIENT", entityType: "Patient", entityId: patientId });
  revalidatePath("/dashboard");
  return { ok: true };
}
