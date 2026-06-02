import { createClient } from "@libsql/client";

// Defaults to local SQLite file; set DATABASE_URL + DATABASE_AUTH_TOKEN for Turso.
const url       = process.env.DATABASE_URL       ?? "file:prisma/dev.db";
const authToken = process.env.DATABASE_AUTH_TOKEN ?? undefined;

const client = createClient({ url, authToken });
console.log("Connecting to:", url);

try {
  await client.execute(`ALTER TABLE "JobPost" ADD COLUMN "sourceUrl" TEXT`);
  console.log("✅ Added sourceUrl column to JobPost.");
} catch (e) {
  const msg = String(e.message || e);
  if (msg.includes("duplicate column")) {
    console.log("ℹ️  Column sourceUrl already exists — nothing to do.");
  } else {
    console.error("❌ Migration failed:", msg);
    process.exit(1);
  }
}

client.close();
