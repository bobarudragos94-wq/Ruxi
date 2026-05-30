export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { rateLimit } from "@/lib/ratelimit";
import { createBookingToken } from "@/lib/booking-token";

/**
 * Starts the booking flow for a NEW patient (phone not found at lookup).
 * Does not create the patient yet — only signs the entered details into a
 * token. The patient row is created on confirmation, together with the
 * appointment, so abandoned flows don't leave orphan records.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`book-register:${ip}`, 8, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Prea multe încercări. Reîncercați mai târziu." }, { status: 429 });
  }

  const { fullName, phone, email } = await req.json().catch(() => ({}));
  const cleanName = (fullName || "").trim();
  const normalized = normalizePhone(phone || "");

  if (cleanName.length < 2) {
    return NextResponse.json({ error: "Introduceți numele complet" }, { status: 400 });
  }
  if (!normalized) {
    return NextResponse.json({ error: "Număr de telefon invalid" }, { status: 400 });
  }

  // If the phone actually exists and has an active dentist, route as existing.
  const existing = await prisma.patient.findFirst({
    where: { phone: normalized },
    include: { assignedDentist: true },
  });
  if (existing && existing.assignedDentist && existing.assignedDentist.active) {
    const token = await createBookingToken({
      kind: "existing",
      patientId: existing.id,
      dentistId: existing.assignedDentist.id,
    });
    return NextResponse.json({
      found: true,
      token,
      firstName: existing.fullName.split(" ").slice(-1)[0],
      dentistName: existing.assignedDentist.name,
    });
  }

  const token = await createBookingToken({
    kind: "new",
    fullName: cleanName,
    phone: normalized,
    email: (email || "").trim() || undefined,
  });

  return NextResponse.json({ found: false, token, firstName: cleanName.split(" ")[0] });
}
