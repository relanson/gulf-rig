import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

console.log("Connecting to Turso...");

await client.batch([
  `CREATE TABLE IF NOT EXISTS "JobPost" (
    "id"                TEXT     NOT NULL PRIMARY KEY,
    "status"            TEXT     NOT NULL DEFAULT 'pending',
    "postType"          TEXT     NOT NULL,
    "imageUrl"          TEXT,
    "jobTitle"          TEXT     NOT NULL DEFAULT '',
    "description"       TEXT,
    "projectType"       TEXT     NOT NULL DEFAULT '',
    "customProjectType" TEXT,
    "industry"          TEXT,
    "customIndustry"    TEXT,
    "currency"          TEXT     NOT NULL DEFAULT 'USD',
    "salary"            TEXT     NOT NULL DEFAULT '',
    "experience"        TEXT     NOT NULL DEFAULT '',
    "qualification"     TEXT     NOT NULL DEFAULT '',
    "location"          TEXT     NOT NULL DEFAULT '',
    "companyName"       TEXT     NOT NULL DEFAULT '',
    "posterName"        TEXT,
    "posterPhone"       TEXT,
    "posterEmail"       TEXT,
    "createdAt"         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt"        DATETIME,
    "viewCount"         INTEGER  NOT NULL DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id"         TEXT     NOT NULL PRIMARY KEY,
    "jobPostId"  TEXT     NOT NULL,
    "name"       TEXT     NOT NULL,
    "phone"      TEXT     NOT NULL,
    "email"      TEXT     NOT NULL,
    "resumeLink" TEXT,
    "message"    TEXT,
    "appliedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("jobPostId") REFERENCES "JobPost" ("id") ON DELETE CASCADE
  )`,
], "write");

console.log("✅ Tables created successfully on Turso!");
client.close();
