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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{firstName ? `Bună, ${firstName}!` : "Programare"}</h1>
        <p className="text-on-surface-variant">
          {step === "service" && "Alege serviciul dorit."}
          {step === "dentist" && "Alege medicul."}
          {step === "slots" &&
            `${serviceLabel ?? "Serviciu"} · ${
              kind === "new" ? chosenDentist?.name ?? "" : assignedDentist
            }`}
        </p>
      </div>

      {/* STEP 1: service */}
      {step === "service" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          {PUBLIC_SERVICES.map((s) => (
            <button
              key={s.value}
              onClick={() => pickService(s.value)}
              className="text-left p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary hover:shadow-sm transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                <Icon name="medical_services" />
              </div>
              <span className="font-semibold">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* STEP 2 (new patient): dentist */}
      {step === "dentist" && (
        <div className="space-y-3 max-w-xl">
          {dentists.length === 0 ? (
            <Card className="p-6 text-center text-on-surface-variant">Se încarcă medicii...</Card>
          ) : (
            dentists.map((d) => (
              <button
                key={d.id}
                onClick={() => pickDentist(d)}
                className="w-full text-left p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary hover:shadow-sm transition-all flex items-center gap-3"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: d.color }}
                >
                  {d.name.charAt(0)}
                </div>
                <span className="font-semibold">{d.name}</span>
                <Icon name="chevron_right" className="ml-auto text-on-surface-variant" />
              </button>
            ))
          )}
          <button
            onClick={() => setStep("service")}
            className="text-sm text-on-surface-variant hover:text-primary"
          >
            ← Schimbă serviciul
          </button>
        </div>
      )}

      {/* STEP 3: slots */}
      {step === "slots" && (
        <>
          <Card className="p-4 flex items-center justify-between">
            <button onClick={() => changeWeek(-7)} className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:bg-surface-container">
              <Icon name="chevron_left" />
            </button>
            <span className="font-semibold text-sm">Săptămâna selectată</span>
            <button onClick={() => changeWeek(7)} className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:bg-surface-container">
              <Icon name="chevron_right" />
            </button>
          </Card>

          {error && (
            <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          {loading ? (
            <Card className="p-10 text-center text-on-surface-variant">Se încarcă...</Card>
          ) : days.length === 0 ? (
            <Card className="p-10 text-center text-on-surface-variant">
              <Icon name="event_busy" className="!text-4xl mb-2" />
              <p>Niciun interval liber în această săptămână. Încearcă săptămâna următoare.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {days.map((day) => {
                const date = new Date(day.date);
                return (
                  <Card key={day.date} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-fixed text-on-primary-fixed flex flex-col items-center justify-center">
                        <span className="text-[10px] font-semibold">{DAY_LABELS_SHORT[date.getDay()]}</span>
                        <span className="font-bold">{date.getDate()}</span>
                      </div>
                      <span className="text-sm text-on-surface-variant">{MONTHS[date.getMonth()]} {date.getFullYear()}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {day.slots.map((slot) => {
                        const active = selected?.start === slot.start;
                        return (
                          <button
                            key={slot.start}
                            onClick={() => setSelected(slot)}
                            className={`h-11 rounded-lg text-sm font-medium border transition-all ${
                              active
                                ? "bg-primary text-on-primary border-primary"
                                : "border-outline-variant hover:border-primary hover:text-primary"
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
            className="text-sm text-on-surface-variant hover:text-primary"
          >
            ← Înapoi
          </button>
        </>
      )}

      {step === "slots" && selected && (
        <div className="sticky bottom-4">
          <Card className="p-4 flex items-center justify-between gap-3 shadow-lg">
            <div>
              <p className="text-xs text-on-surface-variant">{serviceLabel}</p>
              <p className="font-semibold">
                {new Date(selected.start).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })} · {selected.label}
              </p>
            </div>
            <Button icon="check" onClick={confirm} disabled={confirming}>
              {confirming ? "..." : "Confirmă"}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
