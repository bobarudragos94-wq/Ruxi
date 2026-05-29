"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Badge } from "./ui";
import { sendReminder } from "@/lib/actions/reminders";
import { REMINDER_STATUS_LABELS } from "@/lib/constants";
import type { ReminderStatus } from "@/generated/prisma";

export function ReminderRow({
  id,
  patientId,
  patientName,
  dentistName,
  dueDate,
  status,
  overdue,
  hasEmail,
}: {
  id: string;
  patientId: string;
  patientName: string;
  dentistName: string;
  dueDate: string;
  status: ReminderStatus;
  overdue: boolean;
  hasEmail: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState("");

  async function send() {
    setPending(true);
    setMsg("");
    const res = await sendReminder(id);
    setPending(false);
    if (res.ok) {
      setMsg("Trimis ✓");
      router.refresh();
    } else {
      setMsg(res.error || "Eroare");
    }
  }

  return (
    <li className="px-5 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <Link href={`/patients/${patientId}`} className="font-medium hover:text-primary">
          {patientName}
        </Link>
        <p className="text-xs text-on-surface-variant">
          {dentistName} · scadent {dueDate}
        </p>
      </div>
      <Badge tone={overdue ? "danger" : status === "SENT" ? "neutral" : "warning"}>
        {overdue && status === "PENDING" ? "Restant" : REMINDER_STATUS_LABELS[status]}
      </Badge>
      <button
        onClick={send}
        disabled={pending || !hasEmail}
        title={hasEmail ? "Trimite email" : "Pacientul nu are email"}
        className="h-9 px-3 rounded-lg bg-primary text-on-primary text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 hover:bg-primary-container transition-all"
      >
        <Icon name="send" className="!text-base" />
        {pending ? "..." : msg || "Trimite"}
      </button>
    </li>
  );
}
