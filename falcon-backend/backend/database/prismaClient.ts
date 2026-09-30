import { PrismaClient } from "@prisma/client";

/**
 * A single shared Prisma client for the whole process. In dev, Next-style
 * hot-reload would create a new client per reload and exhaust MySQL's
 * connection pool, so we cache it on `global` — harmless in production
 * where the module is only ever evaluated once anyway.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  // eslint-disable-next-line no-console
  console.log("[database] MySQL connected via Prisma");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
