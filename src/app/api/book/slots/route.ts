export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyBookingToken } from "@/lib/booking-token";
import { getWeekAvailableSlots } from "@/lib/slots";
import { startOfWeek } from "@/lib/date";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const weekParam = url.searchParams.get("week");

  const claim = await verifyBookingToken(token);
  if (!claim) return NextResponse.json({ error: "Sesiune expirată" }, { status: 401 });

  const base = weekParam ? new Date(weekParam) : new Date();
  const weekStart = startOfWeek(base);

  // 2 DB queries for the whole week instead of one per day.
  const week = await getWeekAvailableSlots(claim.dentistId, weekStart);
  const result = week
    .map((d) => ({
      date: d.date.toISOString(),
      slots: d.slots.map((s) => ({ start: s.start.toISOString(), label: s.label })),
    }))
    .filter((d) => d.slots.length > 0);

  return NextResponse.json({ week: weekStart.toISOString(), days: result });
}
