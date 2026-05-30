import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });

// Reuse a single client across warm serverless invocations to avoid exhausting
// the connection pool (important on Netlify/Lambda + Supabase pooler).
globalForPrisma.prisma = prisma;
