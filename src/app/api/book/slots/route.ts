export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyBookingToken } from "@/lib/booking-token";
import { getAvailableSlots } from "@/lib/slots";
import { addDays, startOfWeek } from "@/lib/date";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const weekParam = url.searchParams.get("week");

  const claim = await verifyBookingToken(token);
  if (!claim) return NextResponse.json({ error: "Sesiune expirată" }, { status: 401 });

  const base = weekParam ? new Date(weekParam) : new Date();
  const weekStart = startOfWeek(base);
  const days = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  const result = await Promise.all(
    days.map(async (day) => {
      const slots = await getAvailableSlots(claim.dentistId, day);
      return {
        date: day.toISOString(),
        slots: slots.map((s) => ({ start: s.start.toISOString(), label: s.label })),
      };
    })
  );

  return NextResponse.json({ week: weekStart.toISOString(), days: result.filter((d) => d.slots.length > 0) });
}
