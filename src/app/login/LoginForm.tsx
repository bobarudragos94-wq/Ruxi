"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Field, Input } from "@/components/Field";
import { Button } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("admin@cabinet.ro");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(params.get("next") || "/dashboard");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Autentificare eșuată");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@cabinet.ro"
          required
          autoComplete="email"
        />
      </Field>
      <Field label="Parolă" htmlFor="password">
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </Field>
      {error && (
        <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">{error}</div>
      )}
      <Button type="submit" className="w-full" icon="login" disabled={loading}>
        {loading ? "Se autentifică..." : "Autentificare"}
      </Button>
    </form>
  );
}
