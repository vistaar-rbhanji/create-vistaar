/**
 * Native MongoDB driver (no ODM) for Express AppInfo / health / seed.
 * Uses the `mongodb` package. Loaded by backend/src/db.js when DB_DRIVER=mongodb.
 */

import { MongoClient } from "mongodb";

let client = null;
let db = null;

function getUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/{{DB_NAME}}"
  );
}

export async function connect() {
  if (db) {
    return;
  }
  client = new MongoClient(getUri());
  await client.connect();
  db = client.db();
}

export async function checkDatabase() {
  try {
    await connect();
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function getAppInfo() {
  await connect();
  return db.collection("app_info").findOne({}, { sort: { createdAt: 1 } });
}

export async function seedIfEmpty(seedData) {
  const existing = await getAppInfo();
  if (existing) {
    return existing;
  }
  await connect();
  const record = {
    id: seedData.id || "seed-1",
    ...seedData,
    createdAt: seedData.createdAt
      ? new Date(seedData.createdAt)
      : new Date(),
  };
  await db.collection("app_info").insertOne(record);
  return record;
}
