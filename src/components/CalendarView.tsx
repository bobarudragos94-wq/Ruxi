"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Card, Button } from "./ui";
import { Field, Select, Input } from "./Field";
import { createAppointment, cancelAppointment } from "@/lib/actions/appointments";
import { DAY_LABELS, DAY_LABELS_SHORT } from "@/lib/constants";

type Slot = { start: string; label: string; booked: boolean; appointmentId?: string; patientName?: string };
type Day = { date: string; slots: Slot[] };
type Dentist = { id: string; name: string; color: string };
type Patient = { id: string; fullName: string };
type View = "day" | "week";

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

/** Parse "YYYY-MM-DD" as a local-midnight date (avoids the UTC shift of new Date(string)). */
function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDayParam(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function StatChip({ icon, value, label, tone }: { icon: string; value: string; label: string; tone: "blue" | "green" | "purple" }) {
  const tones = {
    blue: "bg-[#e3f0ff] text-[#0a6cdc]",
    green: "bg-[#d6f7ec] text-[#00875a]",
    purple: "bg-[#ece6ff] text-[#6d4bf6]",
  };
  return (
    <div className="flex items-center gap-3 bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 shadow-sm">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon name={icon} filled className="!text-xl" />
      </span>
      <div className="leading-tight">
        <p className="font-bold text-lg">{value}</p>
        <p className="text-xs text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

export function CalendarView({
  dentists,
  selectedDentistId,
  weekStart,
  days,
  patients,
  view,
  selectedDay,
}: {
  dentists: Dentist[];
  selectedDentistId: string;
  weekStart: string;
  days: Day[];
  patients: Patient[];
  view: View;
  selectedDay: string; // "YYYY-MM-DD"
}) {
  const router = useRouter();
  const [newModal, setNewModal] = useState<{ start: string; label: string } | null>(null);
  const [apptModal, setApptModal] = useState<{ slot: Slot; date: string } | null>(null);
  // Set after mount so SSR and client HTML match (today highlight, time marker).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const rangeLabel = weekRangeLabel(weekStart);
  const dayDate = parseDay(selectedDay);
  const todayParam = now ? toDayParam(now) : null;

  function go(params: { view?: View; week?: string; day?: string; dentist?: string }) {
    const q = new URLSearchParams();
    q.set("dentist", params.dentist ?? selectedDentistId);
    const v = params.view ?? view;
    if (v === "day") {
      q.set("view", "day");
      q.set("day", params.day ?? selectedDay);
    } else if (params.week) {
      q.set("week", params.week);
    }
    router.push(`/calendar?${q.toString()}`);
  }

  function changeWeek(deltaDays: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + deltaDays);
    go({ week: toDayParam(d) });
  }

  function changeDay(delta: number) {
    const d = new Date(dayDate);
    d.setDate(d.getDate() + delta);
    if (d.getDay() === 0) d.setDate(d.getDate() + delta); // skip Sunday (no schedule)
    go({ day: toDayParam(d) });
  }

  function goToday() {
    if (view === "day" && todayParam) go({ day: todayParam });
    else router.push(`/calendar?dentist=${selectedDentistId}`);
  }

  function switchView(v: View) {
    if (v === view) return;
    if (v === "day") {
      // Prefer today when it falls inside the loaded week, otherwise Monday.
      const inWeek = todayParam && days.some((d) => toDayParam(new Date(d.date)) === todayParam);
      go({ view: "day", day: inWeek ? todayParam! : toDayParam(new Date(weekStart)) });
    } else {
      go({ view: "week", week: toDayParam(new Date(weekStart)) });
    }
  }

  const hasAnySlots = days.some((d) => d.slots.length > 0);
  const currentDay = days.find((d) => toDayParam(new Date(d.date)) === selectedDay);

  // Stats for the visible scope (selected day or whole week).
  const scopeSlots = view === "day" ? currentDay?.slots ?? [] : days.flatMap((d) => d.slots);
  const bookedCount = scopeSlots.filter((s) => s.booked).length;
  const freeCount = scopeSlots.length - bookedCount;
  const occupancy = scopeSlots.length > 0 ? Math.round((bookedCount / scopeSlots.length) * 100) : 0;

  const isToday = todayParam === selectedDay;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="flex gap-2 flex-wrap">
            {dentists.map((d) => (
              <button
                key={d.id}
                onClick={() => go({ dentist: d.id, week: toDayParam(new Date(weekStart)) })}
                className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                  d.id === selectedDentistId
                    ? "bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white shadow-md shadow-primary/20"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white/40" style={{ backgroundColor: d.color }} />
                {d.name}
              </button>
            ))}
          </div>

          {/* View switch */}
          <div className="flex items-center gap-2">
            <div className="flex bg-surface-container rounded-xl p-1">
              {(
                [
                  { v: "day" as View, icon: "calendar_view_day", label: "Zi" },
                  { v: "week" as View, icon: "calendar_view_week", label: "Săptămână" },
                ]
              ).map(({ v, icon, label }) => (
                <button
                  key={v}
                  onClick={() => switchView(v)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    view === v
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Icon name={icon} className="!text-lg" />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={goToday}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold border border-outline-variant hover:border-primary/50 hover:text-primary transition-all"
            >
              Astăzi
            </button>
          </div>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between sm:justify-center gap-2 pt-3 border-t border-outline-variant/60">
          <button
            onClick={() => (view === "day" ? changeDay(-1) : changeWeek(-7))}
            className="w-9 h-9 rounded-xl border border-outline-variant hover:bg-surface-container hover:border-primary/40 flex items-center justify-center transition-all"
            aria-label={view === "day" ? "Ziua anterioară" : "Săptămâna anterioară"}
          >
            <Icon name="chevron_left" />
          </button>
          <div className="text-center min-w-[200px]">
            {view === "day" ? (
              <p className="font-bold flex items-center justify-center gap-2">
                {DAY_LABELS[dayDate.getDay()]}, {dayDate.getDate()} {MONTHS[dayDate.getMonth()].toLowerCase()}
                {isToday && (
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded-full">
                    azi
                  </span>
                )}
              </p>
            ) : (
              <p className="font-bold">{rangeLabel}</p>
            )}
          </div>
          <button
            onClick={() => (view === "day" ? changeDay(1) : changeWeek(7))}
            className="w-9 h-9 rounded-xl border border-outline-variant hover:bg-surface-container hover:border-primary/40 flex items-center justify-center transition-all"
            aria-label={view === "day" ? "Ziua următoare" : "Săptămâna următoare"}
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      </Card>

      {/* Stats */}
      {scopeSlots.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatChip icon="event" value={String(bookedCount)} label={view === "day" ? "Programări azi" : "Programări"} tone="blue" />
          <StatChip icon="event_available" value={String(freeCount)} label="Intervale libere" tone="green" />
          <StatChip icon="donut_small" value={`${occupancy}%`} label="Grad de ocupare" tone="purple" />
        </div>
      )}

      {/* DAY VIEW: timeline */}
      {view === "day" && (
        !currentDay || currentDay.slots.length === 0 ? (
          <Card className="p-10 text-center text-on-surface-variant animate-fade-in">
            <Icon name="event_busy" className="!text-4xl mb-2" />
            <p>Medicul nu are program în această zi.</p>
          </Card>
        ) : (
          <Card className="p-4 sm:p-5 animate-fade-up">
            <div className="space-y-1">
              {currentDay.slots.map((slot, i) => {
                const slotStart = new Date(slot.start);
                const prevStart = i > 0 ? new Date(currentDay.slots[i - 1].start) : null;
                const showNowMarker =
                  isToday && now !== null && slotStart > now && (i === 0 || (prevStart !== null && prevStart <= now));
                return (
                  <div key={slot.start}>
                    {showNowMarker && (
                      <div className="flex items-center gap-2 py-1 pl-14 sm:pl-16" aria-label="Ora curentă">
                        <span className="w-2 h-2 rounded-full bg-[#ff5a5a] shrink-0" />
                        <span className="flex-1 h-0.5 bg-[#ff5a5a]/70 rounded-full" />
                        <span className="text-[10px] font-bold text-[#ff5a5a]">
                          {String(now!.getHours()).padStart(2, "0")}:{String(now!.getMinutes()).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-stretch gap-3 sm:gap-4">
                      <div className="w-11 sm:w-12 shrink-0 pt-3 text-right">
                        <span className={`text-sm font-semibold ${slot.booked ? "text-on-surface" : "text-on-surface-variant"}`}>
                          {slot.label}
                        </span>
                      </div>
                      {slot.booked ? (
                        <button
                          onClick={() => setApptModal({ slot, date: currentDay.date })}
                          className="group flex-1 my-0.5 text-left rounded-xl bg-gradient-to-r from-[#0a84ff] to-[#005dac] text-white px-4 py-3 shadow-sm hover:shadow-md hover:brightness-105 transition-all flex items-center gap-3"
                        >
                          <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shrink-0">
                            {(slot.patientName || "?").charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="font-semibold block truncate">{slot.patientName || "Pacient"}</span>
                            <span className="text-xs text-white/75">Programare confirmată</span>
                          </span>
                          <Icon name="chevron_right" className="ml-auto text-white/70 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setNewModal({ start: slot.start, label: slot.label })}
                          className="group flex-1 my-0.5 rounded-xl border border-dashed border-outline-variant text-on-surface-variant px-4 py-3 hover:border-primary hover:text-primary hover:bg-primary-fixed/20 transition-all flex items-center gap-2 text-sm"
                        >
                          <Icon name="add_circle" className="!text-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="font-medium">Liber</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )
      )}

      {/* WEEK VIEW: day cards */}
      {view === "week" &&
        (!hasAnySlots ? (
          <Card className="p-10 text-center text-on-surface-variant animate-fade-in">
            <Icon name="event_busy" className="!text-4xl mb-2" />
            <p>Medicul nu are program în această săptămână.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map((day) => {
              const date = new Date(day.date);
              if (day.slots.length === 0) return null;
              const dayBooked = day.slots.filter((s) => s.booked).length;
              const dayIsToday = todayParam === toDayParam(date);
              return (
                <Card
                  key={day.date}
                  className={`p-4 animate-fade-up transition-shadow hover:shadow-md ${
                    dayIsToday ? "ring-2 ring-[#0a84ff]/60 !border-transparent" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center ${
                          dayIsToday
                            ? "bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white shadow-md shadow-primary/20"
                            : "bg-surface-container text-on-surface"
                        }`}
                      >
                        <span className="text-[9px] font-bold leading-none mb-0.5 uppercase">{DAY_LABELS_SHORT[date.getDay()]}</span>
                        <span className="font-bold leading-none">{date.getDate()}</span>
                      </div>
                      <div className="leading-tight">
                        <p className="font-semibold text-sm">{MONTHS[date.getMonth()].slice(0, 3)}</p>
                        <p className="text-xs text-on-surface-variant">
                          {dayBooked}/{day.slots.length} ocupate
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => go({ view: "day", day: toDayParam(date) })}
                      className="text-xs font-semibold text-primary hover:bg-primary-fixed/40 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      title="Vezi ziua"
                    >
                      Vezi ziua
                      <Icon name="chevron_right" className="!text-sm" />
                    </button>
                  </div>

                  {/* Occupancy bar */}
                  <div className="h-1.5 rounded-full bg-surface-container mb-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0a84ff] to-[#005dac] transition-all"
                      style={{ width: `${day.slots.length ? (dayBooked / day.slots.length) * 100 : 0}%` }}
                    />
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
                        className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                          slot.booked
                            ? "bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white shadow-sm hover:brightness-110"
                            : "border border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary-fixed/20"
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
        ))}

      <div className="flex gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-[#0a84ff] to-[#005dac]" /> Ocupat
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-dashed border-outline-variant" /> Liber
        </span>
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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up-sheet sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white flex items-center justify-center font-bold">
            {(slot.patientName || "?").charAt(0).toUpperCase()}
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
        {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-2 animate-fade-in">{error}</div>}
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
        {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-2 animate-fade-in">{error}</div>}
        <Button type="submit" className="w-full" icon="check" disabled={pending}>
          {pending ? "Se salvează..." : "Confirmă programarea"}
        </Button>
      </form>
    </ModalShell>
  );
}
