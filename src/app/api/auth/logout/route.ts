import { NextResponse } from "next/server";
import { getSession, destroySession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const user = await getSession();
  await destroySession();
  if (user) await logAudit({ userId: user.id, action: "LOGOUT", entityType: "User", entityId: user.id });
  return NextResponse.redirect(new URL("/login", req.url));
}
