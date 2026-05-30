"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Field, Input } from "@/components/Field";
import { Button, Card } from "@/components/ui";

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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Programează-te online</h1>
        <p className="text-on-surface-variant">
          {isNew
            ? "Nu te-am găsit în sistem. Completează datele ca să continui."
            : "Introdu numărul de telefon pentru a continua."}
        </p>
      </div>

      <Card className="p-6 md:p-8 max-w-md mx-auto">
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
              <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">{error}</div>
            )}
            <Button type="submit" className="w-full" icon="arrow_forward" disabled={loading}>
              {loading ? "Se verifică..." : "Continuă"}
            </Button>
          </form>
        ) : (
          <form onSubmit={register} className="space-y-5">
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
              <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">{error}</div>
            )}
            <Button type="submit" className="w-full" icon="arrow_forward" disabled={loading}>
              {loading ? "Se continuă..." : "Continuă"}
            </Button>
            <button
              type="button"
              onClick={() => { setIsNew(false); setError(""); }}
              className="w-full text-sm text-on-surface-variant hover:text-primary"
            >
              ← Înapoi
            </button>
          </form>
        )}
      </Card>

      <div className="flex items-start gap-3 max-w-md mx-auto bg-surface-container rounded-lg p-4">
        <Icon name="lock" className="text-on-surface-variant" />
        <p className="text-sm text-on-surface-variant">
          Datele tale medicale nu sunt afișate. Folosim numărul doar pentru a-ți identifica medicul.
        </p>
      </div>
    </div>
  );
}
