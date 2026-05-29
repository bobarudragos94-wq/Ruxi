import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { InterventionForm } from "@/components/InterventionForm";
import { createIntervention } from "@/lib/actions/interventions";
import { toDateInputValue } from "@/lib/date";

export default async function NewInterventionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [patient, dentists] = await Promise.all([
    prisma.patient.findUnique({ where: { id } }),
    prisma.dentist.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!patient) notFound();

  const action = createIntervention.bind(null, id);

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm text-on-surface-variant">
        <Link href="/patients" className="hover:text-primary">Pacienți</Link>
        <Icon name="chevron_right" className="!text-base" />
        <Link href={`/patients/${id}`} className="hover:text-primary">{patient.fullName}</Link>
        <Icon name="chevron_right" className="!text-base" />
        <span className="text-primary font-medium">Intervenție nouă</span>
      </nav>
      <PageHeader title="Adaugă intervenție" subtitle="Detaliile procedurii clinice efectuate" />
      <Card className="p-6 md:p-8">
        <InterventionForm
          action={action}
          dentists={dentists}
          defaultDentistId={patient.assignedDentistId ?? undefined}
          defaultDate={toDateInputValue(new Date())}
        />
      </Card>
    </div>
  );
}
