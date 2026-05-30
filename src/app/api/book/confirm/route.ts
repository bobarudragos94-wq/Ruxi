export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBookingToken } from "@/lib/booking-token";
import { generateSlotsForDay } from "@/lib/slots";
import { logAudit } from "@/lib/audit";
import { publicServiceLabel } from "@/lib/constants";

export async function POST(req: Request) {
  const { token, startTime, service, dentist } = await req.json().catch(() => ({}));
  const claim = await verifyBookingToken(token || "");
  if (!claim) return NextResponse.json({ error: "Sesiune expirată" }, { status: 401 });
  if (!startTime) return NextResponse.json({ error: "Interval lipsă" }, { status: 400 });

  const serviceLabel = publicServiceLabel(service || "");
  if (!serviceLabel) return NextResponse.json({ error: "Selectați un serviciu" }, { status: 400 });

  // Resolve the dentist: assigned (existing) or the chosen one (new patient).
  let dentistId: string | null = null;
  if (claim.kind === "existing") {
    dentistId = claim.dentistId;
  } else {
    const found = await prisma.dentist.findFirst({ where: { id: dentist, active: true }, select: { id: true } });
    dentistId = found?.id ?? null;
  }
  if (!dentistId) return NextResponse.json({ error: "Medic invalid" }, { status: 400 });

  const start = new Date(startTime);

  // Validate the slot belongs to the dentist's schedule and is in the future.
  const slots = await generateSlotsForDay(dentistId, start);
  const slot = slots.find((s) => s.start.getTime() === start.getTime());
  if (!slot) return NextResponse.json({ error: "Interval indisponibil" }, { status: 400 });
  if (slot.start < new Date()) return NextResponse.json({ error: "Interval expirat" }, { status: 400 });

  // Re-check availability to avoid race / double booking.
  const clash = await prisma.appointment.findFirst({
    where: {
      dentistId,
      status: { not: "CANCELLED" },
      startTime: { lt: slot.end },
      endTime: { gt: slot.start },
    },
  });
  if (clash) return NextResponse.json({ error: "Intervalul tocmai a fost ocupat" }, { status: 409 });

  // Resolve / create the patient.
  let patientId: string;
  let isNewPatient = false;
  if (claim.kind === "existing") {
    patientId = claim.patientId;
  } else {
    // New patient: create now, assigned to the chosen dentist, flagged for staff review.
    const created = await prisma.patient.create({
      data: {
        fullName: claim.fullName,
        phone: claim.phone,
        email: claim.email ?? null,
        assignedDentistId: dentistId,
        isNew: true,
      },
    });
    patientId = created.id;
    isNewPatient = true;
  }

  const appt = await prisma.appointment.create({
    data: {
      patientId,
      dentistId,
      startTime: slot.start,
      endTime: slot.end,
      status: "SCHEDULED",
      procedureType: serviceLabel,
      notes: "Programare online",
    },
  });

  // Existing patients: a fulfilled recall becomes "booked".
  if (claim.kind === "existing") {
    await prisma.recallReminder.updateMany({
      where: { patientId, status: { in: ["PENDING", "SENT"] } },
      data: { status: "BOOKED" },
    });
  }

  await logAudit({
    action: isNewPatient ? "PUBLIC_BOOKING_NEW_PATIENT" : "PUBLIC_BOOKING",
    entityType: "Appointment",
    entityId: appt.id,
    metadata: { source: "public", service: serviceLabel, isNewPatient },
  });

  return NextResponse.json({ ok: true, startTime: slot.start.toISOString() });
}
