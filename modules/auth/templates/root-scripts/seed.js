import fs from "node:fs";
import path from "node:path";

import { BACKEND_DIR, ROOT } from "./lib/paths.js";
import { run } from "./lib/run.js";
import { databaseRequired, isNodeBackend, isPythonBackend } from "./lib/stack.js";

console.log("==> Seeding the database");

if (!databaseRequired) {
  console.log("No database selected. Nothing to seed.");
  process.exit(0);
}

let code = 0;

if (isNodeBackend) {
  code = run("npm", ["run", "db:seed"], { cwd: BACKEND_DIR });
  if (code !== 0) {
    process.exit(code);
  }
} else if (isPythonBackend) {
  console.log("The FastAPI backend seeds its initial data automatically on startup.");
  console.log("Start the backend (npm run dev:backend) to seed the database.");
} else {
  console.log("Unknown backend. Nothing to seed for main app.");
}

const seedAdmin = path.join(ROOT, "auth-api", "scripts", "seed-initial-admin.mjs");
if (fs.existsSync(seedAdmin)) {
  console.log("==> Creating initial Super Admin (if pending)");
  code = run("npm", ["run", "seed:initial-admin", "--prefix", "auth-api"], {
    cwd: ROOT,
  });
  if (code !== 0) {
    console.error("");
    console.error("Super Admin seed could not complete.");
    console.error("Finish database setup, then re-run: npm run seed");
    process.exit(code);
  }
}

process.exit(0);
