import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PatientSearch } from "@/components/PatientSearch";
import { formatPhoneDisplay } from "@/lib/phone";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const where: Prisma.PatientWhereInput = query
    ? {
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { phone: { contains: query.replace(/\s/g, "") } },
        ],
      }
    : {};

  const patients = await prisma.patient.findMany({
    where,
    include: { assignedDentist: true },
    orderBy: { fullName: "asc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pacienți"
        subtitle="Caută și administrează pacienții cabinetului"
        action={
          <Link
            href="/patients/new"
            className="h-11 px-4 rounded-xl bg-primary text-on-primary font-semibold flex items-center gap-2 shadow-sm hover:bg-primary-container transition-all"
          >
            <Icon name="person_add" className="!text-xl" />
            <span className="hidden sm:inline">Pacient nou</span>
          </Link>
        }
      />

      <PatientSearch initialQuery={query} />

      {patients.length === 0 ? (
        <Card className="p-2">
          <EmptyState
            icon="person_off"
            title={query ? "Niciun pacient găsit" : "Niciun pacient încă"}
            hint={query ? "Încearcă alt termen de căutare." : "Adaugă primul pacient."}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {patients.map((p) => (
            <Link key={p.id} href={`/patients/${p.id}`}>
              <Card className="p-4 flex items-center gap-3 hover:border-primary transition-all">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                  style={{ backgroundColor: p.assignedDentist?.color || "#717783" }}
                >
                  {p.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.fullName}</p>
                  <p className="text-sm text-on-surface-variant">{formatPhoneDisplay(p.phone)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">Medic</p>
                  <p className="text-sm font-medium">{p.assignedDentist?.name || "—"}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
