export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
  }

  try {
    const user = await authenticate(email, password);
    if (!user) {
      return NextResponse.json({ error: "Email sau parolă incorecte" }, { status: 401 });
    }

    await createSession(user);
    await logAudit({ userId: user.id, action: "LOGIN", entityType: "User", entityId: user.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Surface real errors (e.g. database connection) instead of a generic failure.
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "Eroare de server. Verificați conexiunea la baza de date." },
      { status: 500 }
    );
  }
}
