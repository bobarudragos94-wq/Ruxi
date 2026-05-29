import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PatientForm } from "@/components/PatientForm";
import { createPatient } from "@/lib/actions/patients";

export default async function NewPatientPage() {
  const dentists = await prisma.dentist.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm text-on-surface-variant">
        <Link href="/patients" className="hover:text-primary">Pacienți</Link>
        <Icon name="chevron_right" className="!text-base" />
        <span className="text-primary font-medium">Pacient nou</span>
      </nav>
      <PageHeader title="Pacient nou" subtitle="Completează datele pacientului" />
      <Card className="p-6 md:p-8">
        <PatientForm action={createPatient} dentists={dentists} />
      </Card>
    </div>
  );
}
