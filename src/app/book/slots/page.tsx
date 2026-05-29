"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Button, Card } from "@/components/ui";
import { DAY_LABELS_SHORT } from "@/lib/constants";

type Slot = { start: string; label: string };
type Day = { date: string; slots: Slot[] };

const MONTHS = ["Ian","Feb","Mar","Apr","Mai","Iun","Iul","Aug","Sep","Oct","Noi","Dec"];

export default function BookSlotsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [dentist, setDentist] = useState("");
  const [firstName, setFirstName] = useState("");
  const [days, setDays] = useState<Day[]>([]);
  const [week, setWeek] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const t = sessionStorage.getItem("booking_token");
    if (!t) {
      router.replace("/book");
      return;
    }
    setToken(t);
    setDentist(sessionStorage.getItem("booking_dentist") || "");
    setFirstName(sessionStorage.getItem("booking_firstName") || "");
  }, [router]);

  const loadSlots = useCallback(
    async (t: string, weekParam?: string) => {
      setLoading(true);
      setError("");
      const url = new URL("/api/book/slots", window.location.origin);
      url.searchParams.set("token", t);
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

  useEffect(() => {
    if (token) loadSlots(token);
  }, [token, loadSlots]);

  function changeWeek(deltaDays: number) {
    if (!token || !week) return;
    const d = new Date(week);
    d.setDate(d.getDate() + deltaDays);
    setSelected(null);
    loadSlots(token, d.toISOString().slice(0, 10));
  }

  async function confirm() {
    if (!token || !selected) return;
    setConfirming(true);
    setError("");
    const res = await fetch("/api/book/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, startTime: selected.start }),
    });
    const data = await res.json().catch(() => ({}));
    setConfirming(false);
    if (res.ok) {
      sessionStorage.setItem("booking_confirmed", selected.start);
      sessionStorage.removeItem("booking_token");
      router.push("/book/success");
    } else {
      setError(data.error || "Eroare la confirmare");
      if (token) loadSlots(token, week?.slice(0, 10));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          {firstName ? `Bună, ${firstName}!` : "Alege ora"}
        </h1>
        <p className="text-on-surface-variant">
          Intervale disponibile pentru medicul tău{dentist ? `: ${dentist}` : ""}.
        </p>
      </div>

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

      {selected && (
        <div className="sticky bottom-4">
          <Card className="p-4 flex items-center justify-between gap-3 shadow-lg">
            <div>
              <p className="text-xs text-on-surface-variant">Interval selectat</p>
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
