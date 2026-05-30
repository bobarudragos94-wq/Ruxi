import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { CalendarView } from "@/components/CalendarView";
import { getWeekSlotsWithStatus } from "@/lib/slots";
import { startOfWeek } from "@/lib/date";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ dentist?: string; week?: string }>;
}) {
  const { dentist, week } = await searchParams;
  const dentists = await prisma.dentist.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  const selectedDentistId = dentist && dentists.some((d) => d.id === dentist) ? dentist : dentists[0]?.id;
  const baseDate = week ? new Date(week) : new Date();
  const weekStart = startOfWeek(baseDate);

  // Fetch the whole week in 2 queries (schedules + appointments), compute slots in memory.
  const [weekSlots, patients] = await Promise.all([
    selectedDentistId ? getWeekSlotsWithStatus(selectedDentistId, weekStart) : Promise.resolve([]),
    prisma.patient.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
      take: 500,
    }),
  ]);

  const daysWithSlots = weekSlots.map((d) => ({
    date: d.date.toISOString(),
    slots: d.slots.map((s) => ({
      start: s.start.toISOString(),
      label: s.label,
      booked: s.booked,
      appointmentId: s.appointmentId,
      patientName: s.patientName,
    })),
  }));

  return (
    <div className="space-y-5">
      <PageHeader title="Calendar" subtitle="Programări săptămânale și intervale libere" />
      <CalendarView
        dentists={dentists}
        selectedDentistId={selectedDentistId ?? ""}
        weekStart={weekStart.toISOString()}
        days={daysWithSlots}
        patients={patients}
      />
    </div>
  );
}
