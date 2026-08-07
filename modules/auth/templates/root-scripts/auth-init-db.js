/**
 * Cross-platform auth DB init — reads DATABASE_URL from auth-api/.env
 * (or the environment) and applies auth-api/scripts/init-db.sql via `pg`.
 *
 * Avoids `psql "$DATABASE_URL"` which breaks on Windows and falls back to
 * the OS username (e.g. Admin).
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const authApiRoot = path.join(projectRoot, "auth-api");
const sqlPath = path.join(authApiRoot, "scripts", "init-db.sql");
const envPath = path.join(authApiRoot, ".env");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function resolveDatabaseUrl() {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.trim();
  }
  const fileEnv = loadEnvFile(envPath);
  if (fileEnv.DATABASE_URL) {
    return fileEnv.DATABASE_URL;
  }
  return null;
}

async function loadPg() {
  const require = createRequire(path.join(authApiRoot, "package.json"));
  try {
    return require("pg");
  } catch {
    // Fall back to resolving from auth-api node_modules via path
    const candidate = path.join(authApiRoot, "node_modules", "pg", "lib", "index.js");
    if (fs.existsSync(candidate)) {
      return import(pathToFileURL(candidate).href);
    }
    throw new Error(
      'Cannot load "pg". Run: npm install --prefix auth-api',
    );
  }
}

async function main() {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    console.error("✖ DATABASE_URL is not set.");
    console.error("  1. Copy auth-api/.env.example → auth-api/.env");
    console.error(
      "  2. Set DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DBNAME",
    );
    console.error("  Example: postgresql://postgres:root@localhost:5432/landingscreen");
    process.exit(1);
  }

  if (!fs.existsSync(sqlPath)) {
    console.error(`✖ SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  // URL must include a database name (/dbname). Warn if missing.
  try {
    const u = new URL(databaseUrl);
    if (!u.pathname || u.pathname === "/") {
      console.error("✖ DATABASE_URL is missing a database name.");
      console.error(
        "  Use: postgresql://postgres:root@localhost:5432/YOUR_DB_NAME",
      );
      process.exit(1);
    }
  } catch {
    console.error("✖ DATABASE_URL is not a valid URL.");
    process.exit(1);
  }

  const pg = await loadPg();
  const { Client } = pg;
  const sql = fs.readFileSync(sqlPath, "utf8");
  const client = new Client({ connectionString: databaseUrl });

  console.log("Connecting and applying auth-api/scripts/init-db.sql …");
  await client.connect();
  try {
    await client.query(sql);
    console.log("✓ Auth database initialized.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("✖ auth:init-db failed:", error.message || error);
  process.exit(1);
});
