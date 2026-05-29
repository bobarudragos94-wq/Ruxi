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
  const due = reminders.filter((r) => ["PENDING", "SENT"].includes(r.status));
  const done = reminders.filter((r) => !["PENDING", "SENT"].includes(r.status));

  return (
    <div className="space-y-5">
      <PageHeader title="Remindere recall" subtitle="Pacienți de rechemat pentru control la 6 luni" />

      <Card className="overflow-hidden">
        <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Icon name="notifications_active" className="text-primary" /> De trimis
          </h2>
          <Badge tone="warning">{due.length}</Badge>
        </div>
        {due.length === 0 ? (
          <EmptyState icon="check_circle" title="Totul la zi" hint="Niciun pacient de rechemat." />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {due.map((r) => {
              const overdue = new Date(r.dueDate) < now;
              return (
                <ReminderRow
                  key={r.id}
                  id={r.id}
                  patientId={r.patientId}
                  patientName={r.patient.fullName}
                  dentistName={r.patient.assignedDentist?.name || "—"}
                  dueDate={formatDateRo(r.dueDate)}
                  status={r.status}
                  overdue={overdue}
                  hasEmail={!!r.patient.email}
                />
              );
            })}
          </ul>
        )}
      </Card>

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
