import { SignJWT, jwtVerify } from "jose";
import { getAuthSecret } from "./secret";

const secret = getAuthSecret();

/**
 * Booking context carried between public steps, signed so raw data isn't
 * tamperable in query strings. Two kinds:
 *  - existing: a known patient (we already have their id + assigned dentist)
 *  - new: an unknown phone; we keep the entered details and create the patient
 *    only on confirmation (so we don't fill the DB with leads that never book).
 * OTP can later be added as an extra claim/verification step.
 */
export type BookingClaim =
  | { kind: "existing"; patientId: string; dentistId: string }
  | { kind: "new"; fullName: string; phone: string; email?: string };

export async function createBookingToken(claim: BookingClaim): Promise<string> {
  return new SignJWT({ ...claim })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("20m")
    .sign(secret);
}

export async function verifyBookingToken(token: string): Promise<BookingClaim | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind === "existing") {
      return { kind: "existing", patientId: payload.patientId as string, dentistId: payload.dentistId as string };
    }
    if (payload.kind === "new") {
      return {
        kind: "new",
        fullName: payload.fullName as string,
        phone: payload.phone as string,
        email: (payload.email as string) || undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}
