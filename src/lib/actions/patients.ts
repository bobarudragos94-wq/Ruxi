"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { normalizePhone } from "@/lib/phone";

const patientSchema = z.object({
  fullName: z.string().min(2, "Numele este obligatoriu"),
  phone: z.string().min(6, "Telefon invalid"),
  email: z.string().email("Email invalid").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  assignedDentistId: z.string().optional().or(z.literal("")),
  medicalNotes: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
});

export type PatientFormState = { error?: string; fieldErrors?: Record<string, string> };

export async function createPatient(_prev: PatientFormState, formData: FormData): Promise<PatientFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = patientSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
    return { fieldErrors };
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return { fieldErrors: { phone: "Număr de telefon invalid (ex: 0722 123 456)" } };

  const patient = await prisma.patient.create({
    data: {
      fullName: parsed.data.fullName,
      phone,
      email: parsed.data.email || null,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      assignedDentistId: parsed.data.assignedDentistId || null,
      medicalNotes: parsed.data.medicalNotes || null,
      allergies: parsed.data.allergies || null,
    },
  });

  await logAudit({ userId: user.id, action: "CREATE", entityType: "Patient", entityId: patient.id });
  revalidatePath("/patients");
  redirect(`/patients/${patient.id}`);
}

export async function updatePatient(id: string, _prev: PatientFormState, formData: FormData): Promise<PatientFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = patientSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
    return { fieldErrors };
  }
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return { fieldErrors: { phone: "Număr de telefon invalid" } };

  await prisma.patient.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      phone,
      email: parsed.data.email || null,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      assignedDentistId: parsed.data.assignedDentistId || null,
      medicalNotes: parsed.data.medicalNotes || null,
      allergies: parsed.data.allergies || null,
    },
  });
  await logAudit({ userId: user.id, action: "UPDATE", entityType: "Patient", entityId: id });
  revalidatePath(`/patients/${id}`);
  redirect(`/patients/${id}`);
}
