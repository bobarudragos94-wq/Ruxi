import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { CalendarView } from "@/components/CalendarView";
import { getWeekSlotsWithStatus } from "@/lib/slots";
import { startOfWeek, toDateInputValue, isSameDay } from "@/lib/date";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ dentist?: string; week?: string; view?: string; day?: string }>;
}) {
  const { dentist, week, view, day } = await searchParams;
  const dentists = await prisma.dentist.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  const selectedDentistId = dentist && dentists.some((d) => d.id === dentist) ? dentist : dentists[0]?.id;
  // The day param (day view) takes precedence so its week is always the one loaded.
  const baseDate = day ? new Date(day) : week ? new Date(week) : new Date();
  const weekStart = startOfWeek(baseDate);
  const selectedView = view === "day" ? "day" : "week";
  const selectedDay = day
    ? new Date(day)
    : isSameDay(startOfWeek(new Date()), weekStart)
      ? new Date()
      : weekStart;

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
      <PageHeader title="Calendar" subtitle="Programări și intervale libere" />
      <CalendarView
        dentists={dentists}
        selectedDentistId={selectedDentistId ?? ""}
        weekStart={weekStart.toISOString()}
        days={daysWithSlots}
        patients={patients}
        view={selectedView}
        selectedDay={toDateInputValue(selectedDay)}
      />
    </div>
  );
}
