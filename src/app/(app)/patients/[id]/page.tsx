import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PatientTabs } from "@/components/PatientTabs";
import { formatPhoneDisplay } from "@/lib/phone";
import { formatDateRo, formatDateTimeRo } from "@/lib/date";
import { INTERVENTION_LABELS, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      assignedDentist: true,
      interventions: { include: { dentist: true }, orderBy: { date: "desc" } },
      appointments: { include: { dentist: true }, orderBy: { startTime: "desc" } },
      reminderLogs: { orderBy: { sentAt: "desc" } },
    },
  });
  if (!patient) notFound();

  const now = new Date();
  const pastVisits = [
    patient.interventions[0]?.date,
    ...patient.appointments.filter((a) => a.startTime <= now && a.status !== "CANCELLED").map((a) => a.startTime),
  ].filter(Boolean) as Date[];
  const lastVisit = pastVisits.length ? new Date(Math.max(...pastVisits.map((d) => d.getTime()))) : undefined;
  // Next recall ≈ 6 months after the last visit (derived, not stored).
  const nextRecall = lastVisit
    ? (() => {
        const d = new Date(lastVisit);
        d.setMonth(d.getMonth() + 6);
        return d;
      })()
    : undefined;

  const details = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow icon="call" label="Telefon" value={formatPhoneDisplay(patient.phone)} />
        <InfoRow icon="mail" label="Email" value={patient.email || "—"} />
        <InfoRow icon="cake" label="Data nașterii" value={patient.dateOfBirth ? formatDateRo(patient.dateOfBirth) : "—"} />
        <InfoRow icon="stethoscope" label="Medic asignat" value={patient.assignedDentist?.name || "—"} />
      </div>
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Alergii</p>
        <p className="text-sm">{patient.allergies || "Nicio alergie cunoscută"}</p>
      </Card>
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Note medicale</p>
        <p className="text-sm whitespace-pre-wrap">{patient.medicalNotes || "—"}</p>
      </Card>
      <Link href={`/patients/${id}/edit`} className="inline-flex">
        <Button variant="outline" icon="edit">Editează datele</Button>
      </Link>
    </div>
  );

  const interventions = (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Link href={`/patients/${id}/interventions/new`}>
          <Button icon="add" className="h-10">Adaugă intervenție</Button>
        </Link>
      </div>
      {patient.interventions.length === 0 ? (
        <EmptyState icon="medical_services" title="Nicio intervenție" hint="Adaugă prima intervenție." />
      ) : (
        patient.interventions.map((i) => (
          <Card key={i.id} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <Badge tone="primary">{INTERVENTION_LABELS[i.type]}</Badge>
              <span className="text-sm text-on-surface-variant">{formatDateRo(i.date)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm">
                {i.teethOrArea && <span className="font-medium">{i.teethOrArea} · </span>}
                {i.dentist.name}
              </p>
              {i.estimatedCost != null && (
                <span className="font-semibold text-primary">{Number(i.estimatedCost).toFixed(0)} RON</span>
              )}
            </div>
            {i.notes && <p className="text-sm text-on-surface-variant mt-2">{i.notes}</p>}
          </Card>
        ))
      )}
    </div>
  );

  const appointments = (
    <div className="space-y-3">
      {patient.appointments.length === 0 ? (
        <EmptyState icon="event_busy" title="Nicio programare" />
      ) : (
        patient.appointments.map((a) => (
          <Card key={a.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{formatDateTimeRo(a.startTime)}</p>
              <p className="text-sm text-on-surface-variant">{a.dentist.name} · {a.procedureType || "Programare"}</p>
            </div>
            <Badge tone={a.status === "CONFIRMED" ? "success" : a.status === "CANCELLED" ? "danger" : "neutral"}>
              {APPOINTMENT_STATUS_LABELS[a.status]}
            </Badge>
          </Card>
        ))
      )}
    </div>
  );

  const reminders = (
    <div className="space-y-3">
      {nextRecall && (
        <Card className="p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">Recall estimat: {formatDateRo(nextRecall)}</p>
            <p className="text-sm text-on-surface-variant">La 6 luni de la ultima vizită</p>
          </div>
          <Badge tone={nextRecall <= now ? "warning" : "neutral"}>
            {nextRecall <= now ? "De rechemat" : "Programat"}
          </Badge>
        </Card>
      )}
      <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mt-2">
        Emailuri trimise
      </p>
      {patient.reminderLogs.length === 0 ? (
        <EmptyState icon="notifications_off" title="Niciun email trimis" />
      ) : (
        patient.reminderLogs.map((r) => (
          <Card key={r.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{r.emailTo}</p>
              <p className="text-sm text-on-surface-variant">Trimis {formatDateRo(r.sentAt)}</p>
            </div>
            <Badge tone={r.status === "SENT" ? "success" : "danger"}>{r.status}</Badge>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm text-on-surface-variant">
        <Link href="/patients" className="hover:text-primary">Pacienți</Link>
        <Icon name="chevron_right" className="!text-base" />
        <span className="text-primary font-medium">{patient.fullName}</span>
      </nav>

      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
            style={{ backgroundColor: patient.assignedDentist?.color || "#717783" }}
          >
            {patient.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">{patient.fullName}</h1>
            <p className="text-on-surface-variant text-sm">{formatPhoneDisplay(patient.phone)}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <Stat label="Medic" value={patient.assignedDentist?.name || "—"} />
          <Stat label="Ultima vizită" value={lastVisit ? formatDateRo(lastVisit) : "—"} />
          <Stat label="Recall" value={nextRecall ? formatDateRo(nextRecall) : "—"} />
        </div>
      </Card>

      <PatientTabs
        initialTab={tab}
        details={details}
        interventions={interventions}
        appointments={appointments}
        reminders={reminders}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
        <Icon name={icon} className="!text-lg" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-3 text-center">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className="text-sm font-semibold mt-0.5 truncate">{value}</p>
    </div>
  );
}
