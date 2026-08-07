import { ROOT } from "./lib/paths.js";
import { run } from "./lib/run.js";
import { BACKEND, FRONTEND_URL, PROJECT_NAME } from "./lib/stack.js";

console.log("");
console.log("Setting up " + PROJECT_NAME);
console.log("");
console.log("Checking your environment...");
console.log("");

run("node", ["scripts/doctor.js"], { cwd: ROOT });

console.log("");
console.log("Dependencies were installed during project generation.");
console.log("");
console.log("Next steps:");
console.log("  1. Create your database (if required) using any method you prefer");
console.log("  2. Confirm DATABASE_URL / MONGODB_URI in .env");
console.log("  3. npm run migrate   (when the database is reachable)");
console.log("  4. npm run seed");
console.log("  5. npm run dev:backend   (in one terminal)");
if (BACKEND === "Express") {
  console.log("  6. npm run dev:frontend  (in another terminal)");
} else {
  console.log("  6. npm run dev:frontend  (in another terminal)");
}
console.log("");
console.log("Then open the Setup Wizard at:");
console.log("  " + FRONTEND_URL);
console.log("");
console.log("The wizard shows what is already done and what to do next.");
console.log("");
