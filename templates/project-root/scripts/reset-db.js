import fs from "node:fs";
import path from "node:path";

import { BACKEND_DIR, KICKSTACK_DIR } from "./lib/paths.js";
import { DATABASE, DB_DRIVER, DB_NAME, ORM, databaseRequired } from "./lib/stack.js";

console.log("==> Resetting local setup state");

if (fs.existsSync(KICKSTACK_DIR)) {
  fs.rmSync(KICKSTACK_DIR, { recursive: true, force: true });
  console.log("Removed " + KICKSTACK_DIR);
}

const appInfoFile = path.join(BACKEND_DIR, "data", "app-info.json");
if (DB_DRIVER === "file" && fs.existsSync(appInfoFile)) {
  fs.rmSync(appInfoFile);
  console.log("Removed " + appInfoFile);
}

if (!databaseRequired) {
  console.log("No database selected. Setup state has been reset.");
  process.exit(0);
}

console.log("");
if (ORM === "Prisma") {
  console.log("Prisma detected. To also reset the schema and data, run inside backend/:");
  console.log("  npx prisma db push --force-reset");
} else if (DATABASE === "PostgreSQL") {
  console.log("Drop and recreate the database manually, e.g.:");
  console.log("  dropdb " + DB_NAME + " && createdb " + DB_NAME);
} else if (DATABASE === "MongoDB") {
  console.log("Drop the MongoDB database manually, e.g. with db.dropDatabase() in the mongo shell.");
}

console.log("");
console.log("Setup markers cleared. The Setup Wizard will guide you through migrate + seed again.");
