import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

/** Basic audit logging helper. Records sensitive actions on patient/medical data. */
export async function logAudit(params: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        metadata: params.metadata,
      },
    });
  } catch (e) {
    // Audit logging must never break the main flow.
    console.error("Audit log failed:", e);
  }
}
