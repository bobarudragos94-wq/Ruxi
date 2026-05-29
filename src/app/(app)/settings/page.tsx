import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { DAY_LABELS } from "@/lib/constants";
import { buildRecallEmail } from "@/lib/email";

export default async function SettingsPage() {
  const dentists = await prisma.dentist.findMany({
    include: { workingSchedules: { orderBy: { dayOfWeek: "asc" } } },
    orderBy: { name: "asc" },
  });

  const { subject, body } = buildRecallEmail("{{bookingLink}}");

  return (
    <div className="space-y-5">
      <PageHeader title="Setări" subtitle="Medici, program de lucru și șabloane email" />

      {/* Dentists & schedule */}
      <Card className="p-5">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Icon name="groups" className="text-primary" /> Medici și program
        </h2>
        <div className="space-y-4">
          {dentists.map((d) => (
            <div key={d.id} className="border border-outline-variant rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <p className="font-semibold">{d.name}</p>
                <Badge tone={d.active ? "success" : "neutral"}>{d.active ? "Activ" : "Inactiv"}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {d.workingSchedules.length === 0 ? (
                  <span className="text-sm text-on-surface-variant">Fără program definit</span>
                ) : (
                  d.workingSchedules.map((s) => (
                    <span
                      key={s.id}
                      className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant"
                    >
                      {DAY_LABELS[s.dayOfWeek]} · {s.startTime}–{s.endTime} · {s.slotDurationMinutes}min
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant mt-4">
          Notă: editarea programului se face momentan din seed/baza de date. Structura suportă extinderea cu un formular.
        </p>
      </Card>

      {/* Email template */}
      <Card className="p-5">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Icon name="mail" className="text-primary" /> Șablon email recall
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Subiect</p>
            <div className="bg-surface-container-low rounded-lg px-4 py-2.5 text-sm">{subject}</div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Conținut</p>
            <pre className="bg-surface-container-low rounded-lg px-4 py-3 text-sm whitespace-pre-wrap font-sans">{body}</pre>
          </div>
        </div>
      </Card>

      {/* Email provider */}
      <Card className="p-5">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-2">
          <Icon name="outgoing_mail" className="text-primary" /> Furnizor email
        </h2>
        <p className="text-sm text-on-surface-variant">
          Mod curent: <Badge tone="warning">Mock (dezvoltare)</Badge>. Emailurile sunt înregistrate în consolă.
          Pentru producție, integrează Resend prin <code className="text-xs">EMAIL_PROVIDER=resend</code>.
        </p>
      </Card>
    </div>
  );
}
