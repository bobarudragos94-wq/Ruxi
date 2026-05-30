import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Tabs } from "@/components/Tabs";
import { DAY_LABELS } from "@/lib/constants";
import { buildRecallEmail } from "@/lib/email";

export default async function SettingsPage() {
  const dentists = await prisma.dentist.findMany({
    include: { workingSchedules: { orderBy: { dayOfWeek: "asc" } } },
    orderBy: { name: "asc" },
  });

  const { subject, body } = buildRecallEmail("{{bookingLink}}");

  const dentistsSection = (
    <div className="space-y-4">
      {dentists.map((d) => (
        <Card key={d.id} className="p-4">
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
                <span key={s.id} className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant">
                  {DAY_LABELS[s.dayOfWeek]} · {s.startTime}–{s.endTime} · {s.slotDurationMinutes}min
                </span>
              ))
            )}
          </div>
        </Card>
      ))}
      <p className="text-xs text-on-surface-variant">
        Notă: editarea programului se face momentan din baza de date. Structura suportă extinderea cu un formular.
      </p>
    </div>
  );

  const emailSection = (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="mail" className="text-primary" /> Șablon email recall
        </h3>
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
      <Card className="p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Icon name="outgoing_mail" className="text-primary" /> Furnizor email
        </h3>
        <p className="text-sm text-on-surface-variant">
          Mod curent: <Badge tone="warning">Mock (dezvoltare)</Badge>. Emailurile sunt înregistrate în consolă.
          Pentru producție, integrează Resend prin <code className="text-xs">EMAIL_PROVIDER=resend</code>.
        </p>
      </Card>
    </div>
  );

  const accountSection = (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Icon name="account_circle" className="text-primary" /> Cont și securitate
        </h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Schimbă parola și gestionează contul tău din pagina dedicată.
        </p>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-all"
        >
          <Icon name="manage_accounts" className="!text-xl" /> Mergi la contul meu
        </Link>
      </Card>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Setări" subtitle="Configurarea cabinetului" />
      <Tabs
        items={[
          { id: "dentists", label: "Medici & program", icon: "groups", content: dentistsSection },
          { id: "email", label: "Email", icon: "mail", content: emailSection },
          { id: "account", label: "Cont", icon: "manage_accounts", content: accountSection },
        ]}
      />
    </div>
  );
}
