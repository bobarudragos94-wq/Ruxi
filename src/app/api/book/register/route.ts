export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { createBookingToken } from "@/lib/booking-token";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Starts the booking flow for a NEW patient (phone not found at lookup).
 * Does not create the patient yet — only signs the entered details into a
 * token. The patient row is created on confirmation, together with the
 * appointment, so abandoned flows don't leave orphan records.
 */
export async function POST(req: Request) {
  const { allowed } = rateLimit(`book-register:${clientIp(req)}`, 8, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Prea multe încercări. Reîncercați mai târziu." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const nameInput = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phoneInput = typeof body.phone === "string" ? body.phone : "";
  const emailInput = typeof body.email === "string" ? body.email.trim() : "";

  const normalized = normalizePhone(phoneInput);

  if (nameInput.length < 2 || nameInput.length > 100) {
    return NextResponse.json({ error: "Introduceți numele complet" }, { status: 400 });
  }
  if (!normalized) {
    return NextResponse.json({ error: "Număr de telefon invalid" }, { status: 400 });
  }
  if (emailInput && (emailInput.length > 150 || !EMAIL_RE.test(emailInput))) {
    return NextResponse.json({ error: "Email invalid" }, { status: 400 });
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
    fullName: nameInput,
    phone: normalized,
    email: emailInput || undefined,
  });

  return NextResponse.json({ found: false, token, firstName: nameInput.split(" ")[0] });
}
