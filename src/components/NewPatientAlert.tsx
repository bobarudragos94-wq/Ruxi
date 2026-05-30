"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { dismissNewPatient } from "@/lib/actions/leads";

export type NewPatientLead = {
  id: string;
  fullName: string;
  dentistName: string;
  apptLabel: string | null;
};

export function NewPatientAlert({ leads }: { leads: NewPatientLead[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  if (leads.length === 0) return null;

  async function dismiss(id: string) {
    setBusy(id);
    await dismissNewPatient(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-[#ffe2b8] bg-[#fff8ec] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="person_alert" className="text-[#7a4e00]" />
        <h2 className="font-semibold text-[#7a4e00]">
          Pacienți noi din programări online ({leads.length})
        </h2>
      </div>
      <ul className="space-y-2">
        {leads.map((l) => (
          <li
            key={l.id}
            className="flex items-center gap-3 bg-surface-container-lowest rounded-lg px-4 py-3 border border-outline-variant"
          >
            <div className="flex-1 min-w-0">
              <Link href={`/patients/${l.id}`} className="font-medium hover:text-primary">
                {l.fullName}
              </Link>
              <p className="text-xs text-on-surface-variant">
                {l.dentistName}
                {l.apptLabel ? ` · ${l.apptLabel}` : ""}
              </p>
            </div>
            <button
              onClick={() => dismiss(l.id)}
              disabled={busy === l.id}
              className="h-9 px-3 rounded-lg bg-surface-container-high text-on-surface text-sm font-medium hover:bg-surface-container-highest disabled:opacity-50"
            >
              {busy === l.id ? "..." : "Am văzut"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
