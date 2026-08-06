import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { mark } from "./mark-setup.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRIVER = process.env.DB_DRIVER || "{{DB_DRIVER}}";
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "app-info.json");

let driverPromise = null;

function loadDriver() {
  if (DRIVER === "file") {
    return Promise.resolve(null);
  }
  if (!driverPromise) {
    driverPromise = import("./db-" + DRIVER + ".js").catch((error) => {
      console.error('[db] Failed to load driver "' + DRIVER + '": ' + error.message);
      return null;
    });
  }
  return driverPromise;
}

async function ensureFileStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(null), "utf8");
  }
}

export function getDriverName() {
  return DRIVER;
}

export async function connect() {
  if (DRIVER === "file") {
    await ensureFileStore();
    return;
  }
  const driver = await loadDriver();
  if (driver && driver.connect) {
    await driver.connect();
  }
}

export async function checkDatabase() {
  if (DRIVER === "file") {
    try {
      await ensureFileStore();
      return true;
    } catch {
      return false;
    }
  }
  const driver = await loadDriver();
  if (!driver) {
    return false;
  }
  try {
    return await driver.checkDatabase();
  } catch {
    return false;
  }
}

export async function getAppInfo() {
  if (DRIVER === "file") {
    await ensureFileStore();
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  }
  const driver = await loadDriver();
  if (!driver) {
    return null;
  }
  return driver.getAppInfo();
}

export async function seedIfEmpty(seedData) {
  if (DRIVER === "file") {
    await ensureFileStore();
    const existing = await getAppInfo();
    if (existing) {
      return existing;
    }
    const record = Object.assign({ id: "seed-1" }, seedData);
    await fs.writeFile(DATA_FILE, JSON.stringify(record, null, 2), "utf8");
    mark("seeded");
    return record;
  }
  const driver = await loadDriver();
  if (!driver) {
    return null;
  }
  const record = await driver.seedIfEmpty(seedData);
  if (record) {
    mark("seeded");
  }
  return record;
}
