import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me-please-32chars!!"
);

export interface BookingClaim {
  patientId: string;
  dentistId: string;
}

/**
 * Short-lived signed token used to carry booking context between public
 * booking steps without exposing raw patient IDs in plain query strings.
 * OTP can later be added as an additional claim/verification step.
 */
export async function createBookingToken(claim: BookingClaim): Promise<string> {
  return new SignJWT({ ...claim })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifyBookingToken(token: string): Promise<BookingClaim | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { patientId: payload.patientId as string, dentistId: payload.dentistId as string };
  } catch {
    return null;
  }
}
