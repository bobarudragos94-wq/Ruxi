"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Card, Button } from "./ui";
import { Field, Select, Input } from "./Field";
import { createAppointment } from "@/lib/actions/appointments";
import { DAY_LABELS_SHORT } from "@/lib/constants";

type Slot = { start: string; label: string; booked: boolean; appointmentId?: string; patientName?: string };
type Day = { date: string; slots: Slot[] };
type Dentist = { id: string; name: string; color: string };
type Patient = { id: string; fullName: string };

const MONTHS = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];

export function CalendarView({
  dentists,
  selectedDentistId,
  weekStart,
  days,
  patients,
}: {
  dentists: Dentist[];
  selectedDentistId: string;
  weekStart: string;
  days: Day[];
  patients: Patient[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState<{ start: string; label: string } | null>(null);

  const start = new Date(weekStart);
  const monthLabel = `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;

  function changeWeek(deltaDays: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + deltaDays);
    router.push(`/calendar?dentist=${selectedDentistId}&week=${d.toISOString().slice(0, 10)}`);
  }

  function changeDentist(id: string) {
    router.push(`/calendar?dentist=${id}&week=${weekStart.slice(0, 10)}`);
  }

  const hasAnySlots = days.some((d) => d.slots.length > 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          {dentists.map((d) => (
            <button
              key={d.id}
              onClick={() => changeDentist(d.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                d.id === selectedDentistId
                  ? "bg-primary-fixed text-on-primary-fixed"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeWeek(-7)} className="w-9 h-9 rounded-full border border-outline hover:bg-surface-container flex items-center justify-center">
            <Icon name="chevron_left" />
          </button>
          <span className="text-sm font-semibold min-w-[120px] text-center">{monthLabel}</span>
          <button onClick={() => changeWeek(7)} className="w-9 h-9 rounded-full border border-outline hover:bg-surface-container flex items-center justify-center">
            <Icon name="chevron_right" />
          </button>
        </div>
      </Card>

      {!hasAnySlots ? (
        <Card className="p-10 text-center text-on-surface-variant">
          <Icon name="event_busy" className="!text-4xl mb-2" />
          <p>Medicul nu are program în această săptămână.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => {
            const date = new Date(day.date);
            if (day.slots.length === 0) return null;
            return (
              <Card key={day.date} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                      {DAY_LABELS_SHORT[date.getDay()]}
                    </p>
                    <p className="text-lg font-bold">{date.getDate()} {MONTHS[date.getMonth()].slice(0, 3)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {day.slots.map((slot) => (
                    <button
                      key={slot.start}
                      disabled={slot.booked}
                      onClick={() => setModal({ start: slot.start, label: slot.label })}
                      title={slot.booked ? slot.patientName : "Liber"}
                      className={`h-9 rounded-lg text-xs font-medium transition-all ${
                        slot.booked
                          ? "bg-primary text-on-primary cursor-default"
                          : "border border-outline-variant hover:border-primary hover:text-primary"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary" /> Ocupat</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-outline-variant" /> Liber</span>
      </div>

      {modal && (
        <BookingModal
          dentistId={selectedDentistId}
          start={modal.start}
          label={modal.label}
          patients={patients}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function BookingModal({
  dentistId,
  start,
  label,
  patients,
  onClose,
  onDone,
}: {
  dentistId: string;
  start: string;
  label: string;
  patients: Patient[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    formData.set("dentistId", dentistId);
    formData.set("startTime", start);
    const res = await createAppointment({}, formData);
    setPending(false);
    if (res.ok) onDone();
    else setError(res.error || "Eroare");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Programare nouă · {label}</h3>
          <button onClick={onClose} className="p-1 text-on-surface-variant"><Icon name="close" /></button>
        </div>
        <form action={submit} className="space-y-4">
          <Field label="Pacient" htmlFor="patientId">
            <Select id="patientId" name="patientId" required defaultValue="">
              <option value="" disabled>Selectează pacientul</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </Select>
          </Field>
          <Field label="Procedură" htmlFor="procedureType">
            <Input id="procedureType" name="procedureType" placeholder="Ex: Control" />
          </Field>
          {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-2">{error}</div>}
          <Button type="submit" className="w-full" icon="check" disabled={pending}>
            {pending ? "Se salvează..." : "Confirmă programarea"}
          </Button>
        </form>
      </div>
    </div>
  );
}
