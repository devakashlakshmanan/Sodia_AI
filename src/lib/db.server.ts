"use server";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isServer = typeof window === "undefined" && typeof process !== "undefined";

export const prisma = isServer
  ? (globalForPrisma.prisma ??
    new PrismaClient({
      log: typeof process !== "undefined" && process.env?.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    }))
  : (null as unknown as PrismaClient);

if (isServer && typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
