import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ReminderRow } from "@/components/ReminderRow";
import { formatDateRo } from "@/lib/date";

export default async function RemindersPage() {
  const reminders = await prisma.recallReminder.findMany({
    include: { patient: { include: { assignedDentist: true } } },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const open = reminders.filter((r) => r.status === "PENDING" || r.status === "SENT");

  // Due now = recall date already reached (6 months passed since last visit).
  const dueNow = open.filter((r) => new Date(r.dueDate) <= now);
  // Upcoming = recall scheduled but not yet due (the booking pipeline).
  const upcoming = open.filter((r) => new Date(r.dueDate) > now);
  // Done = confirmed / booked / cancelled.
  const done = reminders.filter((r) => !["PENDING", "SENT"].includes(r.status));

  return (
    <div className="space-y-5">
      <PageHeader title="Remindere recall" subtitle="Pacienți de rechemat pentru control la 6 luni" />

      {/* Due now */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Icon name="notifications_active" className="text-primary" /> De rechemat acum
          </h2>
          <Badge tone="warning">{dueNow.length}</Badge>
        </div>
        {dueNow.length === 0 ? (
          <EmptyState icon="check_circle" title="Totul la zi" hint="Niciun pacient scadent momentan." />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {dueNow.map((r) => (
              <ReminderRow
                key={r.id}
                id={r.id}
                patientId={r.patientId}
                patientName={r.patient.fullName}
                dentistName={r.patient.assignedDentist?.name || "—"}
                dueDate={formatDateRo(r.dueDate)}
                status={r.status}
                overdue={new Date(r.dueDate) < now}
                hasEmail={!!r.patient.email}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Icon name="event_upcoming" className="text-on-surface-variant" /> Programate (viitoare)
            </h2>
            <Badge tone="neutral">{upcoming.length}</Badge>
          </div>
          <ul className="divide-y divide-outline-variant">
            {upcoming.map((r) => (
              <li key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.patient.fullName}</p>
                  <p className="text-xs text-on-surface-variant">
                    {r.patient.assignedDentist?.name || "—"} · scadent {formatDateRo(r.dueDate)}
                  </p>
                </div>
                <Badge tone="neutral">În {monthsUntil(now, r.dueDate)}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Processed */}
      {done.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant">
            <h2 className="font-semibold">Procesate</h2>
          </div>
          <ul className="divide-y divide-outline-variant">
            {done.map((r) => (
              <li key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.patient.fullName}</p>
                  <p className="text-xs text-on-surface-variant">Scadent {formatDateRo(r.dueDate)}</p>
                </div>
                <Badge tone="success">{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/** Rough "in N months/days" label for upcoming recalls. */
function monthsUntil(from: Date, to: Date | string): string {
  const days = Math.round((new Date(to).getTime() - from.getTime()) / 86_400_000);
  if (days < 31) return `${days} zile`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "lună" : "luni"}`;
}
