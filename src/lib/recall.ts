import { InterventionType } from "@/generated/prisma";

export const RECALL_MONTHS = 6;

/** Computes the next recall due date, default 6 months after the given date. */
export function computeRecallDueDate(from: Date = new Date(), months = RECALL_MONTHS): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Interventions that should (re)schedule a 6-month recall. */
export function triggersRecall(type: InterventionType): boolean {
  return type === "CONTROL" || type === "DETARTRAJ";
}
