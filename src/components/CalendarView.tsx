"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Card, Button } from "./ui";
import { Field, Select, Input } from "./Field";
import { createAppointment, cancelAppointment } from "@/lib/actions/appointments";
import { DAY_LABELS_SHORT } from "@/lib/constants";

type Slot = { start: string; label: string; booked: boolean; appointmentId?: string; patientName?: string };
type Day = { date: string; slots: Slot[] };
type Dentist = { id: string; name: string; color: string };
type Patient = { id: string; fullName: string };

const MONTHS = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
const MONTHS_SHORT = ["ian.","feb.","mar.","apr.","mai","iun.","iul.","aug.","sep.","oct.","nov.","dec."];

/** "12 – 17 mai 2025" (handles month/year boundaries). */
function weekRangeLabel(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 5); // Mon–Sat
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameMonth && sameYear) {
    return `${start.getDate()} – ${end.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
  }
  if (sameYear) {
    return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} ${start.getFullYear()} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
}

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
  const [newModal, setNewModal] = useState<{ start: string; label: string } | null>(null);
  const [apptModal, setApptModal] = useState<{ slot: Slot; date: string } | null>(null);

  const rangeLabel = weekRangeLabel(weekStart);

  function changeWeek(deltaDays: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + deltaDays);
    router.push(`/calendar?dentist=${selectedDentistId}&week=${d.toISOString().slice(0, 10)}`);
  }

  function goToday() {
    router.push(`/calendar?dentist=${selectedDentistId}`);
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
          <button onClick={() => changeWeek(-7)} className="w-9 h-9 rounded-full border border-outline hover:bg-surface-container flex items-center justify-center" aria-label="Săptămâna anterioară">
            <Icon name="chevron_left" />
          </button>
          <button onClick={goToday} className="text-sm font-semibold min-w-[150px] text-center hover:text-primary transition-colors" title="Mergi la săptămâna curentă">
            {rangeLabel}
          </button>
          <button onClick={() => changeWeek(7)} className="w-9 h-9 rounded-full border border-outline hover:bg-surface-container flex items-center justify-center" aria-label="Săptămâna următoare">
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
                      onClick={() =>
                        slot.booked
                          ? setApptModal({ slot, date: day.date })
                          : setNewModal({ start: slot.start, label: slot.label })
                      }
                      title={slot.booked ? slot.patientName : "Liber"}
                      className={`h-9 rounded-lg text-xs font-medium transition-all ${
                        slot.booked
                          ? "bg-primary text-on-primary hover:bg-primary-container"
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

      {newModal && (
        <BookingModal
          dentistId={selectedDentistId}
          start={newModal.start}
          label={newModal.label}
          patients={patients}
          onClose={() => setNewModal(null)}
          onDone={() => {
            setNewModal(null);
            router.refresh();
          }}
        />
      )}

      {apptModal && (
        <AppointmentModal
          slot={apptModal.slot}
          date={apptModal.date}
          onClose={() => setApptModal(null)}
          onDone={() => {
            setApptModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function AppointmentModal({
  slot,
  date,
  onClose,
  onDone,
}: {
  slot: Slot;
  date: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const d = new Date(date);

  async function remove() {
    if (!slot.appointmentId) return;
    setPending(true);
    setError("");
    try {
      await cancelAppointment(slot.appointmentId);
      onDone();
    } catch {
      setError("Nu s-a putut anula programarea.");
      setPending(false);
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Detalii programare</h3>
        <button onClick={onClose} className="p-1 text-on-surface-variant"><Icon name="close" /></button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
            <Icon name="person" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">Pacient</p>
            <p className="font-semibold">{slot.patientName || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Icon name="schedule" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">Interval</p>
            <p className="font-semibold">
              {d.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })} · {slot.label}
            </p>
          </div>
        </div>
        {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-2">{error}</div>}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Închide</Button>
          <Button variant="danger" className="flex-1" icon="delete" onClick={remove} disabled={pending}>
            {pending ? "Se anulează..." : "Anulează"}
          </Button>
        </div>
      </div>
    </ModalShell>
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
    <ModalShell onClose={onClose}>
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
    </ModalShell>
  );
}
