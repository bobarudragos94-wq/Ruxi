import { prisma } from "./prisma";
import { RECALL_MONTHS } from "./recall";

/** Don't nag: a patient reminded within this window is hidden from the due list. */
const SUPPRESS_DAYS = 30;
/** Safety TTL so the cache also refreshes naturally (e.g. once an hour / new day). */
const TTL_MS = 60 * 60 * 1000;

export interface RecallCandidate {
  patientId: string;
  fullName: string;
  email: string | null;
  dentistName: string;
  lastVisit: string; // ISO
  dueSince: string; // ISO (lastVisit + 6 months)
  lastSentAt: string | null;
}

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Recall = retention. A patient is "due" when:
 *   - their last visit (appointment or intervention) was >= 6 months ago, AND
 *   - they have no upcoming (future, non-cancelled) appointment, AND
 *   - they weren't reminded in the last 30 days.
 * One entry PER PATIENT — never multiple just because they had several visits.
 */
async function computeRecallCandidates(): Promise<RecallCandidate[]> {
  const now = new Date();
  const cutoff = monthsAgo(RECALL_MONTHS);
  const suppressSince = new Date(now.getTime() - SUPPRESS_DAYS * 86_400_000);

  const patients = await prisma.patient.findMany({
    include: {
      assignedDentist: true,
      appointments: { where: { status: { not: "CANCELLED" } }, select: { startTime: true } },
      interventions: { select: { date: true }, orderBy: { date: "desc" }, take: 1 },
      reminderLogs: { where: { status: "SENT" }, select: { sentAt: true }, orderBy: { sentAt: "desc" }, take: 1 },
    },
  });

  const candidates: RecallCandidate[] = [];

  for (const p of patients) {
    const hasFuture = p.appointments.some((a) => a.startTime > now);
    if (hasFuture) continue; // already coming in — no need to recall

    const pastAppts = p.appointments.filter((a) => a.startTime <= now).map((a) => a.startTime);
    const lastAppt = pastAppts.length ? new Date(Math.max(...pastAppts.map((d) => d.getTime()))) : null;
    const lastIntervention = p.interventions[0]?.date ?? null;

    let lastVisit: Date | null = null;
    if (lastAppt && lastIntervention) lastVisit = lastAppt > lastIntervention ? lastAppt : lastIntervention;
    else lastVisit = lastAppt ?? lastIntervention;

    if (!lastVisit) continue; // never visited — not a retention case
    if (lastVisit > cutoff) continue; // visited within 6 months — not due yet

    const lastSentAt = p.reminderLogs[0]?.sentAt ?? null;
    if (lastSentAt && lastSentAt > suppressSince) continue; // reminded recently

    candidates.push({
      patientId: p.id,
      fullName: p.fullName,
      email: p.email,
      dentistName: p.assignedDentist?.name ?? "Fără medic",
      lastVisit: lastVisit.toISOString(),
      dueSince: addMonths(lastVisit, RECALL_MONTHS).toISOString(),
      lastSentAt: lastSentAt ? lastSentAt.toISOString() : null,
    });
  }

  candidates.sort((a, b) => new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime());
  return candidates;
}

// --- Simple in-process cache: compute once, reuse until TTL, day change, or invalidation ---
let cache: { value: RecallCandidate[]; at: number; day: string } | null = null;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getRecallCandidates(): Promise<RecallCandidate[]> {
  const now = Date.now();
  if (cache && cache.day === today() && now - cache.at < TTL_MS) {
    return cache.value;
  }
  const value = await computeRecallCandidates();
  cache = { value, at: now, day: today() };
  return value;
}

/** Call after anything that affects recall eligibility (booking, intervention, reminder sent). */
export function invalidateRecall(): void {
  cache = null;
}
