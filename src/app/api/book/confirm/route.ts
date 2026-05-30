export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBookingToken } from "@/lib/booking-token";
import { generateSlotsForDay } from "@/lib/slots";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const { token, startTime } = await req.json().catch(() => ({}));
  const claim = await verifyBookingToken(token || "");
  if (!claim) return NextResponse.json({ error: "Sesiune expirată" }, { status: 401 });
  if (!startTime) return NextResponse.json({ error: "Interval lipsă" }, { status: 400 });

  const start = new Date(startTime);

  // Validate the slot belongs to the dentist's schedule.
  const slots = await generateSlotsForDay(claim.dentistId, start);
  const slot = slots.find((s) => s.start.getTime() === start.getTime());
  if (!slot) return NextResponse.json({ error: "Interval indisponibil" }, { status: 400 });
  if (slot.start < new Date()) return NextResponse.json({ error: "Interval expirat" }, { status: 400 });

  // Re-check availability to avoid race / double booking.
  const clash = await prisma.appointment.findFirst({
    where: {
      dentistId: claim.dentistId,
      status: { not: "CANCELLED" },
      startTime: { lt: slot.end },
      endTime: { gt: slot.start },
    },
  });
  if (clash) return NextResponse.json({ error: "Intervalul tocmai a fost ocupat" }, { status: 409 });

  const appt = await prisma.appointment.create({
    data: {
      patientId: claim.patientId,
      dentistId: claim.dentistId,
      startTime: slot.start,
      endTime: slot.end,
      status: "SCHEDULED",
      procedureType: "Programare online",
    },
  });

  // Mark any pending recall as booked.
  await prisma.recallReminder.updateMany({
    where: { patientId: claim.patientId, status: { in: ["PENDING", "SENT"] } },
    data: { status: "BOOKED" },
  });

  await logAudit({
    action: "PUBLIC_BOOKING",
    entityType: "Appointment",
    entityId: appt.id,
    metadata: { source: "public" },
  });

  return NextResponse.json({ ok: true, startTime: slot.start.toISOString() });
}
