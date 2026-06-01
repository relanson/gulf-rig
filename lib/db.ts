// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
  const url       = process.env.DATABASE_URL       ?? "file:prisma/dev.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN ?? undefined;
  const adapter   = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
