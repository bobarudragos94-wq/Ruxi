"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, verifyPassword, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Introduceți parola curentă"),
    newPassword: z.string().min(8, "Parola nouă trebuie să aibă minim 8 caractere"),
    confirmPassword: z.string().min(1, "Confirmați parola"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Parolele nu coincid",
    path: ["confirmPassword"],
  });

export type ChangePasswordState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function changePassword(_prev: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const sessionUser = await requireUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
    return { fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return { error: "Utilizator inexistent" };

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return { fieldErrors: { currentPassword: "Parola curentă este incorectă" } };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await logAudit({ userId: user.id, action: "CHANGE_PASSWORD", entityType: "User", entityId: user.id });

  return { ok: true };
}
