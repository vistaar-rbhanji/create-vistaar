import { BACKEND_DIR } from "./lib/paths.js";
import { run } from "./lib/run.js";
import { DATABASE, databaseRequired, isNodeBackend, isPythonBackend } from "./lib/stack.js";

console.log("==> Running database migration");

if (!databaseRequired) {
  console.log("No database selected. Nothing to migrate.");
  process.exit(0);
}

if (isNodeBackend) {
  process.exit(run("npm", ["run", "db:migrate"], { cwd: BACKEND_DIR }));
}

if (isPythonBackend) {
  console.log(DATABASE + " tables are created automatically when the FastAPI server starts.");
  console.log("Start the backend once (npm run dev:backend) to apply the schema.");
  process.exit(0);
}

console.log("Unknown backend. Skipping migration.");
