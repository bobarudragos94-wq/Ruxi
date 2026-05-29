import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PatientForm } from "@/components/PatientForm";
import { updatePatient } from "@/lib/actions/patients";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [patient, dentists] = await Promise.all([
    prisma.patient.findUnique({ where: { id } }),
    prisma.dentist.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!patient) notFound();

  const action = updatePatient.bind(null, id);

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm text-on-surface-variant">
        <Link href="/patients" className="hover:text-primary">Pacienți</Link>
        <Icon name="chevron_right" className="!text-base" />
        <Link href={`/patients/${id}`} className="hover:text-primary">{patient.fullName}</Link>
        <Icon name="chevron_right" className="!text-base" />
        <span className="text-primary font-medium">Editează</span>
      </nav>
      <PageHeader title="Editează pacientul" />
      <Card className="p-6 md:p-8">
        <PatientForm action={action} dentists={dentists} patient={patient} />
      </Card>
    </div>
  );
}
