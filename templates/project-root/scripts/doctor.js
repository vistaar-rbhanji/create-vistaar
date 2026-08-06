import fs from "node:fs";
import path from "node:path";

import { BACKEND_DIR, FRONTEND_DIR } from "./lib/paths.js";
import { BACKEND_PORT, FRONTEND_URL, PROJECT_NAME, isNodeBackend, isPythonBackend } from "./lib/stack.js";

const checks = [];

function ok(label) {
  checks.push({ label, ok: true });
}

function warn(label, hint) {
  checks.push({ label, ok: false, hint });
}

console.log("");
console.log(PROJECT_NAME + " — Project Doctor");
console.log("");

const [nodeMajor] = process.versions.node.split(".").map(Number);
if (nodeMajor >= 18) {
  ok("Node version (" + process.version + ")");
} else {
  warn("Node version (" + process.version + ")", "Node 18+ is recommended.");
}

if (fs.existsSync(path.join(FRONTEND_DIR, "node_modules"))) {
  ok("Frontend dependencies installed");
} else {
  warn("Frontend dependencies installed", "Run: npm install --prefix frontend");
}

if (isNodeBackend) {
  if (fs.existsSync(path.join(BACKEND_DIR, "node_modules"))) {
    ok("Backend dependencies installed");
  } else {
    warn("Backend dependencies installed", "Run: npm install --prefix backend");
  }
}

if (isPythonBackend) {
  const hasVenv =
    fs.existsSync(path.join(BACKEND_DIR, ".venv")) || fs.existsSync(path.join(BACKEND_DIR, "venv"));
  if (hasVenv) {
    ok("Backend virtual environment found");
  } else {
    warn(
      "Backend virtual environment found",
      "Create one and run: pip install -r backend/requirements.txt",
    );
  }
}

const backendEnv = path.join(BACKEND_DIR, ".env");
const backendEnvExample = path.join(BACKEND_DIR, ".env.example");
if (fs.existsSync(backendEnv)) {
  ok("Backend .env file present");
} else if (fs.existsSync(backendEnvExample)) {
  warn("Backend .env file present", "Copy backend/.env.example to backend/.env");
} else {
  warn("Backend .env file present", "No .env or .env.example found in backend/");
}

async function checkBackend() {
  const url = "http://localhost:" + BACKEND_PORT + "/api/setup-status";

  if (typeof fetch !== "function") {
    warn("Backend reachable at " + url, "Upgrade to Node 18+ to enable this check.");
    return;
  }

  let status;

  try {
    const signal = typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(2000) : undefined;
    const response = await fetch(url, { signal });
    if (!response.ok) {
      warn("Backend reachable at " + url, "Received HTTP " + response.status);
      return;
    }
    status = await response.json();
    ok("Backend reachable at " + url);
  } catch {
    warn("Backend reachable at " + url, "Backend is not running. Start it with: npm run dev:backend");
    return;
  }

  if (!status.databaseRequired) {
    ok("Database: none selected, nothing to check");
  } else {
    if (status.databaseConnected) {
      ok("Database connected");
    } else {
      warn(
        "Database connected",
        "Check DATABASE_URL / MONGODB_URI in backend/.env and confirm the database is running.",
      );
    }
    if (status.migrationCompleted) {
      ok("Migrations complete");
    } else {
      warn("Migrations complete", "Run: npm run migrate");
    }
    if (status.seedCompleted) {
      ok("Seed data present");
    } else {
      warn("Seed data present", "Run: npm run seed");
    }
  }

  if (status.setupComplete) {
    ok("Setup complete");
  } else {
    warn("Setup complete", "Open " + FRONTEND_URL + " and follow the Setup Wizard.");
  }
}

await checkBackend();

console.log("");
for (const item of checks) {
  const icon = item.ok ? "✔" : "⚠";
  console.log(" " + icon + " " + item.label);
  if (!item.ok && item.hint) {
    console.log("     -> " + item.hint);
  }
}
console.log("");

const failed = checks.filter((item) => !item.ok).length;
if (failed === 0) {
  console.log("Everything looks good. Happy shipping!");
} else {
  console.log(failed + " item(s) need attention. See hints above.");
}
