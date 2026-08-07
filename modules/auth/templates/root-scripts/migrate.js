import fs from "node:fs";
import path from "node:path";

import { BACKEND_DIR, ROOT } from "./lib/paths.js";
import { run } from "./lib/run.js";
import { DATABASE, databaseRequired, isNodeBackend, isPythonBackend } from "./lib/stack.js";

console.log("==> Running database migration");

if (!databaseRequired) {
  console.log("No database selected. Nothing to migrate.");
  process.exit(0);
}

let code = 0;

if (isNodeBackend) {
  code = run("npm", ["run", "db:migrate"], { cwd: BACKEND_DIR });
  if (code !== 0) {
    process.exit(code);
  }
} else if (isPythonBackend) {
  console.log(DATABASE + " tables are created automatically when the FastAPI server starts.");
  console.log("Start the backend once (npm run dev:backend) to apply the schema.");
} else {
  console.log("Unknown backend. Skipping main-backend migration.");
}

const authInit = path.join(ROOT, "scripts", "auth-init-db.js");
if (fs.existsSync(authInit)) {
  console.log("==> Initializing auth-api schema + default roles");
  code = run("node", ["scripts/auth-init-db.js"], { cwd: ROOT });
  if (code !== 0) {
    console.error("");
    console.error("Auth database setup failed.");
    console.error("Check that PostgreSQL is running, the database exists,");
    console.error("and DATABASE_URL in auth-api/.env is correct.");
    process.exit(code);
  }
}

process.exit(0);
