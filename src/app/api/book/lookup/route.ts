export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { createBookingToken } from "@/lib/booking-token";

export async function POST(req: Request) {
  const { allowed } = rateLimit(`book-lookup:${clientIp(req)}`, 8, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Prea multe încercări. Reîncercați mai târziu." },
      { status: 429 }
    );
  }

  const { phone } = await req.json().catch(() => ({}));
  const normalized = normalizePhone(phone || "");
  if (!normalized) {
    return NextResponse.json({ error: "Număr de telefon invalid (ex: 0722 123 456)" }, { status: 400 });
  }

  const patient = await prisma.patient.findFirst({
    where: { phone: normalized },
    include: { assignedDentist: true },
  });

  // Known patient with an active assigned dentist -> straight to their slots.
  if (patient && patient.assignedDentist && patient.assignedDentist.active) {
    const token = await createBookingToken({
      kind: "existing",
      patientId: patient.id,
      dentistId: patient.assignedDentist.id,
    });
    const firstName = patient.fullName.split(" ").slice(-1)[0];
    return NextResponse.json({
      found: true,
      token,
      firstName,
      dentistName: patient.assignedDentist.name,
    });
  }

  // Unknown phone (or patient without an active dentist) -> new-patient flow.
  return NextResponse.json({ found: false });
}
