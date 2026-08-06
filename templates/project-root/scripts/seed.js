import { BACKEND_DIR } from "./lib/paths.js";
import { run } from "./lib/run.js";
import { databaseRequired, isNodeBackend, isPythonBackend } from "./lib/stack.js";

console.log("==> Seeding the database");

if (!databaseRequired) {
  console.log("No database selected. Nothing to seed.");
  process.exit(0);
}

if (isNodeBackend) {
  process.exit(run("npm", ["run", "db:seed"], { cwd: BACKEND_DIR }));
}

if (isPythonBackend) {
  console.log("The FastAPI backend seeds its initial data automatically on startup.");
  console.log("Start the backend (npm run dev:backend) to seed the database.");
  process.exit(0);
}

console.log("Unknown backend. Nothing to seed.");
