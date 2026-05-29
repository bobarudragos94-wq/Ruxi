import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { CalendarView } from "@/components/CalendarView";
import { getSlotsWithStatus } from "@/lib/slots";
import { startOfWeek, addDays } from "@/lib/date";

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

  // Build 6 working days (Mon-Sat); Sunday closed.
  const days = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  const daysWithSlots = selectedDentistId
    ? await Promise.all(
        days.map(async (day) => ({
          date: day.toISOString(),
          slots: (await getSlotsWithStatus(selectedDentistId, day)).map((s) => ({
            start: s.start.toISOString(),
            label: s.label,
            booked: s.booked,
            appointmentId: s.appointmentId,
            patientName: s.patientName,
          })),
        }))
      )
    : [];

  const patients = await prisma.patient.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
    take: 500,
  });

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
