import { BACKEND_DIR } from "./lib/paths.js";
import { run } from "./lib/run.js";
import { BACKEND_PORT, isNodeBackend, isPythonBackend } from "./lib/stack.js";

if (isNodeBackend) {
  process.exit(run("npm", ["run", "dev"], { cwd: BACKEND_DIR }));
}

if (isPythonBackend) {
  console.log("Starting FastAPI with uvicorn on port " + BACKEND_PORT + "...");
  process.exit(
    run("uvicorn", ["main:app", "--reload", "--port", BACKEND_PORT], { cwd: BACKEND_DIR }),
  );
}

console.error("Unknown backend. Cannot start the backend.");
process.exit(1);
