import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
  }

  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.json({ error: "Email sau parolă incorecte" }, { status: 401 });
  }

  await createSession(user);
  await logAudit({ userId: user.id, action: "LOGIN", entityType: "User", entityId: user.id });
  return NextResponse.json({ ok: true });
}
