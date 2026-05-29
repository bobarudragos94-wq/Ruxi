"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Field, Input } from "@/components/Field";
import { Button, Card } from "@/components/ui";

export default function BookPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
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
    if (res.ok && data.token) {
      sessionStorage.setItem("booking_token", data.token);
      sessionStorage.setItem("booking_firstName", data.firstName || "");
      sessionStorage.setItem("booking_dentist", data.dentistName || "");
      router.push("/book/slots");
    } else {
      setError(data.error || "A apărut o eroare. Încercați din nou.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Programează-te online</h1>
        <p className="text-on-surface-variant">
          Introdu numărul de telefon pentru a vedea intervalele disponibile.
        </p>
      </div>

      <Card className="p-6 md:p-8 max-w-md mx-auto">
        <form onSubmit={submit} className="space-y-5">
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
          <Button type="submit" className="w-full" icon="search" disabled={loading}>
            {loading ? "Se caută..." : "Caută intervale"}
          </Button>
        </form>
      </Card>

      <div className="flex items-start gap-3 max-w-md mx-auto bg-surface-container rounded-lg p-4">
        <Icon name="lock" className="text-on-surface-variant" />
        <p className="text-sm text-on-surface-variant">
          Datele tale medicale nu sunt afișate. Folosim numărul doar pentru a-ți identifica medicul curant.
        </p>
      </div>
    </div>
  );
}
