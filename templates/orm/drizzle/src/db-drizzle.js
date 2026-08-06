import { asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { appInfo } from "../drizzle/schema.js";

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);

export async function connect() {
  await client.unsafe("SELECT 1");
}

export async function checkDatabase() {
  try {
    await client.unsafe("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function getAppInfo() {
  const rows = await db.select().from(appInfo).orderBy(asc(appInfo.createdAt)).limit(1);
  return rows[0] || null;
}

export async function seedIfEmpty(seedData) {
  const existing = await getAppInfo();
  if (existing) {
    return existing;
  }
  const inserted = await db.insert(appInfo).values(seedData).returning();
  return inserted[0];
}
