/**
 * Single source of truth for the signing secret used by sessions and booking
 * tokens. Fails closed in production: a missing/weak secret must never silently
 * fall back to a known value (that would let anyone forge cookies/tokens).
 */
let cached: Uint8Array | null = null;

export function getAuthSecret(): Uint8Array {
  if (cached) return cached;
  const value = process.env.AUTH_SECRET;

  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is missing or too short (min 32 chars) in production");
    }
    // Development-only fallback so local runs work without setup.
    cached = new TextEncoder().encode("dev-secret-change-me-please-32chars!!");
    return cached;
  }

  cached = new TextEncoder().encode(value);
  return cached;
}
