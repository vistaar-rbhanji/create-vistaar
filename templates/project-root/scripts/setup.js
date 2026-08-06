import { ROOT } from "./lib/paths.js";
import { run } from "./lib/run.js";
import { BACKEND, FRONTEND_URL, PROJECT_NAME } from "./lib/stack.js";

console.log("");
console.log("🚀 Setting up " + PROJECT_NAME);
console.log("");
console.log("Checking your environment...");
console.log("");

run("node", ["scripts/doctor.js"], { cwd: ROOT });

console.log("");
console.log("Next steps:");
console.log("  1. npm install --prefix frontend");
if (BACKEND === "Express") {
  console.log("  2. npm install --prefix backend");
} else if (BACKEND === "FastAPI") {
  console.log("  2. pip install -r backend/requirements.txt (inside a virtual environment)");
}
console.log("  3. npm run dev:backend   (in one terminal)");
console.log("  4. npm run dev:frontend  (in another terminal)");
console.log("");
console.log("Then open the Setup Wizard at:");
console.log("  " + FRONTEND_URL);
console.log("");
console.log("The wizard walks you through creating the database, running migrations,");
console.log("and seeding data — no extra docs required.");
console.log("");
