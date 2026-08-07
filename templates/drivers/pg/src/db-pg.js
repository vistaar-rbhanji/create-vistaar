/**
 * Native PostgreSQL driver (no ORM) for Express AppInfo / health / seed.
 * Uses the `pg` package. Loaded by backend/src/db.js when DB_DRIVER=pg.
 */

import pg from "pg";

const { Pool } = pg;

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for the native PostgreSQL driver");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function connect() {
  const client = await getPool().connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

export async function checkDatabase() {
  try {
    await connect();
    return true;
  } catch {
    return false;
  }
}

async function ensureAppInfoTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS app_info (
      id TEXT PRIMARY KEY,
      "projectName" TEXT NOT NULL,
      frontend TEXT NOT NULL,
      backend TEXT NOT NULL,
      database TEXT NOT NULL,
      orm TEXT NOT NULL,
      "uiFramework" TEXT NOT NULL,
      authentication TEXT NOT NULL,
      docker TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectName: row.projectName,
    frontend: row.frontend,
    backend: row.backend,
    database: row.database,
    orm: row.orm,
    uiFramework: row.uiFramework,
    authentication: row.authentication,
    docker: row.docker,
    createdAt: row.createdAt,
  };
}

export async function getAppInfo() {
  const client = await getPool().connect();
  try {
    await ensureAppInfoTable(client);
    const result = await client.query(
      'SELECT * FROM app_info ORDER BY "createdAt" ASC LIMIT 1',
    );
    return mapRow(result.rows[0] ?? null);
  } finally {
    client.release();
  }
}

export async function seedIfEmpty(seedData) {
  const existing = await getAppInfo();
  if (existing) {
    return existing;
  }

  const client = await getPool().connect();
  try {
    await ensureAppInfoTable(client);
    const id = seedData.id || "seed-1";
    const result = await client.query(
      `INSERT INTO app_info (
        id, "projectName", frontend, backend, database, orm,
        "uiFramework", authentication, docker, "createdAt"
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        id,
        seedData.projectName,
        seedData.frontend,
        seedData.backend,
        seedData.database,
        seedData.orm,
        seedData.uiFramework,
        seedData.authentication,
        seedData.docker,
        seedData.createdAt ? new Date(seedData.createdAt) : new Date(),
      ],
    );
    return mapRow(result.rows[0]);
  } finally {
    client.release();
  }
}
