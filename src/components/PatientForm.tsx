"use client";

import { useActionState } from "react";
import { Field, Input, Textarea, Select } from "@/components/Field";
import { Button } from "@/components/ui";
import type { PatientFormState } from "@/lib/actions/patients";

type Dentist = { id: string; name: string };

type Patient = {
  fullName: string;
  phone: string;
  email: string | null;
  dateOfBirth: Date | null;
  assignedDentistId: string | null;
  medicalNotes: string | null;
  allergies: string | null;
};

export function PatientForm({
  action,
  dentists,
  patient,
}: {
  action: (prev: PatientFormState, formData: FormData) => Promise<PatientFormState>;
  dentists: Dentist[];
  patient?: Patient;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const fe = state.fieldErrors || {};
  const dob = patient?.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().slice(0, 10) : "";

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Nume complet" htmlFor="fullName" error={fe.fullName}>
          <Input id="fullName" name="fullName" defaultValue={patient?.fullName} placeholder="Nume Prenume" required />
        </Field>
        <Field label="Telefon" htmlFor="phone" error={fe.phone} hint="Ex: 0722 123 456">
          <Input id="phone" name="phone" defaultValue={patient?.phone} placeholder="07xx xxx xxx" required />
        </Field>
        <Field label="Email" htmlFor="email" error={fe.email}>
          <Input id="email" name="email" type="email" defaultValue={patient?.email ?? ""} placeholder="email@exemplu.ro" />
        </Field>
        <Field label="Data nașterii" htmlFor="dateOfBirth">
          <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={dob} />
        </Field>
        <Field label="Medic asignat" htmlFor="assignedDentistId">
          <Select id="assignedDentistId" name="assignedDentistId" defaultValue={patient?.assignedDentistId ?? ""}>
            <option value="">— Niciunul —</option>
            {dentists.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Alergii" htmlFor="allergies">
          <Input id="allergies" name="allergies" defaultValue={patient?.allergies ?? ""} placeholder="Ex: Penicilină" />
        </Field>
      </div>

      <Field label="Note medicale" htmlFor="medicalNotes">
        <Textarea
          id="medicalNotes"
          name="medicalNotes"
          rows={4}
          defaultValue={patient?.medicalNotes ?? ""}
          placeholder="Observații, istoric relevant, preferințe..."
        />
      </Field>

      {state.error && (
        <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">{state.error}</div>
      )}

      <div className="flex gap-3">
        <Button type="submit" icon="save" disabled={pending}>
          {pending ? "Se salvează..." : "Salvează pacientul"}
        </Button>
      </div>
    </form>
  );
}
