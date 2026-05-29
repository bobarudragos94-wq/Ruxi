"use client";

import { useState } from "react";

const TABS = [
  { id: "details", label: "Detalii" },
  { id: "interventions", label: "Intervenții" },
  { id: "appointments", label: "Programări" },
  { id: "reminders", label: "Remindere" },
];

export function PatientTabs({
  initialTab,
  details,
  interventions,
  appointments,
  reminders,
}: {
  initialTab?: string;
  details: React.ReactNode;
  interventions: React.ReactNode;
  appointments: React.ReactNode;
  reminders: React.ReactNode;
}) {
  const [tab, setTab] = useState(
    TABS.some((t) => t.id === initialTab) ? (initialTab as string) : "details"
  );
  const content: Record<string, React.ReactNode> = { details, interventions, appointments, reminders };

  return (
    <div>
      <div className="flex gap-1 border-b border-outline-variant overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-5">{content[tab]}</div>
    </div>
  );
}
