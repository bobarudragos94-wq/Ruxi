export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBookingToken } from "@/lib/booking-token";
import { getWeekAvailableSlots } from "@/lib/slots";
import { startOfWeek } from "@/lib/date";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const weekParam = url.searchParams.get("week");
  const dentistParam = url.searchParams.get("dentist");

  const claim = await verifyBookingToken(token);
  if (!claim) return NextResponse.json({ error: "Sesiune expirată" }, { status: 401 });

  // Existing patient: their assigned dentist. New patient: the one they picked.
  let dentistId: string | null = null;
  if (claim.kind === "existing") {
    dentistId = claim.dentistId;
  } else if (dentistParam) {
    const dentist = await prisma.dentist.findFirst({
      where: { id: dentistParam, active: true },
      select: { id: true },
    });
    dentistId = dentist?.id ?? null;
  }
  if (!dentistId) return NextResponse.json({ error: "Medic invalid" }, { status: 400 });

  const base = weekParam ? new Date(weekParam) : new Date();
  const weekStart = startOfWeek(base);

  const week = await getWeekAvailableSlots(dentistId, weekStart);
  const result = week
    .map((d) => ({
      date: d.date.toISOString(),
      slots: d.slots.map((s) => ({ start: s.start.toISOString(), label: s.label })),
    }))
    .filter((d) => d.slots.length > 0);

  return NextResponse.json({ week: weekStart.toISOString(), days: result });
}
