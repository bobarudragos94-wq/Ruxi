"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Field, Input } from "@/components/Field";
import { Button } from "@/components/ui";
import { SmileMascot } from "@/components/SmileMascot";
import { BRAND_NAME } from "@/lib/brand";

const HIGHLIGHTS = [
  { icon: "event_available", title: "Programare în 1 minut", text: "Alegi serviciul, vezi intervalele libere și confirmi. Fără telefoane, fără așteptare." },
  { icon: "family_restroom", title: "Medicul tău, mereu", text: "Dacă ești deja pacient, te programăm automat la medicul care îți cunoaște istoricul." },
  { icon: "notifications_active", title: "Remindere de control", text: "Îți amintim când e timpul pentru următorul control, ca să nu ratezi nimic." },
];

const SERVICES = [
  { icon: "stethoscope", label: "Control" },
  { icon: "auto_awesome", label: "Detartraj" },
  { icon: "healing", label: "Plombă" },
  { icon: "medical_services", label: "Extracție" },
  { icon: "vital_signs", label: "Tratament canal" },
];

export default function BookPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isNew, setIsNew] = useState(false); // show new-patient fields
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function goToSlots(data: { token: string; kind: "existing" | "new"; firstName?: string; dentistName?: string }) {
    sessionStorage.setItem("booking_token", data.token);
    sessionStorage.setItem("booking_kind", data.kind);
    sessionStorage.setItem("booking_firstName", data.firstName || "");
    sessionStorage.setItem("booking_dentist", data.dentistName || "");
    router.push("/book/slots");
  }

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/book/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "A apărut o eroare. Încercați din nou.");
      return;
    }
    if (data.found) {
      goToSlots({ token: data.token, kind: "existing", firstName: data.firstName, dentistName: data.dentistName });
    } else {
      // Unknown phone → ask for name/email to continue as a new patient.
      setIsNew(true);
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/book/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, email }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "A apărut o eroare.");
      return;
    }
    goToSlots({
      token: data.token,
      kind: data.found ? "existing" : "new",
      firstName: data.firstName,
      dentistName: data.dentistName,
    });
  }

  return (
    <div className="space-y-14 md:space-y-20">
      {/* HERO */}
      <section className="text-center pt-2 md:pt-6">
        <div className="animate-scale-in mb-2">
          <SmileMascot />
        </div>

        <div className="animate-fade-up inline-flex items-center gap-2 bg-primary-fixed/70 text-on-primary-fixed-variant text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-[#00c389] animate-pulse-ring" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-[#00c389]" />
          </span>
          Programare online, disponibilă oricând
        </div>

        <h1 className="animate-fade-up delay-75 text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
          Zâmbetul tău merită
          <br />
          <span className="text-gradient-primary">cea mai bună îngrijire</span>
        </h1>

        <p className="animate-fade-up delay-150 text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto mb-8">
          La {BRAND_NAME} te bucuri de tratamente stomatologice moderne, într-o atmosferă relaxată.
          Programează-te online în mai puțin de un minut.
        </p>

        <div className="animate-fade-up delay-225 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#programare">
            <Button icon="calendar_add_on" className="!h-14 !px-7 shadow-lg shadow-primary/25">
              Programează-te acum
            </Button>
          </a>
          <a
            href="#servicii"
            className="h-12 px-6 rounded-xl font-semibold flex items-center gap-2 text-primary hover:bg-primary-fixed/50 transition-colors"
          >
            Vezi serviciile
            <Icon name="arrow_downward" className="!text-xl" />
          </a>
        </div>

        {/* Trust strip */}
        <div className="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-on-surface-variant">
          <span className="flex items-center gap-2">
            <Icon name="workspace_premium" className="!text-xl text-[#e06a00]" filled />
            Echipament modern
          </span>
          <span className="flex items-center gap-2">
            <Icon name="sentiment_satisfied" className="!text-xl text-[#00875a]" filled />
            Pacienți mulțumiți
          </span>
          <span className="flex items-center gap-2">
            <Icon name="schedule" className="!text-xl text-[#0a6cdc]" filled />
            Punctualitate garantată
          </span>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicii" className="scroll-mt-24">
        <div className="text-center mb-7">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Servicii disponibile online</h2>
          <p className="text-on-surface-variant mt-2">Alege serviciul potrivit și rezervă-ți locul.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {SERVICES.map((s, i) => (
            <a
              key={s.label}
              href="#programare"
              className={`animate-fade-up delay-${[75, 150, 225, 300, 450][i] ?? 300} group flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all`}
            >
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e3f0ff] to-[#d4e3ff] text-[#0a6cdc] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name={s.icon} filled className="!text-xl" />
              </span>
              <span className="font-semibold">{s.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {HIGHLIGHTS.map((h, i) => (
          <div
            key={h.title}
            className={`animate-fade-up delay-${[150, 300, 450][i]} bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white flex items-center justify-center mb-4 shadow-md shadow-primary/20">
              <Icon name={h.icon} filled />
            </div>
            <h3 className="font-bold text-lg mb-1.5">{h.title}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{h.text}</p>
          </div>
        ))}
      </section>

      {/* BOOKING FORM */}
      <section id="programare" className="scroll-mt-24">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isNew ? "Aproape gata" : "Începe programarea"}
          </h2>
          <p className="text-on-surface-variant mt-2 max-w-md mx-auto">
            {isNew
              ? "Nu te-am găsit în sistem. Completează datele ca să continui."
              : "Introdu numărul de telefon — te recunoaștem dacă ești deja pacient."}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-br from-[#0a84ff]/50 via-outline-variant to-[#00c389]/40 shadow-xl shadow-primary/10">
            <div className="glass rounded-[calc(1.5rem-1.5px)] p-6 md:p-8">
              {!isNew ? (
                <form onSubmit={lookup} className="space-y-5">
                  <Field label="Număr de telefon" htmlFor="phone" hint="Ex: 0722 123 456">
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07xx xxx xxx"
                      required
                      autoComplete="tel"
                    />
                  </Field>
                  {error && (
                    <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 animate-fade-in">{error}</div>
                  )}
                  <Button type="submit" className="w-full" icon="arrow_forward" disabled={loading}>
                    {loading ? "Se verifică..." : "Continuă"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={register} className="space-y-5 animate-fade-in">
                  <Field label="Nume complet" htmlFor="fullName">
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nume Prenume"
                      required
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Număr de telefon" htmlFor="phone2">
                    <Input id="phone2" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </Field>
                  <Field label="Email (opțional)" htmlFor="email" hint="Pentru remindere de control">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplu.ro"
                      autoComplete="email"
                    />
                  </Field>
                  {error && (
                    <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 animate-fade-in">{error}</div>
                  )}
                  <Button type="submit" className="w-full" icon="arrow_forward" disabled={loading}>
                    {loading ? "Se continuă..." : "Continuă"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setIsNew(false); setError(""); }}
                    className="w-full text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    ← Înapoi
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 mt-5 bg-surface-container/70 rounded-2xl p-4">
            <Icon name="lock" className="text-on-surface-variant !text-xl mt-0.5" />
            <p className="text-sm text-on-surface-variant">
              Datele tale medicale nu sunt afișate. Folosim numărul doar pentru a-ți identifica medicul.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
