"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Button, Card } from "@/components/ui";
import { DAY_LABELS_SHORT, PUBLIC_SERVICES } from "@/lib/constants";

type Slot = { start: string; label: string };
type Day = { date: string; slots: Slot[] };
type Dentist = { id: string; name: string; color: string };
type Step = "service" | "dentist" | "slots";

const MONTHS = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

const SERVICE_ICONS: Record<string, string> = {
  CONTROL: "stethoscope",
  DETARTRAJ: "auto_awesome",
  PLOMBA: "healing",
  EXTRACTIE: "medical_services",
  TRATAMENT_CANAL: "vital_signs",
};

/** "12 – 17 Mai" for the loaded week (Mon–Sat). */
function weekLabel(weekIso: string): string {
  const start = new Date(weekIso);
  const end = new Date(start);
  end.setDate(start.getDate() + 5);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} ${MONTHS[start.getMonth()]}`;
  }
  return `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]}`;
}

function StepIndicator({ step, isNew }: { step: Step; isNew: boolean }) {
  const steps = isNew
    ? [
        { key: "service", label: "Serviciu", icon: "medical_services" },
        { key: "dentist", label: "Medic", icon: "person" },
        { key: "slots", label: "Data și ora", icon: "calendar_month" },
      ]
    : [
        { key: "service", label: "Serviciu", icon: "medical_services" },
        { key: "slots", label: "Data și ora", icon: "calendar_month" },
      ];
  const activeIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      {steps.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className={`w-6 sm:w-10 h-0.5 rounded-full ${done || active ? "bg-primary" : "bg-outline-variant"}`} />}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                active
                  ? "bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white shadow-md shadow-primary/25"
                  : done
                    ? "bg-primary-fixed text-on-primary-fixed"
                    : "bg-surface-container text-on-surface-variant"
              }`}
            >
              <Icon name={done ? "check" : s.icon} className="!text-base" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BookSlotsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [kind, setKind] = useState<"existing" | "new">("existing");
  const [firstName, setFirstName] = useState("");
  const [assignedDentist, setAssignedDentist] = useState("");

  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<string | null>(null);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [chosenDentist, setChosenDentist] = useState<Dentist | null>(null);

  const [days, setDays] = useState<Day[]>([]);
  const [week, setWeek] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const t = sessionStorage.getItem("booking_token");
    if (!t) {
      router.replace("/book");
      return;
    }
    setToken(t);
    setKind((sessionStorage.getItem("booking_kind") as "existing" | "new") || "existing");
    setFirstName(sessionStorage.getItem("booking_firstName") || "");
    setAssignedDentist(sessionStorage.getItem("booking_dentist") || "");
  }, [router]);

  const loadSlots = useCallback(
    async (t: string, dentistId: string | null, weekParam?: string) => {
      setLoading(true);
      setError("");
      const url = new URL("/api/book/slots", window.location.origin);
      url.searchParams.set("token", t);
      if (dentistId) url.searchParams.set("dentist", dentistId);
      if (weekParam) url.searchParams.set("week", weekParam);
      const res = await fetch(url.toString());
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Eroare la încărcare");
        if (res.status === 401) setTimeout(() => router.replace("/book"), 1500);
        return;
      }
      setDays(data.days || []);
      setWeek(data.week);
    },
    [router]
  );

  // Pick a service, then branch: existing -> slots, new -> choose dentist.
  function pickService(value: string) {
    setService(value);
    if (kind === "existing") {
      setStep("slots");
      if (token) loadSlots(token, null);
    } else {
      setStep("dentist");
      if (token && dentists.length === 0) loadDentists(token);
    }
  }

  async function loadDentists(t: string) {
    const res = await fetch(`/api/book/dentists?token=${encodeURIComponent(t)}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) setDentists(data.dentists || []);
  }

  function pickDentist(d: Dentist) {
    setChosenDentist(d);
    setStep("slots");
    if (token) loadSlots(token, d.id);
  }

  function changeWeek(deltaDays: number) {
    if (!token || !week) return;
    const d = new Date(week);
    d.setDate(d.getDate() + deltaDays);
    setSelected(null);
    loadSlots(token, kind === "new" ? chosenDentist?.id ?? null : null, d.toISOString().slice(0, 10));
  }

  async function confirm() {
    if (!token || !selected || !service) return;
    setConfirming(true);
    setError("");
    const res = await fetch("/api/book/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        startTime: selected.start,
        service,
        dentist: kind === "new" ? chosenDentist?.id : undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setConfirming(false);
    if (res.ok) {
      sessionStorage.setItem("booking_confirmed", selected.start);
      sessionStorage.removeItem("booking_token");
      router.push("/book/success");
    } else {
      setError(data.error || "Eroare la confirmare");
      loadSlots(token, kind === "new" ? chosenDentist?.id ?? null : null, week?.slice(0, 10));
    }
  }

  const serviceLabel = PUBLIC_SERVICES.find((s) => s.value === service)?.label;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <StepIndicator step={step} isNew={kind === "new"} />
        <div className="animate-fade-up">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
            {firstName ? `Bună, ${firstName}!` : "Programare"}
          </h1>
          <p className="text-on-surface-variant">
            {step === "service" && "Alege serviciul dorit."}
            {step === "dentist" && "Alege medicul."}
            {step === "slots" &&
              `${serviceLabel ?? "Serviciu"} · ${
                kind === "new" ? chosenDentist?.name ?? "" : assignedDentist
              }`}
          </p>
        </div>
      </div>

      {/* STEP 1: service */}
      {step === "service" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PUBLIC_SERVICES.map((s, i) => (
            <button
              key={s.value}
              onClick={() => pickService(s.value)}
              className={`animate-fade-up delay-${[75, 150, 225, 300, 450][i] ?? 300} group text-left p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3.5`}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e3f0ff] to-[#d4e3ff] text-[#0a6cdc] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name={SERVICE_ICONS[s.value] ?? "medical_services"} filled />
              </div>
              <span className="font-semibold">{s.label}</span>
              <Icon name="chevron_right" className="ml-auto text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      )}

      {/* STEP 2 (new patient): dentist */}
      {step === "dentist" && (
        <div className="space-y-3">
          {dentists.length === 0 ? (
            <Card className="p-6 text-center text-on-surface-variant animate-fade-in">Se încarcă medicii...</Card>
          ) : (
            dentists.map((d, i) => (
              <button
                key={d.id}
                onClick={() => pickDentist(d)}
                className={`animate-fade-up delay-${[75, 150, 225, 300][i] ?? 300} group w-full text-left p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3.5`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                  style={{ backgroundColor: d.color }}
                >
                  {d.name.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold block">{d.name}</span>
                  <span className="text-xs text-on-surface-variant">Medic stomatolog</span>
                </div>
                <Icon name="chevron_right" className="ml-auto text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
            ))
          )}
          <button
            onClick={() => setStep("service")}
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            ← Schimbă serviciul
          </button>
        </div>
      )}

      {/* STEP 3: slots */}
      {step === "slots" && (
        <>
          <Card className="p-3 flex items-center justify-between animate-fade-up">
            <button
              onClick={() => changeWeek(-7)}
              className="w-10 h-10 rounded-xl border border-outline-variant flex items-center justify-center hover:bg-surface-container hover:border-primary/40 transition-all"
              aria-label="Săptămâna anterioară"
            >
              <Icon name="chevron_left" />
            </button>
            <span className="font-bold text-sm flex items-center gap-2">
              <Icon name="date_range" className="!text-xl text-primary" />
              {week ? weekLabel(week) : "Săptămâna selectată"}
            </span>
            <button
              onClick={() => changeWeek(7)}
              className="w-10 h-10 rounded-xl border border-outline-variant flex items-center justify-center hover:bg-surface-container hover:border-primary/40 transition-all"
              aria-label="Săptămâna următoare"
            >
              <Icon name="chevron_right" />
            </button>
          </Card>

          {error && (
            <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 animate-fade-in">{error}</div>
          )}

          {loading ? (
            <Card className="p-10 text-center text-on-surface-variant animate-fade-in">
              <Icon name="progress_activity" className="!text-3xl animate-spin mb-2" />
              <p>Se încarcă...</p>
            </Card>
          ) : days.length === 0 ? (
            <Card className="p-10 text-center text-on-surface-variant animate-fade-in">
              <Icon name="event_busy" className="!text-4xl mb-2" />
              <p>Niciun interval liber în această săptămână. Încearcă săptămâna următoare.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {days.map((day, di) => {
                const date = new Date(day.date);
                return (
                  <Card key={day.date} className={`p-4 animate-fade-up delay-${[75, 150, 225, 300, 450, 600][di] ?? 600}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white flex flex-col items-center justify-center shadow-md shadow-primary/20">
                        <span className="text-[10px] font-semibold leading-none mb-0.5">{DAY_LABELS_SHORT[date.getDay()]}</span>
                        <span className="font-bold leading-none">{date.getDate()}</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-sm">{MONTHS[date.getMonth()]} {date.getFullYear()}</span>
                        <span className="text-xs text-on-surface-variant">{day.slots.length} intervale libere</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {day.slots.map((slot) => {
                        const active = selected?.start === slot.start;
                        return (
                          <button
                            key={slot.start}
                            onClick={() => setSelected(slot)}
                            className={`h-11 rounded-xl text-sm font-semibold border transition-all ${
                              active
                                ? "bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white border-transparent shadow-md shadow-primary/25 scale-[1.03]"
                                : "border-outline-variant hover:border-primary hover:text-primary hover:bg-primary-fixed/30"
                            }`}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setStep(kind === "new" ? "dentist" : "service")}
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            ← Înapoi
          </button>
        </>
      )}

      {step === "slots" && selected && (
        <div className="sticky bottom-4 z-30 animate-slide-up-sheet">
          <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-[#0a84ff]/60 to-[#00c389]/50 shadow-xl">
            <div className="glass rounded-[calc(1rem-1.5px)] p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-on-surface-variant font-medium">{serviceLabel}</p>
                <p className="font-bold truncate">
                  {new Date(selected.start).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })} · {selected.label}
                </p>
              </div>
              <Button icon="check" onClick={confirm} disabled={confirming} className="shrink-0">
                {confirming ? "..." : "Confirmă"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
