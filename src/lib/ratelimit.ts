/**
 * Basic in-memory rate limiter for the public booking endpoints.
 * NOTE: per-instance only; on serverless this is best-effort. For strong
 * guarantees use Redis/Upstash. Still valuable as a first abuse barrier.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Best-effort client IP. Prefer `x-real-ip` (set by the platform to the actual
 * connecting peer); fall back to the LAST entry of `x-forwarded-for` — the
 * platform appends the real IP there, while a client can only *prepend* spoofed
 * values, so the leftmost entry is untrusted.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}

export function rateLimit(key: string, limit = 5, windowMs = 60_000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
