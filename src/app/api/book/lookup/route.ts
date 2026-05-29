import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { rateLimit } from "@/lib/ratelimit";
import { createBookingToken } from "@/lib/booking-token";

const GENERIC_ERROR =
  "Nu am găsit un pacient cu acest număr. Vă rugăm contactați cabinetul telefonic.";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`book-lookup:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Prea multe încercări. Reîncercați mai târziu." },
      { status: 429 }
    );
  }

  const { phone } = await req.json().catch(() => ({}));
  const normalized = normalizePhone(phone || "");
  if (!normalized) {
    // Generic message; don't reveal validation specifics that aid enumeration.
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
  }

  const patient = await prisma.patient.findFirst({
    where: { phone: normalized },
    include: { assignedDentist: true },
  });

  // Generic error whether not found or no active dentist — no enumeration.
  if (!patient || !patient.assignedDentist || !patient.assignedDentist.active) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
  }

  const token = await createBookingToken({
    patientId: patient.id,
    dentistId: patient.assignedDentist.id,
  });

  // Only expose first name + dentist info. No medical data, no IDs.
  const firstName = patient.fullName.split(" ").slice(-1)[0];
  return NextResponse.json({
    token,
    firstName,
    dentistName: patient.assignedDentist.name,
  });
}
