import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { NewPatientAlert, type NewPatientLead } from "@/components/NewPatientAlert";
import { formatTimeRo, formatDateRo, formatDateTimeRo } from "@/lib/date";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { getRecallCandidates } from "@/lib/recall-query";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  { href: "/patients/new", label: "Pacient nou", icon: "person_add" },
  { href: "/patients", label: "Caută pacient", icon: "search" },
  { href: "/calendar", label: "Calendar", icon: "calendar_month" },
  { href: "/reminders", label: "Remindere", icon: "notifications_active" },
];

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);

  const [todays, upcoming, recallCandidates, dentists] = await Promise.all([
    prisma.appointment.findMany({
      where: { startTime: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } },
      include: { patient: true, dentist: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.findMany({
      where: { startTime: { gt: todayEnd }, status: { not: "CANCELLED" } },
      include: { patient: true, dentist: true },
      orderBy: { startTime: "asc" },
      take: 6,
    }),
    getRecallCandidates(),
    prisma.dentist.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const recalls = recallCandidates.slice(0, 8);

  // New patients registered via the public booking flow, awaiting staff review.
  const newPatients = await prisma.patient.findMany({
    where: { isNew: true },
    include: {
      assignedDentist: true,
      appointments: {
        where: { startTime: { gte: todayStart }, status: { not: "CANCELLED" } },
        orderBy: { startTime: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const newPatientLeads: NewPatientLead[] = newPatients.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    dentistName: p.assignedDentist?.name ?? "Fără medic",
    apptLabel: p.appointments[0] ? formatDateTimeRo(p.appointments[0].startTime) : null,
  }));

  // Count today's appointments per dentist from already-fetched data (no extra queries).
  const dentistCounts = dentists.map((d) => ({
    dentist: d,
    today: todays.filter((a) => a.dentistId === d.id).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bună ziua 👋</h1>
        <p className="text-on-surface-variant mt-1">Iată ce se întâmplă azi în cabinet.</p>
      </div>

      <NewPatientAlert leads={newPatientLeads} />

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3 hover:border-primary hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
              <Icon name={a.icon} />
            </div>
            <span className="font-semibold text-sm">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Dentist cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dentistCounts.map(({ dentist, today }) => (
          <Card key={dentist.id} className="p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: dentist.color }}
            >
              {dentist.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{dentist.name}</p>
              <p className="text-sm text-on-surface-variant">{today} programări azi</p>
            </div>
            <Link href="/calendar" className="text-primary text-sm font-medium flex items-center gap-1">
              Calendar <Icon name="chevron_right" className="!text-lg" />
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Icon name="today" className="text-primary" /> Programări azi
            </h2>
            <Badge tone="primary">{todays.length}</Badge>
          </div>
          {todays.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-6 text-center">Nicio programare azi.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {todays.map((a) => (
                <li key={a.id} className="py-3 flex items-center gap-3">
                  <div className="text-center w-14">
                    <p className="font-bold text-primary">{formatTimeRo(a.startTime)}</p>
                  </div>
                  <div className="flex-1">
                    <Link href={`/patients/${a.patientId}`} className="font-medium hover:text-primary">
                      {a.patient.fullName}
                    </Link>
                    <p className="text-xs text-on-surface-variant">
                      {a.dentist.name} · {a.procedureType || "Programare"}
                    </p>
                  </div>
                  <Badge tone={a.status === "CONFIRMED" ? "success" : "neutral"}>
                    {APPOINTMENT_STATUS_LABELS[a.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Upcoming */}
        <Card className="p-5">
          <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Icon name="event_upcoming" className="text-primary" /> Programări viitoare
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-6 text-center">Nicio programare viitoare.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {upcoming.map((a) => (
                <li key={a.id} className="py-3 flex items-center gap-3">
                  <div className="text-center w-16">
                    <p className="text-xs text-on-surface-variant">{formatDateRo(a.startTime).split(" ").slice(0, 2).join(" ")}</p>
                    <p className="font-bold text-primary text-sm">{formatTimeRo(a.startTime)}</p>
                  </div>
                  <div className="flex-1">
                    <Link href={`/patients/${a.patientId}`} className="font-medium hover:text-primary">
                      {a.patient.fullName}
                    </Link>
                    <p className="text-xs text-on-surface-variant">{a.dentist.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recalls */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Icon name="event_repeat" className="text-primary" /> Recall la 6 luni
          </h2>
          <Link href="/reminders" className="text-primary text-sm font-medium">
            Vezi toate
          </Link>
        </div>
        {recalls.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">Niciun pacient de rechemat momentan.</p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {recalls.map((r) => (
              <li key={r.patientId} className="py-3 flex items-center gap-3">
                <div className="flex-1">
                  <Link href={`/patients/${r.patientId}`} className="font-medium hover:text-primary">
                    {r.fullName}
                  </Link>
                  <p className="text-xs text-on-surface-variant">
                    {r.dentistName} · ultima vizită {formatDateRo(r.lastVisit)}
                  </p>
                </div>
                <Badge tone="warning">De rechemat</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
