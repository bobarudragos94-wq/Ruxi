import { PageHeader, Card, Badge, EmptyState, SectionTitle } from "@/components/ui";
import { ReminderRow } from "@/components/ReminderRow";
import { getRecallCandidates } from "@/lib/recall-query";
import { formatDateRo } from "@/lib/date";

export const dynamic = "force-dynamic";

function monthsSince(iso: string): number {
  const then = new Date(iso);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth()));
}

export default async function RemindersPage() {
  const candidates = await getRecallCandidates();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Remindere recall"
        subtitle="Pacienți care nu au mai venit de 6+ luni și nu au o programare viitoare"
      />

      <Card className="overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-[#fff4e6] to-transparent border-b border-outline-variant">
          <SectionTitle icon="notifications_active" tone="orange" className="" action={<Badge tone="warning">{candidates.length}</Badge>}>
            De rechemat
          </SectionTitle>
        </div>
        {candidates.length === 0 ? (
          <EmptyState
            icon="check_circle"
            title="Totul la zi"
            hint="Niciun pacient nu trebuie rechemat momentan."
          />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {candidates.map((c) => (
              <ReminderRow
                key={c.patientId}
                patientId={c.patientId}
                patientName={c.fullName}
                dentistName={c.dentistName}
                lastVisit={formatDateRo(c.lastVisit)}
                monthsSince={monthsSince(c.lastVisit)}
                hasEmail={!!c.email}
                remindedLabel={c.lastSentAt ? formatDateRo(c.lastSentAt) : null}
              />
            ))}
          </ul>
        )}
      </Card>

      <p className="text-xs text-on-surface-variant px-1">
        Lista se reîmprospătează zilnic și după fiecare modificare (programare, intervenție, reminder trimis).
        Un pacient reamintit în ultimele 30 de zile este ascuns temporar.
      </p>
    </div>
  );
}
