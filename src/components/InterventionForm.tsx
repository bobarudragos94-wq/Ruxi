"use client";

import { useActionState } from "react";
import { Field, Input, Textarea, Select } from "@/components/Field";
import { Button } from "@/components/ui";
import { INTERVENTION_LABELS } from "@/lib/constants";
import type { InterventionFormState } from "@/lib/actions/interventions";

type Dentist = { id: string; name: string };

export function InterventionForm({
  action,
  dentists,
  defaultDentistId,
  defaultDate,
}: {
  action: (prev: InterventionFormState, formData: FormData) => Promise<InterventionFormState>;
  dentists: Dentist[];
  defaultDentistId?: string;
  defaultDate: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const fe = state.fieldErrors || {};

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Data intervenției" htmlFor="date" error={fe.date}>
          <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
        </Field>
        <Field label="Medic" htmlFor="dentistId" error={fe.dentistId}>
          <Select id="dentistId" name="dentistId" defaultValue={defaultDentistId ?? ""} required>
            <option value="" disabled>Selectează medicul</option>
            {dentists.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tip intervenție" htmlFor="type" error={fe.type}>
          <Select id="type" name="type" defaultValue="CONTROL" required>
            {Object.entries(INTERVENTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Dinți / zonă" htmlFor="teethOrArea">
          <Input id="teethOrArea" name="teethOrArea" placeholder="Ex: 14, 15 sau Mandibulă" />
        </Field>
      </div>

      <Field label="Observații" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={4} placeholder="Detalii despre procedură, materiale, anestezie..." />
      </Field>

      <Field label="Cost estimativ (RON)" htmlFor="estimatedCost">
        <Input id="estimatedCost" name="estimatedCost" type="number" step="0.01" min="0" placeholder="0" />
      </Field>

      {state.error && (
        <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">{state.error}</div>
      )}

      <Button type="submit" icon="save" disabled={pending}>
        {pending ? "Se salvează..." : "Salvează intervenția"}
      </Button>
    </form>
  );
}
