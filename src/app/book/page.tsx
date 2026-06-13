"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Field, Input } from "@/components/Field";
import { Button } from "@/components/ui";
import { SmileMascot } from "@/components/SmileMascot";
import { Reveal } from "@/components/Reveal";
import { BRAND_NAME } from "@/lib/brand";

const STEPS = [
  {
    title: "Introdu numărul de telefon",
    text: "Te recunoaștem dacă ești deja pacient și te programăm la medicul tău.",
    icon: "call",
  },
  {
    title: "Alege serviciul și ora",
    text: "Vezi doar intervalele cu adevărat libere din calendarul cabinetului.",
    icon: "calendar_month",
  },
  {
    title: "Primești confirmarea",
    text: "Pe loc, în mai puțin de un minut. Îți amintim înainte de vizită.",
    icon: "check_circle",
  },
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
    <div className="space-y-16 md:space-y-24">
      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center pt-2 md:pt-8">
        <div className="text-center lg:text-left order-2 lg:order-1">
          <p className="animate-fade-up inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-on-surface-variant mb-5">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-[#00c389] animate-pulse-ring" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#00c389]" />
            </span>
            Programare online · oricând
          </p>

          <h1 className="animate-fade-up delay-75 font-display text-[2.6rem] md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6 text-on-surface">
            Zâmbetul tău merită
            <br />
            <em className="text-gradient-primary font-medium">cea mai bună îngrijire</em>
          </h1>

          <p className="animate-fade-up delay-150 text-on-surface-variant text-base md:text-lg max-w-xl mx-auto lg:mx-0 mb-8">
            La {BRAND_NAME} te bucuri de tratamente stomatologice moderne, într-o atmosferă
            relaxată. Programează-te online în mai puțin de un minut.
          </p>

          <div className="animate-fade-up delay-225 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <a href="#programare">
              <Button icon="calendar_add_on" className="!h-14 !px-7 shadow-lg shadow-primary/25">
                Programează-te acum
              </Button>
            </a>
            <a
              href="#cum-functioneaza"
              className="h-12 px-6 rounded-xl font-semibold flex items-center gap-2 text-primary hover:bg-primary-fixed/50 transition-colors"
            >
              Vezi cum funcționează
              <Icon name="arrow_downward" className="!text-xl" />
            </a>
          </div>

          {/* Trust band */}
          <div className="animate-fade-up delay-300 mt-10 grid grid-cols-3 divide-x divide-outline-variant/60 border-y border-outline-variant/50">
            {[
              { big: "Sub 1 minut", small: "ca să te programezi" },
              { big: "Non-stop", small: "online, oricând" },
              { big: "Date protejate", small: "nimic nu e public" },
            ].map((t) => (
              <div key={t.big} className="py-4 px-2 text-center">
                <p className="font-semibold text-sm md:text-base">{t.big}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{t.small}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signature stage: animated mascot scene */}
        <div className="order-1 lg:order-2 animate-scale-in delay-150">
          <div className="relative overflow-hidden rounded-[2rem] border border-outline-variant/50 glass shadow-xl shadow-primary/10 px-6 pt-10 pb-7 max-w-md mx-auto">
            <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#0a84ff]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-[#00c389]/10 blur-3xl" />
            <SmileMascot />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cum-functioneaza" className="scroll-mt-24">
        <Reveal className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Cum funcționează</h2>
          <p className="text-on-surface-variant mt-2">Trei pași, fără telefoane și fără așteptare.</p>
        </Reveal>
        <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-4xl mx-auto">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-[#0a84ff]/40 via-outline-variant to-[#00c389]/40" aria-hidden />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <Reveal delay={i * 120} className="text-center px-2">
                <div className="relative inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white items-center justify-center shadow-lg shadow-primary/25 mb-4">
                  <Icon name={s.icon} filled />
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-primary text-xs font-bold flex items-center justify-center shadow border border-outline-variant/50">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold mb-1.5">{s.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-[17rem] mx-auto">{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* SERVICES */}
      <section id="servicii" className="scroll-mt-24">
        <Reveal className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Servicii disponibile online</h2>
          <p className="text-on-surface-variant mt-2">Alege serviciul potrivit și rezervă-ți locul.</p>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <a
                href="#programare"
                className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all"
              >
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e3f0ff] to-[#d4e3ff] text-[#0a6cdc] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon name={s.icon} filled className="!text-xl" />
                </span>
                <span className="font-semibold">{s.label}</span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BOOKING FORM */}
      <section id="programare" className="scroll-mt-24">
        <Reveal className="text-center mb-6">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-2">Începe acum</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            {isNew ? "Aproape gata" : "Începe programarea"}
          </h2>
          <p className="text-on-surface-variant mt-2 max-w-md mx-auto">
            {isNew
              ? "Nu te-am găsit în sistem. Completează datele ca să continui."
              : "Introdu numărul de telefon — te recunoaștem dacă ești deja pacient."}
          </p>
        </Reveal>

        <Reveal delay={120} className="max-w-md mx-auto">
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
        </Reveal>
      </section>
    </div>
  );
}
