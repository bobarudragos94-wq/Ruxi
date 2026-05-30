export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBookingToken } from "@/lib/booking-token";

/** Active dentists, for a new patient to choose from. Requires a valid booking token. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const claim = await verifyBookingToken(token);
  if (!claim) return NextResponse.json({ error: "Sesiune expirată" }, { status: 401 });

  const dentists = await prisma.dentist.findMany({
    where: { active: true },
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ dentists });
}
